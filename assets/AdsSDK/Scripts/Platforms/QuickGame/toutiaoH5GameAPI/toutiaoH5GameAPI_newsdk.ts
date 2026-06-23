import SDK_config from "../../../SDK_config_newsdk";
import { PlatformsInterface } from "../PlatformsInterface_newsdk";


export default class toutiaoH5GameAPI_newsdk implements PlatformsInterface {
    showCommonInsert() {
        throw new Error("Method not implemented.");
    }
    showCommonNative(_arg?: any) {
        throw new Error("Method not implemented.");
    }
    showCommonVideo(_successCallback: () => void, _failCallback?: () => void) {
        throw new Error("Method not implemented.");
    }
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
    showMoreGames() {
        throw new Error("Method not implemented.");
    }
    sendMessage(key: string, value: any) {
        throw new Error("Method not implemented.");
    }
    videoType: string;
    arg: any;

    /**平台环境 */
    tt: any = window["tt"];
    /**banner广告 */
    bannerAd: any = null;
    /**插屏广告 */
    interstitialAd: any = null;
    /**视频广告 */
    rewardedVideoAd: any = null;
    /**视频广告是否已经load到数据 */
    m_videoAdIsLoaded: boolean = false;
    /**分享图地址 */
    shareUrl: string = "https://www.zywxgames.com/Resource/liufenghong/beatDoudou/share.jpg";
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

    /**插屏拉取间隔 */
    lastTimeInsert = 0; // 上一次拉取插屏时间

