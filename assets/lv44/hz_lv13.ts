
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveItems2 from "../script/common/moveItems2";
import moveTarget from "../script/common/moveTarget";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv13 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    stringList: { [key: string]: string } = {
        "xiaomei": "冲冲冲|hz13_1",
        "ye": "这是啥|hz13_2",
        "nai": "拿开|hz13_3",
        "wand": "拿开|hz13_4",
        "mieh": "拿开|hz13_5",
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    ye: cc.Node = null;
    @property(cc.Node)
    nai1: cc.Node = null;
    @property(cc.Node)
    nai2: cc.Node = null;
    @property(cc.Node)
    diren: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;

    _itemList = [];



    PB: cc.Node;
    lab_pb: cc.Node;

    public curTime = 0;
    public winnum = 12;

    onLoad() {
        GameData.PauseGame = false;
        GameData.startTime = 90;
        this._itemList = this.itemList;
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.stopMusic()
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        // AudioManager.playEffect("hz4_12");
        // this.showPB("时间都去哪了");
        cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.2)
            )
            .start()
    }

    enemyLv = 0;
    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch, handler: Function): void {
        // console.log(this.curTime)
        var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
        if (type == 2) {
            if (this.nai1.active && this.nai1.getBoundingBox().contains(poi)) {
                even.currentTarget.active = false;
                even.currentTarget.destroy();
                this.nai1.active = false;
                this.nai2.active = true;
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                this.curTime++;
            } else if (this.ye.active && this.ye.getBoundingBox().contains(poi)) {
                even.currentTarget.active = false;
                even.currentTarget.destroy();

                this.ye.getChildByName("state1").active = false;
                this.ye.getChildByName("state2").active = true;
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                this.curTime++;
            } else {
                even.currentTarget.getComponent(moveItems2).restart();
            }
            return;
        }
        if (type == 3) {
            if (this.nai2.active && this.nai2.getBoundingBox().contains(poi)) {
                even.currentTarget.destroy();
                this.nai2.getChildByName("mieh").active = true;
                AudioManager.playEffect("hz13_5");
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                this.scheduleOnce(() => {
                    if (this.enemyLv == 0) {
                        this.diren.getComponent(dragonBones.ArmatureDisplay).playAnimation("jsw2", -1);
                    } else {
                        this.diren.getComponent(dragonBones.ArmatureDisplay).playAnimation("jsw3", -1);
                    }
                    this.nai2.getChildByName("mieh").active = false;
                    this.enemyLv++;
                }, 1.5)
                this.curTime++;
                if (this.curTime == this.winnum) {
                    this.scheduleOnce(() => {
                        this.openwin();
                    }, 1.5)
                }
            } else {
                even.currentTarget.getComponent(moveItems2).restart();
            }
            return
        } if (type == 4) {
            if (this.nai2.active && this.nai2.getBoundingBox().contains(poi)) {
                even.currentTarget.destroy();
                this.nai2.getChildByName("wand").active = true;
                AudioManager.playEffect("hz13_4");
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                this.scheduleOnce(() => {
                    if (this.enemyLv == 0) {
                        this.diren.getComponent(dragonBones.ArmatureDisplay).playAnimation("jsw2", -1);
                    } else {
                        this.diren.getComponent(dragonBones.ArmatureDisplay).playAnimation("jsw3", -1);
                    }
                    this.nai2.getChildByName("wand").active = false;
                    this.enemyLv++;
                }, 1.5)
                this.curTime++;
                if (this.curTime == this.winnum) {
                    this.scheduleOnce(() => {
                        this.openwin();
                    }, 1.5)
                }
            } else {
                even.currentTarget.getComponent(moveItems2).restart();
            }
            return
        }
        for (let i = 0; i < this._itemList.length; i++) {
            var item = this._itemList[i];
            if (item.getBoundingBox().contains(poi)) {


                if (item.name == "nai") {
                    var lab = this.stringList["nai"].split("|");
                    if (lab) {
                        this.showPB(lab[0]);
                        AudioManager.playEffect(lab[1]);
                    }
                    even.currentTarget.getComponent(moveItems2).restart();
                    return
                }
                if (item.name == "nan") {
                    var lab = this.stringList["ye"].split("|");
                    if (lab) {
                        this.showPB(lab[0]);
                        AudioManager.playEffect(lab[1]);
                    }
                    even.currentTarget.getComponent(moveItems2).restart();
                    return
                }
                var itemscr = item.getComponent(moveTarget);
                if (itemscr) itemscr.movehandler();
                even.currentTarget.destroy();
                item.getChildByName("state1").active = false;
                item.getChildByName("state2").active = true;
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                if (this.stringList[item.name]) {
                    var lab = this.stringList[item.name].split("|");
                    if (lab) {
                        this.showPB(lab[0]);
                        AudioManager.playEffect(lab[1]);
                    }
                }
                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                this._itemList.splice(i, 1)
                this.curTime++;
                if (this.curTime == this.winnum) {
                    this.openwin();
                }
                handler && handler()
                break;
            }
            if (i == this._itemList.length - 1) {
                even.currentTarget.getComponent(moveItems2).restart();
            }
        }
    }

    openwin() {
        var gou = this.gou;
        var handler = () => {
            GameData.PauseGame = true;
            this.node.cleanup();
            this.endwin("prefabs/hz/endwin_hz");
        }
        gou.active = true;
        gou.scale = 0;
        AudioManager.playEffect(AudioManager.ql_audio.finishjq)
        cc.Tween.stopAllByTarget(gou);
        cc.tween(gou)
            .to(1.2, { scale: 1 })
            .delay(0.8)
            .call(() => {
                handler && handler();
            })
            .start()
    }


    showPB(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            .start()
    }


    hidetips() {
        this.node.getChildByName("tipsNode").active = false;
    }
    showTip() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        if (this.isshowVideo) {
            this.node.getChildByName("tipsNode").active = true;
            this.isshowVideo = true;
            VideoManager.getInstance().showInsert();
        } else {
            VideoManager.getInstance().showVideo(() => {
                this.node.getChildByName("tipsNode").active = true;
                this.node.getChildByName("bg").getChildByName("bg2").getChildByName("btn_tips").getChildByName("luxiang").active = false;
                this.isshowVideo = true;
                VideoManager.getInstance().showInsert();
            })
        }
    }

    isshowVideo = false;
    fanhui() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showBaoXiang();
        })
    }


    addTime(even: TouchEvent, time?: number) {
        if (GameData.startTime + time <= 0) return

        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // GameData.PauseGame = true;
        var addtime
        time ? addtime = time : addtime = 60;
        GameData.startTime += addtime;
        this.Timeing();
        var fuhao = "";
        if (addtime > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
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

    btn_addTime() {
        // if (GameData.startTime + 60 <= 0) return
        VideoManager.getInstance().showVideo(() => {
            this.addTime(null);
        })
    }

    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.addTime(null, 100)
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            this.unschedule(this.Timeing);
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }


}

