const { ccclass } = cc._decorator;

/** 单块拼图：主图 Sprite + Graphics 四边描边（未与正确邻接的一侧显示） */
@ccclass
export default class PuzzlePiece449 extends cc.Component {
    private _sprite: cc.Sprite = null;
    private _g: cc.Graphics = null;
    private _hw = 0;
    private _hh = 0;
    private _pieceIdxLabel: cc.Label = null;

    public correctId = 0;

    init(sprite: cc.Sprite, g: cc.Graphics, w: number, h: number) {
        this._sprite = sprite;
        this._g = g;
        this._hw = w * 0.5;
        this._hh = h * 0.5;
    }

    /**
     * 调试：在块中心显示原图编号；关闭时移除子节点。
     * （由 pt_lv449 的 debugShowPieceIndex 控制，上线前关掉）
     */
    applyPieceIndexDebug(enabled: boolean, w: number, h: number, pieceId: number) {
        if (!enabled) {
            if (this._pieceIdxLabel && this._pieceIdxLabel.node && this._pieceIdxLabel.node.isValid) {
                this._pieceIdxLabel.node.destroy();
            }
            this._pieceIdxLabel = null;
            return;
        }
        if (!this._pieceIdxLabel || !this._pieceIdxLabel.node || !this._pieceIdxLabel.node.isValid) {
            const n = new cc.Node("piece_idx_dbg");
            n.parent = this.node;
            n.zIndex = 20;
            const lab = n.addComponent(cc.Label);
            lab.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            lab.verticalAlign = cc.Label.VerticalAlign.CENTER;
            lab.node.color = cc.Color.WHITE;
            const outline = n.addComponent(cc.LabelOutline);
            outline.color = cc.Color.BLACK;
            outline.width = 2;
            this._pieceIdxLabel = lab;
        }
        const fs = Math.max(16, Math.floor(Math.min(w, h) * 0.32));
        this._pieceIdxLabel.fontSize = fs;
        this._pieceIdxLabel.lineHeight = fs + 4;
        this._pieceIdxLabel.string = String(pieceId);
    }

    /** 交换格子后同步调试数字 */
    syncPieceIndexLabel(pieceId: number) {
        if (this._pieceIdxLabel && this._pieceIdxLabel.node && this._pieceIdxLabel.node.isValid) {
            this._pieceIdxLabel.string = String(pieceId);
        }
    }

    setSpriteFrame(sf: cc.SpriteFrame) {
        if (!this._sprite) return;
        const w = this._hw * 2;
        const h = this._hh * 2;
        this._sprite.type = cc.Sprite.Type.SIMPLE;
        this._sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this._sprite.trim = false;
        this._sprite.spriteFrame = sf;
        this.applyDisplaySize(w, h);
        // 部分版本在下一帧还会用图块像素重算一次，延迟再锁一次尺寸
        this.scheduleOnce(() => this.applyDisplaySize(w, h), 0);
    }

    /** 强制按格子宽高渲染（与纹理切片像素无关） */
    private applyDisplaySize(w: number, h: number) {
        if (!this._sprite || !this._sprite.isValid) return;
        this._sprite.type = cc.Sprite.Type.SIMPLE;
        this._sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this._sprite.trim = false;
        const n = this._sprite.node;
        n.setContentSize(w, h);
        n.width = w;
        n.height = h;
    }

    /**
     * @param roundTL…roundBL 是否为连通块外轮廓凸角（圆角），与 pt_lv449 蒙版一致
     */
    refreshBorders(
        showL: boolean,
        showR: boolean,
        showT: boolean,
        showB: boolean,
        roundTL: boolean,
        roundTR: boolean,
        roundBR: boolean,
        roundBL: boolean
    ) {
        const g = this._g;
        if (!g) return;
        g.clear();
        g.lineWidth = 5;
        g.strokeColor = cc.color(255, 255, 255, 255);
        g.lineJoin = cc.Graphics.LineJoin.ROUND;
        g.lineCap = cc.Graphics.LineCap.ROUND;

        const x0 = -this._hw;
        const x1 = this._hw;
        const y0 = -this._hh;
        const y1 = this._hh;
        const w = x1 - x0;
        const h = y1 - y0;
        // 与 pt_lv449 圆角蒙版同一外轮廓（同 rr），描边中心线贴可见图边界；线宽一半在格内一半在格外，未拼合时可能略压缝
        const rr = Math.min(22, Math.min(this._hw, this._hh) * 0.28);

        let rTL = roundTL ? rr : 0;
        let rTR = roundTR ? rr : 0;
        let rBR = roundBR ? rr : 0;
        let rBL = roundBL ? rr : 0;
        const maxR = Math.min(w, h) * 0.5;
        rTL = Math.min(rTL, maxR);
        rTR = Math.min(rTR, maxR);
        rBR = Math.min(rBR, maxR);
        rBL = Math.min(rBL, maxR);
        if (rBL + rBR > w) {
            const s = w / (rBL + rBR);
            rBL *= s;
            rBR *= s;
        }
        if (rTL + rTR > w) {
            const s = w / (rTL + rTR);
            rTL *= s;
            rTR *= s;
        }
        if (rBL + rTL > h) {
            const s = h / (rBL + rTL);
            rBL *= s;
            rTL *= s;
        }
        if (rBR + rTR > h) {
            const s = h / (rBR + rTR);
            rBR *= s;
            rTR *= s;
        }

        const rrUniform = Math.min(rTL, rTR, rBR, rBL);

        if (showL && showR && showT && showB && roundTL && roundTR && roundBR && roundBL) {
            g.roundRect(x0, y0, w, h, rrUniform);
            g.stroke();
            return;
        }

        if (showB) {
            g.moveTo(x0 + rBL, y0);
            g.lineTo(x1 - rBR, y0);
            g.stroke();
        }
        if (rBR > 0) {
            g.moveTo(x1 - rBR, y0);
            g.arc(x1 - rBR, y0 + rBR, rBR, -Math.PI / 2, 0, true);
            g.stroke();
        }
        if (showR) {
            g.moveTo(x1, y0 + rBR);
            g.lineTo(x1, y1 - rTR);
            g.stroke();
        }
        if (rTR > 0) {
            g.moveTo(x1, y1 - rTR);
            g.arc(x1 - rTR, y1 - rTR, rTR, 0, Math.PI / 2, true);
            g.stroke();
        }
        if (showT) {
            g.moveTo(x1 - rTR, y1);
            g.lineTo(x0 + rTL, y1);
            g.stroke();
        }
        if (rTL > 0) {
            g.moveTo(x0 + rTL, y1);
            g.arc(x0 + rTL, y1 - rTL, rTL, Math.PI / 2, Math.PI, true);
            g.stroke();
        }
        if (showL) {
            g.moveTo(x0, y1 - rTL);
            g.lineTo(x0, y0 + rBL);
            g.stroke();
        }
        if (rBL > 0) {
            g.moveTo(x0, y0 + rBL);
            g.arc(x0 + rBL, y0 + rBL, rBL, Math.PI, Math.PI * 1.5, true);
            g.stroke();
        }
    }
}
