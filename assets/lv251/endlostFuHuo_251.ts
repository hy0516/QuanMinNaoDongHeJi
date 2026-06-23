import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";




const { ccclass, property } = cc._decorator;

@ccclass
export default class endlostFuHuo_251 extends cc.Component {

    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
        VideoManager.getInstance().showInsert();
        
    }

    fuHuo(){
        cc.director.resume();
        cc.audioEngine.resumeAll();
        cc.audioEngine.stopAll();
        GameData.PauseGame = false;
        VideoManager.getInstance().showVideo(()=>{
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).autoMergeAll();
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).isfuhuo=true;
            this.node.destroy();
        });
    }
    restart() {
        cc.director.resume();
        cc.audioEngine.resumeAll();
        cc.audioEngine.stopAll();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).restart();
        this.node.destroy();
        GameData.PauseGame = false;

    }
}
