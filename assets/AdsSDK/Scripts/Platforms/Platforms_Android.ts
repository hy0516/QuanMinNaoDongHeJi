


import Platforms_hongmeng from "./Platforms_hongmeng";


export default class Platforms_Android extends cc.Component {
    private gType: number = 3;

    private cb_videoComplete: any;
    private cb_videoFalse: any;
    private cb_videoShow: any;
    private cb_videoClose: any;

    private cb_paysuc: any;
    private cb_payfalse: any;

    private ordercallback: any;
    private bannerTimes: number = 0;
    private nativeTimes: number = 0;
    hasinit: boolean = false;
    /** 插屏间隔 */
    private insertCD: number = 5;
    private curInsertCDtime: number = 0;

    // 是白包的话就改为true
    private isPureness: boolean = false;
    // 是vivo的话，就要使用多ID功能
    private isOppo: boolean = false;
    private IsMmy: boolean = false;

    private insertIndex: number = 0;
    // 控制是否可以刷新插屏
    private canShowBanner: boolean = true;

    public delayStartTime: number = 1718345703338;

    public delayStartcount: number = 120;      //定时多少h


    public isHongmeng:boolean=true;
    classname: any = "org/cocos2dx/javascript/JSBridge";

    private static mInstance: Platforms_Android = null;
    private isOnAndroid: boolean = false;
    public static getInstance(): Platforms_Android {
        if (this.mInstance === null) {
            this.mInstance = new Platforms_Android();
        }
        return this.mInstance;
    }



    checkIsOppo() {
        return this.isOppo;
    }

    checkIsPureness() {
        return this.isPureness;
    }

    checkIsMmy() {
        return this.IsMmy;
    }

    setCanShowBanner(canShow: boolean) {
        this.canShowBanner = canShow;
    }

    constructor() {
        super();
    }

    /**初始化 */
    onInit(_callback: Function = null) {

        console.log("初始化显示:" + new Date().getTime());


        if (!this.hasinit) {
            this.hasinit = true;
            if (window['jsb']) {
                this.isOnAndroid = true;
            }
            if (this.isHongmeng==true) {
                if (window["globalThis"].oh==null) {
                    window["globalThis"].oh={};
                    window["globalThis"].oh.postMessage=function(){}
                }
                Platforms_hongmeng.getInstance().onInit();
            }
            this.InitGetGGType();

           // this.scheduleOnce(this.showBanner);

           // this.schedule(this.countInsertCD, 1);
            //this.nativeCping(0, 20, 25);

            _callback && _callback();
        }
       
    }

