//todo eric_gg
var md5_hex = require('md5_newsdk')
var config=require('Config_newsdk')
var haslogin;
//var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign
var OPPOPay = {
    appId: config.OPPO_PAY_appId,
    appKey: config.OPPO_PAY_appKey,

    generateTimeReqestNumber() {
        var date = new Date();
        return date.getFullYear().toString() + (date.getMonth() + 1) + (date.getDate()) + (date.getHours()) + (date.getMinutes()) + (date.getSeconds());
    },

    //判断平台是否支持广告
    pay(i, price, goodItem, cb) {

        cc.log(price);
        cc.log(goodItem);
        cc.log(i);

        let self=this;

        this.payi=i;
        this.payprice=price;
        this.paygooditem=goodItem;
        this.paycb=cb;

        if (!haslogin) {
          
            mt.showDialog('支付需要登录，是否确定登录',function(){
      
             
               
                qg.login({
                    success: function(res){
                        var data = JSON.stringify(res.data);
                        console.log(data);

                        let mt=require('SDKManagerTool');
                        self.token= mt.getPara(response,"token",':"','",');
                        this.preparePay(self.token);
                    },
                    fail: function(res){
                      // errCode、errMsg
                        console.log(JSON.stringify(res));
                    }
                });

         
            });
            return;
        }else{
            this.preparePay(this.token);
        }


    },

    hasAD() {
        return true;
    },
    preparePay(tk){

        let ts=new Date().getTime();
        let on=this.generateTimeReqestNumber();
        var preSigninfo= {
            "appId":this.appId,
            "token":tk,
            "timestamp":ts,
            "orderNo":on,
          
          
        }
        var SignScript = require("SignScript_newsdk");        
        let boo = SignScript.ksort(preSigninfo);   //使用ksort算法根据键值排序
        let str = "";
        //遍历所有键值  拼接
        for(let i   in boo){
        str += i + "=" + boo[i] + "&";
        }
        str=str+'token='+tk;
      
        var sign = 	hex_hmac_sha256(
            self.appKey, 
            str
        );
        let mt=require('SDKManagerTool');

        qg.pay({
            // 登录接口返回的token
            token: tk,
            // 时间戳
            timestamp: ts,
            paySign: sign,
            // 订单号
            orderNo: on,
            // 成功回调函数，结果以 OPPO 小游戏平台通知CP的回调地址为准
            success: function(res){
                console.log(JSON.stringify(res.data));
            },
            fail: function(res){
                // errCode、errMsg
                console.log(JSON.stringify(res));
            }
        });
    }

};
module.exports = OPPOPay;