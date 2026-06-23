//todo eric_gg
var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign
var config=require('Config_newsdk')
var haslogin=false;
//var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign

var userinfo={
    openid:null,
    session_key:null,
    unionid:null,
    errcode:null,
    errmsg:null,
}
var QqPay = {
    APPID: config.QQ_APPID,
    APPSECRECT: config.QQ_APPSECRECT,

    generateTimeReqestNumber() {
        var date = new Date();
        return date.getFullYear().toString() + (date.getMonth() + 1) + (date.getDate()) + (date.getHours()) + (date.getMinutes()) + (date.getSeconds());
    },


    init(){

    },
    //判断平台是否支持广告
    pay(i, price, goodItem, cb) {

        console.log(price);
        console.log(goodItem);
        console.log(i);

        let self=this;

        this.payi=i;
        this.payprice=price;
        this.paygooditem=goodItem;
        this.paycb=cb;

        if (!haslogin) {
            
          

            let mt=require('SDKManagerTool');
            mt.showDialog('支付需要登录，是否确定登录',function(){
      
             
               
                qq.login({
                    success(res) {
                      if (res.code) {
                        // 发起网络请求
                        // qq.request({
                        //   url: 'https://test.com/onLogin',
                        //   data: {
                        //     code: res.code
                        //   }
                        // })

                        console.log('登录成功');
                        haslogin=true;
                        console.log('code:'+res.code);
                        mt.toastShow('登录成功');
                        self.getUserInfo(res.code);
                      } else {
                        console.log('登录失败！' + res.errMsg)
                        qq.login();
                      }
                    }
                  })

         
            });
            return;
        }else{
            this.preparePay(this.openid);
        }

    
       

    },
    getUserInfo(code){
        let self=this;
       let url='https://api.q.qq.com/sns/jscode2session?appid='+this.APPID+'&secret='+this.APPSECRECT+'&js_code='+code+'&grant_type=authorization_code';
         var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log(response);
                // userinfo.openid=response.openid;
                // userinfo.session_key=response.session_key;
                // userinfo.unionid=response.unionid;
                // userinfo.errcode=response.errcode;
                // userinfo.errmsg=response.errmsg;
             
                let mt=require('SDKManagerTool');
                self.openid= mt.getPara(response,"openid",':"','",');

                self.preparePay(self.openid);
             
            }        
        };
        xhr.open("GET", url, true);
        xhr.send(); 
   
    },
    getPara(allstr,indexstr,before,after){
        let num1=allstr.indexOf(indexstr);
        let allstr1=allstr.substring(num1,allstr.length);
        let num2=allstr1.indexOf(before);
        let num3=allstr1.indexOf(after);
        let requirestr=allstr1.substring(num2+before.length,num3);
        return requirestr;

    },
    preparePay(openid){
        let self=this;
        console.log("openid:"+openid);
      
        let ts=new Date().getTime();
        let bn="zsf"+this.generateTimeReqestNumber()+ts;
       var preSigninfo= {
            "openid":openid,
            "appid":this.APPID,
            "ts":ts,
            "zone_id":"1",
            "pf":"qq_m_qq-2001-android-2011",
            "amt":config.PAY_PRICE[this.payi],
            "goodid":""+this.payi,
            "good_num":1,
            "bill_no":bn,
            "app_remark":"xxxxx",
          
        }
        var SignScript = require("SignScript_newsdk");        
        let boo = SignScript.ksort(preSigninfo);   //使用ksort算法根据键值排序
        let str = "";
        //遍历所有键值  拼接
        for(let i   in boo){
        str += i + "=" + boo[i] + "&";
        }
        str=str+'access_token='+this.APPSECRECT;
       

        str='POST&%2Fapi%2Fjson%2FopenApiPay%2FGamePrePay&'+str;


        let hex_hmac_sha256=require('QQSign_newsdk');
     
        var sign = 	hex_hmac_sha256(
            self.APPSECRECT, 
            str
        );
    
    


        console.log(str);
        console.log(sign);

        var preOrderSigninfo= {
            "openid":openid,
            "appid":this.APPID,
            "ts":ts,
            "zone_id":"1",
            "pf":"qq_m_qq-2001-android-2011",
            "amt":config.PAY_PRICE[this.payi],
            "goodid":""+this.payi,
            "good_num":1,
            "bill_no":bn,
            "app_remark":"xxxxx",
            "sig":sign,          
        }
        console.log(preOrderSigninfo);
        // var SignScript1 = require("SignScript_newsdk");        
        // let boo1 = SignScript1.ksort(preOrderSigninfo);   //使用ksort算法根据键值排序
        // let str1 = "{";
        // //遍历所有键值  拼接
        // for(let i   in boo1){
        //     if (typeof( boo1[i])=='string') {
        //         str1 += '"'+i + '":"' + boo1[i] + '",';
        //     }else{
        //         str1 += '"'+i + '":' + boo1[i] + ",";
        //     }
   
        // }
        // str1 = str1.substring(0,str1.length-1);
        // str1+="}"
        // console.log(str1);

      let url='https://api.q.qq.com/api/json/openApiPay/GamePrePay?access_token='+ this.APPSECRECT;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log(xhr);
                console.log(response);
                if (response.errcode ==0) {
                 
                    console.log('预支付成功');
                    self.qqPay();
                }else{
                    console.log('预支付失败');
                }
              
            }
        };
        xhr.open("POST", url, true);
        xhr.send({
            "openid":"55107C3B8501CD7CBD90AEE4626E6D17",
            "appid":"1107981003",
            "ts":1507530737,
            "zone_id":"1",
            "pf":"qq_m_qq-2001-android-2011",
            "amt":10,
            "goodid":"43",
            "good_num":1,
            "bill_no":"69ae13a3a87f2551109a2ed26bc704201f56d664",
            "app_remark":"xxxxx",
            "sig":"38181bd0acf24eda203655a3be9f2e42b62d4fcf1c1de61a98b0573d13531449"
        });
    },
    qqPay(){


        let i=this.payi;
        let goodItem=this.paygooditem;
        let price=this.payprice;
        let cb=this.paycb;

        let cur=config.PAY_PRICE[i]*10;

        console.log("====pay===:");
        console.log("cur:"+cur);
        console.log("PAY_ID:"+config.PAY_ID[i]);
        qq.requestMidasPayment({
            prepayId:config.PAY_ID[i],
            starCurrency:cur,
       
            success(res) {
                 console.log('success==');
                 cb.doPaySuccess(i);
                },
           fail(res) { 
               console.log('fail==');
               console.log(res);
            //    console.log(res.errMsg);
            //    cc.find('TipLayer').getComponent('TipLayer').toastShow(res.errMsg);
        
            let mt=require('SDKManagerTool');
            mt.toastShow(res.errMsg);
            },
            complete(){},


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
module.exports = QqPay;