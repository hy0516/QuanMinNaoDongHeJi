const {ccclass, property} = cc._decorator;

@ccclass
export default class bug_lv323 extends cc.Component {

    private timer: number = 0;
    private readonly interval: number = 3;
    // 添加控制开关，标记是否停止切换
    private isStopSwitch: boolean = false;

    onLoad () {
        // 仅初始化计时器，无需额外变量
    }

    update (dt: number) {
        // 如果已停止切换，直接返回，不再执行后续逻辑
        if (this.isStopSwitch) return;
        
        this.timer += dt;
        
        if (this.timer >= this.interval) {
            this.timer = 0;
            // 直接操作自身节点的碰撞体tag，无多余变量
            const collider = this.node.getComponent(cc.BoxCollider);
            if (!collider) return; // 增加空值判断，避免空指针错误
            collider.tag = collider.tag === 4 ? 99 : 4;
            // 直接根据自身tag控制bug子节点显隐
            this.node.getChildByName('bug').active = collider.tag !== 4;
        }
    }


    public stopTagSwitch(): void {
        // 标记为停止状态
        this.isStopSwitch = true;
        // 获取碰撞体组件
        const collider = this.node.getComponent(cc.BoxCollider);
        if (collider) {
            // 强制设置为tag4
            collider.tag = 4;
            // 隐藏bug子节点
            this.node.getChildByName('bug').active = false;
        }
        // 重置计时器
        this.timer = 0;
    }

    /**
     * 可选：恢复tag切换的接口
     */
    public resumeTagSwitch(): void {
        this.isStopSwitch = false;
        this.timer = 0; // 重置计时器，确保切换周期准确
    }
}