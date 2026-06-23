import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import GameData_lv319 from "./GameData_lv319";

const {ccclass, property} = cc._decorator;

@ccclass
export default class sbwz_lv319 extends BaseGame {


    window: cc.Node = null;
    //游戏数据
    gameData: GameData_lv319 = null;

    //名单节点
    mdNode: cc.Node = null;

    //长官节点
    @property(cc.Node)
    jgNode: cc.Node = null;

    //预设体
    @property(cc.Prefab)
    skePrefab: cc.Prefab = null;

    //左节点
    @property(cc.Node)
    leftNode: cc.Node = null;

    //右节点
    @property(cc.Node)
    rightNode: cc.Node = null;

    //关卡
    curLv: number = 0;

    //左龙骨
    leftSke: dragonBones.ArmatureDisplay = null;
    //右龙骨
    rightSke: dragonBones.ArmatureDisplay = null;

    //点击条件判断
    isClick = false;

    //移动条件判断
    isMove = false;

    //烟雾节点
    @property(cc.Node)
    ywNode: cc.Node = null;

    //主角文本框
    playerLab: cc.Node = null;

    //抓捕正确节点
    arrestRightNode: cc.Node = null;
    //抓捕错误节点
    arrestErrorNode: cc.Node = null;

    //按钮数组
    btnNode: cc.Node[] = [];

    //游戏结果
    isResult = false;

    //节点数组
    answer: cc.Node[] = [];

    isObserve = false;

    @property([cc.Node])
    bzNode: cc.Node[] = [];

    //正确次数
    trueValue: number = 0;

    @property(cc.Node)
    sqp: cc.Node = null;

    @property([cc.Node])
    windows: cc.Node[] = [];

    @property(cc.Node)
    tisPanel: cc.Node = null;

    istart = false;
    
