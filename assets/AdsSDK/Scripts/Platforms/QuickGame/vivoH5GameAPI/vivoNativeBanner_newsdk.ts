// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdInteface from "../../../Tool/AdInteface_newsdk";

export type bannerConfig={
    bannerX:number,
    bannerY:number,
    bannerSize:number,
    bannerCloseSize?:number
}
export default class vivoNativeBanner extends AdInteface  {

 
    private posid: string = null;
    qg = window["qg"];

    customAD: any = null;
    public initData(posid: string) {
        this.posid = posid;
    }

    public isReady() {
        return true;
    }
    public show(bc:bannerConfig,cb:(cbstr:string)=>void) {
        console.log(this.posid);
        if (this.qg != null && this.qg != undefined) {
        

            let res = this.qg.getSystemInfoSync();
            let ww = res.windowWidth;
            let wh = res.windowHeight;
            let cw=ww*bc.bannerSize/100
            let bx=ww*bc.bannerX/100;
            let by=wh*bc.bannerY/100;
          
            if (this.customAD) {
                this.customAD.destroy();
            }
            if (this.qg.createCustomAd) {
                console.log("调用到了原生模板广告");
                this.customAD = this.qg.createCustomAd({
                    adUnitId: this.posid,
                    style: {
                        top: by,
                        left: bx,
                        width: cw
                        
                    },
                });
                this.customAD.onLoad(() => {
                    console.log('[原生模板广告] 广告加载成功');
                });
        
                this.customAD.onError((err) => {
                    console.log("原生模板广告加载失败", err);
                    cb&&cb("-1");
                });
                this.customAD
                    .show()
                    .then(() => {
                        console.log("原生模板广告展示完成");
                        cb&&cb("0");
                    })
                    .catch((err) => {
                        console.log("原生模板广告展示失败", JSON.stringify(err));
                    });
            }
        }
    }
    public preLoadAd() {

    }
    public hide(): void {
        if (this.customAD) {
			this.customAD.destroy();
		}
    }


}
