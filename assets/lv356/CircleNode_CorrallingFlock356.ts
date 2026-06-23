
const { ccclass, property } = cc._decorator;

@ccclass
export default class CircleNode_CorrallingFlock356 extends cc.Component {

    private m_rigibody: cc.RigidBody = null;

    private shepherd: cc.Node = null;

    private m_force = 200;

    private m_ropeJoint: cc.RopeJoint = null;

    start() {
        this.m_rigibody = this.node.getComponent(cc.RigidBody);

        this.m_ropeJoint = this.node.getComponent(cc.RopeJoint);
    }

    public setShepherd(shepherd: cc.Node) {
        this.shepherd = shepherd;
    }

    /** 缩短绳子 前一半向起点收缩， 后一半向终点收缩 */
    public onShorted(startPos: cc.Vec2, endPos: cc.Vec2) {
        let f1 = endPos.sub(startPos).normalize().mul(this.m_force);
        if (this.m_rigibody === null) return;
        this.m_rigibody.applyForceToCenter(f1, true);
        // 加一个向牧羊人的力
        let f2 = this.shepherd.getPosition().sub(startPos);
        f2 = f2.mag() > 100 ? f2.normalize().mul(100) : f2;
        this.m_rigibody.applyForceToCenter(f2, true);
    }

    // update(){
    //     let f1 = this.shepherd.getPosition().sub(this.node.getPosition()).normalize().mul(this.m_force);

    //     // this.m_rigibody.applyForceToCenter(this.shepherd.getPosition().sub(this.node.getPosition()).normalize().mul(this.m_force), true);

    //     if(this.m_ropeJoint.connectedBody){
    //         let f2 = this.node.getPosition().sub(this.m_ropeJoint.connectedBody.node.getPosition()).normalize().mul(200);
    //         this.m_ropeJoint.connectedBody.applyForceToCenter(f1.add(f2),true);
    //     }
    // }


}
