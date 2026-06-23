const { ccclass, property } = cc._decorator;

@ccclass
export default class btn_huxi_480 extends cc.Component {
    @property(cc.Integer)
    sx: number = 1.1;
    @property(cc.Integer)
    sy: number = 1.1;
    @property(cc.Integer)
    ends: number = 1;

    @property(cc.Integer)
    time: number = 0.3;

    protected onLoad(): void {
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to(this.time, { scaleX: this.sx, scaleY: this.sy })
                    .to(this.time, { scale: this.ends })
            )
            .start();
    }

    protected onDestroy(): void {
        cc.Tween.stopAllByTarget(this.node);
    }
}