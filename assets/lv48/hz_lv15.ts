
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveItems3 from "../script/common/moveItems3";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv15 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    stringList: { [key: string]: string } = {
        "lidan": "爱吃东西|李蛋",
        "wangkun": "喜欢唱跳和rap|王坤",
        "zhangyueban": "最受老师照顾|张月半",
        "xiaoming": "模范学生|小明",
        "xiaohua": "不爱看讲台|小花",
        "xiaomei": "喜欢花|小美",
        "xiaofang": "安静的学生|小芳",
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    and: cc.Node = null;

    @property(cc.Node)
    btn_win: cc.Node = null;

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
        var node = even.currentTarget;
        var list = this.stringList[node.name].split("|")
        if (list) {
            this.and.active = true;
            this.and.getChildByName("lab_name").getComponent(cc.Label).string = list[1];
            this.and.getChildByName("lab_jiesao").getComponent(cc.Label).string = list[0];
        }
    }

    btn_winHanlder() {
        if (this.winnum == this.itemList.length) {
            // this.scheduleOnce(() => {
            this.endwin("prefabs/hz/endwin_hz");
            // }, 0.5)
        } else {
            this.unschedule(this.Timeing);
            // this.scheduleOnce(() => {
            this.endlost("prefabs/hz/endlost_hz");
            // }, 0.5)
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

