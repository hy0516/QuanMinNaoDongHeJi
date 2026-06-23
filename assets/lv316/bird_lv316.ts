const { ccclass, property } = cc._decorator;

@ccclass
export default class BirdLv316 extends cc.Component {
    @property({ tooltip: "1=顺时针，-1=逆时针", min: -1, max: 1, step: 2 })
    dir = 1;

    originSpeed = 50;
    private speed = 0;

    @property(cc.Node) touchNd: cc.Node = null!;
    @property(cc.Node) colliderNd: cc.Node = null!;
    @property(cc.Node) mainNd: cc.Node = null!;
    main: any;
    peckComp: any;
    armature!: dragonBones.ArmatureDisplay;
    father: any;

    // ===================== 角度加速相关（仅保留模糊检测，去掉冷却） =====================
    @property({ tooltip: "是否开启角度触发加速功能" })
    enableAngleBoost = false; // 保留勾选开关

    @property({ tooltip: "触发加速的目标角度数组（0-360度）", type: [cc.Float] })
    boostAngles: number[] = []; // 保留角度数组（外部可改）

    @property({ tooltip: "加速幅度（额外增加的旋转速度，角度/秒）", min: 0 })
    speedBoost = 100; // 保留加速幅度（外部可改）

    @property({ tooltip: "加速持续时间（秒）", min: 0.01 })
    boostDuration = 0.5; // 保留加速时长（外部可改）

    @property({ tooltip: "是否双层" })
    isDouble: boolean = false;

    // 固定模糊容错（写死，解决判断不到问题）
    private readonly ANGLE_TOLERANCE = 5; // ±5° 容错范围，无需外部配置

    // 加速状态（仅保留核心，移除冷却相关）
    private isBoosting = false;
    private boostTimer = 0;
    private originalSpeedDuringBoost = 0;
    private True:boolean = false;
    // 移除：lastBoostAngles（冷却记录）、BOOST_COOLDOWN（冷却常量）
    // ==============================================================

    onLoad() {
        this.touchNd.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.peckComp = this.colliderNd.getComponent(`peck_lv316`);
        this.main = this.mainNd.getComponent(`zmn_lv316`);
        this.father = this.node.parent.getComponent(`ball_lv316`);
        this.armature = this.node.getChildByName(`ske`)!.getComponent(dragonBones.ArmatureDisplay)!;
        this.speed = this.originSpeed + this.father.rotateSpeed;
    }

    onTouch(event: cc.Event.EventTouch) {
        if (this.peckComp.checkdead()) return;
        this.slowRotate();
        this.colliderNd.active = true;

        this.unschedule(this.resetIdle);
        this.scheduleOnce(() => {
            this.colliderNd.active = false;
            if (!this.peckComp.checkdead()) {
                this.armature.playAnimation(`zhuo`, 1);
                this.scheduleOnce(this.resetIdle, 0.17);
                if (this.isDouble && this.True) {
                    this.checkDouble();
                } else {
                    this.checkpass();
                }
            } else {
                this.armature.playAnimation(`zhuo2`, 1);
                this.speed = 0;
                this.scheduleOnce(() => {
                    this.main.notpass();
                }, 1);
            }
        }, 0.000000000001);
    }

    private checkpass() {
        let flag = true;
        const grain = this.node.parent.getChildByName(`grain`);
        for(let i = 0; i < grain.children.length; i++) {
            const name = grain.children[i].name;
            if(name === `1` || name === `3`) {
                if(grain.children[i].opacity !== 0) {
                    flag = false;
                    break;
                }
            }
        }
        console.log(flag);
        if(flag && !this.isDouble) {
            this.main.checkpass(flag);
        } else if(flag) {
            this.node.parent.getChildByName(`grain`).active = false;
            this.node.parent.getChildByName(`bg`).active = false;
            this.True = true;
            this.colliderNd = this.node.getChildByName(`collider2`);
            this.peckComp = this.colliderNd.getComponent(`peck_lv316`);
            this.node.getChildByName(`ske`).y += 100;
        }
    }
    private checkDouble() {
        let flag = true;
        const grain = this.node.parent.getChildByName(`grain2`);
        for(let i = 0; i < grain.children.length; i++) {
            const name = grain.children[i].name;
            if(name === `1` || name === `3`) {
                if(grain.children[i].opacity !== 0) {
                    flag = false;
                    break;
                }
            }

        }
        console.log(flag);
        if(flag) {
            this.main.checkpass(flag);
        }
    }

    private resetIdle = () => {
        this.resetSpeed();
        this.armature.playAnimation(`dj`, 0);
    };

    fuhuo() {
        this.resetSpeed();
        this.armature.playAnimation(`dj`, 0);
        // 重置加速状态（移除冷却记录的重置）
        this.isBoosting = false;
        this.boostTimer = 0;
    }

    update(dt: number) {
        // 标准化当前角度到 0-360°
        const currentAngle = this.normalizeAngle(this.node.angle);

        // ===================== 仅保留模糊角度检测（无冷却） =====================
        if (this.enableAngleBoost && !this.isBoosting && this.boostAngles.length > 0) {
            for (const targetAngle of this.boostAngles) {
                const normalizedTarget = this.normalizeAngle(targetAngle);
                // 计算最小角度差（解决 359° 和 1° 跨0度的问题）
                const angleDiff = Math.abs(currentAngle - normalizedTarget);
                const minDiff = Math.min(angleDiff, 360 - angleDiff);

                // 仅判断：是否在±5°容错区间内 → 触发加速（无冷却限制）
                if (minDiff <= this.ANGLE_TOLERANCE) {
                    this.triggerSpeedBoost();
                    break; // 触发后退出循环，避免多角度重复触发
                }
            }
        }
        // ==============================================================

        // 加速计时与恢复（保留原有逻辑）
        if (this.isBoosting) {
            this.boostTimer += dt;
            if (this.boostTimer >= this.boostDuration) {
                this.endSpeedBoost();
            }
        }

        // 原本的旋转逻辑
        const angleStep = this.speed * this.dir * dt;
        this.node.angle = (this.node.angle + angleStep) % 360;
    }

    slowRotate() {
        this.speed = this.originSpeed / 4 + this.father.rotateSpeed;
        if (this.isBoosting) {
            this.originalSpeedDuringBoost = this.speed;
        }
    }

    resetSpeed() {
        this.speed = this.originSpeed + this.father.rotateSpeed;
        if (this.isBoosting) {
            this.originalSpeedDuringBoost = this.speed;
        }
    }

    setRotateProps(direction: number, speed: number) {
        this.dir = [1, -1].includes(direction) ? direction : 1;
        this.speed = Math.max(0, speed);
        this.originSpeed = this.speed;
        if (this.isBoosting) {
            this.originalSpeedDuringBoost = this.speed;
        }
    }

    // 触发加速（保留）
    private triggerSpeedBoost() {
        this.isBoosting = true;
        this.boostTimer = 0;
        this.originalSpeedDuringBoost = this.speed;
        this.speed += this.speedBoost;
    }

    // 结束加速（保留）
    private endSpeedBoost() {
        this.isBoosting = false;
        this.boostTimer = 0;
        this.speed = this.originalSpeedDuringBoost;
    }

    // 角度标准化工具方法（保留，解决负数/超360°问题）
    private normalizeAngle(angle: number): number {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    }
}