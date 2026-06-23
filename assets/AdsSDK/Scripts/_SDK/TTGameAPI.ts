//官方文档 https://developer.open-douyin.com/docs/resource/zh-CN/developer/tools/cloud/api-reference/cloud-database/server/sdk
/** 头条小游戏渠道API */
import DyHttpUpBehavior from "./DyHttpUpBehavior";
import Apis, { AdsOptions } from "./PlatformOptions";
export interface feedConfig {
    /**用户类型 1-复访  2-获客 */
    feed_game_channel: number;
    /**启动对应的文案 ID */
    feed_game_content_id: string;
    /**执行回调 */
    execute: Function;
}
export default class TTGameAPI {
    /**平台环境 */
    tt: any = window["tt"];
    /**banner广告 */
    bannerAd: any = null;
    /**插屏广告 */
    interstitialAd: any = null;
    /**视频广告 */
    rewardedVideoAd: any = null;
    /**banner广告是否已经load到数据 */
    m_bannerAdIsLoaded: boolean = false;
    /**设备像素width */
    windowWidth: number = 0;
    /**设备像素height */
    windowHeight: number = 0;
    /**系统信息 */
    systemInfo: any = null;
    /**激励视频成功回调 */
    videoSuccessCallback: Function = null;
    /**激励视频失败回调 */
    videoFailCallback: Function = null;
    /**Feed流进入小游戏事件回调 */
    feedEnterCallback: Function = null;
    /**Feed流退出小游戏事件回调 */
    feedExitCallback: Function = null;
    /**桌面进入回调 */
    TTStartFromDeskTopCallback: Function = null;
    /**侧边栏进入回调 */
    TTStartFromSidebarCallback: Function = null;
    //#region 单例
    private static m_inst: TTGameAPI | null = null;

    public static getInstance(): TTGameAPI {
        if (TTGameAPI.m_inst == null) {
            TTGameAPI.m_inst = new TTGameAPI();
        }
        return TTGameAPI.m_inst;
    }

    private constructor() {
        this.onInit(() => { });
    }

    /**初始化 */
    onInit(_callback: Function) {
        if (this.tt != null && this.tt != undefined) {
            const launchOption = Apis.getInstance().coldLaunchOptions;
            const query = launchOption.query;

            this.systemInfo = Apis.getInstance().systemInfo;

            if (query.clickid != undefined && query.clickid != null) {
                localStorage.setItem("dy_click_id", query.clickid);
                console.log("Query_clickid:" + query.clickid);
                localStorage.setItem("dy_projectid", query.projectid);
                console.log("Query_projectid:" + query.projectid);
                localStorage.setItem("dy_promotionid", query.promotionid);
                console.log("Query_promotionid:" + query.promotionid);
                localStorage.setItem("dy_requestid", query.requestid);
                console.log("Query_requestid:" + query.requestid);
            }
            this.onLogin();
        } else {
            localStorage.setItem("ttSideBar", true.toString());
        }
        _callback && _callback();
        console.log("toutiaoH5GameAPI onInit");
    }

    onLogin() {
        this.tt.login({
            force: true,
            success(res) {
                console.log("login 调用成功" + res.code + "---------" + res.anonymousCode);
                if (res.isLogin) {//正常登录
                    localStorage.setItem("dy_code", res.code);
                    localStorage.setItem("dy_is_login", "1");
                } else {//匿名登录
                    localStorage.setItem("dy_code", res.anonymousCode);
                    localStorage.setItem("dy_is_login", "0");
                }
                DyHttpUpBehavior.getInstance().onInit();

                console.log(localStorage.getItem("dy_click_id") + "---" + localStorage.getItem("dy_code"));
            },
            fail(res) {
                console.log(`login 调用失败${res.errMsg}`);
            },
        });
    }

    bannerOnErrorCallBack = (err) => {
        console.error(AdsOptions.tt.bannerId + "__banner广告拉取失败", err);
        console.error("正在取消banner事件的监听");
        this.bannerAd.offLoad(this.bannerOnLoadCallBack);
        this.bannerAd.offError(this.bannerOnErrorCallBack);
        this.bannerAd.offResize(this.bannerOnResizeCallBack);
        console.error("正在销毁当前banner广告实例");
        this.bannerAd.destroy();
        this.bannerAd = null;
        console.error("1秒后重新创建banner广告");
        setTimeout(() => {
            this.createBanner();
        }, 1000);
    }

