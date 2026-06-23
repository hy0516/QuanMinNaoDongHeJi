//todo eric_gg

//var jsrsasign = require('jsrsasign_newsdk');  //jsrsasign
var demoPay = {
    


    //判断平台是否支持广告
    pay(i, price, goodItem, cb) {

        cc.log(price);
        cc.log(goodItem);
        cc.log(i);
        cb.doPaySuccess(i)
        console.log('demo直接支付成功');
    }

 

};
module.exports = demoPay;