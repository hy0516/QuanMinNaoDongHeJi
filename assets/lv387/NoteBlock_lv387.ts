import { NoteData, NoteSide, TIME_SCALE } from "./musicData_lv387";
import AssetManager from "../script/common/AssetManager";
import GameData from "../script/common/GameData";

const { ccclass, property } = cc._decorator;

/**
 * 谱子方块组件
 * 负责谱子方块的移动和判定
 */
@ccclass
export default class NoteBlock_lv387 extends cc.Component {
    private static readonly PERFECT_RANGE = 55;
    private static readonly GREAT_RANGE = 105;
    private static readonly NOTE_STYLE_NAMES = ["green", "red", "blue"];

    /** 音符数据 */
    public noteData: NoteData = null;

    /** 节拍左右方向 */
    public noteSide: NoteSide = "left";

    /** 目标位置（check_point的Y） */
    private targetY: number = 0;

    /** 起始位置 */
    private startY: number = 0;

    /** 移动持续时间（秒） */
    private moveDuration: number = 0;

    /** 是否已经判定过 */
    public isJudged: boolean = false;

    /** 是否正在移动 */
    private isMoving: boolean = false;

    /** 移动速度（像素/秒） */
    private moveSpeedY: number = 0;

    /** 最终目标Y坐标（让谱子完全离开判定线） */
    private finalY: number = 0;

    /** 当前样式名 */
    private noteStyleName: string = "green";

    /**
     * 初始化谱子方块
     * @param noteData 音符数据
     * @param startPosition 起始坐标
     * @param targetY 目标Y坐标（check_point位置）
     * @param generateTime 生成时间（当前音乐播放时间）
     */
    public init(noteData: NoteData, startPosition: cc.Vec2, targetY: number, generateTime: number) {
        this.noteData = noteData;
        this.noteSide = noteData.side || "left";
        this.targetY = targetY;
        this.startY = startPosition.y;

        // 设置初始位置
        this.node.setPosition(startPosition);

        // 计算移动持续时间（应用时间缩放）
        const arriveTime = noteData.time * TIME_SCALE;
        this.moveDuration = Math.max(0.1, arriveTime - generateTime);

        this.setRandomStyle();

        this.isJudged = false;
        this.isMoving = false;
        this.node.opacity = 255;
    }

    /**
     * 获取目标位置（checkPoint位置）
     */
    public getDistanceToCheckPoint(checkPointY: number): number {
        return Math.abs(this.node.position.y - checkPointY);
    }

    /**
     * 开始移动
     */
    public startMove() {
        if (this.isMoving) return;

        const nodeHeight = this.node.getContentSize().height;
        const startY = this.node.position.y;
        this.finalY = this.targetY - nodeHeight;
        const totalDistance = Math.abs(this.finalY - startY);
        this.moveSpeedY = -Math.abs(totalDistance / this.moveDuration);

        this.isMoving = true;
    }

    /**
     * 暂停移动
     */
    public pauseMove() {
        this.isMoving = false;
    }
    
    /**
     * 恢复移动
     */
    public resumeMove() {
        if (!this.isMoving && this.node && this.node.isValid) {
            if (this.moveSpeedY === 0) {
                const nodeHeight = this.node.getContentSize().height;
                this.finalY = this.targetY - nodeHeight;
                const totalDistance = Math.abs(this.finalY - this.startY);
                this.moveSpeedY = -Math.abs(totalDistance / this.moveDuration);
            }
            this.isMoving = true;
        }
    }

    /**
     * 每帧更新，手动控制位移
     */
    protected update(dt: number): void {
        if (this.isMoving && this.node && this.node.isValid) {
            const currentY = this.node.position.y;
            const newY = currentY + this.moveSpeedY * dt;

            if (this.moveSpeedY < 0 && newY <= this.finalY) {
                this.node.setPosition(this.node.position.x, this.finalY);
                this.isMoving = false;
            } else {
                this.node.setPosition(this.node.position.x, newY);
            }
        }
    }

    /**
     * 随机设置节拍样式
     */
    private setRandomStyle() {
        const randomIndex = Math.floor(Math.random() * NoteBlock_lv387.NOTE_STYLE_NAMES.length);
        this.noteStyleName = NoteBlock_lv387.NOTE_STYLE_NAMES[randomIndex];
        this.setSpriteFrame(`picture_lv387/notes/note_${this.noteStyleName}`);
    }

    private setSpriteFrame(path: string, callback?: Function) {
        const sprite = this.node.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }

        AssetManager.load(
            GameData.curGameStyle,
            path,
            cc.SpriteFrame,
            null,
            (spriteFrame: cc.SpriteFrame) => {
                if (spriteFrame && sprite && sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = spriteFrame;
                    if (callback) {
                        callback();
                    }
                } else {
                    console.warn(`[NoteBlock_lv387] 加载谱子图片失败: ${path}`);
                }
            }
        );
    }

    /**
     * 获取当前是否在判定范围内
     * @param checkPointY check_point的Y坐标
     * @returns 是否在判定范围内
     */
    public isInJudgeRange(checkPointY: number): boolean {
        return this.getDistanceToCheckPoint(checkPointY) <= NoteBlock_lv387.GREAT_RANGE;
    }

    /**
     * 获取判定结果
     * @param checkPointY check_point的Y坐标
     * @returns "perfect" | "great" | "miss" | null（不在范围内）
     */
    public judge(checkPointY: number): "perfect" | "great" | "miss" | null {
        if (this.isJudged) return null;

        const distance = this.getDistanceToCheckPoint(checkPointY);
        if (distance <= NoteBlock_lv387.PERFECT_RANGE) {
            return "perfect";
        } else if (distance <= NoteBlock_lv387.GREAT_RANGE) {
            return "great";
        }

        return "miss";
    }

    public onHit() {
        if (this.isJudged) return;
        this.isJudged = true;
        this.setSpriteFrame(`picture_lv387/notes/note_${this.noteStyleName}_1`);
        cc.tween(this.node)
            .to(1, { opacity: 0 })
            .call(() => {
                this.destroyNode();
            })
            .start();
    }

    /**
     * Miss判定
     */
    public onMiss() {
        if (this.isJudged) return;
        this.isJudged = true;
        this.destroyNode();
    }

    /**
     * 销毁节点
     */
    public destroyNode() {
        this.isMoving = false;
        if (this.node && this.node.isValid) {
            this.node.destroy();
        }
    }

    /**
     * @param checkPointY check_point的Y坐标
     * @returns 是否已经完全离开
     */
    public hasPassedCheckPoint(checkPointY: number): boolean {
        return this.node.position.y < checkPointY - NoteBlock_lv387.GREAT_RANGE;
    }

    protected onDestroy(): void {
        this.isMoving = false;
    }
}

