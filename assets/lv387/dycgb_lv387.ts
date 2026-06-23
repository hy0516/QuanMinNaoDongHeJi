
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import AssetManager from "../script/common/AssetManager";
import { musicConfig_lv387, NoteData, NoteSide, TIME_SCALE } from "./musicData_lv387";
import NoteBlock_lv387 from "./NoteBlock_lv387";
import lostPanel_lv387 from "./lostPanel_lv387";

const { ccclass, property } = cc._decorator;

/** 游戏状态 */
enum GameState {
    COUNTDOWN,  // 倒计时
    PLAYING,    // 游戏中
    PAUSED,     // 暂停（失败时）
    FAILED      // 失败
}

@ccclass
export default class dycgb_lv387 extends BaseGame {
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    @property(cc.Prefab)
    noteBlockPrefab: cc.Prefab = null; // 谱子方块预制体
    @property(cc.Prefab)
    countdownPrefab: cc.Prefab = null; // 倒计时预制体（包含3、2、1、开始图片）
    bgNode: cc.Node = null;
    // 游戏状态
    private gameState: GameState = GameState.COUNTDOWN;
    // 节点引用
    private checkPoint: cc.Node = null; // 判定点
    private nanzhuSke: dragonBones.ArmatureDisplay = null; // 角色龙骨
    private buttonContainer: cc.Node = null; // 按钮容器
    private heartContainer: cc.Node = null; // 爱心容器
    private noteContainer: cc.Node = null; // 谱子容器
    private btnZuo: cc.Node = null;
    private btnYou: cc.Node = null;
    // 爱心节点数组（3个）
    private hearts: cc.Node[] = [];
    // 倒计时图片节点
    private countdownImages: cc.Node[] = [];
    // 游戏数据
    private currentLives: number = 3; // 当前生命数
    private activeNotes: NoteBlock_lv387[] = []; // 当前活动的谱子方块
    private currentRoleAnimation: "" | "dj" | "tw" | "sw" | "sb" = "";
    // 音乐相关
    private musicStartTime: number = 0; // 音乐开始播放的时间戳
    // 暂停相关
    private pausedMusicTime: number = 0; // 暂停时音乐播放的时间点
    // 谱子生成索引（记录当前已处理到的谱子索引）
    private allNotes: NoteData[] = []; // 所有谱子数据（按时间排序）
    private currentNoteIndex: number = 0; // 当前需要检查的谱子索引
    // 谱子生成相关
    private noteStartY: number = 0; // 谱子生成起始Y坐标
    private noteTargetY: number = 0; // 谱子目标Y坐标（check_point位置）
    private noteLeftX: number = 0; // 左侧节拍X坐标
    private noteRightX: number = 0; // 右侧节拍X坐标
    private roleEffectSerial: number = 0;
    private lostPanelNode: cc.Node = null;
    /** 关卡 BGM 走音效通道时的实例 ID（用于对拍，不写入 AudioManager） */
    private levelBgmEffectId: number = -1;
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.stopLevelBgmEffect();

        this.bgNode = this.node.getChildByName("bg");
        if (!this.bgNode) {
            console.error("找不到bg节点");
            return;
        }

        // 初始化节点引用
        this.initNodes();

        // 初始化按钮
        this.initButtons();

        // 初始化爱心
        this.initHearts();

        // 初始化倒计时
        this.initCountdown();

        // 计算谱子移动的起始和目标位置
        this.calculateNotePositions();

