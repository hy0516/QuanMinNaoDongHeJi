
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import Platforms_QuickGame from "../script/SDK/Platforms/QuickGame/Platforms_QuickGame";
import item_lv163 from "./item_lv163";

const { ccclass, property } = cc._decorator;

@ccclass
export default class nwddy_lv163 extends BaseGame {
    @property(cc.Node)
    lvtext: cc.Node = null;
    @property(cc.Node)
    gametext: cc.Node = null;
    @property(cc.Prefab)
    item: cc.Prefab = null;
    @property(cc.Node)
    renshou: cc.Node = null;
    @property(cc.Node)
    robotshou: cc.Node = null;
    @property(cc.Node)
    g: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    gou2: cc.Node = null;

    curlvnode: cc.Node = null;
    curlv = 1;
    nodeNumList = [12, 16, 24, 24, 24];
    robotseleitemList: cc.Node[] = [];
    seleduyao = true;
    startgame = false;
    robotSeleDuyao: cc.Node = null;

    onLoad() {
        AudioManager.stopMusic();
        this.scheduleOnce(() => { AudioManager.playMusic("关卡背景_lv163"); }, 0.5)
        GameData.PauseGame = true;
        cc.tween(this.gametext)
            .repeatForever(
                cc.tween()
                    .to(0.3, { scale: 1.1 })
                    .to(0.3, { scale: 1 })
            )
            .start()
        this.initlv();
    }
    showGameText(lab: string, iswanjia: boolean) {
        this.gametext.getComponent(cc.Label).string = lab;
        if (iswanjia) this.gametext.color = cc.color(54, 149, 6);
        else this.gametext.color = cc.color(237, 45, 45);
    }
    initlv() {
        this.lvtext.getComponent(cc.Label).string = "第" + this.curlv.toString() + "局";
        this.startgame = false;
        this.seleduyao = true;
        this.robotseleitemList = [];
        this.robotSeleDuyao = null;
        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        lvnode.destroyAllChildren();
        lvnode.active = true;
        for (let i = 0; i < this.nodeNumList[this.curlv - 1]; i++) {
            var item = cc.instantiate(this.item);
            item.parent = lvnode;
            item.getComponent(item_lv163).initmain(this, i);
            this.robotseleitemList.push(item);
        }
        GameData.PauseGame = false;
        this.showGameText("玩家选择毒药", true);
    }

    xitongseleDuyao() {
        //选毒药
        this.showGameText("等待对方选择毒药", false);
        this.scheduleOnce(() => {
            this.startgame = true;
            this.showGameText("我方操作", true);
        }, 2)

        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        var num = this.getRandomNumber(this.robotseleitemList.length - 1);
        if (lvnode.children[num].getComponent(item_lv163).isduyao == true) {
            this.xitongseleDuyao();
        } else {
            lvnode.children[num].getComponent(item_lv163).isduyao = true;
            this.robotSeleDuyao = lvnode.children[num];
            this.robotseleitemList.splice(this.robotseleitemList.indexOf(lvnode.children[num]), 1);
        }


    }

    seleItem(item: cc.Node) {
        this.startgame = false;
        var startpoi = this.renshou.position;
        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        var wpo = lvnode.convertToWorldSpaceAR(item.position);
        var po = this.node.getChildByName("bg").convertToNodeSpaceAR(wpo);
        this.robotseleitemList.splice(this.robotseleitemList.indexOf(item), 1);
        AudioManager.playEffect("dl_qg1");
        cc.tween(this.renshou)
            .to(0.5, { x: po.x, y: po.y }, cc.easeBackIn())
            .call(() => {

                item.getChildByName(item.getComponent(item_lv163).curindex.toString()).active = false;
            })
            .to(0.5, { x: startpoi.x, y: startpoi.y }, cc.easeBackIn())
            .call(() => {
                if (item.getComponent(item_lv163).isduyao == true) this.shu();
                else {
                    this.showGameText("对方操作", false);
                    this.scheduleOnce(() => {
                        this.robotSeleItem();
                    }, 0.5)
                }
            })
            .start()
    }

