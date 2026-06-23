const {ccclass, property} = cc._decorator;

@ccclass
export default class check_lv301 extends cc.Component {
    @property(cc.Node)
    main: cc.Node = null;
    onCollisionStay(other: cc.Collider, self: cc.Collider) {
        console.log(other.node.name);
        this.main.getComponent(`wwj_lv301`).showWW(other.node);
    }
}
