import AudioManager from "../script/common/AudioManager";
import VideoManager from "../script/common/VideoManager";





const { ccclass, property } = cc._decorator;

/** 与 shjajs_480 新手手指引导关闭事件一致 */
const EV_GUIDE_DISMISS = "Lv480GuideDismiss";

@ccclass
export default class moveitem_480 extends cc.Component {

    @property(cc.Integer)
    targetScale: number = 0;
    @property(cc.Integer)
    targetIndex: number = 0;
    @property(cc.Node)
    di: cc.Node = null;
    @property(cc.Integer)
    dix: number = 0;
    @property(cc.Integer)
    diy: number = 0;
    @property(cc.Integer)
    diindex: number = 0;
    @property(cc.Boolean)
    isHideChildren: Boolean = false;
    @property(cc.Boolean)
    isY: Boolean = true;
    @property(cc.Boolean)
    isBody: Boolean = false;

    /** 打钩后该节点成为彩蛋触发器：松手落在舞台上且碰到 easterEggTarget 时，触发 choose 内 _1 节点替换 */
    @property(cc.Boolean)
    isEasterEgg: boolean = false;

    /** 彩蛋碰撞目标节点：isEasterEgg 为 true 时，拖拽松手需与此节点重叠才触发彩蛋替换 */
    @property(cc.Node)
    easterEggTarget: cc.Node = null;

    isgg = false;

    /** 外部可控制：false 时禁止拖拽（onTouchStart 直接 return） */
    public draggable: boolean = false;

    public main: cc.Node = null;

    startScale = 0;
    startPoi;
    startParent: cc.Node = null;
    private hasChooseHomeOverride: boolean = false;

    mainwidth = 0;
    mainheight = 0;
    wupinglan: cc.Node = null;
    wutai: cc.Node = null;
    dj_sk: dragonBones.ArmatureDisplay = null;
    isTouch = false;
    /** 本次按下仅拉了激励视频、未进入拖拽；整段触摸的 move/end 都丢弃，需松手后再拖 */
    private suppressDragUntilTouchEnd = false;

