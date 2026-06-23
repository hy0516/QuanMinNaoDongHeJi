// ToastUtil.ts
const { ccclass } = cc._decorator;

export class ToastUtil {

    private static toastNode: cc.Node = null;
    private static isShowing: boolean = false;
    private static messageQueue: string[] = [];

    /**
     * 显示 Toast 提示
     * @param message 提示信息
     * @param duration 显示时长（秒），默认 2 秒
     */
    public static show(message: string, duration: number = 2): void {
        if (!this.toastNode) {
            this.createToastNode();
        }

        if (this.isShowing) {
            // 如果正在显示，将消息加入队列
            this.messageQueue.push(message);
            return;
        }

        this.showToast(message, duration);
    }

    /**
     * 显示短时间 Toast（1.5 秒）
     * @param message 提示信息
     */
    public static showShort(message: string): void {
        this.show(message, 1.5);
    }

    /**
     * 显示长时间 Toast（3 秒）
     * @param message 提示信息
     */
    public static showLong(message: string): void {
        this.show(message, 3);
    }

    /**
     * 创建 Toast 节点
     */
    private static createToastNode(): void {
        // 创建根节点
        this.toastNode = new cc.Node('Toast');

        // 添加到场景
        const scene = cc.director.getScene();
        scene.addChild(this.toastNode);

        // 设置为常驻节点
        cc.game.addPersistRootNode(this.toastNode);

        // 创建背景
        const background = new cc.Node('Background');
        const sprite = background.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;

        // 创建白色纹理作为背景
        const texture = new cc.RenderTexture();
        texture.initWithSize(2, 2);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        sprite.spriteFrame = spriteFrame;

        // 设置背景颜色
        background.color = new cc.Color(0, 0, 0, 200);
        background.setContentSize(200, 60);

        // 创建标签
        const labelNode = new cc.Node('Label');
        const label = labelNode.addComponent(cc.Label);
        label.string = '';
        label.fontSize = 24;
        label.lineHeight = 24;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.node.color = cc.Color.WHITE;
        label.overflow = cc.Label.Overflow.SHRINK;

        // 设置标签大小
        labelNode.setContentSize(180, 40);

        // 构建节点层级
        this.toastNode.addChild(background);
        this.toastNode.addChild(labelNode);

        // 设置位置
        background.setPosition(0, 0);
        labelNode.setPosition(0, 0);

        // 初始隐藏
        this.toastNode.active = false;
        this.toastNode.setPosition(0, -200);

        // 添加 Widget 组件确保居中
        const widget = this.toastNode.addComponent(cc.Widget);
        widget.isAlignHorizontalCenter = true;
        widget.isAlignVerticalCenter = true;
        widget.horizontalCenter = 0;  // 修正为 horizontalCenter
        widget.verticalCenter = 0;    // 修正为 verticalCenter
        widget.target = scene;
    }

    /**
     * 显示 Toast
     */
    private static showToast(message: string, duration: number): void {
        this.isShowing = true;
        this.toastNode.active = true;

        // 获取标签组件并设置文本
        const labelNode = this.toastNode.getChildByName('Label');
        const label = labelNode.getComponent(cc.Label);
        label.string = message;

        // 自适应背景大小
        this.adjustBackgroundSize(message);

        // 重置位置和透明度
        this.toastNode.setPosition(0, -200);
        this.toastNode.opacity = 255;

        // 播放动画
        this.playAnimation(duration);
    }

    /**
     * 根据文本内容调整背景大小
     */
    private static adjustBackgroundSize(message: string): void {
        const background = this.toastNode.getChildByName('Background');
        const labelNode = this.toastNode.getChildByName('Label');
        const label = labelNode.getComponent(cc.Label);

        // 计算文本所需宽度
        const textWidth = this.getTextWidth(message, label);

        // 设置背景大小，增加边距
        const minWidth = 120;
        const maxWidth = 500;
        const padding = 40;
        const lineHeight = 30;

        let bgWidth = Math.min(Math.max(textWidth + padding, minWidth), maxWidth);
        let bgHeight = 60; // 默认高度

        // 处理多行文本
        if (textWidth > maxWidth - padding) {
            const lines = Math.ceil(textWidth / (maxWidth - padding));
            bgHeight = lines * lineHeight + padding;
        }

        background.setContentSize(bgWidth, bgHeight);
        labelNode.setContentSize(bgWidth - 20, bgHeight - 20);
    }