    bannerOnLoadCallBack = (res) => {
        this.m_bannerAdIsLoaded = true;
        console.log(AdsOptions.tt.bannerId + "__banner广告拉取成功", res);
    }

    bannerOnResizeCallBack = (size) => {
        console.log(AdsOptions.tt.bannerId + "__banner广告尺寸改变", size);
        this.bannerAd.style.top = this.windowHeight - size.height;
        this.bannerAd.style.left = (this.windowWidth - size.width) / 2;
    }

    createBanner() {
        if (this.tt != null && this.tt != undefined) {
            if (this.bannerAd) return;
            this.bannerAd = this.tt.createBannerAd({
                adUnitId: AdsOptions.tt.bannerId,
                adIntervals: 30,
                style: {
                    width: Math.floor(this.windowWidth * 0.8),
                    left: Math.floor(this.windowWidth * 0.1),
                    top: Math.floor(this.windowHeight * 0.9)
                }
            });
            this.bannerAd.onLoad(this.bannerOnLoadCallBack);
            this.bannerAd.onError(this.bannerOnErrorCallBack);
            this.bannerAd.onResize(this.bannerOnResizeCallBack);
        }
    }
    showBanner() {
        if (this.tt != null && this.tt != undefined) {
            if (!this.bannerAd) this.createBanner();
            if (!this.m_bannerAdIsLoaded) return;
            this.bannerAd.show().then(() => {
                console.log("==展示横幅广告成功==");
            }).catch(err => {
                console.log("==广告组件出现问题_", err);
            });
        }
    }

    hideBanner() {
        if (this.bannerAd) {
            this.bannerAd.hide();
        }
    }


    public GoToSidebar(successCallback?: Function) {
        if (this.tt) {
            this.tt.navigateToScene({
                scene: "sidebar",
                success: (res) => {
                    successCallback && successCallback();
                },
                fail: (err) => {
                    console.log("navigate to scene fail: ", err);
                },
            });
        } else {
            successCallback && successCallback();
        }
    }

    videoOnLoadCallBack = (res) => {
        console.log("激励视频加载成功", res);
    }

    videoOnErrorCallBack = (err) => {
        console.error(AdsOptions.tt.videoId + "激励视频加载失败", err);
        console.error("正在取消激励广告事件的监听");
        this.rewardedVideoAd.offLoad(this.videoOnLoadCallBack);
        this.rewardedVideoAd.offError(this.videoOnErrorCallBack);
        this.rewardedVideoAd.offClose(this.videoOnCloseCallBack);
        console.error("正在销毁当前激励广告实例");
        this.rewardedVideoAd.destroy();
        this.rewardedVideoAd = null;
        console.error("0.5秒后重新创建激励广告");
        setTimeout(() => {
            this.createVideo();
        }, 500);
    }

    videoOnCloseCallBack = (res) => {
        if (res && res.isEnded) {
            DyHttpUpBehavior.getInstance().videoUpdate();
            this.videoSuccessCallback && this.videoSuccessCallback();
        } else {
            Apis.getInstance().showTips("获取失败", 1500, "fail")
            this.videoFailCallback && this.videoFailCallback();
        }
    }

    // region createVideo
    createVideo() {
        if (this.tt != null && this.tt != undefined) {
            if (this.rewardedVideoAd) return;
            const multitonRewardTimes = AdsOptions.tt.multitonRewardMsg.length;
            this.rewardedVideoAd = this.tt.createRewardedVideoAd({
                adUnitId: AdsOptions.tt.videoId,
                multiton: AdsOptions.tt.multiton,
                multitonRewardMsg: AdsOptions.tt.multitonRewardMsg,
                multitonRewardTimes: multitonRewardTimes,
                progressTip: AdsOptions.tt.progressTip,

            });

            this.rewardedVideoAd.onLoad(this.videoOnLoadCallBack);
            this.rewardedVideoAd.onError(this.videoOnErrorCallBack);
            this.rewardedVideoAd.onClose(this.videoOnCloseCallBack);
            this.rewardedVideoAd.load();
        }
    }

