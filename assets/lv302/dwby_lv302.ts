import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gamedata_lv302 from "./gamedata_lv302";
import toothcollider_lv302 from "./toothcollider_lv302";

const {ccclass, property} = cc._decorator;

@ccclass
export default class dwby_lv302 extends BaseGame {

    @property(cc.Node)
    toolNode: cc.Node = null;

    @property([cc.Node])
    toolNodes: cc.Node[] = [];

    @property(cc.Node)
    lv: cc.Node = null;
    @property([cc.Prefab])
    lvPrefab: cc.Prefab[] = [];


    lvScript: toothcollider_lv302 = null;

    //关卡龙骨动画脚本
    skeScript: dragonBones.ArmatureDisplay = null;

    //右手龙骨动画脚本
    solt:dragonBones.ArmatureDisplay = null;

    //蛀牙数量
    toothNum: number = 0;

    //关卡数据
    curlv: number = 1;

    //游戏配置文件
    gameConfig: gamedata_lv302;

    //当前工具移动动画
    moveAnimationName: string = "";
    //当前工具待机动画
    waitAnimationName: string = "";

    //是否允许按钮被点击
    isClick: boolean = true;

    //是否是第一次点击使用减速
    isSpeed: boolean = true;

    //是否为特殊道具
    isSpecial: boolean = false;
    //失败次数
    failValue: number = 4;

    //失败伤心图片
    @property(cc.SpriteFrame)
    heat: cc.SpriteFrame = null;
    heatNode: cc.Node = null;
    @property(cc.SpriteFrame)
    heatwin: cc.SpriteFrame = null;

    @property(cc.Node)
    endNode: cc.Node = null;

    //医生的龙骨动画
    ysSke: dragonBones.ArmatureDisplay = null;

    //工具的位置
    toolPos: cc.Vec2 = cc.Vec2.ZERO;

    isOnce: boolean = false;

    //特殊节点
    @property(cc.Node)
    speriteNode: cc.Node = null;

    protected onLoad(): void {
        GameData.PauseGame = true;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv302", false, 0.5);
        this.gameConfig = this.node.getComponent(gamedata_lv302);
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        this.scheduleOnce(()=>{
            //启用碰撞检测
            cc.director.getCollisionManager().enabled = true;
            cc.director.getCollisionManager().enabledDebugDraw = false;
        },1);

        //实例化关卡和获取关卡脚本
        const prefabInstance = cc.instantiate(this.lvPrefab[this.curlv - 1]);
        prefabInstance.parent = this.lv;
        this.toothNum = this.gameConfig.levelCofing[this.curlv][0].tooth;
        this.lvScript = prefabInstance.getComponent("toothcollider_lv302");
        this.skeScript = prefabInstance.getComponent(dragonBones.ArmatureDisplay);
        
    
        //获取右手龙骨动画组件
        this.solt = this.toolNode.getComponent(dragonBones.ArmatureDisplay);
        this.ysSke = this.node.getChildByName("bj").getChildByName("ys").getChildByName("ys_ske").getComponent(dragonBones.ArmatureDisplay);

        //初始化道具
        this.switchTools(this.toolNodes[0], "1");
        this.heatNode = this.node.getChildByName("smt");
        //记录工具初始位置
        this.toolPos.x = this.toolNode.position.x;
        this.toolPos.y = this.toolNode.position.y;


    }


    btnControl(event: cc.Event.EventTouch) {
        switch (event.target.name) {
            case "btn_by":
                if (!this.isClick) {
                    return;
                }
                if (this.isSpecial) {
                    this.moveNodes();
                }
                else {
                    this.moveTools();
                }
                break;
            case "fanhui":
                this.openpausePanel();
                break;
            case "jiansu":
                VideoManager.getInstance().showVideo(() => {
                    this.setAnimationSpeed(0.5);
                });               
                break;
            case "resurrect":
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = false;
                    this.failValue = 4;
                    for (let i = 0; i < this.failValue; i++) {
                        this.heatNode.children[i].getComponent(cc.Sprite).spriteFrame = this.heatwin;
                        
                    }
                    this.endNode.active = false;
                })
                break;
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

