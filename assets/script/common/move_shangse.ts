import BaseGame from "./BaseGame";
import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class move_shangse extends cc.Component {

    public target: cc.Node[] = [];

    public main: cc.Node = null;

    startPoi: cc.Vec2 = null;


    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.node.zIndex = 51;
    }
    onTouchMove(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.node.zIndex = 0;
        var isok = false;
        var item: cc.Node
        for (let i = 0; i < this.target.length; i++) {
            item = this.target[i];
            var poi = item.parent.convertToNodeSpaceAR(even.getLocation());
            if (item.getBoundingBox().contains(poi)) {
                this.scheduleOnce(() => {
                    this.main.getComponent(BaseGame).onwin();
                }, 0.01)
                item.color = this.node.color;
                break;
            }
        }

        this.node.setPosition(this.startPoi);
    }
}
