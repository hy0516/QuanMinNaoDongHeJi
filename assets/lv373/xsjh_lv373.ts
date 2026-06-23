import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

/** 妖精类型枚举 */
enum FairyType {
    JIANGBANYA = 1,  // 酱板鸭精
    CHANGFEN = 2,    // 肠粉精
    HEDAN = 3,       // 核弹精
    XUESHAN = 4,     // 雪山精
    HULI_REVENGE = 5,// 狐狸精（复仇）
    HULI_GRATEFUL = 6,// 狐狸精（感恩）- 通关
}

@ccclass
export default class xsjh_lv373 extends BaseGame {

    // ===== 雪山场景节点 =====
    @property(cc.Node)
    snowScene: cc.Node = null;
    @property(cc.Node)
    foxNode: cc.Node = null;
    @property(cc.Node)
    explosionNode: cc.Node = null;  // 核弹爆炸动画节点（雪山场景下）
    @property(cc.Node)
    jiangbanyaNode: cc.Node = null;
    @property(cc.Node)
    changfenNode: cc.Node = null;
    @property(cc.Node)
    hedanNode: cc.Node = null;
    @property(cc.Node)
    heroSnowNode: cc.Node = null;

    // 爆炸动画Spine组件
    private explosionSk: dragonBones.ArmatureDisplay = null;

    // ===== 院子场景节点 =====
    @property(cc.Node)
    yardScene: cc.Node = null;
    @property(cc.Node)
    act1_YardView: cc.Node = null;  // 第一幕：院子远景（劈柴）
    @property(cc.Node)
    act2_DoorView: cc.Node = null;  // 第二幕：大门近景（踹门）
    @property(cc.Node)
    act3_YardView: cc.Node = null;  // 第三幕：院子远景（对话）
    @property(cc.Node)
    act4_EndingView: cc.Node = null;// 第四幕：院子近景（结局）
    @property(cc.Node)
    blackScreen: cc.Node = null;     // 黑幕遮罩
    @property(cc.Node)
    hei: cc.Node = null;             // 黑幕节点（与雪山、院子同级）

    // ===== 角色Spine节点 =====
    @property(dragonBones.ArmatureDisplay)
    heroChoppingSk: dragonBones.ArmatureDisplay = null;  // 男主劈柴
    @property(dragonBones.ArmatureDisplay)
    heroIdleSk: dragonBones.ArmatureDisplay = null;      // 男主待机（第三幕）
    @property(dragonBones.ArmatureDisplay)
    heroEndingSk: dragonBones.ArmatureDisplay = null;    // 男主结局
    @property(dragonBones.ArmatureDisplay)
    fairyAct2Sk: dragonBones.ArmatureDisplay = null;     // 妖精第二幕
    @property(dragonBones.ArmatureDisplay)
    fairyAct3Sk: dragonBones.ArmatureDisplay = null;     // 妖精第三幕
    @property(dragonBones.ArmatureDisplay)
    fairyEndingSk: dragonBones.ArmatureDisplay = null;   // 妖精结局
    @property(dragonBones.ArmatureDisplay)
    foxSk: dragonBones.ArmatureDisplay = null;           // 受伤狐狸

    // ===== 门节点 =====
    @property(cc.Node)
    doorNode: cc.Node = null;
    @property(dragonBones.ArmatureDisplay)
    doorSk: dragonBones.ArmatureDisplay = null;

    // ===== UI节点 =====
    @property(cc.Node)
    dialoguePanel: cc.Node = null;
    @property(cc.Label)
    dialogueLabel: cc.Label = null;
    @property(cc.Node)
    woundNode: cc.Node = null;  // 狐狸伤口节点（长按目标）
    @property(cc.Node)
    takeFoxBtn: cc.Node = null;     // "带走狐狸"按钮
    @property(cc.Node)
    ignoreBtn: cc.Node = null;      // "视而不见"按钮

    // ===== 呼吸动画状态 =====
    private takeFoxBtnTween: cc.Tween = null;
    private ignoreBtnTween: cc.Tween = null;

    // ===== 状态变量 =====
    private isInteracting = false;
    private longPressTimer: number = 0;
    private readonly LONG_PRESS_DURATION = 1.0; // 长按持续时间（秒）
    private isLongPressing = false;
    private isBandageAnimStarted = false; // 包扎动画是否已开始
    private currentFairyType: FairyType = null;
    private isWin = false;
    private dialogueIndex = 0;
    private snowEffectCallback: () => void = null; // 飘雪音效回调
    private fairyPrefixMap: { [key: number]: string } = {
        [FairyType.JIANGBANYA]: "nv3",
        [FairyType.CHANGFEN]: "nv1",
        [FairyType.HEDAN]: "nv2",
        [FairyType.XUESHAN]: "nv5",
        [FairyType.HULI_REVENGE]: "nv4",
        [FairyType.HULI_GRATEFUL]: "nv4",
    };

