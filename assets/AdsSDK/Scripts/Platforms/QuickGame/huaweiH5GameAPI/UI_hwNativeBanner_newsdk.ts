// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import InvokeConfig from "../../../Tool/InvokeConfig_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";

import SDK_config from "../../../SDK_config_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI_hwNativeBanner extends cc.Component {

   
    @property
    nativeId: string = '';

    counttime:number=0;

    flushbanner:any;
    onEnable(){
        let self=this;
        // let sdm:SDK_Manager=window['SDK_Manager'];
        // let nativead = cc.find("NativeAd", this.node);
        // let closebtn= cc.find("btn_close",nativead);
        // if (!sdm.map_allNativeAd.get(nativead)) {
           
        //     sdm.map_allNativeAd.set(nativead,true);
        // }

        // let sbanner=function(){
        //     sdm.Invoke(InvokeConfig.createNative,function(adres){
        //         if (adres) {
        //            let onNativeAdClick1=function(id){
        //                sdm.Invoke(InvokeConfig.onNativeAdClick,id)
        //            }
                 
        //            let del={
        //                onNativeAdClick:onNativeAdClick1,
        //                res:adres,
        //                pnode:nativead,
        //            }
        //            UI_Manager.getInstance().showUIWithNode(nativead,del);
                   
        //            closebtn.scaleX=SDK_config.ADTest?1:0.8;
        //            closebtn.scaleY=SDK_config.ADTest?1:0.8;
        //         }
              
             
   
        //    },self.nativeId);
        // }
        // sbanner();
        // this.flushbanner=setInterval(function(){
        //    self.counttime++
        //     if (self.counttime==SDK_config.GameIdConfig.huaweiID.bannerFlushTime) {
        //         self.counttime=0;
        //         sbanner();
        //     }
        // },1000);
        
      

    }
    onDisable(){
        clearInterval(this.flushbanner);
    }

    // update (dt) {}
}
