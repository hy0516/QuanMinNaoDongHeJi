import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import { RGCS_QUESTIONS, RESULT_BY_CODE, rgcsComputeCode } from "./rgcs_lv405_data";

const { ccclass, property } = cc._decorator;

const SKE_ANIM = "Sprite";
/** Step4 测评龙骨动画名（rgcs_ske.json） */
const STEP4_SKE_ANIM = "rgcs";
/** 与 audio_lv405 下 mp3 同名（无扩展名），由 smallLoading 批量 AudioManager.set */
const AUDIO_LV405_CP_ZHONG = "测评中";
const AUDIO_LV405_CP_WANCHENG = "测评完成";
const AUDIO_LV405_CP_JIEGUO = "测评结果";

@ccclass
export default class rgcs_lv405 extends BaseGame {
    canjiaohu = false;

    @property(cc.Node)
    step1: cc.Node = null;

    @property(cc.Node)
    step2: cc.Node = null;

    @property(cc.Node)
    step3: cc.Node = null;

    @property({ type: cc.Node, displayName: "Step4（测评中/完成/查看结果）" })
    step4: cc.Node = null;

    @property({ type: cc.Node, displayName: "开始按钮" })
    btnStart: cc.Node = null;

    @property({ type: cc.Node, displayName: "进度条节点(scaleX)" })
    progressNode: cc.Node = null;

    @property(cc.Label)
    progressLabel: cc.Label = null;

    @property(cc.Label)
    questiontitleLabel: cc.Label = null;

    @property(cc.Label)
    questionLabel: cc.Label = null;

    @property({ type: cc.Node, displayName: "选项A根节点" })
    answer1: cc.Node = null;

    @property({ type: cc.Node, displayName: "选项B根节点" })
    answer2: cc.Node = null;

    @property({ type: cc.Node, displayName: "选项C根节点" })
    answer3: cc.Node = null;

    @property(cc.Label)
    answer1Label: cc.Label = null;

    @property(cc.Label)
    answer2Label: cc.Label = null;

    @property(cc.Label)
    answer3Label: cc.Label = null;

    @property({ type: cc.Node, displayName: "上一题" })
    btnPrev: cc.Node = null;

    @property({ type: cc.Node, displayName: "下一题" })
    btnNext: cc.Node = null;

    @property({ type: cc.Node, displayName: "提交" })
    btnSubmit: cc.Node = null;

    @property({ type: cc.Node, displayName: "龙骨容器 spritesNode" })
    spritesNode: cc.Node = null;

    @property({ type: cc.Label, displayName: "结果-中文名" })
    resultNameLabel: cc.Label = null;

    @property({ type: cc.Label, displayName: "结果-性格标签(英文)" })
    resultTagLabel: cc.Label = null;

    @property({ type: cc.Label, displayName: "结果-座右铭" })
    resultMottoLabel: cc.Label = null;

    @property(cc.Label)
    contentLabel: cc.Label = null;

    @property({ type: cc.Node, displayName: "重新测试" })
    btnRetry: cc.Node = null;

    private readonly answerRoots: cc.Node[] = [];
    private readonly answerLabels: cc.Label[] = [];
    private skeNodes: cc.Node[] = [];

    /** Step4 子节点缓存（由 step4 下按名查找） */
    private step4Assessing: cc.Node = null;
    private step4Done: cc.Node = null;
    private step4Ske: cc.Node = null;
    private btnViewResult: cc.Node = null;
    private step4SkeCompleteHandler: (() => void) | null = null;
    private step4SkeArm: dragonBones.ArmatureDisplay = null;

    private currentIndex = 0;
    private readonly answers: number[] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

    /** 选项子节点可能多一层，仅用于 选择框/圆 */
    private optPart(root: cc.Node, name: string): cc.Node {
        if (!root) return null;
        const direct = root.getChildByName(name);
        if (direct) return direct;
        for (let i = 0; i < root.children.length; i++) {
            const c = root.children[i].getChildByName(name);
            if (c) return c;
        }
        return null;
    }

