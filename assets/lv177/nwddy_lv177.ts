
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_lv177 from "./item_lv177";


const { ccclass, property } = cc._decorator;

@ccclass
export default class nwddy_lv174 extends BaseGame {
    @property(cc.Node)
    lvtext: cc.Node = null;
    @property(cc.Node)
    gametext: cc.Node = null;
    @property(cc.Prefab)
    item: cc.Prefab = null;
    @property(cc.Node)
    renshou: cc.Node = null;
    @property(cc.Node)
    robotshou: cc.Node = null;
    @property(cc.Node)
    g: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    gou2: cc.Node = null;

    @property(cc.Node)
    Tips_Panel: cc.Node = null;

    //选择按键
    @property(cc.Node)
    Btn1: cc.Node = null;

    @property(cc.Node)
    Btn2: cc.Node = null;

    curlvnode: cc.Node = null;
    curlv = 1;
    nodeNumList = [8, 12, 16];

    /**人机选择递归锁 */
    robotLock: boolean = true;

    /**按键1锁 */
    btnLock_1 = true;
    /**按键2锁 */
    btnLock_2 = true;

    //可拿取数组
    //robotseleitemList: cc.Node[] = [];
    //playerseleitemList: cc.Node[] = [];
    selectimetList: cc.Node[] = [];

    //黄金忍者
    goldHero: cc.Node = null;

    //当前拿第几个忍者
    curNum: number = 0;

    seleduyao = true;
    startgame = false;
    robotSeleDuyao: cc.Node = null;

    onLoad() {
        AudioManager.stopMusic();
        this.scheduleOnce(() => { AudioManager.playMusic("关卡背景_lv174"); }, 0.5)
        GameData.PauseGame = true;
        cc.tween(this.gametext)
            .repeatForever(
                cc.tween()
                    .to(0.3, { scale: 1.1 })
                    .to(0.3, { scale: 1 })
            )
            .start()
        this.initlv();
    }
    showGameText(lab: string, iswanjia: boolean) {
        this.gametext.getComponent(cc.Label).string = lab;
        if (iswanjia) this.gametext.color = cc.color(54, 149, 6);
        else this.gametext.color = cc.color(237, 45, 45);
    }
    initlv() {
        this.lvtext.getComponent(cc.Label).string = "第" + this.curlv.toString() + "局";
        this.startgame = false;
        this.seleduyao = true;
        //重置
        // this.robotseleitemList = [];
        // this.playerseleitemList = [];
        this.selectimetList = [];
        this.goldHero = null;
        this.curNum = 0;

        this.btnLock_1 = true;
        this.btnLock_2 = true;

        GameData.PauseGame = false;

        // this.robotSeleDuyao = null;


        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString());
        if (lvnode != null) {
            lvnode.destroyAllChildren();
            lvnode.active = true;
        }


        //创建忍者
        this.createHero(lvnode);

