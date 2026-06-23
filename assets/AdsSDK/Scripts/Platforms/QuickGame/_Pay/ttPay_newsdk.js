//todo eric_gg
var md5_hex = require('md5_newsdk')
var config=require('Config_newsdk')
var haslogin=false;
//var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign

var self;
var ttpay = {
    TT_APPID: config.TT_APPID,
    pkn: config.VIVO_PKG,

    generateTimeReqestNumber() {
        var date = new Date();
        return date.getFullYear().toString() + (date.getMonth() + 1) + (date.getDate()) + (date.getHours()) + (date.getMinutes()) + (date.getSeconds());
    },


    init(){
       
    },
    getUserInfo(){
        tt.getUserInfo({
            withCredentials:true,
            success (res) {
                console.log(`getUserInfo调用成功${res.userInfo}`);
                console.log(res.userInfo);
            },
            fail (res) {
                console.log(`getUserInfo调用失败`);
            }
        });
    },
    //判断平台是否支持广告
    pay(i, price, goodItem, cb) {
        self=this;
        console.log(price);
        console.log(goodItem);
        console.log(i);
        let mt=require('SDKManagerTool');
        if ( cc.sys.OS_IOS == cc.sys.os) {
            mt.toastShow('抱歉IOS赞不支持虚拟支付');
        }


        if (!haslogin) {
            
          

         
            mt.showDialog('支付需要登录，是否确定登录',function(){
                tt.login({
                    success (res) {
                        haslogin=true;
                        console.log(`login调用成功${res.code} ${res.anonymousCode}`);
                        self.getUserInfo();
                        mt.toastShow('登录成功');
                    },
                    fail (res) {
                        console.log(`login调用失败`);
                    }
                });
            });
            return;
        }

        var orderInfo = {
            app_id: this.TT_APPID,
            method: 'tp.trade.confirm',
            sign: '',
            sign_type:'MD5',
            timestamp: ""+new Date().getTime(),        
            orderTime: "zsf"+new Date().getTime(),
            merchant_id:'',
            uid: '',
            total_amount: Math.floor(price) ,
            pay_channel: 'ALIPAY_NO_SIGN',
            pay_type: 'ALIPAY_APP',
            params: JSON.stringify({
                // 如果是新版支付宝，url 示例：
                url: 'app_id=2018041302549907&biz_content=%7B%22body%22%3A%22novel%22%2C%22subject%22%3A%22%E6%B5%8B%E8%AF%95%E7%9A%84%E5%95%86%E5%93%81%22%2C%22out_trade_no%22%3A%22201808211756233909095950%22%2C%22timeout_express%22%3A%2230m%22%2C%22total_amount%22%3A%220.01%22%2C%22seller_id%22%3A%22jrtoutiaoyxgs%40bytedance.com%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%7D&charset=utf-8&format=JSON&method=alipay.trade.app.pay&notify_url=https%3A%2F%2Ftp-pay-test.snssdk.com%2Fcallback%2Fali_pay&sign=ZfVkvu%2FSzBqFuqQMgr6MvsXomlr6BCuz7GYDnpsxd3SLVfCssV0q2cnxZyfjh%2FY%2Bk7PO1IeEl4rppQg%2FXgRuIqMXyKdhmigj4oPdQVJEkbSQEcCW4m8mwpXLNjlLH%2FHae3u3hjrMDVPuVXeIxjoq1NLPXy09GY5u1MX8E2lkn8xtmOxA2cXXRIrAa8gTplUoXWkSSkZMgvSTzQ9RjRmlKtK4nERdDWh5RBXLNDU%2FD2FfqIeZuLNZh%2BW8j4dYGtPDm9nWYRz0tLizJDm6E76aTM3qvLi0havCCrHgxZ5d8tVN7GNztA6olbGOiXubEGUq4yBqCojiALEEVpKqfQdZGQ%3D%3D&sign_type=RSA2&timestamp=2018-08-21+17%3A56%3A24&version=1.0'
              
              
            }),
        };


        var signInfo = {
            'app_id': orderInfo.app_id,
            'sign_type': orderInfo.sign_type,
            'timestamp': orderInfo.timestamp,
            'trade_no': orderInfo.trade_no,
            'merchant_id': orderInfo.merchant_id,
            'uid': orderInfo.uid,//
            'total_amount': orderInfo.total_amount,// 
            'params': orderInfo.params
        };
        var SignScript = require("SignScript_newsdk");
        let boo = SignScript.ksort(signInfo);   //使用ksort算法根据键值排序

    
        // tt.requestPayment({
        //     data: {
        //         app_id: orderInfo.app_id,
        //         method: orderInfo.method,
        //         sign: signInfo,
        //         sign_type: orderInfo.sign_type,
        //         timestamp: orderInfo.timestamp,
        //         trade_no:  orderInfo.trade_no,
        //         merchant_id: orderInfo.merchant_id,
        //         uid: orderInfo.uid,
        //         total_amount:  orderInfo.total_amount,
        //         pay_channel:  orderInfo.pay_channel,
        //         pay_type:  orderInfo.pay_type,
        //         params: orderInfo.params,
        //     },
        //     success (res) {
        //         console.log(res.errMsg);
        //     },
        //     fail (res) {
        //         console.log(res.errMsg);
        //     }
        // })
        console.log(orderInfo.total_amount);
        tt.requestGamePayment({
      
                mode: 'game',
                env: 0,
                currencyType:'CNY',
                platform:'android',
                buyQuantity:12,
                zoneId:orderInfo.total_amount,
                

                success (res) {
                    console.log(`getLocation调用成功`);
                    cb.doPaySuccess(i);
                },
                fail (res) {
                    console.log(`getLocation调用失败`);
                    console.log(res);
                    mt.toastShow('支付失败：'+res);
                },
                complete() {
                    console.log(`getLocation调用完成`);
                }
        });

      

    },

    
  
    onload(){
     
      
        // var url = 'http://pv.sohu.com/cityjson?ie=utf-8';    
        // var xhr = new XMLHttpRequest();
        // xhr.onreadystatechange = function () {
        //     if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        //         var response = xhr.responseText;
        //         console.log(response);
            
        //         var jsArr=response;
        //         var result = JSON.stringify(jsArr);
        //         console.log('----------------');
        //         let index1=result.indexOf('cip');
        //         let index2=result.indexOf(',');
        //         let str=result.substring(index1+9,index2-2);
        //         console.log(str);
        //     }
         
        // };
        // xhr.open("GET", url, true);
        // xhr.send(); 
     
    },

};
//QqPay.onload();
module.exports = ttpay;