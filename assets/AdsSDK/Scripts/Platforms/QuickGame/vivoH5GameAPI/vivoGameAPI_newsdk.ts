import { PlatformsInterface } from "../PlatformsInterface_newsdk";
import SDK_config from "../../../SDK_config_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";
import LocalStorageManager from "../../../Tool/LocalStorageManager_newsdk";
import AdInteface from "../../../Tool/AdInteface_newsdk";
import vivoNativeAd from "./vivoNativeAd_newsdk";
import vivoInsertAd from "./vivoInsertAd_newsdk";
import vivoVideoAd from "./vivoVideoAd_newsdk";
import vivoNativeBanner from "./vivoNativeBanner_newsdk";

var nativeAd: any;
var bannerAd: any;
var rewardedVideoAd: any;

export default class vivoGameAPI implements PlatformsInterface {
   
	qg = window["qg"];

	private lastNativeInsertTimeRecord3: number = 0;
	/**视频广告是否已经load到数据 */
	m_videoAdIsLoaded: boolean = false;
	tnativeid: any = "";
	/**设备像素width */
	customAD: any;
	customBAD: any;
	windowWidth: number = 0;
	/**设备像素height */
	windowHeight: number = 0;
	static isAD: boolean = false;

        /**原生组 */
        nactivearr: AdInteface[] = null;
        /**插屏组 */
       IntersArr: AdInteface[]=null;
     /**激励视频组 */
        viodeosArr: AdInteface[]=null;
       /**banner组 */
       bannerArr: AdInteface[]=null;

	onInit(_callback: Function) {
		if (cc.sys.os === cc.sys.OS_WINDOWS) {
			console.log("==OS_WINDOWS==");
			// SDK_config.nativeTest = true;
			// SDK_config.ADTest = true;
			_callback&&_callback();
			// return
		}
		// this.createVideo();
		var showf = function () {
			console.log("game enter foreground");
		};

		// this.GetS();
		this.qg && this.qg.onShow(showf);
		var hidef = function () {
			console.log("game enter background");
		};
		this.qg && this.qg.onHide(hidef);

        this.nactivearr=this.initgetInarr();
        this.IntersArr=this.initIntersArr();
        this.viodeosArr=this.initVideoArr();
        this.bannerArr=this.initBannerArr();
		//this.preloadVideo(0);

		_callback&&_callback();
	}
	

    /**原生插屏 */
    private initgetInarr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

		console.log(SDK_config.GameIdConfig.vivoID)
        inaarr = SDK_config.GameIdConfig.vivoID.NativeAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: vivoNativeAd = new vivoNativeAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
   
