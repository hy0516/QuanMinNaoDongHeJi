import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";
import LocalStorageManager from "../../../Tool/LocalStorageManager_newsdk";

import UI_oppoNativeAd from "./UI_oppoNativeAd_newsdk";

import oppoNativeAd from "./oppoNativeAd_newsdk";
import oppoInsertAd from "./oppoInsertAd_newsdk";
import oppoVideoAd from "./oppoVideoAd_newsdk";
import AdInteface from "../../../Tool/AdInteface_newsdk";
import oppoNativeBanner, { bannerConfig } from "./oppoNativeBanner_newsdk";
var nativeAd: any;
var bannerAd: any;
var rewardedVideoAd: any;

export default class oppoGameAPI implements PlatformsInterface {


    qg = window['qg'];
    allNativeImageNode = new Map();
    private lastTimeRecord3: number = 0;
    private lastNativeInsertTimeRecord3: number = 0;
    /**视频广告是否已经load到数据 */
    systemInfo: any = null;
    m_videoAdIsLoaded: boolean = false;

    /**原生组 */
    nactivearr: AdInteface[] = null;
     /**插屏组 */
    IntersArr: AdInteface[]=null;
  /**激励视频组 */
     viodeosArr: AdInteface[]=null;
    /**banner组 */
    bannerArr: AdInteface[]=null;
    onInit(_callback: Function) {

        try {


            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                console.log("==OS_WINDOWS==");
                // SDK_config.nativeTest = true;
                // SDK_config.ADTest = true;
                _callback&&_callback();
                // return;
            }
		
            // this.createVideo();
            this.qg.setEnableDebug({
                enableDebug: false, // true 为打开，false 为关闭
                success: function () {
                    // 以下语句将会在 vConsole 面板输出 
                    console.log("test consol log");
                    console.info("test console info");
                    console.warn("test consol warn");
                    console.debug("test consol debug");
                    console.error("test consol error");
                },
                complete: function () {
                },
                fail: function () {
                }
            });
          
        } catch (error) {
            console.log(error);
        }
        this.nactivearr=this.initgetInarr();
        this.IntersArr=this.initIntersArr();
        this.viodeosArr=this.initVideoArr();
        this.bannerArr=this.initBannerArr();

 
        // this.preloadVideo(0);
        _callback&&_callback();
    }
    share(_callback: Function) {

    }
    shareVideo(_successCallback: Function, _failCallback: Function) {

    }
    addNativeNode(del) {

        let adinad: UI_oppoNativeAd = del.pnode.getComponent(UI_oppoNativeAd);
        /**广告类型不是原生icon都保存在map里 */
        if (!this.allNativeImageNode.get(del.pnode) && adinad.nativeType != 3) {
            this.allNativeImageNode.set(del.pnode, del.pnode.getComponent(UI_oppoNativeAd));
        }
        adinad.initLayer(del.res);
        /**除了当前显示的原生广告，其他都隐藏 */
        this.allNativeImageNode.forEach(function (value, key) {

            // console.log(key);
            // console.log(value);
            if ((key as cc.Node).active && del.pnode != key) {
                //     console.log("+++++++++++++");
                //   console.log(key);
                (key as cc.Node).active = false;
            }

        });
    }
    testBanner(){
        let self = this;
        this.createNative(function (adres) {
            let del = {
                onNativeAdClick: self.onNativeAdClick,
                res: adres,
                adType: 1,
            }
            UISDK_Manager_newsdk.getInstance().showUI('demo_banner', del);

        }, SDK_config.GameIdConfig.oppoID.bannerAdId);
    }

    // showBanner(_arg?: any) {
    //     let self = this;
    //     if (SDK_config.nativeTest) {
    //         this.createNative(function (adres) {
    //             let del = {
    //                 onNativeAdClick: self.onNativeAdClick,
    //                 res: adres,

    //             }
    //             UI_Manager.getInstance().showUI('demo_banner', del);

    //         }, SDK_config.GameIdConfig.oppoID.bannerAdId);
    //         return;
    //     }



    //     let qg = this.qg;


    //     if (LocalStorageManager.getStorageKeyValue('bannertime', '0') == '0') {
    //         LocalStorageManager.setStorageKeyValue('bannertime', '5');
    //     }
    //     let banshowtime = parseInt(LocalStorageManager.getStorageKeyValue('bannertime', '0'));
    //     console.log('bannertime：' + banshowtime);
    //     if (banshowtime <= 0) {
    //         console.log('banner展示次数用尽' + banshowtime);
    //         return;
    //     }

    //     if (bannerAd) {
    //         bannerAd.destroy();
    //     }

    //     bannerAd = qg.createBannerAd({
    //         posId: SDK_config.GameIdConfig.oppoID.bannerAdId
    //     });
    //     bannerAd.show();

    //     bannerAd.onShow(function () {
    //         console.log("banner 广告显示");

    //     });
    //     bannerAd.onHide(function () {
    //         console.log("banner 广告隐藏");

    //         {

    //             banshowtime--;
    //             console.log('bannertime:' + banshowtime);
    //             LocalStorageManager.setStorageKeyValue('bannertime', banshowtime + '');
    //         }

    //     })
    // }
    hideBanner() {
        if (SDK_config.nativeTest) {
            UISDK_Manager_newsdk.getInstance().hideUI('demo_banner');
            return;
        }

        if (bannerAd != null) {

            let addestroy = bannerAd.destroy();
            addestroy && addestroy.then(() => {
                console.log("banner广告销毁成功");
            }).catch(err => {
                console.log("banner广告销毁失败", err);
            });
            bannerAd = null;
        }
        console.log("vivoH5GameAPI hideBanner");
    }
    createVideo() {
        console.log("oppo=== createVideo");

        if (this.qg !== null && this.qg !== undefined) {

            if (rewardedVideoAd) {
                //   TipUtils.showTip("Oppo平台 销毁激励视频广告");
                rewardedVideoAd.destroy();
                rewardedVideoAd = null;
            }
            /**创建rewardedVideoAd 对象*/
            //  TipUtils.showTip("Oppo平台 创建激励视频广告");
            rewardedVideoAd = this.qg.createRewardedVideoAd({
                adUnitId: SDK_config.GameIdConfig.oppoID["rewardedVideoAdId"]
            });
            rewardedVideoAd.load();
            rewardedVideoAd.onLoad(() => {
                console.log("激励视频加载成功");

                this.m_videoAdIsLoaded = true;

            });
            rewardedVideoAd.onError((err) => {

                console.log('激励视频错误码 =====>:' + err.errMsg + "message ======>:" + err.errMsg);

                this.m_videoAdIsLoaded = false;
            });
        }
        console.log("Create RewardeVideoAd");
    }
    showVideo(_successCallback: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
        console.log("Oppo激励视频=============:");
        if (this.qg !== null && this.qg !== undefined) {
            if (this.qg.getSystemInfoSync().platformVersionCode < 1051) {
                console.log("版本号过低 无法创建激励视频广告");
                return;
            }
            if (rewardedVideoAd) {
                // TipUtils.showTip("Oppo平台 销毁激励视频广告");
                rewardedVideoAd.destroy();
                rewardedVideoAd = null;
            }
            /**创建rewardedVideoAd 对象*/
            // TipUtils.showTip("Oppo平台 创建激励视频广告");
            rewardedVideoAd = this.qg.createRewardedVideoAd({
                adUnitId: SDK_config.GameIdConfig.oppoID["rewardedVideoAdId"],
            });
            rewardedVideoAd.load();
            rewardedVideoAd.onLoad(() => {
                rewardedVideoAd.show();
                const onClose = (res) => {
                    if (res.isEnded) {
                        console.log('激励视频广告完成，发放奖励')
                        // TipUtils.showTip("激励视频广告播放完成 发放奖励");
                        /**播放完毕 处理播放成功的逻辑 */
                        _successCallback && _successCallback();
                        // this.rewardedVideoAd.load();
                    } else {
                        console.log('激励视频广告取消关闭，不发放奖励')
                        // TipUtils.showTip("激励视频广告播放失败 不发放奖励");
                        /**播放失败 处理播放失败的逻辑 */
                        _failCallback && _failCallback();
                        // this.rewardedVideoAd.load();
                    }
                    rewardedVideoAd.offClose(onClose);
                }
                rewardedVideoAd.onClose(onClose);
            });
            rewardedVideoAd.onError((err) => {
                console.log('OPPOH5GameAPI RewardedVideo load Error:code =====>:' + err.code + "message ======>:" + err.message);
                // TipUtils.showTip("激励视频广告 加载失败");
                // ViewManager.getInstance().showView("HintPanelView",1000,null,true,"广告准备中~");
                this.m_videoAdIsLoaded = false;
            });
            console.log("Create RewardeVideoAd");

        }
    }
    //原生插屏
    showInsertAd() {

        // let theTime = new Date().getTime() / 1000;
        // if(theTime - this.lastNativeInsertTimeRecord3 <= 1) {
        //     console.log((15 - (theTime - this.lastNativeInsertTimeRecord3)) + "秒后再试 native");
        //     return;
        // }
        // this.lastNativeInsertTimeRecord3=new Date().getTime() / 1000;
        let self = this;

        this.createNative(function (adres) {
            if (adres) {
                let del = {
                    onNativeAdClick: self.onNativeAdClick,
                    res: adres,
                    adType: 1,
                }
                UISDK_Manager_newsdk.getInstance().showUI('NativeAd', del, function (pnode) {
    
                });
            }


        }, SDK_config.GameIdConfig.oppoID.NativeAdId);

    }
    hideInsertNativeAd() {

        UISDK_Manager_newsdk.getInstance().hideUI('VivoNativeAd');
    }

    testAd(callback){
        let res1 = {
            adId: "9b70dcaa-321f-4114-aa4d-b2630adebfe8",
            clickBtnTxt: "点击安装",
            creativeType: 8,
            desc: "蒙古手撕牛肉干降价了",
            icon: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",
            iconUrlList: ["http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg"],
            imgUrlList: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",

            length: 3,
            __proto__: Array(0),
            interactionType: 2,
            logoUrl: "",
            title: "拼多多",

        }

        let res = {
            adList: [res1],
            code: 0,
            msg: "ok",
        }
        callback(res);

    }

    

    createNative(callback, nativeid = null) {
        let self = this;
        try {




            var curnativeid = SDK_config.GameIdConfig.oppoID.NativeAdId;
            if (nativeid) {
                curnativeid = nativeid;
            }
            console.log("curnativeid :" + curnativeid)



            if (SDK_config.nativeTest) {
                this.testAd(callback);
                return;
            }


            let qg = window['qg'];

            nativeAd = qg.createNativeAd({
                posId: curnativeid
            });

            nativeAd.load();

            let onLoadFun = function (res) {
                console.log("原生广告加载成功");
                if (res && res.adList) {


                    for (let i in res.adList[0]) {
                        console.log(i + "," + res.adList[0][i]);
                    }
                    console.log("上报广告成功", res.adList[0].adId.toString());

                    nativeAd.reportAdShow({
                        adId: res.adList[0].adId,
                    });


                    nativeAd.offLoad(onLoadFun);

                    callback(res);


                }

                nativeAd.offLoad(onLoadFun);
            };
            nativeAd.onLoad(onLoadFun);


            let errFun = function (err) {
                console.log("原生广告加载失败");
                for (let i in err) {
                    console.log(i + "," + err[i]);
                }
                callback();
                nativeAd.offError(errFun);
            };
            nativeAd.onError(errFun);


        } catch (error) {
            cc.log(error);
        }
    }
    onNativeAdClick(_id: string) {
        console.log("id :" + _id)
        console.log(nativeAd);

        nativeAd.reportAdClick({
            adId: _id
        });
    }

    saveDataToCache(_key: string, _value: any) {

    }
    readDataFromCache(_key: string) {

    }
    hasShortcutInstalled(_callback: Function) {
        if (this.qg != null && this.qg != undefined) {
            this.qg.hasShortcutInstalled({
                success: function (status) {
                    if (status) {
                        console.log('---------------------------------已创建');
                        _callback && _callback(1);
                    } else {
                        console.log('---------------------------------未创建');
                        _callback && _callback(0);
                    }
                }
            });
        }
        console.log("oppoH5GameAPI isHaveAddDesktop");
    }
    addDesktop(_callback: Function) {
        console.log('开始创建');
        let self = this;
        self.qg.installShortcut({
            success: (res) => {
                console.log("installShortcut");
                setTimeout(() => {
                    self.qg.hasShortcutInstalled({
                        success: function (status) {
                            console.log("status : ", status);
                            if (status) {
                                _callback && _callback(1);
                            } else {
                                _callback && _callback(0);
                            }
                        }
                    });
                }, 0.5 * 1000);
            },
            fail: function (err) {
                console.log("创建失败", err);
                _callback && _callback(0);
            },
            complete: function () {

            }
        })

    }

  
    /**原生插屏 */
    private initgetInarr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.oppoID.NativeAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: oppoNativeAd = new oppoNativeAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
   
    private initIntersArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.oppoID.InsertAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: oppoInsertAd = new oppoInsertAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
    private initVideoArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.oppoID.rewardedVideoAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: oppoVideoAd = new oppoVideoAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }

    preloadVideo(count:number=0){
        if (count >= this.viodeosArr.length) {
            console.log("count >=viodeosArr.length");
            return;
        }
        let inaarr = this.viodeosArr;
        let count1 = count + 1;
        if (inaarr[count].isReady()) {
           

        } else {
            inaarr[count].preLoadAd(()=>{
                this.preloadVideo(count1);
            });
        }
     
    }

    private initBannerArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.oppoID.NativeAdbanner
        for (let i = 0; i < inaarr.length; i++) {
            let anad: oppoNativeBanner = new oppoNativeBanner();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
    showBanner(_arg?: any) {
      
        if (SDK_config.nativeTest) {
            this.testBanner();
            return;
        }
        this.showBanner1(_arg,0);

    }
    /**当前banner广告索引 */
    bannerIdIndex:number=0;
    showBanner1(_arg?: any,count?: number) {
        if (count >=this.bannerArr.length) {
			console.log("count >=bannerArr.length");
			return;
		}
        let bid=this.bannerIdIndex;
        let count1=count+1;
        let inaarr = this.bannerArr;
       
        inaarr[bid].show(_arg, (str) => {
            if (str == "0") {
                for (let i = 0; i < inaarr.length; i++) {
                    if (bid != i) {
                        inaarr[i].hide();
                    }

                }
                console.log("showbaner:" + bid);
            } else {
                this.showBanner1(_arg,count1);

            }
        });

    }
    
    /**新原生方法 */
    showCommonNative(_arg?) {
        console.log("showCommonNative")

        this.showCommonNative1(0);
    }

    
     showCommonNative1( count?: number) {
       

       
         let inaarr = this.nactivearr;
         console.log(this.nactivearr.length+","+count);
         if (count >= inaarr.length) {
            console.log("count >=nativeArr.length");
            return;
        }
        let count1 = count + 1;
         inaarr[count].show(null, (str) => {
             if (str == "0") {
                 for (let i = 0; i < inaarr.length; i++) {
                     if (count != i) {
                         inaarr[i].hide();
                     }
 
                 }
                 console.log("showCommonNative1:" + count);
             } else {
                 this.showCommonNative1(count1);
 
             }
         });
 
       
 
     }
     isNumeric(value) {
        return !isNaN(parseInt(value)) && isFinite(value);
    }
    /**新插屏方法 */
    showCommonInsert(_arg?,_successCallback?,falseCallback?) {
   
        console.log("showCommonInsert-oppo")
   
        // this.showCommonInsert1(0);

        let inaarr = this.nactivearr;
		
        let cb=(str)=>{
            if (str=="0") {
                _successCallback&&_successCallback()
            }else{
                falseCallback&&falseCallback()
            }
            
        }

        let idindex=0
        if (_arg) {
          
            if (this.isNumeric(_arg)) {
                let intn=parseInt(_arg)
                if (inaarr[intn]) {
                    idindex=intn     
					console.log("正常弹出插屏");               
                }else{
                    console.log("数字越界：默认第一个插屏"+intn);
                    idindex=0;
                }
                
            }else{
                console.log("非数字,默认第一个插屏");
                idindex=0;
            }
        }else{

             idindex=0;
             console.log("默认插屏");
        }
        inaarr[idindex].show(100,cb);
    }
    showCommonInsert1(count?: number) {
        console.log("showCommonInsert-oppo")
   
        let inaarr = this.IntersArr;
        if (count >= inaarr.length) {
            console.log("count >=nativeArr.length");
            return;
        }
        let count1 = count + 1;
         inaarr[count].show(null, (str) => {
             if (str == "0") {
                 for (let i = 0; i < inaarr.length; i++) {
                     if (count != i) {
                         inaarr[i].hide();
                     }
 
                 }
                 console.log("showCommonNative1:" + count);
             } else {
                 this.showCommonInsert1(count1);
 
             }
         });
    }


    ADCD = 0;
    showCommonVideo(_arg,_successCallback, _failCallback) {

        let theTime = new Date().getTime() / 1000;
        if (theTime - this.ADCD <= 2) {
            console.log(2 - (theTime - this.ADCD) + "秒后再试 ");
            return;
        }
        this.ADCD = new Date().getTime() / 1000;

        let inaarr = this.viodeosArr;

        // for (let j = 0; j < inaarr.length; j++) {

        //     if (inaarr[j].isReady()) {
        //         inaarr[j].show("", _successCallback, _failCallback);

        //         return;
        //     } 
        // }
        // console.log("没有获取到广告")
        // // _failCallback&&_failCallback();
        // // this.preloadVideo(0)

        let id=0;
        if (this.isNumeric(_arg)) {
           let intn=parseInt(_arg)
       
           if (inaarr[intn]) {
               id=intn
           }else{
               console.log("数字越界："+intn);
           }
         
       }else{
           console.log("非数字,默认第一个");
       }

         if (inaarr[id]) {
            inaarr[id].loadAdnShow( _successCallback, _failCallback);
         }
        

    }
    startRecordScreen() {

    }
    stopRecordScreen() {

    }
    showMoreGames() {

    }
    jumpToGame(_packageName: string) {

    }
    sendMessage(key: string, value: any) {

    }
    exitgame(res) {
        this.qg.exitApplication(res);
    }
    showToast(message: string) {

        this.qg.showToast({
            title: message,
            icon: 'none',
            duration: 1500
        })
    }
}