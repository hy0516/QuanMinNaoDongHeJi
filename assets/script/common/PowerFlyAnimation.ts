const { ccclass, property } = cc._decorator;

/**
 * 体力增减飘动动画组件
 * 使用powerTips预制体
 * 在屏幕中间生成，往上飘动一段距离后慢慢隐藏
 */
@ccclass
export default class PowerFlyAnimation extends cc.Component {

    @property(cc.Prefab)
    powerTipsPrefab: cc.Prefab = null; // 体力提示预制体

    @property(cc.SpriteFrame)
    powerIconSprite: cc.SpriteFrame = null; // 体力图标（可选，用于覆盖预制体中的图标）

    private flyDuration: number = 1.0; // 飞行持续时间
    private onCompleteCallback: Function = null;
    private powerNum: number = 0;
    private isIncrease: boolean = true; // 是否是增加体力

    /**
     * 初始化飘动动画
     * @param powerNum 体力数量（正数表示增加，负数表示扣除）
     * @param startPos 起始位置（默认为屏幕中心）
     * @param duration 动画持续时间
     * @param onComplete 动画完成回调
     */
    public init(
        powerNum: number,
        startPos?: cc.Vec2 | cc.Vec3,
        duration: number = 1.0,
        onComplete?: Function
    ): void {
        this.powerNum = powerNum;
        this.flyDuration = duration;
        this.onCompleteCallback = onComplete;
        this.isIncrease = powerNum > 0;

        // 更新UI显示
        this.updateUI();

        // 设置初始位置（屏幕中心或指定位置）
        if (startPos) {
            this.node.setPosition(startPos.x, startPos.y);
        } else {
            this.node.setPosition(0, 0); // 屏幕中心
        }
        this.node.scale = 0;
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        const absNum = Math.abs(this.powerNum);

        // 查找标签节点并更新文字
        const labelNode = this.node.getChildByName("New Label");
        if (labelNode) {
            const label = labelNode.getComponent(cc.Label);
            if (label) {
                // 根据增减显示不同符号
                if (this.isIncrease) {
                    label.string = `+${absNum}`;
                    label.node.color = cc.Color.GREEN; // 绿色表示增加
                } else {
                    label.string = `-${absNum}`;
                    label.node.color = cc.Color.RED; // 红色表示扣除
                }
            }
        }

        // 如果有自定义图标，更新图标
        if (this.powerIconSprite) {
            const sprite = this.node.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = this.powerIconSprite;
            }
        }
    }

    /**
     * 开始播放飘动动画
     * 从屏幕中间生成，往上飘动一段距离，然后慢慢隐藏
     */
    public startFly(): void {
        // 确保节点在顶层显示
        this.node.zIndex = 9999;

        const startY = this.node.y;

        // 创建动画序列：弹出 -> 上浮 -> 淡出消失
        cc.tween(this.node)
            // 第一步：从0缩放到正常大小（弹出效果）
            .to(0.2, { scale: 1 }, { easing: "backOut" })
            // 第二步：向上飘动同时开始淡出
            .parallel(
                cc.tween().to(this.flyDuration, { y: startY + 150 }, { easing: "sineOut" }),
                cc.tween().to(this.flyDuration * 0.8, { opacity: 0 }).delay(this.flyDuration * 0.2)
            )
            // 动画完成回调
            .call(() => {
                this.onAnimationComplete();
            })
            .start();
    }

    /**
     * 动画完成处理
     */
    private onAnimationComplete(): void {
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
        this.node.destroy();
    }

    /**
     * 静态方法：快速创建并播放体力动画
     * @param parent 父节点
     * @param powerNum 体力数量（正数表示增加，负数表示扣除）
     * @param powerTipsPrefab 体力提示预制体
     * @param startPos 起始位置（可选，默认为屏幕中心）
     * @param duration 动画持续时间（可选）
     * @param onComplete 完成回调（可选）
     * @returns 创建的动画节点
     */
    public static play(
        parent: cc.Node,
        powerNum: number,
        powerTipsPrefab: cc.Prefab,
        startPos?: cc.Vec2 | cc.Vec3,
        duration: number = 1.0,
        onComplete?: Function
    ): cc.Node {
        // 实例化预制体
        const node = cc.instantiate(powerTipsPrefab);
        parent.addChild(node);

        const comp = node.addComponent(PowerFlyAnimation);
        comp.powerTipsPrefab = powerTipsPrefab;

        comp.init(powerNum, startPos, duration, onComplete);
        comp.startFly();

        return node;
    }

    /**
     * 静态方法：从resources加载预制体并播放动画
     * @param parent 父节点
     * @param powerNum 体力数量（正数表示增加，负数表示扣除）
     * @param startPos 起始位置（可选，默认为屏幕中心）
     * @param duration 动画持续时间（可选）
     * @param onComplete 完成回调（可选）
     */
    public static playWithPrefab(
        parent: cc.Node,
        powerNum: number,
        startPos?: cc.Vec2 | cc.Vec3,
        duration: number = 1.0,
        onComplete?: Function
    ): void {
        cc.resources.load("prefabs/common/powerTips", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                cc.error("加载powerTips预制体失败:", err);
                if (onComplete) {
                    onComplete();
                }
                return;
            }
            PowerFlyAnimation.play(parent, powerNum, prefab, startPos, duration, onComplete);
        });
    }
}
