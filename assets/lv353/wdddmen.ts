import GameData from "../script/common/GameData";
import wddd_lv1 from "./wddd_lv1";




const { ccclass, property } = cc._decorator;

@ccclass
export default class wdddmen extends cc.Component {

    itemId;
    curlv;
    movespeed = 2;
    isrun = false;
    data: { type: number, value: string, main: cc.Node, poitype: string }
    value: string

    public onLoad(): void {
        this.isrun = true;

    }
    public init(data: { type: number, value: string, main: cc.Node, poitype: string }) {
        this.data = data
        this.value = data.value;
        this.node.getChildByName("177").getChildByName(data.value).active = true;
        this.node.scaleX = 0.7;
        this.node.scaleY = 0.7;
    }


    update(dt: number): void {
        if (GameData.PauseGame == true) return;
        if (!this.isrun) return;

    //    console.log(this.node.y);
        
        if (this.node.y <= 120 && !this.data.main.getComponent(wddd_lv1).isSingleRoleMode) {
            this.data.main.getComponent(wddd_lv1).pauseRoleMove();
        }
      
        if (this.data.poitype == "左") {
            this.node.x -= 0.2;
        } else {
            this.node.x += 0.2;
        }
        // if (this.node.scaleX <= 1.2) {
            this.node.scaleX += 0.0015;
            this.node.scaleY += 0.0015;
        // }
        this.node.y -= this.movespeed;     
    }

    // moveEndHandler() {
        // this.data.value = "18";
    // }
    restart(){
        this.node.getChildByName("177").getChildByName(this.data.value).active = true;
    }

    qkqhandler() {
        this.node.getChildByName("177").getChildByName(this.data.value).active = false;
        this.node.getChildByName("177").getChildByName("17").active = true;
        this.data.value = "17";
    }
    protected onDestroy(): void {
        this.data.main.getComponent(wddd_lv1).startRoleMove();
    }


}
