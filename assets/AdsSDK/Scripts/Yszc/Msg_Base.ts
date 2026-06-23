// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import UISDKPanel from "../FrameWork/UI/Module/UIPanel_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Msg_Base extends UISDKPanel {

  

    protected onLoad(): void {
      let w=  cc.Canvas.instance.node.width;
      let h=  cc.Canvas.instance.node.height;

      let winHeight = cc.winSize.height;
      let winWidth = cc.winSize.width;
    
      if (winWidth > winHeight) {
        let scale=winHeight/750;
        this.node.scale=scale;
      } else {
        let scale=winWidth/750;
        this.node.scale=scale;
      }

    }

    // update (dt) {}
}
