
const { ccclass, property } = cc._decorator;

@ccclass
export default class AnswerLogic_CorrallingFlock356 extends cc.Component {

    @property(cc.Node)
    node_finger: cc.Node = null;

    /** 答案虚线 */
    answerPath: cc.Graphics = null;
    points: cc.Vec2[] = [];


    private lastPos;
    private newPos;

    private answer: string;

    /** 答案画线 */
    onDrawAnswer(answer) {
        this.answer = answer;
    
        if(!this.answerPath){
            let answerNode = new cc.Node();
            this.node.addChild(answerNode, 1);
            this.answerPath = answerNode.addComponent(cc.Graphics);
            this.answerPath.strokeColor = cc.color(0xfc, 0x6b, 0x01, 168);
            this.answerPath.lineWidth = 32;
        }
        this.answerPath.clear();
        
        this.points = [];
        let v2Arr = JSON.parse(answer);
        let pos;
        let bj = cc.find("bj", this.node.parent.parent);
        for (let i = 0; i < v2Arr.length; i++) {
            pos = cc.v2(v2Arr[i].x, v2Arr[i].y);
            // 点的位置是bj下的 转为世界的
            pos = bj.convertToWorldSpaceAR(pos);

            this.points.push(pos);
        }
        cc.Tween.stopAllByTarget(this.node_finger);

        this.newPos = this.points[0];
        this.lastPos = this.newPos;
        this.answerPath.moveTo(this.points[0].x, this.points[0].y);
        this.node_finger.opacity = 255;
        this.node_finger.setPosition(this.newPos);
        this.draw();
    }

    draw() {
        if (this.points.length > 1) {
            // 把第一个点移除
            this.lastPos = this.points[0];
            this.points.splice(0, 1);
            this.newPos = this.points[0];
            let time = this.node_finger.getPosition().sub(this.newPos).mag() / 400;
            cc.tween(this.node_finger).to(time, { position: this.newPos }).call(() => {
                this.drawLineOfDashes(this.answerPath, this.lastPos, this.newPos);
                this.draw();
            }).start();
        }
        else {
            // 画完了 重复一遍
            this.node_finger.opacity = 0;
            this.answerPath.clear();
            this.onDrawAnswer(this.answer);
        }
    }

    // 绘制虚线
    drawLineOfDashes(g: cc.Graphics, from: cc.Vec2, to: cc.Vec2, stroke: boolean = true, length: number = 20, interval: number = 12): void {
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
}
