import AudioManager from "../script/common/AudioManager";
import tmhl_lv334 from "./tmhl_lv334";

const {ccclass, property} = cc._decorator;

@ccclass
export default class moveitem_lv334 extends cc.Component {

    private isTouch: boolean = false;
    private firstMoveChecked: boolean = false;
    private canMove: boolean = false;
    private startTouchPos: cc.Vec2 = null;

    @property(cc.Node)
    main: cc.Node = null;

    mainScript:tmhl_lv334 = null;

    curPartent: cc.Node = null;

    @property(cc.Node)
    cha: cc.Node = null;

    gou: cc.Node = null;

    @property
    scaleValue: number = 1;

    curScaleValue: number = 1;


    private targetNode: cc.Node = null;


    protected onLoad(): void {

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.mainScript = this.main.getComponent(tmhl_lv334);
        this.targetNodeInit();

        this.curScaleValue = this.node.scale;

    }

    //目标节点初始化
    targetNodeInit() {
        let nodes;
        for (let i = 0; i < this.mainScript.lvNodes.children.length; i++) {
            nodes = this.mainScript.lvNodes.children[i].children[0];
            for (let j = 0; j < nodes.children.length; j++) {
                if (nodes.children[j].name == this.node.name && nodes.children[j]) {
                    this.targetNode = nodes.children[j];
                    return;
                }
            }
        }

        
    }


    onTouchStart(event: cc.Event.EventTouch) {

        this.isTouch = true;
        this.firstMoveChecked = false;
        this.canMove = false;
        this.startTouchPos = event.getLocation();
    }

    onTouchMove(event: cc.Event.EventTouch) {
        // if (!this.isTouch)
        //     return;


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
        

        const botton=  this.main.getChildByName(`bj`).getChildByName(`botton`);
        botton.getComponent(cc.ScrollView).enabled=false;
        const pos = this.node.getPosition();
        const delta = event.getDelta();

        this.node.setPosition(
            pos.x + delta.x,
            pos.y + delta.y
        );
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.moveLogic(event.currentTarget);

        const botton=  this.main.getChildByName(`bj`).getChildByName(`botton`);
        botton.getComponent(cc.ScrollView).enabled=true;
    }

    moveLogic(itemNode: cc.Node){
        let isCollide = false;

        if (!this.node || !this.targetNode) {
            
            return;
        }
        
        const node = this.targetNode;
        isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());

        if (isCollide){
            AudioManager.playEffect("正确");
            // this.mainScript.ists = false;
            // console.debug("正确");
            this.gameLogic();
        }
        else{
            //检测错误
            AudioManager.playEffect("错误");
            this.restoreNode();
        }
        
    }


    //游戏逻辑实现
    gameLogic(){
        
        
        this.mainScript.generateHook(this.targetNode);


        this.targetNode.getChildByName("tb").active = true;

        
        if (
        this.mainScript.q2Node &&
        this.mainScript.q2Node.parent &&
        this.mainScript.q2Node.parent.name == this.node.name &&
        this.node &&
        this.node.parent
        ) {
            // this.mainScript.q2Node = null;
            this.mainScript.q2Node.destroy();
            this.mainScript.q2Node = null;
        }
            
        this.mainScript.nextLv();
        
        this.node.parent.destroy();
        
        
        
    }


    //还原节点
    restoreNode(){

        // this.cha.active = true;

        this.mainScript.generationError(this.node);
        cc.tween(this.node)
            .to(0.5, {x: 0, y: 0, scale: this.curScaleValue})
            .call(() => {
                
            })
            .start()

    }


    
}
