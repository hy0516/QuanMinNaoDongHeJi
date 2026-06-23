
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import dycgb_lv452 from "./dycgb_lv452";

const { ccclass, property } = cc._decorator;

/** 失败/复活回调需要的能力（与主关卡脚本解耦） */
export interface ILv452MainForLostPanel {
    restoreForFuhuo(): void;
    lvUpdate(): void;
    node: cc.Node;

}

@ccclass
export default class lostPanel_lv452 extends cc.Component {

    /** 主游戏引用（fuhuo 时调用 lvUpdate） */
    public mainGame: ILv452MainForLostPanel = null;

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.audioName.endlost);
        VideoManager.getInstance().showInsert();
        GameData.reportSettlementEnterLv(false);
    }

    onLoad() {
        this.node.getChildByName("btn_close").on(cc.Node.EventType.TOUCH_END, this.onClose, this);
        this.node.getChildByName("btn_fuhuo").on(cc.Node.EventType.TOUCH_END, this.onFuhuo, this);
        this.node.getChildByName("btn_restart").on(cc.Node.EventType.TOUCH_END, this.onRestart, this);
    }

    onDestroy() {
        const btnClose = this.node.getChildByName("btn_close");
        const btnFuhuo = this.node.getChildByName("btn_fuhuo");
        const btnRestart = this.node.getChildByName("btn_restart");
        if (btnClose) btnClose.off(cc.Node.EventType.TOUCH_END, this.onClose, this);
        if (btnFuhuo) btnFuhuo.off(cc.Node.EventType.TOUCH_END, this.onFuhuo, this);
        if (btnRestart) btnRestart.off(cc.Node.EventType.TOUCH_END, this.onRestart, this);
    }

    /** close：关闭界面和关卡，回到主界面 */
    onClose() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        GameData.reportEnterLvReturnHome();
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            if (err || !hall) {
                return;
            }
            const hallNode = cc.instantiate(hall);
            hallNode.parent = cc.find("Canvas");
            GameData.onDele();
            if (this.mainGame && cc.isValid(this.mainGame.node)) {
                this.mainGame.node.destroy();
            }
        });
    }

    /** fuhuo：看广告，成功回调后恢复当前小关并关闭失败界面 */
    onFuhuo() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        const mainScript = this.node.parent.getComponent(dycgb_lv452);
        mainScript.onRevive();
        this.node.active = false;
    }

    /** restart：整关重新玩 */
    onRestart() {
        // even.currentTarget.enable = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        GameData.reportEnterLvReplay();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var HallnNode = cc.instantiate(name);
            HallnNode.parent = cc.find("Canvas");
            GameData.onDele();
            GameData.PauseGame = false;
            this.node.parent.destroy();
        })
    }
}
