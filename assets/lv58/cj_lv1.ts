import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import basecpitem from "./item/basecpitem";
import cpitem1 from "./item/cpitem1";
import cpitem2 from "./item/cpitem2";
import cpitem3 from "./item/cpitem3";
import cpitem4 from "./item/cpitem4";
import cpitem5 from "./item/cpitem5";



const { ccclass, property } = cc._decorator;
enum music {
    // win = "win_qg1",
    // lost = "lost_qg1",
    // qg = "qg1",
    // qiu = "qiu_qg1",
    // diaoluo = "dl_qg1",
    // gou = "finishjq"
    start = "58_start",
    mz = "58_mz",
    zj = "58_zj"
}

@ccclass
export default class cj_lv1 extends BaseGame {
    @property(cc.Node)
    private tittle: cc.Node = null;
    @property(cc.Node)
    private timeText: cc.Node = null;
    @property(cc.Node)
    private cpMaskNode: cc.Node = null;
    @property(cc.Node)
    private cpbtnNode: cc.Node = null;
    @property(cc.Node)
    private btn_beishu: cc.Node = null;
    @property(cc.Prefab)
    itemcp1: cc.Prefab = null;
    @property(cc.Prefab)
    itemcp2: cc.Prefab = null;
    @property(cc.Prefab)
    itemcp3: cc.Prefab = null;
    @property(cc.Prefab)
    itemcp4: cc.Prefab = null;
    @property(cc.Prefab)
    itemcp5: cc.Prefab = null;

    @property(cc.Label)
    private lab_curJindu: cc.Label = null;
    @property(cc.Label)
    private lab_curMoney: cc.Label = null;
    @property(cc.Node)
    private img_jindu: cc.Node = null;
    @property(cc.Node)
    private addtimetips: cc.Node = null;
    @property(cc.Label)
    private lab_beishu: cc.Label = null;

    private targetMoney = 1000000;
    public startTime = 288;
    private curMoney = 100;
    private isdrawing = false;
    private cpType = 0;
    private mask: cc.Mask = null;
    private curCpBox: cc.Node;
    private btn_buy: cc.Node;
    private btn_nobuy: cc.Node;
    private rewardItemList: cc.Node[] = [];
    private count = 0;
    private curCheckArr: cc.Node[] = [];
    private rewardNum = 0;
    private curbeishu = 1;

    private res = [];
    private btn_duijiang: cc.Node;
    private btn_rengdiao: cc.Node;

    private group_beishu: cc.Node;
    private btn_fangan: cc.Node;
    private btn_closefangan: cc.Node;
    private btn_jtr: cc.Node;
    private btn_jtl: cc.Node;
    private box_beishu1: cc.Node;
    private box_beishu2: cc.Node;
    private box_beishu3: cc.Node;
    // private sk_laoban: cc.Node;
    private sk_zhujue: cc.Node;

    private initNum = 0;

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
        AudioManager.playMusic(AudioManager.audioName.MAIN, true, 0.7);
        GameData.startTime = this.startTime;
        this.schedule(this.Timeing, 1)
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        this.btn_duijiang = this.cpMaskNode.getChildByName("btn_duijiang");
        this.btn_rengdiao = this.cpMaskNode.getChildByName("btn_rengdiao");
        this.btn_buy = this.cpMaskNode.getChildByName("btn_buy");
        this.btn_nobuy = this.cpMaskNode.getChildByName("btn_nobuy");

        this.group_beishu = this.node.getChildByName("group_beishu");
        this.btn_fangan = this.group_beishu.getChildByName("btn_fangan");
        this.btn_closefangan = this.group_beishu.getChildByName("btn_closefangan");
        this.btn_jtr = this.group_beishu.getChildByName("btn_jtr");
        this.btn_jtl = this.group_beishu.getChildByName("btn_jtl");
        this.box_beishu1 = this.group_beishu.getChildByName("box_beishu1");
        this.box_beishu2 = this.group_beishu.getChildByName("box_beishu2");
        this.box_beishu3 = this.group_beishu.getChildByName("box_beishu3");

        // this.sk_laoban = this.node.getChildByName("UiNode").getChildByName("sk_laoban");
        this.sk_zhujue = this.node.getChildByName("sk_zhujue");

