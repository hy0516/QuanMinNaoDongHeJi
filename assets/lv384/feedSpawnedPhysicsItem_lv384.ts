import { ItemType } from "./feed_config_384";
import FeedPhysicsItemBase, { FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA } from "./feedPhysicsItemBase_lv384";
import { playLv384TableDropOnce } from "./feed_audio_lv384";

/** 与太阳身体/角碰撞时仅播龙骨反应，不销毁道具（由 feed_lv384 监听） */
export const FEED_PHYSICS_ITEM_SUN_PROP_REACT = "feedPhysicsItem_sunPropReact";

/**
 * lv384 点击格子生成的物理道具：可拖入嘴部触发喂食。
 * 太阳身体/角碰撞优先于嘴部，避免与嘴碰撞体重叠时误吞。
 * 推太阳完全交给 Box2D 碰撞与摩擦，不在此脚本对太阳施加额外力/冲量。
 */

const { ccclass } = cc._decorator;

@ccclass
export default class feedSpawnedPhysicsItem_lv384 extends FeedPhysicsItemBase {
    private static readonly sunTouchRepeatInterval = 0.09;
    /** 鞭子/拖鞋：与太阳碰撞触发冷却（秒），避免蹭角频繁触发 */
    private static readonly sunWhipSlipperTouchRepeatInterval = 0.58;
 
    private itemConfigType: ItemType = ItemType.None;
    private isEaten: boolean = false;
    private tableDropSfxPlayed: boolean = false;
    private lastSunReactAt: number = 0;

    /** 与太阳身体碰撞深度（仅身体，用于 feed_lv384_character_demo 暂停漂浮 ±1） */
    private sunBodyContactRefCount: number = 0;

