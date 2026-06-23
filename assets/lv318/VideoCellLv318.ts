import AudioManager from "../script/common/AudioManager";
import VideoManager from "../script/common/VideoManager";
import Lv318UnlockManager from "./Lv318UnlockManager";
import { Lv318Config } from "./Lv318Types";

const { ccclass, property } = cc._decorator;

/**
 * 看广告解锁全元素按钮组件
 * 使用 videocell_lv318.prefab 预制体
 */
@ccclass
export default class VideoCellLv318 extends cc.Component {

    @property(cc.Label)
    lockLabel: cc.Label = null;

    private _config: Lv318Config = null;
    private _onUnlockAllCallback: () => void = null; // 看满3次后的回调

    onLoad() {
        // 如果没有手动指定 lockLabel，尝试查找
        if (!this.lockLabel) {
            const labelNode = this.node.getChildByName("lockLabel");
            if (labelNode) {
                this.lockLabel = labelNode.getComponent(cc.Label);
            }
        }

        // 绑定点击事件
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }

    /**
     * 初始化
     * @param config 关卡配置
     * @param onUnlockAll 看满3次后的回调
     */
    public init(config: Lv318Config, onUnlockAll?: () => void) {
        this._config = config;
        this._onUnlockAllCallback = onUnlockAll;
        
        // 检查并清理过期的全解锁状态
        Lv318UnlockManager.checkAndClearExpiredUnlock();
        
        this.updateDisplay();
    }

    /**
     * 更新显示（进度文本）
     */
    public updateDisplay() {
        const count = Lv318UnlockManager.getVideoCount();
        if (this.lockLabel) {
            this.lockLabel.string = `${count}/3`;
        }
    }

    /**
     * 点击按钮
     */
    private onClicked() {
        const count = Lv318UnlockManager.getVideoCount();
        if (count >= 3) {
            return; // 已经看满3次
        }

        AudioManager.playEffect('点击', false);

        VideoManager.getInstance().showVideo(() => {
            // 广告成功回调
            const newCount = Lv318UnlockManager.addVideoCount();
            this.updateDisplay();

            if (newCount >= 3) {
                // 看满3次，触发全解锁
                Lv318UnlockManager.activateUnlockAll();
                
                // 隐藏按钮
                this.node.active = false;
                
                // 触发回调，通知外部刷新列表
                if (this._onUnlockAllCallback) {
                    this._onUnlockAllCallback();
                }
            }
        }, () => {
            // 广告失败回调
            console.log("[VideoCellLv318] 广告播放失败");
        });
    }

    /**
     * 检查是否应该显示按钮
     */
    public shouldShow(): boolean {
        if (!this._config) return false;
        return Lv318UnlockManager.shouldShowVideoButton(this._config);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }
}
