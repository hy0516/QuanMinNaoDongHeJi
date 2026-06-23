//官方文档 https://open.kuaishou.com/miniGameDocs/gameDev/api/api.html
/** 快手小游戏渠道API */
import Apis, { AdsOptions } from "./PlatformOptions";
import KsHttpUpBehavior from "./KsHttpUpBehavior";
// 直流首次上报_获取OPEN_ID
const ks_feed_url = "https://kstfdata.zywxgames.com/api/ks/ksfeed";
// 直流上报更新最新结束时间
const ks_feed_update_last_url = "https://kstfdata.zywxgames.com/api/ks/update_last";

const feed_list = ["ks671036344936479934"]; // 快手feed直流白名单
const first_feed_key = "first_ks_feed_report";

export default class KSGameAPI {
    /**平台环境 */
    ks: any = window["ks"];
    /**插屏广告 */
    interstitialAd: any = null;
    /**视频广告 */
    rewardedVideoAd: any = null;
    /**banner广告 */
    bannerAd: any = null;
    /**设备像素width */
    windowWidth: number = 0;
    /**设备像素height */
    windowHeight: number = 0;
    /**系统信息 */
    systemInfo: any = null;
    /**冷启动参数 */
    coldLaunchOptions: any = null;

    /** 侧边栏是否可用 */
    private SideBarUsable: boolean = false;
    /** 激励视频是否拉取到本地 */
    rewardVideoAdLoaded: boolean = false;
    /** 快手直玩上报重试次数 */
    request_num = 3;
    /** 快手直玩上报重试间隔s */
    request_cd = 5;
    /** 快手再得激励广告奖励回调 */
    completeWatchVideoCallback: Function | undefined = undefined;
    /** 用户进入游戏的场景值 */
    KSSceneId: string = "";
    /** 桌面进入时回调 */
    KSStartFromShortcutCallback: Function | undefined = undefined;
    /** 侧边栏进入时回调 */
    KSStartFromSidebarCallback: Function | undefined = undefined;

    /** 私有实例 */
    private static m_inst: KSGameAPI | null = null;


    public static getInstance(): KSGameAPI {
        if (KSGameAPI.m_inst == null) {
            KSGameAPI.m_inst = new KSGameAPI();
        }
        return KSGameAPI.m_inst;
    }

    private constructor() {
        this.onInit(() => { });
    }

    /**初始化 */
    onInit(_callback: Function) {
        if (this.ks != null && this.ks != undefined) {
            // 获取冷启动参数
            this.coldLaunchOptions = Apis.getInstance().coldLaunchOptions;
            // 存储启动参数 —— 上传服务器需要
            this.getChannelOptions();
            // 快手 - 获取用户系统参数
            this.ks.getSystemInfo({
                success: (data) => {
                    this.systemInfo = data;
                    this.windowWidth = this.systemInfo.windowWidth;
                    this.windowHeight = this.systemInfo.windowHeight;
                }
            });
            // 快手 - 初始化banner广告
            this.createBannerAd();
            // 快手 - 用户登录获取code
            this.onLogin();

            Apis.getInstance().setOnShowCallback((res) => {
                console.log("触发了onShow");
                if (res.from == "retention_apk" || res.from == "shortcut_app" || res.from == "retention_desk_ios") {
                    console.log("用户从桌面进入了游戏");
                    if (Apis.getInstance().getSdkData("DeskTopRewardTimes") < 1) {
                        this.KSStartFromShortcutCallback && this.KSStartFromShortcutCallback();
                        Apis.getInstance().DeskTopRewardTimes = 1;
                        Apis.getInstance().setDeskTopRewardDate();
                    } else {
                        console.error("桌面奖励已领取");
                    }
                }
                if (res.from == "sidebar_new") {
                    console.log("用户从侧边栏进入了游戏");
                    if (Apis.getInstance().getSdkData("SideBarRewardTimes") < 1) {
                        this.KSStartFromSidebarCallback && this.KSStartFromSidebarCallback();
                        Apis.getInstance().SideBarRewardTimes = 1;
                        Apis.getInstance().setSideBarRewardDate();
                    } else {
                        console.error("侧边栏奖励已领取");
                    }
                    //检测侧边栏是否可用
                    this.checkSliderBarIsAvailable();
                }
            });
        }
        _callback && _callback();
        console.log("ksH5============================>:onInit");
    }

