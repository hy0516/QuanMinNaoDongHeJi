
// import ToastManager from "../../managers/ToastManager";
// import ListenerManager from "../../managers/ListenerManager";
// import ListenerType from "../../configs/ListenerType";
// import GameUtils from "../../utils/GameUtils";
import SDK_config from "../../../SDK_config";
import { PlatformsInterface } from "../PlatformsInterface";

export default class wxH5GameAPI implements PlatformsInterface {
    share(_callback: Function) {
        throw new Error("Method not implemented.");
    }
    shareVideo(_successCallback: Function, _failCallback: Function) {
        throw new Error("Method not implemented.");
    }
    hideInsertNativeAd() {
        throw new Error("Method not implemented.");
    }
    createNative(callback: any, nativeid: any) {
        throw new Error("Method not implemented.");
    }
    hasShortcutInstalled(_callback: Function) {
        throw new Error("Method not implemented.");
    }

    sendMessage(key: string, value: any) {
        throw new Error("Method not implemented.");
    }

    videoType: string;
    arg: any;

    /**平台环境 */
    wx: any = window["wx"];
    /**banner广告 */
    bannerAd: any = null;
    /**插屏广告 */
    interstitialAd: any = null;
    /**视频广告 */
    rewardedVideoAd: any = null;

    GridAd: any = null;

    customAd: any = null;
    /**视频广告是否已经load到数据 */
    m_videoAdIsLoaded: boolean = false;
    /**分享图地址 */
    shareUrl: string = "";
    /**录屏 */
    recorder: any = null;
    /**记录录屏时间 */
    timeCount: number = 0;
    /**录屏video地址 */
    videoPath: any = null;
    /**录屏时间 */
    recordTime: number = 0;
    /**设备像素width */
    windowWidth: number = 0;
    /**设备像素height */
    windowHeight: number = 0;
    /**系统信息 */
    systemInfo: any = null;
    /**延迟 */
    delay: boolean = true;

    lastTimeInsert = 0;

    public static ISlp: boolean = false; //是否开启录屏
    public static LpTime: number = 0;  //录屏的最低时间

    public static lpstart: number = 0;
    public static lpstop: number = 0;
    public intervalTime: number = 0;
    m_videoErrorBack: Function;

    ADcount:number=0;

    /**初始化 */
    onInit(_callback: Function) {

        console.log("wxAPIonInit")
        var self = this;
        try {
            this.wx = window['wx'];
            if (this.wx != null && this.wx != undefined) {
                console.log("wxAPI初始化成功")
                this.createVideo();
                const res = this.wx.getSystemInfoSync();


                console.log(res.SDKVersion);
                console.log(res.screenHeight);
                console.log(res.screenWidth);
                self.windowHeight = res.screenHeight;
                self.windowWidth = res.screenWidth;



            }
        } catch (error) {
                console.log(error);
            }
            // _callback && _callback();
            this.showShareMenu();
        }
    /**登录*/
    onLogin() {

        }

