/**
 * 可交互物体标记组件
 * 挂载在可交互的道具上
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class InteractableTag_lv318 extends cc.Component {
    @property
    interactType: string = "default";   // 交互类型标识

    @property
    interactData: string = "";          // 交互数据（JSON 字符串）
}
