import AudioManager from "../script/common/AudioManager";
import mask_polygon480 from "./mask_polygon480";

const { ccclass, property } = cc._decorator;
const EV_GUIDE_DISMISS = "Lv480GuideDismiss";
/** 预设层级：拉链与 mask 同级；pic1 为 mask 子节点——mask/pic2 对齐由 y 联动 + pic1 本地补偿完成 */
@ccclass
export default class lalian_drag480 extends cc.Component {

    @property(cc.Node)
    maskNode: cc.Node = null;

    @property(cc.Node)
    pic1Node: cc.Node = null;

    @property(cc.Node)
    pic2Node: cc.Node = null;

    private readonly MIN_Y = -350;
    private readonly MAX_Y = 220;

    private isDragging = false;
    private startLalianY = 0;
    private startMaskY = 0;
    private startPic1Y = 0;
    private thresholdReached = false;

    protected onLoad(): void {
        this.startLalianY = this.node.y;
        if (this.maskNode) this.startMaskY = this.maskNode.y;
        if (this.pic1Node) this.startPic1Y = this.pic1Node.y;

        // 注册到 Canvas 根节点，绕过父节点 hitTest
        const canvas = cc.find("Canvas");
        if (canvas) {
            canvas.on(cc.Node.EventType.TOUCH_START, this.onGlobalTouchStart, this);
            canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onGlobalTouchMove, this);
            canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    protected onDestroy(): void {
        const canvas = cc.find("Canvas");
        if (canvas) {
            canvas.off(cc.Node.EventType.TOUCH_START, this.onGlobalTouchStart, this);
            canvas.off(cc.Node.EventType.TOUCH_MOVE, this.onGlobalTouchMove, this);
            canvas.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            canvas.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    private isTouchingLalian(worldPos: cc.Vec2): boolean {
        const localPos = this.node.parent.convertToNodeSpaceAR(worldPos);
        const box = this.node.getBoundingBox();
        return box.contains(localPos);
    }

    private onGlobalTouchStart(ev: cc.Event.EventTouch): void {
        if (!this.isTouchingLalian(ev.getLocation())) return;
        this.isDragging = true;
        this.node.dispatchEvent(new cc.Event.EventCustom(EV_GUIDE_DISMISS, true));
        AudioManager.playEffect("拉链");
    }

    private onGlobalTouchMove(ev: cc.Event.EventTouch): void {
        if (!this.isDragging) return;
        const delta = ev.getDelta();
        let newY = this.node.y + delta.y;
        newY = Math.max(this.MIN_Y, Math.min(newY, this.MAX_Y));
        this.node.y = newY;

        const deltaY = newY - this.startLalianY;
        if (this.maskNode) {
            this.maskNode.y = this.startMaskY + deltaY;
            if (this.pic1Node) {
                this.pic1Node.y = this.startPic1Y - deltaY;
            }
            const polyMask = this.maskNode.getComponent(mask_polygon480);
            if (polyMask) {
                 polyMask.redrawStencilFromCollider();
            }
        }
    }

    private onTouchEnd(ev: cc.Event.EventTouch): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        if (this.node.y <= -350 && !this.thresholdReached) {
            this.thresholdReached = true;
            this.onThresholdReached();
        }
    }

    private onThresholdReached(): void {
      
        if (this.maskNode) this.maskNode.active = false;
        this.node.active = false;

        if (this.pic2Node) {
            this.pic2Node.active = true;
            for (let i = 0; i < this.pic2Node.children.length; i++) {
                this.pic2Node.children[i].active = true;
            }
        }

        this.node.dispatchEvent(new cc.Event.EventCustom("CheckWuTai", true));
    }
}
