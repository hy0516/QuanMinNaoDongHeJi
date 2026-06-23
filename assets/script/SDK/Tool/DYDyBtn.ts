// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDKTool from "./SDKTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DYDyBtn extends cc.Component {

    tt: any = window['tt'];

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
                if (SDKTool.isDeubg) {
                    this.node.active = false;
                    return;
                }
        this.node.on(cc.Node.EventType.TOUCH_END, this.Ondy, this);
        let isDy = cc.sys.localStorage.getItem("isDy");
        if (isDy && isDy == "true") {
            this.node.active = false; // 如果已经订阅过，隐藏按钮
        } else {
            this.node.active = true; // 如果没有订阅，显示按钮
        }
    }
    Ondy() {
      
        let self = this;
        const tmplIds = ["MSG2218926137157512135391349147956"]; // 替换为你的订阅消息模板ID
        this.tt.requestSubscribeMessage({
            tmplIds: tmplIds,
            complete: (res) => {
                console.log("订阅消息结果:", res);
                if (res.errMsg && res.errMsg.includes("ok")) {
                    // 订阅成功
                    self.node.active = false; // 隐藏按钮
                    cc.sys.localStorage.setItem("isDy", "true"); // 设置标志位，表示已订阅
                }
                // Platforms_QuickGame.getInstance().showToast("订阅成功");
            },
        });
    }


    // update (dt) {}
}
