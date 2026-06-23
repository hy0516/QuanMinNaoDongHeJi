//官方文档 https://developers.weixin.qq.com/minigame/introduction/
/** 微信小游戏渠道API */
import Apis, { AdsOptions } from "./PlatformOptions";
import WxHttpUpBehavior from "./WxHttpUpBehavior";

export enum SDKMustTrackEvent {
    TUTORIAL_START = "TUTORIAL_START",
    START_LOAD = "START_LOAD",
    LOAD_FINISH = "LOAD_FINISH",
    SHARE = "SHARE",
    ADD_TO_WISHLIST = "ADD_TO_WISHLIST",
    TABLE_JOIN = "TABLE_JOIN",
    SUBSCRIBE = "SUBSCRIBE",
    RETENTION_5s = "RETENTION_5s",
    LEVEL_ENTER = "LEVEL_ENTER",
    LEVEL_EXIT = "LEVEL_EXIT",
    LEVEL_LOSE = "LEVEL_LOSE",
    LEVEL_PASS = "LEVEL_PASS",
    AD_PLACEMENT_SHOW = "AD_PLACEMENT_SHOW",
    AD_PLACEMENT_CLICK = "AD_PLACEMENT_CLICK",
    AD_CLICK = "AD_CLICK",
    AD_VIDEO_FINISH = "AD_VIDEO_FINISH",
    AD_IMPRESSION = "AD_IMPRESSION",
    ADD_DESKTOP = "ADD_DESKTOP",
    TUTORIAL_FINISH = "TUTORIAL_FINISH" // 新手教程完成
}

// 进入关卡
const LevelEnterObj = {
    enter_level_id: 0.30,
    enter_level_name: "", // 关卡名称
    game_mode: "简单模式",
    level_id: 1, // 关卡ID
    chapter_id: 1,
    coin_amount: 0,
    stamina_value: 1, // 体力值
    level_value: 1,
}

// 关卡结束（胜利/失败/退出）
const LevelEndObj = {
    ad_cnt: 1,
    duration: 1,
    items: [],
    enter_level_id: 0.30,
    game_mode: "简单模式",
    level_id: 1,
    chapter_id: 1,
    coin_amount: 0,
    stamina_value: 1,
    level_value: 1
}

/** 分享的参数 */
const ShareObj = {
    title: '脑洞找茬我最强!!',
    imageUrl: '', // 图片 URL
    imageUrlId: '' // 图片 id
}
/** 通过审核的分享图编号 */
const ShareImgArr = [
    // { imageUrlId: "TRlZ8kgZSZi6sUPMrvwrxw==", imageUrl: "https://mmocgame.qpic.cn/wechatgame/KPmqPdXH2Gh7gick1uhWSj20SpX3n38yr7luH3T8AwD6Pciar0EUR5FahZ4pCiaFJZ3/0" },
    // { imageUrlId: "O5Ozl9e+Sv6iJZQE5NOtFQ==", imageUrl: "https://mmocgame.qpic.cn/wechatgame/Fyz9kslHneN71fakRX0UAKldBvKVUGxskvol8niaF1Z7pS5Vk2epbYJBerjhLfsu1/0" },
];

function getRandomShareImg() {
    const count = ShareImgArr.length;
    if (count === 0) { return { imageUrlId: "", imageUrl: "" }; }

    const randomIndex = Math.floor(Math.random() * (count - 1 - 0 + 1)) + 0;
    return (ShareImgArr && ShareImgArr[randomIndex]) ?? ShareImgArr[0];
}

export default class WXGameAPI {
    // 关卡内游戏时长
    private gameSingleTime: number = 0;
    // 关卡内激励次数
    public videoSingleTime: number = 0;
    // 是否处在关卡内部
    public isInGame: boolean = false;
    // 定时器开关
    private timeCtrl: any ;
    /**平台环境 */
    private wx: any = window["wx"];
    /**原生模板广告池 */
    private customAdMap: Map<String, any> = new Map<String, any>();
    /**插屏广告 */
    private interstitialAd: any = null;
    /**视频广告 */
    private rewardedVideoAd: any = null;
    /**原生刷新间隔 组 */
    private adIntervals = [30, 35, 40, 45, 50]
    /**原生广告刷间隔组的下标 */
    private adIntervalsIndex = 0;
    /**设备可用像素width */
    windowWidth: number = 0;
    /**设备可用像素height */
    windowHeight: number = 0;
    /**系统信息 */
    systemInfo: any = null;
    /**冷启动参数 */
    coldLaunchOptions: any = null;
    /**腾讯SDK实例 */
    private sdk
    /** 激励视频成功回调 */
    private videoSuccCallback: Function | undefined;
    /** 激励视频失败回调 */
    private videoFailCallback: Function | undefined;
    /** 微信场景值 */
    WXSceneId: string = "000";
    /** 微信启动携带参数 */
    private launchInfo: any = null;

