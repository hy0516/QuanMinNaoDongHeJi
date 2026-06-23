import BaseGame from "../script/common/BaseGame";
import lldq_lv250 from "./lldq_lv250";



const { ccclass, property } = cc._decorator;

@ccclass
export default class qi_lv250 extends cc.Component {
  
     // 推力大小
     private forceMax: number = 500;


    mainTs;//
    balls;

     onLoad(): void {
        //this.node.angle-=90;
        this.mainTs=this.node.parent.parent.getComponent(lldq_lv250);
        this.balls=this.mainTs.balls;
         // 对喷气范围内的球体施加力
        // 延迟一帧执行，确保所有节点已正确初始化
      //  this.scheduleOnce(() => {
        this.scheduleOnce(()=>{
            // let widgets = this.node.getComponentsInChildren(cc.Widget)
            // widgets.forEach(widget => {
            //     widget.updateAlignment();
            // })
            this.applyJetForceToBalls();
          })
            
        //}, 0);
    }

     // 对喷气范围内的球体施加力
     applyJetForceToBalls() {
        // 获取喷气节点的世界坐标
        const jetWorldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        for (let j = 0; j < this.balls.length; j++) {
           
            const ballNode = this.balls[j];
            if (!ballNode.isValid) continue;
            
          
            
         
            
            if (cc.Intersection.rectRect(this.node.children[1].getBoundingBoxToWorld(), ballNode.getBoundingBoxToWorld())) {
               
                  // 获取球体的世界坐标
            const ballWorldPos = ballNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            
            // 计算球体与喷气效果的距离
            const distance = cc.Vec2.distance(jetWorldPos, ballWorldPos);

                 // 计算从小球位置到触摸点的方向向量
                 let direction = ballWorldPos.sub(jetWorldPos).normalize().neg();
               

                // 计算力的大小（距离越近力越大）
                const forceMagnitude = this.forceMax * (1 - distance / this.node.width*this.node.scale);
                const force = direction.clone().multiplyScalar(forceMagnitude);
               
               
                // 获取球体的刚体组件并施加力
                const rigidBody = ballNode.getComponent(cc.RigidBody);
                if (rigidBody) {
                    rigidBody.applyForceToCenter(force, true);
                }

            }
            // // 如果在喷气作用范围内
            // if (distance < jet.radius) {
              
            // }
        }
        this.scheduleOnce(()=>{
            this.node.destroy();
        },0.5);
    }
}
