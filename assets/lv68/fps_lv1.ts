

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";
import fps_lvitem from "./fps_lv1item";




const { ccclass, property } = cc._decorator;
enum music {
    关卡背景fps1 = "关卡背景fps1",
    开枪 = "开枪",
}

@ccclass
export default class fps_lv1 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;


    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    icon: cc.Node = null;
    @property(cc.Node)
    clicklist: cc.Node = null;
    @property(cc.Node)
    itemStart: cc.Node = null;
    @property(cc.Prefab)
    moveItem: cc.Prefab = null;
    @property(cc.Node)
    roleSk: cc.Node = null;
    @property(cc.Node)
    ZX: cc.Node = null;
    @property(cc.Node)
    bulletCount: cc.Node = null;






    public startTime = 150;
    public curTime = 0;

    tiezhinum = 0;



    level: number = 0;
    itemCount: number[] = [10, 10, 10, 15];
    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(music.关卡背景fps1, true, 0.7);
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
        GameData.PauseGame = false;
        this.node.getChildByName("bg").getChildByName("bg0").active = false;
        this.node.getChildByName("bg").getChildByName("bg1").active = false;
        this.node.getChildByName("bg").getChildByName("bg2").active = false;
        this.node.getChildByName("bg").getChildByName("bg3").active = false;
        this.node.getChildByName("bg").getChildByName("bg" + this.level.toString()).active = true;

        // this.updateGameNum(0);
        // for (let i = 0; i < this.icon.childrenCount; i++) {
        //     var item = this.icon.children[i];
        //     var scr: move_tiezhi = item.addComponent(move_tiezhi);
        //     scr.target = this.clicklist.children[i];
        //     scr.main = this.node;
        //     console.log(item.name)
        // }
        // this.xinshou();
        this.roleSk.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame('kq', 0);
    }
    curCloneTime: number = 0;
    cloneTime: number = 60;
    nowItemCount: number = 0;
    targetPool: cc.Node[] = [];
    update(dt: number): void {
        if (GameData.PauseGame == true) return;
        this.curCloneTime++;
        if (this.curCloneTime >= this.cloneTime) {
            this.CreateMoveItem();
            this.curCloneTime = 0;
        }
        this.bulletCount.getComponent(cc.Label).string = "X" + this.bullet;
    }
    CreateMoveItem() {
        var shouldCount: number = this.itemCount[this.level];
        for (let a = 0; a < this.targetPool.length; a++) {
            if (!this.targetPool[a].parent) this.targetPool.splice(a, 1);
        }
        if (this.nowItemCount >= shouldCount) {
            if (this.targetPool.length == 0) {
                this.nowItemCount = 0;
                this.updateLevel();
            }
            return
        };
        this.nowItemCount++;
        var item = cc.instantiate(this.moveItem);
        item.parent = this.itemStart;
        this.targetPool.push(item.getChildByName("targetNode"));
        item.position = new cc.Vec3(0, 0, 0);
        var data = {}
        if (this.level == 1 || this.level == 3) {
            data = { speed: 9 };
        }
        item.getComponent(fps_lvitem).init(data);
        if (this.level == 2 || this.level == 3) {
            this.cloneTime = 30;
        } else this.cloneTime = 60;
        if (this.level != 0) {
            var maxNumber = 20
            if (this.level == 2) maxNumber = 15
            var dependNumber = Math.random() * maxNumber;
            if (Math.random() > 0.3) this.cloneTime -= dependNumber;
            else this.cloneTime += dependNumber;
        }
    }
    islost: boolean = false;
    updateLevel(level?: number) {
        if (this.isShoot < this.itemCount[this.level]) {
            // this.unschedule(this.Timeing);
            // GameData.PauseGame = true;
            // this.node.cleanup();
            // this.scheduleOnce(() => {
            //     this.endlost("prefabs/zc/zc_lostend")
            //     this.node.destroy();
            // }, 0.7);
            // return;
            this.islost = true;
            this.node.getChildByName("jiesuan").getChildByName("magicButtle").active = false;
            this.node.getChildByName("jiesuan").getChildByName("jiazidan").active = false;
            this.node.getChildByName("jiesuan").getChildByName("continue").getChildByName("continueLab").getComponent(cc.Label).string = "重来";
        }
        this.level++;
        if (this.level == 3) this.tittle.getChildByName("tittle").getComponent(cc.Label).string = "打爆十五个瓶子"
        this.guochang();
        this.curCloneTime = 0;

        this.bullet = this.itemCount[this.level];
    }
    onlost() {
        this.unschedule(this.Timeing);
        GameData.PauseGame = true;
        this.node.cleanup();
        this.scheduleOnce(() => {
            // this.endlost("prefabs/zc/zc_lostend")
            this.node.destroy();
            AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
                var HallnNode = cc.instantiate(name);
                HallnNode.parent = cc.find("Canvas");
                GameData.onDele();
                GameData.PauseGame = false;
                // this.node.destroy();
            })
        }, 0.7);
        return;
    }
    guochang() {
        GameData.PauseGame = true;
        var guochangbg = this.node.getChildByName("bg").getChildByName("guochangBg");
        var jiesuan = this.node.getChildByName("jiesuan");
        var fen = jiesuan.getChildByName("fenshu").getComponent(cc.Label);
        var fen2 = jiesuan.getChildByName("fenshucopy").getComponent(cc.Label);
        guochangbg.active = true;
        guochangbg.opacity = 0;
        cc.tween(guochangbg).to(0.5, { opacity: 255 }).start();
        jiesuan.active = true;
        fen.string = this.itemCount[this.level - 1] + "中" + this.isShoot;
        fen2.string = this.itemCount[this.level - 1] + "中" + this.isShoot;
        this.isShoot = 0;
        this.node.getChildByName("bg").getChildByName("bg0").active = false;
        this.node.getChildByName("bg").getChildByName("bg1").active = false;
        this.node.getChildByName("bg").getChildByName("bg2").active = false;
        this.node.getChildByName("bg").getChildByName("bg3").active = false;
        if (this.level == 4) return;
        this.node.getChildByName("bg").getChildByName("bg" + this.level.toString()).active = true;
    }

    onwin() {
        this.tiezhinum++;
        // if (this.tiezhinum >= this.icon.childrenCount) {
        GameData.PauseGame = true;
        this.node.cleanup();
        this.scheduleOnce(() => {
            AudioManager.stopEffect()
            // AudioManager.playEffect(AudioManager.audioName.end);
            this.loadend();
            this.node.destroy();
        }, 0.1);
        // }
    }

    isShoot: number = 0;
    bullet: number = 12;
    attScope: number = 42;
    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true && event.currentTarget.name != "fanhui" && event.currentTarget.name != "continue" && event.currentTarget.name != "shoot" && event.currentTarget.name != "jiazidan" && event.currentTarget.name != "magicButtle") return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "shoot":
                if (GameData.PauseGame == true) {
                    if (this.islost) {
                        this.onlost();
                        return;
                    }
                    if (!this.node.getChildByName("jiesuan").active) return;
                    if (this.level == 4) this.onwin();
                    GameData.PauseGame = false;
                    this.node.getChildByName("bg").getChildByName("xinshou").active = false;
                    this.node.getChildByName("jiesuan").active = false;
                    cc.tween(this.node.getChildByName("bg").getChildByName("guochangBg")).to(0.5, { opacity: 0 }).call(() => { GameData.PauseGame = false; }).start();
                    return;
                }
                var roleSk = this.roleSk.getComponent(dragonBones.ArmatureDisplay);
                // if (this.isShoot != 0 && roleSk.armature().animation._animationStates[0]._actionTimeline.currentTime < 0.32) return;
                if (this.bullet > 0) this.bullet--;
                else return;
                AudioManager.playEffect(music.开枪);
                cc.tween(this.ZX.getChildByName("zx_sk")).to(0.05, { y: 30 }).start();
                cc.tween(this.ZX.getChildByName("zx_sk")).delay(0.05).to(0.1, { y: 0 }).start();
                if (this.node.getChildByName("bg").getChildByName("xinshou").active) this.node.getChildByName("bg").getChildByName("xinshou").active = false;
                roleSk.playAnimation("kq", 1);
                var poi = this.ZX.position;
                this.ZX.zIndex = 50;
                for (let a = 0; a < this.targetPool.length; a++) {
                    if (!this.targetPool[a].parent) continue;
                    if (Math.abs(this.targetPool[a].parent.x - poi.x) < this.attScope) {
                        this.targetPool[a].parent.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("jp", 1);
                        this.isShoot++;
                    }
                }
                break;
            case "continue":
                if (GameData.PauseGame == false) return;
                if (!this.node.getChildByName("jiesuan").active) return;
                if (this.islost) {
                    this.onlost();
                    return;
                }
                if (this.level == 4) {
                    this.onwin();
                    return;
                }
                this.node.getChildByName("jiesuan").active = false;
                cc.tween(this.node.getChildByName("bg").getChildByName("guochangBg")).to(0.5, { opacity: 0 }).call(() => { GameData.PauseGame = false; }).start();
                break;
            case "magicButtle":
                if (this.attScope == 42) this.attScope = 70;
                else return;
                VideoManager.getInstance().showVideo(() => {
                    this.ZX.getChildByName("zx_sk").skewX = 3;
                    this.ZX.getChildByName("zx_sk").skewY = 3;
                    cc.tween(event.currentTarget).to(0.5, { opacity: 0 }).call(() => { event.currentTarget.active = false; }).start();
                })
                break;
            case "jiazidan":
                VideoManager.getInstance().showVideo(() => {
                    common.ShowTipsView("子弹+5");
                    this.bullet += 5;
                    this.bulletCount.getComponent(cc.Label).string = "X" + this.bullet.toString();
                })
                break;
            case "fanhui":
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallnNode = cc.instantiate(hall);
                    HallnNode.parent = cc.find("Canvas");
                    GameData.getMap = [];
                    VideoManager.getInstance().showBaoXiang();
                    this.node.destroy();
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
                        VideoManager.getInstance().showInsert();
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

