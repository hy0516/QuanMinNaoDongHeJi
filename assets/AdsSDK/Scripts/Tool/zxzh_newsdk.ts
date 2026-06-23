// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import Utils from "../../Utils/Utils";
import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame_newsdk";
@ccclass
export default class zxzh extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';
   // game: any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
      //  this.game = cc.find("Canvas/game").getComponent("game");
        this.node.on(cc.Node.EventType.TOUCH_END, ()=>{
         
            cc.sys.localStorage.clear()
            Platforms_QuickGame.getInstance().showToast("注销账号成功，请重新启动游戏");
           // Utils.showTextTips("以注销账号，请重新启动游戏");
            setTimeout(() => {
                Platforms_QuickGame.getInstance().exitgame(true);
              //  cc.director.loadScene("main");
            }, 2000);
           
         //   this.game.node.emit("BACK_TO_MAIN");
       //    
         //   Platforms_QuickGame.getInstance().openYSZC();
        }, this);
    }

    // update (dt) {}
}
