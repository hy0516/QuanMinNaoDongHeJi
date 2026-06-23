
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import AssetManager from "../script/common/AssetManager";
import { musicConfig_lv275, NoteData, SentenceData, TIME_SCALE } from "./musicData_lv275";
import NoteBlock_lv275 from "./NoteBlock_lv275";
import zc_lost_lv275 from "./zc_lost_lv275";

const { ccclass, property } = cc._decorator;

/** 游戏状态 */
enum GameState {
    COUNTDOWN,  // 倒计时
    PLAYING,    // 游戏中
    PAUSED,     // 暂停（失败时）
    FAILED      // 失败
}

@ccclass
export default class dycgb_lv275 extends BaseGame {
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
    // 按钮节点数组（5个颜色按钮）
    private buttons: cc.Node[] = [];
    private buttonWordSprites: cc.Sprite[] = []; // 按钮文字图片Sprite
    // 爱心节点数组（3个）
    private hearts: cc.Node[] = [];
    // 倒计时图片节点
    private countdownImages: cc.Node[] = [];
    // 游戏数据
    private currentLives: number = 3; // 当前生命数
    private currentSentenceIndex: number = 0; // 当前句子索引
    private activeNotes: NoteBlock_lv275[] = []; // 当前活动的谱子方块
    private generatedNoteTimes: Set<number> = new Set(); // 已生成的音符时间点（用于去重）
    private currentAnimationState: "daiji1" | "daiji2" | "daiji3" = "daiji1"; // 当前角色动画状态
    // 音乐相关
    private musicStartTime: number = 0; // 音乐开始播放的时间戳
    // 暂停相关
    private pausedMusicTime: number = 0; // 暂停时音乐播放的时间点
    // 谱子生成索引（记录当前已处理到的谱子索引）
    private allNotes: NoteData[] = []; // 所有谱子数据（按时间排序）
    private currentNoteIndex: number = 0; // 当前需要检查的谱子索引
    // 谱子生成相关
    private noteStartX: number = 0; // 谱子生成起始X坐标（屏幕右侧）
    private noteTargetX: number = 0; // 谱子目标X坐标（check_point位置）
    // 颜色映射（绿、紫、黄、红、蓝）
    private readonly COLOR_NAMES = ["绿", "紫", "黄", "红", "蓝"];
    // 谱子提前生成时间（秒），控制谱子从生成到到达检查点的时间
    // 例如：如果设置为2.0秒，谱子会在到达时间前2秒生成，然后匀速移动2秒到达检查点
    // 你可以修改这个值来控制谱子的移动速度：
    // - 值越大：谱子越早生成，移动时间越长，移动速度越慢
    // - 值越小：谱子越晚生成，移动时间越短，移动速度越快
    // 建议值：1.5 - 3.0 秒之间，根据你的游戏难度和屏幕宽度调整
    private readonly NOTE_PRE_GENERATE_TIME: number = 2.0;
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();

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
        const nanzhuNode = this.bgNode.getChildByName("nanzhu_ske");
        if (nanzhuNode) {
            this.nanzhuSke = nanzhuNode.getComponent(dragonBones.ArmatureDisplay);
            if (this.nanzhuSke) {
                this.nanzhuSke.playAnimation("daiji1", 0); // 初始播放待机动画
                this.currentAnimationState = "daiji1";
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
        // 假设按钮节点名为 btn_0, btn_1, btn_2, btn_3, btn_4
        for (let i = 0; i < 5; i++) {
            let btnNode = this.buttonContainer.getChildByName(`btn_${i}`);
            if (!btnNode) {
                // 如果不存在，创建一个占位节点
                btnNode = new cc.Node(`btn_${i}`);
                btnNode.parent = this.buttonContainer;
            }

            // 添加按钮点击事件
            btnNode.on(cc.Node.EventType.TOUCH_END, this.onButtonClick, this);

            this.buttons.push(btnNode);

            // 获取或创建文字图片Sprite节点
            let wordSpriteNode = btnNode.getChildByName("wordSprite");
            if (!wordSpriteNode) {
                wordSpriteNode = new cc.Node("wordSprite");
                wordSpriteNode.addComponent(cc.Sprite);
                wordSpriteNode.parent = btnNode;
            }
            const sprite = wordSpriteNode.getComponent(cc.Sprite);
            if (!sprite) {
                wordSpriteNode.addComponent(cc.Sprite);
            }
            this.buttonWordSprites.push(wordSpriteNode.getComponent(cc.Sprite));

            // 初始隐藏所有按钮
            btnNode.active = false;
        }
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

        // 使用 noteContainer 的位置作为起始位置（相对于 bgNode 的本地坐标）
        this.noteStartX = this.noteContainer.position.x;

        // 使用 checkPoint 的位置作为目标位置（相对于 bgNode 的本地坐标）
        this.noteTargetX = this.checkPoint.position.x;

        console.log(`谱子起始位置: ${this.noteStartX}, 目标位置: ${this.noteTargetX}`);
    }

    /** 开始倒计时 */
    private startCountdown() {
        this.gameState = GameState.COUNTDOWN;
        GameData.PauseGame = true;

        // // 隐藏所有倒计时图片
        // this.countdownImages.forEach(img => img.active = false);
        AudioManager.playEffect(`djslv275`);
        // 执行倒计时：3 -> 2 -> 1 -> 开始
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

        // 判断是首次开始还是恢复游戏
        const isFirstStart = this.currentSentenceIndex === 0 && this.activeNotes.length === 0 && !this.musicStartTime;

        if (isFirstStart) {
            // 首次开始游戏，重置所有数据
            this.currentLives = 3;
            this.currentSentenceIndex = 0;
            this.activeNotes = [];
            this.generatedNoteTimes.clear();
            this.pausedMusicTime = 0;
            this.currentNoteIndex = 0; // 重置谱子索引
            this.updateHearts();

            // 播放音乐
            this.playMusic();

            // 准备第一句的按钮
            this.prepareNextSentence();

            // 准备所有谱子数据（按时间排序）
            this.prepareAllNotes();
        } else {
            // 恢复游戏时，恢复音频播放
            cc.audioEngine.resumeAll();

            // 恢复所有谱子的移动
            this.resumeAllNotes();
        }

        // 播放角色待机动画
        if (this.nanzhuSke) {
            this.nanzhuSke.playAnimation("daiji1", 0);
            this.currentAnimationState = "daiji1";
        }
    }

    /** 播放音乐 */
    private playMusic() {
        const config = musicConfig_lv275;
        AudioManager.playMusic(config.audioName, false, 0.7);
        this.musicStartTime = Date.now();
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
        this.pausedMusicTime = AudioManager.getCurrentMusicTime();

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

    /** 准备下一句的按钮 */
    private prepareNextSentence() {
        const config = musicConfig_lv275;
        if (this.currentSentenceIndex >= config.sentences.length) {
            console.log(`所有句子都完成了`);
            return;
        }
        const sentence = config.sentences[this.currentSentenceIndex];
        const wordCount = sentence.words.length;
       
        for (let i = 0; i < 5; i++) {
            if (i < wordCount) {
                this.buttons[i].active = true;
                // 加载对应的文字图片
                this.loadButtonWordSprite(i, sentence.words[i]);
            } else {
                this.buttons[i].active = false;
            }
        }
        // 注意：角色动画的播放由update中的checkCharacterAnimation方法控制，不再根据按钮歌词切换
    }

    /** 加载按钮文字图片 */
    private loadButtonWordSprite(buttonIndex: number, word: string) {
        if (buttonIndex < 0 || buttonIndex >= this.buttonWordSprites.length) {
            return;
        }
        const sprite = this.buttonWordSprites[buttonIndex];
        if (!sprite) {
            return;
        }
        const wordPath = `picture_lv275/words/${word}`;
        AssetManager.load(
            GameData.curGameStyle,
            wordPath,
            cc.SpriteFrame,
            null,
            (spriteFrame: cc.SpriteFrame) => {
                if (spriteFrame && sprite && sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = spriteFrame;
                } else {
                    console.warn(`加载文字图片失败: ${wordPath}`);
                }
            }
        );
    }


    /** 准备所有谱子数据（按时间排序） */
    private prepareAllNotes() {
        const config = musicConfig_lv275;
        this.allNotes = [];

        // 收集所有句子中的所有音符
        config.sentences.forEach((sentence) => {
            sentence.notes.forEach((noteData) => {
                this.allNotes.push(noteData);
            });
        });

        // 按照时间排序（从早到晚）
        this.allNotes.sort((a, b) => a.time - b.time);

        console.log(`准备了 ${this.allNotes.length} 个谱子，按时间顺序排列`);
    }

    /** 生成谱子方块 */
    private generateNote(noteData: NoteData, generateTime: number) {
        // 检查是否已经生成过（去重）
        const timeKey = Math.floor(noteData.time * 1000) / 1000; // 精确到毫秒
        if (this.generatedNoteTimes.has(timeKey)) {
            return;
        }
        this.generatedNoteTimes.add(timeKey);

        if (!this.noteBlockPrefab) {
            console.error("noteBlockPrefab未设置");
            return;
        }
        const noteNode = cc.instantiate(this.noteBlockPrefab);
        noteNode.parent = this.bgNode;
        let noteBlock = noteNode.getComponent(NoteBlock_lv275);
        if (!noteBlock) {
            noteBlock = noteNode.addComponent(NoteBlock_lv275);
        }
        // 使用传入的生成时间，而不是当前音乐播放时间确保谱子移动时间计算准确
        const actualGenerateTime = generateTime;
        noteBlock.init(noteData, this.noteStartX, this.noteTargetX, actualGenerateTime);
        noteBlock.startMove();
        this.activeNotes.push(noteBlock);
        // 保存引用以便在销毁时移除
        const noteBlockRef = noteBlock;
        const self = this; // 保存dycgb_lv275实例的引用
        // 重写destroyNode方法，添加移除逻辑
        // 作用：当谱子被销毁时，自动从activeNotes数组中移除，避免内存泄漏和重复判定
        const originalDestroy = noteBlock.destroyNode.bind(noteBlock);
        noteBlock.destroyNode = function () {
            // 从活动列表中移除
            const index = self.activeNotes.indexOf(noteBlockRef);
            if (index >= 0) {
                self.activeNotes.splice(index, 1);
            }
            // 调用原始的销毁方法
            originalDestroy();
        };
    }

    /** 按钮点击事件 */
    private onButtonClick(event: cc.Event.EventTouch) {
        if (this.gameState !== GameState.PLAYING || GameData.PauseGame) {
            return;
        }

        const buttonNode = event.currentTarget;
        const buttonIndex = this.buttons.indexOf(buttonNode);
        if (buttonIndex < 0) return;
        // 播放按钮音效
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // 判定
        this.judgeNote(buttonIndex);
    }

    /** 判定谱子 */
    private judgeNote(buttonColorIndex: number) {
        if (!this.checkPoint) return;

        const checkPointX = this.checkPoint.position.x;

        // 第一步：找到所有在判定范围内的谱子
        const notesInRange: NoteBlock_lv275[] = [];
        for (let note of this.activeNotes) {
            if (note.isInJudgeRange(checkPointX)) {
                notesInRange.push(note);
            }
        }

        // 如果没有谱子在检查点，不检测（不扣血）
        if (notesInRange.length === 0) {
            return;
        }

        // 第二步：找到x值最小的谱子
        let nearestNote: NoteBlock_lv275 = null;
        let minX = Infinity;

        for (let note of notesInRange) {
            const noteX = note.node.position.x;
            if (noteX < minX) {
                minX = noteX;
                nearestNote = note;
            }
        }

        // 第三步：只判定距离最近的这一个谱子
        if (!nearestNote) {
            return;
        }

        // 检查颜色是否匹配
        if (nearestNote.noteData.color === buttonColorIndex) {
            // 颜色匹配，进行判定
            const result = nearestNote.judge(checkPointX);
            if (result === "perfect") {
                this.onPerfect(nearestNote);
            } else if (result === "great") {
                this.onGreat(nearestNote);
            }
            // result === null 表示不在判定范围内，不处理
        } else {
            // 颜色不匹配，判定为Miss
            // 显示Miss效果
            this.showJudgmentEffect("miss");
            
            this.onMiss();
            nearestNote.onMiss();
            this.checkIfAllNotesCompleted();
        }
    }

    /** 完美判定 */
    private onPerfect(note: NoteBlock_lv275) {
        // console.log("Perfect!")
        AudioManager.playEffect("perfectlv275");
        // 显示判定效果
        this.showJudgmentEffect("perfect");

        // 销毁谱子
        note.destroyNode();
        this.checkIfAllNotesCompleted();
    }

    /** 真棒判定 */
    private onGreat(note: NoteBlock_lv275) {
        AudioManager.playEffect("perfectlv275");
        // 显示判定效果
        this.showJudgmentEffect("great");
        
        // 销毁谱子
        note.destroyNode();
        this.checkIfAllNotesCompleted();
    }

    /** Miss判定 */
    private onMiss() {
        // console.log("Miss!");
        // 扣生命
        this.currentLives--;
        this.updateHearts();
        // 检查是否游戏失败
        if (this.currentLives <= 0) {
            this.onGameFailed();
        }else
        {
            AudioManager.playEffect("errorlv275");
        }
    }

    /** 更新爱心显示 */
    private updateHearts() {
        for (let i = 0; i < 3; i++) {
            const heartNode = this.hearts[i];
            if (i < this.currentLives) {
                // 有生命，显示红色完整
                this.setHeartState(heartNode, "full");
            } else {
                // 无生命，显示灰色裂开
                this.setHeartState(heartNode, "gray");
            }
        }
    }

    /** 设置爱心状态 */
    private setHeartState(heartNode: cc.Node, state: "full" | "cracked" | "gray") {
        // 假设爱心节点有3个子节点：full, cracked, gray
        const states = ["full", "cracked", "gray"];
        states.forEach(s => {
            const child = heartNode.getChildByName(s);
            if (child) {
                child.active = (s === state);
            }
        });
    }

    /** 游戏失败 */
    private onGameFailed() {
        // // 强制暂停游戏（不检查状态，直接暂停）
        // this.forcePauseGame();
        // // 设置为失败状态
        // this.gameState = GameState.FAILED;
          // 播放失败动画
        
        this.pauseGame();
        if (this.nanzhuSke) {
            this.nanzhuSke.playAnimation("daiji3", 1);
            this.currentAnimationState = "daiji3";
        }
        this.onlost();
    }

    /** 看广告复活 */
    public onRevive() {
        VideoManager.getInstance().showVideo(() => {
            // 广告观看成功
            this.currentLives = 3;
            this.updateHearts();
            this.bgNode.getChildByName(`zc_lostend`).active = false;
            this.bgNode.getChildByName(`bj`).active = true;
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
        });
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

        // 根据音乐时间生成谱子
        this.checkAndGenerateNotes();

        // 检查是否有谱子超过check_point需要销毁
        if (this.checkPoint) {
            const checkPointX = this.checkPoint.position.x;
            const notesToRemove: NoteBlock_lv275[] = [];

            this.activeNotes.forEach(note => {
                if (note.hasPassedCheckPoint(checkPointX) && !note.isJudged) {
                    // 谱子已经完全离开check_point且未被判定，判定为Miss
                    notesToRemove.push(note);
                }
            });

            notesToRemove.forEach(note => {
                // 先标记为已判定，避免重复扣血
                note.isJudged = true;
                
                // 显示Miss效果
                this.showJudgmentEffect("miss");
                
                // 扣血（调用主游戏的onMiss方法）
                this.onMiss();
                // 销毁节点
                note.destroyNode();
                this.checkIfAllNotesCompleted();
        
            });
        }

        // 检查是否需要切换到下一句
        this.checkNextSentence();

        // 检查并更新角色动画
        this.checkCharacterAnimation();
    }

    /** 根据音乐时间检查并生成谱子 */
    private checkAndGenerateNotes() {
        if (this.allNotes.length === 0 || this.currentNoteIndex >= this.allNotes.length) {
            return; // 没有谱子或已经全部生成完毕
        }

        // 获取当前音乐播放时间（实际播放时间）
        const currentMusicTime = AudioManager.getCurrentMusicTime();

        // 从当前索引开始检查，看是否有需要生成的谱子
        while (this.currentNoteIndex < this.allNotes.length) {
            const noteData = this.allNotes[this.currentNoteIndex];
            // 计算这个谱子应该生成的时间（应用时间缩放）
            // 如果配置了generateTime，使用配置的时间；否则使用到达时间减去提前生成时间
            const generateTime = noteData.generateTime !== undefined
                ? noteData.generateTime * TIME_SCALE  
                : (noteData.time * TIME_SCALE) - this.NOTE_PRE_GENERATE_TIME;  
            // 如果当前音乐时间已经到了或超过了生成时间，就生成这个谱子
            if (currentMusicTime >= generateTime) {
                this.generateNote(noteData, generateTime);
                this.currentNoteIndex++; // 移动到下一个谱子
            } else {
                // 如果当前谱子还没到生成时间，后面的更不会到（因为已经排序了）
                break;
            }
        }
    }

    /** 检查并更新角色动画 */
    private checkCharacterAnimation() {
        if (!this.nanzhuSke || this.gameState === GameState.FAILED||this.gameState === GameState.PAUSED) {
            return; // 失败状态不检查（失败动画由onGameFailed控制）
        }

        const config = musicConfig_lv275;
        const currentMusicTime = AudioManager.getCurrentMusicTime();
        // 检查是否在说话时间段内（应用时间缩放）
        let isInSpeakTime = false;
        if (config.speakTimeRanges && config.speakTimeRanges.length > 0) {
            for (let range of config.speakTimeRanges) {
                const scaledStartTime = range.startTime * TIME_SCALE;
                const scaledEndTime = range.endTime * TIME_SCALE;
                if (currentMusicTime >= scaledStartTime && currentMusicTime <= scaledEndTime) {
                    isInSpeakTime = true;
                    break;
                }
            }
        }

        // 根据时间段播放对应动画
        if (isInSpeakTime) {
            // 在说话时间段内，播放daiji2
            if (this.currentAnimationState !== "daiji2") {
                this.nanzhuSke.playAnimation("daiji2", 0);
                this.currentAnimationState = "daiji2";
            }
        } else {
            // 不在说话时间段内，播放daiji1
            if (this.currentAnimationState !== "daiji1") {
                this.nanzhuSke.playAnimation("daiji1", 0);
                this.currentAnimationState = "daiji1";
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
        const imagePath = `picture_lv275/pic/${imageName}`;
        
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
    
    /** 检查是否需要切换到下一句 */
    private checkNextSentence() {
        const config = musicConfig_lv275;
        if (this.currentSentenceIndex >= config.sentences.length - 1) {
            return; // 已经是最后一句
        }
        const nextSentence = config.sentences[this.currentSentenceIndex + 1];
        const currentMusicTime = AudioManager.getCurrentMusicTime();
        // 获取下一句的开始时间（如果有startTime字段则使用，否则使用第一个音符的时间）
        let nextSentenceStartTime: number;
        if (nextSentence.startTime !== undefined) {
            nextSentenceStartTime = nextSentence.startTime * TIME_SCALE; 
        } else if (nextSentence.notes && nextSentence.notes.length > 0) {
            // 如果没有startTime，使用第一个音符的时间作为句子开始时间
            nextSentenceStartTime = nextSentence.notes[0].time * TIME_SCALE;  
        } else {
            return;
        }

        // 如果时间接近下一句开始时间，提前0.5秒准备下一句的按钮
        if (currentMusicTime >= nextSentenceStartTime - 0.5) {
            // 准备下一句
            this.currentSentenceIndex++;
            this.prepareNextSentence();
        }
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

    onlost() {
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            this.bgNode.getChildByName(`bj`).active=false;
            const lostNode = this.bgNode.getChildByName(`zc_lostend`);
            if (lostNode) {
                lostNode.setSiblingIndex(-1);
                lostNode.active = true;
                lostNode.getComponent(zc_lost_lv275).playlost();
            }
           
        }, 1);
    }

    onwin() {
        this.scheduleOnce(() => {
            AudioManager.stopMusic();
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
    }
}
