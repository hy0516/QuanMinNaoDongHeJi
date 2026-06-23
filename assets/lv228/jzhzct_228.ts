

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import data_228 from "./data_228";
import end_228 from "./end_228";
import mapitem_228 from "./mapitem_228";





const { ccclass, property } = cc._decorator;

@ccclass
export default class jzhzct_228 extends BaseGame {
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.String)
    nodename: string = "";
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    tipsPanel: cc.Node = null;
    @property(cc.Node)
    g: cc.Node = null;
    @property(cc.Node)
    tou: cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;
    @property(cc.Node)
    gra: cc.Node = null;
    @property(cc.Node)
    gra2: cc.Node = null;
    @property(cc.Prefab)
    nextLv: cc.Prefab = null;
    linelist: cc.Vec2[] = []

    public startTime = 200;
    public curTime = 0;

    // map: cc.Node = null;
    curlv = 1;
    tipsindex = 0;
    tiezhinum = 0;

    /**描边线条 "#5398E2"*/
    gra3;
    // step = 1;
    gracolor: string[] = ["#1579E6", "#E7DB51", "#EE1515", "#6F35EB", "#F129D1"];


   

    onLoad() {
        GameData.PauseGame = false;
        // this.time.string = "时间:" + this.startTime.toString() + "s";
        // this.schedule(this.Timeing, 1);
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景_lv228");
        }, 0.5)
        // cc.Tween.stopAllByTarget(this.tittle);
        // cc.tween(this.tittle)
        //     .repeat(2,
        //         cc.tween()
        //             .to(0.1, { angle: 7 })
        //             .to(0.1, { angle: 0 })
        //             .to(0.1, { angle: -7 })
        //             .to(0.1, { angle: 0 })
        //             .delay(0.5)
        //     )
        //     .start()




        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.tou.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on("gamewin_228", () => {
            this.checknextlv();
            // }, 1.5);
        }, this);


        //设置线条长度
        this.gra.getComponent(cc.Graphics).lineWidth = 75;
        this.gra2.getComponent(cc.Graphics).lineWidth = 75;

        //创建并设置描边
        this.gra3 = new cc.Node("gra3");

        this.gra3.addComponent(cc.Graphics);

        //黑色描边
        this.gra3.getComponent(cc.Graphics).strokeColor.fromHEX("#0A0A0A");
        this.gra3.getComponent(cc.Graphics).lineWidth = 80;
        this.gra3.getComponent(cc.Graphics).lineJoin = cc.Graphics.LineJoin.ROUND;
        this.gra3.getComponent(cc.Graphics).lineCap = cc.Graphics.LineCap.ROUND;

        this.node.getChildByName("bg").addChild(this.gra3);


        //设置渲染在里层
        this.gra.zIndex = 1;
        this.gra2.zIndex = 1;
        this.gra3.zIndex = 0;
        this.tou.zIndex = 2;
        this.g.zIndex = 3;



        //找到并设置头的位置
        for (let i = 0; i < this.map.childrenCount; i++) {
            var script = this.map.children[i].getComponent(mapitem_228);
            if (script.startnode) {
                this.tou.position = this.node.getChildByName("bg").convertToNodeSpaceAR(this.map.convertToWorldSpaceAR(this.map.children[i].position));
                this.linelist[this.linelist.length] = new cc.Vec2(this.tou.x, this.tou.y);
                break;
            }
        }
        this.node.on("refresh_pf", this.changetou, this);
        this.loadTou();



        //重置数据
        if(data_228.isGameing == false){
            data_228.curLv = 1;
        }

        /**加载标题 */
        AssetManager.load(GameData.curGameStyle,"biaoti_228",cc.Prefab,null,(biaoti:cc.Prefab)=>{
                let node = cc.instantiate(biaoti);

                node.getComponent(cc.Label).string = "第 " + data_228.curLv.toString() + " 关";

                this.node.addChild(node);

                node.position = new cc.Vec3(11.209,673.99,0);
        })

        //默认不继续游戏
        data_228.isGameing = false;

    }
    loadTou() {
        this.tou.children[0].destroy();
        var namelist = data_228.usetou.split("xk");
        AssetManager.load(GameData.curGameStyle, "tou_sk_228", cc.Prefab, null, (icon: cc.Prefab) => {
            var sk = cc.instantiate(icon);
            this.tou.addChild(sk);
            sk.setPosition(0, -40);
            sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("r" + namelist[1], -1);
            var gra = this.gra.getComponent(cc.Graphics);
            var gra2 = this.gra2.getComponent(cc.Graphics);
            gra.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);
            gra2.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);

        })
    }
    changetou() {
        var gra = this.gra.getComponent(cc.Graphics);
        var gra2 = this.gra2.getComponent(cc.Graphics);
        var namelist = data_228.usetou.split("xk");
        this.tou.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("r" + namelist[1], -1);
        gra.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);
        gra2.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);
        gra.clear();
        for (let i = 0; i < this.linelist.length; i++) {
            var poi = this.linelist[i];
            var poi2 = this.linelist[i + 1];
            if (!poi2) return
            gra2.moveTo(poi.x, poi.y);
            gra2.lineTo(poi2.x, poi2.y);
            gra2.stroke();
        }
    }
    toustartpoi = null;
    touendpoi = null;
    onTouchStart(even: cc.Event.EventTouch) {
        this.toustartpoi = this.node.convertToNodeSpaceAR(even.getLocation());
    }
    // onTouchMove() {

    // }
    onTouchEnd(even: cc.Event.EventTouch) {
        if (this.isgo) return
        this.touendpoi = this.node.convertToNodeSpaceAR(even.getLocation());
        if (cc.Vec2.distance(this.toustartpoi, this.touendpoi) < 10) return
        var angle = this.cal_angle(this.toustartpoi, this.touendpoi);
        if (angle <= 135 && angle >= 45) {
            this.checkdir = "right";
        } else if (angle <= 225 && angle > 135) {
            this.checkdir = "up";
        } else if ((angle <= 270 && angle > 225) || angle <= -45) {
            this.checkdir = "left";
        } else if (angle < 45 && angle > -45) {
            this.checkdir = "down";
        }
        // console.log("方向:" + this.checkdir)
        this.checkBox();
    }
    cal_angle(linepos: cc.Vec2, pos: cc.Vec2) {
        var xDis = pos.x - linepos.x;
        var yDis = pos.y - linepos.y;
        var angle = Math.atan2(yDis, xDis);
        angle = Math.round(angle * 180 / Math.PI) + 90;
        // console.log("angle=" + angle);
        return angle
    }

    update() {
        if (this.isgo == false || !this.curcheckbox) return
        var poi1 = this.tou.parent.convertToNodeSpaceAR(this.map.convertToWorldSpaceAR(this.curcheckbox.position));
        this.tou.x += (poi1.x - this.startTouPoi.x) / 10
        this.tou.y += (poi1.y - this.startTouPoi.y) / 10;
        var dis = cc.Vec2.distance(this.tou.position, poi1);
        var gra = this.gra.getComponent(cc.Graphics);
        if (dis <= 1.5) {

            this.curwinbox = this.pathList[this.pathList.length - 1];
            this.curcheckbox = null;
            this.pathList = [];
            var gra2 = this.gra2.getComponent(cc.Graphics);
            // gra2.clear();
            this.linelist[this.linelist.length] = new cc.Vec2(this.tou.x, this.tou.y)
            gra2.moveTo(this.startTouPoi.x, this.startTouPoi.y);
            gra2.lineTo(this.tou.x, this.tou.y);
            gra2.stroke();
            gra.clear();

            var gra3 = this.gra3.getComponent(cc.Graphics);
            //绘制描边
            gra3.moveTo(this.startTouPoi.x, this.startTouPoi.y);
            gra3.lineTo(this.tou.x, this.tou.y);
            gra3.stroke();



            cc.Tween.stopAllByTarget(this.map);
            this.zhengdong();
            this.checkWin();
        }
        gra.moveTo(this.startTouPoi.x, this.startTouPoi.y);
        gra.lineTo(this.tou.x, this.tou.y);
        gra.stroke();

    }

    zhengdong() {
        var zx = 0;
        var zy = 0;
        switch (this.checkdir) {
            case "left":
                zx = -7;
                zy = 0;
                break;
            case "right":
                zx = 7;
                zy = 0;
                break;
            case "up":
                zx = 0;
                zy = 7;
                break;
            case "down":
                zx = 0;
                zy = -7;
                break;
        }
        cc.tween(this.map)
            .to(0.05, { x: zx, y: zy })
            .to(0.05, { x: 0, y: 0 })
            .start()
    }
    curwinbox: cc.Node = null;
    checkWin() {
        var toumappoi = this.curwinbox
        var poi
        var isall = true;
        for (let i = 0; i < this.map.childrenCount; i++) {
            var boxrect = this.map.children[i].getBoundingBox();
            var script = this.map.children[i].getComponent(mapitem_228);
            if (!script.isuse) isall = false
            poi = new cc.Vec2(toumappoi.x - this.tou.width, toumappoi.y);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv228");
                this.isgo = false;
                return;
            }
            poi = new cc.Vec2(toumappoi.x + this.tou.width, toumappoi.y);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv228");
                this.isgo = false;
                return;
            }
            poi = new cc.Vec2(toumappoi.x, toumappoi.y + this.tou.height);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv228");
                this.isgo = false;
                return;
            }
            poi = new cc.Vec2(toumappoi.x, toumappoi.y - this.tou.height);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv228");
                this.isgo = false;
                return;
            }
            if (i == this.map.childrenCount - 1) {
                if (!isall) {
                    AssetManager.load(GameData.curGameStyle, "xy_ske_228", cc.Prefab, null, (UI: cc.Prefab) => {
                        AudioManager.playEffect("撞晕_lv228");
                        var UINode = cc.instantiate(UI);
                        UINode.parent = this.tou;
                        this.scheduleOnce(() => {
                            this.onlost();
                        }, 1)
                    })
                }
                else {
                    
                    this.onwin();
                }
                this.isgo = false;
            }
        }

    }

    startTouPoi = null;
    isgo = false;
    checkdir = ""
    curcheckbox: cc.Node = null;
    pathList = [];
    checkBox() {
        var toumappoi
        var poi: cc.Vec2 = null;
        switch (this.checkdir) {
            case "left":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x - this.tou.width, toumappoi.y);
                break;
            case "right":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x + this.tou.width, toumappoi.y);
                break;
            case "up":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x, toumappoi.y + this.tou.height);
                break;
            case "down":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x, toumappoi.y - this.tou.height);
                break;

        }
        // var cankao
        // this.curcheckbox ? cankao = this.curcheckbox : cankao = this.tou;
        for (let i = 0; i < this.map.childrenCount; i++) {
            var boxrect = this.map.children[i].getBoundingBox();
            var script = this.map.children[i].getComponent(mapitem_228)
            // console.log(cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect))
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect) && this.pathList.indexOf(this.map.children[i]) == -1) {
                if (!this.curcheckbox && (script.isuse || script.qiang)) return
                this.pathList[this.pathList.length] = this.map.children[i];
                // this.map.children[i].color = cc.color(63, 243, 247);
                this.map.children[i].getComponent(mapitem_228).isuse = true;
                this.curcheckbox = this.map.children[i];
                this.checkBox();
                break;
            } else if (i == this.map.childrenCount - 1 && this.pathList.length > 0) {
                this.startTouPoi = this.tou.getPosition();
                this.isgo = true;
            }
        }
    }

    checknextlv() {
        if (this.nextLv) {
            this.node.cleanup();
            this.node.destroy();

            var nl = cc.instantiate(this.nextLv);
            nl.parent = cc.find("Canvas")
        } else {
            this.loadend();
        }
    }

    onwin() {
        var handler = () => {

            this.scheduleOnce(() => {
                
               

                if (this.nextLv) {
                    AssetManager.load(GameData.curGameStyle, "end_228", cc.Prefab, null, (UI: cc.Prefab) => {
                        var UINode = cc.instantiate(UI);
                        UINode.parent = this.node;
                        UINode.getComponent(end_228).oninit(true);
                    })
                } else {
                    this.loadend();
                }
            }, 1);
            // }
            // else {
            // }
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
    onlost() {
        // this.unschedule(this.Timeing);
        GameData.PauseGame = true;
        this.node.cleanup();
        this.scheduleOnce(() => {
            AssetManager.load(GameData.curGameStyle, "end_228", cc.Prefab, null, (UI: cc.Prefab) => {
                var UINode = cc.instantiate(UI);
                UINode.parent = this.node;
                UINode.getComponent(end_228).oninit(false);
            })
        }, 0.7);
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, this.nodename, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    };

    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "btn_tiaoguo":
                if (GameData.PauseGame == true) return;
                VideoManager.getInstance().showVideo(() => {
                    // this.node.cleanup();
                    // this.node.destroy();
                    // var nl = cc.instantiate(this.nextLv);
                    // nl.parent = cc.find("Canvas")
                    data_228.isGameing = true;
                    data_228.curLv++;
                    this.checknextlv();
                })
                break;
            case "fanhui":
                this.openpausePanel();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     GameData.getMap = [];
                //     this.node.destroy();
                //     VideoManager.getInstance().showBaoXiang();
                // })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "tishi":
                // var handlers = () => {
                //     cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
                //         var HallnNode = cc.instantiate(tip);
                //         HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv5tip;
                //         HallnNode.parent = cc.find("Canvas");
                //         this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                //         this.isshowVideo = true;
                //     })
                // }
                // this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "btn_pf":
                if (GameData.PauseGame == true) return;
                AssetManager.load(GameData.curGameStyle, "pfpanel_228", cc.Prefab, null, (UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = this.node;
                })
                break;
            case "jiashi2":
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(250);
                })
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => {
                    this.tipsPanel.active = true;
                    GameData.PauseGame = true;
                })
                break;
            case "x":
                this.tipsPanel.active = false;
                GameData.PauseGame = false;
                break;
        }
    }

    loadend() {
        data_228.isGameing = false;
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
        // GameData.PauseGame = true;
        // if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
        this.Timeing();
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }


    Timeing() {
        if (GameData.PauseGame == true || this.startTime == 0) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            // this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
                // this.node.destroy();
            }, 0.7);
        }
    }
}

