import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gamedata_lv315 from "./gamedata_lv315";

const {ccclass, property} = cc._decorator;

@ccclass
export default class fljf_lv315 extends BaseGame {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    //龙骨动画节点
    
    skeNodes: cc.Node[] = [];

    //画圈动画预设体
    @property(cc.Prefab)
    quan: cc.Prefab = null;

    lvQuanNode: cc.Node = null;

    //画圈动画预设体
    @property(cc.Prefab)
    lvQuan: cc.Prefab = null;

    @property(cc.Prefab)
    cha: cc.Prefab = null;

    //龙骨动画数组
    ske: dragonBones.ArmatureDisplay = null;

    gameData: gamedata_lv315 = null;

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

    //事件名字
    eventName: string = "";

    

    //提示按钮节点
    btnTispNode: cc.Node = null;

    //手指动画节点
    szNodes: cc.Node[] = [];

    isTisPlaying: boolean = false;

    //手机信息图片
    picNode: cc.Node = null;




    protected onLoad(): void {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv315", false, 0.5);
        

        this.btnTispNode = this.node.getChildByName("btn_tis");
        this.btnTispNode.active = false;
        this.szNodes = this.node.getChildByName("sz").children;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.gameData = this.node.getComponent(gamedata_lv315);

        this.labNode = this.node.getChildByName("labbj");
        this.lab = this.labNode.children[0].getComponent(cc.Label);
        this.scrollView.content.active = false;
        this.gameStartAmotion();
        this.skeNodes = this.node.getChildByName("bg").getChildByName("skeNodes").children;
        this.ske = this.skeNodes[0].getComponent(dragonBones.ArmatureDisplay);
        this.picNode = this.node.getChildByName("picNode");


    }
    
    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }


    onTouchStart(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) {
            return;
        }
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.startPos = event.getLocation();
        if (this.eventName == "2") {
            this.winValue++;
            this.picNode.children[0].active = false;
            this.eventName = "";
        }
        else if (this.eventName == "4") {
            this.winValue++;
            this.picNode.children[1].active = false;
            this.eventName = "";
        }
        else
            this.clickLogic(pos);
         
    }


    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.isSlide || GameData.PauseGame)
            return;

        let endPos = event.getLocation();
        let delay = endPos.sub(this.startPos);

        this.slideLogic(this.eventName, delay);
    }


    //游戏开场播发动画
    gameStartAmotion() {
        GameData.PauseGame = true;
        this.labNode.active = true;
        this.lab.string = "亲爱的！这地方风景超赞，我要给你拍张美美照，你往后挪挪，靠近栏杆一点呗！";
        AudioManager.playEffect("亲爱的！这地方风景超赞，我要给你拍张美美照，你往后挪挪，靠近栏杆一点呗！", false, () => {
            this.lab.string = "好呀好呀！我最爱拍照了！";
            AudioManager.playEffect("好呀好呀！我最爱拍照了！", false, () => {
                this.labNode.active = false;
                GameData.PauseGame = false;
                this.scrollView.content.active = true;
                this.btnTispNode.active = true;
            });
        });
    }

    //滑动逻辑处理
    slideLogic(name: string, delay: cc.Vec2) {
        //滑动警示牌
        if (delay.x < -30 && name == "1") {
            this.changeSKSlotIndex(this.ske, "08", 0);

            this.isSlide = false;
            this.gameData.gameConfig[1][0].isAniamtion = false;
            this.gameData.gameConfig[1][0].isSlide = false;
            this.eventName = "";
            this.isTisPlaying = false;
            this.szNodes[0].active = false;
        }
        else if (delay.x < -30 && name == "6") {
            this.changeSKSlotIndex(this.ske, "03", -1);
            AudioManager.playEffect("草丛");
            this.isSlide = false;
            this.gameData.gameConfig[1][5].isAniamtion = false;
            this.gameData.gameConfig[1][5].isSlide = false;
            this.eventName = "";
            this.isTisPlaying = false;
            this.szNodes[1].active = false;
        }
    }


    /**点击范围区间 */
    clickCheck(clickPos:cc.Vec2,pointPos:cc.Vec2) {
        if(Math.abs(clickPos.x - pointPos.x) <= 70 && Math.abs(clickPos.y - pointPos.y) <= 70 ) return true;

        else{
            return false;
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
                this.eventName = this.gameData.gameConfig[1][i].name;
                break;
            }
            else if (isRight && this.gameData.gameConfig[1][i].isSlide) {
                this.isSlide = this.gameData.gameConfig[1][i].isSlide;
                this.index = i;
                this.eventName = this.gameData.gameConfig[1][i].name;
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
            let pos = this.node.convertToWorldSpaceAR(pointPos);
            let posA = this.node.getChildByName("bg").convertToNodeSpaceAR(pos);
            quan.position = new cc.Vec3(posA.x, posA.y, 0); 
            this.node.getChildByName("bg").addChild(quan);
            quan.getComponent(dragonBones.ArmatureDisplay).playAnimation("hongquan", 1);
            AudioManager.playEffect("选中");
            this.gameData.gameConfig[1][this.index].isTip = false;
            
            //切换图片
            content.children[this.sprIndex].children[0].getComponent(cc.Sprite).spriteFrame = this.gameData.sprites[this.index];
            content.children[this.sprIndex].children[0].children[0].getComponent(cc.Label).string = this.gameData.gameConfig[1][this.index].lab;
            content.children[this.sprIndex++].children[0].children[0].active = true;

            if (this.eventName == "2") {
                this.picNode.children[0].active = true;
                AudioManager.playEffect("消息弹出");
            }
            else if (this.eventName == "4") {
                AudioManager.playEffect("纸条声");
                this.picNode.children[1].active = true;
            }
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
                if (GameData.PauseGame || this.lvQuanNode != null) {
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    this.tisLogic();
                });
                
                break;
            
            
        }
    }


    


    gameWin (){
        if (this.winValue == 12) {

            this.scheduleOnce(() => {
                this.winLogic();
            }, 1);
            
            
        }
    }


    //提示逻辑
    tisLogic() {
        for (let i = 0; i < this.gameData.gameConfig[1].length; i++){
            if (this.gameData.gameConfig[1][i].isTip && !this.gameData.gameConfig[1][i].isAniamtion) {
                this.lvQuanNode = cc.instantiate(this.lvQuan);
                this.lvQuanNode.position = new cc.Vec3(this.gameData.gameConfig[1][i].pos.x, this.gameData.gameConfig[1][i].pos.y, 0);
                this.node.addChild(this.lvQuanNode);
                this.gameData.gameConfig[1][i].isTip = false;
                return;
            }

            else if (this.gameData.gameConfig[1][i].isTip && this.gameData.gameConfig[1][i].isAniamtion) {
                
                this.slideTisLogic(this.gameData.gameConfig[1][i].name);
                return;
            }
        }
    }

    //滑动特殊逻辑处理
    slideTisLogic(name: string) {

        if (this.isTisPlaying) {
            return;
        }
        if (name == "1") {
            this.szNodes[0].active = true;
            this.szNodes[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("sz", -1);
            this.isTisPlaying = true;
        }
        
        else if (name == "6") {
            this.szNodes[1].active = true;
            this.szNodes[1].getComponent(dragonBones.ArmatureDisplay).playAnimation("sz", -1);
            this.isTisPlaying = true;
        }
    }

    //游戏胜利
    winLogic () {
        
        // this.labNode.active = true;
        // this.lab.string = "您好，是要剪发吗？";
        this.ske.playAnimation("dj2", 1);
        AudioManager.playEffect("坠崖", false, () => {
            // this.labNode.active = false;

            this.scheduleOnce(() => {
                this.endwin("prefabs/zc/zc_winend");
            }, 1);
            
            
            
        });

    }

}
