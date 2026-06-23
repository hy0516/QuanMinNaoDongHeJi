// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdInteface from "../../../Tool/AdInteface_newsdk";

export default class oppoInsertAd extends AdInteface {
  
    private posid:string=null;
    interstitialAd:any;
    public initData(posid: string) {
       this.posid=posid;
    }
    
    public isReady() {
       return true;
    }
    public show(bc,cb:(cbstr:string)=>void) {
      
      console.log(this.posid);
        let  qg = window["qg"];
        if (this.interstitialAd) {
            this.interstitialAd.destroy();
        }
        var interstitialAd = qg.createInterstitialAd({
            adUnitId: this.posid,
          })
          interstitialAd.onLoad(function () {
            console.log('插屏广告加载')
            interstitialAd.show();
            cb("0")
          })
          interstitialAd.onError(function (err) {
            console.log(err)
            cb("-1")
          })
          interstitialAd.onClose(function () {
            console.log('插屏广告关闭')
          })
          interstitialAd.load();
          this.interstitialAd=interstitialAd;
    }
    public preLoadAd() {
       
    }


    
}
