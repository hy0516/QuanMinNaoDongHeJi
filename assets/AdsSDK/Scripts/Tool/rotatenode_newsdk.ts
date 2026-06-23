// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import LocalStorageManager from "./LocalStorageManager_newsdk";

const { ccclass, property } = cc._decorator;

@ccclass
export default class btn_active extends cc.Component {
  @property([cc.Node])
  public itemArray: cc.Node[] = [];
  @property(cc.Node)
  public onode: cc.Node=null;
  onEnable() {
    cc.tween(this.onode)
    .by(0.6, {angle: -90})
    .repeatForever()
    .start();
  }
  // update (dt) {}
}
