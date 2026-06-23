import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass } = cc._decorator;

const TOTAL_STAGES = 8;
const STAGE_TITLE = ["第一关", "第二关", "第三关", "第四关", "第五关", "第六关", "第七关", "第八关"];
/** 提示面板文案（与 currentStage 0～7 对应）；可按关卡策划修改 */
const STAGE_TIPS_TEXTS: string[] = [
    "拖动滑条调整角度对准即可过关",
    "点击勾选正确的选项框。",
    "点选包含小狗的格子选好后点提交",
    "比萨斜塔是要斜一点的",
    "长按让猫往上爬，松手时猫停在终点高度附近过关。",
    "拖动右侧半张图，使小猪拼到正确位置后松手",
    "把五个动物分别拖到对应点即可过关。",
    "拖动滑条控制牙齿对准目标。",
];
const STAGE3_DOG_INDICES: number[] = [0, 1, 2, 5, 6];
const L7_ANIMALS = ["7_1", "7_2", "7_3", "7_4", "7_5"];
const L7_SNAP_PX = 10;

@ccclass
export default class wd_lv402 extends BaseGame {
    private levelRoot: cc.Node = null;
    private levelLabel: cc.Label = null;
    private currentStage = 0;
    private inputLocked = false;

    private headNode: cc.Node = null;
    private slider1: cc.Slider = null;
    private readonly stage1AngleMin = -90;
    private readonly stage1AngleMax = 90;
    private readonly stage1TargetAngle = 0;
    private readonly stage1AngleTolerance = 2.5;
    private stage1TouchActive = false;

    private towerNode: cc.Node = null;
    private slider4: cc.Slider = null;
    private readonly towerAngleMin = -35;
    private readonly towerAngleMax = 40;
    private readonly towerTargetAngle = 0;
    private readonly towerAngleTolerance = 2.5;
    private stage4TouchActive = false;

    private teethNode: cc.Node = null;
    private slider8: cc.Slider = null;
    private teethXMin = -137;
    private teethXMax = 0;
    private readonly teethTargetX = 57;
    private readonly teethXTolerance = 2;
    private stage8TouchActive = false;

    private pigRightNode: cc.Node = null;
    private readonly pigInitX = 180;
    private readonly pigDragXMin = -200;
    private readonly pigDragXMax = 200;
    private readonly pigTargetX = -180;
    private readonly pigPassXTolerance = 8;

    private catNode: cc.Node = null;
    private mpjNode: cc.Node = null;
    private catClimbActive = false;
    private catPassTargetY = 186;
    private readonly catClimbCeilingY = 300;
    private readonly catPassTargetYOverride: number | null = null;
    private catStartY = -327;
    private readonly catClimbSpeed = 380;
    private readonly catReachThreshold = 28;

    private stage3Selected: boolean[] = [];
    private l7Dragging: { node: cc.Node; startLocal: cc.Vec2 } = null;

    private canvasSliderReleaseBound = false;
    private canvasSliderNode: cc.Node = null;

    private tipsPanel: cc.Node = null;
    private tipsTskNode: cc.Node = null;
    private tipsLabel: cc.Label = null;
    private btnTipsNode: cc.Node = null;
    /** `btn_tips` 子节点「video」：显示时表示本小关首次看提示需激励视频 */
    private btnTipsVideoNode: cc.Node = null;
    private btnClosetipsNode: cc.Node = null;
    private readonly tipsTskTargetScale = 0.8;

    /** 小关通关时左右两侧龙骨特效（根节点下 lh_ske / lh_ske_1） */
    private lhSkeNode: cc.Node = null;
    private lhSke1Node: cc.Node = null;
    private readonly lhSkeAnimName = "Sprite";