    public ChangeAndroid(){
        this.isOnAndroid = true;
        this.isHongmeng=false;
    }
    public ChangeHongmeng(){
        this.isOnAndroid = false;
        this.isHongmeng=true;
    }
    /**展示Banner广告 */
    showBanner() {
        if (this.IsMmy == false)
            if (new Date().getTime() - this.delayStartTime < this.delayStartcount * 60 * 60 * 1000) {
                return;
            }

        console.log("onShowBanner");
        if (this.gType == 0) {
            console.log("this.gType:0");
            return;
        }
        if (this.isHongmeng) {
            globalThis.oh.postMessage("onShowBannerAD","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "onShowBannerAD", "()V");

        this.bannerTimes = 0;
        this.unschedule(this.autoBanner);
        this.schedule(this.autoBanner, 1);
    }

    private autoBanner(): void {
        if (this.canShowBanner) {
            this.bannerTimes++;
        }
        console.log("autoBanner：" + this.bannerTimes);
        if (this.bannerTimes >= 60) {
            this.showBanner();
            this.bannerTimes = 0;
        }
    }

    private countInsertCD() {
        this.curInsertCDtime++;
    }

    private autoNativeIcon(): void {
        this.nativeTimes++;
        console.log(this.nativeTimes);
        if (this.nativeTimes >= 15) {
            this.nativeCping(0, 20, 25);
            this.nativeTimes = 0;
        }
    }

    /**展示提醒视频失败*/
    displayPrompt(DisplayPromptObject: cc.Node, _errorCallback?: Function) {
        try {
            DisplayPromptObject.zIndex = 9999;
            DisplayPromptObject.active = true;
            this.scheduleOnce(() => {
                DisplayPromptObject.active = false;
                _errorCallback && _errorCallback();
            }
                , 1);
        }
        catch (error) {
            console.log("传来的节点可能为空");
        }
    }

    /**本地展示的广告*/
    private localPrompt(text: string, _errorCallback?: Function) {
        try {
            if (false == this.isOnAndroid) {
                cc.find("Canvas/Prompt").getComponent(cc.Label).string = text;
                cc.find("Canvas/Prompt").zIndex = 9999;
                cc.find("Canvas/Prompt").active = true;
                this.scheduleOnce(() => {
                    cc.find("Canvas/Prompt").active = false;
                    _errorCallback && _errorCallback();
                }
                    , 1);
            }

        }
        catch (error) {
            console.log("Canvas/Prompt 结构不正确，或者没有Prompt 文字节点");
            _errorCallback && _errorCallback();
          
        }
    }



    /**展示RewardedVideo激励视频广告 */
    showRewardedVideo(_successCallback: Function, _errorCallback: Function, _CloseCallback: Function = null, _showCallback: Function = null) {

        if (this.isPureness) {
            _successCallback && _successCallback();
            return;
        }
   

        console.log("onShowRewardedVideo");

        this.cb_videoComplete = _successCallback;
        this.cb_videoClose = _errorCallback;
        this.cb_videoFalse = _errorCallback;
        this.cb_videoShow = _showCallback;

        if (this.gType == 0) {
            console.log("this.gType:0");
            _successCallback();
            return;

        }


        if (this.isHongmeng) {
            globalThis.oh.postMessage("onShowVideoAD","");
        }else
        if (this.isOnAndroid) {

           
            jsb.reflection.callStaticMethod(this.classname, "onShowVideoAD", "()V");
            console.log("this.gType!=0  " + this.gType);
        }
        else {
            this.localPrompt("播放激励视频", _successCallback);
            console.log("isOnAndroid=false");
        }
    }

    entergame(){
        if (this.isHongmeng) {
            globalThis.oh.postMessage("entergame","");
        }else
        if (this.isOnAndroid) {

           
            jsb.reflection.callStaticMethod(this.classname, "entergame", "()V");
         
        }
    }
    gameover(){
        if (this.isHongmeng) {
            globalThis.oh.postMessage("gameover","");
        }else
        if (this.isOnAndroid) {

           
            jsb.reflection.callStaticMethod(this.classname, "gameover", "()V");
         
        }
    } 
    //----------------视频回调--start
    onVideoComplete() {
        
        console.log("==onVideoComplete==");
        console.log(this.cb_videoComplete)
        this.cb_videoComplete && this.cb_videoComplete();
    
        cc.game.resume();
       
    
    }
    onVideoFalse() {
        cc.game.resume();
        console.log("==onVideoFalse==");
     //   DelegateManager_008.onShowUIFloatText.executeDelegates("暂无视频");
        this.cb_videoFalse && this.cb_videoFalse();
    }
    onVideoShow() {
        cc.game.pause();
        console.log("==onVideoShow==");
     //   DelegateManager_008.onShowUIFloatText.executeDelegates("获得奖励");
        this.cb_videoShow && this.cb_videoShow();
    }
    onVideoClose() {
        console.log("==onVideoClose==");
        cc.game.resume();
    //    DelegateManager_008.onShowUIFloatText.executeDelegates("暂无视频");
        this.cb_videoClose && this.cb_videoClose();
    }
    //----------------视频回调---over 
    /**展示InsertAd插屏广告 */
    showInsertAd() {
        console.log("onShowInsertAd");


        if (this.gType == 0) {
            console.log("this.gType:0");
            return;
        }
        if (this.isHongmeng) {
            globalThis.oh.postMessage("onShowInsertAD","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "onShowInsertAD", "()V");
        else
            this.localPrompt("调用oppo插屏广告");
    }

    yszc() {
        console.log("点击了隐私政策");
        if (this.isHongmeng) {
            globalThis.oh.postMessage("yszc","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "yszc", "()V");
    }
    hasMore() {
        // if (this.isHongmeng) {
        //     globalThis.oh.postMessage("yszc","");
        // }else
        // return jsb.reflection.callStaticMethod(this.classname, "moreGame", "()I");;
        //        return  0;
    }
    moreGame() {
        console.log("点击了更多精彩");

        if (this.isHongmeng) {
            globalThis.oh.postMessage("moreGame","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "moreGame", "()V");

    }
    getLanguageType() {

     //   return jsb.reflection.callStaticMethod(this.classname, "getLanguageType", "()I");
    }

    androidToast(str) {
        console.log(str);
        if (this.isHongmeng) {
            globalThis.oh.postMessage("androidToast",""+str);
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "androidToast", "(Ljava/lang/String;)V", str);
    }

    pay(id: number, price: number, gooditem, cbsuc: any, cbfalse: any = null) {
        this.cb_paysuc = cbsuc;
        this.cb_payfalse = cbfalse;
        console.log("pay");
        if (this.isHongmeng) {
            globalThis.oh.postMessage("pay",""+id);
        }else
        if (this.isOnAndroid) {
            console.log("callStaticMethod");
            jsb.reflection.callStaticMethod(this.classname, "pay", "(IFLjava/lang/String;)V", id, price, gooditem);
        }

        else
            this.cb_paysuc && this.cb_paysuc()
    }
    /**
     * 支付结果回调
     * @param stri 
     */
    paySuccess(stri) {
        this.cb_paysuc && this.cb_paysuc(stri);
    }
    payFalse(stri) {
        this.cb_payfalse && this.cb_payfalse(stri);
    }
    doOrder(_successCallback: Function) {
        console.log("doOrder");
        this.ordercallback = _successCallback;
        if (this.isHongmeng) {
            globalThis.oh.postMessage("doOrder","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "doOrder", "()V");
    }
    /**
     * 订单结果回调
     * @param stri 
     */
    orderResult(stri) {
        this.ordercallback && this.ordercallback(stri);
    }
    exitGame() {
        console.log("exitGame");
        if (this.isHongmeng) {
            globalThis.oh.postMessage("exit","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "exit", "()V");
        console.log("exit");
    }
    getGameId() {
        let gid = 0;
        if (this.isHongmeng) {
          //  globalThis.oh.postMessage("exit","");
        }else
        if (typeof (jsb) != 'undefined') {
            if (this.isOnAndroid) {
                gid = jsb.reflection.callStaticMethod(this.classname, "getGameId", "()I");
            }
        }

        return gid;
    }
    InitGetGGType() {

        console.log("InitGetGGType: ", this.getGGType());
        this.setInsertCD();
        if (this.isHongmeng) {
          Platforms_hongmeng.getInstance().getGGType((ggtype)=>{
            this.gType=ggtype;
            console.log("GetGGType: ", this.getGGType());
          })
        }else
        if (this.isOnAndroid) {
            this.gType = jsb.reflection.callStaticMethod(this.classname, "getGGType", "()I");

            // if (SDK_config.apkConfig.isHW) {
            //     console.log("gType:" + this.gType);
            //     this.gType = 3;
            //     console.log('检测到海外包ggtype改为3');
            // }
        }

    }
    setInsertCD() {

        if (this.getGGType() == 3) {
            this.insertCD = 1;
        } else if (this.getGGType() == 2) {
            this.insertCD = 10;
        } else if (this.getGGType() == 1) {
            this.insertCD = 60;
        }
        this.curInsertCDtime = this.insertCD;

    }
    setGGtype(n){
        console.log("==setGGtype:=="+n);
        Platforms_Android.getInstance().gType=parseInt(n)
    }
    getGGType(): number {
        return this.gType;
    }
    shilitishi(age, content) {
        console.log("shilitishi:");
        if (this.isHongmeng) {
            globalThis.oh.postMessage("shilitishi",age+";"+content);
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "shilitishi", "(ILjava/lang/String;)V", age, content);

    }
    nativeCping(x, y, size) {
        console.log("nativeCping:" + x + "," + y);

        if (this.isHongmeng) {
            globalThis.oh.postMessage("nativeCping",x+";"+y+";"+size);
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "nativeCping", "(III)V", x, y, size);

        this.nativeTimes = 0;
        this.unschedule(this.autoNativeIcon);
        this.schedule(this.autoNativeIcon, 1);

    }
    hideNativeCping() {
        console.log("hideNativeCping:");
        if (this.isHongmeng) {
            globalThis.oh.postMessage("hideNativeCping","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "hideNativeCping", "()V");

    }
    hideBanner() {

        console.log("hideBanner:");
        if (this.isHongmeng) {
            globalThis.oh.postMessage("hideBanner","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "hideBanner", "()V");
    }

    cpingObgIdIndex(idIndex) {
        console.log("cpingObgIdIndex: ", idIndex);
        if (this.isHongmeng) {
            globalThis.oh.postMessage("showInsertIdIndex",""+idIndex);
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "showInsertIdIndex", "(I)V", idIndex);
        else
            this.localPrompt("调用vivo插屏广告");
    }

    public  unBindPlayer(){
        if (this.isHongmeng) {
            globalThis.oh.postMessage("unBindPlayer","");
        }else
        if (this.isOnAndroid)
            jsb.reflection.callStaticMethod(this.classname, "unBindPlayer", "()V");
        else
            console.log("unBindPlayer");
    }
    public  unBindPlayer_success(){
     //   cc.sys.localStorage.clear()
    }

    /**延时调用插屏 */
    ShowInsertDelay(dalayTime: number = 0.7, index: number = 1): void {
        console.log("延迟" + dalayTime + "秒后调用插屏: " + index);
        if (this.curInsertCDtime < this.insertCD) {
            console.log("插屏冷却中");
            return;
        }
        if (this.isOppo) {
            console.log("是oppo渠道");

        }
        else {
            console.log("是vivo渠道");

        }

        if (this.isPureness) {
            return;
        }


        // if (this.IsMmy == false)
        //     if (new Date().getTime() - this.delayStartTime < this.delayStartcount * 60 * 60 * 1000) {
        //         return;
        //     }
        console.log(new Date().getTime());

        this.curInsertCDtime = 0;
        if (this.isOppo) {
            this.scheduleOnce(() => {
                this.showInsertAd();
            }, dalayTime);
        }
        else {
            this.scheduleOnce(() => {
                this.cpingObgIdIndex(this.insertIndex);
                this.insertIndex++;
                if (this.insertIndex == 3) {
                    this.insertIndex = 0;
                }
            }, dalayTime);
        }

    }
}
window['Platforms_Android'] = Platforms_Android.getInstance();

