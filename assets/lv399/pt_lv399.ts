import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import TtOffscreenVideoHelper from "../script/common/TtOffscreenVideoHelper";
import VideoManager from "../script/common/VideoManager";
// import TtOffscreenVideoHelper from "../script/common/TtOffscreenVideoHelper";
import lostPanel_lv399, { ILv399MainForLostPanel } from "./lostPanel_lv399";
import PuzzlePiece399 from "./puzzle_piece_lv399";

const { ccclass, property } = cc._decorator;

class UnionFind399 {
    private parent: number[] = [];
    constructor(n: number) {
        this.parent = [];
        for (let i = 0; i < n; i++) this.parent.push(i);
    }
    find(x: number): number {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }
    union(a: number, b: number) {
        const ra = this.find(a);
        const rb = this.find(b);
        if (ra !== rb) this.parent[ra] = rb;
    }
    same(a: number, b: number): boolean {
        return this.find(a) === this.find(b);
    }
}

@ccclass
export default class pt_lv399 extends BaseGame implements ILv399MainForLostPanel {
    canjiaohu = false;

    /** 拼图容器，需有明确宽高；锚点建议 0.5,0.5 */
    @property(cc.Node)
    playArea: cc.Node = null;

    /** 可选：带 cc.VideoPlayer 的节点，用于阶段间与通关前视频 */
    @property(cc.Node)
    videoHost: cc.Node = null;

    /**
     * 阶段过渡视频远程地址：填写目录或 URL 前缀则播放 `{base}/{关数}movie.mp4`（与分包内文件名一致）；
     * 留空则沿用分包资源 `picture_lv399/level/n/nmovie`。
     * 抖音小游戏下优先走离屏视频（与 lv257 同路线），远程 URL 最稳；仅本地分包时需运行时可解析的 nativeUrl。
     */
    @property({ displayName: "阶段视频远程目录(src)" })
    stageVideoRemoteBase = "";

    /** 调试：每块上显示原图块编号（3×3 为 0–8，4×4 为 0–15）；上线前务必取消勾选 */
    @property
    debugShowPieceIndex = false;

    /** 标题节点（子节点名 "1" / "2" / "3" 对应当前关）；不拖则尝试 bgNode/title */
    @property(cc.Node)
    title: cc.Node = null;

    /** 原图预览层（根下 ytNode，不拖则按名查找） */
    @property(cc.Node)
    ytNode: cc.Node = null;

    /** 冻结成功后的遮罩/特效节点：进入 1s 内 opacity 0→255；冻结最后一秒 255→0 解冻 */
    @property(cc.Node)
    freezeNode: cc.Node = null;

    /** 小关过渡黑幕（仅第 1、2 关通关视频结束后）：淡入→停顿→淡出后关闭 */
    @property(cc.Node)
    blackNode: cc.Node = null;

    /** 每小关倒计时（秒），可在编辑器改 */
    @property
    stageTimeSeconds = 90;

    /** 冻结按钮广告：每次成功暂停倒计时的秒数 */
    @property
    freezeAdSeconds = 60;

    private static readonly stageTotal = 3;

    private _stage: 1 | 2 | 3 = 1;
    private _gridSize = 3;
    private _grid: number[][] = [];
    private _cellNodes: PuzzlePiece399[][] = [];
    private _uf: UnionFind399 = null;
    private _sourceTex: cc.Texture2D = null;
    /** 开局翻牌：牌背 `picture_lv399/kp` */
    private _kpTex: cc.Texture2D = null;
    /** 按四角是否外轮廓凸角缓存蒙版；接缝处为直角，外边界为圆角 */
    private _stencilSfCache: Map<string, cc.SpriteFrame> = new Map();

    private _cellW = 0;
    private _cellH = 0;

    private _dragging = false;
    private _dragGroup: { r: number; c: number }[] = [];
    /** 按下时落在哪一格（锚点），用于整块平移交换 */
    private _touchAnchorCell: { r: number; c: number } = null;
    private _dragStartWorld: cc.Vec2 = cc.v2();
    private _dragPieceStarts: cc.Vec3[] = [];
    /** 防止通关视频流程重入（多次 load/play 会重复弹层、控制台多次出现 Web VideoPlayer 提示） */
    private _stageClearVideoBusy = false;

    /** 抖音离屏视频（逻辑见 TtOffscreenVideoHelper） */
    private _ttOffscreenHelper: TtOffscreenVideoHelper = null;

    /** 被挤出格滑入时 tween 时长；拖拽落点仍瞬时 setPosition */
    private readonly _swapTweenDur = 0.2;
    /** 开局翻牌：压扁/展开各半段时长（scaleX→0 时换为切片图） */
    private readonly _openingFlipHalfDur = 0.22;
    /** 牌背展示后再开始翻转的停留时间（秒） */
    private readonly _openingFlipPreDelay = 0.5;
    /** 与 scheduleOnce 对齐，避免快速重开仍执行旧翻牌 */
    private _openingFlipSeq = 0;
    /** >0 表示本局 buildGrid 已跳过开局翻牌调度，待黑幕结束后再翻；与 _openingFlipSeq 对齐用于防串关 */
    private _deferredOpeningFlipSeq = 0;
    /** 小关黑幕转场：淡出完成与 grid 就绪都满足后再翻牌（异步加载可能晚于淡出） */
    private _deferFlipBlackFadeDone = false;
    private _deferFlipGridReady = false;
    /** 有「被换位」补间时为 true，通关检测延后到补间结束 */
    private _swapTweenAnimating = false;

    /** 冻结最后 1 秒已启动 255→0 时为 true，补间结束清 _freezeRemain */
    private _freezeThawScheduled = false;

    /** 本小关已看「原图」激励：本关内再点 btn_yt 不再出广告 */
    private _stageYtRewarded = false;
    private _ytOverlayOpen = false;
    private _btnYtBound: cc.Node = null;
    private _btnDjBound: cc.Node = null;

    /** 倒计时剩余（秒，整数递减） */
    private _countdownRemain = 0;
    /** 冻结剩余秒数：>0 时不扣倒计时 */
    private _freezeRemain = 0;
    private _roundTimerActive = false;
    private _timeLabelBaseFontSize = 40;
    private _timeLabelBaseColor: cc.Color | null = null;
    private _timePanicActive = false;

    /** 与 onlost 的 scheduleOnce 对应，复活时必须 unschedule */
    private readonly _onLostDelayShowPanel = () => {
        GameData.PauseGame = true;
        if (!this.isGameOver) return;
        this.showLostPanel();
    };

    onLoad() {
        GameData.PauseGame = false;
        this.canjiaohu = true;

        this.bindHelpButtons();
        this.schedule(this.tickRoundTimer, 1);
        this.startStage(1);
    }

    /** 第 1 关 bgmlv399_2；第 2 关起 bgmlv399（与 onLoad 首关延迟一致） */
    private playStageBgm() {
        const key = this._stage === 1 ? "bgmlv399_2" : "bgmlv399";
        AudioManager.playMusic(key, true, 0.5);
    }

    onDestroy() {
        if (this._ttOffscreenHelper) {
            this._ttOffscreenHelper.clear();
        }
        this.unschedule(this._onLostDelayShowPanel);
        this.unschedule(this.tickRoundTimer);
        this.unscheduleAllCallbacks();
        this.releaseRoundStencilAsset();
        this.resetFreezeNodeVisual();
        if (this.blackNode && this.blackNode.isValid) {
            cc.Tween.stopAllByTarget(this.blackNode);
        }
        this.clearPieceTouchHandlers();
        this.unbindHelpButtons();
        const tl = this.resolveTimeLabel();
        if (tl) cc.Tween.stopAllByTarget(tl.node);
    }

    update() {
        if (this._ttOffscreenHelper) {
            this._ttOffscreenHelper.tick();
        }
    }

    private _pieceTouchRoots: cc.Node[] = [];

    private clearPieceTouchHandlers() {
        for (const n of this._pieceTouchRoots) {
            if (n && n.isValid) {
                n.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
                n.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
                n.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
                n.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            }
        }
        this._pieceTouchRoots = [];
    }

    /** 触点是否在 playArea 内（世界坐标） */
    private isTouchInPlayArea(world: cc.Vec2): boolean {
        if (!this.playArea) return false;
        return this.playArea.getBoundingBoxToWorld().contains(world);
    }

