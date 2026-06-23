const { ccclass, property } = cc._decorator;

@ccclass
export default class boom_lv316 extends cc.Component {
    // 正确定义可选择多个Node的数组属性
    @property({
        type: [cc.Node], // 指定为cc.Node类型的数组
        displayName: "爆炸节点组" // 可选：编辑器面板中显示的名称，更易读
    })
    boomNode: cc.Node[] = []; // 初始值设为空数组（而非null）
    @property(cc.Node)
    boomEffect: cc.Node = null;
    effect
    protected onLoad(): void {
        this.effect = this.boomEffect.getComponent(`boomEffects_lv316`);
    }
    // 爆炸效果
    boom() {
        this.boomNode.forEach((node) => {
            node.getComponent(cc.BoxCollider).tag = 0;
            node.opacity = 0;
        });
        this.effect.effect();
    }
}