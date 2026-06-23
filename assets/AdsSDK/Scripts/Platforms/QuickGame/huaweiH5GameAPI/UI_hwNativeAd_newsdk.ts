// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDKWindow from "../../../FrameWork/UI/Module/UIWindow_newsdk";
import hwH5GameAPI from "./hwH5GameAPI_newsdk";
import Platforms_QuickGame from "../Platforms_QuickGame_newsdk";
import { PlatformsNativeInterface } from "../PlatformsNativeInterface_newsdk";
import DebugLog from "../../../FrameWork/Debug/DebugLog_newsdk";
import { bannerConfig } from "./hwNativeBanner_newsdk";
import Ads_Manager from "../../../Ads_Manager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UI_hwNativeAd_newsdk extends UISDKWindow {

    @property
    nativeType: number = 0;

    title: cc.Label = null;
    picture_icon: cc.Sprite = null;
    picture_ad: cc.Sprite = null;
    // ad_desc: cc.Label = null;
    // adSource: cc.Label = null;
    btn_clickAd: cc.Node = null;
    clickBtnTxt: cc.Label = null;
    bg_click: cc.Node = null;

    delcb: any = null;
    windowSize: cc.Size = null;

    //六要素
    sixcontent: cc.Node = null;
    appName: cc.Label = null;
    developerName: cc.Label = null;
    versionName: cc.Label = null;
    appDetailUrl: cc.Label = null;
    privacyUrl: cc.Label = null;
    permissionUrl: cc.Label = null;


    bigappname: cc.Label = null;


    guang_1: cc.Node = null;
    guang_2: cc.Node = null;
    guang_3: cc.Node = null;
    guang_4: cc.Node = null;



    pixelRatio: number = 1;
    onLoad() {
        let self = this;

        self.title = cc.find("title", self.node).getComponent(cc.Label);
        // self.adSource = cc.find("adflag/adSource", self.node).getComponent(cc.Label);
        self.picture_icon = cc.find("pictureMask/picture_icon", self.node).getComponent(cc.Sprite);
        self.picture_ad = cc.find("TwoCornerMask/picture_ad", self.node).getComponent(cc.Sprite);

        self.btn_clickAd = cc.find("btn_clickAd", self.node);
        self.clickBtnTxt = cc.find("btn_clickAd/clickBtnTxt", self.node).getComponent(cc.Label);

        self.bg_click = cc.find("bg_click", self.node);


        self.sixcontent = cc.find("sixcontent", self.node);

        self.appName = cc.find("appname", self.sixcontent).getComponent(cc.Label);
        self.bigappname = cc.find("bigappname", self.sixcontent).getComponent(cc.Label);

        self.developerName = cc.find("companyname", self.sixcontent).getComponent(cc.Label);
        self.versionName = cc.find("version", self.sixcontent).getComponent(cc.Label);
        self.appDetailUrl = cc.find("desc", self.sixcontent).getComponent(cc.Label);
        self.privacyUrl = cc.find("yinsi", self.sixcontent).getComponent(cc.Label);
        self.permissionUrl = cc.find("quanxian", self.sixcontent).getComponent(cc.Label);


        self.guang_1 = cc.find("guang_1", self.sixcontent);
        self.guang_2 = cc.find("guang_2", self.sixcontent);
        self.guang_3 = cc.find("guang_3", self.sixcontent);
        self.guang_4 = cc.find("guang_4", self.sixcontent);









    }

    onEnable() {
        super.onEnable();
        let self = this;


        //    DebugLog.log(this.node.parent);

        self.bg_click.on(cc.Node.EventType.TOUCH_END, self.onClickAd, self);
        self.btn_clickAd.on(cc.Node.EventType.TOUCH_END, self.onClickAd, self);

        self.appDetailUrl.node.on(cc.Node.EventType.TOUCH_END, self.appDetailUrlclick, self);
        self.privacyUrl.node.on(cc.Node.EventType.TOUCH_END, self.privacyUrlclick, self);
        self.permissionUrl.node.on(cc.Node.EventType.TOUCH_END, self.permissionUrlclick, self);



    }
    onDisable() {
        super.onDisable();

        let self = this;
        self.bg_click.off(cc.Node.EventType.TOUCH_END, self.onClickAd, self);
        self.btn_clickAd.off(cc.Node.EventType.TOUCH_END, self.onClickAd, self);

        self.appDetailUrl.node.off(cc.Node.EventType.TOUCH_END, self.appDetailUrlclick, self);
        self.privacyUrl.node.off(cc.Node.EventType.TOUCH_END, self.privacyUrlclick, self);
        self.permissionUrl.node.off(cc.Node.EventType.TOUCH_END, self.permissionUrlclick, self);

        self.delcb.hideDownloadButton && self.delcb.hideDownloadButton(this.delcb.res.adList[0].adId)
    }
    onClickAd() {
        DebugLog.log('onClickAd');

        this.node.active = false;
        this.delcb.onNativeAdClick(this.delcb.res.adList[0].adId)

    }
    dealNativeBanner() {
        let winHeight = cc.winSize.height;
        let winWidth = cc.winSize.width;
        let self = this;



        let bc: bannerConfig = this.delcb.bc;
        if (bc) {

            let prehe = winWidth * 10 / 10;
            let scal = prehe / self.node.width * bc.bannerSize / 100
            self.node.scaleX = scal;

            self.node.scaleY = scal;


            self.node.x = bc.bannerX * winWidth / 100 - winWidth / 2 + self.node.width / 2 * self.node.scaleX;

            if (bc.bannerY == 0) {
                self.node.y = winHeight / 2 - self.node.height / 2 * self.node.scaleY;
            } else {
                self.node.y = -winHeight / 2 + self.node.height / 2 * self.node.scaleY;
            }

            if (bc.bannerCloseSize) {
                this.closeBtn.scaleX = bc.bannerCloseSize / 100;
                this.closeBtn.scaleY = bc.bannerCloseSize / 100;
            }

        }
    }

    onOpen(obj) {
        DebugLog.log('onOpen');



        let self = this;
        this.delcb = obj;
        let scale = 1;
        if (this.delcb) {
            if (this.delcb.pixelRatio) {
                this.pixelRatio = this.delcb.pixelRatio;
            }

            if (this.delcb.adType && this.delcb.adType == 1) {



                let winHeight = cc.winSize.height;
                let winWidth = cc.winSize.width;
                DebugLog.log("width=" + winWidth + ",height=" + winHeight);
                if (winWidth > winHeight) {
                    let prehe = winHeight * 3 / 5;
                    scale = prehe / self.node.height
                    self.node.scaleX = scale;
                    self.node.scaleY = scale;
                } else {
                    let prehe = winWidth * 9 / 10;
                    scale = prehe / self.node.width
                    self.node.scaleX = scale;
                    self.node.scaleY = scale;
                }

                if (this.nativeType == 0) {
                    self.node.y = 0;
                    self.node.x = 0;
                    DebugLog.log(this.delcb.close_size)
                    if (this.delcb.close_size) {
                        this.closeBtn.scaleX = this.delcb.close_size / 100;
                        this.closeBtn.scaleY = this.delcb.close_size / 100;
                    }
                }
                if (this.nativeType == 1) {
                    this.dealNativeBanner();
                }
            } else {
                // let hwplat: hwH5GameAPI = window['SDK_Manager'].plat_QuickGame.platformAPI;

                // DebugLog.log("===addnode==" + this.node.name);
                // hwplat.addNativeNode(this.delcb.pnode);
            }
            //    this.initLayer(this.delcb.res);

            let hwplat: hwH5GameAPI = Ads_Manager.Ins.platforms.platformAPI;
            hwplat.addNativeNode(this.node);
        }


        // DebugLog.log("on open");
        // DebugLog.log(this.delcb);
        //获取关闭按钮的  坐标传入 showDownloadButton
        // self.btn_clickAd.active = false;
        // if (this.delcb.res.adList[0].creativeType > 100 || this.delcb.res.adList[0].interactionType == 2 && self.delcb.showDownloadButton) {
        // } else {
        //     self.btn_clickAd.active = true;
        // }

        // setTimeout(() => {



        //     //Scene的设计分辨率是640*1136，适配方案是Fit width,所以下面的缩放按sW来计算的。
        //     //其他情况没有测试，情况应该差不多。先讲明适用条件，其他条件测试成功的欢迎留言。
        //     let size = self.btn_clickAd.getContentSize();//panel的坐标转为屏幕坐标
        //     let width = size.width * scale;
        //     let height = size.height * scale;
        //     //屏幕分辨率
        //     let canvasSize = cc.view.getCanvasSize();
        //     // //scene的设计分辨率
        //     // let desiginSize = cc.view.getDesignResolutionSize();
        //     // //Fit width适配方案，以width作为缩放基准
        //     // let sW = (canvasSize.width / desiginSize.width);
        //     // //计算panel在屏幕中的尺寸
        //     // width = sW * width;
        //     // height = sW * height;
        //     //转为世界坐标    
        //     let worldPos = self.btn_clickAd.convertToWorldSpaceAR(cc.v2(0, 0));
        //     let outPos = cc.v2();
        //     //设置scene的camera
        //     cc.Camera.main.getWorldToScreenPoint(worldPos, outPos);
        //     //x,y即屏幕坐标，creator的坐标原点在坐下，Android的在左上，需要做个转换。
        //     //x轴不变，y轴画布高减去y对应比例的值即为屏幕y坐标。（宽高都以sW为比例计算）
        //     let x = (outPos.x) - (width / 2);
        //     let y = canvasSize.height - (outPos.y) - (height / 2) + 100;

        //     DebugLog.log(canvasSize.width + "====screenw=======" + canvasSize.height);

        //     DebugLog.log("====scale======" + scale);
        //     // //  let y=cc.winSize.height-worldPos.y-50;
        //     DebugLog.log(cc.winSize.width + "====winSize=======" + cc.winSize.height);

        //     DebugLog.log(x + "======,3========" + y);


        //     // 使用示例
        //     const screenPosition = this.getNodePositionInScreenSpace(this.btn_clickAd);

        //     DebugLog.log(`节点相对于屏幕左上角的位置: (${screenPosition.x}, ${screenPosition.y})`);

        //     if (this.delcb.res.adList[0].creativeType > 100 || this.delcb.res.adList[0].interactionType == 2 && self.delcb.showDownloadButton) {

        //         self.delcb.showDownloadButton(this.delcb.res.adList[0].adId, screenPosition.x, screenPosition.y, self.btn_clickAd)

        //     }
        // }, 100);


    }


    getNodePositionInScreenSpace(node: cc.Node): cc.Vec2 {
        // 1. 获取节点的世界坐标（考虑锚点）
        const worldPos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        // 2. 获取视口信息
        const viewportRect = cc.view.getViewportRect();

        // 3. 获取设计分辨率和实际画布尺寸
        const designSize = cc.view.getDesignResolutionSize();
        const canvasSize = cc.view.getCanvasSize();

        // 4. 计算实际适配比例（考虑Fit Width/Height模式）
        let scaleRatio = 1;


        // 如果是Fit Width模式

        const canvas = cc.Canvas.instance
        if (canvas.fitWidth == true) {
            scaleRatio = canvasSize.width / designSize.width;
        }
        // 如果是Fit Height模式
        else if (canvas.fitHeight == true) {
            scaleRatio = canvasSize.height / designSize.height;
        }
        // 其他模式使用默认比例
        else {
            scaleRatio = Math.min(
                canvasSize.width / designSize.width,
                canvasSize.height / designSize.height
            );
        }



        // 6. 转换为屏幕坐标（相对于左上角）
        const screenX = (worldPos.x - viewportRect.x) * scaleRatio * node.scaleX;
        const screenY = canvasSize.height - (worldPos.y - viewportRect.y) * scaleRatio * node.scaleX;
        // 6. 还需要减去按钮大小
        return cc.v2(screenX - 200, screenY - this.dpToPx(40));
    }


    // DP转PX
    dpToPx(dp) {
        let devicePixelRatio = this.pixelRatio;

        return dp * devicePixelRatio;
    }

    appDetailUrlclick() {
        let self = this;
        let qg: any = window['qg']
        qg.openDeeplink({
            uri: self.delcb.res.adList[0].appDetailUrl
        });

    };
    privacyUrlclick() {
        let self = this;
        let qg: any = window['qg']
        qg.openDeeplink({
            uri: self.delcb.res.adList[0].privacyUrl
        });
    };
    permissionUrlclick() {
        let self = this;
        let qg: any = window['qg']
        qg.openDeeplink({
            uri: self.delcb.res.adList[0].permissionUrl
        });
    };
    initLayer(res) {

        let self = this;


        // adId	string	广告标识，用来上报曝光与点击
        // title	string	广告标题
        // desc	string	广告描述
        // iconUrlList	Array	推广应用的Icon图标
        // imgUrlList	Array	广告图片
        // logoUrl	string	“广告”标签图片
        // clickBtnTxt	string	点击按钮文本描述
        // creativeType	number	获取广告类型，取值说明：0：无 1：纯文字 2：图片 3：图文混合 4：视频
        // interactionType获取广告点击之后的交互类型，取值说明： 0：无 1：浏览类 2：下载类 3：浏览器（下载中间页广告） 4：打开应用首页 5：打开应用详情页

        // DebugLog.log(res.adList);

        // DebugLog.log(res.adList[0].adId);
        // DebugLog.log(res.adList[0].title);
        // DebugLog.log(res.adList[0].desc);
        // DebugLog.log(res.adList[0].iconUrlList);
        // DebugLog.log(res.adList[0].imgUrlList);
        // DebugLog.log(res.adList[0].logoUrl);
        // DebugLog.log(res.adList[0].clickBtnTxt);
        // DebugLog.log(res.adList[0].creativeType);
        // DebugLog.log(res.adList[0].interactionType);
        DebugLog.log('=========');

        this.delcb.res = res;
        try {



            if ((res.adList[0].appName != null && res.adList[0].appName != 'undefined')) {
                self.sixcontent.active = true;
                DebugLog.log('====sixcontent=====');


                if (res.adList[0].versionName && res.adList[0].versionName != "") {
                    self.versionName.string = "版本:" + res.adList[0].versionName;

                    self.guang_1.active = true;
                    self.guang_2.active = true;
                    self.guang_3.active = true;
                    self.guang_4.active = true;

                    self.bigappname.node.active = false;
                    self.appName.node.active = true;
                    self.appName.string = res.adList[0].appName;
                    self.developerName.string = res.adList[0].developerName;

                } else {
                    self.versionName.string = "";
                    self.guang_1.active = false;
                    self.guang_2.active = false;
                    self.guang_3.active = false;
                    self.guang_4.active = false;

                    self.appName.node.active = false;
                    self.bigappname.node.active = true;
                    self.bigappname.string = res.adList[0].appName;
                    self.developerName.string = "";
                }
                if (res.adList[0].appDetailUrl && res.adList[0].appDetailUrl != "") {
                    self.appDetailUrl.string = "介绍";
                } else {
                    self.appDetailUrl.string = "";
                }
                if (res.adList[0].privacyUrl && res.adList[0].privacyUrl != "") {
                    self.privacyUrl.string = "隐私";
                } else {
                    self.privacyUrl.string = "";
                }
                if (res.adList[0].permissionUrl && res.adList[0].permissionUrl != "") {
                    self.permissionUrl.string = "权限";
                } else {
                    self.permissionUrl.string = "";
                }

                // if (this.nativeType == 1) {
                //     this.ad_desc.node.active = false;
                // }

            } else {
                self.sixcontent.active = false;
                // if (this.nativeType == 1) {
                //     this.ad_desc.node.active = true;
                // }
            }



            if (res.adList[0].title) {
                self.title.string = res.adList[0].title;
            } else {
                self.title.string = "";
            }
            // if (res.adList[0].desc) {
            //     self.ad_desc.string = res.adList[0].desc;
            // } else {
            //     self.ad_desc.string = "";
            // }
            // if (res.adList[0].source) {
            //     self.adSource.string = res.adList[0].source;
            // } else {
            //     self.adSource.string = "";
            // }

            if (res.adList[0].clickBtnTxt) {
                self.clickBtnTxt.string = res.adList[0].clickBtnTxt;
            }

            self.picture_icon.spriteFrame = null;
            self.picture_ad.spriteFrame = null;



            if (res.adList[0].imgUrlList) {

                DebugLog.log('imgurllist');
                var iconUrl = res.adList[0].imgUrlList;
                if (Array.isArray(iconUrl)) {
                    iconUrl = res.adList[0].imgUrlList[0];
                }
                //DebugLog.log("imgurllist:"+iconUrl);
                cc.assetManager.loadRemote(iconUrl, { ext: '.image' }, (err, texture: cc.Texture2D) => {
                    //cc.loader.load(iconUrl, function (err, texture) {
                    try {
                        let newFrame = new cc.SpriteFrame(texture);

                        // if (self.nativeType == 0) {
                        //     self.picture_ad.spriteFrame = newFrame;
                        // }
                        // if (self.nativeType == 1) {
                        //     self.picture_icon.spriteFrame = newFrame;
                        // }

                        self.picture_ad.spriteFrame = newFrame;

                    } catch (error) {
                        console.log(error)
                    }

                });

            }
            if (res.adList[0].icon) {
                console.log('iconUrlList');
                // DebugLog.log("---iconUrlList--" + res.adList[0].iconUrlList);
                var iconUrl = res.adList[0].icon;
                cc.assetManager.loadRemote(iconUrl, { ext: '.image' }, (err, texture: cc.Texture2D) => {
                    //cc.loader.load(iconUrl, function (err, texture) {
                    // let frame=new cc.SpriteFrame(texture);
                    try {
                        let newFrame = new cc.SpriteFrame(texture);
                        // if (self.nativeType == 0) {
                        //     self.picture_ad.spriteFrame = newFrame;
                        // }
                        // if (self.nativeType == 1) {
                        //     self.picture_icon.spriteFrame = newFrame;
                        // }
                        self.picture_icon.spriteFrame = newFrame;

                    } catch (error) {
                        console.log(error)
                    }

                });

            }



        } catch (error) {
            console.log(error);
            // console.log(error.message);
        }

    }

}
