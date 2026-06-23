import AssetManager from "../../script/common/AssetManager";
import GameData from "../../script/common/GameData";
import { RoleDataManager, role1IndexName } from "./gamedata_lv157_refactored";
import TJItem_lv157 from "./TJItem_lv157";


const { ccclass, property } = cc._decorator;

interface SortedTujianItem {
    index: number;
    index1: number;
    element1: any;
    roleName: string;
    isUnlocked: boolean;
    starLevel: number;
}

@ccclass
export default class TujianPanel extends cc.Component {
    @property(cc.Prefab)
    tujianItem: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Label)
    pageInfoLabel: cc.Label = null;

    @property(cc.Button)
    btnPrevPage: cc.Button = null;

    @property(cc.Button)
    btnNextPage: cc.Button = null;

    private readonly UNLOCK_KEY = "lv157_unlocked_roles";
    private readonly AD_WATCHED_KEY = "lv157_ad_watched_roles";

    private unlockedRoles: Set<string> = new Set();
    private adWatchedRoles: Set<string> = new Set();

    private tujianLoadQueue: Array<{ tempItem: cc.Node, path: string, name: string, star: number }> = [];
    private isLoadingTujian: boolean = false;
    private currentLoadCount: number = 0;

    private createNodeQueue: Array<{ index: number, index1: number, element1: any }> = [];
    private isCreatingNodes: boolean = false;
    private nodesPerFrame: number = 5;

    private currentPage: number = 1;
    private pageSize: number = 15;
    private totalPages: number = 0;
    private totalItems: number = 0;
    private sortedTujianData: SortedTujianItem[] = [];
    private listHeightStep: number = 200;
    private hasInitialized: boolean = false;

    onLoad() {
        this.registerButtonHandlers();
        this.node.active = false;
    }

    public initializePanel() {
        if (this.hasInitialized) return;
        this.loadUnlockedRoles();
        this.buildSortedData();
        this.hasInitialized = true;
    }

    public openPanel() {
        if (!this.hasInitialized) {
            this.initializePanel();
        }
        this.node.active = true;
        this.loadPage(this.currentPage || 1);
    }

    public closePanel() {
        this.node.active = false;
    }

    public markUnlocked(roleName: string): boolean {
        if (!roleName || this.unlockedRoles.has(roleName)) {
            return false;
        }
        this.unlockedRoles.add(roleName);
        this.saveSetToStorage(this.UNLOCK_KEY, this.unlockedRoles);
        this.updateSortedData();
        return true;
    }

    public markAdWatched(roleName: string) {
        if (!roleName || this.adWatchedRoles.has(roleName)) return;
        this.adWatchedRoles.add(roleName);
        this.saveSetToStorage(this.AD_WATCHED_KEY, this.adWatchedRoles);
    }

    public isRoleUnlocked(roleName: string): boolean {
        return this.unlockedRoles.has(roleName);
    }

    private registerButtonHandlers() {
        this.btnPrevPage?.node.on('click', this.handlePrevPage, this);
        this.btnNextPage?.node.on('click', this.handleNextPage, this);
    }

    private handlePrevPage() {
        if (this.currentPage <= 1) return;
        this.currentPage--;
        this.loadPage(this.currentPage);
    }

    private handleNextPage() {
        if (this.currentPage >= this.totalPages) return;
        this.currentPage++;
        this.loadPage(this.currentPage);
    }

    private buildSortedData() {
        this.sortedTujianData = [];
        // 直接从 FusionResultMap 获取所有合成结果
        const allResults = RoleDataManager.getAllFusionResults();
        for (const { role1Index, role2Index, roleInfo } of allResults) {
            const roleName = role1IndexName[role1Index] + (role2Index + 1);
            const isUnlocked = this.unlockedRoles.has(roleName);
            const starLevel = this.getStarLevelIndex(roleInfo.star);
            this.sortedTujianData.push({
                index: role1Index,
                index1: role2Index,
                element1: roleInfo,
                roleName,
                isUnlocked,
                starLevel
            });
        }
        this.sortData();
        this.totalItems = this.sortedTujianData.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        this.currentPage = 1;
        this.refreshPageInfo();
    }

    private updateSortedData() {
        for (const item of this.sortedTujianData) {
            item.isUnlocked = this.unlockedRoles.has(item.roleName);
        }
        this.sortData();
        if (this.node.active) {
            this.loadPage(this.currentPage);
        }
    }

    private sortData() {
        this.sortedTujianData.sort((a, b) => {
            if (a.isUnlocked !== b.isUnlocked) {
                return a.isUnlocked ? -1 : 1;
            }
            return b.starLevel - a.starLevel;
        });
    }

    private loadPage(pageNum: number) {
        if (!this.content) return;

        this.isCreatingNodes = false;
        this.isLoadingTujian = false;
        this.currentLoadCount = 0;
        this.content.removeAllChildren();

        this.currentPage = pageNum;
        this.refreshPageInfo();

        const startIndex = (pageNum - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);

        this.createNodeQueue = [];
        this.tujianLoadQueue = [];
        for (let i = startIndex; i < endIndex; i++) {
            const data = this.sortedTujianData[i];
            this.createNodeQueue.push({
                index: data.index,
                index1: data.index1,
                element1: data.element1
            });
        }
        this.startCreateNodesGradually();
    }

    private refreshPageInfo() {
        if (this.pageInfoLabel) {
            this.pageInfoLabel.string = `${this.currentPage}/${this.totalPages}`;
        }
        if (this.btnPrevPage) {
            this.btnPrevPage.interactable = this.currentPage > 1;
        }
        if (this.btnNextPage) {
            this.btnNextPage.interactable = this.currentPage < this.totalPages;
        }
    }

    private startCreateNodesGradually() {
        if (this.isCreatingNodes) return;
        this.isCreatingNodes = true;

        const createBatch = () => {
            if (this.createNodeQueue.length === 0) {
                this.isCreatingNodes = false;
                this.startLoadTujianQueue();
                return;
            }

            const batchSize = Math.min(this.nodesPerFrame, this.createNodeQueue.length);
            for (let i = 0; i < batchSize; i++) {
                const data = this.createNodeQueue.shift();
                if (!data) break;
                this.instantiateItem(data.index, data.index1, data.element1);
            }
            if (this.content) {
                this.content.height = Math.ceil(this.content.childrenCount / 3) * this.listHeightStep;
            }
            setTimeout(createBatch, 10);
        };

        createBatch();
    }

    private instantiateItem(index: number, index1: number, element1: any) {
        if (!this.tujianItem || !this.content) return;
        const tempItem = cc.instantiate(this.tujianItem);
        tempItem.parent = this.content;

        const roleName = role1IndexName[index] + (index1 + 1);
        const itemScript = tempItem.getComponent(TJItem_lv157);
        if (itemScript) {
            itemScript.InitItem(element1, index, index1);
            if (this.unlockedRoles.has(roleName)) {
                itemScript.UnLock();
            }
        }

        const jsglNode = tempItem.getChildByName(`jsgl`);
        if (jsglNode&&!this.isRoleUnlocked(roleName)) {
            jsglNode.active = !this.adWatchedRoles.has(roleName);
        }

        this.tujianLoadQueue.push({
            tempItem,
            path: `picture_lv157/resultrole/${roleName}`,
            name: role1IndexName[index] + index1,
            star: element1.star
        });
    }

    private startLoadTujianQueue() {
        if (this.isLoadingTujian) return;
        this.isLoadingTujian = true;
        const concurrent = Math.min(10, this.tujianLoadQueue.length);
        for (let i = 0; i < concurrent; i++) {
            this.loadNextTujian();
        }
    }

    private loadNextTujian() {
        if (this.tujianLoadQueue.length === 0) {
            this.currentLoadCount--;
            if (this.currentLoadCount <= 0) {
                this.isLoadingTujian = false;
                this.currentLoadCount = 0;
            }
            return;
        }

        const item = this.tujianLoadQueue.shift();
        if (!item) {
            this.currentLoadCount--;
            return;
        }

        this.currentLoadCount++;
        AssetManager.load(GameData.curGameStyle, item.path, cc.SpriteFrame, null, (pic: cc.SpriteFrame) => {
            if (pic && item.tempItem && item.tempItem.isValid && item.tempItem.children[0]) {
                const sprite = item.tempItem.children[0].getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = pic;
                    item.tempItem.children[0].name = item.name;
                }
            }
            this.currentLoadCount--;
            if (this.tujianLoadQueue.length > 0) {
                this.loadNextTujian();
            } else if (this.currentLoadCount <= 0) {
                this.isLoadingTujian = false;
                this.currentLoadCount = 0;
            }
        });
    }

    private getStarLevelIndex(star: number): number {
        if (star < 4) return 0;
        if (star < 6) return 1;
        if (star < 8) return 2;
        if (star < 9) return 3;
        if (star < 10) return 4;
        return 5;
    }

    private loadUnlockedRoles() {
        this.unlockedRoles = this.loadSetFromStorage(this.UNLOCK_KEY);
        this.adWatchedRoles = this.loadSetFromStorage(this.AD_WATCHED_KEY);
    }

    private loadSetFromStorage(key: string): Set<string> {
        try {
            const data = cc.sys.localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                return new Set(parsed);
            }
        } catch (error) {
            console.error(`[TujianPanel] load ${key} failed:`, error);
        }
        return new Set();
    }

    private saveSetToStorage(key: string, set: Set<string>) {
        try {
            const data = JSON.stringify(Array.from(set));
            cc.sys.localStorage.setItem(key, data);
        } catch (error) {
            console.error(`[TujianPanel] save ${key} failed:`, error);
        }
    }
}

