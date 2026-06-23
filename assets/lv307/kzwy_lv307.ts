
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gamedata_lv307 from "./gamedata_lv307";

const {ccclass, property} = cc._decorator;


/**对象包装器（用于封值类型参数） */
class Ref<T>{

    value:T;

    constructor( Value:T){
        this.value = Value;
    }
}
@ccclass
export default class kzwy_lv307 extends BaseGame {


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

    gameData: gamedata_lv307 = null;

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
    


    protected onLoad(): void {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv307", false, 0.5);
        

        this.ske = this.skeNode.children[0].getComponent(dragonBones.ArmatureDisplay);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.gameData = this.node.getComponent(gamedata_lv307);

        this.labNode = this.node.getChildByName("labbj");
        this.lab = this.labNode.children[0].getComponent(cc.Label);
        this.gameStartAmotion();

    }


    onTouchStart(event: cc.Event.EventTouch){

        if (GameData.PauseGame) {
            return;
        }
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.startPos = event.getLocation();
        this.clickLogic(pos); 
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        if (!this.isSlide || GameData.PauseGame) {
            return;
        }
        let endPos = event.getLocation();
        if (this.startPos.y - endPos.y < -30) {
            this.ske.playAnimation("c2", -1);
            this.gameData.gameConfig[1][this.index].isSlide = false;
            this.isSlide = false;
            if (!this.gameData.gameConfig[1][11].isAnimation) {
                this.skeNode.children[2].active = false;
                this.lvQuanNode = cc.instantiate(this.lvQuan);
                this.lvQuanNode.position = new cc.Vec3(this.gameData.gameConfig[1][11].pos.x, this.gameData.gameConfig[1][11].pos.y, 0);
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
            isRight = this.clickCheck(clickPos, this.gameData.gameConfig[1][i].pos);
            if (isRight && !this.gameData.gameConfig[1][i].isSlide) {
                pointPos = this.gameData.gameConfig[1][i].pos;
                if (!this.gameData.gameConfig[1][i].isClick) {
                    return;
                }
                this.index = i;
                this.winValue++;
                this.gameData.gameConfig[1][i].isClick = false;
                break;
            }
            else if (isRight && this.gameData.gameConfig[1][i].isSlide) {
                this.isSlide = this.gameData.gameConfig[1][i].isSlide;
                this.index = i;
                return;
            }
            else {
                pointPos = clickPos;
            }
        }

        if (isRight) {
            //播放画圈动画
            if (this.lvQuanNode) {
                this.lvQuanNode.destroy();
                this.lvQuanNode = null;
            }
            let quan = cc.instantiate(this.quan);
            quan.position = new cc.Vec3(pointPos.x, pointPos.y, 0);
            this.node.getChildByName("bg").addChild(quan);
            quan.getComponent(dragonBones.ArmatureDisplay).playAnimation("hongquan", 1);
            AudioManager.playEffect("选中");
            this.gameData.gameConfig[1][this.index].isTip = false;
            
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
    clickCheck(clickPos:cc.Vec2,pointPos:cc.Vec2){
        if(Math.abs(clickPos.x - pointPos.x) <= 70 && Math.abs(clickPos.y - pointPos.y) <= 70 ) return true;

        else{
            return false;
        }
    }


    gameStartAmotion() {
        GameData.PauseGame = true;
        this.labNode.active = true;
        this.lab.string = "大家难得聚齐，一起拍张合照吧!";
        AudioManager.playEffect("大家难得聚齐，一起拍张合照吧", false, () => {
            this.labNode.active = false;
            GameData.PauseGame = false;
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
            if (this.gameData.gameConfig[1][i].isTip && this.gameData.gameConfig[1][i].name != "12") {
                this.lvQuanNode = cc.instantiate(this.lvQuan);
                this.lvQuanNode.position = new cc.Vec3(this.gameData.gameConfig[1][i].pos.x, this.gameData.gameConfig[1][i].pos.y, 0);
                this.node.addChild(this.lvQuanNode);
                return;
            }
            else if (this.gameData.gameConfig[1][i].isTip && this.gameData.gameConfig[1][i].name == "12" && this.gameData.gameConfig[1][i].isSlide) {
                this.skeNode.children[2].active = true;
                this.skeNode.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation("sz", 0);
                this.gameData.gameConfig[1][i].isAnimation = false;
                
            }
            
        }
    }

    gameWin (){
        if (this.winValue == 12) {


            this.scheduleOnce(() => {
                this.labNode.active = true;
                this.lab.string = "还愣着干什么，快来啊，就差你了！";
                this.ske.playAnimation("c3", 0);
                GameData.PauseGame = true;
                AudioManager.playEffect("还愣着干什么，快来啊，就差你了！", false, () => {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/zc/zc_winend");
                    }, 1);
                });
            }, 1);
        }
    }
    
    
        
}
