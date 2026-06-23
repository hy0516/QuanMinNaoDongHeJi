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
export default class tuntunr_lv233 extends BaseGame {
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

    /**当前绘制线条类型 */
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
                this.fang3.active = false;
                this.role3.active = false;
                this.fang2.x = 225;
                this.fang1.x = -225;
                this.role3.x = 2000;
                this.role2.x = 225;
                break;
            case 2:
                // this.fang1.active = true;
                // this.role1.active = true;
                this.fang3.active = true;
                this.role3.active = true;

                this.role1.x = 5;
                this.role1.y = -191;

                this.role2.x = -233;
                this.role2.y = -191;

                this.role3.x = 233;
                this.role3.y = -191;

                this.fang3.x = 5;
                this.fang2.x = -228;
                this.fang1.x = 228;
                break;
            case 3:
                this.fang3.x = 5;
                this.fang2.x = -228;
                this.fang1.x = 228;

                this.role1.x = -225;
                this.role1.y = -202;

                this.role2.x = 5;
                this.role2.y = -202;

                this.role3.x = 225;
                this.role3.y = -202;
                break;
        }
        this.jdText.getComponent(cc.Label).string = this.curLevelId.toString();
        this.draw1.clear();
        this.draw2.clear();
        this.draw3.clear();

        this.line1 = [];
        this.line2 = [];
        this.line3 = [];
        
        cc.Tween.stopAllByTarget(this.role1);
        cc.Tween.stopAllByTarget(this.role2);
        cc.Tween.stopAllByTarget(this.role3);
        // this.role1.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        // this.role2.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        // this.role3.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
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
                   // this.node.cleanup();
                    this.onwin();
                })
                break;
            case "fanhui":
                GameData.PauseGame = false;
                // this.node.cleanup();
                // this.node.destroy();
                // GameData.onDele();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                // })
                this.openpausePanel();
                break;
            case "btn_tips":
                var handlers = () => {
                    this.tipsPanel.active = true;
                    if (this.curLevelId == 1) {
                        this.tipsPanel.getChildByName("ts1").active = true;
                    } else if (this.curLevelId == 2) {
                        this.tipsPanel.getChildByName("ts2").active = true;
                    } else if (this.curLevelId == 3) {
                        this.tipsPanel.getChildByName("ts3").active = true;
                    }
                    VideoManager.getInstance().showInsert();
                    // if (this.curLevelId != 1) this.tipsPanel.getChildByName("tishi" + (this.curLevelId - 1).toString()).active = false;
                    // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = true;
                    // this.node.parent.getChildByName("UiNode").getChildByName("btn_tips").getChildByName("guangg").active = false;
                    this.isshowVideo = true;
                }
                // this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                VideoManager.getInstance().showVideo(handlers);
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
                this.node.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                return
            }
            this.isGameOver = false;
            this.gou.scale = 0;
            this.IntBtn();

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
        if (this.role1.getBoundingBox().contains(startpoi) && this.line1.length == 0 && this.role1.active == true) {
            this.drawlevel = 1;
            // this.draw1.strokeColor = cc.Color.WHITE;
            this.draw1.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role2.getBoundingBox().contains(startpoi) && this.line2.length == 0 && this.role2.active == true) {
            this.drawlevel = 2;
            // this.draw2.strokeColor = cc.Color.GREEN;
            this.draw2.moveTo(startpoi.x, startpoi.y);
        }
        else if (this.role3.getBoundingBox().contains(startpoi) && this.line3.length == 0 && this.role3.active == true) {
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
        else if (this.fang2.getBoundingBox().contains(endpoi) && this.drawlevel == 2) {
        }
        else if (this.fang3.getBoundingBox().contains(endpoi) && this.drawlevel == 3) {
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

        /**角色是否开始走路 */
        var isrun = true;
        if (this.role1.active) {
            if (this.line1.length == 0) isrun = false;
        }
        if (this.role2.active) {
            if (this.line2.length == 0) isrun = false;
        }
        if (this.role3.active) {
            if (this.line3.length == 0) isrun = false;
        }
        if (isrun) {
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
    winRole3 = false;

    /**动态重绘线条 */
    dynaDrawline(draw:cc.Graphics,line:cc.Vec2[],index:number){
         //重绘线条
        draw.clear();
        for(let m = index; m < line.length; m++ ){
            draw.moveTo(line[m].x,line[m].y);

            if(m >= line.length - 1){

                draw.lineTo(line[m].x,line[m].y);
            }

            else{
                draw.lineTo(line[m+1].x,line[m+1].y);
            }

            //提交绘制命令
            draw.stroke();
            
        }   
    }
    update(dt: number): void {
        if (!this.isrun) return;
        // if(GameData.PauseGame)return;
        var rectrole1 = this.role1.getBoundingBox();
        var rectrole2 = this.role2.getBoundingBox();
        var rectrole3 = this.role3.getBoundingBox();

        if (cc.Intersection.rectRect(rectrole1, rectrole3) || cc.Intersection.rectRect(rectrole1, rectrole2) || cc.Intersection.rectRect(rectrole2, rectrole3)) {
            this.isrun = false;
            cc.Tween.stopAllByTarget(this.role1);
            cc.Tween.stopAllByTarget(this.role2);
            cc.Tween.stopAllByTarget(this.role3);
            this.onlost();
            return;
        }
        var time = new Date().getTime();
        if (time - this.curTime1 >= 25) {
            this.curTime1 = time;
            if (this.i < this.line1.length) {
                cc.tween(this.role1)
                    .to(0.25, { x: this.line1[this.i].x, y: this.line1[this.i].y })
                    .call(() => { 
                        
                        this.i++ ;

                        this.dynaDrawline(this.draw1,this.line1,this.i);
                        

                    })
                    .start()
            } else {
                this.winRole1 = true;
            }
            if (this.k < this.line3.length) {
                cc.tween(this.role3)
                    .to(0.25, { x: this.line3[this.k].x, y: this.line3[this.k].y })
                    .call(() => { 
                        this.k++;
                        this.dynaDrawline(this.draw3,this.line3,this.k);
                     })
                    .start()
            } else {
                this.winRole3 = true;
            }
            if (this.j < this.line2.length) {
                cc.tween(this.role2)
                    .to(0.25, { x: this.line2[this.j].x, y: this.line2[this.j].y })
                    .call(() => { 
                         this.j++;
                         this.dynaDrawline(this.draw2,this.line2,this.j);
                     })
                    .start()
            } else {
                this.winRole2 = true;
            }
        }
        // if (time - this.curTime2 >= 2) {
        // if (this.j < this.line2.length - 1 && !this.enemystate) {
        //     this.role2.setPosition(this.line2[this.j]);
        //     this.j++;
        // } else if (this.j > 0 && this.enemystate) {
        //     this.role2.setPosition(this.line2[this.j]);
        //     this.j--;
        // } else if (this.j == this.line2.length - 1) {
        //     this.j--;
        //     this.role2.setPosition(this.line2[this.j]);
        //     this.enemystate = !this.enemystate;
        // } else if (this.j == 0) {
        //     this.j++;
        //     this.role2.setPosition(this.line2[this.j]);
        //     this.enemystate = !this.enemystate;
        // }


        // var rectrole1 = cc.rect(this.role1.x, this.role1.y, this.role1.width, this.role1.height);
        // var rectrole2 = cc.rect(this.role2.x, this.role2.y, this.role2.width, this.role2.height);
        // var rectrole3 = cc.rect(this.role3.x, this.role3.y, this.role3.width, this.role3.height);

        var iswin = true;
        if (this.role1.active && !this.winRole1) iswin = false;
        if (this.role2.active && !this.winRole2) iswin = false;
        if (this.role3.active && !this.winRole3) iswin = false;
        if (iswin) {

            this.i = 0;
            this.j = 0;
            this.k = 0;
            this.enemystate = false;
            this.line1 = [];
            this.line2 = [];
            this.line3 = [];
            this.isrun = false;
            this.winRole1 = false;
            this.winRole3 = false;
            this.winRole2 = false;
            this.onwin();
        }
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.timeText.getComponent(cc.Label).string = this.startTime.toString() + "s";
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
                this.node.destroy();
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
