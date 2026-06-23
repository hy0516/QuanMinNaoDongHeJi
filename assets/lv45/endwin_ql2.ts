import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";


const {ccclass, property} = cc._decorator;

@ccclass
export default class endwin_ql2 extends cc.Component {
    protected onLoad(): void {
        AudioManager.playEffect(AudioManager.hzAudioPath+ AudioManager.hz_audio.endwin_hz);
        GameData.PauseGame = true;
    }

    fanhui() {
        AudioManager.playEffect(AudioManager.hzAudioPath+ AudioManager.hz_audio.button_hz);
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
     nextLevel(){
        GameData.nextlevel();
       this.node.destroy();
    }

}