    onLoad() {
        GameData.PauseGame = false;
        this.isGameOver = false;
        AudioManager.stopMusic();
        GameData.recordLevelEnter(GameData.curGameName || "wd_lv402");
        this.cacheNodes();
        this.setupTipsUi();
        this.resetAllStagesUi();
        this.goToStage(0);
        this.scheduleOnce(() => this.playLevelBgm(), 0.5);
    }

    protected onDestroy() {
        this.teardownStage1TouchPipeline();
        this.teardownStage4TouchPipeline();
        this.teardownStage8TouchPipeline();
        this.teardownCanvasSliderReleaseListener();
        this.stopCatClimb();
        super.onDestroy();
    }

    private cacheNodes() {
        const bg = this.node.getChildByName("bg");
        const title = bg && bg.getChildByName("title");
        const levelLabelNode = title && title.getChildByName("levelLabel");

        this.levelRoot = bg && bg.getChildByName("level");
        this.levelLabel = levelLabelNode && levelLabelNode.getComponent(cc.Label);

        this.cacheStage1Nodes();
        this.cacheStage4Nodes();
        this.cacheStage5Nodes();
        this.cacheStage6Nodes();
        this.cacheStage8Nodes();
        this.cacheTipsNodes();
        this.lhSkeNode = this.node.getChildByName("lh_ske");
        this.lhSke1Node = this.node.getChildByName("lh_ske_1");
    }

    private cacheTipsNodes() {
        this.tipsPanel = this.node.getChildByName("tipsPanel");
        if (!this.tipsPanel) return;
        this.tipsTskNode = this.tipsPanel.getChildByName("tsk");
        const tsk = this.tipsTskNode;
        if (tsk) {
            const tipLabelNode = tsk.getChildByName("tipsLabel");
            this.tipsLabel = tipLabelNode && tipLabelNode.getComponent(cc.Label);
            this.btnClosetipsNode = tsk.getChildByName("btn_closetips");
        }
        this.btnTipsNode = this.node.getChildByName("btn_tips");
        if (this.btnTipsNode) {
            this.btnTipsVideoNode = this.btnTipsNode.getChildByName("video");
        }
    }

