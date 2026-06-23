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
import UI_hwNativeAd from "./UI_hwNativeAd_newsdk";

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
    qg = window["qg"];

    customAD: any = null;
    public initData(posid: string) {
        this.posid = posid;
        hbs= window["hbs"];
    }

    public isReady() {
        return true;
    }
    id = 0;
    createNative(callback) {
        let self = this;
        try {

            console.log(this.posid);
            if (SDK_config.nativeTest) {
                let res1 = {
                    adId: "9b70dcaa-321f-4114-aa4d-b2630adebfe8" + (this.id++),
                    clickBtnTxt: "点击安装",
                    creativeType: 8,
                    source: "HUAWEI",
                    desc: "蒙古手撕牛肉干降价了",
                    icon: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",
                    iconUrlList: ["http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg"],
                    imgUrlList: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",

                    length: 3,
                    __proto__: Array(0),
                    interactionType: 2,
                    appName:"aaaa",
                    developerName:"bbbb",
                    versionName:"cccc",
                    appDetailUrl:"dddd",
                    privacyUrl:"eeee",
                    permissionUrl:"ffff",

                    logoUrl: "",
                    title: "拼多多",

                }

                let res = {
                    adList: [res1],
                    code: 0,
                    msg: "ok",
                }
                setTimeout(() => {
                    callback(res);
                   
                }, 200 + Math.random() * 300);

                return;
            }


            if (!hbs) {
                console.log("=hbs==不存在");
                setTimeout(() => {
                    callback();
                   
                }, 200 + Math.random() * 300);
              
                return;
            }

            nativeAd = hbs.createNativeAd({
                adUnitId: self.posid,
                // success: (code) => {
                //     console.log("loadNativeAd loadNativeAd : success");
                // },
                // fail: (data, code) => {
                //     console.log("loadNativeAd loadNativeAd fail: " + data + "," + code);
                  
                // },
                // complete: () => {
                //     console.log("loadNativeAd loadNativeAd : complete");
                // }
            });
            let nativeadLoadfun = function (data) {
                console.info('ad data loaded: ' + JSON.stringify(data))
                let adItemData = data.adList[0]

              
                console.log("===adItemData.adId==" + adItemData.adId);
                nativeAd.reportAdShow({
                    adId: adItemData.adId
                });
                callback(data);
            

                nativeAd.offLoad(nativeadLoadfun)

                
            }
            nativeAd.onLoad(nativeadLoadfun);

            let errorfun = function (e) {
                console.error('load ad error:' + JSON.stringify(e));
              
                callback();
             
                nativeAd.offError(errorfun)

              
            }
            nativeAd.onError(errorfun);

            nativeAd.load()


        } catch (error) {
            cc.log(error);
        }
    }
    hideadid;

    bindNode;
    public show(bc:bannerConfig,cb:(cbstr:string)=>void) {

        let self=this;
        this.createNative(function (adres) {
      
            if (adres) {
                self.hideadid=adres.adList[0].adId;

                let del = {
                    onNativeAdClick: self.onNativeAdClick,
                    onReportAdShow: self.onReportAdShow,
                    res: adres,
                    adType: 1,
                    bc:bc,
                }


                UISDK_Manager_newsdk.getInstance().showUI('demo_banner', del, function (pnode) {
                
                    self.bindNode=pnode;
                    pnode.getComponent(UI_hwNativeAd).initLayer(adres);
                   // HttpUpBehavior.getInstance().screenUpdate();
                });

                DebugLog.log("0000");
                cb("0");
            }else{
                DebugLog.log("-111");
                cb("-1");
            }


        });
    }
    onNativeAdClick(_id: string) {
        DebugLog.log("id :" + _id)
      //  HttpUpBehavior.getInstance().adClickUpdate();
      nativeAd&&nativeAd.reportAdClick({
            adId: _id
        });

    }
    onReportAdShow(_id: string) {
        DebugLog.log("id :" + _id)
       
     
        nativeAd&&nativeAd.reportAdShow({
            adId: _id
        });

    }
    public preLoadAd() {

    }
    public hide(): void {
        if (this.bindNode) {
            this.bindNode.getComponent(UI_hwNativeAd).close();
          
        }
    }


}
