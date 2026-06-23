import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import lianxian_237 from "./lianxian_237";
import { data_237 } from "./lianxian_config_237";




const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_lost_237 extends cc.Component {

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.audioName.endlost);
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
            this.node.parent.getChildByName(GameData.curGameName).destroy();
            this.node.destroy();

            data_237.isgameing = false;
            
            
        })
    }
    restart(even: cc.Event.EventTouch) {
        even.currentTarget.enable = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // console.log(this.node.parent.getChildByName(GameData.curGameName).getComponent(lianxian_237));
        // this.node.parent.getChildByName(GameData.curGameName).getComponent(lianxian_237).initLevel();
        data_237.isgameing = true;

        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var HallnNode = cc.instantiate(name);
            HallnNode.parent = cc.find("Canvas");
            GameData.onDele();
            GameData.PauseGame = false;
            this.node.destroy();

           
        })
    }


}
