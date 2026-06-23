// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import LocalStorageManager from "./LocalStorageManager";
import SDKTool from "./SDKTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VideoBtn extends cc.Component {

  onEnable() {
    this.node.on(cc.Node.EventType.TOUCH_END, this.OnClick, this);
  }
  OnClick() {
    if (SDKTool.getInstance().GetPB()==3) {
      Platforms_QuickGame.getInstance().showVideo(() => { });
    }

  }
  protected onDisable(): void {
    this.node.off(cc.Node.EventType.TOUCH_END, this.OnClick, this);
  }
  // update (dt) {}
}
