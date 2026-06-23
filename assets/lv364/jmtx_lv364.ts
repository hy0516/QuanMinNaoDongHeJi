import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import gameData_lv364 from "./gameData_lv364";

const { ccclass, property } = cc._decorator;

@ccclass
export default class jmtx_lv364 extends BaseGame {
    @property(cc.PageView)
    public pageView: cc.PageView = null;

    @property(cc.Node)
    public lvNodes: cc.Node = null;

    gameData: gameData_lv364;

    //当前关卡的龙骨节点
    lvSkeNode: cc.Node = null;

    targetNode: cc.Node = null;

    //关卡名称
    curLv: number = 0;

    //关卡胜利
    winValue: number = 0;

    //插槽名字
    slotNames: string[] = [];
    //插槽下标
    indexs: number[] = [];
    //关卡名字
    names: string[] = [];

    //道具节点
    @property(cc.Node)
    toolNodes: cc.Node = null;

    //关卡胜利条件数据
    lvNum: number[] = [0, 0, 0, 0, 0];

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    quan: cc.Prefab = null;

    qNode: cc.Node = null;

    gou: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    public startTime = 300;

    //提示按钮锁
    ists: boolean = true;

    protected onLoad(): void {

        // GameData.PauseGame = true;
        AudioManager.stopMusic();
        AudioManager.playMusic("关卡背景lv364", false, 0.5);

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);

        this.gameData = this.node.getComponent(gameData_lv364);
        this.curLv = 1;
        this.lvSkeNode = this.lvNodes.children[this.curLv - 1].children[0];
        this.getSlotName();
        console.log(this.lvNodes.children[this.curLv - 1].children[1].name);
        this.scrollView.node.on("scroll-began", this.onScrollBegan, this);
        this.scrollView.node.on("scroll-ended", this.onScrollEnded, this);

        this.gou = this.node.getChildByName("bg").getChildByName("gou");

    }

    PageTurunHandler(event: cc.Event.EventCustom) {
        const currentPageIndex = this.pageView.getCurrentPageIndex();
    }

    onScrollBegan() {
        // cc.log('ScrollView 滑动开始');

    }

    onScrollEnded() {
        // cc.log('ScrollView 滑动结束');
    }


    BtnHandler(event: cc.Event.EventTouch) {
        switch (event.currentTarget.name) {
            case "btn_left":
                this.upAndDownPage(false);
                break;
            case "btn_right":
                this.upAndDownPage(true);
                break;

        }
    }

    //按钮控制页面切换
    upAndDownPage(isRight: boolean) {
        const uppage = isRight ? 1 : -1;
        if (this.pageView.getCurrentPageIndex() + uppage == 4) {
            this.pageView.scrollToPage(0, 0);
            // this.curLv = this.pageView.getCurrentPageIndex();
        }
        else if (this.pageView.getCurrentPageIndex() + uppage == -1) {
            this.pageView.scrollToPage(4, 0);
            // this.curLv = 5;
        }

        else {
            this.pageView.scrollToPage(this.pageView.getCurrentPageIndex() + uppage, 1);
            // this.curLv += uppage;
        }
        this.curLv = this.pageView.getCurrentPageIndex() + 1;
        this.getSlotName();

    }

    //记录关卡的插槽名字和下标
    getSlotName() {
        this.lvSkeNode = this.lvNodes.children[this.curLv - 1].children[0];
        for (let i = 0; i < this.gameData.lvConfig[this.curLv].length; i++) {

            this.slotNames[i] = this.gameData.lvConfig[this.curLv][i].slotName;
            this.indexs[i] = this.gameData.lvConfig[this.curLv][i].index;
            this.names[i] = this.gameData.lvConfig[this.curLv][i].name;
        }
    }

    //游戏胜利判断
    nextLv() {



        this.lvNum[this.curLv - 1]++;
        if (this.lvNum[this.curLv - 1] == this.gameData.gameConfig[this.curLv][0].value) {
            //切换下一关
            this.winValue++;
            this.curLv++;
            if (this.winValue >= 4) {
                //游戏胜利
                console.log("1111");
                this.gameWin();
                return;
            }
            else if (this.curLv == 5 && this.winValue < 4) {
                this.curLv = 1;
                this.pageView.scrollToPage(0, 0);
                this.getSlotName();
            }
            else {
                this.pageView.scrollToPage(this.curLv - 1, 0);
                this.getSlotName();
            }


        }

    }

    //滑动页面回调函数
    pageEvent() {
        // console.log(this.pageView.getCurrentPageIndex())
        this.curLv = this.pageView.getCurrentPageIndex() + 1;
        this.getSlotName();
    }

    //按钮控制
    btnClick(event: cc.Event.EventTouch) {
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                break;
            case "btn_tis":
                AudioManager.playEffect("button");
                if (!this.ists) {
                    return;
                }

                VideoManager.getInstance().showVideo(() => {
                    this.showTisp();
                });

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

    //显现提示
    showTisp() {
        let quan;
        if (this.gameData.lvConfig[this.curLv] == undefined) return;
        for (let i = 0; i < this.gameData.lvConfig[this.curLv].length; i++) {
            let toolName = this.gameData.lvConfig[this.curLv][i].name;
            for (let j = 0; j < this.toolNodes.children.length; j++) {
                if (this.toolNodes.children[j].children[0] != null && toolName == this.toolNodes.children[j].children[0].name) {
                    quan = cc.instantiate(this.quan);
                    quan.position = new cc.Vec3(0, 0, 0);
                    this.toolNodes.children[j].addChild(quan);
                    this.lvNodes.children[this.curLv - 1].children[1].getChildByName(toolName).children[0].active = true;
                    this.qNode = quan;
                    this.scrollToTarget(this.toolNodes.children[j]);
                    
                    return;
                }
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
        // var p = this.scrollView.getContentPosition();
        // console.log(targetPosition)
        // cc.tween(this.scrollView.content)
        // .to(0.5,{x:targetPosition.x})
        // .start()

        // this.scrollView.setContentPosition(targetPosition);
    }

    private calculateScrollPosition(): cc.Vec2 {
        // 获取 ScrollView 的视口尺寸
        const viewSize = this.scrollView.node.getContentSize();

        // 获取 Content 节点
        const content = this.scrollView.content;

        // 将目标节点的世界坐标转换为 Content 节点的本地坐标
        const targetWorldPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);
        const targetLocalPos = content.convertToNodeSpaceAR(targetWorldPos);

        // 计算标准化滚动位置
        const minScrollPos = cc.v2(0, 0);
        const maxScrollPos = cc.v2(
            content.width - viewSize.width,
            content.height - viewSize.height
        );

        // 计算实际需要的滚动位置
        let scrollPosition = cc.v2(
            (targetLocalPos.x + this.targetNode.width / 2) / content.width,
            (content.height - targetLocalPos.y - this.targetNode.height / 2) / content.height
        );

        // 转换为方向对应的实际滚动位置
        if (this.scrollView.vertical) {
            return cc.v2(0, maxScrollPos.y * scrollPosition.y);
        } else if (this.scrollView.horizontal) {
            return cc.v2(scrollPosition.x, 0);//maxScrollPos.x *
        }

        return cc.Vec2.ZERO;
    }


    //游戏胜利
    gameWin() {
        this.scheduleOnce(() => {
            this.endwin("prefabs/zc/zc_winend");
        }, 1);

    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz")
            }, 0.7);
        }
    }
    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        // this.startTime =120;
        this.setTime(120)
        this.schedule(this.Timeing, 1);
    }

    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime + time <= 0) return
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


}
