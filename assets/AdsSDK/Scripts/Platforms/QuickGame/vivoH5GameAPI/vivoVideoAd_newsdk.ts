// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdInteface from "../../../Tool/AdInteface_newsdk";

export default class vivoVideoAd extends AdInteface {

    private posid:string=null;
    qg = window["qg"];
     rewardedVideoAd: any;
     _successCallback: Function = null;
	_failCallback?: Function = null;

    isAdReady:boolean=false;
    public initData(posid: string) {
       this.posid=posid;
    }
    
    public isReady() {
       return this.isAdReady;
    }
    public show(any,_successCallback,_failCallback) {
        console.log("Oppo激励视频=============:");
		if (this.qg !== null && this.qg !== undefined) {
			this._successCallback = _successCallback;
			this._failCallback = _failCallback;
			
				// this.showToast('创建广告');
				// _failCallback && _failCallback();
			
				
			if (this.rewardedVideoAd&&this.isAdReady) {
                this.rewardedVideoAd.show();
                this.isAdReady=false;
            }else{
                this.preLoadAd();
            }
		}
        console.log("Create RewardeVideoAd");

    }

	public loadAdnShow(_successCallback,_failCallback){
		console.log("==loadAdnShow==")
		this._successCallback = _successCallback;
		this._failCallback = _failCallback;
		this.preLoadAd(null,()=>{

			this.show("",_successCallback,_failCallback);

		});

	}
    public preLoadAd(fasecb?,loadsuccess?) {
		console.log(this.posid);
        if (this.qg !== null && this.qg !== undefined) {
			try {
				if (this.qg !== null && this.qg !== undefined) {
					console.log("创建OPPO激励视频广告");
                    this.isAdReady=false;

					if (this.rewardedVideoAd) {
						//   TipUtils.showTip("Oppo平台 销毁激励视频广告");
						this.rewardedVideoAd.destroy();
						this.rewardedVideoAd = null;
					}

					this.rewardedVideoAd = window["qg"].createRewardedVideoAd({
						adUnitId:this.posid,
					});
					this.rewardedVideoAd.load();
					this.rewardedVideoAd.onLoad(() => {
						console.log("rewardedVideoAd:loaded");
                        this.isAdReady=true;
						loadsuccess&&loadsuccess();
					});
					this.rewardedVideoAd.onError((err) => {
						console.log("onError:" + JSON.stringify(err));
					
						this._failCallback && this._failCallback();
						this._failCallback = null;
						fasecb&&fasecb();
					});
					this.rewardedVideoAd.onClose((res) => {
						if (res == undefined) {
							//看完广告,给奖励
							console.log("res == undefined");
                           
							this._successCallback && this._successCallback();
							this._successCallback = null;
						} else {
							// 用户点击了【关闭广告】按钮
							console.log("==> oppoRewardVideoAd onClose", res);
							if (res.isEnded) {
                             
								this._successCallback && this._successCallback();
								this._successCallback = null;
							} else {
								this._failCallback && this._failCallback(1);
								this._failCallback = null;
								console.log("广告没看完");
							}
						}
					});
					this.rewardedVideoAd.onClick((obj) => {
						console.log(
							`开启激励视频广告点击回调: code: ${obj.code},msg: '${obj.msg}'`
						);
					});
				}
			} catch (error) {
				this._failCallback && this._failCallback();
				this._failCallback = null;
				console.log("oppoRewardVideoAd error", error);
			}
		}
    }


    
}
