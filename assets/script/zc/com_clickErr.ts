import AudioManager from "../common/AudioManager";
import BaseGame from "../common/BaseGame";
import common from "../common/common";

const { ccclass, property } = cc._decorator;

@ccclass
export default class com_clickErr extends cc.Component {
    public clickPool: cc.NodePool = new cc.NodePool();
    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        cc.resources.load('prefabs/common/clickErr', cc.Prefab, (err, pre: cc.Prefab) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i = 0; i < 20; i++) {
                let clone = cc.instantiate(pre);
                this.clickPool.put(clone);
            }
        })
        common.closeSk();
    }
    onTouchStart(event: cc.Event.EventTouch) {
        // console.log("yes----------------------");
        AudioManager.playEffect("com_cuo");
        let dra = this.clickPool.get();
        dra.parent = this.node.parent.parent;
        this.node.parent.parent.getComponent(BaseGame).setTime(-5)
        // @ts-ignore 
        dra.position = this.node.parent.parent.convertToNodeSpaceAR(event.getLocation());
        dra.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("cuo", 1);
        this.scheduleOnce(function () {
            this.clickPool.put(dra);
        }, 2)
    }

}