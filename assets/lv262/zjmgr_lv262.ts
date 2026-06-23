
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveItems2 from "../script/common/moveItems2";
import item_click4 from "../script/pre/item_click4";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";
import moveItem_lv262 from "./moveItem_lv262";




const { ccclass, property } = cc._decorator;

enum music {

    start = "大家都是猫，凭什么天差地别？你们这些富猫接受我的报复吧！",

    lv1_1 = "这烤鸭做得不正宗",
    lv1_2 = "我连维持自己的生计都很困难了",

    lv2_1 = "这么油腻的东西，想让我变得更胖吗",
    lv2_2 = "恰逢有人结婚，主人匀出一碗给我",

    lv3_1 = "哇，这发型简直绝了！太A爆了！",
    lv3_2 = "这东西我不会用，还不如卖了换点钱",

    lv4_1 = "我钱多到花不完，读书对我来说根本没必要",
    lv4_2 = "读书才能改变命运",

    lv5_1 = "太开心了，终于抢到偶像演唱会门票了",
    lv5_2 = "门票太贵了，我根本消费不起",

    lv6_1 = "也不撒泡尿照照自己，还妄想和我搞对象",
    lv6_2 = "他是个好人，但目前我的注意力全在学习上",

    lv7_1 = "这点钱连点一次公猫模特都不够",
    lv7_2 = "用暑假打工赚的钱来装修老屋",

    lv8_1 = "只要钱足够，任何学校都能上",
    lv8_2 = "这不是我的东西，估计是快递员送错了",

    lv9_1 = "为什么我的血型和父母的不一样呢",
    lv9_2 = "我父母一直很健康的，不会是骗子想骗我吧",

    lv10 = "我才想起来，学校安排了一次体检",

    lostend = "假的，全是假的！你给我去死！",

    winend = "天无绝人之路，我的美好生活就要来了"



}

enum talk {

    start = "大家都是猫，凭什么天差地别？你们这些富猫接受我的报复吧！",

    lv1_1 = "这烤鸭做得不正宗",
    lv1_2 = "我连维持自己的生计都很困难了",

    lv2_1 = "这么油腻的东西，想让我变得更胖吗",
    lv2_2 = "恰逢有人结婚，主人匀出一碗给我",

    lv3_1 = "哇，这发型简直绝了！太A爆了！",
    lv3_2 = "这东西我不会用，还不如卖了换点钱",

    lv4_1 = "我钱多到花不完，读书对我来说根本没必要",
    lv4_2 = "读书才能改变命运",

    lv5_1 = "太开心了，终于抢到偶像演唱会门票了",
    lv5_2 = "门票太贵了，我根本消费不起",

    lv6_1 = "也不撒泡尿照照自己，还妄想和我搞对象",
    lv6_2 = "他是个好人，但目前我的注意力全在学习上",

    lv7_1 = "这点钱连点一次公猫模特都不够",
    lv7_2 = "用暑假打工赚的钱来装修老屋",

    lv8_1 = "只要钱足够，任何学校都能上",
    lv8_2 = "这不是我的东西，估计是快递员送错了",

    lv9_1 = "为什么我的血型和父母的不一样呢",
    lv9_2 = "我父母一直很健康的，不会是骗子想骗我吧",

    lv10 = "我才想起来，学校安排了一次体检",

    lostend = "假的，全是假的！你给我去死！",

    winend = "天无绝人之路，我的美好生活就要来了"


}

enum tool {

    oil,
    food
}

// enum girlSke{


// }

class isSign<T> {

    value: boolean = false;
    constructor(vale: boolean) {
        this.value = vale;
    }
}

@ccclass
export default class zjmgr_lv262 extends BaseGame {

    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;

    public startTime = 300;
    public startX = 0;
    public endX = 0;
    public curTime = 0;

    girlSke: dragonBones.ArmatureDisplay;
    zoombieSke: dragonBones.ArmatureDisplay;
    oilSke: dragonBones.ArmatureDisplay;

    g_talkFrame: cc.Node = null;
    z_talkFrame: cc.Node = null;

    canjiaohu = false;
    jinduLabel;


    room;
    sceneSke: dragonBones.ArmatureDisplay;
    grandMomSke: dragonBones.ArmatureDisplay;
    kidSke: dragonBones.ArmatureDisplay;

