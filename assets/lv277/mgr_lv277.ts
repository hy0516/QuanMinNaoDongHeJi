import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv277 extends BaseGame {

    isshowVideo = false;
    canjiaohu = false;
    lv: number = 0;
    flag: boolean = false;
    flag1: boolean = false;

    speak : string[] = ["变异目标出现，准备射击行动", 
                        "任务完成，即将返航！",
                        "目标过于狡猾，弹药耗尽，需立即返程补给"
                        ];

    configs: number[][] = [[0], [3], [3], [1,3,4], [1], [3,4], [1], [2,3], [4]];
    roundOrder: number[] = null;
    roundIndex: number = 0;

    @property(cc.Node)
    btn_zs: cc.Node = null;

    @property(cc.Node)
    p: cc.Node = null;

    @property(cc.Node)
    Shoot: cc.Node = null;

    @property(cc.Node)
    zd: cc.Node = null;
    
    @property(cc.Node)
    qy: cc.Node = null;

    shoot1_ske; shoot2_ske; shoot3_ske; shoot4_ske; shoot5_ske; shoot6_ske; shoot7_ske; shoot8_ske;
    shoot1_sk; shoot2_sk; shoot3_sk; shoot4_sk; shoot5_sk; shoot6_sk; shoot7_sk; shoot8_sk;
    
    ske;
    sk;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        // AudioManager.playMusic(`bgmlv277`);
        this.initGame();
        this.lvgame();
    }

    initGame() {
        const temp = [1,2,3,4,5,6,7,8];
        this.roundOrder = temp.sort(() => Math.random() - 0.5);
        for (let i = 1; i <= 8; i++) {
            this[`shoot${i}_ske`] = this.Shoot.getChildByName(`${i}`);
            this[`shoot${i}_sk`] = this.Shoot.getChildByName(`${i}`).getComponent(dragonBones.ArmatureDisplay);
        }
        this.ske = this.node.getChildByName("ske");
        this.sk = this.ske.getComponent(dragonBones.ArmatureDisplay);
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    changeSke(nb: number) {
        for (let i = 1; i <= 4; i++) {
            if (i === nb) {
                this.btn_zs.getChildByName(`btn_${i}`).getChildByName("h").active = true;
                this.btn_zs.getChildByName(`btn_${i}`).getChildByName("v").active = false;
            } else {
                this.btn_zs.getChildByName(`btn_${i}`).getChildByName("h").active = false;
            }
        }
        this.sk.playAnimation(`km_${this.roundIndex}`, 0);
    }
    
    shoot(nb: number) {
        this[`shoot${nb}_ske`].active = true;
        this[`shoot${nb}_sk`].playAnimation("xian", 1);
        this.Shoot.getChildByName(`mz${nb}`).active = true;
        this.scheduleOnce(() => {
            this[`shoot${nb}_ske`].active = false;
            this.Shoot.getChildByName(`mz${nb}`).active = false;
            this.zd.getChildByName(`${this.lv}`).getChildByName("change").active = true;
            this.qy.getChildByName(`${nb}`).active = true;
        }, 3);
    }

    lvgame() {
        this.lv++;
        this.btn_zs.active = true;
        this.roundIndex = 1;
        this.changeSke(1);
        this.flag = false;
        this.showqp(this.p, this.speak[0], this.speak[0], () => {
            this.shoot(this.roundOrder[this.lv - 1]);
            AudioManager.playEffect(`射击`);
            this.scheduleOnce(() => {
                this.btn_zs.active = false;
                const currentRow = this.configs[this.roundOrder[this.lv - 1]];
                currentRow.forEach((item) => {
                    if (item == this.roundIndex) {
                        this.flag = true;
                    }
                })
                if (this.flag) {
                    AudioManager.playEffect(`躲避庆祝`);
                    if (this.lv < 8 ) {
                        this.node.getChildByName("bg").getChildByName("cg").active = true;
                        cc.tween(this.node.getChildByName("bg").getChildByName("cg"))
                            .to(0.5, { scale: 1.2 })
                            .start();
                        this.scheduleOnce(() => {
                            this.node.getChildByName("bg").getChildByName("cg").active = false;
                            this.lvgame();
                        }, 1);
                    } else {
                        this.showqp(this.p, this.speak[2], this.speak[2], () => {
                            this.onwin();
                        });
                    }
                } else {
                    AudioManager.playEffect(`吐血`);
                    this.sk.playAnimation(`km_si`, 1);
                    this.ske.getChildByName("xue").active = true;
                    this.scheduleOnce(() => {
                        this.ske.getChildByName("xue").active = false;
                    }, 0.33);
                    this.scheduleOnce(() => {
                        this.showqp(this.p, this.speak[1], this.speak[1], () => {
                                this.onlost();
                        });
                    }, 2);
                }
            }, 3);
        });
    }

    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
       this.canjiaohu=false;
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("qp")
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
               // if (this.istiaoguo) return
               this.canjiaohu=true;
                handler && handler();
            })
            .start()
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => {
                    this.showTips();
                })
                break;
            case "btn_1":
                AudioManager.playEffect(`切换姿势`);
                this.roundIndex = 1;
                this.changeSke(1);
                break;
            case "btn_2":
                AudioManager.playEffect(`切换姿势`);
                this.roundIndex = 2;
                this.changeSke(2);
                break;
            case "btn_3":
                AudioManager.playEffect(`切换姿势`);
                this.roundIndex = 3;
                this.changeSke(3);
                break;
            case "btn_4":
                AudioManager.playEffect(`切换姿势`);
                this.roundIndex = 4;
                this.changeSke(4);
                break;
        }
    }

    showTips() {
        for (let i = 1; i <= 4; i++) {
            this.btn_zs.getChildByName(`btn_${i}`).getChildByName("v").active = false;
        }

        const currentRow = this.configs[this.roundOrder[this.lv - 1]];
        currentRow.forEach((item) => {
            this.btn_zs.getChildByName(`btn_${item}`).getChildByName("v").active = true;
        })
    }

    fanhui() {
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
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
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/zc/zc_winend");
            this.node.destroy();
        }, 1);
    }

    onlost() {
        this.canjiaohu = false;
        GameData.PauseGame = false;
        this.scheduleOnce(() => {
            this.endlost("prefabs/zc/zc_lostend");
            this.node.destroy();
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
    
}