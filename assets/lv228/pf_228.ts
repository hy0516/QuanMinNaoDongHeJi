import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
//import Platforms_QuickGame from "../script/SDK/Platforms/QuickGame/Platforms_QuickGame";
import data_228 from "./data_228";


const { ccclass, property } = cc._decorator;

@ccclass
export default class pf_228 extends cc.Component {
    ying = true;
    pfk: cc.Node = null;

    onLoad() {
        GameData.PauseGame = true;
        this.pfk = this.node.getChildByName("pfk");
        //Platforms_QuickGame.getInstance().showInsertAd();
        this.refreshUI();
        this.node.on("refresh_pf", this.refreshUI, this)
    }
    refreshUI() {
        for (let i = 0; i < this.pfk.childrenCount; i++) {
            var btn = this.pfk.children[i];
            if (i != 0) btn.getChildByName("luxiang").active = data_228.unlocklist.indexOf(btn.name) == -1
            btn.getChildByName("syz").active = data_228.usetou == btn.name;
        }
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

    /**解锁关卡 */
    unlockLv(even: cc.Event.EventTouch) {
        // switch (even.currentTarget.name) {
        // case "xk1":
        if (even.currentTarget.getChildByName("luxiang").active) {
            VideoManager.getInstance().showVideo(() => {
                even.currentTarget.getChildByName("luxiang").active = false;
                data_228.unlocklist.push(even.currentTarget.name);
            })
        } else {
            data_228.usetou = even.currentTarget.name;
        }
        this.node.dispatchEvent(new cc.Event.EventCustom("refresh_pf", true));
        // break;
        // case "xk2":

        //     break;
        // case "xk3":

        //     break;
        // case "xk4":

        //     break;
        // case "xk5":

        //     break;
        // }
    }

    fanhui() {
         this.node.dispatchEvent(new cc.Event.EventCustom("refresh_tou", true));
        GameData.PauseGame = false;
        this.node.destroy()
    }


    // update (dt) {}
}
