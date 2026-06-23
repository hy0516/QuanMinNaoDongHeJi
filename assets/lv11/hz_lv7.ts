
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems2 from "../script/common/moveItems2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv7 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    stringList: { [key: string]: string } = {
        "jin": "是999K纯金|hz7_1",
        "gui": "存很多年了|hz7_2",
        "hu": "野营救下的老虎|hz7_3",
        "hua": "最值钱的都给您了|hz7_4",
        "chuang": "这车兜风很舒服的|hz7_5",
        "ping": "这可是清朝古董|hz7_6",
        "nan": "衣服都是身外之物|hz7_7",
        "nv": "以后给媳妇买更好的|hz7_8",
        "biao": "也就十多万的表|hz7_9",
        "zhuo": "檀香木做的|hz7_10",
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
        GameData.startTime = 150;
        this._itemList = this.itemList;
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        // AudioManager.playEffect("hz4_12");
        // this.showPB("这么多钱，花不完根本花不完");
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
            if (item.active == false) continue;
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
                AudioManager.playEffect("hz4_11");
                AudioManager.playEffect(lab[1]);
                this._itemList.splice(i, 1)
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
                    }, 0.2)
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
    chuang(event: cc.Event.EventTouch) {
        event.currentTarget.active = false;
        event.currentTarget.parent.getChildByName("chuang").active = true;
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

