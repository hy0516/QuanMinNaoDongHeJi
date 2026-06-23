// 官方文档  https://miniapp.bilibili.com/small-game-doc/guide/intro/
/** 哔哩哔哩小游戏渠道API */
import Apis, { AdsOptions } from "./PlatformOptions";
import BlHttpUpBehavior from "./BlHttpUpBehavior";

export default class BLGameAPI {

    /**平台环境 */
    bl: any = window["bl"];
    /**banner广告 */
    bannerAd: any = null;
    /**插屏广告 */
    interstitialAd: any = null;
    /**视频广告 */
    rewardedVideoAd: any = null;

    /**设备像素width */
    windowWidth: number = 0;
    /**设备像素height */
    windowHeight: number = 0;
    /**系统信息 */
    systemInfo: any = null;
    /** 激励视频是否拉取到本地 */
    rewardVideoAdLoaded: boolean = false;
    /** 激励视频成功回调 */
    videoSuccCallback: any;
    /** 激励视频失败回调 */
    videoFailCallback: any;
    /** 桌面快捷方式进入的奖励回调 */
    LaunchFromDeskTopCallback: Function | null = null;
    /** 侧边栏进入的奖励回调 */
    LaunchFromSideBarCallback: Function | null = null;
    /** 侧边栏是否可用 */
    private SideBarUsable: boolean = false;
    //#region 单例
    private static m_inst: BLGameAPI | null = null;


    public static getInstance(): BLGameAPI {
        if (this.m_inst == null) {
            this.m_inst = new BLGameAPI();
        }
        return this.m_inst;
    }

    private constructor() {
        this.onInit(() => { });
    }

    /**初始化 */
    onInit(_callback: Function) {
        if (this.bl != null && this.bl != undefined) {
            const launchOption = Apis.getInstance().coldLaunchOptions; //获取启动参数
            const res = Apis.getInstance().systemInfo;;

            const query = launchOption.query;

            if (query.clickid != undefined && query.clickid != null) {
                localStorage.setItem("bl_click_id", query.clickid);
                console.log("Query_clickid:" + query.clickid);
                localStorage.setItem("bl_projectid", query.projectid);
                console.log("Query_projectid:" + query.projectid);
                localStorage.setItem("bl_promotionid", query.promotionid);
                console.log("Query_promotionid:" + query.promotionid);
                localStorage.setItem("bl_requestid", query.requestid);
                console.log("Query_requestid:" + query.requestid);
            }
            this.systemInfo = res;
            this.windowWidth = this.systemInfo.windowWidth;
            this.windowHeight = this.systemInfo.windowHeight;
            this.onLogin();
            console.log("获取到的设备信息", res);

            Apis.getInstance().setOnShowCallback((res) => {
                if (res.scene == "021036") {
                    console.log("用户从侧边栏进入了游戏");
                    if (Apis.getInstance().getSdkData("SideBarRewardTimes") < 1) {
                        this.LaunchFromSideBarCallback && this.LaunchFromSideBarCallback();
                        Apis.getInstance().SideBarRewardTimes = 1;
                        Apis.getInstance().setSideBarRewardDate();
                    } else {
                        console.error("侧边栏奖励已领取");

                    }
                    this.checkSliderBarIsAvailable();
                }
                if (res.scene == "10002") {
                    console.log("用户从桌面进入了游戏");
                    if (Apis.getInstance().getSdkData("DeskTopRewardTimes") < 1) {
                        this.LaunchFromDeskTopCallback && this.LaunchFromDeskTopCallback();
                        Apis.getInstance().DeskTopRewardTimes = 1;
                        Apis.getInstance().setDeskTopRewardDate();
                    } else {
                        console.error("桌面奖励已领取");
                    }
                }
            })
        }
        _callback && _callback();
        console.log("bl onInit");
    }

    // 检测跳转侧边栏功能是否可用
    checkSliderBarIsAvailable() {
        if (Apis.getInstance().compareVersion(this.systemInfo.version, "3.99.5") >= 0) {
            this.bl.checkScene({
                scene: "sidebar",
                success: (res) => {
                    console.log("侧边栏是否可用_", res.isExist);
                    this.SideBarUsable = res.isExist;
                },
                fail: (err) => {
                    this.SideBarUsable = false;
                    console.error("侧边栏场景检测失败", err);
                }
            });
        }
    }

    // 登录
    onLogin() {
        this.checkSession()
            .then(alive => {
                const bl_code = localStorage.getItem("bl_code");
                if (alive && bl_code && bl_code != "") {
                    BlHttpUpBehavior.getInstance().onInit();
                } else {
                    console.warn("登录状态已失效，重新登录");
                    this.bl.login({
                        success(res) {
                            console.log("login 调用成功", res);
                            if (res && res.code) {
                                localStorage.setItem("bl_code", res.code);
                                localStorage.setItem("bl_is_login", "1");
                            }
                            setTimeout(() => {
                                BlHttpUpBehavior.getInstance().onInit();
                            }, 1000);
                        },
                        fail(err) {
                            console.error("登录失败", err);
                        },
                    });
                }
            })
    }