    //region 检测侧边栏功能
    checkSliderBarIsAvailable() {
        if (Apis.getInstance().compareVersion(this.systemInfo.version, "12.11.10") < 0) {
            console.log("用户客户端版本过低，无法执行checkSliderBarIsAvailable");
            return;
        }
        this.ks.checkSliderBarIsAvailable({
            success: (result) => {
                const available = result.available;
                this.SideBarUsable = available;
            },
            fail: (error) => {
                this.SideBarUsable = false;
                console.log("侧边栏检测报错: ", error);
            },
        })
    }

    //region  登录
    public onLogin() {
        if (!this.ks) return
        const self = this;
        this.ks.checkSession({
            success() {
                console.log("session有效中..");
                KsHttpUpBehavior.getInstance().onInit();
            },
            fail(err) {
                if (err.code == "-20038") {
                    console.warn("登录状态已失效，重新登录");
                    self.ks.login({
                        success: (res) => {
                            localStorage.setItem("ks_code", res.code);
                            //初始化埋点或者关键性行为上报
                            setTimeout(() => {
                                KsHttpUpBehavior.getInstance().onInit();
                            }, 500);
                        },
                        fail(error) {
                            console.error("登录失败", error);
                        }
                    })
                } else if (err.code == "20001") {
                    console.error("未知错误", err.msg);
                }
            }
        });
    }
    //region Feed 直玩上报
    /**
     * 快手直玩上报
     * @param latest_time 最新时间戳(s)
     */
    onFeedReport(latest_time) {
        if (!feed_list.includes(AdsOptions.ks.ks_app_id)) {
            console.warn(AdsOptions.ks.ks_app_id, "未开通feed，不予上报，快手feed直流白名单\n", feed_list);
            return;
        }
        const isfirst = Apis.getInstance().getSdkData(first_feed_key);
        // 第一次上报
        if (isfirst == "yes") {
            const ks_code = localStorage.getItem("ks_code");
            Apis.getInstance().request(ks_feed_url, {
                app_id: AdsOptions.ks.ks_app_id,
                user_code: ks_code,
                last_time: latest_time
            }, "POST", (res) => {
                console.log("快手首次res_" + AdsOptions.ks.ks_app_id, res);
                if (res.data.code === 1) {
                    console.log("快手首次上成功", latest_time);
                    Apis.getInstance().setSdkData(first_feed_key, "no");
                    localStorage.setItem("ks_open_id", res.data.open_id);
                } else {
                    console.error("快手首次上报失败", res.data);
                }
            }, (err) => {
                console.error("请求失败_", err);
            });
        } else {
            const ks_open_id = localStorage.getItem("ks_open_id");
            Apis.getInstance().request(ks_feed_update_last_url, {
                app_id: AdsOptions.ks.ks_app_id,
                open_id: ks_open_id,
                last_time: latest_time
            }, "POST", (res) => {
                console.log("快手更新res_", res);
                if (res.data.code === 1) {
                    console.log("快手直流更新最新时间成功 ", latest_time);
                } else {
                    localStorage.setItem(first_feed_key, "yes");
                    console.error("快手直流更新失败", res);
                }
            }, (err) => {
                console.error("请求失败_", err);
            });

        }
    }

    checkShortcut(): boolean {
        this.ks.checkShortcut({
            success(res) {
                return res.installed;
            },
            fail(err) {
                if (err.code === -10005) {
                    console.log("检查桌面图标失败，暂不支持该功能");
                } else {
                    console.log("检查快捷方式失败", err);
                }
                return false;
            }
            //注意：快捷方式和mini apk的方式，用户装了哪种都算成功走success回调。
            //但是如果都没装的情况下，为兼容以前版本，会先判断快捷方式，再判断mini apk的方式，这种情况最后会走到fail回调
            //所以当err.msg为"apk info is invalid"的情况出现时，也可以在游戏内展示添加桌面的icon提醒用户。
        });
        return false;
    }

