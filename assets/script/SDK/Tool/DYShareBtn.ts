// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDKTool from "./SDKTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DYShareBtn extends cc.Component {

 
    tt: any = window['tt'];


    onLoad() {
       
    }

    start() {
               if (SDKTool.isDeubg) {
                   this.node.active = false;
                   return;
               }
        this.node.on(cc.Node.EventType.TOUCH_END, this.share, this);
    }
    share(){
       Platforms_QuickGame.getInstance().share((()=>{

       }));
    }

    // protected onDisable(): void {
    //     this.node.off(cc.Node.EventType.TOUCH_END, this.share, this);
    // }

    // update (dt) {}
}
 