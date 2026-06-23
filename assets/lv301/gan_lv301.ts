const { ccclass, property } = cc._decorator;

@ccclass
export default class gan_lv301 extends cc.Component {
    @property(cc.Node)
    touch: cc.Node = null;
    @property(cc.Node)
    zhua: cc.Node = null;

    @property({ tooltip: "爪子移动速度（越小越慢）" })
    clawMoveSpeed: number = 80;

    @property({ tooltip: "摇杆回弹速度" })
    stickReboundSpeed: number = 120;

    @property(cc.Node)
    clawMoveSound: cc.Node = null;

    // 新增：全局静态锁（爪子移动时设为true）
    public static isClawBusy: boolean = false;

    // 固定配置（原有逻辑完整保留）
    private stickInitX: number = 0; // 摇杆初始中间位置
    private stickMinX: number = -45;
    private stickMaxX: number = 45;
    private clawMinX: number = -200;
    private clawMaxX: number = 180;
    private maxStickFloat: number = 3; // 边缘最大浮动±3像素
    
    // 状态控制（原有逻辑完整保留）
    private isTouching: boolean = false;
    private clawFinalX: number = 0; // 爪子最终停留位置
    private isClawStop: boolean = false; // 爪子是否停稳
    private stickTargetFloatX: number = 0; // 摇杆目标浮动位置

    onLoad() {
        this.stickInitX = this.node.x;
        this.clawFinalX = this.zhua ? this.zhua.x : 0;
        this.stickTargetFloatX = this.stickInitX; // 初始目标浮动位置为中间
        
        // 绑定触摸事件（原有逻辑完整保留）
        this.touch.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touch.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touch.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touch.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    update(dt: number) {
        // 1. 爪子忙时直接跳过所有逻辑（核心锁，仅新增这1行判断）
        if (gan_lv301.isClawBusy) return;

        // 原有摇杆浮动逻辑完整保留
        if (this.isTouching) {
            this.updateStickFloatTarget(this.node.x);
        } else {
            const deltaStickX = this.stickTargetFloatX - this.node.x;
            const reboundStep = this.stickReboundSpeed * dt;
            if (Math.abs(deltaStickX) > reboundStep) {
                this.node.x += deltaStickX > 0 ? reboundStep : -reboundStep;
            } else {
                this.node.x = this.stickTargetFloatX;
            }
        }

        // 原有爪子移动逻辑完整保留
        if (this.zhua && !this.isClawStop) {
            let targetClawX = this.clawFinalX;
            if (this.isTouching) {
                const stickRatio = (this.node.x - this.stickMinX) / (this.stickMaxX - this.stickMinX);
                targetClawX = this.clawMinX + stickRatio * (this.clawMaxX - this.clawMinX);
                this.clawFinalX = targetClawX;
            }

            const moveStep = this.clawMoveSpeed * dt;
            const deltaClawX = targetClawX - this.zhua.x;
            
            // 原有阻尼逻辑完整保留
            const stickOffsetRatio = Math.abs(this.node.x - this.stickInitX) / (this.stickMaxX - this.stickInitX);
            const dampingRatio = 0.01 + Math.pow(stickOffsetRatio, 2) * 0.99;
            const finalMoveStep = moveStep * dampingRatio;

            if (Math.abs(deltaClawX) < finalMoveStep) {
                this.zhua.x = targetClawX;
                this.isClawStop = true;
            } else {
                this.zhua.x += deltaClawX > 0 ? finalMoveStep : -finalMoveStep;
            }
        }
    }

    // 原有浮动目标更新逻辑完整保留
    private updateStickFloatTarget(currentStickX: number) {
        const stickOffsetRatio = Math.abs(currentStickX - this.stickInitX) / (this.stickMaxX - this.stickInitX);
        const dynamicFloat = (Math.random() - 0.5) * stickOffsetRatio * this.maxStickFloat;
        this.stickTargetFloatX = this.stickInitX + dynamicFloat;
    }

    onTouchStart() {
        // 爪子忙时不响应触摸（仅新增这1行判断）
        if (gan_lv301.isClawBusy) return;
        this.isTouching = true;
        this.isClawStop = false;
        this.updateStickFloatTarget(this.node.x);
    }

    onTouchMove(event: cc.Event.EventTouch) {
        // 爪子忙时不响应移动（仅新增这1行判断）
        if (gan_lv301.isClawBusy) return;
        this.clawMoveSound.getComponent(cc.AudioSource).mute = false;
        const delta = event.getDelta();
        let newX = this.node.x + delta.x * 0.7;
        newX = Math.max(this.stickMinX, Math.min(this.stickMaxX, newX));
        this.node.x = newX;
        this.updateStickFloatTarget(newX);
    }

    onTouchEnd() {
        this.clawMoveSound.getComponent(cc.AudioSource).mute = true;
        this.isTouching = false;
        this.updateStickFloatTarget(this.node.x);
    }
}