
import RouteLogic_CorrallingFlock2 from "./RouteLogic_CorrallingFlock296";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameViewLogic_CorallingFlock2 extends cc.Component {
    @property(cc.Prefab)
    physicsNode: cc.Prefab = null;


    private m_physicsNode = null;


    onLoad() {
        this.node.getComponent(cc.Widget).target = cc.find("Canvas");
        this.node.getComponent(cc.Widget).updateAlignment();

        this.node.zIndex = 5;
    }
    start(){
        // this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.onGameStart();
    }
    public onGameStart() {
        this.m_physicsNode = null;

        let physicsNode = cc.instantiate(this.physicsNode);
        this.node.addChild(physicsNode, 1);
        this.m_physicsNode = physicsNode;
    }

    /** 重绘线条 */
    public Repaint(points:cc.Vec2[]){
        this.m_physicsNode.getComponent(RouteLogic_CorrallingFlock2).Repaint(points);
    }


    // onTouchStart(event:cc.Event.EventTouch) {
    //     let pos = event.getLocation();
    //     // let cusEvent = new cc.Event.EventCustom(DX_EventType.CrossTheRiver_OnTouchStart, true);
    //     // cusEvent.setUserData(pos);
    //     // this.node.dispatchEvent(cusEvent);
    // }

    // onSetCanDraw(pos:cc.Vec2, color:cc.Color){
    //     this.m_physicsNode.getComponent(RouteLogic_Transport).setColor(pos, color);
    // }

    // public onShowGuide(answer: string, color: cc.Color) {
    //     let answerNode = cc.instantiate(this.answerNode);
    //     this.node.parent.addChild(answerNode, 1);
    //     answerNode.getComponent(AnswerLogic_Transport).onDrawAnswer(answer, color);
    // }
}
