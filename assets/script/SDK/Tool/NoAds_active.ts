// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import LocalStorageManager from "./LocalStorageManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NoAds_active extends cc.Component {

    onEnable(){
        const dft = {
            opacity: 255,
          },
          act = {
            opacity: 1,
          };
        let up = cc.tween().to(1, act),
          down = cc.tween().to(1, dft),
          action = cc.tween().then(up).then(down);
        cc.tween(this.node).repeatForever(action).start();
    }
    // update (dt) {}
}
