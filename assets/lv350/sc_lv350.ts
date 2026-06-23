import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import BeadPlateCtrl_lv350 from "./BeadPlateCtrl_lv350";
import BeadSlotCtrl_lv350 from "./BeadSlotCtrl_lv350";

const { ccclass, property } = cc._decorator;

@ccclass
export default class sc_lv350 extends BaseGame {

    @property(BeadPlateCtrl_lv350)
    plate: BeadPlateCtrl_lv350 = null;

    @property(BeadSlotCtrl_lv350)
    slotCtrl: BeadSlotCtrl_lv350 = null;

    /** 关卡内下一关 levelKey，格式 style/name 如 lv350/sc_lv350_2，有则进入下一关（走框架逻辑，重玩正确），无则走 onwin */
    @property
    nextLevelKey: string = "";

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => { AudioManager.playMusic("关卡背景_lv350", true, 0.7); }, 0.5);
        this.initBeadGame();
    }

    onDestroy() {
    }

    private resolveRefs() {
        const bg = this.node.getChildByName("bgNode");
        if (!bg) return;
        if (this.plate && !this.plate.panziNode) {
            this.plate.panziNode = bg.getChildByName("panziNode");
        }
        if (this.slotCtrl) {
            if (!this.slotCtrl.slotContainer) this.slotCtrl.slotContainer = bg.getChildByName("daojuSlot");
            if (!this.slotCtrl.plate) this.slotCtrl.plate = this.plate;
        }
    }

    private initBeadGame() {
        this.resolveRefs();
        this.setupBtnVideoCk();
        if (!this.plate || !this.slotCtrl) return;
        if (this.plate.autoComputeRadius && this.slotCtrl.beadPrefabs && this.slotCtrl.beadPrefabs.length > 0) {
            this.plate.computeRadiusFromBeads(this.slotCtrl.beadPrefabs, this.slotCtrl.beadCounts || []);
        }
        this.slotCtrl.init({
            onAllPlaced: () => { },
            onComplete: () => this.doComplete(),
            onRedesign: () => this.doRedesign(),
        });
    }

    private doComplete() {
        if (!this.plate || !this.slotCtrl) return;
        const order = this.plate.getBeadOrder();
        if (order.length === 0) return;
        GameData.PauseGame = true;

        const bg = this.node.getChildByName("bgNode");
        if (!bg) {
            this.onwin();
            return;
        }
        const finishAniNode = bg.getChildByName("finishAniNode");
        const showHandNode = bg.getChildByName("ShowHandNode");
        const shengziimg = finishAniNode ? finishAniNode.getChildByName("shengziimg") : null;
        const panziCloneNode = showHandNode ? showHandNode.getChildByName("panziCloneNode") : null;
        const panziNode = this.plate.panziNode;

        // 克隆珠子到 panziCloneNode，保持与 panziNode 相同布局
        if (panziCloneNode && panziNode) {
            const container = this.plate.beadContainer || panziNode;
            const beadsData = this.plate.getBeadsForClone();
            beadsData.forEach(b => {
                const prefab = this.slotCtrl.beadPrefabs[b.typeId];
                if (!prefab) return;
                const clone = cc.instantiate(prefab);
                const worldPos = container.convertToWorldSpaceAR(b.node.getPosition());
                const localPos = panziCloneNode.convertToNodeSpaceAR(worldPos);
                clone.setPosition(localPos);
                clone.angle = b.node.angle;
                panziCloneNode.addChild(clone);
            });
        }

        // 隐藏 panziNode、道具槽、按钮等
        if (panziNode) panziNode.active = false;
        const daojuSlot = bg.getChildByName("daojuSlot");
        if (daojuSlot) daojuSlot.active = false;
        if (this.slotCtrl.btnComplete) this.slotCtrl.btnComplete.active = false;
        if (this.slotCtrl.btnRedesign) this.slotCtrl.btnRedesign.active = false;
        const btnVideoCk = bg.getChildByName("btn_video_ck");
        if (btnVideoCk) btnVideoCk.active = false;

        if (finishAniNode && shengziimg) {
            finishAniNode.active = true;
            showHandNode && (showHandNode.active = false);
            this.playStringAnim(order, shengziimg, finishAniNode, showHandNode);
        } else {
            if (showHandNode) {
                showHandNode.active = true;
                this.setupShowHandFinish(showHandNode);
            } else {
                this.onwin();
            }
        }
    }

    private playStringAnim(
        order: { typeId: number; diameter: number }[],
        shengziimg: cc.Node,
        finishAniNode: cc.Node,
        showHandNode: cc.Node | null
    ) {
        const p1 = finishAniNode.getChildByName("P1");
        const p2 = finishAniNode.getChildByName("P2");
        const toShengziLocal = (node: cc.Node) => {
            const wp = node.parent.convertToWorldSpaceAR(node.getPosition());
            return shengziimg.convertToNodeSpaceAR(wp);
        };
        const startPos = p1 ? toShengziLocal(p1) : cc.v2(0, 0);
        const endPos = p2 ? toShengziLocal(p2) : cc.v2(0, 0);
        const moveAngle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * 180 / Math.PI;
        const beadAngle = moveAngle;
        

        // 珠子沿 P1→P2 路线堆叠，不重叠；angle 使 Y 轴与移动方向垂直
        const totalLen = order.reduce((s, b) => s + b.diameter, 0) || 1;
        let acc = 0;
        const targets: { x: number; y: number }[] = [];
        for (let i = 0; i < order.length; i++) {
            const d = order[i].diameter;
            const t = (acc + d / 2) / totalLen;
            acc += d;
            targets.push({
                x: endPos.x + (startPos.x - endPos.x) * t,
                y: endPos.y + (startPos.y - endPos.y) * t,
            });
        }

        let seq = cc.tween(this.node);
        for (let i = 0; i < order.length; i++) {
            const { typeId } = order[i];
            const prefab = this.slotCtrl.beadPrefabs[typeId];
            if (!prefab) continue;
            const bead = cc.instantiate(prefab);
            bead.setPosition(startPos.x, startPos.y);
            bead.angle = beadAngle;
            shengziimg.addChild(bead);
            const idx = i;

            seq = seq.call(() => {
                cc.tween(bead)
                    .to(0.4, { x: targets[idx].x, y: targets[idx].y })
                    .call(() => { AudioManager.playEffect("串珠子_lv350"); })
                    .start();
            }).delay(0.4);
        }
        seq.call(() => {
            AudioManager.playEffect("展示_lv350");
            finishAniNode.active = false;
            if (showHandNode) {
                this.node.getChildByName("bgNode").getChildByName(`btn_close`).active = false;
                this.node.getChildByName("bgNode").getChildByName(`levelLabel`).active = false;
                showHandNode.active = true;
                this.setupShowHandFinish(showHandNode);
            }
        }).start();
    }

    private setupShowHandFinish(showHandNode: cc.Node) {
        const btn = showHandNode.getChildByName("btn_finish");
        if (!btn) return;
        btn.active = false;
        this.scheduleOnce(() => {
            btn.active = true;
            btn.off(cc.Node.EventType.TOUCH_END, this._onBtnFinish, this);
            btn.on(cc.Node.EventType.TOUCH_END, this._onBtnFinish, this);
        }, 2);
    }

    private _onBtnFinish(e: cc.Event.EventTouch) {
        e.stopPropagation();
        AudioManager.playEffect(AudioManager.common.BUTTON);
        const key = (this.nextLevelKey || "").trim();
        if (key) {
            this.directLoadLevel(key);
        } else {
            this.onwin();
        }
    }

    private doRedesign() {
        if (this.plate) this.plate.clear();
        if (this.slotCtrl) this.slotCtrl.reset();
    }

    private static readonly CK_ANIM_DUR = 0.2;

    private setupBtnVideoCk() {
        const bg = this.node.getChildByName("bgNode");
        if (!bg) return;
        const btnVideoCk = bg.getChildByName("btn_video_ck");
        const videoImg = btnVideoCk ? btnVideoCk.getChildByName("video_img") : null;
        const ckNode = btnVideoCk ? btnVideoCk.getChildByName("ckNode") : null;
        if (!btnVideoCk || !ckNode) return;
        btnVideoCk.on(cc.Node.EventType.TOUCH_END, () => {
            if (GameData.PauseGame) return;
            AudioManager.playEffect(AudioManager.common.BUTTON);
            if (videoImg && videoImg.active) {
                VideoManager.getInstance().showVideo(
                    () => {
                        videoImg.active = false;
                        ckNode.active = true;
                        ckNode.scaleX = 0;
                        cc.tween(ckNode).to(sc_lv350.CK_ANIM_DUR, { scaleX: 1 }).start();
                    },
                    () => { }
                );
            } else if (ckNode.active) {
                this.doCollapseCk(ckNode);
            } else {
                ckNode.active = true;
                ckNode.scaleX = 0;
                cc.tween(ckNode).to(sc_lv350.CK_ANIM_DUR, { scaleX: 1 }).start();
            }
        }, this);
        ckNode.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (ckNode.active) this.doCollapseCk(ckNode);
        }, this);
    }

    private doCollapseCk(ckNode: cc.Node) {
        cc.tween(ckNode)
            .to(sc_lv350.CK_ANIM_DUR, { scaleX: 0 })
            .call(() => { ckNode.active = false; })
            .start();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
        }
    }

    onwin() {
        // 第六关通关后重置到第一关，以便胜利界面「重玩」加载 sc_lv350
        GameData.curGameStyle = "lv350";
        GameData.curGameName = "sc_lv350";
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1);
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }
}