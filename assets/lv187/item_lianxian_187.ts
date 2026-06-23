


const { ccclass, property } = cc._decorator;

@ccclass
export default class item_lianxian_187 extends cc.Component {

    data = null
    id = 0;
    shunxu = 0;
    lab = ""
    isset = false;
    issucc = false;

    protected onLoad(): void {
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    setid() {
        if (this.isset) return
        this.isset = true;
    }

    recive(id: number) {
        this.isset = false;
    }

    oninit(data: any) {
        var list = data.split(":");
        if (list.length > 1) {
            this.node.getChildByName("icon" + data[0]).active = true;
            this.isset = true;
        } else {
            this.node.getChildByName("icon" + data).active = true;
        }
    }

}
