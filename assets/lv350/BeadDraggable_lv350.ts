import AudioManager from "../script/common/AudioManager";
import BeadPlateCtrl_lv350 from "./BeadPlateCtrl_lv350";
import BeadSlotCtrl_lv350 from "./BeadSlotCtrl_lv350";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BeadDraggable_lv350 extends cc.Component {

    typeId: number = 0;
    diameter: number = 100;

    slotCtrl: BeadSlotCtrl_lv350 = null;
    plate: BeadPlateCtrl_lv350 = null;

    private dragNode: cc.Node = null;
    private shadowNode: cc.Node = null;
    private isDragging = false;
    private movingFromPlate = false;
    private movingAngle = 0;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.cleanupDrag();
    }

    private onTouchStart(e: cc.Event.EventTouch) {
        if (!this.slotCtrl || !this.plate) return;
        const canvas = cc.find("Canvas");
        if (!canvas) return;

        const bead = this.plate.getBeadByNode(this.node);
        if (bead) {
            this._startDragFromPlate(bead, e, canvas);
        } else {
            this._startDragFromSlot(e, canvas);
        }
    }

    private _startDragFromPlate(bead: { typeId: number; diameter: number; angle: number }, e: cc.Event.EventTouch, canvas: cc.Node) {
        const prefab = this.slotCtrl.beadPrefabs[bead.typeId];
        if (!prefab) return;
        const data = this.plate.removeBeadForDrag(this.node);
        if (!data) return;
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.isDragging = true;
        this.movingFromPlate = true;
        this.movingAngle = data.angle;
        this.typeId = data.typeId;
        this.diameter = data.diameter;
        this.dragNode = this.node;
        const parent = this.plate.panziNode ? this.plate.panziNode.parent : canvas;
        this.dragNode.parent = parent || canvas;
        const worldPos = e.getLocation();
        const pos = parent ? parent.convertToNodeSpaceAR(worldPos) : canvas.convertToNodeSpaceAR(worldPos);
        this.dragNode.setPosition(pos);
        this.dragNode.zIndex = 999;
        this.shadowNode = cc.instantiate(prefab);
        this.shadowNode.parent = this.plate.panziNode || parent;
        this.shadowNode.opacity = 120;
        this.shadowNode.active = false;
        this.shadowNode.zIndex = 998;
        canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private _startDragFromSlot(e: cc.Event.EventTouch, canvas: cc.Node) {
        const prefab = this.slotCtrl.beadPrefabs[this.typeId];
        if (!prefab) return;
        if (!this.slotCtrl.takeBead(this.typeId)) return;
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.isDragging = true;
        this.movingFromPlate = false;
        // 槽内珠子图标缩放 0→1 动画，模拟新珠子生成
        const targetScale = this.slotCtrl.slotIconScale;
        this.node.scale = 0;
        cc.tween(this.node).to(0.2, { scale: targetScale }).start();

        this.dragNode = cc.instantiate(prefab);
        const parent = this.plate.panziNode ? this.plate.panziNode.parent : canvas;
        this.dragNode.parent = parent || this.node.parent;
        const worldPos = e.getLocation();
        const pos = parent ? parent.convertToNodeSpaceAR(worldPos) : this.node.parent.convertToNodeSpaceAR(worldPos);
        this.dragNode.setPosition(pos);
        this.dragNode.zIndex = 999;
        this.shadowNode = cc.instantiate(prefab);
        this.shadowNode.parent = this.plate.panziNode || parent;
        this.shadowNode.opacity = 120;
        this.shadowNode.active = false;
        this.shadowNode.zIndex = 998;
        canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchMove(e: cc.Event.EventTouch) {
        if (!this.isDragging || !this.dragNode) return;
        const parent = this.dragNode.parent;
        const worldPos = e.getLocation();
        const pos = parent.convertToNodeSpaceAR(worldPos);
        this.dragNode.setPosition(pos);

        if (this.plate.isInsidePlate(worldPos)) {
            const ang = this.plate.worldToAngle(worldPos);
            const placeAng = this.plate.getPlaceAngle(ang, this.diameter);
            const pos2 = this.plate.getPositionAtAngle(placeAng);
            this.shadowNode.setPosition(pos2);
            this.shadowNode.angle = 90 + placeAng;
            this.shadowNode.active = true;
        } else {
            this.shadowNode.active = false;
        }
    }

    private onTouchEnd(e: cc.Event.EventTouch) {
        if (!this.isDragging) return;

        const worldPos = e.getLocation();
        if (this.plate.isInsidePlate(worldPos)) {
            const prefab = this.slotCtrl.beadPrefabs[this.typeId];
            const ang = this.plate.worldToAngle(worldPos);
            const placeAng = this.plate.getPlaceAngle(ang, this.diameter);
            if (this.movingFromPlate && this.dragNode) {
                this.plate.placeBead(this.typeId, this.diameter, prefab, placeAng, this.dragNode);
            } else {
                const node = this.plate.placeBead(this.typeId, this.diameter, prefab, placeAng);
                if (node) {
                    const d = node.addComponent(BeadDraggable_lv350);
                    d.typeId = this.typeId;
                    d.diameter = this.diameter;
                    d.slotCtrl = this.slotCtrl;
                    d.plate = this.plate;
                }
            }
            AudioManager.playEffect("放置珠子_lv350");
            this.slotCtrl.checkAllPlaced();
        } else {
            if (this.movingFromPlate && this.dragNode) {
                this.plate.addBeadBack(this.dragNode, this.typeId, this.diameter, this.movingAngle);
            } else {
                this.slotCtrl.returnBead(this.typeId);
            }
        }

        this.cleanupDrag();
        this.isDragging = false;
        this.movingFromPlate = false;
        if (this.node && cc.isValid(this.node)) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    private cleanupDrag() {
        if (this.dragNode && cc.isValid(this.dragNode) && !this.movingFromPlate) {
            this.dragNode.destroy();
        }
        this.dragNode = null;
        if (this.shadowNode && cc.isValid(this.shadowNode)) {
            this.shadowNode.destroy();
            this.shadowNode = null;
        }
        const canvas = cc.find("Canvas");
        if (canvas) {
            canvas.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            canvas.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            canvas.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }
}
