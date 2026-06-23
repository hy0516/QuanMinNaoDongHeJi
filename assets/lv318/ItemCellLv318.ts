import AudioManager from "../script/common/AudioManager";
import VideoManager from "../script/common/VideoManager";
import { Lv318ItemConfig } from "./Lv318Types";
import Lv318UnlockManager from "./Lv318UnlockManager";

const { ccclass, property } = cc._decorator;

// 已看过广告的道具 id 集合（持久化 key）
const VIDEO_WATCHED_KEY = "lv318_video_watched";

@ccclass
export default class ItemCellLv318 extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    labelName: cc.Label = null;

    @property(cc.Node)
    selectedHighlight: cc.Node = null;

    @property(cc.Node)
    videoNode: cc.Node = null;  // 预制体中名为 video 的子节点

    public itemId: string = null;
    private _clickCallback: (cell: ItemCellLv318) => void = null;
    private _needVideo: boolean = false;

    /** 获取已看过广告的道具 id 集合 */
    private static getWatchedSet(): Set<string> {
        const raw = cc.sys.localStorage.getItem(VIDEO_WATCHED_KEY);
        if (raw) {
            try {
                return new Set(JSON.parse(raw));
            } catch (e) { }
        }
        return new Set();
    }

    /** 标记某道具已看过广告 */
    private static markWatched(itemId: string) {
        const set = ItemCellLv318.getWatchedSet();
        set.add(itemId);
        cc.sys.localStorage.setItem(VIDEO_WATCHED_KEY, JSON.stringify(Array.from(set)));
    }

    /** 检查某道具是否已看过广告 */
    public static hasWatched(itemId: string): boolean {
        return ItemCellLv318.getWatchedSet().has(itemId);
    }

    public init(cfg: Lv318ItemConfig, onClick: (cell: ItemCellLv318) => void) {
        this.itemId = cfg.id;
        this._clickCallback = onClick;
        
        // 检查是否处于全解锁状态
        const isUnlockAllActive = Lv318UnlockManager.isUnlockAllActive();
        
        // 如果处于全解锁状态，跳过广告检查；否则正常检查
        if (isUnlockAllActive) {
            this._needVideo = false;
        } else {
            this._needVideo = cfg.needVideo === true && !ItemCellLv318.hasWatched(cfg.id);
        }

        if (this.labelName) {
            this.labelName.string = cfg.name || cfg.id;
        }
        if (this.icon && cfg.iconSpriteFrame) {
            this.icon.spriteFrame = cfg.iconSpriteFrame;
        }

        // 查找 video 子节点并根据是否需要看广告设置显示
        if (!this.videoNode) {
            this.videoNode = this.node.getChildByName("video");
        }
        if (this.videoNode) {
            this.videoNode.active = this._needVideo;
        }

        this.setSelected(false);

        this.node.on(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }

    public setIcon(spriteFrame: cc.SpriteFrame) {
        if (this.icon && spriteFrame) {
            this.icon.spriteFrame = spriteFrame;
        }
    }

    private onClicked() {
        AudioManager.playEffect('点击', false);

        // 检查是否处于全解锁状态
        const isUnlockAllActive = Lv318UnlockManager.isUnlockAllActive();
        
        // 需要看广告且未看过，且不在全解锁期间
        if (this._needVideo && !isUnlockAllActive) {
            VideoManager.getInstance().showVideo(() => {
                // 广告成功回调
                ItemCellLv318.markWatched(this.itemId);
                this._needVideo = false;
                if (this.videoNode) {
                    this.videoNode.active = false;
                }
                // 看完广告后执行选中
                if (this._clickCallback) {
                    this._clickCallback(this);
                }
            });
            return; // 不立即选中，等广告回调
        }

        if (this._clickCallback) {
            this._clickCallback(this);
        }
    }

    public setSelected(selected: boolean) {
        if (this.selectedHighlight) {
            this.selectedHighlight.active = selected;
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }
}