    // ===== 对话文本 =====
    private readonly HERO_REPLY = "你是那只狐狸？";

    /** 获取妖精开场白 */
    private getFairyDialogueStart(): string {
        switch (this.currentFairyType) {
            case FairyType.HEDAN:
                return "你可曾去过雪山";
            case FairyType.HULI_REVENGE:
                return "你可曾去过雪山";
            default:
                return "你可曾在雪山救过一只狐狸？";
        }
    }
    private readonly FAIRY_REPLIES: { [key: number]: string } = {
        [FairyType.JIANGBANYA]: "我是那只酱板鸭",
        [FairyType.CHANGFEN]: "我是肠粉",
        [FairyType.HEDAN]: "我是核弹，恩公还想炸哪？",
        [FairyType.XUESHAN]: "我是雪山，你把我山上的狐狸带哪去了？",
        [FairyType.HULI_REVENGE]: "你当时为什么不救我？",
        [FairyType.HULI_GRATEFUL]: "恩公，谢谢你救了我",
    };

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.onInit("lv373/audio_lv373");

        this.initNodes();
        this.bindEvents();
        this.startBreathingAnimations();

        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景_lv373", true, 0.5);
        }, 0.3);

        // 循环播放飘雪环境音效
        this.snowEffectCallback = () => {
            AudioManager.playEffect("飘雪");
        };
        this.schedule(this.snowEffectCallback, 1.5);
    }

    /** 初始化节点引用 */
    private initNodes() {
        // 如果未在编辑器中设置，按名称查找
        if (!this.snowScene) this.snowScene = this.node.getChildByName("snowScene");
        if (!this.yardScene) this.yardScene = this.node.getChildByName("yardScene");
        if (!this.blackScreen) this.blackScreen = this.node.getChildByName("blackScreen");
        if (!this.hei) this.hei = this.node.getChildByName("hei");

        if (!this.foxNode) this.foxNode = this.snowScene?.getChildByName("fox");
        if (!this.explosionNode) this.explosionNode = this.snowScene?.getChildByName("explosion");
        if (!this.jiangbanyaNode) this.jiangbanyaNode = this.snowScene?.getChildByName("jiangbanya");

        // 初始状态隐藏爆炸动画节点
        if (this.explosionNode) this.explosionNode.active = false;
        if (!this.changfenNode) this.changfenNode = this.snowScene?.getChildByName("changfen");
        if (!this.hedanNode) this.hedanNode = this.snowScene?.getChildByName("hedan");
        if (!this.heroSnowNode) this.heroSnowNode = this.snowScene?.getChildByName("hero");

        // 初始化爆炸动画Spine组件
        if (this.explosionNode) {
            // const skNode = this.explosionNode.getChildByName("sk");
            // if (skNode) {
            this.explosionSk = this.explosionNode.getComponent(dragonBones.ArmatureDisplay);
            // }
        }

        if (!this.woundNode) this.woundNode = this.foxNode?.getChildByName("wound");

        // 初始化狐狸Spine动画组件（从foxNode的子节点sk获取）
        if (!this.foxSk && this.foxNode) {
            const skNode = this.foxNode.getChildByName("sk");
            if (skNode) {
                this.foxSk = skNode.getComponent(dragonBones.ArmatureDisplay);
            }
        }

        // 初始化按钮节点
        if (!this.takeFoxBtn) this.takeFoxBtn = this.snowScene?.getChildByName("takeFoxBtn");
        if (!this.ignoreBtn) this.ignoreBtn = this.snowScene?.getChildByName("ignoreBtn");

        // 初始化院子场景节点
        if (!this.act1_YardView) this.act1_YardView = this.yardScene?.getChildByName("act1_YardView");
        if (!this.act2_DoorView) this.act2_DoorView = this.yardScene?.getChildByName("act2_DoorView");
        if (!this.act3_YardView) this.act3_YardView = this.yardScene?.getChildByName("act3_YardView");
        if (!this.act4_EndingView) this.act4_EndingView = this.yardScene?.getChildByName("act4_EndingView");

        // 初始状态：显示雪山场景，隐藏院子场景
        if (this.snowScene) this.snowScene.active = true;
        if (this.yardScene) this.yardScene.active = false;
        if (this.blackScreen) this.blackScreen.opacity = 0;
        if (this.hei) this.hei.opacity = 0;

        // 初始化院子场景内部节点状态
        if (this.act1_YardView) this.act1_YardView.active = true;
        if (this.act2_DoorView) this.act2_DoorView.active = false;
        if (this.act3_YardView) this.act3_YardView.active = false;
        if (this.act4_EndingView) this.act4_EndingView.active = false;
    }

    /** 绑定事件 */
    private bindEvents() {
        // 道具拖拽事件
        if (this.jiangbanyaNode) this.bindDragEvents(this.jiangbanyaNode, FairyType.JIANGBANYA);
        if (this.changfenNode) this.bindDragEvents(this.changfenNode, FairyType.CHANGFEN);
        if (this.hedanNode) this.bindDragEvents(this.hedanNode, FairyType.HEDAN);

        // 狐狸点击事件（带走分支）- 如果场景中直接使用按钮则移除
        if (this.foxNode && !this.takeFoxBtn) {
            this.foxNode.on(cc.Node.EventType.TOUCH_START, this.onFoxClick, this);
        }

        // 狐狸长按事件（正确分支）
        if (this.woundNode) {
            this.woundNode.on(cc.Node.EventType.TOUCH_START, this.onWoundTouchStart, this);
            this.woundNode.on(cc.Node.EventType.TOUCH_END, this.onWoundTouchEnd, this);
            this.woundNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onWoundTouchEnd, this);
        }

        // 按钮点击事件
        if (this.takeFoxBtn) {
            this.takeFoxBtn.on(cc.Node.EventType.TOUCH_END, this.onTakeFoxClick, this);
        }
        if (this.ignoreBtn) {
            this.ignoreBtn.on(cc.Node.EventType.TOUCH_END, this.onIgnoreClick, this);
        }
    }

    /** 启动按钮呼吸动画 */
    private startBreathingAnimations() {
        this.startBtnBreathing(this.takeFoxBtn, "takeFoxBtnTween");
        this.startBtnBreathing(this.ignoreBtn, "ignoreBtnTween");
    }

    /** 停止按钮呼吸动画 */
    private stopBreathingAnimations() {
        this.stopBtnBreathing(this.takeFoxBtn, "takeFoxBtnTween");
        this.stopBtnBreathing(this.ignoreBtn, "ignoreBtnTween");
    }

    /** 单个按钮呼吸动画 */
    private startBtnBreathing(btn: cc.Node, tweenKey: "takeFoxBtnTween" | "ignoreBtnTween") {
        if (!btn) return;

        // 先停止之前的动画
        if (this[tweenKey]) {
            this[tweenKey].stop();
        }

        // 重置缩放
        btn.scale = 1;

        // 创建呼吸动画：放大到1.1，再缩回1.0，循环播放
        this[tweenKey] = cc.tween(btn)
            .to(0.6, { scale: 0.95 }, { easing: "sineInOut" })
            .to(0.6, { scale: 1.0 }, { easing: "sineInOut" })
            .union()
            .repeatForever()
            .start();
    }

    /** 停止单个按钮呼吸动画 */
    private stopBtnBreathing(btn: cc.Node, tweenKey: "takeFoxBtnTween" | "ignoreBtnTween") {
        if (this[tweenKey]) {
            this[tweenKey].stop();
            this[tweenKey] = null;
        }
        if (btn) {
            btn.scale = 1;
        }
    }

    /** 绑定拖拽事件 */
    private bindDragEvents(node: cc.Node, fairyType: FairyType) {
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            if (GameData.PauseGame || this.isInteracting) return;
            this.onDragStart(event, node);
        }, this);

        node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (GameData.PauseGame || this.isInteracting) return;
            this.onDragMove(event, node);
        }, this);

        node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (GameData.PauseGame || this.isInteracting) return;
            this.onDragEnd(event, node, fairyType);
        }, this);

        node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            if (GameData.PauseGame || this.isInteracting) return;
            this.onDragCancel(event, node);
        }, this);
    }

    /** 拖拽开始 */
    private onDragStart(event: cc.Event.EventTouch, node: cc.Node) {
        // AudioManager.playEffect("拖拽音效");
        node.setSiblingIndex(node.parent.childrenCount - 1);
        // 记录节点的原始位置
        if (!this.nodeOriginalPositions.has(node)) {
            this.nodeOriginalPositions.set(node, node.position.clone());
        }
    }

    /** 拖拽移动 */
    private onDragMove(event: cc.Event.EventTouch, node: cc.Node) {
        const delta = event.getDelta();
        node.x += delta.x;
        node.y += delta.y;
    }

    // 存储每个节点的原始位置
    private nodeOriginalPositions: Map<cc.Node, cc.Vec3> = new Map();

    /** 拖拽结束 */
    private onDragEnd(event: cc.Event.EventTouch, node: cc.Node, fairyType: FairyType) {
        // 获取道具节点的世界坐标位置（使用节点中心点）
        const nodeWorldPos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        // 获取狐狸节点的世界坐标中心位置
        const foxWorldPos = this.foxNode.convertToWorldSpaceAR(cc.Vec2.ZERO);

        // 使用狐狸节点的 ContentSize 构建一个合理的碰撞区域
        const foxSize = this.foxNode.getContentSize();
        const foxWorldRect = cc.rect(
            foxWorldPos.x - foxSize.width * 0.5,
            foxWorldPos.y - foxSize.height * 0.5,
            foxSize.width,
            foxSize.height
        );

        // 检查道具中心点是否在狐狸节点的范围内
        if (foxWorldRect.contains(nodeWorldPos)) {
            // 拖拽到狐狸身上
            this.isInteracting = true;
            this.currentFairyType = fairyType;
            this.isWin = false;

            // 播放道具使用动画
            this.playItemUseAnimation(node, fairyType);
        } else {
            // 未拖到狐狸，回到原位
            this.returnNodeToOrigin(node);
        }
    }

    /** 拖拽取消 */
    private onDragCancel(event: cc.Event.EventTouch, node: cc.Node) {
        this.returnNodeToOrigin(node);
    }

    /** 道具回到原位 */
    private returnNodeToOrigin(node: cc.Node) {
        const originalPos = this.nodeOriginalPositions.get(node);
        if (originalPos) {
            cc.tween(node)
                .to(0.3, { position: originalPos })
                .start();
        } else {
            // 如果没有记录到原始位置，则保持当前位置
            node.position = node.position;
        }
    }

    /** 播放道具使用动画 */
    private playItemUseAnimation(node: cc.Node, fairyType: FairyType) {
        // 道具消失
        cc.tween(node)
            .to(0.2, { scale: 0 })
            .call(() => {
                node.active = false;
                // 根据道具类型播放对应动画
                switch (fairyType) {
                    case FairyType.JIANGBANYA:
                        // 狐狸吃了一口酱板鸭
                        this.playFoxEatAnimation();
                        break;
                    case FairyType.CHANGFEN:
                        // 狐狸闻了闻肠粉
                        this.playFoxSmellAnimation();
                        break;
                    case FairyType.HEDAN:
                        // 核弹直接爆炸
                        this.playNuclearExplosion();
                        break;
                }
            })
            .start();
    }

    /** 狐狸吃动画 */
    private playFoxEatAnimation() {
        // 播放狐狸吃动画
        if (this.foxSk) {
            this.foxSk.playAnimation("chi", 1);
        }
        // 播放狐狸吃东西音效
        AudioManager.playEffect("狐狸吃东西");

        this.scheduleOnce(() => {
            this.transitionToYardScene();
        }, 1.5);
    }

    /** 狐狸闻动画 */
    private playFoxSmellAnimation() {
        if (this.foxSk) {
            this.foxSk.playAnimation("wen", 1);
        }
        // 播放狐狸闻肠粉音效
        AudioManager.playEffect("狐狸闻肠粉");

        this.scheduleOnce(() => {
            this.transitionToYardScene();
        }, 1.5);
    }

    /** 核弹爆炸动画 */
    private playNuclearExplosion() {
        // 显示爆炸动画节点并播放动画
        if (this.explosionNode) {
            this.explosionNode.active = true;
        }
        // 核弹爆炸时隐藏雪山狐狸节点
        if (this.foxNode) {
            this.foxNode.active = false;
        }
        // 播放男主受惊动画
        if (this.heroSnowNode) {
            const heroSk = this.heroSnowNode.getComponent(dragonBones.ArmatureDisplay);
            if (heroSk) heroSk.playAnimation("ren_dj4", -1);
        }
        if (this.explosionSk) {
            this.explosionSk.playAnimation("hd_bz", 1);
        }
        AudioManager.playEffect("核弹爆炸");

        // 屏幕震动
        cc.tween(this.node)
            .by(0.05, { x: 10 })
            .by(0.05, { x: -20 })
            .by(0.05, { x: 20 })
            .by(0.05, { x: -10 })
            .start();

        this.scheduleOnce(() => {
            this.transitionToYardScene();
        }, 1.5);
    }

    /** 带走狐狸按钮点击 */
    private onTakeFoxClick(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isInteracting) return;

        this.stopBreathingAnimations();
        this.isInteracting = true;
        this.currentFairyType = FairyType.XUESHAN;
        this.isWin = false;

        // 隐藏狐狸节点（因为带走动画中狐狸已包含在男主动画里）
        if (this.foxNode) {
            this.foxNode.active = false;
        }

        // 播放男主动画
        if (this.heroSnowNode) {
            const heroSk = this.heroSnowNode.getComponent(dragonBones.ArmatureDisplay);
            if (heroSk) heroSk.playAnimation("ren_dj3", -1);
        }

        // 播放离开脚步声
        AudioManager.playEffect("离开脚步声");

        this.scheduleOnce(() => {
            this.transitionToYardScene();
        }, 2);
    }

    /** 视而不见按钮点击（失败分支） */
    private onIgnoreClick(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (GameData.PauseGame || this.isInteracting) return;

        this.stopBreathingAnimations();
        this.isInteracting = true;
        this.currentFairyType = FairyType.HULI_REVENGE;
        this.isWin = false;

        // 播放男主转身离开动画
        if (this.heroSnowNode) {
            const heroSk = this.heroSnowNode.getComponent(dragonBones.ArmatureDisplay);
            if (heroSk) heroSk.playAnimation("ren_dj2", -1);
        }

        // 播放离开脚步声
        AudioManager.playEffect("离开脚步声");

        this.scheduleOnce(() => {
            this.transitionToYardScene();
        }, 1);
    }

    /** 狐狸点击（带走分支）- 兼容旧逻辑 */
    private onFoxClick(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (GameData.PauseGame || this.isInteracting) return;

        // 判断是点击还是长按
        if (this.isLongPressing) return;

        // 如果没有按钮，直接调用带走逻辑
        if (!this.takeFoxBtn) {
            this.onTakeFoxClick(event);
        }
    }

    /** 伤口长按开始（正确分支） */
    private onWoundTouchStart(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isInteracting) return;

        this.isLongPressing = true;
        this.longPressTimer = 0;
        this.isBandageAnimStarted = false;

        // 开始长按计时（包扎动画将在1秒后播放）
        this.schedule(this.onLongPressUpdate, 0.1);
    }

    /** 长按更新 */
    private onLongPressUpdate = () => {
        this.longPressTimer += 0.1;

        // 长按1秒后开始播放包扎动画
        if (this.longPressTimer >= 1.0 && !this.isBandageAnimStarted) {
            this.isBandageAnimStarted = true;
            if (this.foxSk) {
                this.foxSk.playAnimation("bz", -1); // 循环播放包扎动画
            }
            // 播放绷带包扎音效
            AudioManager.playEffect("绷带包扎");
        }

        if (this.longPressTimer >= this.LONG_PRESS_DURATION) {
            this.unschedule(this.onLongPressUpdate);
            this.onLongPressSuccess();
        }
    };

    /** 长按成功（通关分支） */
    private onLongPressSuccess() {
        if (this.isInteracting) return;
        this.isInteracting = true;

        this.currentFairyType = FairyType.HULI_GRATEFUL;
        this.isWin = true;

        // 播放狐狸包扎动画
        if (this.foxSk) {
            this.foxSk.playAnimation("bz", 1); // 包扎伤口
        }
        // 播放绷带包扎音效
        AudioManager.playEffect("绷带包扎");

        // 延迟后播放包扎完成动画
        this.scheduleOnce(() => {
            if (this.foxSk) {
                this.foxSk.playAnimation("nv3_dj2", 1); // 治疗好的狐狸待机
            }
        }, 1);

        // 播放狐狸起身离开动画
        this.scheduleOnce(() => {
            if (this.foxSk) {
                this.foxSk.playAnimation("nv3_dj3", 1); // 起身离开
            }
        }, 2);

        this.scheduleOnce(() => {
            this.transitionToYardScene();
        }, 3.5);
    }

    /** 伤口触摸结束 */
    private onWoundTouchEnd(event: cc.Event.EventTouch) {
        this.isLongPressing = false;
        this.isBandageAnimStarted = false;
        this.unschedule(this.onLongPressUpdate);

        // 如果长按被打断，停止包扎动画，恢复到受伤待机
        if (!this.isInteracting && this.foxSk) {
            this.foxSk.playAnimation("nv3_dj1", 0); // 受伤待机
        }
    }

    /** 转场到院子场景 */
    private async transitionToYardScene() {
        // 使用hei节点黑幕淡入
        await this.fadeInHei(0.5);

        // hei节点保持显示一段时间
        await this.delay(800);

        // 停止飘雪音效
        if (this.snowEffectCallback) {
            this.unschedule(this.snowEffectCallback);
            this.snowEffectCallback = null;
        }

        // 切换场景
        if (this.snowScene) this.snowScene.active = false;
        if (this.yardScene) this.yardScene.active = true;

        // 播放院子场景四幕剧情
        this.playYardScene();
    }

    /** 播放院子场景四幕剧情 */
    private async playYardScene() {
        // 第一幕：院子远景（劈柴）
        await this.act1_YardChopping();

        // 第二幕：大门近景（踹门）
        await this.act2_DoorEnter();

        // 第三幕：院子远景（对话）
        await this.act3_Dialogue();

        // 第四幕：院子近景（结局）
        await this.act4_Ending();
    }

    /** 第一幕：院子远景（劈柴） */
    private async act1_YardChopping(): Promise<void> {
        // 确保只有第一幕节点显示
        if (this.act1_YardView) this.act1_YardView.active = true;
        if (this.act2_DoorView) this.act2_DoorView.active = false;
        if (this.act3_YardView) this.act3_YardView.active = false;
        if (this.act4_EndingView) this.act4_EndingView.active = false;

        // 播放男主劈柴动画
        if (this.heroChoppingSk) {
            AudioManager.playEffect("劈材");
            this.heroChoppingSk.playAnimation("ren_kc", -1); // 循环播放劈柴
        }

        // hei节点黑幕淡出，显示院子场景
        await this.fadeOutHei(0.5);

        // 播放1-2秒后转场
        await this.delay(1500);
    }

    /** 第二幕：大门近景（踹门） */
    private async act2_DoorEnter(): Promise<void> {
        // 切换节点
        if (this.act1_YardView) this.act1_YardView.active = false;
        if (this.act2_DoorView) this.act2_DoorView.active = true;

        // 获取妖精前缀
        const prefix = this.fairyPrefixMap[this.currentFairyType];

        // 正确流程（感恩狐狸精）不踹门，直接播放 nv6_bc2
        if (this.currentFairyType === FairyType.HULI_GRATEFUL) {
            if (this.fairyAct2Sk) {
                this.fairyAct2Sk.playAnimation("nv6_bc2", 0);
            }
            AudioManager.playEffect("敲门");
            // 等待一段时间后直接转场
            await this.delay(2000);
            return;
        }

        // 播放妖精踹门动画（循环播放直到门动画完成）
        if (this.fairyAct2Sk) {
            this.fairyAct2Sk.playAnimation(`${prefix}_bc1`, -1);
        }

        // 播放敲门音效
        AudioManager.playEffect("敲门");

        // 延迟一点后开始播放门动画（让踹门动画先播放一会儿）
        await this.delay(300);

        // 播放开门动画
        if (this.doorSk) {
            this.doorSk.playAnimation("cm", 1);
        }

        // 等待门动画完成
        await this.waitForDoorAnimationComplete();

        // 门动画完成后延迟1秒再切换妖精到待机
        await this.delay(1000);

        // 妖精切换到开门后待机
        if (this.fairyAct2Sk) {
            this.fairyAct2Sk.playAnimation(`${prefix}_bc2`, 0);
        }

        // 播放1-2秒后转场
        await this.delay(1500);
    }

    /** 等待门动画播放完成 */
    private waitForDoorAnimationComplete(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.doorSk) {
                resolve();
                return;
            }

            // 监听动画完成事件
            const onComplete = () => {
                this.doorSk.off(dragonBones.EventObject.COMPLETE, onComplete, this);
                resolve();
            };

            this.doorSk.on(dragonBones.EventObject.COMPLETE, onComplete, this);
        });
    }

    /** 第三幕：院子远景（对话） */
    private async act3_Dialogue(): Promise<void> {
        // 切换节点
        if (this.act2_DoorView) this.act2_DoorView.active = false;
        if (this.act3_YardView) this.act3_YardView.active = true;

        const prefix = this.fairyPrefixMap[this.currentFairyType];

        // 设置男主待机
        if (this.heroIdleSk) {
            this.heroIdleSk.playAnimation("ren_kc2", 0); // 第三幕待机
        }

        // 设置妖精待机
        if (this.fairyAct3Sk) {
            // 如果是正确操作通关（感恩狐狸精），使用nv6_bc3
            if (this.currentFairyType === FairyType.HULI_GRATEFUL) {
                this.fairyAct3Sk.playAnimation("nv6_bc3", 0);
            } else {
                this.fairyAct3Sk.playAnimation(`${prefix}_bc3`, 0);
            }
        }

        // 黑幕淡出，开始对话
        await this.fadeOutBlackScreen(0.5);

        // 播放对话
        await this.playDialogueSequence();
    }

    /** 对话序列 */
    private async playDialogueSequence(): Promise<void> {
        // 对话1：妖精开场
        this.playFairyDialogueStart();
        await this.showDialogue(this.getFairyDialogueStart(), false);
        await this.delay(2000);

        // 对话2：男主回复
        AudioManager.playEffect("你是那只狐狸？");
        await this.showDialogue(this.HERO_REPLY, true);
        await this.delay(1500);

        // 对话3：妖精根据分支回复
        this.playFairyDialogueReply();
        const fairyReply = this.FAIRY_REPLIES[this.currentFairyType];
        await this.showDialogue(fairyReply, false);
        await this.delay(2000);

        // 隐藏对话面板
        if (this.dialoguePanel) {
            this.dialoguePanel.active = false;
        }
    }

    /** 播放妖精开场对话语音 */
    private playFairyDialogueStart() {
        switch (this.currentFairyType) {
            case FairyType.JIANGBANYA:
                AudioManager.playEffect("（酱板鸭）你可曾在雪山救过一只狐狸？");
                break;
            case FairyType.CHANGFEN:
                AudioManager.playEffect("（肠粉精）你可曾在雪山救过一只狐狸？");
                break;
            case FairyType.HEDAN:
                AudioManager.playEffect("你可曾去过雪山");
                break;
            case FairyType.XUESHAN:
                AudioManager.playEffect("（雪山精）你可曾在雪山救过一只狐狸？");
                break;
            case FairyType.HULI_REVENGE:
                AudioManager.playEffect("你可曾去过雪山_狐狸");
                break;
            case FairyType.HULI_GRATEFUL:
                AudioManager.playEffect("（狐狸精）你可曾在雪山救过一只狐狸？");
                break;
        }
    }

    /** 播放妖精回复对话语音 */
    private playFairyDialogueReply() {
        switch (this.currentFairyType) {
            case FairyType.JIANGBANYA:
                AudioManager.playEffect("（酱板鸭）我是那只酱板鸭");
                break;
            case FairyType.CHANGFEN:
                AudioManager.playEffect("（肠粉精）我是肠粉");
                break;
            case FairyType.HEDAN:
                AudioManager.playEffect("（核弹精）我是核弹，恩公还想炸哪？");
                break;
            case FairyType.XUESHAN:
                AudioManager.playEffect("（雪山精）我是雪山，你把我山上的狐狸带哪去了？");
                break;
            case FairyType.HULI_REVENGE:
                AudioManager.playEffect("（狐狸精）你当时为什么不救我？");
                break;
            case FairyType.HULI_GRATEFUL:
                AudioManager.playEffect("（狐狸精）恩公，谢谢你救了我");
                break;
        }
    }

    /** 显示对话 */
    private async showDialogue(text: string, isHero: boolean): Promise<void> {
        if (this.dialoguePanel) {
            this.dialoguePanel.active = true;
        }

        // 逐字显示效果
        if (this.dialogueLabel) {
            this.dialogueLabel.string = "";
            const chars = text.split("");
            for (let i = 0; i < chars.length; i++) {
                this.dialogueLabel.string += chars[i];
                // AudioManager.playEffect("对话音效");
                await this.delay(50);
            }
        }
    }

    /** 第四幕：院子近景（结局） */
    private async act4_Ending(): Promise<void> {
        // 切换节点
        if (this.act3_YardView) this.act3_YardView.active = false;
        if (this.act4_EndingView) this.act4_EndingView.active = true;

        const prefix = this.fairyPrefixMap[this.currentFairyType];

        // 设置男主待机
        if (this.heroEndingSk) {
            this.heroEndingSk.playAnimation("ren_k", 0); // 第四幕待机
        }

        // 先播放妖精开门后的待机动画，再切换到结局待机
        if (this.fairyEndingSk) {
            // 正确流程（感恩狐狸精）使用 nv6_bc2
            if (this.currentFairyType === FairyType.HULI_GRATEFUL) {
                this.fairyEndingSk.playAnimation("nv6_bc2", 0);
            } else {
                // 先播放开门后的待机（bc2），短暂展示后切换到bc3
                this.fairyEndingSk.playAnimation(`${prefix}_bc2`, 0);
            }
        }

        // 直接播放结局动画（跳过走向男主的步骤）
        await this.playEndingAnimation();
    }

    /** 妖精走向男主 */
    private async playFairyWalkToHero(): Promise<void> {
        const prefix = this.fairyPrefixMap[this.currentFairyType];

        // 获取妖精和男主位置
        const fairyNode = this.fairyEndingSk?.node;
        const heroNode = this.heroEndingSk?.node;

        if (!fairyNode || !heroNode) return;

        const startPos = fairyNode.position;
        const endPos = heroNode.position.clone();
        // 妖精停在男主面前一定距离
        endPos.x -= 100;

        // 使用tween移动妖精
        await new Promise<void>((resolve) => {
            cc.tween(fairyNode)
                .to(1.0, { position: endPos })
                .call(() => {
                    // 切换到待机姿态
                    if (this.fairyEndingSk) {
                        this.fairyEndingSk.playAnimation(`${prefix}_bc3`, 0);
                    }
                    resolve();
                })
                .start();
        });

        // 播放脚步声
        // AudioManager.playEffect("脚步声");
    }

    /** 播放结局动画 */
    private async playEndingAnimation(): Promise<void> {
        const prefix = this.fairyPrefixMap[this.currentFairyType];

        if (this.isWin) {
            // 通关结局：拥抱
            // AudioManager.playEffect("拥抱音效");

            // 隐藏妖精节点，播放男主拥抱动画（ren_yb已包含妖精）
            if (this.fairyEndingSk) {
                this.fairyEndingSk.node.active = false;
            }

            if (this.heroEndingSk) {
                // 将男主动画节点x坐标设置为零后再进行拥抱
                this.heroEndingSk.node.x = 0;
                AudioManager.playEffect("真香");
                this.heroEndingSk.playAnimation("ren_yb", -1);
            }

            await this.delay(2000);

            // 通关结算
            this.onwin();
        } else {
            // 失败结局：妖精攻击
            // 根据妖精类型播放对应的复仇音效
            this.playFairyRevengeEffect();

            if (this.fairyEndingSk) {
                this.fairyEndingSk.playAnimation(`${prefix}_bc4`, 1);
            }

            await this.delay(500);

            if (this.heroEndingSk) {
                if (this.currentFairyType == FairyType.XUESHAN) {
                    await this.delay(1000);
                }

                // 播放男主死亡音效
                AudioManager.playEffect("男主死亡");
                this.heroEndingSk.playAnimation("ren_s", 1);
            }

            await this.delay(1500);

            // 失败结算
            this.onlost();
        }
    }

    /** 播放妖精复仇音效（第四幕失败结局） */
    private playFairyRevengeEffect() {
        switch (this.currentFairyType) {
            case FairyType.CHANGFEN:
                // 肠粉妖精用 AK
                AudioManager.playEffect("AK");
                break;
            case FairyType.JIANGBANYA:
            case FairyType.HULI_REVENGE:
                // 酱板鸭、狐狸复仇用开枪
                AudioManager.playEffect("开枪");
                break;
            case FairyType.HEDAN:
                // 核弹用核弹爆炸
                AudioManager.playEffect("核弹爆炸");
                break;
            case FairyType.XUESHAN:
                // 雪山用雪山压顶
                AudioManager.playEffect("雪山压顶");
                break;
            default:
                // 默认用 AK
                AudioManager.playEffect("AK");
                break;
        }
    }

    /** 黑幕淡入 */
    private fadeInBlackScreen(duration: number): Promise<void> {
        return new Promise((resolve) => {
            if (!this.blackScreen) {
                resolve();
                return;
            }
            cc.tween(this.blackScreen)
                .to(duration, { opacity: 255 })
                .call(() => resolve())
                .start();
        });
    }

    /** 黑幕淡出 */
    private fadeOutBlackScreen(duration: number): Promise<void> {
        return new Promise((resolve) => {
            if (!this.blackScreen) {
                resolve();
                return;
            }
            cc.tween(this.blackScreen)
                .to(duration, { opacity: 0 })
                .call(() => resolve())
                .start();
        });
    }

    /** hei节点黑幕淡入 */
    private fadeInHei(duration: number): Promise<void> {
        return new Promise((resolve) => {
            if (!this.hei) {
                resolve();
                return;
            }
            cc.tween(this.hei)
                .to(duration, { opacity: 255 })
                .call(() => resolve())
                .start();
        });
    }

    /** hei节点黑幕淡出 */
    private fadeOutHei(duration: number): Promise<void> {
        return new Promise((resolve) => {
            if (!this.hei) {
                resolve();
                return;
            }
            cc.tween(this.hei)
                .to(duration, { opacity: 0 })
                .call(() => resolve())
                .start();
        });
    }

    /** 延迟函数 */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(() => resolve(), ms / 1000);
        });
    }

    /** 通用按钮处理 */
    BtnHandler(event: cc.Event.EventTouch) {
        const target = event.currentTarget || event.target;
        const name = target ? (target as cc.Node).name : "";

        switch (name) {
            case "btn_close":
            case "fanhui":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.openpausePanel();
                break;
            case "tishi":
            case "btn_tips":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                VideoManager.getInstance().showVideo(() => {
                    // 视频观看成功，显示提示
                    this.node.getChildByName("tipsPanel").active = true;
                });
                break;
            case "btn_closeTips":
            case "btn_tipsClose":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.node.getChildByName("tipsPanel").active = false;
                break;
            default:
                break;
        }
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    onwin() {
        AudioManager.playEffect("胜利画面");
        this.scheduleOnce(() => {
            this.node.destroy();
            this.endwin("prefabs/zc/zc_winend");
        }, 1);
    }

    onlost() {
        // AudioManager.playEffect("结算音效");
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.scheduleOnce(() => {
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 0.7);
        }, 1);
    }
}

