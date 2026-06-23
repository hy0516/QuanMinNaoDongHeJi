import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class mycx_lv324 extends BaseGame {

    @property(cc.PageView)
    public pageView: cc.PageView = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;


    @property(cc.Label)
    time: cc.Label = null;


    //道具节点
    @property(cc.Node)
    toolNodes: cc.Node = null;

    @property(cc.Prefab)
    quan: cc.Prefab = null;    

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public lvNodes: cc.Node = null;

    @property(cc.Node)
    bigGou: cc.Node = null;

    //关卡名称
    public curLv: number = 1;

    public startTime = 360;

    //关卡胜利条件数据
    lvNum: number[] = [0, 0, 0];

    q1Node: cc.Node = null;

    q2Node: cc.Node = null;

    //关卡胜利
    private winValue: number = 0;

    targetNode: cc.Node = null;

    //游戏数据
    gameConfig = {
        1: {value: 12},
        2: {value: 11},
        3: {value: 11}
    };

    @property(cc.Prefab)
    cha: cc.Prefab = null;
    @property(cc.Prefab)
    gou: cc.Prefab = null;

    protected onLoad(): void {
        

        GameData.PauseGame = true;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景lv324", false, 0.5);
        }, 0.5);

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
        this.gameInit();
    }


    //游戏初始化
    gameInit() {
        for (let i = 1; i <= 3; i++) {
            this.gameConfig[i].value = this.lvNodes.children[i-1].children.length;
        }
    }


    //按钮控制页面切换
    upAndDownPage(isRight: boolean) {
        const uppage = isRight ? 1 : -1;
        if (this.pageView.getCurrentPageIndex() + uppage == 3){
            
            this.pageView.scrollToPage(0, 0.5);
            // this.curLv = this.pageView.getCurrentPageIndex();
        }
        else if (this.pageView.getCurrentPageIndex() + uppage == -1){
            
            this.pageView.scrollToPage(5, 0.5);
            // this.curLv = 5;
        }
            
        else{
            
            this.pageView.scrollToPage(this.pageView.getCurrentPageIndex() + uppage, 1);
            // this.curLv += uppage;
        }
        this.curLv = this.pageView.getCurrentPageIndex() + 1;
            
    }


    BtnHandler(event: cc.Event.EventTouch){
        switch(event.currentTarget.name){
            case "btn_left":
                this.upAndDownPage(false);
                break;
            case "btn_right":
                this.upAndDownPage(true);
                break;

            case "btn_tis":
                AudioManager.playEffect("button");
                // if (!this.ists) {
                //     return;
                // }
                VideoManager.getInstance().showVideo(() => {
                    this.showTisp();
                });
                
                break;
                
            case "fanhui":
                this.openpausePanel();
                break;
            case "btn_jiashi":
                AudioManager.playEffect("button");
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(60);
                })
                break;
        }
    }

    //滑动页面回调函数
    pageEvent() {

        console.log(this.pageView.getCurrentPageIndex())
        this.curLv = this.pageView.getCurrentPageIndex() + 1;
        
    }


    //生成错误
    generationError (node: cc.Node) {
        let cha = cc.instantiate(this.cha);
        node.parent.addChild(cha);
        cha.x = node.x;
        cha.y = node.y;


        this.scheduleOnce(() => {
            cha.destroy();
        }, 1);
    }

    //生成勾
    generateHook(node: cc.Node) {
        let gou = cc.instantiate(this.gou);
        node.addChild(gou);
        this.scheduleOnce(() => {
            gou.destroy();
        }, 1);
    }

        //游戏胜利判断
    public nextLv(){
        const self = this;
        this.lvNum[this.curLv - 1]++;
        if (this.lvNum[this.curLv - 1] == this.gameConfig[this.curLv].value) {

            cc.tween(self.bigGou)
                .to(0.3, {opacity: 255} )
                .delay(1)
                .call(() => {
                    //切换下一关
                    self.winValue++;
                    self.curLv++;
                    self.bigGou.opacity = 0;
                    if (self.winValue >= 3) {
                        //游戏胜利
                        // console.log("1111");
                        self.gameWin();
                        return;
                    }
                    else if (self.curLv == 3 && self.winValue < 2) {
                        self.curLv = 1;
                        
                        self.pageView.scrollToPage(0, 0.5);
                        
                    }
                    else {
                        
                        self.pageView.scrollToPage(self.curLv - 1, 0.5);
                        
                    }
                })
                .start()
        }

    }

    //游戏胜利
    gameWin(){
        this.scheduleOnce(() => {
            this.endwin("prefabs/zc/zc_winend");
        }, 1);
        
    }




    Timeing() {
        if (GameData.PauseGame == false) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = false;
            this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        }
    }


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



    //展示提示
    showTisp(){
        let quan1;
        let quan2;
        let toolName;
        for (let i = 0; i < this.lvNodes.children[this.curLv - 1].children.length; i++){
            if (!this.lvNodes.children[this.curLv - 1].children[i].getChildByName("mz").children[1].active) {
                toolName = this.lvNodes.children[this.curLv - 1].children[i].name;
            }
            
            for (let j = 0; j < this.toolNodes.children.length; j++){
                if (this.toolNodes.children[j]!= null && toolName == this.toolNodes.children[j].name) {
                    quan1 = cc.instantiate(this.quan);
                    quan1.position = new cc.Vec3(0,0,0);
                    this.q1Node = quan1;
                    this.toolNodes.children[j].addChild(quan1);
                    if (!cc.isValid(this.q2Node) || this.q2Node == null) {
                        quan2 = cc.instantiate(this.quan);
                        quan2.position = new cc.Vec3(0,0,0);
                        this.lvNodes.children[this.curLv - 1].children[i].addChild(quan2);
                        this.q2Node = quan2;
                    }
                    
                    this.scrollToTarget(this.toolNodes.children[j]);
                    return;
                }
                else if (toolName == null)
                    break;
                else {
                    continue;
                }
            }

        }
    }




    public scrollToTarget(node: cc.Node) {
        if (!this.scrollView || !node) return;

        this.targetNode = node;

        // 计算目标位置
        const targetPosition = this.calculateScrollPosition();
        // 使用缓动滚动（0.5秒完成滚动）
        this.scrollView.scrollTo(targetPosition, 0.5);
    }


    private calculateScrollPosition(): cc.Vec2 {
        // 获取 ScrollView 的视口尺寸
        const viewSize = this.scrollView.node.getContentSize();
        
        // 获取 Content 节点
        const content = this.scrollView.content;
        
        // 将目标节点的世界坐标转换为 Content 节点的本地坐标
        const targetWorldPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);
        const targetLocalPos = content.convertToNodeSpaceAR(targetWorldPos);


         // 计算目标节点中心点相对于 content 的百分比
        let percentX = (targetLocalPos.x - viewSize.width / 2) / (content.width - viewSize.width);
        let percentY = (content.height - targetLocalPos.y - viewSize.height / 2) / (content.height - viewSize.height);

        // 边界检查
        percentX = Math.max(0, Math.min(1, percentX));
        percentY = Math.max(0, Math.min(1, percentY));

        if (this.scrollView.vertical) {
        return cc.v2(0, percentY);
        } else if (this.scrollView.horizontal) {
            return cc.v2(percentX, 0);
        }
        return cc.Vec2.ZERO;
    } 
}
