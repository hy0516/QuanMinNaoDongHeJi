//todo eric_gg
var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign
var config=require('Config_newsdk')

var HWPay = {
    APPID: config.HW_APPID,
    PAYID: config.HW_PAYID,
    PUBLIC_KEY: config.HW_PUBLIC_KEY,//支付公钥
    PRIVATE_KEY: config.HW_PRIVATE_KEY,//支付私钥
    USERNAME:config.HW_PRIVATE_KEY,//商户名称

    generateTimeReqestNumber() {
        var date = new Date();
        return date.getFullYear().toString() + (date.getMonth() + 1) + (date.getDate()) + (date.getHours()) + (date.getMinutes()) + (date.getSeconds());
    },
 
    init(){
     
        // console.log("==========cancel login===============");
        // this.huaweiLogin();
    },
    login(cb){
        try {
            this.huaweiLogin(cb);
        } catch (error) {
            cb();
        }
       
    },
    huaweiLogin(cb){
        console.log("==========hw login=================");
        let self = this;
        var loginSuccess = -1;

        
        hbs.gameLogin({
            forceLogin:0,
            appid:self.APPID,
            success:function(data){
              
                console.log("game login: success");
                self.showFloatingWin();  
                loginSuccess = 0;   

                if (cb) {
                    cb();
                } 
              
            },
            fail:function(data,code){
                console.log("DUWENJUN game login fail:" + data + ", code:" + code);
                loginSuccess = -1;
            }
        });

        var cbShow = function () {
            console.log("--------on show----------");
                // 如果登录成功显示浮标
              //  if (loginSuccess === 0) {
                    this.showFloatingWin();
                    console.log("--------on show----loginSuccess------");
             //   }
            }.bind(this);
            
        var cbHide = function () {
            console.log("--------on hide----------");
            this.hideFloatingWin();
        }.bind(this);
            
        // 注册onShow/onHide回调，用于隐藏和显示浮标
        hbs.onShow(cbShow);
        hbs.onHide(cbHide);

     
    },
    showFloatingWin() {
        let self = this;

     
        hbs.showFloatWindow({
            appid: self.APPID, //appid需要与华为开发者联盟后台配置一致
            success: function () {
                console.log("show float window success.");
                console.log("====nowUseSkinIdx=555=="+ cc.sys.localStorage.getItem("NowUserSkinIdx"));
            },
            fail: function (data, code) {
                console.log("show float window fail:" + data + ", code:" + code);
            }
        });

        console.log("====nowUseSkinIdx=444=="+ cc.sys.localStorage.getItem("NowUserSkinIdx"));
    },

    hideFloatingWin() {
        let self = this;
        hbs.hideFloatWindow({
            appid: self.APPID,
            success: function () { 
                console.log("hide float window success");
            },
            fail: function (data, code) { 
                console.log("hide float window fail:" + data + ", code:" + code);
            }
        });
    },
    //判断平台是否支持广告
    pay(i, price, goodItem, cb) {

        let self = this;
        console.log(price);
        console.log(goodItem);
        console.log(i);
       
        var orderInfo = {
            "amount": price.toFixed(2),
            "applicationID": self.APPID,
            "productDesc": goodItem,
            "productName": goodItem,
            "serviceCatalog":  "X6",  //游戏设置为"X6"
            "merchantId": self.PAYID,//华为开发者联盟上申请支付服务获取的“支付ID“
            "merchantName": self.USERNAME,//商户名称
            "sign": "",
            "requestId": 'zsfz_'+self.generateTimeReqestNumber(),
            "urlver": "2",//固定值为2
            "sdkChannel": 3,// 游戏设置为3
            "publicKey":self.PUBLIC_KEY
        };
        //参与签名的必须字段
        var signInfo = {
            "productName": orderInfo.productName,
            "productDesc": orderInfo.productDesc,
            "applicationID": orderInfo.applicationID, 
            "requestId":orderInfo.requestId,
            "amount": orderInfo.amount, 
            "merchantId": orderInfo.merchantId,  
            "sdkChannel": orderInfo.sdkChannel,
            "urlver":orderInfo.urlver, 
        };

         //生成源串  str
        var SignScript = require("SignScript_newsdk");        
        let boo = SignScript.ksort(signInfo);   //使用ksort算法根据键值排序
        let str = "";
        //遍历所有键值  拼接
        for(let i   in boo){
        str += i + "=" + boo[i] + "&";
        }
        str = str.substring(0,str.length-1);

        //使用私钥签名    
        var keyPem = "-----BEGIN PRIVATE KEY-----\n" + self.PRIVATE_KEY + "\n-----END PRIVATE KEY-----";
        // 创建 Signature 对象
        let signature=new jsrsasign.KJUR.crypto.Signature({alg:"SHA256withRSA","prov": "cryptojs/jsrsa","prvkeypem": keyPem}); 
        signature.updateString(str);
        //源串使用私钥签名后得到的值
        let keys = signature.sign();
        //base64编码
        let sign = jsrsasign.hex2b64(keys);

        orderInfo.sign = sign;

        //验证签名
        let publicKey = "-----BEGIN PUBLIC KEY-----\n" + self.PUBLIC_KEY + "\n-----END PUBLIC KEY-----";
        let sig = new jsrsasign.KJUR.crypto.Signature({"alg": "SHA256withRSA", "prov": "cryptojs/jsrsa","prvkeypem": publicKey});
        sig.updateString(str);
        let result = sig.verify(keys);

        console.log("验证签名正确：");
        console.log("验证签名正确："+result);

        // MainGameManager.instance.getView().node.emit("ALREADY_PAY_SUCCESS");
        // return;

        hbs.hwPay({
            orderInfo,
            success: function (ret) {+
                console.log("pay success " + ret);
                // console.log(ret.requestId);
                // console.log("我的猜测：",ret.result.requestId); //这是正确的返回传入的requestId
                // for(let i  in ret){
                //     console.log("键：",i);
                //     console.log("值：",ret[i]);
                //     for(let j in ret[i]){
                //         console.log("2键：",j);
                //         console.log("2值：",ret[i][j]);
                //         // 输出后包含orderID,amount,returnCode,errMsg,time,userName, 
                //     }
                // }
                //通知支付成功
               // MainGameManager.instance.getView().node.emit("ALREADY_PAY_SUCCESS");
                console.log("发送成功事件");
                cb.doPaySuccess(i);
            },
            fail: function (erromsg, errocode) {
                console.log("pay fail : " + errocode + erromsg);
                // MainGameManager.instance.getView().node.emit("ALREADY_PAY_SUCCESS");
                // console.log("发送成功事件");
             
            }
        })
    
    }

 

};
module.exports = HWPay;