    private bindPieceTouch(root: cc.Node) {
        root.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        root.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        root.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        root.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this._pieceTouchRoots.push(root);
    }

    private resolveTitle(): cc.Node {
        if (this.title && this.title.isValid) return this.title;
        const bg = this.node.getChildByName("bgNode");
        return bg ? bg.getChildByName("title") : null;
    }

    /** 仅当前关对应的子节点（名与关卡数字一致）显示 */
    private refreshTitleByStage(stage: number) {
        const t = this.resolveTitle();
        if (!t) return;
        const key = String(stage);
        for (let i = 0; i < t.children.length; i++) {
            const ch = t.children[i];
            ch.active = ch.name === key;
        }
    }

    private gridSizeForStage(stage: number): number {
        if (stage === 1) return 3;
        if (stage === 2) return 4;
        return 5;
    }

    /** @param deferOpeningFlip 为 true 时仅铺牌背，不调度开局翻牌，需稍后调 playDeferredOpeningFlip（黑幕转场用） */
    private startStage(stage: 1 | 2 | 3, deferOpeningFlip = false) {
        this._stage = stage;
        if (stage === 1) {
            this.scheduleOnce(() => {
                this.playStageBgm();
            }, 0.5);
        } else {
            this.playStageBgm();
        }
        this.resetStageRoundState();
        this.refreshTitleByStage(stage);
        this._gridSize = this.gridSizeForStage(stage);
        this.clearPlayArea();
        const imgPath = `picture_lv399/level/${stage}/${stage}`;
        AssetManager.load(GameData.curGameStyle, imgPath, cc.Texture2D, null, (tex: cc.Texture2D) => {
            if (!tex || !this.isValid) return;
            this._sourceTex = tex;
            this._kpTex = null;
            const bundle = AssetManager.getBundle(GameData.curGameStyle);
            if (bundle) {
                bundle.load("picture_lv399/kp", cc.Texture2D, (err: Error, kpTex: cc.Texture2D) => {
                    if (!this.isValid) return;
                    if (!err && kpTex) {
                        this._kpTex = kpTex;
                    }
                    this.buildGrid(deferOpeningFlip);
                });
            } else {
                this.buildGrid(deferOpeningFlip);
            }
        });
    }

    private clearPlayArea() {
        if (!this.playArea) return;
        this.clearPieceTouchHandlers();
        this.releaseRoundStencilAsset();
        this.playArea.removeAllChildren();
        this._grid = [];
        this._cellNodes = [];
        this._uf = null;
    }

    private releaseRoundStencilAsset() {
        this._stencilSfCache.forEach((sf) => {
            if (!sf || !cc.isValid(sf)) return;
            const t = sf.getTexture();
            if (t && cc.isValid(t)) {
                t.destroy();
            }
        });
        this._stencilSfCache.clear();
    }

    /** 四角是否圆角（连通块外轮廓凸角），与蒙版缓存一致；前缀用于修正行序后使旧缓存失效 */
    private stencilCacheKeyCorners(roundTL: boolean, roundTR: boolean, roundBR: boolean, roundBL: boolean): string {
        return `v2${roundTL ? 1 : 0}${roundTR ? 1 : 0}${roundBR ? 1 : 0}${roundBL ? 1 : 0}`;
    }

