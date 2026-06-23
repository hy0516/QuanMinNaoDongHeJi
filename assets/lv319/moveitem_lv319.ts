import AudioManager from "../script/common/AudioManager";
import sbwz_lv319 from "./sbwz_lv319";

const {ccclass, property} = cc._decorator;

@ccclass
export default class moveitem_lv319 extends cc.Component {



    //主节点
    @property(cc.Node)
    main: cc.Node = null;

    //右目标节点
    @property(cc.Node)
    rightTargetNode: cc.Node = null;
    //左目标节点
    @property(cc.Node)
    leftTargetNode: cc.Node = null;

    //主脚本
    mainScript: sbwz_lv319 = null;

    //防止重复操作
    isCf = false;

    lostPos: cc.Vec3 = cc.Vec3.ZERO;
    longPressTimer: number;

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        
        this.mainScript = this.main.getComponent(sbwz_lv319);
        this.lostPos.x = this.node.x;
        this.lostPos.y = this.node.y;
    }

    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }



    onTouchStart(event: cc.Event.EventTouch) {

        if (!this.mainScript.isMove) {
            return;
        }

        if (this.node.name == "6" && this.node.name == this.mainScript.curLv.toString() && !this.isCf) {
            this.longPressTimer = setTimeout(() => {
                // 长按一秒触发的逻辑
                this.isCf = true;
                this.node.children[0].active = true;
                this.mainScript.logic(this.node.name);
            }, 1000);
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {

        if (!this.mainScript.isMove || this.node.name  == "6") {
            return;
        }
        var delay = event.getDelta();
        if (this.node.name == "7" && delay.y < 0 && !this.isCf && this.node.name == this.mainScript.curLv.toString()) {
            this.trageLogic();
            this.isCf = true;
            return;
        }
        
        else if (this.node.active){
            this.node.x += delay.x;
            this.node.y += delay.y;
        }

        

    }


    onTouchEnd(event: cc.Event.EventTouch) {

        if (!this.mainScript.isMove) {
            return;
        }

        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
            return;
        }
        if (this.node.name == "1") {
            AudioManager.playEffect(this.node.name);
        }
        this.gameLogic(event.currentTarget);
    }


    //游戏逻辑判断
    gameLogic(itemNode: cc.Node) {
        let isCollideRight = false;
        let isCollideLeft = false;

        

        if (this.node.name == this.mainScript.curLv.toString()) {
            isCollideRight = cc.Intersection.rectRect(this.rightTargetNode.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
            isCollideLeft = cc.Intersection.rectRect(this.leftTargetNode.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());

            
        }




        if (isCollideRight || isCollideLeft) {

            this.node.active = false;
            if (this.mainScript.bzNode[0].active) {
                
                
                this.mainScript.bzNode[0].getChildByName("tool").active = true;
                this.mainScript.bzNode[1].getChildByName("tool").active = true;
                this.mainScript.bzNode[0].getChildByName("tool").getChildByName(this.node.name).active = true;
                this.mainScript.bzNode[1].getChildByName("tool").getChildByName(this.node.name).active = true;
                if (this.node.name == "5")
                    AudioManager.playEffect(this.node.name);
            }
            this.mainScript.gameData.levelConfig[this.mainScript.curLv].isTisp = true;
            
            this.mainScript.logic(this.node.name);
        }

        else {
            //还原原来的位置
            this.node.x = this.lostPos.x;
            this.node.y = this.lostPos.y;
        }
        

    }


    //滑动逻辑
    trageLogic() {
        if (this.node.name == "7") {
            this.mainScript.rightSke.armature().getSlot("38").displayIndex = 1;
            this.mainScript.leftSke.armature().getSlot("38").displayIndex = 2;
            
            this.mainScript.logic(this.node.name);  
        }
    }

    

    


     
}
