import UIManagerLv318 from "./UIManagerLv318";

const { ccclass, property } = cc._decorator;

/**
 * 挂在可拖动物体上（如道具或布娃娃的 body 节点）。
 * 仅在318关卡使用。
 * 
 * 对于布娃娃：挂到 body 节点，拖动时只移动 body，其他部位通过关节自动跟随。
 * 松手时会根据拖动速度给物体一个"甩飞"的初速度。
 */
@ccclass
export default class DraggableItem_lv318 extends cc.Component {

    /** 缓存 UIManager 引用，用于检测删除模式（由 SandboxManager 在实例化时注入） */
    private static _sharedUIManager: UIManagerLv318 = null;

    /** 是否允许拖动 */
    @property
    enabledDrag: boolean = true;

    /** 甩飞速度倍率 */
    @property({ tooltip: "松手时速度倍率，越大甩得越远" })
    throwMultiplier: number = 1;

    /** 最大甩飞速度 */
    @property({ tooltip: "甩飞速度上限" })
    maxThrowSpeed: number = 2666;

    private _rigidBody: cc.RigidBody = null;
    private _originalType: cc.RigidBodyType = null;
    private _camera: cc.Camera = null;

    /** 按下时记录节点世界位置与触点世界位置的偏移 */
    private _grabOffsetWorld: cc.Vec2 = cc.v2();
    private _isDragging: boolean = false;

    /** 用于计算甩飞速度：记录最近几帧的世界位置 */
    private _posHistory: { x: number; y: number; t: number }[] = [];
    private readonly _historyMaxLen = 5;

    /** 外部可查询是否正在被拖动 */
    public get isDragging(): boolean {
        return this._isDragging;
    }

    /** 静态方法：设置共享的 UIManager 引用（由 Lv318Controller 初始化时调用） */
    public static setSharedUIManager(uiManager: UIManagerLv318) {
        DraggableItem_lv318._sharedUIManager = uiManager;
    }

    onLoad() {
        this._rigidBody = this.node.getComponent(cc.RigidBody);
        // 查找场景中的相机
        this._camera = cc.Camera.findCamera(this.node);
    }

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
    }

    /** 屏幕坐标转世界坐标 */
    private screenToWorld(screenPos: cc.Vec2): cc.Vec2 {
        if (this._camera) {
            return new cc.Vec2(this._camera.getScreenToWorldPoint(screenPos).x, this._camera.getScreenToWorldPoint(screenPos).y);
        }
        // fallback：直接用屏幕坐标（不推荐）
        return screenPos;
    }

    private onTouchStart(e: cc.Event.EventTouch) {
        if (!this.enabledDrag) return;
        // 删除模式下不处理拖拽，让事件继续传递
        if (DraggableItem_lv318._sharedUIManager && DraggableItem_lv318._sharedUIManager.isDeleteMode()) return;

        this._isDragging = true;
        this._posHistory.length = 0;

        // 触点屏幕坐标转世界坐标
        const touchWorld = this.screenToWorld(e.getLocation());

        // 节点世界坐标
        const nodeWorld = this.node.convertToWorldSpaceAR(cc.v2(0, 0));

        // 偏移 = 节点世界位置 - 触点世界位置
        this._grabOffsetWorld.x = nodeWorld.x - touchWorld.x;
        this._grabOffsetWorld.y = nodeWorld.y - touchWorld.y;

        // 记录初始世界位置
        this._posHistory.push({ x: nodeWorld.x, y: nodeWorld.y, t: Date.now() });

        // 拖动时把刚体设为 Kinematic，保持物理关节但不受重力
        if (this._rigidBody) {
            this._originalType = this._rigidBody.type;
            this._rigidBody.type = cc.RigidBodyType.Kinematic;
            this._rigidBody.linearVelocity = cc.v2(0, 0);
            this._rigidBody.angularVelocity = 0;
        }

        e.stopPropagation();
    }

    private onTouchMove(e: cc.Event.EventTouch) {
        if (!this.enabledDrag || !this._isDragging) return;

        // 触点屏幕坐标转世界坐标
        const touchWorld = this.screenToWorld(e.getLocation());

        // 目标世界坐标
        const targetWorldX = touchWorld.x + this._grabOffsetWorld.x;
        const targetWorldY = touchWorld.y + this._grabOffsetWorld.y;

        // 世界坐标转父节点本地坐标
        const parent = this.node.parent;
        const targetLocal = parent.convertToNodeSpaceAR(cc.v2(targetWorldX, targetWorldY));

        this.node.setPosition(targetLocal.x, targetLocal.y);

        // 记录世界位置历史（用于计算甩飞速度）
        this._posHistory.push({ x: targetWorldX, y: targetWorldY, t: Date.now() });
        if (this._posHistory.length > this._historyMaxLen) {
            this._posHistory.shift();
        }

        e.stopPropagation();
    }

    private onTouchEnd(e: cc.Event.EventTouch) {
        if (!this.enabledDrag || !this._isDragging) return;

        this._isDragging = false;

        // 计算甩飞速度
        const throwVel = this.calcThrowVelocity();

        // 恢复刚体类型并施加速度
        if (this._rigidBody && this._originalType !== null) {
            this._rigidBody.type = this._originalType;
            this._rigidBody.linearVelocity = throwVel;
            this._rigidBody.angularVelocity = 0;
        }

        e.stopPropagation();
    }

    /** 根据最近几帧世界位置计算甩飞速度 */
    private calcThrowVelocity(): cc.Vec2 {
        if (this._posHistory.length < 2) {
            return cc.v2(0, 0);
        }

        const oldest = this._posHistory[0];
        const newest = this._posHistory[this._posHistory.length - 1];
        const dt = (newest.t - oldest.t) / 1000; // 秒

        if (dt <= 0.001) {
            return cc.v2(0, 0);
        }

        let vx = (newest.x - oldest.x) / dt * this.throwMultiplier;
        let vy = (newest.y - oldest.y) / dt * this.throwMultiplier;

        // 限制最大速度
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > this.maxThrowSpeed) {
            const scale = this.maxThrowSpeed / speed;
            vx *= scale;
            vy *= scale;
        }

        return cc.v2(vx, vy);
    }
}
