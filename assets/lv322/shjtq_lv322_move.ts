
import BaseGame from "../script/common/BaseGame";
import shjtq_lv322 from "./shjtq_lv322";
const { ccclass, property } = cc._decorator;
@ccclass
export default class shjtq_lv322_move extends BaseGame {
    @property(cc.Node)
    mainNode:cc.Node=null;

    mainTs:shjtq_lv322;
    canwalk:boolean=true;
    originalTimeScale =1.5;
    tempX=0;

    onLoad() {
        this.mainTs=this.mainNode.getComponent(shjtq_lv322);
        this.node.getComponent(dragonBones.ArmatureDisplay).timeScale=this.originalTimeScale;
    }
    update(dt: number): void {
        if(this.canwalk)
        {
            this.tempX=null;
          
            const baseSpeed = 8 * (this.mainTs.globalSpeedMultiplier || 1.0);
            this.node.x -= baseSpeed;
            if(this.mainTs.isHard) this.node.x -= baseSpeed; 
            if(this.node.x<=-2400)
            {
                this.node.x =1600;
            }
        }else
        {
            if(this.tempX==null)this.tempX=this.node.x;
            
            const baseSpeed = 8 * (this.mainTs.globalSpeedMultiplier || 1.0);
            this.tempX -= baseSpeed;
            if(this.mainTs.isHard) this.tempX -= baseSpeed;
            if(this.tempX<=-2400)
            {
                this.tempX=1600;
            }
        }
    }
  
}



