
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import hz_config from "../script/hz/hz_config";
import hzitem_move from "../script/hz/hzitem_move";
import tips_hz from "../script/hz/tips_hz";



const { ccclass, property } = cc._decorator;

@ccclass
export default class game_hz extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    // _itemList: { [key: string]: cc.Node } = {};

    @property(cc.Prefab)
    item: cc.Prefab = null;

    @property(cc.Node)
    tittle: cc.Node = null;

    public LevelId: number = 6;



    public curTime = 0;
    isshowVideo: boolean = false;

    onLoad() {
        // GameData.curLevelId = this.LevelId;
        console.log(this.LevelId);
        GameData.PauseGame = false;
        for (let i = 0; i < hz_config.lv1.length; i++) {
            var data = hz_config.lv1[i];
            var item = cc.instantiate(this.item);
            item.getComponent(hzitem_move).oninit(data);
            item.parent = this.content;
        }
        GameData.startTime = 120
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        for (var s in this.itemList) {
            GameData._itemList[this.itemList[s].name] = this.itemList[s];
        }
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

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "fanhui":
                AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = cc.find("Canvas");
                    GameData.onDele();
                    this.node.destroy();
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "btn_addtime":
                // if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.addTime(null, 60); })
                break;
            case "btn_tips":
                AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
                var handlers = () => {
                    cc.resources.load("prefabs/hz/TipPanel_hz", cc.Prefab, (err, UI: cc.Prefab) => {
                        var UINode = cc.instantiate(UI);
                        UINode.parent = cc.find("Canvas");
                        UINode.getComponent(tips_hz).curTipsList = hz_config.level1_tips[0];
                        this.node.getChildByName("bg").getChildByName("bg2").getChildByName("btn_tips").getChildByName("luxiang").active = false;
                        this.isshowVideo = true;
                    })
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
        }
    }

    loadend() {
        GameData.PauseGame = true;
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        this.endwin("prefabs/hz/endwin_hz");
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
            // this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.unschedule(this.Timeing)
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 0.6);
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

