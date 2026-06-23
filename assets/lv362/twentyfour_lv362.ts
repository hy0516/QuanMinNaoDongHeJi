import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass } = cc._decorator;

type OperatorType = "+" | "-" | "*" | "/";

interface CalcItem {
    value: number;
    expr: string;
}

interface GuideStep {
    firstSlotIndex: number;
    secondSlotIndex: number;
    op: OperatorType;
}

interface GuideSolverItem extends CalcItem {
    slotIndex: number;
}

interface GuideTarget {
    type: "card" | "operator";
    slotIndex?: number;
    op?: OperatorType;
}

const LEVEL_NUMBERS: number[][] = [
    [5, 7, 4, 3],
    [3, 1, 8, 1],
    [6, 4, 3, 2],
    [4, 2, 2, 2],
    [7, 1, 1, 2],
    [2, 1, 3, 5],
    [2, 3, 2, 2],
    [5, 1, 5, 1],
    [6, 5, 7, 2],
    [4, 9, 2, 6],
];

const PROGRESS_KEY = "lv362_progress_index";
const OP_NAMES: string[] = ["opopAdd", "opSub", "opMul", "opDiv"];
const LV362_AUDIO = {
    NUM_CARD: "点击数字",
    UI_BUTTON: "点击ui",
    MERGE: "合成",
    WIN: "胜利",
    FAIL: "失败",
};

@ccclass
export default class twentyfour_lv362 extends BaseGame {
    private numberContainer: cc.Node = null;
    private progressLabel: cc.Label = null;
    private opAddNode: cc.Node = null;
    private opSubNode: cc.Node = null;
    private opMulNode: cc.Node = null;
    private opDivNode: cc.Node = null;
    private btnResetNode: cc.Node = null;
    private btnAnswerNode: cc.Node = null;
    private answerPanelNode: cc.Node = null;
    private answerTextLabel: cc.Label = null;
    private answerCloseBtnNode: cc.Node = null;
    private playAreaNode: cc.Node = null;
    private winNode: cc.Node = null;
    private winNextBtnNode: cc.Node = null;
    private btnCloseNode: cc.Node = null;
    private winSkNode: cc.Node = null;
    private winSkOriginPos: cc.Vec3 = null;
    private fingerNode: cc.Node = null;
    private tutorialGuideToken: number = 0;
    private currentGuideTargetKey: string = "";

