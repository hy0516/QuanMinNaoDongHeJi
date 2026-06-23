
import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";
import UI_hwNativeAd from "./UI_hwNativeAd_newsdk";
import Platforms_QuickGame from "../Platforms_QuickGame_newsdk";
import Spalsh_newsdk from "../../../Splash/Spalsh_newsdk";
import LocalStorageManager from "../../../Tool/LocalStorageManager_newsdk";
import AdInteface from "../../../Tool/AdInteface_newsdk";
import hwNativeAd from "./hwNativeAd_newsdk";
import hwInsertAd from "./hwInsertAd_newsdk";
import hwVideoAd from "./hwVideoAd_newsdk";
import hwNativeBanner from "./hwNativeBanner_newsdk";
import hwHttpUpBehavior from "./hwHttpUpBehavior_newsdk";
import DebugLog from "../../../FrameWork/Debug/DebugLog_newsdk";

var bannerAd: any;
var rewardedVideoAd: any;
var hbs: any;
var qg: any;

export default class hwH5GameAPI implements PlatformsInterface {

    private lastTimeRecord3: number = 0;
    private lastNativeInsertTimeRecord3: number = 0;
    private lastNativeInsertTimeRecord2: number = 0;

    public static isfirstHint: boolean = true;
    isVideoReady: boolean = false;
    allNativeImageNode = new Map();
    hwVideocallback: any;

    nactivearr: AdInteface[] = null;
    IntersArr: AdInteface[] = null;
    viodeosArr: AdInteface[] = null;
    bannerArr: AdInteface[] = null;

