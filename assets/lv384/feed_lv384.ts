import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import {
    ItemType,
    ItemConfig,
    ItemCategory,
    getItemConfig,
    resolveSpawnPhysicsPrefabPath,
    resolveEatSpitPrefabPath,
    SpecialEffectType,
    FACE_ANIMATIONS,
    LV384_ITEM_GRID_ORDER
} from "./feed_config_384";
import feedCharacterPhysics_lv384 from "./feedCharacterPhysics_lv384";
import feedItem_lv384 from "./feedItem_lv384";
import feedPhysicsManager_lv384 from "./feedPhysicsManager_lv384";
import { FEED_PHYSICS_ITEM_SUN_PROP_REACT } from "./feedSpawnedPhysicsItem_lv384";
import {
    LV384_BGM_KEY,
    tryPlayLv384AnimSound,
    playLv384SpitOnce
} from "./feed_audio_lv384";

/** 拖鞋：首段「拖鞋1」结束后循环 */
const LV384_SUN_BODY_LOOP_AFTER_SLIPPER = "拖鞋1_2";
/** 鞭子：首段「鞭子」结束后循环 */
const LV384_SUN_BODY_LOOP_AFTER_WHIP = "鞭子2";

const { ccclass, property } = cc._decorator;

/**
 * 咕咕嘎嘎喂食 lv384 主游戏逻辑
 * 
 * 新动画架构：
 * 1. 脸部动画（yj_ske）- 嵌套在headUpper节点内，用于普通道具和食物
 * 2. 全身动画 - 特殊道具触发，在全身动画层播放，需隐藏角色各部分节点，点击屏幕恢复
 */
@ccclass
export default class feed_lv384 extends BaseGame {
    private static readonly waterStreamInterval = 0.08;

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    characterNode: cc.Node = null;

    @property(cc.Node)
    itemGridNode: cc.Node = null;      // ScrollView节点

    @property(cc.Node)
    itemGridContent: cc.Node = null;   // ScrollView的content节点

    @property(cc.Node)
    mouthNode: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    resetBtn: cc.Node = null;

    @property(cc.Node)
    spitOutNode: cc.Node = null;

    // 物理系统相关
    @property(feedCharacterPhysics_lv384)
    characterPhysics: feedCharacterPhysics_lv384 = null;

    @property(feedPhysicsManager_lv384)
    physicsManager: feedPhysicsManager_lv384 = null;

    @property(cc.Node)
    spawnedItemsParent: cc.Node = null;

    @property(cc.Node)
    spitOutItemsParent: cc.Node = null;

    @property(cc.Node)
    qiangNode: cc.Node = null;                 // 左侧墙壁节点（兼容旧绑定）

    /** 左墙：适配屏幕左边界；不绑则从 PhysicsManager 下取 qiangzuo */
    @property(cc.Node)
    qiangzuoNode: cc.Node = null;

    /** 右墙：适配屏幕右边界；不绑则从 PhysicsManager 下取 qiangyou */
    @property(cc.Node)
    qiangyouNode: cc.Node = null;

    /** 上墙：场景上边界、水平居中；不绑则从 PhysicsManager 下取 qiangshang */
    @property(cc.Node)
    qiangshangNode: cc.Node = null;
    

    /** 下墙：场景下边界、水平居中；不绑则从 PhysicsManager 下取 qiangxia */
    @property(cc.Node)
    qiangxiaNode: cc.Node = null;

    // ===== 新动画架构节点 =====
    @property(cc.Node)
    headUpperNode: cc.Node = null;          // 头上半部分节点（包含yj_ske）

    @property(cc.Node)
    characterPartsNode: cc.Node = null;      // 角色各部分节点父节点

    @property(cc.Node)
    fullBodyAnimNode: cc.Node = null;        // 全身动画节点层

    @property(dragonBones.ArmatureDisplay)
    faceArmature: dragonBones.ArmatureDisplay = null;   // 脸部龙骨引用

    @property(dragonBones.ArmatureDisplay)
    fullBodyArmature: dragonBones.ArmatureDisplay = null; // 全身龙骨引用

    /** 与水相同：点击后持续生成，值为当前正在流的道具类型（水 / 墨水） */
    private gridStreamItemType: ItemType | null = null;
    /** 场景里角色根节点初始角度（度），采一次 */
    private characterEditorInitialAngle: number = 0;
    private characterEditorAngleCaptured: boolean = false;
    /** 首次 reset 保留角色根角度与进关一致 */
    private firstGameplayResetPreserveCharacter: boolean = true;
    private isEating: boolean = false;
    private isPlayingFullBodyAnim: boolean = false;
    private fullBodyAnimSessionId: number = 0;

    private sunBodyNode: cc.Node = null;
    private sunBodyArmature: dragonBones.ArmatureDisplay = null;
    private sunHornArmatures: { [key: string]: dragonBones.ArmatureDisplay } = {};
    private sunBodyReactionAnim: string | null = null;
    private sunHornReactionAnim: { [hornName: string]: string | null } = {};
    /** 拖鞋/鞭子两段式：递增以作废未触发的 COMPLETE 回调 */
    private sunBodyTwoPhaseSessionId = 0;

    /** 进关时采一次太阳身体/各角相对 characterNode 的本地位姿，供重置键写回（物理 Dynamic 会位移） */
    private sunPhysicsRestCaptured: boolean = false;
    private sunBodyRestLocalX: number = 0;
    private sunBodyRestLocalY: number = 0;
    private sunBodyRestAngle: number = 0;
    private sunHornRestLocal: { [key: string]: { x: number; y: number; angle: number } } = {};

