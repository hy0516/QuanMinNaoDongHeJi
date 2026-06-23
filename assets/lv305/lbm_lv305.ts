import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gameData_lv305 from "./gameData_lv305";

const {ccclass, property} = cc._decorator;

@ccclass
export default class lbm_lv305 extends BaseGame {

    
    catNode: cc.Node = null;
    lvNodes: cc.Node[] = [];
    gameData: gameData_lv305;
    catSke: dragonBones.ArmatureDisplay = null;
    @property(cc.Node)
    ske: cc.Node = null;

    //失败伤心图片
    @property(cc.SpriteFrame)
    heat: cc.SpriteFrame = null;
    heatNode: cc.Node = null;
    @property(cc.SpriteFrame)
    heatwin: cc.SpriteFrame = null;
    @property(cc.Node)
    endNode: cc.Node = null;


    //错误次数
    errorValue: number = 3;
    //正确次数
    correvtValue: number = 0;
    //关卡
    curLv: number = 0;

    //音效节点
    effNode: cc.Node = null;

    isClick: boolean = true;
    protected onLoad(): void {

        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv305", false, 0.5);
        this.ske.active = false;
        //节点初始化
        this.gameData = this.node.getComponent(gameData_lv305);
        this.catNode = this.node.getChildByName("bj").getChildByName("mao");
        this.lvNodes = this.node.getChildByName("bj").getChildByName("lv").children;
        this.curLv = 1;
        this.catSke = this.catNode.getComponent(dragonBones.ArmatureDisplay);
        this.catSke.playAnimation("dj", 0);
        this.heatNode = this.node.getChildByName("bj").getChildByName("smt");
        this.effNode = this.node.getChildByName("music");
        this.scheduleOnce(() => {
            // 新增：校验节点是否有效
            if (!this.node || !this.effNode) return;
            this.effNode.active = true;
            // 新增：校验musicName是否存在
            const musicName = this.gameData?.lvConfig?.[this.curLv]?.[0]?.musicName;
            if (!musicName) return;
            AudioManager.playEffect(musicName, false, () => {
                // 新增：异步回调校验节点
                if (!this.node || !this.effNode) return;
                this.effNode.active = false;
                this.schedule(this.playMusic, 5);
            })
        }, 0);

    }

