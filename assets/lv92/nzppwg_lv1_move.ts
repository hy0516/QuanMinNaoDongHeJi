
import AudioManager from "../script/common/AudioManager";
import tipsPanel from "../script/zc/tipsPanel";
import nzppwg_lv1 from "./nzppwg_lv1";




const { ccclass, property } = cc._decorator;
enum music {
    开门声 = "开门声",
    开窗声 = "开窗声",
}

@ccclass
export default class nzppwg_lv1_move extends cc.Component {

    @property(cc.String)
    type: string = "";
    @property(cc.Node)
    target: cc.Node = null;
    @property(cc.Node)
    mainNode: cc.Node = null;
    startPoi: cc.Vec2 = null;
    copyMove: cc.Vec2 = new cc.Vec2(0, 0);
    RZindex: number
    state:number=0;//1是已匹配


    private originalParent: cc.Node = null;
    private originalIndex: number = 0;
    
    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
       // this.target=this.mainNode.getComponent(nzxfx_lv1).allrole;
    }
    onTouchStart(even: cc.Event.EventTouch) {
        if(this.mainNode.getComponent(nzppwg_lv1).health<=0)return;
       
    //     // if (this.isChangeIndex == 0)
    //     // this.node.zIndex = 100;
    //    this.RZindex = this.node.zIndex;
    //     this.node.zIndex = 50;
   
         this.copyMove = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());//new cc.Vec2(0, 0); 
          // 记录原始状态
          this.originalParent = this.node.parent;
          this.originalIndex = this.node.getSiblingIndex();
          
          // 移动到根节点并置顶
          this.node.parent = cc.director.getScene();
          this.node.setSiblingIndex(cc.macro.MAX_ZINDEX);

          this.node.x = this.copyMove.x;
          this.node.y = this.copyMove.y;
    }
    onTouchMove(even: cc.Event.EventTouch) {
        if(this.mainNode.getComponent(nzppwg_lv1).health<=0)return;
        if(!this.mainNode.getComponent(nzppwg_lv1).iscanmove)return;
        var delay = even.getDelta();
        this.copyMove.x += delay.x;
        this.copyMove.y += delay.y;
        this.node.x = this.copyMove.x;
        this.node.y = this.copyMove.y;
        
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        if(this.mainNode.getComponent(nzppwg_lv1).health<=0)return;
        this.mainNode.getComponent(nzppwg_lv1).iscanmove=false;
        var ishuan =false;
        for (let index = 0; index < this.mainNode.getComponent(nzppwg_lv1).clicklist.childrenCount; index++) {
            const element = this.mainNode.getComponent(nzppwg_lv1).clicklist.children[index];
            element.getChildByName(`quan`).active=false;
        }
        for (let index = 0; index < this.mainNode.getComponent(nzppwg_lv1).clicklist.childrenCount; index++) {
            const element = this.mainNode.getComponent(nzppwg_lv1).clicklist.children[index];
            element.getChildByName(`quan`).active=false;
            const nodeofface =element.getChildByName(`facepoint`).children[0];
           if(nodeofface!=undefined&&nodeofface.getComponent(nzppwg_lv1_move).state==1)continue;
            if(nodeofface!=undefined&&cc.Intersection.rectRect(nodeofface.getBoundingBoxToWorld(),this.node.getBoundingBoxToWorld()))//获取节点的世界坐标
            {
                ishuan=true;
                //有相交的情况  切换
                this.restart();
                this.mainNode.getComponent(nzppwg_lv1).swapNodesPosition(nodeofface,this.node);
                break;
            }else
            {
                continue
            }
            
        }
       if(!ishuan) this.restartAndmove();
       
    }
    restartAndmove() {
        // 恢复原始父节点和层级
        this.node.parent = this.originalParent;
        this.node.setSiblingIndex(this.originalIndex);
        this.node.setPosition(this.startPoi);
        this.mainNode.getComponent(nzppwg_lv1).iscanmove=true;
    }
    restart() {
        // 恢复原始父节点和层级
        this.node.parent = this.originalParent;
        this.node.setSiblingIndex(this.originalIndex);
        this.node.setPosition(this.startPoi);
    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.state=1;
    }

}

