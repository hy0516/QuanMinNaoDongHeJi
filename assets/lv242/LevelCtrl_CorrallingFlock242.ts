import Sheep_CorrallingFlock242 from "./Sheep_CorrallingFlock242";
import Wolf_CorrallingFlock242 from "./Wolf_CorrallingFlock242";

import Shepherd_CorrallingFlock242 from "./Shepherd_CorrallingFlock242";
import GameViewLogic_CorallingFlock242 from "./GameViewLogic_CorrallingFlock242";
import AnswerLogic_CorrallingFlock242 from "./AnswerLogic_CorrallingFlock242";
import CircleNode_CorrallingFlock2 from "./CircleNode_CorrallingFlock242";
import DX_Config2 from "./DX_Config242";
import DX_EventType2 from "./DX_EventType242";
import GameData from "../script/common/GameData";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;
enum music {
    gou = "finishjq",
    关卡背景lv242="关卡背景lv242",
}

@ccclass
export default class LevelCtrl_CorrallingFlock2  extends BaseGame {

    @property(cc.Prefab)
    circlePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    nextlevelPre: cc.Prefab = null;
    @property(cc.Node)
    gou:cc.Node=null;
    @property(cc.Node)
    gou2:cc.Node=null;

    private map: cc.Node = null;
    private shepherd: cc.Node = null;

    private shepherd_startNode: cc.Node = null;
    private shepherd_endNode: cc.Node = null;

    private m_nodePool: cc.NodePool = null;

    private gameViewLogic: GameViewLogic_CorallingFlock242 = null;
    private sheepArr: Sheep_CorrallingFlock242[] = null;
    private wolfArr: Wolf_CorrallingFlock242[] = null;

    private dd: cc.Node = null;
    private xx: cc.Node = null;
    private lbl_countDown: cc.Label = null;

    private points: cc.Vec2[] = [];

    /** 每个小球的直径 */
    private m_circleDiameter = 32;

    onLoad() {
        // 开启2D物理系统
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, 0);

        AudioManager.playMusic(music.关卡背景lv242, true, 0.8);


        this.map = this.node.getChildByName("map");
        this.shepherd = this.map.getComponentInChildren(Shepherd_CorrallingFlock242).node;
        this.shepherd_startNode = this.shepherd.children[0];
        this.shepherd_endNode = this.shepherd.children[1];

        this.m_nodePool = new cc.NodePool();

        this.gameViewLogic = this.map.getChildByName("GameViewLogic").getComponent(GameViewLogic_CorallingFlock242);
        this.sheepArr = this.map.getComponentsInChildren(Sheep_CorrallingFlock242);
        this.wolfArr = this.map.getComponentsInChildren(Wolf_CorrallingFlock242);