    protected onLoad(): void {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景lv319", false, 0.5);
        }, 0.5);
        

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);

        //数据初始化
        this.gameData = this.node.getComponent(GameData_lv319);
        this.startAnimation(this.gameData.musicConfig[this.curLv++].lab, () => {
            this.mdNode.getComponent(cc.Sprite).spriteFrame = this.gameData.sprite[this.curLv - 1];
            AudioManager.playEffect("纸条打开")
            this.mdNode.active = true;
            this.istart = true;
        });

        // this.startAnimation(this.gameData.musicConfig[this.curLv++].lab);
        this.mdNode = this.node.getChildByName("game").getChildByName("mdpanel");
        this.leftSke = this.leftNode.getComponent(dragonBones.ArmatureDisplay);
        this.rightSke = this.rightNode.getComponent(dragonBones.ArmatureDisplay);

        this.playerLab = this.node.getChildByName("game").getChildByName("labbj");

        this.btnNode = this.node.getChildByName("btn").children;

        this.answer = this.node.getChildByName("game").getChildByName("answer").children;
        
       
        
        


    }


    //开场移动动画
    startAnimation(str: string, handler?: Function) {
        cc.tween(this.jgNode)
            .to(0.5, {x: 0})
            .call(() => {
                this.showqp(this.jgNode.children[0], str, str, () => {
                    cc.tween(this.jgNode)
                        .to(0.5, {x: -1280})
                        .call(() => {
                            this.isClick = true;
                            handler && handler();
                        })
                        .start()
                });
            })
            .start()
    }

    //开始游戏
    startGame() {
        //展现基本名单
        
        this.startShowNode(this.leftNode, this.gameData.levelConfig[this.curLv].startSkeName);
        this.startShowNode(this.rightNode, this.gameData.levelConfig[this.curLv].startSkeName);
        this.isObserve = true;

        if (this.gameData.levelConfig[this.curLv].isBz) {
            this.bzNode[0].active = true;
            this.bzNode[1].active = true;
        }


    }

    onTouchStart(event: cc.Event.EventTouch) {

        if (!this.isClick) {
            return;
        }

        this.mdNode.active = false;
        
        if (!this.isObserve)
            this.startGame();
        

    }

    


    //展现节点
    showNode(node: cc.Node, name: string) {

        let ske = node.getComponent(dragonBones.ArmatureDisplay);
        ske.playAnimation(name, -1);

        cc.tween(node)
            .to(0.5, {opacity: 255})
            .call(() => {
                this.showqp(node.children[0], this.gameData.musicConfig[this.curLv].lab, this.gameData.musicConfig[this.curLv].lab, () => {
                    this.isMove = true;
                    this.isClick = false;
                    this.istart = true;
                });
                

            })
            .start()
    }

    startShowNode(node: cc.Node, name: string) {
        let ske = node.getComponent(dragonBones.ArmatureDisplay);
        ske.playAnimation(name, -1);

        cc.tween(node)
            .to(0.5, {opacity: 255})
            .call(() => {
                this.showqp(this.sqp, this.gameData.musicConfig[this.curLv].lab, this.gameData.musicConfig[this.curLv].musicLab, () => {
                    this.isMove = true;
                    this.isClick = false;
                });
                

            })
            .start()
    }

    //隐藏节点
    hideNode(node: cc.Node, handler?: Function) {
        cc.tween(node)
            .to(0.5, {opacity: 0})
            .call(() => {
                if (handler)
                    handler();
                // this.nextLv();
            })
            .start()
    }

    //切换关卡
    nextLv() {
        this.curLv++;
        if (this.curLv == 9 && this.trueValue == 8) {

            this.startAnimation("不愧是我们最可靠的守卫者，隐患一个不漏，基地安全全靠你", () => {
                this.scheduleOnce(() => {
                    this.endlost("prefabs/hz/endlost_hz");
                }, 8)
            });
            this.scheduleOnce(() => {
                this.endwin("prefabs/zc/zc_winend");
            }, 8)
        }
        else if (this.curLv == 9 && this.trueValue != 8) {

            this.startAnimation("你的检查到底是怎么做的？基地混进了伪装者，损失惨重！", () => {
                this.scheduleOnce(() => {
                    this.endlost("prefabs/zc/zc_lostend");
                }, 1.5)
            });
            
        }
        else {
            AudioManager.playEffect("纸条打开");
            this.mdNode.getComponent(cc.Sprite).spriteFrame = this.gameData.sprite[this.curLv - 1];
            this.mdNode.active = true;
            this.isClick = true;
            this.isObserve = false;
        }
        // this.mdNode.getComponent(cc.Sprite).spriteFrame = this.gameData.sprite[this.curLv - 1];
        // this.mdNode.active = true;
        // this.isClick = true;
        // this.isObserve = false;

        


    }

    //切换龙骨动画
    changSkeAniamtionf() {
        
        
        
        if (this.gameData.levelConfig[this.curLv].isyw) {
            //右边烟雾节点
            this.ywNode.children[0].active = true;
            this.ywNode.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("yw", 1);
            //左烟雾节点
            this.ywNode.children[1].active = true;
            this.ywNode.children[1].getComponent(dragonBones.ArmatureDisplay).playAnimation("yw", 1);
        }
        


        this.scheduleOnce(() => {
            this.ywNode.children[0].active = false;
            this.ywNode.children[1].active = false;
            this.animationJudge();

        }, 1);

    }

    //左右动画判断
    animationJudge() {
        if (this.gameData.levelConfig[this.curLv].isRight) {
            this.rightSke.playAnimation(this.gameData.levelConfig[this.curLv].gwSkeName, -1);
        }
        else if(!this.gameData.levelConfig[this.curLv].isRight){
            this.rightSke.playAnimation(this.gameData.levelConfig[this.curLv].zrSkeName, -1);
        }


        if (this.gameData.levelConfig[this.curLv].isLeft) {
            this.leftSke.playAnimation(this.gameData.levelConfig[this.curLv].gwSkeName, -1);
        }
        else if(!this.gameData.levelConfig[this.curLv].isLeft){
            this.leftSke.playAnimation(this.gameData.levelConfig[this.curLv].zrSkeName, -1);
        }
        this.btnNode[0].active = true;
        this.btnNode[1].active = true;
    }


    //按钮控制
    BtnHandler(event: cc.Event.EventTouch) {
        switch (event.currentTarget.name) {
            case "btn_right":
                this.gameResultJudge(this.rightNode, this.gameData.levelConfig[this.curLv].isRight);
                break;

            case "btn_left":
                this.gameResultJudge(this.leftNode, this.gameData.levelConfig[this.curLv].isLeft);

                break;

            case "md":
                if (!this.istart || this.mdNode.active) {
                    return;
                }
                this.mdNode.getComponent(cc.Sprite).spriteFrame = this.gameData.sprite[this.curLv - 1];
                this.mdNode.active = true;
                this.isObserve = true;
                this.isClick = true;
                AudioManager.playEffect("纸条打开");
                break;

            case "fanhui":
                AudioManager.playEffect("button");
                this.openpausePanel();
                break;

            case "X":
                AudioManager.playEffect("button");
                (event.currentTarget as cc.Node).parent.active = false;
                break;

            case "btn_tis":

                // if (this.curLv == 0) {
                //     return;
                // }
                VideoManager.getInstance().showVideo(() => {
                    // this.tisPanelNode.active = true;
                    this.showTisp();
                });
                break;
        
            default:
                break;
        }
    }

    //游戏结果判断
    gameResultJudge(node: cc.Node, isResult: boolean) {
        

        this.btnNode[0].active = false;
        this.btnNode[1].active = false;
        this.isResult = isResult;
        let ske = node.getComponent(dragonBones.ArmatureDisplay);
        if (isResult) {
            ske.playAnimation(this.gameData.levelConfig[this.curLv].xzGwName, -1);
            this.showqp(node.children[0], "你是怎么发现我的？", this.gameData.musicConfig[this.curLv].endLab, () => {
                this.arrest(node);
            });
        }

        else {
            ske.playAnimation(this.gameData.levelConfig[this.curLv].xzZrName, -1);
            //播放音效
            AudioManager.playEffect("哭泣");
            this.arrest(node);
        }
    }

    //隐藏所有节点
    hideAllNode(node: cc.Node) {
        for (let i = 0; i < node.children.length; i++) {
            node.children[i].active = false;
        }
    }


    //抓捕对象上锁链
    arrest(node: cc.Node) {
        if (this.isResult) {

            this.trueValue++;
            let zb = cc.instantiate(this.skePrefab);
            let ske = zb.getComponent(dragonBones.ArmatureDisplay);
            this.answer[this.curLv - 1].addChild(zb);
            ske.playAnimation(this.gameData.levelConfig[this.curLv].endGwSkeName, -1);

            if (this.gameData.levelConfig[this.curLv].isRight) {
                this.hideNode(this.rightNode, () => {
                    this.hideNode(this.leftNode, () => {
                        if (this.bzNode[0].active) {
                            this.hideAllNode(this.bzNode[0].getChildByName("tool"));
                            this.hideAllNode(this.bzNode[1].getChildByName("tool"));
                        }
                        this.nextLv();
                        });
                });
            }

            else if (this.gameData.levelConfig[this.curLv].isLeft) {
                this.hideNode(this.leftNode, () => {
                    this.hideNode(this.rightNode, () => {
                        if (this.bzNode[0].active) {
                            this.hideAllNode(this.bzNode[0].getChildByName("tool"));
                            this.hideAllNode(this.bzNode[1].getChildByName("tool"));
                        }
                        this.nextLv();
                        });
                })
            }
        }
        else {
            let zb = cc.instantiate(this.skePrefab);
            let ske = zb.getComponent(dragonBones.ArmatureDisplay);
            this.answer[this.curLv - 1].addChild(zb);
            ske.playAnimation(this.gameData.levelConfig[this.curLv].endZrSkeName, -1);
            if (this.gameData.levelConfig[this.curLv].isRight) {
                this.hideNode(this.rightNode, () => {
                    this.hideNode(this.leftNode, () => {
                        if (this.bzNode[0].active) {
                            this.hideAllNode(this.bzNode[0].getChildByName("tool"));
                            this.hideAllNode(this.bzNode[1].getChildByName("tool"));
                        }
                        this.nextLv();
                        });
                });
            }

            else if (this.gameData.levelConfig[this.curLv].isLeft) {
                this.hideNode(this.leftNode, () => {
                    this.hideNode(this.rightNode, () => {
                        if (this.bzNode[0].active) {
                            this.hideAllNode(this.bzNode[0].getChildByName("tool"));
                            this.hideAllNode(this.bzNode[1].getChildByName("tool"));
                        }
                        this.nextLv();
                        });
                })
            }

        }
    }


    logic(name: string) {



        
        if (this.gameData.playerConfig[this.curLv].lab) {
            this.playerLab.active = true;
            this.playerLab.children[0].getComponent(cc.Label).string = this.gameData.playerConfig[this.curLv].lab;
            AudioManager.playEffect(this.gameData.playerConfig[this.curLv].lab, false, () => {
                this.playerLab.active = false;
            });
            this.scheduleOnce(() => {
                this.changSkeAniamtionf();
                
            }, 2);
            this.scheduleOnce(() => {
                if (name != "1" && name != "5") {
                    AudioManager.playEffect(name);
                }
                // AudioManager.playEffect(name);
                this.showqp(this.rightNode.children[0], this.gameData.musicConfig[this.curLv].rightLab, 
                    this.gameData.musicConfig[this.curLv].rightLab, () => {
                        this.showqp(this.leftNode.children[0], this.gameData.musicConfig[this.curLv].leftLab, this.gameData.musicConfig[this.curLv].leftLab, () => {
                            
                        });
                    });
            }, 3);
        }

        else {
            this.changSkeAniamtionf();
            if (name != "1" && name != "5") {
                AudioManager.playEffect(name);
            }
            // AudioManager.playEffect(name);
            this.scheduleOnce(() => {
                this.playerLab.active = false;
                
                this.showqp(this.rightNode.children[0], this.gameData.musicConfig[this.curLv].rightLab, 
                    this.gameData.musicConfig[this.curLv].rightLab, () => {
                        this.showqp(this.leftNode.children[0], this.gameData.musicConfig[this.curLv].leftLab, this.gameData.musicConfig[this.curLv].leftLab, () => {

                        });
                    });
            }, 1.5);
        }
    }


    /** 对话框显示功能*/
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        var qp = qpnode.getChildByName("Lable")
        qp.getComponent(cc.Label).string = lab;
        var callfun = () =>{
          this.hideqp(qpnode, () => {
                handler();
          });
        }
        if (audioName) {
           cc.tween(qpnode)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    callfun();
                })
            })
            .start() 
        }

        else {
            cc.tween(qpnode)
            .to(0.5, { opacity: 255 })
            .delay(1)
            .call(() => {
                callfun();
            })
            .start()
        }
        
    }
    
    /**对话框隐藏 */
    hideqp(qpnode: cc.Node, handler?: Function) {
        var qp = qpnode.getChildByName("Lable");
        cc.tween(qpnode)
            .to(0.2, { opacity: 0 })
            .call(() => {
                handler && handler();
            })
            .start()
    }



    //显示提示
    showTisp() {
        this.tisPanel.active = true;
        for (let i = 1; i <= 8; i++) {
            if (!this.gameData.levelConfig[i].isTisp) {
                
                this.tisPanel.getChildByName("Label").getComponent(cc.Label).string = this.gameData.tispLab[i].lab;
                return;
            }
        }
        
    }

}
