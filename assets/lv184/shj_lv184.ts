

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_move_lv184 from "./item_move_lv184";
import lostPanel_lv184 from "./lostPanel_lv184";
const { ccclass, property } = cc._decorator;


@ccclass
export default class shj_lv184 extends BaseGame {













    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    canjiaohu = true;




    //时间标签
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;

    /**初始时间 */
    StartTime = 15;
    /**时间 */
    curTime: number = 0;

    originalColor;//初始颜色
    isBreathing = false;//呼吸判断


    /**格子提示圈 */
    @property(cc.Node)
    gridLvquan: cc.Node = null;


    /**旁白 */
    @property(cc.Node)
    PB: cc.Node = null;

    @property(cc.PageView) // 在编辑器中将 PageView 组件拖拽到这里
    public pageView: cc.PageView = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    // 需要滚动到的目标节点
    targetNode: cc.Node = null;



    /**剩余机会 */
    health: number = 3;//m
    curnum = 0;

    /**当前关卡 */
    curlv = 1;
    /** 调试用：设为 1/2/3 直接跳到对应小关，0 为正常流程 */
    @property({ tooltip: "调试：1/2/3 跳关，0 正常" })
    debugStartLv = 0;

    /**关卡节点 */
    lvNode: cc.Node = null;

    /**关卡拼图数量 */
    puzzNum_lv1 = 18;
    puzzNum_lv2 = 14;
    puzzNum_lv3 = 10;


    /**区域1空 */
    a1_isNull = true;
    /**区域2空 */
    a2_isNull = true;
    /**区域3空 */
    a3_isNull = true;

    /**放置区域1 */
    a1: cc.Node = null;
    /**放置区域1 */
    a2: cc.Node = null;
    /**放置区域1 */
    a3: cc.Node = null;

    //放置区域数组
    putAeraList: cc.Node[] = [];

    /**角色1 */
    role_1: cc.Node = null;
    /**角色2 */
    role_2: cc.Node = null;
    /**角色3 */
    role_3: cc.Node = null;

    /**角色数组 */
    roleArry: cc.Node[] = [];

    /**咖啡女 */
    @property(cc.Node)
    Girl: cc.Node = null;

    /**汗 */
    @property(cc.Node)
    han: cc.Node = null;
    private _hanOriginalParent: cc.Node = null;
    private _hanOriginalPosition: cc.Vec3 = null;
    // //区域内角色保存
    // a1_role:cc.Node = null;
    // a2_role:cc.Node = null;
    // a3_role:cc.Node = null;


    /**目标点位 */
    point_1: cc.Node = null;
    point_2: cc.Node = null;
    point_3: cc.Node = null;

    /**目标点位数组 */
    pointList: cc.Node[] = [];

    /**当前完成拼图数 */
    curPuzz_num = 0;

    /**提示拼图数组 */
    tipsGroup: cc.Node[] = [];

    /**提示闪烁开关 */
    tipLock = true;

    /**提示连点锁 */
    lock_clickDouble = true;

