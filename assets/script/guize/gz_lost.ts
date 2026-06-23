
import AssetManager from "../common/AssetManager";
import AudioManager from "../common/AudioManager";
import GameData from "../common/GameData";
import VideoManager from "../common/VideoManager";




const { ccclass, property } = cc._decorator;

@ccclass
export default class gz_lost extends cc.Component {

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.common.GZLOST);
        VideoManager.getInstance().showInsert();
    }

    fanhui() {
        GameData.onDele();
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            var HallnNode = cc.instantiate(hall);
            HallnNode.parent = cc.find("Canvas");
            GameData.getMap = [];
            this.node.destroy();
        })
    }
    restart() {
        GameData.onDele();
        AudioManager.playEffect(AudioManager.common.BUTTON);
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var HallnNode = cc.instantiate(name);
            HallnNode.parent = cc.find("Canvas");
            GameData.getMap = [];
            this.node.destroy();
        })
    }


}
