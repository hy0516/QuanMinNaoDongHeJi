import SandboxManager from "./SandboxManager";
import UIManagerLv318 from "./UIManagerLv318";
import { Lv318Config, Lv318ItemConfig, Lv318Category, Lv318InitialObj, Lv318ItemType } from "./Lv318Types";
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import BaseGame from "../script/common/BaseGame";
import DraggableItem_lv318 from "./DraggableItem_lv318";
import AssetManager from "../script/common/AssetManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Lv318Controller extends BaseGame {
    @property(SandboxManager)
    sandboxManager: SandboxManager = null;

    @property(UIManagerLv318)
    uiManager: UIManagerLv318 = null;

    @property(cc.Node)
    sandboxArea: cc.Node = null;      // 沙盒区域节点

    @property
    maxParticles: number = 1300;      // 默认值，可在 Inspector 修改



    lvConfig: Lv318Config = null;

    private _remainParticles: number = 0;
    private _currentSelectedItemId: string = null;
    private _sceneMainCamera: cc.Camera = null; // 保存场景主相机的引用，用于恢复

    onLoad() {
        GameData.PauseGame = false;
        this.disableSceneMainCamera(); // 禁用场景中的主相机，避免重复渲染
        this.initPhysics();
        this.buildLv318Config(); // 异步加载，完成后会调用 onConfigReady
    }

    /** 配置加载完成后的初始化 */
    private onConfigReady() {
        if (!this.lvConfig) {
            cc.error("[Lv318Controller] lvConfig 构建失败");
            return;
        }

        this._remainParticles = this.lvConfig.maxParticles;

        // 注入 UIManager 引用给 DraggableItem（用于删除模式检测）
        DraggableItem_lv318.setSharedUIManager(this.uiManager);

        this.sandboxManager.init(this.lvConfig, this.sandboxArea);
        this.uiManager.init(this.lvConfig, this);

        this.uiManager.updateRemainParticles(this._remainParticles);
    }

    /** 禁用场景中的 Main Camera，避免与 prefab 内的相机冲突 */
    private disableSceneMainCamera() {
        // 查找场景中的 Main Camera
        const scene = cc.director.getScene();
        if (!scene) return;

        // 方法1: 通过名称查找
        const mainCameraNode = scene.getChildByName("Main Camera");
        if (mainCameraNode) {
            const camera = mainCameraNode.getComponent(cc.Camera);
            if (camera) {
                this._sceneMainCamera = camera; // 保存引用
                camera.enabled = false;
                cc.log("[Lv318Controller] 已禁用场景中的 Main Camera");
            }
        }

        // 方法2: 遍历 Canvas 下的所有相机（备用方案）
        if (!this._sceneMainCamera) {
            const canvas = scene.getChildByName("Canvas");
            if (canvas) {
                const cameras = canvas.getComponentsInChildren(cc.Camera);
                cameras.forEach(cam => {
                    // 如果相机的 depth 是 -1（场景默认相机），则禁用它
                    if (cam.depth === -1 && cam.node.name === "Main Camera") {
                        this._sceneMainCamera = cam; // 保存引用
                        cam.enabled = false;
                        cc.log("[Lv318Controller] 已禁用场景中的 Main Camera (方法2)");
                    }
                });
            }
        }
    }

    /** 恢复场景中的 Main Camera */
    private restoreSceneMainCamera() {
        if (this._sceneMainCamera && cc.isValid(this._sceneMainCamera)) {
            this._sceneMainCamera.enabled = true;
            cc.log("[Lv318Controller] 已恢复场景中的 Main Camera");
        }
    }

    protected onDestroy(): void {
        DraggableItem_lv318.setSharedUIManager(null);
        this.restoreSceneMainCamera(); // 退出关卡时恢复场景相机
        super.onDestroy();
    }
    private initPhysics() {
        const pm = cc.director.getPhysicsManager();
        pm.enabled = true;
        pm.gravity = cc.v2(0, -980);   // 重力大小可后续根据手感调整
    }

    private buildLv318Config() {
        // 懒加载：先加载首屏 icon，其他 icon 后台加载；prefab 在使用时再加载
        this.loadItemsLazy();
    }

    private loadItemsLazy() {
        const firstCategory = this.items.filter(i => i.type === Lv318ItemType.StaticBlock);
        const firstBatch = firstCategory.slice(0, 8);

        const firstLoadPromises = firstBatch.map(item => this.loadItemIcon(item));

        Promise.all(firstLoadPromises).then(() => {
            this.finishBuildConfig();
            this.onConfigReady();

            // 后台加载剩余 icon
            const remaining = this.items.filter(i => !firstBatch.includes(i));
            remaining.forEach(item => {
                this.loadItemIcon(item).then(() => {
                    if (this.uiManager) {
                        this.uiManager.refreshCurrentCategoryIcons();
                    }
                });
            });
        });
    }

    private loadItemIcon(item: Lv318ItemConfig): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!item.iconPath) {
                resolve();
                return;
            }
            const relativePath = 'picture_lv318/' + item.iconPath;
            AssetManager.load(GameData.curGameStyle, relativePath, cc.SpriteFrame, null, (spriteFrame: cc.SpriteFrame) => {
                if (spriteFrame) {
                                item.iconSpriteFrame = spriteFrame;
                            } else {
                                cc.warn(`[Lv318Controller] 加载 icon 失败: ${item.iconPath}`);
                            }
                resolve();
            });
        });
    }

    private finishBuildConfig() {
        const items: Lv318ItemConfig[] = this.items;

        // 构建 categories（示例配置，后续可在 Inspector 中扩展）
        const categories: Lv318Category[] = [
            {
                id: "character",
                name: "人物",
                itemIds: items.filter(i => i.type === Lv318ItemType.Character).map(i => i.id)
            },
            {
                id: "weapon",
                name: "武器",
                itemIds: items.filter(i => i.type === Lv318ItemType.Gun).map(i => i.id)
            },
            {
                id: "building",
                name: "建筑",
                itemIds: items.filter(i => i.type === Lv318ItemType.StaticBlock).map(i => i.id)
            },
            {
                id: "wearable",
                name: "装备",
                itemIds: items.filter(i => i.type === Lv318ItemType.Wearable).map(i => i.id)
            },
            {
                id: "dynamic",
                name: "动态",
                itemIds: items.filter(i => i.type === Lv318ItemType.DynamicObject).map(i => i.id)
            },
        ].filter(c => c.itemIds.length > 0); // 过滤掉空分类

        // 构建 initialObjects（示例，后续可在 Inspector 中配置）
        const initialObjects: Lv318InitialObj[] = [];

        this.lvConfig = {
            maxParticles: this.maxParticles,
            items: items,
            categories: categories,
            initialObjects: initialObjects
        };
    }

    /** 被 SandboxInput 调用：沙盒被点击 */
    public onSandboxClicked(worldPos: cc.Vec2) {
        // 删除模式：尝试删除点击位置的物件（保持删除模式不变）
        if (this.uiManager.isDeleteMode()) {
            this.sandboxManager.tryDeleteAtPosition(worldPos);
            return;
        }

        if (!this._currentSelectedItemId) return;
        if (this._remainParticles <= 0) return;

        const itemCfg = this.lvConfig.items.find(i => i.id === this._currentSelectedItemId);
        if (!itemCfg) return;

        if (!itemCfg.prefab && itemCfg.prefabPath) {
            const relativePath = 'prefabs/' + itemCfg.prefabPath;
            AssetManager.load(GameData.curGameStyle, relativePath, cc.Prefab, null, (prefab: cc.Prefab) => {
                if (prefab) {
                    itemCfg.prefab = prefab;
                    this.placeItemAfterLoad(worldPos);
                } else {
                    cc.error(`[Lv318Controller] 加载 prefab 失败: ${itemCfg.prefabPath}`);
                }
            });
            return;
        }

        this.placeItemAfterLoad(worldPos);
    }

    private placeItemAfterLoad(worldPos: cc.Vec2) {
        const success = this.sandboxManager.placeItem(this._currentSelectedItemId, worldPos);
        if (success) {
            this._remainParticles--;
            this.uiManager.updateRemainParticles(this._remainParticles);
            
            // 根据物品类型播放不同音效
            const itemCfg = this.lvConfig.items.find(i => i.id === this._currentSelectedItemId);
            if (itemCfg) {
                if (itemCfg.type === Lv318ItemType.StaticBlock) {
                    AudioManager.playEffect('放置墙体', false);
                } else {
                    AudioManager.playEffect('放置物品', false);
                }
            }
            // TODO: 可以在这里根据规则判断失败/结束（例如粒子用完）
        }
    }

    /** 被 UIManager 调用：列表选中某个道具 */
    public onItemSelected(itemId: string) {
        this._currentSelectedItemId = itemId;
        // TODO: 如果需要，在这里加入一些 UI 提示逻辑
    }

    /** 被 TopBar 的重置按钮调用 */
    public onRestartClicked() {
        this.sandboxManager.resetLevel();
        this._remainParticles = this.lvConfig.maxParticles;
        this.uiManager.updateRemainParticles(this._remainParticles);
        this._currentSelectedItemId = null;
        this.uiManager.clearSelection();

        // TODO: 如果有计时器、胜负状态等，也在这里重置
    }

    /** 恢复游戏 */
    public onResume() {
        GameData.PauseGame = false;
    }

    /** 放弃关卡（退出游戏） */
    public onGiveUp() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
            var HallnNode = cc.instantiate(hall);
            HallnNode.parent = cc.find("Canvas");
            this.node.parent.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }
    // 配置数据（可在 Inspector 中配置）
    items: Lv318ItemConfig[] = [
        {
            id: 'wall_1',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk1',
            iconPath: 'wall/sel_ui/fk1',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null,
        },
        {
            id: 'wall_2',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk2',
            iconPath: 'wall/sel_ui/fk2',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'wall_3',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk3',
            iconPath: 'wall/sel_ui/fk3',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'wall_4',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk4',
            iconPath: 'wall/sel_ui/fk4',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'wall_5',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk5',
            iconPath: 'wall/sel_ui/fk5',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'wall_6',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk6',
            iconPath: 'wall/sel_ui/fk6',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'wall_7',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk7',
            iconPath: 'wall/sel_ui/fk7',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'wall_8',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk8',
            iconPath: 'wall/sel_ui/fk8',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'wall_9',
            type: Lv318ItemType.StaticBlock,
            prefabPath: 'wall/fk9',
            iconPath: 'wall/sel_ui/fk9',
            gridSnap: true,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'gun_1',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/gun_1',
            iconPath: 'daoju/sel_ui/gun_1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'gun_2',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/gun_2',
            iconPath: 'daoju/sel_ui/gun_2',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'gun_3',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/gun_3',
            iconPath: 'daoju/sel_ui/gun_3',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'gun_4',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/gun_4',
            iconPath: 'daoju/sel_ui/gun_4',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'gun_5',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/gun_5',
            iconPath: 'daoju/sel_ui/gun_5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'gun_6',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/gun_6',
            iconPath: 'daoju/sel_ui/gun_6',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'jinzhan_1',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/jinzhan_1',
            iconPath: 'daoju/sel_ui/jinzhan_1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'jinzhan_2',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/jinzhan_2',
            iconPath: 'daoju/sel_ui/jinzhan_2',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'jinzhan_3',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/jinzhan_3',
            iconPath: 'daoju/sel_ui/jinzhan_3',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'jinzhan_4',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/jinzhan_4',
            iconPath: 'daoju/sel_ui/jinzhan_4',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'jinzhan_5',
            type: Lv318ItemType.Gun,
            prefabPath: 'gun/jinzhan_5',
            iconPath: 'daoju/sel_ui/jinzhan_5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_al',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_al',
            iconPath: 'role/sel_ui/al1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'char_al_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_al_js',
            iconPath: 'role/sel_ui/al5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'char_bnn',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_bnn',
            iconPath: 'role/sel_ui/bnn1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_bnn_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_bnn_js',
            iconPath: 'role/sel_ui/bnn5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_md',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_md',
            iconPath: 'role/sel_ui/md1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'char_md_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_md_js',
            iconPath: 'role/sel_ui/md5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'char_mm',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_mm',
            iconPath: 'role/sel_ui/mm1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_mm_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_mm_js',
            iconPath: 'role/sel_ui/mm5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_nn',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_nn',
            iconPath: 'role/sel_ui/nn1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_nn_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_nn_js',
            iconPath: 'role/sel_ui/nn5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_pj',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_pj',
            iconPath: 'role/sel_ui/pj1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'char_pj_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_pj_js',
            iconPath: 'role/sel_ui/pj5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'char_qe',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_qe',
            iconPath: 'role/sel_ui/qe1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_qe_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_qe_js',
            iconPath: 'role/sel_ui/qe5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_ww',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_ww',
            iconPath: 'role/sel_ui/ww1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_ww_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_ww_js',
            iconPath: 'role/sel_ui/ww5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_xt',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_xt',
            iconPath: 'role/sel_ui/xt1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'char_xt_js',
            type: Lv318ItemType.Character,
            prefabPath: 'role/char_xt_js',
            iconPath: 'role/sel_ui/xt5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_1',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf1',
            iconPath: 'clothes/sel_ui/yf1',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_2',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf2',
            iconPath: 'clothes/sel_ui/yf2',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_3',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf3',
            iconPath: 'clothes/sel_ui/yf3',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'yf_4',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf4',
            iconPath: 'clothes/sel_ui/yf4',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'yf_5',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf5',
            iconPath: 'clothes/sel_ui/yf5',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_6',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf6',
            iconPath: 'clothes/sel_ui/yf6',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_7',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf7',
            iconPath: 'clothes/sel_ui/yf7',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_9',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf9',
            iconPath: 'clothes/sel_ui/yf9',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null,
            needVideo:true
        },
        {
            id: 'yf_8',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf8',
            iconPath: 'clothes/sel_ui/yf8',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'yf_10',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf10',
            iconPath: 'clothes/sel_ui/yf10',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null       
        },
        {
            id: 'yf_11',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf11',
            iconPath: 'clothes/sel_ui/yf11',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        },
        {
            id: 'yf_12',
            type: Lv318ItemType.Wearable,
            prefabPath: 'clothes/yf12',
            iconPath: 'clothes/sel_ui/yf12',
            gridSnap: false,
            prefab: null,
            iconSpriteFrame: null
        }
    ];
}

