const { ccclass, property } = cc._decorator;

@ccclass
export default class light_lv316 extends cc.Component {
    // 正确定义可选择多个Node的数组属性
    @property({
        type: [cc.Node],
        displayName: "灯节点组"
    })
    lightNode: cc.Node[] = [];


    // 爆炸效果
    light() {
        this.lightNode.forEach((node) => {
            node.getChildByName('sd').active = true;
        });
        this.scheduleOnce(() => {
            this.lightNode.forEach((node) => {
                node.getComponent(cc.BoxCollider).tag = 0;
                node.opacity = 0;
            });
            this.node.getComponent(cc.BoxCollider).tag = 0;
            this.node.opacity = 0;
        }, 1);
    }
}