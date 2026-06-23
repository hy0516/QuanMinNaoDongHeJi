// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdInteface from "../../../Tool/AdInteface_newsdk";

export default class hwInsertAd extends AdInteface {

   private posid: string = null;
   m_insertAd: any;
   qg: any;
   public initData(posid: string) {
      this.posid = posid;

      this.qg = window['qg'];
   }

   public isReady() {
      return true;
   }
   public show(close_size,cb) {
  
      this.preLoadAd();
      if (this.m_insertAd) {
         this.m_insertAd.offError();
         this.m_insertAd.onError((err) => {
            console.log("===== rongyaoH5GameAPI onShowInsertAd Fail " + err.errCode)
            cb&&cb("-1")
         });
         let nInsert = this.m_insertAd.show();

         nInsert && nInsert.then(() => {

            console.log("===== rongyaoH5GameAPI onShowInsertAd Suceess =====");
            cb&&cb("0")
         }).catch((err) => {
            this.m_insertAd.load().then(() => {
               this.m_insertAd.show();
            });
         });
      }
   }
   public preLoadAd() {
      this.m_insertAd = this.qg.createInterstitialAd({
         adUnitId: this.posid
      });

   }



}
