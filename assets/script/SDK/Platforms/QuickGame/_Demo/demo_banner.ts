// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIWindow from "../../../FrameWork/UI/Module/UIWindow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI_VivoNativeAd extends UIWindow {

    @property
    nativeType: number = 0;

    title:cc.Label;
    picture_icon :cc.Sprite;
    picture_ad :cc.Sprite;
    ad_desc :cc.Label;
    btn_clickAd :cc.Node;
    clickBtnTxt :cc.Label;
    bg_click:cc.Node;

    delcb:any;
    windowSize: cc.Size;
    
    onLoad(){
        let self = this;
      

  

        self.title = cc.find("picture_icon/title", self.node).getComponent(cc.Label);
        self.ad_desc = cc.find("picture_icon/ad_desc", self.node).getComponent(cc.Label);
        self.picture_icon = cc.find("picture_icon", self.node).getComponent(cc.Sprite);
        self.picture_ad = cc.find("picture_ad", self.node).getComponent(cc.Sprite);
    
        self.btn_clickAd = cc.find("btn_clickAd", self.node);
        self.clickBtnTxt = cc.find("btn_clickAd/clickBtnTxt", self.node).getComponent(cc.Label);
      

        self.bg_click = cc.find("bg_click", self.node);//

        console.log('onLoad');
    }

    onEnable(){
        super.onEnable();
        let self = this;
      
    
        self.bg_click.on(cc.Node.EventType.TOUCH_END, self.onClickAd, self);
        self.btn_clickAd.on(cc.Node.EventType.TOUCH_END, self.onClickAd, self);
       
      
    }
    onDisable(){
        super.onDisable();

        let self = this;
        self.bg_click.off(cc.Node.EventType.TOUCH_END, self.onClickAd, self);
        self.btn_clickAd.off(cc.Node.EventType.TOUCH_END, self.onClickAd, self);
    }
    onClickAd() {
        console.log('onClickAd');
     
        this.delcb.onNativeAdClick(this.delcb.res.adList[0].adId)

    }
    onOpen(obj){
        console.log('onOpen');
        console.log(obj);
        let self = this;
        this.delcb=obj;
        if (this.delcb) {

           
        
              
             
                let winHeight = cc.winSize.height;
                let winWidth = cc.winSize.width;
                console.log("width=" + winWidth + ",height=" + winHeight);
                if (winWidth>winHeight) {
                    let prehe=winHeight*1/7;
                    let scale =prehe/self.node.height
                    self.node.scaleX=scale;
                    self.node.scaleY=scale;
                    self.node.y=-winHeight/2+self.node.height/2*scale;
                }else  {
                    let prehe=winWidth;
                    let scale =prehe/self.node.width
                    self.node.scaleX=scale;
                    self.node.scaleY=scale;

                    self.node.y=-winHeight/2+self.node.height/2*scale;
                }
              
 
            
            this.initLayer(this.delcb.res);
        }
        console.log("on open");
    }
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
        console.log(res.adList);

        console.log(res.adList[0].adId);
        console.log(res.adList[0].title);
        console.log(res.adList[0].desc);
        console.log(res.adList[0].iconUrlList);
        console.log(res.adList[0].imgUrlList);
        console.log(res.adList[0].logoUrl);
        console.log(res.adList[0].clickBtnTxt);
        console.log(res.adList[0].creativeType);
        console.log(res.adList[0].interactionType);
        console.log('=========');
     

        try {


           
           
            if (res.adList[0].title) {
                self.title.string = res.adList[0].title;
            }
            if (res.adList[0].desc) {
                self.ad_desc.string = res.adList[0].desc;
            }
            if (res.adList[0].clickBtnTxt) {
                self.clickBtnTxt.string = res.adList[0].clickBtnTxt;
            }
        

            self.picture_icon.spriteFrame = null;
            self.picture_ad.spriteFrame = null;


            //vivo判断
            console.log("---imgurllist--" + res.adList[0].imgUrlList);

            if (res.adList[0].imgUrlList) {

                console.log('imgurllist');

                if (self.nativeType==0) {
                    var iconUrl = res.adList[0].imgUrlList;
                    if (Array.isArray(iconUrl)) {
                        iconUrl=res.adList[0].imgUrlList[0];
                    }
                    cc.loader.load(iconUrl, function (err, texture) {
                        try {
                            let newFrame = new cc.SpriteFrame(texture);
                            self.picture_ad.spriteFrame = newFrame;
                        } catch (error) {
                            console.log(error)
                        }
                       
                    });                  
                }
            }else if(res.adList[0].iconUrlList){
                console.log('iconUrlList');
                console.log("---iconUrlList--" + res.adList[0].iconUrlList);

                if (self.nativeType==0) {
                    var iconUrl = res.adList[0].iconUrlList;
                    if (Array.isArray(iconUrl)) {
                        iconUrl=res.adList[0].iconUrlList[0];
                    }
                    cc.loader.load(iconUrl, function (err, texture) {
                        try {
                            let newFrame = new cc.SpriteFrame(texture);
                            self.picture_ad.spriteFrame = newFrame;
                        } catch (error) {
                            console.log(error)
                        }
                       
                    });                  
                }
            }
        } catch (error) {
            console.log(error);
            console.log(error.message);
        }

    }

}
