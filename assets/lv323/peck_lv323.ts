import AudioManager from "../script/common/AudioManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class peck_lv323 extends cc.Component {
    private isdead: boolean = false;
    private other: cc.Collider = null;
    onLoad() {
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
    }
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.tag === 4) {
            AudioManager.playEffect("啄坏果实");
            other.node.getComponent(`bug_lv323`)?.stopTagSwitch();
            this.isdead = true;
        } else if (other.tag === 1) {
            AudioManager.playEffect("萝卜");
            AudioManager.playEffect("撞击");
            other.tag = 0;
            other.node.opacity = 0;
        } else if (other.tag === 2) {
            AudioManager.playEffect("爆炸");
            AudioManager.playEffect("撞击");
            other.node.getComponent(`boom_lv323`).boom();
            other.tag = 0;
            other.node.opacity = 0;
        } else if (other.tag === 3) {
            AudioManager.playEffect("冰冻");
            AudioManager.playEffect("撞击");
            other.tag = 0;
            other.node.opacity = 0;
            other.node.getComponent(`ice_lv323`).ice();
        } else if (other.tag === 5) {
            AudioManager.playEffect("电击");
            other.node.getComponent(`light_lv323`).light();
        } else if (other.tag === 99) {
            AudioManager.playEffect("啄到果实");
            other.node.getComponent(`bug_lv323`).stopTagSwitch();
        } else {
            AudioManager.playEffect("啄空");
        }
    }
    checkdead() {
        return this.isdead;
    }
    // checkCollider() {
    //     return this.other.tag;
    // }
    fuhuo() {
        this.isdead = false;
    }
}