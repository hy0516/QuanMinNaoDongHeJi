import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class endlost_wz_lv302 extends cc.Component {
    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
        VideoManager.getInstance().showInsert();
    }

    addTime() {
        VideoManager.getInstance().showVideo(() => {
            GameData.PauseGame = false;
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).endAddTime();
            this.node.destroy();
        })
    }
    restart() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).restart();
        this.node.destroy();
        GameData.PauseGame = false;

    }
}
