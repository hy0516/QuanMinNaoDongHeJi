// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SDK_config from "../SDK_config_newsdk";
import Msg_Base from "./Msg_Base";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Msg2 extends Msg_Base {

 
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        let lab2 = cc.find("bg2/ScrollView/view/content/contentLabel", this.node).getComponent(cc.Label);
        lab2.string = lab2.string.replace(/深圳市掌上方舟科技有限公司/g, SDK_config.companyName);             
    }

    public close(){
        this.node.active=false;
    }
    // update (dt) {}
}