    //游戏按钮控制
    btnGameControl(event: cc.Event.EventTouch){
        switch (event.currentTarget.name) {
            case "right_btn":
                if (!this.isClick) {
                    return;
                }
                this.rightLogic();
                break;
            case "left_btn":
                if (!this.isClick) {
                    return;
                }
                this.leftLogic();
                break;
            case "fanhui":
                // 修改1：清理所有定时器（原仅清理playMusic）
                this.unscheduleAllCallbacks();
                // 修改2：停止所有音效，终止异步回调
                AudioManager.stopEffect();
                this.openpausePanel();
                break;
            case "resurrect":
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = false;
                    this.catSke.playAnimation("dj", 0);
                    
                    this.effNode.active = true;
                    this.isClick = true;
                    this.errorValue = 3;
                    for (let i = 0; i < this.errorValue; i++) {
                        this.heatNode.children[i].getComponent(cc.Sprite).spriteFrame = this.heatwin;
                                        
                    }
                    this.scheduleOnce(() => {
                        // 新增：校验节点是否有效
                        if (!this.node || !this.effNode) return;
                        this.effNode.active = true;
                        // 新增：校验musicName是否存在
                        const musicName = this.gameData?.lvConfig?.[this.curLv]?.[0]?.musicName;
                        if (!musicName) return;
                        AudioManager.playEffect(musicName, false, () => {
                            // 新增：异步回调校验节点
                            if (!this.node || !this.effNode) return;
                            this.effNode.active = false;
                            this.schedule(this.playMusic, 5);
                        })
                    }, 1);

                    this.endNode.active = false;
                });
                break;
        
        }
    }


    //右边物体逻辑控制
    rightLogic(){
        //改变猫的龙骨动画
        this.catSke.playAnimation("yb", 1);
        this.isClick = false;
        if (this.gameData.lvConfig[this.curLv][0].isRight) {
            this.correvtValue++;
            this.scheduleOnce(() => {
                this.ske.active = true;
                this.ske.getComponent(dragonBones.ArmatureDisplay).playAnimation("zhenbang", 1);
                AudioManager.playEffect("真棒", false);
            }, 0.5);
            
            
            this.scheduleOnce(() => {
                this.ske.active = false;
                this.nextLv();
            }, 1.5);
        }
        else {
            this.scheduleOnce(() => {
                AudioManager.playEffect("错误");
            }, 0.8);
            this.scheduleOnce(() => {
                this.gameMistake();
            }, 1.5);
        }

        // 移除重复代码
        // this.changeSKSlotIndex(this.catSke, "m1", -1);
        // this.changeSKSlotIndex(this.catSke, "m2", 0);
        // 移除重复的动画播放
        // this.catSke.playAnimation("yb", 1);
        // this.nextLv();
        
    }
    
    //左边物体逻辑控制
    leftLogic(){
        this.isClick = false;
        //改变猫的龙骨动画
        this.catSke.playAnimation("zb", 1);
        if (this.gameData.lvConfig[this.curLv][0].isLeft) {
            this.correvtValue++;
            
            this.scheduleOnce(() => {
                this.ske.active = true;
                this.ske.getComponent(dragonBones.ArmatureDisplay).playAnimation("zhenbang", 1);
                AudioManager.playEffect("真棒", false,() => {
                
                });
            }, 0.5);
            this.scheduleOnce(() => {
                this.ske.active = false;
                this.nextLv();
            }, 1.5);
            
        }
        else {
            this.scheduleOnce(() => {
                AudioManager.playEffect("错误");
            }, 0.8);
            this.scheduleOnce(() => {
                this.gameMistake();
            }, 1.5);
            
        }
        
        
    }

    //切换关卡
    nextLv(){

        if (this.curLv == 7 && this.errorValue != 0) {
            this.gameWin();
        }
        


        this.catSke.playAnimation("dj", 0);
        cc.tween(this.lvNodes[this.curLv - 1])
            .to(0.3, {opacity: 0})
            .call(() => {
                this.curLv++;
                this.unschedule(this.playMusic);
                cc.tween(this.lvNodes[this.curLv - 1])
                    .to(0.3, {opacity: 255})
                    .call(() => {
                        this.isClick = true;
                        this.scheduleOnce(() => {
                            // 新增：校验节点是否有效
                            if (!this.node || !this.effNode) return;
                            this.effNode.active = true;
                            // 新增：校验musicName是否存在
                            const musicName = this.gameData?.lvConfig?.[this.curLv]?.[0]?.musicName;
                            if (!musicName) return;
                            AudioManager.playEffect(musicName, false, () => {
                                // 新增：异步回调校验节点
                                if (!this.node || !this.effNode) return;
                                this.effNode.active = false;
                                this.schedule(this.playMusic, 5);
                            })
                        }, 0);
                    })
                    .start()
            })
            .start()
    }

    //游戏胜利
    gameWin(){
        // this.scheduleOnce(() => {
        //     this.endwin("prefabs/zc/zc_winend");
        // }, 1);
        this.unschedule(this.playMusic);
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/zc/zc_winend");
            this.node.destroy();
        }, 1);
    }

    //游戏死亡
    gameDead(){
        this.unschedule(this.playMusic);
        AudioManager.playEffect("endlost");
        this.endNode.active = true;
    }

    protected onDestroy(): void {
        // 修改：清理所有定时器（原仅清理playMusic）
        this.unscheduleAllCallbacks();
        // 新增：停止所有音效
        AudioManager.stopEffect();
    }

    //游戏错误
    gameMistake(){
        
        this.errorValue--;
        this.heatNode.children[this.errorValue].getComponent(cc.Sprite).spriteFrame = this.heat;
        if (this.errorValue == 0) {
            this.gameDead();
        }
        else {
            this.catSke.playAnimation("dj", 0);
            this.isClick = true;
        }
    }

    //重玩
    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            // console.log(UI);
            GameData.PauseGame = false;
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })

    }

    //播放音乐
    playMusic(){
        // 新增：校验节点是否有效
        if (!this.node || !this.effNode) return;
        this.effNode.active = true;
        // 新增：校验musicName是否存在
        const musicName = this.gameData?.lvConfig?.[this.curLv]?.[0]?.musicName;
        if (!musicName) return;
        AudioManager.playEffect(musicName, false, () => {
            // 新增：异步回调校验节点
            if (!this.node || !this.effNode) return;
            this.effNode.active = false;
        });
    }
}