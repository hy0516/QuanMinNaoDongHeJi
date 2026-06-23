

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";





const { ccclass, property } = cc._decorator;

/** 任意穿戴件开始拖拽后关闭手指引导（与 moveitem 内派发对应） */
const EV_GUIDE_DISMISS = "Lv480GuideDismiss";

@ccclass
export default class shjajs_480 extends BaseGame {
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    tipsPanel: cc.Node = null;
    @property(cc.Node)
    g: cc.Node = null;
    camereList: cc.Node[] = [];
    public startTime = 300;
    public curTime = 0;
    tipsindex = 0;
    tiezhinum = 0;

    /** peishi2 内选款：1=btn_chose1 对应 box2 子节点首项，2=btn_chose2 对应次项 */
    private peishiChoseVariant: 1 | 2 | null = null;
    private peishiBox1TouchBound = false;
    private peishiBox2GcTouchBound = false;
    /** box2 孙节点被点击并转移到 wuping 的计数，达到 box2.childrenCount 时 step2 退场 */
    private peishiBox2ClickedCount = 0;

    /** 手指引导节点（初始位置在编辑器摆好，目标为 wuping 或 wuping/szpoint） */
    private szNode: cc.Node = null;
    private readonly SZ_GUIDE_MOVE_SEC = 1.5;

