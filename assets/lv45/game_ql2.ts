
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import ql_config2 from "./ql_config2";
import qlitem_move2 from "./qlitem_move2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class game_ql2 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    @property(cc.Prefab)
    item: cc.Prefab = null;

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    page: cc.Node = null;



    public curTime = 0;
    public LevelId: number = 3;

    pagething: cc.PageView;

    onLoad() {
        console.log(this.LevelId);
        GameData.PauseGame = false;
        // for (let i = 0; i < ql_config2.item_data.length; i++) {
        //     var data = ql_config2.item_data[i];
        //     var item = this.content.children;
        //     item[0].getComponent(qlitem_move2).oninit(data);
        // }
        GameData.startTime = 75;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        // AudioManager.stopMusic();
        for (var s in this.itemList) {
            GameData._itemList[this.itemList[s].name] = this.itemList[s];
        }
        var list = this.page.getChildByName("itemlist")
        for (let i = 0; i < list.childrenCount; i++) {
            GameData.ql[list.children[i].name] = i;
        }
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
        this.pagething = this.page.getComponent(cc.PageView);
    }

    getNextScrNum(name: string) {
        GameData.PauseGame = false;
        this.page.getComponent(cc.PageView).enabled = true;
        var curnum = GameData.ql[name];
        var list = this.page.getChildByName("itemlist")
        GameData.getMap.push(curnum);
        if (GameData.getMap.length == list.childrenCount) {
            this.endwin();
            return
        }
        // console.log(GameData.ql.length)
        if (curnum !== list.childrenCount - 1) {
            if (GameData.getMap.indexOf(curnum + 1) == -1) {
                this.pagething.scrollToPage(curnum + 1, 0.8);

            }
        } else {
            for (let s in GameData.ql) {
                if (GameData.getMap.indexOf(GameData.ql[s]) == -1) {
                    this.pagething.scrollToPage(GameData.ql[s], 0.8);
                    return;
                }
            }
        }

    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch, handler): void {
        GameData.PauseGame = true;
        this.page.getComponent(cc.PageView).enabled = false;
        var state1 = tar.getChildByName("state1");
        var state2 = tar.getChildByName("state2");
        var state3 = tar.getChildByName("state3");
        var state4 = tar.getChildByName("state4");
        var gou = tar.getChildByName("gou");
        AudioManager.playEffect(AudioManager.ql_audio.dui);
        switch (type) {
            case 0:
                var icon = tar.getChildByName("tweenIcon");
                var tweentarget = tar.getChildByName("tweenTarget");
                var start = icon.position;
                icon.active = true;
                var next = (() => {
                    state1.active = false;
                    if (state2) state2.active = true;
                    AudioManager.playEffect(AudioManager.ql_audio.pba);
                })
                cc.Tween.stopAllByTarget(icon);
                cc.tween(icon)
                    .to(0.8, { position: tweentarget.position })
                    .call(() => {
                        icon.active = false;
                        icon.position = start
                        next();
                        this.page.getComponent(cc.PageView).enabled = true;
                    })
                    .start();
                handler && handler(0);
                break;
            case 1:
                if (state1.active) {
                    handler && handler(1);
                    return
                }
                state1.active = false;
                gou.active = true;
                gou.scale = 0;
                var icon = tar.getChildByName("tweenIcon");
                var tweentarget = tar.getChildByName("tweenTarget");
                cc.Tween.stopAllByTarget(gou);
                handler && handler(0);
                cc.tween(gou)
                    .delay(1.5)
                    .to(0.7, { scale: 1 })
                    .delay(0.5)
                    .call(() => {
                        this.getNextScrNum(tar.name)
                    })
                    .start()
                cc.Tween.stopAllByTarget(icon);
                icon.getComponent(cc.Sprite).spriteFrame = even.currentTarget.getChildByName("icon").getComponent(cc.Sprite).spriteFrame;
                icon.active = true;
                cc.tween(icon)
                    // .delay(0.6)
                    .to(0.8, { position: tweentarget.position })
                    .call(() => {
                        icon.active = false;
                        if (state2) state2.active = false;
                        if (state3) state3.active = true;
                        AudioManager.playEffect(AudioManager.ql_audio.finishjq)
                    })
                    .start()

                break;
            case 2:
                var icon = tar.getChildByName("tweenIcon");
                var start = icon.position;
                var tweentarget = tar.getChildByName("tweenTarget");
                icon.active = true;
                cc.Tween.stopAllByTarget(icon);
                handler && handler(0);
                cc.tween(icon)
                    .to(0.8, { position: tweentarget.position })
                    .delay(0.5)
                    .call(() => {
                        state1.active = false;
                        if (state2) state2.active = true;
                        icon.active = false;
                        icon.position = start;
                        this.page.getComponent(cc.PageView).enabled = true;
                    })
                    .start()
                break;

            case 3:
                if (state1.active) {
                    handler && handler(1);
                    return
                }
                var icon = tar.getChildByName("tweenIcon");
                var start = icon.position;
                gou.active = true;
                gou.scale = 0;
                handler && handler(0);
                if (state2) state2.active = false;
                if (state3) state3.active = true;
                cc.Tween.stopAllByTarget(gou);
                cc.tween(gou)
                    .delay(1)
                    .to(0.7, { scale: 1 })
                    .delay(0.8)
                    .call(() => {
                        this.getNextScrNum(tar.name)
                    })
                    .start()
                icon.getComponent(cc.Sprite).spriteFrame = even.currentTarget.getChildByName("icon").getComponent(cc.Sprite).spriteFrame;
                icon.active = true;
                cc.tween(icon)
                    .to(0.3, { scaleX: 1.2, scaleY: 1.2 })
                    .to(0.3, { scaleX: 1, scaleY: 1 })
                    .call(() => {
                        icon.active = false;
                    })
                    .start()
                this.scheduleOnce(() => {
                    if (state3) state3.active = false;
                    if (state4) state4.active = true;
                    AudioManager.playEffect(AudioManager.ql_audio.finishjq)
                }, 0.8)
                break;
            case 5:
            case 7:
            case 8:
                var icon = tar.getChildByName("tweenIcon");
                var tweentarget = tar.getChildByName("tweenTarget");
                icon.active = true;
                cc.Tween.stopAllByTarget(icon);
                handler && handler(0);
                cc.tween(icon)
                    .to(0.8, { position: tweentarget.position })
                    .delay(0.5)
                    .call(() => {
                        state1.active = false;
                        if (state2) state2.active = true;
                        icon.active = false;
                        gou.active = true;
                        gou.scale = 0;
                    })
                    .start()
                cc.Tween.stopAllByTarget(gou);
                cc.tween(gou)
                    .delay(1.5)
                    .to(0.7, { scale: 1 })
                    .delay(0.6)
                    .call(() => {
                        this.getNextScrNum(tar.name)
                    })
                    .start()
                this.scheduleOnce(() => {
                    AudioManager.playEffect(AudioManager.ql_audio.finishjq)
                }, 1.7)
                break;
            case 4:
            case 6:
                var icon = tar.getChildByName("tweenIcon");
                var tweentarget = tar.getChildByName("tweenTarget");
                icon.active = true;
                handler && handler(0);
                cc.Tween.stopAllByTarget(icon);
                cc.tween(icon)
                    .to(0.8, { position: tweentarget.position })
                    .delay(0.2)
                    .call(() => {
                        state1.active = false;
                        if (state2) state2.active = true;
                        icon.active = false;
                        gou.active = true;
                        gou.scale = 0;
                    })
                    .start()
                cc.Tween.stopAllByTarget(gou);
                cc.tween(gou)
                    .delay(2.5)
                    .to(0.5, { scale: 1 })
                    .delay(0.5)
                    .call(() => {
                        this.getNextScrNum(tar.name)
                    })
                    .start()
                this.scheduleOnce(() => {
                    if (state2) state2.active = false;
                    if (state3) state3.active = true;
                    AudioManager.playEffect(AudioManager.ql_audio.finishjq)
                }, 2)
                break;
        }
    }


    endwin() {
        this.unschedule(this.Timeing);
        GameData.PauseGame = true;
        this.node.cleanup()
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hzAudioPath);
        AssetManager.load(GameData.curGameStyle, "endwin_ql", cc.Prefab, null, (name: cc.Prefab) => {
            var endNode = cc.instantiate(name);
            endNode.parent = cc.find("Canvas");
            endNode.opacity = 0;
            cc.tween(endNode)
                .to(0.8, { opacity: 255 })
                .call(() => {
                    if (this.node) this.node.destroy();
                })
                .start()
        })

    }

    showTip() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        var handlers = () => {
            AssetManager.load(GameData.curGameStyle, "TipPanel_ql", cc.Prefab, null, (name: cc.Prefab) => {
                var UINode = cc.instantiate(name);
                UINode.parent = cc.find("Canvas");
                this.node.getChildByName("btn_tips").getChildByName("luxiang").active = false;
                this.isshowVideo = true;
                VideoManager.getInstance().showInsert();
            })
        }
        this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
    }
    isshowVideo = false;

    fanhui() {
        super.fanhui();
    }

    btn_addtime() {
        VideoManager.getInstance().showVideo(() => { this.addTime(null, 60); })
    }

    addTime(even: TouchEvent, time?: number) {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        if (GameData.startTime + time <= 0) return
        var addtime
        time ? addtime = time : addtime = 60;
        GameData.startTime += addtime;
        this.Timeing();
        var fuhao = "";
        if (addtime > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
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
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.addTime(null, 100)
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            GameData.PauseGame = true;
            // this.node.cleanup()
            this.unschedule(this.Timeing)
            this.scheduleOnce(() => {
                AssetManager.load(GameData.curGameStyle, "endlost_ql", cc.Prefab, null, (ui: cc.Prefab) => {
                    var UINode = cc.instantiate(ui);
                    UINode.parent = cc.find("Canvas");
                    UINode.opacity = 0;
                    cc.tween(UINode)
                        .to(0.8, { opacity: 255 })
                        .start()
                });
            }, 0.7);
        }
    }

    restart() {
        super.restart();
    }


}

