import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class zmn_lv323 extends BaseGame {

    @property(cc.Node) boomNd: cc.Node = null!;
    @property(cc.Node) winNd: cc.Node = null!;
    @property(cc.Node) lostNd: cc.Node = null!;
    @property(cc.Node) colliderNd: cc.Node = null!;
    @property(cc.Node) lost: cc.Node = null!;
    @property(cc.Node) tips1: cc.Node = null!;
    @property(cc.Node) tips2: cc.Node = null!;
    @property(cc.Node) touchTips: cc.Node = null!;
    @property(cc.Label) label: cc.Label = null!;
    private lv = 1;
    private lvnode: cc.Node = null!;
    private collider;
    private lvpass:boolean [] = [false,false,false,false,false,false,false,false,false,false,false];
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv323`);
        }, 0.2);
        this.lvnode = this.node.getChildByName(`lv${this.lv}`);
        this.collider = this.colliderNd.getComponent(`peck_lv323`);
        this.tip();
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
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
        console.log(`返回大厅`);
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    tip() {
        if(this.lv === 1) {
            this.lvnode.getChildByName(`bird`).active = false;
            this.tips1.active = true;
            cc.tween(this.tips1.getChildByName(`tips1`))
                .to(1, { y: -717.164 })
                .call(() => {
                    this.scheduleOnce(() => {
                        AudioManager.playEffect(`鸭子叫`);
                    this.tips1.getChildByName(`tips1`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji2`, 1);
                    this.tips1.getChildByName(`tips1`).getChildByName(`tip`).active = true;
                }, 1);
                })
                .delay(3)
                .to(1, { y: -1200 })
                .call(() => {
                    this.lvnode.getChildByName(`bird`).active = true;
                     this.tips1.active = false;
                })
                .start();

        } else if(this.lv === 3) {
            this.lvnode.getChildByName(`bird`).active = false;
            this.tips2.active = true;
            cc.tween(this.tips2.getChildByName(`tips2`))
                .to(1, { y: -717.164 })
                .call(() => {
                    this.scheduleOnce(() => {
                        AudioManager.playEffect(`鸭子叫`);
                        this.tips2.getChildByName(`tips2`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji2`, 1);
                        this.tips2.getChildByName(`tips2`).getChildByName(`tip`).active = true;
                    }, 1);
                })
                .delay(3)
                .to(1, { y: -1200 })
                .call(() => {
                    this.lvnode.getChildByName(`bird`).active = true;
                     this.tips2.active = false;
                })
                .start();
        }
    }

    tip1Btn() {
        this.lvnode.getChildByName(`bird`).active = true;
        this.tips1.active = false;
        this.touchTips.active = true
    }

    tiptBtn() {
        this.lvnode.getChildByName(`bird`).active = true;
        this.touchTips.active = false;
    }

    tip2Btn() {
        this.lvnode.getChildByName(`bird`).active = true;
        this.tips2.active = false;
    }

    passlv() {
        if(this.lvpass[this.lv]) return;
        this.lvpass[this.lv] = true;
        this.boomNd.active = true;
        AudioManager.playEffect(`爆炸`);
        this.lvnode?.getChildByName('bg') && (this.lvnode.getChildByName('bg').active = false);
        this.lvnode?.getChildByName('grain') && (this.lvnode.getChildByName('grain').active = false);
        this.lvnode?.getChildByName('bg2') && (this.lvnode.getChildByName('bg2').active = false);
        this.lvnode?.getChildByName('grain2') && (this.lvnode.getChildByName('grain2').active = false);
        this.scheduleOnce(() => {
            AudioManager.playEffect(`真棒`);
            this.node.getChildByName(`UI`).getChildByName(`icebg`).active = false;
            this.boomNd.active = false;
            this.node.getChildByName(`lv${this.lv}`).active = false;
            this.winNd.active = true;
            this.scheduleOnce(() => {
                this.winNd.active = false;
                this.lv++;
                if(this.lv >5) {
                    this.onwin();
                } else {
                    this.lvnode = this.node.getChildByName(`lv${this.lv}`);
                    this.lvnode.active = true;
                    this.label.string = `第${this.lv}关`;
                    this.tip();
                }
            }, 2.1);
        }, 0.8);
        
    }

    checkpass(flag) {
        if(flag && !this.collider.checkdead()) {
            this.passlv();
        }
    }

    notpass() {
        this.lostNd.active = true;
        this.scheduleOnce(() => {
            this.lostNd.active = false;
            this.onlost();
        }, 2.1);
    }

    fuhuo() {
        VideoManager.getInstance().showVideo(() => { 
            // this.lvnode.getChildByName(`grain`).active = true;
            // for(let i = 0; i < this.lvnode.getChildByName(`grain`).children.length; i++) {
            //     const name = this.lvnode.getChildByName(`grain`).children[i].name;
            //     if(name === `1` || name === `2` || name === `3` || name === `4`) {
            //         this.lvnode.getChildByName(`grain`).children[i].active = true;
            //     }
            // }
            this.lost.active = false;
            this.lvnode.getChildByName(`bird`).getComponent(`bird_lv323`).fuhuo();
            this.lvnode.getChildByName(`bird`).getChildByName(`collider`).getComponent(`peck_lv323`).fuhuo();
        })
    }

    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.lost.active = true;
        },)
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }

    restart1() {
        GameData.PauseGame = false;
        // GameData.onDele();
        // AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
        //     var UI = cc.instantiate(name);
        //     UI.parent = cc.find("Canvas");
        //     this.node.destroy();
        // })
        this.lvnode.getChildByName(`grain`).active = true;
        for(let i = 0; i < this.lvnode.getChildByName(`grain`).children.length; i++) {
            const name = this.lvnode.getChildByName(`grain`).children[i].name;
            if(name === `1` || name === `2` || name === `3` || name === `4` || name === `5`) {
                this.lvnode.getChildByName(`grain`).children[i].opacity = 255;
                if(this.lvnode.getChildByName(`grain`).children[i].getChildByName(`sd`)) {
                    this.lvnode.getChildByName(`grain`).children[i].getChildByName(`sd`).active = false;
                }
                this.lvnode.getChildByName(`grain`).children[i].getComponent(cc.BoxCollider).tag = Number(name);
            }
        }
        if(this.lvnode.getChildByName(`grain2`)) {
            this.lvnode.getChildByName(`bg`).active = true;
            for(let i = 0; i < this.lvnode.getChildByName(`grain2`).children.length; i++) {
                const name = this.lvnode.getChildByName(`grain2`).children[i].name;
                if(name === `1` || name === `2` || name === `3` || name === `4` || name === `5`) {
                    this.lvnode.getChildByName(`grain2`).children[i].opacity = 255;
                    if(this.lvnode.getChildByName(`grain2`).children[i].getChildByName(`sd`)) {
                        this.lvnode.getChildByName(`grain2`).children[i].getChildByName(`sd`).active = false;
                    }
                    this.lvnode.getChildByName(`grain2`).children[i].getComponent(cc.BoxCollider).tag = Number(name);
                }
            }
            if (this.lvnode.getChildByName(`bird`).getComponent(`bird_lv323`).True ) {
                this.lvnode.getChildByName(`bird`).getComponent(`bird_lv323`).True = false;
                this.lvnode.getChildByName(`bird`).getComponent(`bird_lv323`).colliderNd = this.lvnode.getChildByName(`bird`).getChildByName(`collider`);
                this.lvnode.getChildByName(`bird`).getComponent(`bird_lv323`).peckComp = this.lvnode.getChildByName(`bird`).getChildByName(`collider`).getComponent(`peck_lv323`);
                this.lvnode.getChildByName(`bird`).getChildByName(`collider2`).getComponent(`peck_lv323`).fuhuo();
                this.lvnode.getChildByName(`bird`).getChildByName(`ske`).y -=100;
            }
        }
        this.lost.active = false;
        this.lvnode.getChildByName(`bird`).getComponent(`bird_lv323`).fuhuo();
        this.lvnode.getChildByName(`bird`).getChildByName(`collider`).getComponent(`peck_lv323`).fuhuo();
    }

    restart2() {
        GameData.PauseGame = false;
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }
}
