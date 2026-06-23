
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import game_wenzi_214 from "./game_wenzi_214";

const { ccclass, property } = cc._decorator;

@ccclass
export default class endlost_wz_214 extends cc.Component {
    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
    }

    addTime() {
        VideoManager.getInstance().showVideo(() => {
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).endAddTime();
            this.node.destroy();
            GameData.PauseGame = false;
        })


    }
    restart() {

        console.log(GameData.curGameName);
        
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).restart();
        this.node.destroy();
        GameData.PauseGame = false;

    }
}
