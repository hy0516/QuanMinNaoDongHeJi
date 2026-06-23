
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass } = cc._decorator;

/** 飘浮块沿矩形路径移动速度（边线弧长/秒，像素） */
const piaoPathEdgeSpeed = 150;
/** 贴关卡根节点内边距，避免 piao 裁切 */
const piaoPathPad = 100;
/** 吸太阳判定半径（与太阳同父节点下的本地坐标，像素量级） */
const piaoToSunAbsorbR = 200;
/** 点击特效 dj_tx 每次随机 Z 轴角度（度），约 ± 本值一半 */
const djTxRandomAngleRange = 56;

@ccclass
export default class tybs_lv406 extends BaseGame {
    private taiYang: cc.Node = null;
    /** 太阳节点初始/静止缩放，每次点击反馈前统一回到该值，避免连点叠加放大 */
    private taiYangBaseScale = 1;
    private taiYangSke: dragonBones.ArmatureDisplay = null;
    private shengJiSk: dragonBones.ArmatureDisplay = null;
    /** 根节点下指导手指，首次点屏后隐藏 */
    private shouZhiSk: dragonBones.ArmatureDisplay = null;
    private shouZhiGuideFirstTouch = true;
    private piaoFu: cc.Node = null;
    private bgSp: cc.Sprite = null;
    private dianJiLb: cc.Label = null;
    private oneNumLb: cc.Label = null;
    private btnWan: cc.Node = null;

    /** 总点击分数：各次「单次分数」之和，dianJiNum 显示；并作为升级、通关判定的依据 */
    private totalTapScore = 0;
    /** 当前显示等级 1–6；特殊形态时龙骨播 ty7；等级由 totalTapScore 门槛决定 */
    private displayLevel = 1;
    private inSpecial = false;
    /** 小太阳 piaoFu 拖入大太阳后仅一次，用后即消失 */
    private piaoFuUsedUp = false;
    /** 拖进太阳后正在等激励结束，此期间不沿路径刷新位置 */
    private piaoVideoPending = false;
    /** 观看激励视频后本局点屏计分均×2，直至关卡结束/重开 */
    private videoDouble = false;

    /** 沿闭合矩形边线行进的弧长参数（0～周长，从底边左角顺时针） */
    private piaoPathS = 0;
    private piaoDragging = false;
    private onWanChengBtn: (e: cc.Event.EventTouch) => void = null;
    private readonly bgFrameCache: Map<number, cc.SpriteFrame> = new Map();
    private djTxPrefab: cc.Prefab = null;
    private boundRootTouch: (e: cc.Event.EventTouch) => void = null;
    private boundPiaoStart: (e: cc.Event.EventTouch) => void = null;
    private boundPiaoMove: (e: cc.Event.EventTouch) => void = null;
    private boundPiaoEnd: (e: cc.Event.EventTouch) => void = null;

    /**
     * 按「总点击分数 totalTapScore」计：达到等级 2～6 的分数底限；[7] 为可点「完成」的最低总分（可与 6 级门槛一致 1500）。
     */
    private readonly minTotalScoreToReachLevel: number[] = [0, 0, 30, 150, 500, 1500, 4000, 4000];
    /** 等级 1～6 的单次分数（计入 totalTapScore；oneNum 显示含视频翻倍） */
    private readonly baseGainByLevel: number[] = [1, 2, 4, 7, 11, 16];

