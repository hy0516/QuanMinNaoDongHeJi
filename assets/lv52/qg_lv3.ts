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
export default class qglv_3 extends BaseGame {
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
    private fang1: cc.Node = null;
    @property(cc.Node)
    private fang2: cc.Node = null;
    @property(cc.Node)
    private fang3: cc.Node = null;

    @property(cc.Graphics)
    private draw1: cc.Graphics = null;
    @property(cc.Graphics)
    private draw2: cc.Graphics = null;
    @property(cc.Graphics)
    private draw3: cc.Graphics = null;

    private curLevelId = 1;
    public startTime = 100;
    private line1: cc.Vec2[] = [];
    private line2: cc.Vec2[] = [];
    private line3: cc.Vec2[] = [];

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
            .start()
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        this.Initlevel();
        this.IntBtn();
        this.ShowTime
        this.schedule(this.Timeing, 1)
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
    }
    onCollisionEnter() {
        console.log("11")
    }

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

    Initlevel() {
        switch (this.curLevelId) {
            case 1:
                this.fang2.active = false;
                this.role3.active = false;
                this.role2.x = -228.8;
                this.role1.x = 248;
                break;
            case 2:
                this.fang2.active = true;
                this.role3.active = true;
                this.role1.x = -228.8;
                this.role1.y = -160.8;
                this.role2.x = 14.3;
                this.role2.y = -160.8;
                break;
            case 3:
                this.role2.x = -228.8;
                this.role2.y = -160.8;
                this.role1.x = 14.3;
                this.role1.y = -160.8;
                this.role3.x = 248;
                this.role3.y = -160.8;
                break;
        }
        this.jdText.getComponent(cc.Label).string = this.curLevelId.toString();
        this.draw1.clear();
        this.draw2.clear();
        this.draw3.clear();
        cc.Tween.stopAllByTarget(this.role1);
        cc.Tween.stopAllByTarget(this.role2);
        this.role1.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        this.role2.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        this.role3.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "tiaoguo":
                if (GameData.PauseGame) {
                    common.ShowTipsView("请在当前雕像切割前跳过");
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = true;
                    this.node.cleanup();
                    this.onwin();
                })
                break;
            case "fanhui":
                GameData.PauseGame = false;
                this.node.cleanup();
                this.node.parent.destroy();
                GameData.onDele();
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = cc.find("Canvas");
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "btn_tips":
                var handlers = () => {
                    this.tipsPanel.active = true;
                    // if (this.curLevelId != 1) this.tipsPanel.getChildByName("tishi" + (this.curLevelId - 1).toString()).active = false;
                    // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = true;
                    // this.node.parent.getChildByName("UiNode").getChildByName("btn_tips").getChildByName("guangg").active = false;
                    this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = false;
                this.tipsPanel.active = false;
                break;
        }
    }

    isshowVideo = false;
    onwin() {
        var fun = () => {
            if (this.curLevelId >= 3) {
                this.node.cleanup();
                this.node.parent.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                return
            }
            this.isGameOver = false;
            this.gou.scale = 0;
            this.IntBtn();
            // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
            // this.node.parent.getChildByName("men").getComponent(colliderHandler).iswin = false;
            this.curLevelId++;
            this.Initlevel();
            GameData.PauseGame = false;
        }

        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect(music.gou)
        }, 0.9)
    }
    pointInRect(a: cc.Vec2, rect: cc.Vec2[]): boolean {
        if (Math.abs(a.y) > Math.abs(rect[1].y) && Math.abs(a.y) < Math.abs(rect[0].y)) {
            if (a.x > rect[1].x && a.x < rect[2].x) {
                return true;
            }
        }
        return false;
    }
    pointInRect2(a: cc.Vec2, rect: cc.Vec2[]): boolean {
        if (Math.abs(a.y) > Math.abs(rect[0].y) && Math.abs(a.y) < Math.abs(rect[1].y)) {
            if (a.x > rect[1].x && a.x < rect[2].x) {
                return true;
            }
        }
        return false;
    }

    onTouchStart(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        var startpoi = this.node.convertToNodeSpaceAR(e.getLocation());
        if (this.role1.getBoundingBox().contains(startpoi) && this.line1.length == 0) {
            this.drawlevel = 1;
            // this.draw1.strokeColor = cc.Color.WHITE;
            this.draw1.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role2.getBoundingBox().contains(startpoi) && this.line2.length == 0) {
            this.drawlevel = 2;
            // this.draw2.strokeColor = cc.Color.GREEN;
            this.draw2.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role3.getBoundingBox().contains(startpoi) && this.line3.length == 0) {
            // this.draw3.strokeColor = cc.Color.RED;
            this.drawlevel = 3;
            this.draw3.moveTo(startpoi.x, startpoi.y);
        } else {
            return;
        }
        this.isdrawing = true;

    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        if (this.isdrawing == false) return
        let p = this.node.convertToNodeSpaceAR(e.getLocation());
        switch (this.drawlevel) {
           case 1:
                this.line1.push(p);
                if (this.line1.length > 2) {
                    this.draw1.moveTo(this.line1[this.line1.length - 2].x, this.line1[this.line1.length - 2].y);
                }
                this.draw1.lineTo(p.x, p.y);
                this.draw1.stroke();
                break;
            case 2:
                this.line2.push(p);
                 if (this.line2.length > 2) {
                    this.draw2.moveTo(this.line2[this.line2.length - 2].x, this.line2[this.line2.length - 2].y);
                }
                this.draw2.lineTo(p.x, p.y);
                this.draw2.stroke();
                break;
            case 3:
                this.line3.push(p);
                   if (this.line3.length > 2) {
                    this.draw3.moveTo(this.line3[this.line3.length - 2].x, this.line3[this.line3.length - 2].y);
                }
                this.draw3.lineTo(p.x, p.y);
                this.draw3.stroke();
                break;
        }

    }

    onTouchEnd(e: cc.Event.EventTouch) {
        var endpoi = this.node.convertToNodeSpaceAR(e.getLocation());
        if (this.fang1.getBoundingBox().contains(endpoi) && this.drawlevel == 1) {
        }
        else if (this.fang2.getBoundingBox().contains(endpoi) && this.drawlevel == 3) {
        }
        else if (this.fang3.getBoundingBox().contains(endpoi) && this.drawlevel == 2) {
        }
        else {
            switch (this.drawlevel) {
                case 1:
                    this.line1 = [];
                    this.draw1.clear(false);
                    break;
                case 2:
                    this.line2 = [];
                    this.draw2.clear(false);
                    break;
                case 3:
                    this.line3 = [];
                    this.draw3.clear(false);
                    break;

            }

        }
        if (this.curLevelId == 1) {
            if (this.line1.length != 0 && this.line2.length != 0) {
                this.role1.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("pao", -1);
                this.role2.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("pao", -1);
                this.isrun = true;
                GameData.PauseGame = true;
            }
        } else if (this.line1.length != 0 && this.line2.length != 0 && this.line3.length != 0) {
            this.role1.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("pao", -1);
            this.role2.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("pao", -1);
            this.role3.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("pao", -1);
            this.isrun = true;
            GameData.PauseGame = true;
        }
        this.isdrawing = false;
        this.drawlevel = 0;
    }
    curTime1 = 0;
    curTime2 = 0;
    i = 0;
    j = 0;
    k = 0;
    enemystate = false;
    winRole1 = false;
    winRole2 = false;

    update(dt: number): void {
        if (!this.isrun) return;
        // if(GameData.PauseGame)return;
        var rectrole1 = this.role1.getBoundingBox();
        var rectrole2 = this.role2.getBoundingBox();
        var rectrole3 = this.role3.getBoundingBox();

        if (cc.Intersection.rectRect(rectrole1, rectrole2) || cc.Intersection.rectRect(rectrole2, rectrole3)) {
            this.isrun = false;
            cc.Tween.stopAllByTarget(this.role1);
            cc.Tween.stopAllByTarget(this.role2);
            this.onlost();
            return;
        }
        var time = new Date().getTime();
        if (time - this.curTime1 >= 25) {
            this.curTime1 = time;
            if (this.i < this.line1.length) {
                cc.tween(this.role1)
                    .to(0.25, { x: this.line1[this.i].x, y: this.line1[this.i].y })
                    .call(() => { this.i++ })
                    .start()
            } else {
                this.winRole1 = true;
            }
            if (this.k < this.line3.length) {
                cc.tween(this.role3)
                    .to(0.25, { x: this.line3[this.k].x, y: this.line3[this.k].y })
                    .call(() => { this.k++ })
                    .start()
            } else {
                this.winRole2 = true;
            }
        }
        // if (time - this.curTime2 >= 2) {
        if (this.j < this.line2.length - 1 && !this.enemystate) {
            this.role2.setPosition(this.line2[this.j]);
            this.j++;
        } else if (this.j > 0 && this.enemystate) {
            this.role2.setPosition(this.line2[this.j]);
            this.j--;
        } else if (this.j == this.line2.length - 1) {
            this.j--;
            this.role2.setPosition(this.line2[this.j]);
            this.enemystate = !this.enemystate;
        } else if (this.j == 0) {
            this.j++;
            this.role2.setPosition(this.line2[this.j]);
            this.enemystate = !this.enemystate;
        }


        // var rectrole1 = cc.rect(this.role1.x, this.role1.y, this.role1.width, this.role1.height);
        // var rectrole2 = cc.rect(this.role2.x, this.role2.y, this.role2.width, this.role2.height);
        // var rectrole3 = cc.rect(this.role3.x, this.role3.y, this.role3.width, this.role3.height);


        if (this.winRole1 && this.winRole2) {
            this.i = 0;
            this.j = 0;
            this.k = 0;
            this.enemystate = false;
            this.line1 = [];
            this.line2 = [];
            this.line3 = [];
            this.isrun = false;
            this.winRole1 = false;
            this.winRole2 = false;
            this.onwin();
        }
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.timeText.getComponent(cc.Label).string =this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }

    ShowTime() {
        this.timeText.parent.active = true;
        let time = 6;
        // 开始倒计时
        this.schedule(() => {
            if (time == 0) {
                this.timeText.parent.active = false;
                // this.move = false;
                if (this.isGameOver) {
                    AudioManager.playEffect(music.win);
                    this.onwin();
                } else {
                    AudioManager.playEffect(music.lost);
                    this.onlost()
                }
            }
            else {
                if (this.isGameOver) {
                    AudioManager.playEffect(music.win);
                    // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("ying", -1);
                }
                time--
                this.timeText.getComponent(cc.Label).string = time.toString();

            }
        }, 1, 6, 0.01);
    }

    onlost() {
        var fun = () => {
            this.scheduleOnce(() => {
                GameData.PauseGame = false
                this.node.parent.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 1)
        }
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .call(fun)
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }

}
