// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    //双击
    /**双击间隔时间 300ms */
    clickInterval = 300;
    /**上一次点击时间 */
    lastClickTime = 0;





    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(even: cc.Event.EventTouch) {
    
        if(GameData.PauseGame) return;

        if(!this.node.getChildByName("state2").active) return;

        let curTime = Date.now();

        //双击检测
        if(curTime - this.lastClickTime < this.clickInterval){

           this.node.getChildByName("state2").children[0].active = false;
           this.node.getChildByName("state2").children[1].active = true;

           this.node.parent.getChildByName("jiasha").active = true;

           AudioManager.playEffect("开柜子_230");

        }

        else{
            this.lastClickTime = curTime;
        }
        


        }

    start () {

    }

    // update (dt) {}
}
