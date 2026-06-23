// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import InvokeConfig from "../../../Tool/InvokeConfig_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI_oppoNativeIcon extends cc.Component {

   
    @property
    nativeId: string = '';
    flushIcon:any;
    counttime:number=0;
    onEnable(){
        let self=this;
        let sdm:SDK_Manager=window['SDK_Manager'];
        let nativead = cc.find("NativeAd", this.node);
        nativead.active=false;
       

        let showicon=function(){
            sdm.Invoke(InvokeConfig.createNative,function(adres){
                if (adres) {
                 let onNativeAdClick1=function(id){
                     sdm.Invoke(InvokeConfig.onNativeAdClick,id)
                 }
               
                 let del={
                     onNativeAdClick:onNativeAdClick1,
                     res:adres,
                    
                 }
                 UISDK_Manager_newsdk.getInstance().showUIWithNode(nativead,del);
                }
                else
                {
                   nativead.active= false;
                }
     
             },self.nativeId);
        }
        showicon();
        this.flushIcon=setInterval(function(){
           self.counttime++
            if (self.counttime==30) {
                self.counttime=0;
                showicon();
            }
        },1000);
    }
    onDisable(){
        clearInterval(this.flushIcon);
    }
    // update (dt) {}
}
