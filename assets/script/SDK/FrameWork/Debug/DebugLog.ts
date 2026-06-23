// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UI_Config from "../UI/UI_Config";


export default class DebugLog{

   public static print(classname:string,str:string){
       if (UI_Config.DebugLog) {
        console.log(classname+":"+str);
       }
      
   }
}
