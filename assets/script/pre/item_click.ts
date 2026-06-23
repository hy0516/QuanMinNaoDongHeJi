import AudioManager from "../common/AudioManager";
import BaseGame from "../common/BaseGame";
import GameData from "../common/GameData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item_click extends cc.Component {

    @property(cc.Sprite)
    state1: cc.Sprite = null;

    @property(cc.Sprite)
    state2: cc.Sprite = null;

    @property(cc.Sprite)
    state3: cc.Sprite = null;

    @property(cc.Button)
    staButt: cc.Button = null;



    @property(cc.String)
    audioName: string = "";

    @property(cc.String)
    ClickAudio: string = "";

    @property(cc.Integer)
    isyan: String = "";

    @property(cc.Node)
    target: cc.Node = null;


    protected onLoad(): void {
        this.state2.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    private onTouchStart(event): void {
        if (this.isyan == "true") {
            var yan = this.node.parent.getChildByName("sk_yan");
            yan.position = this.node.position;
            yan.active = true;
            yan.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
        }
        cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).tweenState2(event, this.state2.node, this.node.name, () => {
            this.state2.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
            if (this.state3) this.state3.node.active = true;
            this.state2.node.active = false;
            if (this.target) this.target.active = true;
        }, this.audioName);
    }

    onclick() {
        if (this.isyan == "true") {
            var yan = this.node.parent.getChildByName("sk_yan");
            yan.position = this.node.position;
            yan.active = true;
            yan.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
            this.isyan = ""
        }
        if (this.target) this.target.active = true;
        AudioManager.playEffect(AudioManager.audioName.find);
        if (this.ClickAudio!="") AudioManager.playEffect(this.ClickAudio);
        this.staButt.node.active = false;
        this.state1.node.active = false;
        this.state2.node.active = true;
        
    }

}
