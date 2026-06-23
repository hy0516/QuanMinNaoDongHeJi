
const { ccclass, property } = cc._decorator;

@ccclass
export default class moveTarget extends cc.Component {

    @property(cc.Node)
    target: cc.Node[] = [];
    // onLoad () {}

    start() {

    }

    movehandler() {
        if (this.target.length > 0) {
            for (let i = 0; i < this.target.length; i++) {
                this.target[i].active = true;
                if (i == this.target.length - 1) this.node.destroy();
            }

        }
    }

    // update (dt) {}
}
