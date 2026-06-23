
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import lostPanel_lv386, { ILv386MainForLostPanel } from "./lostPanel_lv386";
import lianxian_config_386, { Lianxian386LevelCfg } from "./lianxian_config_386";
const { ccclass, property } = cc._decorator;

type CellBind = {
    num: number;
    spr: cc.Sprite | null;
    label: cc.Label;
    defSpr: cc.Color;
    defLab: cc.Color;
    /** 编辑器里 pressNode 的默认缩放，动画 0→该值 */
    pressDefSX?: number;
    pressDefSY?: number;
};

@ccclass
export default class lianxian_lv386 extends BaseGame implements ILv386MainForLostPanel {
    /** 提示手指/光圈，广告后会挂到「下一个该连的数字」格子上并呼吸闪烁 */
    @property(cc.Node)
    private tipsNode: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;

    @property(cc.Node)
    heartContainer: cc.Node = null;

    @property(cc.Label)
    currentLevelLabel: cc.Label = null;

    /** 进度条填充：`resolveProgressFill` 会尝试绑定 `bg/tz/tz2` */
    private progressFill: cc.Sprite = null;

    /** 进度圆点 `tzyuan` 的路径参考（一般为 bg/tz，与裁剪条同宽） */
    @property(cc.Node)
    progressTrackNode: cc.Node = null;

    @property(cc.Node)
    tzyuanNode: cc.Node = null;

    @property(cc.Label)
    progressNowLabel: cc.Label = null;

    @property(cc.Label)
    progressTotalLabel: cc.Label = null;

    @property({ tooltip: "圆点在轨道最左/最右的额外偏移（像素，本地 x）" })
    tzyuanEdgeInset = 0;

    @property({ tooltip: "扣心时单次摆动幅度（像素）" })
    heartLoseShakePx = 12;

    @property({ tooltip: "扣心时每段摆动时长（秒）" })
    heartLoseShakeStep = 0.06;

    @property(cc.Color)
    pressColor: cc.Color = new cc.Color(180, 200, 220, 255);

    @property(cc.Color)
    doneSpriteColor: cc.Color = new cc.Color(45, 55, 120, 255);

    @property(cc.Color)
    doneLabelColor: cc.Color = cc.Color.WHITE;

    @property(cc.Color)
    lineStrokeColor: cc.Color = new cc.Color(45, 55, 120, 255);

    @property
    lineWidth = 12;

    @property({ tooltip: "当前连线起点相对原位置上移（像素，棋盘本地坐标）" })
    pressLiftY = 10;

    @property({ tooltip: "pressNode 出现：缩放到 1 的时长（秒）" })
    pressNodeInDuration = 0.12;

    @property({ tooltip: "pressNode 消失：扩散+淡出时长（秒）" })
    pressNodeOutDuration = 0.2;

    @property({ tooltip: "消失时相对 1 放大的目标倍率（模拟扩散）" })
    pressNodeExitScale = 1.55;

    @property({ tooltip: "小关通关后延迟多久再弹出 gou（秒）" })
    gouPopDelay = 0.2;

    @property({ tooltip: "gou 缩放到 1 的时长（秒）" })
    gouScaleToOneDuration = 1;

    @property({ tooltip: "tips_Node 呼吸缩放幅度（相对 1）" })
    tipsBreathScale = 0.12;

    @property({ tooltip: "tips_Node 呼吸单段时长（秒）" })
    tipsBreathStep = 0.45;

    canjiaohu = true;

    private readonly maxSubLevel = 6;
    private curlv = 1;
    private gridRoot: cc.Node = null;
    private lineGraphics: cc.Graphics = null;
    private chainMax = 0;
    private pathPoints: cc.Vec2[] = [];
    private numToCell: Map<number, cc.Node> = new Map();
    private cellBind: Map<cc.Node, CellBind> = new Map();
    private dragging = false;
    /** 本次拖拽是否已在滑过某格时判定过（松手不再判） */
    private dragResolved = false;
    /** 起手选中当前应连数字时播 1；每成功连到下一段 +1，1→9 循环（再次按下起点重新从 1 起播） */
    private dragConnectSoundStep = 0;
    private dragStartCell: cc.Node = null;
    private dragBasePosX = 0;
    private dragBasePosY = 0;
    private hearts = 3;
    private heartNodes: cc.Node[] = [];

