//@ts-nocheck
import WXGameAPI from "./WXGameAPI";
import BLGameAPI from "./BLGameAPI";
import KSGameAPI from "./KSGameAPI";
import MYGameAPI from "./MYGameAPI";
import TTGameAPI, { feedConfig } from "./TTGameAPI";
import Apis, { AdsOptions, LPPlatform } from "./PlatformOptions";


export default class PlatformAdManager {
    /** 渠道API */
    private static dxPFGameAPI: any = null;
    // 私有化构造方法
    private constructor() {
        // console.error("外部不允许创建");
    }

    private static Instance: PlatformAdManager | null = null;
    /** 
     *  初始化/获取 单例
     *  为了保证后台控制插屏时机的准确性，需要尽量在进入游戏的第一时机执行改方法
    */
    public static getInstance(): PlatformAdManager {
        if (!this.Instance) {
            this.Instance = new PlatformAdManager();
        }
        return this.Instance;
    }
    // SDK初始化  优先执行
    onInit(call?) {
        console.error("==========SDK初始化==========");
        this.initPlatform(() => {
            Apis.getInstance().onInit();
            this.initGameApi();
        });
        call && call();
    }

    /** 自动选择平台 */
    private initPlatform(callBack) {
        /**
         *  wx被多个小游戏平台注入，所以放在最后一个判断分支中校验
         */
        if (window["tt"]) {
            AdsOptions.platform = LPPlatform.toutiao;
        } else if (window["ks"]) {
            AdsOptions.platform = LPPlatform.ks;
        } else if (window["bl"]) {
            AdsOptions.platform = LPPlatform.bl;
        } else if (window["my"]) {
            AdsOptions.platform = LPPlatform.zfb;
        } else if (window["wx"]) {
            AdsOptions.platform = LPPlatform.wechat;
        } else {
            console.log("无命中渠道，赋值other");
            AdsOptions.platform = LPPlatform.other;
        }
        callBack();
    }
    //region 初始化平台API
    private initGameApi() {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
                PlatformAdManager.dxPFGameAPI = TTGameAPI.getInstance();
                break;
            case LPPlatform.wechat:
                PlatformAdManager.dxPFGameAPI = WXGameAPI.getInstance();
                break;
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI = KSGameAPI.getInstance();
                break;
            case LPPlatform.zfb:
                PlatformAdManager.dxPFGameAPI = MYGameAPI.getInstance();
                break;
            case LPPlatform.bl:
                PlatformAdManager.dxPFGameAPI = BLGameAPI.getInstance();
                break;
            default:
                break;
        }
    }
    // #region 插屏  
    public showInsertAd() {
        Apis.getInstance().REQUEST_INSERTAD_TIME = Date.now();

        if (!(Apis.getInstance().REQUEST_INSERTAD_TIME >= Apis.getInstance().DNOT_SHOW_INSERTAD_IN_TIME)) {
            console.log("初始不展示，还剩：", (Apis.getInstance().DNOT_SHOW_INSERTAD_IN_TIME - Apis.getInstance().REQUEST_INSERTAD_TIME) / 1000);
            return;
        }

        if (!(Apis.getInstance().REQUEST_INSERTAD_TIME >= Apis.getInstance().INSERT_CD + Apis.getInstance().LATEST_INSERTAD_TIME)) {
            console.log("条件不满足，距离上次展示：", (Apis.getInstance().REQUEST_INSERTAD_TIME - Apis.getInstance().LATEST_INSERTAD_TIME) / 1000);
            return
        }
        if (Apis.getInstance().INSERTAD_COUNTS >= Apis.getInstance().MAX_INSERTAD_NUMS) {
            // 可在此处进行别的操作：例如展示分享页面、添加桌面页面
            console.log("可展示次数已耗尽：", Apis.getInstance().INSERTAD_COUNTS);
            return
        }

        switch (AdsOptions.platform) {
            case LPPlatform.ks:
                if (Apis.getInstance().runAfter(AdsOptions.target_time)) {
                    console.log("定时任务已开启");
                    return;
                }
            case LPPlatform.toutiao:
            case LPPlatform.wechat:
            case LPPlatform.bl:
                setTimeout(() => {
                    if (!PlatformAdManager.dxPFGameAPI) this.initGameApi();
                    PlatformAdManager.dxPFGameAPI.showInsertAd(() => {
                        let now = new Date();
                        Apis.getInstance().LATEST_INSERTAD_TIME = now.getTime(); // 最新一次插屏的时间戳
                        let insertShowTime = "" + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');  // 2026+02+3 = 2031
                        localStorage.setItem("insertShowTime", "" + insertShowTime); //记录最后一次插屏的日期
                        localStorage.setItem("InsertADNums", "" + ++Apis.getInstance().INSERTAD_COUNTS); // 展示次数+1
                        console.log("插屏已展示次数：", Apis.getInstance().INSERTAD_COUNTS);
                        Apis.getInstance().INSERT_CD = Apis.getInstance().NOT_SHOW_VIDEO_CD;
                        console.log("展示插屏，插屏间隔变更：", Apis.getInstance().INSERT_CD);
                    });
                }, Apis.getInstance().INSERT_DELAY);
                break;
            case LPPlatform.other:
                console.log("测试插屏");
                let now = new Date();
                Apis.getInstance().LATEST_INSERTAD_TIME = now.getTime(); // 最新一次插屏的时间戳
                let insertShowTime = "" + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');  // 2026+02+3 = 2031
                localStorage.setItem("insertShowTime", "" + insertShowTime); //记录最后一次插屏的日期
                localStorage.setItem("InsertADNums", "" + ++Apis.getInstance().INSERTAD_COUNTS); // 展示次数+1
                console.log("插屏已展示次数：", Apis.getInstance().INSERTAD_COUNTS);
                Apis.getInstance().INSERT_CD = Apis.getInstance().NOT_SHOW_VIDEO_CD;
                console.log("展示插屏，插屏间隔变更：", Apis.getInstance().INSERT_CD);
                break;
            default:
                break;
        }
    }

    //region 显示微信原生模板广告
    /**
     * 传入需要显示的广告id
     * @param adUnitId 广告id
     */
    public showCustomAd(adUnitId: string) {
        switch (AdsOptions.platform) {
            case LPPlatform.wechat:
                PlatformAdManager.dxPFGameAPI.showCustomAd(adUnitId);
        }
    }

    //region 隐藏微信原生模板广告
    /**
     * 传入需要隐藏的广告id
     * @param adUnitId 广告id
     */
    public hideCustomAd(adUnitId: string) {
        switch (AdsOptions.platform) {
            case LPPlatform.wechat:
                PlatformAdManager.dxPFGameAPI.hideCustomAd(adUnitId);
        }
    }

    //region 显示banner
    public showBanner() {
        switch (AdsOptions.platform) {
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI.showBannerAd();
            default:
                break;
        }
    }

    //region 隐藏banner
    public hideBanner() {
        switch (AdsOptions.platform) {
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI.hideBannerAd();
            default:
                break;
        }
    }

    private static m_lastShowVideoTime = new Date("1999-01-01");
    //#region 激励视频
    public showRewardVideo(successCallback?: Function, failCallback?: Function) {
        if (AdsOptions.platform == LPPlatform.other) {
            console.log("非小游戏环境，直接获得奖励");
            successCallback && successCallback();
            return;
        }
        let nowTime = new Date();
        if ((nowTime.getTime() - PlatformAdManager.m_lastShowVideoTime.getTime()) < 2000) {
            Apis.getInstance().showTips("广告拉取中...");
            return;
        }
        PlatformAdManager.m_lastShowVideoTime = nowTime;
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.wechat:
            case LPPlatform.ks:
            case LPPlatform.zfb:
            case LPPlatform.bl:
                PlatformAdManager.dxPFGameAPI.showVideo(() => {
                    setTimeout(() => {
                        Apis.getInstance().MAX_INSERTAD_NUMS = Apis.getInstance().MAX_INSERTAD_NUMS_SHOWVIDEO
                        Apis.getInstance().LATEST_INSERTAD_TIME = Date.now(); // 激励视频 重置最新一次插屏时间戳
                        Apis.getInstance().INSERT_CD = Apis.getInstance().SHOW_VIDEO_CD;
                        console.log("看完激励，插屏间隔变更：", Apis.getInstance().INSERT_CD);
                        successCallback && successCallback();
                    }, 1);
                }, () => {
                    setTimeout(() => {
                        failCallback && failCallback();
                    }, 1);
                });
                break;
            default:
                break;
        }
    }

    //region 埋点上报
    public reportAnalytics(flag: string, data: object) {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.wechat:
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI.reportAnalytics(flag, data);
                break;

            default:
                break;
        }
    }
    //region 监听退出游戏
    public exitApplication(call) {
        console.log("dx =====> exitApplication ");
        switch (AdsOptions.platform) {
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI.exitApplication(call);
                break;

            default:
                break;
        }
    }

    //#region 震动
    public vibrate(long: boolean = false) {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.wechat:
            case LPPlatform.ks:
            case LPPlatform.zfb:
            case LPPlatform.bl:
                PlatformAdManager.dxPFGameAPI.vibrate(long);
                break;

            default:
                break;
        }
    }

    //#region 添加桌面
    public addDesktop(successCallback?: Function) {
        console.log("添加桌面");
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.ks:
            case LPPlatform.bl:
                PlatformAdManager.dxPFGameAPI.addDesktop(() => { successCallback && successCallback() });
                break;
            default:
                break;
        }
    }

    //#region 分享
    public share(successCallback?: Function) {
        console.log("分享");
        switch (AdsOptions.platform) {

            case LPPlatform.toutiao:
            case LPPlatform.wechat:
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI.share(() => { successCallback && successCallback() });
                break;
            default:
                break;
        }
    }

    //region 侧边栏
    public GoToSidebar(successCallback?: Function) {

        switch (AdsOptions.platform) {

            case LPPlatform.toutiao:
            case LPPlatform.ks:
            case LPPlatform.bl:
                PlatformAdManager.dxPFGameAPI.GoToSidebar(() => { successCallback && successCallback() });
                break;
            default:
                break;
        }
    }

    // region 直流获客
    public feedGetCustom(successCallback?: Function) {
        switch (AdsOptions.platform) {

            case LPPlatform.toutiao:
                PlatformAdManager.dxPFGameAPI.feedGetCustom(() => { successCallback && successCallback() });
                break;
            default:
                break;
        }
    }

    //  region 订阅
    public subscription(successCallback?: Function) {
        // index.js
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.wechat:
                PlatformAdManager.dxPFGameAPI.subscription(successCallback && successCallback());
                break;
            default:
                break;
        }

    }

    // region 检查更新
    public getUpdateManager() {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.wechat:
                PlatformAdManager.dxPFGameAPI.getUpdateManager();
                break;
            default:
                break;
        }
    }

    // region 桌面进入奖励
    public setLaunchFromDeskTopCallback(callBack: Function) {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.bl:
            case LPPlatform.ks:
                PlatformAdManager.dxPFGameAPI.setLaunchFromDeskTopCallback(callBack);
                break;
            default:
                break;
        }
    }

    // region 侧边栏进入奖励
    public setLaunchFromSideBarCallback(callBack: Function) {
        switch (AdsOptions.platform) {
            case LPPlatform.bl:
            case LPPlatform.ks:
            case LPPlatform.toutiao:
                PlatformAdManager.dxPFGameAPI.setLaunchFromSideBarCallback(callBack);
                break;
            default:
                break;
        }
    }
    // region 再得激励奖励回调
    /**
     * 再得激励奖励回调
     * @param callBack 奖励脚本
     * @returns 
     */
    public setCompleteWatchVideoCallback(callBack: Function) {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
            case LPPlatform.ks:
                return PlatformAdManager.dxPFGameAPI.setCompleteWatchVideoCallback(callBack);
            default:
                return false;
        }
    }

    // region 侧边栏功能检测
    getSideBarUsable() {
        switch (AdsOptions.platform) {
            case LPPlatform.bl:
            case LPPlatform.ks:
                return PlatformAdManager.dxPFGameAPI.getSideBarUsable();
            default:
                return false;
        }
    }

    /**
     * 直流推荐执行
     * @param FeedConfig 直流配置
     * @param defaultCallback 非直流时，执行默认回调
     */
    feedPlanExecute(FeedConfig: feedConfig[], defaultCallback?: Function) {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
                PlatformAdManager.dxPFGameAPI.feedPlanExecute(FeedConfig, defaultCallback);
                break;
            default:
                defaultCallback();
                break;
        }
    }
    /**
     * @param sceneId 在抖音小游戏平台中查询，性能分析-启动性能-启动场景配置
     */
    feedSceneReport(sceneId?: number) {
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
                PlatformAdManager.dxPFGameAPI.feedSceneReport(sceneId);
                break;
            default:
                break;
        }
    }

}