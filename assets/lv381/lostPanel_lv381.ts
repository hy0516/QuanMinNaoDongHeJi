import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

/** 失败/复活回调需要的能力（与 xhwd_lv381 / shj_lv381 双脚本类名解耦） */
export interface ILv381MainForLostPanel {
    restoreForFuhuo(): void;
    lvUpdate(): void;
    node: cc.Node;
}

@ccclass
export default class lostPanel_lv381 extends cc.Component {

    /** 主游戏引用（fuhuo 时调用 lvUpdate） */
    public mainGame: ILv381MainForLostPanel = null;

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.audioName.endlost);
        VideoManager.getInstance().showInsert();
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
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            if (err || !hall) {
                cc.error("[lostPanel_lv381] 加载 Hall 失败", err?.message);
                return;
            }
            const hallNode = cc.instantiate(hall);
            hallNode.parent = cc.find("Canvas");
            GameData.onDele();
            if (this.mainGame && cc.isValid(this.mainGame.node)) {
                this.mainGame.node.destroy();
            }
            // this.node.destroy();
        });
    }

    /** fuhuo：看广告，成功回调后恢复当前小关并关闭失败界面 */
    onFuhuo() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            if (this.mainGame && cc.isValid(this.mainGame.node)) {
                GameData.PauseGame = false;
                this.mainGame.restoreForFuhuo();
                this.mainGame.lvUpdate();
                AudioManager.playMusic("关卡背景");
            }
            this.node.destroy();
        }, () => {
            console.log("[lostPanel_lv381] 广告调用失败");
        });
    }

    /** restart：整关重新玩 */
    onRestart() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[lostPanel_lv381] 加载关卡失败");
                return;
            }
            const gameNode = cc.instantiate(prefab);
            gameNode.parent = cc.find("Canvas");
            GameData.PauseGame = false;
            if (this.mainGame && cc.isValid(this.mainGame.node)) {
                this.mainGame.node.destroy();
            }
            this.node.destroy();
        });
    }
}
