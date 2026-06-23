
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_wz from "./item_wz";
import wenzi_config from "./wenzi_config";



const { ccclass, property } = cc._decorator;

@ccclass
export default class game_wenzi extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Prefab)
    item: cc.Prefab = null;
    // @property(cc.Node)
    // tittle: cc.Node = null;

    public curItemList: string[] = [];
    public curItemLab: string = "";
    public iscuowu = false;
    public okList: item_wz[] = [];
    public curTime = 0;
    public curId = 0;
    public cuowutime = 0

    onLoad() {
        GameData.PauseGame = false;
        for (let i = 0; i < wenzi_config.level1.mapdata.length; i++) {
            for (let j = 0; j < wenzi_config.level1.mapdata[i].length; j++) {
                var data = wenzi_config.level1.mapdata[i][j];
                var item = cc.instantiate(this.item);
                item.getComponent(item_wz).oninit(data);
                item.parent = this.content;
            }
        }
        GameData.startTime = 90;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        // AudioManager.playMusic(AudioManager.wenzi.main_wz, true, 1);
        AudioManager.stopMusic();
        this.content.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.content.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.content.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)

        // cc.Tween.stopAllByTarget(this.tittle);
        // cc.tween(this.tittle)
        //     .repeat(2,
        //         cc.tween()
        //             .to(0.1, { angle: 7 })
        //             .to(0.1, { angle: 0 })
        //             .to(0.1, { angle: -7 })
        //             .to(0.1, { angle: 0 })
        //             .delay(0.2)
        //     )
        //     .start()

    }
    onTouchStart() {
        var time = new Date().getTime();
        this.curTime = time;
        this.curItemLab = "";
        this.curItemList = [];
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (this.iscuowu) return;
        var childlist = this.content.children;
        for (let i = 0; i < childlist.length; i++) {
            var childitem = childlist[i];
            if (childitem.getBoundingBox().contains(this.content.convertToNodeSpaceAR(event.getLocation()))) {
                var thing = childitem.getComponent(item_wz);
                if (thing.isset) continue;
                if (this.curId) thing.setid(this.curId);
                this.okList[this.okList.length] = thing;
                // console.log(this.okList)
                if (this.curItemList.length == 0) {
                    this.curItemList[this.curItemList.length] = thing.data;
                    this.curItemLab = thing.lab;
                    this.curId = thing.id;
                    thing.setid(this.curId);
                }
            }
        }
    }

    checkAnswerd(list: string) {
        if (wenzi_config.levelanswerd.indexOf(list) != -1) {
            GameData.wenziWinNum++;
            AudioManager.playEffect(AudioManager.wenzi.levelSound[this.curId - 1]);
            // console.log(GameData.wenziWinNum);
            if (GameData.wenziWinNum == wenzi_config.levelanswerd.length) {
                // console.log("赢了");
                GameData.PauseGame = true;
                // this.scheduleOnce(() => {
                this.unschedule(this.Timeing)
                this.loadend();
                // }, 0.5);
            }
        }
        this.curId = 0;
        this.curItemLab = "";
        this.curItemList = [];
        this.okList = [];
    }

    cuowu() {
        var time = new Date().getTime();
        if (time - this.cuowutime < 100) return;
        if (this.iscuowu) return
        this.iscuowu = true;
        AudioManager.playEffect(AudioManager.wenzi.lineLost);
        setTimeout(() => {
            for (let index = 0; index < this.okList.length; index++) {
                var rething = this.okList[index];
                if (!rething.issucc) {
                    rething.recive(this.curId);
                }
            }
            this.curItemLab = "";
            this.curItemList = [];
            this.curId = 0;
            this.addTime(null, -5);
            this.okList = [];
            this.iscuowu = false;
        }, 5);
    }

    onTouchEnd() {
        var list = ""
        for (let i = 0; i < this.okList.length; i++) {
            var item = this.okList[i];
            if (list != "") {
                // console.log(this.okList[i - 1].shunxu)
                if (this.okList[i - 1].id == this.okList[i].id && this.okList[i - 1].shunxu + 1 == this.okList[i].shunxu) {
                    list = list + item.lab;
                } else {
                    this.cuowu();
                    return
                }
            } else {
                list = list + item.lab;
            }
        }

        // console.log(list)
        if (wenzi_config.levelanswerd.indexOf(list) == -1) {
            this.cuowu();
        } else {
            GameData.getMap.push(this.okList[0].id);
            this.checkAnswerd(list);

        }
    }
    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.node.cleanup();
                AudioManager.playEffect(AudioManager.wenzi.button_wz);
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = cc.find("Canvas");
                    GameData.onDele();
                    this.node.destroy();
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "btn_addTime":
                VideoManager.getInstance().showVideo(() => { this.addTime(null, 60); })

                break;
            case "btn_tips":
                AudioManager.playEffect(AudioManager.wenzi.button_wz);
                var handlers = () => {
                    AssetManager.load(GameData.curGameStyle, "TipPanel_wz", cc.Prefab, null, (name: cc.Prefab) => {
                        // cc.resources.load("prefabs/wenzi/TipPanel_wz", cc.Prefab, (err, UI: cc.Prefab) => {
                        var UINode = cc.instantiate(name);
                        UINode.parent = cc.find("Canvas");
                        this.node.getChildByName("btn_tips").getChildByName("luxiang").active = false;
                        this.isshowVideo = true;
                    })
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
        }
    }
    isshowVideo = false;
    loadend() {
        // this.node.getChildByName("endlost_wz").active = true;
        //     //  return
        // GameData.PauseGame = true;
        AudioManager.playEffect(AudioManager.audioName.endwin);
        AssetManager.load(GameData.curGameStyle, "endwin_wz", cc.Prefab, null, (name: cc.Prefab) => {
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





    addTime(even: TouchEvent, time?: number) {
        AudioManager.playEffect(AudioManager.wenzi.button_wz);
        // GameData.PauseGame = true;
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
        AudioManager.playEffect(AudioManager.wenzi.button_wz);
        // GameData.PauseGame = false;
        // this.unschedule(this.Timeing);
        this.addTime(null, 100);
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            GameData.PauseGame = true;
            this.unschedule(this.Timeing)
            this.scheduleOnce(() => {
                // this.loadend();
                AssetManager.load(GameData.curGameStyle, "endlost_wz", cc.Prefab, null, (name: cc.Prefab) => {
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

            }, 0.7);
        }
    }



    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
            // this.node.getChildByName("endlost_wz").active = false;
        })
    }


}