    //设置整个动画的速度
    setAnimationSpeed(speed: number) {
        // if (!this.skeScript || !this.isSpeed) return;
        
        // 获取当前动画状态
        const animationState = this.skeScript.armature().animation.lastAnimationState;
        if (animationState) {
            // 设置播放速度（1.0 = 正常速度，2.0 = 2倍速，0.5 = 半速）
            animationState.timeScale = speed;
            this.isSpeed = false;
        }
    }
    



    //移动拔牙工具
    moveTools() {
        if (this.isSpecial) {
            this.isClick = false;
            this.solt.playAnimation(this.moveAnimationName, 1);
            this.addOneTimeListener(this.solt,(() => {
                this.skeScript.armature().getSlot("yaci1").displayIndex = 0;
                
                
                
                this.toolNode.x = -200;
                this.toolNode.y = -306;
                this.toolNode.scaleX = -0.8;
                this.toolNode.rotation = -90;
                this.solt.playAnimation(this.moveAnimationName, 1);
                this.addOneTimeListener(this.solt, (() => {
                    this.skeScript.armature().getSlot("yaci2").displayIndex = 0;
                    this.scheduleOnce(() => {
                        this.skeScript.armature().getSlot("yaci1").displayIndex = -1;
                        this.skeScript.armature().getSlot("yaci2").displayIndex = -1;
                        this.skeScript.armature().getSlot("zuiba").displayIndex = 1;
                        this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;
                        this.skeScript.playAnimation("kuqi", 0);
                        this.lvScript.targetNodes[2].active = true;
                        this.scheduleOnce(() => {
                            this.nextLv();
                        }, 2);
                    },1);
                }));
                
            }));
        }
        else {
            this.solt.playAnimation(this.moveAnimationName, 1);
            this.isClick = false;
        }
        
    }

    //移动电钻节点
    moveNodes(){
        this.isClick = false;
        this.speriteNode.active = true;
        AudioManager.playEffect("彩蛋2");
        cc.tween(this.speriteNode)
            .to(0.5, {x: 150})
            .call(() => {
                this.skeScript.armature().getSlot("yaci1").displayIndex = 0;
                this.speriteNode.x = -200;
                this.speriteNode.y = -306;
                // AudioManager.playEffect("彩蛋");
                cc.tween(this.speriteNode)
                    .to(0.5, {x: 150})
                    .call(() => {
                        this.skeScript.armature().getSlot("yaci2").displayIndex = 0;
                        this.speriteNode.x = -200;
                        this.speriteNode.y = -180;
                        this.speriteNode.active = false;
                        this.scheduleOnce(() => {
                            this.skeScript.armature().getSlot("yaci1").displayIndex = -1;
                            this.skeScript.armature().getSlot("yaci2").displayIndex = -1;
                            this.skeScript.armature().getSlot("zuiba").displayIndex = 1;
                            this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;
                            AudioManager.playEffect("哭泣");
                            this.skeScript.playAnimation("kuqi", 0);
                            
                            this.lvScript.targetNodes[2].active = true;
                            this.scheduleOnce(() => {
                                this.nextLv();

                            }, 2);
                        },1);
                    })
                    .start()
            })
            .start()
    }

    protected onDestroy(): void {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    }


    //切换下一关
    nextLv(){

        this.curlv++;
        if (this.curlv >= 6) {
            //胜利逻辑
            this.gameWin();
        }

        else {

            this.toolNode.active = true;
            this.switchTools(this.toolNodes[0], "1");
            this.toolNode.x = -40;
            this.toolNode.y = -30;
            this.toolNode.scaleX = 0.8;
            this.toolNode.rotation = 0;
            this.lv.children[0].destroy();
            const prefabInstance = cc.instantiate(this.lvPrefab[this.curlv - 1]);
            prefabInstance.parent = this.lv;
            this.lvScript = prefabInstance.getComponent("toothcollider_lv302");
            this.skeScript = prefabInstance.getComponent(dragonBones.ArmatureDisplay);
            this.toothNum = this.gameConfig.levelCofing[this.curlv][0].tooth;
            //重置按钮点击判断
            this.isClick = true;
            this.isOnce = false;            
        }


    }

