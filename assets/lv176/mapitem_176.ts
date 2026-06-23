

const { ccclass, property } = cc._decorator;

@ccclass
export default class mapitem_176 extends cc.Component {


    @property(cc.Boolean)
    qiang: Boolean = false;
    @property(cc.Boolean)
    startnode: Boolean = false;
    isuse = false;

    onLoad() {
        if (this.startnode||this.qiang) this.isuse = true;
    }
    useitem() {
        this.node.color = cc.color(247, 63, 63);
        this.isuse = true;
    }
    start() {

    }

    // update (dt) {}
}
