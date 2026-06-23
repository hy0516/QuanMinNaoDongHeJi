import AudioManager from "../common/AudioManager";
import BaseGame from "../common/BaseGame";
import GameData from "../common/GameData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item_click4 extends cc.Component {

    @property(cc.Node)
    state1: cc.Node = null;

    @property(cc.Node)
    statecli: cc.Node = null;

    @property(cc.Node)
    state2: cc.Node = null;

    @property(cc.Node)
    target: cc.Node = null;


    protected onLoad(): void {
        this.statecli.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public closeBtn() {
        this.statecli.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    }

    public onTouchStart(event): void {
        if (GameData.PauseGame == true) return
        GameData.PauseGame = true;
        // var sk = this.node.parent.parent.getChildByName("sk");
        // if (sk) {
        //     sk.position = this.node.position;
        //     sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("guang", 1);
        // }
        var yan = this.node.parent.getChildByName("sk_yan");
        yan.position = this.node.position;
        yan.active = true;
        yan.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
        this.state1.active = false;
        this.state2.active = true;
        AudioManager.playEffect(AudioManager.audioName.find);
        if (this.target) {
            this.target.active = true;
            this.target.getComponent(item_click4).state2.active = true;
            this.target.getComponent(item_click4).closeBtn();
        }
        this.scheduleOnce(() => {
            cc.find("Canvas/" + GameData.curGameName).getComponent(BaseGame).tweenState2(event, null, this.node.name, () => {
                this.closeBtn();
                this.statecli.active = false;
            });
        }, 1)


    }
}