    //工具按钮点击
    btnClick(event: cc.Event.EventTouch) {
        switch(event.currentTarget.name) {
            case "1":
                if (this.gameConfig.toolCofing[event.currentTarget.name][0].isClick){
                    return;
                }
                this.switchTools(event.currentTarget, event.currentTarget.name);
                break;
            case "2":
                if (this.gameConfig.toolCofing[event.currentTarget.name][0].isClick){
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.switchTools(event.currentTarget, event.currentTarget.name);
                    event.currentTarget.children[0].active = false;
                });
                break;
            case "3":
                if (this.gameConfig.toolCofing[event.currentTarget.name][0].isClick){
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.switchTools(event.currentTarget, event.currentTarget.name);
                    event.currentTarget.children[0].active = false;
                });
                break;
            case "4":
                if (this.gameConfig.toolCofing[event.currentTarget.name][0].isClick){
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.switchTools(event.currentTarget, event.currentTarget.name);
                    event.currentTarget.children[0].active = false;
                });
                break;
            case "5":
                if (this.gameConfig.toolCofing[event.currentTarget.name][0].isClick){
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.switchTools(event.currentTarget, event.currentTarget.name);
                    event.currentTarget.children[0].active = false;
                });
                break;
            case "6":
                if (this.gameConfig.toolCofing[event.currentTarget.name][0].isClick){
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.switchTools(event.currentTarget, event.currentTarget.name);
                    event.currentTarget.children[0].active = false;
                    this.speriteNode.active = true;
                    this.toolNode.active = false;
                });
                
                break;

        }
    }

    //切换工具
    switchTools(node: cc.Node, name: string) {
        //将其他工具的位置置零
        for (let i = 0; i < this.toolNodes.length; i++) {
            if (this.toolNodes[i].name != name) {
                this.toolNodes[i].y = 0;
                this.toolNodes[i].getComponent(cc.Sprite).spriteFrame = this.gameConfig.toolCancelSprite[i];
                this.gameConfig.toolCofing[this.toolNodes[i].name][0].isClick = false;
                if (this.toolNodes[i].children[0]) {
                    this.toolNodes[i].children[0].active = true;
                }
            }
        }
        
        this.toolNode.active = true;
        this.speriteNode.active = false;
        this.gameConfig.toolCofing[name][0].isClick = true;
        
        node.y += 30;
        node.getComponent(cc.Sprite).spriteFrame = this.gameConfig.toolChoseSprite[this.gameConfig.toolCofing[name][0].spriteIndex];
        this.solt.playAnimation(this.gameConfig.toolCofing[name][0].waitAnimationName, 0);
        if (this.gameConfig.toolCofing[name][0].waitAnimationName == "daiji1") {
            this.changeSKSlotIndex(this.solt, "qianzi", 0);
        }
        else if (this.gameConfig.toolCofing[name][0].waitAnimationName == "daiji2") {
            this.changeSKSlotIndex(this.solt, "qianzi", 1);
        }
        this.moveAnimationName = this.gameConfig.toolCofing[name][0].runAnimationName;
        this.waitAnimationName = this.gameConfig.toolCofing[name][0].waitAnimationName;
        this.isSpecial = this.gameConfig.toolCofing[name][0].isSpecial;
        if (!this.isSpecial) {
            this.toolNode.x = -40;
            this.toolNode.y = -30;
            this.toolNode.scaleX = 0.8;
            this.toolNode.rotation = 0;
        }


    }

    //游戏胜利
    gameWin(){
        this.scheduleOnce(() => {
            this.endwin("prefabs/zc/zc_winend");
        }, 1)
        
    }

    //游戏失败
    gameEnd(){
        this,this.scheduleOnce(() => {
            this.onlost();
        }, 1)
        
    }

    onlost() {
    
          
        this.scheduleOnce(() => {
            this.endNode.active = true;
            }, 0.4);
    }

    //失误判定
    gameMistake(){
        this.failValue--;
        this.heatNode.children[this.failValue].getComponent(cc.Sprite).spriteFrame = this.heat;
        if (this.failValue == 0) {
            this.gameEnd();
        }
    }
   

    
}