    showVideo(_successCallback?: Function, _failCallback?: Function) {
        if (!(this.tt != null && this.tt != undefined)) {
            console.log('非小游戏平台，直接获得奖励');
            _successCallback && _successCallback();
            return;
        }
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.load().then(() => {
                this.rewardedVideoAd.show().then(() => {
                    this.videoFailCallback = null;
                    this.videoSuccessCallback = null;
                    this.videoSuccessCallback = _successCallback;
                    this.videoFailCallback = _failCallback;
                }).catch((err) => {
                    console.error("激励视频展示失败：", err);
                    _failCallback && _failCallback();
                });
            }).catch((err) => {
                console.error("激励视频加载失败：", err);
                _failCallback && _failCallback();
            });
        } else {
            this.createVideo();
            _failCallback && _failCallback();
        }
    }

    // region getUpdateManager
    getUpdateManager() {
        if (!this.tt) return;
        const updateManager = this.tt.getUpdateManager();
        updateManager.onUpdateReady((res) => {
            console.error("版本更新准备就绪", res);
            this.tt.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启小游戏？",
                success: (res) => {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                },
            });
        });
        updateManager.onUpdateFailed((err) => {
            // 新的版本下载失败
            console.error("版本下载失败原因", err);
            this.tt.showToast({
                title: "新版本下载失败，请稍后再试",
                icon: "none",
            });
        });
    }

    //  region subscription
    subscription(successCallback?: Function) {
        if (this.tt != null && this.tt != undefined) {
            const tmplIds = AdsOptions.tt.subscriptionIds;
            this.tt.requestSubscribeMessage({
                tmplIds: tmplIds,
                success: (res) => {
                    console.log("订阅成功", res);
                    this.tt.showModal({
                        title: "订阅完成",
                        content: "后续更新信息将私信到后台",
                    });
                    successCallback && successCallback();
                }
            });
        }
    }

    addDesktop(callback?: Function) {
        if (this.tt) {
            this.tt.addShortcut({
                success() {
                    callback && callback();
                    console.log("添加桌面成功");
                },
                fail(err) {
                    console.log("添加桌面失败", err.errMsg);
                },
            });
        } else {
            console.log("添加桌面失败");
        }
    }

    //  region share
    share(successCallback?: Function) {
        if (this.tt != null && this.tt != undefined) {
            this.tt.shareAppMessage({
                templateId: AdsOptions.tt.share, // 替换成通过审核的分享ID
                query: "",
                success() {
                    console.log("分享成功");
                    successCallback && successCallback();
                },
                fail() {
                    console.log("分享失败");
                },
            });
        }
    }

    /**
     * 直流上报场景
     */
    feedSceneReport(sceneId: number = 7001) {
        this.tt.reportScene({
            sceneId: sceneId,  // 在抖音小游戏平台中查询，性能分析-启动性能-启动场景配置
            success() {
                console.log("直流上报成功");
            },
            fail(err) {
                console.error("直流上报失败", err);
            }
        })
    }
    /**
     * 直流推荐执行
     * @param FeedConfig 直流配置
     * @param defaultCallback 非直流时，执行默认回调
     * @param feedEnterCallback Feed流进入小游戏事件回调
     * @param feedExitCallback Feed流退出小游戏事件回调
     */
    feedPlanExecute(FeedConfig: feedConfig[], defaultCallback?: Function, feedEnterCallback?: Function, feedExitCallback?: Function) {
        if (Apis.getInstance().getSdkTempData("feedPlanExecuted") == "true") {
            console.log("直流推荐已执行，无需重复执行");
            defaultCallback && defaultCallback();
            return;
        }
        this.feedEnterCallback = feedEnterCallback;
        this.feedExitCallback = feedExitCallback;
        const options = Apis.getInstance().coldLaunchOptions;
        const scene = options.scene;
        if (scene && scene.substring(scene.length - 4) === "3041") {
            this.tt.onFeedStatusChange((res) => {
                if (res.type === 'feedEnter') {
                    this.feedEnterCallback && this.feedEnterCallback();
                    console.log('触发从Feed流进入小游戏事件回调');
                }
                if (res.type === 'feedExit') {
                    this.feedExitCallback && this.feedExitCallback();
                    console.log('触发从小游戏退回到Feed流事件回调');
                }
            })
            Apis.getInstance().setSdkTempData("feedPlanExecuted", "true");
            const query = options.query;
            // 1 为复访  2为获客
            const feedConfig = FeedConfig.find(item => item.feed_game_content_id === query.feed_game_content_id);
            if (feedConfig && feedConfig.feed_game_channel == query.feed_game_channel) {
                feedConfig.execute();
                setTimeout(() => {
                    this.feedSceneReport();
                }, 300);
            } else {
                console.error("用户冷启动携带参数_不存在直流推荐配置", query);
                console.error(`配置表：${FeedConfig} \n 执行默认回调`);
                defaultCallback && defaultCallback();
            }
        } else {
            console.log("非直流场景进入_" + scene);
            defaultCallback && defaultCallback();
        }
    }
    // region showInsertAd
    showInsertAd(callback?: Function) {
        console.log("tt展示插屏");
        if (!this.tt || this.tt == null || this.tt == undefined || !this.tt.createInterstitialAd) {
            callback && callback();
            return;
        }

        if (this.interstitialAd) {
            this.interstitialAd.destroy();
            this.interstitialAd = null;
        }

        this.interstitialAd = this.tt.createInterstitialAd({
            adUnitId: AdsOptions.tt.insertId
        });
        this.interstitialAd
            .load()
            .then(() => {
                this.interstitialAd.show()
                    .then(() => {
                        callback && callback();
                    })
                    .catch((error) => {
                        console.error("抖音插屏报错_", error);
                    })
                this.reportAnalytics("insertAdStatistics", { report: "弹出插屏" });
            })
            .catch(function (err) {
                console.log(err, "插屏错误码");
            });

        let closeFunc = () => {
            this.interstitialAd.offClose(closeFunc);
            this.reportAnalytics("insertAdStatistics", { report: "关闭插屏" });
        }
        this.interstitialAd.onClose(closeFunc);
    }

    vibrate(long?: boolean) {
        if (this.tt != null && this.tt != undefined) {
            if (long) {
                this.tt.vibrateLong({
                    fail(err) {
                        console.log('vibrateLong调用失败', err);
                    },
                    success(res) {
                        console.log('vibrateLong调用成功', res);
                    },
                });
            }
            else {
                this.tt.vibrateShort({
                    fail(err) {
                        console.log('vibrateShort调用失败', err);
                    },
                    success(res) {
                        console.log('vibrateShort调用成功', res);
                    },
                });
            }
        }
    }

    // 设置从桌面图标进入的脚本回调
    setLaunchFromDeskTopCallback(callBack: Function) {
        if (this.TTStartFromDeskTopCallback) return;
        this.TTStartFromDeskTopCallback = callBack;
        const scene = Apis.getInstance().coldLaunchOptions.scene;
        if (scene && scene.substring(scene.length - 4) == "1020") {
            console.log("【冷启动】用户从桌面进入了游戏");
            if (Apis.getInstance().getSdkData("DeskTopRewardTimes") < 1) {
                this.TTStartFromDeskTopCallback && this.TTStartFromDeskTopCallback();
                Apis.getInstance().DeskTopRewardTimes = 1;
                Apis.getInstance().setDeskTopRewardDate();
            } else {
                console.error("桌面奖励已领取");
            }
        }
    }

    //region 侧边栏启动回调
    setLaunchFromSideBarCallback(callBack: Function) {
        if (this.TTStartFromSidebarCallback) return;
        this.TTStartFromSidebarCallback = callBack;
        const scene = Apis.getInstance().coldLaunchOptions.scene;
        if (scene && scene.substring(scene.length - 4) == "1036" || scene.substring(scene.length - 4) == "1042" || scene.substring(scene.length - 4) == "1001") {
            console.log("【冷启动】用户从侧边栏进入了游戏");
            if (Apis.getInstance().getSdkData("SideBarRewardTimes") < 1) {
                this.TTStartFromSidebarCallback && this.TTStartFromSidebarCallback();
                Apis.getInstance().SideBarRewardTimes = 1;
                Apis.getInstance().setSideBarRewardDate();
            } else {
                console.error("【冷启动】侧边栏奖励已领取");
            }
        }
    }

    reportAnalytics(eventName: string, data: object) {
        if (this.tt) {
            this.tt.reportAnalytics(eventName, data);
        } else {
            console.log("埋点测试" + eventName, data);
        }
    }
}