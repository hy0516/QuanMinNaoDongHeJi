import DYTitle from "../SDK/XXL/DYTitle";
import AudioManager from "./AudioManager";
import GameData from "./GameData";
import levelConfig from "./levelConfig";
import smallLoading from "./smallLoading";
import VideoManager from "./VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hotBtn extends cc.Component {


    @property(cc.Integer)
    text: number = 0;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.ontouch, this);
        var tb = levelConfig.new.filter(t => t.lv == this.text)[0];
        if (GameData.getlevelData(tb.name) == undefined) {
            this.node.getChildByName("luxiang").active = true
        } else {
            this.node.getChildByName("luxiang").active = false;
        }
        this.node.active = GameData.isHot;
    }
    ontouch() {
        var tb = levelConfig.new.filter(t => t.lv == this.text)[0];
        var handler = () => {
            var tb = levelConfig.new.filter(t => t.lv == this.text)[0];
            if (tb) GameData.setlevelData(tb.name, false);
            var list = tb.level.split("/");
            VideoManager.getInstance().report("clickhotbtn", { name: tb.name + "1" });
            cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
                let preNode: cc.Node = cc.instantiate(pre);
                preNode.parent = cc.find("Canvas");
                var hall = cc.find("Canvas/Hall");
                if (hall) hall.destroy();
                GameData.curGameName = list[1];
                GameData.curGameStyle = list[0];
                preNode.getComponent(smallLoading).PreName = GameData.curGameStyle + "/" + GameData.curGameName;
                preNode.getComponent(smallLoading).lvConfig = tb;
                preNode.getComponent(smallLoading).onInit();
                VideoManager.getInstance().report("enterLv", { name: tb.name + "0" });
            })
            // DYTitle.text = tb.name;
            // var node = cc.find("Canvas/game/title");
            // node.getComponent(DYTitle).init();
        }
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (this.node.getChildByName("luxiang").active) {
            VideoManager.getInstance().report("clickhotbtn", { name: tb.name + "0" });
            VideoManager.getInstance().showVideo(handler);
        } else {
            handler && handler();
        }
        GameData.curFenLei = "";

    }
    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.ontouch)
    }

}
