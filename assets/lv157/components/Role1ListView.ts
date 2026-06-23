import AssetManager from "../../script/common/AssetManager";
import GameData from "../../script/common/GameData";
import { banRole1IndexName } from "./gamedata_lv157_refactored";
import { RoleIndicatorSetting } from "./roleIndicatorConfig_lv157";


const { ccclass } = cc._decorator;

export interface Role1ListInitOptions {
    contentNode: cc.Node;
    templateNode?: cc.Node;
    itemPrefab?: cc.Prefab;
    roleIndexNames: string[];
    clickTarget: cc.Node;
    clickComponent: string;
    clickHandler: string;
    indicatorConfig?: Record<string, RoleIndicatorSetting>;
}

@ccclass
export default class Role1ListView extends cc.Component {
    private contentNode: cc.Node = null;
    private itemTemplate: cc.Node = null;
    private itemPrefab: cc.Prefab = null;
    private roleIndexNames: string[] = [];
    private clickTarget: cc.Node = null;
    private clickComponent: string = "";
    private clickHandler: string = "";
    private indicatorConfig: Record<string, RoleIndicatorSetting> = {};
    private itemPool: cc.NodePool = new cc.NodePool();

    private static readonly banRoleIndexSet = new Set(banRole1IndexName);

    public init(options: Role1ListInitOptions) {
        this.contentNode = options.contentNode || this.contentNode;
        this.itemPrefab = options.itemPrefab || this.itemPrefab;
        this.roleIndexNames = (options.roleIndexNames || []).filter(
            (roleKey) => !Role1ListView.banRoleIndexSet.has(roleKey)
        );
        this.clickTarget = options.clickTarget;
        this.clickComponent = options.clickComponent;
        this.clickHandler = options.clickHandler;
        this.indicatorConfig = options.indicatorConfig || {};
        this.extractTemplate(options.templateNode);
        this.buildList();
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
            console.warn(`[Role1ListView] 缺少模板节点或预制体，无法创建列表`);
        }
    }

    private buildList() {
        if (!this.contentNode || !this.itemTemplate) return;
        this.recycleAll();
        for (let i = 0; i < this.roleIndexNames.length; i++) {
            const roleKey = this.roleIndexNames[i];
            const itemNode = this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.itemTemplate);
            if (!itemNode) continue;
            this.setupItemNode(itemNode, roleKey, i);
            itemNode.parent = this.contentNode;
            itemNode.active = true;
        }
    }

    private recycleAll() {
        if (!this.contentNode) return;
        for (let i = this.contentNode.childrenCount - 1; i >= 0; i--) {
            const node = this.contentNode.children[i];
            node.removeFromParent(false);
            this.itemPool.put(node);
        }
    }

    private setupItemNode(itemNode: cc.Node, roleKey: string, index: number) {
        const spriteNode = itemNode.children[0];
        if (spriteNode) {
            spriteNode.name = roleKey;
            const sprite = spriteNode.getComponent(cc.Sprite);
            if (sprite) {
                this.loadSpriteFrame(`picture_lv157/rl1/${roleKey}`, sprite, itemNode);
            }
        }
        this.bindClickEvents(itemNode);
        this.applyIndicatorConfig(itemNode, this.indicatorConfig[roleKey]);
        itemNode.name = `role1_item_${index}`;
        itemNode.opacity = 255;
    }

    private bindClickEvents(itemNode: cc.Node) {
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
                return;
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

