
window.canPay=true;
require("Config_newsdk")
var PT = {
    extends: cc.Component,



    // LIFE-CYCLE CALLBACKS:

     onLoad () {
    
      if (window.adType==window.ADType.AD_OPPO) {
         this.adm=require('OPPOPay_newsdk');
         cc.log('adm====；'+this.adm);

     
     }else
        if (window.adType==window.ADType.AD_VIVO) {
            this.adm=require('VivoPay_newsdk');
            cc.log('adm====；'+this.adm);

        
        }else if (window.adType==window.ADType.AD_qq) {
         this.adm=require('QqPay_newsdk');
         cc.log('QqPay====；'+this.adm);
       
        }else if (window.adType==window.ADType.AD_HW) {

         this.adm=require('HWPay_newsdk');
      
         try {
            this.adm.init();
         } catch (error) {
            console.log(error);
         }
        
        }else if (window.adType==window.ADType.AD_4399) {
     
         window.canPay=false;
        }else if (window.adType==window.ADType.AD_tt) {
     
         this.adm=require('ttPay_newsdk');
         this.adm.init();
        }
        
     },

     login(cb){
         if (this.adm.login) {
            this.adm.login(cb)
         }
     },
     getPara(allstr,indexstr,before,after){
      let num1=allstr.indexOf(indexstr);
      let allstr1=allstr.substring(num1,allstr.length);
      let num2=allstr1.indexOf(before);
      let num3=allstr1.indexOf(after);
      let requirestr=allstr1.substring(num2+before.length,num3);
      return requirestr;

     },
     pay(i,price,goodItem,cb){

    

        try {
         this.adm.pay(i,price,goodItem,cb);
        } catch (error) {
         console.log(error);
        }
       
     }
   
    // update (dt) {},
};
module.exports = PT;