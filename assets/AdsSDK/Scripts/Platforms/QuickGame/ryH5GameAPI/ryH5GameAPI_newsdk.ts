

import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";
//import UI_hwNativeAd from "./UI_hwNativeAd_newsdk";

import UI_hwNativeAd from "../huaweiH5GameAPI/UI_hwNativeAd_newsdk";
import Platforms_QuickGame from "../Platforms_QuickGame_newsdk";
import Spalsh_newsdk from "../../../Splash/Spalsh_newsdk";
// import Utils from "../../../../Utils/Utils";
import LocalStorageManager from "../../../Tool/LocalStorageManager_newsdk";

import AdInteface from "../../../Tool/AdInteface_newsdk";
import hwNativeAd from "./ryNativeAd_newsdk";
import hwInsertAd from "./ryInsertAd_newsdk";
import hwVideoAd from "./ryVideoAd_newsdk";
import hwNativeBanner from "./ryNativeBanner_newsdk";
import hwHttpUpBehavior from "./ryHttpUpBehavior_newsdk";
import DebugLog from "../../../FrameWork/Debug/DebugLog_newsdk";
// import HttpUpBehavior from "../../../../../Scenes/HttpUpBehavior";



var bannerAd: any;
var rewardedVideoAd: any;

var qg: any;
export default class ryH5GameAPI implements PlatformsInterface {



    private lastTimeRecord3: number = 0;
    private lastNativeInsertTimeRecord3: number = 0;
    private lastNativeInsertTimeRecord2: number = 0;

    public static isfirstHint: boolean = true;
    /**视频广告是否已经load到数据 */
    isVideoReady: boolean = false;
    allNativeImageNode = new Map();
    hwVideocallback: any;

    /**原生组 */
    nactivearr: AdInteface[] = null;
    /**插屏组 */
    IntersArr: AdInteface[] = null;
    /**激励视频组 */
    viodeosArr: AdInteface[] = null;
    /**banner组 */
    bannerArr: AdInteface[] = null;
    onInit(_callback: ()=>{}) {
        // HttpUpBehavior.getInstance().addaction(1);//调用账号 
        console.log("荣耀初始化");

        qg = window['qg'];


        try {
            let self = this;

            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                console.log("==OS_WINDOWS==");
                // SDK_config.nativeTest = true;
                // SDK_config.ADTest = true;
                _callback&&_callback();
            }
          
            qg&&qg.onHide(function () {
                console.log("==hide==");
                this.hideBanner();
                this.hideInsertNativeAd();
            });


            // console.log("调入OAID");
            // if (SDK_config.openMaiLiang) {
            //     qg.getOAID && qg.getOAID({
            //         success: function (ret) {
            //             console.log("获取OAID成功 qg.getOAID success :" + JSON.stringify(ret));
            //             // ryH5GameAPI.OAID = JSON.stringify(ret);
            //             hwHttpUpBehavior.oaid = ret.oaid;
            //             hwHttpUpBehavior.getInstance().onInit(SDK_config.packageName,SDK_config.maiLiangAppid);//初始化打点
            //             // JSON.stringify(ret);
    
            //         },
            //         fail: function (erromsg, errocode) {
            //             console.log("qg.getOAID fail " + errocode + ': ' + erromsg)
                     
            //         },
            //         complete: function () {
            //             console.log("qg.getOAID complete")
                     
            //         }
            //     })
    
            // }
         
            this.gamelogin(_callback);
            qg&&qg.onShow(function () {
                console.log("==onShow==");
                self.allNativeImageNode.forEach(function (value, key) {
                    console.log("====size==");

                    console.log(key.active);

                    if (key.active && key.parent && key.parent.active) {

                        console.log("==reportAdShow");

                        try {

                            let delcb=key.getComponent(UI_hwNativeAd).delcb
                            let id = delcb.res.adList[0].adId;
                            console.log("==reportAdShow11=id=" + id);
                            delcb.onReportAdShow(id)
                           
                        } catch (error) {
                            console.log("=reportAdShow==" + error);
                        }
                    }

                });
            });


        } catch (error) {
            console.log(error);
        }


