/**
 * lv384：子节点「太阳身体圆_ske」拖拽时每帧对刚体施力驱动（与 feedPhysicsItemBase 同类弹簧+阻尼）。
 * 未拖拽时：微弱漂浮力，拉向父节点局部目标点；竖直方向单独降弹簧、提阻尼，避免上下来回晃。
 * 有物理道具与太阳身体碰撞时，通过全局事件暂停漂浮力。
 */

import { FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA } from "./feedPhysicsItemBase_lv384";

const { ccclass, property } = cc._decorator;

@ccclass
export default class feed_lv384_character_demo extends cc.Component {

    @property({ tooltip: "跟手弹性（越大越贴指针）" })
    private dragSoftFollowScale: number = 52;

    @property({ tooltip: "超出绳长后的拉力系数" })
    private dragForceScale: number = 175;

    @property({ tooltip: "视为已贴手的距离阈值（世界单位近似）" })
    private dragRopeLength: number = 28;

    @property
    private dragRopeDamping: number = 3.8;

    @property
    private dragFreeDamping: number = 0.52;

    @property
    private dragLinearDamping: number = 0.45;

    @property
    private maxDragSpeed: number = 1750;

    @property({ tooltip: "未拖拽时是否施加漂浮力" })
    private floatEnabled: boolean = true;

    @property({ tooltip: "有道具与太阳身体接触时是否暂停漂浮力" })
    private floatPauseWhenItemTouchesSunBody: boolean = true;

    @property({ tooltip: "漂浮目标：父节点局部 X（0=与父锚点同一竖线）" })
    private floatTargetLocalX: number = 0;

    @property({ tooltip: "漂浮目标：父节点局部 Y（略低于圆心，一般为负）" })
    private floatTargetLocalY: number = -28;

    @property({ tooltip: "漂浮弹簧强度（小）" })
    private floatForceScale: number = 9;

    @property({ tooltip: "漂浮速度阻尼（抑制来回晃）" })
    private floatVelocityDamping: number = 0.22;

    @property({ tooltip: "竖直方向弹簧系数（相对水平，<1 减弱 Y 向回弹、抑上下抖）" })
    private floatYSpringMul: number = 0.42;

    @property({ tooltip: "竖直速度阻尼倍率（相对水平，>1 更强抑制上下振荡）" })
    private floatVerticalVelocityDampMul: number = 3.4;

    private sunNode: cc.Node = null;
    private sunRigidBody: cc.RigidBody = null;

    private isDraggingSun: boolean = false;
    private sunDragTouchId: number = -1;
    /** 父节点局部坐标：手指目标点 */
    private sunDragTargetLocal: cc.Vec2 = cc.v2(0, 0);
    /** 按下时触点相对太阳节点锚点的局部坐标；applyForce 作用点，随刚体转动 */
    private sunGrabLocal: cc.Vec2 = cc.v2(0, 0);

    private prevSunGravityScale: number = 1;
    private prevSunLinearDamping: number = 0;
    private prevSunAngularDamping: number = 0;
    private prevSunFixedRotation: boolean = false;

    /** 与太阳身体同时接触的道具数；<=0 时无接触 */
    private sunBodyItemContactCount: number = 0;

    onLoad(): void {
        this.sunNode = this.node.getChildByName("太阳身体圆_ske");
        if (!this.sunNode) {
            cc.warn("[feed_lv384_character_demo] 缺少子节点 太阳身体圆_ske");
            return;
        }
        this.sunRigidBody = this.sunNode.getComponent(cc.RigidBody);
        if (!this.sunRigidBody) {
            cc.warn("[feed_lv384_character_demo] 太阳身体圆_ske 缺少 RigidBody");
            return;
        }

        this.sunNode.on(cc.Node.EventType.TOUCH_START, this.onSunTouchStart, this);
        this.sunNode.on(cc.Node.EventType.TOUCH_MOVE, this.onSunTouchMove, this);
        this.sunNode.on(cc.Node.EventType.TOUCH_END, this.onSunTouchEnd, this);
        this.sunNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onSunTouchCancel, this);

