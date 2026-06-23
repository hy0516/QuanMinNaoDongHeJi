import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import colliderHandler from "../script/qg/colliderHandler";


const { ccclass, property } = cc._decorator;
enum music {
    win = "win_qg1",
    lost = "lost_qg1",
    qg = "qg1",
    qiu = "qiu_qg1",
    diaoluo = "dl_qg1",
    gou = "finishjq"
}

@ccclass
export default class qglv_4 extends BaseGame {
    @property(cc.Graphics)
    graphics: cc.Graphics = null;

    @property(cc.Node)
    textureRoot: cc.Node = null;
    @property(cc.Node)
    private tittle: cc.Node = null;
    @property(cc.Node)
    private timeText: cc.Node = null;
    @property(cc.Node)
    private qiu: cc.Node = null;
    @property(cc.Node)
    private meixi: cc.Node = null;
    @property(cc.Node)
    private gou: cc.Node = null;
    @property(cc.Node)
    private jdText: cc.Node = null;
    @property(cc.Node)
    private tipsPanel: cc.Node = null;

    private textures: cc.Vec2[] = [];
    private startPoint: cc.Vec2 = null;
    private endPoint: cc.Vec2 = null;

    private curLevelId = 1;

    private pic: cc.Node;
    private di: cc.Node;
    private rect: cc.Node;

    private rectnode
    private qiuStartPoi

    startpos;



