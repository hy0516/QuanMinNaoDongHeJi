import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import data_228 from "./data_228";



const { ccclass, property } = cc._decorator;

@ccclass
export default class end_228 extends cc.Component {
    ying = true;

    onLoad() {
        // cc.audioEngine.pauseAll();
        // cc.director.pause();
           AudioManager.playEffect("结算界面_lv228");
        //Platforms_QuickGame.getInstance().showInsertAd();
    }
    oninit(ying: boolean) {
        if (ying) this.node.getChildByName("win").active = true;
        else {
            this.node.getChildByName("lost").active = true;
            let sbSke = this.node.getChildByName("lost").getChildByName("jsjm_ske");
            sbSke.opacity = 0;
            
            cc.tween(sbSke)
            .to(0.5,{opacity:255})
            .start();
        }
    }
    restart() {
        // cc.director.resume();
        // cc.audioEngine.resumeAll();
        // cc.audioEngine.stopAll();
        // console.log("fanhui restart!");

        data_228.isGameing = true;

        this.node.parent.cleanup();
        this.node.parent.getComponent(BaseGame).restart();
    }
    fanhui() {
        // cc.director.resume();
        // cc.audioEngine.resumeAll();
        // cc.audioEngine.stopAll();
        console.log("fanhui lost !");
        this.node.parent.getComponent(BaseGame).fanhui();
    }
    nextlv() {
        // cc.director.resume();
        // cc.audioEngine.resumeAll();
        // cc.audioEngine.stopAll();
        data_228.isGameing = true;
        data_228.curLv++;
        this.node.dispatchEvent(new cc.Event.EventCustom("gamewin_228", true));
    }

    // update (dt) {}
}
