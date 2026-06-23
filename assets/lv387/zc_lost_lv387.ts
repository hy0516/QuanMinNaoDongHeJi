import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import Platforms_QuickGame from "../script/SDK/Platforms/QuickGame/Platforms_QuickGame";
import dycgb_lv387 from "./dycgb_lv387";

const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_lost_lv387 extends cc.Component {

    playlost()
    {
        AudioManager.playEffect(AudioManager.audioName.endlost);
        // VideoManager.getInstance().showInsert();
        // Platforms_QuickGame.getInstance().showInsertAd();
    }

    fanhui() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            var HallnNode = cc.instantiate(hall);
            HallnNode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.parent.parent.destroy();
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
            this.node.parent.parent.destroy();
        })
    }
    revive(even: cc.Event.EventTouch)
    {
        const mainScript=this.node.parent.parent.getComponent(dycgb_lv387);
        mainScript.onRevive();
    }


}
