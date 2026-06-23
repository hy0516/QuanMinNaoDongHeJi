import AssetManager from "./AssetManager";
import AudioManager from "./AudioManager";
import common from "./common";
import GameData from "./GameData";
import VideoManager from "./VideoManager";
import levelConfig from "./levelConfig";
import smallLoading from "./smallLoading";



const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseGame extends cc.Component {

    private returnLoadingNode: cc.Node = null;
    private isReturningToHall = false;
    private isSpecialRedirecting = false;
    private pendingSpecialLevelKey: string = null;
    private pendingHallPrefab: cc.Prefab = null;
    private destroyQueue: cc.Node[] = [];
    private levelNodesCleared = false;
    private readonly destroyBatchSize = 120;
    private readonly specialReturnLevels: string[] = ["lv289/ajs_lv289","lv289/ajs_lv289_2", "lv232/ajs_lv232"];
    private readonly specialReturnTargetLevel = "lv100/ajs_lv100";
    private hallMounted = false;

    public isGameOver: boolean;
    addOneTimeListener(
        armatureDisplay: dragonBones.ArmatureDisplay,
        callback: (event: dragonBones.EventObject) => void,
        type?: string,
        target?: any
    ) {
        if (!type) type = dragonBones.EventObject.COMPLETE;
        const wrappedCallback = (event: dragonBones.EventObject) => {
            // 移除监听器
            armatureDisplay.removeEventListener(type, wrappedCallback, target);

            // 执行回调
            callback(event);
        };

        // 添加监听器
        armatureDisplay.addEventListener(type, wrappedCallback as any, target);
    }
    gameAllPause() {
        cc.audioEngine.pauseAll();
        cc.director.pause();
    }
    gameAllResume() {
        cc.audioEngine.resumeAll();
        cc.director.resume();
    }
    changeSKSlotIndex(ske: dragonBones.ArmatureDisplay, slotName: string, slotIndex: number) {
        ske.armature().getSlot(`${slotName}`).displayIndex = slotIndex;
    }
    openpausePanel() {
        cc.resources.load(`prefabs/common/pausePanel`, cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = this.node;
        })
    }
    fanhui() {
        if (this.isReturningToHall || this.isSpecialRedirecting) {
            return;
        }
        GameData.PauseGame = false;
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        this.node.cleanup();
        AudioManager.playEffect(AudioManager.wenzi.button_wz);

        const currentLevelKey = `${GameData.curGameStyle}/${GameData.curGameName}`;
        if (this.tryRedirectToSpecialLevel(currentLevelKey)) {
            return;
        }

        this.isReturningToHall = true;
        this.showReturnLoadingMask();
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!this.isReturningToHall) {
                return;
            }
            if (err || !prefab) {
                cc.error("[BaseGame] 返回大厅加载 Hall 失败", err?.message);
                this.handleReturnFailure();
                return;
            }
            this.pendingHallPrefab = prefab;
            this.mountHallIfPossible();
            this.tryFinalizeReturnToHall();
        })
        this.beginAsyncLevelDestroy();
    };
    endwin(name: string) {
        cc.resources.load(name, cc.Prefab, (err, end: cc.Prefab) => {
            var endNode = cc.instantiate(end);
            endNode.parent = cc.find("Canvas");
            endNode.opacity = 0;
            if (this.node) this.node.destroy();
            cc.tween(endNode)
                .to(0.8, { opacity: 255 })
                .start()
        })
    }
    nextPre() { }
    endlost(name: string) {
        cc.resources.load(name, cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            UINode.opacity = 0;
            cc.tween(UINode)
                .to(0.8, { opacity: 255 })
                .start()
        })
    }

    restart() {
        GameData.onDele();
        const levelKey = `${GameData.curGameStyle}/${GameData.curGameName}`;
        this.openLevelWithSmallLoading(levelKey, () => this.reloadLevelDirectly());
    };
    private reloadLevelDirectly() {
        const levelKey = `${GameData.curGameStyle}/${GameData.curGameName}`;
        this.directLoadLevel(levelKey);
    }

    protected openLevelWithSmallLoading(levelKey: string, onFail?: () => void) {
        const fail = (message?: string) => {
            if (message) {
                cc.warn(message);
            }
            onFail && onFail();
        };

        const parsed = this.parseLevelKey(levelKey);
        if (!parsed) {
            fail(`[BaseGame] levelKey ${levelKey} 格式错误，无法打开关卡`);
            return;
        }

        const canvas = this.getCanvas("[BaseGame] Canvas 不存在，无法打开关卡");
        if (!canvas) {
            fail();
            return;
        }

        cc.resources.load("prefabs/common/smallLoading", cc.Prefab, (err, pre: cc.Prefab) => {
            if (err || !pre) {
                const errorMsg = `[BaseGame] smallLoading 加载失败${err?.message ? `: ${err.message}` : ""}`;
                fail(errorMsg);
                return;
            }
            const loadingNode = cc.instantiate(pre);
            loadingNode.parent = canvas;
            loadingNode.setSiblingIndex(canvas.childrenCount - 1);

            const loadingComp = loadingNode.getComponent(smallLoading);
            if (!loadingComp) {
                loadingNode.destroy();
                fail("[BaseGame] smallLoading 组件缺失");
                return;
            }

            const { style, name } = parsed;
            GameData.curGameStyle = style;
            GameData.curGameName = name;
            loadingComp.PreName = levelKey;
            const cfg = levelConfig.new?.find(item => item.level === levelKey);
            if (cfg) {
                loadingComp.lvConfig = cfg;
            }
            loadingComp.onInit();
            this.destroySelfNextFrame();
        });
    }

    protected directLoadLevel(levelKey: string) {
        const parsed = this.parseLevelKey(levelKey);
        if (!parsed) {
            cc.warn(`[BaseGame] levelKey ${levelKey} 格式错误，无法直接加载`);
            return;
        }
        const { style, name } = parsed;
        GameData.curGameStyle = style;
        GameData.curGameName = name;
        AssetManager.load(style, name, cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error(`[BaseGame] 直接加载 ${levelKey} 失败，Prefab 不存在`);
                return;
            }
            const ui = cc.instantiate(prefab);
            const canvas = this.getCanvas();
            if (canvas) {
                ui.parent = canvas;
            } else {
                ui.parent = cc.director.getScene();
            }
            GameData.PauseGame = false;
            this.destroySelfNextFrame();
        });
    }

    protected goToLevel(levelKey: string) {
        if (!levelKey) {
            return;
        }
        GameData.onDele();
        this.openLevelWithSmallLoading(levelKey, () => this.directLoadLevel(levelKey));
    }

    private tryRedirectToSpecialLevel(currentLevelKey: string): boolean {
        const shouldRedirect = !!currentLevelKey && this.specialReturnLevels.indexOf(currentLevelKey) !== -1;
        if (!shouldRedirect) {
            return false;
        }
        if (this.isSpecialRedirecting) {
            return true;
        }
        this.isSpecialRedirecting = true;
        this.pendingSpecialLevelKey = this.specialReturnTargetLevel;
        this.showReturnLoadingMask();
        this.beginAsyncLevelDestroy();
        return true;
    }

    private destroySelfNextFrame() {
        if (!cc.isValid(this.node)) {
            return;
        }
        this.scheduleOnce(() => {
            if (cc.isValid(this.node)) {
                this.node.destroy();
            }
        }, 0);
    }

    private parseLevelKey(levelKey: string): { style: string; name: string } | null {
        if (!levelKey) {
            return null;
        }
        const [style, name] = levelKey.split("/");
        if (!style || !name) {
            return null;
        }
        return { style, name };
    }

    private getCanvas(warnMessage?: string): cc.Node | null {
        const canvas = cc.find("Canvas");
        if (!canvas && warnMessage) {
            cc.warn(warnMessage);
        }
        return canvas;
    }

    private resetReturnFlowState() {
        this.pendingHallPrefab = null;
        this.levelNodesCleared = false;
        this.isReturningToHall = false;
        this.hallMounted = false;
    }


    private beginAsyncLevelDestroy() {
        this.destroyQueue = this.node.children.slice();
        if (!this.destroyQueue.length) {
            this.levelNodesCleared = true;
            this.tryFinalizeReturnToHall();
            return;
        }
        this.schedule(this.processDestroyQueueStep, 0);
    }

    private processDestroyQueueStep() {
        let processed = 0;
        while (this.destroyQueue.length && processed < this.destroyBatchSize) {
            const target = this.destroyQueue.pop();
            if (target && cc.isValid(target)) {
                target.destroy();
            }
            processed++;
        }
        if (!this.destroyQueue.length) {
            this.unschedule(this.processDestroyQueueStep);
            this.levelNodesCleared = true;
            this.tryFinalizeReturnToHall();
        }
    }

    private mountHallIfPossible() {
        if (this.hallMounted || !this.pendingHallPrefab) {
            return;
        }
        const canvas = this.getCanvas();
        if (!canvas) {
            return;
        }
        const hallNode = cc.instantiate(this.pendingHallPrefab);
        hallNode.parent = canvas;
        hallNode.setSiblingIndex(canvas.childrenCount - 1);
        GameData.onDele();
        VideoManager.getInstance().showBaoXiang();
        this.cleanupReturnLoadingMask();
        this.hallMounted = true;
    }

    private tryFinalizeReturnToHall() {
        if (this.isSpecialRedirecting) {
            this.tryFinalizeSpecialRedirect();
            return;
        }
        if (!this.isReturningToHall) {
            return;
        }
        if (!this.hallMounted) {
            this.mountHallIfPossible();
        }
        if (!this.levelNodesCleared || !this.hallMounted) {
            return;
        }
        this.resetReturnFlowState();
        if (cc.isValid(this.node)) {
            this.node.destroy();
        }
    }

    private tryFinalizeSpecialRedirect() {
        if (!this.levelNodesCleared) {
            return;
        }
        const targetLevel = this.pendingSpecialLevelKey || this.specialReturnTargetLevel;
        this.pendingSpecialLevelKey = null;
        this.cleanupReturnLoadingMask();
        this.levelNodesCleared = false;
        this.isSpecialRedirecting = false;
        this.goToLevel(targetLevel);
    }

    private handleReturnFailure() {
        this.cleanupReturnLoadingMask();
        this.resetReturnFlowState();
        this.unschedule(this.processDestroyQueueStep);
        this.destroyQueue = [];
    }

    private showReturnLoadingMask() {
        if (this.returnLoadingNode && cc.isValid(this.returnLoadingNode)) {
            this.returnLoadingNode.active = true;
            return;
        }
        const canvas = this.getCanvas();
        if (!canvas) {
            return;
        }
        const mask = new cc.Node("ReturnLoadingMask");
        mask.parent = canvas;
        mask.setSiblingIndex(canvas.childrenCount - 1);
        mask.addComponent(cc.BlockInputEvents);
        const widget = mask.addComponent(cc.Widget);
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = widget.bottom = widget.left = widget.right = 0;

        const graphicsNode = new cc.Node("ReturnMaskGraphics");
        graphicsNode.parent = mask;
        const graphics = graphicsNode.addComponent(cc.Graphics);
        const size = cc.winSize;
        graphics.clear();
        graphics.fillColor = new cc.Color(0, 0, 0, 180);
        graphics.rect(-size.width / 2, -size.height / 2, size.width, size.height);
        graphics.fill();

        const labelNode = new cc.Node("ReturnLabel");
        labelNode.parent = mask;
        const label = labelNode.addComponent(cc.Label);
        label.string = "返回大厅中...";
        label.fontSize = 40;
        label.lineHeight = 46;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.y = 0;

        this.returnLoadingNode = mask;
    }

    private cleanupReturnLoadingMask() {
        if (this.returnLoadingNode && cc.isValid(this.returnLoadingNode)) {
            this.returnLoadingNode.destroy();
            this.returnLoadingNode = null;
        }
    }




    getbodys(node: cc.Node, name: string): cc.Node[] {
        var list: cc.Node[] = [];
        var target = node;
        if (target && target.childrenCount) {
            var total = target.childrenCount;
            var mode;
            for (var i = 0; i < total; i++) {
                var obj = target.children[i];
                if (!obj) continue;
                if (obj.name == name) {
                    list.push(obj);
                }
                if (obj.childrenCount > 0) {
                    var list2 = this.getbodys(obj, name);
                    list.push(...list2);
                }
            }
        }
        return list;
    }
    endAddTime() { }
    addchance() { }
    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch, handler?: Function) { }
    tweenState2(event: cc.Event.EventTouch, tar: cc.Node, name: string, handler?: Function, audio?: string) { }
    setTime(time: number) { }
    onwin() { }
    addTime(even: TouchEvent, time?: number) { }
    loadend() { };
    update(dt: number): void {

    }
    protected onDestroy(): void {
        
    }

}
