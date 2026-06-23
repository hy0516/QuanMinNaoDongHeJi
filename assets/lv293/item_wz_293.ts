import AudioManager from "../script/common/AudioManager";



const { ccclass, property } = cc._decorator;

@ccclass
export default class item_wz_293 extends cc.Component {

    data = null
    id = 0;
    shunxu = 0;
    lab = ""
    isset = false;
    issucc = false;

    protected onLoad(): void {
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    setid(id: number) {
        if (this.isset) return
        this.isset = true;
        // GameData.wenziList = GameData.wenziList + this.lab;
            AudioManager.playEffect("键盘点击声_214")
            console.log("id:",id);
        this.node.getChildByName("jp" + id.toString()).active = true;
        this.node.getChildByName("icon").active = false;
    }

    recive(id: number) {
        // if (this.isset) return
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
        this.node.getChildByName("lab").getComponent(cc.Label).string = list[2];
    }

}
