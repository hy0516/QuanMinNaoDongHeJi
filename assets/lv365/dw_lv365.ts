
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems_365 from "./moveItems_365";



const { ccclass, property } = cc._decorator;

@ccclass
export default class dw_lv365 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList: cc.Node[] = [];

    stringList: { [key: string]: string } = {
        "nai": "一边洗衣服一边遛狗|一边洗衣服一边遛狗",
        "book": "别跳床就好|别跳床就好",
        "xiaotou": "狗子别叫!我带你回新家!|狗子别叫我带你回新家",
        "tv": "是表哥吗?|是表哥吗",
        "nvhai": "哇!小狗！|哇小狗",
        "photo": "我的大刀早已饥渴难耐|我的大刀早已饥渴难耐",
        "mao": "汪?这是我的粉丝?|汪这是我的粉丝",
        "yeye": "小狗比新闻有意思|小狗比新闻有意思",
        "nan": "这狗比队友靠谱|这狗比队友靠谱",
        "kuaidi": "这狗超重了,得加运费|这狗超重了得加运费",
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    _itemList = [];

    PB: cc.Node;
    lab_pb: cc.Node;

    public curTime = 0;
    public winnum = 0;

    private bgNode: cc.Node = null;
    private windowNode: cc.Node = null;
    private doorNode: cc.Node = null;
    private isWindowHidden = false;
    private isDoorOpened = false;
    private doorTouchStartX = 0;

    onLoad() {
        GameData.PauseGame = false;
        GameData.startTime = 120;
        this._itemList = this.itemList;
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景_365", true, 0.7);
        }, 0.5)
        this.bgNode = this.node.getChildByName("bg");
        this.windowNode = this.bgNode.getChildByName("窗户");
        this.doorNode = this.bgNode.getChildByName("门");
        this.initWindowAndDoorEvent();
        // AudioManager.playEffect("hz4_12");
        // this.showPB("这么多钱，花不完根本花不完");
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
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
        var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
        for (let i = 0; i < this._itemList.length; i++) {
            var item = this._itemList[i];
            if (item.getBoundingBox().contains(poi)) {
                if (item.name == "xiaotou" && !this.isWindowHidden) {
                    this.restartMoveItem(even);
                    return;
                }
                if (item.name == "kuaidi" && !this.isDoorOpened) {
                    this.restartMoveItem(even);
                    return;
                }
                even.currentTarget.destroy();
                item.getChildByName("state1").active = false;
                item.getChildByName("state2").active = true;
                var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                // @ts-ignore
                yansk.position = poi
                yansk.active = true;
                yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                var lab = this.stringList[item.name].split("|");
                var onPbComplete = null;
                if (item.name == "xiaotou") {
                    onPbComplete = () => {
                        if (item && item.isValid) {
                            item.active = false;
                        }
                    };
                }
                this.showPB(lab[0], onPbComplete);
                // AudioManager.playEffect("hz4_11");
                AudioManager.playEffect(lab[1]);
                this._itemList.splice(i, 1)
                this.winnum++;
                break;
            }
            if (i == this._itemList.length - 1) {
                this.restartMoveItem(even);
            }
        }
    }

    private restartMoveItem(even: cc.Event.EventTouch) {
        if (!even || !even.currentTarget) return;
        var moveCom = even.currentTarget.getComponent(moveItems_365) as any;
        if (moveCom && moveCom.restart) {
            moveCom.restart();
        }
    }

    private initWindowAndDoorEvent() {
        if (this.windowNode) {
            this.windowNode.on(cc.Node.EventType.TOUCH_END, this.hideWindow, this);
        }
        if (this.doorNode) {
            this.doorNode.on(cc.Node.EventType.TOUCH_START, this.onDoorTouchStart, this);
            this.doorNode.on(cc.Node.EventType.TOUCH_MOVE, this.onDoorTouchMove, this);
            this.doorNode.on(cc.Node.EventType.TOUCH_END, this.onDoorTouchEnd, this);
            this.doorNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onDoorTouchEnd, this);
        }
    }

    private hideWindow() {
        if (!this.windowNode || this.isWindowHidden) return;
        AudioManager.playEffect("开窗");
        this.windowNode.active = false;
        this.isWindowHidden = true;
    }

    private onDoorTouchStart(even: cc.Event.EventTouch) {
        this.doorTouchStartX = even.getLocationX();
    }

    private onDoorTouchMove(even: cc.Event.EventTouch) {
        if (!this.doorNode || this.isDoorOpened) return;
        if (even.getLocationX() - this.doorTouchStartX > 30) {
            this.openDoor();
        }
    }

    private onDoorTouchEnd() {
        this.doorTouchStartX = 0;
    }

    private openDoor() {
        if (!this.doorNode || this.isDoorOpened) return;
        this.isDoorOpened = true;
        AudioManager.playEffect("开门");
        // cc.Tween.stopAllByTarget(this.doorNode);
        // var x = this.doorNode.x;
        // cc.tween(this.doorNode)
        //     .to(0.3, { x: x + this.doorNode.width })
        //     .call(() => {
        //         if (this.doorNode) 
        this.doorNode.active = false;
        // })
        // .start();
    }

    showPB(lab: string, onComplete?: Function) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                if (this._itemList.length == 0) {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/hz/endwin_hz");
                        this.node.destroy();
                    }, 1.8)
                }
            })
            .start()
    }
    hiodePB() {

    }

    hidetips() {
        this.node.getChildByName("tipsNode").active = false;
    }
    showTip() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);

        // if (this.isshowVideo) {
        //     this.node.getChildByName("tipsNode").active = true;
        //     this.isshowVideo = true;
        //     VideoManager.getInstance().showInsert();
        // } else {
        VideoManager.getInstance().showVideo(() => {
            this.node.getChildByName("tipsNode").active = true;
            this.node.getChildByName("bg").getChildByName("bg2").getChildByName("btn_tips").getChildByName("luxiang").active = false;
            this.isshowVideo = true;
            VideoManager.getInstance().showInsert();
        })
        // }
    }

    isshowVideo = false;
    fanhui() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showBaoXiang();
        })

    }

    openpause() {
        this.openpausePanel();
    }


    addTime(even: TouchEvent, time?: number) {
        if (GameData.startTime + time <= 0) return

        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // GameData.PauseGame = true;
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
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            this.unschedule(this.Timeing);
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
    }

    onDestroy() {
        if (this.windowNode) {
            this.windowNode.off(cc.Node.EventType.TOUCH_END, this.hideWindow, this);
        }
        if (this.doorNode) {
            this.doorNode.off(cc.Node.EventType.TOUCH_START, this.onDoorTouchStart, this);
            this.doorNode.off(cc.Node.EventType.TOUCH_MOVE, this.onDoorTouchMove, this);
            this.doorNode.off(cc.Node.EventType.TOUCH_END, this.onDoorTouchEnd, this);
            this.doorNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onDoorTouchEnd, this);
        }
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

