import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
// import Platforms from "../script/SDK_ov/Platforms";
import jzhz_lv208 from "./jzhz_lv208";







const { ccclass, property } = cc._decorator;



@ccclass
export default class zc_lost extends cc.Component {



    // @property(cc.Node)
    // main:cc.Node = null;


    protected onEnable(): void {
        VideoManager.getInstance().showInsert();
        AudioManager.playEffect(AudioManager.audioName.endlost);
        VideoManager.getInstance().showInsert();
    }

    // fanhui() {
    //     AudioManager.playEffect(AudioManager.common.BUTTON);
    //     cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
    //         var HallnNode = cc.instantiate(hall);
    //         HallnNode.parent = cc.find("Canvas");
    //         GameData.onDele();
    //         this.node.destroy();
    //     })
    // }



    fuhuo(even: cc.Event.EventTouch) {

        even.currentTarget.enable = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);



        VideoManager.getInstance().showVideo(() => {

            // AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            // var HallnNode = cc.instantiate(name);
            // HallnNode.parent = cc.find("Canvas");
            // GameData.onDele();


            let main = this.node.parent.getChildByName("jzhz_lv208").getComponent(jzhz_lv208);

            console.log(main.hpList);

            main.hpList.forEach(hp => {
                hp.active = true;
            })

            main.lostHp = 0;


            this.node.destroy();
            // });
        }, () => {
            console.log("广告调用失败！");
        })
    }










    restart(even: cc.Event.EventTouch) {
        even.currentTarget.enable = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var HallnNode = cc.instantiate(name);
            HallnNode.parent = cc.find("Canvas");
            GameData.onDele();
            //GameData.PauseGame = false;
            this.node.destroy();
        });
    }


}
