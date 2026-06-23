import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import zlyz_lv317 from "./zlyz_lv317";

const {ccclass, property} = cc._decorator;

@ccclass
export default class end_lost_hz_lv317 extends cc.Component {


   
    main: zlyz_lv317 = null;


    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
        VideoManager.getInstance().showInsert();
    }

    addTime() {
        VideoManager.getInstance().showVideo(() => {
            GameData.PauseGame = false;
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).setTime(60);
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
