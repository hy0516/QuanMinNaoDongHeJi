import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import zjmgr_lv259 from "./zjmgr_lv259";

const { ccclass, property } = cc._decorator;

@ccclass
export default class doubleClick_lv259 extends cc.Component {
    @property(cc.Integer)
    doubleClickThreshold: number = 300;

    @property(cc.Node)
    MainNode:cc.Node=null;

    @property(cc.String)
    type:string = " ";

    private lastTapTime: number = 0;
    private isclick:boolean=false;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(){
       
    }
    onTouchEnd(event: cc.Event.EventTouch) {
        
        if(this.isclick||GameData.PauseGame) return;
       
        AudioManager.playEffect(AudioManager.common.BUTTON);
        const now = Date.now();
        if (now - this.lastTapTime <= this.doubleClickThreshold) {
            
            this.isclick=true;
            this.EventHandle();
            
            this.onDestroy();
        } else {
            this.lastTapTime = now;
        }
    }

    EventHandle(){
        switch(Number(this.type)){
            case 1:
                this.MainNode.getComponent(zjmgr_lv259).openfridge();
                break
            case 2:
                this.MainNode.getComponent(zjmgr_lv259).openDoor();
                break
        }
    }

   

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.active=false;
        this.node.destroy();
    }
}