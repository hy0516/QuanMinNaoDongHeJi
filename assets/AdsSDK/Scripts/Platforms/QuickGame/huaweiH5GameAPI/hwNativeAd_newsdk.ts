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
import hwHttpUpBehavior from "./hwHttpUpBehavior_newsdk";





var nativeAd: any;
var hbs: any;
var self;
export default class hwNativeAd extends AdInteface {

    private posid: string = null;
    qg = window["qg"];
    mapDownLoadButton:Map<string,1>=new Map();
    customAD: any = null;
    pixelRatio:number=1;
    public initData(posid: string) {
        this.posid = posid;
        hbs= window["hbs"];
         self=this;
        if (this.qg) {
            this.qg.getSystemInfo({
                success(res) {
                 //   console.log("on getSystemInfo: success =" + JSON.stringify(res));
                    self.pixelRatio=res.pixelRatio;
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
    createNative(callback) {
        let self = this;
        try {


             DebugLog.log(this.posid);
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
                 
                }, 500 + Math.random() * 1000);

                return;
            }


            if (!hbs) {
                 DebugLog.log("=hbs==不存在");
                callback();
                return;
            }

            nativeAd = hbs.createNativeAd({
                adUnitId: self.posid,
              
            });
            let nativeadLoadfun = function (data) {
                console.info('ad data loaded: ' + JSON.stringify(data))
                let adItemData = data.adList[0]
            
                 DebugLog.log("===adItemData.adId==" + adItemData.adId);
                nativeAd.reportAdShow({
                    adId: adItemData.adId
                });
                callback(data);
            

                nativeAd.offLoad(nativeadLoadfun)

                
            }
            nativeAd.onLoad(nativeadLoadfun);

            let errorfun = function (e) {
                console.error('load ad error:' + JSON.stringify(e));
                const errCode = e.errCode
                const errMsg = e.errMsg
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
    public show(close_size,cb) {

        DebugLog.log("show native:"+this.posid)

        let self=this;

        this.hideDownloadButton(null);

        this.createNative(function (adres) {
      
            if (adres) {
                self.hideadid=adres.adList[0].adId;

          
                let del = {
                    onNativeAdClick: self.onNativeAdClick,
                    hideDownloadButton: self.hideDownloadButton,
                    showDownloadButton: self.showDownloadButton,
                    onReportAdShow: self.onReportAdShow,
                    res: adres,
                    adType: 1,
                    pixelRatio:self.pixelRatio,
                    close_size:close_size,
                }


                UISDK_Manager_newsdk.getInstance().showUI('NativeAd', del, function (pnode) {
                
                    self.bindNode=pnode;
                    pnode.getComponent(UI_hwNativeAd).initLayer(adres);
                    if (SDK_config.openMaiLiang) {
                        hwHttpUpBehavior.getInstance().screenUpdate();
                    }
                });


                DebugLog.log("0000");
                cb&&cb("0");
            }else{
                DebugLog.log("-111");
                cb&&cb("-1");
            }



        });
    }
    onNativeAdClick(_id: string) {
        DebugLog.log("id :" + _id)
        if (SDK_config.openMaiLiang) {
            hwHttpUpBehavior.getInstance().adClickUpdate();
        }
     
        nativeAd&&nativeAd.reportAdClick({
            adId: _id
        });

    }
    onReportAdShow(_id: string) {
        DebugLog.log("id :" + _id)
        if (SDK_config.openMaiLiang) {
            hwHttpUpBehavior.getInstance().adClickUpdate();
        }
     
        nativeAd&&nativeAd.reportAdShow({
            adId: _id
        });

    }
    public hide(): void {
        if (this.bindNode) {
            this.bindNode.getComponent(UI_hwNativeAd).close();
            this.hideDownloadButton( this.hideadid);
        }
      
    }

    getRoPx(){
      
    }



    showDownloadButton(adId,x,y){
        DebugLog.log("===showDownloadButton===="+adId);
        
        if (nativeAd) {
        
            self.mapDownLoadButton.set(adId,1);
            if (nativeAd&&nativeAd.showDownloadButton) {
                nativeAd.showDownloadButton({
                    adId : adId,
                    style : {
                        left:x,
                        top:y,
                        heightType:'normal',
                        // width:300,
                        // fixedWidth:true,
                       
                        minWidth:400,
                        maxWidth:550,
                        textSize:50,
                        horizontalPadding:30,
                        cornerRadius:22,
                        normalTextColor:'#FFFFFF',
                        normalBackground:'#5291FF',
                        pressedColor:'#0A59F7',
                        normalStroke:5,
                        normalStrokeCorlor:'#FF000000',
                        processingTextColor:'#5291FF',
                        processingBackground:'#0F000000',
                        processingColor:'#000000',
                        processingStroke:10,
                        processingStrokeCorlor:'#0A59F7',
                        installingTextColor:'#000000',
                        installingBackground:'#FFFFFF',
                        installingStroke:15,
                        installingStrokeCorlor:'#5291FF'
                    },
                    success: (code) => {
                         DebugLog.log("showDownloadButton: success");
                    },
                    fail: (data, code) => {
                         DebugLog.log("showDownloadButton fail: " + data + "," + code);
                    },
                    complete: () => {
                         DebugLog.log("showDownloadButton : complete");
                    }
                });
            }
          
        }
      
    }

    hideDownloadButton(adId){
        DebugLog.log("===hideDownloadButton===="+adId);
  
       
        if (nativeAd) {
         
            self.mapDownLoadButton.forEach((value,key) => {
                console.log("===key===="+key);
               
                if (nativeAd&&nativeAd.hideDownloadButton) {
                    nativeAd.hideDownloadButton({
                        adId : key,
                        success: (code) => {
                            console.log("hideDownloadButton: success");
                       },
                        fail: (data, code) => {
                            console.log(" hideDownloadButton fail: " + data + "," + code);
                        },
                        complete: () => {
                            console.log("hideDownloadButton : complete");
                        }
                    });
                   
                }
                self.mapDownLoadButton.delete(key);
              
            });

            // nativeAd.hideDownloadButton({
            //     adId : adId,
            //     success: (code) => {
            //          DebugLog.log("hideDownloadButton: success");
            //    },
            //     fail: (data, code) => {
            //          DebugLog.log(" hideDownloadButton fail: " + data + "," + code);
            //     },
            //     complete: () => {
            //          DebugLog.log("hideDownloadButton : complete");
            //     }
            // });
        }
      
    }
    public preLoadAd() {

    }



}
