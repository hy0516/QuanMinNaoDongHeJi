import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

interface Lv443Prize {
    id: string;
    weight: number;
    centerAngle: number;
    sfx: string;
}

interface Lv443Role {
    id: string;
    ske: string;
    enterSfx: string;
}

type SpinState = "idle" | "spinning" | "stopping" | "showingResult";

const LV443_PRIZES: Lv443Prize[] = [
    { id: "14", weight: 1, centerAngle: 0, sfx: "奖品-陀螺" },
    { id: "11", weight: 1, centerAngle: -38, sfx: "奖品-咕咕嘎嘎" },
    { id: "9", weight: 1, centerAngle: -84, sfx: "奖品-大金劳" },
    { id: "10", weight: 1, centerAngle: -120, sfx: "奖品-手机" },
    { id: "13", weight: 1, centerAngle: -160, sfx: "奖品-奔奔" },
    { id: "0", weight: 93, centerAngle: -220, sfx: "奖品-没中" },
    { id: "12", weight: 1, centerAngle: -260, sfx: "奖品-练功券" },
    { id: "15", weight: 1, centerAngle: -308, sfx: "奖品-金条" },
];

const LV443_ROLES: Lv443Role[] = [
    { id: "xnh", ske: "xnh_ske", enterSfx: "人物登场-小男孩" },
    { id: "cdn", ske: "cdn_ske", enterSfx: "人物登场-草地牛" },
    { id: "wc", ske: "wc_ske", enterSfx: "人物登场-威虫" },
    { id: "ddg", ske: "ddg_ske", enterSfx: "人物登场-刀盾" },
    { id: "wxm", ske: "wxm_ske", enterSfx: "人物登场-外星猫" },
    { id: "xjm", ske: "xjm_ske", enterSfx: "人物登场-香蕉猫" },
    { id: "bc", ske: "bc_ske", enterSfx: "人物登场-白菜" },
    { id: "lx", ske: "lx_ske", enterSfx: "人物登场-辣虾登场" },
    { id: "hjf", ske: "hjf_ske", enterSfx: "人物登场-哈机蜂" },
];

const PRIZE_BY_ID: Record<string, Lv443Prize> = {};
for (const p of LV443_PRIZES) {
    PRIZE_BY_ID[p.id] = p;
}

@ccclass
export default class tlgc_lv443 extends BaseGame {
    private static readonly KEY_TUJIAN = "lv443_tujian_unlocked";
    private static readonly KEY_TUJIAN_NEW = "lv443_tujian_has_new";
    private static readonly KEY_TUJIAN_FULL_CLEARED = "lv443_tujian_full_cleared";
    private static readonly TUJIAN_TOTAL_COUNT = 8;
    private static readonly KEY_ROLES = "lv443_roles_unlocked";
    private static readonly KEY_WISH = "lv443_wish_id";

    private static readonly BTN_ENABLED_OPACITY = 255;
    private static readonly BTN_DISABLED_OPACITY = 150;
    private static readonly BTN_ENABLED_SCALE = 1;
    private static readonly BTN_DISABLED_SCALE = 0.95;
    private static readonly BTN_STATE_TWEEN_DURATION = 0.12;

    private static readonly CHANT_SFX = "中奖概率倍高";
    private static readonly STOP_SFX = "停";
    private static readonly GET_POP_SFX = "获奖界面弹出";

    private static readonly SPIN_SPEED = 1500;
    private static readonly DECEL_DURATION = 2.8;
    private static readonly EXTRA_ROUNDS = 5;

    @property(cc.Node)
    zhuanpanPick: cc.Node = null;

    @property(cc.Label)
    startLabel: cc.Label = null;

    @property(cc.Label)
    tujianLabel: cc.Label = null;

    @property(cc.Node)
    roleNode: cc.Node = null;

    @property(cc.Node)
    talkNode: cc.Node = null;

    @property(cc.Label)
    talkLabel: cc.Label = null;

    /** 摊主龙骨：拖根节点下 lb_ske（带 ArmatureDisplay 组件） */
    @property({
        type: dragonBones.ArmatureDisplay,
        displayName: "摊主龙骨(lb_ske)",
    })
    lbStall: dragonBones.ArmatureDisplay = null;

