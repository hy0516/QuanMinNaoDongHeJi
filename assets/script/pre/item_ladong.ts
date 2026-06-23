import AudioManager from "../common/AudioManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class item_ladong extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.String)
    audioName: string = "";

    @property(cc.String)
    type: String = "";

    @property(cc.String)
    distance: String = "";

    original: cc.Vec2;

    curTime = 0;

    onLoad() {
        // this.original = this.node.position;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDeleTouchHandle() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.original = event.getLocation();
        this.curTime = new Date().getTime();
    }

    tweenHandler() {
        var nodey = this.node.y;
        AudioManager.playEffect(this.audioName);
        var distance = nodey - Number(this.distance)
        var poi = new cc.Vec3(this.node.x, distance, 0)
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.6, { position: poi })
            .to(0.3, { opacity: 0 })
            .delay(0.2)
            .call(() => {

                this.node.destroy();
            })
            .start()
    }


    private onTouchEnd(event: cc.Event.EventTouch): void {
        var end = event.getLocation();
        // var endtime = new Date().getTime() - this.curTime;
        // if (endtime > 650) return
        switch (this.type) {
            case "top":

                break;

            case "down":
                if (this.original.y > end.y) {
                    var num = this.original.y - end.y
                    if (num > 20) {
                        this.onDeleTouchHandle();
                        var renwu = this.target.getChildByName("state2").active = true;
                        var renwu = this.target.getChildByName("state2").active = true;
                        this.tweenHandler();
                    }
                }
                break;
            case "left":

                break;
            case "right":

                break;
        }
    }

}
