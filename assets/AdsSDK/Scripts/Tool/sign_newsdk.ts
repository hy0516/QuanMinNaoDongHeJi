// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import SDK_config from "../SDK_config_newsdk";
import InvokeConfig from "./InvokeConfig_newsdk";
import Spalsh_newsdk from "../Splash/Spalsh_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.director.preloadScene("Msg", function () {
            
        });
        if(SDK_config.ADTest){
       
            cc.director.loadScene("Msg");
        }
  
    }

    // update (dt) {}
}
