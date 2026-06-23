
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems2 from "../script/common/moveItems2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv11 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    stringList: { [key: string]: string } = {
        "zhu": "要做精致猪猪|hz11_2",
        "di": "要炫酷的紫色|hz11_3",
        "qiang": "高级感的墙面|hz11_4",
        "lu": "音乐少女上线啦|hz11_5",
        "deng": "要五颜六色的光|hz11_6",
        "nan": "喜庆的老头子|hz11_7",
        "nv": "嗨起来|hz11_1",
        "zhuo": "待客必备|hz11_8",
        "xi": "这个太落后了|hz11_9"
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    _itemList = [];

    PB: cc.Node;
    lab_pb: cc.Node;

    public curTime = 0;
    public winnum = 0;

    onLoad() {
        GameData.PauseGame = false;
        GameData.startTime = 120;
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

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
        var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
        for (let i = 0; i < this._itemList.length; i++) {
            var item = this._itemList[i];
            if (item.getBoundingBox().contains(poi)) {
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
                if (this._itemList.length == 0) {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/hz/endwin_hz");
                    }, 1.2)
                }
                this.winnum++;
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
            .call(() => {
                if (this._itemList.length == 0) {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/hz/endwin_hz");
                    }, 1)
                }
            })
            .start()
    }
    hiodePB() {

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