    /**
     * 估算文本宽度
     */
    private static getTextWidth(text: string, label: cc.Label): number {
        // 简单估算，每个字符平均宽度
        const charWidth = label.fontSize * 0.6;
        return text.length * charWidth;
    }

    /**
     * 播放动画 - 修正后的版本
     */
    /**
  * 播放动画 - 修正后的版本
  */
    private static playAnimation(duration: number): void {
        // 停止所有现有动画
        this.toastNode.stopAllActions();

        // 重置位置和透明度
        this.toastNode.setPosition(0, -200);
        this.toastNode.opacity = 255;

        // 方案1：简单的上浮和淡入淡出
        const moveUp = cc.moveBy(0.3, cc.v2(0, 80));
        const fadeIn = cc.fadeIn(0.3);
        const spawnIn = cc.spawn(moveUp, fadeIn);

        // 停留
        const delay = cc.delayTime(duration - 0.6);

        // 出场动画：继续上浮并淡出
        const moveUpOut = cc.moveBy(0.3, cc.v2(0, 40));
        const fadeOut = cc.fadeOut(0.3);
        const spawnOut = cc.spawn(moveUpOut, fadeOut);

        // 序列动画
        const sequence = cc.sequence(
            spawnIn,
            delay,
            spawnOut,
            cc.callFunc(() => {
                this.onToastComplete();
            })
        );

        this.toastNode.runAction(sequence);
    }

    /**
     * 播放动画 - 方案2：使用缓动动画（推荐）
     */
    private static playAnimation2(duration: number): void {
        // 停止所有现有动画
        this.toastNode.stopAllActions();

        // 重置位置到屏幕底部
        this.toastNode.setPosition(0, -200);
        this.toastNode.opacity = 0;

        // 使用缓动动作
        const moveToCenter = cc.moveTo(0.3, cc.v2(0, -120)).easing(cc.easeBackOut());
        const fadeIn = cc.fadeIn(0.3);
        const spawnIn = cc.spawn(moveToCenter, fadeIn);

        // 停留
        const delay = cc.delayTime(duration - 0.6);

        // 出场动画：淡出
        const fadeOut = cc.fadeOut(0.3);

        // 序列动画
        const sequence = cc.sequence(
            spawnIn,
            delay,
            fadeOut,
            cc.callFunc(() => {
                this.onToastComplete();
            })
        );

        this.toastNode.runAction(sequence);
    }

    /**
     * 播放动画 - 方案3：最简单的淡入淡出
     */
    private static playAnimation3(duration: number): void {
        // 停止所有现有动画
        this.toastNode.stopAllActions();

        // 重置
        this.toastNode.setPosition(0, -120);
        this.toastNode.opacity = 0;

        // 淡入
        const fadeIn = cc.fadeIn(0.3);

        // 停留
        const delay = cc.delayTime(duration - 0.6);

        // 淡出
        const fadeOut = cc.fadeOut(0.3);

        // 序列动画
        const sequence = cc.sequence(
            fadeIn,
            delay,
            fadeOut,
            cc.callFunc(() => {
                this.onToastComplete();
            })
        );

        this.toastNode.runAction(sequence);
    }

    /**
     * Toast 显示完成回调
     */
    private static onToastComplete(): void {
        this.isShowing = false;
        this.toastNode.active = false;

        // 检查队列中是否有待显示的消息
        if (this.messageQueue.length > 0) {
            const nextMessage = this.messageQueue.shift();
            // 延迟 0.3 秒显示下一条
            this.scheduleOnce(() => {
                this.showToast(nextMessage, 2);
            }, 0.3);
        }
    }

    /**
     * 简单的定时器实现
     */
    private static scheduleOnce(callback: Function, delay: number): void {
        const node = this.toastNode;
        const sequence = cc.sequence(
            cc.delayTime(delay),
            cc.callFunc(() => {
                callback();
            })
        );
        node.runAction(sequence);
    }

    /**
     * 清除所有待显示的 Toast
     */
    public static clearQueue(): void {
        this.messageQueue = [];
    }

    /**
     * 立即隐藏当前显示的 Toast
     */
    public static hide(): void {
        if (this.toastNode) {
            this.toastNode.stopAllActions();
            this.toastNode.active = false;
            this.isShowing = false;
            this.clearQueue();
        }
    }
}