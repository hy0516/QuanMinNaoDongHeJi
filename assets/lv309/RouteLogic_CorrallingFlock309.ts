import DX_EventType309 from "./DX_EventType309";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RouteLogic_CorrallingFlock309 extends cc.Component {
    touchStartHandler: () => void;
    touchMoveHandler: () => void;
    touchEndHandler: () => void;
    touchCancelHandler: () => void;

    path: cc.Graphics = null;   // 正常画线
    dashedPath: cc.Graphics = null; // 异常画线

    points: cc.Vec2[] = [];

    answerPoints: cc.Vec2[] = [];

    private wallArr: cc.BoxCollider[] = [];

    public m_isCanDraw = true;

    private m_lineLength: number = 0;

    public ske: dragonBones.ArmatureDisplay = null;

    onLoad() {
        let pathNode = new cc.Node();
        this.node.addChild(pathNode, 2);
        this.path = pathNode.addComponent(cc.Graphics);
        this.path.strokeColor = cc.color(252, 107, 1);
        this.path.lineWidth = 20;
        this.path.lineCap = cc.Graphics.LineCap.ROUND;

        let visualNode = new cc.Node();
        this.node.addChild(visualNode, 3);
        this.dashedPath = visualNode.addComponent(cc.Graphics);
        this.dashedPath.strokeColor = cc.color(255, 0, 0, 100);
        this.dashedPath.lineWidth = 20;

        this.touchStartHandler = this.touchStart.bind(this);
        this.touchMoveHandler = this.touchMove.bind(this);
        this.touchEndHandler = this.touchEnd.bind(this);
        this.touchCancelHandler = this.touchCancel.bind(this);
        
        this.addTouch();
    }

    onDestroy() {
        this.removeTouch();
    }

    public setColor(pos: cc.Vec2, color: cc.Color) {
        this.m_isCanDraw = true;
        this.answerPoints = [pos];

        let touchPos = this.node.convertToNodeSpaceAR(pos);
        this.points = [touchPos];
        this.path.moveTo(touchPos.x, touchPos.y);
        this.path.strokeColor = color;

        this.wallArr = this.node.parent.parent.getChildByName("bj").getComponentsInChildren(cc.BoxCollider);
    }

    public Repaint(points: cc.Vec2[]) {
        this.path.clear();
        this.dashedPath.clear();
        if (points.length > 0) {
            // 移动到起点
            this.path.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length - 1; i++) {
                this.path.lineTo(points[i].x, points[i].y);
                this.path.stroke();
            }
        }

    }

    addTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStartHandler);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveHandler);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEndHandler);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancelHandler);
    }

    removeTouch() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchStartHandler);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMoveHandler);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEndHandler);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchCancelHandler);
    }

    touchStart(event: cc.Event.EventTouch) {
        if (!this.m_isCanDraw) { return false; }

        let touchLoc = event.getLocation();
        touchLoc = this.node.convertToNodeSpaceAR(touchLoc);

        this.points.push(cc.v2(touchLoc.x, touchLoc.y));
        this.path.moveTo(touchLoc.x, touchLoc.y);
        return true;
    }

    touchMove(event: cc.Event.EventTouch) {
        if (!this.m_isCanDraw) { return false; }
        let touchLoc = event.getLocation();
        touchLoc = this.node.convertToNodeSpaceAR(touchLoc);
        let lastTouchLoc = this.points[this.points.length - 1];
        if (this.checkIsCanDraw(lastTouchLoc, touchLoc)) {
            let result = cc.director.getPhysicsManager().rayCast(lastTouchLoc, touchLoc, cc.RayCastType.All);
            // 画线长度限制
            if (this.m_lineLength <= 5000 && result.length <= 0) {
                this.dashedPath.clear();
                this.answerPoints.push(event.getLocation());
                this.points.push(cc.v2(touchLoc.x, touchLoc.y));
                this.path.lineTo(touchLoc.x, touchLoc.y);
                this.path.stroke();

                this.m_lineLength += this.getLineLength(lastTouchLoc, touchLoc);
                // let Cusevent = new cc.Event.EventCustom( DX_EventType.CrossTheRiver_OnTouchMove, true);
                // Cusevent.setUserData(event.getLocation());
                // this.node.dispatchEvent(Cusevent);
            }
            else {
                this.dashedPath.clear();
                this.dashedPath.moveTo(lastTouchLoc.x, lastTouchLoc.y);
                this.dashedPath.lineTo(touchLoc.x, touchLoc.y);
                this.dashedPath.stroke();
            }
        }

    }

    // isHitWall(startPos: cc.Vec2, endPos: cc.Vec2) {
    //     for (let i = 0; i < this.wallArr.length; i++) {
    //         // 忽略起点
    //         if (!cc.Intersection.pointInPolygon(this.points[0], this.wallArr[i]["world"].points)) {
    //             if (cc.Intersection.linePolygon(startPos, endPos, this.wallArr[i]["world"].points)) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    touchEnd(event: cc.Event.EventTouch) {
        if (!this.m_isCanDraw) { return false; }
        
        this.createRigibody();
    }

    touchCancel(event: cc.Event.EventTouch) {
        if (!this.m_isCanDraw) { return false; }
        this.createRigibody();
    }

    getLineLength(lastPoint: cc.Vec2, nowPoint: cc.Vec2) {
        return lastPoint.sub(nowPoint).mag();
    }
    checkIsCanDraw(lastPoint: cc.Vec2, nowPoint: cc.Vec2) {
        return lastPoint.sub(nowPoint).mag() >= 60;
    }

    createRigibody() {
        // TODO Debug用采集画线操作 
        // this.logPosRecord(this.answerPoints);
        // 画完一次线就停止绘画 需要等到
        this.m_isCanDraw = false;

        let cusEvent = new cc.Event.EventCustom(DX_EventType309.CorrallingFlock_OnDrawFinish, true);
        cusEvent.setUserData(this.points);
        this.node.dispatchEvent(cusEvent);

        // LevelCtrl_CrossTheRiver.ins.onDrawFinish(this.points);
        this.points = [];
    }

    logPosRecord(posArr: cc.Vec2[]) {
        // 转为bj下的点
        let bj = cc.find("bj", this.node.parent.parent);
        for (let i = 0; i < posArr.length; i++) {
            posArr[i] = bj.convertToNodeSpaceAR(posArr[i]);
        }

        for (let i = 0; i < posArr.length; i++) {
            posArr[i].x = parseFloat(posArr[i].x.toFixed(0));
            posArr[i].y = parseFloat(posArr[i].y.toFixed(0));
        }
        let posRecord = JSON.stringify(posArr);
        while (posRecord.indexOf("\"") != -1) {
            posRecord = posRecord.replace("\"", "#");
        }
        // 去掉无用的z属性
        while (posRecord.indexOf(",#z#:0") != -1) {
            posRecord = posRecord.replace(",#z#:0", "");
        }
        while (posRecord.indexOf("#") != -1) {
            posRecord = posRecord.replace("#", "\\\"");
        }

        console.log(posRecord);
    }

}
