/**
 * lv318 布娃娃角色 - 物理控制
 */

import { CharacterConfig_lv318, CharacterType_lv318, DefaultCharacterConfig_lv318 } from "./CharacterConfig_lv318";
import GunItem_lv318 from "../GunItem_lv318";
import MeleeItem_lv318 from "../MeleeItem_lv318";
import WearableItem_lv318, { WearSlot_lv318 } from "../WearableItem_lv318";
import RagdollContactProxy_lv318 from "./RagdollContactProxy_lv318";
import DraggableItem_lv318 from "../DraggableItem_lv318";
import AudioManager from "../../script/common/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RagdollCharacter_lv318 extends cc.Component {
    private static _instances: RagdollCharacter_lv318[] = [];

    public static getAllCharacters(): RagdollCharacter_lv318[] {
        return this._instances;
    }

    // ========== 部件引用 ==========
    @property(cc.Node) body: cc.Node = null;
    @property(cc.Node) head: cc.Node = null;
    @property(cc.Node) armL: cc.Node = null;
    @property(cc.Node) armR: cc.Node = null;
    @property(cc.Node) legL: cc.Node = null;
    @property(cc.Node) legR: cc.Node = null;

    // ========== 配置 ==========
    public config: CharacterConfig_lv318 = DefaultCharacterConfig_lv318;

    @property({ tooltip: "平衡P" }) balanceP: number = 800;
    @property({ tooltip: "平衡D" }) balanceD: number = 80;
    @property({ tooltip: "目标角度" }) targetAngle: number = 0;
    @property({ tooltip: "移动力" }) moveForce: number = 1500;
    @property({ tooltip: "最大速度" }) maxSpeed: number = 150;
    @property({ tooltip: "跳跃力" }) jumpForce: number = 3000;

    @property({ type: cc.Enum(CharacterType_lv318), tooltip: "角色类型" })
    characterType: CharacterType_lv318 = CharacterType_lv318.Normal;

    @property({
        type: cc.Prefab,
        tooltip: "感染后替换的预制体",
        visible: function () {
            return this.characterType === CharacterType_lv318.Normal;
        }
    })
    infectedPrefabPath: cc.Prefab = null;

    @property({ tooltip: "是否自动切换武器（拾取新武器时丢弃旧武器）" })
    autoSwitchWeapon: boolean = true;

    // ========== 私有状态 ==========
    private _bodyRb: cc.RigidBody = null;
    private _legLRb: cc.RigidBody = null;
    private _legRRb: cc.RigidBody = null;
    private _armLRb: cc.RigidBody = null;
    private _armRRb: cc.RigidBody = null;
    private _lastAngleError: number = 0;
    private _isBalanceEnabled: boolean = true;
    private _isGrounded: boolean = false;
    private _facingRight: boolean = true;
    private _gunNode: cc.Node = null;
    private _meleeNode: cc.Node = null;
    private _headWearNode: cc.Node = null;   // 当前头部装备
    private _bodyWearNode: cc.Node = null;   // 当前身体装备
    private _isSwitchingWeapon: boolean = false;  // 武器切换锁定状态

    onLoad() {
        RagdollCharacter_lv318._instances.push(this);
        this.config = { ...this.config, balanceP: this.balanceP, balanceD: this.balanceD, targetAngle: this.targetAngle, moveForce: this.moveForce, maxSpeed: this.maxSpeed, jumpForce: this.jumpForce };
        this.cacheRigidBodies();
        this.ensureContactProxy();
        // this.setupArms();
    }

    onDestroy() {
        const idx = RagdollCharacter_lv318._instances.indexOf(this);
        if (idx >= 0) RagdollCharacter_lv318._instances.splice(idx, 1);
    }

    private setupArms() {
        // 手臂无重力 + 纯角速度旋转（风车效果）
        if (this._armLRb) {
            this._armLRb.gravityScale = 0;
            this._armLRb.angularDamping = 0;      // 无阻尼，持续旋转
            this._armLRb.angularVelocity = 360;   // 初始角速度（度/秒）
            const collider = this.armL.getComponent(cc.PhysicsCollider);
            if (collider) collider.enabled = false;
            const joint = this.armL.getComponent(cc.RevoluteJoint);
            if (joint) joint.enableLimit = false;
        }
        if (this._armRRb) {
            this._armRRb.gravityScale = 0;
            this._armRRb.angularDamping = 0;
            this._armRRb.angularVelocity = -360;  // 反向旋转
            const collider = this.armR.getComponent(cc.PhysicsCollider);
            if (collider) collider.enabled = false;
            const joint = this.armR.getComponent(cc.RevoluteJoint);
            if (joint) joint.enableLimit = false;
        }
    }

    private cacheRigidBodies() {
        if (this.body) this._bodyRb = this.body.getComponent(cc.RigidBody);
        if (this.legL) this._legLRb = this.legL.getComponent(cc.RigidBody);
        if (this.legR) this._legRRb = this.legR.getComponent(cc.RigidBody);
        if (this.armL) this._armLRb = this.armL.getComponent(cc.RigidBody);
        if (this.armR) this._armRRb = this.armR.getComponent(cc.RigidBody);
    }

    update(dt: number) {
        if (this._isBalanceEnabled) this.applyBalanceForce(dt);
        this.checkGrounded();
        this.syncRootPosition();
    }

    private syncRootPosition() {
        if (!this.body || !this.node.parent) return;
        const bodyWorldPos = this.body.convertToWorldSpaceAR(cc.v2(0, 0));
        const parentLocalPos = this.node.parent.convertToNodeSpaceAR(bodyWorldPos);
        this.node.position = cc.v3(parentLocalPos.x, parentLocalPos.y, 0);
    }

    private applyBalanceForce(dt: number) {
        if (!this._bodyRb || dt <= 0) return;
        const error = this.config.targetAngle - this._bodyRb.node.angle;
        const derivative = (error - this._lastAngleError) / dt;
        this._bodyRb.applyTorque(this.config.balanceP * error + this.config.balanceD * derivative, true);
        this._lastAngleError = error;
    }

    public setBalanceEnabled(enabled: boolean) { this._isBalanceEnabled = enabled; }

    public move(direction: number) {
        if (!this._bodyRb) return;

        const velocity = this._bodyRb.linearVelocity;
        if (Math.abs(velocity.x) < this.config.maxSpeed * 2 || (direction > 0 && velocity.x < 0) || (direction < 0 && velocity.x > 0)) {
            this._bodyRb.applyForceToCenter(cc.v2(direction * this.config.moveForce, 0), true);
        }

        if (direction > 0) {
            const prevFacing = this._facingRight;
            this._facingRight = true;
            if (prevFacing !== this._facingRight) {
                this.updateGunMount();
                this.updateMeleeMount();
            }
        } else if (direction < 0) {
            const prevFacing = this._facingRight;
            this._facingRight = false;
            if (prevFacing !== this._facingRight) {
                this.updateGunMount();
                this.updateMeleeMount();
            }
        }
    }

    /** 向目标位置施加力（用于感染者追踪） */
    public moveToward(targetPos: cc.Vec2) {
        if (!this._bodyRb) return;

        const myPos = this.getBodyPosition();
        const dir = targetPos.sub(myPos);
        if (dir.mag() < 1) return;

        const normalized = dir.normalize();
        const velocity = this._bodyRb.linearVelocity;

        // 水平方向限速检查
        const canApplyX = Math.abs(velocity.x) < this.config.maxSpeed * 2 ||
            (normalized.x > 0 && velocity.x < 0) || (normalized.x < 0 && velocity.x > 0);

        const forceX = canApplyX ? normalized.x * this.config.moveForce : 0;
        // 垂直方向给较小的力，避免飞天
        const forceY = normalized.y > 0.1 ? normalized.y * this.config.moveForce : 0;//this.config.moveForce * 0.5 : 0;

        this._bodyRb.applyForceToCenter(cc.v2(forceX, forceY), true);

        // 更新朝向
        if (normalized.x > 0.1 && !this._facingRight) {
            this._facingRight = true;
            this.updateGunMount();
            this.updateMeleeMount();
        } else if (normalized.x < -0.1 && this._facingRight) {
            this._facingRight = false;
            this.updateGunMount();
            this.updateMeleeMount();
        }
    }

    public jump() {
        if (!this._bodyRb || !this._isGrounded) return;
        this._bodyRb.applyForceToCenter(cc.v2(0, this.config.jumpForce), true);
        if (this._legLRb) this._legLRb.applyForceToCenter(cc.v2(0, this.config.jumpForce * 0.3), true);
        if (this._legRRb) this._legRRb.applyForceToCenter(cc.v2(0, this.config.jumpForce * 0.3), true);
        this._isGrounded = false;
    }

    public attack() {
        const attackArm = this._facingRight ? this._armRRb : this._armLRb;
        if (!attackArm) return;
        const dir = this._facingRight ? -1 : 1;
        attackArm.applyTorque(this.config.attackForce * dir, true);
        attackArm.applyForceToCenter(cc.v2(-dir * this.config.attackForce * 0.5, 0), true);
    }

    private checkGrounded() {
        if (!this.body) return;
        const bodyHeight = this.body.height || 100;
        const startPos = this.body.convertToWorldSpaceAR(cc.v2(0, -bodyHeight / 2));
        const endPos = cc.v2(startPos.x, startPos.y - this.config.groundCheckDistance);
        const results = cc.director.getPhysicsManager().rayCast(startPos, endPos, cc.RayCastType.Closest);
        this._isGrounded = results.length > 0 && !results[0].collider.node.isChildOf(this.node) && results[0].collider.node !== this.body;
    }

    public checkObstacleAhead(): { hasObstacle: boolean; needJump: boolean } {
        if (!this.body) return { hasObstacle: false, needJump: false };
        const dir = this._facingRight ? 1 : -1;
        const startPos = this.body.convertToWorldSpaceAR(cc.v2(0, 0));
        const endPos = cc.v2(startPos.x + dir * this.config.obstacleCheckDistance, startPos.y);
        const results = cc.director.getPhysicsManager().rayCast(startPos, endPos, cc.RayCastType.Closest);
        if (results.length > 0) {
            const hit = results[0];
            const heightDiff = (hit.collider.node.y + hit.collider.node.height / 2) - (this.body.y - this.body.height / 2);
            return { hasObstacle: true, needJump: heightDiff > this.config.obstacleJumpHeight };
        }
        return { hasObstacle: false, needJump: false };
    }

    private ensureContactProxy() {
        // 确保所有部位都挂上 ContactProxy，才能收到 onPreSolve
        this.attachContactProxy(this.body);
        this.attachContactProxy(this.head);
        this.attachContactProxy(this.armL);
        this.attachContactProxy(this.armR);
        this.attachContactProxy(this.legL);
        this.attachContactProxy(this.legR);

        // 开启刚体接触监听，否则 onPreSolve 不触发
        if (this._bodyRb) this._bodyRb.enabledContactListener = true;
        if (this._armLRb) this._armLRb.enabledContactListener = true;
        if (this._armRRb) this._armRRb.enabledContactListener = true;
        if (this._legLRb) this._legLRb.enabledContactListener = true;
        if (this._legRRb) this._legRRb.enabledContactListener = true;
    }

    private attachContactProxy(node: cc.Node) {
        if (!node) return;
        let proxy = node.getComponent(RagdollContactProxy_lv318) as RagdollContactProxy_lv318;
        if (!proxy) proxy = node.addComponent(RagdollContactProxy_lv318) as RagdollContactProxy_lv318;
        if (proxy) proxy.init(this);
    }

    public handleBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        // 武器切换中，忽略所有拾取交互
        if (this._isSwitchingWeapon) return;
        
        const otherRagdoll = this.findRagdollInParents(otherCollider.node);
        if (otherRagdoll && otherRagdoll !== this) {
            if (this.characterType === CharacterType_lv318.Normal && otherRagdoll.characterType === CharacterType_lv318.Infected) {
                this.transformToInfected();
            }
            return;
        }

        if (this.characterType !== CharacterType_lv318.Normal) return;

        // 检测枪 - 如果正在被拖动则不拾取
        const gunItem = this.findGunInParents(otherCollider.node);
        if (gunItem && (this.autoSwitchWeapon)) {//!this._gunNode ||
            const draggable = gunItem.node.getComponent("DraggableItem_lv318");
            if (draggable && (draggable as any).isDragging) return; // 正在拖动，不拾取
            if (this._gunNode&&this._gunNode.name === gunItem.node.name) return; //枪械name一样
            draggable.enabledDrag = false;
            AudioManager.playEffect(`装备武器`,false);
            this.pickupGun(gunItem.node);
            return;
        }

        // 检测近战武器 - 如果正在被拖动则不拾取
        const meleeItem = this.findMeleeInParents(otherCollider.node);
        if (meleeItem && ( this.autoSwitchWeapon)) {//!this._meleeNode ||
            const draggable = meleeItem.node.getComponent("DraggableItem_lv318");
            if (draggable && (draggable as any).isDragging) return; // 正在拖动，不拾取
            if (this._meleeNode&&this._meleeNode.name === meleeItem.node.name) return;//name一样
            draggable.enabledDrag = false;
            // 检查武器是否已被其他角色佩戴
            const meleeOwner = meleeItem.getOwner();
            if (meleeOwner && meleeOwner !== this) {
                return;
            }
            draggable.enabledDrag = false;
            AudioManager.playEffect(`装备武器`,false);
            this.pickupMelee(meleeItem.node);
            return;
        }

        // 检测衣服道具 - 如果正在被拖动则不拾取
        const wearableItem = this.findWearableInParents(otherCollider.node);
        if (wearableItem) {
            const draggable = wearableItem.node.getComponent("DraggableItem_lv318");
            if (draggable && (draggable as any).isDragging) return; // 正在拖动，不拾取
            if (this._headWearNode && this._headWearNode.name === wearableItem.node.name) return;
            if (this._bodyWearNode && this._bodyWearNode.name === wearableItem.node.name) return;
            draggable.enabledDrag = false;
            AudioManager.playEffect(`装备服装`,false);
            this.pickupWearable(wearableItem.node);
        }
    }

    private findRagdollInParents(node: cc.Node): RagdollCharacter_lv318 {
        if (!node) return null;
        const ragdoll = (node as any).getComponent?.(RagdollCharacter_lv318) as RagdollCharacter_lv318;
        if (ragdoll) return ragdoll;
        const parent = node.parent;
        if (!parent || parent === cc.director.getScene()) return null;
        return (parent as any).getComponent?.(RagdollCharacter_lv318) as RagdollCharacter_lv318 || null;
    }

    private findGunInParents(node: cc.Node): GunItem_lv318 {
        if (!node) return null;
        const gun = (node as any).getComponent?.(GunItem_lv318) as GunItem_lv318;
        if (gun) return gun;
        const parent = node.parent;
        if (!parent || parent === cc.director.getScene()) return null;
        return (parent as any).getComponent?.(GunItem_lv318) as GunItem_lv318 || null;
    }

    private findMeleeInParents(node: cc.Node): MeleeItem_lv318 {
        if (!node) return null;
        const melee = (node as any).getComponent?.(MeleeItem_lv318) as MeleeItem_lv318;
        if (melee) return melee;
        const parent = node.parent;
        if (!parent || parent === cc.director.getScene()) return null;
        return (parent as any).getComponent?.(MeleeItem_lv318) as MeleeItem_lv318 || null;
    }

    private findWearableInParents(node: cc.Node): WearableItem_lv318 {
        if (!node) return null;
        const wearable = (node as any).getComponent?.(WearableItem_lv318) as WearableItem_lv318;
        if (wearable) return wearable;
        const parent = node.parent;
        if (!parent || parent === cc.director.getScene()) return null;
        return (parent as any).getComponent?.(WearableItem_lv318) as WearableItem_lv318 || null;
    }

    public pickupGun(gunNode: cc.Node) {
        if (!gunNode) return;
        if (this._isSwitchingWeapon) return; // 防止重入
        
        this._isSwitchingWeapon = true; // 锁定状态
        
        // 清理AI状态，防止旧武器引用
        const ai = this.getComponent("CharacterAI_lv318");
        if (ai) {
            (ai as any).clearTarget?.();
        }
        
        // 持有近战时先丢弃近战
        if (this._meleeNode) this.dropMelee();
        // 如果已有枪，先销毁旧枪
        if (this._gunNode) this.dropGun();

        const rbs = gunNode.getComponentsInChildren(cc.RigidBody);
        rbs.forEach(rb => rb.destroy());
        const colliders = gunNode.getComponentsInChildren(cc.PhysicsCollider);
        colliders.forEach(c => c.destroy());

        this._gunNode = gunNode;
        this.scheduleOnce(() => {
            this.updateGunMount();
            const gun = this.getGun();
            if (gun) gun.setOwner(this.node);
            // 延迟解锁，确保物理系统稳定
            this.scheduleOnce(() => {
                this._isSwitchingWeapon = false;
            }, 0.1);
        }, 0);
    }

    public dropGun() {
        if (this._gunNode) {
            this._gunNode.destroy();
            this._gunNode = null;
        }
    }

    public getGun(): GunItem_lv318 {
        return this._gunNode ? this._gunNode.getComponent(GunItem_lv318) : null;
    }

    public pickupMelee(meleeNode: cc.Node) {
        if (!meleeNode) return;
        if (this._isSwitchingWeapon) return; // 防止重入

        this._isSwitchingWeapon = true; // 锁定状态

        // 清理AI状态，防止旧武器引用
        const ai = this.getComponent("CharacterAI_lv318");
        if (ai) {
            (ai as any).clearTarget?.();
        }

        // 持有枪时先丢弃枪
        if (this._gunNode) this.dropGun();
        // 如果已有近战，先销毁旧近战
        if (this._meleeNode) this.dropMelee();

        this._meleeNode = meleeNode;

        // 步骤1：立即禁用节点，避免武器乱飞
        meleeNode.active = false;
        const rbs = meleeNode.getComponentsInChildren(cc.RigidBody);
        const colliders = meleeNode.getComponentsInChildren(cc.PhysicsCollider);

        // 步骤2：延迟一帧挂到手上
        this.scheduleOnce(() => {
            this.updateMeleeMount();
            const melee = this.getMelee();
            if (melee) melee.setOwner(this.node);

            // 步骤3：再延迟一帧重新配置物理组件
            this.scheduleOnce(() => {
                // 重新启用并配置刚体为Kinematic
                rbs.forEach(rb => {
                    rb.type = cc.RigidBodyType.Kinematic;
                    rb.gravityScale = 0;
                    rb.linearVelocity = cc.v2(0, 0);   // 清除线速度！
                    rb.angularVelocity = 0;             // 清除角速度！
                    rb.enabledContactListener = true;
                    meleeNode.active = true;
                });
                // 重新启用碰撞体并设为sensor
                colliders.forEach(c => {
                    c.enabled = true;
                    // c.sensor = true;
                });
                
                // 延迟解锁，确保物理系统稳定
                this.scheduleOnce(() => {
                    this._isSwitchingWeapon = false;
                }, 0.1);
            }, 0);
        }, 0);
    }

    public dropMelee() {
        const melee = this.getMelee();
        if (melee) melee.setSwinging(false);
        if (this._meleeNode) {
            this._meleeNode.destroy();
            this._meleeNode = null;
        }
    }

    public getMelee(): MeleeItem_lv318 {
        return this._meleeNode ? this._meleeNode.getComponent(MeleeItem_lv318) : null;
    }

    // ========== 衣服装备 ==========
    public pickupWearable(wearableNode: cc.Node) {
        if (!wearableNode) return;
        const wearable = wearableNode.getComponent(WearableItem_lv318);
        if (!wearable) return;

        const isHead = wearable.wearSlot === WearSlot_lv318.Head;
        const targetPart = isHead ? this.head : this.body;
        const wearNode = targetPart?.getChildByName("wearNode");
        if (!wearNode) return;

        const currentWearNode = isHead ? this._headWearNode : this._bodyWearNode;
        

        if (currentWearNode && cc.isValid(currentWearNode)) {
            currentWearNode.destroy();
        }
        if (isHead) 
                this._headWearNode = wearableNode;
        else this._bodyWearNode = wearableNode;

        // console.log("装备衣服!");
        const draggable = wearableNode.getComponent(DraggableItem_lv318);
        if (draggable) draggable.enabledDrag = false;

        wearableNode.active = false;
        this.scheduleOnce(() => {
            wearableNode.getComponentsInChildren(cc.RigidBody).forEach(rb => rb.destroy());
            wearableNode.getComponentsInChildren(cc.PhysicsCollider).forEach(c => c.destroy());

            wearableNode.parent = wearNode;
            wearableNode.x = wearable.holdOffset.x;
            wearableNode.y = wearable.holdOffset.y;
            wearableNode.angle = wearable.holdAngle;
            wearableNode.active = true;
        }, 0);
    }

    // public dropHeadWear() {
    //     if (this._headWearNode && cc.isValid(this._headWearNode)) {
    //         this._headWearNode.destroy();
    //         this._headWearNode = null;
    //     }
    // }

    // public dropBodyWear() {
    //     if (this._bodyWearNode && cc.isValid(this._bodyWearNode)) {
    //         this._bodyWearNode.destroy();
    //         this._bodyWearNode = null;
    //     }
    // }

    public getHeadWear(): WearableItem_lv318 {
        return this._headWearNode ? this._headWearNode.getComponent(WearableItem_lv318) : null;
    }

    public getBodyWear(): WearableItem_lv318 {
        return this._bodyWearNode ? this._bodyWearNode.getComponent(WearableItem_lv318) : null;
    }

    private updateGunMount() {
        if (!this._gunNode) return;
        const targetArm = this._facingRight ? this.armR : this.armL;
        const parentNode = targetArm || this.body || this.node;
        if (!parentNode) return;

        if (this._gunNode.parent !== parentNode) {
            this._gunNode.parent = parentNode;
        }

        const gun = this.getGun();
        if (gun) {
            this._gunNode.position = cc.v3(gun.holdOffset.x, gun.holdOffset.y, 0);
            this._gunNode.angle = gun.holdAngle;
        } else {
            this._gunNode.position = cc.v3(0, 0, 0);
            this._gunNode.angle = 0;
        }
    }

    private updateMeleeMount() {
        if (!this._meleeNode) return;
        const targetArm = this._facingRight ? this.armR : this.armL;
        const parentNode = targetArm || this.body || this.node;
        if (!parentNode) return;
        if(this._meleeNode&&this._meleeNode.parent)
        {
            if (this._meleeNode.parent !== parentNode) {
                this._meleeNode.parent = parentNode;
            }
    
            const melee = this.getMelee();
            if (melee) {
                this._meleeNode.position = cc.v3(melee.holdOffset.x, melee.holdOffset.y, 0);
                this._meleeNode.angle = melee.holdAngle;
            } else {
                this._meleeNode.position = cc.v3(0, 0, 0);
                this._meleeNode.angle = 0;
            }
        }
    }

    private _isTransforming: boolean = false;

    public transformToInfected() {
        if (this.characterType === CharacterType_lv318.Infected) return;
        if (this._isTransforming) return; // 防止同帧多次触发
        this._isTransforming = true;

        // 立即标记为感染者，防止其他碰撞体再次触发
        this.characterType = CharacterType_lv318.Infected;

        this.dropGun();
        const parent = this.node.parent;
        const spawnPos = this.node.position;
        const spawnAngle = this.node.angle;

        if (!this.infectedPrefabPath) {
            return;
        }

        if (!parent || !cc.isValid(parent)) {
            cc.error("[RagdollCharacter_lv318] 无法转换: 父节点无效");
            return;
        }

        const newNode = cc.instantiate(this.infectedPrefabPath);
        newNode.parent = parent;
        newNode.position = cc.v3(spawnPos.x, spawnPos.y, 0);
        newNode.angle = spawnAngle;

        this.node.destroy();
    }

    // ========== 状态获取 ==========
    public isGrounded(): boolean { return this._isGrounded; }
    public isFacingRight(): boolean { return this._facingRight; }
    public getBodyPosition(): cc.Vec2 { return cc.v2(this.node.x, this.node.y); }
    public getBodyVelocity(): cc.Vec2 { return this._bodyRb ? this._bodyRb.linearVelocity : cc.v2(0, 0); }
    public enterFullRagdoll() { this.setBalanceEnabled(false); }
    public exitFullRagdoll() { this.setBalanceEnabled(true); }
    public isSwitchingWeapon(): boolean { return this._isSwitchingWeapon; }
}
