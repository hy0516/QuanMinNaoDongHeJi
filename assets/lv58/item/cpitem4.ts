import basecpitem from "./basecpitem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class cpitem4 extends basecpitem {

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

    oninit(data: number, rewardnum: number) {
        this.isset = false;
        this.rewardnum = rewardnum;
        this.node.getChildByName("hongquan").active = false;
        var lab_me = this.node.getChildByName("lab_me").getComponent(cc.Label);
         var lab_bi = this.node.getChildByName("lab_bi").getComponent(cc.Label);
        if (data == 0) {
            lab_me.node.active = false;
            this.node.getChildByName("fu").active = true;
            // return
        }else{
            lab_me.node.active = true;
            this.node.getChildByName("fu").active = false;
              lab_me.string = data.toString();
        }
       
        lab_bi.string = rewardnum.toString() + "币";
    }

}
