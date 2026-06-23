window.gametype = 2;//0免费，1Android，2小游戏，
window.ADType = {
     AD_DEMO:-1,
     AD_OPPO: 0,
     AD_VIVO: 1,
     AD_HW: 2,
     AD_4399: 3,
     AD_qq: 4,
     AD_tt: 5,
 
 };
window.adType = window.ADType.AD_HW;//0:oppo,1:vivo,2:hw,3:4399，4：qq ,5头条    //-1  demo广告
/**游戏进入场景名称，由splash跳转的场景 */
window.mainSceneName="TestadScene";

var config = {

     //取值所用，暂时无用

     CUR_PLATFORM_CHANNEL: 3,//0:OPPO,1:VIVO,2:HW,3:4399,当前使用的哪个平台
     HKT_PKG: 'com.zsfz.tss.html',//平台包名


     
  
     
     //vivo渠道----------------------------------------
     VIVO_PKG: 'com.mxcy.qmjj.vivominigame',//游戏包名
     VIVO_PAY_APPSECRECT: '4483c3716ccc9efd0b86dc540283e453',//vivo的支付secret
     VIVO_CANSHU: 'VIVO',//渠道名


     VIVO_AD_INSERT: '14ee12036f904d458516aeaa87835534',
     VIVO_AD_VIDEO: '9141ec2348cb4ac4ad3ed93b997657d4',
     VIVO_AD_BANNER: 'e2e92a50525e4863afbe6a6ef9df7cbe',
     VIVO_AD_NATIVE:'17e9e1b8a2114514b2d7f583ece114f3',
     //OPPO渠道------------------------------
     OPPO_CANSHU: 'OPPO',//渠道名
     OPPO_PAY_appId:'30174650',
     OPPO_PAY_appKey:'c7G7K2b22mO8C8ssCKg4O84C4',
     OPPO_PAY_privateKey:'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAI+ToVnZKrWe2N0/jbx/XUEpDDpyZGajLUNUHvb3GuBMZCB+Ye+oFc+uXO9+ycDPIC4FiWg4bBqwig3oSs5hYm7YAs7bGeZOLJqurqYHV3AgRt8gtsSex5/NaJybkHKcd4fAM+GY6u2mdQ5S//bbkIaMrgFOwCca4Akqp+dPSU0DAgMBAAECgYAEsVCOvThWI1D3OkKJrKgBnzPVHTQG3sJ19uPkMoNgXV7QaREOYjIETbCf60bw1FQ67Ndm3qE55hc9CSCYyjoLVKgf1x3tuR4rdL7QVAphLQk67Qandjs/+O5N42s2K8JiUC0GFJzwV0E9fuPSS3TvIrmM2by8IUprYrl+bmtxAQJBAObqf+rkeTtxWGK+D0pJvRzrt1Pi3vsV3TBqUcUyG5/T2tGk4tLdF78TZrK0FTpzCwAtfjlzSSnRng9fvvuojcMCQQCfLFPPQBT8RotUgzlqQ9A+ljM+LXl+FO7P35lFn+H8VYEfZlRjsPpzvdSMTLImG3/kYfeTUWyji5a2Tnkg+A/BAkEAxrRl7PA8Ll2jzBx2tdtsQ9XGxQXGEVRIKSBkSweKY+d/NcXodcFRbNg6GG8EkW5rufRr2O4OuFCr7djbVF0/1wJAMjbmvbQmqquKmv/G5io8kPILemsYL9lkuXl9vgRBY7yJvqEmsEiNymOxoQ01CmaUgzUQyI3gavvHcP3yop7/QQJALtagISjK2dzPWAlbANWWRpPrWl/cAUXSFFZPnhjORnQ7jWxIY0FzS5ja+9eLQKvdX5GBDybh4/NV8c2Co7WN+A==',
  

     OPPO_AD_APPID:'30218586',
     OPPO_PAY_appKey:'c7G7K2b22mO8C8ssCKg4O84C4',
     OPPO_AD_BANNER:'138783',
     OPPO_AD_INSERT:'138784',
     OPPO_AD_VIDEO:'138787',
     OPPO_AD_NATIVE:'138786',
     //hw渠道----------------------------
     HW_CANSHU: 'HW',//渠道名
     HW_APPID: '104165651',
     HW_PAYID: '70086000148452986',
     HW_PUBLIC_KEY: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh+Tsd7PxFfJzljQerhiL3zKkgyxHTTZRAHlxaZlGhb9N9O32xS0mSymz92UhS2lwMMvvuhDu9u7+B2hpfwhAQnz1qLkmMbVBSu8FFhoNKW70fX6SvaeNAG7OdwKsKVVHylits0AzGUyXFwuMfVxHeLF0gWLd93iK3WrW2jCymhAym9qlabyBwsc58CsGC+CcNKYzkScItL2JxYSjCi9fjCV6XmqiLFlGqKq8/VNpLh3D3PnK0IqFiwdoCPy5eLu8+Mqgj+5ZlDwbFtxeGLxeOZt+g4rHbNAmfIbw/pPt82kuvRno/EHOfnOv/nGj7v0h8cxVbYlA2AVxUGxGVhZvlQIDAQAB',
     HW_PRIVATE_KEY: 'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCH5Ox3s/EV8nOWNB6uGIvfMqSDLEdNNlEAeXFpmUaFv0307fbFLSZLKbP3ZSFLaXAwy++6EO727v4HaGl/CEBCfPWouSYxtUFK7wUWGg0pbvR9fpK9p40Abs53AqwpVUfKWK2zQDMZTJcXC4x9XEd4sXSBYt33eIrdatbaMLKaEDKb2qVpvIHCxznwKwYL4Jw0pjORJwi0vYnFhKMKL1+MJXpeaqIsWUaoqrz9U2kuHcPc+crQioWLB2gI/Ll4u7z4yqCP7lmUPBsW3F4YvF45m36Disds0CZ8hvD+k+3zaS69Gej8Qc5+c6/+caPu/SHxzFVtiUDYBXFQbEZWFm+VAgMBAAECggEABwEjtx/NQ2ZV0t4o3qxhOUXw+NnlavNrxWx9DgZafjZYHFHPsGYdXS5vGkdaKfrrT3iTiLGqv4ueCF+3YFbaiRLLzsCMWW+QR/598p+xIfuYGofVpHTobadIeRXoLdE5fBKKEX0zpRAvkX6E5UlGXdA3wxuHeWP7NGJ3ZJOyAQLVU8+g1dDRRtJ1gkyY8K24BkmnD7lcRFCtdjmqRCjyZyYwHhrDIkSw+igqd88P4eDLT9rGbUQ2mFVj36lDps8vPeP78V2TyFS9cpPf1vJ64iJpai1JF6ttqyqqjp8VsrnySFrkkmt+ttWWzCFIPbdNhYjmuMs5LEMifFcw8/FF2QKBgQDUzLVjOZGkQRn4DpvVC1rOF2tHBDiEByFNIli+ChzBTSKwGvlKVfbdT4CRFLiKMdFqF7uIij5RYPov006e+hSgeFjWvpX7C2/05vqFBCxUOOiwPk80330lHUXAOLau7zzi3lsni3uM7q7aQ/DTgHHhkosyPMCERp6mtltJylm+0wKBgQCje2gz+5lthj5vciXom2BQdoddNqgw4pZ+gGBzo9Oso04GHGw/W1LbaltiUuPzYEhR1vhdQC+4I6/WXjbe7Cx8+D4dr0dOeZnYVRFotJhjYcGKxxMB4gMG718SDvKX2ZvtHdw9x3eBf6350r+JHmYF9F3Duaeyc6uy2GK8WKQm9wKBgQDIrN+lWgXRex8tQUGNcC7KyWT+TKmrQDoUTn6XgFvLop1Cq71Jb7Xk0HNy3bKFiCNvREAyrAPGpIhrD39GBpnrFnLY2FQBsbB7qFK5m8zeA+jTQ39YYiXXGTrM4e7NG4k0fPJDYZM6vV+hL47tNWSvj42663W1iA9XMgL2nF9zxwKBgQCQ1Ur7CsLhylXUDC/ThJvujSPdjAezz3p+tiM9L/3e64q7VUD9XF3qr64oTMFQo5NOlgHRM4VTQKKOa0d3dYrwaEk3qUqmFosaojrbJWwAV+HMnhOTznTaFwWGDSIVL5+5kYPGY8nXO5OZSYGQ7BJ84gKT3Q3ZxipuNtA6htle/wKBgQCCinGY5lHEElCME9eUHBjW5TEaCo/QEMTjkvqfrdb106FQTvOaoJJVySfR0uNRYQX1PbH+PpvCxFHc4j8pt5gSUSXoQpU5QzzXRVyV+zMCFnL59HV39vGe3A80lUXoNPd8r2IHgBxpoioGkOPHVBD0KasQN2O6I30607Yci3SCww==',
     HW_USERNAME: '深圳市梦想畅游科技有限公司',
     //hw广告----------------------------
     HW_AD_APPID:'101047565',
  
  
     HW_AD_INSERT:'f8c0niitx4',

     HW_AD_BANNER:'l9vqrmzo2s',
    HW_AD_VIDEO:'t22b7i56qz',
    HW_AD_NATIVE:'f67r3akn1u',
 //hw测试广告----------------------------
     // HW_AD_NATIVE:'testu7m3hc4gvm',
     // HW_AD_VIDEO:'e7hm5vx799',
     // HW_AD_BANNER:'testw6vs28auh3',
      
     //qq支付-------------------------------
   
     QQ_APPID: '1109746474',
     QQ_APPSECRECT: 'je11nsgwViA3TW9h',
     PAY_ID: [
          '042acbbf1f9b9dd7ca3c55cb1bf0a435',
          '4ec3de260d8c2f8bedf64d37088237ed',
          'f5be555d77b5544587524b615882a778',
          'bdbc8608687e327328acb771e7a43dba',
          'd210441434988db27c70ab4182d30a4b',
          'f9c4d2e15b181ebdca9815a4a95d9610',
     ],
     PAY_PRICE: [
          2,
          4,
          12,
          24,
          48,
          96,
     ],

        //qq广告-------------------------------
        QQ_AD_BANNER: '3591472637956666b590ce38c9614dae',  
        QQ_AD_VIDEO: 'd3f388739a613900d9d6a7d7f5177c87',

     //-----------头条--------广告----------------
     AppID:"tt59c62f7bc6fc2bf2",//打包微信小游戏需要

     TT_AD_BANNER: '3pm3jqdn2oj1169c2f',
     TT_AD_INSERT: '1hk23c75529hbga7g6',
     TT_AD_VIDEO: 'e8gp88f88l5a7ilraf',
      //-----------头条--------支付----------------
      TT_APPID: '101047565',
      
};

module.exports = config;