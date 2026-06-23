// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIWindow from "../../../FrameWork/UI/Module/UIWindow";
import UI_Manager from "../../../FrameWork/UI/UI_Manager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class demo_video extends UIWindow {

  
    ms:cc.Label;
    msn:number=3;
    cbobj:any;
  
    intFun: number;
    videoComplete:boolean=false;
    start () {
    
    }
    onOpen(obj){
     
        this.msn=3;
        this.cbobj=obj;
        obj.showcb&&obj.showcb();
        this.ms=cc.find("bgl", this.node).getComponent(cc.Label);
        let self=this;
        this.videoComplete=false;
      
       
        this.intFun= setInterval(function(){
            self.msn--;
            console.log(self.msn);
            self.ms.string=""+self.msn;
            if (self.msn==0) {
                obj.scb&&obj.scb();
                self.videoComplete=true;
                UI_Manager.getInstance().hideUI(self.node.name);
                clearInterval(self.intFun);
            }
        },1000)
    }
    onClose(obj){
        if (!this.videoComplete) {
            this.cbobj.closecb&&this.cbobj.closecb();
        }
      
        clearInterval(this.intFun);
    }
   
    // update (dt) {}
}