    targetBoxList: cc.Node[];
    /**物品释放框 */
    targetBox_1: cc.Node;
    targetBox_2: cc.Node;


    useReport: boolean = false;

    richCatSke: dragonBones.ArmatureDisplay;
    poorCatSke: dragonBones.ArmatureDisplay;



    isFalse = false;


    //#region qpConfig
    /**对话配置表 */
    qpConfig = {   //成员0:richCat, 1:poorCat
        //鸭子
        1: [
            { talk: talk.lv1_1, music: music.lv1_1, ske: "daiji2/0", slot: "kaoya", answer: true },
            { talk: talk.lv1_2, music: music.lv1_2, ske: null, slot: "yazi", answer: false },
        ],
        //红绕肉
        2: [
            { talk: talk.lv2_1, music: music.lv2_1, ske: null, slot: "hongshaorou2", answer: false },
            { talk: talk.lv2_2, music: music.lv2_2, ske: "daiji2/0", slot: "hongshaorou", answer: true },
        ],
        //染发剂
        3: [
            { talk: talk.lv3_1, music: music.lv3_1, ske: null, slot: null, answer: true },
            { talk: talk.lv3_2, music: music.lv3_2, ske: null, slot: "rangfaji", answer: false },
        ],
        //书本
        4: [
            { talk: talk.lv4_1, music: music.lv4_1, ske: "daiji4/1", slot: null, answer: false },
            { talk: talk.lv4_2, music: music.lv4_2, ske: "daiji3/0", slot: "shu", answer: true },
        ],
        //演唱会门票
        5: [
            { talk: talk.lv5_1, music: music.lv5_1, ske: "daiji2/1", slot: "menpiao1", answer: true },
            { talk: talk.lv5_2, music: music.lv5_2, ske: "daiji4/0", slot: "menpiao2", answer: false },
        ],
        //信件
        6: [
            { talk: talk.lv6_1, music: music.lv6_1, ske: null, slot: null, answer: false },
            { talk: talk.lv6_2, music: music.lv6_2, ske: "daiji2/0", slot: "qingshu", answer: true },
        ],
        //钱
        7: [
            { talk: talk.lv7_1, music: music.lv7_1, ske: null, slot: "qian", answer: false },
            { talk: talk.lv7_2, music: music.lv7_2, ske: null, slot: null, answer: true },
        ],
        //证书
        8: [
            { talk: talk.lv8_1, music: music.lv8_1, ske: null, slot: "xueweizhengshu1", answer: true },
            { talk: talk.lv8_2, music: music.lv8_2, ske: "daiji4/1", slot: "xueweizhengshu2", answer: false },
        ],
        //病危通知
        9: [
            { talk: talk.lv9_1, music: music.lv9_1, ske: "daiji6/1", slot: null, answer: true },
            { talk: talk.lv9_2, music: music.lv9_2, ske: "daiji4/1", slot: null, answer: false },
        ],


    }


    getManager() {

        this.room = this.node.getChildByName("bg").getChildByName("room");
        this.sceneSke = this.room.getChildByName("sceneSke").getComponent(dragonBones.ArmatureDisplay);

        this.targetBox_1 = this.room.getChildByName("targetBox_1");
        this.targetBox_2 = this.room.getChildByName("targetBox_2");
        this.targetBoxList = [this.targetBox_1, this.targetBox_2];

        this.richCatSke = this.room.getChildByName("richCat").getComponent(dragonBones.ArmatureDisplay);
        this.poorCatSke = this.room.getChildByName("poorCat").getComponent(dragonBones.ArmatureDisplay);
    }

    //#region  Onload

    onLoad() {

        this.time.string = "时间:" + this.startTime.toString() + "s";
        // this.schedule(this.Timeing, 1);
        // AudioManager.stopMusic();

        this.scheduleOnce(() => {

        }, 0.5);

        cc.Tween.stopAllByTarget(this.tittle);
        this.getManager();

        //GameData.PauseGame = true;


        this.scheduleOnce(() => {
            this.gameStart();
            AudioManager.playMusic("关卡背景_262", true, 0.6);
            this.starting();
        }, 0.5);




    }