        this.nactivearr = this.initgetInarr();
        this.IntersArr = this.initIntersArr();
        this.viodeosArr = this.initVideoArr();
        this.bannerArr = this.initBannerArr();
        
        // this.preloadVideo(0);
    }

    /**原生插屏 */
    private initgetInarr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.ryID.NativeAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwNativeAd = new hwNativeAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }

    private initIntersArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.ryID.InsertAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwInsertAd = new hwInsertAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
    private initVideoArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.ryID.rewardedVideoAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwVideoAd = new hwVideoAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
          
            
        }

        

        return nactivearr;
    }
    private initBannerArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.ryID.NativeAdbanner
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwNativeBanner = new hwNativeBanner();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }

    exitgame(res) {
        qg.exitApplication(res);

    }


    gamelogin(callback) {
        console.log("Sign-in");

        if (qg) {
            console.log("荣耀默认");
            Spalsh_newsdk.issing = true;

            callback&&callback();

            // qg&&qg.login({
            //     needAuthCode: false,
            //     success: res => {
            //       const {authCode, openId, nickname, avatarUrl} = res
            //       console.log(`authCode:${authCode},openId:${openId},nickname:${nickname},avatarUrl:${avatarUrl}`)
               
            //       console.log(" game login with real success:" + res);
            //       Spalsh_newsdk.issing = true;
    
           
    
            //       callback&&callback();
    
            //     },
            //     fail: res => {
            //       // errCode、errMsg
            //       const {errCode, errMsg} = res
            //       qg.showToast({
            //         title: `登录失败: ${errCode} - ${errMsg}`,
            //         icon: 'error'
            //       })
    
            //       qg.showModal({
            //         title: '温馨提示',
            //         content: '您需登录华为账号并且实名认证方可进入游戏',
            //         confirmText: "前往登录",
            //         cancelText: "退出游戏",
            //         success(res) {
            //             if (res) {
            //                 ryH5GameAPI.prototype.gamelogin(callback);
            //                 //    Laya.timer.scale=1;
            //                 // game.resume();
            //                 //director.resume();
            //             } else {
            //                 ryH5GameAPI.prototype.exitgame(true);
            //             }
    
            //             // 打包时写1078 用下面这个
            //             // if (res.confirm) {
            //             //     console.log("重新登录");
            //             //     ryH5GameAPI.prototype.gamelogin();
            //             // } else if (res.cancel) {
            //             //     ryH5GameAPI.prototype.exitgame(true);
            //             // }
            //         }
            //     });
    
            //     },
            //     complete: () => {
            //         console.log('login接口 compelete')
            //     }
            //   })
        }else{
            callback&&callback();
        }
       

      
    }
    huaweiLogin(cb) {
        console.log("==========hw login=================");
        let self = this;
        var loginSuccess = -1;
        if (!qg) {
            cb();
            return;
        }

        qg.gameLogin({
            forceLogin: 0,
            appid: SDK_config.GameIdConfig.huaweiID.appId,
            success: function (data) {

                console.log("game login: success");
                self.showFloatingWin();
                loginSuccess = 0;

                if (cb) {
                    cb();
                }

            },
            fail: function (data, code) {
                console.log("DUWENJUN game login fail:" + data + ", code:" + code);
                loginSuccess = -1;
                if (cb) {
                    cb();
                }
            }
        });

        var cbShow = function () {
            console.log("--------on show----------");
            // 如果登录成功显示浮标
            //  if (loginSuccess === 0) {
            this.showFloatingWin();
            console.log("--------on show----loginSuccess------");
            //   }
        }.bind(this);

        var cbHide = function () {
            console.log("--------on hide----------");
            this.hideFloatingWin();
        }.bind(this);

        // 注册onShow/onHide回调，用于隐藏和显示浮标
        qg.onShow(cbShow);
        qg.onHide(cbHide);


    }
    showFloatingWin() {
        let self = this;


        qg.showFloatWindow({
            appid: SDK_config.GameIdConfig.huaweiID.appId,
            success: function () {
                console.log("show float window success.");

            },
            fail: function (data, code) {
                console.log("show float window fail:" + data + ", code:" + code);
            }
        });


    }

    hideFloatingWin() {
        let self = this;
        qg.hideFloatWindow({
            appid: SDK_config.GameIdConfig.huaweiID.appId,
            success: function () {
                console.log("hide float window success");
            },
            fail: function (data, code) {
                console.log("hide float window fail:" + data + ", code:" + code);
            }
        });
    }
    share(_callback: Function) {

    }
    shareVideo(_successCallback: Function, _failCallback: Function) {

    }

    openYSZC() {
        qg.openDeeplink({
            uri: SDK_config.GameIdConfig.huaweiID.hwyszc,
            params: {
                ___PARAM_LAUNCH_NATIVE_FLAG___: 'newTask'
            }
        });
    }
    createBanner() {




        // let height = 700;


        // //  height=view.getVisibleSize().height

        // height = qg.getSystemInfoSync().safeArea.height;
        // console.log(height);
        // bannerAd = qg.createBannerAd({
        //     adUnitId: SDK_config.GameIdConfig.huaweiID.bannerAdId,
        //     style: {
        //         top: height - 57,
        //         left: 0,
        //         height: 57,
        //         width: 360
        //     },
        //     adIntervals: SDK_config.GameIdConfig.huaweiID.bannerFlushTime,
        // })

    }
    flushbanner: any;
    counttime: number = 0;
    istan: boolean = true;

    // showBanner(_arg?: any) {
    //     // console.log("华为banner");
    //     // return;
    //     if (!qg) {
    //         console.log("=qg==不存在");

    //         return;
    //     }


    //     let self = this;



    //     let sbanner = function () {

    //         // if (SDK_config.nativeTest) {
    //         //     // self.createNative(function(adres){
    //         //     //     let del={
    //         //     //         onNativeAdClick:self.onNativeAdClick,
    //         //     //         res:adres,

    //         //     //     }
    //         //     //     UI_Manager.getInstance().showUI('NativeAD_banner',del);

    //         //     // },SDK_config.GameIdConfig.huaweiID.NativeAdId);
    //         //     return;
    //         // }

    //         if (!bannerAd) {
    //             self.createBanner();
    //         }
    //         bannerAd.show();
    //         bannerAd.onError(function (err) {
    //             console.log("banner 拉取 失败：", err.errCode, "errMsg:", err.errMsg);
    //             bannerAd.offError();
    //         });
    //     }


    //     if (this.flushbanner) {
    //         clearInterval(this.flushbanner);
    //     }
    //     if (self.istan) {
    //         sbanner();
    //         self.istan = false;
    //     }

    //     this.flushbanner = setInterval(function () {
    //         self.counttime++
    //         if (self.counttime == SDK_config.GameIdConfig.huaweiID.bannerFlushTime) {
    //             self.counttime = 0;
    //             //   sbanner();
    //             self.istan = true;
    //         }
    //     }, 1000);


    //     console.log("vivoH5GameAPI showBanner");
    // }

 
    hideBanner() {
        if (SDK_config.nativeTest) {
            UISDK_Manager_newsdk.getInstance().hideUI('demo_banner');
            return;
        }

        if (bannerAd) {
            //   TipUtils.showTip("Oppo平台 销毁横幅广告");
            // bannerAd.destroy();
            // bannerAd = null;
            bannerAd.hide();
        }
        console.log("vivoH5GameAPI hideBanner");
    }
    createVideo(index = 0) {

        if (index >= SDK_config.GameIdConfig.huaweiID.rewardedVideoAdId.length) {
            return;
        }


        console.log('===preload==')
        if (!qg) {
            console.log('没有 qg 返回')
            return;
        }
        let self = this;
        if (rewardedVideoAd) {
            rewardedVideoAd.destroy();
        }
        let adUnitId = SDK_config.GameIdConfig.huaweiID.rewardedVideoAdId[index];
        console.log(adUnitId)
        rewardedVideoAd = qg.createRewardedVideoAd({
            adUnitId: adUnitId,
            success: (code) => {
                console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd: success");
            },
            fail: (data, code) => {
                console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd fail: " + data + "," + code);
            },
            complete: () => {
                console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd complete");
            }
        });
        let onloadcb = function () {
            console.log('ad loaded.')
            self.isVideoReady = true;
            // rewardedVideoAd.show()
            rewardedVideoAd.offLoad(onloadcb);
        }
        rewardedVideoAd.onLoad(onloadcb);
        let onerrcb = function (e) {
            self.isVideoReady = false;
            console.error('load ad error:' + JSON.stringify(e));

            const errCode = e.errCode
            const errMsg = e.errMsg
            self.hwVideocallback.onAdFailed('load ad error:' + JSON.stringify(e));
            rewardedVideoAd.offError(onerrcb)


        }
        rewardedVideoAd.onError(onerrcb)

        let cbc = function (res) {
            console.log('ad onClose: ' + res.isEnded)
            if (res.isEnded) {
                self.hwVideocallback.onVideoPlayComplete();
            } else {
                rewardedVideoAd.destroy();
                rewardedVideoAd = null;

                self.createVideo();
                self.hwVideocallback.onAdClose();
            }




            rewardedVideoAd.destroy();
            rewardedVideoAd = null;

            self.createVideo();
        }

        rewardedVideoAd.offClose(cbc)
        rewardedVideoAd.onClose(cbc)
        rewardedVideoAd.load();
    }
     showVideo(_successCallback: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
         console.log("华为视频");
         let theTime = new Date().getTime() / 1000;
         if (theTime - this.lastNativeInsertTimeRecord3 <= 1) {
             return;
         }
         this.lastNativeInsertTimeRecord3 = new Date().getTime() / 1000;
 
         if (SDK_config.nativeTest) {
             if (Math.random() * 100 < 70) {
                 let obj = { scb: _successCallback, fcb: _failCallback, showcb: _showCallback, closecb: _closeCallback };
                 UISDK_Manager_newsdk.getInstance().showUI('demo_video', obj);
             } else {
                 _failCallback && _failCallback();
             }
             return;
         }
 
          this.hwVideocallback = { onVideoPlayComplete: _successCallback, onAdFailed: _failCallback, onAdClose: _closeCallback };
 
         let self = this;
         if (rewardedVideoAd) {
             rewardedVideoAd.destroy();
         }
         let adUnitId = SDK_config.GameIdConfig.huaweiID.rewardedVideoAdId[0];
         rewardedVideoAd = qg.createRewardedVideoAd({
             adUnitId: adUnitId,
             success: (code: any) => {
                 console.log("createRewardedVideoAd: success");
             },
             fail: (data: any, code: any) => {
                 console.log("createRewardedVideoAd fail: " + data + "," + code);
             },
             complete: () => {
                 console.log("createRewardedVideoAd complete");
             }
         });
 
         let onloadcb = function () {
             console.log('ad loaded.');
             self.isVideoReady = true;
             rewardedVideoAd.offLoad(onloadcb);
 
             rewardedVideoAd.show();
         }
         rewardedVideoAd.onLoad(onloadcb);
 
         let onerrcb = function (e: any) {
             self.isVideoReady = false;
             console.error('load ad error:' + JSON.stringify(e));
             self.hwVideocallback && self.hwVideocallback.onAdFailed('load ad error:' + JSON.stringify(e));
             rewardedVideoAd.offError(onerrcb);
         }
         rewardedVideoAd.onError(onerrcb);
 
         let cbc = function (res: any) {
             console.log('ad onClose: ' + res.isEnded);
             if (res.isEnded) {
                 self.hwVideocallback && self.hwVideocallback.onVideoPlayComplete();
             } else {
                 rewardedVideoAd.destroy();
                 rewardedVideoAd = null;
                 // self.createVideo();
                 self.hwVideocallback && self.hwVideocallback.onAdClose();
             }
             rewardedVideoAd && rewardedVideoAd.destroy();
             rewardedVideoAd = null;
             // self.createVideo();
         }
         rewardedVideoAd.offClose(cbc);
         rewardedVideoAd.onClose(cbc);
         rewardedVideoAd.load();
     }
 
 
     isLoadInserting = false;
     public static isshowinnsert = false;
     hideadid = "";
 
     showInsertAd() {
         console.log("华为插屏");
         this.isLoadInserting = true;
         if (ryH5GameAPI.isshowinnsert) {
             return;
         }
         ryH5GameAPI.isshowinnsert = true;
         this.isLoadInserting = true;
         this.lastNativeInsertTimeRecord2 = new Date().getTime() / 1000;
     }
 
     addNativeNode(anode: any) {
         if (!this.allNativeImageNode.get(anode)) {
             this.allNativeImageNode.set(anode, anode.getComponent(UI_hwNativeAd));
         }
     }
 
     hideInsertNativeAd() {
         UISDK_Manager_newsdk.getInstance().hideUI('NativeAd');
     }
 
     id = 0;
     createNative(callback: any, index: number = 0) {
         let self = this;
         try {
             if (index >= SDK_config.GameIdConfig.huaweiID.NativeAdId.length) {
                 return;
             }
 
             var curnativeid = SDK_config.GameIdConfig.huaweiID.NativeAdId[index];
             console.log("curnativeid :" + curnativeid);
             console.log(SDK_config.nativeTest);
 
             if (SDK_config.nativeTest) {
                 let res1 = {
                     adId: "9b70dcaa-321f-4114-aa4d-b2630adebfe8" + (this.id++),
                     clickBtnTxt: "点击安装",
                     creativeType: 8,
                     source: "HUAWEI",
                     desc: "蒙古手撕牛肉干降价了",
                     icon: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",
                     iconUrlList: ["http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg"],
                     imgUrlList: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",
                     length: 3,
                     interactionType: 2,
                     appName: "aaaa",
                     developerName: "bbbb",
                     versionName: "cccc",
                     appDetailUrl: "dddd",
                     privacyUrl: "eeee",
                     permissionUrl: "ffff",
                     logoUrl: "",
                     title: "拼多多",
                 };
                 let res = { adList: [res1], code: 0, msg: "ok" };
                 setTimeout(() => {
                     callback(res);
                 }, 500 + Math.random() * 1000);
                 return;
             }
 
             if (!qg) {
                 console.log("=qg==不存在");
                 callback();
                 return;
             }
         } catch (error) {
             console.log(error);
         }
     }
 
     onNativeAdClick(_id: string) {
         console.log("id :" + _id);
     }
 
     showBanner(_arg?: any) {
         this.showBanner1(_arg, 0);
     }
 
     bannerIdIndex: number = 0;
     showBanner1(_arg?: any, count?: number) {
         if (count >= this.bannerArr.length) {
             console.log("count >=bannerArr.length");
             return;
         }
         let bid = this.bannerIdIndex;
         let count1 = count + 1;
         let inaarr = this.bannerArr;
 
         inaarr[bid].show(_arg, (str: string) => {
             if (str == "0") {
                 console.log("showbaner:" + bid);
             } else {
                 this.showBanner1(_arg, count1);
             }
         });
 
         this.bannerIdIndex++;
         if (this.bannerIdIndex >= inaarr.length) {
             this.bannerIdIndex = 0;
         }
     }
 
     showCommonNative(_arg?: any) {
         console.log("showCommonNative");
         this.showCommonNative1(_arg, 0);
     }
 
     showCommonNative1(_arg?: any, count?: number) {
         if (count >= this.nactivearr.length) {
             DebugLog.log("count >=nativeArr.length");
             return;
         }
         let count1 = count + 1;
         let inaarr = this.nactivearr;
 
         inaarr[count].show(_arg, (str: string) => {
             if (str == "0") {
                 console.log("showCommonNative1:" + count);
             } else {
                 this.showCommonNative1(_arg, count1);
             }
         });
     }
 
      isNumeric(value) {
         return !isNaN(parseInt(value)) && isFinite(value);
     }
 
     showCommonInsert(_arg?: any,_successCallback?,falseCallback?) {
         console.log("showCommonInsert");
         // let inaarr = this.IntersArr;
         // for (let j = 0; j < inaarr.length; j++) {
         //     if (inaarr[j].isReady()) {
         //         inaarr[j].show();
         //         break;
         //     } else {
         //         inaarr[j].preLoadAd();
         //     }
         // }
 
         //荣耀直接调用插屏
         let inaarr = this.IntersArr;
 
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
 
     preloadVideo(count: number = 0) {
         if (count >= this.viodeosArr.length) {
             console.log("count >=viodeosArr.length");
             return;
         }
         let inaarr = this.viodeosArr;
         let count1 = count + 1;
         if (inaarr[count].isReady()) {
             return;
         } else {
             inaarr[count].preLoadAd(() => {
                 this.preloadVideo(count1);
             });
         }
     }
 
     ADCD = 0;
     showCommonVideo(_arg,_successCallback: any, _failCallback: any) {
         let theTime = new Date().getTime() / 1000;
         if (theTime - this.ADCD <= 2) {
             console.log(2 - (theTime - this.ADCD) + "秒后再试 ");
             return;
         }
         this.ADCD = new Date().getTime() / 1000;
 
         // let inaarr = this.viodeosArr;
         // for (let j = 0; j < inaarr.length; j++) {
         //     if (inaarr[j].isReady()) {
         //         inaarr[j].show("", _successCallback, _failCallback);
         //         return;
         //     }
         // }
         // console.log("没有获取到广告");
         // _failCallback && _failCallback();
         // this.preloadVideo(0);
 
        //  this.showVideo(_successCallback,_failCallback);
        let inaarr = this.viodeosArr;

      
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
 
     saveDataToCache(_key: string, _value: any) {}
     readDataFromCache(_key: string) {}
 
     hasShortcutInstalled(_callback: Function) {
         console.log('==hasTableIcon===');
         qg && qg.hasShortcutInstalled({
             success: function (res: any) {
                 console.log("===============hasInstalledsuccess： " + res);
                 if (res) {
                     _callback && _callback(1);
                 } else {
                     _callback && _callback(0);
                 }
             },
             fail: function (data: any) {
                 console.log("hasInstalled fail: " + data);
             },
             complete: function () {
                 console.log("hasInstalled complete");
             }
         });
     }
 
     addDesktop(_callback: Function) {
         let mes = "将快捷方式添加到桌面以便下次使用";
         qg && qg.installShortcut({
             message: mes,
             success: function (ret: any) {
                 console.log('handling install success');
                 _callback && _callback(1);
             },
             fail: function (erromsg: any, errocode: any) {
                 console.log('handling install fail: ' + erromsg + ", errocode: " + errocode);
                 _callback && _callback(0);
             },
             complete: function () {
                 console.log("handling install complete");
             }
         });
     }
 
     startRecordScreen() {}
     stopRecordScreen() {}
     showMoreGames() {}
     jumpToGame(_packageName: string) {}
 
     sendMessage(key: string, value: any) {}
 
     showToast(messages: string) {
         console.log(messages);
         if (!qg) return;
         qg && qg.showToast({
             title: messages,
             icon: 'none',
             duration: 2000
         });
     }
    }