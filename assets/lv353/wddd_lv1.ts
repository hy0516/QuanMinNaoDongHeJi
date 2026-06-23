import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import wdddmen from "./wdddmen";
import wdddrole_nz from "./wdddrole_nz";




const { ccclass, property } = cc._decorator;
enum music {
    打开宝箱 = "打开宝箱",
    关卡背景lv353 = "关卡背景lv353",
    得抓紧时间变回人身才行 = "得抓紧时间变回人身才行",
    完了完了师傅最讨厌我们变回原形 = "完了完了师傅最讨厌我们变回原形",
    终于变回人形了 = "终于变回人形了",
    这下不用担心被师傅责罚了 = "这下不用担心被师傅责罚了",
    我感觉我的身体好奇怪 = "我感觉我的身体好奇怪",
    化形成这样要被师傅骂了 = "化形成这样要被师傅骂了",
    通用 = "通用",
    触碰物品 = "触碰物品",
    哭泣 = "哭泣",
}
enum talk {
    完了完了师傅最讨厌我们变回原形 = "完了完了师傅最讨厌我们变回原形",
    终于变回人形了 = "终于变回人形了",
    这下不用担心被师傅责罚了 = "这下不用担心被师傅责罚了",
    我感觉我的身体好奇怪 = "我感觉我的身体好奇怪",
    化形成这样要被师傅骂了 = "化形成这样要被师傅骂了",
    得抓紧时间变回人身才行 = "得抓紧时间变回人身才行",
}

