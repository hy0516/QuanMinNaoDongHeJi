/**
 * lv384 物理物品公共逻辑：拖拽、碰撞约束
 * 非组件，勿挂节点；请使用 feedSpawnedPhysicsItem_lv384 / feedSpitPhysicsItem_lv384
 */

/** 与太阳身体接触道具数变化（+1/-1），供 feed_lv384_character_demo 暂停漂浮 */
export const FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA = "feed_lv384_sunBodyItemContactDelta";

export default class FeedPhysicsItemBase extends cc.Component {

    protected itemSprite: cc.Sprite = null;

    protected rigidBody: cc.RigidBody = null;
    protected physicsCollider: cc.PhysicsCollider = null;

    protected isDragging: boolean = false;
    protected targetPos: cc.Vec2 = cc.v2(0, 0);

    protected itemId: number = 0;

    protected dragProbePoints: cc.Vec2[] = [];

    private readonly dragProbeStep: number = 8;

    /** 子类可覆盖以下 getter，仅影响拖拽阶段（不改变喷射初速） */
    protected getDragForceScale(): number {
        return 112;
    }
    protected getDragRopeLength(): number {
        return 28;
    }
    protected getDragRopeDamping(): number {
        return 3.8;
    }
    protected getDragFreeDamping(): number {
        return 0.72;
    }
    protected getDragSoftFollowScale(): number {
        return 34;
    }
    protected getMaxDragSpeed(): number {
        return 1420;
    }
    protected getDragLinearDamping(): number {
        return 0.62;
    }
    /** 拖拽时角阻尼；onLoad 初始角阻尼与此一致 */
    protected getDragAngularDamping(): number {
        return 0.06;
    }
    protected getDragReleaseBoost(): number {
        return 0.2;
    }

    private prevGravityScale: number = 1;
    private prevLinearDamping: number = 0;
    private prevAngularDamping: number = 0;
    private prevColliderDensity: number = 1;

    /** 子类可按物体重量单独提高拖拽跟手推力 */
    protected getDragForceScaleMultiplier(): number {
        return 1;
    }

    /** 管理器出屏回收时跳过拖拽中的物体 */
    public isDraggingActive(): boolean {
        return this.isDragging;
    }

