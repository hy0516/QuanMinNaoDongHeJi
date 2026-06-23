/**
 * lv318 角色 AI 控制器
 */

import GunItem_lv318 from "../GunItem_lv318";
import MeleeItem_lv318 from "../MeleeItem_lv318";
import RagdollCharacter_lv318 from "./RagdollCharacter_lv318";
import { CharacterState_lv318, CharacterType_lv318, MoveDirection_lv318 } from "./CharacterConfig_lv318";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterAI_lv318 extends cc.Component {

    @property(RagdollCharacter_lv318) ragdoll: RagdollCharacter_lv318 = null;

    @property autoMove: boolean = false;
    @property patrolMode: boolean = false;
    @property patrolLeftBound: number = -500;
    @property patrolRightBound: number = 500;
    @property attackRange: number = 80;

    private _currentState: CharacterState_lv318 = CharacterState_lv318.Idle;
    private _moveDirection: MoveDirection_lv318 = MoveDirection_lv318.Right;
    private _targetNode: cc.Node = null;
    private _attackCooldownTimer: number = 0;
    private _stateTimer: number = 0;
    private _jumpCooldownTimer: number = 0;
    private _onAttackHit: (target: cc.Node) => void = null;
    private _canShootLock: boolean = false;

    onLoad() {
        if (!this.ragdoll) this.ragdoll = this.getComponent(RagdollCharacter_lv318);
    }

    start() {
        // 根据初始位置决定移动方向
        if (this.patrolMode && this.ragdoll) {
            const pos = this.ragdoll.getBodyPosition();
            if (pos.x >= this.patrolRightBound - 50) this._moveDirection = MoveDirection_lv318.Left;
            else if (pos.x <= this.patrolLeftBound + 50) this._moveDirection = MoveDirection_lv318.Right;
        }
        this.changeState(this.autoMove ? CharacterState_lv318.Walk : CharacterState_lv318.Idle);
    }

    update(dt: number) {
        if (this._attackCooldownTimer > 0) this._attackCooldownTimer -= dt;
        if (this._jumpCooldownTimer > 0) this._jumpCooldownTimer -= dt;
        this._stateTimer += dt;

        this.updateAI();
        this.updateState(dt);
    }

    private updateAI() {
        if (!this.ragdoll) return;

        // 武器切换中，暂停AI逻辑
        if (this.ragdoll.isSwitchingWeapon()) return;

        if (this.ragdoll.characterType === CharacterType_lv318.Infected) {
            this.updateInfectedAI();
        } else {
            this.updateNormalAI();
        }

        // 障碍物检测
        // const obstacle = this.ragdoll.checkObstacleAhead();
        // if (obstacle.hasObstacle && obstacle.needJump && this._jumpCooldownTimer <= 0) {
        //     this.ragdoll.jump();
        //     this._jumpCooldownTimer = 0.5;
        //     this.changeState(CharacterState_lv318.Jump);
        // }

        // // 巡逻边界检测
        // if (this.patrolMode && this.autoMove) {
        //     const pos = this.ragdoll.getBodyPosition();
        //     if (pos.x <= this.patrolLeftBound && this._moveDirection === MoveDirection_lv318.Left) {
        //         this._moveDirection = MoveDirection_lv318.Right;
        //     } else if (pos.x >= this.patrolRightBound && this._moveDirection === MoveDirection_lv318.Right) {
        //         this._moveDirection = MoveDirection_lv318.Left;
        //     }
        // }

        // 目标追踪
        if (this._targetNode && cc.isValid(this._targetNode)) {
            // 验证目标是否仍然是有效目标
            const targetRagdoll = this._targetNode.getComponent(RagdollCharacter_lv318);
            if (this.ragdoll.characterType === CharacterType_lv318.Infected) {
                // 感染者追踪普通人类
                if (!targetRagdoll || targetRagdoll.characterType !== CharacterType_lv318.Normal) {
                    this.clearTarget();
                    return;
                }
            } else if (this.ragdoll.getMelee()) {
                // 持有近战武器的人类追踪感染者
                if (!targetRagdoll || targetRagdoll.characterType !== CharacterType_lv318.Infected) {
                    this.clearTarget();
                    return;
                }
            }

            const myPos = this.ragdoll.getBodyPosition();
            const targetPos = this._targetNode.position;
            const distance = Math.abs(targetPos.x - myPos.x);
            if (targetPos.x > myPos.x + 10) this._moveDirection = MoveDirection_lv318.Right;
            else if (targetPos.x < myPos.x - 10) this._moveDirection = MoveDirection_lv318.Left;
            if (distance < this.attackRange && this._attackCooldownTimer <= 0) {
                this.ragdoll.attack();
                this._attackCooldownTimer = this.ragdoll.config.attackCooldown;
                this.changeState(CharacterState_lv318.Attack);
                if (this._onAttackHit) this._onAttackHit(this._targetNode);
            }
        }
    }

    private updateInfectedAI() {
        const detectionRange = this.ragdoll.config.detectionRange || 300;
        const target = this.findNearestCharacter(CharacterType_lv318.Normal, detectionRange);
        if (target) {
            // 如果当前目标无效或已改变，更新目标
            if (!this._targetNode || !cc.isValid(this._targetNode) || this._targetNode !== target.node) {
                this.setTarget(target.node);
            }
        } else {
            this.clearTarget();
        }
    }

    private updateNormalAI() {
        const gun = this.ragdoll.getGun();
        const melee = this.ragdoll.getMelee();

        if (gun) {
            const target = this.findNearestCharacter(CharacterType_lv318.Infected, gun.shootRange);
            if (!target) return;

            this.aimAt(target, gun);
            if (this.canShootAt(target, gun)) {
                this.shootAt(target, gun);
            }

        } else if (melee) {
            this.updateMeleeAI(melee);
        }
    }

    private updateMeleeAI(melee: MeleeItem_lv318) {
        const target = this.findNearestCharacter(CharacterType_lv318.Infected, melee.detectRange);
        if (target) {
            // 设置追踪目标
            if (!this._targetNode || !cc.isValid(this._targetNode) || this._targetNode !== target.node) {
                this.setTarget(target.node);
            }
            // 开始挥舞
            melee.setSwinging(true);
        } else {
            // 清除目标，停止挥舞
            this.clearTarget();
            melee.setSwinging(false);
        }
    }


    private findNearestCharacter(type: CharacterType_lv318, maxRange: number = Infinity): RagdollCharacter_lv318 {
        const all = RagdollCharacter_lv318.getAllCharacters();
        const myPos = this.ragdoll.getBodyPosition();
        let closest: RagdollCharacter_lv318 = null;
        let minDist = maxRange;

        all.forEach(other => {
            if (!other || other === this.ragdoll) return;
            if (other.characterType !== type) return;
            if (!cc.isValid(other.node)) return;
            const d = myPos.sub(other.getBodyPosition()).mag();
            if (d <= minDist) {
                minDist = d;
                closest = other;
            }
        });

        return closest;
    }

    private aimAt(target: RagdollCharacter_lv318, gun: GunItem_lv318) {
        const gunNode = gun.node;
        const gunArm = gunNode.parent;
        const armRb = gunArm?.getComponent(cc.RigidBody);
        if (!armRb) return;

        const muzzlePos = gun.getMuzzleWorldPos();
        const targetWorldPos = target.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const dir = cc.v2(targetWorldPos.x - muzzlePos.x, targetWorldPos.y - muzzlePos.y);
        if (dir.mag() <= 0.001) return;

        // 使用 atan2 计算角度，范围 -180~180
        const targetAngle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
        // 手臂应该达到的角度 = 目标角度 - 枪的holdAngle偏移
        const desiredArmAngle = targetAngle - gun.holdAngle;
        const currentAngle = gunArm.angle;
        const error = this.normalizeAngle(desiredArmAngle - currentAngle);
        const absError = Math.abs(error);

        // 误差很小时停止调整
        if (absError < 1) {
            armRb.angularVelocity = 0;
            return;
        }

        // 直接控制角速度：误差越大，角速度越大（有上限）
        const maxAngularSpeed = 250; // 最大旋转速度（度/秒）
        const minAngularSpeed = 20;  // 最小旋转速度，保证小误差也能调整
        
        // 计算期望角速度：线性映射，误差5度时达到最大速度
        let speed = Math.min(absError * 45, maxAngularSpeed); // 5度 * 45 = 225
        speed = Math.max(speed, minAngularSpeed); // 保证最小速度
        
        const desiredAngularVelocity = -Math.sign(error) * speed;
        
        // 直接设置刚体角速度
        armRb.angularVelocity = desiredAngularVelocity;
    }

    private shootAt(target: RagdollCharacter_lv318, gun: GunItem_lv318) {
        if (!gun.canShoot()) return;
        const muzzlePos = gun.getMuzzleWorldPos();
        const targetWorldPos = target.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const direction = cc.v2(targetWorldPos.x - muzzlePos.x, targetWorldPos.y - muzzlePos.y);
        gun.shoot(direction);
    }

    private normalizeAngle(angle: number): number {
        let a = angle % 360;
        if (a > 180) a -= 360;
        if (a < -180) a += 360;
        return a;
    }

    // 瞄准到位才允许开枪：角度 + 角速度双阈值，并带滞回避免抖动
    private canShootAt(target: RagdollCharacter_lv318, gun: GunItem_lv318): boolean {
        if (!gun || !gun.canShoot()) return false;

        const gunArm = gun.node.parent;
        const armRb = gunArm?.getComponent(cc.RigidBody);
        if (!gunArm || !armRb) return false;

        const muzzlePos = gun.getMuzzleWorldPos();
        const targetWorldPos = target.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const dir = cc.v2(targetWorldPos.x - muzzlePos.x, targetWorldPos.y - muzzlePos.y);
        if (dir.mag() <= 0.001) return false;

        const targetAngle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
        const desiredArmAngle = targetAngle - gun.holdAngle;
        const error = this.normalizeAngle(desiredArmAngle - gunArm.angle);
        const absError = Math.abs(error);

        const enterAngle = 6;
        const exitAngle = 10;
        const maxAngVel = 30;

        if (this._canShootLock) {
            if (absError > exitAngle) this._canShootLock = false;
        } else {
            if (absError <= enterAngle && Math.abs(armRb.angularVelocity) <= maxAngVel) this._canShootLock = true;
        }

        return this._canShootLock;
    }

    private updateState(dt: number) {
        if (!this.ragdoll) return;
        const dir = this._moveDirection === MoveDirection_lv318.Right ? 1 : this._moveDirection === MoveDirection_lv318.Left ? -1 : 0;

        switch (this._currentState) {
            case CharacterState_lv318.Idle:
                if (this.autoMove && this._stateTimer > 0.5) this.changeState(CharacterState_lv318.Walk);
                break;
            case CharacterState_lv318.Walk:
                // 感染者或持有近战武器的人类有目标时使用指向性移动
                if ((this.ragdoll.characterType === CharacterType_lv318.Infected || this.ragdoll.getMelee()) && this._targetNode && cc.isValid(this._targetNode)) {
                    const targetPos = cc.v2(this._targetNode.x, this._targetNode.y);
                    this.ragdoll.moveToward(targetPos);
                } else {
                    this.ragdoll.move(dir);
                }
                break;
            case CharacterState_lv318.Jump:
                this.ragdoll.move(dir * 0.5);
                if (this.ragdoll.isGrounded() && this._stateTimer > 0.2) this.changeState(CharacterState_lv318.Walk);
                break;
            case CharacterState_lv318.Attack:
                // // 攻击状态下继续移动
                // this.ragdoll.move(dir);
                if (this._stateTimer > 0.3) this.changeState(CharacterState_lv318.Walk);
                break;
            case CharacterState_lv318.Ragdoll:
                break;
        }
    }

    public changeState(newState: CharacterState_lv318) {
        if (this._currentState === newState) return;
        if (this._currentState === CharacterState_lv318.Ragdoll) this.ragdoll.exitFullRagdoll();
        this._currentState = newState;
        this._stateTimer = 0;
        if (newState === CharacterState_lv318.Ragdoll) this.ragdoll.enterFullRagdoll();
    }

    // ========== 外部接口 ==========
    public setTarget(target: cc.Node) { this._targetNode = target; }
    public clearTarget() {
        this._targetNode = null;
        this._moveDirection = MoveDirection_lv318.None;
        this.changeState(CharacterState_lv318.Idle);
    }
    public setMoveDirection(dir: MoveDirection_lv318) { this._moveDirection = dir; }
    public stopMove() { this._moveDirection = MoveDirection_lv318.None; this.changeState(CharacterState_lv318.Idle); }
    public startMove(dir: MoveDirection_lv318 = MoveDirection_lv318.Right) { this._moveDirection = dir; this.changeState(CharacterState_lv318.Walk); }
    public forceRagdoll(duration: number = 2) {
        this.changeState(CharacterState_lv318.Ragdoll);
        this.scheduleOnce(() => { if (this._currentState === CharacterState_lv318.Ragdoll) this.changeState(CharacterState_lv318.Idle); }, duration);
    }
    public setOnAttackHit(callback: (target: cc.Node) => void) { this._onAttackHit = callback; }
    public getCurrentState(): CharacterState_lv318 { return this._currentState; }
}
