// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import { PlatformsInterface } from "./PlatformsInterface_newsdk";
import SDK_config, { Platform } from "../../SDK_config_newsdk";
import vivoH5GameAPI from "./vivoH5GameAPI/vivoGameAPI_newsdk";
import hwH5GameAPI from "./huaweiH5GameAPI/hwH5GameAPI_newsdk";
import oppoH5GameAPI from "./oppoH5GameAPI/oppoGameAPI_newsdk";
import toutiaoH5GameAPI from "./toutiaoH5GameAPI/toutiaoH5GameAPI_newsdk";
import ryH5GameAPI from "./ryH5GameAPI/ryH5GameAPI_newsdk";
import TTGameAPI_newsdk from "./wx_dy_ks/TTGameAPI_newsdk";
import WXGameAPI_newsdk from "./wx_dy_ks/WXGameAPI_newsdk";
import KSGameAPI_newsdk from "./wx_dy_ks/KSGameAPI_newsdk";


const { ccclass, property } = cc._decorator;
// export enum Platform {
//     baidu_H5 = 1,
//     oppo_H5,
//     qqplay_H5,
//     toutiao_H5,
//     vivo_H5,
//     weixin_H5,
//     x4399_H5,
//     xiaomi_H5,
//     huawei_H5,

// }
@ccclass
export default class Platforms_QuickGame {



    private static mInstance: Platforms_QuickGame = null;
    private hasinit: boolean = false;
    public platformAPI = null;
    public platform: Platform = SDK_config.platform;
    public static getInstance(): Platforms_QuickGame {
        if (this.mInstance === null) {
            this.mInstance = new Platforms_QuickGame();
        }
        return this.mInstance;
    }
    private constructor() {
        console.log('Platforms_QuickGame:constructor');
        window['Platforms_QuickGame'] = this;
    }
    public onInit(_callback: ()=>void , mainUICanvasNode: cc.Node = null, uigroup: any = null) {
        console.log("quickgame init");
        if (!this.hasinit) {
            this.hasinit = true;

            switch (this.platform) {

                case Platform.ry_H5:

                    this.platformAPI = new ryH5GameAPI()

                    break;
                case Platform.huawei_H5:

                    this.platformAPI = new hwH5GameAPI()

                    break;
                case Platform.vivo_H5:

                    this.platformAPI = new vivoH5GameAPI();

                    break;
                case Platform.oppo_H5:

                    this.platformAPI = new oppoH5GameAPI()

                    break;
                case Platform.toutiao_H5:
                    this.platformAPI = TTGameAPI_newsdk.getInstance();
                    break;
                case Platform.weixin_H5:
                    this.platformAPI = WXGameAPI_newsdk.getInstance();
                    break;
                case Platform.ks:
                    this.platformAPI = KSGameAPI_newsdk.getInstance();
                    break;
                 


                default:
                    break
            }
            if (this.platformAPI && this.platformAPI !== null) {
                this.platformAPI.onInit(_callback);
            }else{

                _callback&&_callback();
            }
        }



    }

    showModal(title: string, content: string, confirmText: string, cancelText: string, _successCallback: Function, _failCallback: Function) {
        if (this.platformAPI && this.platformAPI.showModal) {
            this.platformAPI.showModal(title, content, confirmText, cancelText, _successCallback, _failCallback);
        }
    }
    /**新插屏方法 */
    private invokePlatform(method: string, ...args: any[]) {
        const fn = this.platformAPI && this.platformAPI[method];
        if (typeof fn === "function") {
            return fn.apply(this.platformAPI, args);
        }
        return undefined;
    }
    public showCommonInsert(_arg?: any,_successCallback?,falseCallback?,adtype?) {
        if (!this.platformAPI) return;
        if (this.platformAPI.showCommonInsert) {
            this.platformAPI.showCommonInsert(_arg,_successCallback,falseCallback,adtype);
            return;
        }
        if (this.platformAPI.showInsertAd) {
            this.platformAPI.showInsertAd(_arg,_successCallback,falseCallback,adtype);
        }
    }
    public showBanner(_arg?: any) {
        this.platformAPI && this.platformAPI.showBanner(_arg);
    }

   
    public showCommonVideo(_arg:string,_successCallback: () => void, _failCallback?) {
        if (!this.platformAPI) return;
        if (this.platformAPI.showCommonVideo) {
            this.platformAPI.showCommonVideo(_arg,_successCallback, _failCallback);
            return;
        }
        if (this.platformAPI.showRewardVideo) {
            this.platformAPI.showRewardVideo(_successCallback, _failCallback);
            return;
        }
        if (this.platformAPI.showVideo) {
            this.platformAPI.showVideo(_successCallback, _failCallback);
        }
    }

