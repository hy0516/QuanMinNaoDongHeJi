import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import player_lv287 from "./player_lv287";

const { ccclass, property } = cc._decorator;

@ccclass
export default class dycxy_lv287 extends BaseGame {
    @property(cc.Node)
    player: cc.Node = null;

    label1: cc.Label = null;
    label2: cc.Label = null;

    psk: dragonBones.ArmatureDisplay;

    flag: boolean = true;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv287`);
            console.log("bgmlv287");
        }, 0.5);
        this.label1 = this.node.getChildByName(`bg`).getChildByName(`top`).getChildByName(`label1`).getComponent(cc.Label);
        cc.director.getCollisionManager().enabled = true;
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
        }
    }

    fhbtn() {
        VideoManager.getInstance().showVideo(() => {
            this.node.getChildByName(`endlost_wz`).active = false;
            this.flag = true;
            this.player.getComponent(player_lv287).revivePlayer();
        })
    }

    wdbtn() {
        VideoManager.getInstance().showVideo(() => {
            this.player.getChildByName(`wd`).active = true;
            this.player.getComponent(player_lv287).setwudi();
        })
    }

    update(dt) {
        this.label1.string = `分数：` + this.player.getComponent(player_lv287).getCurrentScore().toString();

        const playerComp = this.player.getComponent(player_lv287);
        if (playerComp.getCurrentHp() <= 0 && this.flag && !playerComp.getIsInvincible()) {
            this.flag = false;
            this.onlost();
        }
        if (playerComp.getCurrentScore() > 8000) {
            this.onwin();
        }
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    onlost() {
        this.scheduleOnce(() => {
            // GameData.PauseGame = false;
            // this.node.destroy();
            // this.endlost("prefabs/zc/zc_lostend");
            this.node.getChildByName(`endlost_wz`).active = true;
        }, 1)
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