    /** 与邻格是否同一拖拽/连通组（并查集） */
    private neighborInSameGroup(r: number, c: number, dr: number, dc: number): boolean {
        const gs = this._gridSize;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= gs || nc < 0 || nc >= gs) return false;
        return this._uf.find(this.idx(r, c)) === this._uf.find(this.idx(nr, nc));
    }

    /**
     * 当前格四角是否为「整块外轮廓」上的凸角（圆角应画在连通块外边界上，与邻块接缝处为直角）。
     */
    private computeCellOuterCornerConvex(r: number, c: number): {
        roundTL: boolean;
        roundTR: boolean;
        roundBR: boolean;
        roundBL: boolean;
    } {
        const roundTL = !this.neighborInSameGroup(r, c, -1, 0) && !this.neighborInSameGroup(r, c, 0, -1);
        const roundTR = !this.neighborInSameGroup(r, c, -1, 0) && !this.neighborInSameGroup(r, c, 0, 1);
        const roundBR = !this.neighborInSameGroup(r, c, 1, 0) && !this.neighborInSameGroup(r, c, 0, 1);
        const roundBL = !this.neighborInSameGroup(r, c, 1, 0) && !this.neighborInSameGroup(r, c, 0, -1);
        return { roundTL, roundTR, roundBR, roundBL };
    }

    /**
     * 像素坐标 (px,py) 左上角原点、y 向下；四角圆角半径由 buildStencilFrameFromCornerConvex 传入，与描边一致。
     */
    private pixelInsideStencilShape(
        px: number,
        py: number,
        iw: number,
        ih: number,
        rTL: number,
        rTR: number,
        rBR: number,
        rBL: number
    ): boolean {
        if (px < 0 || px > iw || py < 0 || py > ih) return false;
        if (rTL > 0 && px < rTL && py < rTL) {
            const dx = px - rTL;
            const dy = py - rTL;
            if (dx * dx + dy * dy > rTL * rTL) return false;
        }
        if (rTR > 0 && px > iw - rTR && py < rTR) {
            const dx = px - (iw - rTR);
            const dy = py - rTR;
            if (dx * dx + dy * dy > rTR * rTR) return false;
        }
        if (rBL > 0 && px < rBL && py > ih - rBL) {
            const dx = px - rBL;
            const dy = py - (ih - rBL);
            if (dx * dx + dy * dy > rBL * rBL) return false;
        }
        if (rBR > 0 && px > iw - rBR && py > ih - rBR) {
            const dx = px - (iw - rBR);
            const dy = py - (ih - rBR);
            if (dx * dx + dy * dy > rBR * rBR) return false;
        }
        return true;
    }

    private buildStencilFrameFromCornerConvex(
        roundTL: boolean,
        roundTR: boolean,
        roundBR: boolean,
        roundBL: boolean
    ): cc.SpriteFrame | null {
        const cw = this._cellW;
        const ch = this._cellH;
        if (cw <= 0 || ch <= 0) return null;
        const hw = cw * 0.5;
        const hh = ch * 0.5;
        const rr = Math.min(22, Math.min(hw, hh) * 0.28);
        const iw = Math.max(2, Math.ceil(cw));
        const ih = Math.max(2, Math.ceil(ch));
        const rPix = Math.min((rr * iw) / Math.max(cw, 1e-6), iw * 0.5, ih * 0.5);
        const rTL = roundTL ? rPix : 0;
        const rTR = roundTR ? rPix : 0;
        const rBR = roundBR ? rPix : 0;
        const rBL = roundBL ? rPix : 0;

        const data = new Uint8Array(iw * ih * 4);
        // 纹理第 0 行应对齐「y 向下、py=0 在顶」的 pixelInsideStencilShape；勿用 ih-1-br 否则行序与 UV 上下颠倒，圆角裁到错误象限
        for (let br = 0; br < ih; br++) {
            const py = br + 0.5;
            for (let x = 0; x < iw; x++) {
                const inside = this.pixelInsideStencilShape(x + 0.5, py, iw, ih, rTL, rTR, rBR, rBL);
                const idx = (br * iw + x) * 4;
                if (inside) {
                    data[idx] = 255;
                    data[idx + 1] = 255;
                    data[idx + 2] = 255;
                    data[idx + 3] = 255;
                } else {
                    data[idx + 3] = 0;
                }
            }
        }
        const tex = new cc.Texture2D();
        tex.packable = false;
        if (!tex.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, iw, ih)) {
            cc.warn("[pt_lv399] 圆角遮罩纹理 initWithData 失败");
            tex.destroy();
            return null;
        }
        tex.setFilters(cc.Texture2D.Filter.LINEAR, cc.Texture2D.Filter.LINEAR);
        const sf = new cc.SpriteFrame();
        sf.setTexture(tex);
        sf.setRect(cc.rect(0, 0, iw, ih));
        sf.setOriginalSize(cc.size(iw, ih));
        sf.setOffset(cc.v2(0, 0));
        return sf;
    }

    private getOrCreateStencilSf(
        roundTL: boolean,
        roundTR: boolean,
        roundBR: boolean,
        roundBL: boolean
    ): cc.SpriteFrame | null {
        const key = this.stencilCacheKeyCorners(roundTL, roundTR, roundBR, roundBL);
        if (this._stencilSfCache.has(key)) {
            return this._stencilSfCache.get(key);
        }
        const sf = this.buildStencilFrameFromCornerConvex(roundTL, roundTR, roundBR, roundBL);
        if (sf) {
            this._stencilSfCache.set(key, sf);
        }
        return sf;
    }

    private applyPieceStencilMask(
        comp: PuzzlePiece399,
        roundTL: boolean,
        roundTR: boolean,
        roundBR: boolean,
        roundBL: boolean
    ) {
        const clip = comp.node.getChildByName("imgClip");
        if (!clip) return;
        const mk = clip.getComponent(cc.Mask);
        if (!mk) return;
        const sf = this.getOrCreateStencilSf(roundTL, roundTR, roundBR, roundBL);
        if (!sf) return;
        const sz = comp.node.getContentSize();
        if (sz.width > 0 && sz.height > 0) {
            clip.setContentSize(sz.width, sz.height);
        }
        mk.spriteFrame = sf;
        // 运行时替换 IMAGE_STENCIL 后，部分版本不会立刻重建模板；短关开强制刷新，避免拼合后仍用旧圆角/直角
        const en = mk.enabled;
        mk.enabled = false;
        mk.enabled = en;
    }

    /** 与 refreshAllBorders 中逻辑一致 */
    private computeCellBorderFlags(r: number, c: number): { showL: boolean; showR: boolean; showT: boolean; showB: boolean } {
        const gs = this._gridSize;
        const id = this._grid[r][c];
        let showL = true;
        let showR = true;
        let showT = true;
        let showB = true;
        if (c > 0) {
            const leftId = this._grid[r][c - 1];
            if (this.isImageRightNeighbor(leftId, id)) showL = false;
        }
        if (c < gs - 1) {
            const rightId = this._grid[r][c + 1];
            if (this.isImageRightNeighbor(id, rightId)) showR = false;
        }
        if (r > 0) {
            const upId = this._grid[r - 1][c];
            if (this.isImageDownNeighbor(upId, id)) showT = false;
        }
        if (r < gs - 1) {
            const dnId = this._grid[r + 1][c];
            if (this.isImageDownNeighbor(id, dnId)) showB = false;
        }
        return { showL, showR, showT, showB };
    }

    private idx(r: number, c: number): number {
        return r * this._gridSize + c;
    }

    private buildGrid(deferOpeningFlip = false) {
        const gs = this._gridSize;
        const n = gs * gs;
        const w = this.playArea.width;
        const h = this.playArea.height;
        if (w <= 0 || h <= 0) {
            cc.warn("[pt_lv399] playArea 宽高需大于 0");
            return;
        }
        this._cellW = w / gs;
        this._cellH = h / gs;

        const perm = this.shufflePerm(n);
        this._grid = [];
        let k = 0;
        for (let r = 0; r < gs; r++) {
            this._grid[r] = [];
            for (let c = 0; c < gs; c++) {
                this._grid[r][c] = perm[k++];
            }
        }

        this._cellNodes = [];
        for (let r = 0; r < gs; r++) {
            this._cellNodes[r] = [];
        }

        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const id = this._grid[r][c];
                const node = this.createPieceNode(id);
                const pos = this.cellToLocalPos(r, c);
                node.setPosition(pos);
                node.parent = this.playArea;
                this.bindPieceTouch(node);
                const comp = node.getComponent(PuzzlePiece399);
                this._cellNodes[r][c] = comp;
            }
        }

        this.rebuildUnionFind();
        this.refreshAllBorders();

        if (this._kpTex) {
            this.canjiaohu = false;
            this._roundTimerActive = false;
            this._openingFlipSeq++;
            const flipSeq = this._openingFlipSeq;
            if (deferOpeningFlip) {
                this._deferredOpeningFlipSeq = flipSeq;
                this._deferFlipGridReady = true;
                this.tryRunDeferredOpeningFlipWhenReady();
                return;
            }
            this._deferredOpeningFlipSeq = 0;
            this.scheduleOnce(() => {
                if (!this.isValid || flipSeq !== this._openingFlipSeq) return;
                this.runOpeningFlipAnimations();
            }, this._openingFlipPreDelay);
        } else {
            this._roundTimerActive = true;
            this.ensureTimeLabelBaseCaptured();
            this.refreshTimeLabel();
            if (deferOpeningFlip) {
                this._deferFlipGridReady = true;
                this._deferredOpeningFlipSeq = 0;
                this.tryRunDeferredOpeningFlipWhenReady();
            }
        }
    }

    /** 黑幕淡出与 buildGrid（defer）都就绪后再执行开局翻牌；无待翻牌时补 canjiaohu */
    private tryRunDeferredOpeningFlipWhenReady() {
        if (!this._deferFlipBlackFadeDone || !this._deferFlipGridReady) return;
        if (!this.isValid) return;
        const seq = this._deferredOpeningFlipSeq;
        if (seq !== 0 && seq !== this._openingFlipSeq) {
            this._deferFlipBlackFadeDone = false;
            this._deferFlipGridReady = false;
            return;
        }
        this._deferFlipBlackFadeDone = false;
        this._deferFlipGridReady = false;
        if (seq !== 0) {
            this._deferredOpeningFlipSeq = 0;
            this.runOpeningFlipAnimations();
        } else {
            this.canjiaohu = true;
        }
    }

    /** 每块先牌背，scaleX→0 时换切片，再展开 */
    private runOpeningFlipAnimations() {
        AudioManager.playEffect("翻卡");
        const gs = this._gridSize;
        const half = this._openingFlipHalfDur;
        let pending = gs * gs;
        const onOneDone = () => {
            pending--;
            if (pending <= 0 && this.isValid) {
                this.canjiaohu = true;
                this._roundTimerActive = true;
                this.ensureTimeLabelBaseCaptured();
                this.refreshTimeLabel();
            }
        };
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const comp = this._cellNodes[r][c];
                if (!comp) {
                    onOneDone();
                    continue;
                }
                const node = comp.node;
                cc.Tween.stopAllByTarget(node);
                node.setScale(1, 1, 1);
                cc.tween(node)
                    .to(half, { scaleX: 0 })
                    .call(() => {
                        if (!this.isValid || !comp.isValid) return;
                        comp.setSpriteFrame(this.makeSpriteFrame(comp.correctId));
                    })
                    .to(half, { scaleX: 1 })
                    .call(() => onOneDone())
                    .start();
            }
        }
    }

    private resolveBgNode(): cc.Node {
        return this.node.getChildByName("bgNode");
    }

    private resolveBtnYt(): cc.Node {
        const bg = this.resolveBgNode();
        return bg ? bg.getChildByName("btn_yt") : null;
    }

    private resolveBtnDj(): cc.Node {
        const bg = this.resolveBgNode();
        return bg ? bg.getChildByName("btn_dj") : null;
    }

    private resolveYtNode(): cc.Node {
        if (this.ytNode && this.ytNode.isValid) return this.ytNode;
        return this.node.getChildByName("ytNode");
    }

    private resolveFreezeNode(): cc.Node {
        if (this.freezeNode && this.freezeNode.isValid) return this.freezeNode;
        return this.node.getChildByName("freezeNode");
    }

    private resetFreezeNodeVisual() {
        const n = this.resolveFreezeNode();
        if (!n) return;
        cc.Tween.stopAllByTarget(n);
        n.opacity = 0;
        this._freezeThawScheduled = false;
    }

    /** 点击冻结并加秒成功后：1s 内 opacity 0→255 */
    private playFreezeEnterFade() {
        const n = this.resolveFreezeNode();
        if (!n) return;
        cc.Tween.stopAllByTarget(n);
        n.active = true;
        n.opacity = 0;
        cc.tween(n).to(1, { opacity: 255 }).start();
    }

    /** 冻结剩余 1 秒时：255→0（1s），补间结束解冻 */
    private startFreezeThaw() {
        const n = this.resolveFreezeNode();
        if (!n) {
            this._freezeRemain = 0;
            this._freezeThawScheduled = false;
            return;
        }
        this._freezeThawScheduled = true;
        cc.Tween.stopAllByTarget(n);
        n.active = true;
        n.opacity = 255;
        AudioManager.playEffect("freeze");
        cc.tween(n)
            .to(1, { opacity: 0 })
            .call(() => {
                if (!this.isValid) return;
                this._freezeRemain = 0;
                this._freezeThawScheduled = false;
            })
            .start();
    }

    private resolveShowPic(): cc.Node {
        const root = this.resolveYtNode();
        return root ? root.getChildByName("showpic") : null;
    }

    private resolveTimeLabel(): cc.Label {
        const bg = this.resolveBgNode();
        const tn = bg ? bg.getChildByName("timeNode") : null;
        const labNode = tn ? tn.getChildByName("timeLabel") : null;
        return labNode ? labNode.getComponent(cc.Label) : null;
    }

    private bindHelpButtons() {
        const y = this.resolveBtnYt();
        const d = this.resolveBtnDj();
        if (y) {
            y.on(cc.Node.EventType.TOUCH_END, this.onBtnYtClick, this);
            this._btnYtBound = y;
        }
        if (d) {
            d.on(cc.Node.EventType.TOUCH_END, this.onBtnDjClick, this);
            this._btnDjBound = d;
        }
    }

    private unbindHelpButtons() {
        if (this._btnYtBound && this._btnYtBound.isValid) {
            this._btnYtBound.off(cc.Node.EventType.TOUCH_END, this.onBtnYtClick, this);
        }
        this._btnYtBound = null;
        if (this._btnDjBound && this._btnDjBound.isValid) {
            this._btnDjBound.off(cc.Node.EventType.TOUCH_END, this.onBtnDjClick, this);
        }
        this._btnDjBound = null;
        const yn = this.resolveYtNode();
        if (yn && yn.isValid) {
            yn.off(cc.Node.EventType.TOUCH_END, this.onYtOverlayTap, this);
        }
    }

    private setBtnYtLuxiangVisible(show: boolean) {
        const btn = this.resolveBtnYt();
        if (!btn) return;
        const lx = btn.getChildByName("luxiang");
        if (lx) lx.active = show;
    }

    /** 新一小关：倒计时、冻结、原图广告状态、关闭预览层 */
    private resetStageRoundState() {
        this.isGameOver = false;
        this._countdownRemain = Math.max(0, Math.floor(this.stageTimeSeconds));
        this._freezeRemain = 0;
        this.resetFreezeNodeVisual();
        this._roundTimerActive = false;
        this._stageYtRewarded = false;
        this._ytOverlayOpen = false;
        this.setBtnYtLuxiangVisible(true);
        this.closeYtPreviewImmediate();
        this.syncTimeLabelPanic(false);
    }

    private ensureTimeLabelBaseCaptured() {
        const lb = this.resolveTimeLabel();
        if (!lb || this._timeLabelBaseColor) return;
        this._timeLabelBaseFontSize = lb.fontSize;
        this._timeLabelBaseColor = lb.node.color.clone();
    }

    private tickRoundTimer() {
        if (!this._roundTimerActive || !this.isValid) return;
        if (GameData.PauseGame || this._stageClearVideoBusy) return;
        if (this._freezeRemain > 0) {
            if (this._freezeRemain > 1) {
                this._freezeRemain--;
                return;
            }
            // === 1：冻结的最后 1 秒，播解冻渐隐（补间内不再扣秒）
            if (!this._freezeThawScheduled) {
                this.startFreezeThaw();
            }
            return;
        }
        if (this._countdownRemain > 0) {
            this._countdownRemain--;
            this.refreshTimeLabel();
            if (this._countdownRemain <= 0) {
                this.onRoundTimeUp();
            }
        }
    }

    private refreshTimeLabel() {
        const lb = this.resolveTimeLabel();
        if (!lb) return;
        const sec = Math.max(0, Math.ceil(this._countdownRemain));
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
        lb.string = `${pad(m)}:${pad(s)}`;
        const ceil = Math.ceil(this._countdownRemain);
        const panic = ceil <= 10 && ceil > 0 && this._roundTimerActive;
        this.syncTimeLabelPanic(panic);
    }

    private syncTimeLabelPanic(active: boolean) {
        const lb = this.resolveTimeLabel();
        if (!lb) return;
        if (active) {
            if (this._timePanicActive) return;
            this._timePanicActive = true;
            this.ensureTimeLabelBaseCaptured();
            lb.node.color = cc.Color.RED;
            lb.fontSize = Math.max(12, Math.floor(this._timeLabelBaseFontSize * 1.28));
            cc.Tween.stopAllByTarget(lb.node);
            lb.node.setScale(1);
            cc.tween(lb.node)
                .to(0.22, { scale: 1.12 })
                .to(0.22, { scale: 1 })
                .union()
                .repeatForever()
                .start();
        } else {
            if (!this._timePanicActive && !this._timeLabelBaseColor) return;
            this._timePanicActive = false;
            cc.Tween.stopAllByTarget(lb.node);
            lb.node.setScale(1);
            if (this._timeLabelBaseColor) {
                lb.node.color = this._timeLabelBaseColor.clone();
            }
            lb.fontSize = this._timeLabelBaseFontSize;
        }
    }

    private onRoundTimeUp() {
        this._roundTimerActive = false;
        this.syncTimeLabelPanic(false);
        this.canjiaohu = false;
        this.isGameOver = true;
        this.onlost();
    }

    onlost() {
        this.scheduleOnce(this._onLostDelayShowPanel, 0.4);
    }

    private showLostPanel() {
        AssetManager.load(GameData.curGameStyle, "lostPanel_lv399", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[pt_lv399] 加载 lostPanel_lv399 失败");
                this.endlost("prefabs/hz/endlost_hz");
                return;
            }
            if (!this.isGameOver) return;
            const lostNode = cc.instantiate(prefab);
            lostNode.parent = cc.find("Canvas");
            lostNode.opacity = 0;
            const lostScript = lostNode.getComponent(lostPanel_lv399) || lostNode.addComponent(lostPanel_lv399);
            lostScript.mainGame = this;
            cc.tween(lostNode).to(0.8, { opacity: 255 }).start();
        });
    }

    restoreForFuhuo(): void {
        this.unschedule(this._onLostDelayShowPanel);
        this.isGameOver = false;
        GameData.PauseGame = false;
        this._dragging = false;
        this._dragGroup = [];
        this._touchAnchorCell = null;
        this.snapGroupToGrid();
        this._countdownRemain = Math.max(0, Math.floor(this.stageTimeSeconds));
        this._freezeRemain = 0;
        this.resetFreezeNodeVisual();
        this._roundTimerActive = true;
        this.canjiaohu = true;
        this.refreshTimeLabel();
        this.syncTimeLabelPanic(false);
    }

    lvUpdate(): void {
        this.refreshTimeLabel();
    }

    private makeFullImageSpriteFrame(): cc.SpriteFrame {
        const tex = this._sourceTex;
        const sf = new cc.SpriteFrame();
        sf.setTexture(tex);
        sf.setRect(cc.rect(0, 0, tex.width, tex.height));
        sf.setOriginalSize(cc.size(tex.width, tex.height));
        sf.setOffset(cc.v2(0, 0));
        return sf;
    }

    /** 激励视频：播前暂停 BGM，结束（成功/失败）后恢复 */
    private runRewardVideo(succ: () => void, fail?: () => void) {
        AudioManager.pauseMusic();
        VideoManager.getInstance().showVideo(
            () => {
                AudioManager.resumeMusic();
                succ();
            },
            () => {
                AudioManager.resumeMusic();
                if (fail) fail();
            }
        );
    }

    private onBtnYtClick() {
        if (GameData.PauseGame || !this.canjiaohu) return;
        if (this._ytOverlayOpen) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        if (!this._stageYtRewarded) {
            this.runRewardVideo(() => {
                this._stageYtRewarded = true;
                this.setBtnYtLuxiangVisible(false);
            });
            return;
        }
        this.openYtPreview();
    }

    private onBtnDjClick() {
        if (GameData.PauseGame || !this.canjiaohu) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.runRewardVideo(() => {
            this.resetFreezeNodeVisual();
            this._freezeRemain += Math.max(0, Math.floor(this.freezeAdSeconds));
            this.playFreezeEnterFade();
            AudioManager.playEffect("freeze");
        });
    }

    private openYtPreview() {
        if (!this._sourceTex) return;
        const root = this.resolveYtNode();
        const spNode = this.resolveShowPic();
        if (!root || !spNode) {
            cc.warn("[pt_lv399] ytNode/showpic 未找到");
            return;
        }
        const sp = spNode.getComponent(cc.Sprite);
        if (!sp) {
            cc.warn("[pt_lv399] showpic 需带 Sprite");
            return;
        }
        sp.type = cc.Sprite.Type.SIMPLE;
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.trim = false;
        sp.spriteFrame = this.makeFullImageSpriteFrame();
        spNode.setContentSize(this._sourceTex.width, this._sourceTex.height);

        this._ytOverlayOpen = true;
        cc.Tween.stopAllByTarget(spNode);
        spNode.setScale(0);
        root.active = true;
        root.off(cc.Node.EventType.TOUCH_END, this.onYtOverlayTap, this);
        root.on(cc.Node.EventType.TOUCH_END, this.onYtOverlayTap, this);
        cc.tween(spNode).to(0.18, { scale: 0.5 }).start();
    }

    private onYtOverlayTap() {
        if (!this._ytOverlayOpen) return;
        this.closeYtPreviewAnimated();
    }

    private closeYtPreviewAnimated() {
        const root = this.resolveYtNode();
        const spNode = this.resolveShowPic();
        if (!root || !spNode) {
            this.closeYtPreviewImmediate();
            return;
        }
        cc.Tween.stopAllByTarget(spNode);
        cc.tween(spNode)
            .to(0.12, { scale: 0 })
            .call(() => {
                this._ytOverlayOpen = false;
                root.active = false;
                root.off(cc.Node.EventType.TOUCH_END, this.onYtOverlayTap, this);
            })
            .start();
    }

    private closeYtPreviewImmediate() {
        const root = this.resolveYtNode();
        const spNode = this.resolveShowPic();
        if (spNode) {
            cc.Tween.stopAllByTarget(spNode);
            spNode.setScale(0);
        }
        if (root) {
            root.off(cc.Node.EventType.TOUCH_END, this.onYtOverlayTap, this);
            root.active = false;
        }
        this._ytOverlayOpen = false;
    }

    private shufflePerm(n: number): number[] {
        const a: number[] = [];
        for (let i = 0; i < n; i++) a.push(i);
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    private makeSpriteFrame(id: number): cc.SpriteFrame {
        const tex = this._sourceTex;
        const gs = this._gridSize;
        const pw = tex.width / gs;
        const ph = tex.height / gs;
        const col = id % gs;
        /** 原图第几行：0=最上一行(块 0..gs-1)，gs-1=最下一行 */
        const row = Math.floor(id / gs);
        const sf = new cc.SpriteFrame();
        sf.setTexture(tex);
        // 纹理第 0 行在文件上方：id 0..gs-1 为原图最上一行
        sf.setRect(cc.rect(col * pw, row * ph, pw, ph));
        sf.setOriginalSize(cc.size(pw, ph));
        sf.setOffset(cc.v2(0, 0));
        return sf;
    }

    private makeKpSpriteFrame(): cc.SpriteFrame {
        const kp = this._kpTex;
        const sf = new cc.SpriteFrame();
        sf.setTexture(kp);
        sf.setRect(cc.rect(0, 0, kp.width, kp.height));
        sf.setOriginalSize(cc.size(kp.width, kp.height));
        sf.setOffset(cc.v2(0, 0));
        return sf;
    }

    private createPieceNode(correctId: number): cc.Node {
        const cw = this._cellW;
        const ch = this._cellH;
        const root = new cc.Node(`piece_${correctId}`);
        root.setContentSize(cw, ch);

        let sp: cc.Sprite = null;
        const initialStencil = this.getOrCreateStencilSf(true, true, true, true);
        if (initialStencil) {
            const clip = new cc.Node("imgClip");
            clip.parent = root;
            clip.setContentSize(cw, ch);
            const mk = clip.addComponent(cc.Mask);
            mk.type = cc.Mask.Type.IMAGE_STENCIL;
            mk.alphaThreshold = 0.05;
            mk.spriteFrame = initialStencil;

            const img = new cc.Node("img");
            img.parent = clip;
            img.setContentSize(cw, ch);
            sp = img.addComponent(cc.Sprite);
        } else {
            sp = root.addComponent(cc.Sprite);
        }
        sp.type = cc.Sprite.Type.SIMPLE;
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.trim = false;

        const bd = new cc.Node("bd");
        bd.parent = root;
        bd.setContentSize(cw, ch);
        bd.zIndex = 2;
        const g = bd.addComponent(cc.Graphics);

        const comp = root.addComponent(PuzzlePiece399);
        comp.correctId = correctId;
        comp.init(sp, g, cw, ch);
        if (this._kpTex) {
            comp.setSpriteFrame(this.makeKpSpriteFrame());
        } else {
            comp.setSpriteFrame(this.makeSpriteFrame(correctId));
        }
        comp.refreshBorders(true, true, true, true, true, true, true, true);
        comp.applyPieceIndexDebug(this.debugShowPieceIndex, cw, ch, correctId);

        return root;
    }

    private cellToLocalPos(r: number, c: number): cc.Vec3 {
        const w = this.playArea.width;
        const h = this.playArea.height;
        const cw = this._cellW;
        const ch = this._cellH;
        const x = -w * 0.5 + (c + 0.5) * cw;
        const y = h * 0.5 - (r + 0.5) * ch;
        return cc.v3(x, y, 0);
    }

    private worldToCell(world: cc.Vec2): { r: number; c: number } | null {
        if (!this.playArea) return null;
        const lp = this.playArea.convertToNodeSpaceAR(world);
        const w = this.playArea.width;
        const h = this.playArea.height;
        const lx = lp.x + w * 0.5;
        const ly = h * 0.5 - lp.y;
        let c = Math.floor(lx / this._cellW);
        let r = Math.floor(ly / this._cellH);
        const gs = this._gridSize;
        if (r < 0 || r >= gs || c < 0 || c >= gs) return null;
        return { r, c };
    }

    private idRow(id: number): number {
        return Math.floor(id / this._gridSize);
    }

    private idCol(id: number): number {
        return id % this._gridSize;
    }

    /** 原图中 a 在左、b 在右且为同一行相邻两格 */
    private isImageRightNeighbor(a: number, b: number): boolean {
        const a0 = a | 0;
        const b0 = b | 0;
        const gs = this._gridSize | 0;
        if (this.idCol(a0) >= gs - 1) return false;
        return this.idRow(a0) === this.idRow(b0) && b0 === a0 + 1;
    }

    /** 原图中 a 在上、b 在下且为同一列相邻两行（编号相差一整行 gs） */
    private isImageDownNeighbor(a: number, b: number): boolean {
        const a0 = a | 0;
        const b0 = b | 0;
        const gs = this._gridSize | 0;
        if (gs < 1) return false;
        if (this.idRow(a0) >= gs - 1) return false;
        if (this.idCol(a0) !== this.idCol(b0)) return false;
        return b0 === a0 + gs;
    }

    /** 当前棋盘上「原图边对边」正确邻接条数（横+竖各计一条） */
    private countCorrectEdges(): number {
        const gs = this._gridSize | 0;
        let n = 0;
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const a = this._grid[r][c];
                if (c + 1 < gs) {
                    const b = this._grid[r][c + 1];
                    if (this.isImageRightNeighbor(a, b)) n++;
                }
                if (r + 1 < gs) {
                    const dn = this._grid[r + 1][c];
                    if (this.isImageDownNeighbor(a, dn)) n++;
                }
            }
        }
        return n;
    }

    /** 保证 _grid 与节点 correctId/贴图一致后再算连通（避免交换后不同步导致误判连接） */
    private ensureGridVisualSync() {
        const gs = this._gridSize;
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const comp = this._cellNodes[r][c];
                if (!comp) continue;
                const gid = this._grid[r][c];
                if (comp.correctId !== gid) {
                    comp.correctId = gid;
                    comp.setSpriteFrame(this.makeSpriteFrame(gid));
                }
                comp.syncPieceIndexLabel(gid);
            }
        }
    }

    private rebuildUnionFind() {
        this.ensureGridVisualSync();
        const gs = this._gridSize | 0;
        const n = gs * gs;
        this._uf = new UnionFind399(n);
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const a = this._grid[r][c];
                if (c + 1 < gs) {
                    const b = this._grid[r][c + 1];
                    if (this.isImageRightNeighbor(a, b)) {
                        this._uf.union(this.idx(r, c), this.idx(r, c + 1));
                    }
                }
            }
        }
        for (let r = 0; r < gs - 1; r++) {
            for (let c = 0; c < gs; c++) {
                const up = this._grid[r][c];
                const dn = this._grid[r + 1][c];
                if (this.isImageDownNeighbor(up, dn)) {
                    this._uf.union(this.idx(r, c), this.idx(r + 1, c));
                }
            }
        }
    }

    private collectGroupCells(r: number, c: number): { r: number; c: number }[] {
        const root = this._uf.find(this.idx(r, c));
        const gs = this._gridSize;
        const out: { r: number; c: number }[] = [];
        for (let rr = 0; rr < gs; rr++) {
            for (let cc = 0; cc < gs; cc++) {
                if (this._uf.find(this.idx(rr, cc)) === root) {
                    out.push({ r: rr, c: cc });
                }
            }
        }
        return out;
    }

    private refreshAllBorders() {
        const gs = this._gridSize;
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const comp = this._cellNodes[r][c];
                if (!comp) continue;
                const f = this.computeCellBorderFlags(r, c);
                const co = this.computeCellOuterCornerConvex(r, c);
                comp.refreshBorders(f.showL, f.showR, f.showT, f.showB, co.roundTL, co.roundTR, co.roundBR, co.roundBL);
                this.applyPieceStencilMask(comp, co.roundTL, co.roundTR, co.roundBR, co.roundBL);
            }
        }
    }

    private checkWin(): boolean {
        const gs = this._gridSize;
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                if (this._grid[r][c] !== r * gs + c) return false;
            }
        }
        return true;
    }

    private onTouchStart(e: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.canjiaohu || !this.playArea) return;
        const w = e.getLocation();
        if (!this.isTouchInPlayArea(w)) return;
        const cell = this.worldToCell(w);
        if (!cell) return;
        this._touchAnchorCell = { r: cell.r, c: cell.c };
        this.rebuildUnionFind();
        this._dragGroup = this.collectGroupCells(cell.r, cell.c);
        if (this._dragGroup.length === 0) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this._dragging = true;
        this._dragStartWorld = w.clone();
        this._dragPieceStarts = [];
        for (const p of this._dragGroup) {
            const node = this._cellNodes[p.r][p.c].node;
            this._dragPieceStarts.push(node.position.clone());
        }
        for (const p of this._dragGroup) {
            this._cellNodes[p.r][p.c].node.zIndex = 100;
        }
    }

    private onTouchMove(e: cc.Event.EventTouch) {
        if (!this._dragging || GameData.PauseGame) return;
        const cur = e.getLocation();
        const dx = cur.x - this._dragStartWorld.x;
        const dy = cur.y - this._dragStartWorld.y;
        for (let i = 0; i < this._dragGroup.length; i++) {
            const p = this._dragGroup[i];
            const node = this._cellNodes[p.r][p.c].node;
            const st = this._dragPieceStarts[i];
            node.setPosition(st.x + dx, st.y + dy, st.z);
        }
    }

    private onTouchEnd(e: cc.Event.EventTouch) {
        if (!this._dragging) return;
        this._dragging = false;

        for (const p of this._dragGroup) {
            this._cellNodes[p.r][p.c].node.zIndex = 0;
        }

        if (GameData.PauseGame || !this.canjiaohu) {
            this.snapGroupToGrid();
            return;
        }

        const dropCell = this.worldToCell(e.getLocation());
        if (!dropCell) {
            this.snapGroupToGrid();
            return;
        }

        const cellsD = this._dragGroup.slice();
        const anchor = this._touchAnchorCell;
        const edgesBeforeSwap = this.countCorrectEdges();
        // 仅整块刚体平移；若越界或其它原因失败，整组吸附，不再做「两组各 k 个配对」部分交换（否则会拆组）
        if (
            anchor &&
            (dropCell.r !== anchor.r || dropCell.c !== anchor.c) &&
            this.tryRigidGroupTranslation(anchor, dropCell, cellsD)
        ) {
            this.rebuildUnionFind();
            this.refreshAllBorders();
            if (this.countCorrectEdges() > edgesBeforeSwap) {
                AudioManager.playEffect("contact");
            }
            if (!this._swapTweenAnimating) {
                this.snapGroupToGrid();
                if (this.checkWin()) {
                    this.onStageClear();
                }
            }
            return;
        }

        this.snapGroupToGrid();
    }

    /**
     * 被挤出块填入腾空格：
     * 1）若腾空格全部在同一行、挤出格也全部在同一行：按列升序一一对应（保持左右相对顺序，避免「同列优先」把最左空位塞成最右挤出块）。
     * 2）若全部在同一列：按行升序一一对应（保持上下相对顺序）。
     * 3）否则：优先源格与空位「同行或同列」曼哈顿最小（displacedMatchScore）；再 sortDisplacedToMatchVacated 兜底配对剩余。
     */
    private orderDisplacedForVacated(
        vacated: { r: number; c: number }[],
        displacedFrom: { r: number; c: number }[],
        dr: number,
        dc: number
    ): { r: number; c: number }[] {
        const n = vacated.length;
        if (n === 0) {
            return [];
        }

        const vr0 = vacated[0].r;
        const dr0 = displacedFrom[0].r;
        const allVacSameRow = vacated.every((p) => p.r === vr0);
        const allDispSameRow = displacedFrom.every((p) => p.r === dr0);
        if (allVacSameRow && allDispSameRow) {
            const dispByC = displacedFrom.slice().sort((a, b) => a.c - b.c || a.r - b.r);
            return dispByC.slice();
        }

        const vc0 = vacated[0].c;
        const dc0 = displacedFrom[0].c;
        const allVacSameCol = vacated.every((p) => p.c === vc0);
        const allDispSameCol = displacedFrom.every((p) => p.c === dc0);
        if (allVacSameCol && allDispSameCol) {
            const dispByR = displacedFrom.slice().sort((a, b) => a.r - b.r || a.c - b.c);
            return dispByR.slice();
        }

        const used = new Array(displacedFrom.length).fill(false);
        const pickJ = new Array<number>(n).fill(-1);

        for (let i = 0; i < n; i++) {
            const v = vacated[i];
            let bestJ = -1;
            let bestScore = 2147483647;
            for (let j = 0; j < displacedFrom.length; j++) {
                if (used[j]) continue;
                const d = displacedFrom[j];
                if (d.r !== v.r && d.c !== v.c) continue;
                const sc = this.displacedMatchScore(d, v, dr, dc);
                if (bestJ < 0 || sc < bestScore || (sc === bestScore && j < bestJ)) {
                    bestScore = sc;
                    bestJ = j;
                }
            }
            if (bestJ >= 0) {
                pickJ[i] = bestJ;
                used[bestJ] = true;
            }
        }

        const remI: number[] = [];
        const remJ: number[] = [];
        for (let i = 0; i < n; i++) {
            if (pickJ[i] < 0) remI.push(i);
        }
        for (let j = 0; j < displacedFrom.length; j++) {
            if (!used[j]) remJ.push(j);
        }
        const kRem = remI.length;
        if (kRem > 0) {
            const remCells = remJ.map((j) => displacedFrom[j]);
            this.sortDisplacedToMatchVacated(remCells, dr, dc);
            for (let k = 0; k < kRem; k++) {
                const cell = remCells[k];
                const jj = remJ.find(
                    (j) => !used[j] && displacedFrom[j].r === cell.r && displacedFrom[j].c === cell.c
                );
                if (jj !== undefined) {
                    pickJ[remI[k]] = jj;
                    used[jj] = true;
                }
            }
        }

        const out: { r: number; c: number }[] = [];
        for (let i = 0; i < n; i++) {
            out.push(displacedFrom[pickJ[i]]);
        }
        return out;
    }

    /** 越小越好：距离优先；再纵移优先同列、横移优先同行 */
    private displacedMatchScore(d: { r: number; c: number }, v: { r: number; c: number }, dr: number, dc: number): number {
        const dist = Math.abs(d.r - v.r) + Math.abs(d.c - v.c);
        const sameC = d.c === v.c ? 1 : 0;
        const sameR = d.r === v.r ? 1 : 0;
        const preferCol = Math.abs(dr) >= Math.abs(dc);
        const tie = preferCol ? (1 - sameC) * 2 + (1 - sameR) : (1 - sameR) * 2 + (1 - sameC);
        return dist * 100 + tie;
    }

    private sortDisplacedToMatchVacated(displaced: { r: number; c: number }[], dr: number, dc: number) {
        if (dr !== 0 && dc !== 0) {
            displaced.sort((a, b) => a.r - b.r || a.c - b.c);
            return;
        }
        const ad = Math.abs(dr);
        const adc = Math.abs(dc);
        if (ad >= adc) {
            if (dr > 0) {
                displaced.sort((a, b) => a.c - b.c || b.r - a.r);
            } else if (dr < 0) {
                displaced.sort((a, b) => a.c - b.c || a.r - b.r);
            } else {
                displaced.sort((a, b) => a.r - b.r || a.c - b.c);
            }
        } else {
            if (dc > 0) {
                displaced.sort((a, b) => a.r - b.r || b.c - a.c);
            } else if (dc < 0) {
                displaced.sort((a, b) => a.r - b.r || a.c - b.c);
            } else {
                displaced.sort((a, b) => a.r - b.r || a.c - b.c);
            }
        }
    }

    /**
     * 整块刚体平移：向量 T = drop - anchor，组内每格 p 上的块移到 p+T。
     * 允许目标格仍在组内（如 U 形下移时顶格落到侧格）；此时不能逐对 swap，需整图置换。
     * 腾空格 G\\Dest 与挤出格 Dest\\G 数量相同；填入顺序见 orderDisplacedForVacated（同行/同列优先，再兜底）。
     */
    private tryRigidGroupTranslation(
        anchor: { r: number; c: number },
        dropCell: { r: number; c: number },
        cellsD: { r: number; c: number }[]
    ): boolean {
        const gs = this._gridSize;
        const dr = dropCell.r - anchor.r;
        const dc = dropCell.c - anchor.c;
        const dragIdx = new Set<number>();
        for (const p of cellsD) {
            dragIdx.add(this.idx(p.r, p.c));
        }
        const destCells: { r: number; c: number }[] = [];
        const destSet = new Set<number>();
        for (const p of cellsD) {
            const tr = p.r + dr;
            const tc = p.c + dc;
            if (tr < 0 || tr >= gs || tc < 0 || tc >= gs) {
                return false;
            }
            const tk = this.idx(tr, tc);
            if (destSet.has(tk)) {
                return false;
            }
            destSet.add(tk);
            destCells.push({ r: tr, c: tc });
        }

        const vacated: { r: number; c: number }[] = [];
        for (const p of cellsD) {
            if (!destSet.has(this.idx(p.r, p.c))) {
                vacated.push({ r: p.r, c: p.c });
            }
        }
        const displacedFrom: { r: number; c: number }[] = [];
        for (const t of destCells) {
            if (!dragIdx.has(this.idx(t.r, t.c))) {
                displacedFrom.push({ r: t.r, c: t.c });
            }
        }
        if (vacated.length !== displacedFrom.length) {
            return false;
        }
        vacated.sort((a, b) => a.r - b.r || a.c - b.c);
        const displacedOrdered = this.orderDisplacedForVacated(vacated, displacedFrom, dr, dc);

        const newId: number[][] = [];
        for (let r = 0; r < gs; r++) {
            newId[r] = this._grid[r].slice();
        }
        for (const t of destCells) {
            const pr = t.r - dr;
            const pc = t.c - dc;
            newId[t.r][t.c] = this._grid[pr][pc];
        }
        for (let i = 0; i < vacated.length; i++) {
            const v = vacated[i];
            const df = displacedOrdered[i];
            newId[v.r][v.c] = this._grid[df.r][df.c];
        }

        const oldN: PuzzlePiece399[][] = [];
        for (let r = 0; r < gs; r++) {
            oldN[r] = this._cellNodes[r].slice();
        }
        const newCompAt: PuzzlePiece399[][] = [];
        for (let r = 0; r < gs; r++) {
            newCompAt[r] = this._cellNodes[r].slice();
        }
        for (const t of destCells) {
            const pr = t.r - dr;
            const pc = t.c - dc;
            newCompAt[t.r][t.c] = oldN[pr][pc];
        }
        for (let i = 0; i < vacated.length; i++) {
            const v = vacated[i];
            const df = displacedOrdered[i];
            newCompAt[v.r][v.c] = oldN[df.r][df.c];
        }

        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const comp = newCompAt[r][c];
                if (!comp) continue;
                const id = newId[r][c];
                this._grid[r][c] = id;
                this._cellNodes[r][c] = comp;
                comp.correctId = id;
                comp.setSpriteFrame(this.makeSpriteFrame(id));
                comp.syncPieceIndexLabel(id);
            }
        }

        if (vacated.length > 0) {
            this._swapTweenAnimating = true;
            this.canjiaohu = false;
            let pending = vacated.length;

            for (const t of destCells) {
                const comp = this._cellNodes[t.r][t.c];
                cc.Tween.stopAllByTarget(comp.node);
                comp.node.setPosition(this.cellToLocalPos(t.r, t.c));
                comp.node.zIndex = 0;
            }

            const dur = this._swapTweenDur;
            for (let i = 0; i < vacated.length; i++) {
                const v = vacated[i];
                const df = displacedOrdered[i];
                const comp = this._cellNodes[v.r][v.c];
                const end = this.cellToLocalPos(v.r, v.c);
                const start = this.cellToLocalPos(df.r, df.c);
                comp.node.setPosition(start);
                comp.node.zIndex = 200;
                cc.Tween.stopAllByTarget(comp.node);
                cc.tween(comp.node)
                    .to(dur, { x: end.x, y: end.y, z: end.z })
                    .call(() => {
                        if (!comp.node || !comp.node.isValid) {
                            return;
                        }
                        comp.node.zIndex = 0;
                        comp.node.setPosition(end);
                        pending--;
                        if (pending <= 0) {
                            this._swapTweenAnimating = false;
                            this.canjiaohu = true;
                            if (this.checkWin()) {
                                this.onStageClear();
                            }
                        }
                    })
                    .start();
            }
        } else {
            this._swapTweenAnimating = false;
            for (let r = 0; r < gs; r++) {
                for (let c = 0; c < gs; c++) {
                    const comp = this._cellNodes[r][c];
                    if (!comp) continue;
                    cc.Tween.stopAllByTarget(comp.node);
                    comp.node.setPosition(this.cellToLocalPos(r, c));
                    comp.node.zIndex = 0;
                }
            }
        }
        return true;
    }

    private snapGroupToGrid() {
        const gs = this._gridSize;
        for (let r = 0; r < gs; r++) {
            for (let c = 0; c < gs; c++) {
                const comp = this._cellNodes[r][c];
                if (!comp) continue;
                comp.node.setPosition(this.cellToLocalPos(r, c));
            }
        }
    }

    /**
     * 第 1、2 小关：0.2s 淡入至全黑时切下一关（牌背，defer 翻牌）→ 停 0.5s → 0.2s 淡出 → 再翻面。
     * 无 blackNode 时直接切关并照常延迟翻牌。
     */
    private runStageBlackTransition(onFullBlack: () => void, onFadeOutComplete: () => void) {
        const n = this.blackNode;
        if (!n || !n.isValid) {
            onFullBlack();
            return;
        }
        this._deferFlipBlackFadeDone = false;
        this._deferFlipGridReady = false;
        cc.Tween.stopAllByTarget(n);
        n.active = true;
        n.opacity = 0;
        cc.tween(n)
            .to(0.2, { opacity: 255 })
            .call(() => {
                if (this.isValid) {
                    onFullBlack();
                }
            })
            .delay(0.5)
            .to(0.2, { opacity: 0 })
            .call(() => {
                if (n && n.isValid) {
                    n.active = false;
                }
                if (this.isValid) {
                    this._deferFlipBlackFadeDone = true;
                    onFadeOutComplete();
                }
            })
            .start();
    }

    private onStageClear() {
        if (this._stageClearVideoBusy) {
            return;
        }
        this._stageClearVideoBusy = true;
        this.canjiaohu = false;
        GameData.PauseGame = true;
        const st = this._stage;
        const onVideoFlowDone = () => {
            this._stageClearVideoBusy = false;
            if (st < pt_lv399.stageTotal) {
                const next = (st + 1) as 1 | 2 | 3;
                if (this.blackNode && this.blackNode.isValid) {
                    this.runStageBlackTransition(
                        () => {
                            GameData.PauseGame = false;
                            this.startStage(next, true);
                        },
                        () => {
                            this.tryRunDeferredOpeningFlipWhenReady();
                        }
                    );
                } else {
                    GameData.PauseGame = false;
                    this.startStage(next, false);
                }
            } else {
                GameData.PauseGame = false;
                this.onwin();
            }
        };
        this.playStageVideo(st, onVideoFlowDone);
    }

    /** 与分包内资源同名：`1movie.mp4`、`2movie.mp4` */
    private getStageVideoRemoteUrl(stage: number): string | null {
        const raw = this.stageVideoRemoteBase;
        if (raw == null || typeof raw !== "string") return null;
        const base = raw.trim();
        if (!base) return null;
        const name = `${stage}movie.mp4`;
        return base.endsWith("/") ? base + name : `${base}/${name}`;
    }

    private isTtRuntime(): boolean {
        return TtOffscreenVideoHelper.isAvailable();
    }

    /**
     * 抖音小游戏离屏视频需要可访问的 URL（远程 https 或资源 nativeUrl）。
     */
    private getTtPlayableUrl(opts: { remoteUrl?: string; localAsset?: cc.Asset }): string | null {
        if (opts.remoteUrl) return opts.remoteUrl;
        const a: any = opts.localAsset;
        if (!a) return null;
        if (typeof a.nativeUrl === "string" && a.nativeUrl.length > 0) return a.nativeUrl;
        if (typeof a.url === "string" && a.url.length > 0) return a.url;
        return null;
    }

    /**
     * 抖音离屏视频：见 TtOffscreenVideoHelper（含 scaleY 修正倒置）
     */
    private runTtOffscreenStageVideo(
        done: () => void,
        videoUrl: string,
        host: cc.Node,
        vp: cc.VideoPlayer,
        hintDurationSec?: number
    ) {
        if (!this._ttOffscreenHelper) {
            this._ttOffscreenHelper = new TtOffscreenVideoHelper(this);
        }

        host.active = true;
        let q: cc.Node = host.parent;
        while (q && !host.activeInHierarchy) {
            const up = q.parent;
            q.active = true;
            q = up;
        }
        if (!host.activeInHierarchy) {
            cc.warn("[pt_lv399] videoHost 仍不在激活链上，请检查场景根或父节点");
        }

        vp.node.targetOff(this);
        vp.stop();
        vp.enabled = false;

        this._ttOffscreenHelper.playOnSpriteNode(
            host,
            videoUrl,
            () => {
                if (vp && vp.isValid) {
                    vp.enabled = true;
                    vp.stop();
                }
                if (host && host.isValid) {
                    host.active = false;
                }
                if (this.isValid) {
                    AudioManager.resumeMusic();
                }
                done();
            },
            {
                loop: false,
                fixUpsideDown: true,
                hintDurationSec,
                onVideoReady: () => {
                    AudioManager.pauseMusic();
                },
            }
        );
    }

    private resolveVideoHost(): { host: cc.Node; vp: cc.VideoPlayer } | null {
        const host = this.videoHost;
        if (!host) {
            return null;
        }
        const vp = host.getComponent(cc.VideoPlayer);
        if (!vp) {
            cc.warn("[pt_lv399] videoHost 上无 VideoPlayer");
            return null;
        }
        return { host, vp };
    }

    /**
     * @param opts.localAsset 分包本地视频；与 opts.remoteUrl 二选一
     */
    private runStageVideoPlayer(done: () => void, opts: { localAsset?: cc.Asset; remoteUrl?: string }) {
        const remoteUrl = opts.remoteUrl;
        const asset = opts.localAsset;

        if (this.isTtRuntime()) {
            const ttUrl = this.getTtPlayableUrl(opts);
            if (ttUrl) {
                const resolvedTt = this.resolveVideoHost();
                if (!resolvedTt) {
                    this.scheduleOnce(done, 0.5);
                    return;
                }
                let hint: number | undefined;
                if (asset) {
                    const d = (asset as any).duration;
                    if (typeof d === "number" && d > 0) {
                        hint = d;
                    }
                }
                this.runTtOffscreenStageVideo(done, ttUrl, resolvedTt.host, resolvedTt.vp, hint);
                return;
            }
            cc.warn(
                "[pt_lv399] 抖音环境未解析到视频 URL（请在编辑器配置「阶段视频远程目录」stageVideoRemoteBase，或与 257 相同将 mp4 放到可访问 https 域名）；将回退 cc.VideoPlayer"
            );
        }

        const resolved = this.resolveVideoHost();
        if (!resolved) {
            this.scheduleOnce(done, 0.5);
            return;
        }
        const { host, vp } = resolved;

        // 预制体里 videoHost 可默认不激活；播放前必须进入显示链（含必要父节点）。
        host.active = true;
        let q: cc.Node = host.parent;
        while (q && !host.activeInHierarchy) {
            const up = q.parent;
            q.active = true;
            q = up;
        }
        if (!host.activeInHierarchy) {
            cc.warn("[pt_lv399] videoHost 仍不在激活链上，请检查场景根或父节点");
        }

        vp.node.targetOff(this);
        vp.stop();
        if (remoteUrl) {
            vp.resourceType = cc.VideoPlayer.ResourceType.REMOTE;
            vp.remoteURL = remoteUrl;
            vp.clip = "" as any;
        } else if (asset) {
            vp.resourceType = cc.VideoPlayer.ResourceType.LOCAL;
            vp.remoteURL = "";
            vp.clip = asset as any;
        } else {
            this.scheduleOnce(done, 0.3);
            return;
        }

        let doneOnce = false;
        const finish = () => {
            if (doneOnce) return;
            doneOnce = true;
            vp.stop();
            host.active = false;
            if (this.isValid) {
                AudioManager.resumeMusic();
            }
            done();
        };
        // 激活后下一帧再 play，避免部分平台上 VideoPlayer 未参与本帧更新导致不播（与 257 单次 play 类似，避免同帧多次触发引擎内部逻辑）
        this.scheduleOnce(() => {
            AudioManager.pauseMusic();
            vp.node.once("completed" as any, finish, this);
            vp.play();
            if (asset) {
                const dur = (asset as any).duration;
                if (typeof dur === "number" && dur > 0) {
                    this.scheduleOnce(finish, dur + 0.35);
                }
            }
        }, 0);
    }

    private playStageVideo(stage: number, done: () => void) {
        const remoteUrl = this.getStageVideoRemoteUrl(stage);
        if (remoteUrl) {
            if (!this.isValid) {
                this.scheduleOnce(done, 0);
                return;
            }
            this.runStageVideoPlayer(done, { remoteUrl });
            return;
        }

        const path = `picture_lv399/level/${stage}/${stage}movie`;
        AssetManager.load(GameData.curGameStyle, path, cc.Asset, null, (asset: cc.Asset) => {
            if (!this.isValid) {
                this.scheduleOnce(done, 0);
                return;
            }
            if (!asset) {
                cc.warn("[pt_lv399] 视频加载失败，跳过:", path);
                this.scheduleOnce(done, 0.3);
                return;
            }
            this.runStageVideoPlayer(done, { localAsset: asset });
        });
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
        }
    }

    fanhui() {
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            if (err || !UI) {
                cc.error("[pt_lv399] 加载 Hall 失败", err?.message);
                return;
            }
            const UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        });
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            if (!(GameData as any).isNew) {
                this.node.destroy();
            }
        }, 1);
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            const UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }
}
