import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import lldq_lv250 from "./lldq_lv250";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ColliderListen_lv250 extends cc.Component {

    @property(cc.Node)
    BaseNode: cc.Node = null;
   // 球的属性
   @property
   minScale: number = 0.2; // 最小缩放限制
   
   @property
   maxScale: number = 10; // 最大缩放限制
   
   
   scaleChangeRate: number = 0.05; // 缩放变化率

    // 内部属性
    private rigidBody: cc.RigidBody = null;
   // private currentScale: number = 1.0;
    mainTs;//

     onLoad(): void {
         // 获取刚体组件
         this.rigidBody = this.getComponent(cc.RigidBody);
        cc.director.getCollisionManager().enabled = true;
       // this.currentScale=this.node.scale;
        this.mainTs=this.BaseNode.getComponent(lldq_lv250);

    }
    onCollisionEnter(other: any)
    {
        console.log(`collision Enter`);
        
    }
    onCollisionStay(other: any)
    {
        console.log(`collision Stay`);
    }
    onCollisionExit(other: any)
    {
        console.log(`collision Exit`);
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
      //  console.log(`onBeginContact`);
         // 确保是球与球的碰撞
         if (otherCollider.node.name.includes('fh')) {
            const otherBall = otherCollider.node;
           if(this.node.scale>=otherBall.scale)
           {
         //   console.log(`大于别的球`);
            this.changeScale(this.scaleChangeRate,otherBall);
           }else
           {
          //  console.log(`小于别的球`);
          if(!this.node.children[1].active)
            this.changeScale(-this.scaleChangeRate,otherBall);
           }
        }
    }
    // 改变球的缩放
    changeScale(delta: number,otherBall:cc.Node) {
        if(delta<0)
        {
            this.node.scale = Math.max(this.minScale, Math.min(this.maxScale,  this.node.scale + delta));
        }else
        {
            this.node.scale = Math.max(this.minScale, Math.min(this.maxScale,  this.node.scale + delta/5));//
        }
        

        otherBall.scale =Math.max(this.minScale, Math.min(this.maxScale, otherBall.scale - delta));
        
        // // 根据球的大小调整质量（可选）
        // if (this.rigidBody) {
        //     const newMass = 100 * this.currentScale; // 质量与大小成正比
        //     this.rigidBody.getMass = () => newMass;
        // }
        
        // 如果球变得太小，可以销毁它（可选）
        if ( this.node.scale<= this.minScale) {

            //this.node.destroy();
            if(!this.mainTs.islost)
            {
                this.node.active=false;
                this.mainTs.islost=true;
                this.mainTs.onlost()
            }
            
        }
        if (otherBall.scale <= this.minScale) {
            AudioManager.playEffect(`吞噬`);
           this.mainTs.destroyFHBall(otherBall);
        }
        this.mainTs.updateJinDuLabel();
       
    }
    
}
