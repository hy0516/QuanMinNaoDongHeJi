import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import {
    ItemType,
    ItemConfig,
    ItemCategory,
    getItemConfig,
    isLv384ItemFreeWithoutVideo,
    isLv384SunGridItemType
} from "./feed_config_384";
import type feed_lv384 from "./feed_lv384";

const { ccclass, property } = cc._decorator;

/**
 * 食物项组件 - 处理物品的拖拽和交互
 * 咕咕嘎嘎喂食 lv384
 */
@ccclass
export default class feedItem_lv384 extends cc.Component {
    private static readonly activeWaterScale = 1.08;

    @property(cc.Sprite)
    itemSprite: cc.Sprite = null;  // 物品图片

    @property(cc.Node)
    lockNode: cc.Node = null;      // 锁定图标

    // 物品类型
    private itemType: ItemType = ItemType.None;

    // 是否已解锁
    private isUnlocked: boolean = true;

    // 主游戏引用
    private mainGame: feed_lv384 = null;

    /** 按下时触点（世界坐标），用于区分点击与滑动列表 */
    private pressStartWorld: cc.Vec2 | null = null;

    /** 抬起与按下位移小于该值才视为点击（像素，平方比较） */
    private static readonly tapMoveThresholdPx = 22;
    private isWaterActive: boolean = false;

    onLoad() {
        // 捕获阶段监听：子节点 itemSprite 常为命中目标，冒泡阶段父节点可能收不到触摸
        const cap = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, cap);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, cap);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, cap);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, cap);
    }

    onDestroy() {
        const cap = true;
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, cap);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, cap);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, cap);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, cap);
    }

    /**
     * 设置物品类型
     */
    public setItemType(type: ItemType): void {
        this.itemType = type;
        this.updateVisual();
    }

    /**
     * 获取物品类型
     */
    public getItemType(): ItemType {
        return this.itemType;
    }

    /**
     * 设置主游戏引用
     */
    public setMainGame(game: feed_lv384): void {
        this.mainGame = game;
    }

    public setWaterActiveVisual(active: boolean): void {
        this.isWaterActive = active;
        cc.Tween.stopAllByTarget(this.node);
        this.node.scale = active ? feedItem_lv384.activeWaterScale : 1;
    }

    /**
     * 更新视觉表现
     */
    private updateVisual(): void {
        const config = getItemConfig(this.itemType);
        if (!config) return;

        // 加载图标
        this.loadItemSprite(config.iconPath);

        // 更新锁定状态
        this.updateLockState(config);
    }

    /**
     * 加载物品图片
     */
    private loadItemSprite(path: string): void {
        AssetManager.load(
            GameData.curGameStyle,
            path,
            cc.SpriteFrame,
            null,
            (pic: cc.SpriteFrame) => {

                // 检查节点和组件是否仍然有效
                if (this.node && this.node.isValid && this.itemSprite && this.itemSprite.isValid) {
                    this.itemSprite.spriteFrame = pic as cc.SpriteFrame;
                }
            }
        );
   
    }

    /**
     * 更新锁定状态
     */
    private updateLockState(config: ItemConfig): void {
        // 整蛊太阳格子：除火/水/肥皂外需激励视频解锁（已解锁写入 GameData）
        if (isLv384SunGridItemType(this.itemType)) {
            const free = isLv384ItemFreeWithoutVideo(this.itemType);
            const unlocked = free || GameData.lv384IsGridItemUnlocked(this.itemType);
            this.isUnlocked = unlocked;
            if (this.lockNode) {
                this.lockNode.active = !unlocked;
            }
            return;
        }
        // 道具和特殊道具默认锁定，需要看广告解锁
        if (config.category === ItemCategory.Tool || config.category === ItemCategory.Special) {
            this.isUnlocked = false;
            if (this.lockNode) this.lockNode.active = true;
        } else {
            this.isUnlocked = true;
            if (this.lockNode) this.lockNode.active = false;
        }
    }

    /**
     * 解锁物品
     */
    public unlockItem(): void {
        if (isLv384SunGridItemType(this.itemType) && !isLv384ItemFreeWithoutVideo(this.itemType)) {
            GameData.lv384SetGridItemUnlocked(this.itemType);
        }
        this.isUnlocked = true;
        if (this.lockNode) this.lockNode.active = false;
        if (this.itemSprite) {
            const normalMaterial = cc.Material.getBuiltinMaterial('2d-sprite');
            if (normalMaterial) {
                this.itemSprite.setMaterial(0, normalMaterial);
            }
        }
    }

    /**
     * 触摸开始 - 仅记录触点，生成在抬起时处理，避免滑动 ScrollView 误触
     */
    private onTouchStart(event: cc.Event.EventTouch): void {
        if (GameData.PauseGame) return;
        const loc = event.getLocation();
        this.pressStartWorld = cc.v2(loc.x, loc.y);
    }

    /**
     * 触摸移动 - 格子不需要拖动
     */
    private onTouchMove(_event: cc.Event.EventTouch): void {
        // 格子不处理移动，只有物理物品可以拖动
    }

    /**
     * 触摸结束 - 判定为点击后再生成物理物品
     */
    private onTouchEnd(event: cc.Event.EventTouch): void {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (GameData.PauseGame) {
            this.pressStartWorld = null;
            return;
        }
        if (!this.pressStartWorld) return;

        const end = event.getLocation();
        const dx = end.x - this.pressStartWorld.x;
        const dy = end.y - this.pressStartWorld.y;
        const th = feedItem_lv384.tapMoveThresholdPx;
        this.pressStartWorld = null;
        if (dx * dx + dy * dy > th * th) {
            return;
        }

        if (!this.isUnlocked) {
            this.showAdToUnlock();
            return;
        }

        const config = getItemConfig(this.itemType);
        if (!config) return;

        if (this.mainGame) {
            this.mainGame.onGridItemClick(this.itemType);
            const idleScale = this.isWaterActive ? feedItem_lv384.activeWaterScale : 1;
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .to(0.08, { scale: idleScale + 0.06 })
                .to(0.12, { scale: idleScale })
                .start();
        }
    }

    /**
     * 触摸取消
     */
    private onTouchCancel(_event: cc.Event.EventTouch): void {
        this.pressStartWorld = null;
    }

    /**
     * 返回原始位置 - 不再使用
     */
    public returnToOriginalPosition(): void {
        // 格子固定不动，不需要返回
    }

    /**
     * 显示广告解锁
     */
    private showAdToUnlock(): void {
        VideoManager.getInstance().showVideo(
            () => {
                this.unlockItem();
            },
            () => {
                // 未看完或失败：保持锁定
            }
        );
    }
}