    private spinState: SpinState = "idle";
    private pickWishPanel: cc.Node = null;
    private tujianNode: cc.Node = null;
    private roleListNode: cc.Node = null;
    private getTipsNode: cc.Node = null;
    private glNode: cc.Node = null;
    private btnStart: cc.Node = null;
    private btnStop: cc.Node = null;
    private talkBg: cc.Node = null;
    private imgHongdian: cc.Node = null;
    private szNode: cc.Node = null;
    private tujianHasNew = false;
    /** 本次抽中后首次凑满图鉴，关闭获奖弹窗时走胜利 */
    private pendingFirstTujianWin = false;

    private unlockedTujian: Set<string> = new Set();
    private unlockedRoles: Set<string> = new Set();
    private currentRoleId = "xnh";
    private spinCount = 0;
    private wishId = "";
    private pickSelectedId = "";
    private roleEnterOnClose = false;
    private decelTween: cc.Tween = null;
    private chantPlaying = false;
    private talkBgRestY = 0;
    private static readonly TALK_SLIDE_OFFSET = 100;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        GameData.recordLevelEnter(GameData.curGameName || "tlgc_lv443");
        this.isGameOver = false;

        this.cacheNodes();
        this.initLbStall();
        this.loadSave();
        this.initPanels();
        this.refreshRoleNode();
        this.refreshRoleList();
        this.refreshTujian();
        this.refreshTujianLabel();
        this.refreshTujianHongdian();
        this.refreshSzGuide();
        this.refreshStartLabel();
        this.bindButtons();
    }

    onDestroy() {
        this.unschedule(this.hideTalkEmpty);
        this.unscheduleAllCallbacks();
        this.stopSpinSchedule();
        if (this.decelTween) {
            this.decelTween.stop();
            this.decelTween = null;
        }
    }

    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        const name = event.currentTarget.name;
        if (name.indexOf("btn_") === 0 || name === "btn_close") {
            this.playButtonSfx();
        }
        switch (name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_start":
                this.onBtnStart();
                break;
            case "btn_stop":
                this.onBtnStop();
                break;
            case "btn_tujian":
                this.openTujian();
                break;
            case "btn_pick":
                this.onBtnPick();
                break;
            case "btn_role":
                this.openRoleList();
                break;
            case "btn_closepick":
                this.closePickPanel();
                break;
            case "btn_lock":
                this.onBtnLockWish();
                break;
            case "btn_closetujian":
                this.closeTujian();
                break;
            case "btn_closeroleNode":
                this.closeRoleList();
                break;
            case "btn_get":
                this.closeGetTips();
                break;
            case "btn_glgs":
                this.openGlNode();
                break;
            case "btn_closegl":
                this.closeGlNode();
                break;
            default:
                break;
        }
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
    }

    openpausePanel() {
        super.openpausePanel();
    }

    public resumeGamePublic() {
        GameData.PauseGame = false;
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[tlgc_lv443] restart 加载 prefab 失败");
                return;
            }
            const ui = cc.instantiate(prefab);
            ui.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }

    fanhui() {
        super.fanhui();
    }

    onwin() {
        if (this.isGameOver) return;
        this.isGameOver = true;
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
            this.endlost("prefabs/zc/zc_lostend");
            if (!(GameData as any).isNew) {
                this.node.destroy();
            }
        }, 1);
    }

    // ---------- 节点与按钮 ----------

    private cacheNodes() {
        const zp = this.node.getChildByName("zhuanpanNode");
        if (!this.zhuanpanPick && zp) {
            this.zhuanpanPick = zp.getChildByName("pickNode");
        }
        this.pickWishPanel = this.node.getChildByName("pickNode");
        this.tujianNode = this.node.getChildByName("tujianNode");
        this.roleListNode = this.node.getChildByName("roleListNode");
        this.getTipsNode = this.node.getChildByName("getTipsNode");
        this.glNode = this.node.getChildByName("glNode");
        this.btnStart = this.node.getChildByName("btn_start");
        this.btnStop = this.node.getChildByName("btn_stop");
        if (!this.roleNode) {
            this.roleNode = this.node.getChildByName("roleNode");
        }
        if (!this.talkNode) {
            this.talkNode = this.node.getChildByName("talkNode");
        }
        if (this.talkNode) {
            this.talkBg = this.talkNode.getChildByName("bg");
            if (this.talkBg) {
                this.talkBgRestY = this.talkBg.y;
            }
            if (!this.talkLabel && this.talkBg) {
                const lb = this.talkBg.getChildByName("talkLabel");
                if (lb) this.talkLabel = lb.getComponent(cc.Label);
            }
        }
        if (!this.startLabel && this.btnStart) {
            const sl = this.btnStart.getChildByName("startLabel");
            if (sl) this.startLabel = sl.getComponent(cc.Label);
        }
        const btnTj = this.node.getChildByName("btn_tujian");
        if (btnTj) {
            if (!this.tujianLabel) {
                const lb = btnTj.getChildByName("tujianLabel");
                if (lb) this.tujianLabel = lb.getComponent(cc.Label);
            }
            this.imgHongdian = btnTj.getChildByName("img_hongdian");
        }
        this.szNode = this.node.getChildByName("szNode");
    }

    private bindButtons() {
        const rootBtns = ["btn_start", "btn_stop", "btn_tujian", "btn_pick", "btn_role", "btn_glgs"];
        for (const n of rootBtns) {
            this.wireBtn(this.node.getChildByName(n));
        }
        this.bindPanelButtons();
        this.bindPickItems();
        this.bindRoleItems();
    }

    /** 弹窗内关闭/确认按钮在 showNode 下，不能只在根节点 getChildByName */
    private bindPanelButtons() {
        const pickShow = this.pickWishPanel?.getChildByName("showNode");
        if (pickShow) {
            this.wirePanelBtn(pickShow.getChildByName("btn_closepick"));
            this.wirePanelBtn(pickShow.getChildByName("btn_lock"));
        }
        const tujianShow = this.tujianNode?.getChildByName("showNode");
        if (tujianShow) {
            this.wirePanelBtn(tujianShow.getChildByName("btn_closetujian"));
        }
        const roleShow = this.roleListNode?.getChildByName("showNode");
        if (roleShow) {
            this.wirePanelBtn(roleShow.getChildByName("btn_closeroleNode"));
        }
        const tipsShow = this.getTipsNode?.getChildByName("showNode");
        if (tipsShow) {
            this.wirePanelBtn(tipsShow.getChildByName("btn_get"));
        }
        const glShow = this.glNode?.getChildByName("showNode");
        if (glShow) {
            this.wirePanelBtn(glShow.getChildByName("btn_closegl"));
        }
    }

    private wirePanelBtn(node: cc.Node) {
        if (!node) {
            cc.warn("[tlgc_lv443] 未找到弹窗按钮节点，请检查 showNode 下命名");
            return;
        }
        this.wireBtn(node);
    }

    private wireBtn(node: cc.Node) {
        if (!node) return;
        const btn = node.getComponent(cc.Button);
        if (btn) {
            btn.clickEvents = [];
            const ev = new cc.Component.EventHandler();
            ev.target = this.node;
            ev.component = "tlgc_lv443";
            ev.handler = "BtnHandler";
            btn.clickEvents.push(ev);
        } else {
            node.off(cc.Node.EventType.TOUCH_END, this.onBtnTouchEnd, this);
            node.on(cc.Node.EventType.TOUCH_END, this.onBtnTouchEnd, this);
        }
    }

    private onBtnTouchEnd(e: cc.Event.EventTouch) {
        const node = e.currentTarget as cc.Node;
        if (!node) return;
        this.BtnHandler(e);
    }

    private bindPickItems() {
        const show = this.pickWishPanel?.getChildByName("showNode");
        if (!show) return;
        for (const item of show.children) {
            if (item.name !== "item") continue;
            const btn = item.getComponent(cc.Button);
            if (btn) {
                btn.clickEvents = [];
                const ev = new cc.Component.EventHandler();
                ev.target = this.node;
                ev.component = "tlgc_lv443";
                ev.handler = "onPickItemBtn";
                ev.customEventData = this.getPickItemId(item);
                btn.clickEvents.push(ev);
            } else {
                item.on(cc.Node.EventType.TOUCH_END, () => this.onPickItemClick(item), this);
            }
        }
    }

    onPickItemBtn(_e: cc.Event, custom: string) {
        if (GameData.PauseGame || !this.pickWishPanel?.active) return;
        const show = this.pickWishPanel.getChildByName("showNode");
        const item = show?.children.find(c => c.name === "item" && this.getPickItemId(c) === custom);
        if (item) {
            this.onPickItemClick(item);
        }
    }

    private bindRoleItems() {
        const rolelist = this.roleListNode?.getChildByName("showNode")
            ?.getChildByName("mask")?.getChildByName("rolelist");
        if (!rolelist) return;
        for (const roleNode of rolelist.children) {
            const roleId = roleNode.name;
            if (!LV443_ROLES.some(r => r.id === roleId)) continue;
            roleNode.on(cc.Node.EventType.TOUCH_END, () => this.onRoleItemClick(roleId), this);
        }
    }

    private initPanels() {
        if (this.pickWishPanel) this.pickWishPanel.active = false;
        if (this.tujianNode) this.tujianNode.active = false;
        if (this.roleListNode) this.roleListNode.active = false;
        if (this.getTipsNode) this.getTipsNode.active = false;
        if (this.glNode) this.glNode.active = false;
        if (this.talkNode) this.talkNode.active = false;
        if (this.btnStop) this.btnStop.active = true;
        this.setBtnStartInteractable(true);
        this.setBtnStopInteractable(false);
    }

    // ---------- 存档 ----------

    private loadSave() {
        this.unlockedTujian = new Set(this.loadJson<string[]>(tlgc_lv443.KEY_TUJIAN, []));
        this.unlockedRoles = new Set(this.loadJson<string[]>(tlgc_lv443.KEY_ROLES, ["xnh"]));
        this.currentRoleId = "xnh";
        this.spinCount = 0;
        this.wishId = cc.sys.localStorage.getItem(tlgc_lv443.KEY_WISH) || "";
        this.tujianHasNew = cc.sys.localStorage.getItem(tlgc_lv443.KEY_TUJIAN_NEW) === "1";
        cc.sys.localStorage.removeItem("lv443_current_role");
    }

    private loadJson<T>(key: string, fallback: T): T {
        const raw = cc.sys.localStorage.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw) as T;
        } catch (e) {
            return fallback;
        }
    }

    private saveJson(key: string, data: unknown) {
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    private unlockTujian(id: string) {
        if (!id) return;
        if (this.unlockedTujian.has(id)) return;
        this.unlockedTujian.add(id);
        this.saveJson(tlgc_lv443.KEY_TUJIAN, Array.from(this.unlockedTujian));
        this.setTujianHasNew(true);
        this.checkPendingFirstTujianWin();
    }

    private isTujianFullClearedOnce(): boolean {
        return cc.sys.localStorage.getItem(tlgc_lv443.KEY_TUJIAN_FULL_CLEARED) === "1";
    }

    private markTujianFullClearedOnce() {
        cc.sys.localStorage.setItem(tlgc_lv443.KEY_TUJIAN_FULL_CLEARED, "1");
    }

    /** 首次凑满 8 个图鉴时标记，关闭 getTips 后触发 onwin */
    private checkPendingFirstTujianWin() {
        if (this.isTujianFullClearedOnce()) return;
        if (this.unlockedTujian.size >= tlgc_lv443.TUJIAN_TOTAL_COUNT) {
            this.pendingFirstTujianWin = true;
        }
    }

    private setTujianHasNew(hasNew: boolean) {
        this.tujianHasNew = hasNew;
        cc.sys.localStorage.setItem(tlgc_lv443.KEY_TUJIAN_NEW, hasNew ? "1" : "0");
        this.refreshTujianHongdian();
    }

    private refreshTujianHongdian() {
        if (this.imgHongdian) {
            this.imgHongdian.active = this.tujianHasNew;
        }
    }

    /** 图鉴为 0 时显示新手引导 szNode */
    private refreshSzGuide() {
        if (!this.szNode) return;
        this.szNode.active = this.unlockedTujian.size === 0;
    }

    private hideSzGuide() {
        if (this.szNode) this.szNode.active = false;
    }

    private unlockRole(id: string) {
        this.unlockedRoles.add(id);
        this.saveJson(tlgc_lv443.KEY_ROLES, Array.from(this.unlockedRoles));
    }

    private setCurrentRole(id: string) {
        this.currentRoleId = id;
    }

    private incSpinCount() {
        this.spinCount++;
    }

    private setWish(id: string) {
        this.wishId = id || "";
        cc.sys.localStorage.setItem(tlgc_lv443.KEY_WISH, this.wishId);
    }

    // ---------- 转盘 ----------

    private onBtnStart() {
        if (this.spinState !== "idle" || !this.zhuanpanPick) return;
        this.hideSzGuide();
        this.spinState = "spinning";
        this.setBtnStartInteractable(false);
        this.setBtnStopInteractable(true);
        this.setStartLabelText("转动中");

        this.showTalkStart();
        this.playLbTalk();
        this.chantPlaying = true;
        AudioManager.stopEffect2();
        AudioManager.playEffect(tlgc_lv443.CHANT_SFX, false, () => {
            if (!this.chantPlaying) return;
            this.chantPlaying = false;
            this.playLbIdle();
            if (this.spinState === "spinning") {
                this.beginDecelerate();
            }
        });

        this.schedule(this.spinTick, 0);
    }

    private onBtnStop() {
        if (this.spinState !== "spinning") return;
        this.beginDecelerate();
    }

    private spinTick(dt: number) {
        if (!this.zhuanpanPick || this.spinState !== "spinning") return;
        this.zhuanpanPick.angle -= tlgc_lv443.SPIN_SPEED * dt;
        this.normalizePickAngle();
    }

    private stopSpinSchedule() {
        this.unschedule(this.spinTick);
    }

    private normalizePickAngle() {
        if (!this.zhuanpanPick) return;
        let a = this.zhuanpanPick.angle;
        while (a <= -360) {
            a += 360;
        }
        this.zhuanpanPick.angle = a;
    }

    private beginDecelerate() {
        if (this.spinState !== "spinning" || !this.zhuanpanPick) return;
        this.spinState = "stopping";
        this.stopSpinSchedule();
        this.normalizePickAngle();
        this.setBtnStopInteractable(false);

        this.stopChantSfx();
        this.playLbIdle();
        AudioManager.playEffect(tlgc_lv443.STOP_SFX);

        let targetId: string;
        if (this.wishId) {
            targetId = this.wishId;
            this.setWish("");
        } else {
            targetId = this.pickByWeight();
        }

        const prize = PRIZE_BY_ID[targetId] || PRIZE_BY_ID["0"];
        const jitter = (Math.random() - 0.5) * 20;
        const cur = this.zhuanpanPick.angle;
        let finalAngle = prize.centerAngle + jitter - tlgc_lv443.EXTRA_ROUNDS * 360;
        while (finalAngle > cur) {
            finalAngle -= 360;
        }

        if (this.decelTween) {
            this.decelTween.stop();
        }
        this.decelTween = cc.tween(this.zhuanpanPick)
            .to(tlgc_lv443.DECEL_DURATION, { angle: finalAngle }, { easing: "cubicOut" })
            .call(() => {
                this.decelTween = null;
                this.normalizePickAngle();
                this.onSpinEnd(targetId);
            })
            .start();
    }

    private pickByWeight(): string {
        let r = Math.random() * 100;
        for (const p of LV443_PRIZES) {
            r -= p.weight;
            if (r <= 0) return p.id;
        }
        return "0";
    }

    private onSpinEnd(targetId: string) {
        this.spinState = "showingResult";
        this.incSpinCount();
        this.refreshStartLabel();
        this.setBtnStartInteractable(false);

        const prize = PRIZE_BY_ID[targetId] || PRIZE_BY_ID["0"];

        if (targetId === "0") {
            this.unlockTujian("0");
            this.refreshTujian();
            this.refreshTujianLabel();
            this.showTalkEmptyThenSfx(prize.sfx);
            return;
        }

        const onWinPrize = () => {
            this.unlockTujian(targetId);
            this.refreshTujian();
            this.refreshTujianLabel();
            AudioManager.playEffect(prize.sfx, false, () => {
                this.showGetTips(targetId);
                AudioManager.playEffect(tlgc_lv443.GET_POP_SFX);
            });
        };
        this.slideTalkOut(onWinPrize);
    }

    /** 停掉喊麦（含按钮音误占 effectID 的情况），再播「停」 */
    private stopChantSfx() {
        this.chantPlaying = false;
        AudioManager.stopEffect2();
    }

    /** talk 气泡自下而上弹入 */
    private slideTalkIn() {
        if (!this.talkBg) return;
        cc.Tween.stopAllByTarget(this.talkBg);
        const restY = this.talkBgRestY;
        this.talkBg.y = restY - tlgc_lv443.TALK_SLIDE_OFFSET;
        cc.tween(this.talkBg)
            .to(0.2, { y: restY }, { easing: "quadOut" })
            .start();
    }

    /** talk 气泡向下退场，结束后隐藏并重置位置 */
    private slideTalkOut(onComplete?: () => void) {
        if (!this.talkNode || !this.talkBg || !this.talkNode.active) {
            onComplete?.();
            return;
        }
        cc.Tween.stopAllByTarget(this.talkBg);
        const restY = this.talkBgRestY;
        cc.tween(this.talkBg)
            .to(0.2, { y: restY - tlgc_lv443.TALK_SLIDE_OFFSET }, { easing: "quadIn" })
            .call(() => {
                this.talkNode.active = false;
                this.talkBg.y = restY;
                onComplete?.();
            })
            .start();
    }

    private showTalkStart() {
        if (!this.talkNode) return;
        this.talkNode.active = true;
        if (this.talkLabel) {
            this.talkLabel.string = "摊主正在喊：中奖概率倍儿高，奖品也倍儿好!";
        }
        this.slideTalkIn();
    }

    /** 没中：先出字，再播音效；摊主说话动画随音效，播完切待机 */
    private showTalkEmptyThenSfx(sfxKey: string) {
        if (!this.talkNode) {
            AudioManager.playEffect(sfxKey, false, () => this.finishResult());
            return;
        }
        this.talkNode.active = true;
        if (this.talkLabel) {
            this.talkLabel.string = "完，没中！";
        }
        this.slideTalkIn();
        this.unschedule(this.hideTalkEmpty);
        this.scheduleOnce(this.hideTalkEmpty, 2);

        this.playLbTalk();
        AudioManager.playEffect(sfxKey, false, () => {
            this.playLbIdle();
        });
    }

    private hideTalkEmpty = () => {
        this.slideTalkOut(() => {
            this.playLbIdle();
            this.finishResult();
        });
    };

    private showGetTips(prizeId: string) {
        if (!this.getTipsNode) {
            this.finishResult();
            return;
        }
        this.getTipsNode.active = true;
        const showNode = this.getTipsNode.getChildByName("showNode");
        const wupin = showNode?.getChildByName("wupin");
        if (wupin) {
            for (const c of wupin.children) {
                c.active = c.name === prizeId;
            }
            const icon = wupin.getChildByName(prizeId);
            if (icon) this.jellyPop(icon);
        }
        if (showNode) this.jellyPop(showNode);
    }

    private closeGetTips() {
        if (this.getTipsNode) this.getTipsNode.active = false;
        this.finishResult();
    }

    private finishResult() {
        if (this.pendingFirstTujianWin) {
            this.pendingFirstTujianWin = false;
            this.markTujianFullClearedOnce();
            this.onwin();
            return;
        }
        this.spinState = "idle";
        this.setBtnStartInteractable(true);
        this.setBtnStopInteractable(false);
        this.refreshStartLabel();
    }

    // ---------- 心愿锁定 ----------

    private onBtnPick() {
        if (this.spinState !== "idle") return;
        VideoManager.getInstance().showVideo(() => {
            this.openPickPanel();
        });
    }

    private openPickPanel() {
        if (!this.pickWishPanel) return;
        this.pickWishPanel.active = true;
        this.pickSelectedId = "";
        const show = this.pickWishPanel.getChildByName("showNode");
        if (show) {
            for (const item of show.children) {
                if (item.name !== "item") continue;
                const sel = item.getChildByName("sel");
                if (sel) sel.active = false;
            }
            this.jellyPop(show);
        }
    }

    private closePickPanel() {
        if (this.pickWishPanel) this.pickWishPanel.active = false;
    }

    private getPickItemId(item: cc.Node): string {
        if (item.children.length >= 2) {
            return item.children[1].name;
        }
        for (const c of item.children) {
            if (/^\d+$/.test(c.name)) return c.name;
        }
        return "";
    }

    private playButtonSfx() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
    }

    private onPickItemClick(item: cc.Node) {
        if (GameData.PauseGame || !this.pickWishPanel?.active) return;
        this.playButtonSfx();
        const id = this.getPickItemId(item);
        if (!id) return;
        this.pickSelectedId = id;
        const show = this.pickWishPanel?.getChildByName("showNode");
        if (!show) return;
        for (const child of show.children) {
            if (child.name !== "item") continue;
            const sel = child.getChildByName("sel");
            if (sel) sel.active = this.getPickItemId(child) === id;
        }
    }

    private onBtnLockWish() {
        if (!this.pickSelectedId) return;
        this.setWish(this.pickSelectedId);
        this.closePickPanel();
    }

    // ---------- 图鉴 ----------

    private openTujian() {
        if (!this.tujianNode) return;
        this.setTujianHasNew(false);
        this.tujianNode.active = true;
        this.refreshTujian();
        const show = this.tujianNode.getChildByName("showNode");
        if (show) this.jellyPop(show);
    }

    private closeTujian() {
        if (this.tujianNode) this.tujianNode.active = false;
    }

    // ---------- 概率说明 glNode ----------

    private openGlNode() {
        if (!this.glNode) return;
        this.glNode.active = true;
        const show = this.glNode.getChildByName("showNode");
        if (show) this.jellyPop(show);
    }

    private closeGlNode() {
        if (this.glNode) this.glNode.active = false;
    }

    private refreshTujian() {
        const layout = this.tujianNode?.getChildByName("showNode")
            ?.getChildByName("mask")?.getChildByName("tujianLayout");
        if (!layout) return;

        const rows = layout.children.slice();
        rows.sort((a, b) => {
            const aUnlocked = this.unlockedTujian.has(a.name) ? 0 : 1;
            const bUnlocked = this.unlockedTujian.has(b.name) ? 0 : 1;
            return aUnlocked - bUnlocked;
        });

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            row.setSiblingIndex(i);
            const got = this.unlockedTujian.has(row.name);
            const lock = row.getChildByName("lock");
            const unlock = row.getChildByName("unlock");
            if (lock) lock.active = !got;
            if (unlock) unlock.active = got;
        }

        const layoutComp = layout.getComponent(cc.Layout);
        if (layoutComp) {
            layoutComp.updateLayout();
        }
    }

    private refreshTujianLabel() {
        if (!this.tujianLabel) return;
        this.tujianLabel.string = `${this.unlockedTujian.size}/${tlgc_lv443.TUJIAN_TOTAL_COUNT}`;
    }

    // ---------- 角色 ----------

    private openRoleList() {
        if (!this.roleListNode) return;
        this.roleListNode.active = true;
        this.roleEnterOnClose = false;
        this.refreshRoleList();
        const show = this.roleListNode.getChildByName("showNode");
        if (show) this.jellyPop(show);
    }

    private closeRoleList() {
        if (this.roleListNode) this.roleListNode.active = false;
        if (this.roleEnterOnClose) {
            const role = LV443_ROLES.find(r => r.id === this.currentRoleId);
            if (role) {
                AudioManager.playEffect(role.enterSfx);
            }
            this.roleEnterOnClose = false;
        }
    }

    private refreshRoleList() {
        const rolelist = this.roleListNode?.getChildByName("showNode")
            ?.getChildByName("mask")?.getChildByName("rolelist");
        if (!rolelist) return;
        for (const row of rolelist.children) {
            const roleId = row.name;
            if (!LV443_ROLES.some(r => r.id === roleId)) continue;
            const unlocked = this.unlockedRoles.has(roleId);
            const video = row.getChildByName("video");
            if (video) video.active = !unlocked;
            const sel = row.getChildByName("sel");
            if (sel) sel.active = roleId === this.currentRoleId;
        }
    }

    private onRoleItemClick(roleId: string) {
        if (GameData.PauseGame || !this.roleListNode?.active) return;
        if (!LV443_ROLES.some(r => r.id === roleId)) return;
        this.playButtonSfx();

        const trySelect = () => {
            this.setCurrentRole(roleId);
            this.roleEnterOnClose = true;
            this.refreshRoleList();
            this.refreshRoleNode();
        };

        if (this.unlockedRoles.has(roleId)) {
            trySelect();
            return;
        }

        const row = this.roleListNode?.getChildByName("showNode")
            ?.getChildByName("mask")?.getChildByName("rolelist")?.getChildByName(roleId);
        const video = row?.getChildByName("video");
        if (video && video.active) {
            VideoManager.getInstance().showVideo(() => {
                this.unlockRole(roleId);
                if (video) video.active = false;
                trySelect();
            });
            return;
        }
        trySelect();
    }

    private initLbStall() {
        if (!this.lbStall) {
            const lbNode = this.node.getChildByName("lb_ske");
            if (lbNode) {
                this.lbStall = lbNode.getComponent(dragonBones.ArmatureDisplay);
            }
        }
        this.playLbIdle();
    }

    private playLbTalk() {
        if (!this.lbStall) return;
        this.lbStall.node.active = true;
        this.lbStall.playAnimation("说话", 0);
    }

    private playLbIdle() {
        if (!this.lbStall) return;
        this.lbStall.node.active = true;
        this.lbStall.playAnimation("待机", 0);
    }

    private refreshRoleNode() {
        if (!this.roleNode) return;
        for (const child of this.roleNode.children) {
            if (!child.name.endsWith("_ske")) continue;
            const role = LV443_ROLES.find(r => r.ske === child.name);
            const show = role != null && role.id === this.currentRoleId;
            child.active = show;
            if (show) {
                const arm = child.getComponent(dragonBones.ArmatureDisplay);
                if (arm) arm.playAnimation("待机", 0);
            }
        }
    }

    // ---------- UI 工具 ----------

    private refreshStartLabel() {
        if (!this.startLabel || this.spinState === "spinning") return;
        const texts = ["开始", "再来一把", "我就不信了", "最后一把"];
        if (this.spinCount >= texts.length) {
            this.startLabel.string = "真最后一把";
        } else {
            this.startLabel.string = texts[this.spinCount];
        }
    }

    private setStartLabelText(text: string) {
        if (this.startLabel) this.startLabel.string = text;
    }

    private setSpinBtnState(node: cc.Node, enabled: boolean) {
        if (!node) return;
        const btn = node.getComponent(cc.Button);
        if (btn) btn.interactable = enabled;
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(tlgc_lv443.BTN_STATE_TWEEN_DURATION, {
                opacity: enabled
                    ? tlgc_lv443.BTN_ENABLED_OPACITY
                    : tlgc_lv443.BTN_DISABLED_OPACITY,
                scale: enabled
                    ? tlgc_lv443.BTN_ENABLED_SCALE
                    : tlgc_lv443.BTN_DISABLED_SCALE,
            }, { easing: "sineOut" })
            .start();
    }

    private setBtnStartInteractable(on: boolean) {
        this.setSpinBtnState(this.btnStart, on);
    }

    private setBtnStopInteractable(on: boolean) {
        this.setSpinBtnState(this.btnStop, on);
    }

    private jellyPop(node: cc.Node) {
        if (!node) return;
        node.active = true;
        node.opacity = 255;
        node.scale = 0;
        cc.tween(node)
            .to(0.2, { scale: 1.15 }, { easing: "sineOut" })
            .to(0.1, { scale: 0.92 }, { easing: "sineIn" })
            .to(0.08, { scale: 1.05 }, { easing: "sineOut" })
            .to(0.06, { scale: 1.0 }, { easing: "sineIn" })
            .start();
    }
}
