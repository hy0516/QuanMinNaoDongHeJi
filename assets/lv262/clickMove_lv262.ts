import zjmgr_lv262 from "./zjmgr_lv262";


const { ccclass, property } = cc._decorator;

@ccclass
export class YOffsetDetector extends cc.Component {
    @property(cc.Integer)
    threshold: number = 100; // Y方向偏移阈值

    @property(cc.Node)
    main :cc.Node = null; 

    @property(cc.Integer)
    type:number = 0;

    
    private isPressing: boolean = false;
    private startPos: cc.Vec2 = null;
    private currentPos: cc.Vec2 = null;

    onLoad() {
        // 注册触摸/鼠标事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        // 移除事件监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        // 检查触摸点是否在节点范围内
        if (this.node.getBoundingBoxToWorld().contains(event.getLocation())) {
            this.isPressing = true;
            this.startPos = event.getLocation();
            this.currentPos = this.startPos.clone();
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.isPressing) return;
        
        this.currentPos = event.getLocation();
        const offsetY = this.currentPos.y - this.startPos.y;
        const offsetX = this.currentPos.x - this.startPos.x;

        let dir;

        if(this.type == 1){
            dir = offsetX
        }

        if(this.type == 2){
            dir = offsetY
        }
        
        // 检测Y方向偏移是否达到阈值
        if (Math.abs(dir) >= this.threshold) {
            // 触发偏移达到阈值的事件
             this.eventDisplay();
            
            // 重置起始位置，避免连续触发
            this.startPos = this.currentPos.clone();
        }

        //检测X方向偏移是否达到阈值
        // 检测Y方向偏移是否达到阈值
        
        
    }

    onTouchEnd() {
        this.isPressing = false;
        this.startPos = null;
        this.currentPos = null;
    }

    /**触发事件 */
    eventDisplay(){
        switch(Number(this.type)){
  
        }
    }
}