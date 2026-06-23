
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import shjtq_lv322_move from "./shjtq_lv322_move";



const { ccclass, property } = cc._decorator;

@ccclass
export default class shjtq_lv322 extends BaseGame {

    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    public startTime = 180;
    public startX = 0;
    public endX = 0;
    public curTime = 0;


    bgNode: cc.Node;

    // canMove:boolean=true;
    isblxx: boolean = false;

    isblxx1: boolean = false;

    canjiaohu = true;
    catchCount = 0;
    isHard = false;
    canclose = true;
    globalSpeedMultiplier: number = 1.0;

    onLoad() {
        cc.game.setFrameRate(60);
        GameData.PauseGame = false;
        AudioManager.stopMusic();

        AudioManager.playMusic("bgmlv322", true, 0.5);

        cc.Tween.stopAllByTarget(this.tittle);

        this.bgNode = this.node.getChildByName(`bg`);

        this.gameStart();

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
    }


    gameStart() {

    }
    update(dt: number): void {

    }
    catchBtn(event: cc.Event.EventTouch) {
        if (!this.canjiaohu) return;
        this.bgNode.getChildByName(`zb`).active = false;
        // this.unschedule(this.Timeing);
        const enemNode = this.bgNode.getChildByName(`enemNode`);
        for (let index = 0; index < enemNode.childrenCount; index++) {
            const element = enemNode.children[index];
            if (!element.active) continue;
            if (Math.abs(element.x + element.children[0].x) < 30) {
                // this.canMove=false;
                element.setSiblingIndex(element.parent.children.length - 1);
                element.getComponent(shjtq_lv322_move).canwalk = false;
                this.bgNode.getChildByName(`tq_ske`).active = false;
                element.getComponent(dragonBones.ArmatureDisplay).timeScale = 1;
                element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`${element.name}`, 1);
                AudioManager.playEffect(`lache`);
                this.addOneTimeListener(element.getComponent(dragonBones.ArmatureDisplay), () => {


                    if (element.name == `8_tq` && !this.isblxx) {
                        element.y = 0;
                        let posX= element.x;
                        element.x = 0;
                        element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`8_da`, 1);
                        AudioManager.playEffect(`刀`);
                        this.addOneTimeListener(element.getComponent(dragonBones.ArmatureDisplay), () => {
                            element.y = 0;
                            element.x = posX;
                            this.isblxx = true;
                            this.bgNode.getChildByName(`tq_ske`).active = true;
                            this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sz`, 0);
                            //   this.canMove=true;
                            this.bgNode.getChildByName(`zb`).active = true;
                            element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`8_zl`, 0);
                            element.getComponent(shjtq_lv322_move).canwalk = true;
                            element.x = element.getComponent(shjtq_lv322_move).tempX;
                            element.getComponent(dragonBones.ArmatureDisplay).timeScale = 1.5;
                            //  this.schedule(this.Timeing, 1);
                        })
                    }
                    else if (element.name == `9_tq` && !this.isblxx1) {
                        element.y = 0;
                        let posX= element.x;
                        element.x = 0;
                        element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`9_da`, 1);
                        AudioManager.playEffect(`枪声`);
                        this.addOneTimeListener(element.getComponent(dragonBones.ArmatureDisplay), () => {
                            element.y = 0;
                            element.x = posX;
                            this.isblxx1 = true;
                            this.bgNode.getChildByName(`tq_ske`).active = true;
                            this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sz`, 0);
                            //   this.canMove=true;
                            this.bgNode.getChildByName(`zb`).active = true;
                            element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`9_zl`, 0);
                            element.getComponent(shjtq_lv322_move).canwalk = true;
                            element.x = element.getComponent(shjtq_lv322_move).tempX;
                            element.getComponent(dragonBones.ArmatureDisplay).timeScale = 1.5;
                            //  this.schedule(this.Timeing, 1);
                        })
                    } 
                    else {
                        this.unschedule(this.Timeing);
                        element.active = false;
                        this.canclose = false;
                        this.bgNode.getChildByName(`jiesuanbg`).active = true;
                        this.bgNode.getChildByName(`showSk`).active = true;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].getComponent(cc.Label).string = `0123456789`;
                        for (let index = 0; index < this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).childrenCount; index++) {
                            const element1 = this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).children[index];
                            element1.active = false;
                        }
                        this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).getChildByName(`${element.name}`).active = true;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].scale = 0;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`tq_ske`).scale = 0;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay)
                            .playAnimation(`${this.getPrefixBeforeTQ(element.name)}dj`, 0);
                        cc.tween(this.bgNode.getChildByName(`showSk`).getChildByName(`tq_ske`)).to(0.5, { scale: 1 }).call(() => {
                            this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].getComponent(cc.Label).string = this.getEnemZDL(element.name);
                            this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].scale = 10
                            cc.tween(this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0]).to(0.3, { scale: 1 }).call(() => {
                                this.canclose = true;
                            }).start();
                            AudioManager.playEffect(`sztc`);
                        }).start();
                        this.catchCount++;
                        this.bgNode.getChildByName(`nodeCount`).getComponent(cc.Label).string = `进度:${this.catchCount}/10`;

                    }

                })
                return;
            }
        }
        this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sz_tk`, 1);
        AudioManager.playEffect(`taokong`);
        this.addOneTimeListener(this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay), () => {
            this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sz`, 0);
            //   this.canMove=true;
            this.bgNode.getChildByName(`zb`).active = true;
            //  this.schedule(this.Timeing, 1);
        })
    }
    closeJieSuan() {
        if (!this.canclose) return;
        const enemNode = this.bgNode.getChildByName(`enemNode`);
        this.bgNode.getChildByName(`enemNode`)
        for (let index = 0; index < enemNode.childrenCount; index++) {
            const element = enemNode.children[index];
            if (!element.active)
                continue;
            else {
                if (this.catchCount == 3) {
                    this.bgNode.getChildByName(`jiesuanbg`).active = false;
                    this.bgNode.getChildByName(`showSk`).active = false;
                    this.bgNode.getChildByName(`tq_ske`).active = true;


                    this.bgNode.getChildByName(`ndbs_ske`).active = true;
                    this.bgNode.getChildByName(`ndbs_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`jg`, 1);
                    AudioManager.playEffect(`ndbs`);
                    this.addOneTimeListener(this.bgNode.getChildByName(`ndbs_ske`).getComponent(dragonBones.ArmatureDisplay), () => {
                        this.isHard = true;
                        this.bgNode.getChildByName(`jiansu`).active = true;
                        this.bgNode.getChildByName(`ndbs_ske`).active = false;
                        this.schedule(this.Timeing, 1);
                        this.bgNode.getChildByName(`zb`).active = true;
                    })
                    return;
                }
                this.bgNode.getChildByName(`jiesuanbg`).active = false;
                this.bgNode.getChildByName(`showSk`).active = false;
                //  this.canMove=true;
                this.bgNode.getChildByName(`tq_ske`).active = true;
                this.bgNode.getChildByName(`zb`).active = true;
                this.schedule(this.Timeing, 1);
                return;
            }

        }
        this.onwin();


    }
    getPrefixBeforeTQ(s: string): string {
        const lastTqIndex = s.lastIndexOf('tq');
        return lastTqIndex !== -1 ? s.slice(0, lastTqIndex) : '';
    }
    getEnemZDL(name: string) {
        AudioManager.playEffect(`套中`);
        switch (name) {
            case `0_tq`:
                return `50000000`;
            case `1_tq`:
                return `150000`;
            case `2_tq`:
                return `150000`;
            case `3_tq`:
                return `5`;
            case `4_tq`:
                return `9999999999999999`;
            case `5_tq`:
                return `50000000`;
            case `6_tq`:
                return `5`;
            case `7_tq`:
                return `150000`;
            case `8_tq`:
                return `50000000`;
            case `9_tq`:
                return `50000000000`;
        }

        return `null`;
    }
    BtnHandler(event: cc.Event.EventTouch) {

        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     this.havefindList = [];
                //     this.node.destroy();
                //     VideoManager.getInstance().showCustomNativeAd();
                // })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "jiansu":

                VideoManager.getInstance().showVideo(() => {

                    this.globalSpeedMultiplier = Math.max(0.3, this.globalSpeedMultiplier - 0.2);

                })
                break;
            case "tishi":
                var handlers = () => {
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                    //    
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case `x`:
                this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = false;
                break;
            case `ch`:
                event.currentTarget.active = false;
                break;
        }
    }

    isshowVideo = false;

    endlost(name: string) {
        cc.resources.load(name, cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            UINode.opacity = 0;
            cc.tween(UINode)
                .to(0.8, { opacity: 255 })
                .start()
        })
    }
    onwin() {
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
        return
        // var fun = () => {
        //     this.endwin("prefabs/zc/zc_winend");
        //     GameData.PauseGame = false;
        //     return
        // }
        // this.gou.cleanup();
        // cc.tween(this.gou)
        //     .to(1.3, { scaleX: 1, scaleY: 1 })
        //     .delay(1.3)
        //     .call(fun)
        //     .start()
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("finishjq");
        // }, 0.9)
    }




    talkdiplayTeshu(talkaudio: string, talkthing: string, handler?: Function) {

        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string = talkthing;
        talk.opacity = 255;
        AudioManager.playEffect(talkaudio, false, () => {
            talk.opacity = 0;
            handler && handler();
        })
    }
    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
                //this.node.destroy();
            }, 0.7);
        }
    }
    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString() + `s`;
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
    endAddTime() {

        this.startTime = 1;
        this.setTime(60);
        this.schedule(this.Timeing, 1)
        //})
    }

}



