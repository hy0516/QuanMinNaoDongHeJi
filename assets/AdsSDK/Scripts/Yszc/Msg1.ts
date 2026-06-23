// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Ads_Manager from "../Ads_Manager";
import SDK_config, { Platform } from "../SDK_config_newsdk";
import Spalsh_newsdk from "../Splash/Spalsh_newsdk";
import Msg_Base from "./Msg_Base";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Msg1 extends Msg_Base {

  
 
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        let lab = cc.find("bg1/bg2/ScrollView/view/content/desc", this.node).getComponent(cc.Label);
        lab.string = lab.string.replace(/青岛发掘者网络技术有限公司/g, SDK_config.companyName);
    }

    public close(){
     
        this.node.active=false;

    }
    // update (dt) {}
}
