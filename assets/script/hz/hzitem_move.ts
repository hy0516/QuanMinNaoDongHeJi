import AudioManager from "../common/AudioManager";
import BaseGame from "../common/BaseGame";
import GameData from "../common/GameData";
import AssetManager from "../common/AssetManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class hzitem_move extends cc.Component {


    @property(cc.Node)
    icon: cc.Node = null;

    // @property(cc.Node)
    // target: cc.Node = null;

    // @property(cc.String)
    // audioName: string = "";

    // data: { id: number, icon: string, target: string, qplab: string } = null;

    data: any = null;

    public mainNode: cc.Node;

    public Bgicon: cc.Node;
    public skin: cc.SpriteFrame;

    public startPoi: cc.Vec2

    protected onLoad(): void {
        this.mainNode = this.node.parent.parent.parent.parent
        this.Bgicon = this.mainNode.getChildByName("icon");
        this.Bgicon.active = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    refreshIcon() {
        if (this.Bgicon = null) return
        this.Bgicon = null;
        this.Bgicon = this.mainNode.getChildByName("icon");
    }
    onTouchStart() {
        if (!this.Bgicon) {
            this.refreshIcon();
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.Bgicon) {
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
            this.Bgicon.active = true;
            //@ts-ignore
            this.Bgicon.position = this.mainNode.convertToNodeSpaceAR(event.getLocation());
            this.Bgicon.getComponent(cc.Sprite).spriteFrame = this.skin;
            this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = false;
            this.icon.opacity = 0;
        }

    }
    onTouchEnd(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.Bgicon.active) return
        GameData.PauseGame = true;
        this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = true;
        this.Bgicon.active = false;
        var parent = this.node.parent;
        var list = this.data.target.split("|");
        var qplist = this.data.qplab.split("|");
        var qptarget = GameData._itemList[qplist[0]];
        var target = GameData._itemList[list[0]];
        var rect = cc.rect(target.x, target.y, target.width, target.height);
        var rect1 = cc.rect(this.Bgicon.x, this.Bgicon.y, this.Bgicon.width, this.Bgicon.height);
        if (cc.Intersection.rectRect(rect1, rect)) {
            if (!target.getChildByName(list[1])) {
                return;
            }
            target.getChildByName(list[1]).active = true;
            AudioManager.playEffect(this.data.music);
            AudioManager.playEffect(AudioManager.hz_audio.movesucc_hz);
            // AudioManager.playEffect("hzlv3_10");
            if (list[2]) target.getChildByName(list[2]).active = false;
            GameData.getMap[GameData.getMap.length] = this.data.id.toString()
            if (parent.childrenCount != 1) {
                this.node.destroy();
                this.node.parent.width -= 156;
            } else {
                this.node.opacity = 0;
                GameData.PauseGame = true;
            }
            var qp = qptarget.getChildByName("qipao")
            qp.opacity = 0;
            qp.active = true;
            qp.getChildByName("qplab").getComponent(cc.Label).string = qplist[1];
            cc.Tween.stopAllByTarget(qp);
            cc.tween(qp)
                .to(0.3, { opacity: 255 })
                .delay(1.0)
                .to(0.3, { opacity: 0 })
                .call(() => {
                    qp.opacity = 0;
                    GameData.PauseGame = false;
                    if (this.node && this.node.opacity == 0) {
                        GameData.PauseGame = true;
                        this.Bgicon.parent.getComponent(BaseGame).loadend();
                    }
                })
                .start()

            var yansk = this.Bgicon.parent.getChildByName("bg").getChildByName("yan_sk");
            // @ts-ignore
            yansk.position = this.Bgicon.parent.convertToNodeSpaceAR(event.getLocation());
            yansk.active = true;
            yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
        } else {
            GameData.PauseGame = false;
            AudioManager.playEffect(AudioManager.hz_audio.movelost_hz);
            var sk = this.Bgicon.parent.getChildByName("sk");
            this.Bgicon.parent.getComponent(BaseGame).addTime(null, -5);
            sk.active = true;
            // @ts-ignore
            sk.position = this.Bgicon.parent.convertToNodeSpaceAR(event.getLocation());
            sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("cuo", 1);
            this.icon.opacity = 255;
        }

    }

    oninit(data: any) {
        AssetManager.load(GameData.curGameStyle, data.icon, cc.SpriteFrame, null, (skin: cc.SpriteFrame) => {
            this.icon.getComponent(cc.Sprite).spriteFrame = skin;
            this.data = data;
            this.skin = skin;

        })

    }



}
