/**
 * lv384 物理管理器
 * 管理：碰撞矩阵、物理世界、物品生成
 */

import GameData from "../script/common/GameData";
import FeedPhysicsItemBase from "./feedPhysicsItemBase_lv384";
import feedSpawnedPhysicsItem_lv384 from "./feedSpawnedPhysicsItem_lv384";
import feedSpitPhysicsItem_lv384 from "./feedSpitPhysicsItem_lv384";
import { ItemType, getItemConfig } from "./feed_config_384";

const { ccclass, property } = cc._decorator;

/** 碰撞分组定义 */
export enum CollisionGroup {
    DEFAULT = 'default',
    HEAD_UPPER = 'head_upper',
    HEAD_LOWER = 'mouth',
    SPAWNED_ITEM = 'spawnedItem',   // 点击生成的物品
    SPIT_OUT_ITEM = 'spitOutItem'   // 吐出的物品
}

@ccclass
export default class feedPhysicsManager_lv384 extends cc.Component {
    @property(cc.Node)
    physicsWorldNode: cc.Node = null;   // 物理世界节点

    @property(cc.Node)
    spawnedItemsParent: cc.Node = null; // 生成物品的父节点

    @property(cc.Node)
    spitOutItemsParent: cc.Node = null; // 吐出物品的父节点

    @property(cc.Prefab)
    physicsItemPrefab: cc.Prefab = null; // 生成物兜底（分包内按 ItemType 预制体加载失败时使用）

    @property(cc.Prefab)
    spitPhysicsItemPrefab: cc.Prefab = null; // 吐出物兜底

    @property({ tooltip: "物理物节点在屏幕坐标下超出可视区超过该像素则销毁（生成物/吐出物）" })
    offscreenRecycleMarginPx: number = 160;

    // 物理管理器实例
    private static instance: feedPhysicsManager_lv384 = null;

    private offscreenCheckAcc: number = 0;
    private readonly offscreenCheckInterval: number = 0.12;

    private prefabCache: { [path: string]: cc.Prefab } = {};

    onLoad() {
        feedPhysicsManager_lv384.instance = this;
        this.setupCollisionMatrix();
        this.enablePhysicsSystem();
    }

    update(dt: number): void {
        this.offscreenCheckAcc += dt;
        if (this.offscreenCheckAcc < this.offscreenCheckInterval) {
            return;
        }
        this.offscreenCheckAcc = 0;
        this.recycleOffscreenPhysicsItems();
    }

    onDestroy() {
        if (feedPhysicsManager_lv384.instance === this) {
            feedPhysicsManager_lv384.instance = null;
        }
    }

    /**
     * 可视区外（屏幕坐标 + 边距）的 spawned / spit 节点销毁，减轻物理与渲染负担
     */
    private recycleOffscreenPhysicsItems(): void {
        const camera = cc.Camera.main;
        if (!camera) {
            return;
        }
        const vs = cc.view.getVisibleSize();
        const vo = cc.view.getVisibleOrigin();
        const m = Math.max(0, this.offscreenRecycleMarginPx);
        this.recycleOffscreenUnderParent(this.spawnedItemsParent, camera, vs, vo, m);
        this.recycleOffscreenUnderParent(this.spitOutItemsParent, camera, vs, vo, m);
    }

    private recycleOffscreenUnderParent(
        parent: cc.Node,
        camera: cc.Camera,
        vs: cc.Size,
        vo: cc.Vec2,
        margin: number
    ): void {
        if (!parent || !parent.isValid) {
            return;
        }
        for (let i = parent.children.length - 1; i >= 0; i--) {
            const child = parent.children[i];
            if (!child || !child.isValid || !child.active) {
                continue;
            }
            const base = child.getComponent(FeedPhysicsItemBase);
            if (base && base.isDraggingActive()) {
                continue;
            }
            const spawned = child.getComponent(feedSpawnedPhysicsItem_lv384);
            if (spawned && spawned.getIsEaten()) {
                continue;
            }
            const w = child.convertToWorldSpaceAR(cc.v2(0, 0));
            const sp = camera.getWorldToScreenPoint(cc.v3(w.x, w.y, 0));
            if (
                sp.x < vo.x - margin ||
                sp.x > vo.x + vs.width + margin ||
                sp.y < vo.y - margin ||
                sp.y > vo.y + vs.height + margin
            ) {
                child.destroy();
            }
        }
    }

    /**
     * 获取实例
     */
    public static getInstance(): feedPhysicsManager_lv384 {
        return feedPhysicsManager_lv384.instance;
    }

    /**
     * 设置碰撞矩阵
     * 注意：Cocos Creator 2.x 中碰撞矩阵需要在编辑器中配置
     * 项目设置 -> 物理 -> 碰撞矩阵
     */
    private setupCollisionMatrix(): void {
        const physicsManager = cc.director.getPhysicsManager();
        if (!physicsManager) {
            cc.warn('[feedPhysicsManager_lv384] 物理管理器未启用');
            return;
        }

        // 启用物理碰撞检测
        physicsManager.enabled = true;
        physicsManager.enabledAccumulator = false;

        // 在 Cocos Creator 2.x 中，碰撞矩阵应在编辑器中配置
        // 代码中不再调用 setCollisionPair（该API在2.x中不存在）
        cc.log('[feedPhysicsManager_lv384] 碰撞矩阵请在编辑器项目设置中配置');
    }

