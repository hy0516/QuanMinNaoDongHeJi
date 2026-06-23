import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems370 from "./moveItems370";


const {ccclass, property} = cc._decorator;

@ccclass
export default class dwbe_lv370 extends BaseGame {

    @property(cc.Node)
    xz_ske: cc.Node = null;
    @property(cc.Node)
    xl_ske: cc.Node = null;
    @property(cc.Node)
    n_ske: cc.Node = null;
    @property(cc.Node)
    p1: cc.Node = null;
    @property(cc.Node)
    p2: cc.Node = null;


    @property(cc.Node)
    black = null;
    @property(cc.Node)
    eff: cc.Node = null;
    @property(cc.Node)
    lab1: cc.Node = null;

    @property(cc.Node)
    xz: cc.Node = null;
    @property(cc.Node)
    xl: cc.Node = null;
    @property(cc.Node)
    btn_1: cc.Node = null;
    @property(cc.Node)
    btn_2: cc.Node = null;
    canjiaohu = false;

    xzCount = 0;
    xlCount = 0;
    count = 0;

    xz1:number = 0;
    xz2:number = 0;
    xz3:number = 0;

    xl1:number = 0;
    xl2:number = 0;
    xl3:number = 0;

    flag1 = 0;
    flag2 = 0;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv370",null,0.5);
            this.canjiaohu = true;
        }, 0.5);
        // this.ChangSlot(this.xz_ske, "xiaozhu", 0);
        // this.ChangSlot(this.xl_ske, "xiaolu", 0);
    }


    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
       this.canjiaohu=false;
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
               // if (this.istiaoguo) return
               this.canjiaohu=true;
                handler && handler();
            })
            .start()
    }

    BtnContor(event: cc.Event.EventTouch){
        if (!this.canjiaohu) {
            return;
        }
        switch (event.currentTarget.name) {
            case "btn1":
                this.canjiaohu = true;
                event.currentTarget.active = false;
                this.node.getChildByName("scenes1").getChildByName("btn2").active = false;
                this.ShowEff(event.currentTarget, this.eff);
                this.fadeOut(this.xz_ske, 0.5);
                this.fadeOut(this.n_ske, 0.5);
                this.scheduleOnce(() => {
                    const txtNode = this.node.getChildByName("scenes1").getChildByName("label").getChildByName("txt");
                    txtNode.getComponent(cc.Label).string = "为什么不救我";
                    AudioManager.playEffect("为什么不救我");
                    this.fadeIn(this.p1, 1.5, 255);
                    this.fadeIn(this.black, 1.5, 0);
                    this.fadeIn(this.lab1, 1.5, 255);
                    this.onlost();
                },1);
                break;

            case "btn2":
                this.canjiaohu = true;
                event.currentTarget.active = false;
                this.ShowEff(event.currentTarget, this.eff);
                this.fadeOut(this.xl_ske, 0.5);
                this.fadeOut(this.n_ske, 0.5);
                this.node.getChildByName("scenes1").getChildByName("btn1").active = false;
                this.scheduleOnce(() => {
                    const txtNode = this.node.getChildByName("scenes1").getChildByName("label").getChildByName("txt");
                    txtNode.getComponent(cc.Label).string = "我是酱板鸭";
                    AudioManager.playEffect("我是酱板鸭");
                    this.fadeIn(this.p2, 1.5, 255);
                    this.fadeIn(this.black, 1.5, 0);
                    this.fadeIn(this.lab1, 1.5, 255);
                    this.onlost();
                }, 1);
                break;

            case "btn3":
                cc.tween(this.black)
                    .to(0.3, {opacity: 255})
                    .delay(0.5)
                    .call(() => {
                        this.node.getChildByName("scenes1").active = false;
                    })
                    .start();

                this.scheduleOnce(() => {
                    this.fadeOut(this.black, 0.1);
                    this.node.getChildByName("scenes2").active = true;
                    // this.ChangSlot(this.xz.getChildByName("1"), "xiaozhu", 1);
                    // this.ChangSlot(this.xl.getChildByName("1"), "xiaolu", 1);
                }, 1);
                break;

            case "btn_1":
                this.btn_1.active = false;
                if(this.xzCount >= 4) {
                    this.xz.getChildByName("1").active = false;
                    this.xz.getChildByName("2").active = false;
                    this.xz.getChildByName("c").active = true;
                    // this.ChangSlot(this.xz.getChildByName("c"), "xiaozhu", 3);
                    this.showqp(this.xz, "主人，轮到我报恩了", "（熊猫）主人，轮到我报恩了",() =>{
                        this.flag1 = 1;
                        if(this.flag2 === 1) {
                            this.onwin();
                        } else if(this.flag2 === 2) {
                            this.onlost();
                        }
                    });
                } else {
                    this.showqp(this.xz, "你这些年一直亏待我，还想我报恩", "（熊猫）你这些年一直亏待我，还想我报恩",() =>{
                        this.flag1 = 2;
                        if(this.flag2 === 1 || this.flag2 === 2) {
                            this.onlost();
                        }
                    });
                }
                break;
            case "btn_2":
                this.btn_2.active = false;
                if(this.xlCount >= 4) {
                    this.xl.getChildByName("1").active = false;
                    this.xl.getChildByName("2").active = false;
                    this.xl.getChildByName("c").active = true;
                    // this.ChangSlot(this.xl.getChildByName("c"), "xiaolu", 3);
                    this.showqp(this.xl, "主人，轮到我报恩了", "（狐狸）主人，轮到我报恩了",() =>{
                        this.flag2 = 1;
                        if(this.flag1 === 1) {
                            this.onwin();
                        } else if(this.flag1 === 2) {
                            this.onlost();
                        }
                    });
                } else {
                    this.showqp(this.xl, "你这些年一直亏待我，还想我报恩", "（狐狸）你这些年一直亏待我，还想我报恩",() =>{
                        this.flag2 = 2;
                        if(this.flag1 === 1 || this.flag1 === 2) {
                            this.onlost();
                        }
                    });
                }
                break;
            case "fanhui":
                    this.openpausePanel();
                break;

            case "tishi":
                    this.node.getChildByName("tipsPanel");
                    VideoManager.getInstance().showVideo(()=>{
                        this.showTips();
                    });
                break;

            case "X":
                    (event.currentTarget as cc.Node).parent.active = false;
                break;
            default:
                break;
        }
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch) {
        if (!this.canjiaohu) {
            const dragComponent = even.currentTarget.getComponent(moveItems370);
            dragComponent && dragComponent.restart();
            return;
        }

        this.canjiaohu = false;
        const colls = this.node.getChildByName(`scenes2`);
        const itemNode = even.currentTarget;
        let isCollide = false;

        const bg1Target = colls.getChildByName(`bg1`);
        const bg2Target = colls.getChildByName(`bg2`);
        const xzTarget = colls.getChildByName(`xz`);
        const xlTarget = colls.getChildByName(`xl`);
        
        const xzTargets = [
            colls.getChildByName(`xz1`),
            colls.getChildByName(`xz2`),
            colls.getChildByName(`xz3`)
        ];
        const xlTargets = [
            colls.getChildByName(`xl1`),
            colls.getChildByName(`xl2`),
            colls.getChildByName(`xl3`)
        ];

        const isNodeCollide = (targetNode: cc.Node) => {
            return targetNode && targetNode.active &&
                cc.Intersection.rectRect(targetNode.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        };
        const getDistToItem = (targetNode: cc.Node) => {
            const p = targetNode.convertToWorldSpaceAR(cc.v2(0, 0));
            const q = itemNode.convertToWorldSpaceAR(cc.v2(0, 0));
            return p.sub(q).mag();
        };

        type Candidate = { node: cc.Node; dist: number; type: string; idx?: number };
        const candidates: Candidate[] = [];

        if (!this.xz.getChildByName("2").active && isNodeCollide(xzTarget))
            candidates.push({ node: xzTarget, dist: getDistToItem(xzTarget), type: "xz" });
        if (!this.xl.getChildByName("2").active && isNodeCollide(xlTarget))
            candidates.push({ node: xlTarget, dist: getDistToItem(xlTarget), type: "xl" });
        for (let i = 0; i < xzTargets.length; i++)
            if (isNodeCollide(xzTargets[i]) && this[`xz${i + 1}`] < 2)
                candidates.push({ node: xzTargets[i], dist: getDistToItem(xzTargets[i]), type: "xzSlot", idx: i });
        for (let i = 0; i < xlTargets.length; i++)
            if (isNodeCollide(xlTargets[i]) && this[`xl${i + 1}`] < 2)
                candidates.push({ node: xlTargets[i], dist: getDistToItem(xlTargets[i]), type: "xlSlot", idx: i });
        if (isNodeCollide(bg1Target) && !bg1Target.getChildByName("c").active)
            candidates.push({ node: bg1Target, dist: getDistToItem(bg1Target), type: "bg1" });
        if (isNodeCollide(bg2Target) && !bg2Target.getChildByName("c").active)
            candidates.push({ node: bg2Target, dist: getDistToItem(bg2Target), type: "bg2" });

        if (candidates.length > 0) {
            const best = candidates.reduce((a, b) => a.dist < b.dist ? a : b);
            isCollide = true;
            this.ShowEff(even.currentTarget, this.eff);
            itemNode.active = false;

            const doXzQp = () => {
                this.showqp(this.xz, `谢谢主人`, `（熊猫）谢谢主人`, () => { this.canjiaohu = true; });
            };
            const doXlQp = () => {
                this.showqp(this.xl, `谢谢主人`, `（狐狸）谢谢主人`, () => { this.canjiaohu = true; });
            };

            if (best.type === "xz") {
                this.xzCount++; this.count++;
                this.xz.getChildByName("1").active = false;
                this.xz.getChildByName("2").active = true;
                doXzQp();
            } else if (best.type === "xl") {
                this.xlCount++; this.count++;
                this.xl.getChildByName("1").active = false;
                this.xl.getChildByName("2").active = true;
                doXlQp();
            } else if (best.type === "xzSlot") {
                const i = best.idx;
                const countKey = `xz${i + 1}`;
                this.xzCount++; this.count++; this[countKey]++;
                best.node.getChildByName(`${this[countKey]}`).active = false;
                best.node.getChildByName(`${this[countKey] + 1}`).active = true;
                doXzQp();
            } else if (best.type === "xlSlot") {
                const i = best.idx;
                const countKey = `xl${i + 1}`;
                this.xlCount++; this.count++; this[countKey]++;
                best.node.getChildByName(`${this[countKey]}`).active = false;
                best.node.getChildByName(`${this[countKey] + 1}`).active = true;
                doXlQp();
            } else if (best.type === "bg1") {
                this.xzCount++; this.count++;
                bg1Target.getChildByName("c").active = true;
                doXzQp();
            } else if (best.type === "bg2") {
                this.xlCount++; this.count++;
                bg2Target.getChildByName("c").active = true;
                doXlQp();
            }
        }

        if (!isCollide) {
            const dragComponent = itemNode.getComponent(moveItems370);
            dragComponent && dragComponent.restart();
            this.canjiaohu = true;
        }
        if(this.count >= 8) {
            this.btn_1.active = true;
            this.btn_2.active = true;
        }
    }

    ChangSlot(node: cc.Node, slotName: string, index: number)
    {
        let slot = node.getComponent(dragonBones.ArmatureDisplay);
        this.changeSKSlotIndex(slot, slotName, index);
    }

    showTips() {
        this.node.getChildByName(`tipsPanel`).active = true;
        this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n`;
        if (this.node.getChildByName("scenes1").active)
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = "两个按钮合并在一起";
        else if (this.node.getChildByName("scenes2").active)
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = "钱均匀分配";
    }


    //淡入效果
    fadeIn(node: cc.Node, duration: number, value: number)
    {
        //node.opacity = 0;
        node.active = true;

        cc.tween(node)
            .to(duration, {opacity: value})
            .start();
    }

    //淡出效果
    fadeOut(node: cc.Node, duration: number){
        cc.tween(node)
            .to(duration, {opacity: 0})
            .start();
    }

    //播放特效
    ShowEff(node: cc.Node, effNode: cc.Node){
        effNode.active = true;
        effNode.x = node.x;
        effNode.y = node.y;
        let slot = effNode.getComponent(dragonBones.ArmatureDisplay);
        slot.playAnimation("yanwubaozha", 1);
        AudioManager.playEffect("道具变身", false, () => {
            effNode.active = false;
        });
        // this.schedule(() => {
        //     effNode.active = false;
        // }, 1);
    }


    //创建空节点
    CreatNode(node: cc.Node)
    {
        if (node.name == "yifu") {
            const emptyNode = new cc.Node();
            emptyNode.name = "yigui";
            node.parent.addChild(emptyNode);
            emptyNode.setPosition(127, -49, 0);
            emptyNode.width = 133;
            emptyNode.width = 177;
        }
        else if (node.name == "zhixiang"){
            const emptyNode = new cc.Node();
            emptyNode.name = "chuang";
            node.parent.addChild(emptyNode);
            emptyNode.setPosition(304, -206, 0);
            emptyNode.width = 100;
            emptyNode.width = 100;
        }
    }
    

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.endlost("prefabs/zc/zc_lostend");
            this.scheduleOnce(() => {
                //GameData.PauseGame = false;
                this.node.destroy();
            }, 2);
        }, 3)
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

}
