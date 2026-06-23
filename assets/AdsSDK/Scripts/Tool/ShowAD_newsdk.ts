// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame_newsdk";

import LocalStorageManager, { ADTime2Mode } from "./LocalStorageManager_newsdk";

const { ccclass, property } = cc._decorator;

export enum ADMode {
	Normal,
	Time,
	Date,
}

@ccclass
export default class ShowAD extends cc.Component {
	@property
	public Banner = false;

	@property
	public CloseRefresh = false;

	@property
	public HideAD = true;

	@property
	public oppoAD = 1;

	@property
	public vivoAD = 1;


	/** 广告模式 */
	vivoAdCorrective: ADMode = ADMode.Normal;
	oppoAdCorrective: ADMode = ADMode.Normal;

	insertInterval: any = null;
	bannerInterval: any = null;

	protected onEnable(): void {
		console.log("onEnable");
		this.ShowADMode();
	}

	ShowADMode() {
		console.log("Enter ShowAd src");
		//vivo

		if (SDK_Manager.prototype.isVivo()) {
			switch (this.vivoAdCorrective) {
				case ADMode.Normal:
					this.VivoNormalMode();
					break;
				case ADMode.Time:
					this.VivoTimeMode();
					break;
				case ADMode.Date:
					this.VivoDateMode();
					break;
			}
		}

		//oppo
		if (SDK_Manager.prototype.isOppo()) {
			switch (this.oppoAdCorrective) {
				case ADMode.Normal:
					this.OPPOInsertAD();
					this.OPPOBannerAD();
					break;
				case ADMode.Time:
					this.OppoTimeMode();
					break;
				case ADMode.Date:
					this.OppoTimeMode();
					break;
			}
		}

		//头条
		if (
			SDK_Manager.getInstance().isToutiao() ||
			SDK_Manager.getInstance().isWeixin()
		) {
			setTimeout(() => {
				Platforms_QuickGame.getInstance().showInsertAd();
			}, 300);
		}
	}

	/**
	 * Vivo正常方案
	 */
	VivoNormalMode() {
		if (LocalStorageManager.prototype.ADTime() < 5) {
			console.log("ADTime() < 5");
		} else {
			this.VIVOInsertAD();
			// this.VIVOBannerAD();
		}
	}

	/**
	 * Vivo时间方案
	 */
	VivoTimeMode() {
		switch (LocalStorageManager.prototype.ADTime2()) {
			case ADTime2Mode.PureMode:
				console.log("PureMode");
				console.log(`ysgg == ${this.HideAD} `);

				if (!this.HideAD) {
					this.VIVOInsertAD();
				}
				if (this.Banner && this.CloseRefresh) {
					this.VIVOBannerAD();
				}
				break;
			case ADTime2Mode.BacklashMode:
				console.log("BacklashMode");
				this.VIVOInsertAD();
				this.VIVOBannerAD();
				break;
			case ADTime2Mode.NormalMode:
				console.log("NormalMode");
				if (LocalStorageManager.prototype.ADTime() < 5) {
					console.log("ADTime() < 5");
				} else {
					this.VIVOInsertAD();
					this.VIVOBannerAD();
				}
				break;
		}
	}

	/**
	 * Vivo日期方案
	 */
	VivoDateMode() {
		if (LocalStorageManager.prototype.ADTime3()) {
			console.log(
				`${
					this.node.name
				} : ADTime3() == ${LocalStorageManager.prototype.ADTime3()}, HideAD = ${
					this.HideAD
				}`
			);
		} else {
			if (LocalStorageManager.prototype.ADTime3()) {
				console.log("结算暂停正常广告");
				this.VIVOInsertAD();
				this.VIVOBannerAD();
			} else {
				if (this.HideAD) {
					this.VIVOInsertAD();
					this.VIVOBannerAD();
				} else {
					this.VIVOInsertAD();
					this.VIVOBannerAD();
				}
			}
		}
	}

	/**
	 * vivo插屏广告
	 * @param timeout 广告出现延迟时间，默认1秒
	 */

