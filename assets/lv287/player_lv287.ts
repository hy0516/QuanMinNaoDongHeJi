const { ccclass, property } = cc._decorator;
import GameData from "../script/common/GameData";
import AudioManager from "../script/common/AudioManager";
import manage_lv287 from "./manage_lv287";

@ccclass
export default class player_lv287 extends cc.Component {
    @property(cc.Node)
    touch: cc.Node = null;

    @property(manage_lv287)
    fishManager: manage_lv287 = null;

    @property(cc.Node)
    ax: cc.Node = null;

    psk;
    @property
    scaleLerpSpeed: number = 5;

    private tx: number = 1;
    private point: number = 0;
    private currentLevel: number = 1;
    private currentScaleX: number = 1.0;
    private currentScaleY: number = 1.0;
    private targetScaleX: number = 1.0;
    private targetScaleY: number = 1.0;
    private isGrowing: boolean = false;
    private lastStage: string = "init";
    
    private maxHp: number = 3;
    private currentHp: number = 3;
    private isInvincible: boolean = false;
    private isOneTimeInvincible: boolean = false; // 标记是否为一次性无敌罩
    private invincibleDuration: number = 3;
    private flickerInterval: number = 0.2;
    private lateStageGrowSpeed: number = 0.0005;

    onLoad() {
        this.node.anchorX = 0.5;
        this.node.anchorY = 0.5;
        this.init();
        this.initPlayerState();
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = false;

        if (!this.fishManager) {
            this.fishManager = cc.find("Canvas/manage_lv287").getComponent(manage_lv287);
        }

        this.updateFishSpawnRatio();
        cc.view.on('resize', this.onScreenResize, this);
        this.psk = this.node.getComponent(dragonBones.ArmatureDisplay);
        
        // 初始化时立即同步所有鱼的光圈（防止初始鱼遗漏）
        this.scheduleOnce(() => {
            this.syncAllFishGNodeState();
        }, 0.1);
    }

    private onScreenResize() {
        if (this.touch) this.touch.setContentSize(cc.winSize.width, cc.winSize.height);
    }

    update(dt: number) {
        if (this.currentHp <= 0 || GameData.PauseGame || this.isGrowing) return;
        
        this.node.scaleX = cc.misc.lerp(this.node.scaleX, this.targetScaleX * Math.sign(this.node.scaleX), dt * this.scaleLerpSpeed);
        this.node.scaleY = cc.misc.lerp(this.node.scaleY, this.targetScaleY, dt * this.scaleLerpSpeed);

        if (this.currentLevel >= 7) {
            this.node.scaleX *= 1 + (this.lateStageGrowSpeed * dt * 60);
            this.node.scaleY *= 1 + (this.lateStageGrowSpeed * dt * 60);
            this.currentScaleX = Math.abs(this.node.scaleX);
            this.currentScaleY = this.node.scaleY;
        }

        // 每帧实时同步（确保无任何遗漏，极端情况兜底）
        this.syncAllFishGNodeState();
    }

    onDestroy() {
        if (this.touch) {
            this.touch.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.touch.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.touch.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.touch.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
        cc.view.off('resize', this.onScreenResize, this);
        this.node.stopAllActions();
    }

    private initPlayerState() {
        const initStage = manage_lv287.getStageByLevel(this.currentLevel);
        this.currentScaleX = initStage.scaleX;
        this.currentScaleY = initStage.scaleY;
        this.targetScaleX = this.currentScaleX;
        this.targetScaleY = this.currentScaleY;
        this.node.scaleX = this.currentScaleX;
        this.node.scaleY = this.currentScaleY;
    }

    private init() {
        if (!this.touch) return;
        this.touch.setContentSize(cc.winSize.width, cc.winSize.height);
        this.touch.anchorX = 0.5;
        this.touch.anchorY = 0.5;
        this.touch.position = cc.Vec3.ZERO;

        this.touch.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touch.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touch.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touch.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart() {}
    private onTouchEnd() {}

    private onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.currentHp <= 0) return;

        const delta = event.getDelta();
        let x = this.node.x + delta.x;
        let y = this.node.y + delta.y;

        if (delta.x < 0 && this.node.scaleX < 0) this.node.scaleX = this.currentScaleX;
        if (delta.x > 0 && this.node.scaleX > 0) this.node.scaleX = -this.currentScaleX;

        const screenHalfWidth = cc.winSize.width / 2;
        const screenHalfHeight = cc.winSize.height / 2;
        x = cc.misc.clampf(x, -screenHalfWidth, screenHalfWidth);
        y = cc.misc.clampf(y, -screenHalfHeight, screenHalfHeight);
        
        this.node.setPosition(x, y);
        event.stopPropagation();
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.currentHp <= 0) return;

