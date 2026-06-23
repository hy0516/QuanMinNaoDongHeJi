// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var isfirst=false;
import InvokeConfig from "../../../Tool/InvokeConfig_newsdk";
import SDK_config, { Platform } from "../../../SDK_config_newsdk";
import UI_Manager from "../../../FrameWork/UI/UISDK_Manager_newsdk";
cc.Class({
    extends: cc.Component,

    properties: {
        /**开屏完成会隐藏自己，需要显示的游戏界面 */
     
      
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
      
        this.windowSize = cc.winSize;
        this.winHeight = this.windowSize.height;
        this.winWidth = this.windowSize.width;
     
       
         this.adnode = cc.find("qrsys", this.node);
         this.adnode.width= this.winWidth ;
    },

    jumpOver(){
        let self=this;
      
     
        if (this.overcb) {
            this.overcb();
        }
    },

  
    /**调用开屏方法，开屏结束回调 */
    startSpash(overcb) {
      
        this.overcb=overcb;
        // console.log('onEnable');
      
        this.jump= cc.find("qrsys/btn_close/jump",this.node).getComponent(cc.Label);
        this.jump.node.on(cc.Node.EventType.TOUCH_END, function(){
            overcb&&overcb();
            if (self.intervalId) {
                clearInterval(self.intervalId);
            }
        }, this);
        
        this.adnode = cc.find("qrsys", this.node);
        this.adnode.active=false;
        let self=this;
        window['Platforms_QuickGame'].platformAPI.createNative(function(adres){
            
            if (adres) {
                self.adnode.active=true;
                self.timecount=0;
                self.jump.node.parent.active=false;

                let onNativeAdClick1=function(id){
                     window['SDK_Manager'].Invoke(InvokeConfig.onNativeAdClick,id)
                }
                let del={
                    onNativeAdClick:onNativeAdClick1,
                    res:adres,
                    pnode:self.adnode,
                }
                UI_Manager.getInstance().showUIWithNode(self.adnode,del)
                self.intervalId = setInterval(function () {
                        self.timecount++;
                        console.log(self.timecount);
                       
                         if (self.timecount>=0) {
                             if(!self.jump.node.parent.active)
                            self.jump.node.parent.active=true;
                            self.jump.string="跳过 "+(5-self.timecount);
                        }
                        if (self.timecount==5) {
                            overcb();
                            clearInterval(self.intervalId);
                        }
                     
                   }, 1000);
            }else{
               
                if (overcb) {
                    overcb();
                }
            }
         

        },SDK_config.GameIdConfig.huaweiID.NativeSplahId);
      
      
     

    },
  
    onDisable(){
    //     let adadp=require('ADAdapter');

    //     adadp.curNativeIcon=this.node;

        
    //     this.adnode = cc.find("qrsys", this.node);
    //    // this.adnode.active=false;
    //     adadp.createNativeImageAd(this.adnode,this.nativeid);
    },
    // update (dt) {},
});
