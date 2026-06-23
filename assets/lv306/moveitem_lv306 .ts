import AudioManager from "../script/common/AudioManager";
import jmtx_lv306 from "./jmtx_lv306";

const {ccclass, property} = cc._decorator;

@ccclass
export default class moveitem_lv306 extends cc.Component {


    private isTouch: boolean = false;
    private firstMoveChecked: boolean = false;
    private canMove: boolean = false;
    private startTouchPos: cc.Vec2 = null;

    @property(cc.Node)
    main: cc.Node = null;

    mainScript:jmtx_lv306 = null;

    curPartent: cc.Node = null;

    @property(cc.Node)
    cha: cc.Node = null;

    gou: cc.Node = null;

    @property
    scaleValue: number = 2;

    curScaleValue: number = 0;

    


    private targetNode: cc.Node = null;

    protected onLoad(): void {

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.curScaleValue = this.node.scale;

        // this.scrollView.node.on(cc.ScrollView.EventType.SCROLL_BEGAN, this.onScrollBegan, this);

        this.mainScript = this.main.getComponent("jmtx_lv306");

        this.targetNodeInit();
        this.curPartent = this.node.parent;

        this.gou = this.main.getChildByName("bg").getChildByName("gou");


    }


    //目标节点初始化
    targetNodeInit() {
        let nodes;
        for (let i = 0; i < this.mainScript.lvNodes.children.length; i++) {
            nodes = this.mainScript.lvNodes.children[i].children[1];
            for (let j = 0; j < nodes.children.length; j++) {
                if (nodes.children[j].name == this.node.name && nodes.children[j]) {
                    this.targetNode = nodes.children[j];
                    return;
                }
            }
        }


    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        
    }

    onTouchStart(event: cc.Event.EventTouch){

        this.isTouch = true;
        this.firstMoveChecked = false;
        this.canMove = false;
        this.startTouchPos = event.getLocation();
    }

    onTouchMove(event: cc.Event.EventTouch){
        
        if (!this.isTouch)
            return;

        if (!this.firstMoveChecked) {
            const curPos = event.getLocation();
            const delta = curPos.sub(this.startTouchPos);
            if (Math.abs(delta.y) > Math.abs(delta.x)) {
                // 首次为上下移动，允许后续任意移动
                this.canMove = true;
            } else {
                // 首次为左右移动，不允许移动
                this.canMove = false;
            }
            this.firstMoveChecked = true;
        }
        if (!this.canMove) return;

        if (this.node.scale != this.scaleValue) {
            this.node.scale = this.scaleValue;
        }
        const botton=  this.main.getChildByName(`bg`).getChildByName(`botton`);
        botton.getComponent(cc.ScrollView).enabled=false;
        const delta = event.getDelta();
        const pos = this.node.getPosition();
        if (this.node.parent.children[1] && this.node.parent.children[1].active) {
            this.node.parent.children[1].active = false;
        }
        

        this.node.setPosition(
            pos.x + delta.x,
            pos.y + delta.y
        );
    }

    onTouchEnd(event: cc.Event.EventTouch){
        
        this.isTouch = false;
        this.moveLogic(event.currentTarget)
        const botton=  this.main.getChildByName(`bg`).getChildByName(`botton`);
        botton.getComponent(cc.ScrollView).enabled=true;
    }


    //矩形检测
    moveLogic(itemNode: cc.Node){
        let isCollide = false;
        
        const node = this.targetNode;
        isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());

        if (isCollide){
            AudioManager.playEffect("正确");
            this.mainScript.ists = false;
            
            this.gameLogic();
        }
        else{
            //检测错误
            AudioManager.playEffect("错误");
            this.restoreNode();
        }
        
    }

    //切换龙骨动画插槽
    switchToSke(){
        let ske = this.mainScript.lvSkeNode.getComponent(dragonBones.ArmatureDisplay);
        let slotName;
        let index;
        this.node.active = false;
        //获取龙骨插槽的名字和下标
        for (let i = 0; i < this.mainScript.names.length; i++) {
            if (this.node.name == this.mainScript.names[i]) {
                slotName = this.mainScript.slotNames[i];
                index = this.mainScript.indexs[i];
            }
        }

        //切换插槽
        ske.armature().getSlot(slotName).displayIndex = index;

    }

    //游戏逻辑实现
    gameLogic(){
        //切换插槽
        this.switchToSke();
        this.targetNode.destroy();

        // this.mainScript.lvSkeNode.parent.children[1]
        if (this.mainScript.qNode) {
            this.mainScript.qNode.destroy();
        }

        cc.tween(this.gou)
            .to(0.8, {opacity: 255})
            .call(() => {
                cc.tween(this.gou)
                    .to(0.8, {opacity: 0})
                    .call(() => {
                        this.mainScript.ists = true;
                        this.mainScript.nextLv();
                        this.node.destroy();
                    })
                    .start()
            })
        .start()   
    }

    //还原节点
    restoreNode(){

        this.cha.active = true;
        cc.tween(this.node)
            .to(0.5, {x: 0, y: 0, scale: this.curScaleValue})
            .call(() => {
                this.cha.active = false;
            })
            .start()

    }
}
