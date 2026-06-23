import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveitem_lv440 from "./moveitem_lv440";

const { ccclass, property } = cc._decorator;

/**
 * 440 贴纸关：每层 lv1/lv2… 含 tzarea + botton，底部 content 碎片拖入同层同名槽位；碎片脚本运行时挂载。
 */
@ccclass
export default class tz_lv440 extends BaseGame {
    /** 贴纸关卡层：与 prefab 下节点名一致，每层含 tzarea + botton（结构同 lv1） */
    private static readonly STICKER_LAYER_ROOT_NAMES: string[] = ["lv1", "lv2"];

    isshowVideo = false;

    /** 槽与贴纸锚点的世界坐标最大允许偏移（像素，欧氏距离；越大越宽容） */
    @property
    stickerPlaceTolerancePx: number = 45;

    /** 各槽位子节点 mask：高度线性收至 0 的时长（秒），与 03 相同表现 */
    @property
    sticker03MaskShrinkSec: number = 0.3;

    /** quan 播完后，mask2 下「绿光_tex」缓动到目标 y 的时长（秒） */
    @property
    greenLightTexTweenSec: number = 0.4;

    /** 每小关倒计时（秒）；进入下一个小关（lv1→lv2 转场结束）时重新给满该时长 */
    @property
    levelTimeSeconds: number = 200;

    /** 第一小关结束后 lv1 向左平移的像素（正数，目标 x = 当前 x - 本值） */
    @property
    lv1ExitShiftPx: number = 600;

    /** 开局时 lv2 相对设计位向右的偏移（像素），用于从屏外入场 */
    @property
    lv2EnterOffsetX: number = 1400;

    /** lv1 退场与 lv2 入场的缓动时长（秒） */
    @property
    layerSlideDuration: number = 0.55;

    /** 手指 sz3 在碎片与槽位间单程缓动时长（秒） */
    @property
    sz3FingerLegDuration: number = 0.65;

    /** 手指到达槽位后的停顿时长（秒），之后瞬间回到碎片再继续 */
    @property
    sz3FingerPauseAtSlotSec: number = 0.5;

    /** 提示缩放呼吸：单次「基准→放大」或「放大→基准」半程时长（秒） */
    @property
    hintBlinkHalfSec: number = 0.9;

    /** 相对当前缩放的最大增量比例（如 0.06 ≈ 最大放大 6%） */
    @property
    hintBreathScaleDelta: number = 0.06;

    /** 开局自动提示为新手引导：不显示绿圈，仅首片缩放呼吸，触摸首片即解除 */
    private _newbieEntryGuideActive: boolean = false;
    private _newbieGuideBlinkNode: cc.Node = null;
    /** 开呼吸前记录的 scale，停缓动时还原 */
    private _hintBreathScaleSnap: { [uuid: string]: { x: number; y: number } } = {};

    private stickerTotal: number = 0;
    private stickerPlaced: number = 0;

    /** 剩余时间（秒），每秒递减 */
    private _levelTimeRemaining: number = 0;
    private timeLabel: cc.Label = null;
    private addTimeTipNd: cc.Node = null;

    /** 各层初始碎片数 / 已贴数 */
    private _stickersPerLayer: { [layer: string]: number } = {};
    private _placedPerLayer: { [layer: string]: number } = {};

    private _gouNd: cc.Node = null;
    private _lv1RestPos: cc.Vec2 = cc.v2();
    private _lv2RestPos: cc.Vec2 = cc.v2();
    private _lv1ToLv2TransitionRunning = false;
    private _lv1ToLv2Done = false;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.onInit("lv440/audio_lv440");
        AudioManager.stopMusic();

