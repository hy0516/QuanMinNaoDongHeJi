// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdInteface from "../../../Tool/AdInteface_newsdk";
import hwHttpUpBehavior from "./hwHttpUpBehavior_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
var qg: any;

export default class hwInsertAd extends AdInteface {

    private posid: string = null;
    InterstitialAd: any;

    public initData(posid: string) {
        this.posid = posid;
        qg = window["qg"];
    }

    public isReady() {
        return true;
    }
    public show(close_size, cb) {
        console.log("hua wei 没有插屏广告")


        let self = this;
        // 销毁旧广告
        if (this.InterstitialAd) {
            this.InterstitialAd.destroy();
            console.log('销毁旧的插屏广告实例');
        }

        this.InterstitialAd = qg.createInterstitialAd({
            adUnitId: this.posid
        });

        // 加载成功
        this.InterstitialAd.onLoad(() => {

            this.InterstitialAd.show()
            if (SDK_config.openMaiLiang) {
                hwHttpUpBehavior.getInstance().screenUpdate();
            }

            cb && cb("0");
        });

        // 加载失败
        this.InterstitialAd.onError((e) => {
            cb && cb("-1");
            console.log(this.posid + ':插屏广告加载失败 errCode:', e.errCode);
            console.log(this.posid + '插屏广告加载失败 errMsg:', e.errMsg);

        });

        // 关闭广告
        this.InterstitialAd.onClose(() => {
            this.InterstitialAd.destroy();
            this.InterstitialAd = null;

        });

        // 开始加载
        this.InterstitialAd.load();
    }
    public preLoadAd() {

    }



}
