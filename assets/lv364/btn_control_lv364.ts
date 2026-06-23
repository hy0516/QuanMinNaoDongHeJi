
const {ccclass, property} = cc._decorator;

@ccclass
export default class btn_control_lv364 extends cc.Component {


    @property
    moveDuration = 0.8; // 单程时间

    protected onLoad(): void {
        this.btnAnimation();
    }

    btnAnimation(){
        const startPos = this.node.position.clone();
        if (this.node.name == "btn_right") {
            cc.tween(this.node)
                .to(this.moveDuration, {x: startPos.x + 30})
                .to(this.moveDuration, {x: startPos.x})
                .union()
                .repeatForever()
                .start()
        }
        else if (this.node.name == "btn_left") {
            cc.tween(this.node)
                .to(this.moveDuration, {x: startPos.x - 30})
                .to(this.moveDuration, {x: startPos.x})
                .union()
                .repeatForever()
                .start()
        }
    }
}
