import AssetManager from "../../script/common/AssetManager";
import GameData from "../../script/common/GameData";
import { RoleDataManager } from "./gamedata_lv157_refactored";
import { RoleIndicatorSetting } from "./roleIndicatorConfig_lv157";

const { ccclass } = cc._decorator;

export interface Role2ListInitOptions {
    contentNode: cc.Node;
    templateNode?: cc.Node;
    itemPrefab?: cc.Prefab;
    roleNames: string[];
    clickTarget: cc.Node;
    clickComponent: string;
    clickHandler: string;
    indicatorConfig?: Record<string, RoleIndicatorSetting>;
}

@ccclass
export default class Role2ListView extends cc.Component {
    private contentNode: cc.Node = null;
    private itemTemplate: cc.Node = null;
    private itemPrefab: cc.Prefab = null;
    private roleNames: string[] = [];
    private clickTarget: cc.Node = null;
    private clickComponent: string = "";
    private clickHandler: string = "";
    private indicatorConfig: Record<string, RoleIndicatorSetting> = {};
    private itemPool: cc.NodePool = new cc.NodePool();
    private itemCache: Map<number, cc.Node> = new Map();

    public init(options: Role2ListInitOptions) {
        this.contentNode = options.contentNode || this.contentNode;
        this.itemPrefab = options.itemPrefab || this.itemPrefab;
        this.roleNames = options.roleNames || [];
        this.clickTarget = options.clickTarget;
        this.clickComponent = options.clickComponent;
        this.clickHandler = options.clickHandler;
        this.indicatorConfig = options.indicatorConfig || {};
        this.extractTemplate(options.templateNode);
    }

    public showByRole(roleRow: any[], bannedNames: string[] = []) {
        if (!this.contentNode) return;
        for (let index = 0; index < this.roleNames.length; index++) {
            const roleName = this.roleNames[index];
            const shouldShow = !!roleRow?.[index] && bannedNames.indexOf(roleName) === -1;
            let itemNode = this.itemCache.get(index);
            if (!shouldShow) {
                if (itemNode) {
                    itemNode.active = false;
                }
                continue;
            }
            if (!itemNode) {
                itemNode = this.ensureItem(index);
            }
            if (!itemNode) continue;
            itemNode.active = true;
        }
    }

    public hideAll() {
        this.itemCache.forEach((node) => {
            if (node && node.isValid) node.active = false;
        });
    }

    private extractTemplate(externalTemplate?: cc.Node) {
        if (externalTemplate) {
            this.itemTemplate = externalTemplate;
            this.itemTemplate.active = false;
            this.itemTemplate.removeFromParent(false);
            return;
        }
        if (this.contentNode && this.contentNode.childrenCount > 0) {
            const template = this.contentNode.children[0];
            template.active = false;
            template.removeFromParent(false);
            this.itemTemplate = template;
        } else if (this.itemPrefab) {
            this.itemTemplate = cc.instantiate(this.itemPrefab);
            this.itemTemplate.active = false;
        } else {
            console.warn(`[Role2ListView] 缺少模板节点或预制体，无法创建二级角色`);
        }
    }

    private ensureItem(index: number): cc.Node {
        if (!this.itemTemplate) return null;
        const node = this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.itemTemplate);
        if (!node) return null;
        this.setupItemNode(node, index);
        node.parent = this.contentNode;
        this.itemCache.set(index, node);
        return node;
    }

    private setupItemNode(itemNode: cc.Node, index: number) {
        const spriteNode = itemNode.children[0];
        const roleName = this.roleNames[index];
        const config = RoleDataManager.getRole2Config(index);
        const roleId = config ? config.id : `${index + 1}`;

        if (spriteNode) {
            spriteNode.name = roleId;
            const sprite = spriteNode.getComponent(cc.Sprite);
            if (sprite) {
                this.loadSpriteFrame(`picture_lv157/rl2/${roleId}`, sprite, itemNode);
            }
        }
        itemNode.name = `role2_item_${index}`;
        itemNode.opacity = 255;
        itemNode.active = false;
        this.bindClick(itemNode);
        this.applyIndicatorConfig(itemNode, this.indicatorConfig[roleId] || this.indicatorConfig[roleName]);
    }

    private bindClick(itemNode: cc.Node) {
        if (!this.clickTarget || !this.clickHandler || !this.clickComponent) return;
        const button = itemNode.getComponent(cc.Button);
        if (!button) return;
        const handler = new cc.Component.EventHandler();
        handler.target = this.clickTarget;
        handler.component = this.clickComponent;
        handler.handler = this.clickHandler;
        button.clickEvents = [handler];
    }

    private loadSpriteFrame(path: string, sprite: cc.Sprite, ownerNode?: cc.Node) {
        AssetManager.load(GameData.curGameStyle, path, cc.SpriteFrame, null, (pic: cc.SpriteFrame) => {
            if (pic && sprite && sprite.node && sprite.node.isValid) {
                sprite.spriteFrame = pic;
            }
            if (!pic && ownerNode && ownerNode.isValid) {
                ownerNode.removeFromParent();
                ownerNode.destroy();
            }
        });
    }

    private applyIndicatorConfig(itemNode: cc.Node, config?: RoleIndicatorSetting) {
        if (!config) return;
        const hongdian = itemNode.getChildByName(`hongdian`);
        if (hongdian && typeof config.hongdian === "boolean") {
            hongdian.active = config.hongdian;
        }
        const luxiang = itemNode.getChildByName(`luxiang`);
        if (luxiang && typeof config.requireAd === "boolean") {
            luxiang.active = config.requireAd;
        }
    }
}

