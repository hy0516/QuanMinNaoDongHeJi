// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdInteface from "../../../Tool/AdInteface_newsdk";







export default class vivoNativeAd extends AdInteface {

    private posid: string = null;
    qg = window["qg"];

    customAD: any = null;
    public initData(posid: string) {
        this.posid = posid;
    }

    public isReady() {
        return true;
    }
    public show(bc,cb:(cbstr:string)=>void) {
        console.log(this.posid);
        if (this.qg != null && this.qg != undefined) {
        

            let res = this.qg.getSystemInfoSync();
            let ww = res.windowWidth;
            let wh = res.windowHeight;
            if (this.customAD) {
                this.customAD.destroy();
            }
            if (this.qg.createCustomAd) {
                console.log("调用到了原生模板广告");
                this.customAD = this.qg.createCustomAd({
                    adUnitId: this.posid,
                    style: {
                        top:wh > ww?wh*0.30:0,
                        width: wh > ww ? ww : wh
                    },
                });
                this.customAD.onLoad(() => {
                    console.log('[原生模板广告] 广告加载成功');
                    cb&&cb("0")
                });
        
                this.customAD.onError((err) => {
                    console.log("原生模板广告加载失败", err);
                    console.log("原生模板广告加载失败2", JSON.stringify(err));
                    cb&&cb("1")
                });
                this.customAD
                    .show()
                    .then(() => {
                        console.log("原生模板广告展示完成");

                    })
                    .catch((err) => {
                        console.log("原生模板广告展示失败", JSON.stringify(err));
                    });
            }
        }
    }
    public preLoadAd() {

    }



}
