import { Lv318Config, Lv318Category } from "./Lv318Types";
import Lv318Controller from "./Lv318Controller";
import ItemListViewLv318 from "./ItemListViewLv318";
import Platforms_QuickGame from "../script/SDK/Platforms/QuickGame/Platforms_QuickGame";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIManagerLv318 extends cc.Component {

    @property(cc.Node)
    topBar: cc.Node = null;

    @property(cc.Label)
    labelRemain: cc.Label = null;

    @property(cc.Button)
    btnRestart: cc.Button = null;

    @property(cc.Node)
    tabBar: cc.Node = null;

    @property(ItemListViewLv318)
    itemListView: ItemListViewLv318 = null;

    @property({ type: cc.Node, tooltip: "删除按钮节点（需包含子节点 heightlightNode）" })
    btnDelete: cc.Node = null;

    @property(cc.Node)
    pausePanel: cc.Node = null;

    private _config: Lv318Config = null;
    private _controller: Lv318Controller = null;
    private _currentTabNode: cc.Node = null;
    private _tabEventHandlers: { node: cc.Node, handler: Function }[] = [];  // 缓存事件处理器用于解绑
    private _isDeleteMode: boolean = false;
    private _currentCategory: Lv318Category = null;

    public init(config: Lv318Config, controller: Lv318Controller) {
        this._config = config;
        this._controller = controller;

        // 设置道具选中回调
        if (this.itemListView) {
            this.itemListView.setOnItemSelected(this.onItemSelected.bind(this));
            // 监听刷新分类事件（看满3次后触发）
            this.itemListView.node.on('refresh-category', this.onRefreshCategory, this);
        }

        this.initTopBar();
        this.initTabBar();
    }

    private initTopBar() {
        if (this.btnRestart) {
            this.btnRestart.node.on('click', () => {
                AudioManager.playEffect('点击', false);
                this._controller.onRestartClicked();
            });
        }
    }

    private initTabBar() {
        if (!this._config || !this.tabBar) return;

        const categories = this._config.categories;
        const children = this.tabBar.children;

        for (let i = 0; i < children.length; i++) {
            const btnNode = children[i];
            const category = categories[i];

            if (!category) {
                btnNode.active = false;
                continue;
            }

            btnNode.active = true;

            const label = btnNode.getComponentInChildren(cc.Label);
            if (label) label.string = category.name;

            const clickCategory = category;
            const clickBtnNode = btnNode;
            const handler = () => {
                AudioManager.playEffect('点击', false);
                this.onCategoryClicked(clickCategory, clickBtnNode);
            };
            btnNode.on(cc.Node.EventType.TOUCH_END, handler);
            this._tabEventHandlers.push({ node: btnNode, handler });
        }

        if (categories.length > 0) {
            this.onCategoryClicked(categories[0], children[0]);
        }
    }

    private onCategoryClicked(category: Lv318Category, tabNode: cc.Node) {
        console.log(`切换到${category.name}`);

        this._currentCategory = category;
        if (this.itemListView) {
            this.itemListView.refreshWithCategory(category, this._config);
            // 刷新广告按钮状态
            this.itemListView.refreshVideoButton();
        }

        // Tab 高亮切换
        this.setTabHighlight(this._currentTabNode, false);
        this.setTabHighlight(tabNode, true);
        this._currentTabNode = tabNode;
    }

    /**
     * 刷新当前分类（看满3次后调用）
     */
    private onRefreshCategory() {
        if (this._currentCategory && this.itemListView) {
            this.itemListView.refreshWithCategory(this._currentCategory, this._config);
        }
    }

    /** 道具图标懒加载完成后刷新当前列表 */
    public refreshCurrentCategoryIcons() {
        if (this.itemListView && this._config) {
            this.itemListView.refreshIcons(this._config);
        }
    }

    private setTabHighlight(tabNode: cc.Node, active: boolean) {
        if (!tabNode) return;
        const highlight = tabNode.getChildByName("highlightNode");
        if (highlight) {
            highlight.active = active;
        }
    }

    public updateRemainParticles(count: number) {
        if (this.labelRemain) {
            this.labelRemain.string = "" + count;
        }
    }

    public clearSelection() {
        if (this.itemListView) {
            this.itemListView.clearSelection();
        }
    }

    /** 由 ItemListView 调用：某个道具被选中 */
    public onItemSelected(itemId: string) {
        // 选中生成物件时，关闭删除模式
        this.setDeleteMode(false);
        if (this._controller) {
            this._controller.onItemSelected(itemId);
        }
    }

    // ============ 删除模式相关 ============

    /** 获取当前是否处于删除模式 */
    public isDeleteMode(): boolean {
        return this._isDeleteMode;
    }

    /** 设置删除模式开关 */
    public setDeleteMode(active: boolean) {
        this._isDeleteMode = active;
        // 更新删除按钮高亮
        if (this.btnDelete) {
            const highlight = this.btnDelete.getChildByName("heightlightNode");
            if (highlight) {
                highlight.active = active;
            }
        }
        // 开启删除模式时，取消道具选中
        if (active) {
            this.clearSelection();
            if (this._controller) {
                this._controller.onItemSelected(null);
            }
        }
    }

    /** 供编辑器 Button 组件回调：切换删除模式 */
    public onDeleteButtonClicked() {
        this.setDeleteMode(!this._isDeleteMode);
    }

    // ============ 暂停面板相关 ============
    public onPauseClick() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        GameData.PauseGame = true;
        this.showPausePanel();
    }

    /** 显示暂停面板 */
    public showPausePanel() {
        cc.audioEngine.pauseAll();
        cc.director.pause();
        Platforms_QuickGame.getInstance().showInsertAd();
        if (this.pausePanel) this.pausePanel.active = true;
    }

    /** 隐藏暂停面板 */
    public hidePausePanel() {
        cc.director.resume();
        cc.audioEngine.resumeAll();
        GameData.PauseGame = false;
        if (this.pausePanel) this.pausePanel.active = false;
    }

    /** 恢复游戏 */
    public onResumeClick() {
        this.hidePausePanel();
        if (this._controller) this._controller.onResume();
    }

    /** 重玩关卡 */
    public onRestartClick() {
        this.hidePausePanel();
        if (this._controller) this._controller.onRestartClicked();
    }

    /** 放弃关卡 */
    public onGiveUpClick() {
        this.hidePausePanel();
        if (this._controller) this._controller.onGiveUp();
    }

    onDestroy() {
        // 解绑所有 tab 事件
        this._tabEventHandlers.forEach(({ node, handler }) => {
            if (cc.isValid(node)) {
                node.off(cc.Node.EventType.TOUCH_END, handler as any);
            }
        });
        this._tabEventHandlers.length = 0;

        // 解绑重启按钮事件
        if (this.btnRestart && cc.isValid(this.btnRestart.node)) {
            this.btnRestart.node.off('click');
        }

        // 解绑刷新分类事件
        if (this.itemListView && cc.isValid(this.itemListView.node)) {
            this.itemListView.node.off('refresh-category', this.onRefreshCategory, this);
        }
    }
}

