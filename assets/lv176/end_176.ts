import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import VideoManager from "../script/common/VideoManager";
import Platforms_QuickGame from "../script/SDK/Platforms/QuickGame/Platforms_QuickGame";


const { ccclass, property } = cc._decorator;

@ccclass
export default class end_176 extends cc.Component {
    ying = true;

    onLoad() {
        // cc.audioEngine.pauseAll();
        // cc.director.pause();
        AudioManager.playEffect("结算界面_lv17");
        Platforms_QuickGame.getInstance().showInsertAd();
    }
    oninit(ying: boolean) {
        if (ying) this.node.getChildByName("win").active = true;
        else this.node.getChildByName("lost").active = true;
    }
    restart() {
        // cc.director.resume();
        // cc.audioEngine.resumeAll();
        // cc.audioEngine.stopAll();
        this.node.parent.cleanup();
        this.node.parent.getComponent(BaseGame).restart();
    }
    fanhui() {
        // cc.director.resume();
        // cc.audioEngine.resumeAll();
        // cc.audioEngine.stopAll();
        this.node.parent.getComponent(BaseGame).fanhui();
    }
    nextlv() {
        // cc.director.resume();
        // cc.audioEngine.resumeAll();
        // cc.audioEngine.stopAll();
        this.node.dispatchEvent(new cc.Event.EventCustom("gamewin_176", true));
    }

    // update (dt) {}
}
