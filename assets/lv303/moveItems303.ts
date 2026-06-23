import BaseGame from "../script/common/BaseGame";
const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItems303 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

    @property(cc.Node)
    main: cc.Node = null;

    // 果冻效果配置
    @property({ tooltip: "果冻效果放大比例" })
    jellyScale: number = 1.1;
    
    @property({ tooltip: "果冻效果持续时间(秒)" })
    jellyDuration: number = 0.5;
    
    startPoi: cc.Vec2 = null;
    originalZIndex: number = 0;
    originalSiblingIndex: number = -1;
    originalScale: number = 1; // 自身原始缩放值
    parentOriginalScale: number = 1; // 父节点原始缩放值
    isMoving: boolean = false; // 是否正在移动
    jellyTween: cc.Tween = null; // 父节点果冻效果的tween
    parentNode: cc.Node = null; // 缓存父节点引用

    ltbz: cc.Node = null;

    // ============== 摇晃判定相关变量（含新增） ==============
    private isShaked: boolean = false; // 是否检测到摇晃
    private startX: number = 0; // 触摸起始X坐标
    private lastTouchX: number = 0; // 上一帧触摸的X坐标
    private hasDirectionChanged: boolean = false; // 是否发生过X轴方向反转
    private shakeThreshold: number = 40; // 摇晃整体幅度阈值（可按需调整）
    private minReverseDistance: number = 10; // 最小反向移动距离（判定方向反转的阈值）
    private musicqs: cc.Node = null;

    protected onLoad(): void {
        // 缓存父节点（防止后续父节点变动导致异常）
        this.parentNode = this.node.parent;
        this.startPoi = this.node.getPosition();
        this.originalZIndex = this.node.zIndex;
        this.originalSiblingIndex = this.node.getSiblingIndex();
        this.originalScale = this.node.scale; // 保存自身原始缩放
        // 保存父节点原始缩放（如果父节点存在）
        if (this.parentNode) {
            this.parentOriginalScale = this.parentNode.scale;
        }
        this.enabled = false;
        
        // 注册触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.musicqs = this.main.getComponent(`ntcb_lv303`).musicqs;
    }

    oninit() {
        // 保持不变
    }

    onTouchStart(even: cc.Event.EventTouch) {
        // 初始化摇晃相关状态
        this.isShaked = false;
        this.startX = even.getLocationX();
        this.lastTouchX = even.getLocationX();
        this.hasDirectionChanged = false;

        this.node.zIndex = 100;
        this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
        this.isMoving = true;
        const worldPos = this.node.convertToWorldSpaceAR(cc.Vec3.ZERO);
        this.node.parent = this.node.parent.parent;
        this.node.position = this.node.parent.convertToNodeSpaceAR(worldPos);
        this.node.getChildByName("1").active = false;
        this.node.getChildByName("2").active = true;
        // 开始父节点的果冻效果（仅当父节点存在时）
        if (this.parentNode) {
            this.startJellyEffect();
        }
        this.main.getComponent(`ntcb_lv303`).changeeyes();
    }

    onTouchMove(even: cc.Event.EventTouch) {
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
        if (this.type === 2) {
            if((Math.abs(delay.x) > 2 || Math.abs(delay.y) > 2)) {
                this.musicqs.getComponent(cc.AudioSource).mute = false;
            }else{
                this.musicqs.getComponent(cc.AudioSource).mute = true;
            }
        }
        this.main.getComponent(`ntcb_lv303`).eyeslookat(this.node.convertToWorldSpaceAR(cc.Vec2.ZERO));
        // 如果果冻效果被中断，重新开始（父节点存在时）
        if (this.isMoving && this.parentNode && !this.jellyTween) {
            this.startJellyEffect();
        }
        // 调用摇晃判定
        this.checkShake(even);
    }

    onTouchEnd(even: cc.Event.EventTouch) {
        this.isMoving = false;
        this.node.parent = this.parentNode;
        // 停止父节点的果冻效果，恢复原始缩放
        if (this.parentNode) {
            this.stopJellyEffect();
        }
        this.node.getChildByName("1").active = true;
        this.node.getChildByName("2").active = false;
        this.main.getComponent(`ntcb_lv303`).eyesstop();
        if (this.main) this.main.getComponent(BaseGame).moveHandler(this.type, null, even);
        console.log("触摸结束，是否摇晃：" + this.isShaked);
        if (this.type === 2) {
            this.main.getComponent(`ntcb_lv303`).musicqs.getComponent(cc.AudioSource).mute = true;
        }
    }

    startJellyEffect() {
        // 父节点不存在则直接返回
        if (!this.parentNode || this.type === 2 || this.type === 7) return;
        
        // 停止之前的tween
        if (this.jellyTween) {
            this.jellyTween.stop();
        }
        
        // 创建父节点的果冻效果tween动画
        this.jellyTween = cc.tween(this.parentNode)
            .to(this.jellyDuration / 2, { scale: this.parentOriginalScale * this.jellyScale })
            .to(this.jellyDuration / 2, { scale: this.parentOriginalScale })
            .union() // 合并为一个完整的动画
            .repeatForever() // 无限重复
            .start();
    }


    stopJellyEffect() {
        // 父节点不存在则直接返回
        if (!this.parentNode || this.type === 2 || this.type === 7) return;
        
        if (this.jellyTween) {
            this.jellyTween.stop();
            this.jellyTween = null;
        }
        
        // 平滑恢复父节点到原始缩放
        cc.tween(this.parentNode)
            .to(0.1, { scale: this.parentOriginalScale })
            .start();
    }

    restart() {
        this.isMoving = false;
        // 停止父节点果冻效果
        this.stopJellyEffect(); 
        
        // 恢复自身位置、层级、缩放
        this.node.setPosition(this.startPoi);
        this.node.zIndex = 0;
        this.node.scale = this.originalScale; 
        // 恢复父节点缩放（兜底）
        if (this.parentNode) {
            this.parentNode.scale = this.parentOriginalScale;
        }
        if (this.originalSiblingIndex !== -1) {
            this.node.setSiblingIndex(this.originalSiblingIndex);
        }
    }

    ondele() {
        // 清理父节点果冻tween
        this.stopJellyEffect(); 
        
        // 移除事件监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    // 组件销毁时清理
    onDestroy() {
        if (this.type === 2) {
            this.main.getComponent(`ntcb_lv303`).musicqs.getComponent(cc.AudioSource).mute = true;
        }
        this.main.getComponent(`ntcb_lv303`).eyesstop();
        this.stopJellyEffect();
    }

    /**
     * 重写：真正的摇晃判定（需检测来回往复移动，避免单向拖拽误判）
     */
    private checkShake(event: cc.Event.EventTouch): void {
        const currentX = event.getLocationX();
        // 1. 计算当前与上一帧的位移差（判断当前移动方向）
        const deltaX = currentX - this.lastTouchX;
        // 2. 计算当前与起始位置的总位移（判断整体摇晃幅度）
        const totalDeltaX = Math.abs(currentX - this.startX);

        // 3. 检测方向反转：排除第一帧，判断是否发生左右反向移动且满足最小反向距离
        if (this.lastTouchX !== this.startX) {
            const lastDeltaX = this.lastTouchX - this.startX;
            // 方向相反（一正一负）且反向移动距离超过最小阈值，标记为已发生方向反转
            if ((deltaX > 0 && lastDeltaX < 0) || (deltaX < 0 && lastDeltaX > 0)) {
                if (Math.abs(deltaX) >= this.minReverseDistance) {
                    this.hasDirectionChanged = true;
                }
            }
        }

        // 4. 摇晃生效条件：发生过方向反转（来回摇）+ 总位移超过阈值（幅度足够）
        if (this.hasDirectionChanged && totalDeltaX > this.shakeThreshold) {
            this.isShaked = true;
        }

        // 5. 更新上一帧触摸X坐标，供下一帧对比使用
        this.lastTouchX = currentX;
    }
}