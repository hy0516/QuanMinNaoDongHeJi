
const {ccclass, property} = cc._decorator;

@ccclass
export default class Wolf_CorrallingFlock242 extends cc.Component {

    onLoad(){
        this.node.zIndex = 14;
    }

    /** 获取圆信息 */
    public getCircle(){
        let circleCollider = this.node.getComponent(cc.PhysicsCircleCollider);
        let circle = {position:this.node.convertToWorldSpaceAR(cc.Vec2.ZERO).add(circleCollider.offset), radius:circleCollider.radius};

        return circle;
    }

    public getWorldPosition() {
        return this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
    }

    public setRedColor(){
        this.node.color = cc.Color.RED;
    }
}
