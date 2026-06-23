import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";

const { ccclass } = cc._decorator;

/** 由 tz_lv440 注入，extends cc.Component 以便 cc.isValid(this.main.node) */
export interface Tz440MainHost extends cc.Component {
    onStickerPlaced(): void;
    /** 揭晓 FX 完成后、销毁碎片前：用于各层进度（如小关通关音效） */
    onStickerLayerPiecePlaced(layerRootName: string): void;
    hideLvquanTipsOutlineHint(): void;
    /** 开局新手引导：触摸当前高亮的首个托盘碎片时解除引导 UI */
    tryClearNewbieGuideOnTouch(trayItemNode: cc.Node): boolean;
    /** 槽位揭晓表现（例如 03 实验）；完成后必须调用 onComplete */
    runStickerRevealFxIfNeeded(slot: cc.Node | null, onComplete: () => void): void;
}

/**
 * lv440：底部 ScrollView.content 内的碎片拖拽，对齐 tzarea 下与碎片同名的槽位；
 * 若有外层容器（如 bgcopy），槽位名以首子节点名为准；移动在 content 本地坐标下换算。
 */
@ccclass
export default class moveitem_lv440 extends cc.Component {

    private isTouch: boolean = false;
    /** 已向任意方向真正开始拖动（区别于轻点未移动） */
    private dragBegun: boolean = false;

    main: Tz440MainHost = null;
    tzarea: cc.Node = null;
    bottomScroll: cc.ScrollView = null;

    private targetSlot: cc.Node = null;
    private startLocalPos: cc.Vec2 = cc.v2();
    private curScaleValue: number = 1;
    /** 实际做拖起放大/松手缩回的节点：有子节点时为首个子节点（外层 bgcopy 仅排版），否则为挂载节点本身 */
    private scaleTarget: cc.Node = null;

    /** 拖起时缩放 */
    dragScaleValue: number = 1;

    /** 松手判定：锚点在世界坐标中与槽位锚点的最大允许偏差（像素，欧氏距离） */
    placeTolerancePx: number = 40;

    private touchBound: boolean = false;
    /** content 横向 Layout 会与手动改 x 冲突，拖拽期间关掉 */
    private trayLayout: cc.Layout = null;
    /** view 遮罩拖拽时关掉，否则会裁切拖出区域的碎片 */
    private trayViewMask: cc.Mask = null;

    /** 所属贴纸层节点名，如 lv1 / lv2，供小关统计 */
    private stickerLayerRootName: string = "lv1";

