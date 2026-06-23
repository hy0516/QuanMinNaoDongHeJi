import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import DragItem356 from "./DragItem356";

const { ccclass, property } = cc._decorator;

/** type 与物品对应：1衣服 2蛋糕 3书包 4笔记本 5锄头 6鸡蛋 7扁担 8米饭 9交换到左 10交换到右 */
const BXJ_TYPE = { yifu: 1, dangao: 2, shubao: 3, bijiben: 4, chutou: 5, jidan: 6, biandan: 7, mifan: 8, swapLeft: 9, swapRight: 10 };

/** xmind 台词（气泡显示） */
const BXJ_LAB = {
    yifu: "换了身新衣服，大家都夸我漂亮呢",
    dangao: "原来不是生病，只是营养不良",
    shubao: "自己成绩还不错，回去后一定要加倍用功",
    bijiben: "互联网的普及，让人们足不出户也可增长见识",
    chutou: "体验过种地的艰难，才对'粒粒皆辛苦'这句话有了切身体会",
    jidan: "跑这么老远的路，才挣到几块钱，挣钱原来这么难",
    biandan: "以前从不在意的水，在山里竟然要走上好久才能挑到一点",
    mifanOk: "通过劳动换来的成果真香",
    mifanBad: "这么难吃的饭本小姐才不吃",
    swapLeftOk: "接手家业后，我把企业做得更大更强了",
    swapLeftBad: "我把家底都败光了",
    swapRightOk: "靠着自己的努力，我终于从大山里走了出来",
    swapRightBad: "难道我这辈子就只能困在这大山里了？",
};
/** 开场台词 */
const BXJ_OPEN_LAB = "赶紧换回来！这地方本小姐我受够了！";
const BXJ_OPEN_AUDIO = "赶紧换回来！这地方本小姐我受够了";

/** 对应含义的音频（audio_lv356 中匹配的即可） */
const BXJ_AUDIO = {
    yifu: "换了身新衣服，大家都夸我漂亮呢",
    dangao: "原来不是生病，只是营养不良",
    shubao: "自己成绩还不错，回去后一定要加倍用功",
    bijiben: "互联网的普及，让人们足不出户也可增长见识",
    chutou: "体验过种地的艰难，才对‘粒粒皆辛苦’这句话有了切身体会",
    jidan: "跑这么老远的路，才挣到几块钱，挣钱原来这么难",
    biandan: "对白：以前从不在意的水，在山里竟然要走上好久才能挑到一点",
    mifanOk: "通过劳动换来的成果真香",
    mifanBad: "这么难吃的饭本小姐才不吃",
    swapLeftOk: "接手家业后，我把企业做得更大更强了",
    swapLeftBad: "我把家底都败光了",
    swapRightOk: "靠着自己的努力，我终于从大山里走了出来",
    swapRightBad: "难道我这辈子就只能困在这大山里了？",
};

@ccclass
export default class bxj_lv356 extends BaseGame {

    static isInDialogue = false;

    @property(cc.Node)
    leftGirlNode: cc.Node = null;

    @property(cc.Node)
    rightGirlNode: cc.Node = null;

    @property(cc.Node)
    guoduNode: cc.Node = null;

    @property(cc.Node)
    winNode: cc.Node = null;

    @property(cc.Node)
    lostNode: cc.Node = null;

    private leftDone: boolean[] = [false, false, false, false]; // 衣服 蛋糕 书包 笔记本
    private rightDone: boolean[] = [false, false, false, false]; // 锄头 鸡蛋 扁担 米饭
    private leftSlotX: number = -187;
    private rightSlotX: number = 187;
    private btnTipsNode: cc.Node = null;
    private tipsNode: cc.Node = null;
    private tipsLabel: cc.Label = null;
    private tipsCloseNode: cc.Node = null;

