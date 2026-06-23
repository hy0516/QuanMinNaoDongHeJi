import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import Apis from "./PlatformOptions";
import DyHttpUpBehavior from "./DyHttpUpBehavior";
import SDK_config from "../../../SDK_config_newsdk";

type ShareResult = {
    title?: string;
    imageUrl?: string;
    imageUrlId?: string;
};

export default class TTGameAPI_newsdk implements PlatformsInterface {
    tt: any = window["tt"];
    bannerAd: any = null;
    interstitialAd: any = null;
    rewardedVideoAd: any = null;
    windowWidth = 0;
    windowHeight = 0;
    systemInfo: any = null;
    videoSuccessCallback: Function | null = null;
    videoFailCallback: Function | null = null;
    m_bannerAdIsLoaded = false;
    private static m_inst: TTGameAPI_newsdk | null = null;

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

    public static getInstance(): TTGameAPI_newsdk {
        if (TTGameAPI_newsdk.m_inst == null) {
            TTGameAPI_newsdk.m_inst = new TTGameAPI_newsdk();
        }
        return TTGameAPI_newsdk.m_inst;
    }

    private constructor() {
        this.onInit(() => { });
    }

    onInit(_callback: Function) {
        if (!this.tt) {
            _callback && _callback();
            return;
        }

        this.systemInfo = Apis.getInstance().systemInfo || (this.tt.getSystemInfoSync ? this.tt.getSystemInfoSync() : null);
        if (this.systemInfo) {
            this.windowWidth = this.systemInfo.windowWidth || this.systemInfo.screenWidth || 0;
            this.windowHeight = this.systemInfo.windowHeight || this.systemInfo.screenHeight || 0;
        }

        const launchOption = Apis.getInstance().coldLaunchOptions || (this.tt.getLaunchOptionsSync ? this.tt.getLaunchOptionsSync() : { query: {} });
        const query = launchOption.query || {};
        this.saveLaunchParams(query);

        this.onLogin();
        _callback && _callback();
    }

    private saveLaunchParams(query: any) {
        if (query.clickid != null && query.clickid != undefined) {
            localStorage.setItem("dy_click_id", query.clickid);
            localStorage.setItem("dy_projectid", query.projectid || "");
            localStorage.setItem("dy_promotionid", query.promotionid || "");
            localStorage.setItem("dy_requestid", query.requestid || "");
            localStorage.setItem("wx_chan_type", "1");
            return;
        }

        if (query.callback != null && query.callback != undefined) {
            localStorage.setItem("ks_callback", query.callback);
            localStorage.setItem("ks_campaign_id", query.campaign_id || "");
            localStorage.setItem("ks_unit_id", query.unit_id || "");
            localStorage.setItem("ks_account_id", query.account_id || "");
            localStorage.setItem("wx_chan_type", "2");
            return;
        }

        if (query.ai != null && query.ai != undefined) {
            localStorage.setItem("wx_dy_promotion_id", query.d || "");
            localStorage.setItem("wx_dy_project_id", query.q || "");
            localStorage.setItem("wx_dy_advertiser_id", query.ai || "");
            localStorage.setItem("wx_dy_click_id", query.c || "");
            localStorage.setItem("wx_chan_type", "4");
            return;
        }

        localStorage.setItem("wx_chan_type", "3");
    }

    private onLogin() {
        if (!this.tt) return;
        this.tt.login({
            force: true,
            success: (res: any) => {
                const code = res.isLogin ? (res.code || "") : (res.anonymousCode || "");
                localStorage.setItem("dy_code", code || "");
                localStorage.setItem("dy_is_login", res.isLogin ? "1" : "0");
                if (SDK_config.openMaiLiang) {
                    DyHttpUpBehavior.getInstance().onInit();
                }
            },
            fail: (err: any) => {
                console.error("tt login failed", err);
            }
        });
    }

