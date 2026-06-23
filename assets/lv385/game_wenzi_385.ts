
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_wz_385 from "./item_wz_385";
import wenzi_config_385 from "./wenzi_config_385";



const { ccclass, property } = cc._decorator;

@ccclass
export default class game_wenzi_385 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    tipsPanel: cc.Node = null;

    @property(cc.Prefab)
    item: cc.Prefab = null;
    // @property(cc.Node)
    // tittle: cc.Node = null;
    @property(cc.Node)
    video: cc.Node = null;

    public curItemList: string[] = [];
    public curItemLab: string = "";
    public iscuowu = false;
    public okList: item_wz_385[] = [];
    public curTime = 0;
    public curId = 0;
    public cuowutime = 0;

    cha: cc.Node;
    onLoad() {
        GameData.PauseGame = false;
        for (let i = 0; i < wenzi_config_385.level1.mapdata.length; i++) {
            for (let j = 0; j < wenzi_config_385.level1.mapdata[i].length; j++) {
                var data = wenzi_config_385.level1.mapdata[i][j];
                var item = cc.instantiate(this.item);
                item.getComponent(item_wz_385).oninit(data);
                item.parent = this.content;
            }
        }
        GameData.startTime = 90;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        // AudioManager.playMusic(AudioManager.wenzi.main_wz, true, 1);
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv385`);
        }, 0.5);
        AudioManager.stopMusic();
        this.content.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.content.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.content.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)


        this.cha = this.node.getChildByName("g2");

        this.scheduleOnce(() => {
        }, 0.5);

    }


    /**打叉 */
    dacha() {
        this.iscuowu = true;
        cc.tween(this.cha)
            .to(0.4, { opacity: 255 })
            .delay(0.2)
            .to(0.4, { opacity: 0 })
            .call(() => {
                this.iscuowu = false;
            })
            .start();
    }

    //#region  触摸事件
    onTouchStart() {

        var time = new Date().getTime();
        this.curTime = time;
        this.curItemLab = "";
        this.curItemList = [];

    }

    audioLock = true;
    onTouchMove(event: cc.Event.EventTouch) {
        if (this.iscuowu) return;
        var childlist = this.content.children;
        for (let i = 0; i < childlist.length; i++) {
            var childitem = childlist[i];
            if (childitem.getBoundingBox().contains(this.content.convertToNodeSpaceAR(event.getLocation()))) {
                var thing = childitem.getComponent(item_wz_385);
                if (thing.isset) continue;
                AudioManager.playEffect("键盘点击声_385");
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
        if (wenzi_config_385.levelanswerd.indexOf(list) != -1) {
            GameData.wenziWinNum++;
            AudioManager.playEffect(wenzi_config_385.levelSound[this.curId - 1]);
            // console.log(GameData.wenziWinNum);
            if (GameData.wenziWinNum == wenzi_config_385.levelanswerd.length) {
                // console.log("赢了");
                GameData.PauseGame = true;
                // this.scheduleOnce(() => {
                this.unschedule(this.Timeing);

                //等待音乐结束
                // this.scheduleOnce(()=>{
                // let bm = this.node.getChildByName("bm");
                // cc.tween(bm)
                // .to(0.2,{opacity:255})
                // .delay(0.5)
                // .call(()=>{
                //     this.video.active = true;
                // AudioManager.playEffect(`彩蛋`);
                this.scheduleOnce(() => {
                    this.onwin();
                }, 2.5)
                // })
                // .to(0.5,{opacity:150})
                // .start();
                // },1)
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
        if (this.iscuowu || GameData.PauseGame == true) return
        this.iscuowu = true;
        AudioManager.playEffect(wenzi_config_385.lineLost);
        this.dacha();
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
        if (wenzi_config_385.levelanswerd.indexOf(list) == -1) {
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
            case "btn_addTime":
                VideoManager.getInstance().showVideo(() => { this.addTime(null, 60); })

                break;
            case "btn_tips":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                var handlers = () => {

                    this.tipsPanel.active = true;
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;

            case "x":
                this.tipsPanel.active = false;
                break;
        }
    }
    isshowVideo = false;


    addTime(even: TouchEvent, time?: number) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
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
        AudioManager.playEffect(AudioManager.common.BUTTON);
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
                AssetManager.load(GameData.curGameStyle, "endlost_wz_385", cc.Prefab, null, (name: cc.Prefab) => {
                    var endNode = cc.instantiate(name);
                    endNode.parent = cc.find("Canvas");
                    endNode.opacity = 0;
                    cc.tween(endNode)
                        .to(0.8, { opacity: 255 })
                        .call(() => {
                        })
                        .start()
                })

            }, 0.7);
        }
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
        });
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