        cc.director.on(FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA, this.onSunBodyItemContactDelta, this);
    }

    onDestroy(): void {
        cc.director.off(FEED_LV384_SUN_BODY_ITEM_CONTACT_DELTA, this.onSunBodyItemContactDelta, this);
        if (!this.sunNode || !this.sunNode.isValid) {
            return;
        }
        this.sunNode.off(cc.Node.EventType.TOUCH_START, this.onSunTouchStart, this);
        this.sunNode.off(cc.Node.EventType.TOUCH_MOVE, this.onSunTouchMove, this);
        this.sunNode.off(cc.Node.EventType.TOUCH_END, this.onSunTouchEnd, this);
        this.sunNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onSunTouchCancel, this);
    }

    update(_dt: number): void {
        if (!this.sunRigidBody || !this.sunNode || !this.sunNode.parent) {
            return;
        }
        const parent = this.sunNode.parent;
        const curW = parent.convertToWorldSpaceAR(this.sunNode.getPosition());

        if (this.isDraggingSun) {
            const targetW = parent.convertToWorldSpaceAR(this.sunDragTargetLocal);
            const delta = cc.v2(targetW.x - curW.x, targetW.y - curW.y);
            const distance = delta.mag();
            const velocity = this.sunRigidBody.linearVelocity;

            const dir = distance > 0.001 ? delta.normalize() : cc.v2(0, 0);
            const softFollowForce = delta.mul(this.dragSoftFollowScale);
            const ropeStretch = Math.max(0, distance - this.dragRopeLength);

            let force: cc.Vec2;
            if (ropeStretch > 0.001) {
                const ropeForce = dir.mul(ropeStretch * this.dragForceScale);
                const alongRopeSpeed = velocity.dot(dir);
                const ropeDampingForce = dir.mul(-alongRopeSpeed * this.dragRopeDamping);
                const freeDampingForce = velocity.mul(-this.dragFreeDamping);
                force = softFollowForce.add(ropeForce).add(ropeDampingForce).add(freeDampingForce);
            } else {
                const alongRopeSpeed = velocity.dot(dir);
                const softDampingForce = dir.mul(-alongRopeSpeed * (this.dragRopeDamping * 0.32));
                const freeDampingForce = velocity.mul(-this.dragFreeDamping);
                force = softFollowForce.add(softDampingForce).add(freeDampingForce);
            }

            const forceApplyWorld = this.sunNode.convertToWorldSpaceAR(this.sunGrabLocal);
            this.sunRigidBody.applyForce(force, forceApplyWorld, true);

            const newVelocity = this.sunRigidBody.linearVelocity;
            const speed = newVelocity.mag();
            if (speed > this.maxDragSpeed) {
                this.sunRigidBody.linearVelocity = newVelocity.mul(this.maxDragSpeed / speed);
            }
            return;
        }

        if (!this.floatEnabled) {
            return;
        }
        if (this.floatPauseWhenItemTouchesSunBody && this.sunBodyItemContactCount > 0) {
            return;
        }
        const floatTargetLocal = cc.v2(this.floatTargetLocalX, this.floatTargetLocalY);
        const floatTargetW = parent.convertToWorldSpaceAR(floatTargetLocal);
        const floatDelta = cc.v2(floatTargetW.x - curW.x, floatTargetW.y - curW.y);
        const vel = this.sunRigidBody.linearVelocity;
        const k = this.floatForceScale;
        const d = this.floatVelocityDamping;
        const yMul = this.floatYSpringMul;
        const yDamp = this.floatVerticalVelocityDampMul;
        const floatForce = cc.v2(
            floatDelta.x * k - vel.x * d,
            floatDelta.y * k * yMul - vel.y * d * yDamp
        );
        this.sunRigidBody.applyForce(floatForce, curW, true);
    }

    private worldToSunParentLocal(worldPos: cc.Vec2): cc.Vec2 {
        const parent = this.sunNode.parent;
        if (!parent) {
            return this.sunDragTargetLocal;
        }
        return parent.convertToNodeSpaceAR(worldPos);
    }

    private onSunBodyItemContactDelta(delta: number): void {
        if (typeof delta !== "number" || !isFinite(delta)) {
            return;
        }
        this.sunBodyItemContactCount += delta;
        if (this.sunBodyItemContactCount < 0) {
            this.sunBodyItemContactCount = 0;
        }
    }

    private onSunTouchStart(event: cc.Event.EventTouch): void {
        if (!this.sunRigidBody || !this.sunNode) {
            return;
        }
        event.stopPropagation();
        this.isDraggingSun = true;
        this.sunDragTouchId = event.getID();
        if (this.sunNode.parent) {
            this.sunNode.setSiblingIndex(this.sunNode.parent.childrenCount - 1);
        }
        const worldPos = event.getLocation();
        this.sunDragTargetLocal = this.worldToSunParentLocal(worldPos);
        this.sunGrabLocal = this.sunNode.convertToNodeSpaceAR(worldPos);

        this.prevSunGravityScale = this.sunRigidBody.gravityScale;
        this.prevSunLinearDamping = this.sunRigidBody.linearDamping;
        this.prevSunAngularDamping = this.sunRigidBody.angularDamping;
        this.prevSunFixedRotation = this.sunRigidBody.fixedRotation;

        this.sunRigidBody.type = cc.RigidBodyType.Dynamic;
        this.sunRigidBody.gravityScale = 0;
        this.sunRigidBody.linearDamping = this.dragLinearDamping;
        this.sunRigidBody.fixedRotation = false;
    }

    private onSunTouchMove(event: cc.Event.EventTouch): void {
        if (!this.isDraggingSun || this.sunDragTouchId !== event.getID()) {
            return;
        }
        event.stopPropagation();
        const worldPos = event.getLocation();
        this.sunDragTargetLocal = this.worldToSunParentLocal(worldPos);
    }

    private onSunTouchEnd(event: cc.Event.EventTouch): void {
        if (this.sunDragTouchId !== event.getID()) {
            return;
        }
        event.stopPropagation();
        this.endSunDrag();
    }

    private onSunTouchCancel(event: cc.Event.EventTouch): void {
        if (this.sunDragTouchId !== event.getID()) {
            return;
        }
        event.stopPropagation();
        this.endSunDrag();
    }

    private endSunDrag(): void {
        if (!this.isDraggingSun) {
            return;
        }
        this.isDraggingSun = false;
        this.sunDragTouchId = -1;

        if (this.sunRigidBody && this.sunRigidBody.isValid) {
            this.sunRigidBody.gravityScale = this.prevSunGravityScale;
            this.sunRigidBody.linearDamping = this.prevSunLinearDamping;
            this.sunRigidBody.angularDamping = this.prevSunAngularDamping;
            this.sunRigidBody.fixedRotation = this.prevSunFixedRotation;
        }
    }
}
