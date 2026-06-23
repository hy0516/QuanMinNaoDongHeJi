const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonShake extends cc.Component {

    @property({ 
        tooltip: '抖动间隔时间（秒）' 
    })
    shakeInterval: number = 2;

    @property({ 
        tooltip: '抖动幅度（度）' 
    })
    angleRange: number = 5;

    @property({ 
        tooltip: '单次抖动持续时间（秒）' 
    })
    shakeDuration: number = 0.3;

    private originalAngle: number = 0;
    private tween: cc.Tween;

    onLoad() {
        // 保存原始角度
        this.originalAngle = this.node.angle;
    }

    start() {
        // 开始周期性的抖动
        this.schedule(this.playShakeAnimation, this.shakeInterval);
    }

    playShakeAnimation() {
        // 停止之前的缓动
        if (this.tween) {
            this.tween.stop();
        }

        // 使用cc.tween创建抖动动画
        // 抖动动作分解：左右左中
        const shakeTime = this.shakeDuration / 4; // 每个小动作的时间

        this.tween = cc.tween(this.node)
            .to(shakeTime, { angle: this.originalAngle - this.angleRange })
            .to(shakeTime * 2, { angle: this.originalAngle + this.angleRange })
            .to(shakeTime, { angle: this.originalAngle })
            .call(() => {
                // 抖动结束，确保回到原始角度
                this.node.angle = this.originalAngle;
            })
            .start();
    }

    onDestroy() {
        // 停止定时器和缓动
        this.unschedule(this.playShakeAnimation);
        if (this.tween) {
            this.tween.stop();
        }
    }
}