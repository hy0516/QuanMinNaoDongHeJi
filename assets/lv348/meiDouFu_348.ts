import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

/**
 * 关卡346 - 四小关霉豆腐配料游戏
 * 游戏流程：
 * 1. 客人提出需求
 * 2. 点击确认开始制作
 * 3. 拖动勺子到豆腐上，播放kuaizi动画，然后播放df_dj2动画
 * 4. 点击"放入盆中"按钮（豆腐恢复df_dj待机）
 * 5. 拖动酒到盆中（盆右上方固定位置播放daojiu，回位播放jiu_dj，酒不隐藏）
 * 6. 拖拽调料到盆中（pen_ske插槽切换显示）
 * 7. 添加配料后点击搅拌按钮，盆的动画节点播放mdf2，完成后才可拖动
 * 8. 拖动盆到罐子上（盆隐藏，罐子同步插槽，播放gz_gs->gz_dj2，飞向顾客）
 * 9. 顾客收到后弹对话：胜利"这个霉豆腐看起来真好吃"退场，失败"这做的是什么，看起来这么难吃"+生气表情
 */

/** 调料类型 */
enum SeasoningType {
    DOUBANJIANG = "doubanjiang",  // 豆瓣酱 - 深红色
    LAJIAO = "lajiao",            // 辣椒 - 正红色
    HUajIAO = "huajiao",          // 花椒 - 绿色
    YAN = "yan",                  // 盐 - 无色（白色/透明）
    HUJIAO = "hujiao",            // 胡椒 - 灰色颗粒
}

/** 小关配置 */
interface SubLevelConfig {
    id: number;                    // 小关ID 1-4
    customerNeed: string;          // 客人需求描述
    sound: string;                 // 客人需求声音
    requiredSeasonings: SeasoningType[];  // 需要的调料
    forbiddenSeasonings: SeasoningType[]; // 禁止的调料
    timeLimit: number;             // 时间限制（秒）
}

/** 游戏状态 */
enum GameState {
    IDLE = 0,           // 空闲
    SHOW_CUSTOMER = 1,  // 展示客人需求
    SCRATCHING = 2,     // 刮开遮罩中
    SEASONING = 3,      // 配料阶段
    CHECK_RESULT = 4,   // 结算中
}

/** 游戏状态数据 */
interface GameStateData {
    appliedSeasonings: SeasoningType[];     // 已应用的调料列表（用于结果判断）
}

@ccclass
export default class meiDouFu_348 extends BaseGame {
    // ==================== 挂载节点 ====================

    // 锉刀节点
    @property(cc.Node)
    cdNode: cc.Node = null;

    // 刮的豆腐节点（刮开阶段显示，盆显示后隐藏）
    @property(cc.Node)
    scratchTofuNode: cc.Node = null;


    // 放入盆中按钮（刮完后显示）
    @property(cc.Node)
    putInPenBtn: cc.Node = null;

    // 搅拌按钮（添加配料后显示，点击后盆播放mdf2动画，完成后才可拖动盆到罐子）
    @property(cc.Node)
    stirBtn: cc.Node = null;

    // 客人群组节点（包含5个客人子节点）
    @property(cc.Node)
    kerenNode: cc.Node = null;

    // 确认开始按钮
    @property(cc.Node)
    confirmBtn: cc.Node = null;

    // 盆节点（挂载节点，包含豆腐块子节点）
    @property(cc.Node)
    penNode: cc.Node = null;

    // 调料节点组
    @property(cc.Node)
    doubanjiangNode: cc.Node = null;  // 豆瓣酱
    @property(cc.Node)
    lajiaoNode: cc.Node = null;        // 辣椒
    @property(cc.Node)
    huajiaoNode: cc.Node = null;       // 花椒
    @property(cc.Node)
    yanNode: cc.Node = null;           // 盐
    @property(cc.Node)
    hujiaoNode: cc.Node = null;        // 胡椒

    // 酒节点（放入盆后需先添加酒）
    @property(cc.Node)
    jiuNode: cc.Node = null;

    // 罐子节点（盆拖到此完成打包）
    @property(cc.Node)
    guanziNode: cc.Node = null;

    // 手指提示节点（第一关使用，第一个子节点为动画节点 sz_ske）
    @property(cc.Node)
    fingerNode: cc.Node = null;

    // 爱心节点（子节点为爱心背景，背景的第一个子节点为爱心ui，消耗时隐藏爱心ui）
    @property(cc.Node)
    aiXinNode: cc.Node = null;

    @property(cc.Node)
    tipsNode: cc.Node = null;

    // ==================== 内部状态 ====================

    orginPostion: cc.Vec2 = null;

    /** 罐子初始位置（用于每小关复位） */
    private guanziOriginPos: cc.Vec2 = null;

    /** 盆初始位置（隐藏后复位） */
    private penOriginPos: cc.Vec2 = null;

    /** 剩余爱心次数（3次机会，消耗完进入失败界面） */
    private remainingHearts: number = 3;

    // 游戏状态
    private gameState: GameState = GameState.IDLE;

    // 当前小关索引 (0-4)
    private currentSubLevel: number = 0;

    // 计时器
    private timerHandler: number = -1;

    // 剩余时间
    private remainTime: number = 0;

    // 是否游戏暂停
    private isPaused: boolean = false;

    // 刮除进度（按“已刮区域 / 底图面积”百分比计算，0-100）
    // private scratchProgress: number = 0;


    // 勺子拖到豆腐后触发一次动画链，完成后允许“放入盆中”
    private scratchActionCompleted: boolean = false;
    private isScratchTofuPlaying: boolean = false;

    // 当前客人索引
    private currentCustomerIndex: number = -1;

    // 四小关对应的客人顺序（随机打乱）
    private customerOrder: number[] = [];

    // 豆腐块状态列表
    private gameStateData: GameStateData = { appliedSeasonings: [] };

    // 放入盆后是否已添加酒
    private hasAddedWine: boolean = false;

    // 搅拌是否已完成（盆播放mdf2动画完成后为true，此时才可拖动盆到罐子）
    private stirCompleted: boolean = false;
    private isStirPlaying: boolean = false;

    // 当前拖拽的调料
    private draggingSeasoning: SeasoningType = null;
    private draggedNode: cc.Node = null;
    private dragStartPos: cc.Vec2 = null;
    private draggedNodeOriginalScale: number = 1;

    // 记录每个调料节点的初始缩放，避免多次点击/重复 tween 导致 scale 逐步变大
    private seasoningBaseScaleMap: Map<cc.Node, number> = new Map();

    /** 调料节点初始位置（用于回位，避免快速重复点击时用 tween 中途位置作为回位目标） */
    private seasoningOriginPosMap: Map<cc.Node, cc.Vec2> = new Map();

    // 酒拖拽
    private jiuOriginPos: cc.Vec2 = null;  // 酒固定初始位置（用于回位，避免快速重复点击时用 tween 中途位置）
    private isDraggingJiu: boolean = false;

    // 盆拖拽
    private isDraggingPen: boolean = false;

