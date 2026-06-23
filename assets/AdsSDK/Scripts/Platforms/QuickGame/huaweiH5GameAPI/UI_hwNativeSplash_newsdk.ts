// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDKWindow from "../../../FrameWork/UI/Module/UIWindow_newsdk";
import InvokeConfig from "../../../Tool/InvokeConfig_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
const {ccclass, property} = cc._decorator;

@ccclass
export default class UI_hwNativeSplash extends UISDKWindow {

 

  onOpen(obj){
    let winHeight = cc.winSize.height;
    let winWidth = cc.winSize.width;
  

    let scaleY =winHeight /this.node.height;
    let scaleX = winWidth / this.node.width;
  
    
    this.node.scaleX=  scaleX;
    this.node.scaleY=  scaleY;

  
   
    let self=this;
    let cb=function(){
      
      self.node.active=false;
      window['SDK_Manager'].logoSplashOvercb();
    }
    cc.find("splah",this.node).getComponent('hwsplashnative').startSpash(cb);
  
    console.log("start game");
  }

    // update (dt) {}
}