     /**新原生方法 */
    showCommonNative(_arg) {
        this.invokePlatform("showCommonNative", _arg);
    }
    public showLetter(_arg?: any) {
        this.invokePlatform("showLetter", _arg);
    }
    public OPPOBannerNativeAd(_arg?: any) {
        this.invokePlatform("OPPOBannerNativeAd", _arg);
    }
    public OPPOHighONativeAd(styleid: number) {
        this.invokePlatform("OPPOHighONativeAd", styleid);
    }
    public OPPShortONativeAd(_arg?: any) {
        this.invokePlatform("OPPShortONativeAd", _arg);
    }
    public HidecustomAD(_arg?: any) {
        this.invokePlatform("HidecustomAD", _arg);
    }
    public HidecustomBAD(_arg?: any) {
        this.invokePlatform("HidecustomBAD", _arg);
    }

    public share(_callback: Function) {
        this.invokePlatform("share", _callback);
    }


    public showVivoNativeAD(_arg?: any) {
        this.invokePlatform("showVivoNativeAD", _arg);
    }
    public showVivoNativeBannerAD(_arg?: any) {
        this.invokePlatform("showVivoNativeBannerAD", _arg);
    }
    public showVivoNativeAD1(_arg?: any) {
        this.invokePlatform("showVivoNativeAD1", _arg);
    }
    public showVivoNativeAD2(_arg?: any) {
        this.invokePlatform("showVivoNativeAD2", _arg);
    }
    public showVivoNativeBannerAD1(_arg?: any) {
        this.invokePlatform("showVivoNativeBannerAD1", _arg);
    }
    public hideVivoNativeBannerAD(_arg?: any) {
        this.invokePlatform("hideVivoNativeBannerAD", _arg);
    }

    public hideBanner() {
        this.platformAPI && this.platformAPI.hideBanner();
    }
    public openYSZC() {
        this.invokePlatform("openYSZC");
    }
    public exitgame(res) {
        this.invokePlatform("exitgame", res);
    }
    public showInsertAd(_arg?: any) {
        this.platformAPI && this.platformAPI.showInsertAd && this.platformAPI.showInsertAd();
    
    }
    public showInsertAd1(_arg?: any) {
        this.invokePlatform("showInsertAd1", _arg);
    }
    public hideInsertNativeAd() {
        this.invokePlatform("hideInsertNativeAd");
    }

    public showVideo(_successCallback: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
        if (!this.platformAPI) return;
        if (this.platformAPI.showVideo) {
            this.platformAPI.showVideo(_successCallback, _failCallback, _showCallback, _closeCallback);
            return;
        }
        if (this.platformAPI.showRewardVideo) {
            this.platformAPI.showRewardVideo(_successCallback, _failCallback, _showCallback, _closeCallback);
            return;
        }
        _successCallback && _successCallback();
    }
    public createNative(callback, nativeid = null) {
        this.invokePlatform("createNative", callback, nativeid);
    }
    public createVideo() {
        this.invokePlatform("createVideo");
    }

    public onNativeAdClick(id: string) {
        this.platformAPI && this.platformAPI.onNativeAdClick && this.platformAPI.onNativeAdClick(id);
    }
    public saveDataToCache(_key: string, _value: any) {
        if (this.platformAPI && this.platformAPI.saveDataToCache) {
            this.platformAPI.saveDataToCache(_key, _value);
            return;
        }
        localStorage.setItem(_key, JSON.stringify(_value));
    }
    public readDataFromCache(_key: string) {
        if (this.platformAPI && this.platformAPI.readDataFromCache) {
            return this.platformAPI.readDataFromCache(_key);
        }
        const value = localStorage.getItem(_key);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }
    public hasShortcutInstalled(_callback: Function) {
        if (this.platformAPI && this.platformAPI.hasShortcutInstalled) {
            this.platformAPI.hasShortcutInstalled(_callback);
            return;
        }
        _callback && _callback(false);
    }
    public addDesktop(_callback: Function) {
        if (this.platformAPI && this.platformAPI.addDesktop) {
            this.platformAPI.addDesktop(_callback);
            return;
        }
        if (this.platformAPI && this.platformAPI.AddDeskTop) {
            this.platformAPI.AddDeskTop(_callback);
            return;
        }
        _callback && _callback();
    }
    public shareVideo(_successCallback: Function, _failCallback: Function) {
        if (this.platformAPI && this.platformAPI.shareVideo) {
            this.platformAPI.shareVideo(_successCallback, _failCallback);
            return;
        }
        if (this.platformAPI && this.platformAPI.showRewardVideo) {
            this.platformAPI.showRewardVideo(_successCallback, _failCallback);
            return;
        }
        _successCallback && _successCallback();
    }
    public startRecordScreen() {
        this.platformAPI && this.platformAPI.startRecordScreen && this.platformAPI.startRecordScreen();
    }
    public stopRecordScreen() {
        this.platformAPI && this.platformAPI.stopRecordScreen && this.platformAPI.stopRecordScreen();
    }

    public sendMessage(key: string, value: any) {
        this.invokePlatform("sendMessage", key, value);
    }
    public showToast(message: string) {
        this.invokePlatform("showToast", message);
    }

}
