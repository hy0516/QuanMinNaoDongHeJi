import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";


const { ccclass, property } = cc._decorator;

/** 角色配置：每对正确队列待策划确认 */
interface CharConfig {
    aniWrong: string;
    aniCorrect: string;
    correctQueue: "left" | "right";
}

const CHAR_CONFIG: CharConfig[] = [
    { aniWrong: "daiji03", aniCorrect: "daiji02", correctQueue: "left" },
    { aniWrong: "daiji05", aniCorrect: "daiji04", correctQueue: "left" },
    { aniWrong: "daiji07", aniCorrect: "daiji06", correctQueue: "right" },
    { aniWrong: "daiji09", aniCorrect: "daiji08", correctQueue: "right" },
    { aniWrong: "daiji011", aniCorrect: "daiji010", correctQueue: "right" },
    { aniWrong: "daiji013", aniCorrect: "daiji012", correctQueue: "left" },
    { aniWrong: "daiji015", aniCorrect: "daiji014", correctQueue: "left" },
    { aniWrong: "daiji017", aniCorrect: "daiji016", correctQueue: "right" },
];

const BOSS_LAB = "一会游客就要来了，你可给我认真招待，看准了再放进去！";
const BOSS_AUDIO = "一会游客就要来了你可给我认真招待看准了再放进去";

@ccclass
export default class ddmy_lv369 extends BaseGame {

    private charAniPrefab: cc.Prefab = null;
    private bgNode: cc.Node = null;
    private standPos: cc.Node = null;
    private leftPos: cc.Node = null;
    private rightPos: cc.Node = null;
    private standLeft: cc.Node = null;
    private standRight: cc.Node = null;
    private btnLeft: cc.Node = null;
    private btnRight: cc.Node = null;
    private btnTips: cc.Node = null;
    private tipsNode: cc.Node = null;

    private leftQueueY: number[] = [];
    private rightQueueY: number[] = [];
    private results: boolean[] = [];