@ccclass
export default class wddd_lv1 extends BaseGame {
    @property(cc.Node)
    private tittle: cc.Node = null;
    @property(cc.Node)
    private timeText: cc.Node = null;
    @property(cc.Label)
    private lablv: cc.Label = null;
    @property(cc.Node)
    private gou: cc.Node = null;
    @property(cc.Node)
    private gou2: cc.Node = null;
    @property(dragonBones.ArmatureDisplay)
    private lbsk: dragonBones.ArmatureDisplay = null;
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Prefab)
    private menItem: cc.Prefab = null;
    @property({ type: cc.Prefab, tooltip: "选对道具时的龙骨特效预制体(xx_ske)，需包含 ArmatureDisplay 播放 xx 动画" })
    private selectedEffectPrefab: cc.Prefab = null;
    @property(cc.Node)
    PB: cc.Node = null;
    @property(cc.Node)
    lab_pb: cc.Node = null;
    @property(cc.Node)
    private ren: cc.Node = null;
    @property({ tooltip: "角色左右移动速度" })
    roleMoveSpeed = 3;
    @property({ tooltip: "角色左边界X" })
    roleMinX = -280;
    @property({ tooltip: "角色右边界X" })
    roleMaxX = 280;

    createItemData = [];
    itemCurMoveSpeed = 0.1;
    curCreateItemNum = 0;

    istiaoguo = false;
    curWeight = 10000;
    private curLevelId = 0;
    public startTime = 255;

    collnodenz: cc.Node;
    menlist: cc.Node[] = [];
    /** 单角色模式：不暂停移动当道具接近 */
    isSingleRoleMode = true;
    /** 正在处理接对道具（播放特效中），避免 update 中 menlist 为空时重复调用 updateLvlab */
    private isProcessingCorrectCatch = false;

    /** 每事件正确道具值 [1,3,5,7,9,11,13] */
    correctValues = ["1", "3", "5", "7", "9", "11", "13"];
    /** 每事件提示语音，生成道具时播放3次 */
    hintAudioList = [
        "我的刀盾",
        "巴巴博一",
        "比比拉布",
        "歪比巴卜",
        "咕咕嘎嘎",
        "八个鸭鹿",
        "给我擦皮鞋",
    ];
    mendata = [
        ["1", "2"],
        ["3", "4"],
        ["5", "6"],
        ["7", "8"],
        ["9", "10"],
        ["11", "12"],
        ["13", "14"],
    ]

    //daojuAudio = ["喝水声", "筋膜枪声", "羽毛声", "吃到灵珠", "贴暖宝贴", "冰锤", "针灸声", "吃东西"]


    onLoad() {
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
        AudioManager.playMusic(music.关卡背景lv353, true, 1.5);
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        // this.node.getChildByName("room2bg").active = false;
        // this.node.getChildByName("room2").active = false;
        this.ren.active = false;
        // this.node.getChildByName("room2bg").opacity = 0;
        // this.node.getChildByName("room2").opacity = 0;
        // this.node.getChildByName("room1bg").active = true;
        // this.node.getChildByName("room1").active = true;
        this.collnodenz = this.ren.getChildByName("nz").getChildByName("collnodenz");
        // if (this.ren.getChildByName("ab")) this.ren.getChildByName("ab").active = false;
        this.gameManager();
        this.lablv.string = "剩余事件 " + (this.curLevelId + 1).toString() + "/7";

    }

    curAniLv = 8;
    curweightTextNum = 10000;
    isjiesuan = false;
    updateLvlab() {
        this.curCreateItemNum = 0;
        this.curLevelId++;
        this.lablv.string = "剩余事件 " + (this.curLevelId + 1).toString() + "/7";

    }
    updateLv() {
        if (this.curLevelId == this.mendata.length - 1) {
            // this.lablv.string = "剩余事件 " + (this.curLevelId + 1) + "/7";
            this.jieSuan();
            return;
        }
        this.updateLvlab();
        if (this.curLevelId < this.mendata.length) {
            this.CreateMoveItem();
        }
    }
    isrun = false;
    cloneTime = 125;
    curCloneTime = 0;
    update(dt: number): void {
        if (!this.isrun || this.isjiesuan) return
        var rectRole = this.collnodenz.getBoundingBoxToWorld();
        if (this.menlist.length > 0) {
            for (let j = 0; j < this.menlist.length; j++) {
                var men = this.menlist[j];
                var rectmen = men.getBoundingBoxToWorld();
                if (cc.Intersection.rectRect(rectRole, rectmen)) {
                    var itemValue = men.getComponent(wdddmen).data.value;
                    var correctValue = this.correctValues[this.curLevelId];
                    if (itemValue === correctValue) {
                        var datanz = men.getComponent(wdddmen).data;
                        men.getComponent(wdddmen).isrun = false;
                        this.isProcessingCorrectCatch = true;  // 防止 update 中 menlist 为空时重复增加波次
                        this.menlist.splice(j, 1);
                        for (let k = this.menlist.length - 1; k >= 0; k--) this.menlist[k].destroy();
                        this.menlist = [];
                        this.playSelectedEffect(men, () => {
                            this.ren.getChildByName("nz").getComponent(wdddrole_nz).init(datanz, true);
                            this.singleRoleItemHandle(datanz);
                            this.isProcessingCorrectCatch = false;
                        });
                        break;
                    } else {
                        this.onCatchWrong();
                        return;
                    }
                }
            }
            if (this.menlist.length == 0 && !this.isProcessingCorrectCatch) {
                this.isrun = false;
            }
        } else {
            this.curCloneTime++;
            if (this.curCloneTime >= this.cloneTime && this.isrun && !this.isjiesuan && !this.isProcessingCorrectCatch) {
                this.CreateMoveItem();
                this.curCloneTime = 0;
            }
        }
    }


    mentalkList: { [key: string]: { data: string, talkNode: cc.Node, skNode: cc.Node, skAni: string, jiesuanAni: string } } = {};
    mentalkNum = 0;

    /** 选对道具时播放选中特效：优先使用龙骨动画(selectedEffectPrefab)，否则缩放脉冲 */
    playSelectedEffect(menNode: cc.Node, onComplete?: () => void) {
        if (this.selectedEffectPrefab) {
            var effectNode = cc.instantiate(this.selectedEffectPrefab);
            var room2 = this.node.getChildByName("room2");
            effectNode.parent = room2;
            var menWorldPos = menNode.parent.convertToWorldSpaceAR(menNode.position);
            effectNode.position = room2.convertToNodeSpaceAR(menWorldPos);
            effectNode.active = true;
            menNode.active = false;
            var armature = effectNode.getComponent(dragonBones.ArmatureDisplay) || effectNode.getComponentInChildren(dragonBones.ArmatureDisplay);
            if (armature) {
                armature.playAnimation("xx", 1);
                this.addOneTimeListener(armature, () => {
                    menNode.destroy();
                    effectNode.destroy();
                    onComplete && onComplete();
                });
            } else {
                menNode.destroy();
                effectNode.destroy();
                this.scheduleOnce(() => onComplete && onComplete(), 0.6);
            }
        } else {
            var startScale = menNode.scaleX;
            cc.Tween.stopAllByTarget(menNode);
            cc.tween(menNode)
                .to(0.1, { scaleX: startScale * 1.35, scaleY: startScale * 1.35 })
                .to(0.15, { scaleX: startScale * 1.2, scaleY: startScale * 1.2, opacity: 0 })
                .call(() => {
                    menNode.destroy();
                    onComplete && onComplete();
                })
                .start();
        }
    }

    /** 单角色接对道具后的处理：播放成功音效，直接进入下一关 */
    singleRoleItemHandle(data: { type: number, value: string }) {
        AudioManager.playEffect("finishjq");
        // var nzNode = this.ren.getChildByName("nz");
        // var nzSk = nzNode.getChildByName("nz_ske");
        // nzSk.getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji", -1);
        this.updateLv();
        this.isrun = true;
    }

    /** 接错道具-立即失败 */
    onCatchWrong() {
        if (this.isjiesuan) return;
        this.isjiesuan = true;
        this.isrun = false;
        for (let k = this.menlist.length - 1; k >= 0; k--) this.menlist[k].destroy();
        this.menlist = [];
        var nz = this.ren.getChildByName("nz").getChildByName("nz_ske");
        AudioManager.playEffect(music.哭泣);
        nz.getComponent(dragonBones.ArmatureDisplay).playAnimation("sx", 1);
        this.addOneTimeListener(nz.getComponent(dragonBones.ArmatureDisplay), () => {
            // this.showqp(this.ren.getChildByName("nz"), talk.化形成这样要被师傅骂了, music.化形成这样要被师傅骂了, () => {
            this.onlost();
            // });
        });
    }

    jieSuan() {
        if (this.isjiesuan) return
        this.isjiesuan = true;
        this.guochang2();
    }

    ismen = false;
    pauseRoleMove() {
        this.ismen = true;
    }
    startRoleMove() {
        this.ismen = false;
    }
    fenghuolun = null;
    CreateMoveItem() {
        if (this.curLevelId >= this.mendata.length) return;
        let num = Math.random();
        var menvalue1 = this.mendata[this.curLevelId][0];
        var menvalue2 = this.mendata[this.curLevelId][1];
        if (num >= 0.5) {
            menvalue1 = this.mendata[this.curLevelId][1];
            menvalue2 = this.mendata[this.curLevelId][0];
        }
        var men1 = cc.instantiate(this.menItem);
        men1.parent = this.node.getChildByName("room2");
        men1.position = men1.parent.getChildByName("menpoi1").position;
        var mendata1 = { type: this.curLevelId, value: menvalue1, main: this.node, poitype: "左" };
        men1.getComponent(wdddmen).init(mendata1);

        this.menlist.push(men1);
        var men2 = cc.instantiate(this.menItem);
        men2.parent = this.node.getChildByName("room2");
        men2.position = men1.parent.getChildByName("menpoi2").position;
        var mendata2 = { type: this.curLevelId, value: menvalue2, main: this.node, poitype: "右" };
        men2.getComponent(wdddmen).init(mendata2);
        this.menlist.push(men2);
        this.playHintVoice3Times();
    }

    /** 播放当前事件提示语音3次，每次间隔约2秒 */
    playHintVoice3Times() {
        var hintName = this.hintAudioList[this.curLevelId] || this.hintAudioList[0];
        for (let i = 0; i < 3; i++) {
            this.scheduleOnce(() => {
                if (!this.isjiesuan) AudioManager.playEffect(hintName);
                if (!this.lbsk.node.active) this.lbsk.node.active = true;
                this.lbsk.playAnimation("lb" + this.curLevelId.toString(), 1);
            }, i * 2.2);
        }
    }
    showPB(lab: string, time: number, talksk: cc.Node, handler?: Function) {
        if (lab == "") {
            handler && handler();
            return
        }
        this.lab_pb.getComponent(cc.Label).string = lab;
        talksk.active = true;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(time - 0.6)
            .call(() => {
                talksk.active = false;
            })
            .to(0.3, { opacity: 0 })
            .call(() => {
                handler && handler();
            })
            .start()
    }
    public RandomNumber(minNumber: number, maxNumber: number): number {
        return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }
    /** 绑定全屏左右滑动控制角色移动 */
    IntBtn() {
        this.offBtn();
        var touchLayer = this.node.getChildByName("room2") || this.node;
        touchLayer.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        touchLayer.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    offBtn() {
        var touchLayer = this.node.getChildByName("room2") || this.node;
        touchLayer.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        touchLayer.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("qp")
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                if (this.istiaoguo) return
                handler && handler();
            })
            .start()
    }
    gameManager() {
        // this.schedule(this.Timeing, 1);
        this.ren.active = true;
        this.IntBtn();
        this.isrun = true;
    }
    guochang2() {

        this.onwin();
    }
    onwin() {
        var fun = () => {
            this.endwin("prefabs/zc/zc_winend");
            // GameData.PauseGame = false;
            return
        }
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()
        this.scheduleOnce(() => {
            AudioManager.playEffect("finishjq");
        }, 0.9)
    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "tiaoguo":
                if (GameData.PauseGame) {
                    common.ShowTipsView("请在当前关卡前跳过");
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = true;
                    this.node.cleanup();
                    this.istiaoguo = true;
                    cc.Tween.stopAll();
                    this.onwin();
                })
                break;
            case "fanhui":
                this.openpausePanel();
                // GameData.PauseGame = false;
                // this.node.cleanup();
                // this.node.destroy();
                // GameData.onDele();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                // })
                break;
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
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(() => {
                    handlers();
                });
                break;
            case "x":
                GameData.PauseGame = false;
                // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = false;
                this.tipsPanel.active = false;
                break;
        }
    }

    isshowVideo = false;
    touchstartPoi: cc.Vec2;
    onTouchStart(e: cc.Event.EventTouch) {
        this.touchstartPoi = e.getLocation();
    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame || this.ismen || this.isjiesuan) return;
        var deltaX = e.getDeltaX() * this.roleMoveSpeed;
        if (Math.abs(deltaX) < 1) return;
        this.ren.x = cc.misc.clampf(this.ren.x + deltaX, this.roleMinX, this.roleMaxX);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.timeText.getComponent(cc.Label).string = "倒计时：" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend");
                this.node.destroy();
            }, 0.7);
        }
    }
    onlost() {
        var fun = () => {
            this.scheduleOnce(() => {
                GameData.PauseGame = false
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 1)
        }
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .call(fun)
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            // AudioManager.playEffect(music.哭);
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }

}
