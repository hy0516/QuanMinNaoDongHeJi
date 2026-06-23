import BaseGame from "../script/common/BaseGame";
import HCSHJ_EventType_219 from "./HCSHJ_EventType_219";




const { ccclass, property } = cc._decorator;

@ccclass
export default class colliderHandler_hcshj_219 extends cc.Component {

    // @property(cc.Node)
    // main: cc.Node = null;
    // @property(cc.Prefab)
    // NextLevelPrefab: cc.Prefab = null;
    islost:boolean=false;

    onBeginContact(contact,selfCollider, otherCollider) {
        // 获取碰撞点的世界坐标
      //  const Manifold = contact.getManifold();
        const WorldManifold = contact.getWorldManifold();
        let isContactYOver = false;
        // 遍历所有碰撞点（通常为1-2个）
        for (const point of WorldManifold.points) {
            //console.log(point.y);
            if (point.y > 856) {  // 原：1080
                isContactYOver = true;
                break; // 满足条件即跳出循环
            }
        }

      
        if (isContactYOver&&!this.islost) {
            this.islost=true;
            this.node.dispatchEvent(new cc.Event.EventCustom(HCSHJ_EventType_219.GAMELOST_EVENT, true));
        }
          // 如果存在碰撞点 Y 坐标 > 320，触发游戏失败
        // if(this.node.y> 140)//320
        // {
        //     this.node.dispatchEvent(new cc.Event.EventCustom(HCSHJ_EventType_219.GAMELOST_EVENT, true));
        // }
        if(selfCollider.node.name!=otherCollider.node.name)return;
      
         let cusEvent = new cc.Event.EventCustom(HCSHJ_EventType_219.CONTACTCOLLIDER_EVENT, true);
         cusEvent.setUserData(contact);
         this.node.dispatchEvent(cusEvent);
      
    }
}
