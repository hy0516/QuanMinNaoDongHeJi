
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import game_wenzi_385 from "./game_wenzi_385";

const { ccclass, property } = cc._decorator;

@ccclass
export default class endlost_wz_385 extends cc.Component {
    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
    }

    addTime() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            BaseGame.findLevelNode(this.node)?.getComponent(BaseGame)?.endAddTime();
            this.node.destroy();
            GameData.PauseGame = false;
        })


    }
    restart() {

        // console.log(GameData.curGameName);
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);

        const baseGame = BaseGame.findLevelNode(this.node)?.getComponent(BaseGame);
        if (baseGame) {
            baseGame.restart();
            this.node.destroy();
            GameData.PauseGame = false;
        }

    }
}
