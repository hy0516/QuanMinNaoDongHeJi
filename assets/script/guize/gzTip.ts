import AudioManager from "../common/AudioManager";
import GameData from "../common/GameData";
import VideoManager from "../common/VideoManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class gzTip extends cc.Component {



    @property(cc.Node)
    tipslab: cc.Node = null;



    protected onLoad(): void {
        VideoManager.getInstance().showInsert();
    }

    /**
     * 获得提示按钮
     */
    showTips(tips: string) {
        GameData.PauseGame = true;
        this.tipslab.getComponent(cc.Label).string = tips;
    }
    // /**
    //  * 获得答案按钮
    //  */
    // answer() {
    //     AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    //     if (GameData.tipsNum<3) {
    //         common.ShowTipsView("需要先点击获取3次提示");
    //         return
    //     }
    //     this.btn_tip.active = false;
    //     this.btn_ans.active = false;
    //     this.tipslab.active = false;
    //     this.anslab.active = true;
    // }

    closePanel() {
        AudioManager.playEffect(AudioManager.gz.收拾);
        this.node.destroy();
        GameData.PauseGame = false;
    }


}
