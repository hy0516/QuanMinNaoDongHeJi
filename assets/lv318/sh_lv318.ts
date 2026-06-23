
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";





const { ccclass, property } = cc._decorator;

@ccclass
export default class sh_lv318 extends BaseGame {


   
    onLoad() {
        GameData.PauseGame = false;
        //AudioManager.playMusic("关卡背景_295", true, 0.7);
        AudioManager.stopMusic();
        common.closeSk();
    }



    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallnNode = cc.instantiate(hall);
                    HallnNode.parent = cc.find("Canvas");
                    // this.havefindList = [];
                    this.node.destroy();
                    VideoManager.getInstance().showCustomNativeAd();
                })
                break;
        }
    }
    protected onDestroy(): void {
        common.openSk();
        super.onDestroy();
    }
}

