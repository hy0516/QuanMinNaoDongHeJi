import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

type PickSide = "left" | "right";

interface IStageChoiceCfg {
    stage: number;
    resultSlot: string;
    correctIndex: number;
    wrongIndex: number;
    /** 阶段 1–3：选对/错临时 biaoqing，下一阶段前复位 0 */
    tempExprOnPick: boolean;
}

@ccclass
export default class tlgc_lv451 extends BaseGame {
    private static readonly BGM_KEY = "bgmlv451";
    private static readonly BGM_STAGE2_KEY = "bgmlv451_1";
    private static readonly QP_NO_AUDIO_SEC = 3;

    /** 与 audio_lv451 文件名一致（无扩展名） */
    private static readonly SFX = {
        CHOOSE_CORRECT: "选择正确",
        CHOOSE_WRONG: "选择错误",
        CHANGE_OUTFIT: "切换装扮",
        JIAO_OPEN: "（焦焦）马上就要跟我的蕉哥约会了我该穿什么呢",
        CAOMEI_HELP: "（草莓妹）焦焦别怕我来帮你选",
        CAOMEI_PICK: "（草莓妹）选左还是选右呢",
        JIAO_PICK_LEFT: "（焦焦）我选左",
        JIAO_PICK_RIGHT: "（焦焦）我选右",
        JIESHU_SORRY: "（焦哥）焦焦不要离开我我知道错了",
        JIAO_WIN_LINE: "（焦焦）臭渣男赶紧离本女王远点",
        JIAO_LOST_LINE: "（焦焦）蕉哥她到底是谁为什么要背叛我",
        JIESHU_LOST_LINE: "（蕉哥）哼快走吧瞧瞧你这副样子根本配不上我",
    };
    private static readonly SWIPE_UP_PX = 50;
    private static readonly STAGE_END_WAIT = 2;
    private static readonly HEI_FADE_IN = 0.8;
    private static readonly HEI_HOLD = 1;
    private static readonly HEI_FADE_OUT = 1;
    private static readonly EXPR_RESET_DELAY = 0.8;
    /** 上划垃圾桶后：单根香蕉飞出时长 */
    private static readonly BANANA_FLY_TIME = 0.55;

    private static readonly STAGE_CFG: IStageChoiceCfg[] = [
        { stage: 1, resultSlot: "yifu", correctIndex: 1, wrongIndex: 0, tempExprOnPick: true },
        { stage: 2, resultSlot: "kuzi", correctIndex: 1, wrongIndex: 0, tempExprOnPick: true },
        { stage: 3, resultSlot: "jiao", correctIndex: 1, wrongIndex: 2, tempExprOnPick: true },
        { stage: 4, resultSlot: "biaoqing", correctIndex: 2, wrongIndex: 1, tempExprOnPick: false },
    ];

    canjiaohu = false;

    @property(cc.Node)
    stage1: cc.Node = null;

    @property(cc.Node)
    stage2: cc.Node = null;

    @property(cc.Node)
    hei: cc.Node = null;

    @property(cc.Node)
    caomeinvNode: cc.Node = null;

    @property(cc.Node)
    jiaojiaonvNode: cc.Node = null;

    @property(cc.Node)
    jiaojiaonvWin: cc.Node = null;

    @property(cc.Node)
    ljt: cc.Node = null;

    @property(cc.Node)
    item5True: cc.Node = null;

    @property(cc.Node)
    btnZuo: cc.Node = null;

    @property(cc.Node)
    btnYou: cc.Node = null;

    @property(cc.Node)
    yanNode: cc.Node = null;

    @property(cc.Node)
    tipsNode: cc.Node = null;

    private handL: cc.Node = null;
    private handR: cc.Node = null;
    private caomeinvArm: dragonBones.ArmatureDisplay = null;
    private jiaojiaonvArm: dragonBones.ArmatureDisplay = null;
    private yanArm: dragonBones.ArmatureDisplay = null;
    private yanRestPos: cc.Vec3 = null;
    private yanPlaying = false;

    private winRoot: cc.Node = null;
    private lostRoot: cc.Node = null;

    private choiceBusy = false;
    private currentStage = 0;
    private anyWrong = false;
    private stage4Wrong = false;
    private stage5Win = false;
    private stage1Finished = false;

