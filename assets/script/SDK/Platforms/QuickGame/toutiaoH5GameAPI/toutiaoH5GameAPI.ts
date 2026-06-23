
// import ToastManager from "../../managers/ToastManager";
// import ListenerManager from "../../managers/ListenerManager";
// import ListenerType from "../../configs/ListenerType";
// import GameUtils from "../../utils/GameUtils";
import DyHttpUpBehavior from "../../../Tool/DyHttpUpBehavior1";
import SDK_config from "../../../SDK_config";
import { PlatformsInterface } from "../PlatformsInterface";

export default class toutiaoH5GameAPI implements PlatformsInterface {

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

    public static GGFree:number = 0; //广告解锁券
    m_videoErrorBack: Function;


    /**初始化 */
    onInit(_callback: Function) {
        console.log("TT onit==API脚本开启初始化");



        //this.tt = window["tt"];
        console.log("tt======", window["tt"])


        setTimeout(() => {
            this.lastTimeInsert = new Date().getTime() / 1000;
        }, 5000);




        if (this.tt != null && this.tt != undefined) {
            console.log("进入初始化的判断");
            // TipUtils.showTip("tt平台 执行初始化操作");
            const res = this.tt.getSystemInfoSync();
            if (res) {
                console.log("进入res判断");
                this.windowWidth = res.windowWidth;
                this.windowHeight = res.windowHeight;
                this.systemInfo = res;
                window['windowHeight'] = res.windowHeight;
                window['windowWidth'] = res.windowWidth;//+1
                console.log("window===", this.windowWidth);
                console.log("windowHeight===", this.windowHeight);
            }
            this.creatRecord();
            if (this.systemInfo.platform == "ios") {
                console.log("进入ios判断");

            }
            if(cc.sys.localStorage.getItem("GGFree") == null || cc.sys.localStorage.getItem("GGFree") == undefined){
                cc.sys.localStorage.setItem("GGFree", "0"); // 重置状态
            }else{
                toutiaoH5GameAPI.GGFree = parseInt(cc.sys.localStorage.getItem("GGFree"));
                console.log("GGFree===", toutiaoH5GameAPI.GGFree);
            }
            // this.tt.onShow((res) => {
            //     console.log("启动参数：", res.query);
            //     console.log("来源信息：", res.refererInfo);
            //     console.log("场景值：", res.scene);
            //     console.log("启动场景字段：", res.launch_from, ", ", res.location);
            //     if (res.launch_from == "homepage") {
            //         console.log("从侧边栏进入游戏");
            //         cc.sys.localStorage.setItem("isCbl", "1");//侧边栏进入游戏
            //     }
            // });




            _callback && _callback();
            const options = this.tt.getLaunchOptionsSync();//此段代码有可能已经存在 
            let query = options.query;
            //保存query.clickid 到缓存 dy_click_id 
            //保存query.projectid 到缓存 dy_projectid 
            //保存query.promotionid 到缓存 dy_promotionid
            //保存query.requestid 到缓存 dy_requestid
            if (query.clickid != undefined && query.clickid != null) {
                cc.sys.localStorage.setItem("dy_click_id", query.clickid);
                console.log("Query_clickid:" + query.clickid);
                cc.sys.localStorage.setItem("dy_projectid", query.projectid);
                console.log("Query_projectid:" + query.projectid);
                cc.sys.localStorage.setItem("dy_promotionid", query.promotionid);
                console.log("Query_promotionid:" + query.promotionid);
                cc.sys.localStorage.setItem("dy_requestid", query.requestid);
                console.log("Query_requestid:" + query.requestid);
            }
    
            //在tt.login
            this.tt.login({
                force: true,
                success(res) {
                    console.log("login 调用成功" + res.code + "---------" + res.anonymousCode);
                    if (res.isLogin) {//正常登录
                        cc.sys.localStorage.setItem("dy_code", res.code);
                        cc.sys.localStorage.setItem("dy_is_login", 1);
                    } else {//匿名登录
                        cc.sys.localStorage.setItem("dy_code", res.anonymousCode);
                        cc.sys.localStorage.setItem("dy_is_login", 0);
                    }
                    setTimeout(() => { DyHttpUpBehavior.getInstance().onInit() }, 1000);
    
                    console.log(cc.sys.localStorage.getItem("dy_click_id") + "---" + cc.sys.localStorage.getItem("dy_code"));
                },
                fail(res) {
                    console.log(`login 调用失败${res.errMsg}`);
                },
            });
        }

      
     
        console.log("toutiaoH5GameAPI=================初始化结束============>:onInit");
    }
    /**登录*/
    onLogin() {

    }


