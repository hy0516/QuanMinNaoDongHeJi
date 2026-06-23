
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class qlitem_move2 extends cc.Component {


    @property(cc.Node)
    icon: cc.Node = null;

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.Node)
    mainNode: cc.Node = null;

    @property(cc.Integer)
    type: number = 0;


    data: any = null;

    public Bgicon: cc.Node;
    public skin: cc.SpriteFrame;
    public startPoi: cc.Vec2

    protected onLoad(): void {
        // this.Bgicon = cc.find("Canvas/ql_lv1/icon");

        // console.log(this.mainNode)
        this.Bgicon = this.mainNode.getChildByName("icon");
        this.Bgicon.active = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    refreshIcon() {
        this.Bgicon = this.mainNode.getChildByName("icon");
    }
    onTouchStart() {

    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) {
            return
        }
        if (this.Bgicon.active) {
            //@ts-ignore
            this.Bgicon.position = this.mainNode.convertToNodeSpaceAR(event.getLocation());
            return
        }
        var curPoi = this.mainNode.convertToNodeSpaceAR(event.getLocation());
        var biaozhui = this.node.parent.position.y + (this.node.height / 2);
        if (curPoi.y > biaozhui) {
            //@ts-ignore
            this.Bgicon.position = this.mainNode.convertToNodeSpaceAR(event.getLocation());
            this.Bgicon.active = true;
            // @ts-ignore
            this.Bgicon.getComponent(cc.Sprite).spriteFrame = this.icon.getComponent(cc.Sprite).spriteFrame;
            this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = false;
        }

    }
    onTouchEnd(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.Bgicon.active) return
        // GameData.PauseGame = true;
        this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = true;
        var poi = this.target.parent.convertToNodeSpaceAR(event.getLocation());
        if (this.target.getBoundingBox().contains(poi)) {
            var handler = (type) => {
                if (type == 0) {
                    this.node.destroy();
                    this.node.parent.width -= 150;
                } else {
                    var sk = this.Bgicon.parent.getChildByName("sk");
                    sk.active = true;
                    sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("cuo", 1);
                    AudioManager.playEffect(AudioManager.ql_audio.cuo);
                    this.mainNode.getComponent(BaseGame).addTime(null, -5);
                }

                // }, 0.02);
            }
            this.mainNode.getComponent(BaseGame).moveHandler(this.type, this.target, event, handler);

        } else {
            var sk = this.Bgicon.parent.getChildByName("sk");
            sk.active = true;
            sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("cuo", 1);
            AudioManager.playEffect(AudioManager.ql_audio.cuo);
            this.mainNode.getComponent(BaseGame).addTime(null, -5);

        }
        this.Bgicon.active = false;
        GameData.PauseGame = false;
    }

    oninit(data: any) {
        this.data = data;

    }



}
