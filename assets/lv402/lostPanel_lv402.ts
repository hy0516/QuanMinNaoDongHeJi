import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass } = cc._decorator;

/** lv402 失败面板与主关卡仅保留 node 引用（用于销毁） */
export interface ILv402MainForLostPanel {
    node: cc.Node;
}

@ccclass
export default class lostPanel_lv402 extends cc.Component {
    public mainGame: ILv402MainForLostPanel = null;

    protected onEnable(): void {
        AudioManager.playEffect(AudioManager.audioName.endlost);
        VideoManager.getInstance().showInsert();
    }

    onLoad() {
        /** 预制体里「看广告进下一关」按钮现为 btn_next，旧版名为 btn_fuhuo */
        const btnNext = this.node.getChildByName("btn_next") || this.node.getChildByName("btn_fuhuo");
        const btnClose = this.node.getChildByName("btn_close");
        const btnRestart = this.node.getChildByName("btn_restart");
        if (btnClose) btnClose.on(cc.Node.EventType.TOUCH_END, this.onClose, this);
        else cc.warn("[lostPanel_lv402] 未找到 btn_close");
        if (btnNext) btnNext.on(cc.Node.EventType.TOUCH_END, this.onWatchAdNextLevel, this);
        else cc.warn("[lostPanel_lv402] 未找到 btn_next / btn_fuhuo");
        if (btnRestart) btnRestart.on(cc.Node.EventType.TOUCH_END, this.onRestart, this);
        else cc.warn("[lostPanel_lv402] 未找到 btn_restart");
    }

    onDestroy() {
        const btnNext =
            this.node && (this.node.getChildByName("btn_next") || this.node.getChildByName("btn_fuhuo"));
        const btnClose = this.node && this.node.getChildByName("btn_close");
        const btnRestart = this.node && this.node.getChildByName("btn_restart");
        if (btnClose) btnClose.off(cc.Node.EventType.TOUCH_END, this.onClose, this);
        if (btnNext) btnNext.off(cc.Node.EventType.TOUCH_END, this.onWatchAdNextLevel, this);
        if (btnRestart) btnRestart.off(cc.Node.EventType.TOUCH_END, this.onRestart, this);
    }

    /** 关闭：回大厅 */
    onClose() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            if (err || !hall) {
                cc.error("[lostPanel_lv402] 加载 Hall 失败", err?.message);
                return;
            }
            const hallNode = cc.instantiate(hall);
            hallNode.parent = cc.find("Canvas");
            GameData.onDele();
            if (this.mainGame && cc.isValid(this.mainGame.node)) {
                this.mainGame.node.destroy();
            }
            if (this.node && cc.isValid(this.node)) {
                this.node.destroy();
            }
        });
    }

    /** 原「复活」按钮：看广告成功后进入下一关 */
    onWatchAdNextLevel() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            if (this.mainGame && cc.isValid(this.mainGame.node)) {
                this.mainGame.node.destroy();
            }
            if (this.node && cc.isValid(this.node)) {
                this.node.destroy();
            }
            GameData.nextlevel();
        }, () => {
            console.log("[lostPanel_lv402] 广告调用失败");
        });
    }

    /** 重玩本关 */
    onRestart() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[lostPanel_lv402] 加载关卡失败");
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
