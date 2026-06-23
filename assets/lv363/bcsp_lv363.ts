import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv217 extends BaseGame {

    @property(cc.Node)
    hd1: cc.Node = null;
    @property(cc.Node)
    hd2: cc.Node = null;
    @property(cc.Node)
    hd3: cc.Node = null;

    @property(cc.Node)
    bt: cc.Node = null; // 12个按钮的父节点

    @property(cc.Node)
    lost: cc.Node = null; // 失败提示节点

    @property(cc.Node)
    ske: cc.Node = null;
    sk

    canjiaohu = false;
    isGameLost = false; // 游戏是否已失败

    // 是否正在播放动画
    isAnimating = false;
    // 是否正在播放chi动画
    isPlayingChi = false;
    // 总点击次数（最多3次）
    totalClickCount = 0;
    // 记录已选择的三个按钮名字
    selectedButtons: string[] = [];
    // 第二阶段是否开始
    isSecondPhase = false;
    // 第二阶段已按下的按钮
    secondPhaseClicked: string[] = [];
    // 第二阶段点到的错误按钮（bc）
    secondPhaseWrongClicked: cc.Node[] = [];

    // hd初始位置
    hdInitX = -1200;

    // hd移动位置配置（点击1-4对应的位置：-600, -400, -250, -500）
    hdPositions = [-600, -400, -250, -50];

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`bgmlv363`);

        // 初始化hd位置
        this.initHdPositions();
        this.sk = this.ske.getComponent(dragonBones.ArmatureDisplay);
        // 播放语音，等语音播放完毕后才能点击选择
        AudioManager.playEffect(`请选择3个你要埋的白菜`);
        // 语音时长约2.5秒，延时后允许交互
        this.scheduleOnce(() => {
            this.canjiaohu = true;
        }, 2);
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    // 初始化hd位置
    initHdPositions() {
        if (this.hd1) this.hd1.x = this.hdInitX;
        if (this.hd2) this.hd2.x = this.hdInitX;
        if (this.hd3) this.hd3.x = this.hdInitX;
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        if (this.isGameLost) return; // 游戏失败时不再响应点击
        if (!this.canjiaohu) return; // 未允许交互时不能点击

        let btnName = even.currentTarget.name;
        let btnNum = parseInt(btnName);

        switch (true) {
            case /^([1-9]|1[0-2])$/.test(btnName):
                // 第二阶段逻辑
                if (this.isSecondPhase) {
                    this.handleSecondPhaseClick(btnName, even.currentTarget);
                    return;
                }

                // 第一阶段：动画播放中不能点击
                if (this.isAnimating) return;
                // 总点击次数不能超过3次
                if (this.totalClickCount >= 3) return;

                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.totalClickCount++;
                // 记录选择的按钮
                this.selectedButtons.push(btnName);

                let bcNode = even.currentTarget.getChildByName("bc");
                if (bcNode) {
                    bcNode.active = true;
                    // 播放"白菜"音效
                    AudioManager.playEffect(`白菜`);
                }

                // 根据按钮编号控制对应的hd
                if (btnNum >= 1 && btnNum <= 4) {
                    this.handleHdClick(1, btnNum);
                } else if (btnNum >= 5 && btnNum <= 8) {
                    this.handleHdClick(2, btnNum - 4);
                } else if (btnNum >= 9 && btnNum <= 12) {
                    this.handleHdClick(3, btnNum - 8);
                }

                // 点击3次后进入第二阶段
                if (this.totalClickCount >= 3) {
                    this.scheduleOnce(() => {
                        this.startSecondPhase();
                    }, 1.5); // 等待hd动画完成
                }
                break;
            case btnName === "btn_close":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.openpausePanel();
                break;
        }
    }

    // 处理hd点击
    handleHdClick(hdIndex: number, positionIndex: number) {
        let hdNode: cc.Node = null;

        switch (hdIndex) {
            case 1:
                hdNode = this.hd1;
                break;
            case 2:
                hdNode = this.hd2;
                break;
            case 3:
                hdNode = this.hd3;
                break;
        }

        if (!hdNode) return;

        let targetX = this.hdPositions[positionIndex - 1];
        this.isAnimating = true;

        cc.tween(hdNode)
            .to(0.3, { x: targetX })
            .delay(0.5)
            .to(0.3, { x: this.hdInitX })
            .call(() => {
                this.isAnimating = false;
            })
            .start();
    }

    // 开始第二阶段
    startSecondPhase() {
        this.isSecondPhase = true;
        cc.log("进入第二阶段，开始交换按钮位置");

        // 隐藏已选按钮的bc标记
        this.selectedButtons.forEach(btnName => {
            const btnNode = this.bt.children.find(n => n.name === btnName);
            if (btnNode) {
                const bcNode = btnNode.getChildByName("bc");
                if (bcNode) {
                    bcNode.active = false;
                }
            }
        });

        // 随机交换6次
        this.shuffleButtons(6, () => {
            cc.log("交换完成，可以开始点击");
            // 播放开始选白菜的音效
            AudioManager.playEffect(`点击薯片开始排除白菜`);
            this.canjiaohu = true;
        });
    }

    // 随机交换按钮位置
    shuffleButtons(times: number, onComplete: () => void) {
        if (!this.bt) {
            onComplete();
            return;
        }

        const children = this.bt.children.filter(n => /^([1-9]|1[0-2])$/.test(n.name));
        if (children.length < 2) {
            onComplete();
            return;
        }

        let currentIndex = 0;
        
        // 6次交换开始时切换到mengyanjin
        if (times === 6 && this.sk) {
            this.sk.playAnimation("mengyanjin", 0);
        }
        
        const doSwap = () => {
            if (currentIndex >= times) {
                // 交换结束后切换到daiji
                if (this.sk) {
                    this.sk.playAnimation("daiji", 0);
                }
                onComplete();
                return;
            }

            // 播放"切换"音效
            AudioManager.playEffect(`切换`);

            // 随机选两个不同的按钮
            let idx1 = Math.floor(Math.random() * children.length);
            let idx2 = Math.floor(Math.random() * children.length);
            while (idx1 === idx2) {
                idx2 = Math.floor(Math.random() * children.length);
            }

            const node1 = children[idx1];
            const node2 = children[idx2];

            // 交换位置
            const pos1 = node1.position;
            const pos2 = node2.position;

            cc.tween(node1)
                .to(0.4, { position: pos2 })
                .start();
            
            cc.tween(node2)
                .to(0.4, { position: pos1 })
                .call(() => {
                    currentIndex++;
                    // 更新数组中的引用顺序（保持视觉顺序和数组顺序一致）
                    const temp = children[idx1];
                    children[idx1] = children[idx2];
                    children[idx2] = temp;
                    
                    this.scheduleOnce(() => doSwap(), 0.3);
                })
                .start();
        };

        doSwap();
    }

    // 处理第二阶段点击
    handleSecondPhaseClick(btnName: string, btnNode: cc.Node) {
        // 已经按过的不能重复按
        if (this.secondPhaseClicked.includes(btnName)) return;
        // 游戏已失败或正在处理失败流程时不能操作
        if (this.isGameLost) return;
        // chi动画播放中不能点击
        if (this.isPlayingChi) return;

        // 检查是否点击了第一阶段选择的按钮（错误按钮）
        if (this.selectedButtons.includes(btnName)) {
            // 点击了错误按钮，游戏失败
            cc.log("点击了错误按钮，游戏失败");
            // 播放"选错"音效
            AudioManager.playEffect(`选错`);
            // 先显示bc并保持按钮可见，等待复活后再消失
            btnNode.active = true;
            let bcNode = btnNode.getChildByName("bc");
            if (bcNode) {
                bcNode.active = true;
            }
            // 记录被点到的错误按钮（避免重复记录）
            if (!this.secondPhaseWrongClicked.includes(btnNode)) {
                this.secondPhaseWrongClicked.push(btnNode);
            }
            // 设置标志位防止再次操作
            this.isGameLost = true;
            this.canjiaohu = false;
            // 播放beigongji动画
            if (this.sk) {
                this.scheduleOnce(() => {
                    this.sk.playAnimation("beigongji", 1);
                }, 1.5);
            }
            // 等待动画播放完毕后显示lost界面（beigongji动画约1.5-2秒）
            this.scheduleOnce(() => {
                if (this.lost) {
                    this.lost.active = true;
                }
            }, 3);
            return;
        }

        // 正确点击，播放chi动画和"选对"音效
        AudioManager.playEffect(AudioManager.common.BUTTON);
        AudioManager.playEffect(`选对`);
        if (this.sk) {
            this.sk.playAnimation("chi", 0);
            AudioManager.playEffect(`吃薯片`);
        }
        // 标记正在播放chi动画
        this.isPlayingChi = true;
        this.secondPhaseClicked.push(btnName);
        
        // 按钮直接消失
        btnNode.active = false;

        // 检查是否完成了所有正确按钮（除了那3个错误的，其他9个都按了）
        if (this.secondPhaseClicked.length >= 9) {
            cc.log("完成所有正确按钮，游戏胜利");
            // 等待chi动画播放完成后再切换到mengyanjin
            this.scheduleOnce(() => {
                this.isPlayingChi = false;
                this.onwin();
            }, 1.9);
        } else {
            // 非最后一个，2秒后切回daiji
            this.scheduleOnce(() => {
                this.isPlayingChi = false;
                if (this.sk) {
                    this.sk.playAnimation("daiji", 0);
                }
            }, 1.9);
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
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.canjiaohu = false;
        // 播放胜利笑声
        AudioManager.playEffect(`胜利笑声`);
        // 切换到mengyanjin动画，2秒后再执行胜利逻辑
        if (this.sk) {
            this.sk.playAnimation("shengli", 0);
        }
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 2);
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

    // 复活函数
    revive() {
        VideoManager.getInstance().showVideo(()=>{
            // 隐藏失败界面
            if (this.lost) {
                this.lost.active = false;
            }
            // 重置游戏失败状态
            this.isGameLost = false;
            // 恢复交互
            this.canjiaohu = true;
            // 复活后切回daiji
            if (this.sk) {
                this.sk.playAnimation("daiji", 0);
            }
            // 让被点到的错误按钮在复活后消失
            this.secondPhaseWrongClicked.forEach(btnNode => {
                if (btnNode) {
                    const bcNode = btnNode.getChildByName("bc");
                    if (bcNode) {
                        bcNode.active = false;
                    }
                    btnNode.active = false;
                }
            });
            // 清空错误按钮记录
            this.secondPhaseWrongClicked = [];
            cc.log("复活成功，继续游戏");
        });
    }
}
