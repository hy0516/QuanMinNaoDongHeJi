// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import InvokeConfig from "./InvokeConfig_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class qg_enableNativeAD extends cc.Component {

  

    @property
    nativeadtime: number = 0;

    keepCloseTime:number=1;
    onEnable(){
       
        // if (new Date().getTime() / 1000-this.keepCloseTime<100) {
        //     console.log("关闭打开时间过短");
        //     return ;
        // }

        this.keepCloseTime=1;
        if (0<this.nativeadtime) {
            this.nativeadtime--;
                 
             console.log("this.nativeadtime:"+this.nativeadtime);
            return;
        }
 
        console.log("==qg_enableNativeAD= ==enagle=:"+this.node.name);
     
        setTimeout(() => {
            if (this.keepCloseTime==1) {
                window['SDK_Manager'].Invoke(InvokeConfig.showInsert);
            }
           
        }, 500);
      

        
    }


    onDisable(){
        this.keepCloseTime =0;
        window['SDK_Manager'].Invoke(InvokeConfig.hideInsertNativeAd);
       
        window['SDK_Manager'].Invoke(InvokeConfig.hideBanner);
    }

    // update (dt) {}
}
