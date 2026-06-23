import BaseGame from "./BaseGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class moveHandlerItem extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.Node)
    main: cc.Node = null;

    startPoi: cc.Vec2 = null;

    @property(cc.Integer)
    isChangeIndex: number = 0;


    protected onLoad(): void {

    }
    oninit() {
        this.startPoi = this.node.getPosition();
        this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        var but = this.node.getComponent(cc.Button);
        if (but) but.enabled = false;
    }
    onTouchStart(even: cc.Event.EventTouch) {
        if (this.isChangeIndex == 0) this.node.zIndex = 100;
    }
    onTouchMove(even: cc.Event.EventTouch) {
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
    }
    onTouchEnd(even: cc.Event.EventTouch) {  
        var rect = cc.rect(this.node.x, this.node.y, this.node.width, this.node.height);
        var rect1 = cc.rect(this.target.x, this.target.y, this.target.width, this.target.height);
        if (cc.Intersection.rectRect(rect, rect1) &&this.target.active) {
            if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, this.target, even);
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            if (this.type != 4) this.node.destroy();
        } else {
            this.node.setPosition(this.startPoi);
        }

    }
}
