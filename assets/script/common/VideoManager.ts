import Ads_Manager from "../../AdsSDK/Scripts/Ads_Manager";
import Platforms_QuickGame from "../SDK/Platforms/QuickGame/Platforms_QuickGame";
import SDKTool from "../SDK/Tool/SDKTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VideoManager {

    private static ins: VideoManager
    public static getInstance() {
        if (this.ins == null) {
            this.ins = new VideoManager();
        }
        return this.ins;
    }



    // TODO 看视频 统一调用
    public showVideo(succCb, failCb?) {
        if (cc.sys.isBrowser) {
            console.log(" 看视频 统一调用 ");
        }
        if (SDKTool.isDeubg) {
            console.log(" 看视频 统一调用,debug模式不弹视频 ");
            succCb && succCb();
            return;
        }
        Ads_Manager.Ins.ShowVideo("", succCb,failCb);
    }

    report(key: string, value: Object) {
        if (window["tt"]) {
            window["tt"].reportAnalytics(key, value);
        } else {
            console.log("上报：" + key);
        }
    }

    showCustomNativeAd() {
        Ads_Manager.Ins.showCommonInsert();
    }
    /**
     * 弹插屏
     */
    public showInsert() {
        Ads_Manager.Ins.showCommonInsert();
        // console.log(" 弹插屏,统一调用 ");
    }
    /**
       * 弹宝箱
       */
    public showBaoXiang() {
        console.log(" 弹宝箱,统一调用 ");
    }

}
