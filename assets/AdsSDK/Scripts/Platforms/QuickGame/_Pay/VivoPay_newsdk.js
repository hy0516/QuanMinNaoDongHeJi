//todo eric_gg
var md5_hex = require('md5_newsdk')
var config=require('Config_newsdk')
//var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign
var vivoPay = {
    AppSecret: config.VIVO_PAY_APPSECRECT,
    pkn: config.VIVO_PKG,

    generateTimeReqestNumber() {
        var date = new Date();
        return date.getFullYear().toString() + (date.getMonth() + 1) + (date.getDate()) + (date.getHours()) + (date.getMinutes()) + (date.getSeconds());
    },

    //判断平台是否支持广告
    pay(i, price, goodItem, cb) {

        cc.log(price);
        cc.log(goodItem);
        cc.log(i);
        let url = 'https://pay.vivo.com.cn/vivopay/order/request'
        let rdn = 'zsfz_' + new Date().getTime();
        var orderInfo = {
            version: '1.0.0',
            signMethod: 'MD5',
            signature: '',
            packageName: this.pkn,
            cpOrderNumber: rdn,
            notifyUrl: 'http://an.paigame3.com/api/callback/bbg/callback.php',
            orderTime: this.generateTimeReqestNumber(),
            orderAmount: price.toFixed(2),//固定值为2
            orderTitle: goodItem,// 游戏设置为3
            orderDesc: "购买" + goodItem
        };


        var signInfo = {
            'version': orderInfo.version,
            'packageName': orderInfo.packageName,
            'cpOrderNumber': orderInfo.cpOrderNumber,
            'notifyUrl': orderInfo.notifyUrl,
            'orderTime': orderInfo.orderTime,
            'orderAmount': orderInfo.orderAmount,//固定值为2
            'orderTitle': orderInfo.orderTitle,// 游戏设置为3
            'orderDesc': orderInfo.orderDesc
        };
        var SignScript = require("SignScript_newsdk");
        let boo = SignScript.ksort(signInfo);   //使用ksort算法根据键值排序
        let str = "";
        //遍历所有键值  拼接
        for (let i in boo) {
            str += i + "=" + boo[i] + "&";
        }
        str = str.substring(0, str.length - 1) + "&" + md5_hex(this.AppSecret).toLowerCase();

       

        let signature = md5_hex(str);
        // cc.log(str);
        // cc.log("sna:" + signature);
        // cc.log("sna:" + signature.toLowerCase());
        // let para=
        // 'cpOrderNumber' + '=' + orderInfo.cpOrderNumber + '&' + 
        // 'notifyUrl' + '=' + orderInfo.notifyUrl + '&' +
        //  'orderAmount' + '=' + orderInfo.orderAmount + '&' + 
        //  'orderDesc' + '=' + orderInfo.cpOrderNumber + '&' + 
        //  'orderTime' + '=' + orderInfo.orderTime + '&' + 
        //  'orderTitle' + '=' + orderInfo.orderTitle + '&' + 
        //  'packageName' + '=' + orderInfo.packageName + '&' +        
        //  'signature' + '=' + signature + '&' + 
        //  'signMethod' + '=' + orderInfo.signMethod + '&' + 
        //  'version' + '=' + orderInfo.version ;
        let para =
            'version' + '=' + orderInfo.version + '&' +
            'packageName' + '=' + orderInfo.packageName + '&' +
            'cpOrderNumber' + '=' + orderInfo.cpOrderNumber + '&' +
            'notifyUrl' + '=' + orderInfo.notifyUrl + '&' +

            'orderTime' + '=' + orderInfo.orderTime + '&' +
            'orderAmount' + '=' + orderInfo.orderAmount + '&' +
            'orderTitle' + '=' + orderInfo.orderTitle + '&' +
            'orderDesc' + '=' + orderInfo.orderDesc + '&' +

            'signature' + '=' + signature + '&' +
            'signMethod' + '=' + orderInfo.signMethod;


        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log(response);
                console.log("支付start");
                qg.pay({
                    orderInfo: response,
                    success: function (ret) {
                        cb.doPaySuccess(i)
                        qg.showToast({

                            message: "支付成功：" + JSON.stringify(ret)

                        })
                        console.log("支付成功：");
                    },
                    fail: function (erromsg, errocode) {
                        console.log( "支付失败：" + errocode + ': ' + erromsg)
                        qg.showToast({
                            message: "支付失败：" + errocode + ': ' + erromsg
                        })
                      
                    },
                    cancel: function () {
                        qg.showToast({
                            message: "用户取消"
                        })
                        console.log("支付取消：")
                    }
                })
                console.log("支付over")
            }
        };
        xhr.open("POST", url, true);
        xhr.send(para);
    }

 

};
module.exports = vivoPay;