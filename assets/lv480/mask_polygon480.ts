const { ccclass } = cc._decorator;

@ccclass
export default class mask_polygon480 extends cc.Component {

    protected start(): void {
        this.redrawFromCollider();
    }

    /**
     * 位移后若视觉上「裁剪区域」不跟着走，可重画 Graphics 模板（同级平移理论上一帧就够，拖拽若异常可每帧调用）
     */
    public redrawStencilFromCollider(): void {
        this.redrawFromCollider();
    }

    private redrawFromCollider(): void {
        const collider = this.node.getComponent(cc.PolygonCollider);
        if (!collider || !collider.points || collider.points.length < 3) {
            cc.warn("[mask_polygon480] no polygon collider / points");
            return;
        }

        const points = collider.points;

        let mask = this.node.getComponent(cc.Mask);
        if (!mask) {
            mask = this.node.addComponent(cc.Mask);
        }
        mask.enabled = true;
        const MaskTypeAny = cc.Mask.Type as typeof cc.Mask.Type & { GRAPHICS_STENCIL?: number };
        mask.type = MaskTypeAny.GRAPHICS_STENCIL !== undefined ? MaskTypeAny.GRAPHICS_STENCIL : 3;

        const g = mask["_graphics"];
        if (!g) {
            cc.warn("[mask_polygon480] mask has no _graphics");
            return;
        }

        g.clear(true);
        g.lineWidth = 2;
        g.strokeColor = cc.color(255, 255, 255, 255);
        g.fillColor = cc.color(255, 255, 255, 255);

        const p0 = points[0];
        g.moveTo(p0.x, p0.y);
        for (let i = 1; i < points.length; i++) {
            g.lineTo(points[i].x, points[i].y);
        }
        g.close();
        g.fill();
        g.stroke();
    }
}