    gameStart() {
        this.jinduLabel = this.time.node.parent.getChildByName(`jinduLabel`).getComponent(cc.Label);

        //隐藏头发
        this.changeSKSlotIndex(this.richCatSke, "toufa1", -1);
        this.changeSKSlotIndex(this.richCatSke, "toufa2", -1);

        this.richCatSke.node.opacity = 255;
        this.richCatSke.node.active = false;
    }

    starting() {

        let lv1 = this.room.getChildByName("lv1");
        let magicWater = lv1.getChildByName("magicWater");

        let kidL = lv1.getChildByName("kidL");
        let kidR = lv1.getChildByName("kidR");

        let kidLske = kidL.getComponent(dragonBones.ArmatureDisplay);
        let kidRske = kidR.getComponent(dragonBones.ArmatureDisplay);

        let magicWaterSke = magicWater.getComponent(dragonBones.ArmatureDisplay);

        let talk_0 = lv1.getChildByName("talk_0");
        this.showqp(talk_0, talk.start, music.start, () => {
            magicWaterSke.enabled = true;
            magicWaterSke.playAnimation("donghua", 1);
            AudioManager.playEffect("倒药水_262");

            lv1.getChildByName("badCat").getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji1", -1);

            this.addOneTimeListener(magicWaterSke, () => {
                magicWater.x = 313.338;

                magicWaterSke.playAnimation("donghua", 1);
                AudioManager.playEffect("倒药水_262");

                this.addOneTimeListener(magicWaterSke, () => {
                    magicWaterSke.enabled = false;

                    //交换
                    kidLske.playAnimation("daiji3");
                    kidRske.playAnimation("daiji4");

                    this.scheduleOnce(() => {
                        this.sceneTransform("lv2", () => {
                            this.itemCreate();
                        });
                    }, 1.5);

                })

            })
        })


    }




    ending(iswin: boolean) {

        let talkFrame;
        if (iswin) {
            talkFrame = this.room.getChildByName("poorCatTalk");
            this.poorCatSke.playAnimation("daiji6", -1);
            this.showqp(talkFrame, talk.winend, music.winend, () => {
                this.scheduleOnce(() => {
                    this.onwin();
                }, 0.5)
            });
        }

        else {
            talkFrame = this.room.getChildByName("richCatTalk");
            this.richCatSke.playAnimation("daiji7", 1);
            AudioManager.playEffect("撕纸_262");
            this.addOneTimeListener(this.richCatSke, () => {
                this.richCatSke.playAnimation("daiji8", -1);
                this.showqp(talkFrame, talk.lostend, music.lostend, () => {

                    this.figth(); //打架
                    this.scheduleOnce(() => {
                        this.node.destroy();
                        this.endlost("prefabs/zc/zc_lostend");
                    }, 2.5);
                });

            })

        }
    }


    //打架
    figth() {
        this.richCatSke.node.active = false;
        this.poorCatSke.node.active = false;

        let fithSke = this.room.getChildByName("fightSke");
        fithSke.active = true;
        fithSke.getComponent(dragonBones.ArmatureDisplay).playAnimation("donghua", -1);
        AudioManager.playEffect("打架_262");
    }


