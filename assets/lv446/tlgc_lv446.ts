import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

type FoodNodeHome = {
    parent: cc.Node;
    pos: cc.Vec3;
    scale: number;
};

@ccclass
export default class tlgc_lv446 extends BaseGame {
    private static readonly BGM_KEY = "bgmlv446";
    private static readonly SFX_PLACE_FOOD = "放置物品";
    private static readonly FOOD_ITEM_COUNT = 20;
    private static readonly STACK_Y_INTERVAL = 28;
    private static readonly FOOD_VIDEO_STORAGE_KEY = "lv446_food_video_unlocked";
    private static readonly MAX_PROGRESS = 300;
    private static readonly BITE_SIZE = 5;
    private static readonly REACTION_ANIMS = [
        "weixiao",
        "aixing",
        "shengqi",
        "yihuo",
        "kuqi",
        "zhengjing",
        "penhuo",
        "aolun",
        "pingji",
    ];
    private static readonly REACTION_IDX_AOLUN = 7;
    private static readonly REACTION_IDX_PINGJI = 8;
    /** 进度达到时切换角色，共两次：1→2、2→3 */
    private static readonly STAGE_AT_2 = 100;
    private static readonly STAGE_AT_3 = 200;
    /** 调试：关卡初始进度 0～300；-1 表示不启用 */
    private static readonly DEBUG_INITIAL_PROGRESS = -1;
    /**
     * 食物 1～20 对应 REACTION_ANIMS 下标（0～8），在代码里改即可
     * 索引 0=食物1，1=食物2 … 19=食物20
     */
    private static readonly FOOD_REACTION_BY_ID: number[] = [
        0, 2, 1, 1, 7, 8, 4, 0, 0, 5,
        0, 0, 3, 0, 6, 6, 1, 3, 1, 1,
    ];

    @property(cc.Node)
    btnEat: cc.Node = null;

    @property(cc.Node)
    roleNode: cc.Node = null;

    @property(cc.Node)
    jdt: cc.Node = null;

    @property(cc.Label)
    jdtLabel: cc.Label = null;

