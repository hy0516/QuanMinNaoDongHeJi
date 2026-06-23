

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";




const { ccclass, property } = cc._decorator;
enum music {
    不好意思啊我上次吃火锅不小心吃了一些 = "不好意思啊我上次吃火锅不小心吃了一些",
    不是师傅我怎么这么小啊 = "不是师傅我怎么这么小啊",
    插鱼声 = "插鱼声",
    拂尘声 = "拂尘声",
    错误声 = "错误声",
    点击 = "点击",
    感谢师傅的再造之恩 = "感谢师傅的再造之恩",
    关卡背景 = "关卡背景lv71",
    好徒儿你莫着急为师这就给你重塑身体 = "好徒儿你莫着急为师这就给你重塑身体",
    荷叶遮住瀑布时 = "荷叶遮住瀑布时",
    拼图复位声 = "拼图复位声",
    胜利界面 = "胜利界面",
    树叶挪开声 = "树叶挪开声",
}
@ccclass
export default class zc_lv26 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    shuyisuipian: cc.Node = null;

    @property(cc.Node)
    yusuipian: cc.Node = null;

    @property(cc.Node)
    gunzi: cc.Node = null;

    @property(cc.Node)
    lianhua: cc.Node = null;

    @property(cc.Node)
    pbsuipian: cc.Node = null;

    @property(cc.Node)
    btn_end: cc.Node = null;

    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    yu: cc.Node = null;

    @property(cc.Node)
    lianou: cc.Node = null;

    @property(cc.Node)
    pubu: cc.Node = null;

    @property(cc.Node)
    shuye: cc.Node = null;

    @property(cc.Node)
    heidi: cc.Node = null;
    @property(cc.Node)
    jiewei: cc.Node = null;

    @property(cc.Node)
    fuchen: cc.Node = null;

    @property(cc.Node)
    wqt: cc.Node = null;

    @property(cc.Node)
    nz: cc.Node = null;
    @property(cc.Node)
    huaban: cc.Node = null;

    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Node)
    PB: cc.Node = null;
    @property(cc.Node)
    lab_pb: cc.Node = null;
    @property(cc.Node)
    fuchensk: cc.Node = null;
    @property(cc.Node)
    suipian: cc.Node = null;
    @property(cc.Node)
    private gou: cc.Node = null;
    @property(cc.Node)
    private gou2: cc.Node = null;


    public startTime = 180;
    public curTime = 0;

    tiezhinum = 0;



    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        this.scheduleOnce(() => {
            AudioManager.playMusic(music.关卡背景, true, 1);
        }, 0.5)
        cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.5)
            )
            .start()
        this.initGunZiMoveitem();
        this.initHuaBanMoveitem();
        this.showPB(music.好徒儿你莫着急为师这就给你重塑身体, music.好徒儿你莫着急为师这就给你重塑身体);
    }
    initGunZiMoveitem() {
        this.gunzi.on(cc.Node.EventType.TOUCH_START, this.onTouchStartGunZi, this);
        this.gunzi.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveGunZi, this);
        this.gunzi.on(cc.Node.EventType.TOUCH_END, this.onTouchEndGunZi, this);
        this.gunzi.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndGunZi, this);
    }
    offGunZiMoveitem() {
        this.gunzi.off(cc.Node.EventType.TOUCH_START, this.onTouchStartGunZi, this);
        this.gunzi.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveGunZi, this);
        this.gunzi.off(cc.Node.EventType.TOUCH_END, this.onTouchEndGunZi, this);
        this.gunzi.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndGunZi, this);
    }
    GunziStartPoi
    onTouchStartGunZi(e: cc.Event.EventTouch) {
        AudioManager.playEffect(music.点击);
        this.GunziStartPoi = this.gunzi.position;
    }
    onTouchMoveGunZi(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.gunzi.x += e.getDeltaX();
        this.gunzi.y += e.getDeltaY();
    }
    onTouchEndGunZi() {
        if (GameData.PauseGame) return
        var rect = this.gunzi.getBoundingBox();
        var rect1 = this.yu.getBoundingBox();
        if (rect.intersects(rect1)) {
            this.gunzi.active = false;
            this.scheduleOnce(() => { AudioManager.playEffect(music.插鱼声); }, 1.1);
            this.yu.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("yu-hudong", 1);
            this.addOneTimeListener(this.yu.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay), () => {
                this.yusuipian.active = true;
            })
            this.offGunZiMoveitem();
        } else if (this.GunziStartPoi) {
            this.gunzi.setPosition(this.GunziStartPoi);
        }
    }
    isLH = false;
    initLHMoveitem() {
        this.lianhua.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMovelianhua, this);
    }
    offLHMoveitem() {
        this.lianhua.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMovelianhua, this);
    }
    onTouchMovelianhua(e: cc.Event.EventTouch) {
        AudioManager.playEffect(music.点击);
        var curpoi = this.node.convertToNodeSpaceAR(e.getLocation());
        if (curpoi.y - this.lianhua.y >= 20) {
            this.lianhua.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("lianhua-hudong", 1);
            this.addOneTimeListener(this.lianhua.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay), () => {
                this.lianou.active = true;
                cc.tween(this.lianou)
                    .to(0.5, { opacity: 255 })
                    .call(() => {
                        this.initLianOuMoveitem();
                    })
                    .start()
            })
            this.offLHMoveitem();
            // this.isLH = true;

        }
    }
    initFuChengMoveitem() {
        this.fuchen.on(cc.Node.EventType.TOUCH_START, this.onTouchStartFuChen, this);
        this.fuchen.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveFuChen, this);
        this.fuchen.on(cc.Node.EventType.TOUCH_END, this.onTouchEndFuChen, this);
        this.fuchen.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndFuChen, this);
    }
    offFuChengMoveitem() {
        this.fuchen.off(cc.Node.EventType.TOUCH_START, this.onTouchStartFuChen, this);
        this.fuchen.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveFuChen, this);
        this.fuchen.off(cc.Node.EventType.TOUCH_END, this.onTouchEndFuChen, this);
        this.fuchen.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndFuChen, this);
    }

    isfuchen = false;
    fuchenstartPoi
    onTouchStartFuChen() {
        AudioManager.playEffect(music.点击);
        this.fuchenstartPoi = this.fuchen.position;
    }
    onTouchMoveFuChen(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.fuchen.x += e.getDeltaX();
        this.fuchen.y += e.getDeltaY();
    }
    onTouchEndFuChen(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        var rect = this.wqt.getBoundingBox();
        var rect1 = this.fuchen.getBoundingBox();
        if (rect.intersects(rect1) && this.isLH) {
            AudioManager.playEffect(music.拂尘声);
            this.fuchensk.active = true;
            this.fuchen.active = false;
            this.fuchensk.getComponent(dragonBones.ArmatureDisplay).playAnimation("fucheng", 1);
            this.addOneTimeListener(this.fuchensk.getComponent(dragonBones.ArmatureDisplay), () => {
                this.fuchensk.active = false;
                for (let i = 0; i < this.suipian.childrenCount; i++) {
                    var item = this.suipian.children[i];
                    item.setScale(cc.v2(1, 1));
                }
                this.offFuChengMoveitem();
            })
            this.isfuchen = true;
        } else if (this.fuchenstartPoi) {
            this.fuchen.setPosition(this.fuchenstartPoi);
        }
    }

    initHuaBanMoveitem() {
        this.nz.on(cc.Node.EventType.TOUCH_START, this.onTouchStartHuaBan, this);
        this.nz.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveHuaBan, this);
        this.nz.on(cc.Node.EventType.TOUCH_END, this.onTouchEndHuaBan, this);
        this.nz.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndHuaBan, this);
    }
    offHuaBanMoveitem() {
        this.nz.off(cc.Node.EventType.TOUCH_START, this.onTouchStartHuaBan, this);
        this.nz.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveHuaBan, this);
        this.nz.off(cc.Node.EventType.TOUCH_END, this.onTouchEndHuaBan, this);
        this.nz.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndHuaBan, this);
    }
    huabanstartpoi
    onTouchStartHuaBan(e: cc.Event.EventTouch) {
        AudioManager.playEffect(music.点击);
        this.huabanstartpoi = this.huaban.position;
        this.huaban.setPosition(this.node.convertToNodeSpaceAR(e.getLocation()));
    }
    onTouchMoveHuaBan(e: cc.Event.EventTouch) {
        this.huaban.x += e.getDeltaX();
        this.huaban.y += e.getDeltaY();
    }
    onTouchEndHuaBan(e: cc.Event.EventTouch) {
        var rect = this.huaban.getBoundingBox();
        var rect1 = this.pubu.getBoundingBox();
        if (rect.intersects(rect1)) {
            AudioManager.playEffect(music.荷叶遮住瀑布时);
            this.huaban.active = false;
            this.offHuaBanMoveitem();
            this.pubu.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("pb-hudong", -1);
            this.pbsuipian.active = true;
        } else {
            if (this.huabanstartpoi) this.huaban.setPosition(this.huabanstartpoi);
        }
    }
    initLianOuMoveitem() {
        this.lianou.on(cc.Node.EventType.TOUCH_START, this.onTouchStartLianOu, this);
        this.lianou.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveLianOu, this);
        this.lianou.on(cc.Node.EventType.TOUCH_END, this.onTouchEndLianOu, this);
        this.lianou.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndLianOu, this);
    }
    offLianOuMoveitem() {
        this.lianou.off(cc.Node.EventType.TOUCH_START, this.onTouchStartLianOu, this);
        this.lianou.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveLianOu, this);
        this.lianou.off(cc.Node.EventType.TOUCH_END, this.onTouchEndLianOu, this);
        this.lianou.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndLianOu, this);
    }
    lianoustartpoi
    onTouchStartLianOu(e: cc.Event.EventTouch) {
        AudioManager.playEffect(music.点击);
        this.lianoustartpoi = this.lianou.position;
        this.lianou.setPosition(this.node.convertToNodeSpaceAR(e.getLocation()));
    }
    onTouchMoveLianOu(e: cc.Event.EventTouch) {
        this.lianou.x += e.getDeltaX();
        this.lianou.y += e.getDeltaY();
    }
    onTouchEndLianOu(e: cc.Event.EventTouch) {
        var rect = this.lianou.getBoundingBox();
        var rect1 = this.wqt.getBoundingBox();
        if (rect.intersects(rect1)) {
            this.offLianOuMoveitem();
            this.lianou.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("lianou-hudong", 1);
            this.addOneTimeListener(this.lianou.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay), () => {
                cc.tween(this.lianou)
                    .to(0.5, { opacity: 0 })
                    .call(() => { this.isLH = true })
                    .start()
            })
        } else {
            if (this.lianoustartpoi) this.lianou.setPosition(this.lianoustartpoi);
        }
    }
    onwin() {
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(() => {
                GameData.PauseGame = true;
                this.node.cleanup();
                this.scheduleOnce(() => {
                    AudioManager.stopEffect()
                    // AudioManager.playEffect(AudioManager.audioName.end);
                    this.loadend();
                    this.node.destroy();
                }, 1.5);
            })
            .start()
        this.scheduleOnce(() => {
            AudioManager.playEffect("finishjq");
        }, 0.9)
    }

    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        // if (GameData.PauseGame == true) return
        AudioManager.playEffect(music.点击);
        switch (event.currentTarget.name) {
            case "fanhui":
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallnNode = cc.instantiate(hall);
                    HallnNode.parent = cc.find("Canvas");
                    GameData.getMap = [];
                    VideoManager.getInstance().showBaoXiang();
                    this.node.destroy();
                })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            // case "tishi":
            // var handlers = () => {
            //     cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
            //         var HallnNode = cc.instantiate(tip);
            //         HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv5tip;
            //         HallnNode.parent = cc.find("Canvas");
            //         this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
            //         this.isshowVideo = true;
            //         VideoManager.getInstance().showInsert();
            //     })
            // }
            case "btn_tips":
                var handlers = () => {
                    GameData.PauseGame = true;
                    this.tipsPanel.active = true;
                    // if (this.curLevelId != 1) this.tipsPanel.getChildByName("tishi" + (this.curLevelId - 1).toString()).active = false;
                    // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = true;
                    this.node.getChildByName("btn_tips").getChildByName("guangg").active = false;
                    this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "x":
                GameData.PauseGame = false;
                // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = false;
                this.tipsPanel.active = false;
                break;
            case "13":
                cc.tween(this.yu)
                    .to(0.5, { opacity: 0 })
                    .call(() => {
                        this.yu.active = false;
                    })
                    .start()
                for (let i = 0; i < this.suipian.childrenCount; i++) {
                    var item = this.suipian.children[i];
                    if (item.name == "s" + event.currentTarget.name) {
                        AudioManager.playEffect(music.拼图复位声);
                        event.currentTarget.zIndex = 50;
                        cc.tween(event.currentTarget)
                            .to(0.8, { position: item.position })
                            .call(() => {
                                event.currentTarget.active = false;
                                item.active = true;
                                this.suipianNum++;
                                if (this.suipianNum == 9) {
                                    this.initFuChengMoveitem();
                                    this.initLHMoveitem();
                                    this.btn_end.active = true;
                                }
                            })
                            .start()
                        break;
                    }
                }
                break;
            case "15":
                this.pubu.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("pb", -1);
                for (let i = 0; i < this.suipian.childrenCount; i++) {
                    var item = this.suipian.children[i];
                    if (item.name == "s" + event.currentTarget.name) {
                        AudioManager.playEffect(music.拼图复位声);
                        event.currentTarget.zIndex = 50;
                        cc.tween(event.currentTarget)
                            .to(0.8, { position: item.position })
                            .call(() => {
                                event.currentTarget.active = false;
                                item.active = true;
                                this.suipianNum++;
                                if (this.suipianNum == 9) {
                                    this.initFuChengMoveitem();
                                    this.initLHMoveitem();
                                    this.btn_end.active = true;
                                }
                            })
                            .start()
                        break;
                    }
                }
                break
            case "11":
            case "12":
            case "14":
            case "16":
            case "17":
            case "18":
            case "19":
                for (let i = 0; i < this.suipian.childrenCount; i++) {
                    var item = this.suipian.children[i];
                    if (item.name == "s" + event.currentTarget.name) {
                        AudioManager.playEffect(music.拼图复位声);
                        event.currentTarget.zIndex = 50;
                        cc.tween(event.currentTarget)
                            .to(0.8, { position: item.position })
                            .call(() => {
                                event.currentTarget.active = false;
                                item.active = true;
                                this.suipianNum++;
                                if (this.suipianNum == 9) {
                                    this.initFuChengMoveitem();
                                    this.initLHMoveitem();
                                    this.btn_end.active = true;
                                }
                            })
                            .start()
                        break;
                    }
                }
                break;
            case "shuye":
                if (this.isshuye || GameData.PauseGame) return
                var time = new Date().getTime();
                if (this.shuyeTime == 0) {
                    this.shuyeTime = time;
                    this.shuyeNum = 1;
                    break;
                }
                if (time - this.shuyeTime <= 1500) {
                    AudioManager.playEffect(music.树叶挪开声);
                    this.shuye.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("shuye-hudong", 1);
                    this.shuyisuipian.active = true;
                    this.isshuye = true;
                } else {
                    this.shuyeTime = 0;
                }
                break;
            case "btn_end":
                if(GameData.PauseGame)return
                GameData.PauseGame = true;
                this.wqt.active = false;
                cc.tween(this.suipian)
                    .to(1, { y: 600 })
                    .to(0.5, { opacity: 0 })
                    .call(() => {
                        AudioManager.playEffect(music.拼图复位声);
                        this.nz.getChildByName("lianhua2").active = false;
                        this.suipian.active = false;
                        if (this.isfuchen && this.isLH) {
                            this.nz.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("nz-dj2", 1);
                            this.showPB(music.感谢师傅的再造之恩, music.感谢师傅的再造之恩, () => {
                                this.heidi.active = true;
                                this.jiewei.active = true;
                                cc.tween(this.heidi)
                                    .to(0.5, { opacity: 255 })
                                    .delay(1)
                                    .call(() => {
                                        AudioManager.playEffect(music.胜利界面);
                                        cc.tween(this.jiewei)
                                            .to(0.5, { opacity: 255 })
                                            .delay(3)
                                            .call(() => {
                                                this.onwin();
                                            })
                                            .start()
                                    })
                                    .start()
                            })
                        } else {
                            this.nz.getChildByName("fhnz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("nz-dj3", 1);
                            this.showPB(music.不是师傅我怎么这么小啊, music.不是师傅我怎么这么小啊, () => {
                                this.showPB(music.不好意思啊我上次吃火锅不小心吃了一些, music.不好意思啊我上次吃火锅不小心吃了一些, () => {
                                    this.onlost();
                                })
                            })
                        }
                    })
                    .start()
                break;

        }
    }

    suipianNum = 0;

    shuyeNum = 0;
    shuyeTime = 0;
    isshuye = false;

    loadend() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");
    }

    showPB(lab: string, music: string, handler?: Function) {
        if (lab == "") {
            handler && handler();
            return
        }
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(music, false, () => {
                    cc.tween(this.PB)
                        .to(0.2, { opacity: 0 })
                        .call(() => {
                            handler && handler();
                        })
                        .start()
                });
            })
            .start()
    }
    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
        this.Timeing();
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }

    onlost() {
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .call(() => {
                this.unschedule(this.Timeing);
                GameData.PauseGame = true;
                this.node.cleanup();
                this.scheduleOnce(() => {
                    this.endlost("prefabs/zc/zc_lostend")
                    this.node.destroy();
                }, 0.7);
            })
            .start()
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            // AudioManager.playEffect(music.哭);
        }, 0.4)

    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }
}