        const fishLogic = other.node.getComponent("FishLogic_lv287");
        if (!fishLogic || fishLogic.type < 1 || fishLogic.type > 7 || !this.fishManager) return;

        const fishType = fishLogic.type;
        const currentStage = manage_lv287.getStageByLevel(this.currentLevel);
        
        if (fishType <= currentStage.edibleMaxType) {
            this.eatFish(fishType);
            this.fishManager.recycleFish(other.node);
        } else {
            if (this.isOneTimeInvincible) {
                // 一次性无敌罩：碰到不可食用的鱼后失效
                this.isOneTimeInvincible = false;
                AudioManager.playEffect(`保护罩破裂`);
                this.isInvincible = false; // 关闭无敌状态
                this.node.getChildByName(`wd`).active = false;
                this.node.opacity = 255; // 安全保障：立即恢复不透明
            } else if (!this.isInvincible) {
                // 无无敌/扣血无敌已结束：正常掉血
                this.onHitBiggerFish(currentStage.edibleMaxType + 1);
            }
            // 扣血无敌期间碰到不可食用的鱼：不做任何处理（保持原有逻辑）
        }
    }

    private eatFish(fishType: number) {
        AudioManager.playEffect(`吃`);
        this.psk.playAnimation(`zj_c`, 1);
        this.scheduleOnce(() => {
            this.psk.playAnimation(`zj`, 0);
        }, 1);
        const fishInfo = manage_lv287.getFishConfigByType(fishType);
        this.point += fishInfo.score;
        this.updateTargetScaleByScore();
        this.checkLevelUp();
    }

    private updateTargetScaleByScore() {
        if (this.currentLevel >= 7) return;

        const currentStage = manage_lv287.getStageByLevel(this.currentLevel);
        const nextStage = manage_lv287.getStageByLevel(this.currentLevel + 1);
        const minScore = currentStage.scoreRange[0];
        const maxScore = nextStage.scoreRange[0];
        const scorePercent = Math.min(1, Math.max(0, (this.point - minScore) / (maxScore - minScore)));
        this.targetScaleX = cc.misc.lerp(currentStage.scaleX, nextStage.scaleX, scorePercent);
        this.targetScaleY = cc.misc.lerp(currentStage.scaleY, nextStage.scaleY, scorePercent);
    }

    lostax() {
        if (this.currentHp === 2) this.ax.getChildByName(`3`).getChildByName(`c`).active = true;
        else if (this.currentHp === 1) this.ax.getChildByName(`2`).getChildByName(`c`).active = true;
        else if (this.currentHp === 0) this.ax.getChildByName(`1`).getChildByName(`c`).active = true;
    }

    private onHitBiggerFish(biggerFishType: number) {
        AudioManager.playEffect(`掉血`);
        this.currentHp--;
        this.lostax();
        if (this.currentHp <= 0) {
            this.onPlayerDeath();
            return;
        }

        const reduceScore = Math.max(10, Math.floor(this.point * 0.1));
        this.point = Math.max(0, this.point - reduceScore);
        this.updateTargetScaleByScore();

        const backDir = this.node.scaleX > 0 ? -1 : 1;
        cc.tween(this.node).by(0.3, { x: backDir * 80 }).start();

        this.startInvincible();
    }

    private startInvincible() {
        // 扣血后的临时无敌：不影响一次性无敌罩的状态
        this.isInvincible = true;
        const originalOpacity = this.node.opacity;
        const totalFlickers = this.invincibleDuration / this.flickerInterval;

        cc.tween(this.node)
            .repeat(totalFlickers,
                cc.tween()
                    .to(this.flickerInterval / 2, { opacity: 100 })
                    .to(this.flickerInterval / 2, { opacity: 255 })
            )
            .call(() => {
                // 临时无敌结束时，保留一次性无敌罩的状态 + 强制恢复不透明
                this.isInvincible = this.isOneTimeInvincible;
                this.node.opacity = 255; // 替换 originalOpacity，确保100%不透明
            })
            .start();
    }

    private onPlayerDeath() {
        cc.tween(this.node)
            .to(0.5, { scaleX: 0, scaleY: 0, opacity: 0 })
            .call(() => {
                this.node.active = false;
                this.onGameOver();
            })
            .start();
    }

    private onGameOver() {}

    private checkLevelUp() {
        if (this.currentLevel >= 7 || this.isGrowing || this.currentHp <= 0) return;

        const nextLevel = this.currentLevel + 1;
        const nextStage = manage_lv287.getStageByLevel(nextLevel);
        if (this.point >= nextStage.scoreRange[0]) {
            this.isGrowing = true;
            this.upgradeToLevel(nextLevel);
        }
    }

    private upgradeToLevel(targetLevel: number) {
        this.currentLevel = targetLevel;
        const targetStage = manage_lv287.getStageByLevel(targetLevel);
        this.currentScaleX = targetStage.scaleX;
        this.currentScaleY = targetStage.scaleY;

        cc.tween(this.node)
            .to(0.5, { 
                scaleX: Math.sign(this.node.scaleX) * this.currentScaleX,
                scaleY: this.currentScaleY 
            })
            .call(() => {
                this.isGrowing = false;
                this.updateTargetScaleByScore();
                this.updateFishSpawnRatio();
                this.syncAllFishGNodeState(); // 升级后强制同步
                this.node.opacity = 255; // 升级后恢复不透明
            })
            .start();
    }

    // 核心修正：遍历所有活跃鱼+对象池鱼，确保无遗漏
    private syncAllFishGNodeState() {
        if (!this.fishManager) return;
        const edibleMaxType = this.getEdibleMaxType();

        // 1. 同步当前活跃的鱼
        this.fishManager.active.forEach(fishNode => {
            this.updateSingleFishGNode(fishNode, edibleMaxType);
        });

        // 2. 同步对象池中的鱼（防止复用后光圈状态错误）
        for (const type in this.fishManager.objPool) {
            this.fishManager.objPool[Number(type)].forEach(fishNode => {
                this.updateSingleFishGNode(fishNode, edibleMaxType);
            });
        }
    }

    // 单独更新单条鱼的光圈状态（复用逻辑）
    private updateSingleFishGNode(fishNode: cc.Node, edibleMaxType: number) {
        if (!fishNode.isValid) return;
        const fishLogic = fishNode.getComponent("FishLogic_lv287");
        if (!fishLogic) return;
        const gNode = fishNode.getChildByName("g");
        if (gNode) {
            // 强制启用：只要可食用就显示，不管鱼是否活跃
            gNode.active = fishLogic.type <= edibleMaxType;
        }
    }

    private updateFishSpawnRatio() {
        if (!this.fishManager || this.currentHp <= 0) return;

        let currentStage: string;
        let targetRatio: {[key: number]: number};

        if (this.currentLevel >= 1 && this.currentLevel <= 2) {
            currentStage = "init";
            targetRatio = manage_lv287.STAGE_FISH_RATIO.init;
        } else if (this.currentLevel >= 3 && this.currentLevel <= 4) {
            currentStage = "mid";
            targetRatio = manage_lv287.STAGE_FISH_RATIO.mid;
        } else {
            currentStage = "late";
            targetRatio = manage_lv287.STAGE_FISH_RATIO.late;
        }

        if (currentStage !== this.lastStage) {
            this.fishManager.resetEliminateProb();
            this.lastStage = currentStage;
        }

        this.fishManager.refreshRatio(targetRatio, this.currentLevel);
    }

    public getCurrentScore(): number { return this.point; }
    public getCurrentLevel(): number { return this.currentLevel; }
    public getCurrentScale(): {x: number, y: number} { return { x: this.currentScaleX, y: this.currentScaleY }; }
    public getEdibleMaxType(): number { return manage_lv287.getStageByLevel(this.currentLevel).edibleMaxType; }
    public getCurrentHp(): number { return this.currentHp; }
    public getIsInvincible(): boolean { return this.isInvincible; }

    revivePlayer() {
        if (this.currentHp > 0) return;
        
        this.ax.getChildByName(`1`).getChildByName(`c`).active = false;
        this.ax.getChildByName(`2`).getChildByName(`c`).active = false;
        this.ax.getChildByName(`3`).getChildByName(`c`).active = false;
        this.psk.playAnimation(`zj`, 0);
        
        GameData.PauseGame = false;
        this.currentHp = 3;
        this.isInvincible = false;
        this.isOneTimeInvincible = false; // 复活后重置一次性无敌状态
        this.isGrowing = false;

        this.node.active = true;
        this.node.opacity = 255; // 复活后强制恢复不透明
        const targetScaleX = Math.sign(this.node.scaleX) * (this.currentScaleX <= 0 ? 1 : this.currentScaleX);
        const targetScaleY = this.currentScaleY <= 0 ? 1 : this.currentScaleY;
        this.node.scaleX = targetScaleX <= 0 ? 1 : targetScaleX;
        this.node.scaleY = targetScaleY <= 0 ? 1 : targetScaleY;
        
        this.updateTargetScaleByScore();
        this.node.stopAllActions();
        this.node.position = cc.Vec3.ZERO;

        this.startInvincible();
        this.updateFishSpawnRatio();
        this.syncAllFishGNodeState(); // 复活后强制同步
    }

    setwudi() {
        // 激活一次性无敌罩：覆盖扣血后的临时无敌
        this.isOneTimeInvincible = true;
        this.isInvincible = true; // 确保立即生效
        this.node.getChildByName(`wd`).active = true;
        this.node.opacity = 255; // 激活罩子时恢复不透明
    }

}