import AudioManager from "../common/AudioManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class item_move extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.String)
    isrot: String = "";

    @property(cc.String)
    isphone: String = "";

    @property(cc.Node)
    tweenpoi: cc.Node = null;

    @property(cc.String)
    audioName: string = "";

    @property(cc.String)
    isying: string = "";

    @property(cc.Integer)
    rotNum: String = "";

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
        // this.node.position = 

    }
    private onTouchMove(event: cc.Event.EventTouch): void {
        let delta = event.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;
        if (this.isrot) {
            this.node.angle = -Number(this.rotNum);
        }
    }



    private onTouchEnd(event: cc.Event.EventTouch): void {
        let tarNode: cc.Node = this.target;
        if (!this.target.active) {
            this.node.position = this.original;
            return
        }
        if (this.isying == "true") {
            if (this.node.getBoundingBox().contains(cc.v2(tarNode.x, tarNode.y))) {
                this.node.parent.getChildByName("fs_sk").active = true;
               
                this.node.destroy();
            } else {
                this.node.position = this.original;
            }
            return
        }
        if (this.node.getBoundingBox().contains(cc.v2(tarNode.x, tarNode.y))) {
            if (this.node.name == "gan") {
                cc.Tween.stopAllByTarget(this.node);
                AudioManager.playEffect(AudioManager.audioName.clother);
                tarNode.zIndex = 51;
                cc.tween(tarNode)
                    .to(0.5, { position: this.tweenpoi.position, angle: -90 })
                    .call(() => {
                        tarNode.getChildByName("state1").active = false;
                        tarNode.getChildByName("state2").active = true;
                        this.onDeleTouchHandle();
                        this.node.position = this.original;
                        this.node.angle = 0;
                        this.node.zIndex = 0;
                    })
                    .start()
                return
            }


            var rot = this.node.angle;
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .to(0.5, { angle: rot + 360 })
                .call(() => {
                    if (this.isphone == "true") {
                        this.node.getChildByName("state1").active = false;
                        this.node.getChildByName("state2").active = true;
                        AudioManager.playEffect(AudioManager.audioName.phoneUnlock);
                    } else {
                        tarNode.getChildByName("state1").active = false;
                        tarNode.getChildByName("state2").active = true;
                        if (tarNode.getChildByName("sk")) tarNode.getChildByName("sk").active = true;
                        if (this.audioName != "") {
                            AudioManager.playEffect(this.audioName);
                        } else {
                            AudioManager.playEffect(AudioManager.audioName.zhaq);
                        }
                    }
                })
                .delay(0.1)
                .call(() => {
                    this.onDeleTouchHandle();
                    this.node.position = this.original;
                    this.node.angle = 0;
                    this.node.zIndex = 0;
                })
                .start()
            return
        }
        this.node.position = this.original;
        this.node.angle = 0;
        this.node.zIndex = 0;
    }

}
