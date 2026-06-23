import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

const SCROLL_DX = 720;
const SCROLL_DURATION = 0.85;
const MAX_HP = 3;
const TOTAL_STEPS = 14;
const ALL_TOOLS: string[] = [];
for (let i = 1; i <= TOTAL_STEPS; i++) {
    ALL_TOOLS.push(String(i));
}
const SCROLL_AFTER_STEPS = [3, 6, 9, 13];
const PEEL_ATTACHED_NAMES = [
    "ATTACHED_NODE:8",
    "ATTACHED_NODE:8_1",
    "ATTACHED_NODE:8_3",
    "ATTACHED_NODE:8_4",
];

type CheckKind = "peel" | "face" | "meimao" | "eye" | "mouth" | "scratch";

interface PeelEntry {
    root: cc.Node;
    hit: cc.Node;
    cutpoint: cc.Node | null;
}

const PEEL_MOVE_TO_CUT_DURATION = 0.3;

interface StepDef {
    step: number;
    tool: string;
    check: CheckKind;
    /** 过渡动画；null 表示不播（步 1、4） */
    actionAnim: string | null;
    nextDj: string;
}

const STEP_DEFS: StepDef[] = [
    { step: 1, tool: "1", check: "peel", actionAnim: null, nextDj: "r_2dj" },
    { step: 2, tool: "2", check: "face", actionAnim: "r_2yg", nextDj: "r_3dj" },
    { step: 3, tool: "3", check: "face", actionAnim: "r_3xj", nextDj: "r_4dj" },
    { step: 4, tool: "4", check: "scratch", actionAnim: null, nextDj: "r_5dj" },
    { step: 5, tool: "5", check: "face", actionAnim: "r_5mm", nextDj: "r_6dj" },
    { step: 6, tool: "6", check: "face", actionAnim: "r_6ms", nextDj: "r_7dj" },
    { step: 7, tool: "7", check: "face", actionAnim: "r_7fp", nextDj: "r_8dj" },
    { step: 8, tool: "8", check: "meimao", actionAnim: "r_8mm", nextDj: "r_9dj" },
    { step: 9, tool: "9", check: "eye", actionAnim: "r_9yy", nextDj: "r_10dj" },
    { step: 10, tool: "10", check: "eye", actionAnim: "r_10jm", nextDj: "r_11dj" },
    { step: 11, tool: "11", check: "mouth", actionAnim: "r_11kh", nextDj: "r_12dj" },
    { step: 12, tool: "12", check: "mouth", actionAnim: "r_12cy", nextDj: "r_13dj" },
    { step: 13, tool: "13", check: "face", actionAnim: "r_13sh", nextDj: "r_14dj" },
    { step: 14, tool: "14", check: "eye", actionAnim: "r_14mt", nextDj: "r_15dj" },
];

@ccclass
export default class tlgc_lv465 extends BaseGame {
    private static readonly BGM_KEY = "bgmlv465";
    private static readonly CAIDAN_BGM_KEY = "caidan";

    @property({ type: cc.Node, displayName: "角色龙骨 sghz_ske" })
    roleRoot: cc.Node = null;

    @property({ type: cc.Node, displayName: "脸部检测 checkArea_face" })
    checkAreaFace: cc.Node = null;

    @property({ type: cc.Node, displayName: "眉毛检测 checkArea_meimao" })
    checkAreaMeimao: cc.Node = null;

    @property({ type: cc.Node, displayName: "眼睛检测 checkArea_eye" })
    checkAreaEye: cc.Node = null;

    @property({ type: cc.Node, displayName: "嘴巴检测 checkArea_mouth" })
    checkAreaMouth: cc.Node = null;

    @property({ type: cc.Node, displayName: "列表根 list" })
    list: cc.Node = null;

    @property({ type: cc.Node, displayName: "道具父节点 mask" })
    mask: cc.Node = null;

    @property({ type: cc.Node, displayName: "通关按钮 btn_finish" })
    btnFinish: cc.Node = null;

    @property({ type: cc.Node, displayName: "关闭按钮 btn_close" })
    btnClose: cc.Node = null;

    @property({ type: cc.Node, displayName: "提示按钮 btn_tips" })
    btnTips: cc.Node = null;

    @property({ type: cc.Node, displayName: "标题 title" })
    titleNode: cc.Node = null;

    @property({ type: cc.Node, displayName: "爱心根 healthNode" })
    healthNode: cc.Node = null;

    @property({ type: cc.Node, displayName: "错误提示 cuo" })
    cuoNode: cc.Node = null;

    @property({ type: cc.Node, displayName: "提示手指 tips_finger" })
    tipsFinger: cc.Node = null;

    @property({ type: cc.Node, displayName: "彩蛋 caidanNode" })
    caidanNode: cc.Node = null;

    @property({ type: cc.Node, displayName: "彩蛋遮罩 hei" })
    heiNode: cc.Node = null;

    @property({ type: cc.Node, displayName: "彩蛋背景 bj2" })
    bj2Node: cc.Node = null;

    @property({ displayName: "摘香蕉皮-下移距离(px)", tooltip: "镊子与香蕉皮同步下落的屏幕像素距离，可在编辑器实时调" })
    peelDropDistance = 100;

    @property({ displayName: "摘香蕉皮-下移时长(秒)", tooltip: "下落+淡出时长，可在编辑器实时调" })
    peelDropDuration = 0.5;

    @property({ displayName: "湿纸巾涂抹-笔刷直径(px)", tooltip: "第4步涂抹圆形直径，越大涂得越快、范围越大；预览时可实时调" })
    scratchSize = 72;

    private roleArm: dragonBones.ArmatureDisplay = null;
    private readonly toolNodes: { [name: string]: cc.Node } = {};
    private readonly originInMask: { [name: string]: cc.Vec3 } = {};
    private readonly peelEntries: PeelEntry[] = [];
    private peelAnimBusy = false;
    private scratchMask: cc.Node = null;
    private scratchCheck: cc.Node = null;

    private scrollTier = 0;
    private currentStep = 1;
    private hp = MAX_HP;
    private readonly heartNodes: cc.Node[] = [];
    private interactionLocked = false;
    private wrongBusy = false;
    private wrongTriggered = false;
    private activeTool: cc.Node = null;
    private dragOffset = cc.v2(0, 0);
    private cuoBaseScale = cc.v3(1, 1, 1);
    private readonly consumedTools = new Set<string>();

    private tipsFingerLoopActive = false;
    private finishBtnReady = false;
    private hasInteracted = false;

