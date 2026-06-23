import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import lostPanel_lv401 from "./lostPanel_lv401";

const { ccclass } = cc._decorator;

type DialogLine = { who: "enemy" | "player"; text: string; audio?: string };

/** 台词音效 key 与 audio_lv401 下 mp3 文件名（无扩展名）一致，由 smallLoading 批量 AudioManager.set */
type QuizRound = {
    question: string;
    options: [string, string, string];
    correctIndex: 0 | 1 | 2;
    qAudio: string;
    optionAudios: [string, string, string];
};

function estimateReadSeconds(text: string): number {
    return Math.min(8, Math.max(1.2, text.length * 0.09 + 0.8));
}

/** lv401 康熙对答：开场对话 → 五轮三选一，血条与龙骨受击 */
@ccclass
export default class wd_lv401 extends BaseGame {
    private bg: cc.Node = null;
    private enemyNode: cc.Node = null;
    private playerNode: cc.Node = null;
    private answerNode: cc.Node = null;
    private luxiang: cc.Node = null;
    /** 提示手指（广告后指向正确选项） */
    private szSke: cc.Node = null;
    private szArm: dragonBones.ArmatureDisplay = null;

    private enemySke: dragonBones.ArmatureDisplay = null;
    private playerSke: dragonBones.ArmatureDisplay = null;
    private enemyHealth: cc.Node = null;
    private playerHealth: cc.Node = null;

    private canInteract = true;
    private enemyHits = 0;
    private playerHits = 0;
    private readonly maxHits = 3;
    private quizIndex = 0;

    private readonly intro: DialogLine[] = [
        { who: "enemy", text: "朕出上联，你对下联", audio: "朕出上联你对下联" },
        { who: "player", text: "学生许卫生听着呢", audio: "学生许卫生听着呢" },
    ];

    private readonly rounds: QuizRound[] = [
        {
            question: "上联：烟锁池塘柳 金木水火土 五个部首",
            qAudio: "上联烟锁池塘柳 金木水火土 五个部首",
            options: ["柯洁炸地铁 要押韵的话 杨坤涮火锅", "白菜炒肉丝 萝卜炖牛腩", "小猫抓老鼠 大狗追骨头"],
            optionAudios: ["柯洁炸地铁 要押韵的话 杨坤涮火锅", "白菜炒肉丝 萝卜炖牛腩", "小猫抓老鼠 大狗追骨头"],
            correctIndex: 0,
        },
        {
            question: "寂寞寒窗空守寡 这七个汉字是一个偏旁",
            qAudio: "寂寞寒窗空守寡 这七个汉字是一个偏旁",
            options: ["十只碗六个盘子四把勺 这三样餐具都在厨房", "膀胱肿胀脂肪肝 这两个疾病都在你身上", "三本书五支笔七张纸 这三个文具都在你桌上"],
            optionAudios: ["十只碗六个盘子四把勺 这三样餐具都在厨房", "膀胱肿胀脂肪肝 这两个疾病都在你身上", "三本书五支笔七张纸 这三个文具都在你桌上"],
            correctIndex: 1,
        },
        {
            question: "你这江湖漂泊流浪汉 仿徨街径徒徘徊",
            qAudio: "你这江湖漂泊流浪汉 仿徨街径徒徘徊",
            options: ["你是痔疮癌症痛瘫痪 宫寒宅家宣宦官", "你是肩周炎脚踝痛胃酸倒 背痛头晕心慌慌", "你是早睡早起吃素食 运动健身晒太阳"],
            optionAudios: ["你是痔疮癌症痛瘫痪 宫寒宅家宣宦官", "你是肩周炎脚踝痛胃酸倒 背痛头晕心慌慌", "你是早睡早起吃素食 运动健身晒太阳"],
            correctIndex: 0,
        },
        {
            question: "今世进士尽是近视",
            qAudio: "今世进士尽是近视",
            options: ["餐厅厨师都在炒菜", "窟里苦力哭隶酷吏", "路上行人皆是瞎子"],
            optionAudios: ["餐厅厨师都在炒菜", "窟里苦力哭隶酷吏", "路上行人皆是瞎子"],
            correctIndex: 1,
        },
        {
            question: "一行征雁往南飞",
            qAudio: "一行征雁往南飞",
            options: ["四只小猴子爬上树", "三只松鼠蹦来蹦去", "两只烤鸭往北走"],
            optionAudios: ["四只小猴子爬上树", "三只松鼠蹦来蹦去", "两只烤鸭往北走"],
            correctIndex: 2,
        },
    ];

