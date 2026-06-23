const { ccclass, property } = cc._decorator;

@ccclass
export default class eyes_lv352 extends cc.Component {
    @property(cc.Node)
    main: cc.Node = null;
    @property
    ratio: number = 0.01;
    pos: cc.Vec3 = cc.Vec3.ZERO;

    protected onLoad(): void {
        this.pos = this.node.position;
    }

    eyeslookat(ccp: cc.Vec3) {
        const localPos = this.node.convertToNodeSpaceAR(ccp);
        const distance = Math.hypot(localPos.x - this.pos.x, localPos.y - this.pos.y);
        
        // 硬编码临界距离200，近距≈1，远距递减
        const decayRatio = 200 / (distance + 200);
        
        this.node.x = localPos.x * this.ratio * decayRatio + this.pos.x;
        this.node.y = localPos.y * this.ratio * decayRatio + this.pos.y;
    }
}
