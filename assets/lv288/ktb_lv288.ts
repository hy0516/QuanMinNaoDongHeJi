import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ktb_lv288 extends BaseGame {


    @property(cc.Node)
    lmNode: cc.Node = null;
    @property(cc.Node)
    lmbyNode: cc.Node = null;

    @property([cc.Node])
    bgNodes: cc.Node[] = [];


    //第一个选择框的节点
    @property(cc.Node)
    firstSelectBox: cc.Node = null;

    //第二个选择框的节点
    @property(cc.Node)
    secondSelectBox: cc.Node = null;

    //饼干破裂动画判断条件数组
    isBg: boolean[] = [false, false, false, false];

    //节点下标
    nodeIndex = 0;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    endNode: cc.Node = null;

    // 下标映射表，键为 string，值为number[]
    indexMap: Map<string, number[]>;

    //节点数组
    tempNodes: cc.Node[] = [];
    nodeMap: Map<string, cc.Vec3>;

    //按钮点击次数数组
    btnClickCounts: number[] = [0, 0, 0];
    //节点数组
    nodeArray: cc.Node[] = [];

    ismove = false;

    winValue: number = 0;

    public startTime = 300;

    //音乐计时器
    musicTime: number = 0;
    //状态
    isMusic = false;

    //记录当前游戏界面的节点
    tempNode: cc.Node = null;
    isan: boolean = false;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv288", false, 0.5);
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);


        this.nodeMap = new Map([
            ["lm", this.node.getChildByName("bg").getChildByName("lm").children[9].position.clone()],
            ["al", this.node.getChildByName("bg").getChildByName("al").children[9].position.clone()],
            ["jf", this.node.getChildByName("bg").getChildByName("jf").children[9].position.clone()],
            ["gyrs", this.node.getChildByName("bg").getChildByName("gyrs").children[9].position.clone()],
            ["yh", this.node.getChildByName("bg").getChildByName("yh").children[9].position.clone()],
            ["zgl", this.node.getChildByName("bg").getChildByName("zgl").children[9].position.clone()]
        ]);

        //初始化indexMap
        this.indexMap = new Map([
            ["lm", [6, 16, 29, 35, 0]],
            ["al", [2, 14, 25, 34, 22]],
            ["jf", [6, 13, 27, 43, 18]],
            ["gyrs", [13, 2, 32, 26, 10]],
            ["yh", [9, 19, 36, 51, 52]],
            ["zgl", [6, 25, 20, 11, 26]]

        ])
    }



    moveAndFadeOutTween(node: cc.Node, distance: number = 100, duration: number = 0.5) {
        const currentPos = node.position;
        const direction = cc.v2(currentPos.x, currentPos.y).normalize();
        AudioManager.playEffect("扣掉碎块");
        const targetPos = cc.v3(
            direction.x * distance,
            direction.y * distance,
            0
        );

        cc.tween(node)
            .by(duration, { position: targetPos, opacity: -255 })
            .call(() => {
                node.active = false;
            })
            .start();
    }


    //按钮点击事件
    BtnContor(event: cc.Event.EventTouch) {
        switch (event.target.name) {
            case "lm":
                AudioManager.playEffect("button");
                this.BtnMoveNode(event.target);
                break;
            case "jf":
                AudioManager.playEffect("button");
                this.BtnMoveNode(event.target);
                break;
            case "al":
                AudioManager.playEffect("button");
                this.BtnMoveNode(event.target);
                break;
            case "gyrs":
                AudioManager.playEffect("button");
                if (event.target.parent.name == this.firstSelectBox.name) {
                    VideoManager.getInstance().showVideo(() => {
                        this.BtnMoveNode(event.target);
                    });
                }
                else {
                    this.BtnMoveNode(event.target);
                }
                break;
            case "yh":
                AudioManager.playEffect("button");
                if (event.target.parent.name == this.firstSelectBox.name) {
                    VideoManager.getInstance().showVideo(() => {
                        this.BtnMoveNode(event.target);
                    });
                }
                else {
                    this.BtnMoveNode(event.target);
                }
                break;
            case "zgl":
                AudioManager.playEffect("button");
                if (event.target.parent.name == this.firstSelectBox.name) {
                    VideoManager.getInstance().showVideo(() => {
                        this.BtnMoveNode(event.target);
                    });
                }
                else {
                    this.BtnMoveNode(event.target);
                }
                break;
            case "btn_start":
                AudioManager.playEffect("button");
                this.startGameInit();
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(60);
                })
                break;
            case "fuhuo":
                VideoManager.getInstance().showVideo(() => {
                    this.resStart();
                })
                break;
            case "btn_fh":
                this.openpausePanel();
                break;
            default:
                break;
        }
    }

    //将节点添加进数组中
    addArray(node: cc.Node) {
        this.nodeArray.push(node);
        if (this.nodeArray.length >= 3) {
            return;
        }
        for (let i = 0; i < this.nodeArray.length; i++) {
            if (this.nodeArray[i] != null) {
                this.btnClickCounts[i] = 1;
            }
        }

    }

    //从数组中移除节点
    removeArray(node: cc.Node) {
        const index = this.nodeArray.indexOf(node);
        if (index !== -1) {
            this.nodeArray.splice(index, 1);
        }
    }

    //按钮点击移动节点操作
    BtnMoveNode(node: cc.Node) {
        for (let i = 0; i < this.btnClickCounts.length; i++) {
            //说明是第一次点击
            if (node.parent.name == this.firstSelectBox.name && this.secondSelectBox.children.length < 3) {
                //将节点的父对象设置成选择框节点
                node.parent = this.secondSelectBox;
                node.scaleX = 1;
                node.scaleY = 1;
                node.setPosition(cc.v3(0, 0, 0));
                node.getChildByName("bj").active = true;
                if (node.getChildByName("luxiang"))
                    node.getChildByName("luxiang").active = false;
                this.addArray(node);
            }
            //说明是第二次点击
            else if (node.parent.name == this.secondSelectBox.name && this.firstSelectBox.children.length < 6) {
                //将节点的父对象设置成选择框节点
                node.parent = this.firstSelectBox;
                node.scaleX = 0.8;
                node.scaleY = 0.8;
                node.setPosition(cc.v3(0, 0, 0));
                node.getChildByName("bj").active = false;
                this.removeArray(node);
            }
        }

        if (this.secondSelectBox.children.length == 3) {
            this.node.getChildByName("begin").getChildByName("btn_start").active = true;
        }
        else
            this.node.getChildByName("begin").getChildByName("btn_start").active = false;

    }

    //开始游戏 数据初始化
    startGameInit() {
        if (this.nodeArray.length < 3) {
            return;
        }
        for (let i = 0; i < this.nodeArray.length; i++) {
            this.node.getChildByName("bg").getChildByName(this.nodeArray[i].name).active = true;
            if (i === 1) {
                this.node.getChildByName("bg").getChildByName(this.nodeArray[i].name).x += 780;
            } else if (i === 2) {
                this.node.getChildByName("bg").getChildByName(this.nodeArray[i].name).x += 1560;
            }
        }
        this.node.getChildByName("bg").active = true;
        // this.node.getChildByName("begin").active = false;
        this.node.getChildByName("begin").active = false;
    }



    animateScaleMoveFade(node: cc.Node, targetScale: number = 1.3, scaleDuration: number = 1, moveDistance: number = 1560, moveDuration: number = 0.8, fadeDuration: number = 0.6) {

        // let gNode = this.node.getChildByName("bg").getChildByName(this.tempNode.name).children[0];
        // gNode.active = true;
        AudioManager.playEffect(node.parent.name);
        cc.tween(node)
            .to(scaleDuration, { scale: targetScale })
            .to(moveDuration, { x: node.x + moveDistance })
            .to(fadeDuration, { opacity: 0 })
            .start();

        // cc.tween(gNode)
        //     .to(scaleDuration, { scale: targetScale })
        //     .to(moveDuration, { x: node.x + moveDistance-10 })
        //     .to(fadeDuration, { opacity: 0 })
        //     .start();


        this.scheduleOnce(() => {
            if (this.winValue == 3) {
                this.onwin();
            }
        }, 2);
        //0node.parent.destroy();
    }

    // 节点向左渐渐移动的方法
    moveLeftTween(node: cc.Node, distance: number = 780, duration: number = 0.5) {

        cc.tween(node)
            .by(duration, { x: -distance, opacity: 255 })
            .start();
        this.ismove = true;
    }


    onwin() {
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
        return;
    }

    setTime(time: number) {
        // GameData.PauseGame = true;
        // if (this.startTime <= 0 || this.startTime + time <= 0) return
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

    Timeing() {
        if (GameData.PauseGame == true || this.startTime == 0) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            // this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {

                this.onlost();
                // this.node.destroy();
            }, 0.7);
        }
    }

    playAudio(str: string) {
        if (this.isMusic) {
            return
        }
        else {
            this.isMusic = true;
            AudioManager.playEffect(str, false, () => {
                this.isMusic = false;
            });


        }
    }

    playEff(str: string) {
        AudioManager.playEffect(str);
    }

    onlost() {


        GameData.PauseGame = false
        this.endNode.active = true;
        // this.endlost("prefabs/zc/zc_lostend");
        cc.tween(this.endNode)
            .to(0.8, { opacity: 255 })
            .start()



        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
        }, 0.4)


    }
    //复活按钮事件
    resStart() {
        this.node.getChildByName("zc_lostend").active = false;
        this.node.getChildByName("bg").getChildByName(this.tempNode.name).active = true;
        this.tempNode = this.node.getChildByName("bg").getChildByName(this.tempNode.name);
        // this.tempNode.active = true;
        // this.tempNode.setPosition(new cc.Vec2(0,0));
        for (let i = 1; i < this.tempNode.children.length; i++) {

            if (this.isBg[i - 1] == false && i < 5 && this.tempNode.children[i].name != `${this.tempNode.name}_ske` && this.isBg[i-1] != true) {
                this.tempNode.children[i].active = true;
            }
            else if(this.tempNode.children[i].name != `${this.tempNode.name}_ske`){
                this.tempNode.children[i].active = true;
            }

        }
        const targetNodes = this.nodeMap.get(this.tempNode.name);
        // console.log("1111");

        this.tempNode.children[9].position = targetNodes;
        if (this.startTime == 0) {
            this.startTime = 300;
        }

    }

    
    playAnmia(ani: dragonBones.ArmatureDisplay, name: string) {
        

        if (this.isan) {
            return
        }

        else {
            this.isan = true
            ani.playAnimation(name, 1);
            if (name == "kq") {
                ani.playAnimation("", 1);
                ani.playAnimation("kq", 1);
            }
            this.addOneTimeListener(ani, () => {
                this.isan = false;
            });
        }

    }
}