    private scratchCompleted = false;
    private readonly scratchHitKeys = new Set<number>();
    private scratchSampleLocals: cc.Vec2[] = [];
    private scratchHitCount = 0;
    private scratchSfxBusy = false;
    private readonly scratchPassRatio = 0.9;

    private caidanOrigin = cc.v3();
    private caidanDragOffset = cc.v2();
    private caidanDragging = false;
    private caidanDragEnabled = false;
    private finishClicked = false;
    private easterEggPlaying = false;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        GameData.recordLevelEnter(GameData.curGameName || "tlgc_lv465");
        this.isGameOver = false;

        this.resolveNodes();
        this.roleArm = this.roleRoot ? this.roleRoot.getComponent(dragonBones.ArmatureDisplay) : null;

        if (this.cuoNode) {
            this.cuoBaseScale = cc.v3(this.cuoNode.scaleX, this.cuoNode.scaleY, this.cuoNode.scaleZ);
            this.cuoNode.active = false;
        }
        if (this.btnFinish) this.btnFinish.active = false;
        if (this.tipsFinger) {
            this.tipsFinger.active = false;
            this.tipsFinger.opacity = 0;
        }

        this.cacheToolsAndOrigins();
        this.initPeelNodes();
        this.initScratchNodes();
        this.initCaidanNodes();
        this.refreshHearts();
        this.playRoleLoop("r_1dj");
        this.applyToolVisibility();
        this.bindToolTouches();

