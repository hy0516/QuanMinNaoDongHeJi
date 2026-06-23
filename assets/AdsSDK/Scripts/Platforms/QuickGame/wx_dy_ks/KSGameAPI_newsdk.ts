import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import Apis from "./PlatformOptions";
import KsHttpUpBehavior from "./KsHttpUpBehavior";
import SDK_config from "../../../SDK_config_newsdk";

export default class KSGameAPI_newsdk implements PlatformsInterface {
    ks: any = window["ks"];
    _CP:string = "KS";
    _PKG_str = "com.游戏名.ks";
    bannerAd: any = null;
    interstitialAd: any = null;
    rewardedVideoAd: any = null;
    windowWidth = 0;
    windowHeight = 0;
    systemInfo: any = null;
    coldLaunchOptions: any = null;
    private videoSuccessCallback: Function | null = null;
    private videoFailCallback: Function | null = null;
    completeWatchVideoCallback: Function | undefined = undefined;
    KSSceneId = "";
    private static m_inst: KSGameAPI_newsdk | null = null;

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

    public static getInstance(): KSGameAPI_newsdk {
        if (KSGameAPI_newsdk.m_inst == null) {
            KSGameAPI_newsdk.m_inst = new KSGameAPI_newsdk();
        }
        return KSGameAPI_newsdk.m_inst;
    }

    private constructor() {
        this.onInit(() => { });
    }

    onInit(_callback: Function) {
        if (!this.ks) {
            _callback && _callback();
            return;
        }

        this.coldLaunchOptions = Apis.getInstance().coldLaunchOptions || (this.ks.getLaunchOptionsSync ? this.ks.getLaunchOptionsSync() : { query: {} });
        const query = this.coldLaunchOptions.query || {};
        this.KSSceneId = (this.coldLaunchOptions.from || query.from || "").toString();

        this.getChannelOptions(query);

        this.systemInfo = Apis.getInstance().systemInfo || (this.ks.getSystemInfoSync ? this.ks.getSystemInfoSync() : null);
        if (this.systemInfo) {
            this.windowWidth = this.systemInfo.windowWidth || this.systemInfo.screenWidth || 0;
            this.windowHeight = this.systemInfo.windowHeight || this.systemInfo.screenHeight || 0;
        }

        this.createBannerAd();
        this.onLogin();
        _callback && _callback();
    }

    private getChannelOptions(query: any) {
        if (query.callback != null && query.callback != undefined) {
            localStorage.setItem("ks_callback", query.callback);
            localStorage.setItem("ks_campaign_id", query.campaign_id || "");
            localStorage.setItem("ks_unit_id", query.unit_id || "");
            localStorage.setItem("ks_account_id", query.account_id || "");
        }
    }

    private onLogin() {
        if (!this.ks) return;
        this.ks.checkSession({
            success: () => {
                if (SDK_config.openMaiLiang) {
                    KsHttpUpBehavior.getInstance().onInit();
                }
            },
            fail: () => {
                this.ks.login({
                    success: (res: any) => {
                        localStorage.setItem("ks_code", res.code || "");
                        if (SDK_config.openMaiLiang) {
                            KsHttpUpBehavior.getInstance().onInit();
                        }
                    },
                    fail: (err: any) => {
                        console.error("ks login failed", err);
                    }
                });
            }
        });
    }

