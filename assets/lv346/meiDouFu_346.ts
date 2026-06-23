import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";

const { ccclass, property } = cc._decorator;

/**
 * 关卡346 - 五小关霉豆腐配料游戏
 * 游戏流程：
 * 1. 客人提出需求
 * 2. 点击确认开始制作
 * 3. 刮开遮罩显示盆和豆腐
 * 4. 拖拽调料到豆腐上（豆腐变色）
 * 5. 点击确认判断配料是否符合需求
 * 6. 共5个小关，失败重开当前小关，全部通过则游戏胜利
 */

/** 调料类型 */
enum SeasoningType {
    DOUBANJIANG = "doubanjiang",  // 豆瓣酱 - 深红色
    LAJIAO = "lajiao",            // 辣椒 - 正红色
    HUajIAO = "huajiao",          // 花椒 - 绿色
    YAN = "yan",                  // 盐 - 无色（白色/透明）
    HUJIAO = "hujiao",            // 胡椒 - 灰色颗粒
}

/** 调料配置 */
interface SeasoningConfig {
    type: SeasoningType;
    name: string;
    color: cc.Color;
    description: string;
}

/** 小关配置 */
interface SubLevelConfig {
    id: number;                    // 小关ID 1-5
    customerNeed: string;          // 客人需求描述
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
export default class meiDouFu_346 extends BaseGame {
    // ==================== 挂载节点 ====================

    // 结算弹层
    @property(cc.Node)
    private g: cc.Node = null;

    // 遮罩组件（刮开用）
    @property(cc.Mask)
    private mask: cc.Mask = null;

    // 底图节点（用于计算刮除面积占比）
    @property(cc.Node)
    scratchBaseNode: cc.Node = null;

    // 锉刀节点
    @property(cc.Node)
    cdNode: cc.Node = null;

    // 刮的豆腐节点（刮开阶段显示，盆显示后隐藏）
    @property(cc.Node)
    scratchTofuNode: cc.Node = null;

    // 遮罩节点（刮完后隐藏）
    @property(cc.Node)
    maskNode: cc.Node = null;

    // 放入盆中按钮（刮完后显示）
    @property(cc.Node)
    putInPenBtn: cc.Node = null;

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

    // 配料确认按钮
    @property(cc.Node)
    seasoningConfirmBtn: cc.Node = null;

    // 添加配料提示文案节点（配料阶段显示）
    @property(cc.Node)
    tianjiatipsLabel: cc.Node = null;

    // ==================== 内部状态 ====================

    isMask: boolean = true;
    orginPostion: cc.Vec2 = null;

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
    private scratchProgress: number = 0;

    // 面积统计参数（基于底图节点）
    private scratchAreaCellSize: number = 8;
    private scratchedAreaCells: Set<string> = new Set();
    private scratchedArea: number = 0;
    private scratchBaseArea: number = 1;

    // 达到该刮除面积百分比后允许进入下一步
    private scratchCompleteThreshold: number = 80;

    // 当前客人索引
    private currentCustomerIndex: number = -1;

    // 五小关对应的客人顺序（随机打乱）
    private customerOrder: number[] = [];

    // 豆腐块状态列表
    private gameStateData: GameStateData = { appliedSeasonings: [] };

    // 当前拖拽的调料
    private draggingSeasoning: SeasoningType = null;
    private draggedNode: cc.Node = null;
    private dragStartPos: cc.Vec2 = null;
    private draggedNodeOriginalScale: number = 1;

    // 记录每个调料节点的初始缩放，避免多次点击/重复 tween 导致 scale 逐步变大
    private seasoningBaseScaleMap: Map<cc.Node, number> = new Map();
 
