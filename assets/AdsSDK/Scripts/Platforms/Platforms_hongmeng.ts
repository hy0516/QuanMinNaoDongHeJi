// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Platforms_Android from "./Platforms_Android";


export default class Platforms_hongmeng extends cc.Component {

  

    private static mInstance: Platforms_hongmeng = null;

    public static getInstance(): Platforms_hongmeng {
        if (this.mInstance === null) {
            this.mInstance = new Platforms_hongmeng();
        }
        return this.mInstance;
    }
    public onInit(){
      // console.log("==hongmeng==：");
      // console.log(cc.sys.isBrowser);
      // console.log(cc.sys.OS_WINDOWS);
      //     // if (cc.sys.isBrowser) {
      //     //   return;
      //     // }
      //     jsb.gameJsOnMessage = (type, para1) => {
      //       console.log(para1);
        
    
         
        
      //       if (Platforms_hongmeng.getInstance()[type]) {
      //         console.log("hm");
      //         Platforms_hongmeng.getInstance()[type]( para1);
      //       }else{
             
      //         if (Platforms_Android.getInstance()[type]) {
      //           console.log("ad");
      //           Platforms_Android.getInstance()[type]( para1);
      //         }
      //       }
         
      //      // console.log("返回结果为：", result.data.data.param);
    
      //     }
    }
    ggfun;
  
    result_getGGType(str:string){
      if (this.ggfun) {
        this.ggfun(parseInt(str));
      }else{
        console.log(" this.ggfun =null")
      }
   
    }
    getGGType(fun){
      this.ggfun=fun
      globalThis.oh.postMessage("getGGType","");
    }
    // update (dt) {}
}