    public getChannelOptions() {
        let query = this.coldLaunchOptions.query;
        this.KSSceneId = query.from;
        if (query.callback != undefined && query.callback != null) {
            localStorage.setItem("ks_callback", query.callback);
            console.log("Query_callback:" + query.callback);
            localStorage.setItem("ks_campaign_id", query.campaign_id);
            console.log("Query_campaign_id:" + query.campaign_id);
            localStorage.setItem("ks_unit_id", query.unit_id);
            console.log("Query_unit_id:" + query.unit_id);
            localStorage.setItem("ks_account_id", query.account_id);
            console.log("Query_requestid:" + query.account_id);
        }
    }
    // region showVideo
    showVideo(_successCallback?: Function, _failCallback?: Function) {
        if (!(this.ks != null && this.ks != undefined)) {
            console.log('非小游戏平台，直接获得奖励');
            _successCallback && _successCallback();
            return;
        }

        const videoOnClose = (res) => {
            console.log('激励视频播放是否完成', res.isEnded);
            if (res && res.isEnded || res === undefined) {
                console.log("已完整观看的激励数量", res.count);
                if (res.count == 2) {
                    this.completeWatchVideoCallback && this.completeWatchVideoCallback();
                }
                _successCallback && _successCallback();
                KsHttpUpBehavior.getInstance().videoUpdate();
            } else {
                _failCallback && _failCallback();
                Apis.getInstance().showTips("看完激励领取哦~");
            }
        }
        const videoOnError = (err) => {
            console.error("激励视频报错", err);
            this.rewardedVideoAd.offClose(videoOnClose);
            this.rewardedVideoAd.offError(videoOnError);
            this.rewardedVideoAd.destroy();
            this.rewardedVideoAd = null;
        }

        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.offClose(videoOnClose);
            this.rewardedVideoAd.offError(videoOnError);
            this.rewardedVideoAd.destroy();
            this.rewardedVideoAd = null;
        }

        const times = AdsOptions.ks.multitonRewardMsg.length;
        this.rewardedVideoAd = this.ks.createRewardedVideoAd({
            adUnitId: AdsOptions.ks.videoId,//激励广告id
            multiton: AdsOptions.ks.multiton,
            multitonRewardMsg: AdsOptions.ks.multitonRewardMsg,
            multitonRewardTimes: times
        });

