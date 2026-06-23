import basecpitem from "./basecpitem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class cpitem1 extends basecpitem {

    // data = null
    isset = false;
    gailv: number[] = [100, 200, 300, 400, 500, 650, 750, 950, 1000];
    rewardnum = 0;
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
            num = 0;
        } else if (jine <= this.gailv[3]) {
            num = 150;
        } else if (jine <= this.gailv[4]) {
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

    iconindex = "";
    oninit(data: any) {
        // this.data = data
        this.isset = false;
        this.node.getChildByName("hongquan").active = false;
        this.node.getChildByName("xiang").active = false;
        this.node.getChildByName("lab_me").active = false;
        var list = data.split(":");
        if (list[0] != "10") {
            this.iconindex = list[0];
            this.node.getChildByName("t" + list[0]).active = true;
        } else {
            var num = this.getJinE();
            if (num == 0) {
                this.rewardnum = 100;
                this.node.getChildByName("xiang").active = true;
            } else {
                this.rewardnum = num;
                this.node.getChildByName("lab_me").active = true;
                this.node.getChildByName("lab_me").getComponent(cc.Label).string = num.toString() + "币";
            }
        }
    }
    protected onDisable(): void {
        var icon = this.node.getChildByName("t" + this.iconindex)
        if (icon) icon.active = false;
    }
}
