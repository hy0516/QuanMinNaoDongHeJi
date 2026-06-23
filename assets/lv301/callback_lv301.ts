

const {ccclass, property} = cc._decorator;

@ccclass
export default class callback_lv301 extends cc.Component {
    @property(cc.Node)
    zhua: cc.Node = null;
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        this.zhua.getComponent(`zhua_lv301`).catchTarget(other.node);
    }
}
