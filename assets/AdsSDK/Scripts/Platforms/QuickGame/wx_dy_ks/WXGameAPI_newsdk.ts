import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import Apis from "./PlatformOptions";
import WxHttpUpBehavior from "./WxHttpUpBehavior";
import SDK_config from "../../../SDK_config_newsdk";

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
    TUTORIAL_FINISH = "TUTORIAL_FINISH",
}

const LevelEnterObj = {
    enter_level_id: 0.3,
    enter_level_name: "",
    game_mode: "simple",
    level_id: 1,
    chapter_id: 1,
    coin_amount: 0,
    stamina_value: 1,
    level_value: 1,
};

const LevelEndObj = {
    ad_cnt: 1,
    duration: 1,
    items: [],
    enter_level_id: 0.3,
    game_mode: "simple",
    level_id: 1,
    chapter_id: 1,
    coin_amount: 0,
    stamina_value: 1,
    level_value: 1,
};

const ShareObj = {
    title: "share",
    imageUrl: "",
    imageUrlId: "",
};

const ShareImgArr: { imageUrlId: string; imageUrl: string }[] = [];

function getRandomShareImg() {
    if (ShareImgArr.length === 0) {
        return { imageUrlId: "", imageUrl: "" };
    }
    const index = Math.floor(Math.random() * ShareImgArr.length);
    return ShareImgArr[index];
}

export default class WXGameAPI_newsdk implements PlatformsInterface {
    private static ins: WXGameAPI_newsdk | null = null;
    
    private pickFirstId(source: string | string[] | undefined | null): string {
        if (Array.isArray(source)) {
            for (let i = 0; i < source.length; i++) {
                if (source[i]) {
                    return source[i];
                }
            }
            return "";
        }
        return source || "";
    }
    
    private wx: any = window["wx"];
    private sdk: any = null;
    private bannerAd: any = null;
    private interstitialAd: any = null;
    private rewardedVideoAd: any = null;
    private customAdMap: Map<string, any> = new Map<string, any>();
    private interstitialCloseCallback: Function | null = null;
    private currentInterstitialAdUnitId: string = "";
    private windowWidth = 0;
    private windowHeight = 0;
    private systemInfo: any = null;
    private coldLaunchOptions: any = null;
    private videoSuccCallback: Function | null = null;
    private videoFailCallback: Function | null = null;
    private gameSingleTime = 0;
    private videoSingleTime = 0;
    private isInGame = false;
    private timeCtrl: any = null;
    private WXSceneId = "000";
    private VideoADEventReportTimeMap: Map<string, number> = new Map<string, number>();

    public static getInstance() {
        if (WXGameAPI_newsdk.ins == null) {
            WXGameAPI_newsdk.ins = new WXGameAPI_newsdk();
        }
        return WXGameAPI_newsdk.ins;
    }

    constructor() {
        this.onInit(() => { });
    }

    onInit(_callback: Function) {
        if (!this.wx) {
            _callback && _callback();
            return;
        }

        this.sdk = this.wx.sdk || null;
        this.coldLaunchOptions = Apis.getInstance().coldLaunchOptions || (this.wx.getLaunchOptionsSync ? this.wx.getLaunchOptionsSync() : { query: {}, scene: 0 });
        this.systemInfo = Apis.getInstance().systemInfo || (this.wx.getSystemInfoSync ? this.wx.getSystemInfoSync() : null);
        if (this.systemInfo) {
            this.windowWidth = this.systemInfo.windowWidth || this.systemInfo.screenWidth || 0;
            this.windowHeight = this.systemInfo.windowHeight || this.systemInfo.screenHeight || 0;
        }
        this.WXSceneId = (this.coldLaunchOptions.scene || 0).toString();

        this.onInitUpehavior();
        this.shareAppMessageInit();
        this.createInsertAd();
        this.validate();

        _callback && _callback();
    }

