const { ccclass, property } = cc._decorator;

@ccclass
export default class FishLogic_lv287 extends cc.Component {
    @property({ tooltip: "鱼的类型（1-7级）" })
    public type: number = 1; // 鱼的类型（与配置对应）

    @property({ tooltip: "基础移动速度" })
    public baseSpeed: number = 100; // 基础速度（像素/秒）

    public speed: number = 0; // 暴露给管理器的当前速度（与 manage 中 speed 赋值匹配）
    private moveDir: number = 1; // 移动方向（1=向右，-1=向左）

    onLoad() {
        // 初始化速度（确保管理器未调用时也能正常移动）
        if (this.speed === 0) {
            this.initSpeed();
        }
    }

    update(dt: number) {
        // 按方向和速度移动（保持原逻辑）
        this.node.x += this.speed * this.moveDir * dt;
    }

    /** 设置移动方向（保持原逻辑，适配管理器调用） */
    public setMoveDir(dir: number) {
        this.moveDir = dir;
        this.node.scaleX = -Math.abs(this.node.scaleX) * dir;
    }

    /** 初始化移动速度（移除日志，保持简洁，与管理器调用匹配） */
    public initSpeed() {
        this.speed = this.baseSpeed * (0.8 + Math.random() * 0.4);
    }

    /** 获取当前移动方向（保留给管理器潜在调用） */
    public getMoveDir(): number {
        return this.moveDir;
    }

    /** 获取当前移动速度（保留给管理器潜在调用） */
    public getCurrentSpeed(): number {
        return this.speed;
    }
}