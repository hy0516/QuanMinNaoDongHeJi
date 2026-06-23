// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDKWindow from "../../../FrameWork/UI/Module/UIWindow_newsdk";
import InvokeConfig from "../../../Tool/InvokeConfig_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadScene_HW extends UISDKWindow {

  
    onLoad(){
        // window['SDK_Manager'].Invoke(InvokeConfig.onInit);
    }

    onOpen(obj){
     
        let jkzg = cc.find('jkzg', this.node).getComponent(cc.Label);
        jkzg.string = "健康游戏忠告\n抵制不良游戏，拒绝盗版游戏。\n注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。\n合理安排时间，享受健康生活。";

      
     

      
      
      
       
        let winHeight = cc.winSize.height;
                let winWidth = cc.winSize.width;
                let bg= cc.find('load', this.node)
                bg.width= winWidth ;
                bg.height= winHeight;
                console.log("width=" + winWidth + ",height=" + winHeight);
                if (winWidth>winHeight) {
                    let prehe=winHeight*1/2;
                    let scale =prehe/jkzg.node.height
                    jkzg.node.scaleX=scale;
                    jkzg.node.scaleY=scale;
                }else  {
                    let prehe=winWidth*9/10;
                    let scale =prehe/jkzg.node.width
                    jkzg.node.scaleX=scale;
                    jkzg.node.scaleY=scale;
                }

        let self = this;


        self.node.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(function () {



            if (!window['SDK_Manager'].isHuawei()) {
                window['SDK_Manager'].logoSplashOvercb();
                return;
            }


            let agree = function () {
                console.log("====hw login====");
                window['Platforms_QuickGame'].platformAPI.huaweiLogin(function () {
                    // console.log("enter game");
                    //cc.director.loadScene(self.mainScene);
                    let winHeight = cc.winSize.height;
                    let winWidth = cc.winSize.width;

                    if (winWidth > winHeight) {
                        window['SDK_Manager'].Invoke(InvokeConfig.showUI, 'UI_hwNativeSplash_land');
                    } else {
                        window['SDK_Manager'].Invoke(InvokeConfig.showUI, 'UI_hwNativeSplash_por');
                    }
                    setTimeout(() => {
                        self.node.active=false;
                    }, 2000);
                   
                })

            }
            let noagree = function () {
                window['SDK_Manager'].Invoke(InvokeConfig.toastShow, '您需要同意才能进入游戏');
            }
            let hwpcb = {
                agreecb: agree,
                notAgreecb: noagree
            }

            let agree1 = cc.sys.localStorage.getItem("usrService");
            if (agree1) {
              
                agree();
            } else {
                self.node.active=false;
                window['SDK_Manager'].Invoke(InvokeConfig.showUI, 'HWPriverPolicy', hwpcb);

            }


        })));

    }

    // update (dt) {}
}
