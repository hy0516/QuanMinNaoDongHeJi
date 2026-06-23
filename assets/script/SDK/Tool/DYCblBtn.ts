const { ccclass, property } = cc._decorator;

@ccclass
export default class DYCblBtn extends cc.Component {


    tt: any = window['ks'];

    @property(cc.Node)
    cbl: cc.Node = null;
    protected onLoad(): void {
        // if (!JYksGameAPI.SideBarUsable) {
        //     setTimeout(() => {
        //         this.node.destroy();
        //     }, 0.1);
        // }
    }

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.openCblNode, this);
        if (cc.sys.localStorage.getItem("getCblrew") == 1) {
            this.node.active = false;
            return;
        }
    }
    openCblNode() {
        this.cbl.active = true;
    }

    onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_END, this.openCblNode, this);
    }
}