    private ljtSwipeAccum = 0;
    private ljtSwipeReady = false;
    private item5DragOrigin: cc.Vec3 = null;
    private item5Dragging = false;
    /** 5_true 预制落点（地上可拖拽位置） */
    private item5LandPos: cc.Vec3 = null;
    /** btn_zuo / btn_you 初始缩放，停止呼吸时还原 */
    private choiceBtnBaseScale: { zx: number; zy: number; yx: number; yy: number } | null = null;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        GameData.recordLevelEnter(GameData.curGameName || "tlgc_lv451");
        this.isGameOver = false;

        this.resolveNodes();
        this.initSceneState();
        this.bindChoiceButtons();
        this.bindClosetipsButton();
        this.bindLjtTouch();
        this.bindItem5TrueTouch();

        this.scheduleOnce(() => this.playLevelBgm(), 0.5);
        this.startIntro();
    }

    onDestroy() {
        this.stopChoiceBtnBreath();
        if (this.item5True && this.item5True.isValid) {
            cc.Tween.stopAllByTarget(this.item5True);
        }
        this.unbindChoiceButtons();
        this.unbindClosetipsButton();
        this.unbindLjtTouch();
        this.unbindItem5TrueTouch();
        this.unscheduleAllCallbacks();
        this.stopLevelBgm();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
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
            case "btn_zuo":
            case "btn_you":
                if (!this.canjiaohu || this.choiceBusy || this.stage1Finished) return;
                this.onPickSide(even.currentTarget.name === "btn_zuo" ? "left" : "right");
                break;
        }
    }

    private onBtnTips() {
        if (this.isGameOver) return;
        VideoManager.getInstance().showVideo(
            () => {
                if (!this.node || !this.node.isValid || this.isGameOver) return;
                this.openTipsNode();
            },
            () => {
                cc.log("[tlgc_lv451] 提示视频未完成");
            }
        );
    }

    private openTipsNode() {
        if (!this.tipsNode) {
            this.tipsNode = this.node.getChildByName("tipsNode");
        }
        if (this.tipsNode) this.tipsNode.active = true;
    }

    private onBtnClosetips() {
        this.closeTipsNode();
    }

    private closeTipsNode() {
        if (!this.tipsNode) {
            this.tipsNode = this.node.getChildByName("tipsNode");
        }
        if (this.tipsNode) this.tipsNode.active = false;
    }

    onwin() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.stopLevelBgm();
        GameData.PauseGame = true;
        this.node.cleanup();
        this.endwin("prefabs/zc/zc_winend");
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
    }

    onlost() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.stopLevelBgm();
            this.endlost("prefabs/zc/zc_lostend");
            if (!(GameData as any).isNew) {
                this.node.destroy();
            }
        }, 1);
    }

    restart() {
        this.stopLevelBgm();
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            if (!name) {
                cc.error("[tlgc_lv451] restart 加载 prefab 失败");
                return;
            }
            const UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }

    fanhui() {
        this.stopLevelBgm();
        super.fanhui();
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        // AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    openpausePanel() {
        this.stopLevelBgm();
        super.openpausePanel();
    }

    public resumeGamePublic() {
        GameData.PauseGame = false;
        this.playLevelBgm();
    }

    // —— 节点 ——

    private resolveNodes() {
        if (!this.stage1) this.stage1 = this.node.getChildByName("stage1");
        if (!this.stage2) this.stage2 = this.node.getChildByName("stage2");
        if (!this.hei) this.hei = this.node.getChildByName("hei");

        if (this.stage1) {
            if (!this.caomeinvNode) this.caomeinvNode = this.stage1.getChildByName("caomeinv_ske");
            if (!this.jiaojiaonvNode) this.jiaojiaonvNode = this.stage1.getChildByName("jiaojiaonv_ske");
            if (!this.jiaojiaonvWin) this.jiaojiaonvWin = this.stage1.getChildByName("jiaojiaonv_win");
            if (!this.ljt) this.ljt = this.stage1.getChildByName("ljt");
            if (!this.item5True) this.item5True = this.stage1.getChildByName("5_true");
            if (!this.btnZuo) this.btnZuo = this.stage1.getChildByName("btn_zuo");
            if (!this.btnYou) this.btnYou = this.stage1.getChildByName("btn_you");
            if (!this.yanNode) this.yanNode = this.stage1.getChildByName("yan_ske");
        }

        if (this.yanNode) {
            this.yanArm = this.yanNode.getComponent(dragonBones.ArmatureDisplay);
        }

        if (this.caomeinvNode) {
            this.caomeinvArm = this.caomeinvNode.getComponent(dragonBones.ArmatureDisplay);
            this.handL = this.findDeep(this.caomeinvNode, "ATTACHED_NODE:zuoshou");
            this.handR = this.findDeep(this.caomeinvNode, "ATTACHED_NODE:youshou");
        }
        if (this.jiaojiaonvNode) {
            this.jiaojiaonvArm = this.jiaojiaonvNode.getComponent(dragonBones.ArmatureDisplay);
        }

        if (this.stage2) {
            this.winRoot = this.stage2.getChildByName("win");
            this.lostRoot = this.stage2.getChildByName("lost");
        }
    }

    private initSceneState() {
        if (this.stage2) this.stage2.active = false;
        if (this.hei) {
            this.hei.active = false;
            this.hei.opacity = 0;
        }
        if (this.jiaojiaonvWin) this.jiaojiaonvWin.active = false;
        if (this.item5True) {
            this.item5True.active = false;
            this.item5LandPos = this.item5True.position.clone();
        }
        this.applyInitialJiaoSlot();
        if (this.yanNode) {
            this.yanRestPos = this.yanNode.position.clone();
            this.yanNode.active = false;
        }
        this.setChoiceButtonsVisible(false);
        this.hideAllHandProps();
        this.resetQpOpacity(this.caomeinvNode);
        this.resetQpOpacity(this.jiaojiaonvNode);
        if (this.winRoot) this.winRoot.active = false;
        if (this.lostRoot) this.lostRoot.active = false;
        if (!this.tipsNode) this.tipsNode = this.node.getChildByName("tipsNode");
        if (this.tipsNode) this.tipsNode.active = false;
    }

    private findDeep(root: cc.Node, name: string): cc.Node {
        if (!root) return null;
        if (root.name === name) return root;
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findDeep(root.children[i], name);
            if (found) return found;
        }
        return null;
    }

    /** 换装改插槽时：yan_ske 到原点播一次 yan，结束后隐藏并回到原位 */
    private playYanEffectOnce() {
        if (!this.yanNode || !this.yanArm || this.yanPlaying) return;

        this.yanPlaying = true;
        if (this.yanRestPos) {
            this.yanNode.setPosition(0, 0, 0);
        }
        this.yanNode.active = true;
        this.playSfx(tlgc_lv451.SFX.CHANGE_OUTFIT);
        this.yanArm.playAnimation("yan", 1);
        this.addOneTimeListener(this.yanArm, () => {
            this.yanPlaying = false;
            if (!this.yanNode || !this.yanNode.isValid) return;
            this.yanNode.active = false;
            if (this.yanRestPos) {
                this.yanNode.setPosition(this.yanRestPos);
            }
        });
    }

    private applyInitialJiaoSlot() {
        const apply = () => {
            if (!this.jiaojiaonvArm || !this.jiaojiaonvArm.armature()) return;
            this.changeSKSlotIndex(this.jiaojiaonvArm, "jiao", 0);
        };
        apply();
        this.scheduleOnce(apply, 0);
    }

    private resetQpOpacity(skeRoot: cc.Node) {
        if (!skeRoot) return;
        const qp = skeRoot.getChildByName("qp");
        if (qp) qp.opacity = 0;
    }

    private hideAllHandProps() {
        for (const hand of [this.handL, this.handR]) {
            if (!hand) continue;
            for (let i = 0; i < hand.childrenCount; i++) {
                hand.children[i].active = false;
            }
        }
    }

    private showStageHandProps(stage: number) {
        this.hideAllHandProps();
        for (const hand of [this.handL, this.handR]) {
            if (!hand) continue;
            for (let i = 0; i < hand.childrenCount; i++) {
                const ch = hand.children[i];
                if (ch.name === `${stage}_true` || ch.name === `${stage}_false`) {
                    ch.active = true;
                }
            }
        }
    }

    // —— 对话 ——

    private startIntro() {
        this.canjiaohu = false;
        this.showQp(
            this.jiaojiaonvNode,
            "马上就要跟我的蕉哥约会了！我该穿什么呢？",
            tlgc_lv451.SFX.JIAO_OPEN,
            () => {
                this.showQp(
                    this.caomeinvNode,
                    "焦焦别怕，我来帮你选！",
                    tlgc_lv451.SFX.CAOMEI_HELP,
                    () => {
                        this.beginChoiceStage(1);
                    }
                );
            }
        );
    }

    private showQp(qpRoot: cc.Node, text: string, audioKey: string, done?: () => void) {
        if (!qpRoot) {
            done && done();
            return;
        }
        this.canjiaohu = false;
        const qp = qpRoot.getChildByName("qp");
        if (!qp) {
            done && done();
            return;
        }
        const labNode = qp.getChildByName("qplab");
        const lab = labNode ? labNode.getComponent(cc.Label) : null;
        if (lab) lab.string = text;

        cc.Tween.stopAllByTarget(qp);
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                const clip = audioKey ? AudioManager.get(audioKey) : null;
                if (clip) {
                    AudioManager.playEffect(audioKey, false, () => {
                        this.hideQp(qpRoot, done);
                    });
                } else {
                    this.scheduleOnce(() => this.hideQp(qpRoot, done), tlgc_lv451.QP_NO_AUDIO_SEC);
                }
            })
            .start();
    }

    private hideQp(qpRoot: cc.Node, done?: () => void) {
        const qp = qpRoot ? qpRoot.getChildByName("qp") : null;
        if (!qp) {
            done && done();
            return;
        }
        cc.Tween.stopAllByTarget(qp);
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                done && done();
            })
            .start();
    }

    // —— 阶段 1–5 选装 ——

    private beginChoiceStage(stage: number) {
        if (this.stage1Finished) return;
        this.currentStage = stage;
        this.choiceBusy = false;
        this.setChoiceButtonsVisible(false);
        this.ljtSwipeAccum = 0;
        this.ljtSwipeReady = false;

        this.showStageHandProps(stage);

        if (stage === 5) {
            this.beginStage5();
            return;
        }

        this.showQp(this.caomeinvNode, "选左还是选右？", tlgc_lv451.SFX.CAOMEI_PICK, () => {
            this.canjiaohu = true;
            this.setChoiceButtonsVisible(true);
        });
    }

    private beginStage5() {
        const allCorrect = !this.anyWrong;
        this.showQp(this.caomeinvNode, "选左还是选右？", tlgc_lv451.SFX.CAOMEI_PICK, () => {
            this.canjiaohu = true;
            this.setChoiceButtonsVisible(true);
            // 前四关全对：左右仍为误导项，正确操作上划 ljt 拖 5_true
            if (allCorrect) {
                this.ljtSwipeReady = true;
            }
        });
    }

    private setChoiceButtonsVisible(visible: boolean) {
        if (visible) {
            if (this.btnZuo) this.btnZuo.active = true;
            if (this.btnYou) this.btnYou.active = true;
            this.startChoiceBtnBreath();
        } else {
            this.stopChoiceBtnBreath();
            if (this.btnZuo) this.btnZuo.active = false;
            if (this.btnYou) this.btnYou.active = false;
        }
    }

    /** 左右选择按钮缩放呼吸 */
    private startChoiceBtnBreath() {
        if (!this.btnZuo || !this.btnYou || !this.btnZuo.active || !this.btnYou.active) return;

        if (!this.choiceBtnBaseScale) {
            this.choiceBtnBaseScale = {
                zx: this.btnZuo.scaleX,
                zy: this.btnZuo.scaleY,
                yx: this.btnYou.scaleX,
                yy: this.btnYou.scaleY,
            };
        }
        const b = this.choiceBtnBaseScale;
        this.stopChoiceBtnBreath(false);

        const dur = 0.75;
        const k = 1.06;
        const run = (n: cc.Node, sx: number, sy: number) => {
            n.scaleX = sx;
            n.scaleY = sy;
            cc.tween(n)
                .to(dur, { scaleX: sx * k, scaleY: sy * k }, { easing: "sineInOut" })
                .to(dur, { scaleX: sx, scaleY: sy }, { easing: "sineInOut" })
                .union()
                .repeatForever()
                .start();
        };
        run(this.btnZuo, b.zx, b.zy);
        run(this.btnYou, b.yx, b.yy);
    }

    /** @param hideNodes 为 false 时仅停 tween 并还原缩放（用于重启呼吸前） */
    private stopChoiceBtnBreath(hideNodes = true) {
        const restore = (n: cc.Node, sx: number, sy: number) => {
            if (!n || !n.isValid) return;
            cc.Tween.stopAllByTarget(n);
            n.scaleX = sx;
            n.scaleY = sy;
            if (hideNodes) n.active = false;
        };
        const b = this.choiceBtnBaseScale;
        if (b) {
            restore(this.btnZuo, b.zx, b.zy);
            restore(this.btnYou, b.yx, b.yy);
        } else {
            if (this.btnZuo && this.btnZuo.isValid) cc.Tween.stopAllByTarget(this.btnZuo);
            if (this.btnYou && this.btnYou.isValid) cc.Tween.stopAllByTarget(this.btnYou);
            if (hideNodes) {
                if (this.btnZuo) this.btnZuo.active = false;
                if (this.btnYou) this.btnYou.active = false;
            }
        }
    }

    private onPickSide(side: PickSide) {
        if (this.choiceBusy || this.stage1Finished) return;
        const stage = this.currentStage;
        if (stage < 1 || stage > 5) return;

        this.choiceBusy = true;
        this.canjiaohu = false;
        this.setChoiceButtonsVisible(false);

        if (stage === 5) {
            this.applyStage5ButtonPick(side);
            return;
        }

        const cfg = tlgc_lv451.STAGE_CFG.find((c) => c.stage === stage);
        if (!cfg) return;

        const prop = this.getStagePropOnSide(stage, side);
        const isCorrect = prop != null && prop.name.endsWith("_true");
        if (!isCorrect) this.anyWrong = true;
        if (stage === 4 && !isCorrect) this.stage4Wrong = true;

        const handSlot = side === "left" ? "zuoshou" : "youshou";
        if (this.jiaojiaonvArm) this.changeSKSlotIndex(this.jiaojiaonvArm, handSlot, 1);

        const pickText = side === "left" ? "我选左" : "我选右";
        const pickAudio = side === "left" ? tlgc_lv451.SFX.JIAO_PICK_LEFT : tlgc_lv451.SFX.JIAO_PICK_RIGHT;
        this.showQp(this.jiaojiaonvNode, pickText, pickAudio, () => {
            if (prop) prop.active = false;
            if (this.jiaojiaonvArm) this.changeSKSlotIndex(this.jiaojiaonvArm, handSlot, 0);

            const idx = isCorrect ? cfg.correctIndex : cfg.wrongIndex;
            this.changeSKSlotIndex(this.jiaojiaonvArm, cfg.resultSlot, idx);
            this.playSfx(isCorrect ? tlgc_lv451.SFX.CHOOSE_CORRECT : tlgc_lv451.SFX.CHOOSE_WRONG);
            this.playYanEffectOnce();

            const goNext = () => {
                this.choiceBusy = false;
                this.beginChoiceStage(stage + 1);
            };

            if (cfg.tempExprOnPick) {
                this.changeSKSlotIndex(this.jiaojiaonvArm, "biaoqing", isCorrect ? 4 : 5);
                this.scheduleOnce(() => {
                    this.changeSKSlotIndex(this.jiaojiaonvArm, "biaoqing", 0);
                    goNext();
                }, tlgc_lv451.EXPR_RESET_DELAY);
            } else {
                goNext();
            }
        });
    }

    private applyStage5ButtonPick(side: PickSide) {
        this.stage5Win = false;
        const prop = this.getStagePropOnSide(5, side);
        const handSlot = side === "left" ? "zuoshou" : "youshou";

        if (this.jiaojiaonvArm) this.changeSKSlotIndex(this.jiaojiaonvArm, handSlot, 1);

        const pickText = side === "left" ? "我选左" : "我选右";
        const pickAudio = side === "left" ? tlgc_lv451.SFX.JIAO_PICK_LEFT : tlgc_lv451.SFX.JIAO_PICK_RIGHT;
        this.showQp(this.jiaojiaonvNode, pickText, pickAudio, () => {
            if (prop) prop.active = false;
            if (this.jiaojiaonvArm) this.changeSKSlotIndex(this.jiaojiaonvArm, handSlot, 0);

            if (side === "left") {
                this.changeSKSlotIndex(this.jiaojiaonvArm, "tou", 1);
            } else {
                this.changeSKSlotIndex(this.jiaojiaonvArm, "maozi", 0);
            }

            let exprIdx = 5;
            if (this.anyWrong) {
                exprIdx = this.stage4Wrong ? 3 : 5;
            }
            this.changeSKSlotIndex(this.jiaojiaonvArm, "biaoqing", exprIdx);
            this.playSfx(tlgc_lv451.SFX.CHOOSE_WRONG);
            this.playYanEffectOnce();

            this.choiceBusy = false;
            this.finishStage1();
        });
    }

    private getStagePropOnSide(stage: number, side: PickSide): cc.Node | null {
        const hand = side === "left" ? this.handL : this.handR;
        if (!hand) return null;
        const trueN = hand.getChildByName(`${stage}_true`);
        if (trueN) return trueN;
        const falseN = hand.getChildByName(`${stage}_false`);
        if (falseN) return falseN;
        return null;
    }

    // —— 阶段 5：上划 ljt + 拖拽 5_true ——

    private bindClosetipsButton() {
        if (!this.tipsNode) this.tipsNode = this.node.getChildByName("tipsNode");
        const btn = this.tipsNode ? this.tipsNode.getChildByName("btn_closetips") : null;
        if (!btn) return;
        btn.on(cc.Node.EventType.TOUCH_END, this.onClosetipsTouch, this);
    }

    private unbindClosetipsButton() {
        if (!this.tipsNode || !this.tipsNode.isValid) return;
        const btn = this.tipsNode.getChildByName("btn_closetips");
        if (btn && btn.isValid) {
            btn.off(cc.Node.EventType.TOUCH_END, this.onClosetipsTouch, this);
        }
    }

    private onClosetipsTouch(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.onBtnClosetips();
    }

    private bindChoiceButtons() {
        for (const btn of [this.btnZuo, this.btnYou]) {
            if (!btn) continue;
            btn.on(cc.Node.EventType.TOUCH_END, this.onChoiceButtonTouch, this);
        }
    }

    private unbindChoiceButtons() {
        for (const btn of [this.btnZuo, this.btnYou]) {
            if (!btn || !btn.isValid) continue;
            btn.off(cc.Node.EventType.TOUCH_END, this.onChoiceButtonTouch, this);
        }
    }

    private onChoiceButtonTouch(event: cc.Event.EventTouch) {
        if (!this.canjiaohu || this.choiceBusy || this.stage1Finished) return;
        if (GameData.PauseGame) return;
        const name = event.currentTarget.name;
        if (name !== "btn_zuo" && name !== "btn_you") return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.onPickSide(name === "btn_zuo" ? "left" : "right");
    }

    private bindLjtTouch() {
        if (!this.ljt) return;
        this.ljt.on(cc.Node.EventType.TOUCH_START, this.onLjtTouchStart, this);
        this.ljt.on(cc.Node.EventType.TOUCH_MOVE, this.onLjtTouchMove, this);
        this.ljt.on(cc.Node.EventType.TOUCH_END, this.onLjtTouchEnd, this);
        this.ljt.on(cc.Node.EventType.TOUCH_CANCEL, this.onLjtTouchEnd, this);
    }

    private unbindLjtTouch() {
        if (!this.ljt || !this.ljt.isValid) return;
        this.ljt.off(cc.Node.EventType.TOUCH_START, this.onLjtTouchStart, this);
        this.ljt.off(cc.Node.EventType.TOUCH_MOVE, this.onLjtTouchMove, this);
        this.ljt.off(cc.Node.EventType.TOUCH_END, this.onLjtTouchEnd, this);
        this.ljt.off(cc.Node.EventType.TOUCH_CANCEL, this.onLjtTouchEnd, this);
    }

    private onLjtTouchStart() {
        if (!this.ljtSwipeReady || this.stage1Finished) return;
        this.ljtSwipeAccum = 0;
    }

    private onLjtTouchMove(event: cc.Event.EventTouch) {
        if (!this.ljtSwipeReady || this.stage1Finished) return;
        const dy = event.getDelta().y;
        if (dy > 0) this.ljtSwipeAccum += dy;
        if (this.ljtSwipeAccum >= tlgc_lv451.SWIPE_UP_PX) {
            this.onLjtSwipeSuccess();
        }
    }

    private onLjtTouchEnd() {
        this.ljtSwipeAccum = 0;
    }

    private onLjtSwipeSuccess() {
        if (!this.ljtSwipeReady || this.stage1Finished) return;
        this.ljtSwipeReady = false;
        if (!this.item5True || !this.ljt || !this.item5LandPos) return;

        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.canjiaohu = false;
        this.startBananaFlyFromLjt();
    }

    private startBananaFlyFromLjt() {
        if (!this.item5True || !this.ljt || !this.item5LandPos) return;

        const node = this.item5True;
        const start = this.ljt.position.clone();
        const land = this.item5LandPos.clone();

        cc.Tween.stopAllByTarget(node);
        node.active = true;
        node.setPosition(start);
        node.zIndex = 60;

        const cp1 = cc.v2(start.x + (land.x - start.x) * 0.3, start.y + 100);
        const cp2 = cc.v2(start.x + (land.x - start.x) * 0.75, land.y + 65);

        cc.tween(node)
            .bezierTo(tlgc_lv451.BANANA_FLY_TIME, cp1, cp2, cc.v2(land.x, land.y))
            .to(0.08, { y: land.y - 8 })
            .to(0.1, { y: land.y })
            .call(() => {
                if (!node.isValid) return;
                node.zIndex = 0;
                node.setPosition(land);
                this.item5DragOrigin = land.clone();
                this.canjiaohu = true;
            })
            .start();
    }

    private bindItem5TrueTouch() {
        if (!this.item5True) return;
        this.item5True.on(cc.Node.EventType.TOUCH_START, this.onItem5TouchStart, this);
        this.item5True.on(cc.Node.EventType.TOUCH_MOVE, this.onItem5TouchMove, this);
        this.item5True.on(cc.Node.EventType.TOUCH_END, this.onItem5TouchEnd, this);
        this.item5True.on(cc.Node.EventType.TOUCH_CANCEL, this.onItem5TouchEnd, this);
    }

    private unbindItem5TrueTouch() {
        if (!this.item5True || !this.item5True.isValid) return;
        this.item5True.off(cc.Node.EventType.TOUCH_START, this.onItem5TouchStart, this);
        this.item5True.off(cc.Node.EventType.TOUCH_MOVE, this.onItem5TouchMove, this);
        this.item5True.off(cc.Node.EventType.TOUCH_END, this.onItem5TouchEnd, this);
        this.item5True.off(cc.Node.EventType.TOUCH_CANCEL, this.onItem5TouchEnd, this);
    }

    private onItem5TouchStart(event: cc.Event.EventTouch) {
        if (!this.item5True || !this.item5True.active || this.stage1Finished) return;
        this.item5Dragging = true;
        this.item5True.zIndex = 100;
    }

    private onItem5TouchMove(event: cc.Event.EventTouch) {
        if (!this.item5Dragging || !this.item5True) return;
        const d = event.getDelta();
        this.item5True.x += d.x;
        this.item5True.y += d.y;
    }

    private onItem5TouchEnd() {
        if (!this.item5Dragging || !this.item5True) return;
        this.item5Dragging = false;
        this.item5True.zIndex = 0;

        if (this.isItem5OnJiaojiaonv()) {
            this.onStage5DragWin();
            return;
        }

        if (this.item5DragOrigin) {
            this.item5True.setPosition(this.item5DragOrigin);
        }
    }

    private isItem5OnJiaojiaonv(): boolean {
        if (!this.item5True || !this.jiaojiaonvNode) return false;
        const box = this.jiaojiaonvNode.getBoundingBoxToWorld();
        const p = this.item5True.convertToWorldSpaceAR(cc.v2(0, 0));
        return box.contains(p);
    }

    private onStage5DragWin() {
        if (this.stage1Finished) return;
        this.playSfx(tlgc_lv451.SFX.CHOOSE_CORRECT);
        this.stage5Win = true;
        this.canjiaohu = false;
        this.ljtSwipeReady = false;
        if (this.item5True) this.item5True.active = false;
        if (this.jiaojiaonvNode) this.jiaojiaonvNode.active = false;
        if (this.jiaojiaonvWin) this.jiaojiaonvWin.active = true;
        this.choiceBusy = false;
        this.finishStage1();
    }

    // —— 转场与结局 ——

    private finishStage1() {
        if (this.stage1Finished) return;
        this.stage1Finished = true;
        this.canjiaohu = false;
        this.ljtSwipeReady = false;
        this.setChoiceButtonsVisible(false);

        this.scheduleOnce(() => this.playTransitionToStage2(), tlgc_lv451.STAGE_END_WAIT);
    }

    private playTransitionToStage2() {
        if (!this.hei) {
            this.enterStage2AndDialog();
            return;
        }

        this.hei.active = true;
        this.hei.opacity = 0;
        cc.tween(this.hei)
            .to(tlgc_lv451.HEI_FADE_IN, { opacity: 255 })
            .delay(tlgc_lv451.HEI_HOLD)
            .call(() => this.enterStage2AndDialog())
            .start();
    }

    private enterStage2AndDialog() {
        const isWin = !this.anyWrong && this.stage5Win;

        if (this.stage2) this.stage2.active = true;
        if (this.winRoot) this.winRoot.active = isWin;
        if (this.lostRoot) this.lostRoot.active = !isWin;
        this.playStage2Bgm();

        if (!isWin) {
            this.mountJiaojiaonvToLostPoint();
        }

        if (this.stage1) this.stage1.active = false;

        const fadeOut = () => {
            if (!this.hei) {
                this.playEndingDialog(isWin);
                return;
            }
            cc.tween(this.hei)
                .to(tlgc_lv451.HEI_FADE_OUT, { opacity: 0 })
                .call(() => {
                    this.hei.active = false;
                    this.playEndingDialog(isWin);
                })
                .start();
        };

        if (this.hei && this.hei.opacity >= 255) {
            fadeOut();
        } else {
            fadeOut();
        }
    }

    /** 失败：将 stage1 焦焦挂到 lost/jiaojiaonv_point(0,0)，台词仍用挂点上的 qp */
    private mountJiaojiaonvToLostPoint() {
        const point = this.lostRoot ? this.lostRoot.getChildByName("jiaojiaonv_point") : null;
        const actor = this.jiaojiaonvNode;
        if (!point || !actor) return;

        actor.active = true;
        actor.parent = point;
        actor.setPosition(0, 0, 0);

        const actorQp = actor.getChildByName("qp");
        if (actorQp) actorQp.active = false;

        const pointQp = point.getChildByName("qp");
        if (pointQp) {
            pointQp.active = true;
            this.resetQpOpacity(point);
        }
    }

    private playEndingDialog(isWin: boolean) {
        if (isWin) {
            const jieshu = this.winRoot ? this.winRoot.getChildByName("jieshu_ske") : null;
            const jiaoPoint = this.winRoot ? this.winRoot.getChildByName("jiaojiaonv_point") : null;
            this.showQp(jieshu, "焦焦不要离开我，我知道错了！", tlgc_lv451.SFX.JIESHU_SORRY, () => {
                this.showQp(jiaoPoint, "臭渣男~赶紧离本女王远点", tlgc_lv451.SFX.JIAO_WIN_LINE, () => {
                    this.onwin();
                });
            });
        } else {
            const jiaoPoint = this.lostRoot ? this.lostRoot.getChildByName("jiaojiaonv_point") : null;
            const jieshu = this.lostRoot ? this.lostRoot.getChildByName("jieshu_ske") : null;
            this.showQp(jiaoPoint, "蕉哥她到底谁，你为什么要背叛我！", tlgc_lv451.SFX.JIAO_LOST_LINE, () => {
                this.showQp(jieshu, "哼~快走吧！瞧瞧你这副样子根本配不上我！", tlgc_lv451.SFX.JIESHU_LOST_LINE, () => {
                    this.onlost();
                });
            });
        }
    }

    private playSfx(key: string) {
        if (!key || !AudioManager.get(key)) return;
        AudioManager.playEffect(key);
    }

    private playLevelBgm() {
        AudioManager.playMusic(tlgc_lv451.BGM_KEY, true);
    }

    private playStage2Bgm() {
        if (AudioManager.get(tlgc_lv451.BGM_STAGE2_KEY)) {
            AudioManager.playMusic(tlgc_lv451.BGM_STAGE2_KEY, true);
        } else {
            AudioManager.playMusic(tlgc_lv451.BGM_KEY, true);
        }
    }

    private stopLevelBgm() {
        AudioManager.stopMusic();
    }
}