    /** 沿父链查找与旧版「bg」等价的层：同时挂有 舞台、物品栏 */
    private findBgLayerFromNode(node: cc.Node): cc.Node | null {
        let p: cc.Node | null = node;
        while (p) {
            const wutai = p.getChildByName("舞台");
            const lan = p.getChildByName("物品栏");
            if (wutai && lan) return p;
            p = p.parent;
        }
        return null;
    }

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        if (!this.hasChooseHomeOverride) {
            this.startScale = this.node.scale;
            this.startPoi = cc.v2(this.node.x, this.node.y);
            this.startParent = this.node.parent;
        }
        const bgLayer = this.findBgLayerFromNode(this.node);
        if (bgLayer) {
            this.wupinglan = bgLayer.getChildByName("物品栏");
            this.wutai = bgLayer.getChildByName("舞台");
        } else {
            this.wupinglan = null;
            this.wutai = null;
            cc.error("[moveitem_480] 未找到含 舞台/物品栏 的父节点，拖拽区域会失效。请检查预制体层级。");
        }
        const djSkNode = this.wutai ? this.wutai.getChildByName("dj_sk") : null;
        this.dj_sk = djSkNode ? djSkNode.getComponent(dragonBones.ArmatureDisplay) : null;
        if (this.wutai && !this.dj_sk) {
            cc.warn("[moveitem_480] 舞台 下未找到带 ArmatureDisplay 的 dj_sk（可忽略若已改名）");
        }
        if (this.isBody) {
            this.node.on("BodyIndex", () => {
                if (!this.isTouch) this.node.zIndex = 2;
            }, this)
        }
        this.node.on("TouchCancel", () => {
            this.ondele();
        }, this)
    }

    isgd: boolean = false;

    /** 道具子节点名为 video 且处于激活：需看完激励视频并在回调里销毁该节点后才能拖 */
    private getVideoAdMarker(): cc.Node | null {
        const v = this.node.getChildByName("video");
        if (v && v.isValid && v.active) return v;
        return null;
    }

    private needsVideoAdGate(): boolean {
        return this.getVideoAdMarker() != null;
    }

    private needsCaidanVideo(): boolean {
        return this.node.name == "caidan" && this.isgd == false;
    }

    onTouchStart(even: cc.Event.EventTouch) {
        if (!this.draggable) return;
        if (this.needsVideoAdGate()) {
            this.suppressDragUntilTouchEnd = true;
            VideoManager.getInstance().showVideo(() => {
                // 看完广告：隐藏 video 及其所有兄弟节点，解锁拖拽
                for (let i = 0; i < this.node.childrenCount; i++) {
                    const ch = this.node.children[i];
                    if (ch && ch.isValid) ch.active = false;
                }
            });
            return;
        }
        if (this.needsCaidanVideo()) {
            this.suppressDragUntilTouchEnd = true;
            VideoManager.getInstance().showVideo(() => {
                this.isgd = true;
            });
            return;
        }
        this.node.dispatchEvent(new cc.Event.EventCustom(EV_GUIDE_DISMISS, true));
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.node.zIndex = 51;
        if (!this.isBody) this.node.opacity = 160;
        this.isTouch = true;
        for (let i = 0; i < this.node.parent.childrenCount; i++) {
            const chil = this.node.parent.children[i];
            chil.emit("BodyIndex");
        }
        const poi = this.node.parent.convertToNodeSpaceAR(even.getLocation());
        this.node.setPosition(poi);
        if (this.isY) this.node.y += 150;
        if (this.di) this.di.active = false;
        if (this.isHideChildren) this.node.children[0].active = true;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.2, { scale: this.targetScale, })
            .start();
    }
    onTouchMove(even: cc.Event.EventTouch) {
        if (!this.draggable) return;
        if (this.suppressDragUntilTouchEnd) {
            return;
        }
        const delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;

    }
    onTouchEnd(even: cc.Event.EventTouch) {
        if (!this.draggable) return;
        if (this.suppressDragUntilTouchEnd) {
            this.suppressDragUntilTouchEnd = false;
            return;
        }
        const worldPoint = this.node.parent.convertToWorldSpaceAR(this.node.position);
        this.node.opacity = 255;
        if (!this.wupinglan || !this.wutai || !this.wupinglan.isValid || !this.wutai.isValid) {
            this.node.zIndex = this.targetIndex;
            this.isTouch = false;
            return;
        }
        const polyComp = this.wupinglan.getComponent(cc.PolygonCollider);
        const polywutaiComp = this.wutai.getComponent(cc.PolygonCollider);
        if (!polyComp || !polywutaiComp) {
            this.node.zIndex = this.targetIndex;
            this.isTouch = false;
            cc.error("[moveitem_480] 物品栏 或 舞台 缺少 PolygonCollider");
            return;
        }
        const poi = this.wupinglan.convertToNodeSpaceAR(worldPoint);
        const poi2 = this.wutai.convertToNodeSpaceAR(worldPoint);
        const poly = polyComp.points;
        const polywutai = polywutaiComp.points;
        if (cc.Intersection.pointInPolygon(cc.v2(poi.x, poi.y), poly)) {
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .to(0.3, { scale: 0 })
                .call(() => {
                    this.node.removeFromParent(false);
                    this.startParent.addChild(this.node);
                    this.node.setPosition(this.startPoi);
                    this.applyUniformScale(this.startScale);
                    if (this.di) this.di.active = false;
                    if (this.isHideChildren) this.node.children[0].active = true;
                    this.scheduleOnce(() => { this.node.dispatchEvent(new cc.Event.EventCustom("CheckWuTai", true)); }, 0.010)
                })
                .to(0.2, { scale: this.startScale })
                .start();
        } else if (cc.Intersection.pointInPolygon(cc.v2(poi2.x, poi2.y), polywutai)) {
            this.node.removeFromParent(false);
            this.wutai.addChild(this.node);
            this.node.setPosition(poi2);
            this.scheduleOnce(() => { this.node.dispatchEvent(new cc.Event.EventCustom("CheckWuTai", true)); }, 0.010)
            if (this.dj_sk && this.dj_sk.node && this.dj_sk.node.isValid) {
                this.dj_sk.node.setPosition(poi2);
                this.dj_sk.playAnimation("djtx", 1);
            }
            AudioManager.playEffect("爱心");
            if (this.di) {
                this.di.removeFromParent(false);
                this.wutai.addChild(this.di);
                this.di.setPosition(cc.v2(this.node.x + this.dix, this.node.y + this.diy));
                this.di.zIndex = this.diindex;
                this.di.active = true;
                if (this.isHideChildren) this.node.children[0].active = false;
            }
            if (this.node.name == "caidan") {
                this.node.active = false;
                const bgLayer = this.findBgLayerFromNode(this.node);
                const cd = bgLayer ? bgLayer.getChildByName("cd") : null;
                if (cd && cd.isValid) cd.active = true;
                // AudioManager.playEffect("彩蛋");
            }
            // 彩蛋道具碰撞：目标若在舞台则用舞台上的节点做重叠判定
            if (this.isEasterEgg) {
                const hitTarget = this.resolveEasterEggCollisionTarget();
                if (hitTarget) {
                    const selfRect = this.node.getBoundingBoxToWorld();
                    const targetRect = hitTarget.getBoundingBoxToWorld();
                    if (selfRect.intersects(targetRect)) {
                        this.triggerEasterEggSwap();
                    }
                }
            }

        }

        this.node.zIndex = this.targetIndex;
        this.isTouch = false;
    }

    /** 在节点直接子级中按名查找（choose 兄弟 / 舞台子节点） */
    private findDirectChildByName(parent: cc.Node, name: string): cc.Node | null {
        if (!parent || !parent.isValid) return null;
        for (let i = 0; i < parent.childrenCount; i++) {
            const ch = parent.children[i];
            if (ch && ch.isValid && ch.name === name) return ch;
        }
        return null;
    }

    /** 当前激活的 choose（choose1 / choose2 二选一） */
    private getActiveChoose(wuping: cc.Node): cc.Node | null {
        const c1 = wuping.getChildByName("choose1");
        const c2 = wuping.getChildByName("choose2");
        if (c1 && c1.isValid && c1.active) return c1;
        if (c2 && c2.isValid && c2.active) return c2;
        return null;
    }

    /** 找基础款：先舞台（已放置），没有再查当前 choose 兄弟节点（仅 active） */
    private findBaseNode(choose: cc.Node, wutai: cc.Node, baseName: string): cc.Node | null {
        const onStage = this.findDirectChildByName(wutai, baseName);
        if (onStage && onStage.isValid && onStage.active) return onStage;
        const inChoose = this.findDirectChildByName(choose, baseName);
        if (inChoose && inChoose.isValid && inChoose.active) return inChoose;
        return null;
    }

    private applyUniformScale(s: number): void {
        this.node.scale = s;
        this.node.scaleX = s;
        this.node.scaleY = s;
    }

    /** 彩蛋碰撞目标：碰撞只发生在舞台，优先用舞台上的基础款做重叠判定 */
    private resolveEasterEggCollisionTarget(): cc.Node | null {
        if (!this.easterEggTarget || !this.easterEggTarget.isValid) return null;
        const baseName = this.easterEggTarget.name;
        const bgLayer = this.findBgLayerFromNode(this.node);
        const wutai = bgLayer ? bgLayer.getChildByName("舞台") : null;
        if (wutai) {
            const onStage = this.findDirectChildByName(wutai, baseName);
            if (onStage && onStage.isValid && onStage.active) return onStage;
        }
        if (this.easterEggTarget.active) return this.easterEggTarget;
        return null;
    }

    /** 读取基础款在 choose 里的归位信息（onLoad 时记录的槽位，不随舞台移动改变） */
    private captureChooseHome(baseNode: cc.Node): { parent: cc.Node, poi: cc.Vec2, scale: number } | null {
        const comp = baseNode.getComponent(moveitem_480);
        if (!comp || !comp.startParent || !comp.startParent.isValid) return null;
        return {
            parent: comp.startParent,
            poi: cc.v2(comp.startPoi.x, comp.startPoi.y),
            scale: comp.startScale,
        };
    }

    /** 把基础款 choose 槽位信息写入 _1，保证从舞台拖回物品栏能归位 */
    private applyChooseHomeToComp(
        comp: moveitem_480,
        home: { parent: cc.Node, poi: cc.Vec2, scale: number },
        fromComp: moveitem_480
    ): void {
        comp.startParent = home.parent;
        comp.startPoi = cc.v2(home.poi.x, home.poi.y);
        comp.startScale = home.scale;
        comp.hasChooseHomeOverride = true;
        comp.targetIndex = fromComp.targetIndex;
        comp.targetScale = fromComp.targetScale;
        comp.draggable = true;
    }

    /** 被替换的基础款藏回 choose 原位（避免留在舞台上占子节点） */
    private stashBaseNodeToChooseHome(baseNode: cc.Node): void {
        const baseComp = baseNode.getComponent(moveitem_480);
        if (!baseComp || !baseComp.startParent || !baseComp.startParent.isValid) {
            baseNode.active = false;
            return;
        }
        baseNode.removeFromParent(false);
        baseComp.startParent.addChild(baseNode);
        baseNode.setPosition(baseComp.startPoi);
        baseNode.scale = baseComp.startScale;
        baseNode.active = false;
        if (baseComp.di && baseComp.di.isValid) {
            baseComp.di.active = false;
        }
    }

    /** _1 根节点 contentSize 为 0 时，用首个子节点尺寸撑开触摸区域 */
    private ensureTouchHitArea(node: cc.Node): void {
        if (node.width > 1 && node.height > 1) return;
        for (let i = 0; i < node.childrenCount; i++) {
            const ch = node.children[i];
            if (!ch || !ch.isValid) continue;
            const sz = ch.getContentSize();
            if (sz.width > 1 && sz.height > 1) {
                node.setContentSize(sz);
                return;
            }
        }
    }

    /** 将 choose 内 xxx_1 顶到基础款（xxx）位置，并隐藏基础款 */
    private swapEasterEggPair(node1: cc.Node, baseNode: cc.Node): void {
        const targetParent = baseNode.parent;
        if (!targetParent || !targetParent.isValid) return;

        const baseComp = baseNode.getComponent(moveitem_480);
        const node1Comp = node1.getComponent(moveitem_480);
        if (!baseComp || !node1Comp) return;

        const home = this.captureChooseHome(baseNode);
        if (!home) return;

        const worldPos = targetParent.convertToWorldSpaceAR(baseNode.position);
        const siblingIdx = baseNode.getSiblingIndex();
        const displayScale = baseNode.scale;
        const z = baseNode.zIndex;
        const diNode = baseComp.di && baseComp.di.isValid ? baseComp.di : null;

        this.applyChooseHomeToComp(node1Comp, home, baseComp);
        this.stashBaseNodeToChooseHome(baseNode);

        node1.removeFromParent(false);
        targetParent.addChild(node1);
        node1.setSiblingIndex(siblingIdx);
        node1.setPosition(targetParent.convertToNodeSpaceAR(worldPos));
        node1Comp.applyUniformScale(displayScale);
        node1.zIndex = z;
        node1.active = true;
        this.ensureTouchHitArea(node1);

        if (diNode) {
            node1Comp.di = diNode;
            diNode.removeFromParent(false);
            targetParent.addChild(diNode);
            diNode.setPosition(cc.v2(node1.x + node1Comp.dix, node1.y + node1Comp.diy));
            diNode.zIndex = node1Comp.diindex;
            diNode.active = true;
        }
    }

    /** 彩蛋一次性替换：收集 choose 内全部 *_1，逐个先找舞台再找 choose 兄弟并替换 */
    private triggerEasterEggSwap(): void {
        const bgLayer = this.findBgLayerFromNode(this.node);
        if (!bgLayer) return;
        const wuping = bgLayer.getChildByName("wuping");
        const wutai = bgLayer.getChildByName("舞台");
        if (!wuping || !wutai) return;

        const choose = this.getActiveChoose(wuping);
        if (!choose) return;

        const pending1: cc.Node[] = [];
        for (let i = 0; i < choose.childrenCount; i++) {
            const ch = choose.children[i];
            if (!ch || !ch.isValid) continue;
            if (ch.name.endsWith("_1")) pending1.push(ch);
        }

        for (let i = 0; i < pending1.length; i++) {
            const node1 = pending1[i];
            if (!node1 || !node1.isValid) continue;
            if (node1.parent === wutai && node1.active) continue;

            const baseName = node1.name.substring(0, node1.name.length - 2);
            const baseNode = this.findBaseNode(choose, wutai, baseName);
            if (!baseNode) continue;

            this.swapEasterEggPair(node1, baseNode);
        }

        // AudioManager.playEffect("彩蛋");
        this.scheduleOnce(() => {
            this.node.dispatchEvent(new cc.Event.EventCustom("CheckWuTai", true));
        }, 0.01);
    }

    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
