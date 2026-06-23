
import AudioManager from "../common/AudioManager";
import BaseGame from "../common/BaseGame";
import GameData from "../common/GameData";
import VideoManager from "../common/VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class endlostChance_zc extends cc.Component {

    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
        VideoManager.getInstance().showInsert();
    }

    addTime() {

        GameData.PauseGame = false;
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).endAddTime();
        this.node.destroy();

    }
    addChance() {

        GameData.PauseGame = false;
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).addChance();
        this.node.destroy();

    }
    restart() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).restart();
        this.node.destroy();
        GameData.PauseGame = false;

    }
}