        this._gouNd = this.node.getChildByName("gou");
        if (this._gouNd && cc.isValid(this._gouNd)) {
            this._gouNd.active = false;
            this._gouNd.scale = 0;
        }

        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景440", null, 0.5);
        }, 0.5);

    }

    start() {
        this.hideLvquanTipsOutlineHint();
        this.bindLevelTimeUi();
        this._levelTimeRemaining = Math.max(0, Math.floor(this.levelTimeSeconds));
        this.refreshLevelTimeLabel();
        this.schedule(this.onLevelTimeTick, 1);
        this.initStickerDrag();
        this.prepareDualLayerInitialLayout();
        this.scheduleOnce(() => this.applyAllSlotsMask2PolygonStencils(), 0);
        this.scheduleOnce(() => this.showLvquanTipsOutlineHint(), 0.2);
    }

    private bindLevelTimeUi(): void {
        const timeTextNd = this.node.getChildByName("TimeText");
        this.timeLabel = timeTextNd ? timeTextNd.getComponent(cc.Label) : null;
        this.addTimeTipNd = timeTextNd ? timeTextNd.getChildByName("addTimeTip") : null;
        if (!this.timeLabel) {
            cc.warn("[tz_lv440] 未找到 TimeText 或未挂 Label，倒计时无法显示");
        }
    }

    private refreshLevelTimeLabel(): void {
        if (this.timeLabel && cc.isValid(this.timeLabel)) {
            this.timeLabel.string = "时间：" + Math.max(0, Math.floor(this._levelTimeRemaining)) + "s";
        }
    }

    private onLevelTimeTick(): void {
        if (GameData.PauseGame) {
            return;
        }
        if (this._levelTimeRemaining <= 0) {
            this.unschedule(this.onLevelTimeTick);
            return;
        }
        this._levelTimeRemaining--;
        this.refreshLevelTimeLabel();
        if (this._levelTimeRemaining > 0) {
            return;
        }
        this.unschedule(this.onLevelTimeTick);
        GameData.PauseGame = true;
        common.ShowTipsView("时间到！");
        this.scheduleOnce(() => {
            this.endlost("prefabs/hz/endlost_hz");
        }, 0.7);
    }

    /**
     * hz 失败结算「加时」看完激励视频后由 endlost_hz 调用，与 lv422 一致。
     */
    endAddTime(): void {
        this.setTime(60);
    }

    /**
     * 加时（激励视频等），与 lv421 等关卡表现一致。
     */
    setTime(time: number): void {
        if (this._levelTimeRemaining + time <= 0) {
            return;
        }
        const wasExpired = this._levelTimeRemaining <= 0;
        this._levelTimeRemaining += time;
        this.refreshLevelTimeLabel();
        if (wasExpired && this._levelTimeRemaining > 0) {
            GameData.PauseGame = false;
            this.unschedule(this.onLevelTimeTick);
            this.schedule(this.onLevelTimeTick, 1);
        }
        const tipNd = this.addTimeTipNd;
        if (tipNd && cc.isValid(tipNd)) {
            const tipLab = tipNd.getComponent(cc.Label);
            if (tipLab) {
                const fuhao = time > 0 ? "+" : "";
                tipLab.string = fuhao + time + "s";
            }
            cc.Tween.stopAllByTarget(tipNd);
            cc.tween(tipNd)
                .to(0.2, { opacity: 255 })
                .delay(0.5)
                .to(0.1, { opacity: 0 })
                .start();
        }
    }

    /**
     * 为每层 lv1/lv2… 下 botton/.../content 子节点挂移动脚本，并绑定同层 tzarea。
     */
    private initStickerDrag(): void {
        if (!this.node.getChildByName("lv1")) {
            cc.error("[tz_lv440] 未找到 lv1");
            return;
        }

        this.stickerTotal = 0;
        let anyBound = false;
        this._stickersPerLayer = {};
        this._placedPerLayer = {};
        this._lv1ToLv2Done = false;
        this._lv1ToLv2TransitionRunning = false;

        for (let li = 0; li < tz_lv440.STICKER_LAYER_ROOT_NAMES.length; li++) {
            const layerName = tz_lv440.STICKER_LAYER_ROOT_NAMES[li];
            const layer = this.node.getChildByName(layerName);
            if (!layer || !cc.isValid(layer)) {
                continue;
            }

            const tzarea = layer.getChildByName("tzarea");
            const botton = layer.getChildByName("botton");
            if (!tzarea || !botton) {
                cc.error(`[tz_lv440] ${layerName} 未找到 tzarea 或 botton`);
                continue;
            }
            const scroll = botton.getComponent(cc.ScrollView);
            const viewNd = botton.getChildByName("view");
            const contentNd = viewNd ? viewNd.getChildByName("content") : null;
            if (!scroll || !contentNd) {
                cc.error(`[tz_lv440] ${layerName} ScrollView 或 content 缺失`);
                continue;
            }

            const n = contentNd.childrenCount;
            this.stickerTotal += n;
            this._stickersPerLayer[layerName] = n;
            if (n <= 0) {
                continue;
            }

            for (let i = 0; i < contentNd.children.length; i++) {
                const piece = contentNd.children[i];
                if (!piece || !cc.isValid(piece)) {
                    continue;
                }
                let mv = piece.getComponent(moveitem_lv440);
                if (!mv) {
                    mv = piece.addComponent(moveitem_lv440);
                }
                mv.bind(this, tzarea, scroll, this.stickerPlaceTolerancePx, layerName);
            }
            anyBound = true;
        }

        if (!anyBound || this.stickerTotal <= 0) {
            cc.warn("[tz_lv440] 各层 content 下无贴纸节点或未绑定");
        }
    }

    /**
     * 双小关：开局把 lv2 摆到设计位右侧屏外，并记录 lv1/lv2 目标坐标（本地）。
     */
    private prepareDualLayerInitialLayout(): void {
        const lv1Nd = this.node.getChildByName("lv1");
        const lv2Nd = this.node.getChildByName("lv2");
        if (lv1Nd && cc.isValid(lv1Nd)) {
            this._lv1RestPos = cc.v2(lv1Nd.x, lv1Nd.y);
        }
        if (lv2Nd && cc.isValid(lv2Nd)) {
            this._lv2RestPos = cc.v2(lv2Nd.x, lv2Nd.y);
        }
        const lv1N = this._stickersPerLayer["lv1"] || 0;
        const lv2N = this._stickersPerLayer["lv2"] || 0;
        if (lv1N <= 0 || lv2N <= 0 || !lv2Nd || !cc.isValid(lv2Nd)) {
            return;
        }
        lv2Nd.setPosition(this._lv2RestPos.x + this.lv2EnterOffsetX, this._lv2RestPos.y);
    }

    /**
     * 视口中心在关卡根节点（本组件 node）下的本地坐标，用于 lv2 转场落位。
     */
    private getScreenCenterInLevelLocal(): cc.Vec2 {
        const sz = cc.winSize;
        const world = cc.v2(sz.width * 0.5, sz.height * 0.5);
        return this.node.convertToNodeSpaceAR(world);
    }

    /**
     * 打勾 → 小关音效 → 同时：lv1 左移 lv1ExitShiftPx 后隐藏；lv2 显示并移到屏幕中心。
     */
    private runLv1ToLv2Transition(): void {
        if (this._lv1ToLv2Done || this._lv1ToLv2TransitionRunning) {
            return;
        }
        const lv1Nd = this.node.getChildByName("lv1");
        const lv2Nd = this.node.getChildByName("lv2");
        if (!lv1Nd || !lv2Nd || !cc.isValid(lv1Nd) || !cc.isValid(lv2Nd)) {
            cc.warn("[tz_lv440] lv1→lv2 转场缺少节点");
            return;
        }
        this._lv1ToLv2TransitionRunning = true;
        GameData.PauseGame = true;

        cc.Tween.stopAllByTarget(lv1Nd);
        cc.Tween.stopAllByTarget(lv2Nd);
        const gou = this._gouNd;
        if (gou && cc.isValid(gou)) {
            cc.Tween.stopAllByTarget(gou);
        }

        const slideEase = { easing: "sineInOut" };
        const dur = this.layerSlideDuration > 0.05 ? this.layerSlideDuration : 0.05;
        const shift = Math.max(0, this.lv1ExitShiftPx);
        const centerLocal = this.getScreenCenterInLevelLocal();

        const finishTransition = (): void => {
            this._lv1ToLv2TransitionRunning = false;
            this._lv1ToLv2Done = true;
            GameData.PauseGame = false;
            this._levelTimeRemaining = Math.max(0, Math.floor(this.levelTimeSeconds));
            this.refreshLevelTimeLabel();
        };

        const runSlide = (): void => {
            lv2Nd.active = true;
            const x1 = lv1Nd.x - shift;
            let done = 0;
            const onOneDone = (): void => {
                done++;
                if (done >= 2) {
                    finishTransition();
                }
            };
            cc.tween(lv1Nd)
                .to(dur, { x: x1, y: lv1Nd.y }, slideEase)
                .call(() => {
                    if (lv1Nd && cc.isValid(lv1Nd)) {
                        lv1Nd.active = false;
                    }
                    onOneDone();
                })
                .start();
            cc.tween(lv2Nd)
                .to(dur, { x: centerLocal.x, y: centerLocal.y }, slideEase)
                .call(onOneDone)
                .start();
        };

        if (gou && cc.isValid(gou)) {
            gou.active = true;
            gou.scale = 0;
            gou.setSiblingIndex(this.node.childrenCount - 1);
            AudioManager.playEffect("小关通关440");
            cc.tween(gou)
                .to(0.28, { scale: 1 }, cc.easeBackOut())
                .delay(0.35)
                .call(() => {
                    gou.active = false;
                    gou.scale = 0;
                    runSlide();
                })
                .start();
        } else {
            AudioManager.playEffect("小关通关440");
            runSlide();
        }
    }

    /**
     * 遍历 tzarea 下每个槽位：若有 mask2 + 槽上 PolygonCollider，则按 lv14 方式绘多边形遮罩。
     */
    private applyAllSlotsMask2PolygonStencils(): void {
        for (let li = 0; li < tz_lv440.STICKER_LAYER_ROOT_NAMES.length; li++) {
            const layer = this.node.getChildByName(tz_lv440.STICKER_LAYER_ROOT_NAMES[li]);
            const tzarea = layer ? layer.getChildByName("tzarea") : null;
            if (!tzarea || !cc.isValid(tzarea)) {
                continue;
            }
            for (let i = 0; i < tzarea.children.length; i++) {
                const slot = tzarea.children[i];
                if (!slot || !cc.isValid(slot)) {
                    continue;
                }
                this.applyMask2PolygonStencilForSlot(slot);
            }
        }
    }

    /**
     * 参考 lv14/qglv_2：用 Mask 内置 _graphics 按多边形绘制裁剪区域。
     * 槽根节点上的 PolygonCollider 顶点（含 offset）→ 目标 mask 节点本地坐标。
     */
    private applyMask2PolygonStencilForSlot(slotRoot: cc.Node): void {
        let poly = slotRoot.getComponent(cc.PolygonCollider);
        if (!poly) {
            poly = slotRoot.getComponentInChildren(cc.PolygonCollider);
        }
        if (!poly) {
            return;
        }

        const mask2 = slotRoot.getChildByName("mask2");
        if (mask2 && cc.isValid(mask2)) {
            this.applyPolygonStencilToMaskNode(slotRoot, poly, mask2);
        }
    }

    private applyPolygonStencilToMaskNode(slotRoot: cc.Node, poly: cc.PolygonCollider, maskNode: cc.Node): void {
        const mask = maskNode.getComponent(cc.Mask);
        if (!mask) {
            return;
        }

        mask.type = cc.Mask.Type.RECT;
        const g = (mask as any)["_graphics"] as cc.Graphics;
        if (!g) {
            return;
        }

        const pts = poly.points;
        if (!pts || pts.length < 3) {
            return;
        }

        const ox = poly.offset ? poly.offset.x : 0;
        const oy = poly.offset ? poly.offset.y : 0;

        const toMaskLocal = (p: cc.Vec2): cc.Vec2 => {
            const w = slotRoot.convertToWorldSpaceAR(cc.v2(p.x + ox, p.y + oy));
            return maskNode.convertToNodeSpaceAR(w);
        };

        // 注意：mask.type setter 已触发过一次 _updateGraphics（按 contentSize 画了 RECT），
        // 这里清空后再画多边形即可成为真正的 stencil；不要再手动调用 _updateGraphics，
        // 否则会被 contentSize 矩形覆盖。同样，运行时也不要再改 mask 节点的 contentSize/anchor，
        // 任何 SIZE_CHANGED / ANCHOR_CHANGED 都会让 Mask 自动重绘 rect，把多边形清掉。
        g.clear();
        const last = toMaskLocal(pts[pts.length - 1]);
        g.moveTo(last.x, last.y);
        for (let i = 0; i < pts.length; i++) {
            const lp = toMaskLocal(pts[i]);
            g.lineTo(lp.x, lp.y);
        }
        g.close();
        g.stroke();
        g.fill();
    }

    /** 单块贴对后由 moveitem_lv440 调用（在揭晓 FX 完成之后） */
    onStickerPlaced(): void {
        this.stickerPlaced++;
        if (this.stickerPlaced >= this.stickerTotal && this.stickerTotal > 0) {
            this.gameWin();
        }
    }

    /** 与 onStickerPlaced 同帧先调用：统计层进度，触发 lv1→lv2 转场 */
    onStickerLayerPiecePlaced(layerRootName: string): void {
        const key = layerRootName || "lv1";
        this._placedPerLayer[key] = (this._placedPerLayer[key] || 0) + 1;
        const lv1Total = this._stickersPerLayer["lv1"] || 0;
        const lv2Total = this._stickersPerLayer["lv2"] || 0;
        const lv1Placed = this._placedPerLayer["lv1"] || 0;
        if (lv1Total > 0 && lv2Total > 0 && key === "lv1" && lv1Placed >= lv1Total) {
            this.scheduleOnce(() => this.runLv1ToLv2Transition(), 0);
        }
    }

    private gameWin(): void {
        this.unschedule(this.onLevelTimeTick);
        GameData.PauseGame = true;
        this.scheduleOnce(() => {
            this.endwin("prefabs/zc/zc_winend");
            if (!(GameData as any).isNew) {
                // this.scheduleOnce(() => {
                this.node.destroy();
                // }, 2);
            }

        }, 0.5);
    }

    /**
     * 贴中揭晓：mask 高度收至 0；mask2 下 sk「fanye」→ 槽下 quansk「quan」→ 「绿光_tex」y 缓动到 180 → mask2/lv_sk「光」；
     * 缺组件则跳过对应段（与槽位名无关）。
     */
    runStickerRevealFxIfNeeded(slot: cc.Node | null, onComplete: () => void): void {
        const doneNow = (): void => {
            this.scheduleOnce(() => {
                onComplete();
            }, 0);
        };

        if (!slot || !cc.isValid(slot)) {
            doneNow();
            return;
        }

        // 槽位刚从 active=false 切到 true，Mask.onEnable 会自动用 contentSize 重画矩形，
        // 把 start() 里画好的多边形 stencil 覆盖掉，这里必须重新画一次。
        this.applyMask2PolygonStencilForSlot(slot);

        const maskNd = this.findDeepChild(slot, "mask");
        const mask2 = this.findDeepChild(slot, "mask2");
        let skNd: cc.Node = null;
        if (mask2 && cc.isValid(mask2)) {
            skNd = mask2.getChildByName("sk")
                || mask2.getChildByName("贴纸特效_ske")
                || (mask2.childrenCount > 0 ? mask2.children[0] : null);
        }
        const ske = skNd ? skNd.getComponent(dragonBones.ArmatureDisplay) : null;

        let latch = 0;

        const tryDoneOne = (): void => {
            latch--;
            if (latch <= 0) {
                onComplete();
            }
        };

        if (maskNd && cc.isValid(maskNd)) {
            latch++;
            this.scheduleMaskHeightShrink(maskNd, 0, this.sticker03MaskShrinkSec, tryDoneOne);
        }

        const afterSkOrSkip = (): void => {
            this.playQuanThenLvSk(slot, mask2, tryDoneOne);
        };

        if (ske && cc.isValid(ske.node)) {
            latch++;
            let skEnd = false;
            const onSkFinished = (): void => {
                if (skEnd) {
                    return;
                }
                skEnd = true;
                afterSkOrSkip();
            };

            const arm = ske as dragonBones.ArmatureDisplay;
            this.addOneTimeListener(arm, () => onSkFinished(), dragonBones.EventObject.COMPLETE);
            this.scheduleOnce(() => onSkFinished(), 3);
            ske.playAnimation("fanye", 1);
        } else {
            latch++;
            afterSkOrSkip();
        }

        if (latch <= 0) {
            doneNow();
        }
    }

    /**
     * sk 播完后：quansk「quan」→ mask2「绿光_tex」y 缓动到 180 → lv_sk「光」，最后 latch 回调。
     */
    private playQuanThenLvSk(slot: cc.Node, mask2: cc.Node | null, doneOnceParent: () => void): void {
        let settled = false;
        const allDone = (): void => {
            if (settled) {
                return;
            }
            settled = true;
            doneOnceParent();
        };

        const quanskNd = slot.getChildByName("quansk") || this.findDeepChild(slot, "quansk");
        const quanArm = quanskNd ? quanskNd.getComponent(dragonBones.ArmatureDisplay) : null;

        const lvNd = mask2 && cc.isValid(mask2)
            ? (mask2.getChildByName("lv_sk") || this.findDeepChild(mask2, "lv_sk"))
            : null;
        const lvArm = lvNd ? lvNd.getComponent(dragonBones.ArmatureDisplay) : null;

        const playLight = (): void => {
            if (lvNd && lvArm && cc.isValid(lvNd)) {
                lvNd.active = true;
                lvArm.playTimes = 1;
                lvArm.playAnimation("光", 1);
                let lightDone = false;
                const finishLight = (): void => {
                    if (lightDone) {
                        return;
                    }
                    lightDone = true;
                    allDone();
                };
                this.addOneTimeListener(lvArm as dragonBones.ArmatureDisplay, () => finishLight(), dragonBones.EventObject.COMPLETE);
                this.scheduleOnce(() => finishLight(), 3);
            } else {
                allDone();
            }
        };

        const tweenGreenTexThenLight = (): void => {
            const greenNd = mask2 && cc.isValid(mask2)
                ? (mask2.getChildByName("绿光_tex") || this.findDeepChild(mask2, "绿光_tex"))
                : null;
            if (greenNd && cc.isValid(greenNd)) {
                cc.Tween.stopAllByTarget(greenNd);
                cc.tween(greenNd)
                    .to(this.greenLightTexTweenSec, { y: 180 })
                    .call(() => {
                        playLight();
                    })
                    .start();
            } else {
                playLight();
            }
        };

        if (quanskNd && quanArm && cc.isValid(quanskNd)) {
            quanskNd.active = true;
            quanArm.playAnimation("quan", 1);
            let quanDone = false;
            const afterQuan = (): void => {
                if (quanDone) {
                    return;
                }
                quanDone = true;
                tweenGreenTexThenLight();
            };
            this.addOneTimeListener(quanArm as dragonBones.ArmatureDisplay, () => afterQuan(), dragonBones.EventObject.COMPLETE);
            this.scheduleOnce(() => afterQuan(), 3);
        } else {
            playLight();
        }
    }

    private findDeepChild(root: cc.Node, nameStr: string): cc.Node | null {
        const stack: cc.Node[] = [];
        for (let i = 0; i < root.children.length; i++) {
            stack.push(root.children[i]);
        }

        while (stack.length > 0) {
            const n = stack.pop();
            if (!n || !cc.isValid(n)) {
                continue;
            }

            if (n.name === nameStr) {
                return n;
            }

            for (let j = 0; j < n.children.length; j++) {
                stack.push(n.children[j]);
            }
        }

        return null;
    }

    /** linear 收窄 height（contentSize），保持 width */
    private scheduleMaskHeightShrink(nd: cc.Node, targetH: number, dur: number, onDone: () => void): void {
        const cw = nd.getContentSize();
        const w = cw.width;
        const startH = Math.max(0, cw.height);
        const clampedDur = dur > 0.02 ? dur : 0.02;

        let t = 0;
        const tick = (): void => {
            if (!nd || !cc.isValid(nd)) {
                this.unschedule(tick);
                onDone();
                return;
            }
            t += cc.director.getDeltaTime();
            const r = Math.min(1, t / clampedDur);
            const curH = startH * (1 - r) + targetH * r;
            nd.setContentSize(w, curH);
            if (r >= 1) {
                this.unschedule(tick);
                onDone();
            }
        };
        this.schedule(tick, 0);
    }

    /** 底部托盘项与 tzarea 槽位同名规则：有子节点时取首子节点名（bgcopy） */
    private static trayItemPieceName(trayItem: cc.Node): string {
        if (trayItem.childrenCount > 0 && trayItem.children[0]) {
            return trayItem.children[0].name;
        }
        return trayItem.name;
    }

    private findPolygonColliderForSlotRoot(slotRoot: cc.Node): cc.PolygonCollider | null {
        let poly = slotRoot.getComponent(cc.PolygonCollider);
        if (!poly) {
            poly = slotRoot.getComponentInChildren(cc.PolygonCollider);
        }
        return poly && cc.isValid(poly) ? poly : null;
    }

    private stopSz3FingerGuide(): void {
        const sz3 = this.node.getChildByName("sz3");
        if (sz3 && cc.isValid(sz3)) {
            cc.Tween.stopAllByTarget(sz3);
            sz3.active = false;
        }
    }

    private rememberHintBreathBase(nd: cc.Node): { x: number; y: number } {
        const b = { x: nd.scaleX, y: nd.scaleY };
        this._hintBreathScaleSnap[nd.uuid] = b;
        return b;
    }

    private restoreHintBreathVisual(nd: cc.Node | null): void {
        if (!nd || !cc.isValid(nd)) {
            return;
        }
        cc.Tween.stopAllByTarget(nd);
        const snap = this._hintBreathScaleSnap[nd.uuid];
        if (snap) {
            nd.scaleX = snap.x;
            nd.scaleY = snap.y;
            delete this._hintBreathScaleSnap[nd.uuid];
        }
        nd.opacity = 255;
    }

    /** 停止提示缩放呼吸，还原可能残留的缩放 */
    private stopHintBlinkTweens(): void {
        this.restoreHintBreathVisual(this.node.getChildByName("lvquanTips"));
        this.restoreHintBreathVisual(this.node.getChildByName("paintNode"));
    }

    /** 对单节点做相对基准的均匀缩放呼吸循环 */
    private startScaleBreathOnNode(nd: cc.Node | null): void {
        if (!nd || !cc.isValid(nd)) {
            return;
        }
        cc.Tween.stopAllByTarget(nd);
        const base = this.rememberHintBreathBase(nd);
        const halfRaw = this.hintBlinkHalfSec;
        const half = halfRaw >= 0.25 ? halfRaw : 0.25;
        let d = Number(this.hintBreathScaleDelta) || 0;
        if (d < 0) {
            d = 0;
        }
        if (d > 0.35) {
            d = 0.35;
        }
        const k = 1 + d;
        const maxX = base.x * k;
        const maxY = base.y * k;
        const ease = "cubicInOut";
        nd.scaleX = base.x;
        nd.scaleY = base.y;
        nd.opacity = 255;
        cc.tween(nd)
            .repeatForever(
                cc
                    .tween()
                    .to(half, { scaleX: maxX, scaleY: maxY }, { easing: ease })
                    .to(half, { scaleX: base.x, scaleY: base.y }, { easing: ease })
            )
            .start();
    }

    /** 停止首片新手引导缩放呼吸 */
    private stopNewbieGuideFirstPieceBlink(): void {
        this.restoreHintBreathVisual(this._newbieGuideBlinkNode);
        this._newbieGuideBlinkNode = null;
    }

    /** 开局新手引导：用户触摸当前高亮的托盘首片时，收起手指/轮廓/首片缩放呼吸 */
    tryClearNewbieGuideOnTouch(trayItemNode: cc.Node): boolean {
        if (!this._newbieEntryGuideActive) {
            return false;
        }
        if (!this._newbieGuideBlinkNode || !cc.isValid(this._newbieGuideBlinkNode) || trayItemNode !== this._newbieGuideBlinkNode) {
            return false;
        }
        this._newbieEntryGuideActive = false;
        this.stopNewbieGuideFirstPieceBlink();
        this.stopSz3FingerGuide();
        this.stopHintBlinkTweens();
        const paintNode = this.node.getChildByName("paintNode");
        if (paintNode && cc.isValid(paintNode)) {
            const gr = paintNode.getComponent(cc.Graphics);
            if (gr) {
                gr.clear();
            }
            paintNode.active = false;
        }
        const lvquanTips = this.node.getChildByName("lvquanTips");
        if (lvquanTips && cc.isValid(lvquanTips)) {
            lvquanTips.active = false;
        }
        return true;
    }

    /**
     * 首个待贴碎片与同层槽位（用于提示 / 手指），找到时会把该层托盘滚到表头。
     */
    private findFirstTrayHintContext(): {
        firstPiece: cc.Node;
        tzarea: cc.Node;
        alignNode: cc.Node;
        slot: cc.Node | null;
    } | null {
        let firstPiece: cc.Node = null;
        let tzarea: cc.Node = null;
        let trayScroll: cc.ScrollView = null;
        for (let li = 0; li < tz_lv440.STICKER_LAYER_ROOT_NAMES.length; li++) {
            const layer = this.node.getChildByName(tz_lv440.STICKER_LAYER_ROOT_NAMES[li]);
            if (!layer || !cc.isValid(layer) || !layer.active) {
                continue;
            }
            const botton = layer.getChildByName("botton");
            const viewNd = botton ? botton.getChildByName("view") : null;
            const contentNd = viewNd ? viewNd.getChildByName("content") : null;
            const ta = layer.getChildByName("tzarea");
            const scrollComp = botton ? botton.getComponent(cc.ScrollView) : null;
            if (!contentNd || !ta || !cc.isValid(ta)) {
                continue;
            }
            for (let i = 0; i < contentNd.children.length; i++) {
                const ch = contentNd.children[i];
                if (ch && cc.isValid(ch) && ch.active) {
                    firstPiece = ch;
                    tzarea = ta;
                    trayScroll = scrollComp;
                    break;
                }
            }
            if (firstPiece) {
                break;
            }
        }
        if (!firstPiece || !tzarea) {
            return null;
        }
        this.scrollTrayToHead(trayScroll);
        const alignNode = firstPiece.childrenCount > 0 ? firstPiece.children[0] : firstPiece;
        const pieceName = tz_lv440.trayItemPieceName(firstPiece);
        const slot = tzarea.getChildByName(pieceName);
        return {
            firstPiece,
            tzarea,
            alignNode,
            slot: slot && cc.isValid(slot) ? slot : null,
        };
    }

    /** 手指：碎片 → 槽位缓动 → 槽位停顿 → 瞬回碎片，循环 */
    private startSz3FingerGuide(alignNode: cc.Node, slot: cc.Node | null): void {
        this.stopSz3FingerGuide();
        if (!alignNode || !cc.isValid(alignNode) || !slot || !cc.isValid(slot)) {
            return;
        }
        const sz3 = this.node.getChildByName("sz3");
        if (!sz3 || !cc.isValid(sz3)) {
            return;
        }
        const parentNd = sz3.parent;
        if (!parentNd) {
            return;
        }
        const wA = alignNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const wB = slot.convertToWorldSpaceAR(cc.v2(0, 0));
        const p1 = parentNd.convertToNodeSpaceAR(wA);
        const p2 = parentNd.convertToNodeSpaceAR(wB);
        sz3.setPosition(p1.x, p1.y);
        sz3.active = true;
        sz3.setSiblingIndex(parentNd.childrenCount - 1);
        const leg = this.sz3FingerLegDuration > 0.05 ? this.sz3FingerLegDuration : 0.05;
        const pause = Math.max(0, this.sz3FingerPauseAtSlotSec);
        cc.tween(sz3)
            .repeatForever(
                cc
                    .tween()
                    .to(leg, { x: p2.x, y: p2.y }, { easing: "sineInOut" })
                    .delay(pause)
                    .call(() => {
                        sz3.setPosition(p1.x, p1.y);
                    })
            )
            .start();
    }

    /** 提示前将托盘滚回表头，便于看到第一个碎片 */
    private scrollTrayToHead(scroll: cc.ScrollView | null): void {
        if (!scroll || !cc.isValid(scroll)) {
            return;
        }
        scroll.stopAutoScroll();
        const t = 0;
        if (scroll.horizontal) {
            scroll.scrollToPercentHorizontal(0, t);
        }
        if (scroll.vertical) {
            scroll.scrollToPercentVertical(1, t);
        }
    }

    /** 提示 / 新手引导统一流程：不显示 lvquanTips，仅首片缩放呼吸 + 轮廓 + 手指 */
    private showLvquanTipsOutlineHint(): void {
        this.stopSz3FingerGuide();
        this.stopHintBlinkTweens();
        this.stopNewbieGuideFirstPieceBlink();

        const lvquanTips = this.node.getChildByName("lvquanTips");
        const paintNode = this.node.getChildByName("paintNode");
        if (!lvquanTips || !paintNode) {
            cc.warn("[tz_lv440] 提示：缺少 lvquanTips/paintNode");
            return;
        }

        const ctx = this.findFirstTrayHintContext();
        if (!ctx) {
            this.hideLvquanTipsOutlineHint();
            return;
        }

        const { firstPiece, alignNode, slot } = ctx;

        const poly = slot && cc.isValid(slot) ? this.findPolygonColliderForSlotRoot(slot) : null;
        const g = paintNode.getComponent(cc.Graphics);
        if (!g || !cc.isValid(g)) {
            cc.warn("[tz_lv440] paintNode 上缺少 Graphics");
            return;
        }

        lvquanTips.active = false;

        const applyHintBlinkAndFinger = (): void => {
            this._newbieEntryGuideActive = true;
            this._newbieGuideBlinkNode = firstPiece;
            this.startScaleBreathOnNode(firstPiece);
            this.startSz3FingerGuide(alignNode, slot);
        };

        g.clear();
        if (!poly || !poly.points || poly.points.length < 3 || !slot) {
            paintNode.active = true;
            applyHintBlinkAndFinger();
            return;
        }

        paintNode.active = true;
        paintNode.setSiblingIndex(paintNode.parent.childrenCount - 1);

        const ox = poly.offset ? poly.offset.x : 0;
        const oy = poly.offset ? poly.offset.y : 0;
        const pts = poly.points;
        const locs: cc.Vec2[] = [];
        const polyNode = poly.node;
        for (let i = 0; i < pts.length; i++) {
            const w = polyNode.convertToWorldSpaceAR(cc.v2(pts[i].x + ox, pts[i].y + oy));
            locs.push(paintNode.convertToNodeSpaceAR(w));
        }

        const last = locs[locs.length - 1];
        g.moveTo(last.x, last.y);
        for (let i = 0; i < locs.length; i++) {
            const L = locs[i];
            g.lineTo(L.x, L.y);
        }
        g.close();
        g.stroke();

        applyHintBlinkAndFinger();
    }

    hideLvquanTipsOutlineHint(): void {
        this._newbieEntryGuideActive = false;
        this.stopNewbieGuideFirstPieceBlink();
        this.stopSz3FingerGuide();
        this.stopHintBlinkTweens();
        const lvquanTips = this.node.getChildByName("lvquanTips");
        const paintNode = this.node.getChildByName("paintNode");
        if (lvquanTips && cc.isValid(lvquanTips)) {
            lvquanTips.active = false;
        }
        if (paintNode && cc.isValid(paintNode)) {
            const gr = paintNode.getComponent(cc.Graphics);
            if (gr) {
                gr.clear();
            }
            paintNode.active = false;
        }
    }

    protected onDestroy(): void {
        this.unschedule(this.onLevelTimeTick);
        const gou = this._gouNd;
        if (gou && cc.isValid(gou)) {
            cc.Tween.stopAllByTarget(gou);
        }
        const lv1Nd = this.node.getChildByName("lv1");
        const lv2Nd = this.node.getChildByName("lv2");
        if (lv1Nd && cc.isValid(lv1Nd)) {
            cc.Tween.stopAllByTarget(lv1Nd);
        }
        if (lv2Nd && cc.isValid(lv2Nd)) {
            cc.Tween.stopAllByTarget(lv2Nd);
        }
        this.stopSz3FingerGuide();
        this.stopHintBlinkTweens();
        this.stopNewbieGuideFirstPieceBlink();
        this._newbieEntryGuideActive = false;
        super.onDestroy();
    }



    /** 预制体 Button 序列化占位；玩法请在子类覆写或改用独立组件。 */
    BtnContor(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (GameData.PauseGame === true) {
            return;
        }

        switch (event.currentTarget.name) {

            case "fanhui":
                this.openpausePanel();
                break;

            case "jiashi":
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(60);
                });
                break;

            case "tishi": {
                const openTips = () => {
                    VideoManager.getInstance().showInsert();
                    const panel = this.node.getChildByName("tipsPanel");
                    if (panel) {
                        panel.active = true;
                        const tipNd = panel.getChildByName("tipslabel");
                        const lab = tipNd ? tipNd.getComponent(cc.Label) : null;
                        if (lab) {
                            lab.string = "正确答案："
                        }
                    }
                    this.showLvquanTipsOutlineHint();
                };
                this.isshowVideo ? openTips() : VideoManager.getInstance().showVideo(openTips);
                break;
            }

            case "X":
                (event.currentTarget as cc.Node).parent.active = false;
                this.hideLvquanTipsOutlineHint();
                break;
            default:
                break;
        }
    }
}