    /**初始化 */
    onInit(_callback: Function) {
        if (this.tt != null && this.tt != undefined) {
            const res = this.tt.getSystemInfoSync();
            if (res) {
                this.windowWidth = res.windowWidth;
                this.windowHeight = res.windowHeight;
                this.systemInfo = res;
            }
          
            this.recorder = this.tt.getGameRecorderManager();
            setInterval(() => {
                this.timeCount += 0.1;
            }, 100);
        }
        _callback && _callback();
        this.createVideo();
        console.log("toutiaoH5GameAPI=============================>:onInit");
    }
    /**登录*/
    onLogin() {
        
    }
    /**分享游戏链接 */
    onShare(_callback: Function) {
        if (this.tt != null && this.tt != undefined) {
            this.tt.shareAppMessage({
                templateId: "1h7e9waqvka7adqt6a",
                title: "吃饭、睡觉、打豆豆",
                imageUrl: this.shareUrl,
                success: () => {
                
                    _callback && _callback(1);
                },
                fail: (res) => {
                 
                    _callback && _callback(0);
                }
            });
        }
    }
    /**分享录屏 */
    onShareVideo(_callback: Function) {
        if (this.tt != null && this.tt != undefined) {
            if (this.recordTime < 3) {
               
                return;
            }
            this.tt.shareAppMessage({
                channel: "video",
                title: "吃饭、睡觉、打豆豆",
                extra: {
                    videoPath: this.videoPath, // 可用录屏得到的视频地址
                    videoTopics: ['跟我一起来玩玩吧']
                },
                success: () => {
                  
                    _callback && _callback(1);
                },
                fail: (err) => {
    
                    _callback && _callback(0);
                }
            })
        }
    }
    /**创建banner */
    createBanner() {

    }
    /**展示banner */
    showBanner() {
        if (this.tt != null && this.tt != undefined) {
            if (this.systemInfo.appName == "Douyin") {
                return;
            }
            if(this.bannerAd) {
                console.log("already show");
                return;
            }
            this.hideBanner();

            let targetBannerAdWidth = 208;
            this.bannerAd = this.tt.createBannerAd({
                adUnitId: SDK_config.GameIdConfig.toutiaoID["bannerAdId"],
                adIntervals: 30,
                style: {
                    width: targetBannerAdWidth,
                    top: this.windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
                    left: (this.windowWidth - targetBannerAdWidth) / 2
                }
            });
            this.bannerAd.onLoad(() => {
                this.bannerAd.show().then(() => {

                }).catch(err => {

                });
            });
            this.bannerAd.onError(() => {
                this.hideBanner();
            });
            const onResizeCallback = (size) => {
                console.log(targetBannerAdWidth, size.width, size.height);
                // 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
                if(targetBannerAdWidth != size.width) {
                    console.log("resize func");
                    this.bannerAd.style.top = this.windowHeight - size.height;
                    this.bannerAd.style.left = (this.windowWidth - size.width) / 2;
                }
                
                this.bannerAd.offResize(onResizeCallback);
            }
            this.bannerAd.onResize(onResizeCallback);
        }
    }
    /**隐藏banner */
    hideBanner() {
        if (this.bannerAd) {
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }
    /**创建激励视频 */
    createVideo() {
        if (this.tt != null && this.tt != undefined) {
            this.rewardedVideoAd = this.tt.createRewardedVideoAd({
                adUnitId:SDK_config.GameIdConfig.toutiaoID["rewardedVideoAdId"],
            });
            this.rewardedVideoAd.load();
            this.rewardedVideoAd.onLoad(() => {
                console.log("onload激励视频广告加载成功");
                this.m_videoAdIsLoaded = true;
            });
            this.rewardedVideoAd.onError((err) => {
                console.log("onload激励视频广告加载失败-->errMsg:", err.errMsg, "==>errCode:", err.errCode);
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
    showVideo( _successCallback?: Function, _failCallback?: Function) {

        if (this.tt != null && this.tt != undefined) {

        }
        if (this.rewardedVideoAd && this.m_videoAdIsLoaded) {
            this.rewardedVideoAd.show();
            const onCloseFunc = (res) => {
                if (res.isEnded) {
                    console.log('激励视频广告完成，发放奖励');
                 
                    /**播放完毕 处理播放成功的逻辑 */
                    _successCallback && _successCallback();
                    this.rewardedVideoAd.load();
                } else {
                    console.log('激励视频广告取消关闭，不发放奖励');
                 
                    /**播放失败 处理播放失败的逻辑 */
                    _failCallback && _failCallback();
                    this.rewardedVideoAd.load();
                }
                this.rewardedVideoAd.offClose(onCloseFunc);
            };
            this.rewardedVideoAd.onClose(onCloseFunc);
        } else {
          
            this.createVideo();
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
        console.log("展示插屏");
        if (this.tt != null && this.tt != undefined) {
            if (this.systemInfo.appName != "Toutiao") {
                return;
            }
            
            console.log(this.tt.createInterstitialAd);
            if (!this.tt.createInterstitialAd) {
                return;
            }

            let theTime = new Date().getTime() / 1000;
            if(theTime - this.lastTimeInsert < 30) {
                console.log(30 - (theTime - this.lastTimeInsert) + "s later try again");
                return;
            }

            if (this.interstitialAd) {
                this.interstitialAd.destroy();
                this.interstitialAd = null;
            }

            this.interstitialAd = this.tt.createInterstitialAd({
                adUnitId: SDK_config.GameIdConfig.toutiaoID["InsertAdId"]
            });
            this.interstitialAd
                .load()
                .then(() => {
                    this.interstitialAd.show();
                })
                .catch(err => {
                    console.log(err);
                });

            let closeFunc = () => {
                this.lastTimeInsert = new Date().getTime() / 1000;
                this.interstitialAd.offClose(closeFunc);
            }
            this.interstitialAd.onClose(closeFunc);
        }
    }
    /**创建原生 */
    createNativeAd() {

    }
    /**展示原生 */
    showNativeAd() {
        this.showInsertAd();
    }
    /**原生被点击 */
    onNativeAdClick(_id: string) {

    }
    /**创建原生icon */
    createNativeIconAd() {

    }
    /**隐藏原生广告 */
    hideNativeAd(node: cc.Node, func: Function) {
        
    }
    /**展示原生icon */
    showNativeIconAd() {

    }
    /**原生icon被点击 */
    onNativeIconAdClick(_id: string) {

    }
    hideNativeIcon(node: cc.Node, func: Function) {
        console.log("");
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
    /**添加icon到桌面 */
    addDesktop(_callback: Function) {

    }
    // 检测是否添加桌面图标
    haveAddDesktop(_callback: Function) {

    }
    /**开始录制视频 */
    startRecordScreen() {
        if (this.recorder) {
            console.log("开始录屏");
            this.recorder.start({
                duration: 30
            });
            this.recorder.onStart(res => {
                this.timeCount = 0;
            });
            this.recorder.onStop(res => {
                this.recordTime = this.timeCount;
                console.log(res.videoPath);
                this.videoPath = res.videoPath;
            });
            this.recorder.onError(res => {
                console.log("========================>录屏失败:", res.errMsg);
            });
        }
    }
    /**结束录制视频 */
    stopRecordScreen() {
        if (this.recorder) {
            console.log("结束录屏");
            this.recorder.stop();
        }
    }
    /**创建更多游戏按钮 */
    createMoreGamesBtn() {

    }
    /**展示更多游戏按钮 */
    showMoreGamesBtn() {
        if (this.tt != null && this.tt != undefined) {
            if (this.systemInfo.platform == "ios") {
                return;
            }

            this.tt.showMoreGamesModal && this.tt.showMoreGamesModal({
                appLaunchOptions: [

                ],
                success: () => {

                },
                fail: (err) => {

                }
            })
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
    onCloseInsertOrNative() {
        
    }
}