    protected onLoad(): void {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.onInit("lv406/audio_lv406");
        GameData.recordLevelEnter("tybs_lv406");

        this.taiYang = this.node.getChildByName("taiYang");
        if (this.taiYang) {
            this.taiYangBaseScale = this.taiYang.scaleX;
        }
        this.taiYangSke = this.taiYang ? this.taiYang.getComponent(dragonBones.ArmatureDisplay) : null;
        const shengJi = this.node.getChildByName("shengJi_sk");
        this.shengJiSk = shengJi ? shengJi.getComponent(dragonBones.ArmatureDisplay) : null;
        if (shengJi) shengJi.active = false;

        const shouzhi = this.node.getChildByName("shouzhi_sk");
        this.shouZhiSk = shouzhi ? shouzhi.getComponent(dragonBones.ArmatureDisplay) : null;
        if (this.shouZhiSk) {
            this.shouZhiSk.playAnimation("sz", -1);
        }

        this.piaoFu = this.node.getChildByName("piaoFu_ty");
        const bg = this.node.getChildByName("bg");
        this.bgSp = bg ? bg.getComponent(cc.Sprite) : null;
        this.dianJiLb = this.getLabel("dianJiNum");
        this.oneNumLb = this.getLabel("oneNum");
        this.btnWan = this.node.getChildByName("btn_wanCheng");
        if (this.btnWan) {
            this.btnWan.active = false;
            this.onWanChengBtn = (e: cc.Event.EventTouch) => {
                e.stopPropagation();
                if (this.canShowWin()) this.onwin();
            };
            this.btnWan.on(cc.Node.EventType.TOUCH_END, this.onWanChengBtn, this);
        }

        this.syncPiaoPathFromPiaoPos();
        this.loadDjTxPrefab();
        this.bindScreenClick();
        this.bindPiaoDrag();
        this.bindVideoDouble();

        this.applyVisualAndMusic();
        this.refreshNumUi();
        this.scheduleOnce(() => {
            this.applyMusicKey(this.getCurrentMusicKey());
        }, 0.35);
    }

    private loadDjTxPrefab(): void {
        AssetManager.load(AssetManager.BundleName.level, "dj_tx", cc.Prefab, null, (asset: any) => {
            if (asset) this.djTxPrefab = asset;
        });
    }

    private getLabel(name: string): cc.Label {
        const n = this.node.getChildByName(name);
        return n ? n.getComponent(cc.Label) : null;
    }

    /** 满级且总分达标即可点完成；特殊形态下也允许（不再用 inSpecial 禁用） */
    private canShowWin(): boolean {
        return this.displayLevel >= 6 && this.totalTapScore >= this.minTotalScoreToReachLevel[7];
    }