    onLoad() {
        cc.game.setFrameRate(60);
        GameData.PauseGame = false;
        AudioManager.stopMusic();
    }

    start() {
        this.initItemGrid();
        this.initCharacter();
        this.bridgePhysicsManagerParents();
        this.reparentSpitLayerBelowChin();
        this.adjustQiangPosition();
        this.registerEvents();
        this.initAnimationSystem();

        // 进关清一次场（须在 schedule BGM 之前，避免 unscheduleAllCallbacks 取消背景音乐）
        this.applyGameplayReset();

        this.scheduleOnce(() => {
            AudioManager.playMusic(LV384_BGM_KEY, true, 0.7);
        }, 0.5);
    }

    private initItemGrid(): void {
        if (!this.itemPrefab) return;

        // 获取content节点
        let contentNode = this.itemGridContent;
        if (!contentNode && this.itemGridNode) {
            // 尝试从ScrollView获取content
            const scrollView = this.itemGridNode.getComponent(cc.ScrollView);
            if (scrollView) {
                contentNode = scrollView.content;
            }
        }

        if (!contentNode) {
            cc.warn('[feed_lv384] itemGridContent 未设置，无法初始化格子');
            return;
        }

        contentNode.removeAllChildren();

        for (let k = 0; k < LV384_ITEM_GRID_ORDER.length; k++) {
            const itemType = LV384_ITEM_GRID_ORDER[k];
            const itemNode = cc.instantiate(this.itemPrefab);
            itemNode.name = `item_${itemType}`;
            contentNode.addChild(itemNode);

            const itemComp = itemNode.getComponent(feedItem_lv384);
            if (itemComp) {
                itemComp.setItemType(itemType);
                itemComp.setMainGame(this);
                itemComp.setWaterActiveVisual(false);
            } else {
                cc.warn('[feed_lv384] itemPrefab 缺少 feedItem_lv384 组件');
            }
        }
    }

    public onGridItemClick(itemType: ItemType): void {
        if (itemType === ItemType.SunWater || itemType === ItemType.SunMirror) {
            this.startGridItemStream(itemType);
            return;
        }
        this.stopGridItemStream();
        this.spawnPhysicsItem(itemType);
    }

    private initCharacter(): void {
        // 初始状态确保角色部分可见，全身动画隐藏
        if (this.characterPartsNode) {
            this.characterPartsNode.active = true;
        }
        if (this.fullBodyAnimNode) {
            this.fullBodyAnimNode.active = false;
        }
        this.captureCharacterEditorAngleOnce();
        this.captureSunPhysicsRestStateOnce();
    }

    /** 主控上绑了 spawned/spit 父节点但物理管理器未绑时，自动补上，避免实例挂到错误层级不可见 */
    private bridgePhysicsManagerParents(): void {
        const mgr = this.physicsManager || feedPhysicsManager_lv384.getInstance();
        if (!mgr) return;
        if (!mgr.spawnedItemsParent && this.spawnedItemsParent) {
            mgr.spawnedItemsParent = this.spawnedItemsParent;
        }
        if (this.spitOutNode) {
            mgr.spitOutItemsParent = this.spitOutNode;
        } else if (!mgr.spitOutItemsParent && this.spitOutItemsParent) {
            mgr.spitOutItemsParent = this.spitOutItemsParent;
        }
    }

    /**
     * 喷射物父节点若在 PhysicsManager（根上晚于 characterLayer），整层会盖在角色之上，调子节点 zIndex 无效。
     * 挂到 characterPhysics 下并插在 headLower 之前，绘制顺序在下巴之下；世界坐标 spawn 仍用 convertToNodeSpaceAR，逻辑不变。
     */
    private reparentSpitLayerBelowChin(): void {
        const mgr = this.physicsManager || feedPhysicsManager_lv384.getInstance();
        const spitParent = mgr && mgr.spitOutItemsParent;
        const charPhy = this.characterPhysics;
        const headLower = charPhy && charPhy.headLower;
        if (!spitParent || !charPhy || !headLower) {
            return;
        }
        const host = charPhy.node;
        const headIdx = headLower.getSiblingIndex();
        if (spitParent.parent === host) {
            if (spitParent.getSiblingIndex() === headIdx - 1) {
                return;
            }
            host.insertChild(spitParent, headIdx);
            return;
        }
        spitParent.removeFromParent(false);
        host.insertChild(spitParent, headIdx);
    }