    // 四小关配置
    private subLevelConfigs: SubLevelConfig[] = [
        { id: 1, customerNeed: "老板，来份五香味霉豆腐", sound: "客人1", requiredSeasonings: [SeasoningType.HUJIAO], forbiddenSeasonings: [SeasoningType.DOUBANJIANG, SeasoningType.LAJIAO, SeasoningType.HUajIAO, SeasoningType.YAN,], timeLimit: 30 },
        { id: 2, customerNeed: "来份麻辣五香味的霉豆腐", sound: "客人2", requiredSeasonings: [SeasoningType.LAJIAO, SeasoningType.HUajIAO, SeasoningType.HUJIAO], forbiddenSeasonings: [SeasoningType.DOUBANJIANG, SeasoningType.YAN], timeLimit: 30 },
        { id: 3, customerNeed: "老板，来一份加麻加辣的霉豆腐,要双重辣", sound: "客人3", requiredSeasonings: [SeasoningType.LAJIAO, SeasoningType.HUajIAO, SeasoningType.DOUBANJIANG], forbiddenSeasonings: [SeasoningType.YAN, SeasoningType.HUJIAO], timeLimit: 35 },
        { id: 4, customerNeed: "来份加辣的霉豆腐，我要吃咸一点的", sound: "客人4", requiredSeasonings: [SeasoningType.LAJIAO, SeasoningType.YAN], forbiddenSeasonings: [SeasoningType.DOUBANJIANG, SeasoningType.HUajIAO, SeasoningType.HUJIAO], timeLimit: 35 },
    ];

    // ==================== 生命周期 ====================

    onLoad() {
        // 锉刀触摸事件（刮开用）
        this.cdNode.on(cc.Node.EventType.TOUCH_START, this.onScratchStart, this);
        this.cdNode.on(cc.Node.EventType.TOUCH_MOVE, this.onScratchMove, this);
        this.cdNode.on(cc.Node.EventType.TOUCH_END, this.onScratchEnd, this);
        this.cdNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onScratchEnd, this);
        this.orginPostion = this.cdNode.getPosition();

        // 绑定调料拖拽事件
        this.bindSeasoningDragEvents();