        this.scheduleOnce(() => this.playLevelBgm(), 0.5);
        this.scheduleOnce(this.checkAutoTips, 2);
    }

    onDestroy() {
        this.unbindToolTouches();
        this.unbindCaidanTouches();
        this.unscheduleAllCallbacks();
        this.stopLevelBgm();
        if (this.cuoNode && cc.isValid(this.cuoNode)) {
            cc.Tween.stopAllByTarget(this.cuoNode);
        }
        if (this.btnFinish && cc.isValid(this.btnFinish)) {
            cc.Tween.stopAllByTarget(this.btnFinish);
        }
        if (this.btnClose && cc.isValid(this.btnClose)) {
            cc.Tween.stopAllByTarget(this.btnClose);
        }
        if (this.btnTips && cc.isValid(this.btnTips)) {
            cc.Tween.stopAllByTarget(this.btnTips);
        }
        if (this.list && cc.isValid(this.list)) {
            cc.Tween.stopAllByTarget(this.list);
        }
        if (this.healthNode && cc.isValid(this.healthNode)) {
            cc.Tween.stopAllByTarget(this.healthNode);
        }
        if (this.titleNode && cc.isValid(this.titleNode)) {
            cc.Tween.stopAllByTarget(this.titleNode);
        }
        ALL_TOOLS.forEach((name) => {
            const t = this.toolNodes[name];
            if (t && cc.isValid(t)) {
                cc.Tween.stopAllByTarget(t);
            }
        });
        if (this.caidanNode && cc.isValid(this.caidanNode)) {
            cc.Tween.stopAllByTarget(this.caidanNode);
        }
        if (this.heiNode && cc.isValid(this.heiNode)) {
            cc.Tween.stopAllByTarget(this.heiNode);
        }
        if (this.bj2Node && cc.isValid(this.bj2Node)) {
            cc.Tween.stopAllByTarget(this.bj2Node);
        }
        this.stopTipsFingerLoop(true);
    }

    private resolveNodes() {
        if (!this.roleRoot) {
            this.roleRoot = this.node.getChildByName("sghz_ske");
        }
        if (!this.roleRoot) {
            cc.error("[tlgc_lv465] 未找到 sghz_ske");
            return;
        }
        if (!this.checkAreaFace) {
            this.checkAreaFace = this.roleRoot.getChildByName("checkArea_face");
        }
        if (!this.checkAreaMeimao) {
            this.checkAreaMeimao = this.roleRoot.getChildByName("checkArea_meimao");
        }
        if (!this.checkAreaEye) {
            this.checkAreaEye = this.roleRoot.getChildByName("checkArea_eye");
        }
        if (!this.checkAreaMouth) {
            this.checkAreaMouth = this.roleRoot.getChildByName("checkArea_mouth");
        }
        if (!this.list) {
            this.list = this.node.getChildByName("list");
        }
        if (!this.mask && this.list) {
            this.mask = this.list.getChildByName("mask");
        }
    }

    private initPeelNodes() {
        this.peelEntries.length = 0;
        for (let i = 0; i < PEEL_ATTACHED_NAMES.length; i++) {
            const attachedName = PEEL_ATTACHED_NAMES[i];
            const root = this.findNodeDeep(this.roleRoot, attachedName);
            if (!root) continue;
            const suffix = attachedName.replace("ATTACHED_NODE:", "");
            const hit = root.getChildByName(suffix) || root;
            const cutpoint = root.getChildByName("cutpoint");
            this.peelEntries.push({ root, hit, cutpoint });
        }
        if (this.peelEntries.length < PEEL_ATTACHED_NAMES.length) {
            cc.warn("[tlgc_lv465] 香蕉皮挂点未找全", this.peelEntries.length);
        }
    }

    private initScratchNodes() {
        const attached20 = this.findNodeDeep(this.roleRoot, "ATTACHED_NODE:20");
        this.scratchMask = attached20 ? attached20.getChildByName("mask") : null;
        if (this.scratchMask) {
            this.scratchCheck = this.scratchMask.getChildByName("checkArea_4");
            this.scratchMask.active = false;
            const maskComp = this.scratchMask.getComponent(cc.Mask);
            if (maskComp) {
                maskComp.enabled = false;
            }
        }
    }

    private findNodeDeep(root: cc.Node, name: string): cc.Node | null {
        if (!root || !cc.isValid(root)) return null;
        if (root.name === name) return root;
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findNodeDeep(root.children[i], name);
            if (found) return found;
        }
        return null;
    }

    private getStepDef(step: number): StepDef | null {
        return STEP_DEFS[step - 1] || null;
    }

    private getBatchTools(tier: number): string[] {
        switch (tier) {
            case 0:
                return ["1", "2", "3"];
            case 1:
                return ["4", "5", "6"];
            case 2:
                return ["7", "8", "9"];
            case 3:
                return ["10", "11", "12", "13"];
            case 4:
                return ["14"];
            default:
                return [];
        }
    }

    private playLevelBgm() {
        AudioManager.playMusic(tlgc_lv465.BGM_KEY, true);
    }

    private playCaidanBgm() {
        AudioManager.playMusic(tlgc_lv465.CAIDAN_BGM_KEY, true);
    }

    private stopLevelBgm() {
        AudioManager.stopMusic();
    }

    /** 各步道具成功音效：audio_lv465 下 1_lv465 ~ 14_lv465 */
    private playStepSfx(step: number) {
        AudioManager.playEffect(`${step}_lv465`);
    }

    /** 第4步涂抹：涂到新区域时播 4_lv465，上一段未播完不重复 */
    private tryPlayScratchStepSfx() {
        if (this.scratchSfxBusy) return;
        this.scratchSfxBusy = true;
        AudioManager.playEffect("4_lv465", false, () => {
            this.scratchSfxBusy = false;
        });
    }

    private cacheToolsAndOrigins() {
        if (!this.mask) {
            cc.error("[tlgc_lv465] 请在编辑器绑定 mask");
            return;
        }
        for (let i = 0; i < this.mask.children.length; i++) {
            const ch = this.mask.children[i];
            if (!ch || ALL_TOOLS.indexOf(ch.name) < 0) continue;
            this.toolNodes[ch.name] = ch;
            this.originInMask[ch.name] = cc.v3(ch.x, ch.y, ch.z);
        }
    }

    private bindToolTouches() {
        ALL_TOOLS.forEach((name) => {
            const t = this.toolNodes[name];
            if (!t) return;
            t.on(cc.Node.EventType.TOUCH_START, this.onToolTouchStart, this);
            t.on(cc.Node.EventType.TOUCH_MOVE, this.onToolTouchMove, this);
            t.on(cc.Node.EventType.TOUCH_END, this.onToolTouchEnd, this);
            t.on(cc.Node.EventType.TOUCH_CANCEL, this.onToolTouchEnd, this);
        });
    }

    private unbindToolTouches() {
        ALL_TOOLS.forEach((name) => {
            const t = this.toolNodes[name];
            if (!t || !t.isValid) return;
            t.off(cc.Node.EventType.TOUCH_START, this.onToolTouchStart, this);
            t.off(cc.Node.EventType.TOUCH_MOVE, this.onToolTouchMove, this);
            t.off(cc.Node.EventType.TOUCH_END, this.onToolTouchEnd, this);
            t.off(cc.Node.EventType.TOUCH_CANCEL, this.onToolTouchEnd, this);
        });
    }

    private canOperate(): boolean {
        return (
            this.node &&
            this.node.isValid &&
            !GameData.PauseGame &&
            !this.isGameOver &&
            !this.interactionLocked &&
            !this.wrongBusy
        );
    }

    /** 当前批次内、未消耗道具均可拖（用于错道具扣心） */
    private isBatchToolDraggable(name: string): boolean {
        if (this.consumedTools.has(name)) return false;
        const batch = this.getBatchTools(this.scrollTier);
        return batch.indexOf(name) >= 0;
    }

    private getCheckAreaNode(kind: CheckKind): cc.Node | null {
        switch (kind) {
            case "face":
                return this.checkAreaFace;
            case "meimao":
                return this.checkAreaMeimao;
            case "eye":
                return this.checkAreaEye;
            case "mouth":
                return this.checkAreaMouth;
            default:
                return null;
        }
    }

    private isPointInNode(world: cc.Vec2, node: cc.Node): boolean {
        if (!node || !node.activeInHierarchy) return false;
        const poly = node.getComponent(cc.PolygonCollider);
        if (poly && poly.points && poly.points.length >= 3) {
            const local = node.convertToNodeSpaceAR(world);
            return cc.Intersection.pointInPolygon(local, poly.points);
        }
        const r = node.getBoundingBoxToWorld();
        return r ? r.contains(world) : false;
    }

    private isRectsIntersect(a: cc.Rect, b: cc.Rect): boolean {
        if (!a || !b) return false;
        return a.intersects(b);
    }

    private isToolIntersectNode(tool: cc.Node, area: cc.Node): boolean {
        if (!tool || !area || !area.activeInHierarchy) return false;
        const toolRect = tool.getBoundingBoxToWorld();
        const areaRect = area.getBoundingBoxToWorld();
        return this.isRectsIntersect(toolRect, areaRect);
    }

    /** 松手判定：脸部/眉/眼/嘴/摘皮用道具与检测区包围盒相交；涂抹仍用触点 */
    private isDropHitCheck(tool: cc.Node, world: cc.Vec2, kind: CheckKind): boolean {
        if (kind === "scratch") {
            return this.isToolIntersectNode(tool, this.scratchCheck);
        }
        if (kind === "peel") {
            return !!this.findPeelTarget(tool);
        }
        const area = this.getCheckAreaNode(kind);
        return this.isToolIntersectNode(tool, area);
    }

    private findPeelTarget(tool: cc.Node): PeelEntry | null {
        for (let i = 0; i < this.peelEntries.length; i++) {
            const entry = this.peelEntries[i];
            if (!entry.root.activeInHierarchy) continue;
            if (this.isToolIntersectNode(tool, entry.hit)) {
                return entry;
            }
        }
        return null;
    }

    private setToolDragVisual(tool: cc.Node, dragging: boolean) {
        const alt = tool.getChildByName(`${tool.name}_1`);
        const normal = tool.getChildByName(tool.name);
        if (!alt) return;
        if (normal) normal.active = !dragging;
        alt.active = dragging;
    }

    private restoreToolVisual(tool: cc.Node) {
        const alt = tool.getChildByName(`${tool.name}_1`);
        const normal = tool.getChildByName(tool.name);
        if (alt) alt.active = false;
        if (normal) normal.active = true;
    }

    private floatToolAboveList(tool: cc.Node) {
        if (!this.list || !this.mask || !tool) return;
        if (tool.parent === this.list) return;
        const w = tool.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        tool.removeFromParent(false);
        this.list.addChild(tool);
        const lp = this.list.convertToNodeSpaceAR(cc.v2(w.x, w.y));
        tool.setPosition(lp.x, lp.y);
        tool.setSiblingIndex(this.list.childrenCount - 1);
    }

    private returnToolUnderMask(tool: cc.Node) {
        if (!this.mask || !tool) return;
        if (tool.parent === this.mask) return;
        const w = tool.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        tool.removeFromParent(false);
        this.mask.addChild(tool);
        const lp = this.mask.convertToNodeSpaceAR(cc.v2(w.x, w.y));
        tool.setPosition(lp.x, lp.y);
    }

    private resetToolPosition(tool: cc.Node, immediate = false) {
        const o = tool ? this.originInMask[tool.name] : null;
        if (!tool || !o) return;
        tool.stopAllActions();
        this.returnToolUnderMask(tool);
        const tx = o.x - this.scrollTier * SCROLL_DX;
        const ty = o.y;
        if (immediate) {
            tool.setPosition(tx, ty, o.z);
            return;
        }
        cc.tween(tool).to(0.15, { x: tx, y: ty }).start();
    }

    private onToolTouchStart(event: cc.Event.EventTouch) {
        this.stopTipsFingerLoop(true);
        this.hasInteracted = true;
        this.unschedule(this.checkAutoTips);
        if (!this.canOperate()) return;

        const tool = event.currentTarget as cc.Node;
        if (!tool || !tool.active || !this.isBatchToolDraggable(tool.name)) return;

        this.wrongTriggered = false;
        this.activeTool = tool;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.setToolDragVisual(tool, true);
        this.floatToolAboveList(tool);
        const local = tool.parent!.convertToNodeSpaceAR(event.getLocation());
        this.dragOffset = cc.v2(tool.x - local.x, tool.y - local.y);

        const def = this.getStepDef(this.currentStep);
        if (def && def.check === "scratch" && tool.name === def.tool) {
            this.prepareScratchStep();
        }
    }

    private onToolTouchMove(event: cc.Event.EventTouch) {
        if (!this.canOperate()) return;
        const tool = event.currentTarget as cc.Node;
        if (!tool || this.activeTool !== tool) return;

        const local = tool.parent!.convertToNodeSpaceAR(event.getLocation());
        tool.setPosition(local.x + this.dragOffset.x, local.y + this.dragOffset.y);

        const def = this.getStepDef(this.currentStep);
        if (def && def.check === "scratch" && tool.name === def.tool) {
            this.scratchAtWorld(event.getLocation());
        }
    }

    private onToolTouchEnd(event: cc.Event.EventTouch) {
        const tool = event.currentTarget as cc.Node;
        if (!tool || this.activeTool !== tool) return;
        this.activeTool = null;
        this.restoreToolVisual(tool);

        if (this.interactionLocked && !this.wrongBusy) {
            this.resetToolPosition(tool);
            return;
        }
        if (GameData.PauseGame || this.isGameOver || this.wrongBusy) {
            this.resetToolPosition(tool);
            return;
        }

        const loc = event.getLocation();
        const def = this.getStepDef(this.currentStep);
        if (!def) {
            this.resetToolPosition(tool);
            return;
        }

        if (tool.name !== def.tool) {
            if (this.isDropHitCheck(tool, loc, def.check)) {
                this.runWrongPenalty(tool);
            } else {
                this.resetToolPosition(tool);
            }
            return;
        }

        if (def.check === "peel") {
            this.handlePeelEnd(tool);
            return;
        }

        if (def.check === "scratch") {
            this.handleScratchEnd(tool);
            return;
        }

        if (!this.isDropHitCheck(tool, loc, def.check)) {
            this.resetToolPosition(tool);
            return;
        }

        this.onDropStepSuccess(tool, def);
    }

    private handlePeelEnd(tool: cc.Node) {
        const target = this.findPeelTarget(tool);
        if (!target) {
            this.resetToolPosition(tool);
            return;
        }
        if (this.peelAnimBusy) {
            this.resetToolPosition(tool);
            return;
        }

        if (!target.cutpoint) {
            this.finishPeelInstant(tool, target);
            return;
        }

        this.peelAnimBusy = true;
        this.interactionLocked = true;
        cc.Tween.stopAllByTarget(tool);
        cc.Tween.stopAllByTarget(target.hit);

        const cutWorld = target.cutpoint.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        const cutLocal = tool.parent.convertToNodeSpaceAR(cc.v2(cutWorld.x, cutWorld.y));

        cc.tween(tool)
            .to(PEEL_MOVE_TO_CUT_DURATION, { x: cutLocal.x, y: cutLocal.y })
            .call(() => {
                if (!this.node || !this.node.isValid) return;
                this.runPeelDropAnim(tool, target);
            })
            .start();
    }

    /** 无 cutpoint 时回退为瞬间摘取 */
    private finishPeelInstant(tool: cc.Node, entry: PeelEntry) {
        entry.root.active = false;
        this.playStepSfx(1);
        this.resetToolPosition(tool, true);
        this.onPeelSequenceDone(tool);
    }

    private runPeelDropAnim(tool: cc.Node, entry: PeelEntry) {
        const peelNode = entry.hit;
        peelNode.opacity = 255;

        const toolEnd = this.localPosAfterWorldDown(tool, this.peelDropDistance);
        const peelEnd = this.localPosAfterWorldDown(peelNode, this.peelDropDistance);

        this.playStepSfx(1);

        let pending = 2;
        const onDropDone = () => {
            pending--;
            if (pending > 0) return;
            if (!this.node || !this.node.isValid) return;
            peelNode.opacity = 255;
            entry.root.active = false;
            this.resetToolPosition(tool, true);
            this.onPeelSequenceDone(tool);
        };

        cc.tween(peelNode)
            .to(this.peelDropDuration, { x: peelEnd.x, y: peelEnd.y, opacity: 0 })
            .call(onDropDone)
            .start();

        cc.tween(tool)
            .to(this.peelDropDuration, { x: toolEnd.x, y: toolEnd.y })
            .call(onDropDone)
            .start();
    }

    /** 世界坐标向下偏移后转回节点父级局部坐标 */
    private localPosAfterWorldDown(node: cc.Node, downPx: number): cc.Vec2 {
        const w = node.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        const wEnd = cc.v3(w.x, w.y - downPx, 0);
        return node.parent.convertToNodeSpaceAR(cc.v2(wEnd.x, wEnd.y));
    }

    private onPeelSequenceDone(_tool: cc.Node) {
        this.peelAnimBusy = false;

        let remain = 0;
        for (let i = 0; i < this.peelEntries.length; i++) {
            if (this.peelEntries[i].root.activeInHierarchy) remain++;
        }

        if (remain > 0) {
            this.interactionLocked = false;
            return;
        }

        this.interactionLocked = true;
        this.consumeTool("1");
        this.playRoleLoop("r_2dj");
        this.finishStepAdvance();
    }

    private handleScratchEnd(tool: cc.Node) {
        if (!this.scratchCompleted) {
            this.resetToolPosition(tool);
            return;
        }
        this.interactionLocked = true;
        this.consumeTool("4");
        this.exitScratchStep();
        this.playRoleLoop("r_5dj");
        this.finishStepAdvance();
    }

    private onDropStepSuccess(tool: cc.Node, def: StepDef) {
        this.interactionLocked = true;
        this.consumeTool(def.tool);
        this.resetToolPosition(tool, true);
        this.playStepSfx(def.step);

        if (def.actionAnim) {
            this.playRoleOnce(def.actionAnim, () => {
                this.playRoleLoop(def.nextDj);
                if (def.step === 3) {
                    this.enterScratchStep();
                }
                if (def.step === TOTAL_STEPS) {
                    this.onAllStepsDone();
                } else {
                    this.finishStepAdvance();
                }
            });
        } else {
            this.playRoleLoop(def.nextDj);
            if (def.step === TOTAL_STEPS) {
                this.onAllStepsDone();
            } else {
                this.finishStepAdvance();
            }
        }
    }

    private consumeTool(name: string) {
        this.consumedTools.add(name);
        const nd = this.toolNodes[name];
        if (nd) nd.active = false;
    }

    private finishStepAdvance() {
        const completedStep = this.currentStep;
        this.currentStep++;

        if (this.currentStep > TOTAL_STEPS) {
            this.onAllStepsDone();
            return;
        }

        const needScroll = SCROLL_AFTER_STEPS.indexOf(completedStep) >= 0;
        if (needScroll) {
            this.runScrollToNextTier(() => {
                this.prepareCurrentStep();
                this.interactionLocked = false;
            });
        } else {
            this.prepareCurrentStep();
            this.interactionLocked = false;
        }
    }

    private onAllStepsDone() {
        this.finishBtnReady = true;
        this.applyToolVisibility();
        this.enableCaidanDrag();
        this.showFinishButtonDelay();
        this.interactionLocked = false;
    }

    private prepareCurrentStep() {
        const def = this.getStepDef(this.currentStep);
        if (!def) return;

        if (def.check === "scratch") {
            this.enterScratchStep();
        } else {
            this.exitScratchStep();
        }
        this.applyToolVisibility();
    }

    private applyToolVisibility() {
        const batch = this.getBatchTools(this.scrollTier);
        ALL_TOOLS.forEach((name) => {
            const node = this.toolNodes[name];
            if (!node) return;
            if (this.consumedTools.has(name)) {
                node.active = false;
                return;
            }
            node.active = batch.indexOf(name) >= 0;
        });
    }

    private runScrollToNextTier(done: () => void) {
        const fromTier = this.scrollTier;
        const toTier = fromTier + 1;
        const incoming = this.getBatchTools(toTier).filter((name) => !this.consumedTools.has(name));

        if (incoming.length === 0) {
            this.scrollTier = toTier;
            this.applyToolVisibility();
            done && done();
            return;
        }

        // 下一批在滑动前仍是 active=false，必须先显示并从当前档位起点滑入
        incoming.forEach((name) => {
            const tool = this.toolNodes[name];
            const o = this.originInMask[name];
            if (!tool || !o) return;
            cc.Tween.stopAllByTarget(tool);
            tool.active = true;
            tool.setPosition(o.x - fromTier * SCROLL_DX, o.y, o.z);
        });

        this.scrollTier = toTier;

        let pending = incoming.length;
        const finishOne = () => {
            pending--;
            if (pending <= 0) {
                this.applyToolVisibility();
                done && done();
            }
        };

        incoming.forEach((name) => {
            const tool = this.toolNodes[name];
            const o = this.originInMask[name];
            if (!tool || !o) return;
            const tx = o.x - toTier * SCROLL_DX;
            cc.tween(tool).to(SCROLL_DURATION, { x: tx, y: o.y }).call(finishOne).start();
        });
    }

    /* ----- 第 4 步涂抹 ----- */

    private ensureMaskComponent(maskNode: cc.Node): cc.Mask | null {
        if (!maskNode) return null;
        let mask = maskNode.getComponent(cc.Mask);
        if (!mask) {
            mask = maskNode.addComponent(cc.Mask);
            mask.type = cc.Mask.Type.RECT;
        }
        return mask;
    }

    private enterScratchStep() {
        if (!this.scratchMask) return;
        this.scratchMask.active = true;
        const mask = this.ensureMaskComponent(this.scratchMask);
        if (mask) mask.enabled = true;
        this.scratchCompleted = false;
        this.scratchHitKeys.clear();
        this.scratchHitCount = 0;
        this.scratchSfxBusy = false;
        this.resetScratchMaskGraphics();
        this.buildScratchSamples();
    }

    private exitScratchStep() {
        if (!this.scratchMask) return;
        this.scratchMask.active = false;
        const mask = this.scratchMask.getComponent(cc.Mask);
        if (mask) mask.enabled = false;
        this.scratchCompleted = false;
        this.scratchSfxBusy = false;
    }

    private prepareScratchStep() {
        if (!this.scratchMask || !this.scratchMask.active) {
            this.enterScratchStep();
        }
    }

    private resetScratchMaskGraphics() {
        if (!this.scratchMask) return;
        const mask = this.ensureMaskComponent(this.scratchMask);
        const g = mask ? ((mask as any)["_graphics"] as cc.Graphics) : null;
        if (g) g.clear();
    }

    private buildScratchSamples() {
        this.scratchSampleLocals = [];
        if (!this.scratchCheck || !this.scratchMask) return;

        const collider = this.scratchCheck.getComponent(cc.PolygonCollider);
        const points = collider && collider.points ? collider.points : null;
        const bbox = this.scratchCheck.getBoundingBox();

        const step = Math.max(16, Math.round(this.scratchSize * 0.5));
        for (let x = bbox.xMin; x <= bbox.xMax; x += step) {
            for (let y = bbox.yMin; y <= bbox.yMax; y += step) {
                const local = cc.v2(x, y);
                if (points && points.length >= 3) {
                    if (!cc.Intersection.pointInPolygon(local, points)) continue;
                }
                const world = this.scratchCheck.convertToWorldSpaceAR(local);
                const maskLocal = this.scratchMask.convertToNodeSpaceAR(world);
                this.scratchSampleLocals.push(maskLocal);
            }
        }
    }

    private scratchAtWorld(world: cc.Vec2) {
        if (!this.scratchMask || !this.scratchCheck) return;
        if (!this.isPointInNode(world, this.scratchCheck)) return;

        const mask = this.ensureMaskComponent(this.scratchMask);
        const g = mask ? ((mask as any)["_graphics"] as cc.Graphics) : null;
        if (g) {
            const p = this.scratchMask.convertToNodeSpaceAR(world);
            const radius = this.scratchSize * 0.5;
            g.fillColor = cc.color(255, 255, 255, 255);
            g.circle(p.x, p.y, radius);
            g.fill();
            if (this.markScratchCells(p)) {
                this.tryPlayScratchStepSfx();
            }
        }

        if (!this.scratchCompleted && this.scratchSampleLocals.length > 0) {
            const ratio = this.scratchHitCount / this.scratchSampleLocals.length;
            if (ratio >= this.scratchPassRatio) {
                this.scratchCompleted = true;
            }
        }
    }

    private markScratchCells(brushCenter: cc.Vec2): boolean {
        const halfSq = (this.scratchSize * 0.5) * (this.scratchSize * 0.5);
        let changed = false;
        for (let i = 0; i < this.scratchSampleLocals.length; i++) {
            if (this.scratchHitKeys.has(i)) continue;
            const sp = this.scratchSampleLocals[i];
            const dx = sp.x - brushCenter.x;
            const dy = sp.y - brushCenter.y;
            if (dx * dx + dy * dy <= halfSq) {
                this.scratchHitKeys.add(i);
                this.scratchHitCount++;
                changed = true;
            }
        }
        return changed;
    }

    private playRoleOnce(anim: string, done?: () => void) {
        if (!this.roleArm) {
            done && done();
            return;
        }
        this.roleArm.playAnimation(anim, 1);
        this.addOneTimeListener(this.roleArm, () => done && done());
    }

    private playRoleLoop(anim: string) {
        if (!this.roleArm) return;
        this.roleArm.playAnimation(anim, 0);
    }

    /* ----- 彩蛋 caidanNode（r_15dj 阶段可拖） ----- */

    private initCaidanNodes() {
        if (!this.caidanNode) {
            this.caidanNode = this.node.getChildByName("caidanNode");
        }
        if (!this.heiNode) {
            this.heiNode = this.node.getChildByName("hei");
        }
        if (!this.bj2Node) {
            this.bj2Node = this.node.getChildByName("bj2");
        }
        if (this.caidanNode) {
            this.caidanOrigin = cc.v3(this.caidanNode.x, this.caidanNode.y, this.caidanNode.z);
            this.caidanNode.active = true;
            this.caidanDragEnabled = false;
            this.bindCaidanTouches();
        }
        if (this.heiNode) {
            this.heiNode.active = false;
            this.heiNode.opacity = 0;
        }
        if (this.bj2Node) {
            this.bj2Node.active = false;
            this.bj2Node.opacity = 0;
        }
    }

    /** r_15dj 通关按钮阶段、彩蛋仍可拖时 */
    private isCaidanHintPhase(): boolean {
        return (
            this.finishBtnReady &&
            this.caidanDragEnabled &&
            !this.finishClicked &&
            !this.easterEggPlaying
        );
    }

    private canDragCaidan(): boolean {
        return (
            this.caidanDragEnabled &&
            !this.finishClicked &&
            !this.easterEggPlaying &&
            !this.isGameOver &&
            !GameData.PauseGame &&
            !this.wrongBusy &&
            !this.interactionLocked &&
            !!this.caidanNode &&
            this.caidanNode.active
        );
    }

    private bindCaidanTouches() {
        if (!this.caidanNode) return;
        this.caidanNode.on(cc.Node.EventType.TOUCH_START, this.onCaidanTouchStart, this);
        this.caidanNode.on(cc.Node.EventType.TOUCH_MOVE, this.onCaidanTouchMove, this);
        this.caidanNode.on(cc.Node.EventType.TOUCH_END, this.onCaidanTouchEnd, this);
        this.caidanNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onCaidanTouchEnd, this);
    }

    private unbindCaidanTouches() {
        if (!this.caidanNode || !this.caidanNode.isValid) return;
        this.caidanNode.off(cc.Node.EventType.TOUCH_START, this.onCaidanTouchStart, this);
        this.caidanNode.off(cc.Node.EventType.TOUCH_MOVE, this.onCaidanTouchMove, this);
        this.caidanNode.off(cc.Node.EventType.TOUCH_END, this.onCaidanTouchEnd, this);
        this.caidanNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onCaidanTouchEnd, this);
    }

    private enableCaidanDrag() {
        if (!this.caidanNode) return;
        this.caidanDragEnabled = true;
        cc.Tween.stopAllByTarget(this.caidanNode);
        this.caidanNode.active = true;
        this.caidanNode.opacity = 255;
        this.caidanNode.setPosition(this.caidanOrigin);
        this.bringCaidanToDragLayer();
    }

    private disableCaidanDrag() {
        this.caidanDragEnabled = false;
        this.caidanDragging = false;
        if (!this.caidanNode || !cc.isValid(this.caidanNode)) return;
        cc.Tween.stopAllByTarget(this.caidanNode);
        this.resetCaidanPosition(true);
    }

    private resetCaidanPosition(immediate = false) {
        if (!this.caidanNode) return;
        cc.Tween.stopAllByTarget(this.caidanNode);
        const o = this.caidanOrigin;
        if (immediate) {
            this.caidanNode.setPosition(o.x, o.y, o.z);
            return;
        }
        cc.tween(this.caidanNode).to(0.15, { x: o.x, y: o.y }).start();
    }

    private onCaidanTouchStart(event: cc.Event.EventTouch) {
        if (!this.canDragCaidan()) return;
        this.stopTipsFingerLoop(true);
        this.caidanDragging = true;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.caidanNode.setSiblingIndex(this.node.childrenCount - 1);
        const local = this.caidanNode.parent.convertToNodeSpaceAR(event.getLocation());
        this.caidanDragOffset = cc.v2(this.caidanNode.x - local.x, this.caidanNode.y - local.y);
    }

    private onCaidanTouchMove(event: cc.Event.EventTouch) {
        if (!this.caidanDragging || !this.caidanNode) return;
        const local = this.caidanNode.parent.convertToNodeSpaceAR(event.getLocation());
        this.caidanNode.setPosition(local.x + this.caidanDragOffset.x, local.y + this.caidanDragOffset.y);
    }

    private onCaidanTouchEnd(event: cc.Event.EventTouch) {
        if (!this.caidanDragging || !this.caidanNode) return;
        this.caidanDragging = false;

        if (this.finishClicked || this.easterEggPlaying || this.isGameOver) {
            this.resetCaidanPosition();
            return;
        }

        const loc = event.getLocation();
        if (this.checkAreaFace && this.caidanNode && this.isToolIntersectNode(this.caidanNode, this.checkAreaFace)) {
            this.playCaidanEasterEgg();
            return;
        }
        this.resetCaidanPosition();
    }

    private playCaidanEasterEgg() {
        if (this.easterEggPlaying || this.isGameOver) return;
        this.easterEggPlaying = true;
        this.interactionLocked = true;
        this.disableCaidanDrag();
        if (this.caidanNode && cc.isValid(this.caidanNode)) {
            this.caidanNode.active = false;
        }
        this.stopLevelBgm();

        if (this.heiNode) {
            cc.Tween.stopAllByTarget(this.heiNode);
            this.heiNode.active = true;
            this.heiNode.opacity = 0;
            this.heiNode.setSiblingIndex(this.node.childrenCount - 1);
        }
        if (this.bj2Node) {
            cc.Tween.stopAllByTarget(this.bj2Node);
            this.bj2Node.active = false;
            this.bj2Node.opacity = 0;
        }

        const fadeHei = this.heiNode
            ? cc.tween(this.heiNode).to(1, { opacity: 255 })
            : cc.tween(this.node).delay(1);

        fadeHei
            .call(() => {
                if (!this.node || !this.node.isValid) return;
                if (this.bj2Node) {
                    this.playCaidanBgm();
                    this.bj2Node.active = true;
                    this.bj2Node.opacity = 0;
                    this.bj2Node.setSiblingIndex(this.node.childrenCount - 1);
                    cc.tween(this.bj2Node)
                        .to(1, { opacity: 255 })
                        .call(() => {
                            this.scheduleOnce(() => {
                                if (!this.node || !this.node.isValid) return;
                                this.onwin();
                            }, 5);
                        })
                        .start();
                } else {
                    this.scheduleOnce(() => {
                        if (!this.node || !this.node.isValid) return;
                        this.onwin();
                    }, 5);
                }
            })
            .start();
    }

    private showFinishButtonDelay() {
        if (!this.btnFinish || !cc.isValid(this.btnFinish)) return;
        const btn = this.btnFinish;
        cc.Tween.stopAllByTarget(btn);
        btn.active = false;
        this.scheduleOnce(() => {
            if (!cc.isValid(this.node) || !cc.isValid(btn)) return;
            btn.active = true;
            btn.scaleX = 0.2;
            btn.scaleY = 0.2;
            cc.Tween.stopAllByTarget(btn);
            cc.tween(btn)
                .to(0.18, { scaleX: 1.15, scaleY: 1.15 })
                .to(0.12, { scaleX: 1, scaleY: 1 })
                .start();
            AudioManager.playEffect("true");
        }, 1);
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_finish":
                if (this.finishBtnReady) {
                    this.onFinishClick();
                }
                break;
            case "btn_tips":
                this.onBtnTips();
                break;
        }
    }

    private onFinishClick() {
        if (this.isGameOver) return;
        this.finishClicked = true;
        this.disableCaidanDrag();
        this.interactionLocked = true;
        const fadeTargets: cc.Node[] = [];
        if (this.btnFinish && cc.isValid(this.btnFinish)) fadeTargets.push(this.btnFinish);
        if (this.btnClose && cc.isValid(this.btnClose)) fadeTargets.push(this.btnClose);
        if (this.btnTips && cc.isValid(this.btnTips)) fadeTargets.push(this.btnTips);
        if (this.healthNode && cc.isValid(this.healthNode)) fadeTargets.push(this.healthNode);
        if (this.titleNode && cc.isValid(this.titleNode)) fadeTargets.push(this.titleNode);
        fadeTargets.forEach((n) => {
            cc.tween(n).to(1, { opacity: 0 }).start();
        });
        this.scheduleOnce(() => {
            if (!this.node || !this.node.isValid) return;
            this.onwin();
        }, 5);
    }

    private onBtnTips() {
        if (GameData.PauseGame || this.isGameOver) {
            return;
        }
        if (this.finishBtnReady) {
            if (!this.isCaidanHintPhase()) return;
        } else if (this.wrongBusy) {
            return;
        }
        VideoManager.getInstance().showVideo(
            () => {
                if (!this.node || !this.node.isValid || this.isGameOver || GameData.PauseGame) {
                    return;
                }
                this.startTipsFingerLoop();
            },
            () => {
                cc.log("[tlgc_lv465] 提示视频未完成");
            }
        );
    }

    /** 彩蛋可拖时置顶，但保持在 tips_finger 之下 */
    private bringCaidanToDragLayer() {
        if (!this.caidanNode) return;
        const parent = this.caidanNode.parent;
        if (!parent) return;
        if (this.tipsFinger && this.tipsFinger.parent === parent) {
            const tipIdx = this.tipsFinger.getSiblingIndex();
            this.caidanNode.setSiblingIndex(Math.max(0, tipIdx));
        } else {
            this.caidanNode.setSiblingIndex(parent.childrenCount - 1);
        }
    }

    private bringTipsFingerToFront() {
        if (!this.tipsFinger || !this.tipsFinger.isValid) return;
        const parent = this.tipsFinger.parent;
        if (parent) {
            this.tipsFinger.setSiblingIndex(parent.childrenCount - 1);
        }
    }

    private startTipsFingerLoop() {
        if (!this.tipsFinger) {
            cc.warn("[tlgc_lv465] 请绑定 tips_finger");
            return;
        }
        this.stopTipsFingerLoop(false);
        this.bringTipsFingerToFront();
        this.tipsFingerLoopActive = true;
        this.playTipsFingerCycle();
    }

    private playTipsFingerCycle() {
        if (!this.tipsFingerLoopActive || !this.tipsFinger || !this.tipsFinger.isValid) {
            return;
        }
        if (GameData.PauseGame || this.isGameOver) {
            this.stopTipsFingerLoop(true);
            return;
        }
        if (this.finishBtnReady && !this.isCaidanHintPhase()) {
            this.stopTipsFingerLoop(true);
            return;
        }
        const pts = this.getFingerEndpointsInFingerParent();
        if (!pts) {
            this.stopTipsFingerLoop(true);
            return;
        }
        const n = this.tipsFinger;
        this.bringTipsFingerToFront();
        n.active = true;
        n.stopAllActions();
        n.setPosition(pts.start.x, pts.start.y, pts.start.z);
        n.opacity = 0;
        cc.Tween.stopAllByTarget(n);
        const end = pts.end;
        cc.tween(n)
            .to(0.4, { opacity: 255 })
            .to(1.4, { x: end.x, y: end.y })
            .to(0.4, { opacity: 0 })
            .call(() => {
                if (this.tipsFingerLoopActive && this.tipsFinger && this.tipsFinger.isValid) {
                    this.playTipsFingerCycle();
                } else {
                    this.hideTipsFingerNode();
                }
            })
            .start();
    }

    private getFingerEndpointsInFingerParent(): { start: cc.Vec3; end: cc.Vec3 } | null {
        if (!this.tipsFinger) return null;
        const hintTool = this.getHintToolNodeForTips();
        const target = this.getHintTargetNode();
        if (!hintTool || !target) return null;

        const parent = this.tipsFinger.parent;
        const wStart = hintTool.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        const wEnd = target.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        const lStart = parent.convertToNodeSpaceAR(cc.v3(wStart.x, wStart.y, 0));
        const lEnd = parent.convertToNodeSpaceAR(cc.v3(wEnd.x, wEnd.y, 0));
        return {
            start: cc.v3(lStart.x, lStart.y, 0),
            end: cc.v3(lEnd.x, lEnd.y, 0),
        };
    }

    private getHintToolNodeForTips(): cc.Node | null {
        if (this.isCaidanHintPhase()) {
            return this.caidanNode && this.caidanNode.activeInHierarchy ? this.caidanNode : null;
        }
        const def = this.getStepDef(this.currentStep);
        if (!def) return null;
        const t = this.toolNodes[def.tool];
        return t && t.activeInHierarchy ? t : null;
    }

    private getHintTargetNode(): cc.Node | null {
        if (this.isCaidanHintPhase()) {
            return this.checkAreaFace || this.roleRoot;
        }
        const def = this.getStepDef(this.currentStep);
        if (!def) return null;
        if (def.check === "peel") {
            for (let i = 0; i < this.peelEntries.length; i++) {
                if (this.peelEntries[i].root.activeInHierarchy) {
                    return this.peelEntries[i].hit;
                }
            }
            return null;
        }
        if (def.check === "scratch") {
            return this.scratchCheck || this.checkAreaFace;
        }
        return this.getCheckAreaNode(def.check);
    }

    private hideTipsFingerNode() {
        if (!this.tipsFinger || !this.tipsFinger.isValid) return;
        this.tipsFinger.opacity = 0;
        this.tipsFinger.active = false;
    }

    private stopTipsFingerLoop(reset: boolean) {
        this.tipsFingerLoopActive = false;
        if (this.tipsFinger && this.tipsFinger.isValid) {
            cc.Tween.stopAllByTarget(this.tipsFinger);
        }
        if (reset) {
            this.hideTipsFingerNode();
        }
    }

    private checkAutoTips() {
        if (this.hasInteracted || this.isGameOver || GameData.PauseGame) return;
        this.startTipsFingerLoop();
    }

    fanhui() {
        this.stopLevelBgm();
        super.fanhui();
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    openpausePanel() {
        this.stopLevelBgm();
        super.openpausePanel();
    }

    public resumeGamePublic() {
        GameData.PauseGame = false;
        this.playLevelBgm();
    }

    onwin() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.stopLevelBgm();
        GameData.PauseGame = true;
        this.node.cleanup();
        this.endwin("prefabs/zc/zc_winend");
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
    }

    onlost() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.stopLevelBgm();
            this.endlost("prefabs/zc/zc_lostend");
            if (!(GameData as any).isNew) {
                this.node.destroy();
            }
        }, 1);
    }

    restart() {
        this.stopLevelBgm();
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            if (!name) {
                cc.error("[tlgc_lv465] restart 加载 prefab 失败");
                return;
            }
            const UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }

    private refreshHearts() {
        this.heartNodes.length = 0;
        if (!this.healthNode) return;
        for (let i = 0; i < this.healthNode.children.length; i++) {
            this.heartNodes.push(this.healthNode.children[i]);
        }
        for (let i = 0; i < this.heartNodes.length; i++) {
            const h = this.heartNodes[i];
            h.active = true;
            if (h.childrenCount > 0) {
                h.children[0].active = i < this.hp;
            } else {
                h.active = i < this.hp;
            }
        }
    }

    private runWrongPenalty(tool: cc.Node) {
        if (this.wrongTriggered || this.isGameOver) return;
        this.wrongTriggered = true;
        this.wrongBusy = true;
        this.interactionLocked = true;

        const def = this.getStepDef(this.currentStep);
        if (def && def.check === "scratch") {
            this.scratchCompleted = false;
            this.scratchHitKeys.clear();
            this.scratchHitCount = 0;
            this.scratchSfxBusy = false;
            this.resetScratchMaskGraphics();
        }

        AudioManager.playEffect("com_cuo");
        this.restoreToolVisual(tool);
        this.resetToolPosition(tool);

        this.hp--;
        this.refreshHearts();
        const lostIdx = this.hp;
        const lostHeart = this.heartNodes[lostIdx];
        if (lostHeart) {
            cc.Tween.stopAllByTarget(lostHeart);
            const ox = lostHeart.x;
            const oy = lostHeart.y;
            cc.tween(lostHeart)
                .to(0.04, { x: ox + 4, y: oy + 2 })
                .to(0.04, { x: ox - 4, y: oy - 2 })
                .to(0.04, { x: ox + 3, y: oy + 1 })
                .to(0.04, { x: ox - 3, y: oy - 1 })
                .to(0.04, { x: ox, y: oy })
                .call(() => {
                    if (lostHeart.childrenCount > 0) {
                        lostHeart.children[0].active = false;
                    } else {
                        lostHeart.active = false;
                    }
                })
                .start();
        }

        this.showCuoPopup();

        if (this.hp <= 0) {
            this.scheduleOnce(() => this.onlost(), 1.2);
        } else {
            this.scheduleOnce(() => this.afterWrongPenalty(), 1.05);
        }
    }

    private showCuoPopup() {
        if (!this.cuoNode) return;
        cc.Tween.stopAllByTarget(this.cuoNode);
        const bs = this.cuoBaseScale;
        this.cuoNode.active = true;
        this.cuoNode.scale = 0;
        cc.tween(this.cuoNode)
            .to(0.2, { scaleX: bs.x, scaleY: bs.y })
            .delay(0.75)
            .to(0.15, { scaleX: 0, scaleY: 0 })
            .call(() => {
                if (this.cuoNode && cc.isValid(this.cuoNode)) {
                    this.cuoNode.active = false;
                }
            })
            .start();
    }

    private afterWrongPenalty() {
        this.wrongBusy = false;
        if (this.isGameOver) return;
        this.interactionLocked = false;
        this.wrongTriggered = false;
    }
}
