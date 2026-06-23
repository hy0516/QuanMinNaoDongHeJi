import dwbe_lv370 from "./dwbe_lv370";

const {ccclass, property} = cc._decorator;

@ccclass
export default class moveitem_lv370 extends cc.Component {


    //获取主节点
    @property(cc.Node)
    main:cc.Node = null;
    
    //主节点的脚本
    mainSrict :dwbe_lv370= null;

    //获取目标点
    @property(cc.Node)
    target:cc.Node = null;

    //存储原来的位置
    tempPos: cc.Vec2 = cc.Vec2.ZERO;
    //目标点的位置
    targetPos: cc.Vec2 = cc.Vec2.ZERO;

    //移动判断
    isTouch: boolean = false;


    private moveThreshold: number = 5;
    private startPos: cc.Vec2 = cc.Vec2.ZERO;
    private hasMoved: boolean = false;

    protected onLoad(): void {
        //注册触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        //存储节点原来位置
        this.tempPos.x = this.node.x;
        this.tempPos.y = this.node.y;
        this.mainSrict = this.main.getComponent("dwbe_lv370");
    }


    onTouchStart(event: cc.Event.EventTouch){
        this.startPos = event.getLocation();
        this.hasMoved = false;
        this.isTouch = true;
        
        // 停止事件传播，防止子节点接收到事件
        event.stopPropagation();
    }


    onTouchMove(event: cc.Event.EventTouch){
        
        const currentPos = event.getLocation();
        const delta = cc.Vec2.distance(this.startPos, currentPos);
        if (delta > this.moveThreshold) {
            this.hasMoved = true;
            
            const delay = event.getDelta();
            const parentScale = this.node.parent.scale;
            
            // 直接移动父节点，子节点会自动跟随
            this.node.x += delay.x / parentScale;
            this.node.y += delay.y / parentScale;
            
        }
        
        event.stopPropagation();
    }

    onTouchEnd(event: cc.Event.EventTouch){

        // 如果没有移动，则触发点击事件
        if (!this.hasMoved && this.mainSrict) {
            this.triggerButtonClick();
        }
        this.MoveEnd(event.currentTarget);
        this.isTouch = false;
        this.hasMoved = false;
        
        event.stopPropagation();

    }

    //移动结束后进行矩形检测
    MoveEnd(itemNode: cc.Node){
        let isCollide = false;
        if (itemNode.name == "btn1" || itemNode.name == "btn2") {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }

        if(isCollide)
        {
            this.ShowAnimation(itemNode);
            this.scheduleOnce(() => {
                this.MoveNode();
            }, 0.5);

        }

        else
        {
            this.node.x = this.tempPos.x;
            this.node.y = this.tempPos.y;
            return;
        }
    }

     // 触发按钮点击功能
    triggerButtonClick() {
        // 模拟按钮点击事件
        const mockEvent = {
            currentTarget: this.node,
            type: 'touch'
        };
        this.mainSrict.BtnContor(mockEvent as any);
    }

    //两个节点返回原处闪烁
    ShowAnimation(node: cc.Node){
        cc.tween(node)
            .to(0.1,{position: new cc.Vec3(this.tempPos.x, this.tempPos.y, 0)})
            .call(() => {
            })
            .delay(0.5)
            .call(() => {
            })
            .start()
    }

    //移动节点动画
    MoveNode(){
        //本节点移动
        cc.tween(this.node)
        .to(0.1,{position: new cc.Vec3(9, this.tempPos.y, 0)})
            .call(() => {
                
                this.mainSrict.fadeOut(this.node, 0.5);
                
            })
            .start()
        //目标节点移动
        cc.tween(this.target)
        .to(0.1,{position: new cc.Vec3(9, this.target.y, 0)})
            .call(() => {
                
                this.mainSrict.fadeOut(this.target, 0.3);
                this.mainSrict.ShowEff(this.main.getChildByName("scenes1").getChildByName("btn3"), this.mainSrict.eff);
                
            })
            .delay(0.5)
            .call(() => {
                this.main.getChildByName("scenes1").getChildByName("btn3").active = true;
                this.node.active = false;
                this.target.active = false;
                //this.mainSrict.ShowEff(this.main.getChildByName("scenes1").getChildByName("btn3"), this.mainSrict.eff1);
            })
            .start()

    }

    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