        // 绑定酒拖拽事件（prefab 未手动绑定时自动按名称兜底查找）
        if (!this.jiuNode) {
            this.jiuNode = this.findNodeByName(this.node, "jiu");
        }
        if (this.jiuNode) {
            this.jiuNode.on(cc.Node.EventType.TOUCH_START, this.onJiuTouchStart, this);
            this.jiuNode.on(cc.Node.EventType.TOUCH_MOVE, this.onJiuTouchMove, this);
            this.jiuNode.on(cc.Node.EventType.TOUCH_END, this.onJiuTouchEnd, this);
            this.jiuNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onJiuTouchEnd, this);
        }

        // 绑定盆拖拽事件（替代打包按钮）
        if (!this.guanziNode) {
            this.guanziNode = this.findNodeByName(this.node, "20");
        }
        if (this.guanziNode) {
            const p = this.guanziNode.getPosition();
            this.guanziOriginPos = cc.v2(p.x, p.y);
        }
        if (!this.aiXinNode) {
            this.aiXinNode = this.findNodeByName(this.node, "aiXin");
        }
        if (!this.fingerNode) {
            this.fingerNode = this.findNodeByName(this.node, "finger");
        }
        if (!this.stirBtn) {
            this.stirBtn = this.findNodeByName(this.node, "stirBtn") || this.findNodeByName(this.node, "搅拌");
        }
        if (this.penNode) {
            this.penNode.on(cc.Node.EventType.TOUCH_START, this.onPenTouchStart, this);
            this.penNode.on(cc.Node.EventType.TOUCH_MOVE, this.onPenTouchMove, this);
            this.penNode.on(cc.Node.EventType.TOUCH_END, this.onPenTouchEnd, this);
            this.penNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onPenTouchEnd, this);
        }
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景lv348");
        }, 0.5)
        // 初始化游戏
        this.initGame();
    }

    protected onDestroy(): void {
        // this.clearTimer();
        this.unscheduleAllCallbacks();

        // 移除锉刀触摸事件
        if (this.cdNode) {
            this.cdNode.off(cc.Node.EventType.TOUCH_START, this.onScratchStart, this);
            this.cdNode.off(cc.Node.EventType.TOUCH_MOVE, this.onScratchMove, this);
            this.cdNode.off(cc.Node.EventType.TOUCH_END, this.onScratchEnd, this);
            this.cdNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onScratchEnd, this);
        }

        // 移除调料拖拽事件
        this.unbindSeasoningDragEvents();

        // 移除盆拖拽事件
        if (this.penNode) {
            this.penNode.off(cc.Node.EventType.TOUCH_START, this.onPenTouchStart, this);
            this.penNode.off(cc.Node.EventType.TOUCH_MOVE, this.onPenTouchMove, this);
            this.penNode.off(cc.Node.EventType.TOUCH_END, this.onPenTouchEnd, this);
            this.penNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onPenTouchEnd, this);
        }

        // 移除酒拖拽事件
        if (this.jiuNode) {
            this.jiuNode.off(cc.Node.EventType.TOUCH_START, this.onJiuTouchStart, this);
            this.jiuNode.off(cc.Node.EventType.TOUCH_MOVE, this.onJiuTouchMove, this);
            this.jiuNode.off(cc.Node.EventType.TOUCH_END, this.onJiuTouchEnd, this);
            this.jiuNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onJiuTouchEnd, this);
        }
    }

    // ==================== 游戏初始化 ====================

    /** 初始化游戏 */
    private initGame() {
        this.currentSubLevel = 0;
        // this.scratchProgress = 0;
        this.isPaused = false;
        GameData.PauseGame = false;

        // 生成随机客人顺序
        this.generateCustomerOrder();

        // 初始化爱心（3次机会）
        this.remainingHearts = 3;
        this.initHearts();

        this.startSubLevel();
    }

    /** 生成随机客人顺序 */
    private generateCustomerOrder() {
        this.customerOrder = [0, 1, 2, 3];
        for (let i = this.customerOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.customerOrder[i], this.customerOrder[j]] = [this.customerOrder[j], this.customerOrder[i]];
        }
    }

    // ==================== 小关流程控制 ====================

    /** 开始当前小关 */
    private startSubLevel() {
        // 重置状态
        // this.scratchProgress = 0;
        this.scratchActionCompleted = false;
        this.isScratchTofuPlaying = false;
        this.gameStateData = { appliedSeasonings: [] };
        this.hasAddedWine = false;
        this.stirCompleted = false;
        this.isStirPlaying = false;
        this.draggingSeasoning = null;
        this.isDraggingJiu = false;
        this.isDraggingPen = false;

        // 隐藏盆和调料
        this.hideGameElements();

        // 初始化罐子：显示罐子、隐藏罐子下动画节点、复位罐子位置
        this.initGuanziState();

        // 初始化盆：盆显示、隐藏盆下动画节点、复位盆位置
        this.initPenStateEarly();

        // 霉豆腐和筷子开局显示
        if (this.cdNode) {
            this.cdNode.active = true;
            if (this.orginPostion) this.cdNode.setPosition(this.orginPostion);
        }
        if (this.scratchTofuNode) this.scratchTofuNode.active = true;

        // 重置豆腐块显示（隐藏盆时重置所有子节点状态）
        this.resetAllTofuChildren();

        // 显示客人需求
        this.showCustomerNeed();
    }

    /** 重置所有豆腐块的子节点状态 - 通过 pen_ske 插槽重置为无配料（pen_ske 未显示时跳过） */
    private resetAllTofuChildren() {
        this.resetPenSkeSlots();
    }

    /** 初始化盆（每小关开始）：盆显示、隐藏盆下动画节点、复位盆位置 */
    private initPenStateEarly() {
        if (!this.penNode) return;
        this.penNode.active = true;
        if (!this.penOriginPos) {
            const p = this.penNode.getPosition();
            this.penOriginPos = cc.v2(p.x, p.y);
        }
        this.penNode.setPosition(this.penOriginPos);
        const penSkeNode = this.findNodeByName(this.penNode, "pen_ske") || this.findNodeByName(this.penNode, "mdf_ske");
        if (penSkeNode) penSkeNode.active = false;
        this.penNode.children[0].active = true;
    }

    /** 隐藏游戏元素（不隐藏霉豆腐和筷子，开局需显示） */
    private hideGameElements() {
        this.hideFinger();
        if (this.putInPenBtn) this.putInPenBtn.active = false;
        if (this.stirBtn) this.stirBtn.active = false;
    }

    /** 初始化爱心显示（恢复所有爱心ui） */
    private initHearts() {
        if (!this.aiXinNode) return;
        for (let i = 0; i < this.aiXinNode.childrenCount; i++) {
            const bg = this.aiXinNode.children[i];
            const heartUi = bg?.children?.[0];
            if (heartUi) heartUi.active = true;
        }
    }

    /** 消耗一个爱心（隐藏对应爱心ui） */
    private consumeHeart() {
        if (!this.aiXinNode || this.remainingHearts <= 0) return;
        const heartIndex = this.remainingHearts - 1;  // 从右到左消耗
        const bg = this.aiXinNode.children[heartIndex];
        const heartUi = bg?.children?.[0];
        if (heartUi) heartUi.active = false;
        this.remainingHearts--;
    }

    /** 是否第一关（用于手指提示） */
    private isFirstLevel(): boolean {
        return this.currentSubLevel === 0;
    }

    /** 显示手指并播放动画（仅第一关），手指保持显示最高 */
    private showFingerAndPlay(animName: string) {
        if (!this.isFirstLevel() || !this.fingerNode) return;
        const animNode = this.fingerNode.children?.[0];
        if (!animNode) return;
        const armature = this.findArmatureDisplay(animNode);
        if (!armature) return;
        this.fingerNode.active = true;
        this.setMovableNodeTop(this.fingerNode);
        armature.playAnimation(animName, -1);
    }

    /** 手指播放动画（手指已显示时切换），手指保持显示最高 */
    private playFingerAnimation(animName: string) {
        if (this.isFirstLevel() && !this.fingerNode.active) this.fingerNode.active = true;
        if (!this.isFirstLevel() || !this.fingerNode || !this.fingerNode.active) return;
        const animNode = this.fingerNode.children?.[0];
        if (!animNode) return;
        const armature = this.findArmatureDisplay(animNode);
        if (!armature) return;

        this.setMovableNodeTop(this.fingerNode);
        armature.playAnimation(animName, -1);
    }

    /** 隐藏手指提示 */
    private hideFinger() {
        if (this.fingerNode) this.fingerNode.active = false;
    }

    /** 将可移动节点置顶（拖拽时最上层） */
    private setMovableNodeTop(node: cc.Node) {
        if (!node || !node.parent) return;
        node.setSiblingIndex(node.parent.childrenCount - 1);
        // 手指节点保持显示最高
        if (this.fingerNode && this.fingerNode.active && this.fingerNode.parent) {
            this.fingerNode.setSiblingIndex(this.fingerNode.parent.childrenCount - 1);
        }
    }

    /** 初始化罐子状态：显示罐子、隐藏罐子下mdf_ske、复位到初始位置 */
    private initGuanziState() {
        if (!this.guanziNode) return;
        this.guanziNode.active = true;
        const mdfNode = this.findNodeByName(this.guanziNode, "mdf_ske");
        if (mdfNode) mdfNode.active = false;
        if (this.guanziOriginPos) {
            this.guanziNode.setPosition(this.guanziOriginPos);
        }
    }

    /** 显示客人需求 */
    private showCustomerNeed() {
        const config = this.subLevelConfigs[this.currentSubLevel];
        this.gameState = GameState.SHOW_CUSTOMER;

        if (!this.kerenNode) {
            cc.warn("keren节点未绑定");
            return;
        }

        this.currentCustomerIndex = this.customerOrder[this.currentSubLevel];

        // 隐藏所有客人子节点
        for (let i = 0; i < this.kerenNode.childrenCount; i++) {
            this.kerenNode.children[i].active = false;
        }

        // 激活当前客人
        let currentCustomer = this.kerenNode.children[this.currentCustomerIndex];
        if (!currentCustomer) {
            cc.warn(`客人${this.currentCustomerIndex}不存在`);
            return;
        }
        currentCustomer.active = true;
        const angryNode = currentCustomer.getChildByName("lost") || currentCustomer.getChildByName("lost");
        const winNode = currentCustomer.getChildByName("win") || currentCustomer.getChildByName("win");
        if (angryNode) {
            winNode.active = true;
            angryNode.active = false;
        }

        // 设置初始位置
        let screenWidth = cc.winSize.width;
        let originalY = this.kerenNode.y;
        this.kerenNode.setPosition(-screenWidth / 2 - 200, originalY);
        this.kerenNode.active = true;

        // 获取对话气泡
        let dialogBubble = currentCustomer.getChildByName("dialogBubble");
        let dialogLabel = dialogBubble?.getChildByName("dialogLabel")?.getComponent(cc.Label);

        if (dialogBubble) {
            dialogBubble.active = false;
            dialogBubble.scale = 0;
        }

        // 客人入场动画
        cc.tween(this.kerenNode)
            .to(0.8, { x: 0 }, { easing: "quadOut" })
            .call(() => {
                AudioManager.playEffect(config.sound);
                this.showDialogBubble(dialogBubble, dialogLabel, config.customerNeed);
            })
            .start();
    }

    /** 显示对话气泡 */
    private showDialogBubble(bubbleNode: cc.Node, label: cc.Label, text: string) {
        if (!bubbleNode || !label) {
            this.showConfirmButton();
            return;
        }

        label.string = "";
        bubbleNode.active = true;

        cc.tween(bubbleNode)
            .to(0.3, { scale: 1.1 }, { easing: "backOut" })
            .to(0.1, { scale: 1 })
            .call(() => {
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.typewriterEffect(label, text, () => {
                    this.scheduleOnce(() => {
                        this.showConfirmButton();
                    }, 0.5);
                });
            })
            .start();
    }

    /** 文字逐个弹出效果 */
    private typewriterEffect(label: cc.Label, text: string, callback?: Function) {
        let currentIndex = 0;
        label.string = "";

        let typeInterval = setInterval(() => {
            if (currentIndex < text.length) {
                label.string += text[currentIndex];
                currentIndex++;
            } else {
                clearInterval(typeInterval);
                callback && callback();
            }
        }, 50);
    }

    /** 显示确认按钮 */
    private showConfirmButton() {
        if (this.confirmBtn) {
            this.confirmBtn.active = true;
            this.confirmBtn.scale = 0;
            cc.tween(this.confirmBtn)
                .to(0.3, { scale: 1 }, { easing: "backOut" })
                .start();
        }
    }

    /** 确认开始制作 */
    public onConfirmStart() {
        AudioManager.playEffect(AudioManager.common.BUTTON);

        if (this.confirmBtn) {
            this.confirmBtn.active = false;
        }

        // 隐藏对话气泡（客人留在原地）
        if (this.kerenNode) {
            let currentCustomer = this.kerenNode.children[this.currentCustomerIndex];
            let dialogBubble = currentCustomer?.getChildByName("dialogBubble");
            if (dialogBubble) {
                cc.tween(dialogBubble)
                    .to(0.3, { scale: 0 })
                    .call(() => {
                        dialogBubble.active = false;
                        this.startScratchPhase();
                    })
                    .start();
            } else {
                this.startScratchPhase();
            }
        } else {
            this.startScratchPhase();
        }
    }

    /** 开始刮开阶段 */
    private startScratchPhase() {
        this.gameState = GameState.SCRATCHING;
        this.scratchActionCompleted = false;
        this.isScratchTofuPlaying = false;
        // this.scratchProgress = 0;
        // this.updateProgressUI();

        if (this.putInPenBtn) this.putInPenBtn.active = false;

        // 显示勺子和豆腐，并把勺子复位
        if (this.cdNode) {
            this.cdNode.active = true;
            if (this.orginPostion) {
                this.cdNode.setPosition(this.orginPostion);
            }
            this.setMovableNodeTop(this.cdNode);
        }
        if (this.scratchTofuNode) this.scratchTofuNode.active = true;

        // 第一关：确认顾客需求后显示手指并播放kuaizi动画
        this.showFingerAndPlay("kuaizi");


    }

    // ==================== 刮开遮罩 ====================

    onScratchStart(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SCRATCHING || this.isPaused) return;
        if (!this.cdNode || this.scratchActionCompleted || this.isScratchTofuPlaying) return;
    }

    onScratchMove(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SCRATCHING || this.isPaused) return;
        if (!this.cdNode || this.scratchActionCompleted || this.isScratchTofuPlaying) return;

        // 跟手拖动勺子
        const worldPos = event.getLocation();
        const p = this.node.convertToNodeSpaceAR(worldPos);
        this.cdNode.setPosition(p);
    }

    onScratchEnd(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SCRATCHING || this.isPaused) return;
        if (!this.cdNode) return;

        const worldPos = event.getLocation();
        const hitTofu = !!this.scratchTofuNode && this.isPointInNode(worldPos, this.scratchTofuNode);

        // 勺子复位
        if (this.orginPostion) {
            this.cdNode.setPosition(this.orginPostion);
        }

        if (hitTofu) {
            // 隐藏勺子
            this.cdNode.active = false;
            this.onSpoonDropToScratchTofu();
        }
    }

    /** 勺子拖到豆腐上：豆腐节点提高展示优先级，播放龙骨动画链 */
    private onSpoonDropToScratchTofu() {
        if (this.gameState !== GameState.SCRATCHING || this.isPaused) return;
        if (this.scratchActionCompleted || this.isScratchTofuPlaying) return;

        this.isScratchTofuPlaying = true;
        this.setMovableNodeTop(this.scratchTofuNode);

        const animRoot = this.scratchTofuNode?.children?.[0];
        if (!animRoot) {
            cc.warn("[meiDouFu_348] scratchTofuNode 缺少子节点，无法播放龙骨动画");
            this.finishScratchTofuAction();
            return;
        }

        const armature = this.findArmatureDisplay(animRoot);
        if (!armature) {
            cc.warn("[meiDouFu_348] 未在 scratchTofuNode 第一个子节点下找到 dragonBones.ArmatureDisplay");
            this.finishScratchTofuAction();
            return;
        }
        AudioManager.playEffect("划豆腐");
        // 先播放 kuaizi，结束后播放 df_dj2
        armature.playAnimation("kuaizi", 1);
        this.hideFinger();
        this.addOneTimeListener(
            armature,
            () => {
                armature.playAnimation("df_dj2", 1);
                this.addOneTimeListener(armature, () => this.finishScratchTofuAction(), dragonBones.EventObject.COMPLETE, this);
            },
            dragonBones.EventObject.COMPLETE,
            this
        );
    }

    /** 递归查找第一个 ArmatureDisplay（用于兼容节点层级差异） */
    private findArmatureDisplay(root: cc.Node): dragonBones.ArmatureDisplay {
        if (!root) return null;

        const direct = root.getComponent(dragonBones.ArmatureDisplay);
        if (direct) return direct;

        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findArmatureDisplay(root.children[i]);
            if (found) return found;
        }

        return null;
    }

    /** 动画链结束：允许点击“放入盆中” */
    private finishScratchTofuAction() {
        this.isScratchTofuPlaying = false;
        this.scratchActionCompleted = true;
        // this.scratchProgress = 100;
        // this.updateProgressUI();
        this.hideFinger();

        if (this.putInPenBtn && !this.putInPenBtn.active) {
            this.showPutInPenButton();
        }
    }


    /** 显示放入盆中按钮 */
    private showPutInPenButton() {
        if (this.putInPenBtn) {
            this.putInPenBtn.active = true;
            this.putInPenBtn.scale = 0;
            cc.tween(this.putInPenBtn)
                .to(0.3, { scale: 1 }, { easing: "backOut" })
                .start();
        }
    }

    /** 点击放入盆中按钮 */
    public onPutInPen() {
        if (!this.scratchActionCompleted) {
            return;
        }

        AudioManager.playEffect(AudioManager.common.BUTTON);

        // 隐藏放入盆中按钮
        if (this.putInPenBtn) {
            this.putInPenBtn.active = false;
        }

        // 隐藏勺子
        if (this.cdNode) this.cdNode.active = false;
        // 豆腐保持显示，恢复待机动画 df_dj
        if (this.scratchTofuNode) {
            this.scratchTofuNode.active = true;
            const tofuArm = this.findArmatureDisplay(this.scratchTofuNode);
            if (tofuArm) tofuArm.playAnimation("df_dj", -1);
        }

        // 显示盆
        this.showPenAndStartSeasoning();
    }

    /** 豆腐放入盆中：显示盆下动画节点，开始配料阶段 */
    private showPenAndStartSeasoning() {
        this.gameState = GameState.SEASONING;

        this.scratchTofuNode.active = false;
        // 豆腐拖动到盆：显示盆下动画节点
        if (this.penNode) {
            const penSkeNode = this.findNodeByName(this.penNode, "pen_ske") || this.findNodeByName(this.penNode, "mdf_ske");
            if (penSkeNode) penSkeNode.active = true;
            this.initPenState();
            this.showWineNode();
            // 第一关：放酒环节播放jiu动画
            this.showFingerAndPlay("jiu");
            this.setMovableNodeTop(this.penNode);
            [this.doubanjiangNode, this.lajiaoNode, this.huajiaoNode, this.yanNode, this.hujiaoNode].forEach(n => {
                if (n) this.setMovableNodeTop(n);
            });
        }
    }

    /** 尝试显示搅拌按钮（添加配料后显示，用于播放mdf2搅拌动画） */
    private tryShowStirButton() {
        if (!this.stirBtn || this.stirCompleted || this.isStirPlaying) return;
        if (!this.hasAddedWine || this.gameStateData.appliedSeasonings.length === 0) return;
        if (!this.stirBtn.active) {
            this.stirBtn.active = true;
            this.stirBtn.scale = 0;
            cc.tween(this.stirBtn)
                .to(0.3, { scale: 1 }, { easing: "backOut" })
                .start();
        }
    }

    /** 搅拌按钮点击：盆的动画节点播放mdf2，完成后才可拖动盆到罐子 */
    public onStirBtnClick() {
        if (this.gameState !== GameState.SEASONING || this.isPaused || this.isStirPlaying) return;
        if (!this.hasAddedWine || this.gameStateData.appliedSeasonings.length === 0) return;

        const penSke = this.getPenSkeArmature();
        if (!penSke || !penSke.armature()) {
            cc.warn("[meiDouFu_348] 盆下未找到 pen_ske 龙骨，无法播放 mdf2");
            this.stirCompleted = true;
            this.hideStirButton();
            return;
        }

        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.isStirPlaying = true;
        this.penNode.children[0].active = false;
        penSke.playAnimation("mdf2", 1);
        this.addOneTimeListener(
            penSke,
            () => {
                this.isStirPlaying = false;
                this.stirCompleted = true;
                this.hideStirButton();
                // 恢复盆待机动画
                penSke.playAnimation("pz_dj", -1);
                this.playFingerAnimation("doufu");
            },
            dragonBones.EventObject.COMPLETE,
            this
        );
    }

    /** 隐藏搅拌按钮 */
    private hideStirButton() {
        if (this.stirBtn) this.stirBtn.active = false;
    }

    /** 初始化盆状态 */
    private initPenState() {
        this.gameStateData = { appliedSeasonings: [] };

        // 初始化盆下子节点：只显示索引0（无调料）
        this.resetPenChildren();
    }

    /** 重置盆子节点显示 - 通过 pen_ske 插槽重置 */
    private resetPenChildren() {
        this.resetPenSkeSlots();
    }

    /** 重置 pen_ske 龙骨插槽：插槽09=0（无配料），插槽yan=-1（隐藏） */
    private resetPenSkeSlots() {
        if (!this.penNode) return;
        const penSkeNode = this.findNodeByName(this.penNode, "pen_ske") || this.findNodeByName(this.penNode, "mdf_ske");
        if (!penSkeNode || !penSkeNode.active) return;
        const penSke = this.getPenSkeArmature();
        if (!penSke) return;

        const armature = penSke.armature();
        if (!armature) return;  // pen 未激活时 armature 可能未初始化，跳过

        try {
            armature.getSlot("09").displayIndex = 0;
            armature.getSlot("yan").displayIndex = -1;
        } catch (e) {
            cc.warn("[meiDouFu_348] 重置 pen_ske 插槽失败:", e);
        }
    }

    /** 获取 pen 下的 pen_ske 龙骨 ArmatureDisplay */
    private getPenSkeArmature(): dragonBones.ArmatureDisplay {
        if (!this.penNode) return null;
        const penSkeNode = this.findNodeByName(this.penNode, "pen_ske") || this.findNodeByName(this.penNode, "mdf_ske");
        if (!penSkeNode) return null;
        return this.findArmatureDisplay(penSkeNode);
    }

    /** 显示加酒节点 */
    private showWineNode() {
        if (!this.jiuNode) {
            // 场景里没有酒节点时不阻塞原流程
            this.hasAddedWine = true;
            this.onWineAdded();
            return;
        }
        this.jiuNode.active = true;
        // 记录酒的固定初始位置，用于回位（避免快速重复点击时用 tween 中途位置）
        const p = this.jiuNode.getPosition();
        this.jiuOriginPos = cc.v2(p.x, p.y);
        this.setMovableNodeTop(this.jiuNode);
    }

    /** 酒触摸开始 */
    private onJiuTouchStart(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SEASONING || this.isPaused || this.hasAddedWine) return;

        this.isDraggingJiu = true;
        cc.Tween.stopAllByTarget(this.jiuNode);  // 停止可能正在执行的回位 tween，避免与拖拽冲突
        this.setMovableNodeTop(this.jiuNode);
        // AudioManager.playEffect("pick");
    }

    /** 酒触摸移动 */
    private onJiuTouchMove(event: cc.Event.EventTouch) {
        if (!this.isDraggingJiu || !this.jiuNode) return;

        let delta = event.getDelta();
        let currentPos = this.jiuNode.getPosition();
        this.jiuNode.setPosition(currentPos.x + delta.x, currentPos.y + delta.y);
    }

    /** 酒触摸结束 */
    private onJiuTouchEnd(event: cc.Event.EventTouch) {
        if (!this.isDraggingJiu || !this.jiuNode) return;

        let jiuWorldPos = this.jiuNode.parent.convertToWorldSpaceAR(this.jiuNode.getPosition());

        if (this.penNode && this.isPointInNode(jiuWorldPos, this.penNode)) {
            this.onJiuDropToPen();
        } else {
            this.resetJiuPosition();
        }

        this.isDraggingJiu = false;
    }

    /** 酒回原位 */
    private resetJiuPosition() {
        if (!this.jiuNode || !this.jiuOriginPos) return;
        cc.Tween.stopAllByTarget(this.jiuNode);
        cc.tween(this.jiuNode)
            .to(0.2, { x: this.jiuOriginPos.x, y: this.jiuOriginPos.y })
            .start();
    }

    /** 酒拖入盆中：播放daojiu动画，结束后回位并播放jiu_dj */
    private onJiuDropToPen() {
        if (this.gameState !== GameState.SEASONING || this.isPaused || this.hasAddedWine) return;

        const jiuSkeNode = this.findNodeByName(this.jiuNode, "mdf_ske") || this.jiuNode.children[0];
        if (!jiuSkeNode) {
            cc.warn("[meiDouFu_348] 酒节点下未找到龙骨节点 mdf_ske");
            this.hasAddedWine = true;
            this.onWineAdded();
            return;
        }

        const armature = this.findArmatureDisplay(jiuSkeNode);
        if (!armature) {
            cc.warn("[meiDouFu_348] 酒节点下未找到 dragonBones.ArmatureDisplay");
            this.hasAddedWine = true;
            this.onWineAdded();
            return;
        }
        this.hideFinger();
        AudioManager.playEffect("倒酒");
        // 酒动画在盆右上方固定位置播放
        const penTopRight = this.getPenTopRightPos();
        cc.Tween.stopAllByTarget(this.jiuNode);
        cc.tween(this.jiuNode)
            .to(0.15, { x: penTopRight.x, y: penTopRight.y })
            .call(() => {
                armature.playAnimation("daojiu", 1);
                this.addOneTimeListener(
                    armature,
                    () => {
                        cc.tween(this.jiuNode)
                            .to(0.2, { x: this.jiuOriginPos.x, y: this.jiuOriginPos.y })
                            .call(() => {
                                armature.playAnimation("jiu_dj", -1);
                                this.hasAddedWine = true;
                                this.onWineAdded();
                            })
                            .start();
                    },
                    dragonBones.EventObject.COMPLETE,
                    this
                );
            })
            .start();
    }

    /** 酒添加完成：第一关切换手指到jiangliao动画 */
    private onWineAdded() {
        this.playFingerAnimation("jiangliao");
    }

    /** 获取盆右上方的固定位置（与酒同父节点坐标系） */
    private getPenTopRightPos(): cc.Vec2 {
        if (!this.penNode || !this.jiuNode) return cc.v2(0, 0);
        const penPos = this.penNode.getPosition();
        const size = this.penNode.getContentSize();
        const anchor = this.penNode.getAnchorPoint();
        const topRightX = penPos.x + size.width * (1 - anchor.x) * 0.5 + 100;
        const topRightY = penPos.y + size.height * (1 - anchor.y) * 0.5 + 80;
        if (this.penNode.parent === this.jiuNode.parent) {
            return cc.v2(topRightX, topRightY);
        }
        const worldPos = this.penNode.parent.convertToWorldSpaceAR(cc.v2(topRightX, topRightY));
        return this.jiuNode.parent.convertToNodeSpaceAR(worldPos);
    }

    /** 递归查找节点 */
    private findNodeByName(root: cc.Node, targetName: string): cc.Node {
        if (!root) return null;
        if (root.name === targetName) return root;

        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findNodeByName(root.children[i], targetName);
            if (found) return found;
        }

        return null;
    }

    // ==================== 调料拖拽系统 ====================

    /** 绑定调料拖拽事件 */
    private bindSeasoningDragEvents() {
        let seasoningMap: [cc.Node, SeasoningType][] = [
            [this.doubanjiangNode, SeasoningType.DOUBANJIANG],
            [this.lajiaoNode, SeasoningType.LAJIAO],
            [this.huajiaoNode, SeasoningType.HUajIAO],
            [this.yanNode, SeasoningType.YAN],
            [this.hujiaoNode, SeasoningType.HUJIAO],
        ];

        seasoningMap.forEach(([node, type]) => {
            if (node) {
                // 缓存初始缩放，后续所有放大/复位都基于这个固定值
                if (!this.seasoningBaseScaleMap.has(node)) {
                    this.seasoningBaseScaleMap.set(node, node.scale);
                }
                // 缓存初始位置，回位时始终用此值，避免快速重复点击时用 tween 中途位置作为回位目标
                if (!this.seasoningOriginPosMap.has(node)) {
                    const p = node.getPosition();
                    this.seasoningOriginPosMap.set(node, cc.v2(p.x, p.y));
                }

                node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
                    this.onSeasoningTouchStart(event, type, node);
                }, this);
                node.on(cc.Node.EventType.TOUCH_MOVE, this.onSeasoningTouchMove, this);
                node.on(cc.Node.EventType.TOUCH_END, this.onSeasoningTouchEnd, this);
                node.on(cc.Node.EventType.TOUCH_CANCEL, this.onSeasoningTouchEnd, this);
            }
        });
    }

    /** 解除调料拖拽事件绑定 */
    private unbindSeasoningDragEvents() {
        [this.doubanjiangNode, this.lajiaoNode, this.huajiaoNode, this.yanNode, this.hujiaoNode].forEach(node => {
            if (node) {
                node.off(cc.Node.EventType.TOUCH_START);
                node.off(cc.Node.EventType.TOUCH_MOVE);
                node.off(cc.Node.EventType.TOUCH_END);
                node.off(cc.Node.EventType.TOUCH_CANCEL);
            }
        });
    }

    /** 调料触摸开始 */
    private onSeasoningTouchStart(event: cc.Event.EventTouch, type: SeasoningType, node: cc.Node) {
        if (this.gameState !== GameState.SEASONING || this.isPaused) return;
        if (!this.hasAddedWine) return;

        this.draggingSeasoning = type;
        this.draggedNode = node;
        this.dragStartPos = node.getPosition();

        // 强制以“初始缩放”为基准，避免连续点击时用到上一次 tween 中间态导致 scale 累积变大
        this.draggedNodeOriginalScale = this.seasoningBaseScaleMap.get(node) ?? node.scale;
        cc.Tween.stopAllByTarget(node);
        node.scale = this.draggedNodeOriginalScale;

        this.setMovableNodeTop(node);
        // 放大效果
        cc.tween(node)
            .to(0.1, { scale: this.draggedNodeOriginalScale * 1.2 })
            .start();

        // AudioManager.playEffect("pick");
    }

    /** 调料触摸移动 */
    private onSeasoningTouchMove(event: cc.Event.EventTouch) {
        if (!this.draggingSeasoning || !this.draggedNode) return;

        let delta = event.getDelta();
        let currentPos = this.draggedNode.getPosition();
        this.draggedNode.setPosition(currentPos.x + delta.x, currentPos.y + delta.y);
    }

    /** 调料触摸结束 */
    private onSeasoningTouchEnd(event: cc.Event.EventTouch) {
        if (!this.draggingSeasoning || !this.draggedNode) return;

        // 检查是否在盆区域
        let seasoningWorldPos = this.draggedNode.parent.convertToWorldSpaceAR(this.draggedNode.getPosition());

        if (this.penNode && this.isPointInNode(seasoningWorldPos, this.penNode)) {
            // 在盆内，应用调料
            this.applySeasoning(this.draggingSeasoning);
            AudioManager.playEffect("撒酱料");

        }

        // 恢复原位和“初始缩放”（避免 scale 累积）。始终用初始位置回位，避免快速重复点击时用 tween 中途位置
        const node = this.draggedNode;
        const baseScale = this.seasoningBaseScaleMap.get(node) ?? this.draggedNodeOriginalScale;
        const originPos = this.seasoningOriginPosMap.get(node) ?? this.dragStartPos;
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(0.2, { x: originPos.x, y: originPos.y, scale: baseScale })
            .start();

        this.draggingSeasoning = null;
        this.draggedNode = null;
    }

    /** 检查点是否在节点内 */
    private isPointInNode(worldPos: cc.Vec2, node: cc.Node): boolean {
        let nodeWorldPos = node.parent ? node.parent.convertToWorldSpaceAR(node.getPosition()) : node.getPosition();
        let size = node.getContentSize();
        let anchor = node.getAnchorPoint();

        let minX = nodeWorldPos.x - size.width * anchor.x;
        let maxX = nodeWorldPos.x + size.width * (1 - anchor.x);
        let minY = nodeWorldPos.y - size.height * anchor.y;
        let maxY = nodeWorldPos.y + size.height * (1 - anchor.y);

        return worldPos.x >= minX && worldPos.x <= maxX && worldPos.y >= minY && worldPos.y <= maxY;
    }

    /** 应用调料到盆 - 切换对应子节点显示 */
    private applySeasoningToPen(seasoning: SeasoningType) {
        // 避免重复添加相同调料
        if (this.gameStateData.appliedSeasonings.includes(seasoning)) {
            return;
        }

        this.gameStateData.appliedSeasonings.push(seasoning);

        // 切换显示对应的子节点
        this.showSeasoningChildNode(seasoning);

        // 第一关：玩家拖动hujiao进盆后展示doufu动画，等待盆拖动到罐子再隐藏
        if (seasoning === SeasoningType.HUJIAO) {
            this.playFingerAnimation("jiaoban");
        }
        // 添加新调料后需再次搅拌，重置完成状态并显示搅拌按钮
        if (this.stirCompleted) {
            this.stirCompleted = false;
        }
        this.tryShowStirButton();
    }

    /** 显示调料对应的 pen_ske 插槽
     * 插槽09：index 0=无, 1=五香粉(胡椒), 2=花椒, 3=辣椒, 4=豆瓣
     * 插槽yan：index 0=显示盐, -1=隐藏
     */
    private showSeasoningChildNode(seasoning: SeasoningType) {
        const penSke = this.getPenSkeArmature();
        if (!penSke) return;

        const armature = penSke.armature();
        if (!armature) return;

        try {
            if (seasoning === SeasoningType.YAN) {
                armature.getSlot("yan").displayIndex = 0;
            } else {
                let slot09Index = 0;
                switch (seasoning) {
                    case SeasoningType.HUJIAO: slot09Index = 1; break;       // 五香粉
                    case SeasoningType.HUajIAO: slot09Index = 2; break;     // 花椒粉
                    case SeasoningType.LAJIAO: slot09Index = 3; break;     // 辣椒粉
                    case SeasoningType.DOUBANJIANG: slot09Index = 4; break; // 豆瓣
                    default: break;
                }
                armature.getSlot("09").displayIndex = slot09Index;
            }
        } catch (e) {
            cc.warn("[meiDouFu_348] 设置 pen_ske 插槽失败:", e);
        }
    }

    /** 应用调料 - 直接应用到盆 */
    private applySeasoning(seasoning: SeasoningType) {
        this.applySeasoningToPen(seasoning);
    }

    // ==================== 盆拖拽与打包 ====================

    /** 盆触摸开始 */
    private onPenTouchStart(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SEASONING || this.isPaused) return;
        if (!this.hasAddedWine) return;
        // 添加配料后须点击搅拌按钮播放mdf2动画完成后才可拖动盆到罐子
        if (this.gameStateData.appliedSeasonings.length > 0 && !this.stirCompleted) return;
        this.isDraggingPen = true;
        cc.Tween.stopAllByTarget(this.penNode);  // 停止可能正在执行的回位 tween，避免与拖拽冲突
        this.setMovableNodeTop(this.penNode);
        // AudioManager.playEffect("pick");
    }

    /** 盆触摸移动 */
    private onPenTouchMove(event: cc.Event.EventTouch) {
        if (!this.isDraggingPen || !this.penNode) return;
        let delta = event.getDelta();
        let currentPos = this.penNode.getPosition();
        this.penNode.setPosition(currentPos.x + delta.x, currentPos.y + delta.y);
    }

    /** 盆触摸结束 */
    private onPenTouchEnd(event: cc.Event.EventTouch) {
        if (!this.isDraggingPen || !this.penNode) return;
        let penWorldPos = this.penNode.parent.convertToWorldSpaceAR(this.penNode.getPosition());
        if (this.guanziNode && this.isPointInNode(penWorldPos, this.guanziNode)) {
            this.onPenDropToGuanzi();
        } else {
            // 始终用 penOriginPos 回位，避免快速重复点击时用 tween 中途位置
            if (this.penOriginPos) {
                cc.Tween.stopAllByTarget(this.penNode);
                cc.tween(this.penNode).to(0.2, { x: this.penOriginPos.x, y: this.penOriginPos.y }).start();
            }
        }
        this.isDraggingPen = false;
    }

    /** 盆拖到罐子上：隐藏盆，罐子同步插槽，播放 gz_gs->gz_dj2，飞向顾客 */
    private onPenDropToGuanzi() {
        if (this.gameState !== GameState.SEASONING || this.isPaused || !this.hasAddedWine) return;

        const jarSke = this.getGuanziArmature();
        const isWin = this.checkSeasoningResultSilent();
        this.gameState = GameState.CHECK_RESULT;

        if (!jarSke) {
            cc.warn("[meiDouFu_348] 罐子下未找到 mdf_ske");
            this.checkAndDeliverToCustomer(isWin);
            return;
        }
        this.hideFinger();

        // 盆回到初始位置后隐藏
        if (this.penOriginPos) {
            this.penNode.setPosition(this.penOriginPos);
        }
        this.penNode.active = false;

        // 先显示罐子下动画节点，再切换插槽播放
        const mdfNode = this.findNodeByName(this.guanziNode, "mdf_ske");
        if (mdfNode) mdfNode.active = true;

        // 复制盆插槽到罐子
        this.copyPenSlotsToGuanzi(jarSke);

        // 播放 gz_gs -> gz_dj2
        jarSke.playAnimation("gz_gs", 1);
        this.addOneTimeListener(
            jarSke,
            () => {
                jarSke.playAnimation("gz_dj2", 1);
                this.addOneTimeListener(
                    jarSke,
                    () => this.flyGuanziToCustomer(isWin),
                    dragonBones.EventObject.COMPLETE,
                    this
                );
            },
            dragonBones.EventObject.COMPLETE,
            this
        );
    }

    /** 静默判断胜负，不触发动画 */
    private checkSeasoningResultSilent(): boolean {
        const config = this.subLevelConfigs[this.currentSubLevel];
        const appliedArray = this.gameStateData.appliedSeasonings;
        const hasAllRequired = config.requiredSeasonings.every(req => appliedArray.includes(req));
        const hasForbidden = config.forbiddenSeasonings.some(forbid => appliedArray.includes(forbid));
        return this.hasAddedWine && hasAllRequired && !hasForbidden;
    }

    /** 按盆显示的配料设置罐子插槽gz：0=盐/无, 1=五香粉, 2=花椒, 3=辣椒, 4=豆瓣 */
    private copyPenSlotsToGuanzi(jarSke: dragonBones.ArmatureDisplay) {
        const penSke = this.getPenSkeArmature();
        if (!penSke || !penSke.armature() || !jarSke || !jarSke.armature()) return;
        try {
            const penArm = penSke.armature();
            const jarArm = jarSke.armature();
            const pen09 = penArm.getSlot("09").displayIndex;
            const penYan = penArm.getSlot("yan").displayIndex;
            let slot57Index = 0;
            if (penYan >= 0) {
                slot57Index = 0;  // 盆显示盐 -> 罐子0
            } else {
                slot57Index = pen09;  // 盆slot09索引直接对应罐子57
            }
            const gzSlot = jarArm.getSlot("gz") || jarArm.getSlot("57");
            if (gzSlot) gzSlot.displayIndex = slot57Index;
        } catch (e) {
            cc.warn("[meiDouFu_348] 设置罐子插槽gz失败:", e);
        }
    }

    /** 获取罐子下的 mdf_ske ArmatureDisplay */
    private getGuanziArmature(): dragonBones.ArmatureDisplay {
        if (!this.guanziNode) return null;
        const mdfNode = this.findNodeByName(this.guanziNode, "mdf_ske");
        return mdfNode ? this.findArmatureDisplay(mdfNode) : null;
    }

    /** 罐子飞向顾客，隐藏后弹出胜负对话 */
    private flyGuanziToCustomer(isWin: boolean) {
        if (!this.guanziNode || !this.kerenNode) {
            this.checkAndDeliverToCustomer(isWin);
            return;
        }
        const currentCustomer = this.kerenNode.children[this.currentCustomerIndex];
        if (!currentCustomer) {
            this.checkAndDeliverToCustomer(isWin);
            return;
        }
        const customerWorldPos = currentCustomer.parent.convertToWorldSpaceAR(currentCustomer.getPosition());
        const targetPos = this.guanziNode.parent.convertToNodeSpaceAR(customerWorldPos);

        cc.tween(this.guanziNode)
            .to(0.8, { x: targetPos.x, y: targetPos.y }, { easing: "sineInOut" })
            .call(() => {
                this.guanziNode.active = false;
                this.checkAndDeliverToCustomer(isWin);
            })
            .start();
    }

    /** 根据胜负弹顾客对话并进入下一流程 */
    private checkAndDeliverToCustomer(isWin: boolean) {
        const currentCustomer = this.kerenNode?.children[this.currentCustomerIndex];
        const dialogBubble = currentCustomer?.getChildByName("dialogBubble");
        const dialogLabel = dialogBubble?.getChildByName("dialogLabel")?.getComponent(cc.Label);

        const winText = "这个霉豆腐看起来真好吃";
        const loseText = "这做的是什么，看起来这么难吃";

        if (dialogBubble && dialogLabel) {
            dialogBubble.active = true;
            dialogBubble.scale = 0;
            dialogLabel.string = "";
            if (!isWin) {
                const currentCustomer = this.kerenNode?.children[this.currentCustomerIndex];
                const angryNode = currentCustomer?.getChildByName("lost") || currentCustomer?.getChildByName("lost");
                const winNode = currentCustomer?.getChildByName("win") || currentCustomer?.getChildByName("win");
                if (angryNode) {
                    winNode.active = false;
                    angryNode.active = true;
                }
            }

            cc.tween(dialogBubble)
                .to(0.3, { scale: 1.1 }, { easing: "backOut" })
                .to(0.1, { scale: 1 })
                .call(() => {
                    AudioManager.playEffect(isWin ? "客人win" : "客人lost");
                    this.typewriterEffect(dialogLabel, isWin ? winText : loseText, () => {
                        this.scheduleOnce(() => {
                            if (isWin) {
                                this.onCustomerExitAndNext();
                            } else {
                                this.onCustomerAngryAndLose();
                            }
                        }, 0.5);
                    });
                })
                .start();
        } else {
            if (isWin) this.onCustomerExitAndNext();
            else this.onCustomerAngryAndLose();
        }
    }

    /** 胜利：顾客退场进入下一小关 */
    private onCustomerExitAndNext() {
        const currentCustomer = this.kerenNode?.children[this.currentCustomerIndex];
        const dialogBubble = currentCustomer?.getChildByName("dialogBubble");
        if (dialogBubble) {
            cc.tween(dialogBubble).to(0.2, { scale: 0 }).call(() => { dialogBubble.active = false; }).start();
        }
        const screenWidth = cc.winSize.width;
        cc.tween(this.kerenNode)
            .to(0.6, { x: screenWidth / 2 + 200 }, { easing: "quadIn" })
            .call(() => {
                AudioManager.playEffect("win");
                this.currentSubLevel++;
                if (this.currentSubLevel >= this.subLevelConfigs.length) {
                    this.onGameWin();
                } else {
                    this.startSubLevel();
                }
            })
            .start();
    }

    /** 失败：顾客生气的表情，扣爱心，消耗完进入失败界面 */
    private onCustomerAngryAndLose() {

        this.scheduleOnce(() => {
            AudioManager.playEffect("错误");
            this.consumeHeart();
            this.showResultTip(false);
            this.scheduleOnce(() => {
                if (this.remainingHearts > 0) {
                    // winNode.active = true;
                    // angryNode.active = false;
                    this.startSubLevel();
                } else {
                    this.endlost("prefabs/zc/zc_lostend");
                }
            }, 2);
        }, 0.5);
    }



    // ==================== 胜负判断 ====================

    private showResultTip(isWin: boolean) {
        let tipNode = this.node.getChildByName("resultTip");
        if (!tipNode) {
            tipNode = new cc.Node("resultTip");
            tipNode.parent = this.node;
            let label = tipNode.addComponent(cc.Label);
            label.fontSize = 60;
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        }

        let label = tipNode.getComponent(cc.Label);
        if (label) {
            if (isWin) {
                label.string = "制作成功！";
                label.node.color = cc.Color.GREEN;
            } else {
                label.string = this.remainingHearts > 0
                    ? `制作失败，还有${this.remainingHearts}次机会`
                    : "制作失败";
                label.node.color = cc.Color.RED;
            }
        }

        tipNode.active = true;
        tipNode.scale = 0;

        cc.tween(tipNode)
            .to(0.3, { scale: 1.2 })
            .to(0.2, { scale: 1 })
            .delay(1.5)
            .to(0.3, { scale: 0 })
            .call(() => {
                tipNode.active = false;
            })
            .start();
    }

    private onGameWin() {
        AudioManager.playEffect("finishjq");
        this.scheduleOnce(() => {
            this.endwin("prefabs/zc/zc_winend");
        }, 1);
    }

    // ==================== UI更新 ====================



    private closeTips() {
        if (this.tipsNode) this.tipsNode.active = false;
    }
    private openTips() {
        VideoManager.getInstance().showVideo(() => {
            // console.log("openTips",this.currentSubLevel);
            if (this.tipsNode) {
                this.tipsNode.active = true;
                var tipslvControl = this.tipsNode.getChildByName("tipslvControl");
                for (var i = 0; i < tipslvControl.childrenCount; i++) {
                    tipslvControl.children[i].active = false;
                }
                tipslvControl.getChildByName("tips" + (this.currentSubLevel + 1).toString()).active = true;
            }

        })
    }
    // ==================== 父类方法重写 ====================

    endwin(name: string) {
        cc.resources.load(name, cc.Prefab, (err, end: cc.Prefab) => {
            if (err) {
                cc.error("加载结算预制体失败:", err);
                return;
            }
            var endNode = cc.instantiate(end);
            endNode.parent = cc.find("Canvas");
            endNode.opacity = 0;
            if (this.node) this.node.destroy();
            cc.tween(endNode)
                .to(0.8, { opacity: 255 })
                .start();
        });
    }

    fanhui() {
        // this.clearTimer();
        super.fanhui();
    }

    restart() {
        // this.clearTimer();
        super.restart();
    }
}
