import AudioManager from "../common/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class item_move2 extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.String)
    audioName: string = "";

    @property(cc.String)
    rot: string = "";


    @property(cc.String)
    type: string = "";

    original: cc.Vec3;



    // startPoi:

    onLoad() {
        this.original = this.node.position;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDeleTouchHandle() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: cc.Event.EventTouch) {

        this.node.zIndex = 50;
        if (this.rot) this.node.angle = Number(this.rot) ;
        // this.node.position = 

    }
    private onTouchMove(event: cc.Event.EventTouch): void {
        let delta = event.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;

    }



    private onTouchEnd(event: cc.Event.EventTouch): void {
        let tarNode: cc.Node = this.target;
        if (!this.target.active) {
            this.node.position = this.original;
            return
        }
        var clickPo = tarNode.parent.convertToNodeSpaceAR(event.getLocation())
        if (tarNode.getBoundingBox().contains(clickPo)) {
            cc.Tween.stopAllByTarget(this.node);
            AudioManager.playEffect(this.audioName);
            switch (this.type) {
                case "1":
                    this.node.getChildByName("state2").active = true;
                    this.node.getChildByName("state1").active = false;
                    var poi = new cc.Vec3(this.node.x + 30, this.node.y + 30, this.node.z);
                    cc.tween(this.node)
                        .to(0.6, { position: poi })
                        .to(0.3, { opacity: 0 })
                        .delay(0.5)
                        .call(() => {
                            tarNode.active = true;
                            tarNode.getChildByName("state2").active = true;
                            AudioManager.playEffect("zclv3_24");
                            this.onDeleTouchHandle();
                            this.node.destroy();
                        })
                        .start()
                    break;
                case "2":
                    tarNode.active = true;
                    tarNode.getChildByName("state2").active = true;
                    tarNode.getChildByName("state1").active = false;
                    this.onDeleTouchHandle();
                    this.node.destroy();
                    break;
                case "3":
                    this.node.parent.getChildByName("fs_sk").active = true;
                    this.node.destroy();
                    break;
                default:
                    tarNode.active = true;
                    tarNode.getChildByName("state2").active = true;
                    tarNode.getChildByName("state1").active = false;
                    this.onDeleTouchHandle();
                    break;
            }
            return
        }

        this.node.position = this.original;
        this.node.angle = 0;
        this.node.zIndex = 0;
    }

}