	VIVOInsertAD(): void {
		setTimeout(() => {
			switch (this.vivoAD) {
				case 0:
					Platforms_QuickGame.getInstance().showVivoNativeAD();
					break;
				case 1:
					Platforms_QuickGame.getInstance().showVivoNativeAD1();
					break;
				case 2:
					Platforms_QuickGame.getInstance().showVivoNativeAD2();
					break;
				default:
					Platforms_QuickGame.getInstance().showVivoNativeAD1();
					break;
			}
			// Platforms_QuickGame.getInstance().showInsertAd();
		}, 300);
		console.log(this.node.name + " : Show Vivo InsertAD");
	}
	/**
	 * vivo底边横屏广告
	 * @param refreshAD 是否按秒数刷新广告,默认ture
	 * @param refreshTime 刷新秒数 底边横屏默认15秒
	 */
	VIVOBannerAD(): void {
		if (this.Banner === true) {
			console.log("Show Vivo BannerAD");
			Platforms_QuickGame.getInstance().showBanner();
		}
		// if (refreshAD) {
		// 	this.bannerInterval = setInterval(() => {
		// 		Platforms_QuickGame.getInstance().showBanner();
		// 		console.log("RefreshAD Vivo BannerAD");
		// 	}, refreshTime * 1000);
		// }
	}
	/**
	 * oppo插屏广告
	 * @param refreshAD 是否按秒数刷新广告,默认ture
	 * @param refreshTime 刷新秒数 插屏默认90秒
	 */
	OPPOInsertAD(): void {
		setTimeout(() => {
			console.log("OPPOHighONativeAd(" + this.oppoAD + ")");
			switch (this.oppoAD) {
				case 0:
					Platforms_QuickGame.getInstance().OPPOHighONativeAd(0);
					break;
				case 1:
					Platforms_QuickGame.getInstance().OPPOHighONativeAd(1);
					break;
				case 2:
					Platforms_QuickGame.getInstance().OPPOHighONativeAd(2);
				default:
					Platforms_QuickGame.getInstance().OPPOHighONativeAd(1);
					break;
			}
		}, 300);

		console.log("Show OPPO InsertAD");
	}
	/**
	 * oppo底边横屏广告
	 * @param refreshAD 是否按秒数刷新广告,默认ture
	 * @param refreshTime 刷新秒数 底边横屏默认15秒
	 */
	OPPOBannerAD(): void {
		if (this.Banner === true) {
			console.log("Show OPPO BannerAD");
			//Platforms_QuickGame.getInstance().OPPOBannerNativeAd();
			Platforms_QuickGame.getInstance().showBanner();
		}
	}

	/**
	 * Oppo时间方案
	 */
	OppoTimeMode() {
		switch (LocalStorageManager.prototype.ADTime2()) {
			case ADTime2Mode.PureMode:
				console.log("PureMode");
				console.log(`ysgg == ${this.HideAD} `);

				if (!this.HideAD) {
					this.OPPOInsertAD();
				}
				if (this.Banner && this.CloseRefresh) {
					this.OPPOBannerAD();
				}
				break;
			case ADTime2Mode.BacklashMode:
				console.log("BacklashMode");
				this.OPPOInsertAD();
				this.OPPOBannerAD();
				break;
			case ADTime2Mode.NormalMode:
				console.log("NormalMode");
				this.OPPOInsertAD();
				this.OPPOBannerAD();
				break;
		}
	}

	/**
	 * 清除不停刷新的广告
	 */
	ClearInterval() {
		if (this.bannerInterval != null) {
			console.log(`clearBannerInterval : ${this.node.name}`);
			clearInterval(this.bannerInterval);
		}
		if (this.insertInterval != null) {
			console.log(`clearInsertInterval : ${this.node.name}`);
			clearInterval(this.insertInterval);
		}
	}

	protected onDisable(): void {
		// this.ClearInterval();

		if (this.CloseRefresh) {
			if (SDK_Manager.prototype.isVivo()) {
				switch (this.vivoAdCorrective) {
					case ADMode.Normal:
						console.log("sxsj Normal");
						if (LocalStorageManager.prototype.ADTime() < 5) {
							console.log("ADTime() < 5");
							return;
						} else {
							Platforms_QuickGame.getInstance().showVivoNativeAD1();
							// // Platforms_QuickGame.getInstance().showInsertAd();
							// this.VIVOBannerAD(false);
						}
						break;
					case ADMode.Time:
						if (
							LocalStorageManager.prototype.ADTime2() !== ADTime2Mode.PureMode
						) {
							console.log("sxsj time");
							Platforms_QuickGame.getInstance().showVivoNativeAD1();
							// Platforms_QuickGame.getInstance().showInsertAd();
							this.VIVOBannerAD();
						} else {
							console.log(
								"LocalStorageManager.prototype.ADTime2() !== ADTime2Mode.PureMode"
							);
						}
						break;
					case ADMode.Date:
						if (LocalStorageManager.prototype.ADTime3()) {
							console.log(
								`${
									this.node.name
								} : sxsj ADTime3() == ${LocalStorageManager.prototype.ADTime3()} `
							);
						} else {
							console.log("sxsj");
							Platforms_QuickGame.getInstance().showVivoNativeAD1();
							// Platforms_QuickGame.getInstance().showInsertAd();
							this.VIVOBannerAD();
						}
						break;
				}
			}
			//oppo判断
			if (SDK_Manager.prototype.isOppo()) {
				switch (this.oppoAdCorrective) {
					case ADMode.Normal:
						console.log("sxsj Normal");
						if (LocalStorageManager.prototype.ADTime() < 5) {
							console.log("ADTime() < 5");
							return;
						} else {
                            Platforms_QuickGame.getInstance().OPPOHighONativeAd(1);
                            this.OPPOBannerAD();
						}
						break;
					case ADMode.Time:
						if (
							LocalStorageManager.prototype.ADTime2() !== ADTime2Mode.PureMode
						) {
							console.log("sxsj time");
							Platforms_QuickGame.getInstance().OPPOHighONativeAd(1);
							this.OPPOBannerAD();
						} else {
							console.log("ADTime2 !== PureMode");
						}
						break;
				}
			}
		}
	}
}