    onLoad() {
        this.onBaseLoad();
        const col = this.physicsCollider;
        if (col) {
            col.friction = 0.04;
            col.restitution = 0.08;
        }
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSpawnedDragTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onSpawnedDragTouchEnd, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onSpawnedDragTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onSpawnedDragTouchEnd, this);
        this.onBaseDestroy();
    }

    /**
     * 在基类 endDrag（恢复密度/重力）之后执行。
     * 不用冲量抵消速度：惯量很小时 applyAngularImpulse(-w*I) 易算错，与密度刚切换叠加会残留很大角速度。
     */
    private onSpawnedDragTouchEnd(): void {
        if (!this.rigidBody || !this.rigidBody.isValid) {
            return;
        }
        this.rigidBody.linearVelocity = cc.v2(0, 0);
        this.rigidBody.angularVelocity = 0;
    }

    /** 拖拽中略提高角阻尼，减少与桌面/太阳摩擦产生的自转，放手后更稳 */
    protected getDragAngularDamping(): number {
        return 0.42;
    }

    /** 略提整体绳力倍率，跟手更紧 */
    protected getDragForceScaleMultiplier(): number {
        return 1.68;
    }

    /** 软跟随强，减少拖拽中「带惯性」的飘移感 */
    protected getDragSoftFollowScale(): number {
        return 52;
    }

    /** 绳长短，更早拉紧跟手 */
    protected getDragRopeLength(): number {
        return 16;
    }

    /** 绳段拉力略大，拉大时更快追上 */
    protected getDragForceScale(): number {
        return 200;
    }

    /** 沿绳方向阻尼大，减甩动 */
    protected getDragRopeDamping(): number {
        return 6.2;
    }

    /** 拖拽时线阻尼高，少残留速度 */
    protected getDragLinearDamping(): number {
        return 0.96;
    }

    /** 侧向阻尼高，减斜向甩动 */
    protected getDragFreeDamping(): number {
        return 1.55;
    }

    /** 松手无额外冲量（真正惯性由 onSpawnedDragTouchEnd 清零） */
    protected getDragReleaseBoost(): number {
        return 0;
    }

    /** 拖拽限速，避免高速甩动 */
    protected getMaxDragSpeed(): number {
        return 1200;
    }

    public init(id: number): void {
        this.itemId = id;
        this.node.group = "spawnedItem";
    }

    public setItemConfigType(type: ItemType): void {
        this.itemConfigType = type;
    }

    public getItemConfigType(): ItemType {
        return this.itemConfigType;
    }

    public getItemId(): number {
        return this.itemId;
    }

    public getIsEaten(): boolean {
        return this.isEaten;
    }

    private isSunBodyNode(node: cc.Node): boolean {
        return !!node && node.name === "太阳身体圆_ske";
    }

    private isSunHornNode(node: cc.Node): boolean {
        return !!node && /^jiao[1-9]_ske$/.test(node.name);
    }

    /** 鞭子/拖鞋：仅蹭到角时触发（身体不触发）；且需在拖拽中 */
    private isWhipOrSlipper(): boolean {
        return this.itemConfigType === ItemType.SunMagnet
            || this.itemConfigType === ItemType.SunBalloon;
    }

    private emitSunPropReact(hitPart: "body" | "horn", hitNode: cc.Node): void {
        const now = Date.now();
        const minIntervalSec = this.isWhipOrSlipper()
            ? feedSpawnedPhysicsItem_lv384.sunWhipSlipperTouchRepeatInterval
            : feedSpawnedPhysicsItem_lv384.sunTouchRepeatInterval;
        if (now - this.lastSunReactAt < minIntervalSec * 1000) {
            return;
        }
        this.lastSunReactAt = now;
        cc.director.emit(FEED_PHYSICS_ITEM_SUN_PROP_REACT, {
            itemConfigType: this.itemConfigType,
            hitPart: hitPart,
            hitNode: hitNode
        });
    }

    private emitFeedItemEaten(hitPart: string, hitNode: cc.Node, shouldConsume: boolean): void {
        if (shouldConsume) {
            this.isEaten = true;
        }
        cc.director.emit("feedPhysicsItem_eaten", {
            itemConfigType: this.itemConfigType,
            itemNode: this.node,
            hitPart: hitPart,
            hitNode: hitNode
        });
        if (shouldConsume) {
            this.scheduleOnce(() => {
                if (this.node && this.node.isValid) {
                    this.node.destroy();
                }
            }, 0.05);
        }
    }

    onBeginContact(
        _contact: cc.PhysicsContact,
        _selfCollider: cc.PhysicsCollider,
        otherCollider: cc.PhysicsCollider
    ): void {
        if (!otherCollider || !otherCollider.node) {
            return;
        }
        if (this.isEaten) {
            return;
        }
        if (otherCollider.node.name === "桌子" && !this.isDragging && !this.tableDropSfxPlayed) {
            this.tableDropSfxPlayed = true;
            playLv384TableDropOnce();
        }

        /** 太阳身体/角优先：避免与嘴碰撞体重叠时误吞道具 */
        if (this.isSunBodyNode(otherCollider.node)) {
            if (this.isWhipOrSlipper()) {
                return;
            }
            this.sunBodyContactRefCount++;
            cc.director.emit(FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA, 1);
            this.emitSunPropReact("body", otherCollider.node);
            return;
        }
        if (this.isSunHornNode(otherCollider.node)) {
            if (this.isWhipOrSlipper()) {
                if (!this.isDragging) {
                    return;
                }
            }
            this.emitSunPropReact("horn", otherCollider.node);
            return;
        }

        if (otherCollider.node.group !== "mouth") {
            return;
        }

        const selfWorldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const otherWorldPos = otherCollider.node.convertToWorldSpaceAR(cc.v2(0, 0));
        if (selfWorldPos.y <= otherWorldPos.y) {
            return;
        }

        this.emitFeedItemEaten("mouth", otherCollider.node, true);
    }

    onEndContact(
        _contact: cc.PhysicsContact,
        _selfCollider: cc.PhysicsCollider,
        otherCollider: cc.PhysicsCollider
    ): void {
        if (!otherCollider || !otherCollider.node) {
            return;
        }
        if (this.isSunBodyNode(otherCollider.node)) {
            if (!this.isWhipOrSlipper() && this.sunBodyContactRefCount > 0) {
                this.sunBodyContactRefCount--;
                cc.director.emit(FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA, -1);
            }
            return;
        }
    }
}



