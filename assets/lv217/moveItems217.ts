import BaseGame from "../script/common/BaseGame";
const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItems2 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

    @property(cc.Node)
    main: cc.Node = null;

    startPoi: cc.Vec2 = null;
    originalZIndex: number = 0;
    originalSiblingIndex: number = -1;

    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.originalZIndex = this.node.zIndex;
        this.originalSiblingIndex = this.node.getSiblingIndex();
        this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    oninit() {
        // 保持不变
    }

    onTouchStart(even: cc.Event.EventTouch) {
        this.node.zIndex = 100;
        this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
    }

    onTouchMove(even: cc.Event.EventTouch) {
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
    }

    onTouchEnd(even: cc.Event.EventTouch) {
        if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, null, even);
    }

    restart() {
        this.node.setPosition(this.startPoi);
        this.node.zIndex = 0;
        if (this.originalSiblingIndex !== -1) {
            this.node.setSiblingIndex(this.originalSiblingIndex);
        }
    }

    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}