    // 调料配置
    private seasoningConfigs: Map<SeasoningType, SeasoningConfig> = new Map([
        [SeasoningType.DOUBANJIANG, { type: SeasoningType.DOUBANJIANG, name: "豆瓣酱", color: cc.color(139, 0, 0), description: "深红色" }],
        [SeasoningType.LAJIAO, { type: SeasoningType.LAJIAO, name: "辣椒", color: cc.color(255, 0, 0), description: "正红色" }],
        [SeasoningType.HUajIAO, { type: SeasoningType.HUajIAO, name: "花椒", color: cc.color(0, 128, 0), description: "绿色" }],
        [SeasoningType.YAN, { type: SeasoningType.YAN, name: "盐", color: cc.color(255, 255, 255, 100), description: "无色" }],
        [SeasoningType.HUJIAO, { type: SeasoningType.HUJIAO, name: "胡椒", color: cc.color(128, 128, 128), description: "灰色颗粒" }],
    ]);

    // 五小关配置
    private subLevelConfigs: SubLevelConfig[] = [
        { id: 1, customerNeed: "老板，来份霉豆腐，配料你看着加", requiredSeasonings: [], forbiddenSeasonings: [], timeLimit: 30 },
        { id: 2, customerNeed: "老板，来一份霉豆腐，我不吃五香粉", requiredSeasonings: [], forbiddenSeasonings: [SeasoningType.HUJIAO], timeLimit: 30 },
        { id: 3, customerNeed: "来份不加盐不加辣椒的霉豆腐", requiredSeasonings: [], forbiddenSeasonings: [SeasoningType.YAN, SeasoningType.LAJIAO], timeLimit: 35 },
        { id: 4, customerNeed: "老板，给我来份加豆瓣酱加花椒的", requiredSeasonings: [SeasoningType.DOUBANJIANG, SeasoningType.HUajIAO], forbiddenSeasonings: [], timeLimit: 35 },
        { id: 5, customerNeed: "老板，来份霉豆腐，所有配料都给我加满！", requiredSeasonings: [SeasoningType.DOUBANJIANG, SeasoningType.LAJIAO, SeasoningType.HUajIAO, SeasoningType.YAN, SeasoningType.HUJIAO], forbiddenSeasonings: [], timeLimit: 40 },
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

        // 绑定配料确认按钮
        if (this.seasoningConfirmBtn) {
            this.seasoningConfirmBtn.on(cc.Node.EventType.TOUCH_END, this.onSeasoningConfirm, this);
        }
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景lv346");
        }, 0.5)
        // 初始化游戏
        this.initGame();
    }

    protected onDestroy(): void {
        this.clearTimer();
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

        // 移除确认按钮事件
        if (this.seasoningConfirmBtn) {
            this.seasoningConfirmBtn.off(cc.Node.EventType.TOUCH_END, this.onSeasoningConfirm, this);
        }
    }

    // ==================== 游戏初始化 ====================

    /** 初始化游戏 */
    private initGame() {
        this.currentSubLevel = 0;
        this.scratchProgress = 0;
        this.isPaused = false;
        GameData.PauseGame = false;

        // 生成随机客人顺序
        this.generateCustomerOrder();

        // 播放背景音乐
        // AudioManager.stopMusic();
        // this.scheduleOnce(() => {
        //     AudioManager.playMusic("关卡背景", false, 0.5);
        // }, 0.5);

        // 开始第一小关
        this.startSubLevel();
    }

    /** 生成随机客人顺序 */
    private generateCustomerOrder() {
        this.customerOrder = [0, 1, 2, 3, 4];
        for (let i = this.customerOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.customerOrder[i], this.customerOrder[j]] = [this.customerOrder[j], this.customerOrder[i]];
        }
    }

    // ==================== 小关流程控制 ====================

    /** 开始当前小关 */
    private startSubLevel() {
        // 重置状态
        this.scratchProgress = 0;
        this.gameStateData = { appliedSeasonings: [] };
        this.draggingSeasoning = null;

        // 重置遮罩
        this.resetMask();

        // 隐藏盆和调料
        this.hideGameElements();

        // 重置豆腐块显示（隐藏盆时重置所有子节点状态）
        this.resetAllTofuChildren();

        // 显示客人需求
        this.showCustomerNeed();
    }

    /** 重置所有豆腐块的子节点状态 - 只显示无调料（索引0） */
    private resetAllTofuChildren() {
        if (!this.penNode) return;

        for (let i = 0; i < this.penNode.childrenCount; i++) {
            let tofuNode = this.penNode.children[i];
            for (let j = 0; j < tofuNode.childrenCount; j++) {
                // 索引0是无调料状态，其他都隐藏
                tofuNode.children[j].active = (j === 0);
            }
        }
    }

    /** 隐藏游戏元素 */
    private hideGameElements() {
        if (this.penNode) this.penNode.active = false;
        if (this.seasoningConfirmBtn) this.seasoningConfirmBtn.active = false;
        if (this.tianjiatipsLabel) this.tianjiatipsLabel.active = false;
        if (this.cdNode) this.cdNode.active = false;
        if (this.scratchTofuNode) this.scratchTofuNode.active = false;
        if (this.maskNode) this.maskNode.active = true;
        if (this.putInPenBtn) this.putInPenBtn.active = false;
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
                    .to(0.2, { scale: 0 })
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

        // 显示锉刀和刮的豆腐
        if (this.cdNode) this.cdNode.active = true;
        if (this.scratchTofuNode) this.scratchTofuNode.active = true;

        AudioManager.playEffect("start");
    }

    // ==================== 刮开遮罩 ====================

    onScratchStart(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SCRATCHING || this.isPaused) return;
        this.isMask = true;
    }

    onScratchMove(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.SCRATCHING || this.isPaused) return;
        if (!this.mask) return;

        const worldPos = event.getLocation();

        // 移动锉刀
        let p = this.node.convertToNodeSpaceAR(worldPos);
        this.cdNode.setPosition(p);

        // 刮除遮罩
        var g = this.mask["_graphics"];
        let maskPos = this.mask.node.convertToNodeSpaceAR(worldPos);
        g.fillRect(maskPos.x - 25, maskPos.y + 25, 50, 50);

        // 根据底图刮除面积占比更新进度
        this.updateScratchProgressByArea(worldPos, 50, 50);
    }

    onScratchEnd(event: cc.Event.EventTouch) {
        if (this.cdNode) {
            this.cdNode.setPosition(this.orginPostion);
        }
    }

    /** 根据底图刮除面积占比更新进度 */
    private updateScratchProgressByArea(worldPos: cc.Vec2, brushWidth: number, brushHeight: number) {
        if (!this.mask) return;

        // 未挂载底图节点时回退到遮罩节点，避免流程卡死。
        const baseNode = this.scratchBaseNode || this.mask.node;
        const baseSize = baseNode.getContentSize();
        if (baseSize.width <= 0 || baseSize.height <= 0) return;

        const baseMinX = -baseSize.width / 2;
        const baseMaxX = baseSize.width / 2;
        const baseMinY = -baseSize.height / 2;
        const baseMaxY = baseSize.height / 2;

        // 把遮罩局部画刷尺寸换算到世界，再映射到底图局部，避免节点缩放导致统计偏差。
        const maskWorldCenter = this.mask.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const maskWorldRight = this.mask.node.convertToWorldSpaceAR(cc.v2(brushWidth / 2, 0));
        const maskWorldTop = this.mask.node.convertToWorldSpaceAR(cc.v2(0, brushHeight / 2));
        const worldHalfW = maskWorldRight.sub(maskWorldCenter).mag();
        const worldHalfH = maskWorldTop.sub(maskWorldCenter).mag();

        const baseCenter = baseNode.convertToNodeSpaceAR(worldPos);
        const baseRight = baseNode.convertToNodeSpaceAR(cc.v2(worldPos.x + worldHalfW, worldPos.y));
        const baseTop = baseNode.convertToNodeSpaceAR(cc.v2(worldPos.x, worldPos.y + worldHalfH));
        const baseHalfW = Math.abs(baseRight.x - baseCenter.x);
        const baseHalfH = Math.abs(baseTop.y - baseCenter.y);

        const left = Math.max(baseCenter.x - baseHalfW, baseMinX);
        const right = Math.min(baseCenter.x + baseHalfW, baseMaxX);
        const bottom = Math.max(baseCenter.y - baseHalfH, baseMinY);
        const top = Math.min(baseCenter.y + baseHalfH, baseMaxY);
        if (left >= right || bottom >= top) return;

        const totalCols = Math.max(1, Math.ceil(baseSize.width / this.scratchAreaCellSize));
        const totalRows = Math.max(1, Math.ceil(baseSize.height / this.scratchAreaCellSize));
        const startCol = Math.max(0, Math.floor((left - baseMinX) / this.scratchAreaCellSize));
        const endCol = Math.min(totalCols - 1, Math.floor((right - baseMinX - 0.001) / this.scratchAreaCellSize));
        const startRow = Math.max(0, Math.floor((bottom - baseMinY) / this.scratchAreaCellSize));
        const endRow = Math.min(totalRows - 1, Math.floor((top - baseMinY - 0.001) / this.scratchAreaCellSize));

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                this.scratchedAreaCells.add(`${col}_${row}`);
            }
        }

        const cellArea = this.scratchAreaCellSize * this.scratchAreaCellSize;
        this.scratchedArea = this.scratchedAreaCells.size * cellArea;
        this.scratchProgress = Math.min(100, (this.scratchedArea / this.scratchBaseArea) * 100);
        this.updateProgressUI();

        // 刮开足够面积后显示"放入盆中"按钮
        if (this.scratchProgress >= this.scratchCompleteThreshold && this.putInPenBtn && !this.putInPenBtn.active) {
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
        if (this.scratchProgress < this.scratchCompleteThreshold) {
            return;
        }

        AudioManager.playEffect(AudioManager.common.BUTTON);

        // 隐藏放入盆中按钮
        if (this.putInPenBtn) {
            this.putInPenBtn.active = false;
        }

        // 隐藏锉刀、刮的豆腐和遮罩
        if (this.cdNode) this.cdNode.active = false;
        if (this.scratchTofuNode) this.scratchTofuNode.active = false;
        if (this.maskNode) this.maskNode.active = false;
        if (this.mask) this.mask.node.active = false;

        // 显示盆
        this.showPenAndStartSeasoning();
    }

    /** 显示盆并开始配料阶段 */
    private showPenAndStartSeasoning() {
        this.gameState = GameState.SEASONING;

        // 进入配料阶段时显示提示
        if (this.tianjiatipsLabel) this.tianjiatipsLabel.active = true;

        // 显示盆
        if (this.penNode) {
            this.penNode.active = true;
            this.penNode.scale = 0;
            cc.tween(this.penNode)
                .to(0.5, { scale: 1 }, { easing: "backOut" })
                .call(() => {
                    this.initPenState();
                    this.showSeasoningConfirmBtn();
                })
                .start();
        }
    }

    /** 初始化盆状态 */
    private initPenState() {
        this.gameStateData = { appliedSeasonings: [] };

        // 初始化盆下子节点：只显示索引0（无调料）
        this.resetPenChildren();
    }

    /** 重置盆子节点显示 */
    private resetPenChildren() {
        if (!this.penNode) return;

        for (let i = 0; i < this.penNode.childrenCount; i++) {
            // 索引0是无调料状态，默认显示
            this.penNode.children[i].active = (i === 0);
        }
    }

    /** 显示配料确认按钮 */
    private showSeasoningConfirmBtn() {
        if (this.seasoningConfirmBtn) {
            this.seasoningConfirmBtn.active = true;
            this.seasoningConfirmBtn.scale = 0;
            cc.tween(this.seasoningConfirmBtn)
                .to(0.3, { scale: 1 }, { easing: "backOut" })
                .start();
        }
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

        this.draggingSeasoning = type;
        this.draggedNode = node;
        this.dragStartPos = node.getPosition();

        // 强制以“初始缩放”为基准，避免连续点击时用到上一次 tween 中间态导致 scale 累积变大
        this.draggedNodeOriginalScale = this.seasoningBaseScaleMap.get(node) ?? node.scale;
        cc.Tween.stopAllByTarget(node);
        node.scale = this.draggedNodeOriginalScale;

        // 放大效果
        cc.tween(node)
            .to(0.1, { scale: this.draggedNodeOriginalScale * 1.2 })
            .start();

        AudioManager.playEffect("pick");
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
            AudioManager.playEffect("seasoning");
        }

        // 恢复原位和“初始缩放”（避免 scale 累积）
        const node = this.draggedNode;
        const baseScale = this.seasoningBaseScaleMap.get(node) ?? this.draggedNodeOriginalScale;
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(0.2, { x: this.dragStartPos.x, y: this.dragStartPos.y, scale: baseScale })
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
    }

    /** 显示调料对应的子节点
     * 子节点索引：0-无调料, 1-盐, 2-花椒, 3-辣椒, 4-豆瓣酱, 5-胡椒
     */
    private showSeasoningChildNode(seasoning: SeasoningType) {
        if (!this.penNode) return;

        let childIndex = 0;
        switch (seasoning) {
            case SeasoningType.YAN: childIndex = 1; break;
            case SeasoningType.HUajIAO: childIndex = 2; break;
            case SeasoningType.LAJIAO: childIndex = 3; break;
            case SeasoningType.DOUBANJIANG: childIndex = 4; break;
            case SeasoningType.HUJIAO: childIndex = 5; break;
        }

        // 显示对应的子节点
        if (childIndex < this.penNode.childrenCount) {
            this.penNode.children[childIndex].active = true;
        }
    }

    /** 应用调料 - 直接应用到盆 */
    private applySeasoning(seasoning: SeasoningType) {
        this.applySeasoningToPen(seasoning);
    }

    // ==================== 配料确认与判断 ====================

    /** 配料确认 */
    private onSeasoningConfirm() {
        if (this.gameState !== GameState.SEASONING) return;

        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.gameState = GameState.CHECK_RESULT;
        this.clearTimer();
        if (this.tianjiatipsLabel) this.tianjiatipsLabel.active = false;

        this.checkSeasoningResult();
    }

    /** 检查配料结果 */
    private checkSeasoningResult() {
        const config = this.subLevelConfigs[this.currentSubLevel];

        // 获取已应用的调料
        let appliedArray = this.gameStateData.appliedSeasonings;

        // 检查是否包含所有必需的调料
        let hasAllRequired = config.requiredSeasonings.every(req => appliedArray.includes(req));

        // 检查是否包含禁止的调料
        let hasForbidden = config.forbiddenSeasonings.some(forbid => appliedArray.includes(forbid));

        // 判断输赢
        let isWin = hasAllRequired && !hasForbidden;

        // 摇晃盆动画
        this.shakePen(() => {
            if (isWin) {
                this.onSubLevelWin();
            } else {
                this.onSubLevelLose();
            }
        });
    }

    /** 摇晃盆动画 */
    private shakePen(callback: () => void) {
        if (!this.penNode) {
            callback();
            return;
        }

        // 保存原始旋转角度
        let originalRotation = this.penNode.angle;

        // 摇晃动画：左右摇晃3次
        cc.tween(this.penNode)
            .to(0.1, { angle: -15 })
            .to(0.1, { angle: 15 })
            .to(0.1, { angle: -15 })
            .to(0.1, { angle: 15 })
            .to(0.1, { angle: -15 })
            .to(0.1, { angle: 15 })
            .to(0.15, { angle: 0 })
            .call(() => {
                callback();
            })
            .start();
    }

    // ==================== 计时器管理 ====================

    private startTimer() {
        this.clearTimer();
        this.timerHandler = setInterval(() => {
            if (this.isPaused) return;

            this.remainTime--;
            this.updateTimeUI();

            if (this.remainTime <= 0) {
                this.onTimeUp();
            }
        }, 1000) as unknown as number;
    }

    private clearTimer() {
        if (this.timerHandler !== -1) {
            clearInterval(this.timerHandler);
            this.timerHandler = -1;
        }
    }

    private onTimeUp() {
        if (this.gameState === GameState.SCRATCHING) {
            // 刮开阶段时间到，自动显示盆
            this.showPenAndStartSeasoning();
        } else if (this.gameState === GameState.SEASONING) {
            // 配料阶段时间到，自动判断
            this.gameState = GameState.CHECK_RESULT;
            if (this.tianjiatipsLabel) this.tianjiatipsLabel.active = false;
            this.checkSeasoningResult();
        }
    }

    // ==================== 胜负判断 ====================

    private onSubLevelWin() {
        AudioManager.playEffect("win");
        this.showResultTip(true);

        this.scheduleOnce(() => {
            this.currentSubLevel++;

            if (this.currentSubLevel >= this.subLevelConfigs.length) {
                this.onGameWin();
            } else {
                this.startSubLevel();
            }
        }, 2);
    }

    private onSubLevelLose() {
        AudioManager.playEffect("lose");
        this.showResultTip(false);

        this.scheduleOnce(() => {
            this.startSubLevel();
        }, 2);
    }

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
            label.string = isWin ? "制作成功！" : "制作失败，再来一次！";
            label.node.color = isWin ? cc.Color.GREEN : cc.Color.RED;
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
            // this.endwin("prefabs/common/endwin");
            this.endwin("prefabs/zc/zc_winend");
        }, 1);
    }

    // ==================== UI更新 ====================

    private updateGameUI() {
        this.updateTimeUI();
        this.updateProgressUI();
        this.updateLevelUI();
    }

    private updateTimeUI() {
        let timeLabel = this.node.getChildByName("timeLabel")?.getComponent(cc.Label);
        if (timeLabel) {
            timeLabel.string = `时间: ${this.remainTime}s`;
        }
    }

    private updateProgressUI() {
        let progressLabel = this.node.getChildByName("progressLabel")?.getComponent(cc.Label);
        if (progressLabel) {
            let phase = this.gameState === GameState.SCRATCHING ? "刮开豆腐" : "添加配料";
            progressLabel.string = `${phase} - ${Math.floor(this.scratchProgress)}%`;
        }
    }

    private updateLevelUI() {
        let levelLabel = this.node.getChildByName("levelLabel")?.getComponent(cc.Label);
        if (levelLabel) {
            levelLabel.string = `第 ${this.currentSubLevel + 1} / 5 关`;
        }
    }

    private resetMask() {
        if (this.mask) {
            var g = this.mask["_graphics"];
            if (!g) return;

            let size = this.mask.node.getContentSize();

            // 重置底图面积统计
            this.scratchedAreaCells.clear();
            this.scratchedArea = 0;
            if (this.scratchBaseNode) {
                const baseSize = this.scratchBaseNode.getContentSize();
                this.scratchBaseArea = Math.max(1, baseSize.width * baseSize.height);
            } else {
                this.scratchBaseArea = Math.max(1, size.width * size.height);
            }
            this.scratchProgress = 0;

            g.clear();
            g.fillColor = cc.Color.WHITE;
            g.rect(-size.width / 2, -size.height / 2, size.width, size.height);
            g.fill();

            this.updateProgressUI();
        }
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
        this.clearTimer();
        super.fanhui();
    }

    restart() {
        this.clearTimer();
        super.restart();
    }
}
