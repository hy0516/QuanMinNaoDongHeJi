import {
    Lv318Config,
    Lv318ItemConfig,
    Lv318ItemType,
    Lv318InitialObj
} from "./Lv318Types";
import RagdollCharacter_lv318 from "./ai_character_lv318/RagdollCharacter_lv318";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SandboxManager extends cc.Component {

    @property
    gridSize: number = 32;   // 网格大小（像素）

    @property(cc.Rect)
    sandboxBounds: cc.Rect = new cc.Rect(-800, -450, 1600, 900);
    // 在 SandboxArea 本地坐标中的可放置区域
    @property({ tooltip: "网格线颜色" })
    gridColor: cc.Color = cc.color(200, 200, 200, 255);  // 更清晰的浅灰
    @property({ tooltip: "网格线宽度" })
    gridLineWidth: number = 1;

    private _gridGraphics: cc.Graphics = null;

    private _config: Lv318Config = null;
    private _sandboxArea: cc.Node = null;

    public init(config: Lv318Config, sandboxArea: cc.Node) {
        this._config = config;
        this._sandboxArea = sandboxArea;
        this.createGridGraphics();
        this.drawGrid();
        this.resetLevel();
    }
    private createGridGraphics() {
        if (this._gridGraphics) return;
        this._gridGraphics = new cc.Node("GridGraphics").addComponent(cc.Graphics);
        this._gridGraphics.node.parent = this._sandboxArea;
        this._gridGraphics.node.setPosition(cc.v3(0, 0, 0));
        this._gridGraphics.node.zIndex = -1;  // 放在最底层
    }

    private drawGrid() {
        if (!this._gridGraphics || !this.sandboxBounds) return;
        this._gridGraphics.clear();

        const bounds = this.sandboxBounds;
        const g = this.gridSize;

        this._gridGraphics.strokeColor = this.gridColor;
        this._gridGraphics.lineWidth = this.gridLineWidth;

        // 绘制垂直线
        const startX = Math.floor(bounds.x / g) * g;
        const endX = bounds.x + bounds.width;
        for (let x = startX; x <= endX; x += g) {
            this._gridGraphics.moveTo(x, bounds.y);
            this._gridGraphics.lineTo(x, bounds.y + bounds.height);
        }

        // 绘制水平线
        const startY = Math.floor(bounds.y / g) * g;
        const endY = bounds.y + bounds.height;
        for (let y = startY; y <= endY; y += g) {
            this._gridGraphics.moveTo(bounds.x, y);
            this._gridGraphics.lineTo(bounds.x + bounds.width, y);
        }

        this._gridGraphics.stroke();
    }
    /** 重置本关：清空生成物，重新生成 initialObjects */
    public resetLevel() {
        // 直接清空 SandboxArea 下所有子节点（除了网格）
        if (this._sandboxArea) {
            const children = this._sandboxArea.children.slice(); // 复制数组避免遍历时修改
            children.forEach(child => {
                if (child.name !== "GridGraphics" && cc.isValid(child)) {
                    child.destroy();
                }
            });
        }

        if (!this._config) return;
        this._config.initialObjects.forEach(objCfg => {
            this.spawnInitialObject(objCfg);
        });
    }

    private spawnInitialObject(objCfg: Lv318InitialObj) {
        const itemCfg = this.getItemConfig(objCfg.itemId);
        if (!itemCfg) return;

        const node = this.instantiateItem(itemCfg);
        // Character 预制体包含多个刚体：必须在加入场景树/激活前把位置设置好，
        // 否则物理初始化时会在 (0,0) 建立刚体，后续会把节点"拉回"原点。
        if (itemCfg.type === Lv318ItemType.Character) {
            node.active = false;
        }
        node.parent = this._sandboxArea;
        node.position = cc.v3(objCfg.position.x, objCfg.position.y, 0);
        node.angle = objCfg.rotation || 0;

        if (itemCfg.type === Lv318ItemType.Character) {
            node.active = true;
        }
    }

    /** 对外接口：在世界坐标 worldPos 放置指定道具 */
    public placeItem(itemId: string, worldPos: cc.Vec2): boolean {
        const itemCfg = this.getItemConfig(itemId);
        if (!itemCfg) return false;

        // 世界坐标 -> SandboxArea 本地坐标
        let localPos = this._sandboxArea.convertToNodeSpaceAR(worldPos);

        // 边界检查
        if (!this.sandboxBounds.contains(localPos)) {
            return false;
        }

        // 静态块/墙体等需要网格吸附
        if (itemCfg.gridSnap) {
            localPos = this.snapToGrid(localPos);
        }

        // TODO: 可以在这里加入碰撞检测/重叠检测，避免某些位置放置

        const node = this.instantiateItem(itemCfg);
        // 同 spawnInitialObject：角色类要先设位置再激活，避免刚体初始化在原点
        if (itemCfg.type === Lv318ItemType.Character) {
            node.active = false;
        }
        node.parent = this._sandboxArea;
        node.position = cc.v3(localPos.x, localPos.y, 0);
        
        if (itemCfg.type === Lv318ItemType.Character) {
            node.active = true;
        }

        return true;
    }

    private snapToGrid(pos: cc.Vec2): cc.Vec2 {
        const g = this.gridSize;
        const bounds = this.sandboxBounds;
        const startX = Math.floor(bounds.x / g) * g;
        const startY = Math.floor(bounds.y / g) * g;
        const snapped = pos.clone();
        // 让物体中心落在当前格子内部中心点（使用 floor 避免跨格抖动）
        snapped.x = Math.floor((snapped.x - startX) / g) * g + startX + g * 0.5;
        snapped.y = Math.floor((snapped.y - startY) / g) * g + startY + g * 0.5;
        return snapped;
    }

    private getItemConfig(itemId: string): Lv318ItemConfig {
        if (!this._config) return null;
        return this._config.items.find(i => i.id === itemId) || null;
    }

    private instantiateItem(cfg: Lv318ItemConfig): cc.Node {
        const node = cc.instantiate(cfg.prefab);
        node.name = cfg.name || cfg.id;
        // TODO: 如果有通用组件或标签，可以在这里挂
        return node;
    }

    /** 尝试删除指定世界坐标位置的物件，返回是否删除成功 */
    public tryDeleteAtPosition(worldPos: cc.Vec2): boolean {
        if (!this._sandboxArea) return false;
        const localPos = this._sandboxArea.convertToNodeSpaceAR(worldPos);

        // 遍历 SandboxArea 的所有子节点（包括转换后的感染者）
        const children = this._sandboxArea.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const node = children[i];
            if (!cc.isValid(node)) continue;
            // 跳过网格绘制节点
            if (node.name === "GridGraphics") continue;

            // 使用节点包围盒检测点击
            const box = node.getBoundingBox();
            if (box.contains(localPos)) {
                node.destroy();
                return true;
            }
        }
        return false;
    }
}

