
import AudioManager from "../common/AudioManager";
import GameData from "../common/GameData";
import VideoManager from "../common/VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class tipsPanel extends cc.Component {


    @property(cc.Node)
    btn_tip: cc.Node = null;

    @property(cc.Node)
    btn_ans: cc.Node = null;

    @property(cc.Node)
    tipslab: cc.Node = null;

    @property(cc.Node)
    anslab: cc.Node = null;

    curtipList: { [key: string]: string } = {}

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
        VideoManager.getInstance().showVideo(() => {
            for (var s in this.curtipList) {
                if (GameData.getMap.indexOf(s) == -1) {
                    var item = this.curtipList[s];
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
        var list = ""
        for (var s in this.curtipList) {
            list = list + this.curtipList[s] + "\n";
        }
        this.btn_tip.active = false;
        this.btn_ans.active = false;
        this.tipslab.active = false;
        this.anslab.getComponent(cc.Label).string = list;
        this.anslab.active = true;
        GameData.isShowAns = true;

    }

    closePanel() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.node.destroy();
        GameData.PauseGame = false;
    }


}
