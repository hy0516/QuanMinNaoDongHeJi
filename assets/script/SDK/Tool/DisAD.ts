// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK_Manager";
import SDKTool from "./SDKTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DisAD extends cc.Component {


    @property
    adtype: number = 0;
    @property
    delay: number = 300;

   
    @property(cc.Boolean)
    isShowVideo: boolean = false;

    @property(cc.Prefab)
    VideoView: cc.Prefab = null;
  
    
    @property(cc.Boolean)
    isOPPO: boolean=false;

    @property(cc.Boolean)
    isVIVO: boolean=false;

   
     onDisable(): void {
     
        if(this.isOPPO&&SDK_Manager.getInstance().isOppo()){
            if(SDKTool.getInstance().GetPB()==1)return;
       
         }
         if(this.isVIVO&&SDK_Manager.getInstance().isVivo()){
             if(SDKTool.getInstance().GetPB()==1)return;
        
          }
         if (this.isShowVideo&&SDKTool.getInstance().GetPB()==3) {
            
 
                 let node = cc.instantiate(this.VideoView);
                 let parent =  cc.find("Canvas");
                 parent.addChild(node, 9999);
             
         }
         setTimeout(() => {
             Platforms_QuickGame.getInstance().SetCustomAd(this.adtype,false);
         }, this.delay);

    }
  
    // update (dt) {}
}