    /** step2 点击九宫格时的烟雾特效节点 */
    private ywNode: cc.Node = null;
    private ywAnimToken = 0;
    private readonly YW_ANIM_NAME = "yw";
    private readonly YW_FALLBACK_HIDE_SEC = 0.8;

    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景lv480", false, 0.5);
        }, 0.5)
        const bg = this.node.getChildByName("bg");
        const compInit = bg.getChildByName("complet");
        if (compInit) compInit.active = false;
        const camInit = bg.getChildByName("btn_cam");
        if (camInit) camInit.active = false;
        this.node.on("CheckWuTai", this.checkWuTai, this);
        this.szNode = bg.getChildByName("szNode");
        this.node.on(EV_GUIDE_DISMISS, this.dismissSzGuide, this);
        if (this.szNode && this.szNode.isValid) {
            this.szNode.active = true;
        }

        const step2 = bg.getChildByName("step2");
        this.ywNode = step2 && step2.getChildByName("ywNode");
        if (this.ywNode && this.ywNode.isValid) {
            this.ywNode.active = false;
        }

        this.initPeishiStep1Step2Ui();
    }

    protected onDestroy(): void {
        this.teardownPeishiBoxTouches();
        this.teardownPeishiBox2GcTouches();
        this.unwirePeishiChoseButtons();
        this.setWupingDraggable(true);
        if (this.szNode && this.szNode.isValid) {
            cc.Tween.stopAllByTarget(this.szNode);
        }
        this.node.off(EV_GUIDE_DISMISS, this.dismissSzGuide, this);
        this.unschedule(this.hideYwSafely);
        super.onDestroy();
    }

    private getBg(): cc.Node {
        return this.node.getChildByName("bg");
    }

    /** 提示面板：按当前选款显示 choose1 / choose2 / nochoose */
    private applyTipsPanelByChoseState(): void {
        if (!this.tipsPanel || !this.tipsPanel.isValid) return;
        const choose1 = this.tipsPanel.getChildByName("choose1");
        const choose2 = this.tipsPanel.getChildByName("choose2");
        const nochoose = this.tipsPanel.getChildByName("nochoose");
        if (choose1) choose1.active = false;
        if (choose2) choose2.active = false;
        if (nochoose) nochoose.active = false;
        if (this.peishiChoseVariant === 1) {
            if (choose1) choose1.active = true;
        } else if (this.peishiChoseVariant === 2) {
            if (choose2) choose2.active = true;
        } else if (nochoose) {
            nochoose.active = true;
        }
    }

    private hideTipsPanelHintNodes(): void {
        if (!this.tipsPanel || !this.tipsPanel.isValid) return;
        const choose1 = this.tipsPanel.getChildByName("choose1");
        const choose2 = this.tipsPanel.getChildByName("choose2");
        const nochoose = this.tipsPanel.getChildByName("nochoose");
        if (choose1) choose1.active = false;
        if (choose2) choose2.active = false;
        if (nochoose) nochoose.active = false;
    }

    /** step1：选项；step2：九宫对照。开局仅 step1，点选后进入 step2。 */
    private initPeishiStep1Step2Ui(): void {
        const bg = this.getBg();
        if (!bg) return;
        const step1 = bg.getChildByName("step1");
        const step2 = bg.getChildByName("step2");
        if (step2) step2.active = false;
        if (step1) step1.active = true;
        this.wirePeishiChoseButtons();
    }

    private wirePeishiChoseButtons(): void {
        const bg = this.getBg();
        const step1 = bg && bg.getChildByName("step1");
        const pic2 = step1 && step1.getChildByName("pic2");
        if (!pic2) return;
        const n1 = pic2.getChildByName("btn_chose1");
        const n2 = pic2.getChildByName("btn_chose2");
        if (n1 && n1.isValid) {
            n1.off(cc.Node.EventType.TOUCH_END, this.onPeishiChoseBtn1, this);
            n1.on(cc.Node.EventType.TOUCH_END, this.onPeishiChoseBtn1, this);
        }
        if (n2 && n2.isValid) {
            n2.off(cc.Node.EventType.TOUCH_END, this.onPeishiChoseBtn2, this);
            n2.on(cc.Node.EventType.TOUCH_END, this.onPeishiChoseBtn2, this);
        }
    }

    private unwirePeishiChoseButtons(): void {
        const bg = this.getBg();
        const step1 = bg && bg.getChildByName("step1");
        const pic2 = step1 && step1.getChildByName("pic2");
        if (!pic2 || !pic2.isValid) return;
        let n = pic2.getChildByName("btn_chose1");
        if (n && n.isValid) n.off(cc.Node.EventType.TOUCH_END, this.onPeishiChoseBtn1, this);
        n = pic2.getChildByName("btn_chose2");
        if (n && n.isValid) n.off(cc.Node.EventType.TOUCH_END, this.onPeishiChoseBtn2, this);
    }

    private onPeishiChoseBtn1(ev: cc.Event.EventTouch): void {
        ev.stopPropagation();
        this.enterPeishiStep2AfterChose(1);
    }

    private onPeishiChoseBtn2(ev: cc.Event.EventTouch): void {
        ev.stopPropagation();
        this.enterPeishiStep2AfterChose(2);
    }

    private enterPeishiStep2AfterChose(v: 1 | 2): void {
        if (GameData.PauseGame == true) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        const bg = this.getBg();
        if (!bg) return;
        const step1 = bg.getChildByName("step1");
        const step2 = bg.getChildByName("step2");
        this.peishiChoseVariant = v;
        this.peishiBox2ClickedCount = 0;
        if (step1) step1.active = false;
        if (step2) step2.active = true;
        this.resetPeishiStep2Boxes();
        this.hideYwSafely();
        this.teardownPeishiBoxTouches();
        this.teardownPeishiBox2GcTouches();
        this.setupPeishiBox1Touches();
        this.activateWupingChose(v);
    }

    /** box1 全开、box2 全关（仅格子父节点）；box2 子显示由点击同步。wuping/choose 全关。 */
    private resetPeishiStep2Boxes(): void {
        const bg = this.getBg();
        if (!bg) return;
        const step2 = bg.getChildByName("step2");
        if (!step2) return;
        const box1 = step2.getChildByName("box1");
        const box2 = step2.getChildByName("box2");
        if (!box1 || !box2) return;
        box1.active = true;
        box2.active = true;
        for (let i = 0; i < box1.childrenCount; i++) {
            const c = box1.children[i];
            if (c && c.isValid) c.active = true;
        }
        for (let j = 0; j < box2.childrenCount; j++) {
            const cell = box2.children[j];
            if (!cell || !cell.isValid) continue;
            cell.active = false;
            for (let k = 0; k < cell.childrenCount; k++) {
                const g = cell.children[k];
                if (g && g.isValid) g.active = false;
            }
        }
        // wuping/choose1、choose2 全关
        const wuping = bg.getChildByName("wuping");
        if (wuping && wuping.isValid) {
            const c1 = wuping.getChildByName("choose1");
            const c2 = wuping.getChildByName("choose2");
            if (c1 && c1.isValid) {
                c1.active = false;
                for (let i = 0; i < c1.childrenCount; i++) {
                    if (c1.children[i] && c1.children[i].isValid) c1.children[i].active = false;
                }
            }
            if (c2 && c2.isValid) {
                c2.active = false;
                for (let i = 0; i < c2.childrenCount; i++) {
                    if (c2.children[i] && c2.children[i].isValid) c2.children[i].active = false;
                }
            }
        }
    }

    private setupPeishiBox1Touches(): void {
        const bg = this.getBg();
        const box1 = bg && bg.getChildByName("step2") && bg.getChildByName("step2").getChildByName("box1");
        if (!box1 || !box1.isValid) return;
        for (let i = 0; i < box1.childrenCount; i++) {
            const ch = box1.children[i];
            if (!ch || !ch.isValid) continue;
            ch.off(cc.Node.EventType.TOUCH_END, this.onPeishiBox1CellTouch, this);
            ch.on(cc.Node.EventType.TOUCH_END, this.onPeishiBox1CellTouch, this);
        }
        this.peishiBox1TouchBound = true;
    }

    private teardownPeishiBoxTouches(): void {
        if (!this.peishiBox1TouchBound) return;
        this.peishiBox1TouchBound = false;
        const bg = this.getBg();
        const box1 = bg && bg.getChildByName("step2") && bg.getChildByName("step2").getChildByName("box1");
        if (!box1 || !box1.isValid) return;
        for (let i = 0; i < box1.childrenCount; i++) {
            const ch = box1.children[i];
            if (ch && ch.isValid) ch.off(cc.Node.EventType.TOUCH_END, this.onPeishiBox1CellTouch, this);
        }
    }

    private onPeishiBox1CellTouch(ev: cc.Event.EventTouch): void {
        if (GameData.PauseGame == true) return;
        if (this.peishiChoseVariant == null) return;
        const bg = this.getBg();
        const step2 = bg && bg.getChildByName("step2");
        if (!step2 || !step2.active) return;
        const box1 = step2.getChildByName("box1");
        const box2 = step2.getChildByName("box2");
        if (!box1 || !box2) return;
        const src = ev.currentTarget as cc.Node;
        if (!src || !src.active || !src.isValid) return;
        let idx = -1;
        for (let i = 0; i < box1.childrenCount; i++) {
            if (box1.children[i] === src) {
                idx = i;
                break;
            }
        }
        if (idx < 0 || idx >= box2.childrenCount) return;
        const cellRight = box2.children[idx];
        if (!cellRight || !cellRight.isValid) return;
        AudioManager.playEffect("盲盒破开");
        this.playYwAtNode(src);
        src.active = false;
        cellRight.active = true;
        const v = this.peishiChoseVariant;
        const gc0 = cellRight.children[0];
        const gc1 = cellRight.children[1];
        let activeGc: cc.Node | null = null;
        if (gc0 && gc0.isValid && gc1 && gc1.isValid) {
            if (v === 1) {
                gc0.active = true;
                gc1.active = false;
                activeGc = gc0;
            } else {
                gc0.active = false;
                gc1.active = true;
                activeGc = gc1;
            }
        }
        // 给激活的孙节点挂触摸：点击后隐藏自身、激活 wuping/choose 中同名节点
        if (activeGc && activeGc.isValid) {
            activeGc.off(cc.Node.EventType.TOUCH_END, this.onPeishiBox2GrandchildTouch, this);
            activeGc.on(cc.Node.EventType.TOUCH_END, this.onPeishiBox2GrandchildTouch, this);
            this.peishiBox2GcTouchBound = true;
        }
    }

    /** 参考 lv412：起点为 szNode 当前坐标，沿贝塞尔过渡到 wuping（或 szpoint），循环播放 */
    private startSzGuideIfNeeded(): void {
        const bg = this.node.getChildByName("bg");
        if (!this.szNode || !this.szNode.isValid || !bg) return;
        const wuping = bg.getChildByName("wuping");
        if (!wuping || !wuping.isValid) return;
        const marker = wuping.getChildByName("szpoint");
        const from = cc.v2(this.szNode.x, this.szNode.y);
        const hitWorld = (marker && marker.isValid ? marker : wuping).convertToWorldSpaceAR(cc.v2(0, 0));
        const to = bg.convertToNodeSpaceAR(hitWorld);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const bump = Math.min(90, len * 0.18);
        const ox = (-dy / len) * bump;
        const oy = (dx / len) * bump;
        const c1 = cc.v2(from.x + dx * 0.28 + ox, from.y + dy * 0.28 + oy);
        const c2 = cc.v2(from.x + dx * 0.72 + ox, from.y + dy * 0.72 + oy);
        const toV2 = cc.v2(to.x, to.y);
        this.szNode.active = true;
        cc.Tween.stopAllByTarget(this.szNode);
        cc.tween(this.szNode)
            .repeatForever(
                cc
                    .tween()
                    .bezierTo(this.SZ_GUIDE_MOVE_SEC, c1, c2, toV2)
                    .call(() => {
                        if (this.szNode && this.szNode.isValid) {
                            this.szNode.setPosition(from.x, from.y);
                        }
                    })
            )
            .start();
    }

    private dismissSzGuide(): void {
        if (!this.szNode || !this.szNode.isValid) return;
        cc.Tween.stopAllByTarget(this.szNode);
        this.szNode.active = false;
    }

    private hideYwSafely(): void {
        if (this.ywNode && this.ywNode.isValid) {
            this.ywNode.active = false;
        }
    }

    private playYwAtNode(src: cc.Node): void {
        if (!src || !src.isValid) return;
        const bg = this.getBg();
        if (!bg) return;
        const step2 = bg.getChildByName("step2");
        if (!step2) return;

        if (!this.ywNode || !this.ywNode.isValid) {
            this.ywNode = step2.getChildByName("ywNode");
        }
        if (!this.ywNode || !this.ywNode.isValid) return;

        const ywParent = this.ywNode.parent;
        if (!ywParent || !ywParent.isValid) return;

        const worldPos = src.parent.convertToWorldSpaceAR(src.position);
        const localPos = ywParent.convertToNodeSpaceAR(worldPos);
        this.ywNode.setPosition(localPos);
        this.ywNode.active = true;

        this.unschedule(this.hideYwSafely);

        const armature = this.ywNode.getComponent(dragonBones.ArmatureDisplay)
            || this.ywNode.getComponentInChildren(dragonBones.ArmatureDisplay);
        if (!armature) {
            this.scheduleOnce(this.hideYwSafely, this.YW_FALLBACK_HIDE_SEC);
            return;
        }

        this.ywAnimToken++;
        const currentToken = this.ywAnimToken;
        this.addOneTimeListener(armature, () => {
            if (currentToken !== this.ywAnimToken) return;
            this.hideYwSafely();
        });
        armature.playAnimation(this.YW_ANIM_NAME, 1);
        this.scheduleOnce(() => {
            if (currentToken !== this.ywAnimToken) return;
            this.hideYwSafely();
        }, this.YW_FALLBACK_HIDE_SEC);
    }

    /** 根据 peishiChoseVariant 激活 wuping/choose1 或 choose2，子节点先不激活；同时锁定拖拽 */
    private activateWupingChose(v: 1 | 2): void {
        const bg = this.getBg();
        if (!bg) return;
        const wuping = bg.getChildByName("wuping");
        if (!wuping || !wuping.isValid) return;
        const c1 = wuping.getChildByName("choose1");
        const c2 = wuping.getChildByName("choose2");
        if (v === 1) {
            if (c1 && c1.isValid) c1.active = true;
            if (c2 && c2.isValid) c2.active = false;
        } else {
            if (c1 && c1.isValid) c1.active = false;
            if (c2 && c2.isValid) c2.active = true;
        }
        // step2 退场前禁止拖拽：设置 moveitem_435.draggable = false
        const choseNode = v === 1 ? c1 : c2;
        if (choseNode && choseNode.isValid) {
            for (let i = 0; i < choseNode.childrenCount; i++) {
                const ch = choseNode.children[i];
                if (!ch || !ch.isValid) continue;
                const comp = ch.getComponent("moveitem_480");
                if (comp) comp.draggable = false;
            }
        }
    }

    /** box2 孙节点被点击：缩小消失，激活 wuping/choose 中同名节点并放大出现 */
    private onPeishiBox2GrandchildTouch(ev: cc.Event.EventTouch): void {
        if (GameData.PauseGame == true) return;
        const gc = ev.currentTarget as cc.Node;
        if (!gc || !gc.isValid) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // 立即解绑防止快速连点重复计数
        gc.off(cc.Node.EventType.TOUCH_END, this.onPeishiBox2GrandchildTouch, this);
        const gcName = gc.name;
        const gcOriginScale = gc.scale;
        const bg = this.getBg();
        if (!bg) return;
        const wuping = bg.getChildByName("wuping");
        if (!wuping || !wuping.isValid) return;
        const choseName = this.peishiChoseVariant === 1 ? "choose1" : "choose2";
        const chose = wuping.getChildByName(choseName);
        // 孙节点缩小消失
        cc.Tween.stopAllByTarget(gc);
        cc.tween(gc)
            .to(0.2, { scale: 0 })
            .call(() => { gc.active = false; gc.scale = gcOriginScale; })
            .start();
        // wuping/choose 中同名节点从小放大出现
        if (chose && chose.isValid) {
            const target = chose.getChildByName(gcName);
            if (target && target.isValid) {
                const targetOriginScale = target.scale;
                target.active = true;
                target.scale = 0;
                // step2 还在，禁止拖拽
                const comp = target.getComponent("moveitem_480");
                if (comp) comp.draggable = false;
                cc.Tween.stopAllByTarget(target);
                cc.tween(target)
                    .to(0.2, { scale: targetOriginScale })
                    .start();
            }
        }
        this.peishiBox2ClickedCount++;
        const step2 = bg.getChildByName("step2");
        const box2 = step2 && step2.getChildByName("box2");
        if (step2 && step2.isValid && box2 && this.peishiBox2ClickedCount >= box2.childrenCount) {
            // 所有 box2 位置完成：step2 往左移 1000 然后隐藏，动画结束后解锁拖拽
            this.teardownPeishiBox2GcTouches();
            cc.Tween.stopAllByTarget(step2);
            cc.tween(step2)
                .to(0.4, { x: step2.x - 1000 })
                .call(() => {
                    step2.active = false;
                    this.setWupingDraggable(true);
                })
                .start();
        }
    }

    private teardownPeishiBox2GcTouches(): void {
        if (!this.peishiBox2GcTouchBound) return;
        this.peishiBox2GcTouchBound = false;
        const bg = this.getBg();
        const step2 = bg && bg.getChildByName("step2");
        const box2 = step2 && step2.getChildByName("box2");
        if (!box2 || !box2.isValid) return;
        for (let i = 0; i < box2.childrenCount; i++) {
            const cell = box2.children[i];
            if (!cell || !cell.isValid) continue;
            for (let k = 0; k < cell.childrenCount; k++) {
                const gc = cell.children[k];
                if (gc && gc.isValid) {
                    gc.off(cc.Node.EventType.TOUCH_END, this.onPeishiBox2GrandchildTouch, this);
                }
            }
        }
    }

    /** 解锁/锁定 wuping/choose{variant} 下所有子节点的拖拽 */
    private setWupingDraggable(draggable: boolean): void {
        const bg = this.getBg();
        if (!bg) return;
        const wuping = bg.getChildByName("wuping");
        if (!wuping || !wuping.isValid) return;
        const choseName = this.peishiChoseVariant === 1 ? "choose1" : "choose2";
        const chose = wuping.getChildByName(choseName);
        if (!chose || !chose.isValid) return;
        for (let i = 0; i < chose.childrenCount; i++) {
            const ch = chose.children[i];
            if (!ch || !ch.isValid) continue;
            const comp = ch.getComponent("moveitem_480");
            if (comp) comp.draggable = draggable;
        }
    }

    checkWuTai() {
        const bg = this.node.getChildByName("bg");
        if (!bg) return;
        const wutai = bg.getChildByName("舞台");
        if (!wutai) return;
        const complet = bg.getChildByName("complet");
        const btnCam = bg.getChildByName("btn_cam");
        let activeCount = 0;
        for (let i = 0; i < wutai.childrenCount; i++) {
            const ch = wutai.children[i];
            if (!ch || !ch.isValid || !ch.active) continue;
            if (ch.name === "dj_sk") continue;
            activeCount++;
        }
        if (activeCount >= 5) {
            complet.active = true;
            btnCam.active = true;
        }
    }
    onwin() {
        const handler = () => {
            this.node.cleanup();
            this.scheduleOnce(() => {
                AudioManager.stopEffect()
                this.loadend();
                this.node.destroy();
            }, 1.5);

        }
        GameData.PauseGame = true;
        this.g.active = true;
        this.g.scale = 0;
        AudioManager.playEffect("finishjq");
        cc.Tween.stopAllByTarget(this.g);
        cc.tween(this.g)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .call(() => {
                handler && handler();
            })
            .start()
    }

    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {

        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "tishi":
                break;
            
            case "complet":
                if (GameData.PauseGame == true) return
                event.currentTarget.active = false;
                this.onwin();
                break;

            case "btn_cam": {
                if (GameData.PauseGame == true) return
                this.camereList = [];
                // GameData.PauseGame = true;
                AudioManager.playEffect("拍照");
                // const bg = this.node.getChildByName("bg");
                // for (let y = 0; y < bg.childrenCount; y++) {
                //     const item = bg.children[y];
                //     if (item.name == "舞台") continue;
                //     if (item.active) {
                //         item.active = false;
                //         this.camereList.push(item);
                //     }
                // }
                // this.scheduleOnce(() => {
                //     for (let y = 0; y < this.camereList.length; y++) {
                //         const item = this.camereList[y];
                //         item.active = true;
                //     }
                //     GameData.PauseGame = false;
                // }, 5)
                break;
            }
            case "jiashi2":
                VideoManager.getInstance().report("tipsVideo", { name: GameData.curGameName, complet: 1 })
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(250);
                })
                break;
            case "tips2":
                VideoManager.getInstance().report("tipsVideo", { name: GameData.curGameName, complet: 0 })
                VideoManager.getInstance().showVideo(() => {
                    this.applyTipsPanelByChoseState();
                    this.tipsPanel.active = true;
                    GameData.PauseGame = true;
                })
                break;
            case "x":
                this.hideTipsPanelHintNodes();
                this.tipsPanel.active = false;
                GameData.PauseGame = false;
                break;
            case "tipsleft": {
                const tipsnode = this.tipsPanel.getChildByName("tipstexture");
                if (this.tipsindex != 0) {
                    tipsnode.children[this.tipsindex].active = false;
                    this.tipsindex--;
                    tipsnode.children[this.tipsindex].active = true;
                    if (this.tipsindex == 0) event.currentTarget.active = false;
                    if (this.tipsindex < tipsnode.childrenCount - 1) this.tipsPanel.getChildByName("tipsright").active = true;
                }
                break;
            }
            case "tipsright": {
                const tipsnode = this.tipsPanel.getChildByName("tipstexture");
                if (this.tipsindex < tipsnode.childrenCount - 1) {
                    tipsnode.children[this.tipsindex].active = false;
                    this.tipsindex++;
                    tipsnode.children[this.tipsindex].active = true;
                    if (this.tipsindex == tipsnode.childrenCount - 1) event.currentTarget.active = false;
                    if (this.tipsindex > 0) this.tipsPanel.getChildByName("tipsleft").active = true;
                }
                break;
            }
        }
    }

    loadend() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");
    }

    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.setTime(200)
        this.schedule(this.Timeing, 1);
    }

    setTime(time: number) {
        this.startTime += time;
        let fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
        this.Timeing();
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255})
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .start();
    }


    Timeing() {
        if (GameData.PauseGame == true || this.startTime == 0) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            GameData.PauseGame = true;
            this.scheduleOnce(() => {
                // 失败面板需仍能「加时钟 / 重玩」：不可提前销毁关卡节点（否则 endlost_hz 找不到 BaseGame）
                this.endlost("prefabs/hz/endlost_hz");
            }, 0.7);
        }
    }
}