        this.updateCurMoney();
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        AudioManager.playEffect(music.start);
    }
    onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    checkCpMoneyAndBuy(fun: Function) {
        var mianzhi = 0;
        switch (this.cpType) {
            case 0:
                mianzhi = 30;
                break;
            case 1:
                mianzhi = 50;
                break;
            case 2:
                mianzhi = 20;
                break;
            case 3:
                mianzhi = 10;
                break;
            case 4:
                mianzhi = 5;
                break;
        }
        if (this.curMoney < mianzhi * this.curbeishu) {
            common.ShowTipsView("金币不足");
            return
        }
        common.ShowTipsView("购买成功");
        this.updateCurMoney(-mianzhi * this.curbeishu);
        fun && fun();
    }
    updateCurMoney(money?: number) {
        if (money) this.curMoney += money;
        // if (this.curMoney <= 0&&this.isdrawing) {
        //     this.curMoney = 0;
        //     this.onlost();
        // }
        this.lab_curMoney.string = this.curMoney.toString();
        var jindu = this.curMoney / 10000;
        this.lab_curJindu.string = Math.floor(jindu).toString();
        this.img_jindu.width = jindu * 2;
        if (this.img_jindu.width >= 200) this.img_jindu.width = 200;
        if (this.curMoney >= this.targetMoney) {
            AudioManager.playEffect(music.zj);
            this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("zj", 1);
            this.scheduleOnce(() => {
                this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("dj2", 1);
                this.onwin();
                GameData.PauseGame = false;
            }, 2);

        } else if (money > 0) {
            this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("zj", 1);
            AudioManager.playEffect(music.zj);
            this.scheduleOnce(() => {
                this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("dj2", 1);
                GameData.PauseGame = false;
            }, 2);
        }
    }

    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        if (this.isdrawing == false) return;
        if (!this.mask) return;
        let p = this.node.convertToNodeSpaceAR(e.getLocation());
        var g = this.mask["_graphics"];
        g.fillRect(p.x - 20, p.y - 20, 50, 50);
        // g.fill()
        this.checkIsComolete(e.getLocation());
    }

    checkIsComolete(pos: cc.Vec2) {
        for (let i = 0; i < this.curCheckArr.length; i++) {
            var item = this.curCheckArr[i];
            var script = item.getComponent(basecpitem);
            if (script.isset) {
                continue;
            }
            let p = item.convertToWorldSpaceAR(cc.v3(0, 0, 0));
            let distance = cc.Vec2.distance(pos, cc.v2(p.x, p.y));
            if (distance <= 30) {
                // this.curCheckArr.splice(i, 1);
                // console.log("检测成功")
                script.isset = true;
                this.count--;
            }
        }
        if (this.count == 0) {
            this.isdrawing = false;
            for (let j = 0; j < this.mask.node.childrenCount; j++) {
                var bg = this.mask.node.children[j];
                bg.active = false;
            }
            this.showRewardItemQuan();
            // console.log("刮完了");
        }
    }

    showRewardItemQuan() {
        if (this.rewardItemList.length == 0) {
            this.btn_rengdiao.active = true;
            return
        }
        for (let i = 0; i < this.rewardItemList.length; i++) {
            var item = this.rewardItemList[i];
            var script = item.getComponent(basecpitem);
            script.showHongquan();
            this.rewardNum += script.rewardnum;
        }
        this.btn_duijiang.active = true;
    }

    cp_1_DataCreate() {
        var num = 40;
        var data = "";
        var ishave = false;
        var list = this.curCpBox.getChildByName("list");
        if (list.childrenCount > 0) ishave = true
        for (let i = 0; i < num; i++) {
            var randnum = this.RandomNumber(1, 100);
            var datanum = this.RandomNumber(1, 9);
            if (randnum >= 50 && randnum <= 55) {
                var jine = this.RandomNumber(1, 100);
                data = ("10" + ":" + jine.toString());
            } else {
                data = datanum.toString();
            }
            var item
            if (ishave) {
                item = list.children[i];
            } else {
                item = cc.instantiate(this.itemcp1);
                this.curCpBox.getChildByName("list").addChild(item);
            }
            item.getComponent(cpitem1).oninit(data);
            this.curCheckArr.push(item);
            if (randnum >= 50 && randnum <= 55) this.rewardItemList.push(item);
        }
    }

    cp_2_DataCreate() {
        var num = 25;
        var ishave = false;
        var ishave2 = false;
        var res2 = [50, 100, 250, 500, 1000, 10000, 100000, 1000000];
        var list = this.curCpBox.getChildByName("list");
        if (list.childrenCount > 0) ishave = true;
        var rewardnum = this.RandomNumber(1, 100);
        var rewardnum2 = this.RandomNumber(1, 100);
        var listicon = this.curCpBox.getChildByName("listicon");
        if (listicon.getChildByName("icon").childrenCount > 0) ishave2 = true;
        this.curCpBox.getChildByName("lab_rewardnum").getComponent(cc.Label).string = rewardnum.toString();
        this.curCpBox.getChildByName("lab_rewardnum2").getComponent(cc.Label).string = rewardnum2.toString();
        for (let h = 0; h < listicon.childrenCount; h++) {
            var randnumicon = this.RandomNumber(1, 100);
            var itemicon
            if (ishave2) {
                itemicon = listicon.children[h].children[0];
            } else {
                itemicon = cc.instantiate(this.itemcp2);
                listicon.children[h].addChild(itemicon);
            }
            if (randnumicon >= 50 && randnumicon <= 55) {
                itemicon.getComponent(cpitem2).oninit(null, null, true, true);
                this.rewardItemList.push(itemicon);
            } else {
                itemicon.getComponent(cpitem2).oninit(null, null, true, false);
            }
            this.curCheckArr.push(itemicon);
        }
        for (let i = 0; i < num; i++) {
            var randnum = this.RandomNumber(1, 100);
            var randjine = this.RandomNumber(0, res2.length - 1);
            var item
            if (ishave) {
                item = list.children[i];
            } else {
                item = cc.instantiate(this.itemcp2);
                list.addChild(item);
            }
            item.getComponent(cpitem2).oninit(randnum, res2[randjine]);
            if (randnum == rewardnum || randnum == rewardnum2) this.rewardItemList.push(item);
            this.curCheckArr.push(item);
        }
    }


    cp_3_DataCreate() {
        var num = 66;
        var ishave = false;
        var ishave2 = false;
        var res2 = [20, 50, 100, 200, 500, 1000, 5000, 10000, 50000, 100000, 660000];
        var list = this.curCpBox.getChildByName("list");
        var list2 = this.curCpBox.getChildByName("list2");
        if (list.childrenCount > 0) ishave = true;
        if (list2.childrenCount > 0) ishave2 = true;
        var rewardnum = this.RandomNumber(1, 100);
        this.curCpBox.getChildByName("lab_rewardnum").getComponent(cc.Label).string = rewardnum.toString();
        var gdnum = 0;
        while (res2.length > 0) {
            gdnum = Math.floor(Math.random() * res2.length);
            this.res.push(res2[gdnum]);
            res2.splice(gdnum, 1);
        }
        for (let i = 0; i < num; i++) {
            var randnum = this.RandomNumber(1, 100);
            var item
            if (ishave) {
                item = list.children[i];
            } else {
                item = cc.instantiate(this.itemcp3);
                list.addChild(item);
            }
            item.getComponent(cpitem3).oninit(randnum, i, false);
            this.curCheckArr.push(item);
            if (randnum == rewardnum) {
                this.rewardItemList.push(item);
                item.getComponent(cpitem3).index = i;
            }
        }
        for (let j = 0; j < this.res.length; j++) {
            var item2
            if (ishave2) {
                item2 = list2.children[j];
            } else {
                item2 = cc.instantiate(this.itemcp3);
                list2.addChild(item2);
            }
            item2.getComponent(cpitem3).oninit(this.res[j], 0, true);
            this.curCheckArr.push(item2);
        }
    }
    cp_4_DataCreate() {
        var num = 10;
        var ishave = false;
        var res2 = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 300000];
        var list = this.curCpBox.getChildByName("list");
        if (list.childrenCount > 0) ishave = true;
        var rewardnum = this.RandomNumber(1, 50);
        var rewardnum2 = this.RandomNumber(1, 50);
        this.curCpBox.getChildByName("lab_rewardnum").getComponent(cc.Label).string = rewardnum.toString();
        this.curCpBox.getChildByName("lab_rewardnum2").getComponent(cc.Label).string = rewardnum2.toString();
        var gdnum = 0;
        while (res2.length > 0) {
            gdnum = Math.floor(Math.random() * res2.length);
            this.res.push(res2[gdnum]);
            res2.splice(gdnum, 1);
        }
        for (let i = 0; i < num; i++) {
            var randnum = this.RandomNumber(1, 50);
            var item
            if (ishave) {
                item = list.children[i];
            } else {
                item = cc.instantiate(this.itemcp4);
                list.addChild(item);
            }
            if (randnum >= 45 && randnum <= 50) {
                item.getComponent(cpitem4).oninit(0, this.res[i]);
                this.rewardItemList.push(item);
            } else {
                item.getComponent(cpitem4).oninit(randnum, this.res[i]);
                if (randnum == rewardnum || randnum == rewardnum2) this.rewardItemList.push(item);
            }
            this.curCheckArr.push(item);
        }
    }
    cp_5_DataCreate() {
        var num = 8;
        var ishave = false;
        var res2 = [20, 50, 100, 200, 500, 1000, 2000, 50000];
        var list = this.curCpBox.getChildByName("list");
        if (list.childrenCount > 0) ishave = true;
        var gdnum = 0;
        while (res2.length > 0) {
            gdnum = Math.floor(Math.random() * res2.length);
            this.res.push(res2[gdnum]);
            res2.splice(gdnum, 1);
        }
        for (let i = 0; i < num; i++) {
            var randnum = this.RandomNumber(1, 50);
            var item
            if (ishave) {
                item = list.children[i];
            } else {
                item = cc.instantiate(this.itemcp5);
                list.addChild(item);
            }
            if (randnum >= 45 && randnum <= 50) {
                item.getComponent(cpitem5).oninit(0, this.res[i]);
                this.rewardItemList.push(item);
            } else {
                item.getComponent(cpitem5).oninit(randnum, this.res[i]);
            }
            this.curCheckArr.push(item);
        }

    }

    public RandomNumber(minNumber: number, maxNumber: number): number {
        return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }

    rewardFunc(fun: Function) {
        GameData.PauseGame = true;
        switch (this.cpType) {
            case 0:
            case 1:
            case 3:
            case 4:
                this.updateCurMoney(this.rewardNum * this.curbeishu)
                fun && fun();
                break;
            case 2:
                var havelist = [];
                var num = 0;
                for (let i = 0; i < this.rewardItemList.length; i++) {
                    var item = this.rewardItemList[i];
                    var script = item.getComponent(basecpitem);
                    var a = Math.floor(script.index / 6);
                    if (havelist.indexOf(a) != -1) continue;
                    havelist.push(a);
                    num += this.res[a]
                }
                this.updateCurMoney(num * this.curbeishu);
                fun && fun();
                break;
        }

    }
    comonCpIntStart() {
        this.mask = this.cpMaskNode.children[this.cpType].getChildByName("mask").getComponent(cc.Mask);
        for (let j = 0; j < this.mask.node.childrenCount; j++) {
            var bg = this.mask.node.children[j];
            bg.active = true;
        }
        this.cpbtnNode.active = false;
        this.cpMaskNode.active = true;
        this.curCpBox = this.cpMaskNode.children[this.cpType];
        this.curCpBox.active = true;
        this.btn_buy.active = true;
        this.btn_nobuy.active = true;
        this.isdrawing = false;
    }
    commonCpInt() {
        this.initNum++;
        this['cp_' + (this.cpType + 1).toString() + '_DataCreate']();
        switch (this.cpType) {
            case 1:
            case 3:
                this.curCheckArr.push(this.curCpBox.getChildByName("lab_rewardnum"));
                this.curCheckArr.push(this.curCpBox.getChildByName("lab_rewardnum2"));
                this.curCpBox.getChildByName("lab_rewardnum").getComponent(basecpitem).isset = false;
                this.curCpBox.getChildByName("lab_rewardnum2").getComponent(basecpitem).isset = false;
                break;
            case 2:
                this.curCheckArr.push(this.curCpBox.getChildByName("lab_rewardnum"));
                this.curCpBox.getChildByName("lab_rewardnum").getComponent(basecpitem).isset = false;
                break;
        }
        this.isdrawing = true;
    }
    updateBeiShu(num: number) {
        this.curbeishu = num;
        this.lab_beishu.string = num.toString();
    }
    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (GameData.PauseGame == true) return
        switch (event.currentTarget.name) {
            case "btn_cp1":
                this.cpType = 0;
                this.comonCpIntStart();
                this.count = 40;
                break;
            case "btn_cp2":
                this.cpType = 1;
                this.comonCpIntStart();
                this.count = 37;
                break;
            case "btn_cp3":
                this.cpType = 2;
                this.comonCpIntStart();
                this.count = 78;
                break;
            case "btn_cp4":
                this.cpType = 3;
                this.comonCpIntStart()
                this.count = 12;
                break;
            case "btn_cp5":
                this.cpType = 4;
                this.comonCpIntStart()
                this.count = 8;
                break;
            case "btn_rengdiao":
                this.cpbtnNode.active = true;
                var g = this.mask["_graphics"];
                g.clear(true);
                this.res = [];
                this.curCheckArr = [];
                this.rewardItemList = [];
                this.btn_duijiang.active = false;
                this.btn_rengdiao.active = false;
                this.curCpBox.active = false;
                this.cpMaskNode.active = false;
                this.rewardNum = 0;
                this.updateBeiShu(1);
                if (this.curMoney <= 0) {
                    GameData.PauseGame = true;
                    this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("mz", 1);
                    AudioManager.playEffect(music.mz);
                    this.scheduleOnce(() => {
                        this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("dj2", 1);
                        this.onlost();
                        GameData.PauseGame = false;
                    }, 2);
                } else {
                    this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("mz", 1);
                    AudioManager.playEffect(music.mz);
                    GameData.PauseGame = true;
                    this.scheduleOnce(() => {
                        GameData.PauseGame = false;
                        if (this.initNum == 3) {
                            this.btn_beishu.active = true;
                            this.group_beishu.active = true;
                        }
                        this.sk_zhujue.getComponent(dragonBones.ArmatureDisplay).playAnimation("dj2", 1);
                    }, 2);
                }
                // }
                break
            case "btn_duijiang":
                this.cpbtnNode.active = true;
                var g = this.mask["_graphics"];
                g.clear(true);
                let fun = () => {
                    this.res = [];
                    this.curCheckArr = [];
                    this.rewardItemList = [];
                    this.btn_duijiang.active = false;
                    this.btn_rengdiao.active = false;
                    this.curCpBox.active = false;
                    this.cpMaskNode.active = false;
                    this.rewardNum = 0;
                    this.updateBeiShu(1);
                    if (this.initNum == 3) {
                        this.btn_beishu.active = true;
                        this.group_beishu.active = true;
                    }
                }
                this.rewardFunc(fun);
                break;
            case "btn_buy":
                var func = () => {
                    this.commonCpInt();
                    this.btn_buy.active = false;
                    this.btn_nobuy.active = false;
                }
                this.checkCpMoneyAndBuy(func)
                break;
            case "btn_nobuy":
                this.curCpBox.active = false;
                this.cpMaskNode.active = false;
                this.cpbtnNode.active = true;
                break;
            case "btn_beishu":
                this.group_beishu.active = true;
                break;
            case "btn_fangan":
                if (this.fangantype == 1) {
                    this.updateBeiShu(2);
                } else if (this.fangantype == 2) {
                    this.updateBeiShu(5);
                } else if (this.fangantype == 3) {
                    this.updateBeiShu(10);
                }
            case "btn_closefangan":
                this.group_beishu.active = false;
                this["box_beishu" + this.fangantype].active = false;
                this.fangantype = 1;
                this["box_beishu" + this.fangantype].active = true;
                break;
            case "btn_jtr":
                if (this.fangantype != 3) {
                    this["box_beishu" + this.fangantype].active = false;
                    this.fangantype++;
                    this["box_beishu" + this.fangantype].active = true;
                }
                break;
            case "btn_jtl":
                if (this.fangantype != 1) {
                    this["box_beishu" + this.fangantype].active = false;
                    this.fangantype--;
                    this["box_beishu" + this.fangantype].active = true;
                }
                break;
            case "fanhui":
                GameData.PauseGame = false;
                this.node.cleanup();
                GameData.onDele();
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    this.node.destroy();
                    UINode.parent = cc.find("Canvas");
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "btn_jiashi":
                VideoManager.getInstance().showVideo(() => {
                    this.addTime(null);
                })
                break;

        }
    }

    fangantype = 1;

    onwin() {
        this.node.cleanup();
        this.node.destroy();
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
    }

    addTime(even: TouchEvent, time?: number) {
        if (GameData.startTime + time <= 0) return

        // AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // GameData.PauseGame = true;
        var addtime
        time ? addtime = time : addtime = 120;
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


    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.timeText.getComponent(cc.Label).string = GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }

    onlost() {
        this.unschedule(this.Timeing);
        GameData.PauseGame = true;
        this.node.cleanup();
        this.scheduleOnce(() => {
            this.endlost("prefabs/zc/zc_lostend")
            this.node.destroy();
        }, 0.7);
    }

}
