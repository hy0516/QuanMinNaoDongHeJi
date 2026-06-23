
import player_lv207 from "../lv207/player_lv207";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gamedata_lv310 from "./gamedata_lv310";

const {ccclass, property} = cc._decorator;


/**对象包装器（用于封值类型参数） */
class Ref<T>{

    value:T;

    constructor( Value:T){
        this.value = Value;
    }
}
@ccclass
export default class kzwy_lv310 extends BaseGame {


    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    //龙骨动画节点
    @property(cc.Node)
    skeNode: cc.Node = null;

    //画圈动画预设体
    @property(cc.Prefab)
    quan: cc.Prefab = null;

    lvQuanNode: cc.Node = null;

    //画圈动画预设体
    @property(cc.Prefab)
    lvQuan: cc.Prefab = null;

    @property(cc.Prefab)
    cha: cc.Prefab = null;

    //龙骨动画
    ske: dragonBones.ArmatureDisplay = null;

    gameData: gamedata_lv310 = null;

    //文本框节点
    labNode: cc.Node = null;

    //文本框
    lab: cc.Label = null;
    isSlide: boolean = false;

    //起始坐标
    startPos: cc.Vec2 = cc.Vec2.ZERO;

    index: number = 0;

    //图片节点下标
    sprIndex: number = 0;

    //选中次数
    winValue: number = 0;
    
    //手机判断
    isPhone = false;

    phonePos: cc.Vec2 = cc.Vec2.ZERO;

    sjNode: cc.Node = null;

    quanList: cc.Node[] = [];

    gjNode: cc.Node = null;

    btnTispNode: cc.Node = null;

    @property(cc.Node)
    clNode: cc.Node = null;

    protected onLoad(): void {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv310", false, 0.5);
        
        this.btnTispNode = this.node.getChildByName("bg").getChildByName("btn_tis");
        this.ske = this.skeNode.children[0].getComponent(dragonBones.ArmatureDisplay);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.clNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        
        this.gameData = this.node.getComponent(gamedata_lv310);

        this.labNode = this.node.getChildByName("labbj");
        this.lab = this.labNode.children[0].getComponent(cc.Label);
        this.scrollView.content.active = false;
        this.btnTispNode.active = false;

        this.gameStartAmotion();

        this.changeSKSlotIndex(this.ske, "07", -1);

        this.sjNode = this.node.getChildByName("sj");
        this.gjNode = this.node.getChildByName("gj");


        


    }


