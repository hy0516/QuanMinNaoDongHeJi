import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import colliderHandler from "../script/qg/colliderHandler";

const { ccclass, property } = cc._decorator;
enum music {
    win = "win_qg1",
    lost = "lost_qg1",
    qg = "qg1",
    qiu = "qiu_qg1",
    diaoluo = "dl_qg1",
    gou = "finishjq"
}

@ccclass
export default class tuntunr_lv265 extends BaseGame {
    @property(cc.Node)
    private tittle: cc.Node = null;
    @property(cc.Node)
    private timeText: cc.Node = null;
    @property(cc.Node)
    private gou: cc.Node = null;
    @property(cc.Node)
    private gou2: cc.Node = null;
    @property(cc.Node)
    private jdText: cc.Node = null;
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    private role1: cc.Node = null;
    @property(cc.Node)
    private role2: cc.Node = null;
    @property(cc.Node)
    private role3: cc.Node = null;
    @property(cc.Node)
    private role4: cc.Node = null;
    @property(cc.Node)
    private fang1: cc.Node = null;
    @property(cc.Node)
    private fang2: cc.Node = null;
    @property(cc.Node)
    private fang3: cc.Node = null;
    @property(cc.Node)
    private fang4: cc.Node = null;

    @property(cc.Graphics)
    private draw1: cc.Graphics = null;
    @property(cc.Graphics)
    private draw2: cc.Graphics = null;
    @property(cc.Graphics)
    private draw3: cc.Graphics = null;
    @property(cc.Graphics)
    private draw4: cc.Graphics = null;

    private curLevelId = 1;
    public startTime = 100;
    private line1: cc.Vec2[] = [];
    private line2: cc.Vec2[] = [];
    private line3: cc.Vec2[] = [];
    private line4: cc.Vec2[] = [];

    drawlevel = 0;
    isrun = false;
    isdrawing = false;

