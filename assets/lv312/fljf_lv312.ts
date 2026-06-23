import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gamedata_lv312 from "./gamedata_lv312";

const {ccclass, property} = cc._decorator;

@ccclass
export default class fljf_lv312 extends BaseGame {
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

    gameData: gamedata_lv312 = null;

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

    //垃圾桶节点
    ljtNode: cc.Node = null;

    //提示按钮节点
    btnTispNode: cc.Node = null;

    //手指动画节点
    szNodes: cc.Node[] = [];

    isTisPlaying: boolean = false;

    //结局选择界面按钮节点
    @property(cc.Node)
    btnNode: cc.Node = null;

    //死亡界面
    @property(cc.Node)
    deadPanelNode: cc.Node = null;



    protected onLoad(): void {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv312", false, 0.5);
        

        this.btnTispNode = this.node.getChildByName("btn_tis");
        this.btnTispNode.active = false;
        this.szNodes = this.node.getChildByName("sz").children;
        // this.ske = this.skeNode.children[0].getComponent(dragonBones.ArmatureDisplay);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.gameData = this.node.getComponent(gamedata_lv312);

        this.labNode = this.node.getChildByName("labbj");
        this.lab = this.labNode.children[0].getComponent(cc.Label);
        this.scrollView.content.active = false;
        this.gameStartAmotion();
        this.ljtNode = this.node.getChildByName("bg").getChildByName("ljt");
        this.skeNodes = this.node.getChildByName("bg").getChildByName("skeNodes").children;
        


    }    


    onTouchStart(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) {
            return;
        }
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.startPos = event.getLocation();
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
        this.lab.string = "您好，是要剪发吗？";
        AudioManager.playEffect("您好，是要剪发吗？", false, () => {
            this.lab.string = "找了半天，终于有家理发店了！";
            AudioManager.playEffect("找了半天，终于有家理发店了！", false, () => {
                this.labNode.active = false;
                GameData.PauseGame = false;
                this.scrollView.content.active = true;
                this.btnTispNode.active = true;
            });
        });
    }

    //滑动逻辑处理
    slideLogic(name: string, delay: cc.Vec2) {
        //下滑垃圾桶
        if (delay.y < -30 && name == "5") {
            this.ljtNode.children[0].active = false;
            AudioManager.playEffect("垃圾桶倒地");
            this.ljtNode.children[1].active = true;
            
            this.isSlide = false;
            this.gameData.gameConfig[1][4].isSlide = false;
            this.gameData.gameConfig[1][4].pos.x = -129;
            this.gameData.gameConfig[1][4].pos.y = -517;
            this.gameData.gameConfig[1][4].isAniamtion = false;
            this.eventName = "";
            this.szNodes[0].active = false;
            this.isTisPlaying = false;
        }
        //滑动脑袋
        else if (delay.x > 30 && name == "6") {
            this.ske = this.skeNodes[4].getComponent(dragonBones.ArmatureDisplay);
            this.ske.playAnimation("有红色眼睛", -1);
            this.isSlide = false;
            this.gameData.gameConfig[1][5].isSlide = false;
            this.gameData.gameConfig[1][5].isAniamtion = false;
            this.eventName = "";
            this.szNodes[1].active = false;
            this.isTisPlaying = false;
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
            case "btn_yes":
                this.gameDead();
                break;
            case "btn_no":
                this.btnNode.children[0].active = false;
                this.btnNode.children[1].active = false;
                this.labNode.active = true;
                this.lab.string = "不用了，我觉得现在的发型挺合适的";
                AudioManager.playEffect("不用了，我觉得现在的发型挺合适的", false, () => {
                    this.scheduleOnce(() => {
                        this.endwin("prefabs/zc/zc_winend");
                    }, 1);
                });
                break;
        }
    }


    //游戏死亡
    gameDead () {
        this.labNode.active = true;
        this.btnNode.children[0].active = false;
        this.btnNode.children[1].active = false;
        this.lab.string = "给我剪个时髦点的发型";
        AudioManager.playEffect("给我剪个时髦点的发型", false, () => {
            this.deadPanelNode.active = true;
            AudioManager.playEffect("失败2");
            this.ske = this.deadPanelNode.getChildByName("deadSke").getComponent(dragonBones.ArmatureDisplay);
            this.ske.playAnimation("newAnimation", 1);
            this.addOneTimeListener(this.ske, () => {
                this.scheduleOnce(() => {
                    this.endlost("prefabs/zc/zc_lostend");
                    this.node.destroy();
                }, 0.7); 
            })
        });
    }


    gameWin (){
        if (this.winValue == 10) {

            this.winLogic();
            
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
        if (name == "5") {
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
        
        this.labNode.active = true;
        this.lab.string = "您好，是要剪发吗？";
        AudioManager.playEffect("你好，需要剪发吗", false, () => {
            this.labNode.active = false;
            this.btnNode.children[0].active = true;
            this.btnNode.children[1].active = true;
            this.ske = this.skeNodes[4].getComponent(dragonBones.ArmatureDisplay);
            this.ske.playAnimation("转头", -1);
        });

    }

}
