// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SDK_config from "../../../SDK_config_newsdk";
import AdInteface from "../../../Tool/AdInteface_newsdk";
var rewardedVideoAd: any;
export default class hwVideoAd extends AdInteface {

    private posid: string = null;
    qg = window["qg"];
    rewardedVideoAd: any;
    _successCallback: Function = null;
    _failCallback?: Function = null;

    isAdReady: boolean = false;
    public initData(posid: string) {
        this.posid = posid;
        console.log(this.posid)
    }

    public isReady() {

        return this.isAdReady;
    }
    scount = 0;
    public show(any, _successCallback, _failCallback) {
        console.log("激励视频=============:" + this.posid);

        this._successCallback = _successCallback;
        this._failCallback = _failCallback;
        console.log(this.posid);


        if (!this.qg) {
            //	console.log('非小游戏平台')


            if (this.isAdReady) {
                console.log('返回测试成功')
                this._successCallback && this._successCallback();
                this.preLoadAd();
            } else {
                console.log(' 返回测试失败')
                this._failCallback && this._failCallback();
                this.preLoadAd();
            }

            return;
        }

        // // this.showToast('创建广告');
        // // _failCallback && _failCallback();
        // console.log(this.rewardedVideoAd);
        // console.log(this.isAdReady);
        // if (this.rewardedVideoAd && this.isAdReady) {
        //     this.rewardedVideoAd.show();
        //     this.isAdReady = false;

        //     console.log("=show =")
        // } else {
        //     this.preLoadAd();
        // }


    }
    public preLoadAd(loadfalse?) {
        let self = this;
        console.log("preload=" + this.scount);




        if (!this.qg) {

            self.scount = this.scount + 1;

            
            if (this.scount % 2 == 0) {
                self.isAdReady = true;
            } else {
                self.isAdReady = false;

            }

            console.log(this.posid + "," + self.isAdReady);


            return;
        }


        if (rewardedVideoAd) {
            rewardedVideoAd.destroy();
        }
        let adUnitId = this.posid;
        console.log(adUnitId)
        rewardedVideoAd = this.qg.createRewardedVideoAd({
            adUnitId: adUnitId,
            // success: (code) => {
            //     console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd: success");
            // },
            // fail: (data, code) => {
            //     console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd fail: " + data + "," + code);
            // },
            // complete: () => {
            //     console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd complete");
            // }
        });
        let onloadcb = function () {
            console.log(self.posid + ',ad loaded.')
            self.isAdReady = true;
            // rewardedVideoAd.show()
            rewardedVideoAd.offLoad(onloadcb);
        }
        rewardedVideoAd.onLoad(onloadcb);
        let onerrcb = function (e) {
            self.isAdReady = false;


            const errCode = e.errCode
            const errMsg = e.errMsg
            self._failCallback && self._failCallback('load ad error:' + JSON.stringify(e));
            rewardedVideoAd.offError(onerrcb)

            console.error(self.posid + ',load ad error:' + JSON.stringify(e));
            //加载失败3秒后继续加载
            loadfalse && loadfalse();
        }
        rewardedVideoAd.onError(onerrcb)

        let cbc = function (res) {
            console.log('ad onClose: ' + res.isEnded)
            if (res.isEnded) {
                self._successCallback && self._successCallback();
            } else {
                self._failCallback && self._failCallback();

            }




            rewardedVideoAd.destroy();
            rewardedVideoAd = null;

            // self.preLoadAd();
        }

        rewardedVideoAd.offClose(cbc)
        rewardedVideoAd.onClose(cbc)
        rewardedVideoAd.load();
        this.rewardedVideoAd = rewardedVideoAd;
    }

    public loadAdnShow(_successCallback: any, _failCallback: any): void {
        this._successCallback = _successCallback;
        this._failCallback = _failCallback;
        console.log(this.posid);

        let self = this;
        if (!this.qg) {
            //	console.log('非小游戏平台')

             self.scount = this.scount + 1;
             console.log(self.scount)
            if (this.scount % 2 == 0) {
                self.isAdReady = true;
            } else {
                self.isAdReady = false;

            }

            if (this.isAdReady) {
                console.log('返回测试成功')
                this._successCallback && this._successCallback();
              //  this.preLoadAd();
            } else {
                console.log(' 返回测试失败')
                this._failCallback && this._failCallback();
              //  this.preLoadAd();
            }

            return;


        }
       
        if (rewardedVideoAd) {
            rewardedVideoAd.destroy();
        }
        let adUnitId = this.posid;
        console.log(adUnitId)
        rewardedVideoAd = this.qg.createRewardedVideoAd({
            adUnitId: adUnitId,
            // success: (code) => {
            //     console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd: success");
            // },
            // fail: (data, code) => {
            //     console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd fail: " + data + "," + code);
            // },
            // complete: () => {
            //     console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd complete");
            // }
        });
        let onloadcb = function () {
            console.log(self.posid + ',ad loaded.')
            self.isAdReady = true;
            // rewardedVideoAd.show()
            rewardedVideoAd.offLoad(onloadcb);
            rewardedVideoAd.show();
        }
        rewardedVideoAd.onLoad(onloadcb);
        let onerrcb = function (e) {
            self.isAdReady = false;


            const errCode = e.errCode
            const errMsg = e.errMsg
            self._failCallback && self._failCallback('load ad error:' + JSON.stringify(e));
            rewardedVideoAd.offError(onerrcb)

            console.error(self.posid + ',load ad error:' + JSON.stringify(e));
            //加载失败3秒后继续加载
            _failCallback && _failCallback(0);
        }
        rewardedVideoAd.onError(onerrcb)

        let cbc = function (res) {
            console.log('ad onClose: ' + res.isEnded)
            if (res.isEnded) {
                self._successCallback && self._successCallback();
            } else {
                self._failCallback && self._failCallback(1);

            }




            rewardedVideoAd.destroy();
            rewardedVideoAd = null;

            // self.preLoadAd();
        }

        rewardedVideoAd.offClose(cbc)
        rewardedVideoAd.onClose(cbc)
        rewardedVideoAd.load();
        this.rewardedVideoAd = rewardedVideoAd;


    }



}