    onLoad() {
        cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.5)
            )
            .start();
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        this.Initlevel();
        this.IntBtn();
        // ❌ 移除了 this.ShowTime();
        this.schedule(this.Timeing, 1);
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
    }

    onCollisionEnter() {}

    IntBtn() {
        this.offBtn();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    offBtn() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    // ✅ 通用动画播放函数：loop=true → 循环（playTimes=0），否则播放一次（playTimes=1）
    private playAnim(role: cc.Node, anim: string, loop: boolean = false) {
        if (!role || !role.active) return;
        const ske = role.getChildByName("ske")?.getComponent(dragonBones.ArmatureDisplay);
        if (ske) {
            ske.playAnimation(anim, loop ? 0 : 1);
        }
    }

    Initlevel() {
        this.role1.active = this.role2.active = this.role3.active = this.role4.active = false;
        this.fang1.active = this.fang2.active = this.fang3.active = this.fang4.active = true;

        switch (this.curLevelId) {
            case 1:
                this.role1.active = true;
                this.role1.x = 225; this.role1.y = -300;
                this.fang1.x = 225;

                this.role2.active = true;
                this.role2.x = -225; this.role2.y = -300;
                this.fang2.x = -225;

                this.role3.active = false;
                this.role4.active = false;
                this.fang3.active = false;
                this.fang4.active = false;
                break;
            case 2:
                this.role1.active = true;
                this.role2.active = true;
                this.role3.active = true;
                this.role4.active = false;

                this.role1.x = -233; this.role1.y = -300;
                this.role2.x = 233; this.role2.y = -300;
                this.role3.x = 0; this.role3.y = -300;

                this.fang1.x = 0;
                this.fang2.x = -228;
                this.fang3.x = 228;
                this.fang4.active = false;
                break;
            case 3:
                this.role1.active = true;
                this.role2.active = true;
                this.role3.active = true;
                this.role4.active = false;

                this.role1.x = 0; this.role1.y = -300;
                this.role2.x = 233; this.role2.y = -300;
                this.role3.x = -233; this.role3.y = -300;

                this.fang1.x = 0;
                this.fang2.x = -228;
                this.fang3.x = 228;
                this.fang4.active = false;
                break;
            case 4:
                this.role1.active = true;
                this.role2.active = true;
                this.role3.active = true;
                this.role4.active = true;

                this.role1.x = -80; this.role1.y = -300;
                this.role2.x = -240; this.role2.y = -300;
                this.role3.x = 80; this.role3.y = -300;
                this.role4.x = 240; this.role4.y = -300;

                this.fang1.x = 240;
                this.fang2.x = -80;
                this.fang3.x = -240;
                this.fang4.x = 80;
                break;
            case 5:
                this.role1.active = true;
                this.role2.active = true;
                this.role3.active = true;
                this.role4.active = true;

                this.role1.x = -80; this.role1.y = -300;
                this.role2.x = -80; this.role2.y = 220;
                this.role3.x = 80; this.role3.y = -300;
                this.role4.x = 80; this.role4.y = 220;

                this.fang1.x = 240; 
                this.fang2.x = -240; this.fang2.y = -230;
                this.fang3.x = -240;
                this.fang4.x = 240; this.fang4.y = -230;
                break;
        }

        this.jdText.getComponent(cc.Label).string = this.curLevelId.toString();
        this.draw1.clear();
        this.draw2.clear();
        this.draw3.clear();
        this.draw4.clear();

        this.line1 = [];
        this.line2 = [];
        this.line3 = [];
        this.line4 = [];

        cc.Tween.stopAllByTarget(this.role1);
        cc.Tween.stopAllByTarget(this.role2);
        cc.Tween.stopAllByTarget(this.role3);
        cc.Tween.stopAllByTarget(this.role4);

        // ✅ 每关开始：播放待机动画（一次）
        this.playAnim(this.role1, "yh_dj", true);
        this.playAnim(this.role2, "lnn_dj", true);
        this.playAnim(this.role3, "lxm_dj", true);
        this.playAnim(this.role4, "gcr_dj", true);
    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "tiaoguo":
                if (GameData.PauseGame) {
                    common.ShowTipsView("请在当前关卡前跳过");
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = true;
                    this.onwin();
                });
                break;
            case "fanhui":
                this.openpausePanel();
                break;
            case "btn_tips":
                var handlers = () => {
                    this.tipsPanel.active = true;
                    for (let i = 1; i <= 5; i++) {
                        const ts = this.tipsPanel.getChildByName("ts" + i);
                        if (ts) ts.active = (i === this.curLevelId);
                    }
                    VideoManager.getInstance().showInsert();
                    this.isshowVideo = true;
                };
                VideoManager.getInstance().showVideo(handlers);
                break;
            case "x":
                this.tipsPanel.active = false;
                break;
        }
    }

    isshowVideo = false;

    onwin() {
        // ✅ 胜利：播放一次胜利动画
        this.playAnim(this.role1, "yh_sl", false);
        this.playAnim(this.role2, "lnn_sl", false);
        this.playAnim(this.role3, "lxm_sl", false);
        this.playAnim(this.role4, "gcr_sl", false);

        var fun = () => {
            if (this.curLevelId >= 5) {
                this.node.cleanup();
                this.node.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                return;
            }
            this.isGameOver = false;
            this.gou.scale = 0;
            this.IntBtn();

            this.curLevelId++;
            this.Initlevel();
            GameData.PauseGame = false;
        };

        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start();

        this.scheduleOnce(() => {
            AudioManager.playEffect(music.gou);
        }, 0.9);
    }

    onTouchStart(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        var startpoi = this.node.convertToNodeSpaceAR(e.getLocation());

        if (this.role1.getBoundingBox().contains(startpoi) && this.line1.length === 0 && this.role1.active) {
            this.drawlevel = 1;
            this.draw1.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role2.getBoundingBox().contains(startpoi) && this.line2.length === 0 && this.role2.active) {
            this.drawlevel = 2;
            this.draw2.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role3.getBoundingBox().contains(startpoi) && this.line3.length === 0 && this.role3.active) {
            this.drawlevel = 3;
            this.draw3.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role4.getBoundingBox().contains(startpoi) && this.line4.length === 0 && this.role4.active) {
            this.drawlevel = 4;
            this.draw4.moveTo(startpoi.x, startpoi.y);
        } else {
            return;
        }
        this.isdrawing = true;
    }

    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.isdrawing) return;
        let p = this.node.convertToNodeSpaceAR(e.getLocation());
        switch (this.drawlevel) {
            case 1:
                this.line1.push(p);
                if (this.line1.length > 2) this.draw1.moveTo(this.line1[this.line1.length - 2].x, this.line1[this.line1.length - 2].y);
                this.draw1.lineTo(p.x, p.y);
                this.draw1.stroke();
                break;
            case 2:
                this.line2.push(p);
                if (this.line2.length > 2) this.draw2.moveTo(this.line2[this.line2.length - 2].x, this.line2[this.line2.length - 2].y);
                this.draw2.lineTo(p.x, p.y);
                this.draw2.stroke();
                break;
            case 3:
                this.line3.push(p);
                if (this.line3.length > 2) this.draw3.moveTo(this.line3[this.line3.length - 2].x, this.line3[this.line3.length - 2].y);
                this.draw3.lineTo(p.x, p.y);
                this.draw3.stroke();
                break;
            case 4:
                this.line4.push(p);
                if (this.line4.length > 2) this.draw4.moveTo(this.line4[this.line4.length - 2].x, this.line4[this.line4.length - 2].y);
                this.draw4.lineTo(p.x, p.y);
                this.draw4.stroke();
                break;
        }
    }

    onTouchEnd(e: cc.Event.EventTouch) {
        var endpoi = this.node.convertToNodeSpaceAR(e.getLocation());
        let validEnd = false;

        if (this.drawlevel === 1 && this.fang1.getBoundingBox().contains(endpoi)) validEnd = true;
        else if (this.drawlevel === 2 && this.fang2.getBoundingBox().contains(endpoi)) validEnd = true;
        else if (this.drawlevel === 3 && this.fang3.getBoundingBox().contains(endpoi)) validEnd = true;
        else if (this.drawlevel === 4 && this.fang4.getBoundingBox().contains(endpoi)) validEnd = true;

        if (!validEnd) {
            switch (this.drawlevel) {
                case 1: this.line1 = []; this.draw1.clear(false); break;
                case 2: this.line2 = []; this.draw2.clear(false); break;
                case 3: this.line3 = []; this.draw3.clear(false); break;
                case 4: this.line4 = []; this.draw4.clear(false); break;
            }
        }

        let isrun = true;
        if (this.role1.active && this.line1.length === 0) isrun = false;
        if (this.role2.active && this.line2.length === 0) isrun = false;
        if (this.role3.active && this.line3.length === 0) isrun = false;
        if (this.role4.active && this.line4.length === 0) isrun = false;

        if (isrun) {
            this.isrun = true;
            GameData.PauseGame = true;

            // ✅ 开始移动：播放循环走路动画（只调一次，自动循环）
            this.playAnim(this.role1, "yh_zl", true);
            this.playAnim(this.role2, "lnn_zl", true);
            this.playAnim(this.role3, "lxm_zl", true);
            this.playAnim(this.role4, "gcr_zl", true);
        }

        this.isdrawing = false;
        this.drawlevel = 0;
    }

    curTime1 = 0;
    i = 0; j = 0; k = 0; l = 0;
    winRole1 = false; winRole2 = false; winRole3 = false; winRole4 = false;

    dynaDrawline(draw: cc.Graphics, line: cc.Vec2[], index: number) {
        draw.clear();
        for (let m = index; m < line.length; m++) {
            draw.moveTo(line[m].x, line[m].y);
            draw.lineTo((m + 1 < line.length) ? line[m + 1].x : line[m].x, (m + 1 < line.length) ? line[m + 1].y : line[m].y);
            draw.stroke();
        }
    }

    update(dt: number): void {
        if (!this.isrun) return;

        const r1 = this.role1.getBoundingBox();
        const r2 = this.role2.getBoundingBox();
        const r3 = this.role3.getBoundingBox();
        const r4 = this.role4.getBoundingBox();

        if (
            (this.role1.active && this.role2.active && cc.Intersection.rectRect(r1, r2)) ||
            (this.role1.active && this.role3.active && cc.Intersection.rectRect(r1, r3)) ||
            (this.role1.active && this.role4.active && cc.Intersection.rectRect(r1, r4)) ||
            (this.role2.active && this.role3.active && cc.Intersection.rectRect(r2, r3)) ||
            (this.role2.active && this.role4.active && cc.Intersection.rectRect(r2, r4)) ||
            (this.role3.active && this.role4.active && cc.Intersection.rectRect(r3, r4))
        ) {
            this.isrun = false;
            [this.role1, this.role2, this.role3, this.role4].forEach(r => cc.Tween.stopAllByTarget(r));
            this.onlost();
            return;
        }

        var time = new Date().getTime();
        if (time - this.curTime1 >= 50) {
            this.curTime1 = time;

            if (this.i < this.line1.length) {
                cc.tween(this.role1).to(0.25, { x: this.line1[this.i].x, y: this.line1[this.i].y })
                    .call(() => { this.i++; this.dynaDrawline(this.draw1, this.line1, this.i); }).start();
            } else this.winRole1 = true;

            if (this.j < this.line2.length) {
                cc.tween(this.role2).to(0.25, { x: this.line2[this.j].x, y: this.line2[this.j].y })
                    .call(() => { this.j++; this.dynaDrawline(this.draw2, this.line2, this.j); }).start();
            } else this.winRole2 = true;

            if (this.k < this.line3.length) {
                cc.tween(this.role3).to(0.25, { x: this.line3[this.k].x, y: this.line3[this.k].y })
                    .call(() => { this.k++; this.dynaDrawline(this.draw3, this.line3, this.k); }).start();
            } else this.winRole3 = true;

            if (this.l < this.line4.length) {
                cc.tween(this.role4).to(0.25, { x: this.line4[this.l].x, y: this.line4[this.l].y })
                    .call(() => { this.l++; this.dynaDrawline(this.draw4, this.line4, this.l); }).start();
            } else this.winRole4 = true;
        }

        let iswin = true;
        if (this.role1.active && !this.winRole1) iswin = false;
        if (this.role2.active && !this.winRole2) iswin = false;
        if (this.role3.active && !this.winRole3) iswin = false;
        if (this.role4.active && !this.winRole4) iswin = false;

        if (iswin) {
            this.i = this.j = this.k = this.l = 0;
            this.line1 = []; this.line2 = []; this.line3 = []; this.line4 = [];
            this.winRole1 = this.winRole2 = this.winRole3 = this.winRole4 = false;
            this.isrun = false;
            this.onwin();
        }
    }

    Timeing() {
        if (GameData.PauseGame) return;
        this.startTime--;
        this.timeText.getComponent(cc.Label).string = this.startTime.toString() + "s";
        if (this.startTime <= 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend");
                this.node.destroy();
            }, 1.5);
        }
    }

    onlost() {
        // ✅ 失败：播放一次失败动画
        this.playAnim(this.role1, "yh_ku", false);
        this.playAnim(this.role2, "lnn_ku", false);
        this.playAnim(this.role3, "lxm_ku", false);
        this.playAnim(this.role4, "gcr_ku", false);

        var fun = () => {
            this.scheduleOnce(() => {
                GameData.PauseGame = false;
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 1.5);
        };
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .call(fun)
            .start();

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
        }, 0.4);
    }
}