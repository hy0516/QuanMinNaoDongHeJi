
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import shj_lv271 from "./shj_lv271";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mh_huaitem_lv271 extends cc.Component {

    // 其他三个盲盒节点（用于点击时隐藏）
    private otherBoxes: cc.Node[] = [];

    // tzd 和 lalian 节点
    private tzdNode: cc.Node = null;
    private lalianNode: cc.Node = null;

    // tzd 的初始宽度（用于限制向左滑动）
    private initialTzdWidth: number = 0;

    // 当前 tzd 的宽度
    private currentTzdWidth: number = 0;

    // 目标宽度（当达到300时触发事件）
    private targetWidth: number = 300;

    // 是否正在拖拽
    private isDragging: boolean = false;

    // 是否已经触发过到达300的事件
    private hasReachedTarget: boolean = false;

    // 初始位置（用于移动到中心后可能需要的恢复）
    private initialPosition: cc.Vec3 = null;

    // 是否已经移动到中心
    private isMovedToCenter: boolean = false;

    // lalian 节点的初始 x 位置
    private initialLalianX: number = 0;

    // lalian向右滑动音效相关变量
    private lalianSlideSoundName: string = "撕盲袋lv271"; // lalian向右滑动音效文件名（待设置）
    private isPlayingSlideSound: boolean = false; // 是否正在播放滑动音效
    private isSlidingRight: boolean = false; // 是否正在向右滑动

    mainNode:cc.Node;//游戏主脚本Node

    protected onLoad(): void {
        this.mainNode = this.node.parent.parent;
        // 保存初始位置
        this.initialPosition = this.node.position.clone();

        // 检查是否已观看过广告，如果已观看则直接销毁广告节点
        this.checkAndDestroyAdIfWatched();

        // 获取 tzd 和 lalian 节点
        this.tzdNode = this.node.getChildByName("tzd");
        this.lalianNode = this.node.getChildByName("lalian");

        if (!this.tzdNode) {
            console.error(`节点 ${this.node.name} 未找到 tzd 子节点`);
            return;
        }

        if (!this.lalianNode) {
            console.error(`节点 ${this.node.name} 未找到 lalian 子节点`);
            return;
        }

        // 记录 tzd 的初始宽度
        this.initialTzdWidth = this.tzdNode.width;
        this.currentTzdWidth = this.initialTzdWidth;

        // 记录 lalian 节点的初始 x 位置
        this.initialLalianX = this.lalianNode.x;

        // 获取其他三个盲盒节点
        this.findOtherBoxes();

        // 注册点击事件
        this.node.on(cc.Node.EventType.TOUCH_END, this.onBoxClick, this);

        // 注册 lalian 的触摸事件
        this.lalianNode.on(cc.Node.EventType.TOUCH_START, this.onLalianTouchStart, this);
        this.lalianNode.on(cc.Node.EventType.TOUCH_MOVE, this.onLalianTouchMove, this);
        this.lalianNode.on(cc.Node.EventType.TOUCH_END, this.onLalianTouchEnd, this);
        this.lalianNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onLalianTouchEnd, this);
    }

    /**
     * 查找其他三个盲盒节点
     */
    private findOtherBoxes(): void {
        const parent = this.node.parent;
        if (!parent) return;

        // 获取所有子节点，排除当前节点
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            // 假设其他盲盒的名字是 "01", "02", "03", "04"
            if (child !== this.node && (child.name === "01" || child.name === "02" || child.name === "03" || child.name === "04")) {
                this.otherBoxes.push(child);
            }
        }
    }

    /**
     * 点击盲盒时的处理
     */
    private onBoxClick(event: cc.Event.EventTouch): void {
        if (GameData.PauseGame) return;
        
        // 检查是否允许点击盲盒（在动画执行期间禁止点击）
        const mainScript = this.mainNode.getComponent(shj_lv271);
        if (mainScript && !mainScript.canClickBox) {
            return;
        }
        
        const luxiangNode = this.node.getChildByName(`luxiang`);
        if(luxiangNode)
        {
            VideoManager.getInstance().showVideo(() => {
                // 广告播放完成后，保存已观看状态到 localStorage
                this.saveAdWatchedStatus();
                luxiangNode.destroy();
                return;
            });
            return;
        }
        // 如果已经移动到中心，不再处理点击
        if (this.isMovedToCenter) return;

        AudioManager.playEffect(AudioManager.common.BUTTON);

        this.hideOtherBoxes();

        this.moveToCenter();
    }

    /**
     * 隐藏其他三个盲盒
     */
    private hideOtherBoxes(): void {
        for (let i = 0; i < this.otherBoxes.length; i++) {
            if (this.otherBoxes[i] && cc.isValid(this.otherBoxes[i])) {
                this.otherBoxes[i].active = false;
                this.otherBoxes[i].position = this.initialPosition.clone();
            }
        }
    }

    /**
     * 移动当前盲盒到屏幕中心
     */
    private moveToCenter(): void {
        // 停止所有正在进行的tween
        cc.Tween.stopAllByTarget(this.node);

        // tween到中心位置 (x=0, y=0)
        cc.tween(this.node)
            .to(0.5, { position: cc.v3(0, 0, 0),scale:this.node.scale*1.5})
            .call(() => {
                // 移动完成后的回调
                this.onMoveToCenterComplete();

            })
            .start();
    }

    /**
     * 移动到中心完成后的回调
     */
    private onMoveToCenterComplete(): void {
        // 可以在这里添加移动完成后的逻辑
        console.log(`盲盒 ${this.node.name} 已移动到中心`);
        this.isMovedToCenter = true;
    }

    /**
     * lalian 触摸开始
     */
    private onLalianTouchStart(event: cc.Event.EventTouch): void {
        if (GameData.PauseGame) return;
        if (!this.isMovedToCenter) return; // 只有移动到中心后才能滑
        this.isDragging = true;
        event.stopPropagation(); // 阻止事件冒泡，避免触发盲盒点击
    }


    private onLalianTouchMove(event: cc.Event.EventTouch): void {
        if (GameData.PauseGame || !this.isDragging || !this.isMovedToCenter) return;
        const delta = event.getDelta();
        const deltaX = delta.x/this.node.scale;
        this.isSlidingRight = deltaX > 0;
        // 如果向右滑动且音效未播放，则播放音效
        if (this.isSlidingRight && !this.isPlayingSlideSound && this.lalianSlideSoundName) {
            this.playSlideSound();
        }
        
        const newLalianX = this.lalianNode.x + deltaX;
        const maxLalianX = this.initialLalianX + this.targetWidth;
        this.lalianNode.x = Math.max(this.initialLalianX, Math.min(maxLalianX, newLalianX));

      
        const lalianMoveDistance = this.lalianNode.x - this.initialLalianX;
        
       
        this.currentTzdWidth = this.initialTzdWidth + lalianMoveDistance;

        if (this.tzdNode) {
            this.tzdNode.width = this.currentTzdWidth;
            this.tzdNode.children[0].width = this.tzdNode.width ;
        }

        // 检查是否达到目标宽度 300
        if (this.currentTzdWidth >= this.targetWidth && !this.hasReachedTarget) {
            this.hasReachedTarget = true;
            this.onLalianTouchEnd(event);
            this.onTzdWidthReachTarget();
        } else if (this.currentTzdWidth < this.targetWidth) {
            this.hasReachedTarget = false;
        }
    }


    private onLalianTouchEnd(event?: cc.Event.EventTouch): void {
        this.isDragging = false;
        this.isSlidingRight = false; // 重置滑动状态
    }
    
    /**
     * 播放lalian向右滑动音效
     */
    private playSlideSound(): void {
        if (!this.lalianSlideSoundName || this.isPlayingSlideSound) return;
        
        this.isPlayingSlideSound = true;
        
        AudioManager.playEffect(this.lalianSlideSoundName, false, () => {
            // 音效播放完成后的回调
            this.isPlayingSlideSound = false;
            
            // // 检查是否还在向右滑动，如果是则继续播放
            // if (this.isSlidingRight && this.isDragging) {
            //     this.playSlideSound();
            // }
        });
    }


    private onTzdWidthReachTarget(): void {
        console.log(`tzd 宽度已达到目标值 ${this.targetWidth}`);
        AudioManager.playEffect("拼图爆出lv271");
        if (this.lalianNode) {
            this.lalianNode.off(cc.Node.EventType.TOUCH_START, this.onLalianTouchStart, this);
            this.lalianNode.off(cc.Node.EventType.TOUCH_MOVE, this.onLalianTouchMove, this);
            this.lalianNode.off(cc.Node.EventType.TOUCH_END, this.onLalianTouchEnd, this);
            this.lalianNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onLalianTouchEnd, this);
        }
        cc.tween(this.node).to(0.6,{opacity:0}).call(()=>{
            this.node.active=false;
        }).start();
       
        //弹出对应碎片拼图Node
        this.mainNode.getComponent(shj_lv271).showPuzz(this.node.name);

    }


    /**
     * 获取广告观看状态的 localStorage key
     */
    private getAdWatchedKey(): string {
        return `lv271_ad_watched_${this.node.name}`;
    }

    /**
     * 检查是否已观看过广告
     */
    private hasWatchedAd(): boolean {
        const key = this.getAdWatchedKey();
        const value = cc.sys.localStorage.getItem(key);
        return value === "true";
    }

    /**
     * 保存广告已观看状态到 localStorage
     */
    private saveAdWatchedStatus(): void {
        const key = this.getAdWatchedKey();
        cc.sys.localStorage.setItem(key, "true");
    }

    /**
     * 检查并销毁已观看的广告节点
     */
    private checkAndDestroyAdIfWatched(): void {
        if (this.hasWatchedAd()) {
            const luxiangNode = this.node.getChildByName(`luxiang`);
            if (luxiangNode) {
                luxiangNode.destroy();
            }
        }
    }

    protected onDestroy(): void {
        if (this.node) {
            this.node.off(cc.Node.EventType.TOUCH_END, this.onBoxClick, this);
        }

       
    }
}

