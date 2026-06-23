import FeedPhysicsItemBase from "./feedPhysicsItemBase_lv384";

/**
 * lv384 角色嘴部吐出的物理物体：可拖拽；不参与「喂食」碰撞
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class feedSpitPhysicsItem_lv384 extends FeedPhysicsItemBase {

    @property(cc.Sprite)
    itemSprite: cc.Sprite = null;

    onLoad() {
        this.onBaseLoad();
    }

    onDestroy() {
        this.onBaseDestroy();
    }

    onBeginContact(
        _contact: cc.PhysicsContact,
        _selfCollider: cc.PhysicsCollider,
        _otherCollider: cc.PhysicsCollider
    ): void {
    }

    onEndContact(
        _contact: cc.PhysicsContact,
        _selfCollider: cc.PhysicsCollider,
        _otherCollider: cc.PhysicsCollider
    ): void {
    }

    /**
     * 吐出物仅拖拽手感：降跟手推力与限速、加阻尼，减轻飘、快（不改喷射初速）
     */
    protected getDragForceScaleMultiplier(): number {
        return 1.02;
    }

    protected getMaxDragSpeed(): number {
        return 820;
    }

    protected getDragLinearDamping(): number {
        return 0.9;
    }

    protected getDragAngularDamping(): number {
        return 0.11;
    }

    protected getDragFreeDamping(): number {
        return 1.08;
    }

    protected getDragSoftFollowScale(): number {
        return 26;
    }

    protected getDragRopeDamping(): number {
        return 4.65;
    }

    protected getDragForceScale(): number {
        return 98;
    }

    protected getDragRopeLength(): number {
        return 24;
    }
}
