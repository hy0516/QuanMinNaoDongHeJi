// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import InvokeConfig from "./InvokeConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class qg_enableBannerAD extends cc.Component {

    keepCloseTime:number=0;
    onEnable(){
       
        // if (new Date().getTime() / 1000-this.keepCloseTime<100) {
        //     console.log("关闭打开时间过短");
        //     return ;
        // }
       
        window['SDK_Manager'].Invoke(InvokeConfig.showBanner);
        
    }

    onDisable(){
        this.keepCloseTime = new Date().getTime() / 1000;
        window['SDK_Manager'].Invoke(InvokeConfig.hideBanner);
    }


    // update (dt) {}
}
