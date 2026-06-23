import RagdollCharacter_lv318 from "./ai_character_lv318/RagdollCharacter_lv318";
import { CharacterType_lv318 } from "./ai_character_lv318/CharacterConfig_lv318";
import DraggableItem_lv318 from "./DraggableItem_lv318";
import AudioManager from "../script/common/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MeleeItem_lv318 extends cc.Component {
    @property({ tooltip: "近战检测范围(像素) - 人类检测感染者的距离" })
    detectRange: number = 220;

    @property({ tooltip: "挥舞角速度(度/秒) - 360°挥舞速度" })
    swingAngularVelocity: number = 360;

    @property({ tooltip: "持武器偏移位置(X,Y)" })
    holdOffset: cc.Vec2 = cc.v2(0, 0);

    @property({ tooltip: "持武器角度(度)" })
    holdAngle: number = 0;

    private _ownerNode: cc.Node = null;
    private _ownerRagdoll: RagdollCharacter_lv318 = null;
    private _swinging: boolean = false;
    private _armRb: cc.RigidBody = null;
    private _armJoint: cc.RevoluteJoint = null;
    private _cachedArm: cc.Node = null;
    private _cached: boolean = false;
    private _origAngularDamping: number = 0;
    private _origGravityScale: number = 1;
    private _origEnableLimit: boolean = true;
    private _draggable: DraggableItem_lv318 = null;

    onLoad() {
        this.scheduleOnce(() => {
            this._draggable = this.node.getComponent(DraggableItem_lv318);
        }, 0);
    }

    update() {
        // 如果正在被拖动，不要强制设置位置
        if (this._draggable && this._draggable.isDragging) {
            return;
        }

        // 同步 Kinematic 刚体的位置和角度到父节点（手臂）
        // Kinematic 刚体不会自动跟随父节点，需要手动同步
        const weaponRb = this.node.getComponent(cc.RigidBody);
        if (weaponRb && weaponRb.type === cc.RigidBodyType.Kinematic) {
            // 武器节点位置应该保持在 holdOffset（相对于手臂）
            this.node.position = cc.v3(this.holdOffset.x, this.holdOffset.y, 0);
            // 武器节点角度应该是 holdAngle（相对于手臂）
            this.node.angle = this.holdAngle;
        }

        if (!this._swinging) return;
        this.ensureArmRefs();
        if (!this._armRb) return;

        const dir = this._ownerRagdoll && this._ownerRagdoll.isFacingRight() ? 1 : -1;
        this._armRb.angularVelocity = this.swingAngularVelocity * dir;
    }

    public setOwner(ownerNode: cc.Node) {
        this._ownerNode = ownerNode;
        this._ownerRagdoll = ownerNode ? ownerNode.getComponent(RagdollCharacter_lv318) : null;
        this._cachedArm = null;
        this._cached = false;
    }

    public getOwner(): RagdollCharacter_lv318 {
        return this._ownerRagdoll;
    }

    public setSwinging(swinging: boolean) {
        if (this._swinging === swinging) return;
        this._swinging = swinging;

        this.ensureArmRefs();

        if (this._armRb) {
            if (swinging) {
                if (!this._cached) {
                    this._origAngularDamping = this._armRb.angularDamping;
                    this._origGravityScale = this._armRb.gravityScale;
                    this._cached = true;
                }
                this._armRb.gravityScale = 0;
                this._armRb.angularDamping = 0;
            } else {
                if (this._cached) {
                    this._armRb.angularDamping = this._origAngularDamping;
                    this._armRb.gravityScale = this._origGravityScale;
                }
                this._armRb.angularVelocity = 0;
            }
        }

        if (this._armJoint) {
            if (swinging) {
                this._origEnableLimit = this._armJoint.enableLimit;
                this._armJoint.enableLimit = false;
            } else {
                this._armJoint.enableLimit = this._origEnableLimit;
            }
        }
    }

    private ensureArmRefs() {
        const parent = this.node.parent;
        if (!parent || this._cachedArm === parent) return;
        this._cachedArm = parent;

        this._armRb = parent.getComponent(cc.RigidBody);
        this._armJoint = parent.getComponent(cc.RevoluteJoint);
        this._cached = false;
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (!this._ownerRagdoll) return;

        const selfNode = selfCollider.node;
        const otherNode = otherCollider.node;

        // 屏蔽"近战武器 vs 持有者任何部位"的碰撞
        if (this.isNodeInOwner(selfNode) && this.isNodeInOwner(otherNode)) {
            (contact as any).setEnabled(false);
        }
        if(otherCollider.node.name.includes(`wall_`))
        {
            (contact as any).setEnabled(false);
        }
        // // 屏蔽"近战武器 vs 其他人类角色身体部位"的碰撞，避免武器被其他人类角色拾取
        // const otherRagdoll = this.findRagdollInParents(otherCollider.node);
        // if (otherRagdoll && otherRagdoll !== this._ownerRagdoll &&
        //     otherRagdoll.characterType === CharacterType_lv318.Normal) {
        //     (contact as any).setEnabled(false);
        // }
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (!this._ownerRagdoll) return;
        const otherRagdoll = this.findRagdollInParents(otherCollider.node);
        if (!otherRagdoll || otherRagdoll === this._ownerRagdoll) return;
        // // 忽略与其他人类角色的碰撞
        // if (otherRagdoll.characterType === CharacterType_lv318.Normal) return;

        if (otherRagdoll.characterType === CharacterType_lv318.Infected) {
            AudioManager.playEffect("近战", false);
            otherRagdoll.node.destroy();
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

    private isNodeInOwner(node: cc.Node): boolean {
        if (!this._ownerRagdoll || !node) return false;
        // 检查节点是否是持有者角色的任何部位（包括武器节点本身）
        let current: cc.Node = node;
        while (current) {
            if (current === this._ownerRagdoll.node) return true;
            // 检查是否是角色的身体部位
            if (current === this._ownerRagdoll.body || 
                current === this._ownerRagdoll.head ||
                current === this._ownerRagdoll.armL ||
                current === this._ownerRagdoll.armR ||
                current === this._ownerRagdoll.legL ||
                current === this._ownerRagdoll.legR) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }
}