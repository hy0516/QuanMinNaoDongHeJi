/**
 * lv318 角色交互检测
 * 
 * 负责：
 * 1. 检测可交互物体
 * 2. 攻击碰撞检测
 * 3. 触发交互事件
 */

import InteractableTag_lv318 from "./InteractableTag_lv318";
import AttackHitbox_lv318 from "./AttackHitbox_lv318";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterInteraction_lv318 extends cc.Component {

    @property(cc.Node)
    body: cc.Node = null;               // 身体节点（用于位置参考）

    @property
    detectRadius: number = 100;         // 检测半径

    // ========== 回调 ==========
    private _onInteractableFound: (target: cc.Node, type: string) => void = null;
    private _onAttackHit: (target: cc.Node, damage: number) => void = null;

    // ========== 缓存 ==========
    private _nearbyInteractables: cc.Node[] = [];

    onLoad() {
        // 监听碰撞事件
        this.setupCollisionCallbacks();
    }

    private setupCollisionCallbacks() {
        // 如果有攻击碰撞体，设置碰撞回调
        const hitboxes = this.node.getComponentsInChildren(cc.PhysicsCollider);
        hitboxes.forEach(collider => {
            const hitbox = collider.node.getComponent(AttackHitbox_lv318);
            if (hitbox) {
                collider.node.on('begin-contact', (contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) => {
                    this.onAttackCollision(other.node, hitbox);
                });
            }
        });
    }

    private onAttackCollision(target: cc.Node, hitbox: AttackHitbox_lv318) {
        // 不攻击自己
        if (target.isChildOf(this.node)) return;

        // 检查目标是否可被攻击
        const targetRb = target.getComponent(cc.RigidBody);
        if (targetRb) {
            // 施加击退力
            const dir = target.x > this.body.x ? 1 : -1;
            targetRb.applyForceToCenter(cc.v2(dir * hitbox.knockbackForce, hitbox.knockbackForce * 0.5), true);
        }

        if (this._onAttackHit) {
            this._onAttackHit(target, hitbox.damage);
        }
    }

    update(dt: number) {
        this.detectNearbyInteractables();
    }

    /** 检测附近的可交互物体 */
    private detectNearbyInteractables() {
        if (!this.body) return;

        const myPos = this.body.convertToWorldSpaceAR(cc.v2(0, 0));

        // 使用 AABB 查询附近的物体
        const aabb = new cc.Rect(
            myPos.x - this.detectRadius,
            myPos.y - this.detectRadius,
            this.detectRadius * 2,
            this.detectRadius * 2
        );

        // 清空旧列表
        this._nearbyInteractables.length = 0;

        // 查询场景中所有带 InteractableTag 的节点
        // 注意：这里用简单遍历，实际项目可用物理查询或空间分区优化
        const scene = cc.director.getScene();
        const interactables = scene.getComponentsInChildren(InteractableTag_lv318);

        interactables.forEach(tag => {
            const pos = tag.node.convertToWorldSpaceAR(cc.v2(0, 0));
            const dist = pos.sub(myPos).len();

            if (dist <= this.detectRadius) {
                this._nearbyInteractables.push(tag.node);

                if (this._onInteractableFound) {
                    this._onInteractableFound(tag.node, tag.interactType);
                }
            }
        });
    }

    // ==================== 外部接口 ====================

    /** 获取最近的可交互物体 */
    public getNearestInteractable(): cc.Node {
        if (this._nearbyInteractables.length === 0) return null;

        let nearest: cc.Node = null;
        let minDist = Infinity;
        const myPos = this.body.convertToWorldSpaceAR(cc.v2(0, 0));

        this._nearbyInteractables.forEach(node => {
            const pos = node.convertToWorldSpaceAR(cc.v2(0, 0));
            const dist = pos.sub(myPos).len();
            if (dist < minDist) {
                minDist = dist;
                nearest = node;
            }
        });

        return nearest;
    }

    /** 获取所有附近的可交互物体 */
    public getNearbyInteractables(): cc.Node[] {
        return this._nearbyInteractables.slice();
    }

    /** 设置发现可交互物体的回调 */
    public setOnInteractableFound(callback: (target: cc.Node, type: string) => void) {
        this._onInteractableFound = callback;
    }

    /** 设置攻击命中回调 */
    public setOnAttackHit(callback: (target: cc.Node, damage: number) => void) {
        this._onAttackHit = callback;
    }
}
