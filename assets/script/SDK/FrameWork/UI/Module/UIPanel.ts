// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { UIPanel_API } from "./UIPanel_API";
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPanel extends cc.Component implements UIPanel_API{
    openArg:any;
    public open(obj: any=null) {
        if (!this.node.active) {
         this.node.active=true;
        }
      
        this.openArg=obj;
        console.log(this.node.active);
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
