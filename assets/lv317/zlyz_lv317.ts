import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gameConfig_lv317 from "./gameconfig_lv317";

const {ccclass, property} = cc._decorator;

@ccclass
export default class zlyz_lv317 extends BaseGame {


    bhNodes: cc.Node[] = [];

    index: number[] = [];

    zkNodes: cc.Node[] = [];

    //图片下标
    picIndex = 0;

    gameData: gameConfig_lv317 = null;


    //勾和差的节点
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;


    //提示界面节点
    tisPanelNode: cc.Node = null;


    winValue: number = 0;


    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    lab: cc.Label = null

    public startTime = 180;

    @property(cc.Node)
    pyNode: cc.Node = null;

    py: string = "";

    @property(cc.Prefab)
    end_lost: cc.Prefab = null;

    //重复节点
    @property(cc.Node)
    cfNode: cc.Node = null;


    


    protected onLoad(): void {
        
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv315", false, 0.5);

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        cc.director.getCollisionManager().enabled = true;
        this.zkNodes = this.node.getChildByName("bj").getChildByName("zk").children;
        this.bhNodes = this.node.getChildByName("bj").getChildByName("bh").children;
        this.gameData = this.node.getComponent(gameConfig_lv317);
        this.clearAllStroke();
        this.lab = this.node.getChildByName("lab").getComponent(cc.Label);

        this.tisPanelNode = this.node.getChildByName("tipsPanel");

    }


    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        cc.director.getCollisionManager().enabled = false;
    }

    onTouchStart(event: cc.Event.EventTouch) {
        const touchPos = event.getLocation();
        // 遍历所有子节点，检测是否有碰撞组件并判断触摸点是否在碰撞区域内
        for (let child of this.bhNodes) {
            
            //检测 PolygonCollider
            const polyCollider = child.getComponent(cc.PolygonCollider);
            if (polyCollider && polyCollider.points && polyCollider.points.length > 0) {
                const localPos = child.convertToNodeSpaceAR(touchPos);
                if (cc.Intersection.pointInPolygon(localPos, polyCollider.points)) {
                    
                    AudioManager.playEffect("点击");
                    child.active = !child.active;
                    if (child.active)
                        this.addIndexs(child.parent.children.indexOf(child) + 1);
                    else
                        this.deletSingelIndex(child.parent.children.indexOf(child) + 1);
                        
                    
                    
                }
            }
            
        }
        
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = false;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
                // this.node.destroy();
            }, 0.7);
        }
    }

    endAddTime(): void {
        this.startTime += 60;
        this.Timeing();
        this.schedule(this.Timeing, 1);
        // this.endNode.active = false;
    }
    

    //按钮控制
    BtnHandler(event: cc.Event.EventTouch) {
        switch (event.currentTarget.name) {
            case "btn_cz":
                this.clearAllStroke();
                this.index = [];
                break;
            
            case "btn_tj":
                this.logic();
                // this.clearAllStroke();
                // this.index = [];
                break;

            case "btn_jiashi":
                AudioManager.playEffect("button");
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(60);
                });
                break;

            case "btn_tis":
                VideoManager.getInstance().showVideo(() => {
                    // this.tisPanelNode.active = true;
                    this.showTips();
                });
                break;

            case "X":
                AudioManager.playEffect("button");
                (event.currentTarget as cc.Node).parent.active = false;
                break;

            case "fanhui":
                AudioManager.playEffect("button");
                this.openpausePanel();
                break;
            default:
                break;
        }
    }

    //加时
    setTime(time: number) {
        // GameData.PauseGame = true;
        
        if (this.startTime <= 0 || this.startTime + time <= 0) return
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

    //添加下标到数组中
    addIndexs(value: number) {
        for (let i = 0; i <= this.index.length; i++) {
            if (value != this.index[i]) {

                this.index.push(value);
                return;
            }
        }
    }


    //清空所有笔画
    clearAllStroke() {
        for (let child of this.bhNodes) {
            child.active = false;
        }
    }

    //删除单个数据
    deletSingelIndex(value: number) {
        for (let i = 0; i < this.index.length; i++) {
            if (this.index[i] == value) {
                this.index.splice(i, 1);
                return;
            }
        }
    }


    //在字框中添加汉字
    changSperiteForm(value: number){
        this.gou.active = true;
        this.pyNode.active = true;
        this.pyNode.getComponent(cc.Label).string = this.py;
        this.scheduleOnce(() => {
            this.gou.active = false;
            this.pyNode.active = false;
            this.clearAllStroke();
            this.index = [];
            
        }, 1);
        this.winValue++;
        this.lab.string = this.winValue + "/17";
        for (let i = 0; i < this.zkNodes.length; i++) {
            if (this.zkNodes[i].children[0].getComponent(cc.Sprite).spriteFrame == null) {
                this.zkNodes[i].children[0].getComponent(cc.Sprite).spriteFrame = this.gameData.sprites[value];
                this.gameData.ziIndex[value + 1].isPlay = true;
                
                return;
            }
        }
    }

    //逻辑判断
    logic() {
        if (this.index.length == 21) {
            this.changSperiteForm(0);
            AudioManager.playEffect("正确");
            this.gameData.ziIndex[1].isPlay = true;
            return;
        }

        let right = this.jugeLogic();
        if (right && !this.gameData.ziIndex[this.picIndex + 1].isPlay) {

            AudioManager.playEffect("正确");
            this.changSperiteForm(this.picIndex);
            this.gameWin();
            
        }
        else if (right && this.gameData.ziIndex[this.picIndex + 1].isPlay) {
            this.cfNode.active = true;
            this.scheduleOnce(() => {
                this.cfNode.active = false;
                this.clearAllStroke();
                this.index = [];
            }, 1);
        }
        else {
            //错误
            AudioManager.playEffect("错误");
            this.cha.active = true;
            this.scheduleOnce(() => {
                this.cha.active = false;
                this.clearAllStroke();
                this.index = [];
            }, 1);
        }

        


    }


    //判断逻辑
    jugeLogic(): boolean {

        let answer;
        let ans;
        let isSprite;
        let indexSet;
        let isAllIncluded;
        for (let i = 1; i <= 17; i++) {

            if (this.gameData.ziIndex[i].index)
                answer = this.gameData.ziIndex[i].index;
            // answer = this.gameData.ziIndex[i].index;
            isSprite = this.gameData.ziIndex[i].isSprite;
            isAllIncluded = true;
            // 特殊处理：isSprite为true且answer长度为1，只要answer包含index的任一元素即可
            if (isSprite && this.index.length === 1) {
                for (let k = 0; k < answer.length; k++) {
                    if (this.index[0] === answer[k]) {
                        this.picIndex = i - 1;
                        this.py = this.gameData.ziIndex[i].py;
                        return true;
                    }
                }
                continue;
            }

            

            // if (this.gameData.ziIndex[i].length > 1 && this.index.length == this.gameData.ziIndex[i][0].index.length) {
            //     for (let k = 0; k < this.gameData.ziIndex[i].length ; k++) {
            //         ans = this.gameData.ziIndex[i][k].index;
            //         indexSet = new Set(this.index);
            //         for (let j = 0; j < this.gameData.ziIndex[i][k].index.length; j++) {
            //             if (!indexSet.has(ans[j])) {
            //                 this.picIndex = i - 1;
            //                 this.py = this.gameData.ziIndex[i][k].py;
            //                 return true;
            //             }
            //         }
            //     }
                
            // }
            if (this.gameData.ziIndex[i].length > 1 && this.index.length == this.gameData.ziIndex[i][0].index.length) {
                for (let k = 0; k < this.gameData.ziIndex[i].length; k++) {
                    ans = this.gameData.ziIndex[i][k].index;
                    if (ans.length !== this.index.length) continue;
                    const indexSet = new Set(this.index);
                    const ansSet = new Set(ans);
                    // 判断两个集合内容完全一致
                    const allInAns = this.index.every(val => ansSet.has(val));
                    const allInIndex = ans.every(val => indexSet.has(val));
                    if (allInAns && allInIndex) {
                        this.picIndex = i - 1;
                        this.py = this.gameData.ziIndex[i][k].py;
                        return true;
                    }
                }
            }
            
            // 普通处理：长度相同且元素完全相同（顺序无关）
            else if (this.index.length !== answer.length) continue;
            indexSet = new Set(this.index);
            // let isAllIncluded = true;
            for (let j = 0; j < answer.length; j++) {
                if (!indexSet.has(answer[j])) {
                    isAllIncluded = false;
                    break;
                }
            }
            if (isAllIncluded) {
                this.py = this.gameData.ziIndex[i].py;
                this.picIndex = i - 1;
                return true;
            }
        }
        return false;
    }

    gameWin() {


        if (this.winValue == 17) {
            this.scheduleOnce(() => {
                this.endwin("prefabs/zc/zc_winend");
            }, 1.5);
        }
        
    }


    //显示tips面板
    showTips() {
        let lab = this.tisPanelNode.getChildByName("Label").getComponent(cc.Label);
        this.tisPanelNode.active = true;
        for (let i = 1; i <= 17; i++) {
            if (!this.gameData.ziIndex[i].isPlay && this.gameData.ziIndex[i].name) {
                lab.string = this.gameData.ziIndex[i].name;
                return;
            }
            else if (!this.gameData.ziIndex[i].isPlay){
                lab.string = this.gameData.ziIndex[i][0].name;
                return;
            }
        }
    }
}
