// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import { PlatformsInterface } from "./PlatformsInterface";
import SDK_config, { Platform } from "../../SDK_config";
// import vivoH5GameAPI from "./vivoH5GameAPI/vivoGameAPI";
// import hwH5GameAPI from "./huaweiH5GameAPI/hwH5GameAPI";
// import oppoH5GameAPI from "./oppoH5GameAPI/oppoGameAPI";
import toutiaoH5GameAPI from "./toutiaoH5GameAPI/toutiaoH5GameAPI";
import wxH5GameAPI from "./wxH5GameAPI/wxH5GameAPI";

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
    public onInit(_callback: Function = null, mainUICanvasNode: cc.Node = null, uigroup: any = null) {
        console.log("quickgame init");


        if (!this.hasinit) {
            this.hasinit = true;

            switch (this.platform) {


                // case Platform.huawei_H5:

                //     this.platformAPI=new  hwH5GameAPI()

                //     break;
                case Platform.vivo_H5:

                    // this.platformAPI = new vivoH5GameAPI();

                    break;
                case Platform.oppo_H5:

                    // this.platformAPI = new oppoH5GameAPI()

                    break;
                case Platform.toutiao_H5:

                    this.platformAPI = new toutiaoH5GameAPI()

                    break;
                case Platform.weixin_H5:

                    this.platformAPI = new wxH5GameAPI()

                    break;
                default:
                    break
            }
            if (this.platformAPI && this.platformAPI !== null) {
                this.platformAPI.onInit(_callback);
            }
        }



    }

    public SetCustomAd(h: number, isShow: boolean = false) {
        this.platformAPI && this.platformAPI.SetCustomAd(h, isShow);
    }
    public SetCustomAd1(h: number, isShow: boolean = false, isSmall: boolean = false) {
        this.platformAPI && this.platformAPI.SetCustomAd1(h, isShow, isSmall);
    }

    public hideMoreGames() {
        this.platformAPI && this.platformAPI.hideMoreGames();
    }
    public showInsertAd1(_arg?: any) {
        this.platformAPI && this.platformAPI.showInsertAd1();
    }
    public showCustomAd(_arg?: any) {
        this.platformAPI && this.platformAPI.showCustomAd();
    }
    public hideCustomAd(_arg?: any) {
        this.platformAPI && this.platformAPI.hideCustomAd();
    }

    public showShareMenu(_arg?: any) {
        this.platformAPI && this.platformAPI.showShareMenu();
    }
    public hideShareMenu(_arg?: any) {
        this.platformAPI && this.platformAPI.hideShareMenu();
    }

    public showMoreGames(_arg?: any) {
        this.platformAPI && this.platformAPI.showMoreGames();
    }
    public showLetter(_arg?: any) {
        this.platformAPI && this.platformAPI.showLetter();
    }
    public OPPOBannerNativeAd(_arg?: any) {
        this.platformAPI && this.platformAPI.OPPOBannerNativeAd();
    }
    public OPPOHighONativeAd(styleid: number) {
        this.platformAPI && this.platformAPI.OPPOHighONativeAd(styleid);
    }
    public OPPShortONativeAd(_arg?: any) {
        this.platformAPI && this.platformAPI.OPPShortONativeAd();
    }
    public HidecustomAD(_arg?: any) {
        this.platformAPI && this.platformAPI.HidecustomAD();
    }
    public HidecustomBAD(_arg?: any) {
        this.platformAPI && this.platformAPI.HidecustomBAD();
    }
    public share(_callback: Function) {
        this.platformAPI && this.platformAPI.share(_callback);
    }

    public showBanner(_arg?: any) {
        this.platformAPI && this.platformAPI.showBanner(_arg);
    }
    public showVivoNativeAD(_arg?: any) {
        this.platformAPI && this.platformAPI.showVivoNativeAD(_arg);
    }
    public showVivoNativeBannerAD(_arg?: any) {
        this.platformAPI && this.platformAPI.showVivoNativeBannerAD(_arg);
    }
    public showVivoNativeAD1(_arg?: any) {
        this.platformAPI && this.platformAPI.showVivoNativeAD1(_arg);
    }
    public showVivoNativeAD2(_arg?: any) {
        this.platformAPI && this.platformAPI.showVivoNativeAD2(_arg);
    }
    public showVivoNativeAD3(_arg?: any) {
        this.platformAPI && this.platformAPI.showVivoNativeAD3(_arg);
    }
    public showVivoNativeBannerAD1(_arg?: any) {
        this.platformAPI && this.platformAPI.showVivoNativeBannerAD1(_arg);
    }
    public hideVivoNativeBannerAD(_arg?: any) {
        this.platformAPI && this.platformAPI.hideVivoNativeBannerAD(_arg);
    }
    public hideBanner() {
        this.platformAPI && this.platformAPI.hideBanner();
    }
    public exitgame(res) {
        this.platformAPI && this.platformAPI.exitgame(res);
    }
    public showInsertAd(_arg?: any) {
        this.platformAPI && this.platformAPI.showInsertAd();
    }
    public hideInsertNativeAd() {
        this.platformAPI && this.platformAPI.hideInsertNativeAd();
    }

    public showVideo(_successCallback: Function, _failCallback?: Function, _showCallback?: any, _closeCallback?: any) {
        //    _successCallback && _successCallback()
        if (cc.sys.isBrowser) { _successCallback && _successCallback() }
        this.platformAPI && this.platformAPI.showVideo(_successCallback, _failCallback, _showCallback, _closeCallback);
    }
    public createNative(callback, nativeid = null) {
        this.platformAPI && this.platformAPI.createNative(callback, nativeid);
    }

    public onNativeAdClick(id: string) {
        this.platformAPI && this.platformAPI.onNativeAdClick(id);
    }
    public saveDataToCache(_key: string, _value: any) {
        this.platformAPI && this.platformAPI.saveDataToCache(_key, _value);
    }
    public readDataFromCache(_key: string) {
        this.platformAPI && this.platformAPI.readDataFromCache(_key);
    }
    public hasShortcutInstalled(_callback: Function) {
        this.platformAPI && this.platformAPI.hasShortcutInstalled(_callback);
    }
    public addDesktop(_callback: Function) {
        this.platformAPI && this.platformAPI.addDesktop(_callback);
    }
    public shareVideo(_successCallback: Function, _failCallback: Function) {
        this.platformAPI && this.platformAPI.shareVideo(_successCallback, _failCallback);
    }
    public startRecordScreen() {
        this.platformAPI && this.platformAPI.startRecordScreen();
    }
    public stopRecordScreen() {
        this.platformAPI && this.platformAPI.stopRecordScreen();
    }

    public sendMessage(key: string, value: any) {
        this.platformAPI && this.platformAPI.sendMessage(key, value);
    }
    public showToast(message: string) {
        this.platformAPI && this.platformAPI.showToast(message);
    }
    public networkType(): boolean {
        return this.platformAPI && this.platformAPI.networkType();
    }
}
