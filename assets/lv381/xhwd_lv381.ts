
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import itme_move_lv381 from "./item_move_lv381";
import lostPanel_lv381 from "./lostPanel_lv381";
const { ccclass, property } = cc._decorator;

/** 七轮 NPC 进场/待机底动画（策划已定） */
const NPC_BASE_ANIMS: readonly string[] = ["jby", "hl", "xue", "mc", "xg", "hd", "dq"];

/** 各轮口选错误后 NPC showqp（与 audio_lv381 注册 key 可同名） */
const WRONG_FEEDBACK: readonly string[] = [
    "我就是那只酱板鸭！",
    "我是那只狐狸！",
    "还在狡辩？我就是你踩过的雪！",
    "我是你劈的木柴",
    "我就是猹，特地来找茬！",
    "我就是那颗核弹，跟你爆了！",
    "少啰嗦，拿命来！",
];

const QUIZ_ROUNDS: ReadonlyArray<{
    question: string;
    options: readonly string[];
    correctIndex: number;
}> = [
    {
        question: "板鸭精：你是否在雪山上救过一只狐狸？",
        options: ["你是那只白狐？", "姑娘认错人了，我这辈子都没见过雪", "当然记得！我还把随身带的酱板鸭都留给你了"],
        correctIndex: 1,
    },
    {
        question: "狐狸精：那日雪山你为何不救我？",
        options: ["我以为你在睡觉呢！就没打扰你", "是酱板鸭不让我救你的", "这不是为了让你转世化人吗"],
        correctIndex: 2,
    },
    {
        question: "雪山精：那日雪山你为什么要踩我？",
        options: ["我从未踩到过任何人", "山上人这么多，你凭什么说是我？", "你走错地方了，这里是海南没有雪"],
        correctIndex: 2,
    },
    {
        question: "木柴精：樵夫，我今日来取你性命",
        options: ["我不认识你，你是谁？", "我既劈柴又种树，功过抵消了", "我在这劈了一辈子柴，跟你无冤无仇啊"],
        correctIndex: 1,
    },
    {
        question: "猹：老板，西瓜怎么卖",
        options: ["你是来找茬的吧", "隔壁闰土卖瓜，找他买", "我是樵夫，哪来的西瓜卖"],
        correctIndex: 1,
    },
    {
        question: "核弹精：雪山上那只狐狸，是你超度的吗？",
        options: ["超度成功，狐狸成了人", "狐狸是自己超度的", "你不想活，别拉我"],
        correctIndex: 1,
    },
    {
        question: "地球精：我是地球，你污染环境，还有何话说",
        options: ["你先听我解释", "再无话说，请速速动手", "我到底招谁惹谁了"],
        correctIndex: -1,
    },
];

const QUIZ_LAST_ROUND = QUIZ_ROUNDS.length - 1;
/** 调试用：0=第1轮 … 5=第6轮；正常游玩改 -1 */
const DEBUG_QUIZ_START_ROUND = -1;
const NPC_ENTER_X0 = -800;
const NPC_ENTER_X1 = -190;
const FLOW_SWIPE_MIN_PX = 50;
const INTRO_LINE = "给你一只酱板鸭，希望你能熬过冬天";
/** 第7轮环保服套上后主角台词（与 audio_lv381 文件名一致） */
const ROUND7_MAN_WIN_LINE = "我是环保志愿者，保护地球人人有责！";
/** audio_lv381 内资源名（与导入剪短名一致） */
const BGM_LV381 = "关卡背景";
const SFX_QUIZ_CORRECT = "题目选择正确";
const SFX_QUIZ_WRONG = "题目选择错误";
const SFX_NPC_ANGRY_LEAVE = "NPC生气离开";
const SFX_NPC_EXIT_STEPS = "离开脚步声";
const SFX_NPC_SHOOT = "NPC开枪";
const SFX_WEAR_CLOTHES = "穿衣服";
const TIPS_HAND_Z = 12000;

function quizEntryRoundIndex(): number {
    if (DEBUG_QUIZ_START_ROUND < 0) return 0;
    if (DEBUG_QUIZ_START_ROUND > QUIZ_LAST_ROUND) return QUIZ_LAST_ROUND;
    return DEBUG_QUIZ_START_ROUND;
}

function stripSpeakerPrefix(question: string): string {
    const sep = question.indexOf("：");
    if (sep >= 0) return question.slice(sep + 1).trim();
    const asc = question.indexOf(":");
    if (asc >= 0) return question.slice(asc + 1).trim();
    return question;
}

