

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";





const { ccclass, property } = cc._decorator;

@ccclass
export default class shjajs_258 extends BaseGame {
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    tipsPanel: cc.Node = null;
    @property(cc.Node)
    g: cc.Node = null;
    camereList = [];
    public startTime = 300;
    public curTime = 0;
    tipsindex = 0;
    tiezhinum = 0;
    step = 1;


    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景", false, 0.5);
        }, 0.5)
        this.node.getChildByName("bg").getChildByName("btn_cam").y -= 100;
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
        this.node.on("CheckWuTai", this.checkWuTai, this);
    }
    checkWuTai() {
        var wutai = this.node.getChildByName("bg").getChildByName("舞台");
        if (this.step == 1) {
            if (wutai.childrenCount >= 5) this.node.getChildByName("bg").getChildByName("next").active = true;
            else this.node.getChildByName("bg").getChildByName("next").active = false;
        } else if (this.step == 2) {
            if (wutai.childrenCount >= 9) {
                this.node.getChildByName("bg").getChildByName("complet").active = true;
                this.node.getChildByName("bg").getChildByName("btn_cam").active = true;
            }
            else {
                this.node.getChildByName("bg").getChildByName("btn_cam").active = false;
                this.node.getChildByName("bg").getChildByName("complet").active = false;
            }
        }
    }
    onwin() {
        var handler = () => {
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
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     GameData.getMap = [];
                //     this.node.destroy();
                //     // VideoManager.getInstance().showBaoXiang();
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
            case "next":
                if (GameData.PauseGame == true) return
                event.currentTarget.active = false;
                var wuping = this.node.getChildByName("bg").getChildByName("wuping");
                var wutai = this.node.getChildByName("bg").getChildByName("舞台");
                var peishi1 = this.node.getChildByName("bg").getChildByName("peishi1");
                for (let i = 0; i < wutai.childrenCount; i++) {
                    var chil = wutai.children[i];
                    chil.emit("TouchCancel");
                }
                this.step++;
                // this.node.getChildByName("bg").getChildByName("right").active = true;
                cc.tween(wuping)
                    .to(0.3, { x: -1280 })
                    .start();
                cc.tween(peishi1)
                    .to(0.3, { x: 0 })
                    .start(); 
                break;
            case "complet":
                if (GameData.PauseGame == true) return
                event.currentTarget.active = false;
                this.onwin();
                break;
            case "left":
                if (GameData.PauseGame == true) return
                var peishi1 = this.node.getChildByName("bg").getChildByName("peishi1");
                var peishi2 = this.node.getChildByName("bg").getChildByName("peishi2");
                cc.tween(peishi1)
                    .to(0.3, { x: 0 })
                    .call(() => {
                        this.node.getChildByName("bg").getChildByName("right").active = true;
                    })
                    .start();
                cc.tween(peishi2)
                    .to(0.3, { x: 1280 })
                    .start();
                event.currentTarget.active = false;
                break;
            case "right":
                if (GameData.PauseGame == true) return
                var peishi1 = this.node.getChildByName("bg").getChildByName("peishi1");
                var peishi2 = this.node.getChildByName("bg").getChildByName("peishi2");
                cc.tween(peishi1)
                    .to(0.3, { x: -1280 })
                    .call(() => {
                        this.node.getChildByName("bg").getChildByName("left").active = true;
                    })
                    .start();
                cc.tween(peishi2)
                    .to(0.3, { x: 0 })
                    .start();
                event.currentTarget.active = false;
                break;
            case "btn_cam":
                if (GameData.PauseGame == true) return
                this.camereList = [];
                GameData.PauseGame = true;
                AudioManager.playEffect("拍照");
                for (let y = 0; y < this.node.getChildByName("bg").childrenCount; y++) {
                    var item = this.node.getChildByName("bg").children[y];
                    if (item.name == "舞台") continue;
                    if (item.active) {
                        item.active = false;
                        this.camereList.push(item);
                    }
                }
                this.scheduleOnce(() => {
                    for (let y = 0; y < this.camereList.length; y++) {
                        var item = this.camereList[y];
                        item.active = true;
                    }
                    GameData.PauseGame = false;
                }, 5)
                break;
            case "jiashi2":
                VideoManager.getInstance().report("tipsVideo", { name: GameData.curGameName, complet: 1 })
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(250);
                })
                break;
            case "tips2":
                VideoManager.getInstance().report("tipsVideo", { name: GameData.curGameName, complet: 0 })
                VideoManager.getInstance().showVideo(() => {
                    this.tipsPanel.active = true;
                    GameData.PauseGame = true;
                })
                break;
            case "x":
                this.tipsPanel.active = false;
                GameData.PauseGame = false;
                break;
            case "tipsleft":
                var tipsnode = this.tipsPanel.getChildByName("tipstexture");
                if (this.tipsindex != 0) {
                    this.tipsPanel.getChildByName("tipstexture").children[this.tipsindex].active = false;
                    this.tipsindex--;
                    this.tipsPanel.getChildByName("tipstexture").children[this.tipsindex].active = true;
                    if (this.tipsindex == 0) event.currentTarget.active = false;
                    if (this.tipsindex < tipsnode.childrenCount - 1) this.tipsPanel.getChildByName("tipsright").active = true;
                }
                break;
            case "tipsright":
                var tipsnode = this.tipsPanel.getChildByName("tipstexture");
                if (this.tipsindex < tipsnode.childrenCount - 1) {
                    this.tipsPanel.getChildByName("tipstexture").children[this.tipsindex].active = false;
                    this.tipsindex++;
                    this.tipsPanel.getChildByName("tipstexture").children[this.tipsindex].active = true;
                    if (this.tipsindex == tipsnode.childrenCount - 1) event.currentTarget.active = false;
                    if (this.tipsindex > 0) this.tipsPanel.getChildByName("tipsleft").active = true;
                }
                break;
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
        // GameData.PauseGame = true;
        // if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
        this.Timeing();
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255})
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

