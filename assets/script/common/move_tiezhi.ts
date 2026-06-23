import AudioManager from "./AudioManager";
import BaseGame from "./BaseGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class move_tiezhi extends cc.Component {

    // @property(cc.Integer)
    // type: number = 1;

    @property(cc.Node)
    public target: cc.Node[] = [];

    public main: cc.Node = null;

    // startPoi: cc.Vec2 = null;

    itemscaleX = 0;
    itemscaleY = 0;

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
        this.itemscaleX = this.node.scaleX;
        this.itemscaleY = this.node.scaleY;

    }

    onTouchStart(even: cc.Event.EventTouch) {
        this.node.zIndex = 51;
        cc.tween(this.node)
            .to(0.2, { scaleX: 1.2, scaleY: 1.2 })
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
                if (pox <= 45 && poy <= 40) {
                    isok = true;
                    AudioManager.playEffect("finishjq");
                    break;
                }
            }
        }
        this.scheduleOnce(() => {
            if (isok) {
                var sk = this.node.parent.parent.getChildByName("sk");
                if (sk) {
                    sk.position = item.position;
                    sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("guang", 1);
                }
                cc.tween(this.node)
                    .to(0.2, { x: item.x, y: item.y, scaleX: this.itemscaleX, scaleY: this.itemscaleX })
                    .call(() => {
                        item.getComponent(cc.Sprite).spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
                        this.ondele();
                        item["islock"] = true;
                        this.node.parent.parent.parent.getComponent(BaseGame).onwin();
                        this.node.active = false;
                    })
                    .start();
            } else {
                cc.tween(this.node)
                    .to(0.2, { scaleX: this.itemscaleX, scaleY: this.itemscaleX })
                    .start();
            }
        }, 0.01)


        // if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, null, even);
    }
    // restart() {
    //     this.node.setPosition(this.startPoi);
    // }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
