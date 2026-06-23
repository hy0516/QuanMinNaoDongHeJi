
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import ddl_lv248 from "./ddl_lv248";
import player_lv248 from "./player_lv248";
const { ccclass, property } = cc._decorator;

@ccclass
export default class qsh_lv248 extends BaseGame {
    @property(cc.Node)
    mainNode: cc.Node = null;

    mainTs;
    canMove =true;
    movespeed = 9;
    onLoad() {
      this.mainTs=cc.find("Canvas/" + GameData.curGameName).getComponent(ddl_lv248);
       // console.log((`qsh`));
      // this.node.scale=0.8;
    }
    update(dt: number): void {
        if(this.canMove)
        {
            if(this.node.x>0)
            {
                this.node.x-=this.movespeed;
                if(this.node.x<0)this.node.x=0;
            }else if(this.node.x<0)
            {
                this.node.x+=this.movespeed;
                if(this.node.x>0)this.node.x=0;
            }
        }
        if(this.node.children[0].active)
        {
            this.collCheck();
        }
    }
    collCheck()
    {
        if(cc.Intersection.rectRect(this.node.children[0].getBoundingBoxToWorld(),this.mainTs.player.getChildByName(`collNode`).getBoundingBoxToWorld()))
        {
            this.canMove=false;
            this.mainTs.canjiaohu=false;
            this.node.children[0].active=false;
            this.mainTs.player.getComponent(player_lv248).interruptJump();
            this.mainTs.checkColl();
        }
        
    }
}