    onLoad() {
        GameData.PauseGame = false;
        this.canjiaohu = true;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv405`);
        }, 0.5);

        this.answerRoots.length = 0;
        this.answerLabels.length = 0;
        this.answerRoots.push(this.answer1, this.answer2, this.answer3);
        this.answerLabels.push(this.answer1Label, this.answer2Label, this.answer3Label);

        if (!this.step1 || !this.step2 || !this.step3 || !this.step4 || !this.progressNode || !this.progressLabel
            || !this.questiontitleLabel || !this.questionLabel || !this.spritesNode) {
            cc.error("rgcs_lv405: 请在预制体上拖全 Inspector 中的节点/Label 引用（见脚本属性说明）");
            return;
        }
        this.resolveStep4Nodes();
        for (let i = 0; i < 3; i++) {
            if (!this.answerRoots[i] || !this.answerLabels[i]) {
                cc.error("rgcs_lv405: 选项节点或 Label 未绑定", i);
                return;
            }
        }

        this.skeNodes = this.spritesNode.children.slice();

        this.step1.active = true;
        this.step2.active = false;
        this.step3.active = false;
        if (this.step4) this.step4.active = false;
        if (this.btnSubmit) this.btnSubmit.active = false;
    }

    onDestroy() {
        this.teardownStep4SkeListener();
        this.unscheduleAllCallbacks();
    }

    private resolveStep4Nodes() {
        if (!this.step4) return;
        this.step4Assessing = this.step4.getChildByName("测评中");
        this.step4Done = this.step4.getChildByName("测评完成");
        this.btnViewResult = this.step4.getChildByName("查看结果");
        this.step4Ske = this.step4Assessing ? this.step4Assessing.getChildByName("rgcs_ske") : null;
    }

    private teardownStep4SkeListener() {
        if (this.step4SkeArm && this.step4SkeCompleteHandler) {
            this.step4SkeArm.removeEventListener(dragonBones.EventObject.COMPLETE, this.step4SkeCompleteHandler as any, this);
        }
        this.step4SkeCompleteHandler = null;
        this.step4SkeArm = null;
    }

    private popInNode(n: cc.Node, done?: () => void) {
        if (!n) {
            done && done();
            return;
        }
        n.stopAllActions();
        if ((cc as any).Tween) {
            (cc as any).Tween.stopAllByTarget(n);
        }
        n.scale = 0;
        n.opacity = 255;
        cc.tween(n)
            .to(0.28, { scale: 1 }, cc.easeBackOut())
            .call(() => done && done())
            .start();
    }

    private resetStep4VisualState() {
        this.unschedule(this.revealStep4ViewResult);
        this.teardownStep4SkeListener();
        if (this.step4Done) {
            this.step4Done.stopAllActions();
            if ((cc as any).Tween) {
                (cc as any).Tween.stopAllByTarget(this.step4Done);
            }
            this.step4Done.scale = 1;
        }
        if (this.btnViewResult) {
            this.btnViewResult.stopAllActions();
            if ((cc as any).Tween) {
                (cc as any).Tween.stopAllByTarget(this.btnViewResult);
            }
            this.btnViewResult.scale = 1;
        }
        if (this.step4Assessing) this.step4Assessing.active = true;
        if (this.step4Done) {
            this.step4Done.active = false;
            this.step4Done.scale = 0;
        }
        if (this.btnViewResult) {
            this.btnViewResult.active = false;
            this.btnViewResult.scale = 0;
        }
    }

    private beginStep4Sequence() {
        if (!this.step4) return;
        this.resetStep4VisualState();
        this.step4.active = true;
        AudioManager.playEffect(AUDIO_LV405_CP_ZHONG);

        const arm = this.step4Ske ? this.step4Ske.getComponent(dragonBones.ArmatureDisplay) : null;
        if (!arm) {
            this.onStep4AssessAnimDone();
            return;
        }
        this.step4SkeArm = arm;
        this.step4SkeCompleteHandler = () => {
            this.teardownStep4SkeListener();
            this.onStep4AssessAnimDone();
        };
        arm.addEventListener(dragonBones.EventObject.COMPLETE, this.step4SkeCompleteHandler as any, this);
        arm.playAnimation(STEP4_SKE_ANIM, 1);
    }

    private onStep4AssessAnimDone() {
        AudioManager.playEffect(AUDIO_LV405_CP_WANCHENG);
        if (this.step4Assessing) this.step4Assessing.active = false;
        if (this.step4Done) {
            this.step4Done.active = true;
            this.popInNode(this.step4Done);
        }
        this.scheduleOnce(this.revealStep4ViewResult, 1);
    }

    private revealStep4ViewResult = () => {
        if (!this.btnViewResult) return;
        this.btnViewResult.active = true;
        this.popInNode(this.btnViewResult);
    };

    /** 与编辑器 Button 事件一致：未暂停时播公共按钮音 */
    private tryPlayQuizButtonAudio(): boolean {
        if (GameData.PauseGame) return false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        return true;
    }

    public onViewResultAfterAd() {
        if (!this.tryPlayQuizButtonAudio()) return;
        VideoManager.getInstance().showVideo(
            () => {
                if (!cc.isValid(this.node)) return;
                if (this.step4) this.step4.active = false;
                this.step3.active = true;
                AudioManager.playEffect(AUDIO_LV405_CP_JIEGUO);
            },
            () => {
                cc.log("rgcs_lv405: 激励视频未完整观看");
            }
        );
    }

    /** answer1 / answer2 / answer3 分别在编辑器绑定，无需自定义参数 */
    public onAnswerA() {
        if (!this.tryPlayQuizButtonAudio()) return;
        this.selectOptionIndex(0);
    }

    public onAnswerB() {
        if (!this.tryPlayQuizButtonAudio()) return;
        this.selectOptionIndex(1);
    }

    public onAnswerC() {
        if (!this.tryPlayQuizButtonAudio()) return;
        this.selectOptionIndex(2);
    }

    public onStart() {
        if (!this.tryPlayQuizButtonAudio()) return;
        this.step1.active = false;
        this.step2.active = true;
        this.currentIndex = 0;
        for (let i = 0; i < 12; i++) this.answers[i] = -1;
        this.refreshQuestion();
    }

    public onRetry() {
        if (!this.tryPlayQuizButtonAudio()) return;
        this.unschedule(this.revealStep4ViewResult);
        this.resetStep4VisualState();
        this.step3.active = false;
        if (this.step4) this.step4.active = false;
        this.step1.active = true;
        this.step2.active = false;
        if (this.btnSubmit) this.btnSubmit.active = false;
        for (let i = 0; i < 12; i++) this.answers[i] = -1;
        this.currentIndex = 0;
    }

    public onPrev() {
        if (!this.tryPlayQuizButtonAudio()) return;
        if (this.currentIndex <= 0) return;
        this.currentIndex--;
        this.refreshQuestion();
    }

    public onNext() {
        if (!this.tryPlayQuizButtonAudio()) return;
        if (this.currentIndex >= 11) return;
        this.currentIndex++;
        this.refreshQuestion();
    }

    private selectOptionIndex(idx: number) {
        this.answers[this.currentIndex] = idx;
        this.refreshOptionVisuals();
        this.updateSubmitVisibility();
    }

    public onSubmit() {
        if (!this.tryPlayQuizButtonAudio()) return;
        if (!this.allAnswered()) return;
        const code = rgcsComputeCode(this.answers);
        const row = RESULT_BY_CODE[code];
        if (!row) {
            cc.warn("rgcs_lv405: unknown code", code);
            return;
        }
        if (this.resultNameLabel) this.resultNameLabel.string = row.cn;
        if (this.resultTagLabel) this.resultTagLabel.string = row.en;
        if (this.resultMottoLabel) this.resultMottoLabel.string = row.motto;
        if (this.contentLabel) this.contentLabel.string = row.intro;

        for (const n of this.skeNodes) {
            const on = n.name === `${row.cn}_ske`;
            n.active = on;
            if (on) {
                const arm = n.getComponent(dragonBones.ArmatureDisplay);
                if (arm) {
                    arm.playAnimation(SKE_ANIM, -1);
                }
            }
        }

        this.step2.active = false;
        this.step3.active = false;
        this.beginStep4Sequence();
    }

    private allAnswered(): boolean {
        return this.answers.every((a) => a >= 0);
    }

    private updateSubmitVisibility() {
        if (this.btnSubmit) this.btnSubmit.active = this.allAnswered();
    }

    private refreshQuestion() {
        const q = RGCS_QUESTIONS[this.currentIndex];
        this.questiontitleLabel.string = `第${this.currentIndex + 1}题`;
        this.questionLabel.string = q.text;
        for (let i = 0; i < 3; i++) {
            const letter = String.fromCharCode(65 + i);
            this.answerLabels[i].string = `${letter}. ${q.options[i]}`;
        }
        const p = (this.currentIndex + 1) / 12;
        this.progressNode.scaleX = p;
        this.progressLabel.string = `${this.currentIndex + 1}/12`;

        if (this.btnPrev) this.btnPrev.active = this.currentIndex <= 0 ? false : true;
        if (this.btnNext) this.btnNext.active = this.currentIndex >= 11 ? false : true;
        this.refreshOptionVisuals();
        this.updateSubmitVisibility();
    }

    /**
     * 每个选项：选择框1 / 选择圆1 始终显示；其**子节点** 选择框2 / 选择圆2 仅在本项被选中时激活，三选一。
     */
    private refreshOptionVisuals() {
        const sel = this.answers[this.currentIndex];
        for (let i = 0; i < 3; i++) {
            const root = this.answerRoots[i];
            if (!root) continue;
            const k1 = root.getChildByName("选择框1") || this.optPart(root, "选择框1");
            const y1 = root.getChildByName("选择圆1") || this.optPart(root, "选择圆1");
            if (k1) k1.active = true;
            if (y1) y1.active = true;
            const k2 = k1 ? (k1.getChildByName("选择框2") || this.optPart(k1, "选择框2")) : null;
            const y2 = y1 ? (y1.getChildByName("选择圆2") || this.optPart(y1, "选择圆2")) : null;
            const on = sel >= 0 && sel === i;
            if (k2) k2.active = on;
            if (y2) y2.active = on;
        }
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        let btnName = even.currentTarget.name;
        switch (btnName) {
            case "btn_close":
                this.openpausePanel();
                break;
        }
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.openpausePanel();
    }

    onwin() {
        this.canjiaohu = false;
        GameData.PauseGame = true;
        this.node.cleanup();
        this.endwin("prefabs/hz/endwin_hz");
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
    }

    onlost() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }

    nextLevel() {
        GameData.nextlevel();
        this.node.destroy();
    }
}
