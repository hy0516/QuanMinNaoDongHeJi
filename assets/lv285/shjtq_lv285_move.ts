
import BaseGame from "../script/common/BaseGame";
import shjtq_lv285 from "./shjtq_lv285";
const { ccclass, property } = cc._decorator;
@ccclass
export default class shjtq_lv285_move extends BaseGame {
    @property(cc.Node)
    mainNode:cc.Node=null;

    mainTs:shjtq_lv285;
    canwalk:boolean=true;
    originalTimeScale =1;
    tempX=0;

    onLoad() {
        this.mainTs=this.mainNode.getComponent(shjtq_lv285);
        this.node.getComponent(dragonBones.ArmatureDisplay).timeScale=this.originalTimeScale;
    }
    update(dt: number): void {
        if(this.canwalk)
        {
            this.tempX=null;
            this.node.x-=5;
            if(this.mainTs.isHard) this.node.x-=4;//难度飙升
            if(this.node.x<=-1200)
            {
                this.node.x =1200;
            }
        }else
        {
            if(this.tempX==null)this.tempX=this.node.x;
            this.tempX-=5;
            if(this.mainTs.isHard) this.tempX-=4;
            if(this.tempX<=-1200)
            {
                this.tempX=1200;
            }
        }
    }
  
}