    /**
     * 手指目标相对当前位置的方向（世界坐标单位向量），不受 clampDragSegment 阻挡。
     * 贴墙时物体线速度可能≈0，但手指仍在移动，供子类做「沿手指意图」辅助。
     */
    protected getDragIntentDirectionWorld(): cc.Vec2 {
        if (!this.isDragging || !this.node.parent) {
            return cc.v2(0, 0);
        }
        const parent = this.node.parent;
        const curW = parent.convertToWorldSpaceAR(this.node.getPosition());
        const targetW = parent.convertToWorldSpaceAR(this.targetPos);
        const dx = targetW.x - curW.x;
        const dy = targetW.y - curW.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-4) {
            return cc.v2(0, 0);
        }
        return cc.v2(dx / len, dy / len);
    }

    protected onBaseLoad(): void {
        if (!this.itemSprite) {
            this.itemSprite = this.getComponent(cc.Sprite);
        }

        this.rigidBody = this.node.getComponent(cc.RigidBody);
        if (!this.rigidBody) {
            cc.warn('[feedPhysicsItemBase_lv384] 缺少 RigidBody');
            return;
        }

        this.physicsCollider = this.node.getComponent(cc.PhysicsCircleCollider) || this.node.getComponent(cc.PhysicsPolygonCollider);
        if (!this.physicsCollider) {
            cc.warn('[feedPhysicsItemBase_lv384] 缺少 PhysicsCollider');
            return;
        }
        this.cacheDragProbePoints();

        this.rigidBody.angularDamping = this.getDragAngularDamping();

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    protected onBaseDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart(event: cc.Event.EventTouch): void {
        event.stopPropagation();
        this.isDragging = true;
        if (this.node.parent) {
            this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
        }
        const worldPos = event.getLocation();
        this.targetPos = this.worldToParentLocal(worldPos);

        if (this.rigidBody) {
            this.prevGravityScale = this.rigidBody.gravityScale;
            this.prevLinearDamping = this.rigidBody.linearDamping;
            this.prevAngularDamping = this.rigidBody.angularDamping;

            this.rigidBody.type = cc.RigidBodyType.Dynamic;
            this.rigidBody.gravityScale = 0;
            this.rigidBody.linearDamping = this.getDragLinearDamping();
            this.rigidBody.angularDamping = this.getDragAngularDamping();
        }
        if (this.physicsCollider) {
            this.prevColliderDensity = this.physicsCollider.density;
            this.physicsCollider.density = 10;
        }
    }

    private onTouchMove(event: cc.Event.EventTouch): void {
        if (!this.isDragging) return;
        event.stopPropagation();
        const worldPos = event.getLocation();
        this.targetPos = this.worldToParentLocal(worldPos);
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        event.stopPropagation();
        this.endDrag();
    }

    private onTouchCancel(event: cc.Event.EventTouch): void {
        event.stopPropagation();
        this.endDrag();
    }

    private endDrag(): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        if (this.physicsCollider) {
            this.physicsCollider.density = this.prevColliderDensity;
        }
        if (this.rigidBody) {
            const releaseVelocity = this.rigidBody.linearVelocity;
            const releaseSpeed = releaseVelocity.mag();
            this.rigidBody.type = cc.RigidBodyType.Dynamic;
            this.rigidBody.gravityScale = this.prevGravityScale;
            this.rigidBody.linearDamping = this.prevLinearDamping;
            this.rigidBody.angularDamping = this.prevAngularDamping;
            if (releaseSpeed > 30) {
                const boost = Math.min(220, releaseSpeed * this.getDragReleaseBoost());
                const dir = releaseVelocity.normalize();
                const mass = Math.max(this.rigidBody.getMass(), 1e-4);
                const wc = this.rigidBody.getWorldCenter();
                this.rigidBody.applyLinearImpulse(cc.v2(dir.x * mass * boost, dir.y * mass * boost), wc, true);
            }
        }
    }

    update(_dt: number): void {
        if (this.isDragging && this.rigidBody) {
            const parent = this.node.parent;
            if (!parent) {
                return;
            }
            const cur = this.node.getPosition();
            const curW = parent.convertToWorldSpaceAR(cur);
            const targetW = parent.convertToWorldSpaceAR(this.targetPos);
            const clampedW = this.clampDragSegmentWorld(curW, targetW);
            const delta = cc.v2(clampedW.x - curW.x, clampedW.y - curW.y);
            const distance = delta.mag();
            const velocity = this.rigidBody.linearVelocity;

            const dir = distance > 0.001 ? delta.normalize() : cc.v2(0, 0);
            const dragForceScaleMultiplier = this.getDragForceScaleMultiplier();
            const softFollowForce = delta.mul(this.getDragSoftFollowScale() * dragForceScaleMultiplier);
            const ropeStretch = Math.max(0, distance - this.getDragRopeLength());
            if (ropeStretch > 0.001) {
                const ropeForce = dir.mul(ropeStretch * this.getDragForceScale() * dragForceScaleMultiplier);
                const alongRopeSpeed = velocity.dot(dir);
                const ropeDampingForce = dir.mul(-alongRopeSpeed * this.getDragRopeDamping());
                const freeDampingForce = velocity.mul(-this.getDragFreeDamping());
                this.rigidBody.applyForce(softFollowForce.add(ropeForce).add(ropeDampingForce).add(freeDampingForce), curW, true);
            } else {
                const alongRopeSpeed = velocity.dot(dir);
                const softDampingForce = dir.mul(-alongRopeSpeed * (this.getDragRopeDamping() * 0.32));
                const freeDampingForce = velocity.mul(-this.getDragFreeDamping());
                this.rigidBody.applyForce(softFollowForce.add(softDampingForce).add(freeDampingForce), curW, true);
            }

            const newVelocity = this.rigidBody.linearVelocity;
            const speed = newVelocity.mag();
            const maxDragSpeed = this.getMaxDragSpeed();
            if (speed > maxDragSpeed) {
                const mass = Math.max(this.rigidBody.getMass(), 1e-4);
                const capped = newVelocity.normalize().mul(maxDragSpeed);
                const ix = (capped.x - newVelocity.x) * mass;
                const iy = (capped.y - newVelocity.y) * mass;
                this.rigidBody.applyLinearImpulse(cc.v2(ix, iy), curW, true);
            }
        }
    }

    private worldToParentLocal(worldPos: cc.Vec2): cc.Vec2 {
        const parent = this.node.parent;
        if (!parent) {
            return this.targetPos;
        }
        return parent.convertToNodeSpaceAR(worldPos);
    }

    private isColliderOnSelf(c: cc.PhysicsCollider): boolean {
        return !c || !c.node || c.node === this.node;
    }

    private isDragBlockingCollider(c: cc.PhysicsCollider): boolean {
        if (!c || !c.node) {
            return false;
        }
        const group = c.node.group;
        if (group === 'spawnedItem' || group === 'spitOutItem'
            || group === 'mouth' || group === 'jiao'
            || group === 'head_upper' || group === 'head_lower') {
            return false;
        }
        return true;
    }

    private clampDragSegmentWorld(fromW: cc.Vec2, toW: cc.Vec2): cc.Vec2 {
        const pm = cc.director.getPhysicsManager();
        if (!pm || !pm.enabled) {
            return cc.v2(toW.x, toW.y);
        }

        const delta = cc.v2(toW.x - fromW.x, toW.y - fromW.y);
        const distance = delta.mag();
        if (distance <= 0.001) {
            return cc.v2(fromW.x, fromW.y);
        }

        const sampleWorldPoints = this.getDragProbeWorldPoints();
        const stepCount = Math.max(1, Math.ceil(distance / this.dragProbeStep));
        let safe = cc.v2(fromW.x, fromW.y);

        for (let i = 1; i <= stepCount; i++) {
            const t = i / stepCount;
            const probe = cc.v2(fromW.x + delta.x * t, fromW.y + delta.y * t);
            if (this.hasBlockingOverlapAtWorld(probe, fromW, sampleWorldPoints, pm)) {
                return this.findMaxFreePointOnSegment(safe, probe, fromW, sampleWorldPoints, pm);
            }
            safe = probe;
        }

        return cc.v2(safe.x, safe.y);
    }

    private findMaxFreePointOnSegment(fromW: cc.Vec2, toW: cc.Vec2, baseCenterW: cc.Vec2, sampleWorldPoints: cc.Vec2[], pm: cc.PhysicsManager): cc.Vec2 {
        let t0 = 0;
        let t1 = 1;
        for (let i = 0; i < 12; i++) {
            const t = (t0 + t1) * 0.5;
            const px = fromW.x + (toW.x - fromW.x) * t;
            const py = fromW.y + (toW.y - fromW.y) * t;
            const c = this.hasBlockingOverlapAtWorld(cc.v2(px, py), baseCenterW, sampleWorldPoints, pm);
            if (c) {
                t1 = t;
            } else {
                t0 = t;
            }
        }
        const ft = t0;
        return cc.v2(fromW.x + (toW.x - fromW.x) * ft, fromW.y + (toW.y - fromW.y) * ft);
    }

    private cacheDragProbePoints(): void {
        const points: cc.Vec2[] = [];
        const box = this.physicsCollider as cc.PhysicsBoxCollider;
        if (box && box.size) {
            const hw = box.size.width * 0.5;
            const hh = box.size.height * 0.5;
            const ox = box.offset.x;
            const oy = box.offset.y;
            points.push(cc.v2(ox, oy));
            points.push(cc.v2(ox - hw, oy - hh));
            points.push(cc.v2(ox, oy - hh));
            points.push(cc.v2(ox + hw, oy - hh));
            points.push(cc.v2(ox - hw, oy));
            points.push(cc.v2(ox + hw, oy));
            points.push(cc.v2(ox - hw, oy + hh));
            points.push(cc.v2(ox, oy + hh));
            points.push(cc.v2(ox + hw, oy + hh));
            this.dragProbePoints = points;
            return;
        }

        const polygon = this.physicsCollider as cc.PhysicsPolygonCollider;
        if (polygon && polygon.points && polygon.points.length > 0) {
            let centerX = 0;
            let centerY = 0;
            for (let i = 0; i < polygon.points.length; i++) {
                const p = polygon.points[i];
                const point = cc.v2(p.x + polygon.offset.x, p.y + polygon.offset.y);
                const next = polygon.points[(i + 1) % polygon.points.length];
                const mid = cc.v2(
                    (p.x + next.x) * 0.5 + polygon.offset.x,
                    (p.y + next.y) * 0.5 + polygon.offset.y
                );
                centerX += point.x;
                centerY += point.y;
                points.push(point);
                points.push(mid);
            }
            points.unshift(cc.v2(centerX / polygon.points.length, centerY / polygon.points.length));
            this.dragProbePoints = points;
            return;
        }

        this.dragProbePoints = [cc.v2(0, 0)];
    }

    private getDragProbeWorldPoints(): cc.Vec2[] {
        const list: cc.Vec2[] = [];
        const probes = this.dragProbePoints.length > 0 ? this.dragProbePoints : [cc.v2(0, 0)];
        for (let i = 0; i < probes.length; i++) {
            list.push(this.node.convertToWorldSpaceAR(probes[i]));
        }
        return list;
    }

    private hasBlockingOverlapAtWorld(targetCenterW: cc.Vec2, baseCenterW: cc.Vec2, sampleWorldPoints?: cc.Vec2[], pm?: cc.PhysicsManager): boolean {
        return !!this.findBlockingHitAtWorld(targetCenterW, baseCenterW, sampleWorldPoints, pm);
    }

    private findBlockingHitAtWorld(
        targetCenterW: cc.Vec2,
        baseCenterW: cc.Vec2,
        sampleWorldPoints?: cc.Vec2[],
        pm?: cc.PhysicsManager
    ): { collider: cc.PhysicsCollider, point: cc.Vec2 } {
        const physicsManager = pm || cc.director.getPhysicsManager();
        if (!physicsManager || !physicsManager.enabled) {
            return null;
        }

        const baseSamples = sampleWorldPoints || this.getDragProbeWorldPoints();
        const dx = targetCenterW.x - baseCenterW.x;
        const dy = targetCenterW.y - baseCenterW.y;
        for (let i = 0; i < baseSamples.length; i++) {
            const sample = baseSamples[i];
            const checkPoint = cc.v2(sample.x + dx, sample.y + dy);
            const hit = physicsManager.testPoint(checkPoint);
            if (hit && !this.isColliderOnSelf(hit) && this.isDragBlockingCollider(hit)) {
                return {
                    collider: hit,
                    point: checkPoint
                };
            }
        }
        return null;
    }
}
