
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import AssetManager from "../script/common/AssetManager";
import VideoManager from "../script/common/VideoManager";
import lianxian_225 from "./lianxian_225";




const { ccclass, property } = cc._decorator;

@ccclass
export default class zc_lost225 extends cc.Component {

    public failedLevel: number = 1;

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.audioName.endlost);
        VideoManager.getInstance().showInsert();
        // setTimeout(() => {
        //     PlatformAdManager.Instance.showCustomNativeAd();
        // }, 1000);
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
        

        const mainGame = this.node.parent.getComponent(lianxian_225);

        mainGame.curlv = this.failedLevel;
        if (mainGame.tipsPanel) mainGame.tipsPanel.active = false;

        mainGame.initLevel();
        
        AudioManager.playMusic("bgm_225");
        this.node.active = false;
    }
}
