const {ccclass, property} = cc._decorator;

@ccclass
export default class boomEffects_lv323 extends cc.Component {

    effect() {
        this.node.active = true;
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 1.5);
    }
}
