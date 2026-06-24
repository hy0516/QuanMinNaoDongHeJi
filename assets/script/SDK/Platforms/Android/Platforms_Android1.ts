import SDK_config from "../../SDK_config";


export default class Platforms_Android {
    private gType: number =SDK_config.apkConfig.ggType;


    private cb_videoComplete:any;
    private cb_videoFalse:any;
    private cb_videoShow:any;
    private cb_videoClose:any;

    private cb_paysuc:any;
    private cb_payfalse:any;

    private ordercallback:any;
    private bannerFlushTime:number=15;
    private curBannerTime:number=0;
    hasinit:boolean=false;
    classname: any="org/cocos2dx/javascript/JSBridge";
  
    private static mInstance:Platforms_Android = null;
    private isOnAndroid:boolean=false;
    public static getInstance():Platforms_Android{
        if(this.mInstance === null){
            this.mInstance = new Platforms_Android();
        }
        return this.mInstance;
    }
    private constructor(){
        
    }
    /**初始化 */
    onInit(_callback: Function=null) {

        console.log("1111111111111111111")
        if (!this.hasinit) {
            this.hasinit=true;
            if (window['jsb']) {
            this.isOnAndroid=true;
            }
            this.InitGetGGType();
            
            _callback && _callback();
        }

        setInterval(()=>{
            this.curBannerTime++;
            // console.log(this.curBannerTime);
            if (this.curBannerTime>=this.bannerFlushTime) {
                this.curBannerTime=0;
                this.showBanner();
            }
    
          },1000);
          this.showBanner();
    }
    /**展示Banner广告 */
    showBanner() {
        console.log("onShowBanner");
        if (this.gType == 0) {
            console.log("this.gType:0");
            return;
        }
        if (this.isOnAndroid) 
        jsb.reflection.callStaticMethod(this.classname, "onShowBannerAD", "()V");

    }

    /**展示RewardedVideo激励视频广告 */
    showRewardedVideo( _successCallback: Function,  _errorCallback: Function,_CloseCallback: Function=null,_showCallback:Function=null) {


        console.log("onShowRewardedVideo");
    
       this.cb_videoComplete=_successCallback;
       this.cb_videoClose=_CloseCallback;
       this.cb_videoFalse=_errorCallback;
       this.cb_videoShow=_showCallback;
     

     
        if (this.isOnAndroid ) {

            if (this.gType == 0) {
                console.log("this.gType:0");
                this.onVideoComplete();
                return;
            
            }
            jsb.reflection.callStaticMethod(this.classname, "onShowVideoAD", "()V");
       
      
       }else{
        this.onVideoComplete();
       }
    }

    //----------------视频回调--start
    onVideoComplete(){
        console.log("==onVideoComplete==");
        this.cb_videoComplete&&this.cb_videoComplete();
    }
    onVideoFalse(){
        console.log("==onVideoFalse==");
        this.cb_videoFalse&&this.cb_videoFalse();
    }
    onVideoShow(){
        console.log("==onVideoShow==");
        this.cb_videoShow&&this.cb_videoShow();
    }
    onVideoClose(){
        console.log("==onVideoClose==");
        this.cb_videoClose&&this.cb_videoClose();
    }
     //----------------视频回调---over
    /**展示InsertAd插屏广告 */
    showInsertAd() {
        console.log("onShowInsertAd");
        if (this.gType == 0) {
            console.log("this.gType:0");
            return;
        }
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "onShowInsertAD", "()V");
    }

    yszc(){
        console.log("more");
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "yszc", "()V");
    }
    hasMore() {
        return   jsb.reflection.callStaticMethod(this.classname, "moreGame", "()I");;
        //        return  0;
    }
    moreGame() {
        console.log("more");
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "moreGame", "()V");
       
    }
    getLanguageType() {
    
        return  jsb.reflection.callStaticMethod(this.classname, "getLanguageType", "()I");
    }

    androidToast(str){
        console.log(str);
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "androidToast", "(Ljava/lang/String;)V",str);
    }

    pay(id:number,price:number,gooditem,cbsuc:any,cbfalse:any=null){
        this.cb_paysuc=cbsuc;
        this.cb_payfalse=cbfalse;
        console.log("pay");
        if (this.isOnAndroid ) {
            console.log("callStaticMethod");
            jsb.reflection.callStaticMethod(this.classname, "pay", "(IFLjava/lang/String;)V",id,price,gooditem);
        }
   
        else
        this.cb_paysuc&&this.cb_paysuc()
    }
    /**
     * 支付结果回调
     * @param stri 
     */
    paySuccess(stri){
        this.cb_paysuc&&this.cb_paysuc(stri);
    }
    payFalse(stri){
        this.cb_payfalse&&this.cb_payfalse(stri);
    }
    doOrder(_successCallback: Function){
        console.log("doOrder");
        this.ordercallback=_successCallback;
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "doOrder", "()V");
    }
    /**
     * 订单结果回调
     * @param stri 
     */
    orderResult(stri){
        this.ordercallback&&this.ordercallback(stri);
    }
    exitGame(){
        console.log("exitGame");
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "exit", "()V");
        console.log("exit");
    }
    getGameId(){
        let gid=0;
        if (typeof(jsb)!='undefined' ) {
            if (this.isOnAndroid ) {
                gid= jsb.reflection.callStaticMethod(this.classname, "getGameId", "()I");
            }
        }
        
        return gid;
    }
    InitGetGGType() {

        console.log("InitGetGGType");
        if (this.isOnAndroid ) {
            this.gType =jsb.reflection.callStaticMethod(this.classname, "getGGType", "()I");
            if (SDK_config.apkConfig.isHW) {
                console.log("gType:"+this.gType);
                this.gType=3;
                console.log('检测到海外包ggtype改为3');
            }
        }
        
    }
    getGGType(): number {
        return this.gType;
    }
	shilitishi(age,content){
		console.log("shilitishi:");
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "shilitishi", "(ILjava/lang/String;)V",age,content);

	}
	nativeCping( x,y,size){
		console.log("nativeCping:"+x+","+y);
	
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "nativeCping", "(III)V",x,y,size);

	}
	hideNativeCping(){
		console.log("hideNativeCping:");
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "hideNativeCping", "()V");
		
	}
	hideBanner(){
		console.log("hideBanner:");
        if (this.isOnAndroid ) 
        jsb.reflection.callStaticMethod(this.classname, "hideBanner", "()V");
	}

}
window['Platforms_Android']=Platforms_Android.getInstance();