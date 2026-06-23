import AudioManager from "../common/AudioManager";
import GameData from "../common/GameData";
import VideoManager from "../common/VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class gz_win extends cc.Component {

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.common.GZWIN);
        VideoManager.getInstance().showInsert();
    }


    fanhui() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        AudioManager.stopEffect()
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            var HallnNode = cc.instantiate(hall);
            HallnNode.parent = cc.find("Canvas");
            GameData.getMap = [];
            this.node.destroy();
        })
    }

    nextLevel() {
        GameData.nextlevel();
        this.node.destroy();
    }
}
