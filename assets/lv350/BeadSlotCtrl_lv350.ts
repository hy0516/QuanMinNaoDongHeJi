import BeadDraggable_lv350 from "./BeadDraggable_lv350";
import BeadPlateCtrl_lv350 from "./BeadPlateCtrl_lv350";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BeadSlotCtrl_lv350 extends cc.Component {

    @property([cc.Prefab])
    beadPrefabs: cc.Prefab[] = [];

    @property([cc.Integer])
    beadCounts: number[] = [];

    @property(cc.Node)
    slotContainer: cc.Node = null;

    @property(cc.Prefab)
    slotItemPrefab: cc.Prefab = null;

    @property(BeadPlateCtrl_lv350)
    plate: BeadPlateCtrl_lv350 = null;

    @property(cc.Node)
    btnRedesign: cc.Node = null;

    @property(cc.Node)
    btnComplete: cc.Node = null;

    /** 槽位内珠子图标的缩放，1=预制体原尺寸 */
    @property
    slotIconScale: number = 0.6;

    private slotNodes: cc.Node[] = [];
    private counts: number[] = [];
    private totalInitial: number = 0;
    private onAllPlaced: (() => void) | null = null;
    private onComplete: (() => void) | null = null;
    private onRedesign: (() => void) | null = null;

    onLoad() {
        this.counts = (this.beadCounts || []).map((c: any) => (c !== undefined ? c : 0));
        this.totalInitial = this.counts.reduce((a, b) => a + b, 0);
        if (this.slotContainer) {
            this.buildSlots();
        }
        if (this.btnRedesign) {
            this.btnRedesign.active = false;
            this.btnRedesign.on(cc.Node.EventType.TOUCH_END, this._onRedesign, this);
        }
        if (this.btnComplete) {
            this.btnComplete.active = false;
            this.btnComplete.on(cc.Node.EventType.TOUCH_END, this._onComplete, this);
        }
    }

    init(callbacks: { onAllPlaced?: () => void; onComplete?: () => void; onRedesign?: () => void }) {
        this.onAllPlaced = callbacks.onAllPlaced || null;
        this.onComplete = callbacks.onComplete || null;
        this.onRedesign = callbacks.onRedesign || null;
    }

    private buildSlots() {
        this.slotContainer.removeAllChildren();
        this.slotNodes = [];
        const layout = this.slotContainer.getComponent(cc.Layout);
        if (!layout) {
            const l = this.slotContainer.addComponent(cc.Layout);
            l.type = cc.Layout.Type.HORIZONTAL;
            l.spacingX = 20;
            l.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        }

        for (let i = 0; i < this.beadPrefabs.length; i++) {
            const prefab = this.beadPrefabs[i];
            if (!prefab) continue;
            const count = this.counts[i] || 0;
            const slot = this.createSlotItem(i, prefab, count);
            this.slotContainer.addChild(slot);
            this.slotNodes.push(slot);
        }
    }

    private createSlotItem(typeId: number, prefab: cc.Prefab, count: number): cc.Node {
        const root = new cc.Node("Slot_" + typeId);
        root.setContentSize(100, 120);

        const icon = cc.instantiate(prefab);
        icon.name = "icon";
        icon.setPosition(0, 15);
        icon.scale = this.slotIconScale;
        root.addChild(icon);

        const labelNode = new cc.Node("count");
        const label = labelNode.addComponent(cc.Label);
        label.string = "" + count;
        label.fontSize = 36;
        labelNode.color = new cc.Color(115, 78, 64);
        //labelNode.opacity = 207;
        label.enableBold = true;
        labelNode.setPosition(0, -80);
        root.addChild(labelNode);

        const draggable = icon.addComponent(BeadDraggable_lv350);
        draggable.typeId = typeId;
        draggable.diameter = this.getDiameter(prefab);
        draggable.slotCtrl = this;
        draggable.plate = this.plate;

        (root as any)._slotTypeId = typeId;
        (root as any)._icon = icon;
        (root as any)._countLabel = label;
        (root as any)._count = count;
        return root;
    }

    private getDiameter(prefab: cc.Prefab): number {
        const node = cc.instantiate(prefab);
        const w = node.width || 100;
        const h = node.height || 100;
        node.destroy();
        return Math.max(w, h) || 100;
    }

    takeBead(typeId: number): boolean {
        if (typeId < 0 || typeId >= this.counts.length) return false;
        if (this.counts[typeId] <= 0) return false;
        this.counts[typeId]--;
        this.updateSlotDisplay(typeId);
        return true;
    }

    returnBead(typeId: number) {
        if (typeId >= 0 && typeId < this.counts.length) {
            this.counts[typeId]++;
            this.updateSlotDisplay(typeId);
        }
    }

    private updateSlotDisplay(typeId: number) {
        const slot = this.slotNodes[typeId];
        if (!slot) return;
        const icon = (slot as any)._icon as cc.Node;
        const label = (slot as any)._countLabel as cc.Label;
        const count = this.counts[typeId];
        const labelNode = label ? label.node : null;
        if (icon) icon.active = count > 0;
        if (labelNode) {
            labelNode.active = count > 0;
            if (count > 0) label.string = "" + count;
        }
        (slot as any)._count = count;
    }

    checkAllPlaced() {
        const total = this.counts.reduce((a, b) => a + b, 0);
        if (total === 0 && this.plate && this.plate.beadCount === this.totalInitial) {
            if (this.btnRedesign) this.btnRedesign.active = true;
            if (this.btnComplete) this.btnComplete.active = true;
            this.onAllPlaced && this.onAllPlaced();
        }
    }

    private _onRedesign(e: cc.Event.EventTouch) {
        e.stopPropagation();
        this.onRedesign && this.onRedesign();
    }

    private _onComplete(e: cc.Event.EventTouch) {
        e.stopPropagation();
        this.onComplete && this.onComplete();
    }

    reset() {
        this.counts = (this.beadCounts || []).map((c: any) => (c !== undefined ? c : 0));
        this.totalInitial = this.counts.reduce((a, b) => a + b, 0);
        for (let i = 0; i < this.counts.length; i++) this.updateSlotDisplay(i);
        if (this.btnRedesign) this.btnRedesign.active = false;
        if (this.btnComplete) this.btnComplete.active = false;
    }
}