    private onInitUpehavior() {
        const options = this.coldLaunchOptions || {};
        const query = options.query || {};
        const wx_chan_type = Number(localStorage.getItem("wx_chan_type") || "3");
        if (wx_chan_type == 3) {
            if (query.clickid != null && query.clickid != undefined) {
                localStorage.setItem("wx_dy_promotion_id", query.promotion_id || "");
                localStorage.setItem("wx_dy_project_id", query.project_id || "");
                localStorage.setItem("wx_dy_requestid", query.req_id || "");
                localStorage.setItem("wx_dy_material_id", query.material_id || "");
                localStorage.setItem("wx_dy_advertiser_id", query.advertiser_id || "");
                localStorage.setItem("wx_dy_click_id", query.clickid || "");
                localStorage.setItem("wx_chan_type", "1");
            } else if (query.ai != null && query.ai != undefined) {
                localStorage.setItem("wx_dy_promotion_id", query.d || "");
                localStorage.setItem("wx_dy_project_id", query.q || "");
                localStorage.setItem("wx_dy_advertiser_id", query.ai || "");
                localStorage.setItem("wx_dy_click_id", query.c || "");
                localStorage.setItem("wx_chan_type", "4");
            }
        }
    }

    private shareAppMessageInit() {
        if (!this.wx) return;

        if (this.wx.onShareAppMessage) {
            this.wx.onShareAppMessage(() => {
                this.reportAnalytics(SDKMustTrackEvent.SHARE, { target: "APP_MESSAGE" });
                const randomImgData = getRandomShareImg();
                ShareObj.imageUrlId = randomImgData.imageUrlId;
                ShareObj.imageUrl = randomImgData.imageUrl;
                return ShareObj.imageUrl ? ShareObj : { title: ShareObj.title };
            });
        }

        if (this.wx.onShareTimeline) {
            this.wx.onShareTimeline(() => {
                this.reportAnalytics(SDKMustTrackEvent.SHARE, { target: "TIME_LINE" });
                const randomImgData = getRandomShareImg();
                ShareObj.imageUrlId = randomImgData.imageUrlId;
                ShareObj.imageUrl = randomImgData.imageUrl;
                return ShareObj.imageUrl ? ShareObj : { title: ShareObj.title };
            });
        }

        if (this.wx.onAddToFavorites) {
            this.wx.onAddToFavorites(() => {
                this.reportAnalytics(SDKMustTrackEvent.ADD_TO_WISHLIST, { type: "default" });
                return {};
            });
        }

        if (this.wx.showShareMenu) {
            this.wx.showShareMenu({
                withShareTicket: true,
                menus: ["shareAppMessage", "shareTimeline"],
            });
        }
    }

