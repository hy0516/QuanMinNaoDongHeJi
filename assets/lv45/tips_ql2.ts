
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import ql_config2 from "./ql_config2";
import ql_config from "./ql_config2";




const { ccclass, property } = cc._decorator;

@ccclass
export default class tips_ql extends cc.Component {


    @property(cc.Node)
    btn_tip: cc.Node = null;

    @property(cc.Node)
    btn_ans: cc.Node = null;

    @property(cc.Node)
    tipslab: cc.Node = null;

    @property(cc.Node)
    anslab: cc.Node = null;

    protected onLoad(): void {
        GameData.PauseGame = true;
        // if (GameData.isShowAns) {
            this.answer();
        // }
    }

    /**
     * 获得提示按钮
     */
    showTips() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            for (var s = 0; s < ql_config2.level_tips[0].length; s++) {
                if (GameData.getMap.indexOf(s) == -1) {
                    var item = ql_config2.level_tips[0][s];
                    this.tipslab.getComponent(cc.Label).string = item;
                    this.btn_tip.active = false;
                    this.tipslab.active = true;
                    GameData.tipsNum++;
                    return
                }
            }
        })

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
            var list = "";
            for (var s in ql_config2.level_tips[0]) {
                var item = ql_config2.level_tips[0][s];
                list = list + item + "\n";
            }
            this.anslab.getComponent(cc.Label).string = list;
            this.anslab.active = true;
            GameData.isShowAns = true;
        // })

    }

    closePanel() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.node.destroy();
        GameData.PauseGame = false;
    }


}