    @property({
        type: cc.Node,
        displayName: "阶段1食物挂点(1_ske)",
    })
    foodAttachStage1: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: "阶段2食物挂点(2_ske)",
    })
    foodAttachStage2: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: "阶段3食物挂点(3_ske)",
    })
    foodAttachStage3: cc.Node = null;

    private foodNode: cc.Node = null;
    private foodNodeRestY = 0;
    private foodNodeRestScale = 1;
    private foodNodeHome: FoodNodeHome = null;
    private readonly foodPrefabs: Map<number, cc.Prefab> = new Map();
    private foodVideoUnlockedCache: { [key: string]: boolean } | null = null;

    private roleSkeNodes: cc.Node[] = [];
    private roleSkeArms: dragonBones.ArmatureDisplay[] = [];
    private curStage = 1;
    private progress = 0;
    private isEating = false;
    private pendingBiteCount = 0;
    private biteReactionWeight: number[] = [];
    private biteAolunCount = 0;
    private bitePingjiCount = 0;
    private biteAolunTopY = -Infinity;
    private bitePingjiTopY = -Infinity;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        GameData.recordLevelEnter(GameData.curGameName || "tlgc_lv446");
        this.isGameOver = false;
        this.initEatUI();
        this.applyDebugInitialProgress();
        this.initFoodStack();
        this.scheduleOnce(() => this.playLevelBgm(), 0.5);
    }

    private applyDebugInitialProgress() {
        const v = tlgc_lv446.DEBUG_INITIAL_PROGRESS;
        if (v < 0) return;
        this.progress = Math.min(tlgc_lv446.MAX_PROGRESS, Math.max(0, v));
        this.updateProgressUI();
        this.updateRoleStage(true);
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
        this.stopLevelBgm();
        if (this.foodNode) {
            cc.Tween.stopAllByTarget(this.foodNode);
        }
        if (this.btnEat) {
            cc.Tween.stopAllByTarget(this.btnEat);
        }
    }

    private initEatUI() {
        if (!this.btnEat) {
            this.btnEat = this.node.getChildByName("btn_eat");
        }
        if (!this.roleNode) {
            this.roleNode = this.node.getChildByName("roleNode");
        }
        const jdNode = this.node.getChildByName("jdNode");
        if (!this.jdt && jdNode) {
            this.jdt = jdNode.getChildByName("jdt");
        }
        if (!this.jdtLabel && jdNode) {
            const labelNode = jdNode.getChildByName("jdtLabel");
            if (labelNode) {
                this.jdtLabel = labelNode.getComponent(cc.Label);
            }
        }

        if (this.roleNode) {
            const names = ["1_ske", "2_ske", "3_ske"];
            for (let i = 0; i < names.length; i++) {
                const skeNode = this.roleNode.getChildByName(names[i]);
                this.roleSkeNodes[i] = skeNode;
                this.roleSkeArms[i] = skeNode
                    ? skeNode.getComponent(dragonBones.ArmatureDisplay)
                    : null;
            }
        }

        this.updateRoleStage(true);
        this.updateProgressUI();
        if (this.btnEat) {
            this.btnEat.active = false;
        }
    }

    private initFoodStack() {
        this.foodNode = this.node.getChildByName("foodNode");
        if (!this.foodNode) {
            cc.error("[tlgc_lv446] 未找到 foodNode");
            return;
        }
        this.foodNodeRestY = this.foodNode.y;
        this.foodNodeRestScale = this.foodNode.scale;
        this.foodNodeHome = {
            parent: this.foodNode.parent,
            pos: this.foodNode.position.clone(),
            scale: this.foodNode.scale,
        };

        const scrollView = this.node.getChildByName("scrollView");
        const content = scrollView ? scrollView.getChildByName("content") : null;
        if (!content) {
            cc.error("[tlgc_lv446] 未找到 scrollView/content");
            return;
        }

        const style = GameData.curGameStyle || "lv446";
        for (let i = 1; i <= tlgc_lv446.FOOD_ITEM_COUNT; i++) {
            const itemNode = content.getChildByName(String(i));
            if (!itemNode) {
                cc.warn(`[tlgc_lv446] 道具栏缺少节点 ${i}`);
                continue;
            }
            itemNode.on(cc.Node.EventType.TOUCH_END, this.onFoodItemClick, this);
            this.applyFoodVideoUnlockState(itemNode, i);
            AssetManager.load(style, `perfab_lv446/${i}`, cc.Prefab, null, (prefab: cc.Prefab) => {
                if (prefab) {
                    this.foodPrefabs.set(i, prefab);
                }
            });
        }
    }

    private onFoodItemClick(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isGameOver || this.isEating) return;

        const itemNode = event.currentTarget as cc.Node;
        const foodId = parseInt(itemNode.name, 10);
        if (!foodId) return;

        if (this.needWatchFoodVideo(itemNode, foodId)) {
            VideoManager.getInstance().showVideo(
                () => {
                    this.unlockFoodVideo(itemNode, foodId);
                    this.stackFood(foodId, itemNode);
                }
            );
            return;
        }

        this.stackFood(foodId, itemNode);
    }

    /** 第 4 个子节点为 video 角标 */
    private getFoodVideoNode(itemNode: cc.Node): cc.Node {
        const fourth = itemNode.children[3];
        if (fourth && fourth.name === "video") {
            return fourth;
        }
        return itemNode.getChildByName("video");
    }

    private needWatchFoodVideo(itemNode: cc.Node, foodId: number): boolean {
        const videoNode = this.getFoodVideoNode(itemNode);
        if (!videoNode || !videoNode.active) {
            return false;
        }
        return !this.isFoodVideoUnlocked(foodId);
    }

    private getFoodVideoUnlockedMap(): { [key: string]: boolean } {
        if (this.foodVideoUnlockedCache !== null) {
            return this.foodVideoUnlockedCache;
        }
        const stored = cc.sys.localStorage.getItem(tlgc_lv446.FOOD_VIDEO_STORAGE_KEY);
        if (stored) {
            try {
                this.foodVideoUnlockedCache = JSON.parse(stored);
            } catch (e) {
                this.foodVideoUnlockedCache = {};
            }
        } else {
            this.foodVideoUnlockedCache = {};
        }
        return this.foodVideoUnlockedCache;
    }

    private saveFoodVideoUnlockedMap(): void {
        cc.sys.localStorage.setItem(
            tlgc_lv446.FOOD_VIDEO_STORAGE_KEY,
            JSON.stringify(this.getFoodVideoUnlockedMap())
        );
    }

    private isFoodVideoUnlocked(foodId: number): boolean {
        return !!this.getFoodVideoUnlockedMap()[String(foodId)];
    }

    private markFoodVideoUnlocked(foodId: number): void {
        const data = this.getFoodVideoUnlockedMap();
        data[String(foodId)] = true;
        this.saveFoodVideoUnlockedMap();
    }

    private applyFoodVideoUnlockState(itemNode: cc.Node, foodId: number) {
        const videoNode = this.getFoodVideoNode(itemNode);
        if (!videoNode) return;
        if (this.isFoodVideoUnlocked(foodId)) {
            videoNode.active = false;
        }
    }

    private unlockFoodVideo(itemNode: cc.Node, foodId: number) {
        this.markFoodVideoUnlocked(foodId);
        const videoNode = this.getFoodVideoNode(itemNode);
        if (videoNode) {
            videoNode.active = false;
        }
    }

    private stackFood(foodId: number, itemNode: cc.Node) {
        if (!this.foodNode || this.isEating) return;

        const stackIndex = this.foodNode.children.length;
        const prefab = this.foodPrefabs.get(foodId);
        let piece: cc.Node = null;

        if (prefab) {
            piece = cc.instantiate(prefab);
        } else {
            const icon = itemNode.getChildByName(itemNode.name) || itemNode.children[0];
            if (!icon) {
                cc.warn(`[tlgc_lv446] 食物 ${foodId} 预制体未加载且无图标可克隆`);
                return;
            }
            piece = cc.instantiate(icon);
        }

        piece.name = String(foodId);
        piece.parent = this.foodNode;
        piece.setPosition(0, (stackIndex + 1) * tlgc_lv446.STACK_Y_INTERVAL);
        this.playFoodNodeStackAnim();
        this.playLv446Sfx(tlgc_lv446.SFX_PLACE_FOOD);
        this.refreshEatButton();
    }

    private playFoodNodeStackAnim() {
        cc.Tween.stopAllByTarget(this.foodNode);
        const baseY = this.foodNodeRestY;
        const s = this.foodNodeRestScale;
        cc.tween(this.foodNode)
            .to(0.05, { scaleY: s * 0.88, scaleX: s * 1.06, y: baseY - 5 })
            .to(0.1, { scaleY: s * 1.14, scaleX: s * 0.94, y: baseY + 10 }, { easing: "quadOut" })
            .to(0.38, { scaleX: s, scaleY: s, y: baseY }, { easing: "elasticOut" })
            .start();
    }

    private refreshEatButton() {
        if (!this.btnEat || this.isEating || this.isGameOver) return;

        const shouldShow = this.foodNode && this.foodNode.children.length > 0;
        if (!shouldShow) {
            this.btnEat.active = false;
            return;
        }
        if (this.btnEat.active) return;

        this.btnEat.active = true;
        this.btnEat.scale = 0;
        cc.tween(this.btnEat)
            .to(0.12, { scale: 1.12 }, { easing: "quadOut" })
            .to(0.2, { scale: 1 }, { easing: "elasticOut" })
            .start();
    }

    private onBtnEat() {
        if (GameData.PauseGame || this.isGameOver || this.isEating) return;
        if (!this.foodNode || this.foodNode.children.length === 0) return;

        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.isEating = true;
        if (this.btnEat) {
            this.btnEat.active = false;
        }

        this.attachFoodNodeToStage(this.curStage);
        this.eatLoop();
    }

    private eatLoop() {
        if (this.isGameOver) return;
        if (!this.foodNode || this.foodNode.children.length === 0) {
            this.finishEatRound();
            return;
        }

        const biteCount = this.consumeFoodBiteAtStart();
        if (biteCount <= 0) {
            this.finishEatRound();
            return;
        }
        this.pendingBiteCount = biteCount;

        this.playRoleAnim(this.curStage, "chidongxi", 1, () => this.onChidongxiComplete());
    }

    private onChidongxiComplete() {
        if (this.isGameOver) return;

        const biteCount = this.pendingBiteCount;
        this.pendingBiteCount = 0;
        if (biteCount <= 0) {
            this.finishEatRound();
            return;
        }

        this.progress = Math.min(tlgc_lv446.MAX_PROGRESS, this.progress + biteCount);
        this.updateProgressUI();
        this.updateRoleStage();

        if (this.progress >= tlgc_lv446.MAX_PROGRESS) {
            this.startVomitWin();
            return;
        }

        this.playBiteReactionThenContinue();
    }

    /** 本口吃完播反应动画，播完还有食物则继续吃 */
    private playBiteReactionThenContinue() {
        const reactionAnim = this.pickBiteReactionAnim();
        this.playRoleAnim(this.curStage, reactionAnim, 1, () => {
            if (this.isGameOver) return;

            const hasMoreFood =
                this.foodNode && this.foodNode.active && this.foodNode.children.length > 0;
            if (hasMoreFood) {
                this.eatLoop();
                return;
            }
            this.finishEatRound();
        });
    }

    /** 开吃 chidongxi 时立刻消掉最多 5 个（顶部的先吃）；最后一口整盘 foodNode 一起消失 */
    private consumeFoodBiteAtStart(): number {
        if (!this.foodNode) return 0;

        const children = this.foodNode.children.slice();
        if (children.length === 0) return 0;

        this.biteReactionWeight = new Array(tlgc_lv446.REACTION_ANIMS.length).fill(0);
        this.biteAolunCount = 0;
        this.bitePingjiCount = 0;
        this.biteAolunTopY = -Infinity;
        this.bitePingjiTopY = -Infinity;

        children.sort((a, b) => b.y - a.y);
        const targets = children.slice(0, tlgc_lv446.BITE_SIZE);
        const isLastBite = targets.length >= children.length;

        for (const piece of targets) {
            const foodId = parseInt(piece.name, 10);
            if (!foodId) continue;

            const reactionIdx = this.getFoodReactionIndex(foodId);
            if (reactionIdx >= 0 && reactionIdx < this.biteReactionWeight.length) {
                this.biteReactionWeight[reactionIdx]++;
            }
            if (reactionIdx === tlgc_lv446.REACTION_IDX_AOLUN) {
                this.biteAolunCount++;
                this.biteAolunTopY = Math.max(this.biteAolunTopY, piece.y);
            } else if (reactionIdx === tlgc_lv446.REACTION_IDX_PINGJI) {
                this.bitePingjiCount++;
                this.bitePingjiTopY = Math.max(this.bitePingjiTopY, piece.y);
            }
        }

        if (isLastBite) {
            for (const piece of targets) {
                cc.Tween.stopAllByTarget(piece);
            }
            cc.Tween.stopAllByTarget(this.foodNode);
            const s = this.foodNode.scale;
            cc.tween(this.foodNode)
                .to(0.12, { scale: s * 0.3, opacity: 0 })
                .call(() => {
                    if (!this.foodNode || !cc.isValid(this.foodNode)) return;
                    this.foodNode.removeAllChildren();
                    this.foodNode.active = false;
                })
                .start();
            return targets.length;
        }

        for (const piece of targets) {
            cc.Tween.stopAllByTarget(piece);
            cc.tween(piece)
                .to(0.12, { scale: 0.3, opacity: 0 })
                .call(() => {
                    if (piece && cc.isValid(piece)) {
                        piece.destroy();
                    }
                })
                .start();
        }

        return targets.length;
    }

    private finishEatRound() {
        if (this.isGameOver) return;

        if (this.foodNode) {
            this.foodNode.active = false;
            this.foodNode.removeAllChildren();
        }

        this.playRoleAnim(this.curStage, "daiji", 0);
        this.restoreFoodNodeHome();
        this.isEating = false;
        this.refreshEatButton();
    }

    private startVomitWin() {
        if (this.isGameOver) return;

        this.isEating = false;
        this.progress = tlgc_lv446.MAX_PROGRESS;
        this.updateProgressUI();

        if (this.foodNode) {
            this.foodNode.removeAllChildren();
            this.foodNode.active = false;
        }
        if (this.btnEat) {
            this.btnEat.active = false;
        }

        this.updateRoleStage(true);
        this.playRoleAnim(3, "outu", 1, () => this.onwin());
    }

    /**
     * aolun / pingji：本口只要出现即优先（不看其它数量）；
     * 两者都有则比数量，同数比堆叠更高（后放）的一方。
     */
    private pickBiteReactionAnim(): string {
        const hasAolun = this.biteAolunCount > 0;
        const hasPingji = this.bitePingjiCount > 0;

        if (hasAolun || hasPingji) {
            if (hasAolun && !hasPingji) {
                return tlgc_lv446.REACTION_ANIMS[tlgc_lv446.REACTION_IDX_AOLUN];
            }
            if (hasPingji && !hasAolun) {
                return tlgc_lv446.REACTION_ANIMS[tlgc_lv446.REACTION_IDX_PINGJI];
            }
            if (this.biteAolunCount > this.bitePingjiCount) {
                return tlgc_lv446.REACTION_ANIMS[tlgc_lv446.REACTION_IDX_AOLUN];
            }
            if (this.bitePingjiCount > this.biteAolunCount) {
                return tlgc_lv446.REACTION_ANIMS[tlgc_lv446.REACTION_IDX_PINGJI];
            }
            if (this.biteAolunTopY >= this.bitePingjiTopY) {
                return tlgc_lv446.REACTION_ANIMS[tlgc_lv446.REACTION_IDX_AOLUN];
            }
            return tlgc_lv446.REACTION_ANIMS[tlgc_lv446.REACTION_IDX_PINGJI];
        }

        return this.pickDominantReactionAnim(this.biteReactionWeight);
    }

    private pickDominantReactionAnim(weights: number[]): string {
        let maxIdx = 0;
        let maxVal = -1;
        for (let i = 0; i < weights.length; i++) {
            if (weights[i] > maxVal) {
                maxVal = weights[i];
                maxIdx = i;
            }
        }
        return tlgc_lv446.REACTION_ANIMS[maxIdx] || "daiji";
    }

    private getFoodReactionIndex(foodId: number): number {
        const idx = foodId - 1;
        const v = tlgc_lv446.FOOD_REACTION_BY_ID[idx];
        return v != null ? v : 0;
    }

    private getStageFromProgress(value: number): number {
        if (value >= tlgc_lv446.STAGE_AT_3) return 3;
        if (value >= tlgc_lv446.STAGE_AT_2) return 2;
        return 1;
    }

    private updateRoleStage(force?: boolean) {
        const stage = this.getStageFromProgress(this.progress);
        if (!force && stage === this.curStage) return;

        this.curStage = stage;
        for (let i = 0; i < this.roleSkeNodes.length; i++) {
            const node = this.roleSkeNodes[i];
            if (node) {
                node.active = i === stage - 1;
            }
        }

        if (this.isEating) {
            this.attachFoodNodeToStage(stage);
        }

        const arm = this.getRoleArm(stage);
        if (arm && !this.isEating) {
            arm.playAnimation("daiji", 0);
        }
    }

    private getRoleArm(stage: number): dragonBones.ArmatureDisplay {
        const idx = stage - 1;
        return this.roleSkeArms[idx] || null;
    }

    private getFoodAttachNode(stage: number): cc.Node {
        switch (stage) {
            case 1:
                return this.foodAttachStage1;
            case 2:
                return this.foodAttachStage2;
            case 3:
                return this.foodAttachStage3;
            default:
                return null;
        }
    }

    private attachFoodNodeToStage(stage: number) {
        if (!this.foodNode) return;

        const attach = this.getFoodAttachNode(stage);
        if (!attach) return;

        // 堆叠弹簧 tween 可能仍在运行，会覆盖位置，先停掉
        cc.Tween.stopAllByTarget(this.foodNode);
        this.foodNode.parent = attach;
        this.foodNode.setPosition(0, 0);
    }

    private restoreFoodNodeHome() {
        if (!this.foodNode || !this.foodNodeHome) return;

        this.foodNode.parent = this.foodNodeHome.parent;
        this.foodNode.setPosition(this.foodNodeHome.pos);
        this.foodNode.scale = this.foodNodeHome.scale;
        this.foodNode.opacity = 255;
        this.foodNode.active = true;
        this.foodNodeRestY = this.foodNode.y;
        this.foodNodeRestScale = this.foodNode.scale;
    }

    private playLv446Sfx(name: string) {
        AudioManager.playEffect(name);
    }

    private playRoleAnim(
        stage: number,
        animName: string,
        playTimes: number,
        onDone?: () => void
    ) {
        const arm = this.getRoleArm(stage);
        if (!arm) {
            onDone && onDone();
            return;
        }
        if (playTimes !== 0) {
            this.playLv446Sfx(animName);
        }
        arm.playAnimation(animName, playTimes);
        if (playTimes === 0) {
            onDone && onDone();
            return;
        }
        this.addOneTimeListener(arm, () => onDone && onDone());
    }

    private updateProgressUI() {
        const ratio = this.progress / tlgc_lv446.MAX_PROGRESS;
        if (this.jdt) {
            this.jdt.scaleX = ratio;
        }
        if (this.jdtLabel) {
            this.jdtLabel.string = `${this.progress}/${tlgc_lv446.MAX_PROGRESS}`;
        }
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        switch (even.currentTarget.name) {
            case "btn_close":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.openpausePanel();
                break;
            case "btn_eat":
                this.onBtnEat();
                break;
        }
    }

    onwin() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.stopLevelBgm();
        GameData.PauseGame = true;
        this.node.cleanup();
        this.endwin("prefabs/zc/zc_winend");
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
    }

    onlost() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.stopLevelBgm();
            this.endlost("prefabs/zc/zc_lostend");
            if (!(GameData as any).isNew) {
                this.node.destroy();
            }
        }, 1);
    }

    restart() {
        this.stopLevelBgm();
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            if (!name) {
                cc.error("[tlgc_lv446] restart 加载 prefab 失败");
                return;
            }
            const UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }

    fanhui() {
        this.stopLevelBgm();
        super.fanhui();
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
    }

    openpausePanel() {
        this.stopLevelBgm();
        super.openpausePanel();
    }

    public resumeGamePublic() {
        GameData.PauseGame = false;
        this.playLevelBgm();
    }

    private playLevelBgm() {
        AudioManager.playMusic(tlgc_lv446.BGM_KEY, true);
    }

    private stopLevelBgm() {
        AudioManager.stopMusic();
    }
}