    onLoad() {
        const left = this.leftGirlNode || this.node.getChildByName("leftgirlNode") || this.node.getChildByName("leftGirl");
        const right = this.rightGirlNode || this.node.getChildByName("rightgirlNode") || this.node.getChildByName("rightGirl");
        if (left) this.leftSlotX = left.x;
        if (right) this.rightSlotX = right.x;
        this.bindTipsEvents();
        if (this.tipsNode) this.tipsNode.active = false;
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv356`);
        }, 0.5);
        this.scheduleOnce(() => {
            this.showOpeningDialogue();
        }, 0.5);
    }

    onDestroy() {
        if (this.btnTipsNode) {
            this.btnTipsNode.off(cc.Node.EventType.TOUCH_END, this.onTipsBtnClick, this);
        }
        if (this.tipsCloseNode) {
            this.tipsCloseNode.off(cc.Node.EventType.TOUCH_END, this.onTipsCloseClick, this);
        }
    }

    private showOpeningDialogue() {
        const nodeRight = this.rightGirlNode || this.node.getChildByName("rightGirl") || this.node.getChildByName("右边女孩");
        if (nodeRight) {
            this.showqp(nodeRight, BXJ_OPEN_LAB, BXJ_OPEN_AUDIO, () => {
                this.enableAllDragItems();
            });
        } else {
            this.enableAllDragItems();
        }
    }

    private enableAllDragItems() {
        const items = this.node.getComponentsInChildren(DragItem356);
        for (const item of items) {
            if (item.main === null) item.main = this.node;
            item.enable();
        }
    }

    private disableAllDragItems() {
        const items = this.node.getComponentsInChildren(DragItem356);
        for (const item of items) {
            item.disable();
        }
    }

    private bindTipsEvents() {
        this.btnTipsNode = this.node.getChildByName("btn_tips");
        if (this.btnTipsNode) {
            this.btnTipsNode.off(cc.Node.EventType.TOUCH_END, this.onTipsBtnClick, this);
            this.btnTipsNode.on(cc.Node.EventType.TOUCH_END, this.onTipsBtnClick, this);
        }

        this.tipsNode = this.node.getChildByName("tipsNode");
        if (this.tipsNode) {
            const tipsLabelNode = this.tipsNode.getChildByName("tipsLabel");
            this.tipsLabel = tipsLabelNode ? tipsLabelNode.getComponent(cc.Label) : null;
            this.tipsCloseNode = this.tipsNode.getChildByName("x");
            if (this.tipsCloseNode) {
                this.tipsCloseNode.off(cc.Node.EventType.TOUCH_END, this.onTipsCloseClick, this);
                this.tipsCloseNode.on(cc.Node.EventType.TOUCH_END, this.onTipsCloseClick, this);
            }
        }
    }

    private onTipsBtnClick() {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            if (!this.tipsNode) return;
            if (this.tipsLabel) {
                this.tipsLabel.string = this.getCurrentTipsText();
            }
            this.tipsNode.active = true;
        });
    }

    private onTipsCloseClick() {
        if (!this.tipsNode) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.tipsNode.active = false;
    }

    private getCurrentTipsText(): string {
        if (!this.leftDone[0]) {
            return "先滑动左边衣柜，再把衣服拖给左边女孩";
        }
        if (!this.leftDone[1]) {
            return "把蛋糕拖给左边女孩";
        }
        if (!this.leftDone[2]) {
            return "把书包拖给左边女孩";
        }
        if (!this.leftDone[3]) {
            return "把笔记本拖给左边女孩";
        }
        if (!this.rightDone[0]) {
            return "把锄头拖给右边女孩";
        }
        if (!this.rightDone[1]) {
            return "把鸡蛋拖给右边女孩";
        }
        if (!this.rightDone[2]) {
            return "先滑动右边窗户，再把扁担拖给右边女孩";
        }
        if (!this.rightDone[3]) {
            return "把肉拖给右边女孩";
        }
        return "两个女孩子互换位置";
    }

    private isLeftTarget(name: string): boolean {
        return !!(name && (name.indexOf("左") >= 0 || name.indexOf("left") >= 0));
    }

    private isRightTarget(name: string): boolean {
        return !!(name && (name.indexOf("右") >= 0 || name.indexOf("right") >= 0));
    }

    private getLeftSke(): dragonBones.ArmatureDisplay | null {
        const node = this.leftGirlNode || this.node.getChildByName("leftGirl") || this.node.getChildByName("左边女孩");
        const ske = node ? node.getChildByName("ske") : null;
        return ske ? ske.getComponent(dragonBones.ArmatureDisplay) : null;
    }

    private getRightSke(): dragonBones.ArmatureDisplay | null {
        const node = this.rightGirlNode || this.node.getChildByName("rightGirl") || this.node.getChildByName("右边女孩");
        const ske = node ? node.getChildByName("ske") : null;
        return ske ? ske.getComponent(dragonBones.ArmatureDisplay) : null;
    }

    private playRightSke(animName: string) {
        const ske = this.getRightSke();
        if (!ske) return;
        ske.playAnimation(animName, 0);
    }

    private playLeftSke(animName: string) {
        const ske = this.getLeftSke();
        if (!ske) return;
        ske.playAnimation(animName, 0);
        try {
            const arm = ske.armature();
            if (!arm) return;
            if (this.leftDone[3]) {
                const s20 = arm.getSlot("20");
                if (s20 && s20.displayIndex < 0) this.changeSKSlotIndex(ske, "20", 0);
            }
            if (this.leftDone[2]) {
                const s17 = arm.getSlot("17");
                const s19 = arm.getSlot("19");
                if (s17 && s17.displayIndex !== 0) this.changeSKSlotIndex(ske, "17", 0);
                if (s19 && s19.displayIndex !== 0) this.changeSKSlotIndex(ske, "19", 0);
            }
        } catch (_) { }
    }

    private playLeftAnimFor(type: number) {
        if (type === BXJ_TYPE.yifu) {
            this.playLeftSke(this.leftDone[1] ? "q_dj4" : "q_dj3");
        } else if (type === BXJ_TYPE.dangao) {
            this.playLeftSke(this.leftDone[0] ? "q_dj4" : "q_dj2");
        } else if (type === BXJ_TYPE.shubao||type === BXJ_TYPE.bijiben) {
            const ateCake = this.leftDone[1];
            const woreDress = this.leftDone[0];
            this.playLeftSke(ateCake && woreDress ? "q_dj4" : ateCake && !woreDress ? "q_dj2" : "q_dj1");
        }
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch, done?: (accepted: boolean) => void, item?: DragItem356) {
        this.onInteract(type, tar, done, item);
    }

    protected onInteract(type: number, target: cc.Node, done?: (accepted: boolean) => void, item?: DragItem356) {
        const qpLeft = this.leftGirlNode || this.node.getChildByName("leftGirl") || this.node.getChildByName("左边女孩");
        const qpRight = this.rightGirlNode || this.node.getChildByName("rightGirl") || this.node.getChildByName("右边女孩");
        const nodeLeft = qpLeft || this.node;
        const nodeRight = qpRight || this.node;
        const tarName = target ? target.name : "";

        const enableCb = () => this.enableAllDragItems();
        const showLeft = (lab: string, audio: string, cb?: () => void) => {
            if (nodeLeft) this.showqp(nodeLeft, lab, audio, cb || enableCb);
        };
        const showRight = (lab: string, audio: string, cb?: () => void) => {
            if (nodeRight) this.showqp(nodeRight, lab, audio, cb || enableCb);
        };

        if (this.isLeftTarget(tarName)) {
            this.disableAllDragItems();
            if (type === BXJ_TYPE.yifu) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.leftDone[0] = true;
                this.playLeftAnimFor(type);
                showLeft(BXJ_LAB.yifu, BXJ_AUDIO.yifu);
            } else if (type === BXJ_TYPE.dangao) {
                AudioManager.playEffect("正确操作");
                AudioManager.playEffect("吃蛋糕-米饭");
                item && item.disable();
                this.leftDone[1] = true;
                this.playLeftAnimFor(type);
                showLeft(BXJ_LAB.dangao, BXJ_AUDIO.dangao);
            } else if (type === BXJ_TYPE.shubao) {
                if (!this.leftDone[0] && !this.leftDone[1]) {
                    done && done(false);
                    return;
                }
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.leftDone[2] = true;
                this.playLeftAnimFor(type);
                const leftNode = this.leftGirlNode || this.node.getChildByName("leftGirl") || this.node.getChildByName("左边女孩");
                if (leftNode) {
                    const startX = leftNode.x;
                    cc.tween(leftNode)
                        .to(1, { x: startX - 1000 })
                        .to(1, { x: startX })
                        .call(() => {
                            showLeft(BXJ_LAB.shubao, BXJ_AUDIO.shubao);
                        })
                        .start();
                } else {
                    showLeft(BXJ_LAB.shubao, BXJ_AUDIO.shubao);
                }
            } else if (type === BXJ_TYPE.bijiben) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.leftDone[3] = true;
                this.playLeftAnimFor(type);
                showLeft(BXJ_LAB.bijiben, BXJ_AUDIO.bijiben);
            } else if (type === BXJ_TYPE.swapRight) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.startSwapSequence();
            } else if (type === BXJ_TYPE.swapLeft) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.startSwapSequence();
            }
            return;
        }

        if (this.isRightTarget(tarName)) {
            this.disableAllDragItems();
            const rightOutBack = (animName: string, lab: string, audio: string) => {
                this.playRightSke(animName);
                const startX = nodeRight.x;
                cc.tween(nodeRight)
                    .to(1, { x: startX + 1000 })
                    .to(1, { x: startX })
                    .call(() => {
                        showRight(lab, audio, () => {
                            this.playRightSke("f_dj1");
                            this.enableAllDragItems();
                        });
                    })
                    .start();
            };
            if (type === BXJ_TYPE.chutou) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.rightDone[0] = true;
                rightOutBack("f_dj2", BXJ_LAB.chutou, BXJ_AUDIO.chutou);
            } else if (type === BXJ_TYPE.jidan) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.rightDone[1] = true;
                rightOutBack("f_dj3", BXJ_LAB.jidan, BXJ_AUDIO.jidan);
            } else if (type === BXJ_TYPE.biandan) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.rightDone[2] = true;
                rightOutBack("f_dj4", BXJ_LAB.biandan, BXJ_AUDIO.biandan);
            } else if (type === BXJ_TYPE.mifan) {
                const r3 = this.rightDone[0] && this.rightDone[1] && this.rightDone[2];
                if (r3) {
                    AudioManager.playEffect("正确操作");
                    AudioManager.playEffect("吃蛋糕-米饭");
                    item && item.disable();
                    this.rightDone[3] = true;
                    this.playRightSke("f_dj5");
                    showRight(BXJ_LAB.mifanOk, BXJ_AUDIO.mifanOk);
                } else {
                    done && done(false);
                    showRight(BXJ_LAB.mifanBad, BXJ_AUDIO.mifanBad);
                }
            } else if (type === BXJ_TYPE.swapLeft) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.startSwapSequence();
            } else if (type === BXJ_TYPE.swapRight) {
                AudioManager.playEffect("正确操作");
                item && item.disable();
                this.startSwapSequence();
            }
        }
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
        AudioManager.playEffect(`button`);//AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz
    }

    onwin() {
      
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 2);
    }

    onlost() {
       
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
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        bxj_lv356.isInDialogue = true;
        const qp = qpnode.getChildByName("qp");
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                });
            })
            .start();
    }

    hideqp(qpnode: cc.Node, handler?: Function) {
        const qp = qpnode.getChildByName("qp");
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                bxj_lv356.isInDialogue = false;
                handler && handler();
            })
            .start();
    }

    private startSwapSequence() {
        const leftNode = this.leftGirlNode || this.node.getChildByName("leftgirlNode") || this.node.getChildByName("leftGirl");
        const rightNode = this.rightGirlNode || this.node.getChildByName("rightgirlNode") || this.node.getChildByName("rightGirl");
        const guodu = this.guoduNode || this.node.getChildByName("guoduNode");
        const win = this.winNode || this.node.getChildByName("winNode");
        const lost = this.lostNode || this.node.getChildByName("lostNode");

        const leftComplete = this.leftDone.every(b => b);
        const rightComplete = this.rightDone.every(b => b);
        const bothWin = leftComplete && rightComplete;

        const leftSlotX = this.leftSlotX;
        const rightSlotX = this.rightSlotX;

        const showBothResultsAndDialogue = () => {
            if (!win || !lost) return;
            win.active = true;
            lost.active = true;
            win.opacity = 0;
            lost.opacity = 0;

            const winLeft = win.getChildByName("leftgirlNode") || win.getChildByName("leftGirl");
            const winRight = win.getChildByName("rightgirlNode") || win.getChildByName("rightGirl");
            const lostLeft = lost.getChildByName("leftgirlNode") || lost.getChildByName("leftGirl");
            const lostRight = lost.getChildByName("rightgirlNode") || lost.getChildByName("rightGirl");

            // 右侧达成算左边成功，左侧达成算右边成功（交换后屏幕左右对应）
            if (winLeft) winLeft.active = rightComplete;
            if (winRight) winRight.active = leftComplete;
            if (lostLeft) lostLeft.active = !rightComplete;
            if (lostRight) lostRight.active = !leftComplete;

            const leftLab = rightComplete ? BXJ_LAB.swapLeftOk : BXJ_LAB.swapLeftBad;
            const leftAudio = rightComplete ? BXJ_AUDIO.swapLeftOk : BXJ_AUDIO.swapLeftBad;
            const rightLab = leftComplete ? BXJ_LAB.swapRightOk : BXJ_LAB.swapRightBad;
            const rightAudio = leftComplete ? BXJ_AUDIO.swapRightOk : BXJ_AUDIO.swapRightBad;

            const leftQpNode = rightComplete ? winLeft : lostLeft;
            const rightQpNode = leftComplete ? winRight : lostRight;

            cc.tween(win).to(0.6, { opacity: 255 }).start();
            cc.tween(lost).to(0.6, { opacity: 255 }).call(() => {
                const playNext = () => {
                    if (rightQpNode) {
                        this.showqp(rightQpNode, rightLab, rightAudio, () => (bothWin ? this.onwin() : this.onlost()));
                    } else {
                        bothWin ? this.onwin() : this.onlost();
                    }
                };
                if (leftQpNode) {
                    this.showqp(leftQpNode, leftLab, leftAudio, playNext);
                } else {
                    playNext();
                }
            }).start();
        };

        const parallel = (tweens: (() => void)[]) => tweens.forEach(t => t());

        if (leftNode && rightNode) {
            parallel([
                () => cc.tween(leftNode).to(.2, { x: rightSlotX }).start(),
                () => cc.tween(rightNode).to(.2, { x: leftSlotX }).start()
            ]);
            this.scheduleOnce(() => {
                if (guodu) {
                    guodu.active = true;
                    guodu.opacity = 0;
                    cc.tween(guodu)
                        .to(0.6, { opacity: 255 })
                        .delay(2)
                        .call(() => {
                            guodu.active = false;
                            showBothResultsAndDialogue();
                        })
                        .start();
                } else {
                    showBothResultsAndDialogue();
                }
            }, 1);
        }
    }
}