    /**
     * 墙位置：与 lv379 `qiang` 相同算法——按 Canvas 可视宽度算左右边界；
     * qiangzuo 贴左、qiangyou 贴右；左边界 x 不低于 -600，右边界 x 不超过 600（与左对称）。
     * qiangshang / qiangxia：按 Canvas 可视高度贴上/下边界，x 为屏幕水平中心（0）。
     */
    private adjustQiangPosition(): void {
        const mgr = this.physicsManager || feedPhysicsManager_lv384.getInstance();

        const canvas = cc.find('Canvas');
        if (!canvas) {
            return;
        }

        const canvasWidth = canvas.width;
        const canvasScale = canvas.scaleX;
        const halfScreenWidthInCanvas = (canvasWidth * canvasScale) / 2;
        const screenLeftEdgeX = -halfScreenWidthInCanvas;
        const screenRightEdgeX = halfScreenWidthInCanvas;

        const canvasHeight = canvas.height;
        const canvasScaleY = canvas.scaleY;
        const halfScreenHeightInCanvas = (canvasHeight * Math.abs(canvasScaleY)) / 2;
        const screenTopEdgeY = halfScreenHeightInCanvas;
        const screenBottomEdgeY = -halfScreenHeightInCanvas;
        const centerX = 0;

        let leftX = screenLeftEdgeX;
        if (leftX < -600) {
            leftX = -600;
        }
        let rightX = screenRightEdgeX;
        if (rightX > 600) {
            rightX = 600;
        }

        let qiangzuo = this.qiangzuoNode;
        if (!qiangzuo && mgr) {
            qiangzuo = mgr.node.getChildByName('qiangzuo');
        }
        if (qiangzuo && qiangzuo.isValid) {
            qiangzuo.x = leftX;
        }

        let qiangyou = this.qiangyouNode;
        if (!qiangyou && mgr) {
            qiangyou = mgr.node.getChildByName('qiangyou');
        }
        if (qiangyou && qiangyou.isValid) {
            qiangyou.x = rightX;
        }

        let qiangshang = this.qiangshangNode;
        if (!qiangshang && mgr) {
            qiangshang = mgr.node.getChildByName('qiangshang');
        }
        if (qiangshang && qiangshang.isValid) {
            qiangshang.x = centerX;
            qiangshang.y = screenTopEdgeY;
        }

        let qiangxia = this.qiangxiaNode;
        if (!qiangxia && mgr) {
            qiangxia = mgr.node.getChildByName('qiangxia');
        }
        if (qiangxia && qiangxia.isValid) {
            qiangxia.x = centerX;
            qiangxia.y = screenBottomEdgeY;
        }

        if (!this.qiangNode && mgr) {
            this.qiangNode = mgr.node.getChildByName('qiang');
        }
        // 兼容旧「qiang」左墙：只改 x。若场景里有两个同名子节点「qiang」（上/下横墙），
        // getChildByName 只会得到第一个，不能把左墙 x 写到上墙，否则会覆盖上面已设好的居中 x。
        if (this.qiangNode && this.qiangNode.isValid) {
            if (this.qiangNode !== qiangzuo && this.qiangNode !== qiangshang && this.qiangNode !== qiangxia) {
                this.qiangNode.x = leftX;
            }
        }
    }

    private initAnimationSystem(): void {
        // 尝试从headUpper节点获取脸部龙骨
        if (!this.faceArmature && this.headUpperNode) {
            this.faceArmature = this.headUpperNode.getComponentInChildren(dragonBones.ArmatureDisplay);
        }

        // 初始化脸部龙骨为待机 pt
        if (this.faceArmature) {
            this.playFaceAnimation(FACE_ANIMATIONS.PT, 0);
        }
    }

    private captureCharacterEditorAngleOnce(): void {
        if (this.characterEditorAngleCaptured || !this.characterNode || !this.characterNode.isValid) {
            return;
        }
        this.characterEditorInitialAngle = this.characterNode.angle;
        this.characterEditorAngleCaptured = true;
    }

    private captureSunPhysicsRestStateOnce(): void {
        if (this.sunPhysicsRestCaptured || !this.characterNode || !this.characterNode.isValid) {
            return;
        }
        this.ensureSunAnimationRefs();
        if (!this.sunBodyNode || !this.sunBodyNode.isValid) {
            return;
        }
        this.sunBodyRestLocalX = this.sunBodyNode.x;
        this.sunBodyRestLocalY = this.sunBodyNode.y;
        this.sunBodyRestAngle = this.sunBodyNode.angle;
        this.sunHornRestLocal = {};
        for (let i = 1; i <= 9; i++) {
            const hornName = `jiao${i}_ske`;
            const hornNode = this.characterNode.getChildByName(hornName);
            if (hornNode && hornNode.isValid) {
                this.sunHornRestLocal[hornName] = {
                    x: hornNode.x,
                    y: hornNode.y,
                    angle: hornNode.angle
                };
            }
        }
        this.sunPhysicsRestCaptured = true;
    }

    /** 重置键：太阳身体与各角本地坐标/角度 + 刚体速度清零 + 龙骨回待机 */
    private restoreSunPhysicsToRest(): void {
        if (!this.sunPhysicsRestCaptured || !this.characterNode || !this.characterNode.isValid) {
            return;
        }
        this.ensureSunAnimationRefs();
        if (this.sunBodyNode && this.sunBodyNode.isValid) {
            this.sunBodyNode.setPosition(this.sunBodyRestLocalX, this.sunBodyRestLocalY);
            this.sunBodyNode.angle = this.sunBodyRestAngle;
            const rb = this.sunBodyNode.getComponent(cc.RigidBody);
            if (rb && rb.isValid) {
                rb.linearVelocity = cc.v2(0, 0);
                rb.angularVelocity = 0;
                rb.syncPosition(true);
                rb.syncRotation(true);
            }
        }
        for (const hornName in this.sunHornRestLocal) {
            const hornNode = this.characterNode.getChildByName(hornName);
            const rest = this.sunHornRestLocal[hornName];
            if (!hornNode || !hornNode.isValid || !rest) {
                continue;
            }
            hornNode.setPosition(rest.x, rest.y);
            hornNode.angle = rest.angle;
            const hrb = hornNode.getComponent(cc.RigidBody);
            if (hrb && hrb.isValid) {
                hrb.linearVelocity = cc.v2(0, 0);
                hrb.angularVelocity = 0;
                hrb.syncPosition(true);
                hrb.syncRotation(true);
            }
        }
        this.resetSunReactionAnimState();
        this.playSunIdleAnimationsAfterReset();
    }

