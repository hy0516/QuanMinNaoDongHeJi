// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import DebugLog from "../../../FrameWork/Debug/DebugLog_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
import AdInteface from "../../../Tool/AdInteface_newsdk";
import UI_hwNativeAd from "../huaweiH5GameAPI/UI_hwNativeAd_newsdk";

export type bannerConfig={
    bannerX:number,
    bannerY:number,
    bannerSize:number,
    bannerCloseSize?:number
}

var nativeAd: any;
var hbs: any;
export default class hwNativeBanner extends AdInteface  {

 
    private posid: string = null;
    qg :any;
    private screenWidth = 0;
    private screenHeight = 0;
    m_pInfo;
    customAD: any = null;
    public initData(posid: string) {
        this.posid = posid;
        hbs= window["hbs"];
        this.qg= window["qg"]
        this.qg.getSystemInfo({
            success: (data) => {
                this.m_pInfo = data.platformVersionCode;
                this.screenWidth = data.screenWidth;
                this.screenHeight = data.screenHeight;
               
            }
        });
    }

    public isReady() {
        return true;
    }
    id = 0;
    m_nativeBannerAd;
    createNative(callback) {
        let self = this;
        try {

            this.m_nativeBannerAd = this.qg.createNativeAd({
                adUnitId: this.posid,
            });

            console.log('===== rongyaoH5GameAPI createNativeAd Banner =====');
        } catch (error) {
            console.log(error);
        }
    }
    hideadid;

    bindNode;
    public show(bc:bannerConfig,cb:(cbstr:string)=>void) {

        let self=this;

        if (this.m_nativeBannerAd) {
            this.m_nativeBannerAd.load();
            this.m_nativeBannerAd.offLoad();
            this.m_nativeBannerAd.onLoad((res) => {
                if (res && res.adList) {
                    let resTemp = res.adList[res.adList.length - 1];
                    if (resTemp) {
                      
                        // this.hideBanner();
                        console.log('rongyao 原生', resTemp);
                        this.m_nativeBannerAd.reportAdShow({
                            adId: resTemp.adId,
                        });
                    }
                    else {
                        console.log('原生拉取失败');
                        DebugLog.log("-111");
                        cb("-1");
                    }
                }
            });
            this.m_nativeBannerAd.offError();
            this.m_nativeBannerAd.onError((err) => {
                // console.log("===== Native Error: "+ err);
                console.log("===== Native Error: " + err.errCode + "," + err.errMsg);
                DebugLog.log("-111");
                cb("-1");
            })

        }
    }
    onNativeAdClick(_id: string) {
        DebugLog.log("id :" + _id)
      //  HttpUpBehavior.getInstance().adClickUpdate();
      nativeAd&&nativeAd.reportAdClick({
            adId: _id
        });

    }
 
    public preLoadAd() {

    }
    public hide(): void {
       
    }


}
