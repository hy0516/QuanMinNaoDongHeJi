
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveItems2 from "../script/common/moveItems2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv14 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    stringList: { [key: string]: string } = {
        "mt": "马桶真好用|hz14_1",
        "cln": "我还在洗澡啊|hz14_2",
        "goup": "旺财加油|hz14_3",
        "xyj": "这样洗更干净|hz14_4",
        "mian": "我喜欢加料|hz14_5",
        "zl": "小强加油|hz14_6",
        "ysj": "泡一会就干净了|hz14_7",
        "nver": "宝宝长大能帮忙了|hz14_8",
        "nv": "谁这么能吃|hz14_9",
        "nv1": "再给我碗，日子别过了|hz14_10"
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    men: cc.Node = null;

    @property(cc.Node)
    nver: cc.Node = null;

    @property(cc.Node)
    nv: cc.Node = null;

    @property(cc.Node)
    yinger: cc.Node = null;

    @property(cc.Node)
    shalou: cc.Node = null;

    @property(cc.Node)
    qp: cc.Node = null;

    @property(cc.Node)
    qp2: cc.Node = null;

    @property(cc.Node)
    qp3: cc.Node = null;

    _itemList = [];
    nvtime = 0;



    PB: cc.Node;
    lab_pb: cc.Node;

    public curTime = 0;
    public winnum = 10;

    onLoad() {
        GameData.PauseGame = false;
        GameData.startTime = 60;
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

    openMen() {
        cc.Tween.stopAllByTarget(this.men);
        var x = this.men.x;
        var width = this.men.width;
        cc.tween(this.men)
            .to(0.6, { x: x + width })
            .call(() => {
                this.men.active = false;
            })
            .start()
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
        var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
        if (type == 2) {
            if (this.yinger.getBoundingBox().contains(poi)) {
                even.currentTarget.active = false;
                this.yinger.active = false;
                this.nver.active = true;
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                // this.curTime++;
            } else {
                even.currentTarget.getComponent(moveItems2).restart();
            }

            return;
        }
        for (let i = 0; i < this._itemList.length; i++) {
            var item = this._itemList[i];
            if (item.getBoundingBox().contains(poi) && item.active == true) {
                if (item.name == "nv") {
                    switch (this.nvtime) {
                        case 0:
                            item.getChildByName("state1").active = true;
                            this.nvtime++;
                            this.curTime++;
                            even.currentTarget.destroy();
                            var lab = this.stringList["nv"].split("|");
                            this.showPB(lab[0]);
                            AudioManager.playEffect(lab[1]);
                            AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                            break;
                        case 1:
                            item.getChildByName("state1").active = false;
                            item.getChildByName("state2").active = true;
                            even.currentTarget.destroy();
                            var lab = this.stringList["nv1"].split("|");
                            this.showPB(lab[0]);
                            AudioManager.playEffect(lab[1]);
                            this.nvtime++;
                            this.curTime++;
                            if (this.curTime == this.winnum) {
                                this.scheduleOnce(() => {
                                    this.endwin("prefabs/hz/endwin_hz");
                                }, 1.8)
                            }
                            break;
                        case 2:
                            item.getChildByName("sq").active = true;
                            setTimeout(() => {
                                this.endlost("prefabs/hz/endlost_hz");
                            }, 600);
                            break;
                    }

                    var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                    // @ts-ignore
                    yansk.position = poi
                    yansk.active = true;
                    yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                    return
                }
                if (item.name == "cln" && this.men.active) {
                    even.currentTarget.getComponent(moveItems2).restart();
                    return
                }
                if (item.name == "mt" && this.men.active) {
                    even.currentTarget.getComponent(moveItems2).restart();
                    return
                }
                even.currentTarget.destroy();
                item.getChildByName("state1").active = false;
                item.getChildByName("state2").active = true;
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                var lab = this.stringList[item.name].split("|");
                this.showPB(lab[0]);

                AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                AudioManager.playEffect(lab[1]);
                this._itemList.splice(i, 1)
                this.curTime++;
                if (this.curTime == this.winnum) {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/hz/endwin_hz");
                    }, 1.8)
                }
                break;
            }
            if (i == this._itemList.length - 1) {
                even.currentTarget.getComponent(moveItems2).restart();
            }
        }
    }




    showPB(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            // .call(() => {
            //     if (this._itemList.length == 0) {
            //         this.scheduleOnce(() => {
            //             this.endwin("prefabs/hz/endwin_hz");
            //         }, 1)
            //     }
            // })
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