    onLoad() {

        cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.5)
            )
            .start()
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        this.graphics.node.x = -cc.visibleRect.width / 2;
        this.graphics.node.y = -cc.visibleRect.height / 2;
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        this.Initlevel()
        this.qiuStartPoi = this.qiu.position;
        this.di.active = true;
        this.pic.active = true;
        this.rect.active = true;
        this.IntBtn();

    }
    IntBtn() {
        this.offBtn();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    offBtn() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    Initlevel() {
        if (this.di && this.pic && this.rect) {
            this.di.active = false;
            this.pic.active = false;
            this.rect.active = false;
            this.qiu.position = this.qiuStartPoi;
            this.curLevelId++
        }
        this.jdText.getComponent(cc.Label).string = this.curLevelId.toString();
        this.rect = this.node.parent.getChildByName("rect" + (this.curLevelId).toString());
        this.pic = this.node.parent.getChildByName("shi" + (this.curLevelId).toString());
        this.di = this.node.parent.getChildByName("di").getChildByName("di" + (this.curLevelId).toString());
        this.textureRoot = this.node.parent.getChildByName("textureRoot" + (this.curLevelId).toString());
        this.rectnode = this.textureRoot.getChildByName("rectnode");

        this.di.active = true;
        this.pic.active = true;
        this.rect.active = true;
        if (this.curLevelId != 1) {
            this.rect.x = 0.2;
            this.pic.x = 0.2
        }
        this.textures = this.rect.getComponent(cc.PolygonCollider).points;

    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "tiaoguo":
                if (GameData.PauseGame) {
                    common.ShowTipsView("请在当前雕像切割前跳过");
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = true;
                    this.node.cleanup();
                    this.onwin();
                })
                break;
            case "fanhui":
                GameData.PauseGame = false;
                this.node.cleanup();
                this.node.parent.destroy();
                GameData.onDele();
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = cc.find("Canvas");
                            VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "btn_tips":
                var handlers = () => {
                    this.tipsPanel.active = true;
                    if (this.curLevelId != 1) this.tipsPanel.getChildByName("tishi" + (this.curLevelId - 1).toString()).active = false;
                    this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = true;
                    this.node.parent.getChildByName("UiNode").getChildByName("btn_tips").getChildByName("guangg").active = false;
                    this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "x":
                this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = false;
                this.tipsPanel.active = false;
                break;
        }
    }

    isshowVideo = false;
    onwin() {
        var fun = () => {
            if (this.curLevelId >= 3) {
                this.node.cleanup();
                this.node.parent.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                return
            }
            this.isGameOver = false;
            this.gou.scale = 0;
            this.qiu.getComponent(cc.RigidBody).angularVelocity = 0;
            this.IntBtn();
            this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("待机动作", -1);
            this.node.parent.getChildByName("men").getComponent(colliderHandler).iswin = false;
            this.node.parent.getChildByName("mask0").destroyAllChildren();
            this.node.parent.getChildByName("mask1").destroyAllChildren();
            this.Initlevel();
            GameData.PauseGame = false;
        }

        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect(music.gou)
        }, 0.9)
    }

    onTouchStart(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.startPoint = e.getLocation();
        this.startpos = this.node.parent.convertToNodeSpaceAR(this.startPoint);
    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.graphics.clear();
        let p = e.getLocation();

        // var endpos = this.node.parent.convertToNodeSpaceAR(p);
        this.graphics.strokeColor = cc.color(0, 0, 0, 255);
        this.drawLineOfDashes(this.graphics, this.startPoint, p, true, 40, 10);
    }
    onTouchEnd(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.graphics.clear();
        this.endPoint = e.getLocation();
        AudioManager.playEffect(music.qg);
        // var endpos = this.node.parent.convertToNodeSpaceAR(this.endPoint);
        this.useLineCutPolygon(this.startPoint, this.endPoint);
    }

    drawLineOfDashes(g: cc.Graphics, from: cc.Vec2, to: cc.Vec2, stroke: boolean = true, length: number = 5, interval: number = 4): void {
        if (g) {
            let off = to.sub(from);
            let dir = off.normalize();
            let dis = off.mag();
            let delta = dir.mul(length + interval);
            let delta1 = dir.mul(length);
            let n = Math.floor(dis / (length + interval));
            for (let i = 0; i < n; ++i) {
                let start = from.add(delta.mul(i));
                g.moveTo(start.x, start.y);
                let end = start.add(delta1);
                g.lineTo(end.x, end.y);
            }
            let start1 = from.add(delta.mul(n));
            g.moveTo(start1.x, start1.y);
            if (length < dis - (length + interval) * n) {
                let end = start1.add(delta1);
                g.lineTo(end.x, end.y);
            } else {
                g.lineTo(to.x, to.y);
            }
            if (stroke) g.stroke();
        }
    }
    private useLineCutPolygon(p0: cc.Vec2, p1: cc.Vec2, isWorld = true) {
        let pa = this.textureRoot.convertToNodeSpaceAR(p0);
        let pb = this.textureRoot.convertToNodeSpaceAR(p1);
        let polygons = this.lineCutPolygon(pa, pb, this.textures);
        if (polygons.length <= 0 || polygons.length >= 3) return;
        this.splitTexture(polygons);
    }
    public splitPolygonByLine(l0: cc.Vec2, l1: cc.Vec2, polygon: cc.Vec2[], useDichotomy = false) {
        let result: number[] = [];
        for (let i = polygon.length - 1; i >= 0; i--) {
            let p0 = polygon[i],
                p1 = i == 0 ? polygon[polygon.length - 1] : polygon[i - 1];
            let [n, p] = this.lineCrossPoint(p0, p1, l0, l1);
            if (n == -1) continue;
            polygon.splice(i, -1, p);
            result.push(i + 1);
        }
        return result;
    }

    private splitTexture(polygons: cc.Vec2[][]) {
        var p0
        var p1;
        var pstart
        var pend
        // console.log(this.CheckpointInPolygonRect(cc.v2(this.rectnode.x, this.rectnode.y), polygons[0]))
        if (this.CheckpointInPolygonRect(cc.v2(this.rectnode.x, this.rectnode.y), polygons[0])) {
            p0 = polygons[0];
            p1 = polygons[1];
            pend = p1;
            pstart = p0;
        } else {
            p0 = polygons[1];
            p1 = polygons[0];
            pstart = p0;
            pend = p1;
        }
        this.pic.active = false;
        let shi1 = new cc.Node();
        let shi2 = new cc.Node();
        let mask0 = new cc.Node();
        let mask1 = new cc.Node();
        shi1.addComponent(cc.Sprite).spriteFrame = this.pic.getComponent(cc.Sprite).spriteFrame;
        shi2.addComponent(cc.Sprite).spriteFrame = this.pic.getComponent(cc.Sprite).spriteFrame;
        var m0 = mask0.addComponent(cc.Mask);
        var m1 = mask1.addComponent(cc.Mask);

        let rigid = m1.addComponent(cc.RigidBody);
        let phy = m1.addComponent(cc.PhysicsPolygonCollider);
        phy.points = pend;
        rigid.gravityScale = 5;

        this.node.parent.getChildByName("mask1").position = this.pic.position;
        this.node.parent.getChildByName("mask0").position = this.pic.position;
        shi1.parent = mask0;
        mask0.parent = this.node.parent.getChildByName("mask0");
        mask0.setPosition(new cc.Vec2(0, 0));
        shi1.setPosition(new cc.Vec2(0, 0));

        shi2.parent = mask1;
        mask1.parent = this.node.parent.getChildByName("mask1");
        mask1.setPosition(new cc.Vec2(0, 0));
        shi2.setPosition(new cc.Vec2(0, 0));

        var g0 = m0["_graphics"];
        var g1 = m1["_graphics"];
        g0.clear();
        g0.moveTo(pstart[pstart.length - 1].x, pstart[pstart.length - 1].y);
        for (let i = 0; i < pstart.length; i++) {
            g0.lineTo(pstart[i].x, pstart[i].y);
        }
        g0.close();
        g0.stroke();
        g0.fill();

        g1.clear();
        g1.moveTo(pend[pend.length - 1].x, pend[pend.length - 1].y);
        for (let i = 0; i < pend.length; i++) {
            g1.lineTo(pend[i].x, pend[i].y);
        }
        g1.close();
        g1.stroke();
        g1.fill();
        AudioManager.playEffect(music.diaoluo);
        GameData.PauseGame = true;
        this.offBtn();
        this.scheduleOnce(() => {
            this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("右脚踢球", 1);
        }, 1.3)
        this.scheduleOnce(() => {
            this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("待机动作", -1);
        }, 2)
        this.scheduleOnce(() => {
            AudioManager.playEffect(music.qiu);
            this.qiu.getComponent(cc.RigidBody).applyLinearImpulse(new cc.Vec2(1000, 0), new cc.Vec2(this.qiu.position.x, this.qiu.position.y), true);
            this.qiu.getComponent(cc.RigidBody).angularVelocity = 570;
            this.qiu.getComponent(cc.RigidBody).angularDamping = 1;
        }, 1.6)
        this.ShowTime();
    }
    ShowTime() {
        this.timeText.parent.active = true;
        let time = 6;
        // 开始倒计时
        this.schedule(() => {
            if (time == 0) {
                this.timeText.parent.active = false;
                // this.move = false;
                if (this.isGameOver) {
                    AudioManager.playEffect(music.win);
                    this.onwin();
                } else {
                    AudioManager.playEffect(music.lost);
                    this.onlost()
                }
            }
            else {
                if (this.isGameOver) {
                    AudioManager.playEffect(music.win);
                    this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("庆祝动作", -1);
                }
                time--
                this.timeText.getComponent(cc.Label).string = time.toString();

            }
        }, 1, 6, 0.01);
    }

    onlost() {
        this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("失败动作", 2);
        this.scheduleOnce(() => {
            GameData.PauseGame = false
            this.node.parent.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 2)
    }


    /**检测点与多边形相交 */
    CheckpointInPolygonRect(pos, a: cc.Vec2[]) {
        // var pos1 = this.node.parent.getChildByName("rect").convertToNodeSpaceAR(pos);
        return cc.Intersection.pointInPolygon(pos, a);
    }

    //求两条线段的交点
    //返回值：[n,p] n:0相交，1在共有点，-1不相交  p:交点
    public lineCrossPoint(p1: cc.Vec2, p2: cc.Vec2, q1: cc.Vec2, q2: cc.Vec2): [number, cc.Vec2] {
        let a = p1, b = p2, c = q1, d = q2;
        let s1, s2, s3, s4;
        let d1, d2, d3, d4;
        let p: cc.Vec2 = new cc.Vec2(0, 0);
        d1 = this.dblcmp(s1 = this.ab_cross_ac(a, b, c), 0);
        d2 = this.dblcmp(s2 = this.ab_cross_ac(a, b, d), 0);
        d3 = this.dblcmp(s3 = this.ab_cross_ac(c, d, a), 0);
        d4 = this.dblcmp(s4 = this.ab_cross_ac(c, d, b), 0);

        //如果规范相交则求交点
        if ((d1 ^ d2) == -2 && (d3 ^ d4) == -2) {
            p.x = (c.x * s2 - d.x * s1) / (s2 - s1);
            p.y = (c.y * s2 - d.y * s1) / (s2 - s1);
            return [0, p];
        }

        //如果不规范相交
        if (d1 == 0 && this.point_on_line(c, a, b) <= 0) {
            p = c;
            return [1, p];
        }
        if (d2 == 0 && this.point_on_line(d, a, b) <= 0) {
            p = d;
            return [1, p];
        }
        if (d3 == 0 && this.point_on_line(a, c, d) <= 0) {
            p = a;
            return [1, p];
        }
        if (d4 == 0 && this.point_on_line(b, c, d) <= 0) {
            p = b;
            return [1, p];
        }
        //如果不相交
        return [-1, null];
    }

    //求a点是不是在线段上，>0不在，=0与端点重合，<0在。
    public point_on_line(a, p1, p2) {
        return this.dblcmp(this.dot(p1.x - a.x, p1.y - a.y, p2.x - a.x, p2.y - a.y), 0);
    }
    //点发出的右射线和线段的关系
    // 返回值: -1:不相交, 0:相交, 1:点在线段上
    public rayPointToLine(point: cc.Vec2, linePA: cc.Vec2, linePB: cc.Vec2) {
        // 定义最小和最大的X Y轴值  
        let minX = Math.min(linePA.x, linePB.x);
        let maxX = Math.max(linePA.x, linePB.x);
        let minY = Math.min(linePA.y, linePB.y);
        let maxY = Math.max(linePA.y, linePB.y);

        // 射线与边无交点的其他情况  
        if (point.y < minY || point.y > maxY || point.x > maxX) {
            return -1;
        }

        // 剩下的情况, 计算射线与边所在的直线的交点的横坐标  
        let x0 = linePA.x + ((linePB.x - linePA.x) / (linePB.y - linePA.y)) * (point.y - linePA.y);
        if (x0 > point.x) {
            return 0;
        }
        if (x0 == point.x) {
            return 1;
        }
        return -1;
    }

    //点和多边形的关系
    //返回值: -1:在多边形外部, 0:在多边形内部, 1:在多边形边线内, 2:跟多边形某个顶点重合
    public relationPointToPolygon(point: cc.Vec2, polygon: cc.Vec2[]) {
        let count = 0;
        for (let i = 0; i < polygon.length; ++i) {
            if (polygon[i].equals(point)) {
                return 2;
            }

            let pa = polygon[i];
            let pb = polygon[0];
            if (i < polygon.length - 1) {
                pb = polygon[i + 1];
            }

            let re = this.rayPointToLine(point, pa, pb);
            if (re == 1) {
                return 1;
            }
            if (re == 0) {
                count++;
            }
        }
        if (count % 2 == 0) {
            return -1;
        }
        return 0;
    }

    //线段对多边形进行切割
    //返回多边形数组
    //如果没有被切割，返回空数组
    public lineCutPolygon(pa: cc.Vec2, pb: cc.Vec2, polygon: cc.Vec2[]) {
        let ret: Array<cc.Vec2[]> = [];

        let points: cc.Vec2[] = [];
        let pointIndex: number[] = [];

        //将所有的点以及交点组成一个点序列
        for (let i = 0; i < polygon.length; ++i) {
            points.push(polygon[i]);

            let a = polygon[i];
            let b = polygon[0];
            if (i < polygon.length - 1) b = polygon[i + 1];

            let c = this.lineCrossPoint(pa, pb, a, b);
            if (c[0] == 0) {
                pointIndex.push(points.length);
                points.push(c[1] as cc.Vec2);
            }
            else if (c[0] > 0) {
                if ((c[1] as cc.Vec2).equals(a)) {
                    pointIndex.push(points.length - 1);
                }
                else {
                    pointIndex.push(points.length);
                }
            }
        }
        if (pointIndex.length > 1) {
            //准备从第一个交点开始拆，先弄清楚第一个交点是由外穿内，还是内穿外
            let cp0 = points[pointIndex[0]];
            let cp1 = points[pointIndex[1]];

            let r = this.relationPointToPolygon(new cc.Vec2((cp0.x + cp1.x) / 2, (cp0.y + cp1.y) / 2), polygon);
            let inPolygon: boolean = r >= 0;

            // if(pointIndex.length > 2 && cc.pDistance(cp0,cp1) > cc.pDistance(cp0,points[pointIndex[pointIndex.length-1]])) {
            if (pointIndex.length > 2 && cp0.sub(cp1).mag() > cp0.sub(points[pointIndex[pointIndex.length - 1]]).mag()) {
                cp1 = points[pointIndex[pointIndex.length - 1]];
                r = this.relationPointToPolygon(new cc.Vec2((cp0.x + cp1.x) / 2, (cp0.y + cp1.y) / 2), polygon);
                inPolygon = r < 0;
            }

            let firstInPolygon = inPolygon;//起始点是从外面穿到里面

            let index = 0;
            let startIndex = pointIndex[index];
            let oldPoints = [];
            let newPoints = [];
            let count = 0;

            oldPoints.push(points[startIndex]);
            if (inPolygon) {
                newPoints.push(points[startIndex]);
            }

            index++;
            count++;
            startIndex++;

            while (count < points.length) {
                if (startIndex == points.length) startIndex = 0;
                let p = points[startIndex];
                if (index >= 0 && startIndex == pointIndex[index]) {
                    //又是一个交点
                    index++;
                    if (index >= pointIndex.length) index = 0;
                    if (inPolygon) {
                        //原来是在多边形内部
                        //产生了新的多边形
                        newPoints.push(p);
                        ret.push(newPoints);
                        newPoints = [];
                    }
                    else {
                        //开始新的多边形
                        newPoints = [];
                        newPoints.push(p);
                    }
                    oldPoints.push(p);
                    inPolygon = !inPolygon;
                }
                else {
                    //普通的点
                    if (inPolygon) {
                        newPoints.push(p);
                    }
                    else {
                        oldPoints.push(p);
                    }
                }
                startIndex++;
                count++;
            }
            if (inPolygon) {
                if (!firstInPolygon && newPoints.length > 1) {
                    //如果起始点是从里面穿出去，到这里跟起始点形成闭包
                    newPoints.push(points[pointIndex[0]]);
                    ret.push(newPoints);
                }
                else {
                    //结束了，但是现在的状态是穿在多边形内部
                    //把newPoints里面的回复到主多边形中
                    for (let i = 0; i < newPoints.length; ++i) {
                        oldPoints.push(newPoints[i]);
                    }
                }

            }

            ret.push(oldPoints);
        }
        return ret;
    }
    private ab_cross_ac(a, b, c) //ab与ac的叉积
    {
        return this.cross(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y);
    }
    private dot(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }
    private cross(x1, y1, x2, y2) {
        return x1 * y2 - x2 * y1;
    }
    private dblcmp(a: number, b: number) {
        if (Math.abs(a - b) <= 0.000001) return 0;
        if (a > b) return 1;
        else return -1;
    }

}
