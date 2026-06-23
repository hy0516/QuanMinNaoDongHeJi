// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDK_Config from "../UI/UISDK_Config_newsdk";


export default class DebugLog{

   public static print(classname:string,str:string){
       if (UISDK_Config.DebugLog) {
        console.log(classname+":"+str);
       }
      
   }
   public static log(str:string){
    if (UISDK_Config.DebugLog) {
     console.log(str);
    }
   
}
}
