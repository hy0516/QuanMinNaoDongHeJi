import AudioManager from "./AudioManager";
import BaseGame from "./BaseGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItems3 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;



    @property(cc.Node)
    main: cc.Node = null;

    startPoi: cc.Vec2 = null;

    // @property(cc.Integer)
    // isChangeIndex: number = 0;

    target: cc.Node;


    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        // this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    }

    onTouchStart(even: cc.Event.EventTouch) {
        // if (this.isChangeIndex == 0)
        if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, null, even);
        if (this.node.getChildByName("state2").active && this.node.name == this.target.name) {
            this.main.getComponent(BaseGame)['winnum']--;
        }
        if (this.target) this.target["islock"] = false;
        this.node.getChildByName("state1").active = true;
        this.node.getChildByName("state2").active = false;
        this.node.zIndex = 100;
    }
    onTouchMove(even: cc.Event.EventTouch) {
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        // if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, null, even);
        var mainScript = this.main.getComponent(BaseGame);
        var itemList = mainScript['_itemList'];
        let dis;

        for (let i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            var node = this.node
            var poi1 = this.node.getPosition();
            var poi2 = item.getPosition();
            let dis2 = poi1.sub(poi2).mag();
            if (!dis || dis2 < dis) {
                dis = dis2;
                this.target = item;
            }
            if (i == itemList.length - 1) {
                if (dis <= 50 && !this.target["islock"]) {
                    node.x = this.target.x;
                    node.y = this.target.y;
                    if (this.target.y < 0) {
                        this.node.zIndex = 3;
                    } else if (this.target.y < 100) {
                        this.node.zIndex = 2;
                    } else {
                        this.node.zIndex = 1;
                    }
                    this.target["islock"] = true;
                    if (this.node.name == this.target.name) mainScript["winnum"]++
                    node.getChildByName("")
                    node.getChildByName("state1").active = false;
                    node.getChildByName("state2").active = true;
                    AudioManager.playEffect(AudioManager.ql_audio.finishjq);
                    mainScript["and"].active = false;
                    mainScript["btn_win"].active = true;
                } else {
                    this.restart();
                }
            }
        }

    }
    restart() {
        this.node.zIndex = 0;
        this.node.setPosition(this.startPoi);
        this.target = null;
    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
