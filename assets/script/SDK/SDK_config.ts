// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
export enum Platform {
    baidu_H5 = 1,
    oppo_H5,
    qqplay_H5,
    toutiao_H5,
    vivo_H5,
    weixin_H5,
    x4399_H5,
    xiaomi_H5,
    huawei_H5,
    android
}
@ccclass
export default class SDK_config {

    /**---------------------------android-------- */
    public static apkConfig = {
        /**
        */
        isHW: false,
        /**
       * banner刷新时间
       * */
        bannerCDTime: 15,
        /**
         * 测试GGtype值，可根据他修改广告策略
         */
        ggType: 3,
    }

    /**---------------------------小游戏配置-------- */
    /** 切换渠道false*/
    public static platform: Platform = Platform.toutiao_H5;

    /** 测试模式，测试广告用，正式的时候设置为false*/
    public static nativeTest: boolean = false;
    /**华为测试包为true，则是华为测试包*/
    public static HWTest: boolean = false;


    public static GameIdConfig = {



        qqplayID: {
            appId: "1110431838",
            bannerAdId: "15fdd021f0fe060f0f56e12e139efe5e",
            rewardedVideoAdId: "c479fd46d147847f80223b5c1768d449",
            InsertAdId: "51ec4f1d84290d0b43d67150044907c8",
            NativeAdId: "",
            NativeAdIconId: "",
        },
        toutiaoID: {
            appId: "tt8bdafd6714e5d3ed02",
            bannerAdId: "h73b5492sej92ahfbk",
            rewardedVideoAdId: "5k41ivupa77171ec47",
            InsertAdId: "45rmlip5sr61hbib89",
            NativeAdId: "",
            NativeAdIconId: "",
        },
        vivoID: {
            appId: "105889700",
            bannerAdId: "28ffbfa31cd641039845dc8a22489205",
            rewardedVideoAdId: "d22f60fab81e4c6993c4779f16e443e7",
            InsertAdId: "79b9901c7932495eb09505c32bc95153",
            NativeAdId: "79b9901c7932495eb09505c32bc95153",
            BNativeAdId: "79b9901c7932495eb09505c32bc95153",
            CNativeAdId: "c434bc1ed61b4f0bb1cdf98661e2e325",
            BlockBoxId: ""

        },
        oppoID: {
            bannerFlushTime: SDK_config.HWTest ? 60 : 30,
            appId: "33098521",
            bannerAdId: "1562661",
            rewardedVideoAdId: "2329468",
            InsertAdId: "",
            NativeAdId: "2329464",
            NativeAdIconId: "2329464",
            ShortCustomAdId: "2329464",
            HighCustomAdId: "2329464",
            BannerCustomAdId: "2329464",
            BlockBoxId: "1910943"
        },
        weixinID: {
            bannerFlushTime: SDK_config.HWTest ? 60 : 30,
            appId: "",
            bannerAdId: "",
            rewardedVideoAdId: "",
            InsertAdId: "",
            NativeAdId: "",
            NativeAdIconId: "",
        },

        /**前面一个testid */
        huaweiID: {

            bannerFlushTime: SDK_config.HWTest ? 60 : 30,
            companyName: '深圳市指点天下科技有限公司',
            gameName: '倒霉先生',

            appId: "104398159",
            bannerAdId: SDK_config.HWTest ? "testw6vs28auh3" : "j5itz6uptk",
            InsertAdId: SDK_config.HWTest ? "" : "a3iloiyl8v",
            NativeAdIconId: SDK_config.HWTest ? "" : "",

            rewardedVideoAdId: SDK_config.HWTest ? "e7hm5vx799" : "y8r527i2hr",
            NativeAdId: SDK_config.HWTest ? "testu7m3hc4gvm" : "z4up0vyhrh",
            NativeSplahId: SDK_config.HWTest ? "testu7m3hc4gvm" : "g79jt3eky7",

        }
    }

}