    /** 小关通关 gou 动画期间，禁止连线和部分按钮 */
    private subLevelPassTransitioning = false;

    private tipsNodeOrigParent: cc.Node = null;
    private tipsNodeOrigPos = cc.v2();

    /** 与 onlost 的 scheduleOnce 对应，复活时必须 unschedule，否则会再次把 PauseGame 置为 true */
    private readonly _onLostDelayShowPanel = () => {
        GameData.PauseGame = true;
        if (!this.isGameOver || this.hearts > 0) return;
        this.showLostPanel();
    };

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景");
        }, 0.5);

        this.resolveRefs();
        this.bindHearts();
        this.resolveProgressFill();
        this.resolveProgressTzUi();

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.initLevel();
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
        AudioManager.stopMusic();
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private resolveRefs() {
        if (!this.heartContainer) {
            const h = cc.find("bg/healthNode", this.node) || cc.find("healthNode", this.node);
            if (h) this.heartContainer = h;
        }
        if (!this.currentLevelLabel) {
            const lb = cc.find("bg/currentLevelLabel", this.node);
            if (lb) this.currentLevelLabel = lb.getComponent(cc.Label);
        }
        if (!this.tipsNode) {
            const tn = cc.find("bg/tips_Node", this.node) || cc.find("tips_Node", this.node);
            if (tn) this.tipsNode = tn;
        }
        if (this.tipsNode && !this.tipsNodeOrigParent) {
            this.tipsNodeOrigParent = this.tipsNode.parent;
            this.tipsNodeOrigPos = cc.v2(this.tipsNode.x, this.tipsNode.y);
        }
    }

    private bindHearts() {
        this.heartNodes = [];
        if (!this.heartContainer) return;
        for (let i = 0; i < this.heartContainer.children.length; i++) {
            this.heartNodes.push(this.heartContainer.children[i]);
        }
        this.heartNodes.sort((a, b) => a.x - b.x);
    }

    private resolveProgressFill() {
        if (this.progressFill) return;
        const sp = cc.find("bg/tz/tz2", this.node);
        if (sp) this.progressFill = sp.getComponent(cc.Sprite);
    }

    private resolveProgressTzUi() {
        const tz = cc.find("bg/tz", this.node);
        if (!this.progressTrackNode && tz) this.progressTrackNode = tz;
        if (!this.tzyuanNode && tz) {
            const y = tz.getChildByName("tzyuan");
            if (y) this.tzyuanNode = y;
        }
        if (!this.progressNowLabel && this.tzyuanNode) {
            const nl = this.tzyuanNode.getChildByName("nowlabel");
            if (nl) this.progressNowLabel = nl.getComponent(cc.Label);
        }
        if (!this.progressTotalLabel && tz) {
            const tl = tz.getChildByName("totallabel");
            if (tl) this.progressTotalLabel = tl.getComponent(cc.Label);
        }
    }

    private findLayoutGridOnBg(): cc.Node {
        const bg = cc.find("bg", this.node);
        if (!bg) return null;
        let best: cc.Node = null;
        let max = 0;
        for (let i = 0; i < bg.children.length; i++) {
            const c = bg.children[i];
            if (c.getComponent(cc.Layout) && c.childrenCount > max) {
                max = c.childrenCount;
                best = c;
            }
        }
        return best;
    }

    /** 存在多个 bg/lv1～lvN 时只显示当前小关对应节点 */
    private applySubLevelLvVisibility() {
        const bg = cc.find("bg", this.node);
        if (!bg) return;
        let cnt = 0;
        for (let i = 1; i <= this.maxSubLevel; i++) {
            if (bg.getChildByName("lv" + i)) cnt++;
        }
        if (cnt <= 1) return;
        for (let i = 1; i <= this.maxSubLevel; i++) {
            const nn = bg.getChildByName("lv" + i);
            if (nn) nn.active = i === this.curlv;
        }
    }

    private getLevelCfg(): Lianxian386LevelCfg {
        return lianxian_config_386["level" + this.curlv];
    }

    initLevel() {
        const cfg = this.getLevelCfg();
        if (!cfg) {
            cc.error("[lianxian_lv386] 缺少配置", this.curlv);
            return;
        }

        const bg = cc.find("bg", this.node);
        const lvNode = bg ? bg.getChildByName("lv" + this.curlv) : null;
        this.gridRoot = lvNode || this.findLayoutGridOnBg();

        if (!this.gridRoot) {
            cc.error("[lianxian_lv386] 未找到棋盘");
            return;
        }

        this.applySubLevelLvVisibility();

        this.stopTipsIndicator();

        this.ensureLineLayer(this.gridRoot);
        this.chainMax = 0;
        this.pathPoints = [];
        this.dragConnectSoundStep = 0;
        this.dragging = false;
        this.hearts = 3;
        this.numToCell.clear();
        this.cellBind.clear();

        const gridLy = this.gridRoot.getComponent(cc.Layout);
        if (gridLy) gridLy.enabled = false;

        this.mapCellsFromPrefabLabels(cfg);
        this.applyAllCellVisuals();
        this.redrawLine();
        this.updateHud();
        this.updateHearts();

        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = "关卡 " + this.curlv;
        }
    }

    private ensureLineLayer(parent: cc.Node) {
        let lineNode = parent.getChildByName("_lineLayer386");
        if (!lineNode) {
            lineNode = new cc.Node("_lineLayer386");
            lineNode.parent = parent;
            lineNode.setSiblingIndex(0);
            lineNode.zIndex = -10;
            lineNode.addComponent(cc.Graphics);
        }
        this.lineGraphics = lineNode.getComponent(cc.Graphics);
    }

    /** 数字完全来自编辑器里每格子节点上的 Label.string，配置表只提供 maxNum */
    private mapCellsFromPrefabLabels(cfg: Lianxian386LevelCfg) {
        const children = this.gridRoot.children.filter((c) => c.name !== "_lineLayer386");
        for (let i = 0; i < children.length; i++) {
            const cell = children[i];
            const spr = cell.getComponent(cc.Sprite);
            const lb = cell.getComponentInChildren(cc.Label);
            if (!lb) {
                cc.warn("[lianxian_lv386] 格子缺少 Label，已跳过", cell.name);
                continue;
            }
            const raw = (lb.string || "").trim();
            let num = 0;
            if (raw.length > 0) {
                const p = parseInt(raw, 10);
                num = isNaN(p) ? 0 : p;
            }
            const defSpr = spr ? spr.node.color.clone() : cc.Color.WHITE.clone();
            const defLab = lb.node.color.clone();
            const pn = cell.getChildByName("pressNode");
            let pressDefSX: number | undefined;
            let pressDefSY: number | undefined;
            if (pn) {
                pressDefSX = pn.scaleX;
                pressDefSY = pn.scaleY;
                pn.active = false;
                pn.opacity = 255;
                pn.setScale(pressDefSX, pressDefSY);
            }
            this.cellBind.set(cell, { num, spr, label: lb, defSpr, defLab, pressDefSX, pressDefSY });
            if (num > 0) this.numToCell.set(num, cell);
        }
        if (this.numToCell.size !== cfg.maxNum) {
            cc.warn("[lianxian_lv386] Label 解析出的数字格数", this.numToCell.size, "与配置 maxNum", cfg.maxNum, "不一致");
        }
    }

    private applyAllCellVisuals() {
        this.cellBind.forEach((meta, cell) => {
            this.applyCellLabelVisibility(meta);
            this.applyCellNormal(cell, meta);
            if (meta.num > 0 && meta.num <= this.chainMax) {
                this.applyCellDone(cell, meta);
            }
        });
    }

    /** 按关卡配置隐藏/显示格子上的数字 Label（不影响碰撞与连线判定） */
    private isCellLabelVisible(meta: CellBind): boolean {
        if (meta.num <= 0) return true;
        const cfg = this.getLevelCfg();
        if (!cfg) return true;
        if (cfg.revealLabelsProgressive) {
            const upTo = this.chainMax === 0 ? 1 : this.chainMax;
            return meta.num <= upTo;
        }
        const hideList = cfg.hideLabelUntilReached;
        if (hideList && hideList.length > 0) {
            if (hideList.indexOf(meta.num) < 0) return true;
            return this.chainMax >= meta.num;
        }
        return true;
    }

    private applyCellLabelVisibility(meta: CellBind) {
        if (!meta.label || !meta.label.node) return;
        meta.label.node.active = this.isCellLabelVisible(meta);
    }

    private applyCellNormal(_cell: cc.Node, meta: CellBind) {
        if (meta.spr) meta.spr.node.color = meta.defSpr;
        meta.label.node.color = meta.defLab;
    }

    private applyCellDone(_cell: cc.Node, meta: CellBind) {
        if (meta.spr) meta.spr.node.color = this.doneSpriteColor;
        meta.label.node.color = this.doneLabelColor;
    }

    private applyCellPress(_cell: cc.Node, meta: CellBind) {
        if (meta.spr) meta.spr.node.color = this.pressColor;
    }

    private getPressNode(cell: cc.Node): cc.Node | null {
        const pn = cell.getChildByName("pressNode");
        return pn || null;
    }

    /** 出现：快速 0 → 编辑器默认缩放 */
    private runPressNodeShow(cell: cc.Node) {
        const pn = this.getPressNode(cell);
        if (!pn) return;
        const meta = this.cellBind.get(cell);
        const tx = meta && meta.pressDefSX != null ? meta.pressDefSX : 1;
        const ty = meta && meta.pressDefSY != null ? meta.pressDefSY : 1;
        cc.Tween.stopAllByTarget(pn);
        pn.active = true;
        pn.opacity = 255;
        pn.setScale(0, 0);
        cc.tween(pn).to(this.pressNodeInDuration, { scaleX: tx, scaleY: ty }).start();
    }

    /** 消失：快速放大并淡出，结束后复位便于下次出现 */
    private runPressNodeHide(cell: cc.Node) {
        const pn = this.getPressNode(cell);
        if (!pn) return;
        const meta = this.cellBind.get(cell);
        const bx = meta && meta.pressDefSX != null ? meta.pressDefSX : 1;
        const by = meta && meta.pressDefSY != null ? meta.pressDefSY : 1;
        cc.Tween.stopAllByTarget(pn);
        const k = this.pressNodeExitScale;
        cc.tween(pn)
            .to(this.pressNodeOutDuration, { scaleX: bx * k, scaleY: by * k, opacity: 0 })
            .call(() => {
                pn.active = false;
                pn.setScale(bx, by);
                pn.opacity = 255;
            })
            .start();
    }

    private cellLocalPos(cell: cc.Node): cc.Vec2 {
        return cc.v2(cell.x, cell.y);
    }

    private pickCell(loc: cc.Vec2): cc.Node | null {
        const p = this.gridRoot.convertToNodeSpaceAR(loc);
        const children = this.gridRoot.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const c = children[i];
            if (c.name === "_lineLayer386") continue;
            if (c.getBoundingBox().contains(p)) return c;
        }
        return null;
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isGameOver || this.subLevelPassTransitioning) return;
        const startNum = this.chainMax === 0 ? 1 : this.chainMax;
        const cell = this.pickCell(event.getLocation());
        if (!cell) return;
        const meta = this.cellBind.get(cell);
        if (!meta || meta.num !== startNum) return;
        this.stopTipsIndicator();
        this.dragging = true;
        this.dragResolved = false;
        this.dragConnectSoundStep = 1;
        AudioManager.playEffect("1");
        this.dragStartCell = cell;
        this.cacheDragStartTransform(cell);
        cell.setPosition(this.dragBasePosX, this.dragBasePosY + this.pressLiftY);
        this.applyCellPress(cell, meta);
        this.runPressNodeShow(cell);
        this.redrawLine(this.gridRoot.convertToNodeSpaceAR(event.getLocation()));
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        if (!this.dragging || this.subLevelPassTransitioning) return;
        const lp = this.gridRoot.convertToNodeSpaceAR(event.getLocation());
        this.redrawLine(lp);
        if (this.dragResolved) return;

        const hover = this.pickCell(event.getLocation());
        if (!hover || hover === this.dragStartCell) return;

        const hMeta = this.cellBind.get(hover);
        if (!hMeta || hMeta.num <= 0) return;
        if (hMeta.num <= this.chainMax) return;

        const expectNext = this.chainMax === 0 ? 2 : this.chainMax + 1;
        const startNum = this.chainMax === 0 ? 1 : this.chainMax;

        if (hMeta.num === expectNext) {
            if (this.dragStartCell) {
                this.runPressNodeHide(this.dragStartCell);
                this.dragStartCell.setPosition(this.dragBasePosX, this.dragBasePosY);
            }
            this.commitLinkSuccess(hover, startNum, expectNext);
            if (!this.dragging) return;
            this.dragStartCell = hover;
            this.cacheDragStartTransform(hover);
            hover.setPosition(this.dragBasePosX, this.dragBasePosY + this.pressLiftY);
            const hDone = this.cellBind.get(hover);
            if (hDone) this.applyCellPress(hover, hDone);
            this.runPressNodeShow(hover);
            this.redrawLine(lp);
        } else {
            this.dragResolved = true;
            this.dragging = false;
            this.finishDragStartVisual();
            this.commitLinkFail();
        }
    }

    private onTouchEnd(_event: cc.Event.EventTouch) {
        if (this.dragResolved) {
            this.dragResolved = false;
            return;
        }
        if (!this.dragging) return;
        this.dragging = false;
        this.cancelDragNeutral();
        this.redrawLine();
    }

    private onTouchCancel() {
        if (this.dragResolved) {
            this.dragResolved = false;
            return;
        }
        if (!this.dragging) return;
        this.dragging = false;
        this.cancelDragNeutral();
        this.redrawLine();
    }

    /** 松手时未碰到其它数字格：不扣心，只恢复起点位置与着色 */
    private cancelDragNeutral() {
        this.finishDragStartVisual();
        this.applyAllCellVisuals();
    }

    private cacheDragStartTransform(cell: cc.Node) {
        this.dragBasePosX = cell.x;
        this.dragBasePosY = cell.y;
    }

    /** pressNode 扩散隐藏 + 起点归位；着色交给 applyAllCellVisuals */
    private finishDragStartVisual() {
        if (!this.dragStartCell) return;
        this.runPressNodeHide(this.dragStartCell);
        this.dragStartCell.setPosition(this.dragBasePosX, this.dragBasePosY);
        this.dragStartCell = null;
    }

    private commitLinkSuccess(targetCell: cc.Node, startNum: number, expectNext: number) {
        this.dragConnectSoundStep = (this.dragConnectSoundStep % 9) + 1;
        AudioManager.playEffect(String(this.dragConnectSoundStep));
        const pA = this.cellLocalPos(this.numToCell.get(startNum));
        const pB = this.cellLocalPos(targetCell);
        if (this.chainMax === 0) this.pathPoints = [pA, pB];
        else this.pathPoints.push(pB);
        this.chainMax = expectNext;
        this.applyAllCellVisuals();
        this.redrawLine();
        this.updateHud();
        if (this.chainMax >= this.getLevelCfg().maxNum) {
            this.dragging = false;
            this.dragStartCell = null;
            this.dragResolved = false;
            this.scheduleOnce(() => this.playSubLevelPassAnim(), this.gouPopDelay);
        }
    }

    private commitLinkFail() {
        AudioManager.playEffect("错误");
        if (this.hearts <= 0) return;
        const lostIdx = this.hearts - 1;
        this.hearts--;
        const lost = this.heartNodes[lostIdx];
        if (lost) this.playHeartLoseAnim(lost);
        this.syncHeartNodesVisualSkip(lostIdx);
        this.applyAllCellVisuals();
        this.redrawLine();
        if (this.hearts <= 0) {
            this.isGameOver = true;
            this.onlost();
        }
    }

    /** 扣心后：除正在抖动的 lostIdx 外，其余心子节点状态与 this.hearts 对齐 */
    private syncHeartNodesVisualSkip(lostIdx: number) {
        for (let i = 0; i < this.heartNodes.length; i++) {
            if (i === lostIdx) continue;
            const n = this.heartNodes[i];
            cc.Tween.stopAllByTarget(n);
            if (i < this.hearts) {
                n.active = true;
                n.opacity = 255;
                n.angle = 0;
                n.setScale(1, 1);
            } else {
                n.active = false;
                n.opacity = 255;
                n.setScale(1, 1);
            }
        }
    }

    /** 抖动后再直接隐藏（不用变淡） */
    private playHeartLoseAnim(n: cc.Node) {
        if (!n) return;
        cc.Tween.stopAllByTarget(n);
        n.active = true;
        n.opacity = 255;
        const x0 = n.x;
        const y0 = n.y;
        const d = this.heartLoseShakeStep;
        const s = this.heartLoseShakePx;
        cc.tween(n)
            .to(d, { x: x0 + s })
            .to(d, { x: x0 - s })
            .to(d, { x: x0 + s * 0.55 })
            .to(d, { x: x0 - s * 0.55 })
            .to(d, { x: x0 })
            .call(() => {
                n.active = false;
                n.setPosition(x0, y0);
            })
            .start();
    }

    private redrawLine(dragLocal?: cc.Vec2) {
        if (!this.lineGraphics) return;
        const g = this.lineGraphics;
        g.clear();
        g.lineWidth = this.lineWidth;
        g.strokeColor = this.lineStrokeColor;
        const pts = this.pathPoints;

        if (pts.length >= 2) {
            g.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
            if (dragLocal) g.lineTo(dragLocal.x, dragLocal.y);
            g.stroke();
        } else if (pts.length === 1 && dragLocal) {
            g.moveTo(pts[0].x, pts[0].y);
            g.lineTo(dragLocal.x, dragLocal.y);
            g.stroke();
        } else if (pts.length === 0 && dragLocal && this.dragging && this.chainMax === 0) {
            const c1 = this.numToCell.get(1);
            if (c1) {
                const p = this.cellLocalPos(c1);
                g.moveTo(p.x, p.y);
                g.lineTo(dragLocal.x, dragLocal.y);
                g.stroke();
            }
        }
    }

    private updateHud() {
        const cfg = this.getLevelCfg();
        if (!cfg) return;
        if (this.progressNowLabel) {
            this.progressNowLabel.string = String(this.chainMax);
        }
        if (this.progressTotalLabel) {
            this.progressTotalLabel.string = String(cfg.maxNum);
        }
        if (this.progressFill && this.progressFill.type === cc.Sprite.Type.FILLED) {
            const r = cfg.maxNum > 0 ? this.chainMax / cfg.maxNum : 0;
            this.progressFill.fillRange = r;
        }
        this.updateTzyuanProgressPosition(cfg);
    }

    /** `tzyuan` 与 fillRange 同步，沿 `progressTrackNode` 的可用宽度移动（父节点与轨道同父时取其本地 x） */
    private updateTzyuanProgressPosition(cfg: Lianxian386LevelCfg) {
        if (!this.tzyuanNode || !this.progressTrackNode) return;
        const full = cfg.maxNum > 0 && this.chainMax >= cfg.maxNum;
        this.tzyuanNode.active = !full;
        if (full) return;

        const track = this.progressTrackNode;
        const r = cfg.maxNum > 0 ? Math.min(1, Math.max(0, this.chainMax / cfg.maxNum)) : 0;
        const w = track.width;
        const ax = track.anchorX;
        const inset = this.tzyuanEdgeInset;
        const left = -w * ax + inset;
        const right = w * (1 - ax) - inset;
        const xOnTrack = left + (right - left) * r;
        if (this.tzyuanNode.parent === track) {
            this.tzyuanNode.x = xOnTrack;
        } else {
            const world = track.convertToWorldSpaceAR(cc.v2(xOnTrack, 0));
            const local = this.tzyuanNode.parent.convertToNodeSpaceAR(world);
            this.tzyuanNode.x = local.x;
        }
    }

    private updateHearts() {
        for (let i = 0; i < this.heartNodes.length; i++) {
            const n = this.heartNodes[i];
            cc.Tween.stopAllByTarget(n);
            if (i < this.hearts) {
                n.active = true;
                n.opacity = 255;
                n.angle = 0;
                n.setScale(1, 1);
            } else {
                n.active = false;
                n.opacity = 255;
                n.setScale(1, 1);
            }
        }
    }

    /** 小关通关：弹出 gou 约 1s 拉到 scale 1，再进下一关或结算 */
    private playSubLevelPassAnim() {
        if (this.subLevelPassTransitioning) return;
        this.subLevelPassTransitioning = true;
        this.stopTipsIndicator();
        if (this.gou) {
            cc.Tween.stopAllByTarget(this.gou);
            const np = this.gou.getComponent(cc.ParticleSystem);
            if (np) np.resetSystem();
            this.gou.active = true;
            this.gou.setScale(0.2, 0.2);
            AudioManager.playEffect("通关");
            cc.tween(this.gou)
                .to(this.gouScaleToOneDuration, { scaleX: 1, scaleY: 1 })
                .delay(1)
                .call(() => this.finishSubLevelPassAnim())
                .start();
        } else {
            this.finishSubLevelPassAnim();
        }
    }

    private finishSubLevelPassAnim() {
        this.subLevelPassTransitioning = false;
        if (this.gou) {
            this.gou.active = false;
            this.gou.setScale(1, 1);
        }
        if (this.curlv >= this.maxSubLevel) {
            this.openEndWinDirect();
            return;
        }
        this.curlv++;
        this.initLevel();
    }

    /** 最后一小关已在校验里完成，直接出胜利 UI（避免再播第二次 gou） */
    private openEndWinDirect() {
        GameData.PauseGame = false;
        this.endwin("prefabs/hz/endwin_hz");
    }

    private stopTipsIndicator() {
        if (!this.tipsNode) return;
        cc.Tween.stopAllByTarget(this.tipsNode);
        if (this.tipsNodeOrigParent && this.tipsNode.parent !== this.tipsNodeOrigParent) {
            this.tipsNode.parent = this.tipsNodeOrigParent;
            this.tipsNode.setPosition(this.tipsNodeOrigPos.x, this.tipsNodeOrigPos.y);
        }
        this.tipsNode.active = false;
        this.tipsNode.opacity = 255;
        this.tipsNode.setScale(1, 1);
    }

    private startTipsBreathLoop() {
        if (!this.tipsNode || !this.tipsNode.active) return;
        cc.Tween.stopAllByTarget(this.tipsNode);
        const s = this.tipsBreathScale;
        const d = this.tipsBreathStep;
        const n = this.tipsNode;
        n.setScale(1, 1);
        n.opacity = 255;
        cc.tween(n)
            .to(d, { scaleX: 1 + s, scaleY: 1 + s, opacity: 200 })
            .to(d, { scaleX: 1, scaleY: 1, opacity: 255 })
            .union()
            .repeatForever()
            .start();
    }

    /** 下一个需要连接的数字格：链空为 1，否则为 chainMax+1 */
    private placeTipsOnNextTargetCell() {
        if (!this.tipsNode || !this.gridRoot) return;
        const cfg = this.getLevelCfg();
        if (!cfg || this.chainMax >= cfg.maxNum) return;
        const nextNum = this.chainMax === 0 ? 1 : this.chainMax + 1;
        const cell = this.numToCell.get(nextNum);
        if (!cell) {
            cc.warn("[lianxian_lv386] 提示：找不到数字格", nextNum);
            return;
        }
        if (!this.tipsNodeOrigParent) {
            this.tipsNodeOrigParent = this.tipsNode.parent;
            this.tipsNodeOrigPos = cc.v2(this.tipsNode.x, this.tipsNode.y);
        }
        cc.Tween.stopAllByTarget(this.tipsNode);
        this.tipsNode.parent = cell;
        this.tipsNode.setPosition(0, 0);
        this.tipsNode.active = true;
        this.tipsNode.opacity = 255;
        this.tipsNode.setScale(1, 1);
        this.startTipsBreathLoop();
    }

    /** 广告跳过：本小关视为完成，补齐连线并走 gou 流程 */
    private skipCurrentSubLevelAfterVideo() {
        if (this.isGameOver || this.subLevelPassTransitioning) return;
        const cfg = this.getLevelCfg();
        if (!cfg) return;
        this.stopTipsIndicator();
        const n = cfg.maxNum;
        const pts: cc.Vec2[] = [];
        for (let k = 1; k <= n; k++) {
            const c = this.numToCell.get(k);
            if (!c) {
                cc.warn("[lianxian_lv386] 跳过：缺少数字格", k);
                return;
            }
            pts.push(this.cellLocalPos(c));
        }
        this.pathPoints = pts;
        this.chainMax = n;
        this.dragging = false;
        this.dragStartCell = null;
        this.dragResolved = false;
        this.applyAllCellVisuals();
        this.redrawLine();
        this.updateHud();
        this.scheduleOnce(() => this.playSubLevelPassAnim(), this.gouPopDelay);
    }

    getNode() {}

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.subLevelPassTransitioning) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => {
                    this.placeTipsOnNextTargetCell();
                });
                break;
            case "x": {
                const p = even.currentTarget.parent;
                if (p) p.active = false;
                break;
            }
            case "btn_tiaoguo":
                VideoManager.getInstance().showVideo(() => {
                    this.skipCurrentSubLevelAfterVideo();
                });
                break;
        }
    }
    onlost() {
        this.scheduleOnce(this._onLostDelayShowPanel, 0.4);
    }

    private showLostPanel() {
        AssetManager.load("lv386", "lostPanel_lv386", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[lianxian_lv386] 加载 lostPanel_lv386 失败");
                this.endlost("prefabs/hz/endlost_hz");
                return;
            }
            if (!this.isGameOver || this.hearts > 0) return;
            const lostNode = cc.instantiate(prefab);
            lostNode.parent = cc.find("Canvas");
            lostNode.opacity = 0;
            const lostScript = lostNode.getComponent(lostPanel_lv386) || lostNode.addComponent(lostPanel_lv386);
            lostScript.mainGame = this;
            cc.tween(lostNode).to(0.8, { opacity: 255 }).start();
        });
    }

    restoreForFuhuo(): void {
        this.unschedule(this._onLostDelayShowPanel);
        this.isGameOver = false;
        GameData.PauseGame = false;
        this.dragging = false;
        this.dragResolved = false;
        this.dragStartCell = null;
        /** 复活：从当前已连到的最大数字继续（不重置 chainMax / pathPoints） */
        this.hearts = 3;
        this.cellBind.forEach((_meta, cell) => {
            const pn = cell.getChildByName("pressNode");
            if (pn) {
                cc.Tween.stopAllByTarget(pn);
                const m = this.cellBind.get(cell);
                const bx = m && m.pressDefSX != null ? m.pressDefSX : 1;
                const by = m && m.pressDefSY != null ? m.pressDefSY : 1;
                pn.active = false;
                pn.opacity = 255;
                pn.setScale(bx, by);
            }
        });
        this.applyAllCellVisuals();
        this.redrawLine();
        this.updateHud();
        this.updateHearts();
        this.stopTipsIndicator();
    }

    lvUpdate(): void {
        this.updateHud();
        this.updateHearts();
    }
    onwin() {
        GameData.PauseGame = false;
        this.openEndWinDirect();
    }
}