    async checkSession(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.bl.checkSession({
                success() {
                    resolve(true);
                },
                fail() {
                    resolve(false);
                }
            });
        })
    }

    public AddDeskTop() {
        if (!(this.bl != null && this.bl != undefined)) return;
        this.bl.addShortcut({
            success() {
                Apis.getInstance().showTips("从桌面进入可领取礼包哦~", 2500, "none");
            },
            fail(err) {
                console.log("添加桌面失败", err.errMsg);
                Apis.getInstance().showTips("添加桌面失败");
            }
        });
    }

    public GoToSidebar() {
        if (!(this.bl != null && this.bl != undefined)) return;
        this.bl.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("前往侧边栏成功_", res);
            },
            fail: (err) => {
                console.error("前往侧边栏失败_", err);
            },
        });

    }

    //region 激励视频关闭监听函数
    videoOnClose = (res) => {
        if (res && res.isEnded) {
            BlHttpUpBehavior.getInstance().videoUpdate();
            this.videoSuccCallback && this.videoSuccCallback();
        } else {
            this.videoFailCallback && this.videoFailCallback();
            Apis.getInstance().showTips("看完视频才能获得奖励哦~");
        }
    }

    // region createVideo
    async createVideo(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.bl != null && this.bl != undefined) {
                if (this.rewardedVideoAd && this.rewardVideoAdLoaded) {
                    resolve(true);
                    // 激励实例已存在
                    return;
                }
                this.rewardedVideoAd = this.bl.createRewardedVideoAd({
                    adUnitId: AdsOptions.bl.video_id
                });

                this.rewardedVideoAd.onLoad(() => {
                    console.log("激励视频拉取成功");
                    this.rewardVideoAdLoaded = true;
                    resolve(true);
                })

                this.rewardedVideoAd.onError((err) => {
                    console.error("激励视频监听到报错");
                    this.rewardVideoAdLoaded = false;
                    reject(err);
                });

                this.rewardedVideoAd.onClose(this.videoOnClose);
            }
        });
    }

    // region showvideo
    showVideo(_successCallback?: Function, _failCallback?: Function) {
        if (!(this.bl != null && this.bl != undefined)) {
            console.log('非小游戏平台，直接获得奖励');
            _successCallback && _successCallback();
            return;
        }
        if (this.rewardedVideoAd) {
            if (this.rewardVideoAdLoaded) {

                this.bl.reportScene({ sceneId: 1007 });
                this.rewardedVideoAd.show().then(() => {
                    this.rewardVideoAdLoaded = false;
                    this.videoSuccCallback = _successCallback;
                    this.videoFailCallback = _failCallback;
                    console.log("激励视频展示成功");
                }).catch((err) => {
                    console.error("激励视频展示失败,手动拉取加载：", err);
                    this.rewardedVideoAd.load()
                        .then(() => this.rewardedVideoAd.show()
                            .then(() => {
                                this.rewardVideoAdLoaded = false;
                                this.videoSuccCallback = _successCallback;
                                this.videoFailCallback = _failCallback;
                                console.log("激励视频展示成功");
                            })
                        )
                        .catch((err) => {
                            console.error("激励视频手动拉取失败", err);
                            _failCallback && _failCallback();
                        });

                });
            } else {
                console.log("激励视频加载失败，重新加载");
                this.rewardedVideoAd.load()
                    .then(() => this.rewardedVideoAd.show()
                        .then(() => {
                            this.rewardVideoAdLoaded = false;
                            this.videoSuccCallback = _successCallback;
                            this.videoFailCallback = _failCallback;
                            console.log("激励视频展示成功");
                        })
                    )
                    .catch((err) => {
                        console.error("激励视频手动拉取失败", err);
                        _failCallback && _failCallback();
                    });
            }
        } else {
            console.log("激励实例不存在，创建实例");
            this.createVideo()
                .then(() => {
                    this.rewardedVideoAd.show()
                        .then(() => {
                            this.rewardVideoAdLoaded = false;
                            this.videoSuccCallback = _successCallback;
                            this.videoFailCallback = _failCallback;
                            console.log("激励视频展示成功");
                        });
                })
                .catch((err) => {
                    _failCallback && _failCallback();
                    console.error("激励视频创建失败", err);
                })
        }
    }

    //region vibrate
    vibrate(long?: boolean) {
        if (this.bl != null && this.bl != undefined) {
            if (long) {
                this.bl.vibrateLong({
                    fail(err) {
                        console.log("vibrateLong调用失败", err);
                    },
                });
            }
            else {
                this.bl.vibrateShort({
                    fail(err) {
                        console.error("vibrateShort调用失败", err);
                    },
                });
            }
        }
    }

    reportScene() {
        if (!(this.bl != null && this.bl != undefined)) {
            console.log("非小游戏平台，不予上报");
            return;
        }
        this.bl.reportScene({
            success(res) {
                console.log("哔哩上报成功", res);
            },
            fail(err) {
                console.error("哔哩上报失败", err);
            }
        })
    }
    // 设置从桌面图标进入的脚本回调
    setLaunchFromDeskTopCallback(callBack: Function) {
        this.LaunchFromDeskTopCallback = callBack;
    }

    // 设置从侧边栏图标进入的脚本回调
    setLaunchFromSideBarCallback(callBack: Function) {
        this.LaunchFromSideBarCallback = callBack;
    }

    getSideBarUsable() {
        return this.SideBarUsable;
    }
}