    private static ins: WXGameAPI | null = null;

    public static getInstance() {
        if (WXGameAPI.ins == null) {
            WXGameAPI.ins = new WXGameAPI();
        }
        return WXGameAPI.ins;
    }

    constructor() {
        this.onInit(() => { });
    }
    // region onInit
    onInit(_callback: Function) {
        console.log("===============wxAPI onInit===============")
        if (this.wx != null && this.wx != undefined) {
            this.sdk = this.wx.sdk ?? null;
            // 获取冷启动参数
            this.coldLaunchOptions = Apis.getInstance().coldLaunchOptions;
            console.log("获取到的冷启动参数_", this.coldLaunchOptions);
            this.onInitUpehavior();
            this.validate();
            const res = this.wx.getSystemInfoSync();
            this.windowHeight = res.screenHeight;
            this.windowWidth = res.screenWidth;
            this.shareAppMessageInit();

            // 预加载插屏广告实例
            this.createInsertAd();

            // 微信原生模板广告统一创建，填入[ 广告ID、样式 ]即可
            // this.createCustomAd(AdsOptions.wx.customAdsIds.bannerId, 0, 0, this.windowWidth);
        }
        _callback && _callback();
    }

    protected onInitUpehavior() {
        const options = this.coldLaunchOptions
        let query = options.query;
        //保存对应的启动参数到本地存储中  头条
        this.WXSceneId = options.scene.toString();
        const wx_chan_type: number = Number(localStorage.getItem("wx_chan_type") || "3");
        if (wx_chan_type == 3) {
            if (query.clickid != undefined && query.clickid != null) {
                localStorage.setItem("wx_dy_promotion_id", query.promotion_id);//计划id
                localStorage.setItem("wx_dy_project_id", query.project_id);//项目id
                localStorage.setItem("wx_dy_requestid", query.req_id);//请求id
                localStorage.setItem("wx_dy_material_id", query.material_id);//素材ID
                localStorage.setItem("wx_dy_advertiser_id", query.advertiser_id);//广告主
                localStorage.setItem("wx_dy_click_id", query.clickid)
                localStorage.setItem("wx_chan_type", "1");

            }
            // 爱奇艺
            else if (query.ai != null && query.ai != undefined) {
                localStorage.setItem("wx_dy_promotion_id", query.d);//创意id
                localStorage.setItem("wx_dy_project_id", query.q);//广告id
                localStorage.setItem("wx_dy_advertiser_id", query.ai);//账户id
                localStorage.setItem("wx_dy_click_id", query.c)//曝光id
                localStorage.setItem("wx_chan_type", "4");
            } else {
                localStorage.setItem("wx_chan_type", "3");
            }
        }
    }

    getUserLabel() {
        if (!window["miniGameCommon"]) {
            console.log("非miniGameCommon环境下!!");
            return;
        }
        window["miniGameCommon"].getUserLabel({
            labelId: 'iaa_feature' // 注意labelid必填 iaa_feature，若传入其他labelId会报错
        }).then(async (res: any) => {
            console.log('获取用户标签成功:', res);
            const tagData = await this.decryptData(res.encryptedData, res.iv); // 解密数据
            console.log('获取到的用户标签:', tagData);
        }).catch((res: any) => {
            console.log('获取用户标签失败:', res);
        });
    }

