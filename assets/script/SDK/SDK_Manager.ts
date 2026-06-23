// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import SDK_config, { Platform } from "./SDK_config";
import UI_Manager from "./FrameWork/UI/UI_Manager";
import InvokeConfig from "./Tool/InvokeConfig";

import Platforms_QuickGame from "./Platforms/QuickGame/Platforms_QuickGame";
import LocalStorageManager from "./Tool/LocalStorageManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SDK_Manager {

    // public plat_android:Platforms_Android;
    public plat_QuickGame:Platforms_QuickGame;
    private ui_manager:UI_Manager;
    private bannerFlushTime:number=30;
    private curBannerTime:number=0;
    /** 插屏间隔 */
    private insertCD:number=0;
    private curInsertCDtime:number=0;
    bridge: any;
    /** 支付已经购买noads */
    public hasPayNoAd:string="0";
    /**
     * 存放所有的noads支付节点
     */
    public mapbtn:Map<cc.Node,boolean> = new Map();
    /**
     * 存放所有的nativead
     */
    public map_allNativeAd:Map<cc.Node,boolean> = new Map();
    private static mInstance: SDK_Manager = null;
    /**开屏结束回调 */
    public logoSplashOvercb:any;
    public static getInstance(): SDK_Manager {
        if (this.mInstance == null) {
            this.mInstance = new SDK_Manager();
        }
        return this.mInstance;
    }
    constructor(){
        window['SDK_Manager']=this;
    }
    onInit(){
        
        this.ui_manager=UI_Manager.getInstance();
        this.ui_manager.onInit();
    }
    // flushBanner(){
    //     setInterval(()=>{
    //         this.curBannerTime++;
    //         if (this.curBannerTime>=this.bannerFlushTime) {
    //             this.curBannerTime=0;
    //             this.plat_android.showBanner();      
    //         }
    
    //       },1000);
  
    // }
  
    // setInsertCD(){
    //     if (this.plat_android.getGGType()==3) {
    //         this.insertCD=1;
    //     }else
    //     if (this.plat_android.getGGType()==2) {
    //         this.insertCD=30;
    //     }else
    //     if (this.plat_android.getGGType()==1) {
    //         this.insertCD=60;
    //     }
        
    // }
    public Invoke(method:string,..._argArray: any[]){
        console.log("==Invoke==:"+method);
        if (method==InvokeConfig.onInit) {
            this.onInit();
                     
        }
        
        if (this.isAndroid()) {
            // this.androidEvent(method,..._argArray);
        }else{
        //   this.quickGameEvent(method,..._argArray);
        }
        
    }
    quickGameEvent(method:string,..._argArray: any[]){
        if (method==InvokeConfig.onInit) {
            this.plat_QuickGame=Platforms_QuickGame.getInstance();     
            this.plat_QuickGame.onInit();
            console.log("quickGameEvent..init");
            return;            
        }
        if (method==InvokeConfig.showBanner) {
            this.plat_QuickGame.showBanner();          
            return;            
        }
        if (method==InvokeConfig.showVideo) {
        
            this.plat_QuickGame.showVideo(_argArray[0],_argArray[1],_argArray[2],_argArray[3]);          
            return;            
        }
        if (method==InvokeConfig.showInsert) {
     

            this.plat_QuickGame.showInsertAd();          
            return;            
        }
        if (method==InvokeConfig.createNative) {
     

        
            this.plat_QuickGame.createNative(_argArray[0],_argArray[1]);          
            return;            
        }
        if (method==InvokeConfig.onNativeAdClick) {
     

            this.plat_QuickGame.onNativeAdClick(_argArray[0]);          
            return;      
        }
        if (method==InvokeConfig.hideBanner) {
     

            this.plat_QuickGame.hideBanner();          
            return;      
        }
        if (method==InvokeConfig.hideInsertNativeAd) {
     

            this.plat_QuickGame.hideInsertNativeAd();          
            return;      
        }
        if (method==InvokeConfig.showUI) {
            this.ui_manager.showUI(_argArray[0],_argArray[1]);   
            return;            
        }
        if (method==InvokeConfig.toastShow) {
            this.ui_manager.showUI('MyToastTip',_argArray[0],null,99999);   
            return;            
        }
        if (method==InvokeConfig.startLogoSplash) {
            window['SDK_Manager'].Invoke(InvokeConfig.onInit);
            
            this.logoSplashOvercb=_argArray[0];
            this.ui_manager.showUI('LoadScene');   
            return;            
        }
    }
    // androidEvent(method:string,..._argArray: any[]){
    //     if (method==InvokeConfig.onInit) {
    //         this.plat_android=window['Platforms_Android'];     
    //         this.plat_android.onInit();
    //         this.setInsertCD();
           
    //         this.hasPayNoAd= LocalStorageManager.getStorageKeyValue("pay_no_ads","0");
    //         console.log("hasPayNoAd:"+this.hasPayNoAd); 
    //         this.flushBanner();
    //         return;            
    //     }
    //     if (method==InvokeConfig.getGGtype) {
         
    //         _argArray[0](SDK_config.apkConfig.isHW?3:this.plat_android.getGGType());          
    //         return;            
    //     }
    //     if (method==InvokeConfig.showInsert&&this.hasPayNoAd=="0") {
    //         let cdtime=new Date().getTime()-this.curInsertCDtime;
    //         if (cdtime<this.insertCD*1000) {
    //             console.log("==inserttimecd=="+cdtime);
    //             return;
    //         }
          
    //         this.curInsertCDtime=new Date().getTime();

    //         this.plat_android.showInsertAd();          
    //         return;            
    //     }
    //     if (method==InvokeConfig.showBanner&&this.hasPayNoAd=="0") {
    //         this.plat_android.showBanner();          
    //         return;            
    //     }
    //     if (method==InvokeConfig.showVideo) {
    //         if (this.hasPayNoAd=="1") {
    //             _argArray[0]&&_argArray[0]();
    //             return;
    //         }
    //         this.plat_android.showRewardedVideo(_argArray[0],_argArray[1]);          
    //         return;            
    //     }
    //     if (method==InvokeConfig.pay) {
    //         this.plat_android.pay(_argArray[0],_argArray[1],_argArray[2],_argArray[3],_argArray[4]);          
    //         return;            
    //     }
    //     if (method==InvokeConfig.more) {
    //         this.plat_android.moreGame();    
    //         return;            
    //     }
    //     if (method==InvokeConfig.yszc) {
    //         this.plat_android.yszc();    
    //         return;            
    //     }
    //     if (method==InvokeConfig.doOrder) {
    //         this.plat_android.doOrder(_argArray[0]);    
    //         return;            
    //     }
    //     if (method==InvokeConfig.androidToast) {
    //         this.plat_android.androidToast(_argArray[0]);    
    //         return;            
    //     }
    //     if (method==InvokeConfig.exit) {
    //         this.plat_android.exitGame();
    //         return;            
    //     }
    //     if (method==InvokeConfig.showUI) {
    //         this.ui_manager.showUI(_argArray[0],_argArray[1]);   
    //         return;            
    //     }
    //     if (method==InvokeConfig.toastShow) {
    //         this.plat_android.androidToast(_argArray[0]);   
    //         return;            
    //     }
        
    // }
    addNoAdsNode(node:cc.Node){
        this.mapbtn.set(node,true);
    }
   /**支付成功去广告后，所有的广告都连接都隐藏--海外专用 */
  
   paySuccessNoads(){
       this.hasPayNoAd="1";
    
      LocalStorageManager.setStorageKeyValue("pay_no_ads", this.hasPayNoAd);
      this.mapbtn.forEach((value , key) =>{
        if (key.active) {
            key.active =false;    
        }
        console.log(key);
     });
   
    }

      /**区分渠道 */

      public isAndroid() {
        if (SDK_config.platform == Platform.android ) {
            return true
        }
        return false
    }
      public isBaidu() {
        if (SDK_config.platform == Platform.baidu_H5 ) {
            return true
        }
        return false
    }

    public isOppo() {
        if (SDK_config.platform == Platform.oppo_H5 ) {
            return true
        }
        return false
    }
    public isQQplay() {
        if (SDK_config.platform == Platform.qqplay_H5 ) {
            return true
        }
        return false
    }
    public isToutiao() {
        if (SDK_config.platform == Platform.toutiao_H5) {
            return true
        }
        return false
    }
    public isVivo() {
        if (SDK_config.platform == Platform.vivo_H5 ) {
            return true
        }
        return false
    }
    public isWeixin() {
        if (SDK_config.platform == Platform.weixin_H5 ) {
            return true
        }
        return false
    }
    public isHuawei() {
        if (SDK_config.platform == Platform.huawei_H5 ) {
            return true
        }
        return false
    }
    public isX4399() {
        if (SDK_config.platform == Platform.x4399_H5 ) {
            return true
        }
        return false
    }
    public isXiaomi() {
        if (SDK_config.platform == Platform.xiaomi_H5 ) {
            return true
        }
        return false
    }
}
window['SDK_Manager']=new SDK_Manager();
