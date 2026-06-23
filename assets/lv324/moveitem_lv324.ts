import AudioManager from "../script/common/AudioManager";
import mycx_lv324 from "./mycx_lv324";

const {ccclass, property} = cc._decorator;

@ccclass
export default class moveitem_lv324 extends cc.Component {
   
    

    private isTouch: boolean = true;
    private firstMoveChecked: boolean = false;
    private canMove: boolean = false;
    private startTouchPos: cc.Vec2 = null;

    private isDragging = false;

    @property(cc.Node)
    main: cc.Node = null;

    mainScript: mycx_lv324 = null;
    private targetNode: cc.Node = null;

    scaleValue: number = 0.65;
    curScaleValue: number = 1;

    protected onLoad(): void {
        

    
        this.startListen();
        this.mainScript = this.main.getComponent(mycx_lv324);
        this.curScaleValue = this.node.scale;
        this.targetNodeInit();
    }



    protected onDestroy(): void {
        this.closeListen();
        
    }

    startListen() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    closeListen() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }


    //目标节点初始化
    targetNodeInit() {
        let nodes;
        for (let i = 0; i < this.mainScript.lvNodes.children.length; i++) {
            nodes = this.mainScript.lvNodes.children[i];
            for (let j = 0; j < nodes.children.length; j++) {
                if (nodes.children[j].name == this.node.parent.name && nodes.children[j]) {
                    this.targetNode = nodes.children[j];
                    return;
                }
            }
        }

        
    }


    onTouchStart(event: cc.Event.EventTouch) {

        if (!this.isTouch)    
            return;
        this.firstMoveChecked = false;
        this.canMove = false;
        this.startTouchPos = event.getLocation();
        event.stopPropagation();
       
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.isTouch)
            return;


        if (!this.firstMoveChecked) {
            const curPos = event.getLocation();
            const delta = curPos.sub(this.startTouchPos);
            if (Math.abs(delta.y) > Math.abs(delta.x) ) {
                // 首次为上下移动，允许后续任意移动
                this.canMove = true;
                this.isDragging = true;
            } else if(Math.abs(delta.x) > Math.abs(delta.y) && Math.abs(delta.x) > 10){
                // 首次为左右移动，不允许移动
                event.stopPropagation();
                
                this.canMove = false;
            }
            this.firstMoveChecked = true;
        }

        if (!this.canMove) {
            
            return;
        } 
        if (this.node.scale != this.scaleValue) {
            this.node.scale = this.scaleValue;
        }

        const botton=  this.main.getChildByName(`bj`).getChildByName(`botton`);
        botton.getComponent(cc.ScrollView).enabled=false;
        const delta = event.getDelta();
        const pos = this.node.position.add(new cc.Vec3(delta.x, delta.y, 0));

        this.node.setPosition(pos);

        // this.node.setPosition(
        //     pos.x + delta.x,
        //     pos.y + delta.y
        // );
    }


    onTouchEnd(event: cc.Event.EventTouch) {

        if (!this.isTouch)
            return;
        // this.moveLogic(event.currentTarget);

        // const botton =  this.main.getChildByName(`bj`).getChildByName(`botton`);
        // botton.getComponent(cc.ScrollView).enabled=true;

        if (this.isDragging) {
            this.moveLogic(event.currentTarget);

            const botton =  this.main.getChildByName(`bj`).getChildByName(`botton`);
            botton.getComponent(cc.ScrollView).enabled=true; 
        }
        this.isDragging = false;
        event.stopPropagation();
    }


    moveLogic(itemNode: cc.Node){
        let isCollide = false;

        if (!this.node || !this.targetNode) {
            
            return;
        }
        
        const node = this.targetNode.children[2];
        let rectA = node.getBoundingBoxToWorld();
        rectA.width -= 100; 
        rectA.height -= 100;
        isCollide = cc.Intersection.rectRect(rectA, itemNode.getBoundingBoxToWorld());

        if (isCollide){
            AudioManager.playEffect("正确");
            this.gameLogic();
        }
        else{
            //检测错误
            AudioManager.playEffect("错误");
            // this.closeListen();
            this.isTouch = false;
            this.restoreNode();
        }
        
    }

    //还原节点
    restoreNode(){

        // this.cha.active = true;

        this.mainScript.generationError(this.node);
        this.node.x = 0;
        this.node.y = 0;
        this.node.scale = 1;
        this.isTouch = true;
        // this.startListen();

    }

    //游戏逻辑实现
    gameLogic(){
        
        
        this.mainScript.generateHook(this.targetNode);


        this.targetNode.getChildByName("mz").children[1].active= true;
        this.targetNode.getChildByName("tb").children[1].active = true;

        if (
        this.mainScript.q2Node &&
        this.mainScript.q2Node.parent &&
        this.mainScript.q2Node.parent.name == this.node.parent.name &&
        this.node &&
        this.node.parent
        ) {
            this.mainScript.q2Node.destroy();
            this.mainScript.q2Node = null;
        }




        this.mainScript.nextLv();
        this.node.parent.destroy();
        

            
        
        
        
        
        
        
    }

}