        this.dd = this.node.getChildByName("ui").getChildByName("dd");
        this.xx = this.node.getChildByName("ui").getChildByName("xx");
        this.lbl_countDown = this.node.getChildByName("ui").getChildByName("lbl_countDown").getComponent(cc.Label);
        // this.node.getChildByName("map").getComponentInChildren(dragonBones.ArmatureDisplay).getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame('yin',0);
    }

    start() {
        this.lbl_countDown.string = "";

        this.node.on(DX_EventType2.CorrallingFlock_OnDrawFinish, this.onDrawFinish, this);


        // 
        this.node.on(DX_EventType2.CrossTheRiver_OnGameFail, this.onGameFailEvent, this);

        if(this.gameViewLogic.getComponentInChildren(AnswerLogic_CorrallingFlock242)){
            this.gameViewLogic.getComponentInChildren(AnswerLogic_CorrallingFlock242).onDrawAnswer(DX_Config2.CorrallingFlock_Guide);
        }
    }
    onDestroy() {
        this.node.off(DX_EventType2.CorrallingFlock_OnDrawFinish, this.onDrawFinish, this);
        this.node.off(DX_EventType2.CrossTheRiver_OnGameFail, this.onGameFailEvent, this);

        this.m_nodePool.clear();
    }

    private m_isDrawFinish = false;
    private circleArr: cc.Node[] = [];
    onDrawFinish(event: cc.Event.EventCustom) {
        event.stopPropagation();
        let points: cc.Vec2[] = event.getUserData();
        this.m_isDrawFinish = true;

        this.shepherd.children[3].active = true;

        this.circleArr = this.GenerateCircle(points);
        let time = 5;
        // 开始倒计时
        this.schedule(() => {
            if (time == 0) {
                this.lbl_countDown.string = "";
                this.CheckGameResult();
            }
            else{
                this.lbl_countDown.string = "" + time--;
            }
        }, 1, 5, 0.01);

        this.gameViewLogic.Repaint([]);
        if(this.gameViewLogic.getComponentInChildren(AnswerLogic_CorrallingFlock242)){
            this.gameViewLogic.getComponentInChildren(AnswerLogic_CorrallingFlock242).node.destroy();
        }
    }

    /** 检测游戏结果 */
    CheckGameResult() {
        let isWin = true;
        for (let i = 0; i < this.sheepArr.length; i++) {
            if (!this.sheepArr[i].getIsSafe()) {
                this.sheepArr[i].setRedColor();
                isWin = false;
                break;
            }
        }
        if (!isWin) {
            // console.log("有羊没套到 或者 羊碰到狼");
            this.onGameFail();
            this.onlost();
        }
        else {
            // 羊安全 但是要判断是否圈到狼了
            // 羊是否在圈内
            for(let i=0;i<this.sheepArr.length;i++){
                let isSheepInCircle = cc.Intersection.pointInPolygon(this.sheepArr[i].getWorldPosition(),this.points);
                if(!isSheepInCircle){
                    // console.log("有羊没套到 失败");
                    this.sheepArr[i].setRedColor();
                    this.onGameFail();
                    this.onlost();
                    return;
                }
            }

            for (let i = 0; i < this.wolfArr.length; i++) {
                let isWolfInCircle = cc.Intersection.pointInPolygon(this.wolfArr[i].getWorldPosition(),this.points);
                if(isWolfInCircle){
                    // console.log("套到狼 失败");
                    this.wolfArr[i].setRedColor();
                    this.onGameFail();
                    this.onlost();
                    return;
                }
            }
            // console.log("没有套到狼");
            this.onGameSucc();
            this.onwin();
        }
    }
    iswin = false;
    onwin() {
        this.iswin = true;
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(() => {
                if(this.nextlevelPre)
                {
                   // console.log(this.nextlevelPre);
                    GameData.curGameName=this.nextlevelPre.name;
                    cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
                        let preNode: cc.Node = cc.instantiate(this.nextlevelPre);
                        preNode.parent = cc.find("Canvas");
                        this.node.cleanup();
                        this.node.destroy();

                    })
                }else
                {
                this.node.cleanup();
                this.node.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                }
            })
            .start()
        this.scheduleOnce(() => {
            AudioManager.playEffect(music.gou)
        }, 0.9) 
    }
    protected onlost() {
        var fun = () => {
            this.scheduleOnce(() => {
                if (this.iswin == true) {
                    this.gou2.scaleX = 0;
                    this.gou2.scaleY = 0;
                    return
                }
                GameData.PauseGame = false
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 1)
        }
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .delay(1)
            .call(() => {
                // this.jiesuanPanel.getChildByName("nz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("sb", 1);
                // this.jiesuanPanel.active = true;
                // VideoManager.getInstance().showInsert();
                fun()
            })
            // .delay(1.5)
            // .call(() => {
            //     this.jiesuanPanel.getChildByName("fail").active = true;
            // })
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
        }, 0.4)
        // AudioManager.playEffect("com_cuo");
        // this.scheduleOnce(()=>{
        //     this.endlost("prefabs/zc/zc_lostend");
        //     this.node.cleanup();
        //     this.node.destroy();
        //     GameData.PauseGame = false
        // },0.6)

    }
    public onGameSucc() {
        if (this.m_isGameOver) return;
        this.m_isGameOver = true;
        this.showSuccAni();
    }

    private m_isGameOver = false;
    public onGameFail() {
        if (this.m_isGameOver) return;
        this.unscheduleAllCallbacks();
        this.m_isGameOver = true;
        this.showFailAni();
    }
    onGameFailEvent(event:cc.Event.EventCustom){
        event.stopPropagation();
        this.onGameFail();
        this.onlost();
    }
    /** 显示一个勾勾  */
    showSuccAni() {
        console.log(`显示一个勾勾`);
        
       // window.DX_GameManager.onGameSucc();
     
    }
    /** 显示一个xx */
    showFailAni() {
        console.log(`显示一个xx`);
       // window.DX_GameManager.onGameFail();
    }



    update() {
        if (this.m_isDrawFinish) {

            let startPos = this.map.convertToNodeSpaceAR(this.shepherd_startNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
            let endPos = this.map.convertToNodeSpaceAR(this.shepherd_endNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
            if (this.circleArr.length > 20) {
                // 缩短绳子-裁剪-移除绳子首尾
                // 头
                if (this.circleArr[0].getPosition().sub(startPos).mag() < 64) {
                    this.shepherd_startNode.getComponent(cc.RopeJoint).connectedBody = this.circleArr[1].getComponent(cc.RigidBody);
                    this.shepherd_startNode.getComponent(cc.RopeJoint).apply();
                    
                    this.onDesCircleNode(this.circleArr[0]);
                    this.circleArr.splice(0, 1);
                }

                // 尾
                if (this.circleArr[this.circleArr.length - 1].getPosition().sub(endPos).mag() < 50) {
                    this.shepherd_endNode.getComponent(cc.RopeJoint).connectedBody = this.circleArr[this.circleArr.length - 2].getComponent(cc.RigidBody);
                    this.shepherd_endNode.getComponent(cc.RopeJoint).apply();
                    this.onDesCircleNode(this.circleArr[this.circleArr.length - 1]);
                    this.circleArr.pop()
                }

                this.checkCircle(startPos, endPos);
            }
            // 缩短绳子2-移动节点
            for (let i = 0; i < this.circleArr.length; i++) {
                let startPos: cc.Vec2 = this.circleArr[i].getPosition();
                let endPos: cc.Vec2;
                // 前一半
                if (i < this.circleArr.length / 2) {
                    if (i == 0) {
                        // 向起点
                        endPos = this.map.convertToNodeSpaceAR(this.shepherd_startNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
                    }
                    else {
                        // 向上一个点
                        endPos = this.circleArr[i - 1].getPosition();
                    }
                }
                else {
                    if (i == this.circleArr.length - 1) {
                        // 向终点
                        endPos = this.map.convertToNodeSpaceAR(this.shepherd_endNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
                    }
                    else {
                        // 向下一个点
                        endPos = this.circleArr[i + 1].getPosition();
                    }
                }

                this.circleArr[i].getComponent(CircleNode_CorrallingFlock2).onShorted(startPos, endPos);
            }


            // // 重绘线条
            this.points = [];
            for (let i = 0; i < this.circleArr.length; i++) {
                this.points.push(this.map.convertToWorldSpaceAR(this.circleArr[i].getPosition()));
            }
            this.points.unshift(this.shepherd_startNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
            this.points.push(this.shepherd_endNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
            this.gameViewLogic.Repaint(this.points);
        }
    }

    /** 初始化的时候-生成圆 */
    private GenerateCircle(worldPoints: cc.Vec2[]): cc.Node[] {
        // 将牧羊人两点拼在首尾 后 将下标转为map下坐标 
        worldPoints.unshift(this.shepherd.children[0].convertToWorldSpaceAR(cc.Vec2.ZERO));
        worldPoints.push(this.shepherd.children[1].convertToWorldSpaceAR(cc.Vec2.ZERO));

        for (let i = 0; i < worldPoints.length; i++) {
            worldPoints[i] = this.map.convertToNodeSpaceAR(worldPoints[i]);
        }
        /** 当前记录的位置 */
        let currPos = worldPoints[0];
        let circleArr: cc.Node[] = [];
        let lastCircle: cc.Node = null;
        // 判断与记录的点的距离 每50生成一个圆节点
        // 生成节点 链接
        while (worldPoints.length > 0) {
            let nextPos = worldPoints.shift();
            // 位置不一样 说明还没有在路径上生成所有圆节点
            while (nextPos != currPos) {
                // 判断与下个点的距离
                let sub = nextPos.sub(currPos);
                if (sub.mag() >= this.m_circleDiameter) {
                    // 超过50 向下一个点的位置移动50距离 生成一个
                    currPos = currPos.add(sub.normalize().mul(this.m_circleDiameter));
                    let circle = this.getCircleNode();
                    this.map.addChild(circle);
                    circle.setPosition(currPos);
                    circle.getComponent(cc.RigidBody).syncPosition(false);
                    circle.getComponent(CircleNode_CorrallingFlock2).setShepherd(this.shepherd);
                    // 设置距离关节
                    if (lastCircle) {
                        lastCircle.getComponent(cc.RopeJoint).connectedBody = circle.getComponent(cc.RigidBody);
                        lastCircle.getComponent(cc.RopeJoint).apply();
                    }
                    lastCircle = circle;
                    circleArr.push(circle);

                }
                else {
                    // 不超过50 
                    currPos = nextPos;
                }
            }
        }
        // 将首尾关节与牧羊人链接
        this.shepherd.children[0].getComponent(cc.RopeJoint).connectedBody = circleArr[0].getComponent(cc.RigidBody);
        this.shepherd.children[0].getComponent(cc.RopeJoint).apply();

        this.shepherd.children[1].getComponent(cc.RopeJoint).connectedBody = circleArr[circleArr.length - 1].getComponent(cc.RigidBody);
        this.shepherd.children[1].getComponent(cc.RopeJoint).apply();

        return circleArr;
    }

    private m_lastCheckTime: number = 0;

    /** 检测圆之间的间隙 补空隙 */
    checkCircle(startPos: cc.Vec2, endPos: cc.Vec2) {
        // if (Date.now() - this.m_lastCheckTime < 50) return; // 50ms内不重复检测
        // this.m_lastCheckTime = Date.now();
        // 检测第一个和起点之间
        while (this.circleArr[0].getPosition().sub(startPos).mag() > 64) {

            let circle = this.getCircleNode();
            this.map.addChild(circle);
            circle.setPosition(this.circleArr[0].getPosition().add(startPos.sub(this.circleArr[0].getPosition()).normalize().mul(this.m_circleDiameter)));
            circle.getComponent(cc.RigidBody).syncPosition(false);
            circle.getComponent(CircleNode_CorrallingFlock2).setShepherd(this.shepherd);

            // 被头链接
            this.shepherd_startNode.getComponent(cc.RopeJoint).connectedBody = circle.getComponent(cc.RigidBody);
            this.shepherd_startNode.getComponent(cc.RopeJoint).apply();
        
            // 链接下一个
            circle.getComponent(cc.RopeJoint).connectedBody = this.circleArr[0].getComponent(cc.RigidBody);
            circle.getComponent(cc.RopeJoint).apply();
            this.circleArr.unshift(circle);
        }

        // 尾
        while (this.circleArr[this.circleArr.length - 1].getPosition().sub(endPos).mag() > 60) {
            let circle = this.getCircleNode();
            this.map.addChild(circle);
            circle.setPosition(this.circleArr[this.circleArr.length - 1].getPosition().add(endPos.sub(this.circleArr[this.circleArr.length - 1].getPosition()).normalize().mul(this.m_circleDiameter)));
            circle.getComponent(cc.RigidBody).syncPosition(false);
            circle.getComponent(CircleNode_CorrallingFlock2).setShepherd(this.shepherd);
            // 被尾链接
            this.shepherd_endNode.getComponent(cc.RopeJoint).connectedBody = circle.getComponent(cc.RigidBody);
            this.shepherd_endNode.getComponent(cc.RopeJoint).apply();
            // 链接被上一个链接
            this.circleArr[this.circleArr.length - 1].getComponent(cc.RopeJoint).connectedBody = circle.getComponent(cc.RigidBody);
            this.circleArr[this.circleArr.length - 1].getComponent(cc.RopeJoint).apply();

            this.circleArr.push(circle);
        }
    }

    public getCircleNode() {
        let node: cc.Node = null;
        if (this.m_nodePool.size() > 0) {
            node = this.m_nodePool.get();
        }
        else {
            node = cc.instantiate(this.circlePrefab);
        }

        return node;
    }

    public onDesCircleNode(node: cc.Node) {
        this.m_nodePool.put(node);
    }
    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "hall":
            case "fanhui":
                GameData.PauseGame = false;
                this.node.cleanup();
                this.node.destroy();
                GameData.onDele();
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = cc.find("Canvas");
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
                case "btn_tips":
                    this.isshowVideo ? this.showTips() : VideoManager.getInstance().showVideo(() => {
                        this.showTips(); 
                        this.isshowVideo=true;
                        event.currentTarget.getChildByName("guangg").active=false;
                     });
                break;
                case "x":
                    this.node.getChildByName("tipsPanel").active=false;
                    break;
                case "btn_tiaoguo":
                    VideoManager.getInstance().showVideo(() => {
                        this.onwin();
                     });
                    break;
        }
    }
    showTips(){
        var tips=this.node.getChildByName("tipsPanel");
        tips.active=true;
    }
    
}
