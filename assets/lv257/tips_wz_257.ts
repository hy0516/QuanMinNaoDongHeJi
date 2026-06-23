
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import wenzi_config_257 from "./wenzi_config_257";



const { ccclass, property } = cc._decorator;

@ccclass
export default class tips_wz_214 extends cc.Component {
    @property(cc.Node)
    btn_tip: cc.Node = null;

    @property(cc.Node)
    btn_ans: cc.Node = null;

    @property(cc.Node)
    tipslab: cc.Node = null;

    @property(cc.Node)
    anslab: cc.Node = null;

    @property(cc.Node)
    tips: cc.Node = null;


    protected onLoad(): void {
        GameData.PauseGame = true;
        // if (GameData.isShowAns) {
        this.answer();
        VideoManager.getInstance().showInsert();
        // }
    }

    /**
     * 获得提示按钮
     */
    showTips() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // VideoManager.getInstance().showVideo(() => {
        //     for (let i = 0; i < wenzi_config.level_tips.length; i++) {
        //         var tishi = wenzi_config.level_tips[i];
        //         if (GameData.getMap.indexOf(i + 1) == -1) {
        //             this.tipslab.getComponent(cc.Label).string = tishi;
        //             this.btn_tip.active = false;
        //             this.tipslab.active = true;
        //             GameData.tipsNum++;
        //             return
        //         }
        //     }
        // })
    }

    /**
     * 获得答案按钮
     */
    answer() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // if (GameData.tipsNum < 3) {
        //     common.ShowTipsView("需要先点击获取3次提示");
        //     return
        // }
        // VideoManager.getInstance().showVideo(() => {
        this.btn_tip.active = false;
        this.btn_ans.active = false;
        this.tipslab.active = false;
        this.tips.active = true;
        GameData.isShowAns = true;
        // })
    }

    closePanel() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.node.destroy();
        GameData.PauseGame = false;
    }


}