@ccclass
export default class shj_lv381 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;

    @property([cc.Node])
    putAeraList: cc.Node[] = [];

    a1_isNull = true;
    a2_isNull = true;
    a3_isNull = true;
    roleArry: cc.Node[] = [];
    pointList: cc.Node[] = [];

    isshowVideo = false;
    canjiaohu = true;

    private quizRoundIndex = 0;
    private quizFlowEnded = false;
    private optionHandling = false;
    private round7EnvUnlocked = false;
    private winDispatched = false;

    private bg: cc.Node = null;
    private scene1: cc.Node = null;
    private scene2: cc.Node = null;
    private scene1Man: cc.Node = null;
    /** scene2 龙骨节点（manNode/man_ske 子节点），气泡与 nan_dj* 动画挂在此 */
    private scene2Man: cc.Node = null;
    /** scene2 父节点，位移/Tween/整块命中以之为准；无则兼容旧层级直接挂 man_ske */
    private scene2ManNode: cc.Node = null;
    private npcSke: cc.Node = null;
    private npcArmature: dragonBones.ArmatureDisplay = null;
    private selectNode: cc.Node = null;
    private selectOptionRows: cc.Node[] = [];
    private selectOptionLabels: cc.Label[] = [];
    private flowNode: cc.Node = null;
    private envClothesNode: cc.Node = null;

    private blackCurtain: cc.Node = null;
    private scene2ManStartPos: cc.Vec3 = null;
    private envClothesStartPos: cc.Vec3 = null;

    /** flowNode 下隐形拖拽层（相对 flowNode 本地坐标复位） */
    private flowMoveNode: cc.Node = null;
    private flowMoveNodeRestPos: cc.Vec3 = null;
    private flowMoveNodeDragging = false;
    private envDragStartPos: cc.Vec3 = null;
    private introStarted = false;
    private qpFailSafeFn: () => void = null;

    /** 复活：回到失败当轮（非 scene2 重头） */
    private fuhuoResumeRound = -1;
    private fuhuoResumeRound7Unlocked = false;

    private tipsHand: cc.Node = null;

    private getScene2ManTransform(): cc.Node {
        return this.scene2ManNode || this.scene2Man;
    }

    /** 在子树中找第一个带 dragonBones 的节点 */
    private findFirstNodeWithArmature(root: cc.Node): cc.Node | null {
        if (!root || !cc.isValid(root)) return null;
        if (root.getComponent(dragonBones.ArmatureDisplay)) return root;
        for (let i = 0; i < root.children.length; i++) {
            const hit = this.findFirstNodeWithArmature(root.children[i]);
            if (hit) return hit;
        }
        return null;
    }

    /** 找带 qp 气泡的节点（用于 showqp） */
    private findFirstNodeWithQp(root: cc.Node): cc.Node | null {
        if (!root || !cc.isValid(root)) return null;
        if (root.getChildByName("qp")) return root;
        for (let i = 0; i < root.children.length; i++) {
            const hit = this.findFirstNodeWithQp(root.children[i]);
            if (hit) return hit;
        }
        return null;
    }

    private scene2ManArmature: dragonBones.ArmatureDisplay = null;

    private getScene2ManArmature(): dragonBones.ArmatureDisplay | null {
        if (this.scene2ManArmature && cc.isValid(this.scene2ManArmature.node)) return this.scene2ManArmature;
        const root = this.scene2ManNode || this.scene2Man;
        if (!root) return null;
        const n = this.findFirstNodeWithArmature(root);
        this.scene2ManArmature = n ? n.getComponent(dragonBones.ArmatureDisplay) : null;
        return this.scene2ManArmature;
    }

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(BGM_LV381);
        }, 0.5);

        this.bg = this.node.getChildByName("bg");
        if (this.bg) {
            this.scene1 = this.bg.getChildByName("scene1");
            this.scene2 = this.bg.getChildByName("scene2");
        }
        if (this.scene1) this.scene1Man = this.scene1.getChildByName("man_ske");
        if (this.scene2) {
            const manNode = this.scene2.getChildByName("manNode");
            if (manNode) {
                this.scene2ManNode = manNode;
                let skel = manNode.getChildByName("man_ske");
                if (!skel) {
                    skel = this.findFirstNodeWithQp(manNode);
                }
                if (!skel) {
                    skel = this.findFirstNodeWithArmature(manNode);
                    if (skel) {
                        cc.warn("[shj_lv381] manNode 下未找到 man_ske，已用首个龙骨节点（请确认 qp 挂在该节点下）");
                    }
                }
                this.scene2Man = skel;
                if (!this.scene2Man) {
                    cc.warn("[shj_lv381] manNode 下未找到龙骨或 qp 节点");
                }
            } else {
                this.scene2ManNode = null;
                this.scene2Man = this.scene2.getChildByName("man_ske");
            }
            this.npcSke = this.scene2.getChildByName("npc_ske");
            this.npcArmature = this.npcSke && this.npcSke.getComponent(dragonBones.ArmatureDisplay);
            this.selectNode = this.scene2.getChildByName("selectNode");
            if (this.selectNode) {
                for (let i = 0; i < 3; i++) {
                    const row = this.selectNode.getChildByName(String(i + 1));
                    this.selectOptionRows[i] = row;
                    const labelNode = row && row.getChildByName("label");
                    this.selectOptionLabels[i] = labelNode && labelNode.getComponent(cc.Label);
                }
            }
            this.flowNode = this.scene2.getChildByName("flowNode");
            this.envClothesNode = this.scene2.getChildByName("环保衣服");
        }

        const manTrans = this.getScene2ManTransform();
        if (manTrans) this.scene2ManStartPos = manTrans.position.clone();
        if (this.envClothesNode) this.envClothesStartPos = this.envClothesNode.position.clone();

        this.buildBlackCurtain();
        if (this.scene2) this.scene2.active = false;
        if (this.scene1) this.scene1.active = true;

        if (this.flowNode) {
            this.flowNode.active = false;
            this.flowMoveNode = this.flowNode.getChildByName("move_Node");
            if (this.flowMoveNode) {
                this.flowMoveNodeRestPos = this.flowMoveNode.position.clone();
                this.flowMoveNode.opacity = 0;
                this.flowMoveNode.on(cc.Node.EventType.TOUCH_START, this.onFlowMoveTouchStart, this);
                this.flowMoveNode.on(cc.Node.EventType.TOUCH_MOVE, this.onFlowMoveTouchMove, this);
                this.flowMoveNode.on(cc.Node.EventType.TOUCH_END, this.onFlowMoveTouchEnd, this);
                this.flowMoveNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onFlowMoveTouchEnd, this);
            } else {
                cc.warn("[shj_lv381] flowNode 下缺少 move_Node，第7轮解锁交互不可用");
            }
        }
        if (this.envClothesNode) this.envClothesNode.active = false;
        if (this.selectNode) this.selectNode.active = false;

        this.tipsHand = this.node.getChildByName("tipsHand");
        if (!this.tipsHand) {
            cc.warn("[shj_lv381] 未找到 tipsHand 节点");
        }
    }

    start() {
        if (!this.introStarted) {
            this.introStarted = true;
            this.scheduleOnce(() => this.runIntroSequence(), 0);
        }
    }

    private buildBlackCurtain() {
        const mask = new cc.Node("blackCurtain");
        mask.parent = this.node;
        mask.setContentSize(720, 1560);
        mask.setAnchorPoint(0.5, 0.5);
        mask.setPosition(0, 0);
        mask.zIndex = 10000;
        const g = mask.addComponent(cc.Graphics);
        g.fillColor = cc.Color.BLACK;
        g.rect(-360, -780, 720, 1560);
        g.fill();
        mask.opacity = 0;
        mask.active = false;
        this.blackCurtain = mask;
    }

    private runIntroSequence() {
        if (!this.scene1Man) {
            cc.error("[shj_lv381] scene1 man_ske 缺失，直进 scene2");
            this.enterScene2AfterIntro();
            return;
        }
        this.showqpSafe(this.scene1Man, INTRO_LINE, INTRO_LINE, () => {
            this.scheduleOnce(() => this.playBlackCurtainTransition(), 1);
        });
    }

    private playBlackCurtainTransition() {
        if (!this.blackCurtain) {
            this.enterScene2AfterIntro();
            return;
        }
        this.blackCurtain.active = true;
        this.blackCurtain.opacity = 0;
        const fadeInDur = 1.05;
        const fadeOutDur = 0.55;
        cc.tween(this.blackCurtain)
            .to(fadeInDur, { opacity: 255 }, { easing: "sineIn" })
            .call(() => {
                if (this.scene1) this.scene1.active = false;
                if (this.scene2) this.scene2.active = true;
                if (this.flowNode) this.flowNode.active = false;
                if (this.envClothesNode) this.envClothesNode.active = false;
                if (this.selectNode) this.selectNode.active = false;
            })
            .to(fadeOutDur, { opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                if (this.blackCurtain) this.blackCurtain.active = false;
                this.playScene2EnterThenQuiz();
            })
            .start();
    }

    private playScene2EnterThenQuiz() {
        const arm = this.getScene2ManArmature();
        if (!arm) {
            cc.warn("[shj_lv381] scene2 man 无龙骨（检查 manNode/man_ske 是否带 ArmatureDisplay）");
            this.beginRound(quizEntryRoundIndex());
            return;
        }
        arm.playAnimation("nan_kc", 1);
        AudioManager.playEffect(`劈柴`);
        this.addOneTimeListener(arm, () => {
            arm.playAnimation("nan_dj2", -1);
            this.beginRound(quizEntryRoundIndex());
        }, dragonBones.EventObject.COMPLETE);
    }

    restoreForFuhuo() {
        if (this.quizFlowEnded && this.fuhuoResumeRound >= 0) {
            this.restoreToQuizRoundFromFuhuo();
            return;
        }
        this.resetQuizFlow();
    }

    resetQuizFlow() {
        this.stopTipsHandAnim();
        this.fuhuoResumeRound = -1;
        this.quizRoundIndex = 0;
        this.quizFlowEnded = false;
        this.optionHandling = false;
        this.round7EnvUnlocked = false;
        this.winDispatched = false;

        if (this.npcSke) cc.Tween.stopAllByTarget(this.npcSke);
        const manTransR = this.getScene2ManTransform();
        if (manTransR) cc.Tween.stopAllByTarget(manTransR);

        if (this.selectNode) {
            this.unbindSelectOptions();
            this.selectNode.active = false;
        }
        if (this.npcSke) {
            this.npcSke.setPosition(NPC_ENTER_X0, this.npcSke.y, 0);
            this.npcSke.active = false;
        }
        if (manTransR && this.scene2ManStartPos) manTransR.position = this.scene2ManStartPos.clone();
        if (this.flowNode) this.flowNode.active = false;
        if (this.envClothesNode) {
            this.unbindEnvClothesDrag();
            this.envClothesNode.active = false;
            if (this.envClothesStartPos) this.envClothesNode.position = this.envClothesStartPos.clone();
        }
        this.resetFlowMoveNodePosition();

        const armR = this.getScene2ManArmature();
        if (armR) armR.playAnimation("nan_dj2", -1);

        if (this.scene1) this.scene1.active = false;
        if (this.scene2) this.scene2.active = true;

        this.canjiaohu = true;
        this.beginRound(quizEntryRoundIndex());
    }

    getQuizRoundIndex(): number {
        return this.quizRoundIndex;
    }

    getCurrentQuizRound(): (typeof QUIZ_ROUNDS)[number] | null {
        return QUIZ_ROUNDS[this.quizRoundIndex] ?? null;
    }

    submitQuizAnswer(optionIndex: number) {
        this.onSelectOption(optionIndex);
    }

    completeRound7EnvironmentalDrag() {
        if (GameData.PauseGame || this.quizFlowEnded) return;
        if (this.quizRoundIndex !== QUIZ_LAST_ROUND) return;
        if (!this.round7EnvUnlocked) return;
        if (this.winDispatched) return;
        this.quizFlowEnded = true;
        this.stopTipsHandAnim();

        const clothes = this.envClothesNode;
        if (clothes && cc.isValid(clothes)) {
            AudioManager.playEffect(SFX_WEAR_CLOTHES);
            clothes.destroy();
            this.envClothesNode = null;
        }

        const armWin = this.getScene2ManArmature();
        if (armWin) armWin.playAnimation("nan_dj5", -1);

        const line = ROUND7_MAN_WIN_LINE;
        if (this.selectNode) this.selectNode.active = false;
        this.showqpSafe(this.scene2Man, line, line, () => {
            this.scheduleOnce(() => this.doWinOnce(), 1);
        });
    }

    private doWinOnce() {
        if (this.winDispatched) return;
        this.winDispatched = true;
        this.onwin();
    }

    private enterScene2AfterIntro() {
        if (this.scene1) this.scene1.active = false;
        if (this.scene2) this.scene2.active = true;
        this.playScene2EnterThenQuiz();
    }

    private beginRound(roundIndex: number) {
        if (this.quizFlowEnded || GameData.PauseGame) return;
        if (roundIndex > QUIZ_LAST_ROUND) return;

        this.quizRoundIndex = roundIndex;
        this.stopTipsHandAnim();
        this.optionHandling = false;
        this.unbindSelectOptions();
        if (this.selectNode) this.selectNode.active = false;

        if (roundIndex === QUIZ_LAST_ROUND) {
            if (this.flowNode) this.flowNode.active = true;
            this.resetFlowMoveNodePosition();
        } else {
            if (this.flowNode) this.flowNode.active = false;
        }

        if (!this.npcSke || !this.scene2Man) {
            cc.error("[shj_lv381] scene2 npc/man 缺失");
            return;
        }

        const manArmRound = this.getScene2ManArmature();
        if (manArmRound) manArmRound.playAnimation("nan_dj2", -1);

        const base = NPC_BASE_ANIMS[roundIndex];
        const npcArm = this.npcArmature;

        this.npcSke.active = true;
        this.npcSke.scaleX = Math.abs(this.npcSke.scaleX) || 1;
        this.npcSke.setPosition(NPC_ENTER_X0, this.npcSke.y, 0);
        if (npcArm) npcArm.playAnimation(base, -1);

        cc.Tween.stopAllByTarget(this.npcSke);
        cc.tween(this.npcSke)
            .to(0.85, { position: cc.v3(NPC_ENTER_X1, this.npcSke.y, 0) })
            .call(() => {
                if (this.quizFlowEnded) return;
                this.showqpSafe(this.scene2Man, "你是哪位？", "你是哪位？", () => {
                    if (this.quizFlowEnded) return;
                    const qtext = stripSpeakerPrefix(QUIZ_ROUNDS[roundIndex].question);
                    this.showqpSafe(this.npcSke, qtext, qtext, () => {
                        if (this.quizFlowEnded) return;
                        this.fillAndShowSelect(roundIndex);
                    });
                });
            })
            .start();
    }

    private fillAndShowSelect(roundIndex: number) {
        if (!this.selectNode) return;
        const cfg = QUIZ_ROUNDS[roundIndex];
        for (let i = 0; i < 3; i++) {
            const lab = this.selectOptionLabels[i];
            if (lab) lab.string = cfg.options[i];
        }
        this.bindSelectOptions();
        this.selectNode.active = true;
    }

    private bindSelectOptions() {
        if (!this.selectNode) return;
        for (let i = 0; i < this.selectOptionRows.length; i++) {
            const row = this.selectOptionRows[i];
            if (!row) continue;
            const idx = i;
            row.on(cc.Node.EventType.TOUCH_END, () => this.onSelectOption(idx), this);
        }
    }

    private unbindSelectOptions() {
        if (!this.selectNode) return;
        for (let i = 0; i < this.selectOptionRows.length; i++) {
            const row = this.selectOptionRows[i];
            if (row) row.targetOff(this);
        }
    }

    private onSelectOption(optionIndex: number) {
        if (GameData.PauseGame || this.quizFlowEnded || this.optionHandling) return;
        if (!this.canjiaohu) return;
        const cfg = QUIZ_ROUNDS[this.quizRoundIndex];
        if (!cfg || optionIndex < 0 || optionIndex > 2) return;

        this.stopTipsHandAnim();
        this.optionHandling = true;
        this.unbindSelectOptions();
        if (this.selectNode) this.selectNode.active = false;

        const verbalCorrectClick = cfg.correctIndex >= 0 && optionIndex === cfg.correctIndex;
        AudioManager.playEffect(verbalCorrectClick ? SFX_QUIZ_CORRECT : SFX_QUIZ_WRONG);

        const txt = cfg.options[optionIndex];
        this.showqpSafe(this.scene2Man, txt, txt, () => {
            this.afterOptionSpoken(optionIndex);
        });
    }

    private afterOptionSpoken(optionIndex: number) {
        const i = this.quizRoundIndex;
        const cfg = QUIZ_ROUNDS[i];
        const base = NPC_BASE_ANIMS[i];
        const npcArm = this.npcArmature;
        const manArm = this.getScene2ManArmature();

        const verbalCorrect = cfg.correctIndex >= 0 && optionIndex === cfg.correctIndex;

        if (verbalCorrect) {
            if (manArm) manArm.playAnimation("nan_dj3", -1);
            AudioManager.playEffect(SFX_NPC_ANGRY_LEAVE);
            if (npcArm) npcArm.playAnimation(base + "_3", -1);
            this.scheduleOnce(() => this.playNpcExitAndNextRound(), 0.45);
            return;
        }

        this.fuhuoResumeRound = this.quizRoundIndex;
        this.fuhuoResumeRound7Unlocked = this.round7EnvUnlocked;
        if (manArm) manArm.playAnimation("nan_dj4", -1);
        if (npcArm) npcArm.playAnimation(base + "_4", -1);
        const failLine = WRONG_FEEDBACK[i] ?? "";
        this.showqpSafe(this.npcSke, failLine, failLine, () => {
            if (npcArm) npcArm.playAnimation(base + "_2", -1);
            this.flyManSpinExitAndLose();
        });
    }

    /** 复活：恢复到失败时的轮次与第7轮解锁状态，重亮选项 */
    private restoreToQuizRoundFromFuhuo() {
        this.stopTipsHandAnim();
        const roundIndex = this.fuhuoResumeRound;
        this.quizFlowEnded = false;
        this.optionHandling = false;
        this.fuhuoResumeRound = -1;
        this.quizRoundIndex = roundIndex;
        this.round7EnvUnlocked = this.fuhuoResumeRound7Unlocked;

        cc.Tween.stopAllByTarget(this.npcSke);
        const manTransFu = this.getScene2ManTransform();
        if (manTransFu) cc.Tween.stopAllByTarget(manTransFu);

        if (manTransFu && this.scene2ManStartPos) {
            manTransFu.setPosition(this.scene2ManStartPos);
            manTransFu.angle = 0;
        }
        const manArmFu = this.getScene2ManArmature();
        if (manArmFu) manArmFu.playAnimation("nan_dj2", -1);

        if (this.npcSke) {
            this.npcSke.active = true;
            this.npcSke.setPosition(NPC_ENTER_X1, this.npcSke.y, 0);
            this.npcSke.scaleX = Math.abs(this.npcSke.scaleX) || 1;
            const npcArm = this.npcArmature;
            const base = NPC_BASE_ANIMS[roundIndex];
            if (npcArm) npcArm.playAnimation(base, -1);
        }

        if (this.flowNode) {
            if (roundIndex === QUIZ_LAST_ROUND && !this.round7EnvUnlocked) {
                this.flowNode.active = true;
                this.resetFlowMoveNodePosition();
            } else this.flowNode.active = false;
        }
        if (this.envClothesNode) {
            this.unbindEnvClothesDrag();
            if (roundIndex === QUIZ_LAST_ROUND && this.round7EnvUnlocked) {
                this.envClothesNode.active = true;
                this.bindEnvClothesDrag();
            } else {
                this.envClothesNode.active = false;
                if (this.envClothesStartPos) this.envClothesNode.setPosition(this.envClothesStartPos);
            }
        }

        this.unbindSelectOptions();
        if (this.selectNode) this.selectNode.active = false;
        this.canjiaohu = true;

        if (!this.scene2Man || !this.npcSke) {
            this.fillAndShowSelect(roundIndex);
            return;
        }
        const qtextFuhuo = stripSpeakerPrefix(QUIZ_ROUNDS[roundIndex].question);
        this.showqpSafe(this.scene2Man, "你是哪位？", "你是哪位？", () => {
            if (this.quizFlowEnded) return;
            this.showqpSafe(this.npcSke, qtextFuhuo, qtextFuhuo, () => {
                if (this.quizFlowEnded) return;
                this.fillAndShowSelect(roundIndex);
            });
        });
    }

    private playNpcExitAndNextRound() {
        if (!this.npcSke) return;
        cc.Tween.stopAllByTarget(this.npcSke);
        AudioManager.playEffect(SFX_NPC_EXIT_STEPS);
        const y0 = this.npcSke.y;
        const sx0 = Math.abs(this.npcSke.scaleX) || 1;
        this.npcSke.scaleX = sx0;
        cc.tween(this.npcSke)
            .to(0.15, { scaleX: -sx0 })
            .to(0.7, { position: cc.v3(NPC_ENTER_X0, y0, 0) })
            .call(() => {
                this.npcSke.scaleX = sx0;
                this.npcSke.active = false;
                this.optionHandling = false;
                this.quizRoundIndex++;
                if (this.quizRoundIndex > QUIZ_LAST_ROUND) return;
                this.beginRound(this.quizRoundIndex);
            })
            .start();
    }

    private flyManSpinExitAndLose() {
        if (!this.getScene2ManTransform()) return;
        this.quizFlowEnded = true;
        this.stopTipsHandAnim();
        AudioManager.playEffect(SFX_NPC_SHOOT);
        const n = this.getScene2ManTransform();
        if (!n) return;
        cc.Tween.stopAllByTarget(n);
        const x0 = n.x;
        const y0 = n.y;
        const a0 = n.angle;
        cc.tween(n)
            .to(
                0.95,
                { x: x0 + 520, y: y0 + 680, angle: a0 - 1080 },
                { easing: "quadOut" }
            )
            .call(() => {
                this.optionHandling = false;
                this.onlost();
            })
            .start();
    }

    private resetFlowMoveNodePosition() {
        this.flowMoveNodeDragging = false;
        if (this.flowMoveNode && this.flowMoveNodeRestPos) {
            this.flowMoveNode.setPosition(this.flowMoveNodeRestPos.clone());
        }
    }

    private canHandleFlowDrag(): boolean {
        return (
            !this.round7EnvUnlocked &&
            !!this.flowNode &&
            this.flowNode.active &&
            this.quizRoundIndex === QUIZ_LAST_ROUND &&
            !GameData.PauseGame &&
            !this.quizFlowEnded
        );
    }

    private onFlowMoveTouchStart(_e: cc.Event.EventTouch) {
        if (!this.canHandleFlowDrag() || !this.flowMoveNode) return;
        this.stopTipsHandAnim();
        this.flowMoveNodeDragging = true;
    }

    private onFlowMoveTouchMove(e: cc.Event.EventTouch) {
        if (!this.flowMoveNodeDragging || !this.flowMoveNode || !this.canHandleFlowDrag()) return;
        const d = e.getDelta();
        this.flowMoveNode.setPosition(this.flowMoveNode.position.x + d.x, this.flowMoveNode.position.y + d.y);
    }

    private onFlowMoveTouchEnd(_e: cc.Event.EventTouch) {
        if (!this.flowMoveNode) return;
        const wasDragging = this.flowMoveNodeDragging;
        this.flowMoveNodeDragging = false;
        if (!wasDragging) return;

        if (!this.canHandleFlowDrag()) {
            this.resetFlowMoveNodePosition();
            return;
        }

        const dy = this.flowMoveNode.y - this.flowMoveNodeRestPos.y;
        if (dy >= FLOW_SWIPE_MIN_PX) {
            this.unlockRound7Env();
        } else {
            this.resetFlowMoveNodePosition();
        }
    }

    private unlockRound7Env() {
        if (this.round7EnvUnlocked) return;
        this.round7EnvUnlocked = true;
        this.stopTipsHandAnim();
        AudioManager.playEffect("button");
        if (this.flowNode) this.flowNode.active = false;
        if (this.envClothesNode) {
            this.envClothesNode.active = true;
            this.playEnvClothesAppearEffect();
            this.bindEnvClothesDrag();
        }
    }

    private bindEnvClothesDrag() {
        if (!this.envClothesNode) return;
        this.envClothesNode.on(cc.Node.EventType.TOUCH_START, this.onEnvTouchStart, this);
        this.envClothesNode.on(cc.Node.EventType.TOUCH_MOVE, this.onEnvTouchMove, this);
        this.envClothesNode.on(cc.Node.EventType.TOUCH_END, this.onEnvTouchEnd, this);
        this.envClothesNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onEnvTouchEnd, this);
    }

    private unbindEnvClothesDrag() {
        if (!this.envClothesNode) return;
        this.envClothesNode.targetOff(this);
    }

    private onEnvTouchStart(_e: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.quizFlowEnded || !this.envClothesNode) return;
        this.stopTipsHandAnim();
        this.envDragStartPos = this.envClothesNode.position.clone();
        this.envClothesNode.zIndex = 500;
    }

    private onEnvTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.quizFlowEnded || !this.envClothesNode) return;
        const delta = e.getDelta();
        this.envClothesNode.setPosition(this.envClothesNode.position.x + delta.x, this.envClothesNode.position.y + delta.y);
    }

    private onEnvTouchEnd(e: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.quizFlowEnded) return;
        const loc = e.getLocation();
        const manTransHit = this.getScene2ManTransform();
        const manBox = manTransHit && manTransHit.getBoundingBoxToWorld();
        const hit = !!(manBox && manBox.contains(loc));
        if (hit) {
            this.unbindEnvClothesDrag();
            if (this.envClothesNode) this.envClothesNode.zIndex = 0;
            this.completeRound7EnvironmentalDrag();
            return;
        }
        if (this.envDragStartPos && this.envClothesNode) {
            this.envClothesNode.position = this.envDragStartPos.clone();
        }
        if (this.envClothesNode) this.envClothesNode.zIndex = 0;
    }

    private stopTipsHandAnim() {
        if (!this.tipsHand || !cc.isValid(this.tipsHand)) return;
        cc.Tween.stopAllByTarget(this.tipsHand);
        this.tipsHand.active = false;
    }

    private worldPosToTipsHandParent(target: cc.Node, ox: number, oy: number): cc.Vec2 {
        const w = target.convertToWorldSpaceAR(cc.v2(ox, oy));
        return this.tipsHand.parent.convertToNodeSpaceAR(w);
    }

    private placeTipsHandAtNode(target: cc.Node, ox: number, oy: number) {
        const lp = this.worldPosToTipsHandParent(target, ox, oy);
        this.tipsHand.setPosition(lp.x, lp.y, 0);
    }

    /** 激励视频成功后：选项期指正确项 / 第七轮指上滑或拖衣服 */
    private onTipsVideoDone() {
        if (GameData.PauseGame || this.quizFlowEnded) return;
        if (!this.tipsHand || !this.scene2 || !this.scene2.active) return;

        this.stopTipsHandAnim();

        if (
            this.quizRoundIndex === QUIZ_LAST_ROUND &&
            this.round7EnvUnlocked &&
            this.envClothesNode &&
            cc.isValid(this.envClothesNode) &&
            this.envClothesNode.active
        ) {
            this.startTipsHandEnvDragLoop();
            return;
        }

        if (this.quizRoundIndex === QUIZ_LAST_ROUND && this.flowNode && this.flowNode.active && !this.round7EnvUnlocked) {
            this.startTipsHandFlowSwipeLoop();
            return;
        }

        if (this.selectNode && this.selectNode.active) {
            const cfg = QUIZ_ROUNDS[this.quizRoundIndex];
            if (cfg && cfg.correctIndex >= 0) {
                const row = this.selectOptionRows[cfg.correctIndex];
                if (row) {
                    this.startTipsHandOptionFloat(row);
                    return;
                }
            }
        }
    }

    private startTipsHandOptionFloat(row: cc.Node) {
        this.placeTipsHandAtNode(row, 0, 0);
        this.tipsHand.active = true;
        this.tipsHand.opacity = 255;
        this.tipsHand.zIndex = TIPS_HAND_Z;
        cc.Tween.stopAllByTarget(this.tipsHand);
        const y = this.tipsHand.y;
        cc.tween(this.tipsHand)
            .to(0.32, { y: y + 14 }, { easing: "sineOut" })
            .to(0.32, { y: y }, { easing: "sineIn" })
            .union()
            .repeatForever()
            .start();
    }

    private startTipsHandFlowSwipeLoop() {
        if (!this.flowNode) return;
        this.placeTipsHandAtNode(this.flowNode, 0, 0);
        this.tipsHand.active = true;
        this.tipsHand.zIndex = TIPS_HAND_Z;
        cc.Tween.stopAllByTarget(this.tipsHand);
        const y0 = this.tipsHand.y;
        this.tipsHand.opacity = 0;
        cc.tween(this.tipsHand)
            .to(0.42, { y: y0 + 75, opacity: 255 }, { easing: "quadOut" })
            .to(0.42, { y: y0, opacity: 0 }, { easing: "quadIn" })
            .union()
            .repeatForever()
            .start();
    }

    private startTipsHandEnvDragLoop() {
        if (!this.envClothesNode || !cc.isValid(this.envClothesNode) || !this.scene2Man) return;
        cc.Tween.stopAllByTarget(this.tipsHand);
        this.tipsHand.active = true;
        this.tipsHand.opacity = 255;
        this.tipsHand.zIndex = TIPS_HAND_Z;
        const run = () => {
            if (!this.tipsHand || !this.tipsHand.active) return;
            if (!this.envClothesNode || !cc.isValid(this.envClothesNode) || !this.scene2Man) {
                this.stopTipsHandAnim();
                return;
            }
            const p0 = this.worldPosToTipsHandParent(this.envClothesNode, 0, 0);
            const manTip = this.getScene2ManTransform();
            if (!manTip) {
                this.stopTipsHandAnim();
                return;
            }
            const p1 = this.worldPosToTipsHandParent(manTip, 0, 40);
            this.tipsHand.setPosition(p0.x, p0.y, 0);
            this.tipsHand.opacity = 255;
            cc.tween(this.tipsHand)
                .to(0.72, { position: cc.v3(p1.x, p1.y, 0) }, { easing: "quadInOut" })
                .delay(0.22)
                .call(run)
                .start();
        };
        run();
    }

    private playEnvClothesAppearEffect() {
        if (!this.envClothesNode) return;
        const n = this.envClothesNode;
        cc.Tween.stopAllByTarget(n);
        const sx = n.scaleX;
        const sy = n.scaleY;
        n.setScale(sx * 0.82, sy * 0.82);
        n.opacity = 200;
        cc.tween(n)
            .to(0.2, { scaleX: sx * 1.14, scaleY: sy * 1.14, opacity: 255 }, { easing: "quadOut" })
            .to(0.16, { scaleX: sx * 0.96, scaleY: sy * 0.96 }, { easing: "sineOut" })
            .to(0.1, { scaleX: sx, scaleY: sy })
            .start();
    }

    startTimer() {}

    areaStateUpate() {
        this.a1_isNull = true;
        this.a2_isNull = true;
        this.a3_isNull = true;
        for (let r = 0; r < this.roleArry.length; r++) {
            const role = this.roleArry[r];
            if (!role || !cc.isValid(role)) continue;
            const comp = role.getComponent(itme_move_lv381);
            if (!comp || !comp.isPut || !comp.curArea) continue;
            const idx = this.putAeraList.indexOf(comp.curArea);
            if (idx === 0) this.a1_isNull = false;
            else if (idx === 1) this.a2_isNull = false;
            else if (idx === 2) this.a3_isNull = false;
        }
    }

    lvUpdate() {}

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(
                    () => this.onTipsVideoDone(),
                    () => {}
                );
                break;
            case "x":
                if (this.tipsPanel) this.tipsPanel.active = false;
                cc.director.resume();
                break;
            case "btn_jiacishu":
                VideoManager.getInstance().showVideo(() => {
                    this.endAddTime();
                });
                break;
        }
    }

    onlost() {
        this.stopTipsHandAnim();
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            GameData.PauseGame = true;
            this.showLostPanel();
        }, 0.4);
    }

    private showLostPanel() {
        AssetManager.load("lv381", "lostPanel_lv381", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[shj_lv381] 加载 lostPanel_lv381 失败");
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
                return;
            }
            const lostNode = cc.instantiate(prefab);
            lostNode.parent = cc.find("Canvas");
            lostNode.opacity = 0;
            const lostScript = lostNode.getComponent(lostPanel_lv381) || lostNode.addComponent(lostPanel_lv381);
            lostScript.mainGame = this;
            cc.tween(lostNode).to(0.8, { opacity: 255 }).start();
        });
    }

    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.scheduleOnce(() => {
                this.node.destroy();
            }, 2);
        }, 2);
    }

    huxi(nodd: cc.Node) {
        cc.tween(nodd)
            .to(1, { opacity: 0 })
            .call(() => {
                cc.tween(nodd)
                    .to(1, { opacity: 255 })
                    .call(() => this.huxi(nodd))
                    .start();
            })
            .start();
    }

    /** 音效未进 audioMap 时仍限时收尾，避免卡死 */
    private showqpSafe(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        if (!qpnode) {
            handler && handler();
            return;
        }
        const qp = qpnode.getChildByName("qp");
        const qplabN = qp && qp.getChildByName("qplab");
        const qplab = qplabN && qplabN.getComponent(cc.Label);
        if (!qp || !qplabN || !qplab) {
            cc.warn("[shj_lv381] qp/qplab 缺失");
            handler && handler();
            return;
        }
        qplab.string = lab;
        this.canjiaohu = false;
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            if (this.qpFailSafeFn) this.unschedule(this.qpFailSafeFn);
            this.qpFailSafeFn = null;
            this.hideqp(qpnode, handler);
        };
        this.qpFailSafeFn = () => finish();
        this.scheduleOnce(this.qpFailSafeFn, 3);
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => finish());
            })
            .start();
    }

    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        this.showqpSafe(qpnode, lab, audioName, handler);
    }

    hideqp(qpnode: cc.Node, handler: Function) {
        const qp = qpnode.getChildByName("qp");
        if (!qp) {
            this.canjiaohu = true;
            handler && handler();
            return;
        }
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.canjiaohu = true;
                handler && handler();
            })
            .start();
    }
}