        showCustomAd() {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.11.1') return;
                if (this.wx.createCustomAd) {

                    if (this.customAd != null) {
                        this.customAd.destroy();
                    }
                    this.customAd = this.wx.createCustomAd({
                        adUnitId: SDK_config.GameIdConfig.weixinID["NativeAdIconId"],
                        style: {
                            left: 10,
                            top: 70,
                            //   width: 375, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
                            fixed: true // fixed 只适用于小程序环境
                        }
                    })

                    this.customAd.onLoad(() => console.log('原生模板广告加载成功'))
                    this.customAd.show().then(() => console.log('原生模板广告显示'))
                    this.customAd.onError(err => console.log(err))
                }
            }
        }
        hideCustomAd() {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.11.1') return;
                if (this.customAd != null) {
                    this.customAd.destroy();
                    this.customAd = null;
                }

            }

        }



        showShareMenu() {
            if (this.wx != null && this.wx != undefined) {
            this.wx.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            });
        }

        }
        hideShareMenu() {
            this.wx.hideShareMenu();
        }
        /**分享游戏链接 */
        onShare(_callback: Function) {
            this.wx.shareAppMessage({
                title: '转发标题'
            })
        }

        /**分享录屏 */
        onShareVideo(_callback: Function, _failback: Function) {

        }
        /**创建banner */
        createBanner() {

        }
        /**展示banner */
        showBanner() {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.0.4') return;
                if (this.bannerAd != null) {
                    this.bannerAd.destroy();
                }
                this.bannerAd = this.wx.createBannerAd({
                    adUnitId: SDK_config.GameIdConfig.weixinID["bannerAdId"],
                    adIntervals: 30,
                    style: {
                        top: this.wx.getSystemInfoSync().screenHeight,
                        width: 320,
                    }
                });
                this.bannerAd.onLoad(() => {
                    console.log('banner 广告加载成功')
                })

                this.bannerAd.onError(err => {
                    console.log(err)
                })
                this.bannerAd.show()
                    .then(() => console.log('banner 广告显示'))

                const Resize = (size) => {
                    // good
                    console.log(size.width, size.height);
                    this.bannerAd.style.top = this.windowHeight - size.height;
                    this.bannerAd.style.left = (this.windowWidth - size.width) / 2;

                    this.bannerAd.offResize(Resize);
                };

                this.bannerAd.onResize(Resize)
            }
        }
        /**隐藏banner */
        hideBanner() {
            if (this.bannerAd) {
                // TipUtils.showTip("tt平台 销毁横幅广告");
                this.bannerAd.hide();
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
            if(this.GridAd){
                this.hideMoreGames();
            }
        }
        /**创建激励视频 */
        createVideo() {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.0.4') return;
                if (this.rewardedVideoAd) {
                    this.rewardedVideoAd = null;
                }
                this.rewardedVideoAd = this.wx.createRewardedVideoAd({ adUnitId: SDK_config.GameIdConfig.weixinID["rewardedVideoAdId"] })
                this.m_videoAdIsLoaded = true;
                this.rewardedVideoAd.onLoad(() => {
                    console.log("onload激励视频广告加载成功");
                    this.m_videoAdIsLoaded = true;

                });
                this.rewardedVideoAd.onError((err) => {
                    console.log("onload激励视频广告加载失败");
                    this.m_videoAdIsLoaded = false;
                });
            }

        }
        /**
         * 
         * @param _type 类型
         * @param _arg 参数
         * @param _successCallback 成功回调
         * @param _failCallback 失败回调
         */
        /**展示激励视频 */
        showVideo(_successCallback ?: Function, _failCallback ?: Function, _errorCallback ?: Function) {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.0.4') return;
                if (this.rewardedVideoAd && this.m_videoAdIsLoaded) {
                    this.rewardedVideoAd.show();
                    const onClose = (res) => {
                        if (res.isEnded) {

                            _successCallback && _successCallback();
                            this.rewardedVideoAd.load();
                        } else {

                            _failCallback && _failCallback();
                            this.rewardedVideoAd.load();
                        }
                        this.rewardedVideoAd.offClose(onClose);
                    };
                    this.rewardedVideoAd.onClose(onClose);

                }
            } else {
                if (this.rewardedVideoAd) {
                    this.rewardedVideoAd = null;
                }
                this.rewardedVideoAd = this.wx.createRewardedVideoAd({ adUnitId: SDK_config.GameIdConfig.weixinID["rewardedVideoAdId"] })

                this.rewardedVideoAd.onLoad(() => {
                    console.log("onload激励视频广告加载成功");
                    this.m_videoAdIsLoaded = true;

                });
                this.rewardedVideoAd.onError((err) => {
                    console.log("onload激励视频广告加载失败");
                    this.m_videoAdIsLoaded = false;
                });
                this.rewardedVideoAd.show();
                const onClose = (res) => {
                    if (res && res.isEnded || res === undefined) {
                        _successCallback && _successCallback();
                        this.rewardedVideoAd.load();
                    } else {
                        _failCallback && _failCallback();
                        this.rewardedVideoAd.load();
                    }
                    this.rewardedVideoAd.offClose(onClose);
                };
                this.rewardedVideoAd.onClose(onClose);

            }
        }
        /**----------原生平台调用----------
         * 激励视频播放成功后调用(OC->TS || JAVA->TS) 
         */
        showVideoAward() {
            this.videoType = "";
            this.arg = null;
        }
        /**----------原生平台调用----------
         * 激励视频播放失败后调用(OC->TS || JAVA->TS) 
         */
        showVideoFail() {
            this.videoType = "";
            this.arg = null;
        }
        /**创建插屏 */
        createInsertAd() {

        }
        /**展示插屏 */
        showInsertAd() {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.0.4') return;
                if (this.interstitialAd != null) {
                    this.interstitialAd.destroy();
                }
                this.interstitialAd = this.wx.createInterstitialAd({ adUnitId: SDK_config.GameIdConfig.weixinID["InsertAdId"] });
                this.interstitialAd.onLoad(() => {
                    console.log('插屏 广告加载成功')
                })
                this.interstitialAd.show().catch((err) => {
                    console.error(err)
                })
                this.interstitialAd.onError(err => {
                    console.log(err)
                })
                this.interstitialAd.onClose(res => {
                    console.log('插屏 广告关闭')
                })


            }

        }
        showInsertAd1() {
            this.ADcount++;
            if(this.ADcount%2==0){
                if (this.wx != null && this.wx != undefined) {
                    if (this.wx.getSystemInfoSync().SDKVersion < '2.0.4') return;
                    if (this.interstitialAd != null) {
                        this.interstitialAd.destroy();
                    }
                    this.interstitialAd = this.wx.createInterstitialAd({ adUnitId: SDK_config.GameIdConfig.weixinID["InsertAdId"] });
                    this.interstitialAd.onLoad(() => {
                        console.log('插屏 广告加载成功')
                    })
                    this.interstitialAd.show().catch((err) => {
                        console.error(err)
                    })
                    this.interstitialAd.onError(err => {
                        this.showMoreGames();
                        console.log(err)
                    })
                    this.interstitialAd.onClose(res => {
                        console.log('插屏 广告关闭')
                    })
    
    
                }
            }else{
                this.showMoreGames();  
            }
            

        }
        /**创建原生 */
        createNativeAd() {

        }
        /**展示原生 */
        showNativeAd() {

        }
        /**原生被点击 */
        onNativeAdClick(_id: string) {

        }
        /**创建原生icon */
        createNativeIconAd() {

        }
        /**展示原生icon */
        showNativeIconAd() {

        }
        /**原生icon被点击 */
        onNativeIconAdClick(_id: string) {

        }
        /**适配不同渠道存储键值对localstorage
         * 默认使用 localStorage
         */
        saveDataToCache(_key: string, _value: any) {

        }
        /**适配不同渠道读取键值对localstorage
         * 默认使用 localStorage
         */
        readDataFromCache(_key: string) {

        }
        /**检查桌面icon */
        checkDesktop(_callback: Function) {

        }
        /**添加icon到桌面 */
        addDesktop(_callback: Function) {

        }
        /**创建录屏 */
        creatRecord() {


        }
        /**开始录制视频 */
        startRecordScreen() {

        }

        /**结束录制视频 */
        stopRecordScreen() {

        }
        /**创建更多游戏按钮 */
        createMoreGamesBtn() {

        }
        showMoreGamesBtn() {

        }
        /**展示更多游戏按钮 */
        showMoreGames() {
            if (this.wx != null && this.wx != undefined) {
                if (this.wx.getSystemInfoSync().SDKVersion < '2.11.1') return;
                if (this.wx.createCustomAd) {

                    if (this.customAd != null) {
                        this.customAd.destroy();
                    }
                    this.customAd = this.wx.createCustomAd({
                        adUnitId: SDK_config.GameIdConfig.weixinID["BlockBoxId"],
                        style: {
                           
                            top: this.windowHeight/3,
                            //   width: 375, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
                            fixed: true // fixed 只适用于小程序环境
                        }
                    })

                    this.customAd.onLoad(() => console.log('原生模板广告加载成功'))
                    this.customAd.show().then(() => console.log('原生模板广告显示'))
                    this.customAd.onError(err => console.log(err))
                }
            }
        }
        hideMoreGames() {
            if (this.wx != null && this.wx != undefined) {
                this.GridAd.hide();
                this.GridAd=null;
            }
        }
        /**
     * 跳转游戏
     * @param _packageName 包名
     */
        jumpToGame(_packageName: string) {

        }
        /** 添加彩签*/
        addColorBookmark() {

        }
        /**订阅app */
        addSubscribeApp() {

        }
        reportMonitor(name: string, args ?: number | string, step ?: number) {

        }
        vibrate(long ?: boolean) {


        }
        getVideoRecordTime(): number {
            console.log("rtim====" + this.recordTime);
            return this.recordTime;
        }
        reportAnalytics(flag: string, group: string = null) {

        }
        showToast(message: string) {

        }

    }