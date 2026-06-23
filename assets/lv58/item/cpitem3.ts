import basecpitem from "./basecpitem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class cpitem3 extends basecpitem {

    // data = null
    isset = false;
    rewardnum = 0;
    index = 0;
    protected onLoad(): void {
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public RandomNumber(minNumber: number, maxNumber: number): number {
        return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }

    showHongquan() {
        this.node.getChildByName("hongquan").active = true;
    }

    oninit(data: number, index: number, isrewardnum: boolean) {
        // this.data = data
        this.index = index;
        this.isset = false;
        this.node.getChildByName("hongquan").active = false;
        var lab_me = this.node.getChildByName("lab_me").getComponent(cc.Label)
        lab_me.node.active = true;
        if (isrewardnum) {
            lab_me.string = data.toString() + "币";
            lab_me.node.color = cc.color(0, 0, 0, 255);
            lab_me.enableBold = true;
            lab_me.getComponent(cc.LabelOutline).width = 0;
        } else {
            lab_me.string = data.toString()
        }
    }

}