        GameData.PauseGame = false;
        this.showGameText("我方操作", true);
    }
    /**系统选择毒药 */
    createHero(lvnode: cc.Node) {
        //选毒药
        // this.showGameText("等待对方选择毒药", false);
        // this.scheduleOnce(() => {
        //     this.startgame = true;
        //     this.showGameText("我方操作", true);
        // }, 2)


        //抽取黄金序号
        // var num = this.getRandomNumber(this.nodeNumList[this.curlv - 1] - 1);
        // console.log("random:",num);
        //循环创建忍者

        lvnode.destroyAllChildren();
        lvnode.active = true;
        for (let i = 0; i < this.nodeNumList[this.curlv - 1]; i++) {

            var item = cc.instantiate(this.item);
            item.parent = lvnode;

            //黄金
            // if(i == num){
            //     item.children[1].active = true;

            //     this.goldHero = item;
            // }
            //最后一个为黄金忍者
            if (i == this.nodeNumList[this.curlv - 1] - 1) {

                item.children[1].active = true;
                this.goldHero = item;
            }

            else {
                item.children[0].active = true;
                this.selectimetList.push(item);
            }





        }

        // //该序号已经为毒药
        // if (lvnode.children[num].getComponent(item_lv174).isduyao == true) {
        //     this.xitongseleGold();
        // } 
        // //设置该序号物品为毒药
        // else {
        //     lvnode.children[num].getComponent(item_lv174).isduyao = true;
        //     this.robotSeleDuyao = lvnode.children[num];
        //     this.robotseleitemList.splice(this.robotseleitemList.indexOf(lvnode.children[num]), 1);
        // }


    }

    //按键点击事件
    btn1_click() {
        if (this.btnLock_1) {
            this.btnLock_1 = false;
            this.btnLock_2 = false;

            cc.tween(this.Btn1)
                .to(0.2, { scale: 0.8 })
                .to(0.1, { scale: 1 })
                .call(() => {
                    this.playerSeleItem(1);
                })
                .start();
            //console.log("o");



        }

    }

    btn2_click() {
        if ((this.btnLock_2)) {
            this.btnLock_1 = false;
            this.btnLock_2 = false;
            //console.log("o");
            cc.tween(this.Btn2)
                .to(0.2, { scale: 0.8 })
                .to(0.1, { scale: 1 })
                .call(() => {
                    this.playerSeleItem(2);
                })
                .start();



        }
    }

    playerSeleItem(Btntype: number) {
        GameData.PauseGame = true;

        // this.btnLock_1 = false;
        // this.btnLock_2 = false;
        //人机递归开锁
        this.robotLock = true;

        //let num
        let po;
        //if (this.playerseleitemList.length == 1) num = 0;
        //else num = this.getRandomNumber(this.playerseleitemList.length - 1);


        // var playerseleitem = this.playerseleitemList[this.curNum];
        var playerseleitem = this.selectimetList[0];


        var startpoi = this.renshou.position;
        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        if (playerseleitem != null) {

            var wpo = lvnode.convertToWorldSpaceAR(playerseleitem.position);
            po = this.node.getChildByName("bg").convertToNodeSpaceAR(wpo);


        }


        else {
            let wpo = lvnode.convertToWorldSpaceAR(this.goldHero.position);
            po = this.node.getChildByName("bg").convertToNodeSpaceAR(wpo);
        }

        AudioManager.playEffect("dl_qg1");


        cc.tween(this.renshou)
            .to(0.5, { x: po.x, y: po.y }, cc.easeBackIn())
            .call(() => {

                if (playerseleitem != null) {
                    //普通忍者
                    playerseleitem.children[0].active = false;
                    // this.playerseleitemList.splice(this.curNum, 1);
                    // this.robotseleitemList.splice(this.curNum, 1);
                    this.selectimetList.splice(this.curNum, 1);

                    //this.curNum += 1;
                }

                else {

                    this.goldHero.active = false;
                }

            })
            .to(0.5, { x: startpoi.x, y: startpoi.y }, cc.easeBackIn())
            .call(() => {
                //if (item.getComponent(item_lv165).isduyao == true) this.shu();
                //else {


                if (playerseleitem != null) {
                    if (Btntype == 1) {
                        this.showGameText("对方操作", false);
                        this.scheduleOnce(() => {
                            this.robotSeleItem();
                        }, 0.5);
                    }

                    if (Btntype == 2) {
                        this.showGameText("对方操作", false);
                        this.scheduleOnce(() => {
                            this.playerSeleItem(1);
                        }, 0.5);
                    }
                }

                else {
                    this.scheduleOnce(() => {
                        this.ying();
                    }, 0.5);
                }



                // }
            })
            .start()
    }

    robotSeleItem() {

        let po;
        // if (this.robotseleitemList.length == 1) num = 0;
        // else num = this.getRandomNumber(this.robotseleitemList.length - 1);
        // var robotseleitem = this.robotseleitemList[num];

        // if (this.selectimetList.length == 1) num = 0;
        // else num = this.getRandomNumber(this.selectimetList.length - 1);
        var robotseleitem = this.selectimetList[0];



        var startpoi = this.robotshou.position;
        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        if (robotseleitem != null) {
            let wpo = lvnode.convertToWorldSpaceAR(robotseleitem.position);
            po = this.node.getChildByName("bg").convertToNodeSpaceAR(wpo);
        }

        else {
            let wpo = lvnode.convertToWorldSpaceAR(this.goldHero.position);
            po = this.node.getChildByName("bg").convertToNodeSpaceAR(wpo);
        }

        AudioManager.playEffect("dl_qg1");
        cc.tween(this.robotshou)
            .to(0.5, { x: po.x, y: po.y }, cc.easeBackIn())
            .call(() => {

                if (robotseleitem != null) {
                    //普通忍者
                    robotseleitem.children[0].active = false;

                    // this.robotseleitemList.splice(this.curNum, 1);
                    // this.playerseleitemList.splice(this.curNum, 1);
                    this.selectimetList.splice(this.curNum, 1);
                    //this.curNum += 1;
                }

                else {

                    this.goldHero.active = false;


                }

            })
            .to(0.5, { x: startpoi.x, y: startpoi.y }, cc.easeBackIn())
            .call(() => {
                //if (robotseleitem.getComponent(item_lv165).isduyao == true) this.ying();
                //   else {
                this.showGameText("我方操作", true);
                // this.scheduleOnce(() => {
                //this.startgame = true;
                // }, 1)


                let num; //随机数，是否回调两次
                if (robotseleitem == null) {
                    this.scheduleOnce(() => {
                        this.shu();
                    }, 0.5);
                }

                else {

                    //第二次递归
                    if (this.robotLock == false) {
                        num = 2; //不再递归
                    }
                    else {
                        num = this.getRandomNumber(2);
                    }

                    if (num == 1 && this.robotLock) {
                        this.robotSeleItem();
                        this.robotLock = false;
                    }
                }
                this.scheduleOnce(() => {

                    //console.log("11111");
                    //不再递归时（只一次：num==2,第二次：num==2 ）
                    if (num == 2) {
                        //按键开锁
                        this.btnLock_1 = true;
                        this.btnLock_2 = true;

                        GameData.PauseGame = false;
                    }
                }, 0.5);


                //  }
            })
            .start()
    }

    private getRandomNumber(count: number): number {
        return Math.floor(Math.random() * count) + 1;
    }

    win() {
        var handler = () => {
            this.scheduleOnce(() => {
                this.unschedule(this.Timeing);
                GameData.PauseGame = true;
                this.node.cleanup();
                AudioManager.stopEffect()
                this.endwin("prefabs/zc/zc_winend");
                this.node.destroy();
            }, 0.5);
        }
        this.g.active = true;
        this.g.scale = 0;

        cc.Tween.stopAllByTarget(this.g);
        cc.tween(this.g)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .call(() => {
                handler && handler();
            })
            .start()
    }

    shu() {
        //按键隐藏
        this.Btn1.active = false;
        this.Btn2.active = false;

        this.gou2.active = true;
        var group = this.gou2.getChildByName("group");
        group.scale = 0;
        cc.Tween.stopAllByTarget(group);
        cc.tween(group)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .call(() => {


            })
            .start()
        AudioManager.playEffect("com_cuo");
    }

    ying() {

        //按键隐藏
        this.Btn1.active = false;
        this.Btn2.active = false;

        if (this.curlv >= 3) {
            this.win();
            return
        }
        this.gou.active = true;
        var group = this.gou.getChildByName("group");
        group.scale = 0;
        cc.Tween.stopAllByTarget(group);
        cc.tween(group)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .call(() => {

            })
            .start()
        AudioManager.playEffect("finishjq");
    }


    hidetips() {
        this.node.getChildByName("tipsNode").active = false;
    }
    showTip() {
        if (GameData.PauseGame) return;
        VideoManager.getInstance().report("tipsVideo", { name: GameData.curGameName, complet: 0 })
        VideoManager.getInstance().showVideo(() => {
            this.Tips_Panel.active = true;
        })

    }
    cha() {
        this.Tips_Panel.active = false;
    }

    tiaoguo() {
        if (GameData.PauseGame) return;
        VideoManager.getInstance().showVideo(() => {

            if (this.curlv == 3) {
                this.win();
            }

            else {
                cc.tween(this.g)
                    .to(1.8, { scale: 1 })
                    .call(() => {
                        this.scheduleOnce(() => {

                            this.g.scale = 0;
                            this.gameEndNextLv();

                        }, 1);

                    })
                    .start();
            }

        })


    }
    isshowVideo = false;
    fanhui() {
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    addTime(even: TouchEvent, time?: number) {
        // if (GameData.startTime + time <= 0) return

        // AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // // GameData.PauseGame = true;
        // var addtime
        // time ? addtime = time : addtime = 60;
        // GameData.startTime += addtime;
        // this.Timeing();
        // var fuhao = "";
        // if (addtime > 0) fuhao = "+";
        // this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
        // cc.Tween.stopAllByTarget(this.addtimetips);
        // cc.tween(this.addtimetips)
        //     .to(0.2, { opacity: 255 })
        //     .delay(0.5)
        //     .to(0.1, { opacity: 0 })
        //     .call(() => {
        //         // GameData.PauseGame = false;
        //     })
        //     .start();

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
        // if (GameData.PauseGame == true) return;
        // GameData.startTime--;
        // this.time.string = "时间:" + GameData.startTime.toString() + "s";
        // if (GameData.startTime == 0) {
        //     this.unschedule(this.Timeing);
        //     setTimeout(() => {
        //         this.endlost("prefabs/hz/endlost_hz");
        //     }, 600);
        // }
    }

    gameEndReStart() {
        //按键恢复
        this.Btn1.active = true;
        this.Btn2.active = true;

        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        this.gou2.active = false;
        this.initlv();
        // var group = this.gou2.getChildByName("group");
        // cc.Tween.stopAllByTarget(group);
        // cc.tween(group)
        //     .delay(0.3)
        //     .to(0.8, { scale: 0 })
        //     .call(() => {

        //     })
        //     .start()
    }
    gameEndNextLv() {




        //按键恢复
        this.Btn1.active = true;
        this.Btn2.active = true;

        var lvnode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString())
        lvnode.destroyAllChildren();
        lvnode.active = false;
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // var group = this.gou.getChildByName("group");
        this.gou.active = false;
        this.curlv++;


        this.initlv();


        // cc.Tween.stopAllByTarget(group);
        // cc.tween(group)
        //     .delay(0.3)
        //     .to(0.8, { scale: 0 })
        //     .call(() => {

        //     })
        //     .start()
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

