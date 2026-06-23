
import BaseGame from "../script/common/BaseGame";
import shjtq_lv391 from "./shjtq_lv391";
const { ccclass, property } = cc._decorator;
@ccclass
export default class shjtq_lv391_move extends BaseGame {
    @property(cc.Node)
    mainNode:cc.Node=null;

    mainTs:shjtq_lv391;
    canwalk:boolean=true;
    originalTimeScale =1;
    tempX=0;

    onLoad() {
        this.mainTs=this.mainNode.getComponent(shjtq_lv391);
        this.node.getComponent(dragonBones.ArmatureDisplay).timeScale=this.originalTimeScale;
    }
    update(dt: number): void {
        const wrapLeft = this.mainTs ? this.mainTs.getEnemyWrapLeftX() : -2000;
        const wrapPeriod = this.mainTs ? this.mainTs.getEnemyWrapPeriodX() : 3600;
        if(this.canwalk)
        {
            this.tempX=null;
          
            const baseSpeed = 8 * (this.mainTs.globalSpeedMultiplier || 1.0);
            this.node.x -= baseSpeed;
            if(this.mainTs.isHard) this.node.x -= baseSpeed*0.2; 
            while (this.node.x <= wrapLeft && wrapPeriod > 0) {
                this.node.x += wrapPeriod;
            }
        }else
        {
            if(this.tempX==null)this.tempX=this.node.x;
            
            const baseSpeed = 8 * (this.mainTs.globalSpeedMultiplier || 1.0);
            this.tempX -= baseSpeed;
            if(this.mainTs.isHard) this.tempX -= baseSpeed*0.2;
            while (this.tempX <= wrapLeft && wrapPeriod > 0) {
                this.tempX += wrapPeriod;
            }
        }
    }
  
}



