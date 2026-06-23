import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import Platforms_QuickGame from "../script/SDK/Platforms/QuickGame/Platforms_QuickGame";
import data_205 from "./data_205";


const { ccclass, property } = cc._decorator;

@ccclass
export default class end_205 extends cc.Component {
    ying = true;

    onLoad() {
        //  cc.audioEngine.pauseAll();
        //  cc.director.pause();
           AudioManager.playEffect("结算界面_lv205");
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

        
        //游戏继续
        data_205.isgame = true;

        this.node.dispatchEvent(new cc.Event.EventCustom("gamewin_205", true));
    }

    // update (dt) {}
}
