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







const { ccclass, property } = cc._decorator;

@ccclass
export default class Yszc extends cc.Component {
    @property(cc.Node)
    yszc: cc.Node = null;

    
     onLoad(): void {
     
    }
    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.openys, this);
        cc.director.preloadScene("game", function () {
            cc.log("Next scene preloaded");
        });
        cc.director.preloadScene("Yszc", function () {
            cc.log("Next scene preloaded");
        });
    }
    openys() {


        cc.director.loadScene("Yszc");


    }
    closeys() {
        cc.director.loadScene("game");
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.openys, this);
    }


    // update (dt) {

    // }
}