    onLoad() {

        //console.log(this.han);


        GameData.PauseGame = false;

        //关闭大厅bgm
        AudioManager.stopMusic();




        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv184");
        }, 0.5);

        this.curTime = this.StartTime;
        //开始计时
        this.time.string = "距离被发现还有:" + this.curTime.toString() + "s";
        this.schedule(this.Timeing, 1);

        if (this.debugStartLv >= 1 && this.debugStartLv <= 3) {
            this.curlv = this.debugStartLv;
            const bg = this.node.getChildByName("bg");
            for (let i = 1; i <= 3; i++) {
                const lvNode = bg.getChildByName("lv" + i);
                if (lvNode) lvNode.active = (i === this.debugStartLv);
            }
        }
        //关卡加载
        this.lvUpdate();




        //设置叉号渲染层级
        //this.cha.setSiblingIndex(101);

        //    //开始计时
        //    //初始化时间label
        //    this.time.string = "时间:" + this.startTime.toString() + "s";
        //    this.schedule(this.Timeing, 1);
        //    this.huxi(this.node.getChildByName(`bg`).getChildByName(`btn_jiashi`));


    }

    /**计时器方法 */
    Timeing() {
        if (GameData.PauseGame == true || !this.canjiaohu) return;
        if (this.curTime > 0) this.curTime--;
        this.time.string = "距离被发现还有:" + this.curTime.toString() + "s";

        if (this.curTime <= 5) {
            // 变红色（只在第一次触发时执行）
            if (!this.isBreathing) {
                this.originalColor = this.time.node.color.clone(); // 保存原色
                this.time.node.color = cc.Color.RED;

                // 启动呼吸动画
                this.startBreathEffect();
                AudioManager.playEffect("倒计时5秒");
                this.isBreathing = true;
            }
        }
        if (this.curTime == 0) {

            this.unschedule(this.Timeing);
            this.stopBreathEffect();
            this.gameJudge();

        }
    }

    startBreathEffect(): void {
        const node = this.time.node;
        const target = node.parent || node;
        const widget = target.getComponent(cc.Widget);
        if (widget) widget.enabled = false;
        cc.tween(target)
            .repeatForever(cc.tween(target).to(0.5, { scale: 1.2, opacity: 150 }).to(0.5, { scale: 1, opacity: 255 }))
            .start();
    }
    stopBreathEffect(): void {
        const node = this.time.node;
        const target = node.parent || node;
        cc.Tween.stopAllByTarget(target);
        const widget = target.getComponent(cc.Widget);
        if (widget) widget.enabled = true;
        node.color = this.originalColor;
        target.scale = 1;
        target.opacity = 255;
        this.isBreathing = false;
    }
    getDialogue(index: string) {
        const dialogueMap: { [key: string]: { music: string, talk: string } } = {
            "lv1_1": { music: "刀盾狗你的盾露出来了", talk: "刀盾狗你的盾露出来了" },
            "lv1_2": { music: "比比喇布发现你了", talk: "比比喇布发现你了" },
            "lv1_3": { music: "咕咕嘎嘎原来你藏在这里啊", talk: "咕咕嘎嘎原来你藏在这里啊" },
            "lv2_1": { music: "小白菜别躲了", talk: "小白菜别躲了" },
            "lv2_2": { music: "牛角漏出来了", talk: "牛角漏出来了" },
            "lv2_3": { music: "不鸟鸟看见你的翅膀了", talk: "不鸟鸟看见你的翅膀了" },
            "lv3_1": { music: "刀盾狗你的盾露出来了", talk: "刀盾狗你的盾露出来了" },
            "lv3_2": { music: "小白菜别躲了", talk: "小白菜别躲了" },
            "lv3_3": { music: "咕咕嘎嘎原来你藏在这里啊", talk: "咕咕嘎嘎原来你藏在这里啊" },
        };
        return dialogueMap[index];
    }

    /**增加时间（重写BaseGame） */
    endAddTime() {

        this.curTime = this.curTime > 0 ? this.curTime : 1;
        this.stopBreathEffect();
        this.isBreathing = false;
        this.setTime(20);

    }
    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.curTime <= 0 || this.curTime + time <= 0) return
        this.curTime += time;
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


    /**游戏判断 */
    gameJudge() {

        GameData.PauseGame = true;

        let rightNum = 0;
        AudioManager.playEffect("我要验牌");
        cc.tween(this.Girl)
            .to(2, { position: new cc.Vec3(-104.685, this.Girl.y, 0) })
            .call(() => {
               
                for (let i = 0; i < 3; i++) {
                    const role = this.roleArry[i];
                    const roleComp = role.getComponent(item_move_lv184);

                    roleComp.hideJudge();
                    if (roleComp.isCorrect) {
                        rightNum += 1;
                        continue;
                    }

                    const ske = this.Girl.getComponent(dragonBones.ArmatureDisplay);
                    ske.playAnimation("daiji2", 1);

                    const index = this.getRoleIndex(role);
                    const dialogue = this.getDialogue(index) || { music: "", talk: "" };
                    this.showPB(dialogue.music, dialogue.talk);
                    this.addOneTimeListener(ske, () => {
                        const roleSke = role.getComponent(dragonBones.ArmatureDisplay);
                        const curAnim = roleSke.animationName || "";
                        const failAnim = curAnim.length > 0 ? curAnim.slice(0, -1) + "2" : "daiji2";
                        roleSke.playAnimation(failAnim, -1);

                        if (this.han) {
                            this._hanOriginalParent = this.han.parent;
                            this._hanOriginalPosition = this.han.position.clone();
                            this.han.parent = role;
                            const hanSke = this.han.getComponent(dragonBones.ArmatureDisplay);
                            hanSke.playAnimation("llh", 1);
                            this.han.position = role.getChildByName("0").position;

                            this.addOneTimeListener(hanSke, () => {
                                ske.playAnimation("daiji2", 1);
                                setTimeout(() => {
                                    this.showLostPanel();
                                }, 600);
                            });
                        } else {
                            ske.playAnimation("daiji2", 1);
                            setTimeout(() => {
                                this.showLostPanel();
                            }, 600);
                        }
                    })

                    break;
                }

                if (rightNum >= 3) {

                    cc.tween(this.Girl)
                        .to(2, { position: new cc.Vec3(718.984, this.Girl.y, 0) })
                        .call(() => {
                            //重置位置
                            this.Girl.x = -725.338;
                            //下一关
                            this.nextLv();
                        })
                        .start();

                }

                else {

                }


            })
            .start();





    }



    /** 复活时恢复 Girl、han、角色等节点状态 */
    restoreForFuhuo() {
        cc.Tween.stopAllByTarget(this.Girl);
        this.Girl.x = -725.338;
        const girlSke = this.Girl.getComponent(dragonBones.ArmatureDisplay);
        if (girlSke) girlSke.playAnimation("daiji1", -1);
        if (this.han && this._hanOriginalParent && cc.isValid(this._hanOriginalParent)) {
            this.han.parent = this._hanOriginalParent;
            if (this._hanOriginalPosition) {
                this.han.position = this._hanOriginalPosition.clone();
            }
        }
        this.stopBreathEffect();
        if (this.PB) {
            cc.Tween.stopAllByTarget(this.PB);
            this.PB.opacity = 0;
        }
        this.time.string = "距离被发现还有:" + this.StartTime.toString() + "s";
        this.roleArry.forEach((role) => {
            const comp = role.getComponent(item_move_lv184);
            if (comp) comp.resetForFuhuo();
        });
    }

    /**关卡加载 */
    lvUpdate() {

        this.a1_isNull = true;
        this.a2_isNull = true;
        this.a3_isNull = true;

        this.putAeraList = [];
        this.roleArry = [];
        this.pointList = [];

        this.unschedule(this.Timeing);
        this.schedule(this.Timeing, 1);
        this.curTime = this.StartTime;
        this.time.string = "距离被发现还有:" + this.curTime.toString() + "s";

        this.lvNode = this.node.getChildByName("bg").getChildByName("lv" + this.curlv);
        this.putAeraList = ["a1", "a2", "a3"].map((name) => this.lvNode.getChildByName(name));
        this.roleArry = ["role1", "role2", "role3"].map((name) => this.lvNode.getChildByName(name));
        this.pointList = ["1", "2", "3"].map((name) => this.lvNode.getChildByName(name));

        [this.a1, this.a2, this.a3] = this.putAeraList;
        [this.role_1, this.role_2, this.role_3] = this.roleArry;
        [this.point_1, this.point_2, this.point_3] = this.pointList;

        this.roleArry.forEach((role) => {
            role.getComponent(item_move_lv184).Inof(this.node);
        });
    }

    /**获取场景节点 */
    getNode() {

    }


    /**区域被占检测 */
    areaStateUpate() {

        //遍历区域
        for (let i = 0; i < this.putAeraList.length; i++) {
            let aera = this.putAeraList[i];

            let arealock = true;
            for (let j = 0; j < this.roleArry.length; j++) {

                let rolePos = new cc.Vec2(this.roleArry[j].position.x, this.roleArry[j].position.y);
                //if(j == 1&& i ==1) console.log(aera.getBoundingBox().contains(rolePos));
                if (aera.getBoundingBox().contains(rolePos)) {
                    //区域被占
                    this.setAearState(i, true);
                    //该区域在这一次方法调用中，不能被置空。
                    arealock = false;
                }

                else {
                    //一个角色也没有
                    if (j == this.roleArry.length - 1 && arealock) {
                        this.setAearState(i, false);
                    }
                }
            }
            //开锁
            arealock = true;
        }


        // console.log(this.a1_isNull);
        // console.log(this.a2_isNull);
        // console.log(this.a3_isNull);

    }

    /**区域状态设置 */
    setAearState(index: number, isTaked: boolean) {

        if (isTaked) {
            //被占
            switch (index) {

                case 0:
                    this.a1_isNull = false;
                    break;
                case 1:
                    this.a2_isNull = false;
                    break;
                case 2:
                    this.a3_isNull = false;
                    break;
            }
        }

        else {
            //置空
            switch (index) {

                case 0:
                    this.a1_isNull = true;
                    break;
                case 1:
                    this.a2_isNull = true;
                    break;
                case 2:
                    this.a3_isNull = true;
                    break;
            }
        }


    }


    /**打叉 */
    chaDisplay() {
        cc.tween(this.cha)
            .to(0.5, { scaleX: 0.3, scaleY: 0.3 })
            .call(
                () => {

                    this.cha.setScale(0);

                    //console.log(this.gou.scaleX);
                }
            )
            .start();
    }



    nextLv() {

        GameData.PauseGame = false;

        if (this.curlv >= 3) {
            this.gou.scale = 0;
            cc.tween(this.gou)
                .to(1, { scale: 1 })
                .call(() => {
                    this.onwin();
                })
                .start();

        }

        else {

            //播放音效
            AudioManager.playEffect("gou");
            cc.tween(this.gou)
                .to(1.8, { scale: 1 })
                .call(() => {
                    let lv = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString());

                    lv.active = false;

                    this.curlv += 1;

                    let lv_next = this.node.getChildByName("bg").getChildByName("lv" + this.curlv.toString());
                    if (lv_next) lv_next.active = true;

                    //关卡加载
                    this.lvUpdate();

                    this.gou.scale = 0;

                    this.curPuzz_num = 0;

                })
                .start()
        }
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                // this.node.cleanup();

                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                //     GameData.onDele();
                //     this.node.destroy();
                // })
                break;

            case "btn_tips":

                // if(!this.canjiaohu) 
                var handlers = () => {
                    this.tipsOpen();
                }

                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(() => {
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                cc.director.resume();
                break;
            //跳过
            case "btn_jiacishu":
                VideoManager.getInstance().showVideo(() => {
                    // this.nextLv();
                    this.endAddTime();
                })
                break;

        }
    }


    /**提示方法 */
    tipsOpen() {
        cc.director.pause();
        this.tipsPanel.active = true;
        ["ts1", "ts2", "ts3"].forEach((name, index) => {
            this.tipsPanel.getChildByName(name).active = index + 1 == this.curlv;
        });
    }
    onlost() {
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            GameData.PauseGame = true;
            this.showLostPanel();
        }, 0.4);
    }

    private showLostPanel() {
        AssetManager.load("lv184", "lostPanel_lv184", cc.Prefab, null, (prefab: cc.Prefab) => {
            if (!prefab) {
                cc.error("[shj_lv184] 加载 lostPanel_lv184 失败");
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
                return;
            }
            const lostNode = cc.instantiate(prefab);
            lostNode.parent = cc.find("Canvas");
            lostNode.opacity = 0;
            const lostScript = lostNode.getComponent(lostPanel_lv184) || lostNode.addComponent(lostPanel_lv184);
            lostScript.mainGame = this;
            cc.tween(lostNode).to(0.8, { opacity: 255 }).start();
        });
    }
    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.scheduleOnce(() => {
                this.node.destroy();
            }, 2);
        }, 2);
    }

    addChance() {
        VideoManager.getInstance().showVideo(() => {
            this.health += 5;
            this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string = `剩余机会:${this.health}`

        })
    }
    huxi(nodd: cc.Node) {
        cc.tween(nodd).to(1, { opacity: 0 }).call(
            () => {
                cc.tween(nodd).to(1, { opacity: 255 }).call(
                    () => {
                        this.huxi(nodd);
                    }
                ).start();
            }
        ).start();
    }
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {

        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                })
            })
            .start();
    }
    showPB(music: string, talk: string, callback?: () => void) {

        let label = this.PB.getChildByName("label");
        label.getComponent(cc.Label).string = talk;
        cc.tween(this.PB)
            .to(0.4, { opacity: 255 })
            .call(() => {

            })
            .start();

        AudioManager.playEffect(music, false, () => {
            cc.tween(this.PB)
                .to(0.4, { opacity: 0 })
                .call(() => {
                    callback && callback();
                })
                .start();
        });
    }
    /**获取角色对话序号 */
    getRoleIndex(role: cc.Node) {
        let index = role.name[role.name.length - 1];

        let Index: string = "lv" + this.curlv.toString() + "_" + index;

        return Index;
    }
    // ppNode()
    // {
    //     for (let index = 0; index < this.scrollView.content.childrenCount; index++) {
    //         const element = this.scrollView.content.children[index];
    //         //提示圈
    //         element.getChildByName(`lvquan`).active=false;
    //     }
    //     for (let index = 0; index < this.pageView.content.childrenCount; index++) {
    //         const element = this.pageView.content.children[index];
    //         element.getChildByName(`lvquan`).active=false;
    //     }
    //     var nowtipsNode=this.pageView.node.children[0].children[this.pageView.getCurrentPageIndex()].children[0];//获取当前的在的页面node
    //     if(nowtipsNode.parent.getChildByName(`gou`).active)
    //     {
    //         //当前已完成 重新寻找


    //     }
    //     for (let index = 0; index < this.scrollView.content.childrenCount; index++) {
    //         const element = this.scrollView.content.children[index];
    //         // if(element.getComponent(item_move_lv148).target===nowtipsNode)
    //         // {
    //         //     element.getChildByName(`lvquan`).active=true;
    //         //     nowtipsNode.parent.getChildByName(`lvquan`).active=true;
    //         //     this.scrollToTarget(element);

    //         // }
    //     }
    // }
    // upAndDownPage(isyou:boolean)
    // {
    //     const uppage =isyou?1:-1;
    //     //最右
    //     if(this.pageView.getCurrentPageIndex()+uppage==9)
    //     this.pageView.node.getChildByName(`btn_you`).active=false;
    //     else
    //     this.pageView.node.getChildByName(`btn_you`).active=true;
    //     if(this.pageView.getCurrentPageIndex()+uppage==0)
    //     this.pageView.node.getChildByName(`btn_zuo`).active=false;
    //     else
    //     this.pageView.node.getChildByName(`btn_zuo`).active=true;
    //     this.pageView.scrollToPage(this.pageView.getCurrentPageIndex()+uppage,1);
    // }
}