    //转场
    sceneTransform(sign, fun?) {

        let bm: cc.Node = this.room.getChildByName("bm");

        let catTween = () => {

            this.richCatSke.node.active = true;
            this.poorCatSke.node.active = true;

            this.richCatSke.node.opacity = 0;
            this.poorCatSke.node.opacity = 0;
            //人物缓动显示
            cc.tween(this.richCatSke.node)
                .to(1, { opacity: 255 })
                .start();
            cc.tween(this.poorCatSke.node)
                .to(1, { opacity: 255 })
                .start();
        }

        //体检报告缓动显示
        let reportTween = () => {
            let report: cc.Node = this.room.getChildByName("lv10");
            report.active = true;
            report.opacity = 0;
            cc.tween(report)
                .to(1, { opacity: 255 })
                .start();
        }


        if (sign == "lv3") {
            bm.children[0].active = false;
            this.richCatSke.node.active = false;
            this.poorCatSke.node.active = false;
        }

        cc.tween(bm)
            .to(1, { opacity: 255 })
            .call(() => { this.sceneSwicth(sign); })//场景切换
            .delay(0.6)
            .call(() => {
                catTween();
                if (sign == "lv2") reportTween();
            })
            .to(1, { opacity: 0 })
            .call(() => {
                fun && fun();
            })
            .start();



    }
    //#region  sceneSwicth
    sceneSwicth(sign) {
        switch (sign) {

            case "lv1":

                break;

            case "lv2":

                //隐藏
                this.room.getChildByName("lv1").active = false;


                this.changeSKSlotIndex(this.sceneSke, "fangjianzuo", 0);
                this.changeSKSlotIndex(this.sceneSke, "fangjianyou", 0);
                this.changeSKSlotIndex(this.sceneSke, "zhuobu", 0);
                this.changeSKSlotIndex(this.sceneSke, "lajitong", 0);
                break;
            case "lv2_2":
                this.changeSKSlotIndex(this.sceneSke, "zhuozi", 0);
                this.changeSKSlotIndex(this.sceneSke, "fangjianyou", 1);
                break;
            case "lv3":
                this.changeSKSlotIndex(this.sceneSke, "fangjianzuo", -1);
                this.changeSKSlotIndex(this.sceneSke, "fangjianyou", -1);
                let endBg = this.room.getChildByName("endBg");
                endBg.active = true;
                break;



        }
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
            case "tishi":

                var handlers = () => {
                    VideoManager.getInstance().showInsert();
                    this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                    this.showTips();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case `x`:
                this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = false;
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

    //特殊道具
    //体检报告
    reporterItem() {

        this.poorCatSke.playAnimation("daiji5", -1);
        let talkFrame = this.room.getChildByName("poorCatTalk");
        this.showqp(talkFrame, talk.lv10, music.lv10, () => {

            let startPos = this.poorCatSke.node.position;
            cc.tween(this.poorCatSke.node)
                .to(1, { x: 688.736 })
                .call(() => {
                    this.poorCatSke.playAnimation("daiji3", -1);
                })
                .to(1, { x: startPos.x })
                .call(() => {
                    GameData.PauseGame = false;
                })
                .start();
        });
    }





    itemCreate() {



        let itmes = this.room.getChildByName("itemList").children;
        let itme: cc.Node = itmes[this.lvNum];

        itme.active = true;
        itme.scale = 0;

        cc.tween(itme)
            .to(0.7, { scale: 1 })
            .call(() => {
                GameData.PauseGame = false;
            })
            .start();



    }


    nextLv() {

        this.lvNum += 1;
        if (this.lvNum >= 9) {

            if (this.useReport && !this.isFalse) {

                this.sceneTransform("lv3", () => {
                    this.itemCreate();
                });


            }

            else {
                this.scheduleOnce(() => {
                    this.endlost("prefabs/zc/zc_lostend");
                }, 2.5);
            }

            return;

        }

        else {
            this.itemCreate();
        }

    }




    //#region  Logic
    Logic(type, targetBox: cc.Node, even: cc.Event.EventTouch) {

        let catName;
        let index;
        let catSke: dragonBones.ArmatureDisplay;
        let talk;
        let music;
        let skeAnimation: string;
        let slotName; //场景插槽

        let talkCallBack;
        let skeCallBack;

        let callBack = () => {
            //恢复待机动画
            catSke.playAnimation("daiji3", -1);

            this.nextLv();
        }

        if (targetBox == this.targetBox_1) {
            catName = "richCat";
            index = 0;
            catSke = this.richCatSke;

            //特殊道具
            //染发剂
            if (type == 3) {
                //显示头发
                this.changeSKSlotIndex(this.richCatSke, "toufa1", 0);
                this.changeSKSlotIndex(this.richCatSke, "toufa2", 0);
            }

            //亲子鉴定书
            if (type == 11) {
                this.ending(false);
                return;
            }
        }

        if (targetBox == this.targetBox_2) {
            catName = "poorCat";
            index = 1;
            catSke = this.poorCatSke;

            //特殊道具

            //钱
            if (type == 7) {
                this.sceneSwicth("lv2_2");
            }
            //体检报告
            if (type == 10) {
                this.reporterItem();
                this.useReport = true;
                return;
            }

            //亲子鉴定书
            if (type == 11) {
                this.ending(true);
                return;
            }

        }


        talk = this.qpConfig[type][index].talk;
        music = this.qpConfig[type][index].music;
        skeAnimation = this.qpConfig[type][index].ske;
        slotName = this.qpConfig[type][index].slot;

        //答案判定
        let answer = this.qpConfig[type][index].answer;
        if (answer == false) this.isFalse = true;

        if (skeAnimation != null) {
            let aniName = skeAnimation.split("/")[0];
            let playTime = Number(skeAnimation.split("/")[1]);

            // //动画循环播放，执行talkcallBack
            // if(playTime == 0){
            //     talkCallBack = callBack;
            // }
            // //动画播放1次，执行skecallBack
            // if(playTime == 1){
            //     skeCallBack = callBack;
            // }

            //猫动画
            if (skeAnimation != null) {
                catSke.playAnimation(aniName, playTime);

                this.addOneTimeListener(catSke, () => {
                    // skeCallBack && skeCallBack();
                })
            }
        }

        // else{
        //默认播放待机动画，执行talkcallBack
        talkCallBack = callBack;
        //  }


        //场景
        if (slotName != null) {
            this.changeSKSlotIndex(this.sceneSke, slotName, 0);
        }
        let talkFrame = this.room.getChildByName(catName + "Talk");


        //对话框
        this.showqp(talkFrame, talk, music, () => {
            talkCallBack && talkCallBack();
        })



    }


    /**特殊道具：bear */
    bearNum = 0;
    usePencil = false;

    itmeMoveHandler(type, even: cc.Event.EventTouch) {

        for (let i = 0; i < this.targetBoxList.length; i++) {
            let targetBox = this.targetBoxList[i];
            let pos = targetBox.parent.convertToNodeSpaceAR(even.getLocation());

            if (targetBox.getBoundingBox().contains(pos)) {
                GameData.PauseGame = true;

                //逻辑触发
                even.target.active = false;
                this.Logic(type, targetBox, even);


            }

            else {
                even.target.getComponent(moveItem_lv262).restart();
            }
        }

    }


    lvNum = 0;


    /**更新进度标签 */
    labelUpdate() {
        this.jinduLabel.string = `进度${this.lvNum}/10`;
    }

    //#region  双击滑动事件

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
    endAddTime() {

        this.startTime = 1;
        this.setTime(60);
        this.schedule(this.Timeing, 1)
        //})
    }

    /** 播放旁白 */
    talkdiplayTeshu(talkthing: string, talkaudio: string, handler?: Function) {
        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string = talkthing;
        talk.opacity = 255;
        AudioManager.playEffect(talkaudio, false, () => {
            talk.opacity = 0;
            handler && handler();
        })
    }


    /** 对话框显示功能*/
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        var qp = qpnode.getChildByName("Lable")
        qp.getComponent(cc.Label).string = lab;
        cc.tween(qpnode)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
    /**对话框隐藏 */
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("Lable")
        cc.tween(qpnode)
            .to(0.2, { opacity: 0 })
            .call(() => {
                handler && handler();
            })
            .start();


    }

    showTips() {

        let lab = "拖动鸭子给白猫";
        if (this.lvNum == 0) {
            lab = "拖动鸭子给白猫";
        }
        if (this.lvNum == 1) {
            lab = "拖动红绕肉给黑猫";
        }
        if (this.lvNum == 2) {
            lab = "拖动染发剂给白猫";
        }
        if (this.lvNum == 3) {
            lab = "拖动课本给黑猫";
        }
        if (this.lvNum == 4) {
            lab = "拖动演唱会门票给白猫";
        }

        if (this.lvNum == 5) {
            lab = "拖动信封给黑猫";
        }

        if (this.lvNum >= 6 && !this.useReport) {
            lab = "拖动黑猫脚下的体检报告给黑猫";
        }

        else {

            if (this.lvNum == 6 && this.useReport) {
                lab = "拖动钱给黑猫";
            }

            if (this.lvNum == 7) {
                lab = "拖动录取通知书给白猫";
            }
            if (this.lvNum == 8) {
                lab = "拖动病危通知书给白猫";
            }
            if (this.lvNum == 9) {
                lab = "拖动亲子鉴定给黑猫";
            }
        }




        this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).getChildByName("tishi").getChildByName("New Label").getComponent(cc.Label).string = lab;
    }





}