    private playSunIdleAnimationsAfterReset(): void {
        this.ensureSunAnimationRefs();
        const bodyIdle = "正常待机";
        if (this.sunBodyArmature && this.hasDragonAnimation(this.sunBodyArmature, bodyIdle)) {
            this.sunBodyArmature.timeScale = 1;
            this.sunBodyArmature.playAnimation(bodyIdle, -1);
        }
        const hornIdle = "正常";
        for (const hornName in this.sunHornArmatures) {
            const disp = this.sunHornArmatures[hornName];
            if (disp && disp.isValid && this.hasDragonAnimation(disp, hornIdle)) {
                disp.timeScale = 1;
                disp.playAnimation(hornIdle, -1);
            }
        }
    }

    private getGridItemComp(itemType: ItemType): feedItem_lv384 | null {
        if (!this.itemGridContent) {
            return null;
        }
        for (let i = 0; i < this.itemGridContent.childrenCount; i++) {
            const comp = this.itemGridContent.children[i].getComponent(feedItem_lv384);
            if (comp && comp.getItemType() === itemType) {
                return comp;
            }
        }
        return null;
    }

    private syncStreamGridVisual(): void {
        const waterItem = this.getGridItemComp(ItemType.SunWater);
        if (waterItem) {
            waterItem.setWaterActiveVisual(this.gridStreamItemType === ItemType.SunWater);
        }
        const inkItem = this.getGridItemComp(ItemType.SunMirror);
        if (inkItem) {
            inkItem.setWaterActiveVisual(this.gridStreamItemType === ItemType.SunMirror);
        }
    }

    private startGridItemStream(itemType: ItemType): void {
        if (this.gridStreamItemType === itemType) {
            this.syncStreamGridVisual();
            return;
        }
        this.unschedule(this.spawnGridStreamTick);
        this.gridStreamItemType = itemType;
        this.syncStreamGridVisual();
        this.spawnGridStreamTick();
        this.schedule(this.spawnGridStreamTick, feed_lv384.waterStreamInterval);
    }

    private stopGridItemStream(): void {
        if (this.gridStreamItemType === null) {
            return;
        }
        this.gridStreamItemType = null;
        this.unschedule(this.spawnGridStreamTick);
        this.syncStreamGridVisual();
    }

    private spawnGridStreamTick(): void {
        if (this.gridStreamItemType === null) {
            return;
        }
        this.spawnPhysicsItem(this.gridStreamItemType, this.getWaterStreamSpawnWorldPosition());
    }

    private getWaterStreamSpawnWorldPosition(): cc.Vec2 {
        return this.getPhysicsSpawnWorldPositionAtScreenCenter();
    }

    private registerEvents(): void {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }      
        if (this.resetBtn) {

            console.log("绑定重置按钮");
            
            this.resetBtn.on(cc.Node.EventType.TOUCH_END, this.onResetClick, this);
        }

        // 点击屏幕关闭全身动画
        this.node.on(cc.Node.EventType.TOUCH_END, this.onScreenClick, this);

