import DX_EventType356 from "./DX_EventType356";

const { ccclass, property } = cc._decorator;

@ccclass    /** 羊 */
export default class Sheep_CorrallingFlock356 extends cc.Component {

    /** 是否触碰到安全区域 */
    private m_isHitSafeArea = false;
    /** 是否碰到了狼 */
    private m_isHitWolf = false;



    onLoad() {
        this.node.zIndex = 15;
    }

    start(){
        // 缩放大小会连碰撞体一起放大 羊会挤出线圈
        // let tween = cc.tween().to(0.5, {scale:1.1}).to(0.5, {scale:1});
        
        let startWidth = this.node.width;
        let startHeight = this.node.height;
        let endWidth = startWidth*1.1;
        let endHeight = startHeight*1.1;
        let tween = cc.tween().to(0.5, {width:endWidth, height:endHeight}).to(0.5, {width:startWidth, height:startHeight});
        cc.tween(this.node).repeatForever(tween).start();
    }


    // 层级太多了 用了别的模式合适的
    // 碰到狼变红
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.node.name == "wolf"||otherCollider.node.name == "tyzr") {
            this.m_isHitWolf = true;
            this.setRedColor();
            //直接游戏失败
            this.node.dispatchEvent(new cc.Event.EventCustom(DX_EventType356.CrossTheRiver_OnGameFail, true));
        }
        else if (otherCollider.node.group == "wall") {
            this.m_isHitSafeArea = true;
        }
        else if (otherCollider.node.name == "safeLine") {
            console.log(`is safe`);
            this.m_isHitSafeArea = true;
        }
    }
    public setRedColor(){
        this.node.color = cc.Color.RED;
    }
    /** 时间结束 判断是否安全 */
    public getIsSafe() {
        return this.m_isHitSafeArea && !this.m_isHitWolf;
    }

    public getWorldPosition() {
        return this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
    }

}
