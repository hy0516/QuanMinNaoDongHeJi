
import BaseGame from "../script/common/BaseGame";
import shjtq_lv221 from "./shjtq_lv221";
const { ccclass, property } = cc._decorator;
@ccclass
export default class shjtq_lv221_move extends BaseGame {
    @property(cc.Node)
    mainNode:cc.Node=null;

    mainTs:shjtq_lv221;
    canwalk:boolean=true;
    originalTimeScale =1;
    tempX=0;

    onLoad() {
        this.mainTs=this.mainNode.getComponent(shjtq_lv221);
        this.node.getComponent(dragonBones.ArmatureDisplay).timeScale=this.originalTimeScale;
    }
    update(dt: number): void {
        if(this.canwalk)
        {
            this.tempX=null;
            this.node.x-=8;
            if(this.mainTs.isHard) this.node.x-=8;//难度飙升
            if(this.node.x<=-1500)
            {
                this.node.x =1500;
            }
        }else
        {
            if(this.tempX==null)this.tempX=this.node.x;
            this.tempX-=8;
            if(this.mainTs.isHard) this.tempX-=8;
            if(this.tempX<=-1500)
            {
                this.tempX=1500;
            }
        }
    }
  
}



