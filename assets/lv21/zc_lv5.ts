

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";




const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_lv5 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    view: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    icon: cc.Node = null;


    public startTime = 100;

    public startX = 0;
    public endX = 0;
    public curTime = 0;



    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
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
        // this.updateGameNum(0);
    }

    bg1() {
        if (GameData.PauseGame == true) return
        this.node.getChildByName("bg1").active = true;
        this.node.getChildByName("bg2").active = false;
        this.node.getChildByName("bg").getChildByName("clickList1").active = true;
        this.node.getChildByName("bg").getChildByName("clickList2").active = false;
    }

    bg2() {
        if (GameData.PauseGame == true) return
        this.node.getChildByName("bg1").active = false;
        this.node.getChildByName("bg2").active = true;
        this.node.getChildByName("bg").getChildByName("clickList1").active = false;
        this.node.getChildByName("bg").getChildByName("clickList2").active = true;
    }

    getIcon(): cc.Node {
        let child: cc.Node[] = this.view.children;
        return child[GameData.getMap.length];
    }

    show_qp(name: string, audio: string) {
        return
        var list = zc_config.lv3qp[name].split("|");
        var qp;
        switch (list[1]) {
            case "1":
                qp = this.node.getChildByName("bg").getChildByName("qipao");
                break;
            case "2":
                qp = this.node.getChildByName("bg").getChildByName("qipao2");
                break;
            case "3":
                qp = this.node.getChildByName("bg").getChildByName("qipao3");
                break;
        }
        qp.active = true;
        AudioManager.playEffect(audio);
        qp.getChildByName("qpLab").getComponent(cc.Label).string = list[0];
    }

    close_qp() {
        // return
        // this.node.getChildByName("bg").getChildByName("qipao").active = false;
        // this.node.getChildByName("bg").getChildByName("qipao2").active = false;
        // this.node.getChildByName("bg").getChildByName("qipao3").active = false;

        //  this.loadend();
        //  this.node.destroy();
        //  return

        if (GameData.getMap.length == this.view.childrenCount) {
            // if (this.curNum >= this.totalNum) {
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                AudioManager.stopEffect()
                // AudioManager.playEffect(AudioManager.audioName.end);
                this.loadend();
                this.node.destroy();
            }, 1);
            // } else {
            //     common.ShowTipsView("人数未找齐")
            //     GameData.PauseGame = true;
            //     this.node.cleanup();
            //     this.scheduleOnce(() => {
            //         AudioManager.stopEffect()
            //         this.endlost("prefabs/zc/zc_lostend")
            //         this.node.destroy();
            //     }, 3);
            // }
        }
    }


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
                var handlers = () => {
                    cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
                        var HallnNode = cc.instantiate(tip);
                        HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv5tip;
                        HallnNode.parent = cc.find("Canvas");
                        this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                        this.isshowVideo = true;
                    })
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "fssk_handler":
                // this.yingsk.active = false;
                // var icon = this.node.getChildByName("daoju3");
                // this.tweenState2(event, icon, "fenshen", () => {
                //     this.yingnode.active = false;
                // }, "zclv3_12");
                break;
        }
    }

    isshowVideo = false;
    tweenState2(event: cc.Event.EventTouch, tar: cc.Node, name: string, handler?: Function, audio?: string) {
        // if (GameData.PauseGame == true) return
        // GameData.PauseGame = true;
        this.show_qp(name, audio);
        let endnode = this.getIcon();
        //@ts-ignore
        this.icon.position = this.node.convertToNodeSpaceAR(event.getLocation());
        var chil = tar.getChildByName("chil");
        if (!chil) {
            this.icon.getComponent(cc.Sprite).spriteFrame = tar.getComponent(cc.Sprite).spriteFrame;
        } else {
            this.icon.getComponent(cc.Sprite).spriteFrame = chil.getComponent(cc.Sprite).spriteFrame;
        }
        this.icon.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("guang", 1);
        this.icon.active = true;
        handler && handler();
        var url = zc_config.lv5[name].split("|");
        cc.tween(this.icon)
            .delay(0.4)
            .to(0.4, { position: new cc.Vec3(0, 0), scale: 1.2 })
            .delay(0.5)
            .to(0.4, { position: endnode.position, scale: 1 })
            .call(() => {
                AssetManager.load( GameData.curGameStyle,  url[0], cc.SpriteFrame,null, ( img: cc.SpriteFrame) => {
                    endnode.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = img;
                    endnode.getChildByName("num").getComponent(cc.Label).string = url[1];
                    // this.curNum += Number(url[1]);
                    GameData.getMap.push(name);
                    cc.Tween.stopAllByTarget(this.icon);
                    this.icon.active = false;
                    // common.ShowTipsView(url[1]);
                    // this.updateGameNum(Number(url[1]));
                    // console.log(this.curNum)
                    this.close_qp();
                    GameData.PauseGame = false;
                })
            })
            .start()
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
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }
}

