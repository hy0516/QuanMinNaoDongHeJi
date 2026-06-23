import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";

const { ccclass, property } = cc._decorator;

/**
 * lv356 通用可拖动物品组件
 * 拖到目标 Node 上松手时触发 moveHandler(type, target, event)
 * 使用：挂到可拖动物品上，配置 main、type、targets，关卡中调用 enableAllDragItems 启用
 */
@ccclass
export default class DragItem356 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

    @property(cc.Node)
    main: cc.Node = null;

    @property([cc.Node])
    targets: cc.Node[] = [];

    @property({ tooltip: "匹配后是否隐藏物品" })
    hideOnMatch: boolean = true;

    @property({ tooltip: "匹配后是否销毁物品" })
    destroyOnMatch: boolean = false;

    @property({ tooltip: "检测范围缩放，>1 放宽判定" })
    hitScale: number = 1;

    startPoi: cc.Vec2 = null;
    startZIndex: number = 0;
    startSiblingIndex: number = 0;
    private touchEnabled: boolean = false;

    onLoad() {
        this.startPoi = this.node.getPosition();
        this.startZIndex = this.node.zIndex;
    }

    /** 启用拖动（在关卡 onLoad 或合适时机调用） */
    enable() {
        if (this.touchEnabled) return;
        this.touchEnabled = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        const btn = this.node.getComponent(cc.Button);
        if (btn) btn.enabled = false;
    }

    disable() {
        if (!this.touchEnabled) return;
        this.touchEnabled = false;
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private isInDialogue(): boolean {
        const comp = this.main ? this.main.getComponent("bxj_lv356") : null;
        return comp && (comp.constructor as any).isInDialogue === true;
    }

    onTouchStart() {
        if (GameData.PauseGame || this.isInDialogue()) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.startZIndex = this.node.zIndex;
        this.startSiblingIndex = this.node.getSiblingIndex();
        this.node.zIndex = 100;
    }

    onTouchMove(even: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isInDialogue()) return;
        const delta = even.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;
    }

    onTouchEnd(even: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isInDialogue()) return;
        const target = this.checkHitTarget();
        if (target && target.active) {
            const base = this.main ? this.main.getComponent(BaseGame) : null;
            let accept = true;
            if (base && typeof (base as any).moveHandler === "function") {
                (base as any).moveHandler(this.type, target, even, (ok: boolean) => {
                    if (ok === false) accept = false;
                }, this);
            }
            if (accept) {
                this.disable();
                if (this.destroyOnMatch) {
                    this.node.destroy();
                } else if (this.hideOnMatch) {
                    this.node.active = false;
                }
            } else {
                this.reset();
            }
        } else {
            this.node.setPosition(this.startPoi);
            this.node.zIndex = this.startZIndex;
            this.node.setSiblingIndex(this.startSiblingIndex);
        }
    }

    private checkHitTarget(): cc.Node | null {
        const itemRect = this.getWorldRect(this.node);
        for (const t of this.targets) {
            if (!t || !cc.isValid(t)) continue;
            const tr = this.getWorldRect(t);
            if (cc.Intersection.rectRect(itemRect, tr)) return t;
        }
        return null;
    }

    private getWorldRect(n: cc.Node): cc.Rect {
        const wp = n.convertToWorldSpaceAR(cc.v2(0, 0));
        const cs = n.getContentSize();
        const w = cs.width * n.scaleX * this.hitScale;
        const h = cs.height * n.scaleY * (n === this.node ? this.hitScale : 1);
        return cc.rect(wp.x - w / 2, wp.y - h / 2, w, h);
    }

    reset() {
        this.node.setPosition(this.startPoi);
        this.node.zIndex = this.startZIndex;
        this.node.setSiblingIndex(this.startSiblingIndex);
        this.node.active = true;
    }

    onDestroy() {
        this.disable();
    }
}
