import { CharacterType_lv318 } from "./ai_character_lv318/CharacterConfig_lv318";
import RagdollCharacter_lv318 from "./ai_character_lv318/RagdollCharacter_lv318";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet_lv318 extends cc.Component {
    @property lifetime: number = 3;

    private _direction: cc.Vec2 = cc.v2(1, 0);
    private _speed: number = 800;

    public init(direction: cc.Vec2, speed: number) {
        this._direction = direction.normalize();
        this._speed = speed;
        // 根据射击方向设置子弹旋转角度
        this.node.angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        this.scheduleOnce(() => this.node.destroy(), this.lifetime);
    }

    update(dt: number) {
        const move = this._direction.mul(this._speed * dt);
        this.node.position = this.node.position.add(cc.v3(move.x, move.y, 0));
    }

    private onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        const ragdoll = this.findRagdollInParents(otherCollider.node);
        if (ragdoll && ragdoll.characterType === CharacterType_lv318.Infected) {
            ragdoll.node.destroy();
        }
        if (ragdoll && ragdoll.characterType === CharacterType_lv318.Normal) {
           return;
        }
        this.node.destroy();
    }

    private findRagdollInParents(node: cc.Node): RagdollCharacter_lv318 {
        if (!node) return null;
        const ragdoll = (node as any).getComponent?.(RagdollCharacter_lv318) as RagdollCharacter_lv318;
        if (ragdoll) return ragdoll;
        const parent = node.parent;
        if (!parent || parent === cc.director.getScene()) return null;
        return (parent as any).getComponent?.(RagdollCharacter_lv318) as RagdollCharacter_lv318 || null;
    }
}