    private bindVideoDouble(): void {
        const b = this.node.getChildByName("btn_videoDouble");
        if (!b) return;
        b.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (GameData.PauseGame) return;
            VideoManager.getInstance().showVideo(() => {
                this.videoDouble = true;
                b.active = false;
                this.refreshNumUi();
            });
        }, this);
    }

    private tryHideShouZhiGuide(): void {
        if (!this.shouZhiGuideFirstTouch) return;
        this.shouZhiGuideFirstTouch = false;
        if (this.shouZhiSk && cc.isValid(this.shouZhiSk.node)) this.shouZhiSk.node.active = false;
    }

    private bindScreenClick(): void {
        this.boundRootTouch = (e: cc.Event.EventTouch) => {
            if (GameData.PauseGame) return;
            this.tryHideShouZhiGuide();
            if (this.piaoDragging) return;
            if (this.isUiHeadForClick(e.target as cc.Node)) return;
            const w = e.getLocation();
            const lp = this.node.convertToNodeSpaceAR(w);
            this.onScreenAddClick(cc.v2(lp.x, lp.y));
        };
        this.node.on(cc.Node.EventType.TOUCH_END, this.boundRootTouch, this, true);
    }

    /** 点 UI/飘浮子节点时不加次数 */
    private isUiHeadForClick(head: cc.Node): boolean {
        let p: cc.Node = head;
        const skip = { fanhui: 1, tishi: 1, x: 1, btn_videoDouble: 1, btn_wanCheng: 1, dianJiNum: 1, oneNum: 1, piaoFu_ty: 1, shengJi_sk: 1 };
        while (p && p !== this.node) {
            if (skip[p.name] != null) return true;
            p = p.parent;
        }
        return false;
    }

    private onScreenAddClick(clickLocal?: cc.Vec2): void {
        this.spawnClickDjAt(clickLocal);
        const gain = this.getClickGain();
        this.totalTapScore += gain;
        AudioManager.playEffect("点击");
        this.pulseTaiYang();
        this.playScoreFloatOnSun(gain);
        const beforeLv = this.displayLevel;
        const beforeSp = this.inSpecial;
        this.recomputeLevelFromTotalScore();
        if (this.displayLevel > beforeLv) {
            if (beforeSp) this.inSpecial = false;
            this.applyVisualAndMusic(true);
        }
        this.refreshNumUi();
        if (this.btnWan) this.btnWan.active = this.canShowWin();
    }

    private getClickGain(): number {
        const g = this.baseGainByLevel[this.displayLevel - 1] != null ? this.baseGainByLevel[this.displayLevel - 1] : 1;
        return g * (this.videoDouble ? 2 : 1);
    }

    /** 根据当前总点击分数定等级 */
    private recomputeLevelFromTotalScore(): void {
        let L = 1;
        for (let lv = 2; lv <= 6; lv++) {
            if (this.totalTapScore >= this.minTotalScoreToReachLevel[lv]) L = lv;
        }
        this.displayLevel = L;
    }

    /** 在点屏位置播放 dj_tx 预制体，动画结束后销毁 */
    private spawnClickDjAt(clickLocal?: cc.Vec2): void {
        if (!clickLocal) return;
        const run = (pf: cc.Prefab) => {
            const n = cc.instantiate(pf);
            n.parent = this.node;
            n.setPosition(clickLocal.x, clickLocal.y);
            n.angle = (Math.random() - 0.5) * djTxRandomAngleRange;
            n.zIndex = 450;
            const arm = n.getComponent(dragonBones.ArmatureDisplay);
            if (arm) {
                arm.playAnimation("djtx", 1);
                this.addOneTimeListener(arm, () => {
                    if (n && cc.isValid(n)) n.destroy();
                });
            } else {
                this.scheduleOnce(() => {
                    if (n && cc.isValid(n)) n.destroy();
                }, 0.6);
            }
        };
        if (this.djTxPrefab) {
            run(this.djTxPrefab);
            return;
        }
        AssetManager.load(AssetManager.BundleName.level, "dj_tx", cc.Prefab, null, (asset: any) => {
            if (!asset) return;
            this.djTxPrefab = asset;
            run(this.djTxPrefab);
        });
    }

    private pulseTaiYang(): void {
        if (!this.taiYang) return;
        this.taiYang.stopAllActions();
        const b = this.taiYangBaseScale;
        this.taiYang.setScale(b, b);
        cc.tween(this.taiYang)
            .to(0.08, { scale: b * 1.2 })
            .to(0.05, { scale: b })
            .start();
    }

    /** 太阳上飘字 +N，略随机偏移防重叠 */
    private playScoreFloatOnSun(gain: number): void {
        if (!this.taiYang) return;
        const n = new cc.Node("scoreFloat");
        n.parent = this.taiYang;
        n.zIndex = 200;
        const offX = (Math.random() - 0.5) * 56;
        const offY0 = 160 + Math.random() * 50;
        n.setPosition(offX, offY0);
        const lb = n.addComponent(cc.Label);
        lb.string = "+" + gain;
        lb.fontSize = 38;
        lb.lineHeight = 38;
        lb.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lb.verticalAlign = cc.Label.VerticalAlign.CENTER;
        n.color = cc.color(255, 236, 120);
        n.opacity = 255;
        const out = n.addComponent(cc.LabelOutline);
        out.color = cc.color(120, 70, 0);
        out.width = 3;
        const endX = offX + (Math.random() - 0.5) * 24;
        const endY = offY0 + 100;
        cc.tween(n)
            .to(0.6, { x: endX, y: endY, opacity: 0 })
            .call(() => {
                if (n && cc.isValid(n)) n.destroy();
            })
            .start();
    }

    private getCurrentMusicKey(): string {
        if (this.inSpecial) return "特殊状态";
        const names = ["状态一", "状态二", "状态三", "状态四", "状态五", "状态六"];
        const i = Math.min(Math.max(this.displayLevel, 1), 6) - 1;
        return names[i] || "状态一";
    }

    private applyMusicKey(key: string): void {
        AudioManager.playMusic(key, true, 0.8);
    }

    /** @param didLevelUp 是否刚升级（播升级龙骨的 sjtx 一次） */
    private applyVisualAndMusic(didLevelUp: boolean = false): void {
        this.syncTaiYangAnim();
        this.syncBg();
        this.applyMusicKey(this.getCurrentMusicKey());
        this.updatePiaoVisible();
        if (didLevelUp) this.playLevelUpEffect();
        this.refreshNumUi();
        if (this.btnWan) this.btnWan.active = this.canShowWin();
    }

    private syncTaiYangAnim(): void {
        if (!this.taiYangSke) return;
        if (this.inSpecial) {
            this.taiYangSke.playAnimation("ty7", -1);
        } else {
            this.taiYangSke.playAnimation("ty" + this.displayLevel, -1);
        }
    }

    private syncBg(): void {
        if (!this.bgSp) return;
        const bi = this.inSpecial ? 7 : this.displayLevel;
        this.loadBgFrame(bi, (sf) => {
            if (this.bgSp && cc.isValid(this.bgSp) && sf) this.bgSp.spriteFrame = sf;
        });
    }

    private loadBgFrame(levelIdx: number, done: (sf: cc.SpriteFrame) => void): void {
        if (this.bgFrameCache.has(levelIdx)) {
            done(this.bgFrameCache.get(levelIdx));
            return;
        }
        const path = `picture_lv406/bj${levelIdx}`;
        AssetManager.load(AssetManager.BundleName.level, path, cc.SpriteFrame, null, (sf: cc.SpriteFrame) => {
            if (sf) this.bgFrameCache.set(levelIdx, sf);
            done(sf);
        });
    }

    private playLevelUpEffect(): void {
        AudioManager.playEffect("升级");
        if (!this.shengJiSk) return;
        const n = this.shengJiSk.node;
        n.active = true;
        n.stopAllActions();
        this.shengJiSk.playAnimation("sjtx", 1);
        const dur = 35 / 60;
        this.scheduleOnce(() => {
            if (n && cc.isValid(n)) n.active = false;
        }, dur + 0.05);
    }

    private refreshNumUi(): void {
        if (this.dianJiLb) this.dianJiLb.string = String(this.totalTapScore);
        if (this.oneNumLb) this.oneNumLb.string = String(this.getClickGain());
    }

    private updatePiaoVisible(): void {
        if (!this.piaoFu) return;
        const show = this.displayLevel >= 3 && !this.inSpecial && !this.piaoFuUsedUp;
        this.piaoFu.active = show || this.piaoDragging;
    }

    private getPiaoPathRect(): { left: number; right: number; bottom: number; top: number } {
        const w = this.node.width;
        const h = this.node.height;
        const p = piaoPathPad;
        return { left: -w * 0.5 + p, right: w * 0.5 - p, bottom: -h * 0.5 + p, top: h * 0.5 - p };
    }

    private getPiaoPathPerimeter(): number {
        const r = this.getPiaoPathRect();
        const edgeW = r.right - r.left;
        const edgeH = r.top - r.bottom;
        return 2 * (edgeW + edgeH);
    }

    /** 从底边左角顺时针：底→右→顶→左 */
    private positionOnPiaoPath(s: number): cc.Vec2 {
        const r = this.getPiaoPathRect();
        const w = r.right - r.left;
        const h = r.top - r.bottom;
        const L = 2 * (w + h);
        if (L < 1) return cc.v2(0, 0);
        s = ((s % L) + L) % L;
        if (s < w) {
            return cc.v2(r.left + s, r.bottom);
        }
        s -= w;
        if (s < h) {
            return cc.v2(r.right, r.bottom + s);
        }
        s -= h;
        if (s < w) {
            return cc.v2(r.right - s, r.top);
        }
        s -= w;
        return cc.v2(r.left, r.top - s);
    }

    private clampF(v: number, a: number, b: number): number {
        if (a > b) return a;
        return Math.max(a, Math.min(b, v));
    }

    /** 将任意坐标投影到矩形路径上最近一点对应的弧长 s */
    private nearestPathS(x: number, y: number): number {
        const r = this.getPiaoPathRect();
        const w = r.right - r.left;
        const h = r.top - r.bottom;
        let bestD = 1e30;
        let bestS = 0;
        const trySeg = (ds: number, d: number) => {
            if (d < bestD) {
                bestD = d;
                bestS = ds;
            }
        };
        {
            const qx = this.clampF(x, r.left, r.right);
            const d = (x - qx) * (x - qx) + (y - r.bottom) * (y - r.bottom);
            trySeg(qx - r.left, d);
        }
        {
            const qy = this.clampF(y, r.bottom, r.top);
            const d = (x - r.right) * (x - r.right) + (y - qy) * (y - qy);
            trySeg(w + (qy - r.bottom), d);
        }
        {
            const qx = this.clampF(x, r.left, r.right);
            const d = (x - qx) * (x - qx) + (y - r.top) * (y - r.top);
            trySeg(w + h + (r.right - qx), d);
        }
        {
            const qy = this.clampF(y, r.bottom, r.top);
            const d = (x - r.left) * (x - r.left) + (y - qy) * (y - qy);
            trySeg(2 * w + h + (r.top - qy), d);
        }
        return bestS;
    }

    private syncPiaoPathFromPiaoPos(): void {
        if (!this.piaoFu || this.piaoFuUsedUp) return;
        this.piaoPathS = this.nearestPathS(this.piaoFu.x, this.piaoFu.y);
        const pos = this.positionOnPiaoPath(this.piaoPathS);
        this.piaoFu.setPosition(pos);
    }

    private bindPiaoDrag(): void {
        if (!this.piaoFu) return;
        this.boundPiaoStart = (e: cc.Event.EventTouch) => {
            if (GameData.PauseGame) return;
            if (this.piaoFuUsedUp) return;
            if (this.displayLevel < 3 || this.inSpecial) return;
            e.stopPropagation();
            this.piaoDragging = true;
        };
        this.boundPiaoMove = (e: cc.Event.EventTouch) => {
            if (!this.piaoDragging || !this.piaoFu) return;
            e.stopPropagation();
            const w = e.getLocation();
            const p = this.piaoFu.parent;
            const lp = p ? p.convertToNodeSpaceAR(w) : w;
            this.piaoFu.setPosition(lp);
        };
        this.boundPiaoEnd = (e: cc.Event.EventTouch) => {
            if (!this.piaoDragging) return;
            e.stopPropagation();
            this.piaoDragging = false;
            this.tryAbsorbPiao();
            this.updatePiaoVisible();
        };
        this.piaoFu.on(cc.Node.EventType.TOUCH_START, this.boundPiaoStart, this, true);
        this.piaoFu.on(cc.Node.EventType.TOUCH_MOVE, this.boundPiaoMove, this, true);
        this.piaoFu.on(cc.Node.EventType.TOUCH_END, this.boundPiaoEnd, this, true);
        this.piaoFu.on(cc.Node.EventType.TOUCH_CANCEL, this.boundPiaoEnd, this, true);
    }

    private tryAbsorbPiao(): void {
        if (!this.piaoFu || !this.taiYang || this.piaoFuUsedUp) return;
        const dx = this.piaoFu.x - this.taiYang.x;
        const dy = this.piaoFu.y - this.taiYang.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < piaoToSunAbsorbR) {
            this.piaoVideoPending = true;
            VideoManager.getInstance().showVideo(
                () => {
                    this.piaoVideoPending = false;
                    if (!this.node || !cc.isValid(this.node) || this.piaoFuUsedUp) return;
                    this.piaoFuUsedUp = true;
                    if (this.piaoFu && cc.isValid(this.piaoFu)) this.piaoFu.active = false;
                    this.inSpecial = true;
                    this.applyVisualAndMusic();
                    this.playLevelUpEffect();
                },
                () => {
                    this.piaoVideoPending = false;
                    if (!this.node || !cc.isValid(this.node) || this.piaoFuUsedUp) return;
                    this.syncPiaoPathFromPiaoPos();
                    this.updatePiaoVisible();
                }
            );
        } else {
            this.syncPiaoPathFromPiaoPos();
        }
    }

    update(dt: number): void {
        if (GameData.PauseGame) return;
        if (!this.piaoFu || this.piaoFuUsedUp) return;
        if (this.piaoVideoPending) return;
        if (this.piaoDragging) return;
        if (this.displayLevel < 3 || this.inSpecial) return;
        const L = this.getPiaoPathPerimeter();
        if (L < 1) return;
        this.piaoPathS += piaoPathEdgeSpeed * dt;
        this.piaoPathS = ((this.piaoPathS % L) + L) % L;
        this.piaoFu.setPosition(this.positionOnPiaoPath(this.piaoPathS));
    }

    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame === true) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                break;
            case "tishi": {
                const handlers = () => {
                    VideoManager.getInstance().showInsert();
                    const bg = this.node.getChildByName("bg");
                    const tips = bg ? bg.getChildByName("tipsPanel") : null;
                    if (tips) tips.active = true;
                };
                this.isshowVideo ? handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            }
            case "x": {
                const bg = this.node.getChildByName("bg");
                const tips = bg ? bg.getChildByName("tipsPanel") : null;
                if (tips) tips.active = false;
                break;
            }
        }
    }
    isshowVideo = false;
    onwin() {
        GameData.PauseGame = true;
        const koNode = this.node.getChildByName("ko_ske");
        const koArm = koNode ? koNode.getComponent(dragonBones.ArmatureDisplay) : null;
        if (koNode && koArm && cc.isValid(koNode)) {
            koNode.active = true;
            koNode.zIndex = 998;
            AudioManager.playEffect("KO");
            koArm.playAnimation("ko", 1);
            this.addOneTimeListener(koArm, () => {
                if (koNode && cc.isValid(koNode)) koNode.active = false;
                this.endwin("prefabs/zc/zc_winend");
            });
            return;
        }
        this.endwin("prefabs/zc/zc_winend");
    }

    protected onDestroy(): void {
        if (this.boundRootTouch) this.node.off(cc.Node.EventType.TOUCH_END, this.boundRootTouch, this, true);
        if (this.piaoFu) {
            if (this.boundPiaoStart) this.piaoFu.off(cc.Node.EventType.TOUCH_START, this.boundPiaoStart, this, true);
            if (this.boundPiaoMove) this.piaoFu.off(cc.Node.EventType.TOUCH_MOVE, this.boundPiaoMove, this, true);
            if (this.boundPiaoEnd) {
                this.piaoFu.off(cc.Node.EventType.TOUCH_END, this.boundPiaoEnd, this, true);
                this.piaoFu.off(cc.Node.EventType.TOUCH_CANCEL, this.boundPiaoEnd, this, true);
            }
        }
        if (this.btnWan && this.onWanChengBtn) this.btnWan.off(cc.Node.EventType.TOUCH_END, this.onWanChengBtn, this);
        super.onDestroy();
    }
}