    /** 初始化提示面板：默认关闭、关闭按钮事件 */
    private setupTipsUi() {
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }
        if (this.btnClosetipsNode) {
            this.btnClosetipsNode.targetOff(this);
            this.btnClosetipsNode.on(cc.Node.EventType.TOUCH_END, this.onBtnClosetips, this);
        }
    }

    /** 进入任意小关：需要激励视频才可看提示（显示角标） */
    private refreshTipsVideoForCurrentStage() {
        if (this.btnTipsVideoNode && this.btnTipsVideoNode.isValid) {
            this.btnTipsVideoNode.active = true;
        }
    }

    /** 本小关已通关（成功回调）：暂时隐藏激励视频角标，此时点提示不再走广告 */
    private hideTipsVideoAfterSubStagePass() {
        if (this.btnTipsVideoNode && this.btnTipsVideoNode.isValid) {
            this.btnTipsVideoNode.active = false;
        }
    }

    private onBtnTips() {
        const needVideo = this.btnTipsVideoNode && this.btnTipsVideoNode.active;
        const showPanel = () => {
            this.openTipsPanel();
        };
        if (!needVideo) {
            showPanel();
            return;
        }
        VideoManager.getInstance().showVideo(() => {
            if (this.btnTipsVideoNode && this.btnTipsVideoNode.isValid) {
                this.btnTipsVideoNode.active = false;
            }
            showPanel();
        });
    }

    private openTipsPanel() {
        if (!this.tipsPanel || !this.tipsTskNode) return;
        if (this.tipsLabel) {
            const t = STAGE_TIPS_TEXTS[this.currentStage];
            this.tipsLabel.string = t != null ? t : "";
        }
        const tsk = this.tipsTskNode;
        const tw = cc.Tween as any;
        if (tw && tw.stopAllByTarget) {
            tw.stopAllByTarget(tsk);
        }
        tsk.scale = 0.12;
        this.tipsPanel.active = true;
        cc.tween(tsk).to(0.22, { scale: this.tipsTskTargetScale }, cc.easeBackOut()).start();
    }

    private onBtnClosetips() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.closeTipsPanel();
    }

    private closeTipsPanel() {
        if (this.tipsPanel && this.tipsPanel.isValid) {
            this.tipsPanel.active = false;
        }
    }

    /** 每小关通关：左右龙骨各播一次默认动画，播完隐藏 */
    private playLhSkeStageClearVfx() {
        const run = (n: cc.Node) => {
            if (!n || !n.isValid) return;
            const arm = n.getComponent(dragonBones.ArmatureDisplay);
            if (!arm) return;
            n.active = true;
            arm.playAnimation(this.lhSkeAnimName, 1);
            this.addOneTimeListener(arm, () => {
                if (n && n.isValid) {
                    n.active = false;
                }
            });
        };
       
            run(this.lhSkeNode);
            run(this.lhSke1Node);
        
    }

    private cacheStage1Nodes() {
        const panel = this.getStagePanel(1);
        if (!panel) return;
        this.headNode = panel.getChildByName("xww2");
        const sliderNode = panel.getChildByName("New Slider");
        this.slider1 = sliderNode && sliderNode.getComponent(cc.Slider);
    }

    private cacheStage4Nodes() {
        const panel = this.getStagePanel(4);
        if (!panel) return;
        this.towerNode = panel.getChildByName("bsxt");
        const sliderNode = panel.getChildByName("New Slider");
        this.slider4 = sliderNode && sliderNode.getComponent(cc.Slider);
    }

    private cacheStage5Nodes() {
        const panel = this.getStagePanel(5);
        if (!panel) return;
        this.mpjNode = panel.getChildByName("mpj");
        this.catNode = panel.getChildByName("mm");

        const finalPoint = panel.getChildByName("final_point");
        if (finalPoint) {
            this.catPassTargetY = finalPoint.y;
        }
        if (this.catPassTargetYOverride !== null) {
            this.catPassTargetY = this.catPassTargetYOverride;
        }
        if (this.catNode) {
            this.catStartY = this.catNode.y;
        }
    }

    private cacheStage6Nodes() {
        const panel = this.getStagePanel(6);
        if (!panel) return;
        const zz = panel.getChildByName("zz");
        this.pigRightNode = zz && zz.getChildByName("tt");
    }

    private cacheStage8Nodes() {
        const panel = this.getStagePanel(8);
        if (!panel) return;
        this.teethNode = panel.getChildByName("yc");
        const sliderNode = panel.getChildByName("New Slider");
        this.slider8 = sliderNode && sliderNode.getComponent(cc.Slider);
        if (this.teethNode) {
            this.teethXMin = this.teethNode.x;
            this.teethXMax = 0;
        }
    }

    private getStagePanel(stageNumber: number): cc.Node {
        return this.levelRoot && this.levelRoot.getChildByName(String(stageNumber));
    }

    private isStageActive(stageIndex: number): boolean {
        return this.currentStage === stageIndex && !this.inputLocked;
    }

    private resetAllStagesUi() {
        if (!this.levelRoot) return;
        for (let i = 1; i <= TOTAL_STAGES; i++) {
            const panel = this.getStagePanel(i);
            if (panel) {
                panel.active = false;
            }
        }
    }

    private goToStage(index: number) {
        this.resetStageRuntimeState(index);
        this.currentStage = index;
        this.inputLocked = false;

        if (!this.levelRoot) return;

        for (let i = 0; i < TOTAL_STAGES; i++) {
            const panel = this.getStagePanel(i + 1);
            if (panel) {
                panel.active = i === index;
            }
        }

        if (this.levelLabel) {
            this.levelLabel.string = STAGE_TITLE[index] || "";
        }

        this.setupStageEntry(index);
        this.refreshTipsVideoForCurrentStage();
    }

    private resetStageRuntimeState(nextStageIndex: number) {
        if (nextStageIndex !== 0) {
            this.stage1TouchActive = false;
        }
        if (nextStageIndex !== 3) {
            this.stage4TouchActive = false;
        }
        if (nextStageIndex !== 4) {
            this.stopCatClimb();
        }
        if (nextStageIndex !== 7) {
            this.stage8TouchActive = false;
        }
    }

    private setupStageEntry(index: number) {
        switch (index) {
            case 0:
                this.setupStage1();
                break;
            case 1:
                this.setupStage2();
                break;
            case 2:
                this.setupStage3();
                break;
            case 3:
                this.setupStage4();
                break;
            case 4:
                this.setupStage5();
                break;
            case 5:
                this.setupStage6();
                break;
            case 6:
                this.setupStage7();
                break;
            case 7:
                this.setupStage8();
                break;
            default:
                break;
        }
    }

    private advanceOrWin() {
        if (this.inputLocked) return;

        this.inputLocked = true;
        this.hideTipsVideoAfterSubStagePass();
        let progressed = false;

        const doProgress = () => {
            if (progressed) return;
            progressed = true;

            if (this.currentStage >= TOTAL_STAGES - 1) {
                this.scheduleOnce(() => this.finishGameWin(), 0.15);
                return;
            }

            this.scheduleOnce(() => {
                this.goToStage(this.currentStage + 1);
            }, 0.2);
        };

        const playTransition = () => {
            this.scheduleOnce(doProgress, 0.5);
        };

        /** 礼花与 smalllevel 均延迟 0.5s 再播 */
        this.scheduleOnce(() => {
            this.playLhSkeStageClearVfx();
            if (!GameData.effectSwitch) {
                playTransition();
                return;
            }
            let soundEnded = false;
            AudioManager.playEffect("smalllevel", false, () => {
                soundEnded = true;
                playTransition();
            });
            this.scheduleOnce(() => {
                if (!soundEnded) {
                    playTransition();
                }
            }, 15);
        }, 0.5);
    }

    private bindTouchStartRecursive(node: cc.Node, handler: Function) {
        node.on(cc.Node.EventType.TOUCH_START, handler, this);
        for (let i = 0; i < node.children.length; i++) {
            this.bindTouchStartRecursive(node.children[i], handler);
        }
    }

    private unbindTouchStartRecursive(node: cc.Node, handler: Function) {
        node.off(cc.Node.EventType.TOUCH_START, handler, this);
        for (let i = 0; i < node.children.length; i++) {
            this.unbindTouchStartRecursive(node.children[i], handler);
        }
    }

    private setupSlider(slider: cc.Slider, slideHandler: Function, touchStartHandler: Function) {
        if (!slider) return;
        slider.progress = 0;
        slider.node.off("slide");
        slider.node.on("slide", slideHandler, this);
        this.bindTouchStartRecursive(slider.node, touchStartHandler);
        this.ensureCanvasSliderReleaseListener();
    }

    private teardownSlider(slider: cc.Slider, touchStartHandler: Function) {
        if (!slider || !slider.node || !slider.node.isValid) return;
        this.unbindTouchStartRecursive(slider.node, touchStartHandler);
    }

    private ensureCanvasSliderReleaseListener() {
        if (this.canvasSliderReleaseBound) return;
        const canvas = cc.find("Canvas");
        if (!canvas) return;

        this.canvasSliderNode = canvas;
        this.canvasSliderReleaseBound = true;
        canvas.on(cc.Node.EventType.TOUCH_END, this.onCanvasSliderTouchEnd, this);
        canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onCanvasSliderTouchEnd, this);
    }

    private teardownCanvasSliderReleaseListener() {
        if (this.canvasSliderNode && this.canvasSliderNode.isValid && this.canvasSliderReleaseBound) {
            this.canvasSliderNode.off(cc.Node.EventType.TOUCH_END, this.onCanvasSliderTouchEnd, this);
            this.canvasSliderNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onCanvasSliderTouchEnd, this);
        }
        this.canvasSliderReleaseBound = false;
        this.canvasSliderNode = null;
    }

    private onCanvasSliderTouchEnd() {
        if (this.inputLocked) return;

        if (this.currentStage === 0 && this.stage1TouchActive) {
            this.stage1TouchActive = false;
            this.tryStage1PassAfterRelease();
            return;
        }

        if (this.currentStage === 3 && this.stage4TouchActive) {
            this.stage4TouchActive = false;
            this.tryStage4PassAfterRelease();
            return;
        }

        if (this.currentStage === 7 && this.stage8TouchActive) {
            this.stage8TouchActive = false;
            this.tryStage8PassAfterRelease();
            return;
        }

        if (this.currentStage === 4 && this.catClimbActive) {
            this.onCatClimbRelease();
        }
    }

    private setupStage1() {
        this.teardownStage1TouchPipeline();
        if (this.headNode) {
            this.headNode.angle = this.stage1AngleMin;
        }
        this.setupSlider(this.slider1, this.onSlideStage1, this.onStage1SliderTouchBegan);
        this.syncStage1AngleFromSlider();
    }

    private onStage1SliderTouchBegan() {
        if (!this.isStageActive(0)) return;
        this.stage1TouchActive = true;
    }

    private onSlideStage1() {
        if (!this.isStageActive(0) || !this.slider1 || !this.headNode) return;
        this.stage1TouchActive = true;
        this.syncStage1AngleFromSlider();
    }

    private syncStage1AngleFromSlider() {
        if (!this.isStageActive(0) || !this.slider1 || !this.headNode) return;
        const progress = this.slider1.progress;
        this.headNode.angle = this.stage1AngleMin + (this.stage1AngleMax - this.stage1AngleMin) * progress;
    }

    private tryStage1PassAfterRelease() {
        if (!this.headNode || this.inputLocked) return;
        if (Math.abs(this.headNode.angle - this.stage1TargetAngle) < this.stage1AngleTolerance) {
            this.advanceOrWin();
        }
    }

    private teardownStage1TouchPipeline() {
        this.teardownSlider(this.slider1, this.onStage1SliderTouchBegan);
        this.stage1TouchActive = false;
    }

    private setupStage2() {
        const panel = this.getStagePanel(2);
        if (!panel) return;

        const k2 = panel.getChildByName("k2");
        const g = k2 && k2.getChildByName("g");
        if (g) {
            g.active = false;
        }
        if (!k2) return;

        k2.off(cc.Node.EventType.TOUCH_END);
        k2.on(cc.Node.EventType.TOUCH_END, this.onStage2TouchEnd, this);
    }

    private onStage2TouchEnd() {
        if (!this.isStageActive(1)) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        const panel = this.getStagePanel(2);
        const k2 = panel && panel.getChildByName("k2");
        const g = k2 && k2.getChildByName("g");
        if (g) {
            g.active = true;
        }
        this.advanceOrWin();
    }

    private setupStage3() {
        const panel = this.getStagePanel(3);
        if (!panel) return;

        this.stage3Selected = new Array(9).fill(false);

        for (let i = 0; i < 9; i++) {
            this.bindStage3Cell(panel, i);
        }

        const submitButton = panel.getChildByName("btn_tj");
        if (!submitButton) return;
        submitButton.targetOff(this);
        submitButton.on(cc.Node.EventType.TOUCH_END, this.onStage3Submit, this);
    }

    private bindStage3Cell(panel: cc.Node, index: number) {
        const cell = panel.getChildByName("dw" + (index + 1));
        if (!cell) return;

        const checkNode = cell.getChildByName("g2");
        if (checkNode) {
            checkNode.active = false;
        }

        cell.targetOff(this);
        cell.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.isStageActive(2)) return;
            AudioManager.playEffect(AudioManager.common.BUTTON);
            this.stage3Selected[index] = !this.stage3Selected[index];
            if (checkNode) {
                checkNode.active = this.stage3Selected[index];
            }
        }, this);
    }

    private onStage3Submit() {
        if (!this.isStageActive(2)) return;

        AudioManager.playEffect(AudioManager.common.BUTTON);
        const picked = this.collectStage3Selection();
        if (this.sameNumberSet(picked, STAGE3_DOG_INDICES)) {
            this.advanceOrWin();
            return;
        }

        AudioManager.playEffect("com_cuo");
        this.resetStage3Selection();
    }

    private collectStage3Selection(): number[] {
        const picked: number[] = [];
        for (let i = 0; i < this.stage3Selected.length; i++) {
            if (this.stage3Selected[i]) {
                picked.push(i);
            }
        }
        return picked;
    }

    private resetStage3Selection() {
        const panel = this.getStagePanel(3);
        if (!panel) return;

        this.stage3Selected = new Array(9).fill(false);
        for (let i = 0; i < 9; i++) {
            const cell = panel.getChildByName("dw" + (i + 1));
            const checkNode = cell && cell.getChildByName("g2");
            if (checkNode) {
                checkNode.active = false;
            }
        }
    }

    private sameNumberSet(a: number[], b: number[]): boolean {
        if (a.length !== b.length) return false;
        const sa = [...a].sort((x, y) => x - y);
        const sb = [...b].sort((x, y) => x - y);
        return sa.every((value, index) => value === sb[index]);
    }

    private setupStage4() {
        this.teardownStage4TouchPipeline();
        if (this.towerNode) {
            this.towerNode.angle = this.towerAngleMin;
        }
        this.setupSlider(this.slider4, this.onSlideStage4, this.onStage4SliderTouchBegan);
        this.syncStage4AngleFromSlider();
    }

    private onStage4SliderTouchBegan() {
        if (!this.isStageActive(3)) return;
        this.stage4TouchActive = true;
    }

    private onSlideStage4() {
        if (!this.isStageActive(3) || !this.slider4 || !this.towerNode) return;
        this.stage4TouchActive = true;
        this.syncStage4AngleFromSlider();
    }

    private syncStage4AngleFromSlider() {
        if (!this.isStageActive(3) || !this.slider4 || !this.towerNode) return;
        const progress = this.slider4.progress;
        this.towerNode.angle = this.towerAngleMin + (this.towerAngleMax - this.towerAngleMin) * progress;
    }

    private tryStage4PassAfterRelease() {
        if (!this.towerNode || this.currentStage !== 3 || this.inputLocked) return;
        if (Math.abs(this.towerNode.angle - this.towerTargetAngle) < this.towerAngleTolerance) {
            this.advanceOrWin();
        }
    }

    private teardownStage4TouchPipeline() {
        this.teardownSlider(this.slider4, this.onStage4SliderTouchBegan);
        this.stage4TouchActive = false;
    }

    private setupStage5() {
        this.stopCatClimb();
        if (this.catNode) {
            this.catNode.y = this.catStartY;
        }

        const panel = this.getStagePanel(5);
        const mpj = this.mpjNode || (panel && panel.getChildByName("mpj"));
        if (!mpj || !this.catNode) return;

        this.ensureCanvasSliderReleaseListener();
        mpj.targetOff(this);
        mpj.on(cc.Node.EventType.TOUCH_START, this.onMpjTouchStart, this);
        mpj.on(cc.Node.EventType.TOUCH_END, this.onCatClimbRelease, this);
        mpj.on(cc.Node.EventType.TOUCH_CANCEL, this.onCatClimbRelease, this);
    }

    private onMpjTouchStart() {
        if (!this.isStageActive(4)) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.catClimbActive = true;
        this.unschedule(this.catClimbStep);
        this.schedule(this.catClimbStep, 0);
    }

    private catClimbStep = (dt: number) => {
        if (!this.isStageActive(4) || !this.catClimbActive || !this.catNode) return;
        this.catNode.y = Math.min(this.catNode.y + this.catClimbSpeed * dt, this.catClimbCeilingY);
    };

    private onCatClimbRelease() {
        if (this.currentStage !== 4 || this.inputLocked || !this.catClimbActive) return;

        this.catClimbActive = false;
        this.unschedule(this.catClimbStep);

        if (!this.catNode) return;
        if (Math.abs(this.catNode.y - this.catPassTargetY) <= this.catReachThreshold) {
            this.advanceOrWin();
            return;
        }

        const tweenApi = cc.Tween as any;
        if (tweenApi && tweenApi.stopAllByTarget) {
            tweenApi.stopAllByTarget(this.catNode);
        }
        cc.tween(this.catNode).to(0.38, { y: this.catStartY }).start();
    }

    private stopCatClimb() {
        this.catClimbActive = false;
        this.unschedule(this.catClimbStep);
    }

    private setupStage6() {
        const panel = this.getStagePanel(6);
        const tt = this.pigRightNode;
        if (!panel || !tt) return;

        tt.x = this.pigInitX;

        let dragging = false;
        let lastX = 0;

        tt.off(cc.Node.EventType.TOUCH_START);
        tt.off(cc.Node.EventType.TOUCH_MOVE);
        tt.off(cc.Node.EventType.TOUCH_END);
        tt.off(cc.Node.EventType.TOUCH_CANCEL);

        tt.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            if (!this.isStageActive(5)) return;
            AudioManager.playEffect(AudioManager.common.BUTTON);
            dragging = true;
            lastX = event.getLocation().x;
        });

        tt.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (!dragging || !this.isStageActive(5)) return;
            const currentX = event.getLocation().x;
            const deltaX = currentX - lastX;
            lastX = currentX;
            tt.x = cc.misc.clampf(tt.x + deltaX, this.pigDragXMin, this.pigDragXMax);
        });

        const endDrag = () => {
            dragging = false;
            if (!this.isStageActive(5)) return;
            if (Math.abs(tt.x - this.pigTargetX) < this.pigPassXTolerance) {
                this.advanceOrWin();
            } else {
                AudioManager.playEffect("com_cuo");
            }
        };

        tt.on(cc.Node.EventType.TOUCH_END, endDrag);
        tt.on(cc.Node.EventType.TOUCH_CANCEL, endDrag);
    }

    private setupStage7() {
        const panel = this.getStagePanel(7);
        if (!panel) return;

        const filled = [false, false, false, false, false];
        for (let i = 0; i < L7_ANIMALS.length; i++) {
            this.bindStage7Animal(panel, i, filled);
        }
    }

    private bindStage7Animal(panel: cc.Node, index: number, filled: boolean[]) {
        const name = L7_ANIMALS[index];
        const animalNode = panel.getChildByName(name);
        const pointNode = panel.getChildByName(name + "_point");
        if (!animalNode) return;

        animalNode.off(cc.Node.EventType.TOUCH_START);
        animalNode.off(cc.Node.EventType.TOUCH_MOVE);
        animalNode.off(cc.Node.EventType.TOUCH_END);
        animalNode.off(cc.Node.EventType.TOUCH_CANCEL);

        animalNode.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.isStageActive(6) || filled[index]) return;
            AudioManager.playEffect(AudioManager.common.BUTTON);
            this.l7Dragging = {
                node: animalNode,
                startLocal: cc.v2(animalNode.x, animalNode.y),
            };
        });

        animalNode.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (!this.l7Dragging || this.l7Dragging.node !== animalNode || !this.isStageActive(6) || filled[index]) return;
            const delta = event.getDelta();
            animalNode.x += delta.x;
            animalNode.y += delta.y;
        });

        const endDrag = () => {
            if (!this.l7Dragging || this.l7Dragging.node !== animalNode || !this.isStageActive(6) || filled[index]) return;

            const dragState = this.l7Dragging;
            this.l7Dragging = null;

            if (!pointNode || !pointNode.isValid) {
                animalNode.setPosition(dragState.startLocal);
                return;
            }

            const dx = animalNode.x - pointNode.x;
            const dy = animalNode.y - pointNode.y;
            if (dx * dx + dy * dy <= L7_SNAP_PX * L7_SNAP_PX) {
                animalNode.setPosition(pointNode.x, pointNode.y);
                filled[index] = true;
                animalNode.off(cc.Node.EventType.TOUCH_START);
                animalNode.off(cc.Node.EventType.TOUCH_MOVE);
                animalNode.off(cc.Node.EventType.TOUCH_END);
                animalNode.off(cc.Node.EventType.TOUCH_CANCEL);
            } else {
                animalNode.setPosition(dragState.startLocal);
                AudioManager.playEffect("com_cuo");
            }

            if (filled.every((value) => value)) {
                this.advanceOrWin();
            }
        };

        animalNode.on(cc.Node.EventType.TOUCH_END, endDrag);
        animalNode.on(cc.Node.EventType.TOUCH_CANCEL, endDrag);
    }

    private setupStage8() {
        this.teardownStage8TouchPipeline();
        if (this.teethNode) {
            this.teethNode.x = this.teethXMin;
        }
        this.setupSlider(this.slider8, this.onSlideStage8, this.onStage8SliderTouchBegan);
        this.syncStage8TeethFromSlider();
    }

    private onStage8SliderTouchBegan() {
        if (!this.isStageActive(7)) return;
        this.stage8TouchActive = true;
    }

    private onSlideStage8() {
        if (!this.isStageActive(7) || !this.slider8 || !this.teethNode) return;
        this.stage8TouchActive = true;
        this.syncStage8TeethFromSlider();
    }

    private syncStage8TeethFromSlider() {
        if (!this.isStageActive(7) || !this.slider8 || !this.teethNode) return;
        const progress = this.slider8.progress;
        const span = this.teethXMax - this.teethXMin;
        this.teethNode.x = this.teethXMin + span * 2 * progress;
    }

    private tryStage8PassAfterRelease() {
        if (!this.teethNode || this.currentStage !== 7 || this.inputLocked) return;
        if (Math.abs(this.teethNode.x - this.teethTargetX) < this.teethXTolerance) {
            this.advanceOrWin();
        }
    }

    private teardownStage8TouchPipeline() {
        this.teardownSlider(this.slider8, this.onStage8SliderTouchBegan);
        this.stage8TouchActive = false;
    }

    private playLevelBgm() {
        AudioManager.playMusic("bgmlv402", true);
    }

    private stopLevelBgm() {
        AudioManager.stopMusic();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.inputLocked) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                this.onBtnTips();
                break;
            case "btn_closetips":
                this.onBtnClosetips();
                break;
        }
    }

    fanhui() {
        this.stopLevelBgm();
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            if (err || !UI) {
                cc.error("[wd_lv402] 加载大厅预制件失败", err?.message);
                return;
            }
            const UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        });
    }

    fanhuibtn() {
        if (GameData.PauseGame || this.inputLocked) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    openpausePanel() {
        this.stopLevelBgm();
        super.openpausePanel();
    }

    public resumeGamePublic() {
        GameData.PauseGame = false;
        this.playLevelBgm();
    }

    private finishGameWin() {
        this.stopLevelBgm();
        GameData.PauseGame = true;
        this.node.cleanup();
        this.endwin("prefabs/hz/endwin_hz");
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
    }

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.stopLevelBgm();
            this.isGameOver = true;
        }, 2);
    }

    restart() {
        this.stopLevelBgm();
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            if (!name) {
                cc.error("[wd_lv402] restart 加载 prefab 失败");
                return;
            }
            const UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }
}
