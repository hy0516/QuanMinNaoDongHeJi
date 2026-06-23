/**
 * 攻击碰撞体标记组件
 * 挂载在角色的攻击部位（如手臂）上
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class AttackHitbox_lv318 extends cc.Component {
    @property
    damage: number = 10;                // 伤害值

    @property
    knockbackForce: number = 200;       // 击退力
}
