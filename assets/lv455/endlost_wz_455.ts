
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import game_wenzi_455 from "./game_wenzi_455";

const { ccclass, property } = cc._decorator;

@ccclass
export default class endlost_wz_455 extends cc.Component {
    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
        // GameData.reportSettlementEnterLv(false);
    }

    addTime() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            const baseGame = cc.find("Canvas/" + GameData.curGameName)?.getComponent(BaseGame);
            if (baseGame) {
                baseGame.endAddTime();
            }
            this.node.destroy();
            GameData.PauseGame = false;
        })
    }
    restart() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        const baseGame = cc.find("Canvas/" + GameData.curGameName)?.getComponent(BaseGame);
        if (baseGame) {
            baseGame.restart();
            this.node.destroy();
            GameData.PauseGame = false;
        }
    }
}
