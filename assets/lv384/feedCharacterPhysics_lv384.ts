/**
 * lv384 角色嘴部区域：上半/下半截刚体、嘴部碰撞；张嘴目标角直接同步到节点（不再使用关节马达与推头交互）
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class feedCharacterPhysics_lv384 extends cc.Component {

    @property(cc.Node)
    headUpper: cc.Node = null;

    @property(cc.Node)
    headLower: cc.Node = null;

    @property(cc.Node)
    jointNode: cc.Node = null;

    private upperRigidBody: cc.RigidBody = null;

    private lowerRigidBody: cc.RigidBody = null;

    private joint: cc.RevoluteJoint = null;

    private activeJointNode: cc.Node = null;

    private targetAngle: number = 0;

    private maxOpenAngle: number = 80;

    onLoad() {
        const rootSprite = this.getComponent(cc.Sprite);
        if (rootSprite && !rootSprite.spriteFrame) {
            rootSprite.enabled = false;
        }
    }

    start() {
        this.setupPhysics();
    }

    private setupPhysics(): void {
        if (this.headUpper) {
            this.upperRigidBody = this.headUpper.getComponent(cc.RigidBody);
            if (!this.upperRigidBody) {
                cc.warn('[feedCharacterPhysics_lv384] headUpper 缺少 RigidBody');
                return;
            }
            this.upperRigidBody.type = cc.RigidBodyType.Dynamic;
            this.upperRigidBody.gravityScale = 0;
            this.upperRigidBody.allowSleep = false;
            this.upperRigidBody.angularDamping = 2.2;
            this.upperRigidBody.linearDamping = 1.8;
            this.upperRigidBody.linearVelocity = cc.v2(0, 0);
            this.upperRigidBody.angularVelocity = 0;

            const upperCollider = this.headUpper.getComponent(cc.PhysicsPolygonCollider);
            if (!upperCollider) {
                cc.warn('[feedCharacterPhysics_lv384] headUpper 缺少 PhysicsPolygonCollider');
                return;
            }
            this.headUpper.group = 'head_upper';
        }

        if (this.headLower) {
            this.lowerRigidBody = this.headLower.getComponent(cc.RigidBody);
            if (!this.lowerRigidBody) {
                cc.warn('[feedCharacterPhysics_lv384] headLower 缺少 RigidBody');
                return;
            }
            this.lowerRigidBody.type = cc.RigidBodyType.Static;
            this.lowerRigidBody.gravityScale = 0;

            const lowerCollider = this.headLower.getComponent(cc.PhysicsPolygonCollider);
            if (!lowerCollider) {
                cc.warn('[feedCharacterPhysics_lv384] headLower 缺少 PhysicsPolygonCollider');
                return;
            }
            this.headLower.group = 'default';

            this.setupMouthCollider();
        }

        this.bindSceneJoint();
    }

    private setupMouthCollider(): void {
        if (!this.headLower) return;

        const mouthColliderNode = this.headLower.getChildByName('mouthCollider');
        if (!mouthColliderNode) {
            cc.warn('[feedCharacterPhysics_lv384] headLower 缺少 mouthCollider');
            return;
        }

        const mouthRigidBody = mouthColliderNode.getComponent(cc.RigidBody);
        if (!mouthRigidBody) {
            cc.warn('[feedCharacterPhysics_lv384] mouthCollider 缺少 RigidBody');
            return;
        }

        const mouthCollider = mouthColliderNode.getComponent(cc.PhysicsBoxCollider)
            || mouthColliderNode.getComponent(cc.PhysicsPolygonCollider);
        if (!mouthCollider) {
            cc.warn('[feedCharacterPhysics_lv384] mouthCollider 缺少 PhysicsCollider');
            return;
        }

        mouthRigidBody.type = cc.RigidBodyType.Static;
        mouthRigidBody.gravityScale = 0;
        mouthColliderNode.group = 'mouth';
    }

    private bindSceneJoint(): void {
        if (!this.headUpper || !this.headLower) {
            return;
        }

        this.activeJointNode = this.resolveActiveJointNode();

        this.joint =
            (this.jointNode && this.jointNode.getComponent(cc.RevoluteJoint)) ||
            this.headUpper.getComponent(cc.RevoluteJoint) ||
            null;
        if (!this.joint) {
            const childJn = this.headUpper.getChildByName('jointNode');
            if (childJn) {
                this.joint = childJn.getComponent(cc.RevoluteJoint);
            }
        }

        if (this.joint) {
            this.joint.enableMotor = false;
            this.joint.motorSpeed = 0;
            const pivotRb = this.joint.node.getComponent(cc.RigidBody);
            if (pivotRb) {
                pivotRb.type = cc.RigidBodyType.Static;
                pivotRb.gravityScale = 0;
                pivotRb.linearVelocity = cc.v2(0, 0);
                pivotRb.angularVelocity = 0;
            }
        } else {
            cc.warn('[feedCharacterPhysics_lv384] 场景中未找到 RevoluteJoint（可选，仅用于枢轴）');
        }

        this.targetAngle = this.getCurrentHeadAngle();
        this.syncUpperRigidBody();
    }

    update(_dt: number): void {
        this.syncHeadFromTarget();
    }

    public resetMouthToClosed(): void {
        cc.Tween.stopAllByTarget(this);
        this.targetAngle = 0;
        if (this.headUpper && this.headUpper.isValid) {
            this.headUpper.angle = 0;
        }
        this.syncUpperRigidBody();
    }

    public openMouth(angle: number = 30, duration: number = 0.5): void {
        if (!this.headUpper) return;

        cc.Tween.stopAllByTarget(this);
        const tweenState = {
            angle: this.targetAngle
        };

        cc.tween(tweenState)
            .to(duration, { angle: this.clampAngle(-angle) }, {
                progress: (start: number, end: number, current: number, ratio: number) => {
                    this.targetAngle = start + (end - start) * ratio;
                    return current;
                }
            })
            .delay(0.5)
            .to(duration, { angle: 0 }, {
                progress: (start: number, end: number, current: number, ratio: number) => {
                    this.targetAngle = start + (end - start) * ratio;
                    return current;
                }
            })
            .start();
    }

    public getMouthWorldPosition(): cc.Vec2 {
        if (this.activeJointNode) {
            return this.activeJointNode.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        if (this.jointNode) {
            return this.jointNode.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        return cc.v2(0, 0);
    }

    public isPointInMouth(point: cc.Vec2): boolean {
        const mouthPos = this.getMouthWorldPosition();
        const distance = point.sub(mouthPos).mag();
        return distance < 50;
    }

    private clampAngle(angle: number): number {
        return Math.max(-this.maxOpenAngle, Math.min(this.maxOpenAngle, angle));
    }

    private resolveActiveJointNode(): cc.Node {
        const headUpperJointNode = this.headUpper.getChildByName('jointNode');
        if (headUpperJointNode) {
            return headUpperJointNode;
        }
        return this.jointNode;
    }

    private getCurrentHeadAngle(): number {
        if (!this.headUpper) {
            return 0;
        }

        let angle = -this.headUpper.angle;
        while (angle > 180) {
            angle -= 360;
        }
        while (angle < -180) {
            angle += 360;
        }
        return this.clampAngle(angle);
    }

    private syncHeadFromTarget(): void {
        if (!this.headUpper) {
            return;
        }
        if (this.upperRigidBody) {
            this.upperRigidBody.gravityScale = 0;
        }
        if (this.joint) {
            this.joint.enableMotor = false;
            this.joint.motorSpeed = 0;
        }
        const clamped = this.clampAngle(this.targetAngle);
        this.headUpper.angle = -clamped;
        this.syncUpperRigidBody();
    }

    private syncUpperRigidBody(): void {
        if (!this.upperRigidBody) {
            return;
        }
        this.upperRigidBody.syncPosition(true);
        this.upperRigidBody.syncRotation(true);
        this.upperRigidBody.linearVelocity = cc.v2(0, 0);
        this.upperRigidBody.angularVelocity = 0;
    }

    onDestroy() {
        cc.Tween.stopAllByTarget(this);
    }
}