    private initIntersArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.vivoID.InsertAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: vivoInsertAd = new vivoInsertAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
    private initVideoArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.vivoID.rewardedVideoAdId
        for (let i = 0; i < inaarr.length; i++) {
            let anad: vivoVideoAd = new vivoVideoAd();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
    private initBannerArr() {

        let nactivearr: AdInteface[] = [];

        let inaarr: string[];

        inaarr = SDK_config.GameIdConfig.vivoID.NativeAdbanner
        for (let i = 0; i < inaarr.length; i++) {
            let anad: vivoNativeBanner = new vivoNativeBanner();
            anad.initData(inaarr[i]);
            nactivearr[i] = anad;
        }


        return nactivearr;
    }
	

	share(_callback: Function) {}
	shareVideo(_successCallback: Function, _failCallback: Function) {}
	showVivoNativeADdb() {
		// this.hideBanner();
		//this.hideVivoNativeBannerAD();

		if (this.qg != null && this.qg != undefined) {
			// let theTime = new Date().getTime() / 1000;
			// if (theTime - this.ADCD <= 5) {
			// 	console.log(5 - (theTime - this.ADCD) + "秒后再试 ");
			// 	return;
			// }
			let res = this.qg.getSystemInfoSync();
			this.windowWidth = res.windowWidth;
			this.windowHeight = res.windowHeight;
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["NativeAdId"],
					style: {},
				});
				console.log(
					"调用到了1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~0"
				);
				this.customAD.onError((err) => {
					console.log("原生模板广告加载失败", err);
				});
				this.customAD.onClose(()=>{
					this.showVivoNativeAD1()
				})
				this.customAD
					.show()
					.then(() => {
						console.log("原生模板广告展示完成");
                        this.ADCD = new Date().getTime() / 1000;
					})
					.catch((err) => {
						console.log("原生模板广告展示失败", JSON.stringify(err));
						//  this.showInsertAd();
					});
			}
		
		}
	}
	showVivoNativeAD() {
		// this.hideBanner();
		//this.hideVivoNativeBannerAD();

		if (this.qg != null && this.qg != undefined) {
			// let theTime = new Date().getTime() / 1000;
			// if (theTime - this.ADCD <= 5) {
			// 	console.log(5 - (theTime - this.ADCD) + "秒后再试 ");
			// 	return;
			// }
			let res = this.qg.getSystemInfoSync();
			this.windowWidth = res.windowWidth;
			this.windowHeight = res.windowHeight;
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["NativeAdId"],
					style: { top: this.windowHeight / 3 },
				});
				console.log(
					"调用到了1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~0"
				);
				this.customAD.onError((err) => {
					console.log("原生模板广告加载失败", err);
				});
				this.customAD
					.show()
					.then(() => {
						console.log("原生模板广告展示完成");
                        this.ADCD = new Date().getTime() / 1000;
					})
					.catch((err) => {
						console.log("原生模板广告展示失败", JSON.stringify(err));
						//  this.showInsertAd();
					});
			}
		
		}
	}

	showVivoNativeAD1() {
		//this.hideVivoNativeBannerAD();

		if (this.qg != null && this.qg != undefined) {
			let theTime = new Date().getTime() / 1000;
			// if (theTime - this.ADCD <= 5) {
			// 	console.log(5 - (theTime - this.ADCD) + "秒后再试 ");
			// 	return;
			// }
			let res = this.qg.getSystemInfoSync();
			this.windowWidth = res.windowWidth;
			this.windowHeight = res.windowHeight;
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["NativeAdId"],
					style: { },
				});
				console.log(
					"1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~1"
				);
				this.customAD.onError((err) => {
					console.log("原生模板广告2加载失败", err);
					// this.showInsertAd();
				});
				this.customAD
					.show()
					.then(() => {
						console.log("原生模板广告2展示完成");
                        this.ADCD = new Date().getTime() / 1000;
					})
					.catch((err) => {
						console.log("原生模板广告2展示失败", JSON.stringify(err));
					});
			}
			
		}
	}

	showVivoNativeAD3() {
		//this.hideVivoNativeBannerAD();
		console.log(
			"2~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
		);
		if (this.qg != null && this.qg != undefined) {
			let res = this.qg.getSystemInfoSync();
			this.windowWidth = res.windowWidth;
			this.windowHeight = res.windowHeight;
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["NativeAdId2"],
					style: { top: this.windowHeight / 3 },
				});

				this.customAD.onError((err) => {
					console.log("原生模板广告2加载失败", err);
					// this.showInsertAd();
				});
				this.customAD
					.show()
					.then(() => {
						console.log("原生模板广告2展示完成");
                        this.ADCD = new Date().getTime() / 1000;
					})
					.catch((err) => {
						console.log("原生模板广告2展示失败", JSON.stringify(err));
					});
			}
		
		}
	}

	showVivoNativeAD2() {
		// this.hideBanner();
		//this.hideVivoNativeBannerAD();

		if (this.qg != null && this.qg != undefined) {
			let theTime = new Date().getTime() / 1000;
			if (theTime - this.ADCD <= 5) {
				console.log(5 - (theTime - this.ADCD) + "秒后再试 ");
				return;
			}
			let res = this.qg.getSystemInfoSync();
			this.windowWidth = res.windowWidth;
			this.windowHeight = res.windowHeight;
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["NativeAdId"],
					style: { top: this.windowHeight / 1.8 },
				});
				console.log(
					"1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~2"
				);
				this.customAD.onError((err) => {
					console.log("原生模板广告2加载失败", err);
					// this.showInsertAd();
				});
				this.customAD
					.show()
					.then(() => {
						console.log("原生模板广告2展示完成");
                        this.ADCD = new Date().getTime() / 1000;
					})
					.catch((err) => {
						console.log("原生模板广告2展示失败", JSON.stringify(err));
					});
			}
			
		}
	}
	showVivoNativeBannerAD() {
		this.hideBanner();
		this.hideVivoNativeBannerAD();

		if (this.qg != null && this.qg != undefined) {
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["BNativeAdId"],
					style: {},
				});
				console.log("调用到了vivoNativeAD");
				this.customAD.onError((err) => {
					console.log("原生模板广告加载失败", err);
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
	showVivoNativeBannerAD1() {
		this.hideBanner();
		this.hideVivoNativeBannerAD();
		let res = this.qg.getSystemInfoSync();
		this.windowWidth = res.screenWidth;
		this.windowHeight = res.screenHeight;
		if (this.qg != null && this.qg != undefined) {
			if (this.qg.createCustomAd) {
				this.customAD = this.qg.createCustomAd({
					posId: SDK_config.GameIdConfig.vivoID["BNativeAdId"],
					style: {
						top: 0,
					},
				});
				console.log("调用到了vivoNativeAD");
				this.customAD.onError((err) => {
					console.log("原生模板广告加载失败", err);
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
	hideVivoNativeBannerAD() {
		// if (this.customBAD != null) {

		//     this.customBAD.destroy();
		// }
		if (this.customAD != null) {
			this.customAD.destroy();
		}
		console.log("vivoH5GameAPI hideBanner");
	}
    testBanner(){
        let self = this;
        this.createNative(function (adres) {
            let del = {
                onNativeAdClick: self.onNativeAdClick,
                res: adres,
                adType: 1,
            }
            UISDK_Manager_newsdk.getInstance().showUI('demo_banner', del);

        }, SDK_config.GameIdConfig.oppoID.bannerAdId);
    }
    showBanner(_arg?: any) {
      
        if (SDK_config.nativeTest) {
            this.testBanner();
            return;
        }
        this.showBanner1(_arg,0);

    }
    /**当前banner广告索引 */
    bannerIdIndex:number=0;
    showBanner1(_arg?: any,count?: number) {
        if (count >=this.bannerArr.length) {
			console.log("count >=bannerArr.length");
			return;
		}
        let bid=this.bannerIdIndex;
        let count1=count+1;
        let inaarr = this.bannerArr;
       
        inaarr[bid].show(_arg, (str) => {
            if (str == "0") {
                for (let i = 0; i < inaarr.length; i++) {
                    if (bid != i) {
                        inaarr[i].hide();
                    }

                }
                console.log("showbaner:" + bid);
            } else {
                this.showBanner1(_arg,count1);

            }
        });

    }
    

       /**新原生方法 */
    showCommonNative() {
        console.log("showCommonNative")

        this.showCommonNative1(0);
    }

    
     showCommonNative1( count?: number) {
       

       
         let inaarr = this.nactivearr;

         if (count >= inaarr.length) {
            console.log("count >=nativeArr.length");
            return;
        }
        let count1 = count + 1;
         inaarr[count].show(null, (str) => {
             if (str == "0") {
                 for (let i = 0; i < inaarr.length; i++) {
                     if (count != i) {
                         inaarr[i].hide();
                     }
 
                 }
                 console.log("showCommonNative1:" + count);
             } else {
                 this.showCommonNative1(count1);
 
             }
         });
 
       
 
     }
	 isNumeric(value) {
        return !isNaN(parseInt(value)) && isFinite(value);
    }

    /**新插屏方法 */
    showCommonInsert(_arg?,_successCallback?,falseCallback?) {
   
        console.log("showCommonInsert")
   
        // this.showCommonInsert1(0);

		// let inaarr = this.IntersArr;
		let inaarr = this.nactivearr;
		
		let cb=(str)=>{
            if (str=="0") {
                _successCallback&&_successCallback()
            }else{
                falseCallback&&falseCallback()
            }
            
        }

        let idindex=0
        if (_arg) {
          
            if (this.isNumeric(_arg)) {
                let intn=parseInt(_arg)
                if (inaarr[intn]) {
                    idindex=intn     
					console.log("正常弹出插屏");               
                }else{
                    console.log("数字越界：默认第一个插屏"+intn);
                    idindex=0;
                }
                
            }else{
                console.log("非数字,默认第一个插屏");
                idindex=0;
            }
        }else{

             idindex=0;
             console.log("默认插屏");
        }
        inaarr[idindex].show(100,cb);
    }

    showCommonInsert1(count?: number) {
    
   
        let inaarr = this.IntersArr;
        if (count >= inaarr.length) {
            console.log("count >=nativeArr.length");
            return;
        }
        let count1 = count + 1;
         inaarr[count].show(null, (str) => {
             if (str == "0") {
                 for (let i = 0; i < inaarr.length; i++) {
                     if (count != i) {
                         inaarr[i].hide();
                     }
 
                 }
                 console.log("showCommonNative1:" + count);
             } else {
                 this.showCommonInsert1(count1);
 
             }
         });
    }


	preloadVideo(count:number=0){
        if (count >= this.viodeosArr.length) {
            console.log("count >=viodeosArr.length");
            return;
        }
        let inaarr = this.viodeosArr;
        let count1 = count + 1;
        if (inaarr[count].isReady()) {
           

            return;
        } else {
            inaarr[count].preLoadAd(()=>{
                this.preloadVideo(count1);
            });
        }

    }

    ADCD = 0;
    showCommonVideo(_arg,_successCallback, _failCallback) {

        let theTime = new Date().getTime() / 1000;
        if (theTime - this.ADCD <= 2) {
            console.log(2 - (theTime - this.ADCD) + "秒后再试 ");
            return;
        }
        this.ADCD = new Date().getTime() / 1000;

        let inaarr = this.viodeosArr;

        // for (let j = 0; j < inaarr.length; j++) {

        //     if (inaarr[j].isReady()) {
        //         inaarr[j].show("", _successCallback, _failCallback);

        //         return;
        //     } 
        // }
        // console.log("没有获取到广告")
        // // _failCallback&&_failCallback();
        // // this.preloadVideo(0)

		let id=0;
        if (this.isNumeric(_arg)) {
           let intn=parseInt(_arg)
       
           if (inaarr[intn]) {
               id=intn
           }else{
               console.log("数字越界："+intn);
           }
         
       }else{
           console.log("非数字,默认第一个");
       }

         if (inaarr[id]) {
            inaarr[id].loadAdnShow( _successCallback, _failCallback);
         }

    }

	hideBanner() {
		if (SDK_config.nativeTest) {
			UISDK_Manager_newsdk.getInstance().hideUI("demo_banner");
			return;
		}

		if (bannerAd != null) {
			let addestroy = bannerAd.destroy();
			addestroy &&
				addestroy
					.then(() => {
						console.log("banner广告销毁成功");
					})
					.catch((err) => {
						console.log("banner广告销毁失败", err);
					});
			bannerAd = null;
		}
		console.log("vivoH5GameAPI hideBanner");
	}
	createVideo() {
		if (this.qg != null && this.qg != undefined) {
			if (this.qg.getSystemInfoSync().platformVersionCode < 1041) {
				console.log("=================>版本过低不能创建激励视频");
				return;
			}
			if (rewardedVideoAd) {
				rewardedVideoAd = null;
			}
			rewardedVideoAd = this.qg.createRewardedVideoAd({
				posId: SDK_config.GameIdConfig.vivoID["rewardedVideoAdId"],
			});
			rewardedVideoAd.onLoad(() => {
				console.log("onload激励视频广告加载成功");
				this.m_videoAdIsLoaded = true;
			});
			rewardedVideoAd.onError((err) => {
				console.log("onload激励视频广告加载失败", err);
				this.m_videoAdIsLoaded = false;
			});
		}
		console.log("vivoH5GameAPI createVideo");
	}
	showVideo(
		_successCallback: Function,
		_failCallback?: Function,
		_showCallback?: any,
		_closeCallback?: any
	) {
		if (SDK_config.nativeTest) {
			if (Math.random() * 100 < 70) {
				let obj = {
					scb: _successCallback,
					fcb: _failCallback,
					showcb: _showCallback,
					closecb: _closeCallback,
				};
				UISDK_Manager_newsdk.getInstance().showUI("demo_video", obj);
			} else {
				_failCallback && _failCallback();
			}

			return;
		}
		if (rewardedVideoAd && this.m_videoAdIsLoaded) {
			rewardedVideoAd.show();

			const onCloseFunc = (res) => {
				console.log("reward ad call back####################################");
				if (res && res.isEnded) {
					console.log("onClose正常播放结束，可以下发游戏奖励");
					_successCallback && _successCallback();
					this.m_videoAdIsLoaded = false;
					this.createVideo();
				} else {
					console.log("onClose播放中途退出，不下发游戏奖励");
					_failCallback && _failCallback();
					this.m_videoAdIsLoaded = false;
					this.createVideo();
				}

				rewardedVideoAd.offClose(onCloseFunc);
			};

			rewardedVideoAd.onClose(onCloseFunc);
		} else {
			this.createVideo();
			this.showToast("视频尚未准备好，请稍后再试");
			console.log("视频尚未准备好，请稍后再试");
			_successCallback && _successCallback();
		}
	}

	showInsertAd() {
		this.hideVivoNativeBannerAD();
		if (this.qg != null && this.qg != undefined) {
			let interstitialAd = this.qg.createInterstitialAd({
				posId: SDK_config.GameIdConfig.vivoID.InsertAdId,
			});
			interstitialAd.onError((err) => {
				console.log("插屏广告加载失败", err);
			});

			interstitialAd
				.show()
				.then(() => {
					console.log("插屏广告展示完成");
				})
				.catch((err) => {
					console.log("插屏广告展示失败", JSON.stringify(err));
				});
		}
	}
	hideInsertNativeAd() {
		UISDK_Manager_newsdk.getInstance().hideUI("NativeAd_vivo");
	}
	createNative(callback, nativeid = null) {
		let self = this;

		let theTime = new Date().getTime() / 1000;
		if (theTime - this.lastNativeInsertTimeRecord3 <= 2) {
			console.log(
				2 - (theTime - this.lastNativeInsertTimeRecord3) + "秒后再试 native"
			);
			return;
		}
		this.lastNativeInsertTimeRecord3 = new Date().getTime() / 1000;
		try {
			var curnativeid = SDK_config.GameIdConfig.vivoID.NativeAdId;
			if (nativeid && nativeid != "") {
				curnativeid = nativeid;
			}
			console.log("curnativeid :" + curnativeid);

			if (SDK_config.nativeTest) {
				let res1 = {
					adId: "9b70dcaa-321f-4114-aa4d-b2630adebfe8",
					clickBtnTxt: "点击安装",
					creativeType: 8,
					desc: "蒙古手撕牛肉干降价了",
					icon: "http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",
					iconUrlList: [
						"http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",
					],
					imgUrlList:
						"http://images.pinduoduo.com/marketing_api/2020-05-17/fd8e685c-f0e0-443a-8088-0fd4bfd9e035.jpg",

					length: 3,
					__proto__: Array(0),
					interactionType: 2,
					logoUrl: "",
					title: "拼多多",
				};

				let res = {
					adList: [res1],
					code: 0,
					msg: "ok",
				};
				callback(res);

				return;
			}

			let qg = window["qg"];

			if (this.tnativeid != curnativeid) {
				this.tnativeid = curnativeid;
				console.log(" this.tnativeid :" + curnativeid);
				nativeAd = qg.createNativeAd({
					posId: curnativeid,
				});
			}

			nativeAd.load();

			let onLoadFun = function (res) {
				console.log("原生广告加载成功");
				if (res && res.adList) {
					for (let i in res.adList[0]) {
						console.log(i + "," + res.adList[0][i]);
					}
					console.log("上报广告成功", res.adList[0].adId.toString());

					nativeAd.reportAdShow({
						adId: res.adList[0].adId,
					});

					console.log("callback:res");
					callback(res);
					console.log("callback:over");
					nativeAd.offLoad(onLoadFun);
				}

				nativeAd.offLoad(onLoadFun);
			};
			nativeAd.onLoad(onLoadFun);

			let errFun = function (err) {
				console.log("原生广告加载失败");
				for (let i in err) {
					console.log(i + "," + err[i]);
				}
				callback();
				nativeAd.offError(errFun);
			};
			nativeAd.onError(errFun);
		} catch (error) {
			cc.log(error);
		}
	}
	onNativeAdClick(_id: string) {
		console.log("id :" + _id);
		console.log(nativeAd);

		nativeAd.reportAdClick({
			adId: _id,
		});
	}

	saveDataToCache(_key: string, _value: any) {}
	readDataFromCache(_key: string) {}
	hasShortcutInstalled(_callback: Function) {
		let qg: any = window["qg"];

		qg &&
			qg.hasShortcutInstalled({
				success: function (status) {
					if (status) {
						console.log("已创建");
						_callback && _callback(1);
					} else {
						console.log("未创建");
						_callback && _callback(0);
					}
				},
			});
	}
	addDesktopCdTime = 0;
	/**_callback(I):I:0成功，1失败，2已经存在 */
	addDesktop(_callback: Function) {
		let theTime = new Date().getTime() / 1000;
		// if (theTime - this.addDesktopCdTime <= 120) {
		// 	console.log(
		// 		"创建桌面有120秒的间隔：" + (theTime - this.addDesktopCdTime)
		// 	);
		// 	return;
		// }
		this.addDesktopCdTime = new Date().getTime() / 1000;

		let qg: any = window["qg"];
		qg &&
			this.hasShortcutInstalled(function (bool) {
				if (bool) {
					_callback && _callback(2);
				} else {
					qg.installShortcut({
						success: function () {
							console.log("创建成功");
							//   InsManager.GetInstance()._UIManager.ShowGameToast("创建成功，获得500金币",ToastType.Game);
							_callback && _callback(0);
						},
						fail: function () {
							console.log("创建失败");
							// InsManager.GetInstance()._UIManager.ShowGameToast("创建失败,休息两分钟再试",ToastType.Game);
							_callback && _callback(1);
						},
					});
				}
			});
	}
	startRecordScreen() {}
	stopRecordScreen() {}
	showMoreGames() {}
    blockBox(){}
	jumpToGame(_packageName: string) {}
	sendMessage(key: string, value: any) {}

	showToast(message: string) {
		this.qg.showToast({
			message: message,
		});
	}
}