    /**
     * 启用物理系统
     */
    private enablePhysicsSystem(): void {
        const physicsManager = cc.director.getPhysicsManager();
        if (physicsManager) {
            physicsManager.enabled = true;
            // 设置重力
            physicsManager.gravity = cc.v2(0, -980);
            // 设置物理步长
            physicsManager['updateRate'] = 1;
            physicsManager.debugDrawFlags = 0;
        }
    }

    private getFallbackPrefab(isSpawned: boolean): cc.Prefab | null {
        return isSpawned
            ? this.physicsItemPrefab
            : (this.spitPhysicsItemPrefab || this.physicsItemPrefab);
    }

    /**
     * 从关卡分包加载预制体（相对分包根路径，无 .prefab 后缀）
     */
    private loadPrefabFromLevelBundle(prefabPath: string, onDone: (prefab: cc.Prefab | null) => void): void {
        const cached = this.prefabCache[prefabPath];
        if (cached) {
            onDone(cached);
            return;
        }

        const bundleName = GameData.curGameStyle;
        const bundle = cc.assetManager.getBundle(bundleName);
        if (!bundle) {
            cc.warn(`[feedPhysicsManager_lv384] 分包未加载: ${bundleName}，无法加载 ${prefabPath}`);
            onDone(null);
            return;
        }

        bundle.load(prefabPath, cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err || !prefab) {
                cc.warn(`[feedPhysicsManager_lv384] 预制体加载失败: ${prefabPath}`, err ? err.message : '');
                onDone(null);
                return;
            }
            this.prefabCache[prefabPath] = prefab;
            onDone(prefab);
        });
    }

    /**
     * 异步创建物理物品（按配置路径加载 prefab；失败则回退编辑器绑定的兜底预制体）
     */
    public createPhysicsItemAsync(
        prefabPath: string | null | undefined,
        position: cc.Vec2,
        isSpawned: boolean,
        itemTypeOrId: number,
        onComplete: (node: cc.Node | null) => void
    ): void {
        if (isSpawned) {
            this.enforceSpawnedCapBeforeAdd(itemTypeOrId);
        }
        const tryBuild = (prefab: cc.Prefab | null) => {
            const p = prefab || this.getFallbackPrefab(isSpawned);
            if (!p) {
                cc.error('[feedPhysicsManager_lv384] 无可用物理预制体（分包路径失败且未绑定兜底 prefab）');
                onComplete(null);
                return;
            }
            const node = this.buildPhysicsItemNode(p, position, isSpawned, itemTypeOrId);
            onComplete(node);
        };

        if (!prefabPath) {
            tryBuild(null);
            return;
        }

        this.loadPrefabFromLevelBundle(prefabPath, (loaded) => {
            tryBuild(loaded);
        });
    }

    /**
     * 点击格子生成物：按 ItemConfig.maxSpawnedInScene 回收最旧实例（水/墨水=150 FIFO，其余单例）。
     */
    private enforceSpawnedCapBeforeAdd(itemTypeOrId: number): void {
        const cfg = getItemConfig(itemTypeOrId as ItemType);
        if (!cfg || !this.spawnedItemsParent) {
            return;
        }
        const cap = cfg.maxSpawnedInScene;
        if (cap === undefined || cap <= 0) {
            return;
        }

        const parent = this.spawnedItemsParent;
        const collect = (): cc.Node[] => {
            const out: cc.Node[] = [];
            for (let i = 0; i < parent.children.length; i++) {
                const c = parent.children[i];
                const sp = c.getComponent(feedSpawnedPhysicsItem_lv384);
                if (sp && sp.getItemConfigType() === (itemTypeOrId as ItemType)) {
                    out.push(c);
                }
            }
            out.sort((a, b) => a.getSiblingIndex() - b.getSiblingIndex());
            return out;
        };

        let same = collect();
        // destroy() 可能本帧末才真正从 parent.children 摘掉，若不先脱离父节点，collect() 会一直满额 → while 死循环卡死主线程
        let guard = 0;
        const maxGuard = Math.max(cap * 2, 128);
        while (same.length >= cap && guard < maxGuard) {
            guard++;
            const oldest = same[0];
            if (oldest && oldest.isValid) {
                oldest.removeFromParent(false);
                oldest.destroy();
            } else {
                cc.warn("[feedPhysicsManager_lv384] enforceSpawnedCapBeforeAdd: 跳过无效最旧节点");
                break;
            }
            same = collect();
        }
        if (guard >= maxGuard) {
            cc.error("[feedPhysicsManager_lv384] enforceSpawnedCapBeforeAdd: 回收同类型生成物超过安全次数，请检查场景节点状态");
        }
    }

    private buildPhysicsItemNode(
        prefab: cc.Prefab,
        position: cc.Vec2,
        isSpawned: boolean,
        itemTypeOrId: number
    ): cc.Node | null {
        const itemNode = cc.instantiate(prefab);
        if (!itemNode) {
            return null;
        }

        const nodeId = isSpawned ? `spawned_${itemTypeOrId}` : `spit_${itemTypeOrId}`;
        itemNode.name = `physics_item_${nodeId}`;
        itemNode.active = false;

        const rigidBody = itemNode.getComponent(cc.RigidBody);
        if (rigidBody) {
            rigidBody.type = cc.RigidBodyType.Dynamic;
            rigidBody.gravityScale = 1;
            rigidBody.allowSleep = true;
            rigidBody.linearDamping = 0.5;
            rigidBody.angularDamping = 0.06;
            rigidBody.linearVelocity = cc.v2(0, 0);
            rigidBody.angularVelocity = 0;
            rigidBody.enabledContactListener = true;
        }

        if (isSpawned) {
            itemNode.group = CollisionGroup.SPAWNED_ITEM;
        } else {
            itemNode.group = CollisionGroup.SPIT_OUT_ITEM;
        }

        const parent = isSpawned
            ? this.spawnedItemsParent
            : this.spitOutItemsParent;
        if (parent) {
            parent.addChild(itemNode);
        } else {
            this.node.addChild(itemNode);
        }

        const targetParent = itemNode.parent;
        if (targetParent) {
            itemNode.setPosition(targetParent.convertToNodeSpaceAR(position));
        } else {
            itemNode.setPosition(position);
        }

        // 生成物需盖在 UI/食物格之上；喷射物若与下巴同父排序，不应再用极限 zIndex
        itemNode.zIndex = isSpawned ? cc.macro.MAX_ZINDEX - 10 : 0;
        itemNode.setSiblingIndex(itemNode.parent ? itemNode.parent.childrenCount - 1 : 0);

        if (rigidBody) {
            rigidBody.syncPosition(true);
        }

        if (isSpawned) {
            const spawned = itemNode.getComponent(feedSpawnedPhysicsItem_lv384);
            if (spawned) {
                spawned.init(itemTypeOrId);
                spawned.setItemConfigType(itemTypeOrId as ItemType);
            } else {
                cc.error('[feedPhysicsManager_lv384] 生成物预制体缺少 feedSpawnedPhysicsItem_lv384');
            }
        } else {
            const spit = itemNode.getComponent(feedSpitPhysicsItem_lv384);
            if (spit) {
                spit.init(itemTypeOrId);
            } else {
                const spawned = itemNode.getComponent(feedSpawnedPhysicsItem_lv384);
                if (spawned) {
                    spawned.init(itemTypeOrId);
                    spawned.setItemConfigType(itemTypeOrId as ItemType);
                } else {
                    cc.error('[feedPhysicsManager_lv384] 吐出物预制体缺少 feedSpitPhysicsItem_lv384 或 feedSpawnedPhysicsItem_lv384');
                }
            }
        }

        itemNode.active = true;
        return itemNode;
    }

    /**
     * 批量生成吐出物品（带物理效果）；贴图依赖兜底 spit 预制体
     * @param spawnPos 生成位置（嘴巴位置）
     * @param count 生成数量
     * @param spreadAngle 扩散角度
     * @param force 喷射力度
     */
    public spawnSpitOutItems(
        spawnPos: cc.Vec2,
        count: number = 240,
        spreadAngle: number = 36,
        force: number = 1250
    ): void {
        for (let i = 0; i < count; i++) {
            const angleStep = count > 1 ? spreadAngle / (count - 1) : 0;
            const angle = -spreadAngle / 2 + angleStep * i;
            const radian = angle * Math.PI / 180;

            const jitter = cc.v2(Math.random() * 20 - 10, Math.random() * 20 - 10);
            const worldPos = cc.v2(spawnPos.x + jitter.x, spawnPos.y + jitter.y);

            this.createPhysicsItemAsync(
                null,
                worldPos,
                false,
                i,
                (item) => {
                    if (!item) {
                        return;
                    }
                    const rigidBody = item.getComponent(cc.RigidBody);
                    if (rigidBody) {
                        const vx = Math.cos(radian) * force;
                        const vy = Math.sin(radian) * force;
                        const mass = Math.max(rigidBody.getMass(), 1e-4);
                        const inertia = Math.max(rigidBody.getInertia(), 1e-4);
                        const wc = rigidBody.getWorldCenter();
                        rigidBody.applyLinearImpulse(cc.v2(vx * mass, vy * mass), wc, true);
                        const omega = Math.random() * 360 - 180;
                        rigidBody.applyAngularImpulse(omega * inertia, true);
                    }
                }
            );
        }
    }

    /**
     * 清理所有物理物品
     */
    public clearAllItems(): void {
        if (this.spawnedItemsParent) {
            this.spawnedItemsParent.removeAllChildren();
        }
        if (this.spitOutItemsParent) {
            this.spitOutItemsParent.removeAllChildren();
        }
    }

    /**
     * 设置重力
     */
    public setGravity(gravity: cc.Vec2): void {
        const physicsManager = cc.director.getPhysicsManager();
        if (physicsManager) {
            physicsManager.gravity = gravity;
        }
    }
}
