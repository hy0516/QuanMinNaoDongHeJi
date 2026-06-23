import AudioManager from "../script/common/AudioManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class item_wz_455 extends cc.Component {

    data = null
    id = 0;
    shunxu = 0;
    lab = ""
    isset = false;
    issucc = false;
    private baseScale = 1;

    protected onLoad(): void {
        this.baseScale = this.node.scale;
    }

    /** 连线选中时：按下再弹回的果冻感 */
    playPressBounce() {
        cc.Tween.stopAllByTarget(this.node);
        this.node.setScale(this.baseScale);
        cc.tween(this.node)
            .to(0.05, { scale: this.baseScale * 0.82 }, { easing: "sineOut" })
            .to(0.14, { scale: this.baseScale * 1.06 }, { easing: "backOut" })
            .to(0.08, { scale: this.baseScale }, { easing: "sineInOut" })
            .start();
    }

    setid(id: number) {
        if (this.isset) return
        this.isset = true;
        AudioManager.playEffect("键盘点击声_455");
        this.node.getChildByName("jp" + id.toString()).active = true;
        this.node.getChildByName("icon").active = false;
        this.playPressBounce();
    }

    recive(id: number) {
        cc.Tween.stopAllByTarget(this.node);
        this.node.setScale(this.baseScale);
        this.isset = false;
        this.node.getChildByName("jp" + id.toString()).active = false;
        this.node.getChildByName("icon").active = true;
    }

    oninit(data: any) {
        this.data = data
        var list = data.split(":");
        this.id = Number(list[0]);
        this.shunxu = Number(list[1]);
        this.lab = list[2]
        this.baseScale = this.node.scale;
        this.node.getChildByName("lab").getComponent(cc.Label).string = list[2];
    }

}
