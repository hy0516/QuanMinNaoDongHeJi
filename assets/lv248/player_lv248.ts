
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import ddl_lv248 from "./ddl_lv248";
const { ccclass, property } = cc._decorator;

@ccclass
export default class player_lv248 extends BaseGame {
    @property(cc.Node)
    mainNode: cc.Node = null;

     // 跳跃相关变量
     private isJumping: boolean = false;
     private jumpProgress: number = 0;
     private jumpDuration: number = 0.6; // 总跳跃时长
     private jumpHeight: number = 270; // 跳跃高度

    mainTs;//
    playerSke;//
    curY;
   
   

  onLoad() {
    this.mainTs = this.mainNode.getComponent(ddl_lv248);
    this.playerSke = this.node.getComponent(dragonBones.ArmatureDisplay);
    this.playerSke.armature().animation.gotoAndStopByFrame(`tiao`, 0);
    this.curY=this.node.y;
    
  }
  update(dt: number): void {
    if (this.isJumping) {
      // 更新跳跃进度
      this.jumpProgress += dt;

     
      let t = this.jumpProgress / (this.jumpDuration / 2);

      if (t < 1) {
        // 上升阶段 (前半段)
        this.node.y = this.curY+this.jumpHeight * t * (2 - t);
      } else {
        // 下降阶段 (后半段)
        t = t - 1;
        this.node.y = this.curY+this.jumpHeight * (1 - t * t);
      }

      // 检查跳跃是否完成
      if (this.jumpProgress >= this.jumpDuration) {
        this.endJump();
      }
    }
  }

  // 开始跳跃方法
  triggerJump(): void {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpProgress = 0;
      // 播放跳跃动画
      if (this.playerSke) {
        this.playerSke.playAnimation(`tiao`,1);
        if(this.node.children[1].active)
        {
            this.node.children[1].getComponent(dragonBones.ArmatureDisplay).playAnimation(`ttr`,1);
        }
        if(this.node.children[2].active)
        {
            this.node.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation(`kbqn`,1);
        }
      }
    }
  }

  // 打断跳跃方法
  interruptJump(): void {
    if (this.isJumping) {
      //this.endJump();
      this.isJumping = false;
      this.playerSke.armature().animation.gotoAndStopByFrame('tiao', 0);
      this.curY=this.node.y;
    }
  }

  // 结束跳跃
  private endJump(): void {
    this.isJumping = false;
    this.node.y = this.curY; // 回到原点
    // 重置动画
    if (this.playerSke) {
      this.playerSke.armature().animation.gotoAndStopByFrame('tiao', 0);
      this.mainTs.canjiaohu=true;
    }
  }
}

