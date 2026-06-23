// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameData from "../../common/GameData";
import levelConfig from "../../common/levelConfig";
import SDKTool from "../Tool/SDKTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DYTitle extends cc.Component {
    static text: any = null;
    static mode: string = null;
    @property(cc.Label)
    public  lable: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
   

    }

    init(){  
        let self=this;
        self.lable.string = "选择模式>>"+DYTitle.mode+">>"+"《"+DYTitle.text+"》";   
    }

    start () {
        if(!SDKTool.isDeubg){
            this.node.active=false;
            return;
        }
        DYTitle.text = ""; // 将当前的文本赋值给静态变量
    }

    // update (dt) {}
}
