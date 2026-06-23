

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import move_pt from "../script/common/move_pt";
import move_tiezhi from "../script/common/move_tiezhi";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";




const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_lv13 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;


    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;


    // @property(cc.Node)
    // icon: cc.Node = null;
    // @property(cc.Node)
    // clicklist: cc.Node = null;

    @property(cc.Node)
    photo: cc.Node = null;

    public startTime = 120;
    public curTime = 0;

    tiezhinum = 0;

    style = 0;
    box: cc.Node = null;


    public curpt: cc.Node = null;

    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.common.Hall_main, true, 0.7);
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
            .delay(1.5)
            .call(() => {
                this.photo.parent.parent.getChildByName("shouzhi").active = false;
            })
            .start()
        this.box = this.photo.parent.getChildByName("dc");
        for (let i = 0; i < this.box.childrenCount; i++) {
            var manode = new cc.Node();
            var sf = this.photo.getComponent(cc.Sprite);
            var phnode = new cc.Node();
            phnode.addComponent(cc.Sprite).spriteFrame = sf.spriteFrame;
            var newsp = manode.addComponent(cc.Mask);
            newsp.type = cc.Mask.Type.IMAGE_STENCIL;
            var dcitem = this.photo.parent.getChildByName("dc").getChildByName("dc" + (i + 1).toString());
            manode.width = dcitem.width;
            manode.height = dcitem.height;
            manode.addChild(phnode);
            manode.parent = this.photo.parent;
            newsp.spriteFrame = dcitem.getComponent(cc.Sprite).spriteFrame;

            manode.position = this.photo.parent.getChildByName("dcdi").getChildByName("dc" + (i + 1).toString()).position;
            manode.setScale(new cc.Vec2(0.8, 0.8));
            phnode.position = dcitem.children[0].position;
            this.curpt = manode;
            var script = this.curpt.addComponent(move_pt)
            script.target.push(this.photo.parent.getChildByName("dcd").getChildByName("dc" + (i + 1).toString()));
            script.main = this.photo.parent.parent;
            script.isbig = true;
        }
    }


    onwin() {
        this.tiezhinum++;
        if (this.tiezhinum >= this.box.childrenCount) {
            var gou = this.photo.parent.parent.getChildByName("gou");
            var handler = () => {
                GameData.PauseGame = true;
                this.node.cleanup();
                this.scheduleOnce(() => {
                    AudioManager.stopEffect()
                    // AudioManager.playEffect(AudioManager.audioName.end);
                    this.loadend();
                    this.node.destroy();
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
            // .call(() => {
            // GameData.PauseGame = false;
            // })
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

