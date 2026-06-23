
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveHandlerItem from "../script/common/moveHandlerItem";
import guize_config from "../script/guize/guize_config";
import gzTip from "../script/guize/gzTip";




const { ccclass, property } = cc._decorator;
enum audio {
    // 灯 = "gz4_19",
    // 插头 = "gz4_20",
    // 打玻璃 = "gz3_41",
    // 红圈 = "gz4_21",
    // 烟雾 = "gz4_22",
    // 液体泼水声 = "gz4_23",
    // tv = "gz4_24",
    // 喵 = "gz4_25"
}

@ccclass
export default class gz_lv7 extends BaseGame {

    @property(cc.Node)
    pangbai: cc.Node = null;


    @property(cc.Node)
    zhitiao: cc.Node = null;

    @property(cc.Node)
    tittle: cc.Node = null;


    iszhong1 = false;
    zhongnum1 = 21;
    zhongnum2 = 6;
    wdNum = -14;
    startPoi

    curProId = 0;

    curFzProId = 0;

    guizeNum = 0;
    curGZNum = 0;

    mainNode: cc.Node = null

    fzProList = [];

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(AudioManager.gz.背景, true);

        cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.2)
            )
            .start()

        this.mainNode = this.node.getChildByName("room1");
        common.openSk();
        this.gameProcess();
        // var sk = this.mainNode.getChildByName("nv").getChildByName("state1");
        // sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("kaitou", 1);
        // this.scheduleOnce(() => {
        //     sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        // }, 1)

    }
    addBtnHua(node: cc.Node) {
        console.log("addBtnHua" + node.name)
        node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.startPoi = event.currentTarget.position;
    }
    onTouchMove(event: cc.Event.EventTouch) {
        var delay = event.getDelta();
        event.currentTarget.x += delay.x;
        event.currentTarget.y += delay.y;
    }
    onTouchEnd(event: cc.Event.EventTouch) {
        // var endPoi = event.getLocation();
        console.log("onTouchEnd" + event.currentTarget.name)
        switch (event.currentTarget.name) {
            case "3p":
            case "8p":
                var piao1 = this.mainNode.getChildByName("piaonode").getChildByName("8p");
                var piao2 = this.mainNode.getChildByName("piaonode").getChildByName("3p");
                var poi = this.mainNode.convertToNodeSpaceAR(event.getLocation());
                if (this.mainNode.getChildByName("rennode").getBoundingBox().contains(poi)) {
                    if (guize_config.lv7process[this.curProId].nodeName == event.currentTarget.name) {
                        event.currentTarget.active = false;
                        event.currentTarget.position = this.startPoi;
                        this.deleBtnEvent(piao1);
                        this.deleBtnEvent(piao2);
                        this.nextProcess();
                    } else {
                        this.deleBtnEvent(piao1);
                        this.deleBtnEvent(piao2);
                        event.currentTarget.active = false;
                        this.FenzhiProcess(null, guize_config.lv7process[this.curProId].fenzhi)
                    }
                } else {
                    event.currentTarget.setPosition(this.startPoi);
                }
                break;
            case "shuitong":
                var poi = this.mainNode.convertToNodeSpaceAR(event.getLocation());
                if (this.mainNode.getChildByName("toufa").active &&
                    this.mainNode.getChildByName("toufa").getBoundingBox().contains(poi)) {
                    event.currentTarget.active = false;
                    this.nextProcess();
                    this.deleBtnEvent(event.currentTarget);
                } else {
                    event.currentTarget.setPosition(this.startPoi);
                }
                break
            case "xiaofang":
                var poi = this.mainNode.convertToNodeSpaceAR(event.getLocation());
                if (this.mainNode.getChildByName("chuangkou").active &&
                    this.mainNode.getChildByName("chuangkou").getBoundingBox().contains(poi)) {
                    event.currentTarget.active = false;
                    this.mainNode.getChildByName("yan_sk").active = false;
                    this.mainNode.getChildByName("deng_sk").active = false;
                    this.mainNode.getChildByName("kaimen").active = true;
                    this.scheduleOnce(() => {
                        this.nextProcess();
                    }, 0.5)
                    this.deleBtnEvent(event.currentTarget);
                } else {
                    event.currentTarget.setPosition(this.startPoi);
                }
                break
            case "jiandao":
                var poi = this.mainNode.convertToNodeSpaceAR(event.getLocation());
                if (this.mainNode.getChildByName("toufa").active &&
                    this.mainNode.getChildByName("toufa").getBoundingBox().contains(poi)) {
                    this.mainNode.getChildByName("toufa").active = false
                    event.currentTarget.active = false;
                    this.FenzhiProcess(null, 5);
                    this.deleBtnEvent(event.currentTarget);
                } else {
                    event.currentTarget.setPosition(this.startPoi);
                }
                break
        }

    }

    deleBtnEvent(node: cc.Node) {
        node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    isGZnext = false;
    showguize(even: cc.Event.EventTouch) {
        var pro = guize_config.lv7process[this.curProId];
        if (!pro.lab) return
        var dang = this.mainNode.getChildByName("dang");
        if (dang) dang.active = true;
        this.isGZnext = true;
        even.currentTarget.getComponent(cc.Button).enabled = false;
        even.currentTarget.active = false;
        this.guizeNum++;
        this.curGZNum = this.guizeNum;
        this.scheduleOnce(() => {
            for (let i = 0; i < pro.lab.length; i++) {
                GameData.getMap[GameData.getMap.length] = pro.lab[i];
                if (i == pro.lab.length - 1) this.showzhitiao();
            }
        }, 0.05)
    }

    showzhitiao(event?) {
        if (GameData.getMap.length < 1) {
            common.ShowTipsView("请先寻找规则");
            return
        }
        // if (!event) AudioManager.playEffect(audio.点击屏幕);
        AudioManager.playEffect(AudioManager.common.GZZHITIAO);
        this.zhitiao.active = true;
        var lablist = this.zhitiao.getChildByName("lab_list").children;
        var start = (this.curGZNum - 1) * 4;
        var bl = this.zhitiao.getChildByName("btn_last");
        var bn = this.zhitiao.getChildByName("btn_next");
        bl.active = bn.active = false;
        switch (this.curGZNum) {
            case 1:
                bl.active = false;
                if (this.guizeNum > this.curGZNum) bn.active = true;
                break;
            case lablist.length:
                bl.active = true;
                if (this.guizeNum > this.curGZNum) bn.active = false;
                break;
            default:
                bl.active = true;
                if (this.guizeNum > this.curGZNum) bn.active = true;
                break;
        }
        for (let j = 0; j < lablist.length; j++) {
            if (GameData.getMap[start + j]) {
                lablist[j].getComponent(cc.Label).string = GameData.getMap[start + j];
            } else {
                lablist[j].getComponent(cc.Label).string = "";
            }

        }
    }

    LastGuize() {
        AudioManager.playEffect(AudioManager.common.GZZHITIAO);
        this.curGZNum--;
        this.showzhitiao();
    }
    NextGuize() {
        AudioManager.playEffect(AudioManager.common.GZZHITIAO);
        this.curGZNum++;
        this.showzhitiao();
    }

    hideguize() {
        this.curGZNum = this.guizeNum;
        var pro = guize_config.lv7process[this.curProId];
        this.zhitiao.active = false;
        if (pro.type == 2 && this.isGZnext) {
            this.nextProcess();
            this.isGZnext = false;
        }
        AudioManager.playEffect(AudioManager.common.GZBTN);
    }


    FenzhiProcess(even, num: number) {
        GameData.PauseGame = true;
        var fzPro = guize_config.lv7FzProcess[num];
        for (let i = 0; i < fzPro.pro.length; i++) {
            var item = fzPro.pro[i];
            this.fzProList.push(item);
        }
        GameData.PauseGame = false;
        this.gameFzProcess()

        // if (this.selePanel.active) this.selePanel.active = false;
    }


    gameFzProcess() {
        var pro = this.fzProList[this.curFzProId];
        switch (pro.type) {
            case 1:
                this.showPangbai(pro);
                break;
            case 3:
                this.action(pro);
                break;
            case 9:
                this.endlost();
                break;
            case 11:
                var hei1 = this.mainNode.getChildByName("tonghei1");
                var hei2 = this.mainNode.getChildByName("tonghei2");
                cc.Tween.stopAllByTarget(hei1);
                cc.Tween.stopAllByTarget(hei2);
                cc.tween(hei1)
                    .to(0.6, { scaleY: 1 })
                    .call(() => {
                        this.mainNode.active = false;
                        this.node.getChildByName(pro.name).active = true;
                    })
                    .delay(1.2)
                    .to(0.6, { scaleY: 0 })
                    .start();
                cc.tween(hei2)
                    .to(0.6, { scaleY: 1 })
                    .delay(1.2)
                    .to(0.6, { scaleY: 0 })
                    .call(() => {
                        // this.mainNode.active = false;
                        // this.node.getChildByName(pro.name).active = true; 
                        this.nextProcess();
                    })
                    .start();

            // setTimeout(() => {
            //     var hei = this.node.getChildByName("tonghei");
            //     hei.active = true;
            //     setTimeout(() => {

            // hei.active = false;
            // this.mainNode = this.node.getChildByName(pro.name);
            // this.nextProcess();
            // }, 250);
            // }, 100);

        }
    }

    nextProcess() {
        if (this.fzProList.length > 0) {
            this.curFzProId++;
            setTimeout(() => {
                this.gameFzProcess()
            }, 100);
        } else {
            this.curProId++;
            console.log(this.curProId)
            setTimeout(() => {
                this.gameProcess()
            }, 100);
        }

    }


    gameProcess() {
        var pro = guize_config.lv7process[this.curProId];
        switch (pro.type) {
            case 1:
                this.showPangbai(pro)
                break;
            case 3:
                this.action(pro);
                break;
            case 10:
                this.endwin();
                break;
            case 11:
                var hei1 = this.node.getChildByName("tonghei1");
                var hei2 = this.node.getChildByName("tonghei2");
                cc.Tween.stopAllByTarget(hei1);
                cc.Tween.stopAllByTarget(hei2);
                cc.tween(hei1)
                    .to(0.6, { scaleY: 1 })
                    .call(() => {
                        this.mainNode.active = false;
                        this.node.getChildByName(pro.name).active = true;
                    })
                    .delay(0.8)
                    .to(0.6, { scaleY: 0 })
                    .start();
                cc.tween(hei2)
                    .to(0.6, { scaleY: 1 })
                    .delay(0.8)
                    .to(0.6, { scaleY: 0 })
                    .delay(0.5)
                    .call(() => {
                        // this.mainNode.active = false;
                        // this.node.getChildByName(pro.name).active = true; 
                        this.mainNode = this.node.getChildByName(pro.name);
                        if (pro.name == "room2") AudioManager.playEffect("gz7_27");
                        this.nextProcess();
                    })
                    .start();

                // this.scheduleOnce(() => {
                //     var hei = this.node.getChildByName("tonghei");
                //     hei.active = true;
                //     this.scheduleOnce(() => {
                //         this.mainNode.active = false;
                //         this.node.getChildByName(pro.name).active = true;
                //         hei.active = false;
                //         this.mainNode = this.node.getChildByName(pro.name);
                //         this.nextProcess();
                //     }, 1);
                // }, 0.1);
                break;
        }
        if (pro.tittle) this.tittle.getChildByName("lab_tittle").getComponent(cc.Label).string = pro.tittle;
        if (pro.tipsnum) {
            GameData.tipsNum++;
            this.isshow = false;
            this.node.getChildByName("outpanel").getChildByName("btn_tips").getChildByName("luxiang").active = true;
        }
    }

    isguai = 0;
    moveHandler(type: number, tar: cc.Node, even: any): void {

    }

    action(pro: any) {
        switch (pro.target) {
            case "piaohide":
                var piao1 = this.mainNode.getChildByName("piaonode").getChildByName("8p");
                var piao2 = this.mainNode.getChildByName("piaonode").getChildByName("3p");
                if (piao1 && piao2) {
                    this.deleBtnEvent(piao1);
                    this.deleBtnEvent(piao2);
                    this.nextProcess();
                }
                break;
            case "startpiao":
                var piao1 = this.mainNode.getChildByName("piaonode").getChildByName("8p");
                var piao2 = this.mainNode.getChildByName("piaonode").getChildByName("3p");
                if (piao1 && piao2) {
                    this.addBtnHua(piao1);
                    this.addBtnHua(piao2);
                    this.nextProcess();
                }
                break;
            case "ren":
                var piao1 = this.mainNode.getChildByName("piaonode").getChildByName("8p");
                var piao2 = this.mainNode.getChildByName("piaonode").getChildByName("3p");
                if (piao1 && piao2) {
                    piao1.active = true;
                    piao2.active = true;
                }
                var ren = this.mainNode.getChildByName("rennode").getChildByName(guize_config.lv7process[this.curProId].nodeName)
                if (ren) {
                    cc.tween(ren)
                        .to(0.6, { opacity: 255 })
                        .call(() => {
                            this.nextProcess();
                        })
                        .start()
                }
                break;
            case "renhide":
                var rennode=this.mainNode.getChildByName("rennode")
                for (let i = 0; i < rennode.childrenCount; i++) {
                    var chil = rennode.children[i]
                    if(!this.mainNode||!rennode)return
                    if (chil.opacity != 0) {
                        cc.tween(chil)
                            .to(0.6, { opacity: 0 })
                            .call(() => {
                                this.nextProcess();
                            })
                            .start()
                        return
                    }
                }
                break;
            case "kazhu":
            case "qihuo":
            case "bofang":
                this.mainNode.getChildByName(guize_config.lv7process[this.curProId].nodeName).active = true;
                this.nextProcess();
                break;
            case "miehuo":
                this.mainNode.getChildByName(guize_config.lv7process[this.curProId].nodeName).active = false;
                this.nextProcess();
                break;
            case "xiaofang":
                this.mainNode.getChildByName("btn_chuangkou").active = true;
            case "shuitong":
                this.addBtnHua(this.mainNode.getChildByName("jiandao"));
                this.addBtnHua(this.mainNode.getChildByName(guize_config.lv7process[this.curProId].nodeName));
                this.nextProcess();
                break;
            case "linshi":
                var daoshui = this.mainNode.getChildByName("daoshui");
                cc.tween(daoshui)
                    .to(0.3, { opacity: 255 })
                    .delay(0.3)
                    .to(0.3, { opacity: 0 })
                    .call(() => {
                        this.mainNode.getChildByName(guize_config.lv7process[this.curProId].nodeName).active = false;
                        this.nextProcess();
                    })
                    .start()
                break;
            case "zuoyi":
                this.mainNode.getChildByName("btn_tou").active = true;
                // this.nextProcess();
                break;
            case "cfLost":
                this.LostTween(0);
                break;
            case "select":
                this.mainNode.getChildByName(guize_config.lv7process[this.curProId].nodeName).active = true;
                break;
        }
    }




    BtnHandler(event: cc.Event.EventTouch, data) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.GZBTN);
        switch (event.currentTarget.name) {
            case "btn_kai":
                this.mainNode.getChildByName("selePanel").active = false;
                this.FenzhiProcess(null, 3);
                break;
            case "btn_bukai":
                this.mainNode.getChildByName("selePanel").active = false;
                this.FenzhiProcess(null, 4);
                break;
            case "btn_kai2":
                this.mainNode.getChildByName("selePanel2").active = false;
                this.FenzhiProcess(null, 6);
                break;
            case "btn_bukai2":
                this.mainNode.getChildByName("selePanel2").active = false;
                this.FenzhiProcess(null, 7);
                break;
            case "btn_huitou":
                this.mainNode.getChildByName("selePanel").active = false;
                this.FenzhiProcess(null, 8);
                break;
            case "btn_buhui":
                this.mainNode.getChildByName("selePanel").active = false;
                this.nextProcess();
                break;
            case "btn_close":
                event.currentTarget.parent.active = false;
                break;
            case "btn_chuangkou":
                this.mainNode.getChildByName("chuangkou").active = true;
                event.currentTarget.active = false;
                // this.FenzhiProcess(null, 9);
                break;
            case "btn_tou":
                this.mainNode.getChildByName("tou").active = true;
                event.currentTarget.active = false;
                this.scheduleOnce(()=>{
                     this.nextProcess();
                },0.4);
                break;
        }
    }

    data
    chaNum = 0;
    setChatList() {
        var list = this.mainNode.getChildByName("chaList");
        if (!list) return
        var item = list.children[this.data];
        if (item) {
            item.getChildByName("stub1").active = true;
            item.getChildByName("luxiang").active = false;
            this.chaNum++;
            if (this.chaNum == list.children.length) {
                // this.scheduleOnce(()=>{
                this.nextProcess();
                // },0.5)
            }
        }
    }
    setChatIcon() {
        var list = this.mainNode.getChildByName("chaList");
        if (!list) return
        for (let i = 0; i < list.children.length; i++) {
            var item = list.children[i];
            item.getChildByName("luxiang").active = false;
        }
    }

    LostTween(num: number) {
        AudioManager.playEffect(AudioManager.common.GZGUI);
        var lostbg = this.mainNode.parent.getChildByName("lostbg").children[num];
        // this.mainNode.getChildByName("nv").active = false;
        this.mainNode.parent.getChildByName("xian").active = true;
        lostbg.scaleX = 0;
        lostbg.scaleY = 0;
        lostbg.active = true;
        cc.Tween.stopAllByTarget(lostbg);
        cc.tween(lostbg)
            .to(0.9, { scaleX: 1, scaleY: 1 }, { progress: null, easing: "backInOut" })
            .call(() => {
                AudioManager.playEffect(AudioManager.common.GZZHUA);
            })
            .delay(0.7)
            .call(() => {
                this.nextProcess();
            })
            .start();
    }

    showPangbai(pro: any) {
        this.pangbai.active = true;
        this.pangbai.getChildByName("lab_pb").getComponent(cc.Label).string = pro.lab;
        AudioManager.playEffect(pro.music);
        this.unschedule(this.hidePangbi);
        this.schedule(this.hidePangbi, pro.musicTime)
    }
    hidePangbi() {
        if (!this.pangbai.active) {
            return;
        }
        // this.unschedule(this.hidePangbi);
        this.pangbai.active = false;
        AudioManager.stopEffect();
        this.nextProcess();
    }

    endwin() {
        AudioManager.playEffect(AudioManager.common.GZBTN);
        super.endwin("prefabs/gz/gz_winend")
    }

    endlost() {
        AudioManager.stopMusic();
        AudioManager.playEffect(AudioManager.common.GZBTN);
        super.endlost("prefabs/gz/gz_lostend");
        this.node.destroy();
    }

    isshow = false;
    showTip() {
        AudioManager.playEffect(AudioManager.common.GZBTN);
        var fun = () => {
            cc.resources.load("prefabs/gz/gzTip", cc.Prefab, (err, UI: cc.Prefab) => {
                var UINode = cc.instantiate(UI);
                UINode.parent = cc.find("Canvas");
                UINode.getComponent(gzTip).showTips(guize_config.lv7Tips[GameData.tipsNum]);

            })
        }
        if (!this.isshow) {
            VideoManager.getInstance().showVideo(() => {
                fun();
                this.isshow = true;
                this.node.getChildByName("outpanel").getChildByName("btn_tips").getChildByName("luxiang").active = false;
            })
        } else {
            fun();
        }

    }

    fanhui() {
        super.fanhui();
    }

    restart() {
        super.restart();
    }


}

