import SandboxInput from "./SandboxInput";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {

    @property(cc.Node)
    sandboxArea: cc.Node = null;

    @property(cc.Rect)
    cameraBounds: cc.Rect = new cc.Rect(-800, -450, 1600, 900);
    // cameraBounds 参数说明：
    // new cc.Rect(x, y, width, height)
    // - x: 相机可移动区域左下角的 x 坐标（-800 = 向左最多移动 800 像素）
    // - y: 相机可移动区域左下角的 y 坐标（-450 = 向下最多移动 450 像素）
    // - width: 相机可移动区域的宽度（1600 = 总宽度 1600 像素）
    // - height: 相机可移动区域的高度（900 = 总高度 900 像素）
    // 
    // 实际移动范围：
    // - X 方向：从 -800 到 800（-800 + 1600 = 800）
    // - Y 方向：从 -450 到 450（-450 + 900 = 450）
    // 
    // 如何设置：
    // 1. 根据 SandboxArea 的实际大小来设置
    // 2. 通常设置为：相机初始位置为中心，可移动范围 = 场景大小 - 屏幕大小
    // 3. 例如：场景宽 2000，屏幕宽 720，则 width = 2000 - 720 = 1280

    @property
    dragThreshold: number = 5;   // 超过该距离视为拖动

    @property({ tooltip: "最小缩放" })
    minZoom: number = 0.5;

    @property({ tooltip: "最大缩放" })
    maxZoom: number = 1.5;

    private _dragging: boolean = false;
    private _lastPos: cc.Vec2 = cc.v2();
    private _sandboxInput: SandboxInput = null;
    private _camera: cc.Camera = null;
    private _camNode: cc.Node = null;  // 缓存相机节点，避免每次拖动时重复查找

    onLoad() {
        if (this.sandboxArea) {
            this.sandboxArea.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.sandboxArea.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.sandboxArea.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.sandboxArea.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    start() {
        if (this.sandboxArea) {
            this._sandboxInput = this.sandboxArea.getComponent(SandboxInput);
        }
        
        // 获取相机组件，并确保UI层不受影响
        this._camera = this.node.getComponent(cc.Camera);
        if (!this._camera) {
            this._camera = this.node.getComponentInChildren(cc.Camera);
        }
        
        // 缓存相机节点
        if (this._camera) {
            this._camNode = this._camera.node;
        } else {
            this._camNode = this.node;
            cc.warn("[CameraController] 未找到 Camera 组件，使用当前节点");
        }
    }


    private onTouchStart(event: cc.Event.EventTouch) {
        this._dragging = false;
        this._lastPos = event.getLocation();
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        const curPos = event.getLocation();
        const delta = curPos.sub(this._lastPos);

        if (!this._dragging) {
            if (delta.len() > this.dragThreshold) {
                this._dragging = true;
                if (this._sandboxInput) {
                    this._sandboxInput.setDraggingCamera(true);
                }
            } else {
                this._lastPos = curPos;
                return;
            }
        }

        // 使用缓存的相机节点
        this._camNode.x -= delta.x;
        this._camNode.y -= delta.y;

        // 限制在 cameraBounds 内
        const b = this.cameraBounds;
        this._camNode.x = cc.misc.clampf(this._camNode.x, b.xMin, b.xMax);
        this._camNode.y = cc.misc.clampf(this._camNode.y, b.yMin, b.yMax);

        this._lastPos = curPos;
    }

    private onTouchEnd() {
        if (this._dragging && this._sandboxInput) {
            this._sandboxInput.setDraggingCamera(false);
        }
        this._dragging = false;
    }

    onDestroy() {
        if (this.sandboxArea) {
            this.sandboxArea.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.sandboxArea.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.sandboxArea.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.sandboxArea.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    /** 设置相机缩放比例 (0~1 映射到 minZoom~maxZoom) */
    public setZoom(ratio: number) {
        if (!this._camera) return;
        const zoom = this.minZoom + (this.maxZoom - this.minZoom) * ratio;
        this._camera.zoomRatio = zoom;
    }

    public getZoomRatio(): number {
        if (!this._camera) return 0.5; // 默认中间位置
        return (this._camera.zoomRatio - this.minZoom) / (this.maxZoom - this.minZoom);
    }
}