    private introIdx = 0;
    private answerRowHandlers: { node: cc.Node; fn: (e: cc.Event.EventTouch) => void }[] = [];
    private lostPanelNode: cc.Node = null;

    /** 进入胜利/失败流程前额外停顿（秒） */
    private readonly winLossEnterDelay = 1.5;

    onLoad() {
        GameData.PauseGame = false;
        this.isGameOver = false;
        AudioManager.stopMusic();
        GameData.recordLevelEnter(GameData.curGameName || "wd_lv401");

        this.resolveNodes();
        if (this.luxiang) this.luxiang.active = false;
        if (this.answerNode) this.answerNode.active = false;

        this.bindAnswerRows();
        this.playIdleEnemy();
        this.playIdlePlayer();
        this.scheduleOnce(() => this.playLevelBgm(), 0.5);
        this.runIntroStep();
    }

    onDestroy() {
        for (const h of this.answerRowHandlers) {
            h.node.off(cc.Node.EventType.TOUCH_END, h.fn, this);
        }
        this.answerRowHandlers = [];
    }

    private resolveNodes() {
        this.bg = this.node.getChildByName("bg");
        if (!this.bg) {
            cc.error("[wd_lv401] 未找到 bg");
            return;
        }
        this.luxiang = this.node.getChildByName("luxiang");

        this.enemyNode = this.bg.getChildByName("enemyNode");
        this.playerNode = this.bg.getChildByName("playerNode");
        this.answerNode = this.bg.getChildByName("answerNode");

        this.szSke = this.bg.getChildByName("sz_ske");
        if (this.szSke) {
            this.szArm = this.szSke.getComponent(dragonBones.ArmatureDisplay);
            this.szSke.active = false;
        }

        this.enemySke = this.findArmature(this.enemyNode);
        this.playerSke = this.findArmature(this.playerNode);

        const eh = this.enemyNode && this.enemyNode.getChildByName("healthNode");
        const ph = this.playerNode && this.playerNode.getChildByName("healthNode");
        this.enemyHealth = eh && eh.getChildByName("health");
        this.playerHealth = ph && ph.getChildByName("health");

        if (!this.enemyHealth || !this.playerHealth) {
            cc.warn("[wd_lv401] 未找到 healthNode/health");
        }
    }

    private findArmature(root: cc.Node): dragonBones.ArmatureDisplay | null {
        if (!root) return null;
        const a = root.getComponent(dragonBones.ArmatureDisplay);
        if (a) return a;
        return root.getComponentInChildren(dragonBones.ArmatureDisplay);
    }

    private playIdleEnemy() {
        if (this.enemySke) this.enemySke.playAnimation("kx_dj", -1);
    }

    private playIdlePlayer() {
        if (this.playerSke) this.playerSke.playAnimation("r_dj", -1);
    }

    private bindAnswerRows() {
        if (!this.answerNode) return;
        for (let i = 0; i < 3; i++) {
            const row = this.answerNode.getChildByName(String(i));
            if (!row) continue;
            const fn = (e: cc.Event.EventTouch) => this.onAnswerRowTouch(e, i as 0 | 1 | 2);
            row.on(cc.Node.EventType.TOUCH_END, fn, this);
            this.answerRowHandlers.push({ node: row, fn });
        }
    }

    private runIntroStep() {
        if (this.introIdx >= this.intro.length) {
            this.quizIndex = 0;
            this.askCurrentQuestion();
            return;
        }
        const line = this.intro[this.introIdx++];
        const qpRoot = line.who === "enemy" ? this.enemyNode : this.playerNode;
        this.showDialogLine(qpRoot, line.who === "enemy", line.text, line.audio, () => this.runIntroStep());
    }

