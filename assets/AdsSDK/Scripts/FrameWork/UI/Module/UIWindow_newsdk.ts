// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDKPanel from "./UIPanel_newsdk";
import UISDK_Manager_newsdk from "../UISDK_Manager_newsdk";



const {ccclass, property} = cc._decorator;

@ccclass
export default class UISDKWindow extends  UISDKPanel {

    @property(cc.Node)
    closeBtn: cc.Node = null;

    onEnable(){
       

        this.closeBtn&&this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.close, this);
    
    }
    onDisable(){
        this.closeBtn&&this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.close, this);
    } 
  
  
    
    // update (dt) {}
}