    robotSeleItem() {
        var num
        if (this.robotseleitemList.length == 1) num = 0;
        else num = this.getRandomNumber(this.robotseleitemList.length - 1);
        var robotseleitem = this.robotseleitemList[num];
        if (!robotseleitem) return
        var startpoi = this.robotshou.position;
        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        var wpo = lvnode.convertToWorldSpaceAR(robotseleitem.position);
        var po = this.node.getChildByName("bg").convertToNodeSpaceAR(wpo);
        AudioManager.playEffect("dl_qg1");
        cc.tween(this.robotshou)
            .to(0.5, { x: po.x, y: po.y }, cc.easeBackIn())
            .call(() => {

                robotseleitem.getComponent(item_lv163).onSeleHandler();
                this.robotseleitemList.splice(num, 1);
            })
            .to(0.5, { x: startpoi.x, y: startpoi.y }, cc.easeBackIn())
            .call(() => {
                if (robotseleitem.getComponent(item_lv163).isduyao == true) this.ying();
                else {
                    this.showGameText("我方操作", true);
                    // this.scheduleOnce(() => {
                    this.startgame = true;
                    // }, 1)
                }
            })
            .start()
    }

    private getRandomNumber(count: number): number {
        return Math.floor(Math.random() * count) + 1;
    }

    win() {
        var handler = () => {
            this.scheduleOnce(() => {
                this.unschedule(this.Timeing);
                GameData.PauseGame = true;
                this.node.cleanup();
                AudioManager.stopEffect()
                this.endwin("prefabs/zc/zc_winend");
                this.node.destroy();
            }, 0.5);
        }
        this.g.active = true;
        this.g.scale = 0;

        cc.Tween.stopAllByTarget(this.g);
        cc.tween(this.g)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .call(() => {
                handler && handler();
            })
            .start()
    }

    shu() {
        this.gou2.active = true;
        var group = this.gou2.getChildByName("group");
        group.scale = 0;
        Platforms_QuickGame.getInstance().showInsertAd();
        cc.Tween.stopAllByTarget(group);
        cc.tween(group)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .start()
        AudioManager.playEffect("com_cuo");
    }

    ying() {
        if (this.curlv >= 5) {
            this.win();
            return
        }
        this.gou.active = true;
        var group = this.gou.getChildByName("group");
        group.scale = 0;
        Platforms_QuickGame.getInstance().showInsertAd();
        cc.Tween.stopAllByTarget(group);
        cc.tween(group)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .start()
        AudioManager.playEffect("finishjq");
    }


    hidetips() {
        this.node.getChildByName("tipsNode").active = false;
    }
    showTip() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        if (!this.robotSeleDuyao) {
            common.ShowTipsView("请等待对方选择毒药");
            return
        }
        VideoManager.getInstance().showVideo(() => {
            // this.node.getChildByName("tipsNode").active = true;
            // VideoManager.getInstance().showInsert();
            common.ShowTipsView("显示对方选择毒药");
            this.robotSeleDuyao.getChildByName(this.robotSeleDuyao.getComponent(item_lv163).curindex.toString()).children[0].active = true;
        })
    }

    isshowVideo = false;
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

    addTime(even: TouchEvent, time?: number) {
        // if (GameData.startTime + time <= 0) return

        // AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // // GameData.PauseGame = true;
        // var addtime
        // time ? addtime = time : addtime = 60;
        // GameData.startTime += addtime;
        // this.Timeing();
        // var fuhao = "";
        // if (addtime > 0) fuhao = "+";
        // this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
        // cc.Tween.stopAllByTarget(this.addtimetips);
        // cc.tween(this.addtimetips)
        //     .to(0.2, { opacity: 255 })
        //     .delay(0.5)
        //     .to(0.1, { opacity: 0 })
        //     .call(() => {
        //         // GameData.PauseGame = false;
        //     })
        //     .start();

    }

    btn_addTime() {
        // if (GameData.startTime + 60 <= 0) return
        VideoManager.getInstance().showVideo(() => {
            this.addTime(null);
        })
    }

    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.addTime(null, 100)
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        // if (GameData.PauseGame == true) return;
        // GameData.startTime--;
        // this.time.string = "时间:" + GameData.startTime.toString() + "s";
        // if (GameData.startTime == 0) {
        //     this.unschedule(this.Timeing);
        //     setTimeout(() => {
        //         this.endlost("prefabs/hz/endlost_hz");
        //     }, 600);
        // }
    }

    gameEndReStart() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        this.gou2.active = false;
        this.initlv();
        // var group = this.gou2.getChildByName("group");
        // cc.Tween.stopAllByTarget(group);
        // cc.tween(group)
        //     .delay(0.3)
        //     .to(0.8, { scale: 0 })
        //     .call(() => {

        //     })
        //     .start()
    }
    gameEndNextLv() {
        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        lvnode.destroyAllChildren();
        lvnode.active = false;
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // var group = this.gou.getChildByName("group");
        this.gou.active = false;
        this.curlv++;
        this.initlv();
        // cc.Tween.stopAllByTarget(group);
        // cc.tween(group)
        //     .delay(0.3)
        //     .to(0.8, { scale: 0 })
        //     .call(() => {

        //     })
        //     .start()
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

