import basecpitem from "./basecpitem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class cpitem2 extends basecpitem {
    // data = null
    isset = false;
    rewardnum = 0;
    gailv: number[] = [100, 200, 300, 400, 500, 700, 990, 1000];
    index = 0;
    protected onLoad(): void {
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public RandomNumber(minNumber: number, maxNumber: number): number {
        return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }

    getJinE(): number {
        var jine = this.RandomNumber(1, 1000);
        var num = 0;
        if (jine <= this.gailv[0]) {
            num = 50;
        } else if (jine <= this.gailv[1]) {
            num = 100;
        } else if (jine <= this.gailv[2]) {
            num = 150;
        } else if (jine <= this.gailv[3]) {
            num = 500;
        } else if (jine <= this.gailv[5]) {
            num = 1000;
        } else if (jine <= this.gailv[6]) {
            num = 10000;
        } else if (jine <= this.gailv[7]) {
            num = 100000;
        } else if (jine <= this.gailv[8]) {
            num = 1000000;
        }
        return num;
    }

    showHongquan() {
        this.node.getChildByName("hongquan").active = true;
    }

    iconindex = 0;
    oninit(data: number, rewardnum: number, isicon?: boolean, isrewardicon?: boolean) {
        this.isset = false;
        this.rewardnum = rewardnum;
        this.node.getChildByName("hongquan").active = false;
        var lab_me = this.node.getChildByName("lab_me").getComponent(cc.Label);
        var lab_bi = this.node.getChildByName("lab_bi").getComponent(cc.Label);
        if (isicon) {
            if (isrewardicon) {
                var num = this.getJinE()
                lab_me.string = num.toString() + "币";
                lab_me.node.active = true;
                lab_bi.node.active = false;
                this.rewardnum = num;
                return
            } else {
                this.iconindex = this.RandomNumber(1, 9)
                this.node.getChildByName("t" + this.iconindex).active = true;
                lab_bi.node.active = false;
                lab_me.node.active = false;
                return
            }

        }
        lab_bi.string = rewardnum.toString() + "币";
        lab_me.string = data.toString();
        if (data == 0) {
            lab_me.node.active = false;
            this.node.getChildByName("jinli").active = true;
        }
    }
    protected onDisable(): void {
        var icon = this.node.getChildByName("t" + this.iconindex)
        if (icon) icon.active = false;
    }

}