    private askCurrentQuestion() {
        if (this.isGameOver || GameData.PauseGame) return;
        const round = this.rounds[this.quizIndex];
        if (!round) {
            cc.warn("[wd_lv401] 无更多题目");
            return;
        }
        this.hideSzSke();
        this.showDialogLine(this.enemyNode, true, round.question, round.qAudio, () => {
            this.fillAnswerLabels(round);
            if (this.answerNode) this.answerNode.active = true;
            this.canInteract = true;
        });
    }

    private fillAnswerLabels(round: QuizRound) {
        if (!this.answerNode) return;
        for (let i = 0; i < 3; i++) {
            const row = this.answerNode.getChildByName(String(i));
            const labN = row && row.getChildByName("answer");
            const lab = labN && labN.getComponent(cc.Label);
            if (lab) lab.string = round.options[i];
        }
    }

    private onAnswerRowTouch(_e: cc.Event.EventTouch, idx: 0 | 1 | 2) {
        if (!this.canInteract || this.isGameOver || GameData.PauseGame) return;
        const round = this.rounds[this.quizIndex];
        if (!round) return;

        this.canInteract = false;
        this.hideSzSke();
        if (this.answerNode) this.answerNode.active = false;

        const text = round.options[idx];
        const lineAudio = round.optionAudios[idx];
        this.showDialogLine(this.playerNode, false, text, lineAudio, () => {
            const ok = idx === round.correctIndex;
            if (ok) this.applyCorrect();
            else this.applyWrong();
        });
    }

    private applyCorrect() {
        this.playChudianSfx();
        this.enemyHits++;
        if (this.enemyHealth) this.enemyHealth.scaleX = Math.max(0, 1 - this.enemyHits / this.maxHits);

        if (this.enemySke) {
            this.enemySke.playAnimation("kx_kx", 1);
            this.addOneTimeListener(this.enemySke, () => this.playIdleEnemy());
        } else {
            this.playIdleEnemy();
        }

        this.scheduleOnce(() => this.afterRoundJudged(true), 0.35);
    }

    private applyWrong() {
        this.playChudianSfx();
        this.playerHits++;
        if (this.playerHealth) this.playerHealth.scaleX = Math.max(0, 1 - this.playerHits / this.maxHits);

        if (this.playerSke) {
            this.playerSke.playAnimation("r_kx", 1);
            this.addOneTimeListener(this.playerSke, () => this.playIdlePlayer());
        } else {
            this.playIdlePlayer();
        }

        this.scheduleOnce(() => this.afterRoundJudged(false), 0.35);
    }

    private afterRoundJudged(_correct: boolean) {
        if (this.enemyHits >= this.maxHits) {
            this.scheduleOnce(() => this.finishGameWin(), this.winLossEnterDelay);
            return;
        }
        if (this.playerHits >= this.maxHits) {
            this.scheduleOnce(() => this.onlost(), this.winLossEnterDelay);
            return;
        }
        this.quizIndex++;
        if (this.quizIndex >= this.rounds.length) {
            this.scheduleOnce(() => this.finishGameWin(), this.winLossEnterDelay);
            return;
        }
        this.canInteract = true;
        this.askCurrentQuestion();
    }