        // 开始倒计时
        this.startCountdown();
    }

    /** 初始化节点引用 */
    private initNodes() {
        // check_point节点
        this.checkPoint = this.bgNode.getChildByName("check_point");
        if (!this.checkPoint) {
            console.error("找不到check_point节点");
        }

        // 角色龙骨
        const nanzhuNode = this.bgNode.getChildByName("zytz_ske");
        if (nanzhuNode) {
            this.nanzhuSke = nanzhuNode.getComponent(dragonBones.ArmatureDisplay);
            if (this.nanzhuSke) {
                this.setRoleAnimation("dj", 0);
            }
        }

        // 按钮容器
        this.buttonContainer = this.bgNode.getChildByName("buttonContainer");
        if (!this.buttonContainer) {
            // 如果不存在，创建一个
            this.buttonContainer = new cc.Node("buttonContainer");
            this.buttonContainer.parent = this.node;
        }

        // 爱心容器
        this.heartContainer = this.bgNode.getChildByName("heartContainer");
        if (!this.heartContainer) {
            this.heartContainer = new cc.Node("heartContainer");
            this.heartContainer.parent = this.node;
        }

        // 谱子容器
        this.noteContainer = this.bgNode.getChildByName("noteContainer");
        if (!this.noteContainer) {
            this.noteContainer = new cc.Node("noteContainer");
            this.noteContainer.parent = this.bgNode;
        }
    }

    /** 初始化按钮 */
    private initButtons() {
        this.btnZuo = this.buttonContainer.getChildByName("btn_zuo");
        this.btnYou = this.buttonContainer.getChildByName("btn_you");

        if (!this.btnZuo) {
            this.btnZuo = new cc.Node("btn_zuo");
            this.btnZuo.parent = this.buttonContainer;
        }
        if (!this.btnYou) {
            this.btnYou = new cc.Node("btn_you");
            this.btnYou.parent = this.buttonContainer;
        }

        this.btnZuo.active = true;
        this.btnYou.active = true;
    }

    /** 初始化爱心 */
    private initHearts() {
        // 假设爱心节点名为 heart_0, heart_1, heart_2
        for (let i = 0; i < 3; i++) {
            let heartNode = this.heartContainer.getChildByName(`heart_${i}`);
            if (!heartNode) {
                heartNode = new cc.Node(`heart_${i}`);
                heartNode.parent = this.heartContainer;
            }

            // 设置初始状态为红色完整
            this.setHeartState(heartNode, "full");

            this.hearts.push(heartNode);
        }
    }

    /** 初始化倒计时 */
    private initCountdown() {
        const countdownNames = ["countdown_3", "countdown_2", "countdown_1", "countdown_start"];
        for (let name of countdownNames) {
            let node = this.bgNode.getChildByName(name);
            if (!node) {
                console.warn(`找不到倒计时节点: ${name}，请确保场景中存在该节点`);
                node = new cc.Node(name);
                node.parent = this.node;
                node.active = false;
            } else {

                node.active = false;
            }
            this.countdownImages.push(node);
        }
        if (this.countdownImages.length === 0) {
            console.error("没有找到任何倒计时节点！");
        } else {
            console.log(`成功初始化 ${this.countdownImages.length} 个倒计时节点`);
        }
    }

    /** 计算谱子移动的起始和目标位置 */
    private calculateNotePositions() {
        if (!this.checkPoint || !this.noteContainer) return;

        this.noteStartY = this.noteContainer.position.y;
        this.noteTargetY = this.checkPoint.position.y;
        this.noteLeftX = this.noteContainer.position.x - 112;
        this.noteRightX = this.noteContainer.position.x + 112;

        console.log(`[dycgb_lv387] 谱子起点Y: ${this.noteStartY}, 判定Y: ${this.noteTargetY}`);
    }

    /** 开始倒计时 */
    private startCountdown() {
        this.gameState = GameState.COUNTDOWN;
        GameData.PauseGame = true;
        this.setRoleAnimation("dj", 0);
        this.countdownImages.forEach((img) => {
            img.active = false;
            img.opacity = 255;
            img.scale = 1;
        });
        AudioManager.playEffect(`djslv387`);
        this.showCountdown(0);
    }

    /** 显示倒计时 */
    private showCountdown(index: number) {
        if (index >= this.countdownImages.length) {
            // 倒计时结束，开始游戏
            this.startGame();
            return;
        }

        let countdownNode = this.countdownImages[index];
        countdownNode.active = true;
        countdownNode.scale = 0;
        countdownNode.opacity = 255;

        // 缩放动画
        cc.tween(countdownNode)
            .to(0.2, { scale: 1.2 })
            .to(0.1, { scale: 1 })
            .delay(0.5)
            .to(0.2, { opacity: 0 })
            .call(() => {
                countdownNode.active = false;
                this.showCountdown(index + 1);
            })
            .start();
    }

    /** 开始游戏 */
    private startGame() {
        this.gameState = GameState.PLAYING;
        GameData.PauseGame = false;

        const isFirstStart = this.activeNotes.length === 0 && !this.musicStartTime;

        if (isFirstStart) {
            this.currentLives = 3;
            this.activeNotes = [];
            this.pausedMusicTime = 0;
            this.currentNoteIndex = 0;
            this.updateHearts();
            this.playMusic();
            this.prepareAllNotes();
        } else {
            cc.audioEngine.resumeAll();
            this.resumeAllNotes();
        }
        this.setRoleAnimation("tw", 0);
    }

    /** 播放关卡 BGM（当音效播，不循环），对拍用 getLevelBgmTime */
    private playMusic() {
        const config = musicConfig_lv387;
        this.stopLevelBgmEffect();
        if (!GameData.effectSwitch) {
            this.musicStartTime = 1;
            return;
        }
        const clip = AudioManager.get(config.audioName);
        if (!clip) {
            cc.error("[dycgb_lv387] 缺少音频", config.audioName);
            this.musicStartTime = 1;
            return;
        }
        this.levelBgmEffectId = cc.audioEngine.playEffect(clip, false);
        if (this.levelBgmEffectId !== -1) {
            try {
                cc.audioEngine.setVolume(this.levelBgmEffectId, 0.7);
            } catch (e) {
                // ignore
            }
        }
        this.musicStartTime = 1;
    }

    private stopLevelBgmEffect() {
        if (this.levelBgmEffectId === -1) return;
        try {
            cc.audioEngine.stop(this.levelBgmEffectId);
        } catch (e) {
            // ignore
        }
        this.levelBgmEffectId = -1;
    }

    private getLevelBgmTime(): number {
        if (this.levelBgmEffectId === -1) return 0;
        try {
            return cc.audioEngine.getCurrentTime(this.levelBgmEffectId);
        } catch (e) {
            return 0;
        }
    }

    /** 暂停游戏 */
    private pauseGame() {
        // 如果已经是失败状态，不需要再暂停
        if (this.gameState === GameState.FAILED) return;
        // 如果不在游戏中，不需要暂停
        if (this.gameState !== GameState.PLAYING) return;

        // 设置状态
        this.gameState = GameState.PAUSED;
        //GameData.PauseGame = true;

        // 记录当前音乐播放时间
        this.pausedMusicTime = this.getLevelBgmTime();

        // 只暂停音频，不暂停导演（这样倒计时动画可以播放）
        cc.audioEngine.pauseAll();

        // 暂停所有谱子的移动
        this.pauseAllNotes();
    }
    private pauseAllNotes() {
        this.activeNotes.forEach(note => {
            if (note && note.node && note.node.isValid) {
                // 使用NoteBlock的pauseMove方法
                note.pauseMove();
            }
        });
    }
    private resumeAllNotes() {
        this.activeNotes.forEach(note => {
            if (note && note.node && note.node.isValid) {
                // 使用NoteBlock的resumeMove方法
                note.resumeMove();
            }
        });
    }
    private resumeGame() {
        if (this.gameState !== GameState.PAUSED) return;
        this.startCountdown();
    }

    /** 公开的恢复游戏方法（供外部调用，如pausePanel） */
    public resumeGamePublic() {
        this.resumeGame();
    }

    private setRoleAnimation(animationName: "dj" | "tw" | "sw" | "sb", playTimes: number) {
        if (!this.nanzhuSke || this.currentRoleAnimation === animationName) {
            return;
        }
        this.nanzhuSke.playAnimation(animationName, playTimes);
        this.currentRoleAnimation = animationName;
    }

    private playMissRoleEffect() {
        if (!this.nanzhuSke || this.gameState !== GameState.PLAYING) {
            return;
        }
        this.roleEffectSerial++;
        const serial = this.roleEffectSerial;
        this.currentRoleAnimation = "";
        this.setRoleAnimation("sw", 1);
        this.scheduleOnce(() => {
            if (serial !== this.roleEffectSerial || this.gameState !== GameState.PLAYING) {
                return;
            }
            this.currentRoleAnimation = "";
            this.setRoleAnimation("tw", 0);
        }, 0.5);
    }

    private playHitBlink(side: NoteSide) {
        const slotName = side === "left" ? "zy" : "yy";
        if (!this.nanzhuSke || !this.nanzhuSke.armature() || !this.nanzhuSke.armature().getSlot(slotName)) {
            return;
        }
        this.changeSKSlotIndex(this.nanzhuSke, slotName, 1);
        this.scheduleOnce(() => {
            if (!this.nanzhuSke || !this.nanzhuSke.node || !this.nanzhuSke.node.isValid) {
                return;
            }
            if (!this.nanzhuSke.armature() || !this.nanzhuSke.armature().getSlot(slotName)) {
                return;
            }
            this.changeSKSlotIndex(this.nanzhuSke, slotName, 0);
        }, 0.12);
    }

    /** 准备所有谱子数据（按时间排序） */
    private prepareAllNotes() {
        const config = musicConfig_lv387;
        this.allNotes = config.notes.slice().sort((a, b) => a.time - b.time);

        console.log(`准备了 ${this.allNotes.length} 个谱子，按时间顺序排列`);
    }

    /** 生成谱子方块 */
    private generateNote(noteData: NoteData, generateTime: number) {
        if (!this.noteBlockPrefab) {
            console.error("noteBlockPrefab未设置");
            return;
        }

        const noteSide = noteData.side;
        const startPosition = cc.v2(
            noteSide === "left" ? this.noteLeftX : this.noteRightX,
            this.noteStartY
        );
        const noteNode = cc.instantiate(this.noteBlockPrefab);
        noteNode.parent = this.bgNode;
        let noteBlock = noteNode.getComponent(NoteBlock_lv387);
        if (!noteBlock) {
            noteBlock = noteNode.addComponent(NoteBlock_lv387);
        }
        const actualGenerateTime = generateTime;
        noteBlock.init(noteData, startPosition, this.noteTargetY, actualGenerateTime);
        noteBlock.startMove();
        this.activeNotes.push(noteBlock);
        const noteBlockRef = noteBlock;
        const self = this;
        const originalDestroy = noteBlock.destroyNode.bind(noteBlock);
        noteBlock.destroyNode = function () {
            const index = self.activeNotes.indexOf(noteBlockRef);
            if (index >= 0) {
                self.activeNotes.splice(index, 1);
            }
            originalDestroy();
            self.checkIfAllNotesCompleted();
        };
    }

    public onBtnZuo() {
        this.handleBeatButton("left");
    }

    public onBtnYou() {
        this.handleBeatButton("right");
    }

    private handleBeatButton(side: NoteSide) {
        if (this.gameState !== GameState.PLAYING || GameData.PauseGame) {
            return;
        }
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.judgeNote(side);
    }

    /** 判定谱子 */
    private judgeNote(buttonSide: NoteSide) {
        if (!this.checkPoint) return;

        const checkPointY = this.checkPoint.position.y;
        const notesInRange: NoteBlock_lv387[] = [];
        for (let note of this.activeNotes) {
            if (note.isJudged || !note.isInJudgeRange(checkPointY)) {
                continue;
            }
            notesInRange.push(note);
        }

        if (notesInRange.length === 0) {
            return;
        }

        // 双押：优先在本键一侧里取最近的，避免只按到一边时误选对面轨
        const matchPool = notesInRange.filter((n) => n.noteSide === buttonSide);
        const pool = matchPool.length > 0 ? matchPool : notesInRange;

        let nearestNote: NoteBlock_lv387 = null;
        let minDistance = Infinity;

        for (let note of pool) {
            const distance = note.getDistanceToCheckPoint(checkPointY);
            if (distance < minDistance) {
                minDistance = distance;
                nearestNote = note;
            }
        }

        if (!nearestNote) {
            return;
        }

        if (nearestNote.noteSide !== buttonSide) {
            this.showJudgmentEffect("miss");
            this.onMiss();
            nearestNote.onMiss();
            this.checkIfAllNotesCompleted();
            return;
        }

        const result = nearestNote.judge(checkPointY);
        if (result === "perfect") {
            this.onPerfect(nearestNote, buttonSide);
        } else if (result === "great") {
            this.onGreat(nearestNote, buttonSide);
        } else {
            this.showJudgmentEffect("miss");
            this.onMiss();
            nearestNote.onMiss();
            this.checkIfAllNotesCompleted();
        }
    }

    /** 完美判定 */
    private onPerfect(note: NoteBlock_lv387, side: NoteSide) {
        // AudioManager.playEffect("perfectlv387");
        this.showJudgmentEffect("perfect");
        this.playHitBlink(side);
        note.onHit();
        this.checkIfAllNotesCompleted();
    }

    /** 真棒判定 */
    private onGreat(note: NoteBlock_lv387, side: NoteSide) {
        // AudioManager.playEffect("perfectlv387");
        this.showJudgmentEffect("great");
        this.playHitBlink(side);
        note.onHit();
        this.checkIfAllNotesCompleted();
    }

    /** Miss判定 */
    private onMiss() {
        this.currentLives--;
        this.updateHearts();
        if (this.currentLives <= 0) {
            this.onGameFailed();
        } else {
            AudioManager.playEffect("errorlv387");
            this.playMissRoleEffect();
        }
    }

    /** 更新爱心显示 */
    private updateHearts() {
        for (let i = 0; i < 3; i++) {
            const heartNode = this.hearts[i];
            if (!heartNode) {
                continue;
            }
            if (i < this.currentLives) {
                this.setHeartState(heartNode, "full");
            } else {
                this.setHeartState(heartNode, "gray", true);
            }
        }
    }

    /** 设置爱心状态 */
    private setHeartState(heartNode: cc.Node, state: "full" | "gray", playAnim: boolean = false) {
        const states = ["full", "gray"];
        states.forEach(s => {
            const child = heartNode.getChildByName(s);
            if (child) {
                child.active = (s === state);
            }
        });
        if (playAnim) {
            heartNode.stopAllActions();
            heartNode.scale = 1;
            cc.tween(heartNode)
                .to(0.12, { scale: 1.15 })
                .to(0.12, { scale: 1 })
                .start();
        }
    }

    /** 游戏失败 */
    private onGameFailed() {
        this.pauseGame();
        this.gameState = GameState.FAILED;
        this.setRoleAnimation("sb", 1);
        this.showLostPanel();
    }

    /** 看广告复活 */
    public onRevive() {
        this.restoreForFuhuo();
        this.lvUpdate();
    }

    /** 看广告加生命 */
    public onAddLife() {
        // 如果不在游戏中，不需要暂停
        if (this.gameState !== GameState.PLAYING) return;

        this.pauseGame();
        VideoManager.getInstance().showVideo(() => {
            // 广告观看成功
            if (this.currentLives < 3) {
                this.currentLives = 3;
                this.updateHearts();
            }
           // 检查是否所有谱子都已完成
        if (this.currentNoteIndex >= this.allNotes.length &&
            this.activeNotes.length === 0 &&
            this.currentLives > 0) {
            // 所有谱子都完成了，直接判定胜利
            this.onwin();
        } else {
            // 还有谱子未完成，恢复游戏（会走倒计时）
            this.resumeGame();
        }
        }, () => {
            // 广告观看失败
            console.log("广告观看失败");
            // 恢复游戏（会走倒计时）
            this.resumeGame();
        });
    }

    update(dt: number) {
        if (this.gameState !== GameState.PLAYING) return;

        this.checkAndGenerateNotes();
        if (this.checkPoint) {
            const checkPointY = this.checkPoint.position.y;
            const notesToRemove: NoteBlock_lv387[] = [];

            this.activeNotes.forEach(note => {
                if (note.hasPassedCheckPoint(checkPointY) && !note.isJudged) {
                    notesToRemove.push(note);
                }
            });

            notesToRemove.forEach(note => {
                note.isJudged = true;
                this.showJudgmentEffect("miss");
                this.onMiss();
                note.destroyNode();
                this.checkIfAllNotesCompleted();
            });
        }
    }

    /** 根据音乐时间检查并生成谱子 */
    private checkAndGenerateNotes() {
        if (this.allNotes.length === 0 || this.currentNoteIndex >= this.allNotes.length) {
            return; // 没有谱子或已经全部生成完毕
        }

        // 获取当前音乐播放时间（实际播放时间）
        const currentMusicTime = this.getLevelBgmTime();

        // 从当前索引开始检查，看是否有需要生成的谱子
        while (this.currentNoteIndex < this.allNotes.length) {
            const noteData = this.allNotes[this.currentNoteIndex];
            const generateTime = noteData.generateTime * TIME_SCALE;
            if (currentMusicTime >= generateTime) {
                this.generateNote(noteData, generateTime);
                this.currentNoteIndex++;
            } else {
                break;
            }
        }
    }

    /** 显示判定效果 */
    private showJudgmentEffect(type: "perfect" | "great" | "miss") {
        if (!this.checkPoint || !this.bgNode) {
            return;
        }
        
        // 图片映射：perfect -> 05, great -> 06, miss -> 07
        const imageMap = {
            "perfect": "05",
            "great": "06",
            "miss": "07"
        };
        
        const imageName = imageMap[type];
        const imagePath = `picture_lv387/pic/${imageName}`;
        
        // 创建效果节点，直接父节点设为bgNode
        const effectNode = new cc.Node("judgmentEffect_" + type);
        effectNode.parent = this.bgNode;
        
        // 根据check_point位置设置初始位置（在check_point上方100像素）
        const checkPointPos = this.checkPoint.position;
        effectNode.setPosition(checkPointPos.x, checkPointPos.y + 100);
        
        // 添加Sprite组件
        const sprite = effectNode.addComponent(cc.Sprite);
        
        // 加载图片
        AssetManager.load(
            GameData.curGameStyle,
            imagePath,
            cc.SpriteFrame,
            null,
            (spriteFrame: cc.SpriteFrame) => {
                if (spriteFrame && sprite && sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = spriteFrame;
                    
                    // 设置初始状态：透明
                    effectNode.opacity = 0;
                    effectNode.scale = 1;
                    
                    // 播放动画：快速出现 -> 向上移动 -> 消失
                    cc.tween(effectNode)
                        // 快速出现（0.2秒内opacity从0到255）
                        .to(0.2, { opacity: 255 })
                        // 向上移动（0.8秒内向上移动150像素）
                        .to(0.8, { 
                            y: effectNode.y + 150,
                            opacity: 200  // 稍微变淡
                        }, { easing: 'sineOut' })
                        // 消失（0.3秒内opacity从200到0）
                        .to(0.3, { opacity: 0 })
                        // 动画结束后销毁节点
                        .call(() => {
                            if (effectNode && effectNode.isValid) {
                                effectNode.destroy();
                            }
                        })
                        .start();
                } else {
                    console.warn(`加载判定效果图片失败: ${imagePath}`);
                    // 如果加载失败，直接销毁节点
                    if (effectNode && effectNode.isValid) {
                        effectNode.destroy();
                    }
                }
            }
        );
    }
    
    private checkIfAllNotesCompleted() {
        // 如果游戏已经失败或不在游戏中，不检查
        if (this.gameState === GameState.FAILED || this.gameState !== GameState.PLAYING) {
            return;
        }

        // 检查条件：
        // 1. 所有谱子都已生成（currentNoteIndex >= allNotes.length）
        // 2. 没有活动的谱子了（activeNotes.length === 0）
        // 3. 游戏没有失败（currentLives > 0）
        if (this.currentNoteIndex >= this.allNotes.length &&
            this.activeNotes.length === 0 &&
            this.currentLives > 0) {
            this.onwin();
        }
    }
    BtnHandler(even: cc.Event.EventTouch) {
        // if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.pauseGame();
                this.openpausePanel();
                break;
            case "btn_jsm":
                this.onAddLife();
                break;
        }
    }

    private showLostPanel() {
        if (this.lostPanelNode && this.lostPanelNode.isValid) {
            return;
        }
        AssetManager.load(GameData.curGameStyle, "lostPanel_lv387", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[dycgb_lv387] 加载 lostPanel_lv387 失败");
                return;
            }
            if (this.gameState !== GameState.FAILED || this.currentLives > 0) {
                return;
            }
            const panelNode = cc.instantiate(prefab);
            panelNode.parent = cc.find("Canvas");
            panelNode.opacity = 0;
            const panelScript = panelNode.getComponent(lostPanel_lv387) || panelNode.addComponent(lostPanel_lv387);
            panelScript.mainGame = this;
            this.lostPanelNode = panelNode;
            cc.tween(panelNode).to(0.2, { opacity: 255 }).start();
        });
    }

    public restoreForFuhuo(): void {
        this.currentLives = 3;
        this.updateHearts();
        this.gameState = GameState.PAUSED;
        GameData.PauseGame = true;
        this.currentRoleAnimation = "";
        this.setRoleAnimation("dj", 0);
        if (this.lostPanelNode && this.lostPanelNode.isValid) {
            this.lostPanelNode = null;
        }
    }

    public lvUpdate(): void {
        if (this.currentNoteIndex >= this.allNotes.length &&
            this.activeNotes.length === 0 &&
            this.currentLives > 0) {
            this.onwin();
            return;
        }
        this.resumeGame();
    }

    onwin() {
        this.scheduleOnce(() => {
            AudioManager.stopMusic();
            this.stopLevelBgmEffect();
        }, 1);
        this.gameState = GameState.PAUSED;
        var fun = () => {
            GameData.PauseGame = false;
           // AudioManager.stopMusic();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.cleanup();
            this.node.destroy();
            return;
        };
        this.gou.cleanup();
        AudioManager.playEffect("gou");
        cc.audioEngine.stopMusic();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start();
        return;
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
        this.stopLevelBgmEffect();
    }
}
