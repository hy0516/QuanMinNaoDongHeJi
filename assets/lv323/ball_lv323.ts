const { ccclass, property } = cc._decorator;

@ccclass
export default class ball_lv323 extends cc.Component {
    // 旋转方向：1顺时针 / -1逆时针（编辑器可调）
    @property({ tooltip: "1=顺时针，-1=逆时针", min: -1, max: 1, step: 2 })
    rotateDirection: number = 1;

    @property
    // 旋转速度（角度/秒，编辑器可调）
    rotateSpeed: number = 90;

    // 新增：是否开启上下往复运动（编辑器可勾选）
    @property({ tooltip: "是否开启上下往复运动" })
    isUpDownMove: boolean = false;

    // 新增：上下运动的距离（振幅），编辑器可调（对称运动只需改这个值）
    @property({ tooltip: "上下往复运动的距离（像素）", min: 0 })
    upDownDistance: number = 200;

    // 新增：上下运动的速度（秒/周期），控制运动快慢
    @property({ tooltip: "上下往复运动的速度（秒/周期）", min: 0.1 })
    upDownSpeed: number = 4;

    // 旋转状态标记
    private isRotating: boolean = true;
    // 新增：记录节点初始Y坐标（作为往复运动的中心）
    private initY: number = 0;

    onLoad() {
        this.isRotating = true; // 初始化旋转状态
        // 记录初始Y坐标，作为上下往复运动的中心位置
        this.initY = this.node.y;
    }

    update(dt: number) {
        // 原有旋转逻辑
        if (this.isRotating) {
            const rotateAngle = this.rotateSpeed * this.rotateDirection * dt;
            this.node.angle += rotateAngle;
            this.node.angle %= 360; // 限制角度范围，避免数值溢出
        }

        // 新增：上下往复运动逻辑
        if (this.isUpDownMove) {
            // 使用正弦函数实现平滑的对称往复运动
            // 公式：初始Y + 振幅 * sin(当前时间 / 周期 * 2π)
            const radian = (Date.now() / 1000) / this.upDownSpeed * Math.PI * 2;
            const offsetY = this.upDownDistance * Math.sin(radian);
            this.node.y = this.initY + offsetY;
        }
    }

    // 停止旋转（外部可调用）
    stopRotate() {
        this.isRotating = false;
        // this.node.angle = 0; // 可选：停止时复位角度
    }

    // 恢复旋转（外部可调用）
    resumeRotate() {
        this.isRotating = true;
    }

    /**
     * 动态修改旋转参数（外部可调用）
     * @param direction 旋转方向（1/-1）
     * @param speed 旋转速度（角度/秒）
     */
    setRotateParam(direction: number, speed: number) {
        this.rotateDirection = (direction === 1 || direction === -1) ? direction : 1;
        this.rotateSpeed = Math.max(0, speed);
    }

    // 新增：外部控制上下运动的开关（可选）
    setUpDownMove(enable: boolean) {
        this.isUpDownMove = enable;
        // 如果关闭运动，复位Y坐标
        if (!enable) {
            this.node.y = this.initY;
        }
    }
}