    /**
     * 康熙侧：说话时 kx_sh 循环，结束回 kx_dj；学生侧保持 r_dj，不切换说话动画。
     */
    private showDialogLine(qpRoot: cc.Node, isEnemy: boolean, text: string, audioKey: string | undefined, done: () => void) {
        if (!qpRoot) {
            done();
            return;
        }
        const qp = qpRoot.getChildByName("qp");
        const qplab = qp && qp.getChildByName("qplab");
        const label = qplab && qplab.getComponent(cc.Label);
        if (!qp || !label) {
            done();
            return;
        }

        label.string = text;
        if (isEnemy) {
            if (this.enemySke) this.enemySke.playAnimation("kx_sh", -1);
        }

        cc.Tween.stopAllByTarget(qp);
        qp.opacity = 0;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                this.playLineAudio(audioKey, text, () => this.hideDialogLine(isEnemy, done));
            })
            .start();
    }

    private playLineAudio(audioKey: string | undefined, lineText: string, onEnd: () => void) {
        if (audioKey) {
            const map = (AudioManager as any).audioMap as Map<string, cc.AudioClip>;
            if (map && map.get(audioKey)) {
                AudioManager.playEffect(audioKey, false, onEnd);
                return;
            }
            console.warn(`[wd_lv401] 音效未注册: ${audioKey}，用朗读时长代替`);
        }
        this.scheduleOnce(onEnd, estimateReadSeconds(lineText));
    }

    private hideDialogLine(isEnemy: boolean, done: () => void) {
        const qpRoot = isEnemy ? this.enemyNode : this.playerNode;
        const qp = qpRoot && qpRoot.getChildByName("qp");
        if (!qp) {
            if (isEnemy) this.playIdleEnemy();
            done();
            return;
        }
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                if (isEnemy) this.playIdleEnemy();
                done();
            })
            .start();
    }

    /** 广告成功：手指落在当前题正确选项上（仅在三选项已显示时） */
    private onTipsVideoSuccess() {
        if (GameData.PauseGame || this.isGameOver) return;
        if (!this.answerNode || !this.answerNode.active) return;
        this.placeSzSkeOnCorrectRow();
    }

    /** 将 sz_ske 移到正确选项行中心（与 bg 同坐标系），并播放循环动画 */
    private placeSzSkeOnCorrectRow() {
        if (!this.szSke || !this.bg || !this.answerNode) return;
        const round = this.rounds[this.quizIndex];
        if (!round) return;
        const row = this.answerNode.getChildByName(String(round.correctIndex));
        if (!row) return;

        const wpos = row.convertToWorldSpaceAR(cc.v2(0, 0));
        const lpos = this.bg.convertToNodeSpaceAR(wpos);
        this.szSke.setPosition(lpos);
        this.szSke.setSiblingIndex(this.bg.childrenCount - 1);

        if (this.szArm) {
            // 与预制体 dragonBones 默认动画名一致；若改名请同步修改
            this.szArm.playAnimation("newAnimation", -1);
        }
        this.szSke.active = true;
    }

    private hideSzSke() {
        if (this.szSke) this.szSke.active = false;
    }

    private playLevelBgm() {
        AudioManager.playMusic("bgmlv401", true);
    }

    /** 扣血时触电音效，与 audio_lv401/触电.mp3 一致 */
    private playChudianSfx() {
        const map = (AudioManager as any).audioMap as Map<string, cc.AudioClip>;
        if (map && map.get("触电")) {
            AudioManager.playEffect("触电", false);
        } else {
            cc.warn("[wd_lv401] 未注册音效: 触电");
        }
    }

    private stopLevelBgm() {
        AudioManager.stopMusic();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => this.onTipsVideoSuccess());
                break;
        }
    }

    fanhui() {
        this.stopLevelBgm();
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            if (err || !UI) {
                cc.error("[wd_lv401] 加载大厅预制件失败", err?.message);
                return;
            }
            const UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        });
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    openpausePanel() {
        this.stopLevelBgm();
        super.openpausePanel();
    }

    public resumeGamePublic() {
        GameData.PauseGame = false;
        this.playLevelBgm();
    }

    private finishGameWin() {
        this.stopLevelBgm();
        GameData.PauseGame = true;
        this.node.cleanup();
        this.endwin("prefabs/hz/endwin_hz");
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
    }

    onwin() {
        this.scheduleOnce(() => this.finishGameWin(), this.winLossEnterDelay);
    }

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.stopLevelBgm();
            this.isGameOver = true;
            this.showLostPanel();
        }, 2);
    }

    /** 动态加载失败面板（台词与 endlost 音效在面板 onEnable） */
    private showLostPanel() {
        if (this.lostPanelNode && this.lostPanelNode.isValid) return;
        if (!this.isGameOver) return;
        AssetManager.load(GameData.curGameStyle, "lostPanel_lv401", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab || !this.isGameOver || !this.node || !this.node.isValid) return;
            const panelNode = cc.instantiate(prefab);
            panelNode.parent = cc.find("Canvas");
            panelNode.opacity = 0;
            const comp = panelNode.getComponent(lostPanel_lv401) || panelNode.addComponent(lostPanel_lv401);
            comp.mainGame = this;
            this.lostPanelNode = panelNode;
            cc.tween(panelNode).to(0.2, { opacity: 255 }).start();
        });
    }

    restart() {
        this.stopLevelBgm();
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            if (!name) {
                cc.error("[wd_lv401] restart 加载 prefab 失败");
                return;
            }
            const UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }
}
