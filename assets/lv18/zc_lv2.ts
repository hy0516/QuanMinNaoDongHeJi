

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";
import zc_config from "../script/zc/zc_config";





const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_lv2 extends BaseGame {

    @property(cc.Node)
    hua: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    view: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    yan: cc.Node = null;


    @property(cc.Node)
    icon: cc.Node = null;


    public startTime = 120;

    public startX = 0;
    public endX = 0;
    public curTime = 0;
    public LevelId: number = 2;

    onLoad() {
        console.log(this.LevelId);
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
    }


    getIcon(): cc.Node {
        let child: cc.Node[] = this.view.children;
        return child[GameData.getMap.length];
    }

    show_qp(name: string, audio: string) {
        var list = zc_config.lv2qp[name].split("|");
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
        this.node.getChildByName("bg").getChildByName("qipao").active = false;
        this.node.getChildByName("bg").getChildByName("qipao2").active = false;
        this.node.getChildByName("bg").getChildByName("qipao3").active = false;

        if (GameData.getMap.length == this.view.childrenCount) {
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                AudioManager.stopEffect();
                this.loadend();
                this.node.destroy();
            }, 1)
        }
    }


    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "hezi":
                var tar = this.hua.getChildByName("hezi");
                AudioManager.playEffect("zclv2_1");
                this.tweenState2(even, tar, "hua", () => {
                    tar.active = false;
                })
                break;
            case "btn_hua":
                var cao = even.currentTarget;
                cao.getComponent(cc.Button).enabled = false;
                var caox = cao.x
                var caoy = cao.y
                AudioManager.playEffect("zclv2_13");
                cc.Tween.stopAllByTarget(cao);
                cc.tween(cao)
                    .to(0.4, { x: caox - 80 })
                    .to(0.4, { y: caoy - 60 })
                    .delay(0.2)
                    .call(() => {

                        this.hua.getChildByName("btn_hezi").getComponent(cc.Button).enabled = true;
                        AudioManager.playEffect(AudioManager.audioName.find);
                    })
                    .start();
                break;
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
                        HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv2tip;
                        HallnNode.parent = cc.find("Canvas");
                        this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                        this.isshowVideo = true;
                    })
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "btn_hezi":
                var yan = this.hua.parent.getChildByName("sk_yan");
                yan.position = this.hua.position;
                yan.active = true;
                yan.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                this.hua.getChildByName("btn_hezi").getComponent(cc.Button).enabled = false;
                this.hua.getChildByName("hezi").active = true;
                AudioManager.playEffect(AudioManager.audioName.find);
                break;
        }
    }

    isshowVideo = false;
    tweenState2(event: cc.Event.EventTouch, tar: cc.Node, name: string, handler?: Function, audio?: string) {
        if (GameData.PauseGame == true) return
        GameData.PauseGame = true;
        // AudioManager.playEffect(AudioManager.audioName.find);
        this.show_qp(name, audio);
        let endnode = this.getIcon();
        //@ts-ignore
        this.icon.position = this.node.convertToNodeSpaceAR(event.getLocation());
        var chil = tar.getChildByName("chil")
        if (!chil) {
            this.icon.getComponent(cc.Sprite).spriteFrame = tar.getComponent(cc.Sprite).spriteFrame;
        } else {
            this.icon.getComponent(cc.Sprite).spriteFrame = chil.getComponent(cc.Sprite).spriteFrame;
        }
        this.icon.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("guang", 1);
        this.icon.active = true;
        handler && handler();
        cc.tween(this.icon)
            .to(0.5, { position: new cc.Vec3(0, 0), scale: 1.5 })
            .delay(0.7)
            .to(0.5, { position: endnode.position, scale: 0.6 })
            .call(() => {
                AssetManager.load( GameData.curGameStyle,  zc_config.lv2[name], cc.SpriteFrame,null, ( img: cc.SpriteFrame) => {
                    endnode.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = img;
                    GameData.getMap.push(name);
                    cc.Tween.stopAllByTarget(this.icon);
                    this.icon.active = false;
                    GameData.PauseGame = false;
                    this.close_qp();
                    // this.show_qp2(name);
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
        // console.log(this.startTime)
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            console.log(this.startTime)
            // this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 1);
        }
    }
}

