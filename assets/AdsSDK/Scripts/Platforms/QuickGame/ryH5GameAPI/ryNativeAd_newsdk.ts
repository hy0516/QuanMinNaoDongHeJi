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
import hwHttpUpBehavior from "./ryHttpUpBehavior_newsdk";





var nativeAd: any;
var hbs: any;
var self;
export default class hwNativeAd extends AdInteface {

    private posid: string = null;
    qg = window["qg"];
    mapDownLoadButton:Map<string,1>=new Map();
    customAD: any = null;
    pixelRatio:number=1;
    private screenWidth = 0;
    private screenHeight = 0;
    public initData(posid: string) {
        this.posid = posid;
        hbs= window["hbs"];
         self=this;
        if (this.qg) {
            this.qg.getSystemInfo({
                success(res) {
                 //   console.log("on getSystemInfo: success =" + JSON.stringify(res));
                    self.pixelRatio=res.pixelRatio;
                    this.screenWidth = res.screenWidth;
                    this.screenHeight = res.screenHeight;
                },
                fail() {
                    console.log("on getSystemInfo: fail");
                },
                complete() {
                    console.log("on getSystemInfo: complete");
                }
            });
        }
      
    }

    public isReady() {
        return true;
    }

    id = 0;
   
    hideadid;
    bindNode;
    customAd;
    public show(close_size,cb) {

        DebugLog.log("show native:"+this.posid)

        let self=this;

        if (this.customAd != null) {
            this.customAd.destroy();
            this.customAd = null;
        }
        // 1024*896,,1080*945
        this.customAd = this.qg.createNativeAd({
            adUnitId: this.posid,
            // style: { left: (this.screenWidth - 1024) / 2, top: (this.screenHeight - 896) / 2 }
            //style: { left: (this.screenWidth - 1080) / 2, top: (this.screenHeight - 445) / 2 }
            style: {
                //老
                // left: (this.screenWidth - 1080) / 2, top: (this.screenHeight - 945) / 2 
                //新
                top: (this.screenHeight - 1080) / 3 - 300,
                gravity: "center"
            }
        });
        this.customAd.offError();
        this.customAd.onClose(() => {
            console.log("ad close")
           
        })
        this.customAd.onError(err => {
            console.log("原生模板广告加载失败", JSON.stringify(err));
        });
        this.customAd.show().then(() => {
            console.log('原生模板广告展示完成');
            hwHttpUpBehavior .getInstance().screenUpdate();
            
            DebugLog.log("0000");
            cb&&cb("0");
        }).catch((err) => {
            console.log('原生模板广告展示失败', JSON.stringify(err));
            DebugLog.log("-111");
            cb&&cb("-1");
        })

      
    }
    onNativeAdClick(_id: string) {
    

    }
    onReportAdShow(_id: string) {
     

    }
    public hide(): void {
     
    }

    getRoPx(){
      
    }



    public preLoadAd() {

    }



}