    private getBannerId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.toutiaoID.bannerAdId as any);
    }

    private getVideoId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.toutiaoID.rewardedVideoAdId as any);
    }

    private getInsertId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.toutiaoID.InsertAdId as any);
    }

    private getInsertIdByIndex(index: number): string {
        const ids = SDK_config.GameIdConfig.toutiaoID.InsertAdId;
        if (Array.isArray(ids)) {
            if (ids[index]) {
                return this.pickFirstId(ids[index] as any);
            }
            return this.pickFirstId(ids[0] as any);
        }
        return this.pickFirstId(ids as any);
    }

    private destroyBanner() {
        if (this.bannerAd) {
            this.bannerAd.destroy && this.bannerAd.destroy();
            this.bannerAd = null;
        }
        this.m_bannerAdIsLoaded = false;
    }

    private createBanner() {
        if (!this.tt || this.bannerAd) return;
        const adUnitId = this.getBannerId();
        if (!adUnitId || !this.tt.createBannerAd) return;

        this.bannerAd = this.tt.createBannerAd({
            adUnitId: adUnitId,
            adIntervals: 30,
            style: {
                width: Math.floor(this.windowWidth * 0.8),
                left: Math.floor(this.windowWidth * 0.1),
                top: Math.floor(this.windowHeight * 0.9)
            }
        });

        this.bannerAd.onLoad(() => {
            this.m_bannerAdIsLoaded = true;
        });
        this.bannerAd.onError((err: any) => {
            console.error("tt banner error", err);
            this.destroyBanner();
        });
        this.bannerAd.onResize((size: any) => {
            if (!this.bannerAd || !size) return;
            this.bannerAd.style.top = this.windowHeight - size.height;
            this.bannerAd.style.left = (this.windowWidth - size.width) / 2;
        });
    }

    showBanner(_arg?: any) {
        if (!this.tt) return;
        if (!this.bannerAd) {
            this.createBanner();
        }
        if (this.bannerAd && this.bannerAd.show) {
            this.bannerAd.show().catch((err: any) => {
                console.error("tt banner show failed", err);
            });
        }
    }

    hideBanner() {
        if (this.bannerAd && this.bannerAd.hide) {
            this.bannerAd.hide();
        }
    }

    showModal(title: string, content: string, confirmText: string, cancelText: string, _successCallback: Function, _failCallback: Function) {
        if (!this.tt || !this.tt.showModal) {
            _successCallback && _successCallback();
            return;
        }
        this.tt.showModal({
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

    private createVideoAd(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.tt || !this.tt.createRewardedVideoAd) {
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

            this.rewardedVideoAd = this.tt.createRewardedVideoAd({ adUnitId });
            this.rewardedVideoAd.onLoad(() => resolve());
            this.rewardedVideoAd.onError((err: any) => reject(err));
            this.rewardedVideoAd.onClose((res: any) => {
                if ((res && res.isEnded) || res === undefined) {
                    if (SDK_config.openMaiLiang) {
                        DyHttpUpBehavior.getInstance().videoUpdate();
                    }
                    this.videoSuccessCallback && this.videoSuccessCallback();
                } else {
                    this.videoFailCallback && this.videoFailCallback();
                }
                this.rewardedVideoAd.destroy && this.rewardedVideoAd.destroy();
                this.rewardedVideoAd = null;
            });
        });
    }

    showVideo(_successCallback?: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
        if (!this.tt) {
            _successCallback && _successCallback();
            return;
        }

        if (!this.getVideoId()) {
            _successCallback && _successCallback();
            return;
        }

        const play = () => {
            if (!this.rewardedVideoAd) {
                _failCallback && _failCallback();
                return;
            }
            this.videoSuccessCallback = _successCallback || null;
            this.videoFailCallback = _failCallback || null;
            this.rewardedVideoAd.show().then(() => {
                _showCallback && _showCallback();
            }).catch((err: any) => {
                console.error("tt video show failed", err);
                _failCallback && _failCallback();
            });
        };

        this.createVideoAd().then(play).catch((err) => {
            console.error("tt video create failed", err);
            _failCallback && _failCallback();
        });
    }

    share(successCallback?: Function) {
        if (!this.tt) {
            successCallback && successCallback();
            return;
        }
        const sharePayload: ShareResult = {
            title: SDK_config.gameName || "share",
        };
        const templateId = SDK_config.GameIdConfig.toutiaoID.share || "";
        if (templateId) {
            this.tt.shareAppMessage({
                templateId,
                query: "",
                ...sharePayload,
                success: () => {
                    successCallback && successCallback();
                },
                fail: (err: any) => {
                    console.error("tt share failed", err);
                }
            });
        } else {
            this.tt.shareAppMessage({
                ...sharePayload,
                success: () => {
                    successCallback && successCallback();
                }
            });
        }
    }

    subscription(successCallback?: Function) {
        if (!this.tt || !this.tt.requestSubscribeMessage) {
            successCallback && successCallback();
            return;
        }
        const tmplId = this.pickFirstId(SDK_config.GameIdConfig.toutiaoID.subscriptionIds as any);
        this.tt.requestSubscribeMessage({
            tmplIds: tmplId ? [tmplId] : [],
            success: (res: any) => {
                successCallback && successCallback(res);
            },
            fail: (err: any) => {
                console.error("tt subscribe failed", err);
            }
        });
    }

    showInsertAd(_arg?: any, callback?: Function) {
        if (!this.tt || !this.tt.createInterstitialAd) {
            callback && callback();
            return;
        }

        let index = 0;
        if (_arg !== undefined && _arg !== null && _arg !== "") {
            const parsed = parseInt(_arg, 10);
            if (!isNaN(parsed) && isFinite(parsed) && parsed >= 0) {
                index = parsed;
            }
        }

        const adUnitId = this.getInsertIdByIndex(index);
        if (!adUnitId) {
            callback && callback();
            return;
        }

        if (this.interstitialAd) {
            this.interstitialAd.destroy && this.interstitialAd.destroy();
            this.interstitialAd = null;
        }

        this.interstitialAd = this.tt.createInterstitialAd({ adUnitId });
        this.interstitialAd.onError((err: any) => {
            console.error("tt interstitial error", err);
        });
        this.interstitialAd.onClose(() => {
            this.interstitialAd.destroy && this.interstitialAd.destroy();
            this.interstitialAd = null;
            callback && callback();
        });
        this.interstitialAd.load().then(() => {
            this.interstitialAd.show().catch((err: any) => {
                console.error("tt interstitial show failed", err);
                callback && callback();
            });
        }).catch((err: any) => {
            console.error("tt interstitial show failed", err);
            callback && callback();
        });
    }

    showCommonInsert(_arg?: any, _successCallback?: Function, falseCallback?: Function, adtype?: any) {
        this.showInsertAd(_arg, _successCallback);
    }

    showCommonNative(_arg?: any, _successCallback?: Function, falseCallback?: Function) {
        _successCallback && _successCallback();
    }

    showCommonVideo(_arg: string, _successCallback: () => void, _failCallback?: () => void) {
        this.showVideo(_successCallback, _failCallback);
    }

    hasShortcutInstalled(_callback: Function) {
        if (!this.tt || !this.tt.hasShortcutInstalled) {
            _callback && _callback(false);
            return;
        }
        this.tt.hasShortcutInstalled({
            success: (res: any) => _callback && _callback(!!res.installed),
            fail: () => _callback && _callback(false)
        });
    }

    addDesktop(_callback: Function) {
        if (!this.tt || !this.tt.addShortcut) {
            _callback && _callback();
            return;
        }
        this.tt.addShortcut({
            success: () => _callback && _callback(),
            fail: (err: any) => {
                console.error("tt addShortcut failed", err);
                _callback && _callback();
            }
        });
    }

    showMoreGames() {
        if (this.tt && this.tt.navigateToScene) {
            this.tt.navigateToScene({ scene: "sidebar" });
        }
    }

    sendMessage(key: string, value: any) {
        this.reportAnalytics(key, { value });
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

    hideInsertNativeAd() { }
    createNative(callback: any, nativeid: any) { callback && callback(); }
    onNativeAdClick(_id: string) { }
    startRecordScreen() { }
    stopRecordScreen() { }
    jumpToGame(_packageName: string) { }
    shareVideo(_successCallback: Function, _failCallback: Function) { this.showVideo(_successCallback, _failCallback); }
    reportAnalytics(eventName: string, data: object) {
        if (this.tt && this.tt.reportAnalytics) {
            this.tt.reportAnalytics(eventName, data);
        }
    }

    getUpdateManager() {
        if (!this.tt || !this.tt.getUpdateManager) return;
        const updateManager = this.tt.getUpdateManager();
        updateManager.onUpdateReady(() => {
            this.tt.showModal({
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

    feedSceneReport(sceneId: number = 7001) {
        if (this.tt && this.tt.reportScene) {
            this.tt.reportScene({
                sceneId: sceneId,
                success: () => { },
                fail: () => { }
            });
        }
    }

    feedPlanExecute(_FeedConfig: any[], defaultCallback?: Function) {
        defaultCallback && defaultCallback();
    }
}