    onTouchStart(event: cc.Event.EventTouch){

        if (GameData.PauseGame) {
            return;
        }
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.startPos = event.getLocation();
        if (!this.isPhone) {
            this.clickLogic(pos); 
        }
        else if (this.isPhone){

            if (this.lvQuanNode) {
                this.lvQuanNode.destroy();
                this.lvQuanNode = null;
            }
            this.sjNode.active = false;
            
            let quan = cc.instantiate(this.quan);
            quan.position = new cc.Vec3(this.phonePos.x, this.phonePos.y, 0);
            this.node.getChildByName("bg").addChild(quan);
            quan.getComponent(dragonBones.ArmatureDisplay).playAnimation("hongquan", 1);
            AudioManager.playEffect("选中");
            this.gameData.gameConfig[1][this.index].isTip = false;
            this.quanList.push(quan);
            //切换图片
            this.scrollView.content.children[this.sprIndex].children[0].getComponent(cc.Sprite).spriteFrame = this.gameData.sprites[this.index];
            this.scrollView.content.children[this.sprIndex].children[0].children[0].getComponent(cc.Label).string = this.gameData.gameConfig[1][this.index].lab;
            this.scrollView.content.children[this.sprIndex++].children[0].children[0].active = true;
            //滚动视图
            if (this.sprIndex % 3 == 0) {
                const itemWidth = 158;
                const offsetX = itemWidth * 3 * (this.sprIndex / 3);
                this.scrollView.scrollToOffset(cc.v2(offsetX, 0), 0.5);
            }
            this.isPhone = false;
            this.winValue++;
            this.gameWin();

        }
    }

    

    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.isSlide || GameData.PauseGame || event.currentTarget.name != "cl") {
            return;
        }
        let endPos = event.getLocation();
        if (this.startPos.x - endPos.x < -20) {
            this.ske.playAnimation("dj2", -1);
            AudioManager.playEffect("拉窗帘", false, () => {
                AudioManager.playEffect("变异");
            });
            
            this.gameData.gameConfig[1][11].isClick = true;
            this.gameData.gameConfig[1][this.index].isSlide = false;
            this.isSlide = false;
            //清除画圈
            this.quanList.forEach(quan => {
                quan.removeFromParent();
                quan.destroy();
            });
            this.quanList = [];
            if (!this.gameData.gameConfig[1][10].isAnimation) {
                this.skeNode.children[2].active = false;
                this.lvQuanNode = cc.instantiate(this.lvQuan);
                this.lvQuanNode.position = new cc.Vec3(96, 129, 0);
                this.node.addChild(this.lvQuanNode);
                
            }
        }
    }
    

    //点击事件触发逻辑
    clickLogic(clickPos: cc.Vec2){
        let pointPos: cc.Vec2;
        

        let content = this.scrollView.content;

        let isRight = false;
        
        for (let i = 0; i < this.gameData.gameConfig[1].length; i++){
            isRight = this.clickCheck(clickPos, this.gameData.gameConfig[1][i].pos, this.gameData.gameConfig[1][i].name);
            if (isRight && !this.gameData.gameConfig[1][i].isSlide && this.gameData.gameConfig[1][i].name != "10") {
                pointPos = this.gameData.gameConfig[1][i].pos;
                if (!this.gameData.gameConfig[1][i].isClick) {
                    if (i == 11) {
                        return;
                    }
                    else
                        continue;
                }
                this.index = i;
                this.winValue++;
                this.gameData.gameConfig[1][i].isClick = false;
                break;
            }
            else if (this.gameData.gameConfig[1][i].isSlide && this.gameData.gameConfig[1][i].name != "10") {
                if (!this.gameData.gameConfig[1][i].isClick) {
                    return;
                }
                this.isSlide = this.gameData.gameConfig[1][i].isSlide;
                this.index = i;
                return;
            }
            else if (isRight && this.gameData.gameConfig[1][i].name == "10") {

                if (!this.gameData.gameConfig[1][i].isClick) {
                    return;
                }
                this.isSlide = this.gameData.gameConfig[1][i].isSlide;
                this.index = i;
                AudioManager.playEffect("消息弹出");
                this.sjNode.active = true;
                
                
                this.isPhone = true;
                this.phonePos = this.gameData.gameConfig[1][i].pos;
                this.gameData.gameConfig[1][i].isClick = false;
                return;
            }
            else {
                pointPos = clickPos;
            }
        }

        if (isRight && !this.isPhone) {
            //播放画圈动画
            if (this.lvQuanNode) {
                this.lvQuanNode.destroy();
                this.lvQuanNode = null;
            }

            // if (this.gameData.gameConfig[1][this.index].name == "11") {
            //     this.gameData.gameConfig[1][11].isClick = true;
            // }
            let quan = cc.instantiate(this.quan);
            quan.position = new cc.Vec3(pointPos.x, pointPos.y, 0);
            this.node.getChildByName("bg").addChild(quan);
            quan.getComponent(dragonBones.ArmatureDisplay).playAnimation("hongquan", 1);
            AudioManager.playEffect("选中");
            this.gameData.gameConfig[1][this.index].isTip = false;
            this.quanList.push(quan);
            
            //切换图片
            content.children[this.sprIndex].children[0].getComponent(cc.Sprite).spriteFrame = this.gameData.sprites[this.index];
            content.children[this.sprIndex].children[0].children[0].getComponent(cc.Label).string = this.gameData.gameConfig[1][this.index].lab;
            content.children[this.sprIndex++].children[0].children[0].active = true;
            //滚动视图
            if (this.sprIndex % 3 == 0) {
                const itemWidth = 158;
                const offsetX = itemWidth * 3 * (this.sprIndex / 3);
                this.scrollView.scrollToOffset(cc.v2(offsetX, 0), 0.5);
            }
            
            this.gameWin();

        }
        else {
            //错误
            let cha = cc.instantiate(this.cha);
            cha.position = new cc.Vec3(pointPos.x, pointPos.y, 0);
            this.node.addChild(cha);
            this.scheduleOnce(() => {
                cha.destroy();
            }, 1)
            
        }


        
    }

    /**点击范围区间 */
    clickCheck(clickPos:cc.Vec2,pointPos:cc.Vec2, name: string){

        if (name == "12") {
            
            if(Math.abs(clickPos.x - pointPos.x) <= 100 && Math.abs(clickPos.y - pointPos.y) <= 100 ) return true;

            else{
                return false;
            }                
            
        }

        else {
            if(Math.abs(clickPos.x - pointPos.x) <= 70 && Math.abs(clickPos.y - pointPos.y) <= 70 ) return true;

            else{
                return false;
            }
        }


    }


    gameStartAmotion() {
        GameData.PauseGame = true;
        this.labNode.active = true;
        this.lab.string = "时间到了！想好了就马上动手，别愣着！";
        AudioManager.playEffect("时间到了！想好了就马上动手，别愣着！", false, () => {
            this.lab.string = "姐姐，不好意思了哈！";
            AudioManager.playEffect("姐姐，不好意思了哈！", false, () => {
                this.labNode.active = false;
                GameData.PauseGame = false;
                this.scrollView.content.active = true;
                this.btnTispNode.active = true;
            });
        });
    }

    //按钮控制
    btnHander(event: cc.Event.EventTouch) {
        switch(event.currentTarget.name) {
            case "fanhui":
                if (GameData.PauseGame) {
                    return;
                }
                this.openpausePanel();
                
                break;
            case "btn_tis":
                if (GameData.PauseGame || this.lvQuanNode != null || this.skeNode.children[2].active) {
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.tisLogic();
                });
                
                break;
        }
    }

    //提示逻辑
    tisLogic() {
        for (let i = 0; i < this.gameData.gameConfig[1].length; i++){
            if (this.gameData.gameConfig[1][i].isTip && this.gameData.gameConfig[1][i].name != "11") {
                this.lvQuanNode = cc.instantiate(this.lvQuan);
                this.lvQuanNode.position = new cc.Vec3(this.gameData.gameConfig[1][i].pos.x, this.gameData.gameConfig[1][i].pos.y, 0);
                this.node.addChild(this.lvQuanNode);
                return;
            }
            else if (this.gameData.gameConfig[1][i].isTip && this.gameData.gameConfig[1][i].name == "11" && this.gameData.gameConfig[1][i].isSlide) {
                this.skeNode.children[2].active = true;

                this.skeNode.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation("sz", 0);
                this.skeNode.children[2].getComponent(dragonBones.ArmatureDisplay).armature().animation.lastAnimationState.timeScale = 0.5;
                this.gameData.gameConfig[1][i].isAnimation = false;
                return;
                
            }
            
        }
    }

    gameWin (){
        if (this.winValue == 12) {
            GameData.PauseGame = true;
            this.scheduleOnce(() => {
                this.labNode.active = true;
                this.lab.string = "姐姐，我饿得不行了，我要动口了";
                this.ske.playAnimation("c3", 0);
                GameData.PauseGame = true;
                AudioManager.playEffect("姐姐，我饿得不行了，我要动口了", false, () => {
                    this.lab.string = "哼~就你演得最烂！";
                    AudioManager.playEffect("哼~就你演得最烂！", false, () => {
                        this.gjNode.active = true;
                        let gjSke = this.gjNode.getComponent(dragonBones.ArmatureDisplay);
                        AudioManager.playEffect("尾巴攻击");
                        this.gjNode.getComponent(dragonBones.ArmatureDisplay).playAnimation("gj", 1);
                        this.gjNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.lastAnimationState.timeScale = 0.5;

                        this.addOneTimeListener(gjSke, () => {
                            this.scheduleOnce(() => {
                                this.endwin("prefabs/zc/zc_winend");
                            }, 1);
                        });
                        // this.scheduleOnce(() => {
                        //     this.endwin("prefabs/zc/zc_winend");
                        // }, 1.5);
                    });
                    
                });
            }, 1);
        }

        if (this.winValue == 10) {
            this.gameData.gameConfig[1][10].isClick = true;
        }
    }


    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.clNode.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    
    
        
}
