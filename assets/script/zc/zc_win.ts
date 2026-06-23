
import AssetManager from "../common/AssetManager";
import AudioManager from "../common/AudioManager";
import GameData from "../common/GameData";
import levelConfig from "../common/levelConfig";
import VideoManager from "../common/VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_win extends cc.Component {

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.audioName.endwin);
        VideoManager.getInstance().showInsert();
        VideoManager.getInstance().report("endwin_zc", { name: GameData.curGameName });
     
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

    restart(even: cc.Event.EventTouch) {
        even.currentTarget.enable = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var HallnNode = cc.instantiate(name);
            HallnNode.parent = cc.find("Canvas");
            GameData.onDele();
            GameData.PauseGame = false;
            this.node.destroy();
        })
    }

    nextLevel() {
        GameData.nextlevel();
        this.node.destroy();
    }



}
