// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame_newsdk";

import InvokeConfig from "./InvokeConfig_newsdk";
import LocalStorageManager from "./LocalStorageManager_newsdk";







const {ccclass, property} = cc._decorator;

@ccclass
export default class Yszc extends cc.Component {
    @property(cc.Node)
    yszc: cc.Node = null;
    @property(cc.Node)
    bg: cc.Node = null;
    
    isSceneYszc:boolean = false;

    onEnable(){

    //    cc.director.preloadScene("main", function () {
       
    // });
    // cc.director.preloadScene("Yszc", function () {
       
    // });
  
    }
    openys(){
        if(this.isSceneYszc){
            cc.director.loadScene("Yszc");
        }else{
            this.yszc.active = true;
            this.bg.active = true;
        }
        
        // console.log("1111");
        

        
    }
    closeys(){
        if(this.isSceneYszc){
            cc.director.loadScene("main");
        }else{
           this.yszc.active = false;
            this.bg.active = false;     
        }
        // cc.director.loadScene("main");
        // this.yszc.active = false;
        // this.bg.active = false;  
    }

    protected start(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, ()=>{
            // Platforms_QuickGame.getInstance().openYSZC();
            this.openys();
        }, this);
    }
    onDisable(){

    }
    

    // update (dt) {
     
    // }
}
