
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";




const { ccclass, property } = cc._decorator;

@ccclass
export default class endlostlv250 extends cc.Component {

    protected onLoad(): void {
       // AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
        GameData.PauseGame = true;
        VideoManager.getInstance().showInsert();
        
    }

    fanhui() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            var HallnNode = cc.instantiate(hall);
            HallnNode.parent = cc.find("Canvas");
            GameData.onDele();
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
    fangQiGk()
    {
        
        cc.director.resume();
        cc.audioEngine.resumeAll();
        cc.audioEngine.stopAll();
        // AudioManager.stopEffect();
        // AudioManager.stopEffect2();
        if(this.node.parent.getComponent(BaseGame))
        {
            this.node.parent.getComponent(BaseGame).fanhui();
        }else
        {
            this.node.parent.parent.getComponent(BaseGame).fanhui();
        }
        
        // this.node.parent.cleanup(); 
        // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
        //     var UINode = cc.instantiate(UI);
        //     UINode.parent = cc.find("Canvas");
        //     VideoManager.getInstance().showBaoXiang();
        //     GameData.onDele();
        //     this.node.parent.destroy();
        // })
    }
    nextLevel()
    {
        this.node.parent.parent.getComponent(BaseGame).nextPre();
       // this.node.destroy();
    }
}
