// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SDK_config from "../../../SDK_config";


const { ccclass, property } = cc._decorator;

@ccclass
export default class videotool extends cc.Component {
  @property([cc.Node])
  public itemArray: cc.Node[] = [];
  public Levelindex=0;

  onEnable() {
    
    // if(!SDK_config.WxAD){
    //   this.node.active=false;
    // }
    // this.InitState();
  }
  InitState(index){
  
    console.log("instate")
    this.Levelindex=index;
    if (cc.sys.localStorage.getItem("LevelUnlock" + this.Levelindex)) {
      this.itemArray.forEach((node) => {
        if (node) {
          node.active = false;
        }
      })

    }else{
      this.itemArray.forEach((node) => {
        if (node) {
          node.active = true;
        }
      })
    }
  }

  // update (dt) {}
}