        this.rewardedVideoAd.show();
        this.rewardedVideoAd.onError(videoOnError);
        this.rewardedVideoAd.onClose(videoOnClose);
    }

    // region  激励视频end

    // region 插屏start
    showInsertAd(callBack?) {
        if (!(this.ks != null && this.ks != undefined)) return;
        if (!this.ks.createInterstitialAd) {
            return;
        }

        let closeFunc = () => {
            console.log("插屏被关闭了");
            this.interstitialAd.offClose(closeFunc);
            this.interstitialAd.offError(errorFunc);
        }
        let errorFunc = (err) => {
            console.error("插屏监听到错误", err);
            this.interstitialAd.offClose(closeFunc);
            this.interstitialAd.offError(errorFunc);
        };

        if (this.interstitialAd) {
            this.interstitialAd.offClose(closeFunc);
            this.interstitialAd.offError(errorFunc);
            this.interstitialAd.destroy();
            this.interstitialAd = null;
        }

        this.interstitialAd = this.ks.createInterstitialAd({
            adUnitId: AdsOptions.ks.insertId//插屏广告id
        });

        this.interstitialAd.onError(errorFunc);
        this.interstitialAd.onClose(closeFunc);
        this.interstitialAd.show()
            .then(() => {
                callBack && callBack()
            });
    }

    // region addDesktop
    addDesktop() {
        if (!(this.ks != null && this.ks != undefined)) return;
        this.ks.addShortcut({
            success: () => {
                Apis.getInstance().showTips("从桌面图标进入可领取奖励", 2500, "none");
            },
            fail: (err) => {
                Apis.getInstance().showTips("添加失败", 2000, "error");
                console.error("添加桌面失败", err);
            }
        });
    }

    // region share
    share(_callback: Function) {
        if (!(this.ks != null && this.ks != undefined)) return;
        this.ks.shareAppMessage({
            success: () => {
                console.log("分享成功");
                _callback && _callback();
            },
            fail: (err) => {
                console.log("分享失败", err.errMsg);
            }
        });
    }
    // 查询  设置小游戏为常用  的结果
    // region checkCommonUse
    checkCommonUse() {
        if (!this.ks) return;
        this.ks.checkCommonUse({
            success(res) {
                console.log(`设为常用查询结果为：${res.isCommonUse}`);
                if (res.isCommonUse) {
                    localStorage.setItem("isCommonUse", "true");
                } else {
                    localStorage.setItem("isCommonUse", "false");
                }
            },
            fail(err) {
                if (err.code === -10005) {
                    console.log("暂不支持该功能");
                } else {
                    console.log("设为常用查询失败", err.msg);
                }
                localStorage.setItem("isCommonUse", "true");
            },
        });
    }
    // 添加小游戏到常用小游戏
    // region addCommonUse
    addCommonUse(_successCallback: Function, _failCallback?: Function) {
        if (!this.ks) return;

        this.ks.addCommonUse({
            success() {
                console.log("设为常用成功");
                Apis.getInstance().showTips("设置成功")
                _successCallback && _successCallback();
            },
            fail(err) {
                _failCallback && _failCallback();
                if (err.code === -10005) {
                    console.log("暂不支持该功能");
                } else {
                    console.log("设为常用失败", err.msg);
                }
            },
        });
    }

    //region vibrate
    vibrate(long?: boolean) {
        if (this.ks != null && this.ks != undefined) {
            if (long) {
                this.ks.vibrateLong({
                    fail(res) {
                        console.log(`vibrateLong fail`);
                    },
                });
            }
            else {
                this.ks.vibrateShort({
                    fail(res) {
                        console.log(`vibrateShort fail`);
                    },

                });
            }
        }
    }
    public jumpToGameClub() {
        this.ks && this.ks.jumpToGameClub({
            success() {
                console.log("成功跳转游戏圈");
            },
            fail(err) {
                if (err.code === -10005) {
                    console.error("当前设备不支持游戏圈功能");
                    Apis.getInstance().showTips("暂不支持游戏圈", 2000, "error")
                } else if (err.code === -100010) {
                    console.error("当前小游戏暂未开通游戏圈，请前往平台开通游戏圈功能");
                    Apis.getInstance().showTips("游戏圈搭建中~");
                } else {
                    console.error("跳转游戏圈失败", err.msg);
                }
            },
        });
    }

    public reportAnalytics(eventName: string, params: any) {
        console.log('数据打点', eventName, params[Object.keys(params)[0]], params[Object.keys(params)[1]]);
        if (this.ks) {
            KsHttpUpBehavior.getInstance().eventInfo(eventName, params[Object.keys(params)[0]] ?? '无内容', Object.keys(params)[1] ?? '');
            // KsHttpUpBehavior.getInstance().eventInfo(eventName, params, describe);
        }
    }
    //不需要
    public exitApplication() {
        console.log("================================> exitMiniProgram");
        if (this.ks) {
            this.ks.exitMiniProgram()
        }
    }
    //region 创建banner
    /** 创建banner广告 */
    createBannerAd() {
        if (this.ks != null && this.ks != undefined) {
            if (this.systemInfo.deviceOrientation === "landscape") {
                console.error("横屏暂不支持banner广告");
                return;
            }
            if (this.systemInfo.platform == "ios" && Apis.getInstance().compareVersion(this.systemInfo.version, "12.10.40") < 0) {
                console.error("IOS版本号过低，无法创建banner,当前版本号[", this.systemInfo.version, "],目标版本号[12.10.40]");
                return;
            }
            if (Apis.getInstance().compareVersion(this.systemInfo.version, "12.10.30") < 0) {
                console.error("安卓版本号过低，无法创建banner,当前版本号[", this.systemInfo.version, "],目标版本号[12.10.30]");
                return;
            }
            if (this.bannerAd) {
                return;
            }
            const adWidth = this.windowWidth * 0.8;
            // 计算 top 位置：屏幕高度 - 广告高度 - 边距
            this.bannerAd = this.ks.createBannerAd({
                adUnitId: AdsOptions.ks.bannerId,
                adIntervals: 30, // banner广告刷新时间，最小30秒
                style: {
                    top: Math.floor(this.windowHeight * 0.9),
                    left: Math.floor((this.windowWidth - adWidth) / 2),
                    width: Math.floor(adWidth),
                    height: Math.floor(adWidth * 0.35)
                }
            })
            this.bannerAd.onLoad(this.bannerOnloadFunction);
            this.bannerAd.onError(this.bannerOnErrorFunction);
            this.bannerAd.onClose(this.bannerOnCloseFunction);
        }
    }

    // region 展示banner
    showBannerAd() {
        console.log("展示banner");
        if (this.ks != null && this.ks != undefined) {
            if (!this.bannerAd) {
                this.createBannerAd();
            }
            this.bannerAd.show()
                .then(() => {
                    console.log("快手_banner广告展示成功");
                })
                .catch((err) => {
                    console.error("快手_banner广告展示失败_", err);
                })
        }
    }
    //region 隐藏banner
    hideBannerAd() {
        console.log("隐藏banner");
        if (this.ks != null && this.ks != undefined) {
            if (this.bannerAd) {
                this.bannerAd.hide()
            }
        }
    }
    /**
     * banner加载成功回调
     */
    bannerOnloadFunction = () => {
        console.log("banner广告已准备好");
    }
    /**
     * banner报错回调
     * @param err 错误信息
     */
    bannerOnErrorFunction = (err) => {
        console.error("banner广告报错", err);
        this.bannerAd.offLoad(this.bannerOnloadFunction);
        this.bannerAd.offError(this.bannerOnErrorFunction);
        this.bannerAd.offClose(this.bannerOnCloseFunction);
        this.bannerAd.destroy();
        this.bannerAd = null;
    }
    /**
     * banner关闭回调
     */
    bannerOnCloseFunction = () => {
        this.bannerAd.offLoad(this.bannerOnloadFunction);
        this.bannerAd.offError(this.bannerOnErrorFunction);
        this.bannerAd.offClose(this.bannerOnCloseFunction);
        this.bannerAd.destroy();
        this.bannerAd = null;
    }

    public get LaunchSceneId(): string {
        return this.KSSceneId;
    }

    //region 桌面启动回调
    setLaunchFromDeskTopCallback(callBack: Function) {
        if (this.KSStartFromShortcutCallback) return;
        this.KSStartFromShortcutCallback = callBack;
        const from = Apis.getInstance().coldLaunchOptions.from;
        if (from == "retention_apk" || from == "shortcut_app" || from == "retention_desk_ios") {
            console.log("【冷启动】用户从桌面快捷方式进入了游戏");
            if (Apis.getInstance().getSdkData("DeskTopRewardTimes") < 1) {
                this.KSStartFromShortcutCallback && this.KSStartFromShortcutCallback();
                Apis.getInstance().DeskTopRewardTimes = 1;
                Apis.getInstance().setDeskTopRewardDate();
            } else {
                console.error("【冷启动】桌面奖励已领取");
            }
        }
    }

    //region 侧边栏启动回调
    setLaunchFromSideBarCallback(callBack: Function) {
        if (this.KSStartFromSidebarCallback) return;
        this.KSStartFromSidebarCallback = callBack;
        const from = Apis.getInstance().coldLaunchOptions.from;
        if (from == "sidebar_new") {
            console.log("【冷启动】用户从侧边栏进入了游戏");
            if (Apis.getInstance().getSdkData("SideBarRewardTimes") < 1) {
                this.KSStartFromSidebarCallback && this.KSStartFromSidebarCallback();
                Apis.getInstance().SideBarRewardTimes = 1;
                Apis.getInstance().setSideBarRewardDate();
            } else {
                console.error("【冷启动】侧边栏奖励已领取");
            }
        }
    }

    //region 再得激励回调
    setCompleteWatchVideoCallback(callBack: Function) {
        if (this.completeWatchVideoCallback) return;
        this.completeWatchVideoCallback = callBack;
    }

    getSideBarUsable() {
        return this.SideBarUsable;
    }
}
