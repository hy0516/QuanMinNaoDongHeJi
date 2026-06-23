import Lv318Controller from "./Lv318Controller";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SandboxInput extends cc.Component {

    @property(Lv318Controller)
    controller: Lv318Controller = null;

    private _draggingCamera: boolean = false;

    public setDraggingCamera(flag: boolean) {
        this._draggingCamera = flag;
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        if (this._draggingCamera) {
            return;
        }
        // 屏幕坐标转世界坐标
        const camera = cc.Camera.findCamera(this.node);
        const screenPos = event.getLocation();
        let worldPos: cc.Vec3;
        if (camera) {
            // getScreenToWorldPoint 需要 Vec3 参数
            worldPos = camera.getScreenToWorldPoint(cc.v3(screenPos.x, screenPos.y, 0));
        } else {
            // 无相机时的备用方案
            const nodePos = this.node.convertToNodeSpaceAR(cc.v3(screenPos.x, screenPos.y, 0));
            worldPos = this.node.convertToWorldSpaceAR(nodePos);
        }
        if (this.controller) {
            this.controller.onSandboxClicked(cc.v2(worldPos.x, worldPos.y));
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
}

