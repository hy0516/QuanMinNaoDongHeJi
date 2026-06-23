import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import bxj_lv356 from "./bxj_lv356";

const { ccclass, property } = cc._decorator;

/**
 * 滑动激活：在挂载节点上滑动，x 位移达到阈值后激活指定 Node(s)，并销毁自身
 * 使用：挂到 huaNode 等需滑动检测的节点，配置 targets、threshold
 */
@ccclass
export default class SwipeActivate356 extends cc.Component {

    @property([cc.Node])
    targets: cc.Node[] = [];

    @property({ tooltip: "滑动 x 位移阈值（像素）" })
    threshold: number = 20;

    private startX: number = 0;
    private touched: boolean = false;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private canSwipe(): boolean {
        return !GameData.PauseGame && !bxj_lv356.isInDialogue;
    }

    onTouchStart(e: cc.Event.EventTouch) {
        if (!this.canSwipe()) return;
        this.touched = true;
        this.startX = e.getLocationX();
    }

    onTouchMove(e: cc.Event.EventTouch) {
        if (!this.touched || !this.canSwipe()) return;
        const dx = e.getLocationX() - this.startX;
        if (Math.abs(dx) >= this.threshold) {
            this.activateAndDestroy();
        }
    }

    onTouchEnd() {
        this.touched = false;
    }

    private activateAndDestroy() {
        this.touched = false;
        AudioManager.playEffect("打开衣柜-窗户");
        for (const t of this.targets) {
            if (t && cc.isValid(t)) t.active = true;
        }
        this.node.destroy();
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