    private curCharIndex = 0;
    private curCharNode: cc.Node = null;
    private curConfig: CharConfig = null;
    private waitingForChoice = false;
    private isInDialogue = false;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv369", null, 0.5);
        }, 0.5);

        this.bgNode = this.node.getChildByName("bgNode");
        this.standPos = this.bgNode.getChildByName("stand_pos");
        this.leftPos = this.bgNode.getChildByName("left_pos");
        this.rightPos = this.bgNode.getChildByName("right_pos");
        this.standLeft = this.bgNode.getChildByName("stand_left");
        this.standRight = this.bgNode.getChildByName("stand_right");
        this.btnLeft = this.node.getChildByName("btn_left");
        this.btnRight = this.node.getChildByName("btn_right");
        this.btnTips = this.node.getChildByName("btn_tips");
        this.tipsNode = this.node.getChildByName("tipsNode");

        if (this.tipsNode) this.tipsNode.active = false;
        const btnCloseNode = this.tipsNode ? this.tipsNode.getChildByName("btn_closeNode") : null;
        if (btnCloseNode) {
            btnCloseNode.on(cc.Node.EventType.TOUCH_END, () => {
                AudioManager.playEffect(AudioManager.common.BUTTON);
                if (this.tipsNode) this.tipsNode.active = false;
            }, this);
        }
        if (this.btnTips) {
            this.btnTips.on(cc.Node.EventType.TOUCH_END, () => this.onBtnTips(), this);
        }

        if (this.btnLeft) {
            this.btnLeft.active = false;
            this.btnLeft.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.waitingForChoice && !this.isInDialogue) {
                    AudioManager.playEffect(AudioManager.common.BUTTON);
                    this.onChoice("left");
                }
            }, this);
        }
        if (this.btnRight) {
            this.btnRight.active = false;
            this.btnRight.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.waitingForChoice && !this.isInDialogue) {
                    AudioManager.playEffect(AudioManager.common.BUTTON);
                    this.onChoice("right");
                }
            }, this);
        }

        AssetManager.load(GameData.curGameStyle, "char_Ani", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[ddmy_lv369] char_Ani 加载失败");
                return;
            }
            this.charAniPrefab = prefab;
            this.startBossFlow();
        });
    }

    private startBossFlow() {
        const armDisp = this.standPos.getComponent(dragonBones.ArmatureDisplay);
        if (armDisp) armDisp.enabled = false;

        const pos = this.standPos.getPosition();
        const spawnX = pos.x - 1000;

        const boss = cc.instantiate(this.charAniPrefab);
        boss.parent = this.bgNode;
        boss.setPosition(spawnX, pos.y, 0);

        const ske = boss.getComponent(dragonBones.ArmatureDisplay);
        if (ske) ske.playAnimation("daiji01", 0);
        AudioManager.playEffect("角色出场");

        cc.tween(boss)
            .to(0.75, { x: pos.x })
            .call(() => {
                this.showqp(boss, BOSS_LAB, BOSS_AUDIO, () => {
                    cc.tween(boss)
                        .to(1.5, { x: pos.x + 1000 })
                        .call(() => {
                            boss.destroy();
                            this.scheduleOnce(() => this.nextChar(), 0.5);
                        })
                        .start();
                });
            })
            .start();
    }

    private nextChar() {
        if (this.curCharIndex >= 8) {
            this.doEndResult();
            return;
        }

        this.curConfig = CHAR_CONFIG[this.curCharIndex];
        const pos = this.standPos.getPosition();
        const spawnX = pos.x - 1000;
        const charY = this.curCharIndex === 1 ? pos.y + 150 : pos.y;

        const charNode = cc.instantiate(this.charAniPrefab);
        charNode.parent = this.bgNode;
        charNode.setPosition(spawnX, charY, 0);

        const ske = charNode.getComponent(dragonBones.ArmatureDisplay);
        if (ske) ske.playAnimation(this.curConfig.aniWrong, 0);
        AudioManager.playEffect("角色出场");

        this.curCharNode = charNode;

        const charIdx = this.curCharIndex;
        cc.tween(charNode)
            .to(0.75, { x: pos.x, y: charY })
            .call(() => {
                AudioManager.playEffect("char" + (charIdx + 1), false, () => {
                    this.showChoiceButtons();
                });
            })
            .start();
    }

    private showChoiceButtons() {
        this.waitingForChoice = true;
        if (this.btnLeft) this.btnLeft.active = true;
        if (this.btnRight) this.btnRight.active = true;
    }

    private hideChoiceButtons() {
        this.waitingForChoice = false;
        if (this.btnLeft) this.btnLeft.active = false;
        if (this.btnRight) this.btnRight.active = false;
        if (this.tipsNode) this.tipsNode.active = false;
    }

    private onBtnTips() {
        if (!this.waitingForChoice || !this.curConfig || !this.tipsNode) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        VideoManager.getInstance().showVideo(() => {
            const labNode = this.tipsNode.getChildByName("Label");
            if (labNode) {
                const lab = labNode.getComponent(cc.Label);
                if (lab) lab.string = this.curConfig.correctQueue === "left" ? "选左" : "选右";
            }
            this.tipsNode.active = true;
        });
    }

    private onChoice(selectedQueue: "left" | "right") {
        if (!this.waitingForChoice || !this.curCharNode || !this.curConfig) return;
        this.hideChoiceButtons();

        const targetPosNode = selectedQueue === "left" ? this.leftPos : this.rightPos;
        const targetStand = this.curConfig.correctQueue === "left" ? this.standLeft : this.standRight;
        const targetPos = targetPosNode.getPosition();

        const charNode = this.curCharNode;
        const isCorrect = selectedQueue === this.curConfig.correctQueue;
        this.results.push(isCorrect);

        cc.tween(charNode)
            .to(1.2, { x: targetPos.x, y: targetPos.y, scale: 0.3 })
            .call(() => {
                cc.tween(charNode)
                    .to(0.3, { opacity: 0 })
                    .call(() => {
                        AudioManager.playEffect("洗澡声");
                        this.scheduleOnce(() => {
                            this.reappearAndQueue(charNode, targetPosNode, targetStand, selectedQueue, isCorrect);
                        }, 2.5);
                    })
                    .start();
            })
            .start();
    }

    private reappearAndQueue(charNode: cc.Node, bathTarget: cc.Node, standTarget: cc.Node, selectedQueue: "left" | "right", isCorrect: boolean) {
        const ske = charNode.getComponent(dragonBones.ArmatureDisplay);
        if (ske) {
            ske.playAnimation(isCorrect ? this.curConfig.aniCorrect : this.curConfig.aniWrong, 0);
        }
        AudioManager.playEffect(isCorrect ? "洗浴正确" : "洗浴错误");

        charNode.opacity = 255;
        charNode.scale = 0.3;
        const bathPos = bathTarget.getPosition();
        charNode.setPosition(bathPos.x, bathPos.y, 0);

        const standPos = standTarget.getPosition();
        const queueArr = this.curConfig.correctQueue === "left" ? this.leftQueueY : this.rightQueueY;
        const baseY = standPos.y;
        const queueY = baseY + (queueArr.length * -50);
        queueArr.push(queueY);

        const moveToStandDur = 0.8;
        cc.tween(charNode)
            .to(moveToStandDur, { x: standPos.x, y: standPos.y, scale: 0.6 })
            .to(0.8, { y: queueY })
            .call(() => {
                this.curCharIndex++;
                this.curCharNode = null;
                this.scheduleOnce(() => this.nextChar(), 0.5);
            })
            .start();
    }

    private doEndResult() {
        const allCorrect = this.results.every(r => r);
        if (allCorrect) {
            this.onwin();
        } else {
            this.onlost();
        }
    }

    private showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: () => void) {
        this.isInDialogue = true;
        const qp = qpnode.getChildByName("qp");
        if (!qp) {
            this.isInDialogue = false;
            handler && handler();
            return;
        }
        const qplab = qp.getChildByName("qplab");
        if (qplab) {
            const labComp = qplab.getComponent(cc.Label);
            if (labComp) labComp.string = lab;
        }
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                });
            })
            .start();
    }

    private hideqp(qpnode: cc.Node, handler?: () => void) {
        const qp = qpnode.getChildByName("qp");
        if (!qp) {
            this.isInDialogue = false;
            handler && handler();
            return;
        }
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.isInDialogue = false;
                handler && handler();
            })
            .start();
    }

    update(dt: number) {
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        const target = even.currentTarget || even.target;
        const name = target ? (target as cc.Node).name : "";
        switch (name) {
            case "btn_close":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.openpausePanel();
                break;
            case "btn_left":
                if (this.waitingForChoice && !this.isInDialogue) {
                    AudioManager.playEffect(AudioManager.common.BUTTON);
                    this.onChoice("left");
                }
                break;
            case "btn_right":
                if (this.waitingForChoice && !this.isInDialogue) {
                    AudioManager.playEffect(AudioManager.common.BUTTON);
                    this.onChoice("right");
                }
                break;
        }
    }


    onDestroy() {
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

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(`button`);
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
        }, 1);
    }
}
