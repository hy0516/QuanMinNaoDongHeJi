import { Lv318Config, Lv318Category, Lv318ItemConfig } from "./Lv318Types";
import ItemCellLv318 from "./ItemCellLv318";
import VideoCellLv318 from "./VideoCellLv318";
import Lv318UnlockManager from "./Lv318UnlockManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemListViewLv318 extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    itemCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    videoCellPrefab: cc.Prefab = null;

    private _currentCells: ItemCellLv318[] = [];
    private _selectedItemId: string = null;
    private _onItemSelected: (itemId: string) => void = null;
    private _videoCellNode: cc.Node = null;
    private _currentConfig: Lv318Config = null;
    private _currentCategory: Lv318Category = null;

    /** 刷新当前列表 icon（用于懒加载后更新显示） */
    public refreshIcons(config: Lv318Config) {
        this.refreshIconsInternal(config);
    }

    private refreshIconsInternal(config: Lv318Config) {
        if (!config) return;
        this._currentCells.forEach(cell => {
            const itemCfg = config.items.find(i => i.id === cell.itemId);
            if (itemCfg && itemCfg.iconSpriteFrame) {
                cell.setIcon(itemCfg.iconSpriteFrame);
            }
        });
    }

    /** 设置道具选中回调（由 UIManagerLv318 调用） */
    public setOnItemSelected(callback: (itemId: string) => void) {
        this._onItemSelected = callback;
    }

    public refreshWithCategory(category: Lv318Category, config: Lv318Config) {
        this.clearCells();
        this._currentConfig = config;
        this._currentCategory = category;

        if (!this.scrollView || !this.itemCellPrefab) return;
        const content = this.scrollView.content;

        // 检查是否需要显示广告按钮
        this.updateVideoButton(config);

        const itemConfigs: Lv318ItemConfig[] = category.itemIds
            .map(id => config.items.find(i => i.id === id))
            .filter(Boolean);

        itemConfigs.forEach(cfg => {
            const node = cc.instantiate(this.itemCellPrefab);
            node.parent = content;
            const cell = node.getComponent(ItemCellLv318);
            cell.init(cfg, this.onCellClicked.bind(this));
            this._currentCells.push(cell);
        });

        this._selectedItemId = null;
    }

    /**
     * 更新广告按钮显示状态
     */
    private updateVideoButton(config: Lv318Config) {
        if (!this.scrollView || !this.videoCellPrefab) return;
        
        const content = this.scrollView.content;
        const shouldShow = Lv318UnlockManager.shouldShowVideoButton(config);

        if (shouldShow) {
            // 需要显示广告按钮
            if (!this._videoCellNode || !cc.isValid(this._videoCellNode)) {
                // 创建广告按钮节点
                this._videoCellNode = cc.instantiate(this.videoCellPrefab);
                this._videoCellNode.parent = content;
                
                // 确保广告按钮在最前面（第一个位置）
                this._videoCellNode.setSiblingIndex(0);
                
                const videoCell = this._videoCellNode.getComponent(VideoCellLv318);
                if (videoCell) {
                    videoCell.init(config, () => {
                        // 看满3次后的回调：刷新列表
                        this.refreshCurrentCategory();
                    });
                }
            } else {
                // 已存在，更新显示
                this._videoCellNode.active = true;
                this._videoCellNode.setSiblingIndex(0);
                
                const videoCell = this._videoCellNode.getComponent(VideoCellLv318);
                if (videoCell) {
                    videoCell.updateDisplay();
                }
            }
        } else {
            // 不需要显示，隐藏按钮
            if (this._videoCellNode && cc.isValid(this._videoCellNode)) {
                this._videoCellNode.active = false;
            }
        }
    }

    /**
     * 刷新当前分类（用于看满3次后刷新列表）
     */
    private refreshCurrentCategory() {
        if (this._currentCategory && this._currentConfig) {
            // 重新刷新当前分类，更新所有元素的解锁状态
            this.refreshWithCategory(this._currentCategory, this._currentConfig);
        } else {
            // 如果没有保存分类，通过事件通知外部刷新
            this.node.emit('refresh-category');
        }
    }

    /**
     * 手动刷新广告按钮（供外部调用）
     */
    public refreshVideoButton() {
        if (this._currentConfig) {
            this.updateVideoButton(this._currentConfig);
        }
    }

    private onCellClicked(cell: ItemCellLv318) {
        this._selectedItemId = cell.itemId;
        this._currentCells.forEach(c => c.setSelected(c === cell));

        if (this._onItemSelected) {
            this._onItemSelected(cell.itemId);
        }
    }

    private clearCells() {
        this._currentCells.forEach(c => {
            if (cc.isValid(c.node)) {
                c.node.destroy();
            }
        });
        this._currentCells.length = 0;
        
        // 注意：不清除广告按钮节点，只隐藏，以便后续复用
    }

    public clearSelection() {
        this._selectedItemId = null;
        this._currentCells.forEach(c => c.setSelected(false));
    }
}

