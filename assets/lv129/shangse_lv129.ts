

// import Yszc from "../script/SDK_ov/Yszc";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
// import move_shangse from "../script/common/move_shangse";





const { ccclass, property } = cc._decorator;

@ccclass
export default class shangse_lv129 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Label)
    jindutext: cc.Label = null;
    @property(cc.Node)
    btn_win: cc.Node = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Node)
    sz1: cc.Node = null;
    @property(cc.Node)
    sz2: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    huabisk: cc.Node = null;

    public curtarget: cc.Node[] = [];
    public haveColorList: string[] = [];
    public startTime = 258;
    public curTime = 0;
    curlv = 1
    tiezhinum = 0;
    color: string = "ffffff";
    curhuabiname: string;

    onLoad() {
        GameData.PauseGame = false;
        // GameData.startTime = 10;

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.common.Hall_main4, true, 0.7);
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
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.inittargetlist();
        // if (new Date().getTime() - Yszc.levelTimer > Yszc.time * 60 * 60 * 1000) {
        this.jindutext.node.active = true;
        // }
    }
    inittargetlist() {
        if (this.curlv > 1) {
            this.node.getChildByName("bg").getChildByName("clickList" + (this.curlv - 1).toString()).active = false;
            this.node.getChildByName("bg").getChildByName("clickList" + (this.curlv).toString()).active = true;
        }
        this.curtarget = this.node.getChildByName("bg").getChildByName("clickList" + this.curlv.toString()).children;
    }

    checkwin() {
        // if (new Date().getTime() - Yszc.levelTimer < Yszc.time * 60 * 60 * 1000) {
        //     AudioManager.stopEffect()
        //     this.node.cleanup();
        //     // // AudioManager.playEffect(AudioManager.audioName.end);
        //     this.loadend();
        //     this.node.destroy();
        //     return
        // }
        if (this.curlv == 3) {
            AudioManager.stopEffect()
            this.node.cleanup();
            // // AudioManager.playEffect(AudioManager.audioName.end);
            this.loadend();
            this.node.destroy();
        } else {
            this.curlv++;
            this.haveColorList = [];
            this.btn_win.active = false;
            this.jindutext.string = "进度" + this.curlv.toString() + "/3";
            this.inittargetlist();
            GameData.PauseGame = false;
        }
    }
    onTouchStart(even: cc.Event.EventTouch) {
        for (let i = this.curtarget.length - 1; i >= 0; i--) {
            var polo = this.curtarget[i].getComponent(cc.PolygonCollider);
            if (!polo) continue;
            var rect = this.curtarget[i].getComponent(cc.PolygonCollider).points;
            var po = this.curtarget[i].convertToNodeSpaceAR(even.getLocation());
            // console.log(cc.Intersection.pointInPolygon(po, rect))
            if (cc.Intersection.pointInPolygon(po, rect)) {
                this.sz2.active = false;
                var color = cc.color(0, 0, 0, 0);
                cc.Color.fromHEX(color, this.color);
                this.curtarget[i].color = color;
                if (this.haveColorList.indexOf(this.curtarget[i].name) == -1) {
                    this.haveColorList.push(this.curtarget[i].name);
                    if (this.haveColorList.length >= 4) this.btn_win.active = true;
                }
                var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation());
                if (!this.curhuabiname) return
                this.huabisk.getChildByName(this.curhuabiname).active = true;
                this.huabisk.active = true;
                this.huabisk.setPosition(poi);
                this.huabisk.cleanup();
                AudioManager.playEffect("画笔");
                cc.tween(this.huabisk)
                    .to(0.05, { opacity: 255 })
                    .to(0.1, { x: poi.x + 20, y: poi.y + 20 })
                    .to(0.1, { x: poi.x + 10, y: poi.y + 40 })
                    .to(0.1, { x: poi.x + 30, y: poi.y + 60 })
                    .to(0.05, { opacity: 0 })
                    .call(() => {
                        this.huabisk.active = false;
                        this.huabisk.getChildByName(this.curhuabiname).active = false;
                    })
                    .start()
                break;
            }

        }
    }
    onwin() {
        this.tiezhinum++;

        if (this.tiezhinum >= 2) {
            this.btn_win.active = true;
            //     GameData.PauseGame = true;
            //     this.node.cleanup();
            //     this.scheduleOnce(() => {
            //         AudioManager.stopEffect()
            //         // AudioManager.playEffect(AudioManager.audioName.end);
            //         this.loadend();
            //         this.node.destroy();
            //     }, 1);
        }
    }

    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallnNode = cc.instantiate(hall);
                    HallnNode.parent = cc.find("Canvas");
                    GameData.getMap = [];
                    this.node.destroy();
                    VideoManager.getInstance().showBaoXiang();
                })
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
            case "btn_win":
                GameData.PauseGame = true;
                var gou = this.gou;
                var handler = () => {

                    this.scheduleOnce(() => {
                        this.checkwin();
                        // AudioManager.stopEffect()
                        // // AudioManager.playEffect(AudioManager.audioName.end);
                        // this.loadend();
                        // this.node.destroy();
                        gou.scale = 0;
                    }, 1);
                }
                gou.active = true;
                gou.scale = 0;
                AudioManager.playEffect(AudioManager.ql_audio.finishjq)
                cc.Tween.stopAllByTarget(gou);
                cc.tween(gou)
                    .delay(0.5)
                    .to(1.2, { scale: 1.5 })
                    .call(() => {
                        handler && handler();
                    })
                    .start()

                event.currentTarget.active = false;
                break;
        }
    }

    // r = 255;
    // g = 255;
    // b = 255;

    curhuabi: cc.Node = null;
    changeColor2(even: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (this.sz1.active) {
            this.sz1.active = false;
            this.sz2.active = true;
        }
        if (!this.curhuabi) {
            this.curhuabi = even.currentTarget;
            even.currentTarget.y += 50;
        } else {
            this.curhuabi.y -= 50;
            even.currentTarget.y += 50;
            this.curhuabi = null;
            this.curhuabi = even.currentTarget;
        }
        switch (even.currentTarget.name) {
            case "s1":
                this.color = "4d85b7";
                break;
            case "s2":
                this.color = "4b3328";
                break;
            case "s3":
                this.color = "fcfdf7";
                break;
            case "s4":
                this.color = "b90121";
                break;
            case "s5":
                this.color = "31b210";
                break;
            case "s6":
                this.color = "c3a799";
                break;
            case "s7":
                this.color = "000000";
                break;
            case "s8":
                this.color = "a08f5b";
                break;
            case "s9":
                this.color = "dedede";
                break;
        }
        this.curhuabiname = even.currentTarget.name;
    }

    loadend() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");
    }


    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime <= 0 || this.startTime + time <= 0) return
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
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.node.cleanup();
            common.ShowTipsView("时间到！");
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }
}

