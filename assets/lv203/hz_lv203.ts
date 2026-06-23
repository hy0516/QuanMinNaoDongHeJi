
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems2 from "../script/common/moveItems2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class hz_lv203 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList1: cc.Node[] = [];

    @property(cc.Node)
    public itemList2: cc.Node[] = [];

    stringList1: { [key: string]: string } = {
        "zhuo": "安排顿精致的大餐|hz203_6",
        "po": "等离子电视也安排上|hz203_7",
        "qiang": "全屋改造一下|hz203_8",
        "chuang": "窗户也要升级一下|hz203_9",
        "huo": "入手一个冷暖两用型的|hz203_10",
    };

    stringList2: { [key: string]: string } = {
        "nv": "我重返青春了|hz203_1",
        "gui": "老木棍回来了|hz203_2",
        "sha": "Tralala也成年了|hz203_3",
        "nan": "老木棍也年轻了|hz203_4",
        "jian": "通关|hz203_5",
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    _itemList1 = [];
    _itemList2 = [];


    PB: cc.Node;
    lab_pb: cc.Node;

    public curTime = 0;
    public winnum = 0;

    private flag1: boolean = false;
    private flag2: boolean = false;

    onLoad() {
        GameData.PauseGame = false;
        GameData.startTime = 180;
        this._itemList1 = this.itemList1;
        this._itemList2 = this.itemList2;
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic("hz203_12", true, 0.7);
        // AudioManager.playEffect("hz203_12");
        // this.showPB("这么多钱，花不完根本花不完");
        // cc.Tween.stopAllByTarget(this.tittle);
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

    // moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
    //     var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
    //     for (let i = 0; i < this._itemList1.length; i++) {
    //         var item = this._itemList1[i];
    //         if (item.getBoundingBox().contains(poi)) {
    //             even.currentTarget.destroy();
    //             item.getChildByName("state1").active = false;
    //             item.getChildByName("state2").active = true;
    //             var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
    //             // @ts-ignore
    //             yansk.position = poi
    //             yansk.active = true;
    //             yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
    //             var lab = this.stringList1[item.name].split("|");
    //             this.showPB(lab[0]);
    //             AudioManager.playEffect("hz4_11");
    //             AudioManager.playEffect(lab[1]);
    //             this._itemList1.splice(i, 1)
    //             this.winnum++;
    //             break;
    //         }
    //         if (i == this._itemList1.length - 1) {
    //             even.currentTarget.getComponent(moveItems2).restart();
    //         }
    //     }
    // }
    
    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
        const dragType = even.currentTarget.name;
        if(dragType === "qian") {
            var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
            for (let i = 0; i < this._itemList1.length; i++) {
                var item = this._itemList1[i];
                if (item.getBoundingBox().contains(poi)) {
                    even.currentTarget.destroy();
                    item.getChildByName("state1").active = false;
                    item.getChildByName("state2").active = true;
                    var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                    // @ts-ignore
                    yansk.position = poi
                    yansk.active = true;
                    yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                    var lab = this.stringList1[item.name].split("|");
                    this.showPB(lab[0]);
                    AudioManager.playEffect("hz203_11");
                    AudioManager.playEffect(lab[1]);
                    this._itemList1.splice(i, 1)
                    this.winnum++;
                    break;
                }
                if (i == this._itemList1.length - 1) {
                    even.currentTarget.getComponent(moveItems2).restart();
                }
            }
        }
        else if(dragType === "time") {
            var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
            for (let i = 0; i < this._itemList2.length; i++) {
                var item = this._itemList2[i];
                if (item.getBoundingBox().contains(poi)) {

                    if(item.name === "nan" && !this.flag1) {
                        even.currentTarget.getComponent(moveItems2).restart();
                        return
                    }
                    if(item.name === "jian" && (!this.flag2 || !this.flag1 || this._itemList1.length !== 0 || this._itemList2.length !== 1) ) {
                        even.currentTarget.getComponent(moveItems2).restart();
                        return
                    }
                    if(item.name === "gui") {
                        item.parent.getChildByName("nan").active = true;
                        this.flag1 = true;
                    }
                    if(item.name === "nan") {
                        this.flag2 = true;
                    }

                    even.currentTarget.destroy();
                    item.getChildByName("state1").active = false;
                    item.getChildByName("state2").active = true;
                    var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                    // @ts-ignore
                    yansk.position = poi
                    yansk.active = true;
                    yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
                    var lab = this.stringList2[item.name].split("|");
                    this.showPB(lab[0]);
                    AudioManager.playEffect("hz203_11");
                    if(item.name === "jian") {
                        this.scheduleOnce(() => {
                            AudioManager.playEffect(lab[1]);
                        }, 0.5)
                    }
                    else {
                        AudioManager.playEffect(lab[1]);
                    }
                    this._itemList2.splice(i, 1)
                    this.winnum++;
                    if(this._itemList2.length === 0) {
                        this.node.getChildByName("bg").getChildByName("jianying").active = true;
                        this.node.getChildByName("bg").getChildByName("jianying").getComponent(dragonBones.ArmatureDisplay).playAnimation("jianying", 1);

                    }

                    break;
                }
                if (i == this._itemList2.length - 1) {
                    even.currentTarget.getComponent(moveItems2).restart();
                }
            }
        }
    }

    showPB(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            .call(() => {
                if (this._itemList1.length == 0 && this._itemList2.length === 0) {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/hz/endwin_hz");
                    }, 1)
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

        if (this.isshowVideo) {
            this.node.getChildByName("tipsNode").active = true;
            this.isshowVideo = true;
            VideoManager.getInstance().showInsert();
        } else {
            VideoManager.getInstance().showVideo(() => {
                this.node.getChildByName("tipsNode").active = true;
                this.node.getChildByName("bg").getChildByName("bg2").getChildByName("btn_tips").getChildByName("luxiang").active = false;
                this.isshowVideo = true;
                VideoManager.getInstance().showInsert();
            })
        }
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

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }


}

