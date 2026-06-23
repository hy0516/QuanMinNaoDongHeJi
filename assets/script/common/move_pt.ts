import AudioManager from "./AudioManager";
import BaseGame from "./BaseGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class move_pt extends cc.Component {

    // @property(cc.Integer)
    // type: number = 1;

    @property(cc.Node)
    public target: cc.Node[] = [];

    public main: cc.Node = null;

    isbig = false;

    mainwidth = 0;
    mainheight = 0;

    protected onLoad(): void {
        // this.startPoi = this.node.getPosition();
        // this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.mainheight = cc.view.getCanvasSize().height / 2;
        this.mainwidth = cc.view.getCanvasSize().width / 2;
    }

    onTouchStart(even: cc.Event.EventTouch) {
        this.node.zIndex = 51;
       
        cc.tween(this.node)
            .to(0.2, { scaleX: 1, scaleY:1 })
            .start();
    }
    onTouchMove(even: cc.Event.EventTouch) {
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
        if (this.node.x < 0 && this.node.x < -this.mainwidth + 50) this.node.x = -this.mainwidth + 50;
        if (this.node.x > 0 && this.node.x > this.mainwidth - 50) this.node.x = this.mainwidth - 50;
        if (this.node.y < 0 && this.node.y < -this.mainheight + 100) this.node.y = -this.mainheight + 100;
        if (this.node.y > 0 && this.node.y > this.mainheight - 100) this.node.y = this.mainheight - 100;
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        this.node.zIndex = 0;
        var isok = false;
        var item
        for (let i = 0; i < this.target.length; i++) {
            item = this.target[i];
            if (!item["islock"]) {
                var pox = Math.abs(this.node.x - item.x);
                var poy = Math.abs(this.node.y - item.y);
                if (pox <= 40 && poy <= 35) {
                    isok = true;
                    break;
                }
            }
        }
        this.scheduleOnce(() => {
            if (isok) {
                cc.tween(this.node)
                    .to(0.2, { x: item.x, y: item.y, scaleX: 1, scaleY: 1 })
                    .call(() => {
                        // item.getComponent(cc.Sprite).spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
                        AudioManager.playEffect("pintu");
                        this.ondele();
                        item["islock"] = true;
                        this.main.getComponent(BaseGame).onwin();
                    })
                    .start();
            } else {
                var sx=1;
                var sy=1;
                if(this.isbig){
                    var sx=0.8;
                    var sy=0.8;
                }
                cc.tween(this.node)
                    .to(0.2, { scaleX: sx, scaleY: sy })
                    .start();
            }
        }, 0.01)



    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