    bind(
        main: Tz440MainHost,
        tzarea: cc.Node,
        bottomScroll: cc.ScrollView,
        placeTolerancePx?: number,
        layerRootName?: string
    ): void {
        this.main = main;
        this.tzarea = tzarea;
        this.bottomScroll = bottomScroll;
        this.stickerLayerRootName = layerRootName && layerRootName.length > 0 ? layerRootName : "lv1";
        if (placeTolerancePx != null && placeTolerancePx >= 0) {
            this.placeTolerancePx = placeTolerancePx;
        }
        this.scaleTarget = this.node.childrenCount > 0 ? this.node.children[0] : this.node;
        this.curScaleValue = this.scaleTarget && cc.isValid(this.scaleTarget) ? this.scaleTarget.scale : this.node.scale;
        const p = this.node.position;
        this.startLocalPos = cc.v2(p.x, p.y);

        const tray = this.node.parent;
        this.trayLayout = tray ? tray.getComponent(cc.Layout) : null;

        let viewNd: cc.Node = null;
        if (bottomScroll && bottomScroll.content && bottomScroll.content.parent) {
            viewNd = bottomScroll.content.parent;
        } else if (bottomScroll && bottomScroll.node) {
            viewNd = bottomScroll.node.getChildByName("view");
        }
        this.trayViewMask = viewNd ? viewNd.getComponent(cc.Mask) : null;

        const pieceName = this.scaleTarget && cc.isValid(this.scaleTarget) ? this.scaleTarget.name : this.node.name;
        const slot = tzarea ? tzarea.getChildByName(pieceName) : null;
        this.targetSlot = slot && cc.isValid(slot) ? slot : null;
        if (!this.targetSlot) {
            cc.error("[moveitem_lv440] tzarea 下未找到与碎片同名的槽位:", pieceName);
        }

        if (!this.touchBound) {
            this.touchBound = true;
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    onDestroy(): void {
        if (this.touchBound) {
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.touchBound = false;
        }
    }

    protected onTouchStart(event: cc.Event.EventTouch): void {
        if (GameData.PauseGame || !this.main) {
            return;
        }
        this.main.tryClearNewbieGuideOnTouch(this.node);
        this.isTouch = true;
        this.dragBegun = false;
    }

    protected onTouchMove(event: cc.Event.EventTouch): void {
        if (!this.isTouch || GameData.PauseGame) {
            return;
        }

        const parent = this.node.parent;
        if (!parent) {
            return;
        }

        if (!this.dragBegun) {
            this.dragBegun = true;
            if (this.bottomScroll && cc.isValid(this.bottomScroll)) {
                this.bottomScroll.enabled = false;
            }
            if (this.trayLayout && cc.isValid(this.trayLayout)) {
                this.trayLayout.enabled = false;
            }
            if (this.trayViewMask && cc.isValid(this.trayViewMask)) {
                this.trayViewMask.enabled = false;
            }
            const st = this.scaleTarget;
            if (st && cc.isValid(st)) {
                st.scale = this.dragScaleValue;
            }
        }

        const cur = parent.convertToNodeSpaceAR(event.getLocation());
        const prev = parent.convertToNodeSpaceAR(event.getPreviousLocation());

        const pos = this.node.getPosition();
        this.node.setPosition(
            pos.x + (cur.x - prev.x),
            pos.y + (cur.y - prev.y)
        );
    }

    protected onTouchEnd(event: cc.Event.EventTouch): void {
        if (!this.isTouch) {
            return;
        }

        const hadDragBegun = this.dragBegun;
        this.isTouch = false;

        if (!hadDragBegun) {
            this.dragBegun = false;
            this.unlockBottomTray();
            return;
        }

        this.dragBegun = false;
        this.moveLogic(this.node);
    }

    /** 恢复底部 ScrollView + Layout + view Mask（与 lv382 对齐：贴中/失败后统一解锁托盘） */
    private unlockBottomTray(): void {
        if (this.bottomScroll && cc.isValid(this.bottomScroll)) {
            this.bottomScroll.enabled = true;
        }
        if (this.trayLayout && cc.isValid(this.trayLayout)) {
            this.trayLayout.enabled = true;
        }
        if (this.trayViewMask && cc.isValid(this.trayViewMask)) {
            this.trayViewMask.enabled = true;
        }
    }

    private isAnchorsAligned(itemNode: cc.Node): boolean {
        const slot = this.targetSlot;
        const alignNode =
            this.scaleTarget && cc.isValid(this.scaleTarget) ? this.scaleTarget : itemNode;
        if (!slot || !itemNode || !cc.isValid(slot) || !cc.isValid(itemNode) || !alignNode || !cc.isValid(alignNode)) {
            return false;
        }
        const tol = Math.max(0, this.placeTolerancePx);
        const sa = slot.convertToWorldSpaceAR(cc.v2(0, 0));
        const pa = alignNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const dx = sa.x - pa.x;
        const dy = sa.y - pa.y;
        return dx * dx + dy * dy <= tol * tol + 1e-4;
    }

    private moveLogic(itemNode: cc.Node): void {
        if (!this.targetSlot || !cc.isValid(this.targetSlot)) {
            AudioManager.playEffect("错误440");
            this.restoreNode();
            return;
        }

        const isAligned = this.isAnchorsAligned(itemNode);

        if (isAligned) {
            cc.Tween.stopAllByTarget(itemNode);
            const st = this.scaleTarget;
            if (st && st !== itemNode && cc.isValid(st)) {
                cc.Tween.stopAllByTarget(st);
            }
            this.finalizeStickerPlaceSuccess(itemNode);
            return;
        }

        AudioManager.playEffect("错误440");
        this.restoreNode();
    }

    /** 判定贴中后：关掉碎片→音效→露槽→立刻解锁底部托盘并重排→揭晓 FX→计数后销毁碎片 */
    private finalizeStickerPlaceSuccess(itemNode: cc.Node): void {
        if (itemNode && cc.isValid(itemNode)) {
            itemNode.active = false;
        }
        AudioManager.playEffect("正确440");
        if (this.targetSlot && cc.isValid(this.targetSlot)) {
            this.targetSlot.active = true;
        }
        if (this.main && cc.isValid(this.main.node)) {
            this.main.hideLvquanTipsOutlineHint();
        }

        // 判定成功后立刻恢复 ScrollView/Layout/Mask，让底部托盘立刻重排，不等到揭晓 FX 结束
        this.unlockBottomTray();
        if (this.trayLayout && cc.isValid(this.trayLayout)) {
            this.trayLayout.updateLayout();
        }

        const finishCommitted = (): void => {
            if (this.main && cc.isValid(this.main.node)) {
                this.main.onStickerLayerPiecePlaced(this.stickerLayerRootName);
                this.main.onStickerPlaced();
            }
            if (itemNode && cc.isValid(itemNode)) {
                itemNode.destroy();
            }
        };

        if (this.main && cc.isValid(this.main.node)) {
            this.main.runStickerRevealFxIfNeeded(this.targetSlot, finishCommitted);
        } else {
            finishCommitted();
        }
    }

    private restoreNode(): void {
        cc.Tween.stopAllByTarget(this.node);
        const st = this.scaleTarget;
        if (st && st !== this.node && cc.isValid(st)) {
            cc.Tween.stopAllByTarget(st);
        }

        // 仅纵向下落：x 保持拖放后的位置不动，只 tween y 回到托盘行
        const dur = 0.5;
        const flyEase = { easing: "sineOut" };
        const targetY = this.startLocalPos.y;
        if (st && st !== this.node && cc.isValid(st)) {
            let left = 2;
            const tryUnlock = (): void => {
                left--;
                if (left <= 0) {
                    this.unlockBottomTray();
                }
            };
            cc.tween(this.node)
                .to(dur, { y: targetY }, flyEase)
                .call(tryUnlock)
                .start();
            cc.tween(st)
                .to(dur, { scale: this.curScaleValue }, flyEase)
                .call(tryUnlock)
                .start();
        } else {
            cc.tween(this.node)
                .to(dur, { y: targetY, scale: this.curScaleValue }, flyEase)
                .call(() => {
                    this.unlockBottomTray();
                })
                .start();
        }
    }
}
