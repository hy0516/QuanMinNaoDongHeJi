// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { UISDKPanel_API } from "./UIPanel_API_newsdk";
const {ccclass, property} = cc._decorator;

@ccclass
export default class UISDKPanel extends cc.Component implements UISDKPanel_API{
    openArg:any;
    public open(obj: any=null) {
        if (!this.node.active) {
         this.node.active=true;
        }
      
        this.openArg=obj;
    //    console.log(this.node.active);
        this.onOpen(obj);
     }
     public onOpen(obj: any) {
       
     }
     public close(obj: any=null) {
         if (this.node.active) {
             this.node.active=false;
          }
         
         this.onClose(obj);
     }
     public isOpen() {
        return this.node.active;
     }
     public onClose(obj: any) {
       
     }

   
}
