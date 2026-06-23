import RagdollCharacter_lv318 from "./RagdollCharacter_lv318";
import MeleeItem_lv318 from "../MeleeItem_lv318";

const { ccclass } = cc._decorator;

@ccclass
export default class RagdollContactProxy_lv318 extends cc.Component {
    private _owner: RagdollCharacter_lv318 = null;

    public init(owner: RagdollCharacter_lv318) {
        this._owner = owner;
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (this._owner) {
            this._owner.handleBeginContact(contact, selfCollider, otherCollider);
        }
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (!this._owner) return;

        const selfNode = selfCollider.node;
        const otherNode = otherCollider.node;

        // 屏蔽“同角色的手臂 vs 自身其他部位”的碰撞
        if (this.isOwnerArmNode(selfNode) && this.isNodeInOwner(otherNode)) {
            (contact as any).setEnabled(false);
            return;
        }else if (this.isOwnerArmNode(otherNode) && this.isNodeInOwner(selfNode)) {
            (contact as any).setEnabled(false);
            return;
        }
    }

    private isNodeInOwner(node: cc.Node): boolean {
        if (!this._owner || !node) return false;
        let current: cc.Node = node;
        while (current) {
            if (current === this._owner.node) return true;
            current = current.parent;
        }
        return false;
    }

    private isOwnerArmNode(node: cc.Node): boolean {
        if (!this._owner || !node) return false;
        const armL = this._owner.armL;
        const armR = this._owner.armR;
        return this.isNodeIn(armL, node) || this.isNodeIn(armR, node);
    }

    private isNodeIn(root: cc.Node, node: cc.Node): boolean {
        if (!root || !node) return false;
        let current: cc.Node = node;
        while (current) {
            if (current === root) return true;
            current = current.parent;
        }
        return false;
    }

    private isOwnerMeleeWeapon(node: cc.Node): boolean {
        if (!this._owner || !node) return false;
        // 检查节点是否是宿主的近战武器（或近战武器的子节点）
        const meleeNode = this._owner.getMelee()?.node;
        if (!meleeNode) return false;
        return this.isNodeIn(meleeNode, node);
    }
}
