import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class zmn_lv316 extends BaseGame {

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
            AudioManager.playMusic(`bgmlv316`);
        }, 0.5);
        this.lvnode = this.node.getChildByName(`lv${this.lv}`);
        this.collider = this.colliderNd.getComponent(`peck_lv316`);
        this.tip();
    }

    onDestroy() {
        
        if (this.node && this.node.isValid) {
            const bgNode = this.node.getChildByName('bg');
        }
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
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    tip() {
        if(this.lv === 1) {
            this.tips1.active = true;
        } else if(this.lv === 6) {
            this.tips2.active = true;
        }
    }

    tip1Btn() {
        this.tips1.active = false;
        this.touchTips.active = true
    }

    tiptBtn() {
        this.touchTips.active = false;
    }

    tip2Btn() {
        this.tips2.active = false;
    }

    passlv() {
        if(this.lvpass[this.lv]) return;
        this.lvpass[this.lv] = true;
        this.boomNd.active = true;
        AudioManager.playEffect(`礼花`);
        this.lvnode?.getChildByName('bg') && (this.lvnode.getChildByName('bg').active = false);
        this.lvnode?.getChildByName('grain') && (this.lvnode.getChildByName('grain').active = false);
        this.lvnode?.getChildByName('bg2') && (this.lvnode.getChildByName('bg2').active = false);
        this.lvnode?.getChildByName('grain2') && (this.lvnode.getChildByName('grain2').active = false);
        this.scheduleOnce(() => {
            this.node.getChildByName(`UI`).getChildByName(`icebg`).active = false;
            this.boomNd.active = false;
            this.node.getChildByName(`lv${this.lv}`).active = false;
            this.winNd.active = true;
            this.scheduleOnce(() => {
                this.winNd.active = false;
                this.lv++;
                if(this.lv >20) {
                    this.onwin();
                } else {
                    this.lvnode = this.node.getChildByName(`lv${this.lv}`);
                    this.lvnode.active = true;
                    this.label.string = `第${this.lv}关`;
                    this.tip();
                }
            }, 2.1);
        }, 1.65);
        
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
            this.lvnode.getChildByName(`bird`).getComponent(`bird_lv316`).fuhuo();
            this.lvnode.getChildByName(`bird`).getChildByName(`collider`).getComponent(`peck_lv316`).fuhuo();
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
            GameData.PauseGame = false;
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
}