    private getBannerId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.kuaishouID.bannerAdId as any);
    }

    private getVideoId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.kuaishouID.rewardedVideoAdId as any);
    }

    private getInsertId(): string {
        return this.pickFirstId(SDK_config.GameIdConfig.kuaishouID.InsertAdId as any);
    }

    private getInsertIdByIndex(index: number): string {
        const ids = SDK_config.GameIdConfig.kuaishouID.InsertAdId;
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
    }

    createBannerAd() {
        if (!this.ks || this.bannerAd) return;
        const adUnitId = this.getBannerId();
        if (!adUnitId || !this.ks.createBannerAd) return;

        this.bannerAd = this.ks.createBannerAd({
            adUnitId: adUnitId,
            adIntervals: 30,
            style: {
                top: Math.floor(this.windowHeight * 0.9),
                left: Math.floor(this.windowWidth * 0.1),
                width: Math.floor(this.windowWidth * 0.8)
            }
        });

        this.bannerAd.onError((err: any) => {
            console.error("ks banner error", err);
            this.destroyBanner();
        });
        this.bannerAd.onLoad(() => { });
        this.bannerAd.onClose(() => {
            this.destroyBanner();
        });
    }

    showBanner(_arg?: any) {
        if (!this.ks) return;
        if (!this.bannerAd) {
            this.createBannerAd();
        }
        if (this.bannerAd && this.bannerAd.show) {
            this.bannerAd.show().catch((err: any) => {
                console.error("ks banner show failed", err);
            });
        }
    }

    hideBanner() {
        if (this.bannerAd && this.bannerAd.hide) {
            this.bannerAd.hide();
        }
    }

    showModal(title: string, content: string, confirmText: string, cancelText: string, _successCallback: Function, _failCallback: Function) {
        if (!this.ks || !this.ks.showModal) {
            _successCallback && _successCallback();
            return;
        }
        this.ks.showModal({
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
            if (!this.ks || !this.ks.createRewardedVideoAd) {
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

            this.rewardedVideoAd = this.ks.createRewardedVideoAd({ adUnitId: adUnitId });
            this.rewardedVideoAd.onLoad(() => resolve());
            this.rewardedVideoAd.onError((err: any) => reject(err));
            this.rewardedVideoAd.onClose((res: any) => {
                if ((res && res.isEnded) || res === undefined) {
                    if (SDK_config.openMaiLiang) {
                        KsHttpUpBehavior.getInstance().videoUpdate();
                    }
                    this.videoSuccessCallback && this.videoSuccessCallback();
                    this.completeWatchVideoCallback && this.completeWatchVideoCallback();
                } else {
                    this.videoFailCallback && this.videoFailCallback();
                }
                this.rewardedVideoAd.destroy && this.rewardedVideoAd.destroy();
                this.rewardedVideoAd = null;
            });
        });
    }

    showVideo(_successCallback?: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
        if (!this.ks) {
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
                console.error("ks video show failed", err);
                _failCallback && _failCallback();
            });
        };

        this.createVideoAd().then(play).catch((err) => {
            console.error("ks video create failed", err);
            _failCallback && _failCallback();
        });
    }

    showInsertAd(_arg?: any, callBack?: Function) {
        if (!this.ks || !this.ks.createInterstitialAd) {
            callBack && callBack();
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
            // callBack && callBack();
            return;
        }

        if (this.interstitialAd) {
            this.interstitialAd.destroy && this.interstitialAd.destroy();
            this.interstitialAd = null;
        }

        this.interstitialAd = this.ks.createInterstitialAd({ adUnitId: adUnitId });
        this.interstitialAd.onError((err: any) => {
            console.error("ks interstitial error", err);
        });
        this.interstitialAd.onClose(() => {
            this.interstitialAd.destroy && this.interstitialAd.destroy();
            this.interstitialAd = null;
            // callBack && callBack();
        });
        this.interstitialAd.show()
        .then(()=>{
            callBack && callBack();
        })
        .catch((err: any) => {
            console.error("ks interstitial show failed", err);
            // callBack && callBack();
        });
    }

    share(_callback: Function) {
        if (!this.ks || !this.ks.shareAppMessage) {
            _callback && _callback();
            return;
        }
        this.ks.shareAppMessage({
            success: () => {
                _callback && _callback();
            },
            fail: (err: any) => {
                console.error("ks share failed", err);
            }
        });
    }

    hasShortcutInstalled(_callback: Function) {
        if (!this.ks || !this.ks.hasShortcutInstalled) {
            _callback && _callback(false);
            return;
        }
        this.ks.hasShortcutInstalled({
            success: (res: any) => _callback && _callback(!!res.installed),
            fail: () => _callback && _callback(false)
        });
    }

    addDesktop(_callback?: Function) {
        if (!this.ks || !this.ks.addShortcut) {
            _callback && _callback();
            return;
        }
        this.ks.addShortcut({
            success: () => {
                _callback && _callback();
            },
            fail: (err: any) => {
                console.error("ks addShortcut failed", err);
                _callback && _callback();
            }
        });
    }

    checkCommonUse() {
        if (!this.ks || !this.ks.checkCommonUse) return;
        this.ks.checkCommonUse({
            success: (res: any) => {
                localStorage.setItem("isCommonUse", res.isCommonUse ? "true" : "false");
            },
            fail: () => {
                localStorage.setItem("isCommonUse", "true");
            }
        });
    }

    addCommonUse(_successCallback: Function, _failCallback?: Function) {
        if (!this.ks || !this.ks.addCommonUse) {
            _successCallback && _successCallback();
            return;
        }
        this.ks.addCommonUse({
            success: () => {
                _successCallback && _successCallback();
            },
            fail: (err: any) => {
                console.error("ks addCommonUse failed", err);
                _failCallback && _failCallback();
            }
        });
    }

    jumpToGameClub() {
        if (!this.ks || !this.ks.jumpToGameClub) return;
        this.ks.jumpToGameClub({
            success: () => { },
            fail: (err: any) => {
                console.error("ks jumpToGameClub failed", err);
            }
        });
    }

    reportAnalytics(eventName: string, params: any) {
        if (this.ks && this.ks.reportAnalytics) {
            this.ks.reportAnalytics(eventName, params);
        }
        if (SDK_config.openMaiLiang) {
            KsHttpUpBehavior.getInstance().eventInfo(eventName, JSON.stringify(params || {}), "");
        }
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

    shareVideo(_successCallback: Function, _failCallback: Function) {
        this.showVideo(_successCallback, _failCallback);
    }

    vibrate(long?: boolean) {
        if (!this.ks) return;
        if (long && this.ks.vibrateLong) {
            this.ks.vibrateLong({ fail: () => { } });
        } else if (this.ks.vibrateShort) {
            this.ks.vibrateShort({ fail: () => { } });
        }
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

    showBannerAd() {
        this.showBanner();
    }

    hideBannerAd() {
        this.hideBanner();
    }

    createNative(callback: any, nativeid: any) {
        callback && callback();
    }

    onNativeAdClick(_id: string) { }
    showMoreGames() { }
    startRecordScreen() { }
    stopRecordScreen() { }
    sendMessage(key: string, value: any) {
        this.reportAnalytics(key, { value });
    }
    hideInsertNativeAd() { }
    jumpToGame(_packageName: string) { }
    getSideBarUsable() { return false; }
    setLaunchFromDeskTopCallback(_callBack: Function) { }
    setLaunchFromSideBarCallback(_callBack: Function) { }
    setCompleteWatchVideoCallback(callBack: Function) {
        this.completeWatchVideoCallback = callBack;
    }

    public get LaunchSceneId(): string {
        return this.KSSceneId;
    }
}
