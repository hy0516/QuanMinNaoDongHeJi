// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK_Manager";
import InvokeConfig from "./InvokeConfig";
import LocalStorageManager from "./LocalStorageManager";
import SDKTool from "./SDKTool";









const { ccclass, property } = cc._decorator;

@ccclass
export default class Msg extends cc.Component {
    @property(cc.Node)
    yszc: cc.Node = null;

    onEnable() {
        SDK_Manager.prototype.Invoke(InvokeConfig.onInit);
     
        let isyszc = localStorage.getItem("isyszc");
        if (!isyszc) this.yszc.active = true;
        cc.director.preloadScene("load", function () {
            cc.log("Next scene preloaded");
            if (isyszc) cc.director.loadScene("load");
        });

    }
    agree() {
        // this.yszc.active=false;

        cc.director.loadScene("load");
        localStorage.setItem("isyszc", "1");
        if(SDKTool.getInstance().GetPB()==3){
            Platforms_QuickGame.getInstance().showVideo(()=>{});
        }
    }
    disagree() {
        Platforms_QuickGame.getInstance().showToast('您需同意本隐私政策方可进入游戏');
      
        if(SDKTool.getInstance().GetPB()==3){
            Platforms_QuickGame.getInstance().showVideo(()=>{});
        }else{
            if (SDK_Manager.prototype.isOppo()) {
                Platforms_QuickGame.getInstance().exitgame(true);
            }
        }
    }

    onDisable() {

    }


    // update (dt) {

    // }
}
