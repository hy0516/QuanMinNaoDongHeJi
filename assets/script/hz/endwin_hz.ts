import AssetManager from "../common/AssetManager";
import AudioManager from "../common/AudioManager";
import GameData from "../common/GameData";
import VideoManager from "../common/VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class endwin_hz extends cc.Component {
    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endwin_hz);
        GameData.PauseGame = true;
        VideoManager.getInstance().showInsert();
       
    }

    fanhui() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            var HallNode = cc.instantiate(hall);
            HallNode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            GameData.PauseGame = false;
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
