import AudioManager from "../common/AudioManager";
import BaseGame from "../common/BaseGame";
import GameData from "../common/GameData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item_click2 extends cc.Component {

    @property(cc.Node)
    statecli: cc.Node = null;

    @property(cc.Node)
    state2: cc.Node = null;

    @property(cc.Node)
    state3: cc.Node = null;

    @property(cc.String)
    audioName: string = "";

    @property(cc.String)
    ClickAudio: string = "";

    @property(cc.Integer)
    isyan: String = "";

    @property(cc.Node)
    target: cc.Node = null;


    protected onLoad(): void {
        this.statecli.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    private onTouchStart(event): void {
        if (GameData.PauseGame == true) return
        GameData.PauseGame = true;
        this.state2.active = true;
        if (this.isyan == "true") {
            var yan = this.node.parent.getChildByName("sk_yan");
            yan.position = this.node.position;
            yan.active = true;
            yan.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
        }
        AudioManager.playEffect(AudioManager.audioName.find);
        this.scheduleOnce(() => {
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).tweenState2(event, this.state3, this.node.name, () => {
                this.statecli.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
                this.statecli.active = false;
                if (this.target) this.target.active = true;
            }, this.audioName);
        }, 1)


    }

    // onclick() {
    //     if (this.isyan == "true") {
    //         var yan = this.node.parent.getChildByName("sk_yan");
    //         yan.position = this.node.position;
    //         yan.active = true;
    //         yan.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
    //         this.isyan = ""
    //     }
    //     if (this.target) this.target.active = true;
    //     AudioManager.playEffect(AudioManager.audioName.find);
    //     if (this.ClickAudio != "") AudioManager.playEffect(this.ClickAudio);
    //     this.state2.active = true;
    // }
}
