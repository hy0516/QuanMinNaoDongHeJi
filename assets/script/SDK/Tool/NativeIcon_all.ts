// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SDK_Manager from "../SDK_Manager";
import InvokeConfig from "./InvokeConfig";
import UI_Manager from "../FrameWork/UI/UI_Manager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NativeIcon_all extends cc.Component {

   
    onLoad(){
        let self=this;
        let sdm:SDK_Manager=window['SDK_Manager'];
        let nativead = cc.find("NativeAd", this.node);
   
        let oppoad=this.node.getChildByName('NativeIcon_oppo');
        let vivoad=this.node.getChildByName('NativeIcon_vivo');
        let hwad=this.node.getChildByName('NativeIcon_hw');
        if (sdm.isOppo()) {
            if (!oppoad.active) {
                oppoad.active=true;
            }
          
            vivoad.active=false;
            hwad.active=false;
        }
        if (sdm.isVivo()) {
            oppoad.active=false;
            if (!vivoad.active) {
                vivoad.active=true;
            }
            hwad.active=false;
        }
        if (sdm.isHuawei()) {
            oppoad.active=false;
            vivoad.active=false;
            if (!hwad.active) {
                hwad.active=true;
            }
        }
    }

    onEnable(){
      
    }
   
    // update (dt) {}
}