    /**分享游戏链接 */
    onShare(_callback: Function) {
        if (this.tt != null && this.tt != undefined) {
            // TipUtils.showTip("tt平台 调用分享");
            // this.tt.shareAppMessage({
            //     templateId:"1994g645e8hga41h66",
            //     title:"营救火柴人的奇异冒险之旅",
            //     imageUrl:this.shareUrl,
            //     success:()=>{
            //         // TipUtils.showTip("分享成功");
            //     },
            //     fail:(res)=>{
            //         // TipUtils.showTip("分享失败"+res);
            //     }
            // });
        }
    }

    /**分享录屏 */
    onShareVideo(_callback: Function, _failback: Function) {
        // GameoverLayer.prototype.showtip();
        this.tt = window["tt"];
        //         if (this.recordTime < 3) {
        // this.showToast("录屏时间太短，分享失败")
        //             return;
        //         }
        console.log("进入视频分享");
        if (this.tt != null && this.tt != undefined) {
            console.log("进入判断");
            // console.log("视频地址===" + window['videoPath'])
            // if (this.recordTime < 3) {
            //     ObjectUtils.showTip(1, cc.v2(0, 0), "录屏时间小于3秒，分享失败", null,null);
            //     return;
            // }
            // TipUtils.showTip("tt平台 调用分享录屏");

            if (this.timeCount - this.recordTime < 4) {
                this.showToast("录屏时间小于3s，无法分享");
                return;
            }
            this.tt.shareAppMessage({
                channel: "video",
                title: "",
                desc: "",
                imageUrl: "",
                templateId: "", // 替换成通过审核的分享ID
                query: "",
                extra: {
                    videoPath: window['videoPath'], // 可用录屏得到的视频地址

                    videoTopics: ['']
                },

                success: () => {
                    console.log("分享视频成功");
                    _callback && _callback();
                },
                fail: (err) => {
                    console.log("分享视频失败");

                    _failback && _failback();
                    // ObjectUtils.showTip(1, cc.v2(0, 0), "录屏时间小于3秒，分享失败", null,null);
                    // GameoverLayer.prototype.showtip();
                    console.log("=======tip=====");
                }
            })
        }
    }
    /**创建banner */
    createBanner() {

    }
    /**展示banner */
    showBanner() {
        console.log("TT showBanner===3  调用到了头条Banner广告");
        this.tt = window["tt"];
        console.log("this.tt===", this.tt);
        if (this.tt != null && this.tt != undefined) {
            console.log("进入了Banner判断");
            // if(this.tt.getSystemInfoSync().appName == "Douyin"){
            //     return;
            // }
            this.hideBanner();
            // TipUtils.showTip("tt平台 创建横幅广告");
            let targetBannerAdWidth = 200;
            this.bannerAd = this.tt.createBannerAd({
                adUnitId: SDK_config.GameIdConfig.toutiaoID["bannerAdId"],
                style: {
                    width: targetBannerAdWidth,
                    // top: this.windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度   

                }
            });
            // this.bannerAd.style.left = (this.windowWidth - targetBannerAdWidth) / 2;
            console.log(" this.bannerAd.style.left=======", + this.bannerAd.style.left);
            this.bannerAd.onLoad(() => {
                console.log("==广告拉取成功==");
                this.bannerAd.show().then(() => {
                    // TipUtils.showTip("tt平台 展示横幅广告成功");
                    console.log("==平台 展示横幅广告成功==");
                }).catch(err => {
                    // TipUtils.showTip("tt平台 展示横幅广告失败"+err);
                    console.log("广告组件出现问题", err);
                });
            });
            this.bannerAd.onError(() => {
                console.log("==onError==");
                this.hideBanner();
            });
            this.bannerAd.onResize(size => {
                // good
                console.log(size.width, size.height);
                this.bannerAd.style.top = this.windowHeight - size.height;
                this.bannerAd.style.left = (this.windowWidth - size.width) / 2;

                // bad，会触发死循环
                // bannerAd.style.width++;
            });
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
    }
    /**创建激励视频 */
    createVideo() {

        if (this.tt != null && this.tt != undefined) {
            // TipUtils.showTip("tt平台 创建激励广告");
            if (this.rewardedVideoAd) {
                this.rewardedVideoAd = null;
            }
            this.rewardedVideoAd = this.tt.createRewardedVideoAd({
                adUnitId: SDK_config.GameIdConfig.toutiaoID["rewardedVideoAdId"],
            });
            // this.rewardedVideoAd.load();
            this.m_videoAdIsLoaded = true;
            this.rewardedVideoAd.onLoad(() => {
                console.log("onload激励视频广告加载成功");
                // TipUtils.showTip("tt平台 激励视频广告加载成功");
                this.m_videoAdIsLoaded = true;
            });
            this.rewardedVideoAd.onError((err) => {
                console.log("errMsg:", err.errMsg, "==>errCode:", err.errCode);
                // TipUtils.showTip("tt平台 激励视频广告加载失败");
                this.m_videoAdIsLoaded = false;
                this.m_videoErrorBack && this.m_videoErrorBack();
                this.m_videoErrorBack = null;
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
    showVideo(_successCallback?: Function, _failCallback?: Function, _errorCallback?: Function) {
        this.tt = window["tt"];
        console.log("TT showVideo===视频激励广告进入了");
        if(toutiaoH5GameAPI.GGFree > 0){
            toutiaoH5GameAPI.GGFree--;
            cc.sys.localStorage.setItem("GGFree", toutiaoH5GameAPI.GGFree); // 更新状态
            _successCallback && _successCallback();
            this.showToast("使用一张广告解锁券,剩余广告解锁券：" + toutiaoH5GameAPI.GGFree);
            return;
        }
        this.m_videoErrorBack = _errorCallback;
        if (this.rewardedVideoAd && this.m_videoAdIsLoaded) {
            // if(this.delay)
            // {
            //     _errorCallback && _errorCallback();
            //     return;
            // }
            this.rewardedVideoAd.show();
            const onClose = (res) => {
                if (res.isEnded) {
                    //console.log('激励视频广告完成，发放奖励')
                    // TipUtils.showTip("tt平台 激励视频广告播放完成");
                    /**播放完毕 处理播放成功的逻辑 */
                    _successCallback && _successCallback();
                    this.rewardedVideoAd.load();
                } else {
                    //console.log('激励视频广告取消关闭，不发放奖励')
                    // TipUtils.showTip("tt平台 激励视频广告播放失败");
                    /**播放失败 处理播放失败的逻辑 */
                    _failCallback && _failCallback();
                    this.rewardedVideoAd.load();
                }
                this.rewardedVideoAd.offClose(onClose);
            };
            this.rewardedVideoAd.onClose(onClose);
        } else {
            if (this.tt != null && this.tt != undefined) {
                // TipUtils.showTip("tt平台 创建激励广告");
                if (this.rewardedVideoAd) {
                    this.rewardedVideoAd = null;
                }
                this.rewardedVideoAd = this.tt.createRewardedVideoAd({
                    adUnitId: SDK_config.GameIdConfig.toutiaoID["rewardedVideoAdId"],
                });

                this.rewardedVideoAd.onLoad(() => {
                    console.log("onload激励视频广告加载成功");
                    // TipUtils.showTip("tt平台 激励视频广告加载成功");
                    this.m_videoAdIsLoaded = true;
                });
                this.rewardedVideoAd.onError((err) => {
                    console.log("errMsg:", err.errMsg, "==>errCode:", err.errCode);
                    // TipUtils.showTip("tt平台 激励视频广告加载失败");
                    this.m_videoAdIsLoaded = false;
                    this.m_videoErrorBack && this.m_videoErrorBack();
                    this.m_videoErrorBack = null;
                    this.showToast("视频拉取中，请稍后再试")
                });
                this.rewardedVideoAd.show();
                const onClose = (res) => {
                    if (res.isEnded) {
                        //console.log('激励视频广告完成，发放奖励')
                        // TipUtils.showTip("tt平台 激励视频广告播放完成");
                        /**播放完毕 处理播放成功的逻辑 */
                        _successCallback && _successCallback();
                        this.rewardedVideoAd.load();
                    } else {
                        //console.log('激励视频广告取消关闭，不发放奖励')
                        // TipUtils.showTip("tt平台 激励视频广告播放失败");
                        /**播放失败 处理播放失败的逻辑 */
                        _failCallback && _failCallback();
                        this.rewardedVideoAd.load();
                    }
                    this.rewardedVideoAd.offClose(onClose);
                };
                this.rewardedVideoAd.onClose(onClose);
            }
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
            // if (this.systemInfo.appName != "Toutiao") {
            //     return;
            // }

            console.log(this.tt.createInterstitialAd);
            if (!this.tt.createInterstitialAd) {
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
                    this.interstitialAd.onLoad(() => {
                       
                        this.reportAnalytics("insertAdStatistics", "弹出插屏");
                        this.lastTimeInsert = new Date().getTime() / 1000;
                    })


                })
                .catch(err => {
                    console.log(err);
                });


            let closeFunc = () => {

                this.interstitialAd.offClose(closeFunc);

                this.reportAnalytics("insertAdStatistics", "关闭插屏");
            }

            this.interstitialAd.onClose(closeFunc);

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

        console.log("进入创建录屏=====");
        if (this.tt != null && this.tt != undefined) {
            console.log("进入创建录屏的判断=====");
            this.recorder = this.tt.getGameRecorderManager();
            window['recorder'] = this.recorder;
            this.recorder.onStart((res) => {
                // this.timeCount = Date.now();
                console.log("==onStart=");
            });

            console.log(window['recorder'])
            this.recorder.onStop((res) => {
                console.log("进入创建录屏赋值");
                let t = Date.now();
                let delt = t - this.timeCount;
                this.recordTime = Math.ceil(delt * 0.001);
                window['videoPath'] = res.videoPath;
                console.log(res.videoPath);
                this.videoPath = res.videoPath;

                console.log("window['videoPath']res.videoPath===========", +res.videoPath)
                console.log("window['videoPath']this.videoPath===========", this.videoPath)
                console.log("window['videoPath']window['videoPath']===========" + window['videoPath'])
                console.log(this.recordTime);
                // if (this.recordTime < 3) {
                //     ObjectUtils.showTip(1, cc.v2(0, 0), "录屏时间小于3秒，分享失败", null,null);
                //     // return;
                //     }
                // this.getVideoRecordTime();

            });

            this.recorder.onError(res => {
                // TipUtils.showTip("tt平台 录屏失败"+res.errMsg);
                console.log("========================>录屏失败:", res.errMsg);
            });
        }




    }
    /**开始录制视频 */
    startRecordScreen() {
        window['videoPath'] = this.videoPath;
        console.log("开始录屏");
        console.log("进入录制视频函数");


        if (window['recorder']) {
            console.log("start recorder==进入判断");
            // TipUtils.showTip("tt平台 开始录屏");
            this.recordTime = new Date().getTime() / 1000;
            window['recorder'].start({
                duration: 30
            });

        }
    }

    /**结束录制视频 */
    stopRecordScreen() {
        console.log("结束录屏" + this.recordTime);
        this.timeCount = new Date().getTime() / 1000;
        if (window['recorder']) {
            console.log("stop recorder");
            // TipUtils.showTip("tt平台 结束录屏");
            window['recorder'].stop();
        }
        console.log("========" + this.recordTime);
    }
    /**创建更多游戏按钮 */
    createMoreGamesBtn() {

    }
    /**展示更多游戏按钮 */
    showMoreGamesBtn() {
        // if (this.tt != null && this.tt != undefined) {
        //     if (this.systemInfo.platform == "ios") {
        //         // ToastManager.getInstance().pushToast("ios系统不支持跳转");
        //         // ToastManager.getInstance().showToast();
        //         return;
        //     }
        //     // TipUtils.showTip("tt平台 展示更多游戏按钮");
        //     this.tt.showMoreGamesModal && this.tt.showMoreGamesModal({
        //         appLaunchOptions: [

        //         ],
        //         success: () => {
        //             // TipUtils.showTip("tt平台 更多游戏按钮显示成功");
        //         },
        //         fail: (err) => {
        //             // TipUtils.showTip("tt平台 更多游戏按钮显示失败"+err.errMsg);
        //         }
        //     })
        // }
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
    reportMonitor(name: string, args?: number | string, step?: number) {
        if (this.tt != null && this.tt != undefined) {
            if (step != undefined) {
                this.tt.reportAnalytics(name, { event: args, step: step });
            }
            else if (args != undefined)
                this.tt.reportAnalytics(name, { event: args });
            else
                this.tt.reportAnalytics(name, {});
        }
    }
    vibrate(long?: boolean) {
        if (this.tt != null && this.tt != undefined) {
            if (long) {
                this.tt.vibrateLong({
                    success(res) {

                    },
                    fail(res) {
                        console.log(`vibrateLong调用失败`);
                    },
                });
            }
            else {
                this.tt.vibrateShort({
                    success(res) {

                    },
                    fail(res) {
                        console.log(`vibrateLong调用失败`);
                    },
                });
            }
        }

    }
    getVideoRecordTime(): number {
        console.log("rtim====" + this.recordTime);
        return this.recordTime;
    }
    reportAnalytics(flag: string, group: string = null) {
        if (window["tt"]) {
            this.tt.reportAnalytics(flag, {
                flag: 'set_value',
            });
        }
        // if(window["tt"]) {
        //     if(group) {
        //         this.tt.reportAnalytics(flag, {
        //             group: group,
        //         });
        //     }
        //     else {
        //         this.tt.reportAnalytics(flag, {});
        //     }
        // }
    }
    showToast(message: string) {
        this.tt.showToast({
            icon: 'none',
            title: message,
            duration: 2000,
            success(res) {
                console.log(`${res}`);
            },
            fail(res) {
                console.log(`showToast调用失败`);
            }
        });
    }



    /** 社交分享（邀请好友） 仅抖音 20.6 及以上版本 */
    public shareInvite(successCallback?: Function) {
        if (!this.tt) { this.showToast("分享成功"); successCallback?.(); return; }

        if (this.tt.shareAppMessage) {
            this.tt.shareAppMessage({
                channel: "invite", // 拉起邀请面板分享游戏好友
                title: "节奏大挑战",
                desc: "开启节奏盒子，体验节奏乐趣！",
                success: (res) => {
                    this.showToast("分享成功");
                    successCallback?.();
                },
                fail: (e) => {
                    this.showToast("分享失败");
                    console.log("tt 社交分享失败", e.errMsg);

                },
            });
        }
        else {
            this.showToast("分享失败");
            // 尝试常规分享
            // this.shareNormal(successCallback);
        }
    }

    /** 常规分享 */
    public share(successCallback: Function) {
        if (!this.tt) { this.showToast("分享成功"); successCallback?.(); return; }

        if (this.tt.shareAppMessage) {
            this.tt.shareAppMessage({
                templateId: "jai935o3mqbaf3h60e", // 替换成通过审核的分享ID
                channel: "", // 不填默认常规分享
                title: "脑洞画线我最强",
                // desc: "神功在手，天下我有",
                success: (res) => {
                    this.showToast("分享成功");
                    successCallback?.();
                },
                fail: (e) => {
                    this.showToast("分享失败");
                    console.log("tt 常规分享失败", e.errMsg);

                },
            });
        }
        else {
            this.showToast("分享失败");
        }
    }
    public Dingyue() {

        // index.js
        const tmplIds = ["MSG2055110137157497124151937878312"];
        this.tt.requestSubscribeMessage({
            tmplIds: tmplIds,
            complete: (res) => {
                // this.tt.showModal({
                // title: "订阅完成",
                // content: JSON.stringify(res),
                // });
            },
        });
    }
    public AddShortcut() {
        this.tt.addShortcut({
            success() {

                console.log("添加桌面成功");
            },
            fail(err) {

                console.log("添加桌面失败", err.errMsg);
            },
        });

    }

}