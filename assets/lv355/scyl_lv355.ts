import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class scyl_lv355 extends BaseGame {
    @property(cc.Node)
    color: cc.Node = null;
    @property(cc.Node)
    ske: cc.Node = null;
    @property(cc.Node)
    cg: cc.Node = null;
    @property(cc.Node)
    btn1: cc.Node = null;
    @property(cc.Node)
    finger: cc.Node = null;
    @property(cc.Node)
    btn_begin: cc.Node = null;
    @property(cc.Node)
    win: cc.Node = null;

    canjiaohu = false;
    sk: dragonBones.ArmatureDisplay = null;
    // 点击计数器，记录当前点击次数（0-2）
    clickCount: number = 0;
    // 记录选中的按钮名称
    selectedBtn1: string = null;
    selectedBtn2: string = null;
    // 循环计数器，记录完整循环次数（达到3次进入onwin）
    loopCount: number = 0;
    // 记录已点亮的 c 节点，重置时只处理这部分，广告节点不受影响
    private activatedCNodes: cc.Node[] = [];
    // 缓存初始展示状态，用于不重载场景的回退
    private cachedStateNodes: cc.Node[] = [];
    private initialSkeAnimation: string = null;
    private resetBtnNode: cc.Node = null;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`bgmlv355`);
        this.sk = this.ske ? this.ske.getComponent(dragonBones.ArmatureDisplay) : null;
        this.initialSkeAnimation = this.sk ? this.sk.animationName : null;
        this.resetBtnNode = this.getResetButtonNode();
        this.hideResetButtonImmediate();
        this.setSelectionButtonsInteractable(true);
        this.cacheInitialState();
        this.loopCount = 0;
        this.playFingerBreath();
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        let btnName = even.currentTarget.name;
        if (/^[1-9]$|^10$/.test(btnName)) {
            if (this.clickCount > 1) {
                return;
            }

            const btnNode = even.currentTarget as cc.Node;
            const videoNode = btnNode.getChildByName("v");
            const runSelectionFlow = () => {
                this.handleSelectionClick(btnNode, btnName);
            };

            // 若按钮下存在激活的 v 节点，先看一次激励视频，仅把标记置为 false。
            if (videoNode && videoNode.active) {
                VideoManager.getInstance().showVideo(() => {
                    videoNode.active = false;
                });
            } else {
                runSelectionFlow();
            }
            return;
        }
        switch (btnName) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_begin":
                this.btn_begin.active = false;
                this.executeBeginFlow();
                break;
        }
    }

    private handleSelectionClick(btnNode: cc.Node, btnName: string) {
        this.finger.active = false;
        if (this.clickCount > 1) {
            return;
        }

        // 检查是否选择了相同的按钮
        if (this.clickCount === 1 && btnName === this.selectedBtn1) {
            return;
        }

        const cNode = btnNode.getChildByName("c");
        if (cNode) {
            cNode.active = true;
            if (this.activatedCNodes.indexOf(cNode) === -1) {
                this.activatedCNodes.push(cNode);
            }
        }

        if (this.clickCount === 0) {
            this.handleY1Selection(btnName);
            this.clickCount = 1;
        } else if (this.clickCount === 1) {
            this.handleY2Selection(btnName);
            this.clickCount = 2;
            this.setSelectionButtonsInteractable(false);
            this.checkSelectionComplete();
        }
    }

    /**
     * 处理第一次选择
     */
    handleY1Selection(selectedBtn: string) {
        console.log(`第一次选择按钮: ${selectedBtn}`);
        this.changeSKSlotIndex(this.sk, `ys`, Number(selectedBtn)%10);
        this.selectedBtn1 = selectedBtn;
    }

    /**
     * 处理第二次选择
     */
    handleY2Selection(selectedBtn: string) {
        console.log(`第二次选择按钮: ${selectedBtn}`);
        this.changeSKSlotIndex(this.sk, `ys1`, Number(selectedBtn)%10);
        this.selectedBtn2 = selectedBtn;
    }

    private setSelectionButtonsInteractable(interactable: boolean) {
        // y1 y2 已改为插槽形式，无需处理
    }

    /**
     * 检查选择是否完成
     * 当两个选项都已经选择后触发，显示btn_begin
     */
    checkSelectionComplete() {
        if (this.selectedBtn1 === null || this.selectedBtn2 === null) {
            return;
        }

        // 显示btn_begin按钮，等待用户点击
        if (this.btn_begin) {
            this.btn_begin.active = true;
            const buttonComp = this.btn_begin.getComponent(cc.Button);
            if (buttonComp) {
                buttonComp.interactable = true;
            }
        }
    }

    /**
     * btn_begin点击后的流程，执行color和cg显示
     */
    private executeBeginFlow() {
        const selectionResult = this.getSelectionResult(this.selectedBtn1, this.selectedBtn2);

        this.hideResetButtonImmediate();

        // 先停顿 1 秒，再开始 color/ske/cg 的整套切换流程。
        this.scheduleOnce(() => {
            this.updateColorDisplay(selectionResult.colorIndex);

            // 先把2秒后的cg切换定时器挂上，避免ske播放异常导致后续流程中断。
            this.scheduleOnce(() => {
                this.switchToCgDisplay(selectionResult.colorIndex);
            }, 2);

            this.updateSkeDisplay();
        });
    }

    private getSelectionResult(firstBtn: string, secondBtn: string): { colorIndex: number } {
        const [a, b] = [Number(firstBtn), Number(secondBtn)].sort((x, y) => x - y);
        const key = `${a}-${b}`;
        const fixedMap: { [key: string]: number } = {
            "1-4": 1,
            "1-5": 2,
            "1-8": 3,
            "4-5": 4,
            "2-5": 5,
            "2-4": 6,
            "1-10": 7,
            "1-2": 8,
            "6-10": 9,
            "3-8": 10,
            "7-8": 11,
            "8-9": 12,
            "3-5": 13,
        };

        if (fixedMap[key] !== undefined) {
            return {
                colorIndex: fixedMap[key],
            };
        }

        return {
            colorIndex: 14,
        };
    }

    private updateColorDisplay(targetIndex: number) {
        if (!this.color) {
            return;
        }

        for (let i = 1; i <= 14; i++) {
            const childNode = this.color.getChildByName(i.toString());
            if (childNode) {
                childNode.active = i === targetIndex;
            }
        }
    }

    private updateSkeDisplay() {
        if (!this.sk) {
            return;
        }
        this.changeSKSlotIndex(this.sk, `ys`, -1);
        this.changeSKSlotIndex(this.sk, `ys1`, -1);
        this.sk.playAnimation("dj2", 0);
    }

    private switchToCgDisplay(targetIndex: number) {
        let activeColorChildName: string = null;
        if (this.color) {
            // 读取当前激活的 color 子节点名称，用于匹配 cg 同名子节点。
            for (const childNode of this.color.children) {
                if (childNode.active) {
                    activeColorChildName = childNode.name;
                    break;
                }
            }
            this.color.active = false;
        }

        if (!this.cg) {
            return;
        }

        // CG出现时播放音效"变装出现"
        AudioManager.playEffect("变装出现");
        this.cg.active = true;
        for (const childNode of this.cg.children) {
            cc.Tween.stopAllByTarget(childNode);
            childNode.active = false;
            childNode.opacity = 255;
        }

        // 颜色14代表随机：cg从1-13中随机显示一个。
        if (targetIndex === 14 || activeColorChildName === "14") {
            targetIndex = Math.floor(Math.random() * 13) + 1;
            activeColorChildName = targetIndex.toString();
        }

        // 优先按 color 当前子节点名称匹配 cg 同名子节点。
        if (activeColorChildName) {
            const targetCgNode = this.cg.getChildByName(activeColorChildName);
            if (targetCgNode) {
                this.showCgNodeWithFade(targetCgNode);
                return;
            }
        }

        // 如果未找到同名节点，回退到 1-7 序号映射。
        const fallbackNode = this.cg.getChildByName(targetIndex.toString());
        if (fallbackNode) {
            this.showCgNodeWithFade(fallbackNode);
        }
    }

    private showCgNodeWithFade(targetNode: cc.Node) {
        cc.Tween.stopAllByTarget(targetNode);
        targetNode.active = true;
        targetNode.opacity = 0;
        this.hideResetButtonImmediate();

        // cg 从 0->255 用 1 秒，随后再等 2 秒显示重置按钮
        cc.tween(targetNode)
            .to(1, { opacity: 255 })
            .start();
        this.scheduleOnce(() => {
            this.showResetButtonWithFade();
        }, 3);
    }

    private getResetButtonNode(): cc.Node {
        if (this.btn1 && cc.isValid(this.btn1)) {
            return this.btn1;
        }
        return null;
    }

    private hideResetButtonImmediate() {
        const resetBtn = this.resetBtnNode || this.getResetButtonNode();
        if (!resetBtn) {
            return;
        }
        this.resetBtnNode = resetBtn;
        cc.Tween.stopAllByTarget(resetBtn);
        resetBtn.active = false;
        resetBtn.opacity = 0;
        const buttonComp = resetBtn.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
    }

    private showResetButtonWithFade() {
        const resetBtn = this.resetBtnNode || this.getResetButtonNode();
        if (!resetBtn) {
            return;
        }
        this.resetBtnNode = resetBtn;
        cc.Tween.stopAllByTarget(resetBtn);
        resetBtn.active = true;
        resetBtn.opacity = 0;
        if (resetBtn.parent && cc.isValid(resetBtn.parent)) {
            resetBtn.zIndex = 9999;
            resetBtn.setSiblingIndex(resetBtn.parent.childrenCount - 1);
        }
        const buttonComp = resetBtn.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        cc.tween(resetBtn)
            .to(1, { opacity: 255 })
            .call(() => {
                if (buttonComp && cc.isValid(buttonComp.node)) {
                    buttonComp.interactable = true;
                }
            })
            .start();
    }

    private cacheInitialState() {
        this.cachedStateNodes = [];
        [this.color, this.cg].forEach(root => this.cacheNodeTreeState(root));
    }

    private cacheNodeTreeState(root: cc.Node) {
        if (!root) {
            return;
        }
        this.cacheNodeState(root);
        for (const child of root.children) {
            this.cacheNodeTreeState(child);
        }
    }

    private cacheNodeState(node: cc.Node) {
        const cacheNode = node as cc.Node & { __initActive?: boolean; __initOpacity?: number };
        cacheNode.__initActive = node.active;
        cacheNode.__initOpacity = node.opacity;
        if (this.cachedStateNodes.indexOf(node) === -1) {
            this.cachedStateNodes.push(node);
        }
    }

    private restoreCachedState() {
        for (const node of this.cachedStateNodes) {
            if (!cc.isValid(node)) {
                continue;
            }
            const cacheNode = node as cc.Node & { __initActive?: boolean; __initOpacity?: number };
            cc.Tween.stopAllByTarget(node);
            if (node.name === "v") {
                continue;
            }
            if (typeof cacheNode.__initActive === "boolean") {
                node.active = cacheNode.__initActive;
            }
            if (typeof cacheNode.__initOpacity === "number") {
                node.opacity = cacheNode.__initOpacity;
            }
        }
    }

    // 重置到开头状态：不重载场景，不改广告节点(v)
    resetToInitialState() {
        this.unscheduleAllCallbacks();
        this.clickCount = 0;
        this.selectedBtn1 = null;
        this.selectedBtn2 = null;

        // 增加循环计数
        this.loopCount++;

        this.restoreCachedState();
        this.hideResetButtonImmediate();
        this.setSelectionButtonsInteractable(true);

        for (const cNode of this.activatedCNodes) {
            if (cc.isValid(cNode)) {
                cNode.active = false;
            }
        }
        this.activatedCNodes.length = 0;

        if (this.sk && this.initialSkeAnimation) {
            this.sk.playAnimation(this.initialSkeAnimation, 0);
        }

        // finger只在第一次显示，重置时不再显示
        this.finger.active = false;

        // 循环3次后进入onwin流程
        if (this.loopCount >= 3) {
            this.onwin();
        }
    }

    // 兼容旧调用
    resetSelection() {
        this.resetToInitialState();
    }

    // 播放finger呼吸动画
    private playFingerBreath() {
        if (!this.finger) {
            return;
        }
        cc.Tween.stopAllByTarget(this.finger);
        this.finger.active = true;
        cc.tween(this.finger)
            .to(0.4, { scale: 1.2 })
            .to(0.4, { scale: 1 })
            .union()
            .repeatForever()
            .start();
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            // this.node.cleanup();
            AudioManager.stopMusic();
            AudioManager.stopEffect();
            AudioManager.playEffect(AudioManager.audioName.endwin);
            this.win.active = true;
            // this.endwin("prefabs/hz/endwin_hz");
            // this.node.destroy();
        }, 1);
    }

    onlost() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }

    nextLevel() {
        GameData.nextlevel();
        this.node.destroy();
    }
}