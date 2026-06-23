import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import ArrowNote366 from "./ArrowNote366";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gumi_lv366 extends BaseGame {
    canjiaohu = false;
    flag = true;

    // 生命值系统（5颗心）
    hp: number = 5;
    isGameOver: boolean = false;
    isResurrecting: boolean = false;  // 是否是复活后进入关卡

    // 判定结果显示相关
    private _judgeCallback: Function = null;

    @property(cc.Node)
    luoxia: cc.Node = null;

    @property(cc.Node)
    ske: cc.Node = null;
    sk: dragonBones.ArmatureDisplay = null;

    @property(ArrowNote366)
    arrowCtrl: ArrowNote366 = null;

    /** 击中特效预制体（龙骨 djtx） */
    @property(cc.Prefab)
    hitEffectPrefab: cc.Prefab = null;

    // 5颗心节点
    @property(cc.Node)
    x1: cc.Node = null;
    @property(cc.Node)
    x2: cc.Node = null;
    @property(cc.Node)
    x3: cc.Node = null;
    @property(cc.Node)
    x4: cc.Node = null;
    @property(cc.Node)
    x5: cc.Node = null;

    // 失败界面节点
    @property(cc.Node)
    lost: cc.Node = null;

    // 判定结果父节点（包含 miss, good, perfect 三个子节点）
    @property(cc.Node)
    judgeResultNode: cc.Node = null;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();

        // 初始化骨骼动画
        if (this.ske) {
            this.sk = this.ske.getComponent(dragonBones.ArmatureDisplay);
        }

        // 初始化生命值
        this.hp = 5;
        this.isGameOver = false;
        this.updateHeartsUI();

        // 初始化骨骼动画
        if (this.ske) {
            this.sk = this.ske.getComponent(dragonBones.ArmatureDisplay);
        }

        // 确保 arrowCtrl 的 luoxia 被赋值
        if (this.arrowCtrl) {
            this.arrowCtrl.luoxia = this.luoxia;
        }

        // 谱子: 每个箭头相隔1s，不同行相隔5s，1234对应右下左上
        const sheet = [
            // 第1行: ← ← ← ← (左左左左) - interval 0.8
            { interval: 0.0, lanes: [3] },
            { interval: 0.8, lanes: [3] },
            { interval: 0.8, lanes: [3] },
            { interval: 0.8, lanes: [3] },
            // 空5秒
            { interval: 5.0, lanes: [] },
            // 第2行: → → → → (右右右右) - interval 0.8
            { interval: 0.0, lanes: [1] },
            { interval: 0.8, lanes: [1] },
            { interval: 0.8, lanes: [1] },
            { interval: 0.8, lanes: [1] },
            // 空5秒
            { interval: 5.0, lanes: [] },
            // 第3行: ← ↑ ← ↑ (左上左上) - interval 0.8
            { interval: 0.0, lanes: [3] },
            { interval: 0.8, lanes: [4] },
            { interval: 0.8, lanes: [3] },
            { interval: 0.8, lanes: [4] },
            // 空5秒
            { interval: 5.0, lanes: [] },
            // 第4行: ↓ → ↓ → (下右下右) - interval 0.7
            { interval: 0.0, lanes: [2] },
            { interval: 0.7, lanes: [1] },
            { interval: 0.7, lanes: [2] },
            { interval: 0.7, lanes: [1] },
            // 空5秒
            { interval: 5.0, lanes: [] },
            // 第5行: ↓ ↑ → ← ← ↓ ↑ → (下上右左左下上右) - interval 0.6
            { interval: 0.0, lanes: [2] },
            { interval: 0.6, lanes: [4] },
            { interval: 0.6, lanes: [1] },
            { interval: 0.6, lanes: [3] },
            { interval: 0.6, lanes: [3] },
            { interval: 0.6, lanes: [2] },
            { interval: 0.6, lanes: [4] },
            { interval: 0.6, lanes: [1] },
            // 间隔5秒
            { interval: 5.0, lanes: [] },
            // 第6波: →→←↑↑→↓↑→←↓↓↓↓ ←↓ ← ←↑→← ↓↑↓↓←↓↑→←↓↑→ - interval 0.5
            { interval: 0.0, lanes: [1] },
            { interval: 0.5, lanes: [1] },
            { interval: 0.5, lanes: [3] },
            { interval: 0.5, lanes: [4] },
            { interval: 0.5, lanes: [4] },
            { interval: 0.5, lanes: [1] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [4] },
            { interval: 0.5, lanes: [1] },
            { interval: 0.5, lanes: [3] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [3, 2] }, // ←↓ 红色同时
            { interval: 0.5, lanes: [3] },
            { interval: 0.5, lanes: [3, 4] }, // ←↑ 红色同时
            { interval: 0.5, lanes: [1] },
            { interval: 0.5, lanes: [3] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [4] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [3] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [4] },
            { interval: 0.5, lanes: [1] },
            { interval: 0.5, lanes: [3] },
            { interval: 0.5, lanes: [2] },
            { interval: 0.5, lanes: [4] },
            { interval: 0.5, lanes: [1] },
            // 间隔5秒
            { interval: 5.0, lanes: [] },
            // 第7波: ←↓↑→↑↓→↓←↓↑→→↑→→↑→←↓ - interval 0.4
            { interval: 0.0, lanes: [3] },
            { interval: 0.4, lanes: [2] },
            { interval: 0.4, lanes: [4] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [4] },
            { interval: 0.4, lanes: [2] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [2] },
            { interval: 0.4, lanes: [3] },
            { interval: 0.4, lanes: [2] },
            { interval: 0.4, lanes: [4] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [4] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [4] },
            { interval: 0.4, lanes: [1] },
            { interval: 0.4, lanes: [3] },
            { interval: 0.4, lanes: [2] },
            // 间隔5秒
            { interval: 5.0, lanes: [] },
            // 第8波: →←↑↓←→↓←→←↓↑↑→←←←↓←↑→←↓ (其中←↑红色同时) - interval 0.3
            { interval: 0.0, lanes: [1] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [3, 4] }, // ←↑ 红色同时
            { interval: 0.3, lanes: [2] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [1] },
            { interval: 0.3, lanes: [2] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [1] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [2] },
            { interval: 0.3, lanes: [4] },
            { interval: 0.3, lanes: [4] },
            { interval: 0.3, lanes: [1] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [2] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [4] },
            { interval: 0.3, lanes: [1] },
            { interval: 0.3, lanes: [3] },
            { interval: 0.3, lanes: [2] },
            // 间隔5秒
            { interval: 5.0, lanes: [] },
            // 第9波: ↓→→←→→←↓↑↓→→↑↑↓↑→← - interval 0.2
            { interval: 0.0, lanes: [2] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [3] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [3] },
            { interval: 0.2, lanes: [2] },
            { interval: 0.2, lanes: [4] },
            { interval: 0.2, lanes: [2] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [4] },
            { interval: 0.2, lanes: [4] },
            { interval: 0.2, lanes: [2] },
            { interval: 0.2, lanes: [4] },
            { interval: 0.2, lanes: [1] },
            { interval: 0.2, lanes: [3] },
        ];

        // 开始游戏
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv366`, true, 0.5);
            this.scheduleOnce(() => { this.sk.playAnimation('tw', -1); }, 3.5);
            if (this.arrowCtrl) {
                this.arrowCtrl.play(sheet);

                // 绑定判定回调
                this.arrowCtrl.onHit = (lane: number, type: number) => {
                    // 显示判定结果 (0=miss, 1=good, 2=perfect)
                    this.showJudgeResult(type);

                    // 击中时（good/perfect）播放龙骨击中特效
                    if (type >= 1) {
                        this.playHitEffect(lane);
                    }

                    // Miss时扣血
                    if (type === 0) {
                        this.onMiss();
                    }
                };

                // 绑定完成回调 - 所有波次过完调用 onwin
                this.arrowCtrl.onComplete = () => {
                    this.onwin();
                };
            }
        }, 0.5);

    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.isGameOver) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_1":
                if (this.arrowCtrl) this.arrowCtrl.judge(1);
                break;
            case "btn_2":
                if (this.arrowCtrl) this.arrowCtrl.judge(2);
                break;
            case "btn_3":
                if (this.arrowCtrl) this.arrowCtrl.judge(3);
                break;
            case "btn_4":
                if (this.arrowCtrl) this.arrowCtrl.judge(4);
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
        AudioManager.playEffect(AudioManager.common.BUTTON);
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    onlost() {
        this.canjiaohu = false;
        GameData.PauseGame = true;

        // 暂停箭头下落
        if (this.arrowCtrl) {
            this.arrowCtrl.pause();
        }

        // 显示失败界面（包含复活和重来按钮）
        if (this.lost) {
            this.lost.active = true;
        }
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }

    // Miss时扣血
    onMiss() {
        if (this.isGameOver) return;

        // 扣血
        this.hp--;
        // 立即开始心形渐变消失动画
        this.fadeOutHeart(this.hp);

        // 扣血后还有生命值，播放sw动画然后自动复活
        if (this.hp > 0) {
            // 失误时sk切换成sw
            if (this.sk) {
                this.sk.playAnimation('sw', 1);
            }
            this.scheduleOnce(() => {
                this.resurrect();
            }, 0.5);
            return;
        }

        // 血扣完了，播放sb动画并清屏
        this.isGameOver = true;
        this.canjiaohu = false;

        if (this.sk) {
            this.sk.playAnimation('sb', 0);
        }
        AudioManager.playEffect("失败哭泣");
        // sb动画时清屏
        if (this.arrowCtrl) {
            this.arrowCtrl.resurrect();
        }

        // 显示失败界面（2秒后）
        this.scheduleOnce(() => {
            this.onlost();
        }, 2);
    }

    // 更新心的显示（渐隐效果）
    updateHeartsUI() {
        // hp=5显示全部，hp=4隐藏x1，hp=3隐藏x2，hp=2隐藏x3，hp=1隐藏x4，hp=0隐藏x5
        if (this.x1) {
            this.x1.opacity = this.hp >= 5 ? 255 : 0;
        }
        if (this.x2) {
            this.x2.opacity = this.hp >= 4 ? 255 : 0;
        }
        if (this.x3) {
            this.x3.opacity = this.hp >= 3 ? 255 : 0;
        }
        if (this.x4) {
            this.x4.opacity = this.hp >= 2 ? 255 : 0;
        }
        if (this.x5) {
            this.x5.opacity = this.hp >= 1 ? 255 : 0;
        }
    }

    // 心形渐变消失动画（0.5秒）
    fadeOutHeart(remainingHp: number) {
        // 根据剩余生命值确定要消失的心
        let targetHeart: cc.Node = null;
        if (remainingHp === 4) {
            targetHeart = this.x1; // 第1颗心消失
        } else if (remainingHp === 3) {
            targetHeart = this.x2; // 第2颗心消失
        } else if (remainingHp === 2) {
            targetHeart = this.x3; // 第3颗心消失
        } else if (remainingHp === 1) {
            targetHeart = this.x4; // 第4颗心消失
        } else if (remainingHp === 0) {
            targetHeart = this.x5; // 第5颗心消失
        }

        if (targetHeart) {
            cc.tween(targetHeart)
                .to(0.2, { opacity: 0 })
                .start();
        }
    }

    // 复活到当前关卡（sw后恢复继续）
    resurrect() {
        // 如果游戏已经结束，不要切换动画
        if (this.isGameOver) return;

        console.log('复活，当前剩余生命:', this.hp);

        // 切换回 tw 动画继续游戏
        if (this.sk) {
            this.sk.playAnimation('tw', 0);
        }
    }

    // 点击复活按钮（看视频复活）
    onResurrectBtn() {
        VideoManager.getInstance().showVideo(() => {
            if (!this.isGameOver) return;

            this.isGameOver = false;
            this.canjiaohu = true;
            GameData.PauseGame = false;

            if (this.lost) {
                this.lost.active = false;
            }

            // 复活时生命值回满
            this.hp = 5;
            this.updateHeartsUI();

            // 继续箭头下落
            if (this.arrowCtrl) {
                this.arrowCtrl.resume();
            }

            // 复活到当前关卡
            this.resurrect();
        });
    }


    // 显示判定结果 (0=miss, 1=good, 2=perfect)
    showJudgeResult(type: number) {
        if (!this.judgeResultNode) return;

        // 取消之前的定时器
        if (this._judgeCallback !== null) {
            this.unschedule(this._judgeCallback);
            this._judgeCallback = null;
        }

        // 先隐藏所有子节点
        this.judgeResultNode.children.forEach(child => {
            child.active = false;
        });

        // 根据类型显示对应的子节点，并播放音效
        // 假设子节点名称为: "miss", "good", "perfect"
        let targetName: string = "";
        if (type === 0) {
            targetName = "miss";
            // Miss时播放"失误"音效
            AudioManager.playEffect("失误");
        } else if (type === 1) {
            targetName = "good";
            // Good时播放"完美"音效
            AudioManager.playEffect("完美");
        } else if (type === 2) {
            targetName = "perfect";
            // Perfect时播放"完美"音效
            AudioManager.playEffect("完美");
        }

        if (targetName) {
            const targetNode = this.judgeResultNode.getChildByName(targetName);
            if (targetNode) {
                targetNode.active = true;
            }
        }

        // 0.5秒后隐藏
        const hideCallback = () => {
            if (this.judgeResultNode) {
                this.judgeResultNode.children.forEach(child => {
                    child.active = false;
                });
            }
        };
        this._judgeCallback = hideCallback;
        this.scheduleOnce(hideCallback, 0.5);
    }

    /** 在指定 lane 的判定线位置播放击中特效（龙骨 djtx） */
    playHitEffect(lane: number) {
        if (!this.hitEffectPrefab || !this.luoxia || !this.arrowCtrl) return;

        const posNode = this.luoxia.getChildByName(lane.toString());
        if (!posNode) return;

        const effectNode = cc.instantiate(this.hitEffectPrefab);
        effectNode.setPosition(0, this.arrowCtrl.perfectY);
        effectNode.parent = posNode;

        const arm = effectNode.getComponent(dragonBones.ArmatureDisplay);
        if (arm) {
            arm.playAnimation("djtx", 1);
            this.addOneTimeListener(arm, () => {
                effectNode.destroy();
            });
        } else {
            effectNode.destroy();
        }
    }
}
