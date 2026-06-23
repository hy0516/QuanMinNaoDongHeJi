
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";
import zc_config from "../script/zc/zc_config";



const { ccclass, property } = cc._decorator;

@ccclass
export default class game_zc extends BaseGame {

    @property(cc.Node)
    xyj: cc.Node = null;

    @property(cc.Node)
    guizi: cc.Node = null;

    @property(cc.Node)
    zhanglang: cc.Node = null;

    @property(cc.Node)
    nan: cc.Node = null;

    @property(cc.Node)
    nan2: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    view: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    qipao: cc.Node = null;

    @property(cc.Node)
    qipao2: cc.Node = null;

    @property(cc.Node)
    jianpan: cc.Node = null;

    @property(cc.Node)
    tittle: cc.Node = null;


    @property(cc.Node)
    icon: cc.Node = null;


    public startTime = 120;

    public startX = 0;
    public endX = 0;
    public curTime = 0;

    onLoad() {
        GameData.PauseGame = false;
        this.guizi.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.guizi.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
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
    }
    onTouchStart(event: cc.Event.EventTouch) {
        this.startX = event.getLocationX();
        this.curTime = new Date().getTime();
    }



    private onTouchEnd(event: cc.Event.EventTouch): void {
        if (this.startX) {
            this.endX = event.getLocationX();
            let endtime = new Date().getTime() - this.curTime;
            if (this.startX > this.endX && endtime < 650) {
                var dir = this.startX - this.endX;
                if (dir > 30) {
                    GameData.PauseGame = true;
                    this.guizi.x -= 50;
                    AudioManager.playEffect(AudioManager.audioName.nuokaiguizi);
                    this.guizi.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
                    this.guizi.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
                    this.zhanglang.zIndex = 2;
                    let newY = this.zhanglang.position.y -= 130;
                    let pos2 = new cc.Vec3(this.zhanglang.position.x, newY, this.zhanglang.position.y);
                    cc.Tween.stopAllByTarget(this.zhanglang);
                    AudioManager.playEffect(AudioManager.audioName.zhanglang);
                    cc.tween(this.zhanglang)
                        .to(0.7, { position: pos2 })
                        .call(() => {
                            this.nan.active = false;
                            this.nan2.active = true;
                            GameData.PauseGame = false;
                            AudioManager.playEffect(AudioManager.audioName.jianjiao);
                        })
                        .start()
                }
            }
        }

    }

    getIcon(): cc.Node {
        let child: cc.Node[] = this.view.children;
        return child[GameData.getMap.length];
    }

    show_qp(name: string) {
        this.nan.getComponent(dragonBones.ArmatureDisplay).playAnimation("jianghua", 1);
        this.qipao.active = true;
        AudioManager.playEffect(name);
        this.qipao.getChildByName("qpLab").getComponent(cc.Label).string = zc_config.firest_qp[name];
    }

    close_qp() {
        this.nan.getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        this.qipao.active = false;
    }
    show_qp2() {
        if (GameData.getMap.length == this.view.childrenCount) {
            // GameData.PauseGame = true;
            this.qipao2.active = true;
            this.qipao2.getChildByName("qpLab").getComponent(cc.Label).string = zc_config.firest_qp["end"];
            AudioManager.stopEffect()
            AudioManager.playEffect(AudioManager.audioName.end);
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.loadend();
                this.node.destroy();
            }, 2);
        }
    }
    tweenState2(event: cc.Event.EventTouch, tar: cc.Node, name: string, handler?: Function) {
        if (GameData.PauseGame == true) return
        GameData.PauseGame = true;
        AudioManager.playEffect(AudioManager.audioName.find);
        this.show_qp(name);
        let endnode = this.getIcon();
        //@ts-ignore
        this.icon.position = this.node.convertToNodeSpaceAR(event.getLocation());
        this.icon.getComponent(cc.Sprite).spriteFrame = tar.getComponent(cc.Sprite).spriteFrame;
        this.icon.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("guang", 1);
        this.icon.active = true;
        handler && handler();
        cc.tween(this.icon)
            .to(0.5, { position: new cc.Vec3(0, 0), scale: 1.5 })
            .delay(0.7)
            .to(0.5, { position: endnode.position, scale: 0.6 })
            .call(() => {
                AssetManager.load(GameData.curGameStyle, zc_config.firest[name], cc.SpriteFrame, null, (img: cc.SpriteFrame) => {
                    // handler && handler();
                    endnode.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = img;
                    GameData.getMap.push(name);
                    cc.Tween.stopAllByTarget(this.icon);
                    this.icon.active = false;
                    this.close_qp();
                    GameData.PauseGame = false;
                    this.show_qp2();
                })
            })
            .start()
    }
    loadend() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");
    }

    jianpanClick(event) {
        this.nan2.zIndex = 20
        this.tweenState2(event, this.jianpan.getChildByName("state2"), "jianpan", () => {
            this.nan.active = true;
            this.nan2.active = false;
        })

    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "fanhui":
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallnNode = cc.instantiate(hall);
                    HallnNode.parent = cc.find("Canvas");
                    GameData.onDele();
                    this.node.destroy();
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "tishi":
                var handlers = () => {
                    cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
                        var HallnNode = cc.instantiate(tip);
                        HallnNode.getComponent(tipsPanel).curtipList = zc_config.firest_tip;
                        HallnNode.parent = cc.find("Canvas");
                        this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                        this.isshowVideo = true;
                    })
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
        }
    }
    isshowVideo = false;
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

    addTime() {
        if (this.startTime <= 0) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        this.setTime(60);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }


    xiyiji_butt1() {
        this.xyj.getChildByName("button1").active = false;
        this.xyj.getChildByName("button2").active = true;
        this.xyj.getChildByName("xyja").active = false;
        this.xyj.getChildByName("xyjb").active = true;
        AudioManager.playEffect(AudioManager.audioName.chatou);
    }
    xiyiji_butt2() {
        this.xyj.getChildByName("button1").active = false;
        this.xyj.getChildByName("button2").active = false;
        this.xyj.getChildByName("xyjb").active = false;
        this.xyj.getChildByName("xyjc").active = true;
        AudioManager.playEffect(AudioManager.audioName.openxyj);
    }
    xiyiji_butt3(event) {
        this.tweenState2(event, this.xyj.getChildByName("xyjc"), "xiyiji1");
        this.xyj.getChildByName("xyjc").active = false;
        this.xyj.getChildByName("xyjd").active = true;
    }
    // update (dt) {
    //     console.log(dt)
    // }
}

