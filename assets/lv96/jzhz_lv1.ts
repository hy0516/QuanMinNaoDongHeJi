

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";




const { ccclass, property } = cc._decorator;

@ccclass
export default class jzhz_lv1 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;


    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    icon: cc.Node = null;
    @property(cc.Node)
    clicklist: cc.Node = null;
    @property(cc.Node)
    moveMap: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;


    public startTime = 180;
    public curTime = 0;

    tiezhinum = 0;



    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        // AudioManager.playMusic("关卡背景zc25", true, 0.7);
        AudioManager.stopMusic();
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
        this.IntBtn();
        var ani = this.getbodys(this.node, "ani");
        ani[0].getComponent(cc.Animation).play("jiewen", 0)
        ani[1].getComponent(cc.Animation).play("wenda", 0)
        ani[2].getComponent(cc.Animation).play("pingji", 0)
        ani[3].getComponent(cc.Animation).play("diannao", 0)
        ani[4].getComponent(cc.Animation).play("tanu", 0)
        ani[5].getComponent(cc.Animation).play("ximeng", 0)
        ani[6].getComponent(cc.Animation).play("depule", 0)
        ani[7].getComponent(cc.Animation).play("dashu", 0)
        ani[8].getComponent(cc.Animation).play("taiyang", 0)
        ani[9].getComponent(cc.Animation).play("xiaotian", 0)
        ani[10].getComponent(cc.Animation).play("laimu", 0)
        ani[11].getComponent(cc.Animation).play("jianuode", 0)
        ani[12].getComponent(cc.Animation).play("bulude", 0)
        ani[13].getComponent(cc.Animation).play("gelei", 0)
        ani[14].getComponent(cc.Animation).play("weiniliya", 0)
        ani[15].getComponent(cc.Animation).play("jiqiren", 0)
        ani[16].getComponent(cc.Animation).play("ruidi", 0)
        ani[17].getComponent(cc.Animation).play("kelake", 0)
        ani[18].getComponent(cc.Animation).play("aolun", 0)
        this.tipsTarget = this.getbodys(this.node, "tipsTarget")[0];
        this.getbodys(this.node, "tweenNode")[0].setScale(0, 0)
        cc.tween(this.getbodys(this.node, "tweenNode")[0]).to(1, { scaleX: 1, scaleY: 1 }).start();
    }
    tipsTarget: cc.Node
    onwin() {
        if (this.winCount >= 20) {
            GameData.PauseGame = true;
            cc.tween(this.gou)
                .to(1.3, { scaleX: 1, scaleY: 1 })
                .start()
            this.node.cleanup();
            this.scheduleOnce(() => {
                AudioManager.stopEffect()
                // AudioManager.playEffect(AudioManager.audioName.end);
                this.loadend();
                this.node.destroy();
            }, 2.5);
        }
    }
    mainMap
    IntBtn() {
        // this.offBtn();
        this.mainMap = this.moveMap.children[0]
        this.mainMap.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.mainMap.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    offBtn() {
        this.mainMap.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.mainMap.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        this.mainMap.x += e.getDeltaX();
        this.mainMap.y += e.getDeltaY();
        if (this.mainMap.x > 520) this.mainMap.x = 520;
        if (this.mainMap.x < -520) this.mainMap.x = -520;
        if (this.mainMap.y < -180) this.mainMap.y = -180;
        if (this.mainMap.y > 180) this.mainMap.y = 180;
    }
    onTouchEnd(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        // this.mainMap.setPosition(this.renStartPos)
    }
    showJZHZ(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        var child = event.currentTarget.children[0];
        if (!child.active) {
            child.active = true;
            if (child.name == "ani" || child.name == "01") {
                this.tipsTarget.active = false;
                this.winCount++;
                this.getbodys(this.node, "count")[0].getComponent(cc.Label).string = this.winCount + "/20";
                var musicName;
                var musicState;
                if (child.getComponent(cc.Animation)) {
                    switch (child.getComponent(cc.Animation).currentClip.name) {
                        case "aolun":
                            musicName = "奥伦";
                            musicState = "1234";
                            break;
                        case "bulaike":
                            musicName = "布莱克";
                            musicState = "13";
                            break;
                        case "bulude":
                            musicName = "布鲁德";
                            musicState = "1234";
                            break;
                        case "dashu":
                            musicName = "大树";
                            musicState = "13";
                            break;
                        case "depule":
                            musicName = "德普嘞";
                            musicState = "13";
                            break;
                        case "diannao":
                            musicName = "电脑先生";
                            musicState = "13";
                            break;
                        case "gelei":
                            musicName = "格雷";
                            musicState = "1234";
                            break;
                        case "jiqiren":
                            musicName = "机器人";
                            musicState = "1234";
                            break;
                        case "jianuode":
                            musicName = "加诺德";
                            musicState = "1234";
                            break;
                        case "jiewen":
                            musicName = "杰文";
                            musicState = "1234";
                            break;
                        case "kelake":
                            musicName = "克拉克";
                            musicState = "1234";
                            break;
                        case "laimu":
                            musicName = "莱姆";
                            musicState = "1234";
                            break;
                        case "pingji":
                            musicName = "平基";
                            musicState = "1";
                            break;
                        case "ruidi":
                            musicName = "瑞迪";
                            musicState = "1234";
                            break;
                        case "tanu":
                            musicName = "塔努";
                            musicState = "13";
                            break;
                        case "taiyang":
                            musicName = "太阳先生";
                            musicState = "1234";
                            break;
                        case "weiniliya":
                            musicName = "维尼里亚";
                            musicState = "1234";
                            break;
                        case "wenda":
                            musicName = "温达";
                            musicState = "1234";
                            break;
                        case "ximeng":
                            musicName = "西蒙";
                            musicState = "1234";
                            break;
                        case "xiaotian":
                            musicName = "小天";
                            musicState = "13";
                            break;
                    }
                    // var hand = () => {
                    //     AudioManager.playEffect(musicName, true);
                    // }
                    this.MusicHandler.push(musicName);
                    this.MusicState.push(musicState);
                }
            }
            AudioManager.playEffect(AudioManager.common.BUTTON);
            this.onwin();
        }
    }
    isStartMusic: boolean = false;
    MusicState: string[] = [];
    musicState = 1;
    update(dt: number): void {
        if (!this.isStartMusic) {
            if (this.MusicHandler.length != 0) {
                this.isStartMusic = true;
                for (let a = 0; a < this.MusicHandler.length; a++) {
                    AudioManager.playEffect(this.MusicHandler[a], false)
                }
                this.schedule(() => {
                    this.musicState++;
                    if (this.musicState > 4) this.musicState = 1;
                    if (this.MusicHandler.length != 0) {
                        for (let a = 0; a < this.MusicHandler.length; a++) {
                            if (this.MusicState[a].indexOf(this.musicState.toString()) != -1)
                                AudioManager.playEffect(this.MusicHandler[a], false)
                        }
                    }
                }, 4.8)
            }
        }
    }
    winCount = 0;
    // jihuiCount: number = 5;
    isshowVideo = false;
    MusicHandler = [];
    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "X":
                event.currentTarget.parent.active = false;
                break;
            case "jiacishu":
                VideoManager.getInstance().showVideo(() => {
                    // this.jihuiCount += 5;
                    // this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.jihuiCount;
                })
                break;
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
            case "tishi":
                var handlers = () => {
                    // // cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
                    // //     var HallnNode = cc.instantiate(tip);
                    // //     HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv5tip;
                    // //     HallnNode.parent = cc.find("Canvas");
                    // //     this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                    // this.isshowVideo = true;
                    // event.currentTarget.getChildByName("luxiang").active = false;
                    // VideoManager.getInstance().showInsert();
                    // // })
                    // this.node.getChildByName("bg").getChildByName("tipsPanel").active = true;
                    var bg1 = this.moveMap.children[0];
                    for (let a = 0; a < bg1.childrenCount; a++) {
                        if (bg1.children[a].children[0] && bg1.children[a].children[0].active == false) {
                            this.tipsTarget.active = true;
                            this.tipsTarget.angle = 0;
                            cc.tween(this.tipsTarget).to(20, { angle: 7200 }).start();
                            this.tipsTarget.setScale(15, 15);
                            cc.tween(this.tipsTarget).to(1, { scaleX: 1.5, scaleY: 1.5 }).start();
                            this.tipsTarget.x = bg1.children[a].x;
                            this.tipsTarget.y = bg1.children[a].y;
                            break;
                        }
                    }
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "queren":
                event.currentTarget.parent.parent.active = false;
                break;
            case "fssk_handler":
                // this.yingsk.active = false;
                // var icon = this.node.getChildByName("daoju3");
                // this.tweenState2(event, icon, "fenshen", () => {
                //     this.yingnode.active = false;
                // }, "zclv3_12");
                break;
        }
    }



    loadend() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");
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

    checkLost() {
        // if (this.jihuiCount <= 0) {
        //     // this.unschedule(this.Timeing);
        //     // GameData.PauseGame = true;
        //     // this.node.cleanup();
        //     // this.scheduleOnce(() => {
        //     //     this.endlost("prefabs/zc/zc_lostend")
        //     //     this.node.destroy();
        //     // }, 0.7);
        //     setTimeout(() => {
        //         this.endlost("prefabs/zc/endlostChance_zc");
        //     }, 600);
        // }
    }
    addChance() {
        VideoManager.getInstance().showVideo(() => {
            // this.jihuiCount += 5;
            // this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.jihuiCount;
        })
    }
    endAddTime() {
        // VideoManager.getInstance().showVideo(() => {
            this.startTime = 1;
            this.setTime(60);
        // })
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            // this.unschedule(this.Timeing);
            // GameData.PauseGame = true;
            // this.node.cleanup();
            // this.scheduleOnce(() => {
            //     this.endlost("prefabs/zc/zc_lostend")
            //     this.node.destroy();
            // }, 0.7);
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
    }
    protected onDestroy(): void {
        this.unschedule(this.Timeing);
        this.unscheduleAllCallbacks();
    }
}