    private currentLevelIndex: number = 0;
    private currentNumbers: Array<CalcItem | null> = [];
    private selectedNumberIndexes: number[] = [];
    private selectedOperator: OperatorType | "" = "";
    private answerCache: string[] = [
        "(5+3)x(7-4)",
        "3x8x1x1",
        "6x4x(3-2)",
        "(2+2+2)x4",
        "(7+1)×(1+2)",
        "(2x3)×(5-1)",
        "2x2x2x3",
        "5x5x1-1",
        "2x6+7+5"
    ];
    private isSettling: boolean = false;
    private isMergingCards: boolean = false;
    private fixedCardPositions: cc.Vec3[] = [];

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.onInit("lv362/audio_lv362");
        this.cacheNodes();
        this.bindStaticButtons();
        this.currentLevelIndex = this.loadSavedLevelIndex();
        this.updateProgressLabel();
        this.refreshLevel();
    }

    start() {
    }

    private cacheNodes() {
        this.numberContainer = cc.find("playArea/numberContainer", this.node);
        if (!this.numberContainer) {
            this.numberContainer = cc.find("numberContainer", this.node);
        }

        this.disableNumberContainerLayout();

        const progressNode = cc.find("progressLabel", this.node);
        this.progressLabel = progressNode ? progressNode.getComponent(cc.Label) : null;

        this.playAreaNode = cc.find("playArea", this.node);
        this.opAddNode = cc.find("playArea/opGroup/opopAdd", this.node);
        this.opSubNode = cc.find("playArea/opGroup/opSub", this.node);
        this.opMulNode = cc.find("playArea/opGroup/opMul", this.node);
        this.opDivNode = cc.find("playArea/opGroup/opDiv", this.node);

        this.btnCloseNode = cc.find("btn_close", this.node);
        this.btnResetNode = cc.find("btn_reset", this.node)
            || cc.find("btnReset", this.node)
            || cc.find("resetBtn", this.node);

        this.btnAnswerNode = cc.find("btn_answer", this.node)
            || cc.find("btnAnswer", this.node)
            || cc.find("answerBtn", this.node);
        this.answerPanelNode = cc.find("answerPanel", this.node);
        const answerTextNode = cc.find("answerPanel/answerText", this.node);
        this.answerTextLabel = answerTextNode ? answerTextNode.getComponent(cc.Label) : null;
        this.answerCloseBtnNode = cc.find("answerPanel/closeBtn", this.node);
        this.winNode = cc.find("winnode", this.node);
        this.winNextBtnNode = cc.find("winnode/xyt", this.node) || cc.find("xyt", this.node);
        this.winSkNode = cc.find("winsk", this.node);
        this.fingerNode = cc.find("finger", this.node);

        if (this.fingerNode) {
            this.fingerNode.active = false;
            this.fingerNode.scale = 1;
        }

        if (this.answerPanelNode) {
            this.answerPanelNode.active = false;
        }
        if (this.winNode) {
            this.winNode.active = false;
        }
        if (this.winSkNode) {
            this.winSkOriginPos = this.winSkNode.position.clone();
            this.winSkNode.active = false;
        }
    }

    private bindStaticButtons() {
        this.bindBtn(this.btnCloseNode, "BtnHandler");
        this.bindBtn(this.opAddNode, "BtnHandler");
        this.bindBtn(this.opSubNode, "BtnHandler");
        this.bindBtn(this.opMulNode, "BtnHandler");
        this.bindBtn(this.opDivNode, "BtnHandler");
        this.bindBtn(this.btnResetNode, "BtnHandler");
        this.bindBtn(this.btnAnswerNode, "BtnHandler");
        this.bindBtn(this.answerCloseBtnNode, "BtnHandler");
        this.bindBtn(this.winNextBtnNode, "onNextSubLevelBtnClick");
    }

    private bindBtn(node: cc.Node, handlerName: string, customEventData: string = "") {
        if (!node) return;
        let btn = node.getComponent(cc.Button);
        if (!btn) {
            btn = node.addComponent(cc.Button);
        }
        btn.clickEvents = [];
        const ev = new cc.Component.EventHandler();
        ev.target = this.node;
        ev.component = "twentyfour_lv362";
        ev.handler = handlerName;
        ev.customEventData = customEventData;
        btn.clickEvents.push(ev);
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isSettling || this.isMergingCards) return;
        const target = even.currentTarget || even.target;
        const name = target ? (target as cc.Node).name : "";

        switch (name) {
            case "btn_close":
                AudioManager.playEffect(LV362_AUDIO.UI_BUTTON);
                this.openpausePanel();
                break;
            case "opopAdd":
            case "opSub":
            case "opMul":
            case "opDiv":
                AudioManager.playEffect(LV362_AUDIO.UI_BUTTON);
                this.onOperatorClicked(name);
                break;
            case "btn_reset":
            case "btnReset":
            case "resetBtn":
                AudioManager.playEffect(LV362_AUDIO.UI_BUTTON);
                this.onResetClick();
                break;
            case "btn_answer":
            case "btnAnswer":
            case "answerBtn":
                AudioManager.playEffect(LV362_AUDIO.UI_BUTTON);
                this.onAnswerClick();
                break;

            case "closeBtn":
                AudioManager.playEffect(LV362_AUDIO.UI_BUTTON);
                this.hideAnswerPanel();
                break;
            default:
                break;
        }
    }

    onNumCardClick(even: cc.Event.EventTouch, customEventData: string) {
        if (GameData.PauseGame || this.isSettling || this.isMergingCards) return;
        const index = parseInt(customEventData, 10);
        if (isNaN(index)) return;
        if (index < 0 || index >= this.currentNumbers.length) return;
        if (!this.currentNumbers[index]) return;

        const expectedTarget = this.getExpectedGuideTarget();
        if (expectedTarget && (expectedTarget.type !== "card" || expectedTarget.slotIndex !== index)) {
            this.refreshFirstLevelGuide();
            return;
        }

        AudioManager.playEffect(LV362_AUDIO.NUM_CARD);

        const existedIndex = this.selectedNumberIndexes.indexOf(index);
        if (existedIndex >= 0) {
            this.selectedNumberIndexes.splice(existedIndex, 1);
            this.updateCardSelectedState();
            this.refreshFirstLevelGuide();
            return;
        }

        if (this.selectedNumberIndexes.length === 0) {
            this.selectedNumberIndexes.push(index);
            this.updateCardSelectedState();
            this.refreshFirstLevelGuide();
            return;
        }

        if (!this.selectedOperator) {
            this.selectedNumberIndexes[0] = index;
            this.updateCardSelectedState();
            this.refreshFirstLevelGuide();
            return;
        }

        this.tryMergeSelectedNumbers(index, true);
    }

    private onOperatorClicked(nodeName: string) {
        const op = this.operatorFromNodeName(nodeName);
        if (!op) return;

        const expectedTarget = this.getExpectedGuideTarget();
        if (expectedTarget && (expectedTarget.type !== "operator" || expectedTarget.op !== op)) {
            this.refreshFirstLevelGuide();
            return;
        }

        this.selectedOperator = this.selectedOperator === op ? "" : op;
        this.refreshOperatorVisual();
        this.tryMergeSelectedNumbers();
        this.refreshFirstLevelGuide();
    }

    private operatorFromNodeName(nodeName: string): OperatorType | null {
        switch (nodeName) {
            case "opopAdd":
                return "+";
            case "opSub":
                return "-";
            case "opMul":
                return "*";
            case "opDiv":
                return "/";
            default:
                return null;
        }
    }

    private refreshLevel() {
        if (!this.numberContainer) return;

        const source = LEVEL_NUMBERS[this.currentLevelIndex] || LEVEL_NUMBERS[0];
        this.currentNumbers = source.map((value: number) => ({
            value,
            expr: value.toString(),
        }));

        this.clearSelections(true);
        this.restoreMainGameUI();
        this.renderNumberCards();
        this.updateProgressLabel();
        this.saveLevelIndex();
        this.refreshFirstLevelGuide();
    }

    private disableNumberContainerLayout() {
        if (!this.numberContainer) return;
        const layout = this.numberContainer.getComponent(cc.Layout);
        if (layout) {
            layout.enabled = false;
        }
    }

    private keepCardPositionsStable(cardNodes: cc.Node[]) {
        this.disableNumberContainerLayout();
        if (this.fixedCardPositions.length !== cardNodes.length) {
            this.fixedCardPositions = cardNodes.map((cardNode: cc.Node) => cardNode.position.clone());
        }

        for (let i = 0; i < cardNodes.length; i++) {
            if (!this.fixedCardPositions[i]) continue;
            cardNodes[i].setPosition(this.fixedCardPositions[i]);
        }
    }

    private renderNumberCards() {
        if (!this.numberContainer) return;

        const cardNodes = this.getNumberCardNodes();
        this.keepCardPositionsStable(cardNodes);

        for (let i = 0; i < cardNodes.length; i++) {
            const cardNode = cardNodes[i];
            const item = i < this.currentNumbers.length ? this.currentNumbers[i] : null;
            const shouldShow = !!item;
            cardNode.active = shouldShow;
            if (!shouldShow || !item) continue;

            const valueNode = cardNode.getChildByName("valueLabel");
            const valueLabel = valueNode ? valueNode.getComponent(cc.Label) : null;
            if (valueLabel) {
                valueLabel.string = item.value.toString();
            }

            const selectedMask = cardNode.getChildByName("selectedMask");
            if (selectedMask) {
                selectedMask.active = false;
            }

            const winFlagNode = cardNode.getChildByName("winstate");
            if (winFlagNode) {
                winFlagNode.active = false;
                winFlagNode.stopAllActions();
                winFlagNode.scale = 1;
            }

            const clickNode = cardNode.getChildByName("bg") || cardNode;
            this.bindBtn(clickNode, "onNumCardClick", i.toString());
        }

        this.updateCardSelectedState();
        this.refreshOperatorVisual();
    }

    private getNumberCardNodes(): cc.Node[] {
        if (!this.numberContainer) return [];

        const cardNodes: cc.Node[] = [];
        for (let i = 0; i < this.numberContainer.childrenCount; i++) {
            const child = this.numberContainer.children[i];
            if (child && child.getChildByName("valueLabel")) {
                cardNodes.push(child);
            }
        }

        return cardNodes.length > 0 ? cardNodes : this.numberContainer.children.slice();
    }

    private updateCardSelectedState() {
        if (!this.numberContainer) return;

        const cardNodes = this.getNumberCardNodes();
        for (let i = 0; i < cardNodes.length; i++) {
            const cardNode = cardNodes[i];
            const item = i < this.currentNumbers.length ? this.currentNumbers[i] : null;
            const shouldShow = !!item;
            cardNode.active = shouldShow;
            if (!shouldShow) continue;

            const selectedMask = cardNode.getChildByName("selectedMask");
            if (!selectedMask) continue;
            selectedMask.active = this.selectedNumberIndexes.indexOf(i) >= 0;
        }
    }

    private refreshOperatorVisual() {
        this.setOperatorNodeSelected(this.opAddNode, this.selectedOperator === "+");
        this.setOperatorNodeSelected(this.opSubNode, this.selectedOperator === "-");
        this.setOperatorNodeSelected(this.opMulNode, this.selectedOperator === "*");
        this.setOperatorNodeSelected(this.opDivNode, this.selectedOperator === "/");
    }

    private setOperatorNodeSelected(node: cc.Node, selected: boolean) {
        if (!node) return;
        node.children[0].active = selected ? true : false;
    }

    private clearSelections(clearOperator: boolean) {
        this.selectedNumberIndexes.length = 0;
        if (clearOperator) {
            this.selectedOperator = "";
        }
        this.updateCardSelectedState();
        this.refreshOperatorVisual();
    }

    private tryMergeSelectedNumbers(secondIndex?: number, playMoveAnim: boolean = false) {
        if (this.selectedNumberIndexes.length < 1 || !this.selectedOperator) return;

        const firstIndex = this.selectedNumberIndexes[0];
        const targetSecondIndex = typeof secondIndex === "number"
            ? secondIndex
            : (this.selectedNumberIndexes.length >= 2 ? this.selectedNumberIndexes[1] : -1);

        if (firstIndex === targetSecondIndex) {
            return;
        }
        if (firstIndex < 0 || targetSecondIndex < 0) {
            return;
        }
        if (firstIndex >= this.currentNumbers.length || targetSecondIndex >= this.currentNumbers.length) {
            return;
        }

        const left = this.currentNumbers[firstIndex];
        const right = this.currentNumbers[targetSecondIndex];
        if (!left || !right) {
            return;
        }
        const result = this.calc(left.value, right.value, this.selectedOperator);

        if (result === null) {
            common.ShowTipsView("除法仅支持整除");
            this.selectedOperator = "";
            this.refreshOperatorVisual();
            return;
        }

        const merged: CalcItem = {
            value: result,
            expr: "(" + left.expr + this.selectedOperator + right.expr + ")",
        };

        AudioManager.playEffect(LV362_AUDIO.MERGE);

        if (playMoveAnim) {
            this.isMergingCards = true;
            this.stopFirstLevelGuide();
            this.playMergeMoveAnim(firstIndex, targetSecondIndex, () => {
                this.isMergingCards = false;
                this.applyMergedResult(firstIndex, targetSecondIndex, merged);
            });
            return;
        }

        this.applyMergedResult(firstIndex, targetSecondIndex, merged);
    }

    private applyMergedResult(firstIndex: number, secondIndex: number, merged: CalcItem) {
        this.currentNumbers[firstIndex] = null;
        this.currentNumbers[secondIndex] = merged;

        this.clearSelections(true);

        const remainItems = this.currentNumbers.filter((item: CalcItem | null): item is CalcItem => !!item);
        if (remainItems.length === 1) {
            if (remainItems[0].value === 24) {
                this.handleSubLevelPass(secondIndex);
            } else {
                this.handleSubLevelFail();
            }
            return;
        }

        this.renderNumberCards();
        this.refreshFirstLevelGuide();
    }

    private playMergeMoveAnim(firstIndex: number, secondIndex: number, done: () => void) {
        if (!this.numberContainer) {
            done && done();
            return;
        }

        const cardNodes = this.getNumberCardNodes();
        const fromCard = cardNodes[firstIndex];
        const toCard = cardNodes[secondIndex];
        if (!fromCard || !toCard) {
            done && done();
            return;
        }

        const flyCard = cc.instantiate(fromCard);
        const startWorldPos = this.numberContainer.convertToWorldSpaceAR(fromCard.position);
        const endWorldPos = this.numberContainer.convertToWorldSpaceAR(toCard.position);
        const startPos = this.node.convertToNodeSpaceAR(startWorldPos);
        const endPos = this.node.convertToNodeSpaceAR(endWorldPos);

        flyCard.parent = this.node;
        flyCard.setPosition(startPos);
        fromCard.opacity = 120;

        cc.tween(flyCard)
            .to(0.18, { x: endPos.x, y: endPos.y }, { easing: "quadInOut" })
            .call(() => {
                if (fromCard && fromCard.isValid) {
                    fromCard.opacity = 255;
                }
                flyCard.destroy();
                done && done();
            })
            .start();
    }

    private calc(left: number, right: number, op: OperatorType): number | null {
        switch (op) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                if (right === 0) return null;
                if (left % right !== 0) return null;
                return left / right;
            default:
                return null;
        }
    }

    private handleSubLevelPass(winCardIndex: number) {
        this.isSettling = true;
        AudioManager.playEffect(LV362_AUDIO.WIN);
        this.stopFirstLevelGuide();
        this.playSuccessFeedback(() => {
            this.playWinK3Anim(winCardIndex, () => {
                const hasNextSubLevel = this.currentLevelIndex < LEVEL_NUMBERS.length - 1;
                if (!hasNextSubLevel) {
                    this.clearSavedProgress();
                    this.onwin();
                    return;
                }

                if (!this.winNode) {
                    this.advanceToNextSubLevel();
                    return;
                }
                this.showSubLevelWinPanel();
            });
        });
    }

    private handleSubLevelFail() {
        this.isSettling = true;
        AudioManager.playEffect(LV362_AUDIO.FAIL);
        this.stopFirstLevelGuide();
        this.playWrongFeedback(() => {
            this.isSettling = false;
            this.refreshLevel();
        });
    }

    private playWrongFeedback(done: () => void) {
        const target = this.numberContainer || this.node;
        const originX = target.x;

        cc.tween(target)
            .to(0.06, { x: originX - 14 })
            .to(0.06, { x: originX + 14 })
            .to(0.06, { x: originX - 8 })
            .to(0.06, { x: originX })
            .call(() => {
                done && done();
            })
            .start();
    }

    private playSuccessFeedback(done: () => void) {
        const targetLabelNode = this.progressLabel ? this.progressLabel.node : null;
        if (!targetLabelNode) {
            this.scheduleOnce(() => {
                done && done();
            }, 0.2);
            return;
        }

        cc.tween(targetLabelNode)
            .to(0.1, { scale: 1.15 })
            .to(0.1, { scale: 1 })
            .call(() => {
                done && done();
            })
            .start();
    }

    private onResetClick() {
        this.refreshLevel();
    }

    onNextSubLevelBtnClick() {
        AudioManager.playEffect(LV362_AUDIO.UI_BUTTON);
        if (this.winNode && !this.winNode.active) return;
        this.advanceToNextSubLevel();
    }

    private onAnswerClick() {
        const answerText = this.getAnswerTextForCurrentLevel();
        if (this.answerTextLabel) {
            this.answerTextLabel.string = "答案: " + answerText;
        }
        this.showAnswerPanel();
    }

    private showAnswerPanel() {
        if (!this.answerPanelNode) return;
        this.answerPanelNode.active = true;
        this.stopFirstLevelGuide();
    }

    private hideAnswerPanel() {
        if (!this.answerPanelNode) return;
        this.answerPanelNode.active = false;
        this.refreshFirstLevelGuide();
    }

    private getAnswerTextForCurrentLevel(): string {
        if (this.answerCache[this.currentLevelIndex]) {
            return this.answerCache[this.currentLevelIndex];
        }

        const initialItems: CalcItem[] = LEVEL_NUMBERS[this.currentLevelIndex].map((value: number) => ({
            value,
            expr: value.toString(),
        }));

        const solvedExpr = this.solveTo24(initialItems);
        const displayExpr = solvedExpr ? solvedExpr.replace(/\*/g, "x") : "暂无可用解法";
        this.answerCache[this.currentLevelIndex] = displayExpr;
        return displayExpr;
    }

    private solveTo24(items: CalcItem[]): string | null {
        if (items.length === 1) {
            return items[0].value === 24 ? items[0].expr : null;
        }

        const operators: OperatorType[] = ["+", "-", "*", "/"];

        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < items.length; j++) {
                if (i === j) continue;

                for (let k = 0; k < operators.length; k++) {
                    const op = operators[k];
                    const result = this.calc(items[i].value, items[j].value, op);
                    if (result === null) continue;

                    const nextItems: CalcItem[] = [];
                    for (let n = 0; n < items.length; n++) {
                        if (n === i || n === j) continue;
                        nextItems.push({
                            value: items[n].value,
                            expr: items[n].expr,
                        });
                    }

                    nextItems.push({
                        value: result,
                        expr: "(" + items[i].expr + op + items[j].expr + ")",
                    });

                    const solved = this.solveTo24(nextItems);
                    if (solved) {
                        return solved;
                    }
                }
            }
        }

        return null;
    }

    private refreshFirstLevelGuide() {
        if (!this.shouldShowFirstLevelGuide()) {
            this.stopFirstLevelGuide();
            return;
        }

        const guideSteps = this.buildGuideStepsForCurrentState();
        if (!guideSteps || guideSteps.length <= 0) {
            this.stopFirstLevelGuide();
            return;
        }

        this.playFirstLevelGuide(guideSteps[0]);
    }

    private shouldShowFirstLevelGuide(): boolean {
        if (!this.fingerNode || !this.fingerNode.isValid) return false;
        if (this.currentLevelIndex !== 0) return false;
        if (GameData.PauseGame || this.isSettling || this.isMergingCards) return false;
        if (this.answerPanelNode && this.answerPanelNode.active) return false;
        if (this.winNode && this.winNode.active) return false;
        if (this.playAreaNode && !this.playAreaNode.active) return false;

        const remainCount = this.currentNumbers.filter((item: CalcItem | null): item is CalcItem => !!item).length;
        return remainCount > 1;
    }

    private buildGuideStepsForCurrentState(): GuideStep[] {
        const items: GuideSolverItem[] = [];
        for (let i = 0; i < this.currentNumbers.length; i++) {
            const item = this.currentNumbers[i];
            if (!item) continue;
            items.push({
                value: item.value,
                expr: item.expr,
                slotIndex: i,
            });
        }

        if (items.length <= 1) return [];

        const solved = this.solveGuideSteps(items);
        return solved || [];
    }

    private solveGuideSteps(items: GuideSolverItem[]): GuideStep[] | null {
        if (items.length === 1) {
            return items[0].value === 24 ? [] : null;
        }

        const operators: OperatorType[] = ["+", "-", "*", "/"];

        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < items.length; j++) {
                if (i === j) continue;

                const first = items[i];
                const second = items[j];
                for (let k = 0; k < operators.length; k++) {
                    const op = operators[k];
                    const result = this.calc(first.value, second.value, op);
                    if (result === null) continue;

                    const nextItems: GuideSolverItem[] = [];
                    for (let n = 0; n < items.length; n++) {
                        if (n === i || n === j) continue;
                        nextItems.push({
                            value: items[n].value,
                            expr: items[n].expr,
                            slotIndex: items[n].slotIndex,
                        });
                    }

                    nextItems.push({
                        value: result,
                        expr: "(" + first.expr + op + second.expr + ")",
                        slotIndex: second.slotIndex,
                    });

                    const solved = this.solveGuideSteps(nextItems);
                    if (!solved) continue;

                    return [{
                        firstSlotIndex: first.slotIndex,
                        secondSlotIndex: second.slotIndex,
                        op,
                    }].concat(solved);
                }
            }
        }

        return null;
    }

    private getExpectedGuideTarget(): GuideTarget | null {
        if (!this.shouldShowFirstLevelGuide()) return null;

        const guideSteps = this.buildGuideStepsForCurrentState();
        if (!guideSteps || guideSteps.length <= 0) return null;

        return this.getExpectedGuideTargetByStep(guideSteps[0]);
    }

    private getExpectedGuideTargetByStep(step: GuideStep): GuideTarget | null {
        const firstSelected = this.selectedNumberIndexes.length > 0 ? this.selectedNumberIndexes[0] : -1;

        if (this.selectedNumberIndexes.length <= 0) {
            return {
                type: "card",
                slotIndex: step.firstSlotIndex,
            };
        }

        if (!this.selectedOperator) {
            if (firstSelected === step.firstSlotIndex) {
                return {
                    type: "operator",
                    op: step.op,
                };
            }
            return {
                type: "card",
                slotIndex: step.firstSlotIndex,
            };
        }

        if (this.selectedOperator !== step.op) {
            return {
                type: "operator",
                op: step.op,
            };
        }

        if (firstSelected === step.firstSlotIndex) {
            return {
                type: "card",
                slotIndex: step.secondSlotIndex,
            };
        }

        return {
            type: "card",
            slotIndex: step.firstSlotIndex,
        };
    }

    private playFirstLevelGuide(guideStep: GuideStep) {
        if (!this.fingerNode || !guideStep) return;

        const expectedTarget = this.getExpectedGuideTargetByStep(guideStep);
        if (!expectedTarget) {
            this.stopFirstLevelGuide();
            return;
        }

        const targetNode = this.getGuideTargetNode(expectedTarget);
        if (!targetNode) {
            this.stopFirstLevelGuide();
            return;
        }

        const targetKey = this.getGuideTargetKey(expectedTarget);
        if (this.fingerNode.active && this.currentGuideTargetKey === targetKey) {
            this.keepFingerOnTop();
            return;
        }

        this.tutorialGuideToken += 1;
        const token = this.tutorialGuideToken;
        this.currentGuideTargetKey = targetKey;

        cc.Tween.stopAllByTarget(this.fingerNode);
        this.fingerNode.active = true;
        this.fingerNode.opacity = 255;
        this.fingerNode.scale = 1;
        this.keepFingerOnTop();

        this.moveFingerToNode(targetNode, false, token, () => {
            this.playFingerIdleLoop(token);
        });
    }

    private getGuideTargetNode(target: GuideTarget): cc.Node {
        if (!target) return null;
        if (target.type === "card") {
            return this.getGuideCardTarget(typeof target.slotIndex === "number" ? target.slotIndex : -1);
        }

        return target.op ? this.getOperatorNodeByType(target.op) : null;
    }

    private getGuideTargetKey(target: GuideTarget): string {
        if (target.type === "card") {
            return "card:" + (typeof target.slotIndex === "number" ? target.slotIndex : -1);
        }
        return "operator:" + (target.op || "");
    }

    private getGuideCardTarget(slotIndex: number): cc.Node {
        const cardNodes = this.getNumberCardNodes();
        if (slotIndex < 0 || slotIndex >= cardNodes.length) return null;

        const cardNode = cardNodes[slotIndex];
        if (!cardNode || !cardNode.activeInHierarchy) return null;

        return cardNode.getChildByName("bg") || cardNode;
    }

    private getOperatorNodeByType(op: OperatorType): cc.Node {
        switch (op) {
            case "+":
                return this.opAddNode;
            case "-":
                return this.opSubNode;
            case "*":
                return this.opMulNode;
            case "/":
                return this.opDivNode;
            default:
                return null;
        }
    }

    private playFingerIdleLoop(token: number) {
        if (token !== this.tutorialGuideToken) return;
        if (!this.fingerNode || !this.fingerNode.isValid || !this.fingerNode.active) return;

        cc.Tween.stopAllByTarget(this.fingerNode);
        cc.tween(this.fingerNode)
            .to(0.14, { scale: 1.08 })
            .to(0.14, { scale: 1 })
            .delay(0.18)
            .call(() => {
                this.playFingerIdleLoop(token);
            })
            .start();
    }

    private moveFingerToNode(targetNode: cc.Node, instant: boolean, token: number, done: () => void) {
        if (token !== this.tutorialGuideToken) {
            done && done();
            return;
        }
        if (!this.fingerNode || !this.fingerNode.isValid || !targetNode || !targetNode.isValid) {
            done && done();
            return;
        }

        const targetPos = this.convertTargetPosToRoot(targetNode);
        if (instant) {
            this.fingerNode.setPosition(targetPos);
            done && done();
            return;
        }

        const currentPos = this.fingerNode.getPosition();
        const dx = currentPos.x - targetPos.x;
        const dy = currentPos.y - targetPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.max(0.12, Math.min(0.32, dist / 900));

        cc.Tween.stopAllByTarget(this.fingerNode);
        cc.tween(this.fingerNode)
            .to(duration, { x: targetPos.x, y: targetPos.y }, { easing: "sineInOut" })
            .call(() => {
                done && done();
            })
            .start();
    }

    private playFingerTap(token: number, done: () => void) {
        if (token !== this.tutorialGuideToken) {
            done && done();
            return;
        }
        if (!this.fingerNode || !this.fingerNode.isValid) {
            done && done();
            return;
        }

        cc.Tween.stopAllByTarget(this.fingerNode);
        cc.tween(this.fingerNode)
            .to(0.12, { scale: 1.08 })
            .to(0.12, { scale: 1 })
            .call(() => {
                done && done();
            })
            .start();
    }

    private convertTargetPosToRoot(targetNode: cc.Node): cc.Vec3 {
        const localPos = cc.v2(targetNode.x, targetNode.y);
        const worldPos = targetNode.parent
            ? targetNode.parent.convertToWorldSpaceAR(localPos)
            : targetNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const targetPos = this.node.convertToNodeSpaceAR(worldPos);
        return cc.v3(targetPos.x, targetPos.y, 0);
    }

    private keepFingerOnTop() {
        if (!this.fingerNode || !this.fingerNode.active || !this.fingerNode.parent) return;
        this.fingerNode.setSiblingIndex(this.fingerNode.parent.childrenCount - 1);
    }

    private stopFirstLevelGuide() {
        this.tutorialGuideToken += 1;
        this.currentGuideTargetKey = "";
        if (!this.fingerNode || !this.fingerNode.isValid) return;

        cc.Tween.stopAllByTarget(this.fingerNode);
        this.fingerNode.active = false;
        this.fingerNode.scale = 1;
    }

    private updateProgressLabel() {
        if (!this.progressLabel) return;
        this.progressLabel.string = "关卡:" + (this.currentLevelIndex + 1) + "/" + LEVEL_NUMBERS.length;
    }

    private restoreMainGameUI() {
        const hideAssistButtons = this.currentLevelIndex === 0;

        if (this.btnCloseNode) {
            this.btnCloseNode.active = true;
        }
        if (this.btnResetNode) {
            this.btnResetNode.active = !hideAssistButtons;
        }
        if (this.btnAnswerNode) {
            this.btnAnswerNode.active = !hideAssistButtons;
        }
        if (this.progressLabel && this.progressLabel.node) {
            this.progressLabel.node.active = true;
        }
        if (this.playAreaNode) {
            this.playAreaNode.active = true;
        } else {
            if (this.numberContainer) {
                this.numberContainer.active = true;
            }
            if (this.opAddNode) this.opAddNode.active = true;
            if (this.opSubNode) this.opSubNode.active = true;
            if (this.opMulNode) this.opMulNode.active = true;
            if (this.opDivNode) this.opDivNode.active = true;
        }

        if (this.answerPanelNode) {
            this.answerPanelNode.active = false;
        }
        if (this.winNode) {
            this.winNode.active = false;
        }
        if (this.winSkNode) {
            this.winSkNode.stopAllActions();
            if (this.winSkOriginPos) {
                this.winSkNode.setPosition(this.winSkOriginPos);
            }
            this.winSkNode.active = false;
        }
    }

    private hideUIForWinSkAnim() {
        if (this.btnResetNode) {
            this.btnResetNode.active = false;
        }
        if (this.btnAnswerNode) {
            this.btnAnswerNode.active = false;
        }
        if (this.progressLabel && this.progressLabel.node) {
            this.progressLabel.node.active = false;
        }
        if (this.playAreaNode) {
            this.playAreaNode.active = false;
        } else {
            if (this.numberContainer) {
                this.numberContainer.active = false;
            }
            if (this.opAddNode) this.opAddNode.active = false;
            if (this.opSubNode) this.opSubNode.active = false;
            if (this.opMulNode) this.opMulNode.active = false;
            if (this.opDivNode) this.opDivNode.active = false;
        }
        if (this.answerPanelNode) {
            this.answerPanelNode.active = false;
        }
        if (this.winNode) {
            this.winNode.active = false;
        }
        if (this.btnCloseNode) {
            this.btnCloseNode.active = false;
        }
        if (this.winSkNode) {
            this.winSkNode.active = true;
        }
    }

    private showSubLevelWinPanel() {
        if (this.btnResetNode) {
            this.btnResetNode.active = false;
        }
        if (this.btnAnswerNode) {
            this.btnAnswerNode.active = false;
        }
        if (this.progressLabel && this.progressLabel.node) {
            this.progressLabel.node.active = false;
        }
        if (this.playAreaNode) {
            this.playAreaNode.active = false;
        } else {
            if (this.numberContainer) {
                this.numberContainer.active = false;
            }
            if (this.opAddNode) this.opAddNode.active = false;
            if (this.opSubNode) this.opSubNode.active = false;
            if (this.opMulNode) this.opMulNode.active = false;
            if (this.opDivNode) this.opDivNode.active = false;
        }

        if (this.answerPanelNode) {
            this.answerPanelNode.active = false;
        }
        if (this.winNode) {
            this.winNode.active = true;
        }
    }

    private playWinK3Anim(winCardIndex: number, done: () => void) {
        const cardNodes = this.getNumberCardNodes();
        const winCard = cardNodes[winCardIndex];
        if (!this.winSkNode || !this.winSkOriginPos || !winCard) {
            done && done();
            return;
        }

        const cardParent = winCard.parent;
        const cardWorldPos = cardParent
            ? cardParent.convertToWorldSpaceAR(winCard.position)
            : this.node.convertToWorldSpaceAR(winCard.position);
        const cardPosInRoot = this.node.convertToNodeSpaceAR(cardWorldPos);

        this.winSkNode.stopAllActions();
        this.winSkNode.setPosition(cardPosInRoot);
        this.hideUIForWinSkAnim();
        this.winSkNode.active = true;

        cc.tween(this.winSkNode)
            .to(0.45, { scaleX: 1.2, scaleY: 1.2 })
            .to(0.8, {
                x: this.winSkOriginPos.x,
                y: this.winSkOriginPos.y,
            }, { easing: "quadOut" })
            .call(() => {
                done && done();
            })
            .start();
    }

    private advanceToNextSubLevel() {
        if (this.currentLevelIndex >= LEVEL_NUMBERS.length - 1) {
            this.clearSavedProgress();
            this.onwin();
            return;
        }

        this.currentLevelIndex += 1;
        this.isSettling = false;
        this.refreshLevel();
    }

    private loadSavedLevelIndex(): number {
        const raw = cc.sys.localStorage.getItem(PROGRESS_KEY);
        if (!raw) return 0;
        const oneBased = parseInt(raw, 10);
        if (isNaN(oneBased)) return 0;
        const index = oneBased - 1;
        if (index < 0 || index >= LEVEL_NUMBERS.length) return 0;
        return index;
    }

    private saveLevelIndex() {
        cc.sys.localStorage.setItem(PROGRESS_KEY, (this.currentLevelIndex + 1).toString());
    }

    private clearSavedProgress() {
        cc.sys.localStorage.removeItem(PROGRESS_KEY);
    }

    onDestroy() {
        this.stopFirstLevelGuide();
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        });
    }

    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.node.destroy();
            this.endwin("prefabs/zc/zc_winend");
        }, 2);
    }

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1);
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }
}
