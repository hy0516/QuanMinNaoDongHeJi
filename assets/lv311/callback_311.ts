const { ccclass, property } = cc._decorator;

@ccclass
export default class callback_311 extends cc.Component {

    ske
    sk
    @property({ type: cc.Node })
    wupinglan: cc.Node = null;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        this.ske = this.node.getChildByName("ske");
        this.sk = this.ske.getComponent(dragonBones.ArmatureDisplay);
    }
    // onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    //     if (other.tag === 1 && !this.wupinglan.getComponent(`moving_311`).moving) {
    //         console.log("onCollisionEnter");
    //     }
    // }

    onCollisionExit(other: cc.Collider, self: cc.Collider) {
        if (!this.wupinglan.getComponent(`moving_311`).moving) {
            if (other.tag === 1) {
                this.sk.playAnimation("睡觉", 0);
            } else if (other.tag === 2) {
                this.sk.playAnimation("坐下", 0);

            } else if (other.tag === 3) {
                this.sk.playAnimation("坐下2", 0);
            } else if (other.tag === 4) {
                this.sk.playAnimation("葛优躺", 0);
            }
        }
    }
}
