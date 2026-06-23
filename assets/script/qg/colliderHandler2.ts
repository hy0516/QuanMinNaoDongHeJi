import BaseGame from "../common/BaseGame";



const { ccclass, property } = cc._decorator;

@ccclass
export default class colliderHandler2 extends cc.Component {

    @property(cc.Node)
    main: cc.Node = null;
    iswin = false;

    onBeginContact(selfCollider, otherCollider, contact:cc.PhysicsCollider) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log(otherCollider.name)
        // if (!this.iswin && contact.name == "qiu<PhysicsChainCollider>") {
        //     contact.body.angularVelocity = 0;

        //     this.scheduleOnce(() => {
        //         this.main.getComponent(BaseGame).isGameOver = true;
        //     }, 1);
        //     this.iswin = true;
        // }
    }
}