        // 监听物理物品碰撞喂食事件（嘴部吞食）
        cc.director.on("feedPhysicsItem_eaten", this.onPhysicsItemEaten, this);
        cc.director.on(FEED_PHYSICS_ITEM_SUN_PROP_REACT, this.onSunPropReact, this);
    }

    onDestroy() {
        cc.director.off("feedPhysicsItem_eaten", this.onPhysicsItemEaten, this);
        cc.director.off(FEED_PHYSICS_ITEM_SUN_PROP_REACT, this.onSunPropReact, this);
    }

    /**
     * 物理物品被吃掉时的回调
     */
    private onPhysicsItemEaten(event: any): void {
        const itemConfigType: ItemType = event.itemConfigType;
        const itemNode: cc.Node = event.itemNode;
        if (itemConfigType > ItemType.None) {
            this.feedCharacter(itemConfigType, itemNode);
        }
    }

    private onScreenClick(event: cc.Event.EventTouch): void {
        // 全身动画层显示时，点击屏幕与重置键一致：收起全身层并清场、嘴闭合等
        if (this.isPlayingFullBodyAnim) {
            this.applyGameplayReset();
        }
    }

    /**
     * 播放脸部动画（yj_ske）
     */
    public playFaceAnimation(animName: string, playTimes: number = 1, callback?: () => void): void {
        if (!this.faceArmature) {
            // 尝试重新获取
            if (this.headUpperNode) {
                this.faceArmature = this.headUpperNode.getComponentInChildren(dragonBones.ArmatureDisplay);
            }
        }

        if (this.faceArmature) {
            this.faceArmature.playAnimation(animName, playTimes);
            tryPlayLv384AnimSound(animName, playTimes, false);
            if (callback && playTimes > 0) {
                this.addOneTimeListener(this.faceArmature, () => callback());
            }
        }
    }

    /**
     * 播放全身动画（特殊道具）
     * 隐藏角色各部分，显示全身动画层
     */
    public playFullBodyAnimation(animName: string, playTimes: number = -1, bodyIdleAnimName?: string): void {
        if (!this.fullBodyArmature || !this.characterPartsNode || !this.fullBodyAnimNode) return;

        const session = ++this.fullBodyAnimSessionId;

        // 标记正在播放全身动画
        this.isPlayingFullBodyAnim = true;

        // 隐藏角色各部分
        this.characterPartsNode.active = false;

        // 显示全身动画层
        this.fullBodyAnimNode.active = true;

        if (bodyIdleAnimName) {
            this.fullBodyArmature.playAnimation(animName, 1);
            tryPlayLv384AnimSound(animName, 1, true);
            this.addOneTimeListener(this.fullBodyArmature, () => {
                if (this.fullBodyAnimSessionId !== session || !this.isPlayingFullBodyAnim || !this.fullBodyArmature) {
                    return;
                }
                this.fullBodyArmature.playAnimation(bodyIdleAnimName, -1);
                // jby2 首段已映射播 jby 音效，切入 jby 循环勿再播一次
                if (!(animName === "jby2" && bodyIdleAnimName === "jby")) {
                    tryPlayLv384AnimSound(bodyIdleAnimName, 1, true);
                }
            });
        } else {
            this.fullBodyArmature.playAnimation(animName, playTimes);
            tryPlayLv384AnimSound(animName, 1, true);
        }
    }

    /**
     * 从全身动画恢复显示角色各部分
     */
    private restoreCharacterFromFullBodyAnim(): void {
        if (!this.isPlayingFullBodyAnim) return;

        this.fullBodyAnimSessionId++;
        this.isPlayingFullBodyAnim = false;

        // 隐藏全身动画层
        if (this.fullBodyAnimNode) {
            this.fullBodyAnimNode.active = false;
        }

        // 显示角色各部分
        if (this.characterPartsNode) {
            this.characterPartsNode.active = true;
        }

        // 恢复脸部待机 pt
        this.playFaceAnimation(FACE_ANIMATIONS.PT, 0);
    }

    public checkItemDelivered(itemNode: cc.Node): boolean {
        if (!this.mouthNode || !itemNode) return false;
        const mouthWorldPos = this.mouthNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const itemWorldPos = itemNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const distance = mouthWorldPos.sub(itemWorldPos).mag();
        return distance < 100;
    }

    private isSunLevelItem(itemType: ItemType): boolean {
        return itemType >= ItemType.SunFire && itemType <= ItemType.SunTree;
    }

    private ensureSunAnimationRefs(): void {
        if (!this.characterNode) {
            return;
        }
        if (!this.sunBodyNode || !this.sunBodyNode.isValid) {
            this.sunBodyNode = this.characterNode.getChildByName("太阳身体圆_ske");
        }
        if ((!this.sunBodyArmature || !this.sunBodyArmature.isValid) && this.sunBodyNode) {
            this.sunBodyArmature = this.sunBodyNode.getComponent(dragonBones.ArmatureDisplay);
        }
        for (let i = 1; i <= 9; i++) {
            const hornName = `jiao${i}_ske`;
            if (!this.sunHornArmatures[hornName] || !this.sunHornArmatures[hornName].isValid) {
                const hornNode = this.characterNode.getChildByName(hornName);
                if (hornNode) {
                    this.sunHornArmatures[hornName] = hornNode.getComponent(dragonBones.ArmatureDisplay);
                }
            }
        }
    }

    private hasDragonAnimation(display: dragonBones.ArmatureDisplay, animName: string): boolean {
        if (!display || !animName) {
            return false;
        }
        const armatureName = display.armatureName || "armatureName";
        const animationNames = display.getAnimationNames(armatureName);
        return !!animationNames && animationNames.indexOf(animName) >= 0;
    }

    private playDragonAnimationLoop(display: dragonBones.ArmatureDisplay, animName: string): boolean {
        if (!display || !animName || !this.hasDragonAnimation(display, animName)) {
            return false;
        }
        display.timeScale = 1;
        display.playAnimation(animName, -1);
        return true;
    }

    /** 每次受击都重播，避免连续同道具撞击被去重跳过 */
    private tryPlaySunBodyReactionLoop(animName: string): void {
        if (!animName) {
            return;
        }
        this.sunBodyReactionAnim = animName;
        this.ensureSunAnimationRefs();
        this.playDragonAnimationLoop(this.sunBodyArmature, animName);
    }

    /**
     * 先播一次首段动画（此时播 sfxAnimName 对应音效），结束后循环 loopAnim（拖鞋→拖鞋1_2，鞭子→鞭子2）。
     */
    private tryPlaySunBodyReactionOnceThenLoop(firstAnim: string, sfxAnimName: string, loopAnim: string): void {
        if (!firstAnim) {
            return;
        }
        this.sunBodyTwoPhaseSessionId++;
        const session = this.sunBodyTwoPhaseSessionId;
        this.ensureSunAnimationRefs();
        const arm = this.sunBodyArmature;
        if (!arm || !arm.isValid) {
            return;
        }
        if (!loopAnim || !this.hasDragonAnimation(arm, loopAnim)) {
            this.tryPlaySunBodyReactionLoop(firstAnim);
            tryPlayLv384AnimSound(sfxAnimName, -1, false);
            return;
        }
        if (!this.hasDragonAnimation(arm, firstAnim)) {
            this.tryPlaySunBodyReactionLoop(loopAnim);
            return;
        }
        this.sunBodyReactionAnim = loopAnim;
        tryPlayLv384AnimSound(sfxAnimName, 1, false);
        arm.timeScale = 1;
        arm.playAnimation(firstAnim, 1);
        this.addOneTimeListener(
            arm,
            () => {
                if (session !== this.sunBodyTwoPhaseSessionId) {
                    return;
                }
                if (!arm || !arm.isValid) {
                    return;
                }
                this.playDragonAnimationLoop(arm, loopAnim);
            },
            dragonBones.EventObject.COMPLETE,
            this
        );
    }

    private tryPlaySunHornReactionLoop(animName: string, hornName: string): void {
        if (!animName || !hornName) {
            return;
        }
        this.sunHornReactionAnim[hornName] = animName;
        this.ensureSunAnimationRefs();
        const hornArmature = this.sunHornArmatures[hornName];
        this.playDragonAnimationLoop(hornArmature, animName);
    }

    private resetSunReactionAnimState(): void {
        this.sunBodyReactionAnim = null;
        this.sunHornReactionAnim = {};
        this.sunBodyTwoPhaseSessionId++;
    }

    /** 火/肥皂/闪电：蹭角不播音效；碰身体先播太阳身体动画再播音效 */
    private isSunPropHornSilentBodyLateSfx(itemType: ItemType): boolean {
        return (
            itemType === ItemType.SunFire ||
            itemType === ItemType.SunSoap ||
            itemType === ItemType.SunLightning
        );
    }

    private onSunPropReact(ev: {
        itemConfigType: ItemType;
        hitPart: "body" | "horn";
        hitNode: cc.Node;
    }): void {
        if (GameData.PauseGame || this.isPlayingFullBodyAnim) {
            return;
        }
        const itemType = ev.itemConfigType;
        if (!this.isSunLevelItem(itemType)) {
            return;
        }
        const config = getItemConfig(itemType);
        if (!config) {
            return;
        }
        const animName = config.faceAnimName || config.name || "";
        if (!animName) {
            return;
        }

        if (ev.hitPart === "horn" && ev.hitNode) {
            if (itemType === ItemType.SunBalloon) {
                this.tryPlaySunBodyReactionOnceThenLoop("拖鞋1", "拖鞋1", LV384_SUN_BODY_LOOP_AFTER_SLIPPER);
            } else if (itemType === ItemType.SunMagnet) {
                this.tryPlaySunBodyReactionOnceThenLoop("鞭子", "鞭子", LV384_SUN_BODY_LOOP_AFTER_WHIP);
            } else {
                this.tryPlaySunHornReactionLoop(animName, ev.hitNode.name);
                if (!this.isSunPropHornSilentBodyLateSfx(itemType)) {
                    tryPlayLv384AnimSound(animName, -1, false);
                }
            }
            return;
        }
        if (ev.hitPart === "body") {
            if (itemType === ItemType.SunBalloon) {
                this.tryPlaySunBodyReactionOnceThenLoop("拖鞋1", "拖鞋1", LV384_SUN_BODY_LOOP_AFTER_SLIPPER);
            } else if (itemType === ItemType.SunMagnet) {
                this.tryPlaySunBodyReactionOnceThenLoop("鞭子", "鞭子", LV384_SUN_BODY_LOOP_AFTER_WHIP);
            } else {
                this.tryPlaySunBodyReactionLoop(animName);
                if (this.isSunPropHornSilentBodyLateSfx(itemType)) {
                    this.scheduleOnce(() => {
                        tryPlayLv384AnimSound(animName, -1, false);
                    }, 0);
                } else {
                    tryPlayLv384AnimSound(animName, -1, false);
                }
            }
        }
    }

    public feedCharacter(itemType: ItemType, itemNode: cc.Node): void {
        if (this.isEating || itemType === ItemType.None) {
            this.returnItemToGrid(itemNode);
            return;
        }

        const config = getItemConfig(itemType);
        if (!config) {
            this.returnItemToGrid(itemNode);
            return;
        }

        this.isEating = true;
        this.onEatComplete(config, itemNode);
    }

    private onEatComplete(config: ItemConfig, itemNode: cc.Node): void {
        switch (config.category) {
            case ItemCategory.Tool:
                this.handleToolItem(config);
                break;
            case ItemCategory.Special:
                this.handleSpecialItem(config);
                break;
            case ItemCategory.Normal:
                this.handleNormalFood(config);
                break;
        }

        this.checkWinCondition();
        itemNode.destroy();

        this.scheduleOnce(() => {
            this.isEating = false;
            // 脸部表情由喷吐流结束或单次播放回调切回待机，此处勿打断循环表情
        }, 2);
    }

    private handleToolItem(config: ItemConfig): void {
        if (!resolveEatSpitPrefabPath(config)) return;

        // 道具：脸部表情循环到喷吐结束，再吐出吃后喷出预制体（可与 spawn 共用）
        const faceAnim = config.faceAnimName || FACE_ANIMATIONS.KU2;
        this.playFaceAnimation(faceAnim, -1);

        this.scheduleEatSpitStream(config);
    }

    private handleSpecialItem(config: ItemConfig): void {
        if (!config.specialEffect) return;

        // 特殊道具：播放全身动画
        if (config.bodyAnimName && this.fullBodyArmature) {
            this.playFullBodyAnimation(config.bodyAnimName, -1, config.bodyAnimIdleName);
        } else {
            cc.warn('[feed_lv384] fullBodyArmature 未绑定，无法播放特殊道具全身动画');
        }

        this.applySpecialEffect(config.specialEffect, config.effectDuration || 3);
    }

    private handleNormalFood(config: ItemConfig): void {
        const faceAnim = config.faceAnimName || FACE_ANIMATIONS.KAIXIN;
        if (resolveEatSpitPrefabPath(config)) {
            this.playFaceAnimation(faceAnim, -1);
            this.scheduleEatSpitStream(config);
        } else {
            this.playFaceAnimation(faceAnim, 1, () => {
                if (!this.isPlayingFullBodyAnim) {
                    this.playFaceAnimation(FACE_ANIMATIONS.PT, 0);
                }
            });
        }
    }

    /** 吃后从嘴喷出预制体（道具与普通食物共用；路径见 resolveEatSpitPrefabPath） */
    private scheduleEatSpitStream(config: ItemConfig): void {
        const spitCount = config.spitOutCount || 1;
        const streamParticles = Math.min(264, Math.max(106, Math.round(spitCount * 48)));
        const streamWindow = 3;
        const t0 = 0.22;
        const randMax = 0.07;
        for (let i = 0; i < streamParticles; i++) {
            const frac = streamParticles > 1 ? i / (streamParticles - 1) : 0;
            const delay = t0 + frac * streamWindow + Math.random() * randMax;
            const idx = i;
            this.scheduleOnce(() => {
                this.createSpitOutItem(config, idx);
            }, delay);
        }

        // 最后一发喷出时间上限后切回待机 pt（与脸部循环表情对齐）
        const streamEndDelay = t0 + streamWindow + randMax + 0.12;
        this.scheduleOnce(() => {
            if (!this.isPlayingFullBodyAnim) {
                this.playFaceAnimation(FACE_ANIMATIONS.PT, 0);
            }
        }, streamEndDelay);
    }

    /**
     * 创建吐出的物理物品（带喷射效果）；路径由 resolveEatSpitPrefabPath
     */
    private createSpitOutItem(toolConfig: ItemConfig, index: number): void {
        const mgr = this.physicsManager || feedPhysicsManager_lv384.getInstance();
        if (!mgr) {
            cc.error('[feed_lv384] createSpitOutItem failed: physicsManager is null');
            return;
        }

        const spitPrefabPath = resolveEatSpitPrefabPath(toolConfig);
        if (!spitPrefabPath) {
            cc.warn('[feed_lv384] createSpitOutItem: 无吃后喷出预制体配置', toolConfig.id);
            return;
        }

        playLv384SpitOnce();

        const spawnPos = this.getSpitAnchorWorldPosition();

        // 世界坐标 +x 右、+y 上：朝左略偏上、扇形更平（角靠近 180°），再靠初速拉远
        const baseDeg = 134 + (index % 23) * 1.05 + Math.random() * 4;
        const jitterDeg = (Math.random() - 0.5) * 9;
        const angleDeg = baseDeg + jitterDeg;
        const radian = angleDeg * Math.PI / 180;
        const direction = cc.v2(Math.cos(radian), Math.sin(radian));
        const spawnOffset = cc.v2(direction.x * (20 + Math.random() * 8), direction.y * (20 + Math.random() * 8) + 8);
        const jitter = cc.v2((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 7);
        const worldPos = cc.v2(
            spawnPos.x + spawnOffset.x + jitter.x,
            spawnPos.y + spawnOffset.y + jitter.y
        );
        const force = 786 + Math.random() * 492;

        mgr.createPhysicsItemAsync(
            spitPrefabPath,
            worldPos,
            false,
            index,
            (itemNode) => {
                if (!itemNode) {
                    cc.error('[feed_lv384] createSpitOutItem failed: 实例化返回 null');
                    return;
                }
                const rigidBody = itemNode.getComponent(cc.RigidBody);
                if (rigidBody) {
                    rigidBody.linearVelocity = cc.v2(
                        Math.cos(radian) * force,
                        Math.sin(radian) * force + 182 + Math.random() * 154
                    );
                    rigidBody.angularVelocity = (Math.random() - 0.5) * 480;
                }
            }
        );
    }

    /**
     * 吐出基准点：优先 mouthNode 下的 spitAnchor，未配置时回退 mouthNode 本身。
     */
    private getSpitAnchorWorldPosition(): cc.Vec2 {
        if (this.mouthNode) {
            const spitAnchor = this.mouthNode.getChildByName('spitAnchor');
            if (spitAnchor) {
                return spitAnchor.convertToWorldSpaceAR(cc.v2(0, 0));
            }
            return this.mouthNode.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        if (this.characterPhysics) {
            return this.characterPhysics.getMouthWorldPosition();
        }
        return cc.v2(0, 0);
    }

    /**
     * 点击生成物在世界坐标下的落点：可视区域中心往左200（避免 ScrollView 内格子世界坐标与 spawned 父节点换算偏差导致飞出视野）
     */
    private getPhysicsSpawnWorldPositionAtScreenCenter(): cc.Vec2 {
        const vs = cc.view.getVisibleSize();
        const vo = cc.view.getVisibleOrigin();
        const screenCenter = cc.v2(vo.x + vs.width * 0.5, vo.y + vs.height * 0.5);
        const camera = cc.Camera.main;
        if (camera) {
            const w = camera.getScreenToWorldPoint(screenCenter);
            return cc.v2(w.x, w.y + 350);
        }
        const canvas = cc.find('Canvas');
        if (canvas) {
            const pos = canvas.convertToWorldSpaceAR(cc.v2(0, 0));
            return cc.v2(pos.x, pos.y + 350);
        }
        return cc.v2(screenCenter.x, screenCenter.y + 350);
    }

    /**
     * 生成可拖拽的物理物品（点击图标时调用，生成在屏幕可视区域中心）
     * 预制体路径来自 {@link ItemConfig.spawnPhysicsPrefab}（太阳关卡：`spawnItem/lv384_spawn_*`，贴图 SunUIDaoJu 同名）
     */
    public spawnPhysicsItem(itemType: ItemType, customWorldPos?: cc.Vec2): void {
        const config = getItemConfig(itemType);
        if (!config) {
            cc.warn('[feed_lv384] spawnPhysicsItem: 无物品配置', itemType);
            return;
        }

        const mgr = this.physicsManager || feedPhysicsManager_lv384.getInstance();
        if (!mgr) {
            cc.error('[feed_lv384] physicsManager 未绑定且场景中无 feedPhysicsManager_lv384，无法生成物理物品');
            return;
        }

        const prefabPath = resolveSpawnPhysicsPrefabPath(config);
        const worldPos = customWorldPos || this.getPhysicsSpawnWorldPositionAtScreenCenter();

        mgr.createPhysicsItemAsync(
            prefabPath,
            worldPos,
            true,
            itemType,
            (itemNode) => {
                if (!itemNode) {
                    cc.error('[feed_lv384] spawnPhysicsItem: 生成失败', itemType, prefabPath);
                }
            }
        );
    }

    private applySpecialEffect(effectType: SpecialEffectType, duration: number): void {
        if (!this.characterNode) return;

        // 当播放全身动画时，不应用这些视觉效果（全身动画已包含）
        if (this.isPlayingFullBodyAnim) return;

        const ske = this.characterNode.getComponent(dragonBones.ArmatureDisplay);
        if (!ske) return;

        switch (effectType) {
            case SpecialEffectType.Transform:
                if (ske) {
                    ske.playAnimation("transform_fox", 1);
                }
                break;
            case SpecialEffectType.Blacken:
                this.setCharacterColor(cc.Color.BLACK);
                break;
            case SpecialEffectType.RedHot:
                this.setCharacterColor(cc.Color.RED);
                break;
            case SpecialEffectType.RainbowGradient:
                this.startRainbowEffect();
                break;
            case SpecialEffectType.ElectricShock:
                this.startElectricEffect();
                break;
            // case SpecialEffectType.BlackHoleSuck:
            //     this.startBlackHoleEffect();
            //     break;
            case SpecialEffectType.EyeBeam:
                this.startEyeBeamEffect();
                break;
        }

        this.scheduleOnce(() => {
            this.resetCharacterEffect();
        }, duration);
    }

    private setCharacterColor(color: cc.Color): void {
        if (!this.characterNode) return;
        const renderers = this.characterNode.getComponentsInChildren(cc.Sprite);
        renderers.forEach(r => r.node.color = color);
    }

    private startRainbowEffect(): void {
        // 彩虹渐变效果
    }

    private startElectricEffect(): void {
        // 触电抖动效果
        if (!this.characterNode) return;
        cc.tween(this.characterNode)
            .repeatForever(
                cc.tween()
                    .by(0.05, { x: 5 })
                    .by(0.05, { x: -10 })
                    .by(0.05, { x: 5 })
            )
            .start();
    }

    // private startBlackHoleEffect(): void {
    //     // 黑洞吸引翻滚效果
    //     if (!this.characterNode) return;
    //     cc.tween(this.characterNode)
    //         .by(0.5, { angle: 360 })
    //         .repeat(3)
    //         .start();
    // }

    private startEyeBeamEffect(): void {
        // 眼睛发射光线效果
    }

    private resetCharacterEffect(): void {
        if (!this.characterNode) return;
        cc.Tween.stopAllByTarget(this.characterNode);
        const renderers = this.characterNode.getComponentsInChildren(cc.Sprite);
        renderers.forEach(r => r.node.color = cc.Color.WHITE);
        this.resetSunReactionAnimState();
        this.playFaceAnimation(FACE_ANIMATIONS.PT, 0);
    }

    private returnItemToGrid(itemNode: cc.Node): void {
        const itemComp = itemNode.getComponent(feedItem_lv384);
        if (itemComp) {
            itemComp.returnToOriginalPosition();
        }
    }

    private checkWinCondition(): void {
        // if (this.eatCount >= this.maxEatCount) {
        //     this.scheduleOnce(() => {
        //         this.onWin();
        //     }, 2);
        // }
    }

    private onCloseClick(): void {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.openpausePanel();
    }

    /**
     * 关卡内重置：取消调度、清生成物/吐出物、角色特效回滚、嘴闭合；
     * 若正在全身动画层则先隐藏该层并显示角色各部位。
     */
    private applyGameplayReset(): void {
        console.log("重置");
        
        this.unscheduleAllCallbacks();
        this.isEating = false;
        this.gridStreamItemType = null;
        if (this.isPlayingFullBodyAnim) {
            this.restoreCharacterFromFullBodyAnim();
        }
        this.resetCharacterEffect();
        this.syncStreamGridVisual();
        const mgr = this.physicsManager || feedPhysicsManager_lv384.getInstance();
        if (mgr) {
            mgr.clearAllItems();
        }
        if (this.characterPhysics) {
            this.characterPhysics.resetMouthToClosed();
        }
        if (this.firstGameplayResetPreserveCharacter) {
            this.firstGameplayResetPreserveCharacter = false;
        } else {
            if (this.characterNode && this.characterNode.isValid) {
                this.characterNode.angle = this.characterEditorInitialAngle;
            }
            this.restoreSunPhysicsToRest();
        }
        if (!this.isPlayingFullBodyAnim) {
            this.playFaceAnimation(FACE_ANIMATIONS.PT, 0);
        }
    }

    /** 重置键：同上并播放按钮音效 */
    private onResetClick(): void {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.applyGameplayReset();
    }

    onWin(): void {
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
    }

    update(_dt: number): void {
    }

    lateUpdate(_dt: number): void {
    }
}
