
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveHandlerItem from "../script/common/moveHandlerItem";
import moveItems2 from "../script/common/moveItems2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv10 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    mianj: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    @property(cc.Label)
    jdlab: cc.Label = null;

    @property(cc.Node)
    jdt: cc.Node = null;

    stringList: { [key: string]: string } = {
        "qi": "这个锦旗才是我的|hz10_1",
        "xiang": "谁拿错的用具|hz10_2",
        "zhuo": "这个让我更方便|hz10_3",
        "shebei": "这台仪器更精准|hz10_4",
        "dao": "先玩一下萝卜刀放松一下|hz10_5",
        "pai": "普通手术，小问题|hz10_6",
        "chuang": "马上给您换|hz10_7",
        "nan": "氧气可不能停|hz10_8",
        "wq": "危险物品要处理掉|hz10_9",
        "deng": "那么弱的灯光可不行|hz10_10",
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
        if (type == 2) {
            tar.getChildByName("state1").active = false;
            tar.getChildByName("state2").active = true;
            var lab = this.stringList[tar.name].split("|");
            this.showPB(lab[0]);
            this.winnum++;
            this.jdt.width += 30;
            this.jdlab.string = "生命值：" + (this.winnum * 10).toString() + "%";
            if (this.jdt.width > 300) this.jdt.width = 300
            AudioManager.playEffect("hz10_11");
            AudioManager.playEffect(lab[1]);
            return
        }
        for (let i = 0; i < this._itemList.length; i++) {
            var item: cc.Node = this._itemList[i];
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


                AudioManager.playEffect("hz10_11");
                AudioManager.playEffect(lab[1]);
                if (item.name == "zhuo") {
                    this.mianj.getComponent(moveHandlerItem).oninit();
                    this.mianj.active = true;
                }
                this._itemList.splice(i, 1)
                // if (this._itemList.length == 10) {
                //     this.scheduleOnce(() => {
                //         this.endwin("prefabs/hz/endwin_hz");
                //     }, 1.2)
                // }
                this.winnum++;
                this.jdt.width += 30;
                this.jdlab.string = "生命值：" + (this.winnum * 10).toString() + "%";
                if (this.jdt.width > 300) this.jdt.width = 300
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
                if (this.winnum == 10) {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/hz/endwin_hz");
                    }, 0.7)
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