    private getBannerId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.weixinID.bannerAdId as any);
    }

    private getVideoId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.weixinID.rewardedVideoAdId as any);
    }

    private getInsertId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.weixinID.InsertAdId as any);
    }

    private getInsertIdByIndex(index: number): string {
        const ids = SDK_config.GameIdConfig.weixinID.InsertAdId;
        if (Array.isArray(ids)) {
            if (ids[index]) {
                return this.pickFirstId(ids[index] as any);
            }
            return this.pickFirstId(ids[0] as any);
        }
        return this.pickFirstId(ids as any);
    }

    private createBanner() {
        if (!this.wx || this.bannerAd || !this.wx.createBannerAd) return;
        const adUnitId = this.getBannerId();
        if (!adUnitId) return;
        this.bannerAd = this.wx.createBannerAd({
            adUnitId: adUnitId,
            adIntervals: 30,
            style: {
                width: Math.floor(this.windowWidth * 0.8),
                left: Math.floor(this.windowWidth * 0.1),
                top: Math.floor(this.windowHeight * 0.9),
            }
        });
        this.bannerAd.onError((err: any) => {
            console.error("wx banner error", err);
            this.destroyBanner();
        });
        this.bannerAd.onResize((size: any) => {
            if (!this.bannerAd || !size) return;
            this.bannerAd.style.top = this.windowHeight - size.height;
            this.bannerAd.style.left = (this.windowWidth - size.width) / 2;
        });
    }

    private destroyBanner() {
        if (this.bannerAd) {
            this.bannerAd.destroy && this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }

    private createVideo(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.wx || !this.wx.createRewardedVideoAd) {
                resolve();
                return;
            }
            if (this.rewardedVideoAd) {
                resolve();
                return;
            }
            const adUnitId = this.getVideoId();
            if (!adUnitId) {
                resolve();
                return;
            }
            this.rewardedVideoAd = this.wx.createRewardedVideoAd({ adUnitId });
            this.rewardedVideoAd.onLoad(() => resolve());
            this.rewardedVideoAd.onError((err: any) => reject(err));
            this.rewardedVideoAd.onClose((res: any) => {
                if ((res && res.isEnded) || res === undefined) {
                    if (SDK_config.openMaiLiang) {
                        // WxHttpUpBehavior.getInstance().videoUpdate();
                    }
                    this.videoSuccCallback && this.videoSuccCallback();
                    this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_VIDEO_FINISH);
                    if (this.isInGame) {
                        this.videoSingleTime++;
                    }
                } else {
                    this.videoFailCallback && this.videoFailCallback();
                }
                if (this.rewardedVideoAd) {
                    this.rewardedVideoAd.destroy && this.rewardedVideoAd.destroy();
                    this.rewardedVideoAd = null;
                }
            });
        });
    }

    private createInsertAd(adUnitId?: string) {
        if (!this.wx || this.interstitialAd || !this.wx.createInterstitialAd) return;
        const targetId = adUnitId || this.getInsertId();
        if (!targetId) return;
        this.currentInterstitialAdUnitId = targetId;
        this.interstitialAd = this.wx.createInterstitialAd({ adUnitId: targetId });
        this.interstitialAd.onError((err: any) => {
            console.error("wx interstitial error", err);
        });
        this.interstitialAd.onClose(() => {
            if (this.interstitialAd) {
                this.interstitialAd.destroy && this.interstitialAd.destroy();
                this.interstitialAd = null;
            }
            this.currentInterstitialAdUnitId = "";
            this.interstitialCloseCallback && this.interstitialCloseCallback();
        });
    }

    showBanner(_arg?: any) {
        if (!this.wx) return;
        if (!this.bannerAd) {
            this.createBanner();
        }
        if (this.bannerAd && this.bannerAd.show) {
            this.bannerAd.show().catch((err: any) => {
                console.error("wx banner show failed", err);
            });
        }
    }

    hideBanner() {
        if (this.bannerAd && this.bannerAd.hide) {
            this.bannerAd.hide();
        }
    }

    showModal(title: string, content: string, confirmText: string, cancelText: string, _successCallback: Function, _failCallback: Function) {
        if (!this.wx || !this.wx.showModal) {
            _successCallback && _successCallback();
            return;
        }
        this.wx.showModal({
            title,
            content,
            confirmText,
            cancelText,
            success: () => {
                _successCallback && _successCallback();
            },
            fail: () => {
                _failCallback && _failCallback();
            }
        });
    }

    showVideo(_successCallback?: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
        if (!this.wx) {
            _successCallback && _successCallback();
            return;
        }

        if (!this.getVideoId()) {
            _successCallback && _successCallback();
            return;
        }
        this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_CLICK);

        const play = () => {
            if (!this.rewardedVideoAd) {
                _failCallback && _failCallback();
                return;
            }
            this.videoSuccCallback = _successCallback || null;
            this.videoFailCallback = _failCallback || null;
            this.rewardedVideoAd.show().then(() => {
                _showCallback && _showCallback();
                this.onSDKMustTrackVideoAD(SDKMustTrackEvent.AD_PLACEMENT_SHOW);
                this.reportAnalytics(SDKMustTrackEvent.AD_IMPRESSION, { ad_type: 1 });
            }).catch((err: any) => {
                console.error("wx video show failed", err);
                _failCallback && _failCallback();
            });
        };

        this.createVideo().then(play).catch((err) => {
            console.error("wx video create failed", err);
            _failCallback && _failCallback();
        });
    }

    share(_callback?: Function) {
        this.reportAnalytics(SDKMustTrackEvent.SHARE, { target: "APP_MESSAGE" });
        const randomImgData = getRandomShareImg();
        ShareObj.imageUrlId = randomImgData.imageUrlId;
        ShareObj.imageUrl = randomImgData.imageUrl;
        if (this.wx && this.wx.shareAppMessage) {
            this.wx.shareAppMessage({
                title: ShareObj.title,
                imageUrl: ShareObj.imageUrl || undefined,
                success: () => {
                    _callback && _callback();
                }
            });
            return;
        }
        _callback && _callback();
    }

    subscription(successCallback?: Function) {
        if (!this.wx || !this.wx.requestSubscribeMessage) {
            successCallback && successCallback();
            return;
        }
        this.reportAnalytics(SDKMustTrackEvent.SUBSCRIBE, {});
        const tmplId = this.pickFirstId(SDK_config.GameIdConfig.weixinID.subscriptionIds as any);
        if (!tmplId) {
            successCallback && successCallback();
            return;
        }
        this.wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            success: (res: any) => {
                successCallback && successCallback(res);
            },
            fail: (err: any) => {
                console.error("wx subscribe failed", err);
            }
        });
    }

    createCustomAd(adUnitId: string, left: number, top: number, width: number) {
        if (!this.wx || !this.wx.createCustomAd || !adUnitId) return;
        const customAd = this.wx.createCustomAd({
            adUnitId: adUnitId,
            adIntervals: 30,
            style: {
                left: Math.floor(left),
                top: Math.floor(top),
                width: Math.floor(width)
            }
        });
        customAd.onError((err: any) => {
            console.error("wx custom ad error", err);
        });
        customAd.onClose(() => { });
        this.customAdMap.set(adUnitId, customAd);
    }

    showCustomAd(adUnitId: string) {
        const customAd = this.customAdMap.get(adUnitId);
        if (customAd && customAd.show) {
            customAd.show().catch(() => { });
        }
    }

    hideCustomAd(adUnitId: string) {
        const customAd = this.customAdMap.get(adUnitId);
        if (customAd && customAd.hide) {
            customAd.hide();
        }
    }

    showInsertAd(_arg?: any, call: Function = () => { }) {
        let index = 0;
        if (_arg !== undefined && _arg !== null && _arg !== "") {
            const parsed = parseInt(_arg, 10);
            if (!isNaN(parsed) && isFinite(parsed) && parsed >= 0) {
                index = parsed;
            }
        }
        const adUnitId = this.getInsertIdByIndex(index);
        if (adUnitId && this.interstitialAd && this.interstitialAd.adUnitId !== adUnitId) {
            if (this.interstitialAd) {
                this.interstitialAd.destroy && this.interstitialAd.destroy();
                this.interstitialAd = null;
            }
            this.currentInterstitialAdUnitId = "";
        }
        if (!this.interstitialAd) {
            this.createInsertAd(adUnitId);
        }
        this.interstitialCloseCallback = call;
        if (this.interstitialAd && this.interstitialAd.show) {
            this.interstitialAd.show().catch((err: any) => {
                console.error("wx interstitial show failed", err);
                call && call();
            });
        } else {
            call && call();
        }
    }

    showCommonInsert(_arg?: any, _successCallback?: Function, falseCallback?: Function, adtype?: any) {
        this.showInsertAd(_arg, () => {
            _successCallback && _successCallback();
        });
    }

    showCommonNative(_arg?: any, _successCallback?: Function, falseCallback?: Function) {
        _successCallback && _successCallback();
    }

    showCommonVideo(_arg: string, _successCallback: () => void, _failCallback?: () => void) {
        this.showVideo(_successCallback, _failCallback);
    }

    hasShortcutInstalled(_callback: Function) {
        _callback && _callback(false);
    }

    addDesktop(_callback: Function) {
        _callback && _callback();
    }

    shareVideo(_successCallback: Function, _failCallback: Function) {
        this.showVideo(_successCallback, _failCallback);
    }

    saveDataToCache(_key: string, _value: any) {
        localStorage.setItem(_key, JSON.stringify(_value));
    }

    readDataFromCache(_key: string) {
        const value = localStorage.getItem(_key);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }

    startRecordScreen() { }
    stopRecordScreen() { }
    showMoreGames() { }
    jumpToGame(_packageName: string) { }
    hideInsertNativeAd() { }
    createNative(callback: any, nativeid: any) { callback && callback(); }
    onNativeAdClick(_id: string) { }
    sendMessage(key: string, value: any) {
        this.reportAnalytics(key, { value });
    }

    public onSDKMustTrackVideoAD(event: string) {
        if (event !== SDKMustTrackEvent.AD_PLACEMENT_SHOW) {
            const now = Date.now();
            const last = this.VideoADEventReportTimeMap.get(event) || 0;
            if (now - last < 200) {
                return;
            }
            this.VideoADEventReportTimeMap.set(event, now);
        }
        this.reportAnalytics(event, { ad_placement_name: 68 });
    }

    public gameOver() {
        if (this.timeCtrl) {
            clearInterval(this.timeCtrl);
            this.timeCtrl = null;
        }
        this.gameSingleTime = 0;
        this.videoSingleTime = 0;
        this.isInGame = false;
    }

    public gameStart() {
        if (this.timeCtrl) {
            clearInterval(this.timeCtrl);
        }
        this.gameSingleTime = 0;
        this.videoSingleTime = 0;
        this.timeCtrl = setInterval(() => {
            this.gameSingleTime++;
        }, 1000);
        this.isInGame = true;
    }

    reportAnalytics(event: string, obj: object) {
        if (Object.values(SDKMustTrackEvent).indexOf(event as SDKMustTrackEvent) === -1) {
            return;
        }

        let resObj: any = obj || {};
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
                break;
        }

        if (this.sdk && this.sdk.track) {
            if (event === SDKMustTrackEvent.TUTORIAL_FINISH && this.sdk.onTutorialFinish) {
                this.sdk.onTutorialFinish();
            } else {
                this.sdk.track(event, resObj);
            }
        } else if (this.wx && this.wx.reportAnalytics) {
            this.wx.reportAnalytics(event, resObj);
        }
    }

    getUpdateManager() {
        if (!this.wx || !this.wx.getUpdateManager) return;
        const updateManager = this.wx.getUpdateManager();
        updateManager.onUpdateReady(() => {
            this.wx.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启应用？",
                success: (res: any) => {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    }
                }
            });
        });
    }

    directCallback(call: Function) {
        if (this.coldLaunchOptions && this.coldLaunchOptions.scene === 1387) {
            call && call();
        }
    }

    public validate() {
        if (!this.wx) return;
        const wx_chan_type = Number(localStorage.getItem("wx_chan_type") || "3");
        if (wx_chan_type == 3) {
            const wx_z_open_id = localStorage.getItem("wx_z_open_id") || "";
            if (!wx_z_open_id || wx_z_open_id === "undefined" || wx_z_open_id === "null") {
                this.wx.login({
                    success: (res: any) => {
                        if (res.code) {
                            this.wx.request({
                                url: "https://wxgames.zywxgames.com/api/wx",
                                data: {
                                    app_id: SDK_config.GameIdConfig.weixinID.appId,
                                    code: res.code
                                },
                                success: (resp: any) => {
                                    const data = resp.data || {};
                                    if ((data.code ?? 0) === 1) {
                                        if (data.open_id) {
                                            this.sdk && this.sdk.setOpenId && this.sdk.setOpenId(data.open_id);
                                            localStorage.setItem("wx_z_open_id", data.open_id);
                                        } else if (data.union_id) {
                                            this.sdk && this.sdk.setUnionId && this.sdk.setUnionId(data.union_id);
                                        }
                                        if ((data.is_new ?? 0) === 1) {
                                            this.sdk && this.sdk.onRegister && this.sdk.onRegister();
                                        } else if ((data.days ?? 0) > 7) {
                                            this.sdk && this.sdk.track && this.sdk.track("RE_ACTIVE", { backFlowDay: 7 });
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                this.lastUser(wx_z_open_id);
            }
        } else {
            const wx_open_id = localStorage.getItem("wx_open_id") || "";
            if (!wx_open_id || wx_open_id === "undefined" || wx_open_id === "null") {
                this.wx.login({
                    success: (res: any) => {
                        if (!res.code) return;
                        WxHttpUpBehavior.wx_code = res.code;
                        if (SDK_config.openMaiLiang) {
                            WxHttpUpBehavior.getInstance().onInit();
                        }
                        const wx_open_id1 = localStorage.getItem("wx_open_id") || "";
                        const is_new = Number(localStorage.getItem("is_new") || "0");
                        const days = Number(localStorage.getItem("days") || "0");
                        const wx_z_open_id = localStorage.getItem("wx_z_open_id") || "";
                        if (!wx_z_open_id || wx_z_open_id === "undefined" || wx_z_open_id === "null") {
                            this.wx.request({
                                url: "https://wxgames.zywxgames.com/api/wx",
                                data: {
                                    app_id: SDK_config.GameIdConfig.weixinID.appId,
                                    code: res.code,
                                    open_id: wx_open_id1
                                }
                            });
                            localStorage.setItem("wx_z_open_id", wx_open_id1);
                        }
                        if (is_new === 1) {
                            this.sdk && this.sdk.onRegister && this.sdk.onRegister();
                        }
                        if (days > 7) {
                            this.sdk && this.sdk.track && this.sdk.track("RE_ACTIVE", { backFlowDay: 7 });
                        }
                        this.sdk && this.sdk.setOpenId && this.sdk.setOpenId(wx_open_id1);
                    }
                });
            } else {
                this.lastUser(wx_open_id);
                if (SDK_config.openMaiLiang) {
                    WxHttpUpBehavior.getInstance().lastUserTime();
                }
            }
        }
    }

    private lastUser(open_id: string) {
        if (!this.wx) return;
        if (this.sdk && this.sdk.setOpenId) {
            this.sdk.setOpenId(open_id);
        }
        this.wx.request({
            url: "https://wxgames.zywxgames.com/api/wx/lastUser",
            data: {
                app_id: SDK_config.GameIdConfig.weixinID.appId,
                open_id: open_id
            },
            success: (res: any) => {
                const data = res.data || {};
                if ((data.code ?? 0) === 1) {
                    if ((data.is_new ?? 0) === 1) {
                        this.sdk && this.sdk.onRegister && this.sdk.onRegister();
                    } else if ((data.days ?? 0) > 7) {
                        this.sdk && this.sdk.track && this.sdk.track("RE_ACTIVE", { backFlowDay: 7 });
                    }
                }
            }
        });
    }

    public upSdk() {
        const wx_chan_type = Number(localStorage.getItem("wx_chan_type") || "3");
        if (wx_chan_type == 3) {
            return localStorage.getItem("wx_z_open_id") || "";
        }
        return localStorage.getItem("wx_open_id") || "";
    }

    decryptData(encryptedData: any, iv: string) {
        if (!this.wx) return;
        this.wx.checkSession({
            success: () => {
                if (SDK_config.openMaiLiang) {
                    WxHttpUpBehavior.getInstance().ecpm(encryptedData, iv);
                }
            },
            fail: () => {
                this.wx.login({
                    success: (res: any) => {
                        if (res.code) {
                            WxHttpUpBehavior.wx_code = res.code;
                            if (SDK_config.openMaiLiang) {
                                WxHttpUpBehavior.getInstance().jsCodeSession();
                                WxHttpUpBehavior.getInstance().ecpm(encryptedData, iv);
                            }
                        }
                    }
                });
            }
        });
    }
}