    onInit(_callback: any) {
        console.log("华为初始化");
        hbs = window['hbs'];
        qg = window['qg'];

        try {
            let self = this;

            // CC3: sys.os 替代 cc.sys.os；sys.OS.WINDOWS 替代 cc.sys.OS_WINDOWS
            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                console.log("==OS_WINDOWS==");
                _callback && _callback();
            }

            hbs && hbs.onHide(function () {
                console.log("==hide==");
                self.hideBanner();
                self.hideInsertNativeAd();
            });

            console.log("调入OAID");
            if (SDK_config.openMaiLiang) {
                qg && qg.getOAID && qg.getOAID({
                    success: function (ret: any) {
                        console.log("获取OAID成功 qg.getOAID success :" + JSON.stringify(ret));
                        hwHttpUpBehavior.oaid = ret.oaid;
                        hwHttpUpBehavior.getInstance().onInit(SDK_config.packageName, SDK_config.maiLiangAppid);
                    },
                    fail: function (erromsg: any, errocode: any) {
                        console.log("qg.getOAID fail " + errocode + ': ' + erromsg)
                    },
                    complete: function () {
                        console.log("qg.getOAID complete")
                    }
                });
            }

            this.gamelogin(_callback);

            hbs && hbs.onShow(function () {
                console.log("==onShow==");
                self.allNativeImageNode.forEach(function (value: any, key: any) {
                    console.log("====size==");
                    console.log(key.active);

                    if (key.active && key.parent && key.parent.active) {
                        console.log("==reportAdShow");
                        try {
                            let delcb = key.getComponent(UI_hwNativeAd).delcb;
                            let id = delcb.res.adList[0].adId;
                            console.log("==reportAdShow11=id=" + id);
                            delcb.onReportAdShow(id);
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

    private initgetInarr(): AdInteface[] {
        let nactivearr: AdInteface[] = [];
        let inaarr: string[] = SDK_config.GameIdConfig.huaweiID.NativeAdId;
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwNativeAd = new hwNativeAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }
        return nactivearr;
    }

    private initIntersArr(): AdInteface[] {
        let nactivearr: AdInteface[] = [];
        let inaarr: string[] = SDK_config.GameIdConfig.huaweiID.InsertAdId;
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwInsertAd = new hwInsertAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }
        return nactivearr;
    }

    private initVideoArr(): AdInteface[] {
        let nactivearr: AdInteface[] = [];
        let inaarr: string[] = SDK_config.GameIdConfig.huaweiID.rewardedVideoAdId;
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwVideoAd = new hwVideoAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }
        return nactivearr;
    }

    private initBannerArr(): AdInteface[] {
        let nactivearr: AdInteface[] = [];
        let inaarr: string[] = SDK_config.GameIdConfig.huaweiID.NativeAdbanner;
        for (let i = 0; i < inaarr.length; i++) {
            let anad: hwNativeBanner = new hwNativeBanner();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }
        return nactivearr;
    }

    exitgame(res: any) {
        qg && qg.exitApplication(res);
    }

    gamelogin(callback: any) {
        console.log("Sign-in");
        qg && qg.gameLoginWithReal({
            forceLogin: 1,
            appid: SDK_config.GameIdConfig.huaweiID.appId,
            success: function (data: any) {
                console.log(" game login with real success:" + JSON.stringify(data));
                Spalsh_newsdk.issing = true;
                callback && callback();

                if (cc.sys.localStorage.getItem("yszc")) {
                    // 已同意
                }
            },
            fail: function (data: any, code: any) {
                console.log("game login with real fail:" + data + ", code:" + code);
                Spalsh_newsdk.issing = false;

                if (code == 7004 || code == 2012) {
                    console.log("玩家取消登录，返回游戏界面让玩家重新登录。")
                    hbs.showModal({
                        title: '温馨提示',
                        content: '您需登录华为账号并且实名认证方可进入游戏',
                        confirmText: "前往登录",
                        cancelText: "退出游戏",
                        success(res: any) {
                            if (res) {
                                hwH5GameAPI.prototype.gamelogin(callback);
                            } else {
                                hwH5GameAPI.prototype.exitgame(true);
                            }
                        }
                    });
                }
                if (code == 7021) {
                    Platforms_QuickGame.getInstance().exitgame(true);
                    console.log("The player has canceled identity verification. Forbid the player from entering the game.")
                }
            }
        });
    }

    showModal(title: string, content: string, confirmText: string, cancelText: string, _successCallback: Function, _failCallback: Function) {
        qg.showModal({
            title: title,
            content: content,
            confirmText: confirmText,
            cancelText: cancelText,
            success(res) {
                if (res.confirm) {
                    _successCallback && _successCallback();
                } else if(res.cancel) {
                    _failCallback && _failCallback();
                }
            }
        });

    }

    showFloatingWin() {
        hbs.showFloatWindow({
            appid: SDK_config.GameIdConfig.huaweiID.appId,
            success: function () {
                console.log("show float window success.");
            },
            fail: function (data: any, code: any) {
                console.log("show float window fail:" + data + ", code:" + code);
            }
        });
    }

    hideFloatingWin() {
        hbs.hideFloatWindow({
            appid: SDK_config.GameIdConfig.huaweiID.appId,
            success: function () {
                console.log("hide float window success");
            },
            fail: function (data: any, code: any) {
                console.log("hide float window fail:" + data + ", code:" + code);
            }
        });
    }

    share(_callback: Function) {}

    shareVideo(_successCallback: Function, _failCallback: Function) {}

    openYSZC() {
        qg && qg.openDeeplink({
            uri: SDK_config.GameIdConfig.huaweiID.hwyszc,
            params: {
                ___PARAM_LAUNCH_NATIVE_FLAG___: 'newTask'
            }
        });
    }

    hideBanner() {
        if (SDK_config.nativeTest) {
            UISDK_Manager_newsdk.getInstance().hideUI('demo_banner');
            return;
        }
        if (bannerAd) {
            bannerAd.hide();
        }
    }

    createVideo(index: number = 0) {
        if (index >= SDK_config.GameIdConfig.huaweiID.rewardedVideoAdId.length) {
            return;
        }
        if (!hbs) {
            console.log('没有 hbs 返回');
            return;
        }
        let self = this;
        if (rewardedVideoAd) {
            rewardedVideoAd.destroy();
        }
        let adUnitId = SDK_config.GameIdConfig.huaweiID.rewardedVideoAdId[index];
        rewardedVideoAd = hbs.createRewardedVideoAd({
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
                self.createVideo();
                self.hwVideocallback && self.hwVideocallback.onAdClose();
            }
            rewardedVideoAd && rewardedVideoAd.destroy();
            rewardedVideoAd = null;
            self.createVideo();
        }
        rewardedVideoAd.offClose(cbc);
        rewardedVideoAd.onClose(cbc);
        rewardedVideoAd.load();
    }

    // showVideo(_successCallback: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
    //     console.log("华为视频");
    //     let theTime = new Date().getTime() / 1000;
    //     if (theTime - this.lastNativeInsertTimeRecord3 <= 1) {
    //         return;
    //     }
    //     this.lastNativeInsertTimeRecord3 = new Date().getTime() / 1000;

    //     if (SDK_config.nativeTest) {
    //         if (Math.random() * 100 < 70) {
    //             let obj = { scb: _successCallback, fcb: _failCallback, showcb: _showCallback, closecb: _closeCallback };
    //             UISDK_Manager_newsdk.getInstance().showUI('demo_video', obj);
    //         } else {
    //             _failCallback && _failCallback();
    //         }
    //         return;
    //     }

    //     this.hwVideocallback = { onVideoPlayComplete: _successCallback, onAdFailed: _failCallback, onAdClose: _closeCallback };

    //     if (!hbs) {
    //         this.hwVideocallback.onVideoPlayComplete();
    //     }
    //     if (this.isVideoReady) {
    //         rewardedVideoAd.show();
    //     } else {
    //         this.createVideo();
    //     }
    // }

    
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
        rewardedVideoAd = hbs.createRewardedVideoAd({
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
        if (hwH5GameAPI.isshowinnsert) {
            return;
        }
        hwH5GameAPI.isshowinnsert = true;
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

            if (!hbs) {
                console.log("=hbs==不存在");
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

    showCommonInsert(_arg?: any,_successCallback?,falseCallback?,adtype?) {
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

        //华为没有插屏，直接调用原生
        //华为没有插屏，直接调用原生
        let inaarr = this.nactivearr;

        if (adtype==1) {
            inaarr = this.IntersArr;
            console.log("使用系统插屏")
        }
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

        // this.showVideo(_successCallback,_failCallback);

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
        hbs && hbs.hasInstalled({
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
        if (!hbs) return;
        qg && qg.showToast({
            title: messages,
            icon: 'none',
            duration: 2000
        });
    }
}
