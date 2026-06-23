import AssetManager from "../script/common/AssetManager";
import GameData from "../script/common/GameData";
import { NoteData, TIME_SCALE } from "./musicData_lv452";

const { ccclass, property } = cc._decorator;

/**
 * 谱子方块组件
 * 负责谱子方块的移动和判定
 */
@ccclass
export default class NoteBlock_lv452 extends cc.Component {
    
    /** 音符数据 */
    public noteData: NoteData = null;
    
    /** 目标位置（check_point的位置） */
    private targetX: number = 0;
    
    /** 起始位置 */
    private startX: number = 0;
    
    /** 移动持续时间（秒） */
    private moveDuration: number = 0;
    
    /** 是否已经判定过 */
    public isJudged: boolean = false;
    
    /** 是否正在移动 */
    private isMoving: boolean = false;
    
    /** 移动速度（像素/秒） */
    private moveSpeed: number = 0;
    
    /** 最终目标X坐标（让谱子完全离开checkPoint） */
    private finalX: number = 0;
    
    /**
     * 初始化谱子方块
     * @param noteData 音符数据
     * @param startX 起始X坐标（屏幕右侧）
     * @param targetX 目标X坐标（check_point位置）
     * @param generateTime 生成时间（当前音乐播放时间）
     */
    public init(noteData: NoteData, startX: number, targetX: number, generateTime: number) {
        this.noteData = noteData;
        this.targetX = targetX;
        this.startX = startX; // 保存起始位置
        
        // 设置初始位置
        this.node.setPosition(startX, this.node.position.y);
        
        // 计算移动持续时间（应用时间缩放）
        // generateTime 已经是缩放后的时间，noteData.time 也需要缩放
        const arriveTime = noteData.time * TIME_SCALE;  // 应用缩放
        this.moveDuration = Math.max(0.1, arriveTime - generateTime); // 至少0.1秒
        
        // 根据方向加载提示箭头贴图。
        this.setDirectionSprite(noteData.direction);

        const labelNode = this.node.getChildByName("label");
        if (labelNode) {
            const label = labelNode.getComponent(cc.Label);
            if (label) {
                label.string = "";
            }
        }

        this.isJudged = false;
        this.isMoving = false;
    }
    
    /**
     * 获取目标位置（checkPoint位置）
     */
    public getTargetX(): number {
        return this.targetX;
    }
    
    /**
     * 开始移动
     */
    public startMove() {
        if (this.isMoving) return;
        
        const nodeWidth = this.node.getContentSize().width;
        const startX = this.node.position.x;
        const originalDistance = Math.abs(this.targetX - startX);
        const speed = originalDistance / this.moveDuration;
        this.finalX = this.targetX - nodeWidth;
        const totalDistance = Math.abs(this.finalX - startX);
        
        // 计算移动速度（像素/秒）
        // 由于是从右往左移动，速度应该是负值
        this.moveSpeed = -Math.abs(totalDistance / this.moveDuration);
        
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
            // 如果还没有计算过速度，重新计算
            if (this.moveSpeed === 0) {
                const nodeWidth = this.node.getContentSize().width;
                const currentX = this.node.position.x;
                this.finalX = this.targetX - nodeWidth;
                const totalDistance = Math.abs(this.finalX - this.startX);
                this.moveSpeed = -Math.abs(totalDistance / this.moveDuration);
            }
            this.isMoving = true;
        }
    }
    
    /**
     * 每帧更新，手动控制位移
     */
    protected update(dt: number): void {
        if (this.isMoving && this.node && this.node.isValid) {
            const currentX = this.node.position.x;
            const newX = currentX + this.moveSpeed * dt;
            
            // 检查是否已经到达或超过目标位置
            if (this.moveSpeed < 0 && newX <= this.finalX) {
                // 从右往左移动，到达目标位置
                this.node.setPosition(this.finalX, this.node.position.y);
                this.isMoving = false;
            } else {
                // 继续移动
                this.node.setPosition(newX, this.node.position.y);
            }
        }
    }
    
    /**
     * 设置方向箭头（加载对应的图片）
     * @param directionIndex 方向索引 0-3（左、上、右、下）
     */
    private setDirectionSprite(directionIndex: number) {
        const sprite = this.node.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }

        const directionSymbols = ["←", "↑", "→", "↓"];
        if (directionIndex < 0 || directionIndex >= directionSymbols.length) {
            return;
        }

        const symbol = directionSymbols[directionIndex];
        const notePath = `picture_lv452/words/${symbol}`;

        AssetManager.load(
            GameData.curGameStyle,
            notePath,
            cc.SpriteFrame,
            null,
            (spriteFrame: cc.SpriteFrame) => {
                if (spriteFrame && sprite && sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = spriteFrame;
                }
            }
        );
    }
    
    /**
     * 获取当前是否在判定范围内（check_point是否在谱子范围内）
     * @param checkPointX check_point的X坐标
     * @returns 是否在判定范围内
     */
    public isInJudgeRange(checkPointX: number): boolean {
        const nodeX = this.node.position.x;
        const nodeWidth = this.node.getContentSize().width;
        
        // 判断check_point是否在谱子范围内（谱子中心 ± 1/2 宽度）
        const nodeLeft = nodeX - nodeWidth / 2;
        const nodeRight = nodeX + nodeWidth / 2;
        
        return checkPointX >= nodeLeft && checkPointX <= nodeRight;
    }
    
    /**
     * 获取判定结果
     * @param checkPointX check_point的X坐标
     * @returns "perfect" | "great" | "miss" | null（不在范围内）
     */
    public judge(checkPointX: number): "perfect" | "great" | "miss" | null {
        if (this.isJudged) return null;
        
        const nodeX = this.node.position.x; 
        const nodeWidth = this.node.getContentSize().width;
        const distance = Math.abs(checkPointX - nodeX); 
        const perfectRange = nodeWidth / 2; 
        const greatRange = nodeWidth / 1; 
        
        // 完美：判定点在谱子中心点的 ±1/4 宽度范围内
        if (distance <= perfectRange) {
            this.isJudged = true;
            return "perfect";
        } 
        // 真棒：判定点在谱子范围内，但不在完美范围内
        else if (distance <= greatRange) {
            this.isJudged = true;
            return "great";
        }
        
        // 不在范围内
        return null;
    }
    
    /**
     * Miss判定
     */
    public onMiss() {
        if (this.isJudged) return;
        this.isJudged = true;
        // 销毁节点
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
     * @param checkPointX check_point的X坐标
     * @returns 是否已经完全离开
     */
    public hasPassedCheckPoint(checkPointX: number): boolean {
        const nodeX = this.node.position.x;
        const nodeWidth = this.node.getContentSize().width;
        const rightEdge = nodeX + nodeWidth / 2;
        return rightEdge < checkPointX;
    }
    
    protected onDestroy(): void {
        this.isMoving = false;
    }
}