    /**
     * 注册分享监听
     */
    shareAppMessageInit() {
        if (this.wx == undefined || this.wx == null) return;

        if (this.wx.onShareAppMessage) {
            this.wx.onShareAppMessage(() => {
                this.reportAnalytics(SDKMustTrackEvent.SHARE, { target: "APP_MESSAGE" }); // 转发给朋友
                const randomImgData = getRandomShareImg();
                ShareObj.imageUrlId = randomImgData.imageUrlId;
                ShareObj.imageUrl = randomImgData.imageUrl;
                return ShareObj.imageUrl !== "" ? ShareObj : { title: ShareObj.title };
            });
        }
        if (this.wx.onShareTimeline) {
            this.wx.onShareTimeline(() => {
                this.reportAnalytics(SDKMustTrackEvent.SHARE, { target: "TIME_LINE" });  // 分享到朋友圈
                const randomImgData = getRandomShareImg();
                ShareObj.imageUrlId = randomImgData.imageUrlId;
                ShareObj.imageUrl = randomImgData.imageUrl;
                return ShareObj.imageUrl !== "" ? ShareObj : { title: ShareObj.title };
            });
        }
        // 普通收藏
        if (this.wx.onAddToFavorites) {
            this.wx.onAddToFavorites(() => {
                this.reportAnalytics("ADD_TO_WISHLIST", { type: "default" }); // 普通收藏
            });
        }
        //开启 小游戏右上角'...'中的分享功能
        this.wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
            fail: (err) => {
                console.error("showShareMenu调用报错_", err);
            }
        });
    }

    // region createVideo
    async createVideo(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.wx == null
                || this.wx == undefined
                || this.rewardedVideoAd) {
                resolve(true);
                return;
            }
            this.rewardedVideoAd = this.wx.createRewardedVideoAd({
                adUnitId: AdsOptions.wx.videoId,
            });
            this.rewardedVideoAd.onLoad(() => {
                resolve(true);
            });
            this.rewardedVideoAd.onError((err) => {
                reject(err);
            });
            this.rewardedVideoAd.onClose((res) => {
                if ((res && res.isEnded) || res === undefined) {
                    setTimeout(() => {
                        this.getUserLabel(); // 获取用户标签
                    }, 30000);
                    this.videoSuccCallback && this.videoSuccCallback();
                    this.onSDKMustTrackVideoAD("AD_VIDEO_FINISH");
                    if (this.isInGame) {
                        this.videoSingleTime++;
                    }
                } else {
                    this.videoFailCallback && this.videoFailCallback();
                }
            })
        });
    }

    /**
     * 
     * @param _type 类型
     * @param _arg 参数
     * @param _successCallback 成功回调
     * @param _failCallback 失败回调
     */
    // region showVideo
    showVideo(
        _successCallback?: Function,
        _failCallback?: Function
    ) {
        if (this.wx == null || this.wx == undefined) {
            console.log("非微信渠道，直接获取奖励");
            _successCallback && _successCallback();
            return;
        }

        this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_CLICK);

        this.videoSuccCallback = undefined;
        this.videoFailCallback = undefined;
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.show()
                .then(() => {
                    this.videoSuccCallback = _successCallback;
                    this.videoFailCallback = _failCallback;
                    this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_PLACEMENT_SHOW);
                    this.reportAnalytics(SDKMustTrackEvent.AD_IMPRESSION, { ad_type: 1 });
                })
                .catch(err => {
                    console.error("激励视频展示失败", err);
                    this.rewardedVideoAd.load()
                        .then(() => {
                            this.rewardedVideoAd.show()
                                .then(() => {
                                    this.videoSuccCallback = _successCallback;
                                    this.videoFailCallback = _failCallback;
                                    this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_PLACEMENT_SHOW);
                                    this.reportAnalytics(SDKMustTrackEvent.AD_IMPRESSION, { ad_type: 1 });
                                });
                        });
                });
        } else {
            this.createVideo()
                .then(() => {
                    this.rewardedVideoAd.show()
                        .then(() => {
                            this.videoSuccCallback = _successCallback;
                            this.videoFailCallback = _failCallback;
                            this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_PLACEMENT_SHOW);
                            this.reportAnalytics(SDKMustTrackEvent.AD_IMPRESSION, { ad_type: 1 });
                        })
                });
        }
    }

    //region 插屏start
    createInsertAd() {
        if (this.interstitialAd) return
        if (this.wx == null || this.wx == undefined) return;
        // 在初始展示之前10秒创建
        this.interstitialAd = this.wx.createInterstitialAd({
            adUnitId: AdsOptions.wx.insertId
        })

        // 加载失败
        this.interstitialAd.onError((err) => {
            console.error('插屏加载错误', err);
        })

        // 加载成功
        this.interstitialAd.onLoad(() => {
            console.log('插屏广告加载成功')
        })

        // 关闭插屏
        this.interstitialAd.onClose(() => {
            console.log("插屏已关闭");
        })
    }
    showInsertAd(call: Function = () => { }) {
        console.log("===============  showInsertAd   ======================")
        if (this.wx == null || this.wx == undefined) return;
        if (!this.interstitialAd) {
            this.createInsertAd();
        }
        this.interstitialAd.show()
            .then(() => {
                call && call();
            })
    }
    //region 插屏end


    //region 原生模板广告start
    /**
     * 微信新原生广告集成 banner、grid、单图等多种广告样式
     * @param adUnitId 广告ID
     * @param left 左边距
     * @param top 上边距
     * @param width 广告宽度
     * @returns 
     */
    createCustomAd(adUnitId: string, left: number, top: number, width: number) {
        if (this.wx == null || this.wx == undefined) return;
        const length = this.adIntervals.length
        const customAd = this.wx.createCustomAd({
            adUnitId: adUnitId,
            adIntervals: this.adIntervals[this.adIntervalsIndex++ % length], // 不同广告位分配不同的刷新时间
            style: {
                lef: Math.floor(left),
                top: Math.floor(top),
                width: Math.floor(width)
            }
        })
        customAd.onClose(() => {
            console.log("用户关闭广告", adUnitId);
        });
        customAd.onError((err) => {
            console.log(adUnitId, "广告错误", err);
        })
        customAd.onLoad(() => {
            console.log("广告加载完成", adUnitId);
        })
        customAd.onResize((res) => {
            console.log(adUnitId, "广告样式发生变化", res);
        })
        this.customAdMap.set(adUnitId, customAd);
    }
    /** 展示原生模板广告 */
    showCustomAd(adUnitId: string) {
        if (this.wx == null || this.wx == undefined) return;
        const customAd = this.customAdMap.get(adUnitId);
        if (customAd) {
            customAd.show();
        }
    }
    /** 隐藏原生模板广告 */
    hideCustomAd(adUnitId: string) {
        if (this.wx == null || this.wx == undefined) return;
        const customAd = this.customAdMap.get(adUnitId);
        if (customAd) {
            customAd.hide();
        }
    }
    //region 原生模板广告end

    //#region vibrate
    vibrate(long?: boolean) {
        if (this.wx == null || this.wx == undefined) return;
        if (long) {
            this.wx.vibrateLong({
                success(res) {
                },
                fail(res) {
                    console.log(`vibrateLong 调用失败`);
                },
            });
        }
        else {
            this.wx.vibrateShort({
                success(res) {
                },
                fail(res) {
                    console.log(`vibrateShort 调用失败`);
                },
            });
        }
    }

    share(_callback?: Function) {
        this.reportAnalytics("SHARE", { target: "APP_MESSAGE" }); // 转发给朋友
        const randomImgData = getRandomShareImg();
        ShareObj.imageUrlId = randomImgData.imageUrlId;
        ShareObj.imageUrl = randomImgData.imageUrl;
        if (this.wx && this.wx.shareAppMessage) {
            this.wx.shareAppMessage(ShareObj.imageUrl !== "" ? ShareObj : { title: ShareObj.title });
            _callback && _callback();
        }
        else {
            console.log("分享失败");
        }

    }
    //  region subscription
    subscription(successCallback?: Function) {
        if (this.wx != null && this.wx != undefined) {
            console.log("订阅");
            this.reportAnalytics("SUBSCRIBE", {}); // 转发给朋友
            this.wx.requestSubscribeMessage({
                tmplIds: AdsOptions.wx.subscriptionIds,
                success(res) {
                    console.log("订阅成功", res);
                    successCallback && successCallback();
                },
                fail(err) {
                    console.error("订阅失败", err);
                }
            })
        }
    }

    /** 记录激励广告时间上次上报时间 - 间隔小于200ms时跳过 - 用于跳过默认上报"其他" */
    private VideoADEventReportTimeMap: Map<string, number> = new Map();
    /** 必接 - 激励广告 */
    public onSDKMustTrackVideoAD(event: string) {
        if (event !== "AD_PLACEMENT_SHOW") {
            const time = Date.now();
            const lastTime = this.VideoADEventReportTimeMap.get(event) ?? 0;
            if (time - lastTime < 200) { return; }
            this.VideoADEventReportTimeMap.set(event, time);
        }

        const ad_placement_name = 68;
        this.reportAnalytics(event, { ad_placement_name });
    }

    /// SDK关键帧--关卡结束
    public gameOver() {
        // 清空定时器
        if (this.timeCtrl) {
            clearInterval(this.timeCtrl);
            this.timeCtrl = 0;
        }
        this.gameSingleTime = 0;
        this.videoSingleTime = 0;
        this.isInGame = false;
    }
    // SDK关键帧--关卡开始
    public gameStart() {
        if (this.timeCtrl) clearInterval(this.timeCtrl);
        this.gameSingleTime = 0;
        this.videoSingleTime = 0;
        this.timeCtrl = setInterval(() => {
            this.gameSingleTime++;
        }, 1000);
        this.isInGame = true;
    }

    reportAnalytics(event: string, obj: object) {
        if (!Object.values(SDKMustTrackEvent).includes(event as SDKMustTrackEvent)) {
            console.warn("非微信埋点事件，已过滤：", event);
            return;
        }
        let resObj = {};
        switch (event) {
            case SDKMustTrackEvent.LEVEL_ENTER:
                this.gameStart();
                resObj = { ...LevelEnterObj, ...obj };
                break;
            case SDKMustTrackEvent.LEVEL_LOSE:
            case SDKMustTrackEvent.LEVEL_PASS:
            case SDKMustTrackEvent.LEVEL_EXIT:
                LevelEndObj.ad_cnt = this.videoSingleTime;
                LevelEndObj.duration = this.gameSingleTime;
                resObj = { ...LevelEndObj, ...obj };
                this.gameOver();
                break;
            default:
                resObj = obj;
                break;
        }
        console.log("微信-埋点", event);
        console.log("微信-埋点体", resObj);
        if (this.sdk) {
            switch (event) {
                case SDKMustTrackEvent.TUTORIAL_FINISH:
                    this.sdk.onTutorialFinish();
                    break;

                default:
                    this.sdk.track(event, resObj);
                    break;
            }
        }
    }

    getUpdateManager() {
        const updateManager = this.wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            console.log(res.hasUpdate)
        })
        updateManager.onUpdateReady(() => {
            this.wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
    }
    /**
     * 直玩回调
     */
    directCallback(call) {
        if (this.coldLaunchOptions.scene === 1387) call && call();
    }

    public validate() {
        const wx_chan_type: number = Number(localStorage.getItem("wx_chan_type") || "3");
        if (wx_chan_type == 3) {//自然量或者是微信自买量
            const wx_z_open_id: string = localStorage.getItem("wx_z_open_id") || "";
            if (wx_z_open_id == null || wx_z_open_id == "undefined" || wx_z_open_id == "" || wx_z_open_id == "null") {
                //自然接口 
                this.wx.login({
                    success: (res: any) => {
                        console.log("wx login success", res.code);
                        if (res.code) {
                            this.wx.request({
                                url: 'https://wxgames.zywxgames.com/api/wx',
                                data: {
                                    app_id: AdsOptions.wx.wx_app_id,
                                    code: res.code
                                },
                                success: (res: any) => {
                                    const data = res.data;
                                    console.log("获取openId结果 => ", data);
                                    console.log("(data && data.code ?? 0) === 1", ((data && data.code) ?? 0) === 1)
                                    console.log("data.open_id && data.open_id !== ''", data.open_id && data.open_id !== "");

                                    if (((data && data.code) ?? 0) === 1) {
                                        if (data.open_id && data.open_id !== "") {
                                            console.log("sdk==", this.sdk);
                                            console.log("setopenid=", this.sdk.setOpenId);

                                            this.sdk && this.sdk.setOpenId(data.open_id);
                                            localStorage.setItem("wx_z_open_id", data.open_id)
                                        }
                                        else if (data.union_id && data.union_id !== "") {
                                            this.sdk && this.sdk.setUnionId(data.union_id);
                                        }
                                        else {
                                            console.warn("获取openId失败C => ", data);
                                        }

                                        // 是否注册用户
                                        if (((data && data.is_new) ?? 0) === 1) {
                                            this.sdk && this.sdk.onRegister();
                                        }
                                        // 是否沉默唤起
                                        else if (((data && data.days) ?? 0) > 7) {
                                            this.sdk && this.sdk.track('RE_ACTIVE', { backFlowDay: 7 });
                                        }

                                        //TODO 保存一份到本地缓存 不需要每次都去请求 - 如果不调用怎么刷新服务器记录的时间
                                    }
                                    else {
                                        console.warn("获取openId失败A => ", data);
                                    }
                                },
                                fail: (err: any) => {
                                    console.warn("获取openId失败B => ", err.errMsg);
                                }
                            })
                        }
                    }
                });
            } else {
                //更新 lastUser 
                this.lastUser(wx_z_open_id);
            }
        } else {
            //外渠买量
            const wx_open_id: string = localStorage.getItem("wx_open_id") || ""
            if (wx_open_id == null || wx_open_id == "undefined" || wx_open_id == "" || wx_open_id == "null") {
                this.wx.login({
                    success: (res: any) => {
                        if (res.code) {
                            WxHttpUpBehavior.wx_code = res.code;
                            WxHttpUpBehavior.getInstance().onInit();
                            const wx_open_id1: string = localStorage.getItem("wx_open_id") || "";
                            const is_new = Number(localStorage.getItem("is_new"));
                            const days = Number(localStorage.getItem("days"));
                            const wx_z_open_id: string = localStorage.getItem("wx_z_open_id") || "";
                            if (wx_z_open_id == null || wx_z_open_id == "undefined" || wx_z_open_id == "" || wx_z_open_id == "null") {
                                this.wx.request({
                                    url: 'https://wxgames.zywxgames.com/api/wx',
                                    data: {
                                        app_id: AdsOptions.wx.wx_app_id,
                                        code: res.code,
                                        open_id: wx_open_id1
                                    }
                                })
                                localStorage.setItem("wx_z_open_id", wx_open_id1);
                            }
                            if (((is_new && is_new) ?? 0) === 1) {
                                this.sdk && this.sdk.onRegister();
                            }
                            if (((days && days) ?? 0) > 7) {
                                this.sdk && this.sdk.track('RE_ACTIVE', { backFlowDay: 7 });
                            }
                            //上报wxSDK
                            this.sdk && this.sdk.setOpenId(wx_open_id1);
                        }
                    }
                });
            } else {

                this.lastUser(wx_open_id);
                WxHttpUpBehavior.getInstance().lastUserTime();
            }
        }
    }

    private lastUser(open_id: string) {
        this.sdk && this.sdk.setOpenId(open_id);
        this.wx.request({
            url: 'https://wxgames.zywxgames.com/api/wx/lastUser',
            data: {
                app_id: AdsOptions.wx.wx_app_id,
                open_id: open_id,
            },
            success: (res: any) => {
                //is_new  days  
                const data = res.data;
                if (((data && data.code) ?? 0) === 1) {
                    // 是否注册用户
                    if (((data && data.is_new) ?? 0) === 1) {
                        this.sdk && this.sdk.onRegister();
                    }
                    // 是否沉默唤起
                    else if (((data && data.days) ?? 0) > 7) {
                        this.sdk && this.sdk.track('RE_ACTIVE', { backFlowDay: 7 });
                    }
                    //TODO 保存一份到本地缓存 不需要每次都去请求 - 如果不调用怎么刷新服务器记录的时间
                }
            }
        });
    }

    //获取缓存中的用户open_id
    public upSdk() {
        const wx_chan_type: number = Number(localStorage.getItem("wx_chan_type") || "3");
        let open_id: string = "";
        if (wx_chan_type == 3) {
            open_id = localStorage.getItem("wx_z_open_id") || "";
        } else {
            open_id = localStorage.getItem("wx_open_id") || "";
        }
        //上报微信后续
        return open_id;
    }


    //解密ecpm
    decryptData(encryptedData: any, iv: string) {
        this.wx.checkSession({
            success() {
                //session_key 未过期，并且在本生命周期一直有效,直接传给服务器解密
                WxHttpUpBehavior.getInstance().ecpm(encryptedData, iv);
            }, fail: () => {
                // session_key 已经失效，需要重新执行登录流程，确保服务端sessionkey未过期，后再解密
                this.wx.login({
                    success: (res: any) => {
                        console.log("wx login success", res && res.code);
                        if (res.code) {
                            WxHttpUpBehavior.wx_code = res.code;
                            WxHttpUpBehavior.getInstance().jsCodeSession();
                            WxHttpUpBehavior.getInstance().ecpm(encryptedData, iv);
                        }
                    }
                });
            }
        });
    }
}