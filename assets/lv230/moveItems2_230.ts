import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItems2_230 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

   

    @property(cc.Node)
    main: cc.Node = null;

    startPoi: cc.Vec2 = null;

    // @property(cc.Integer)
    // isChangeIndex: number = 0;


    printDoor(){
        let door = this.node.parent.getChildByName("door");
        // console.log(door.position);
    }
    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    oninit() {
        // var but = this.node.getComponent(cc.Button);
        // if (but) but.enabled = false;
    }
    onTouchStart(even: cc.Event.EventTouch) {

        if(GameData.PauseGame) return;
        // if (this.isChangeIndex == 0)
        this.node.zIndex = 100;

        this.printDoor();
    }
    onTouchMove(even: cc.Event.EventTouch) {

        if(GameData.PauseGame) return;

        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;

       // this.printDoor();
    }
    onTouchEnd(even: cc.Event.EventTouch) {

        if(GameData.PauseGame) return;
        // var rect = cc.rect(this.node.x, this.node.y, this.node.width, this.node.height);
        // var rect1 = cc.rect(this.target.x, this.target.y, this.target.width, this.target.height);
        // if (cc.Intersection.rectRect(rect, rect1)) {
        if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, null, even);
        // if (this.type != 4) this.node.destroy();
        // } else {
        //     this.node.setPosition(this.startPoi);
        // }

        this.printDoor();

    }
    restart() {
        this.node.setPosition(this.startPoi);
    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
