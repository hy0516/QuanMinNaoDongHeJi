// import AudioManager from "./AudioManager";
// import GameData from "./GameData";
// import common from "./common";
// import hallcontent from "./hallcontent";
// import levelConfig from "./levelConfig";

// const { ccclass, property } = cc._decorator;

// @ccclass
// export default class Hall extends cc.Component {
//     @property(cc.Node)
//     view: cc.Node = null;
//     @property(cc.Node)
//     btn_fanhui: cc.Node = null;
//     @property(cc.Prefab)
//     hallcontent: cc.Prefab = null;
//     @property(cc.Node)
//     scrollview: cc.Node = null;
//     @property(cc.Node)
//     hallpage: cc.Node = null;


//     protected onLoad(): void {
//         common.openSk();
//         AudioManager.stopEffect2();
//         AudioManager.playMusic(AudioManager.common.Hall_main4);
//         GameData.onDele();
//         GameData.lvConfig = null;
//         this.unscheduleAllCallbacks();
//         // this.seleGameStyle(null, "new");

//         var list = levelConfig["new"];
//         this.view.width = Math.ceil(list.length / 6) * 720;
//         GameData.curSeleStyle = list;
//         var datalist = [];
//         var itemnum = 0;
//         for (let i = 1; i < list.length + 1; i++) {
//             var data = list[i - 1];
//             var num = i % 6;
//             datalist.push(data)
//             // var lv = data.level.split("|");
//             GameData.nextlevelconfig[i - 1] = data.level;
//             GameData.nextlevelconfig2[data.level] = i - 1;
//             if ((i == list.length && num != 0)) {
//                 // this.view.children[itemnum].getComponent(hallcontent).onInit(datalist);
//                 var content = cc.instantiate(this.hallcontent);
//                 this.view.addChild(content);
//                 content.getComponent(hallcontent).onInit(datalist);
//                 itemnum++;
//                 datalist = [];
//             }
//             if ((num == 0 && i !== 0)) {
//                 var content = cc.instantiate(this.hallcontent);
//                 this.view.addChild(content);
//                 content.getComponent(hallcontent).onInit(datalist);
//                 datalist = [];
//                 itemnum++;
//                 // datalist.push(data);
//                 if (i == list.length) {
//                     var content = cc.instantiate(this.hallcontent);
//                     this.view.addChild(content);
//                     content.getComponent(hallcontent).onInit(datalist);
//                     // itemnum++;
//                     datalist = [];
//                 }
//             }
//         }
//         this.node.getChildByName("ye").active = true;
//     }



//     seleGameStyle(event: cc.Event.EventTouch, name: string) {
//         // this.scrollview.destroy();
//         // this.hallpage.getComponent(cc.PageView).enabled = true;
//         // GameData.curGameStyle = event.currentTarget.name; 
//         // this.view.parent.getComponent(cc.PageView).setCurrentPageIndex(0);
//         // this.view.removeAllChildren();
//         this.view.parent.getComponent(cc.PageView).scrollToBottomLeft(0.1);
//         this.node.getChildByName("new").active = true;
//         this.node.getChildByName("ye").active = false;
//         var list = levelConfig[name];
//         this.view.width = Math.ceil(list.length / 6) * 720;
//         GameData.curSeleStyle = list;
//         var datalist = [];
//         var itemnum = 0;
//         for (let i = 1; i < list.length + 1; i++) {
//             var data = list[i - 1];
//             var num = i % 6;
//             datalist.push(data)
//             // var lv = data.level.split("|");
//             GameData.nextlevelconfig[i - 1] = data.level;
//             GameData.nextlevelconfig2[data.level] = i - 1;
//             if ((i == list.length && num != 0)) {
//                 // this.view.children[itemnum].getComponent(hallcontent).onInit(datalist);
//                 var content = cc.instantiate(this.hallcontent);
//                 this.view.addChild(content);
//                 content.getComponent(hallcontent).onInit(datalist);
//                 itemnum++;
//                 datalist = [];
//             }
//             if ((num == 0 && i !== 0)) {
//                 var content = cc.instantiate(this.hallcontent);
//                 this.view.addChild(content);
//                 content.getComponent(hallcontent).onInit(datalist);
//                 datalist = [];
//                 itemnum++;
//                 // datalist.push(data);
//                 if (i == list.length) {
//                     var content = cc.instantiate(this.hallcontent);
//                     this.view.addChild(content);
//                     content.getComponent(hallcontent).onInit(datalist);
//                     // itemnum++;
//                     datalist = [];
//                 }
//             }
//         }
//         // this.btn_fanhui.active = true;
//     }


//     fanhui() {
//         // this.hallpage.getComponent(cc.PageView).enabled = false;
//         this.view.parent.getComponent(cc.PageView).scrollToBottomLeft(0.1);
//         this.view.parent.getComponent(cc.PageView).setCurrentPageIndex(0);
//         this.node.getChildByName("new").active = false;
//         this.node.getChildByName("ye").active = true;
//     }

// }

import Platforms_QuickGame from "../SDK/Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK/SDK_Manager";
import InvokeConfig from "../SDK/Tool/InvokeConfig";
import DYTitle from "../SDK/XXL/DYTitle";
import AudioManager from "./AudioManager";
import AssetManager from "./AssetManager";
import GameData from "./GameData";
import VideoManager from "./VideoManager";
import common from "./common";
import hallcontent from "./hallcontent";
import levelConfig from "./levelConfig";
import smallLoading from "./smallLoading";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {
    @property(cc.Node)
    view: cc.Node = null;
    @property(cc.Prefab)
    hallcontentPrefab: cc.Prefab = null;
    @property(cc.Node)
    signPanel: cc.Node = null;
    @property(cc.Node)
    btn_unlockvideo: cc.Node = null;
    @property(cc.Label)
    piaoNumLab: cc.Label = null;
    @property(cc.Node)
    btn_effswitch: cc.Node = null;
    @property(cc.Node)
    switchPanel: cc.Node = null;
    @property(cc.Node)
    powerVideoAdd: cc.Node = null;
    @property(cc.Node)
    powerVideoWuXian: cc.Node = null;
    @property(cc.Node)
    btn_musicswitch: cc.Node = null;
    @property(cc.Node)
    tiliIcon: cc.Node = null;
    /**主题选框父集 */
    @property(cc.Node)
    Frame: cc.Node = null;

    //---底部icon-- start

    /**底部滚动icon */
    @property(cc.Node)
    btnDown: cc.Node = null;

    /**底部icon滚动速度 */
    iconSpeed: number = 10;

    @property(cc.Node)
    powerTimeUI: cc.Node = null;
    @property(cc.Label)
    powerCDLabel: cc.Label = null;

    /**体力冷却相关 */
    private powerCDTimer: number = 0; // 当前冷却剩余时间（秒）
    private readonly POWER_CD_DURATION: number = 420; // 5分钟 = 300秒
    private powerCDInterval: number = null;
    private readonly POWER_CD_STORAGE_KEY: string = "powerCDEndTime";

    /**icon起始位置 */
    iconStartposX: number = -605.248;



    /** iocnY值*/
    iconY: number = -590;

    /**icon间距 */
    iconDis: number = 185;

    //---底部icon-- end

    protected onLoad(): void {
        common.openSk();
        common.hideLuJing();
        AudioManager.stopEffect2();
        AudioManager.playMusic(AudioManager.common.Hall_main4);
        GameData.onDele();
        GameData.lvConfig = null;
        this.unscheduleAllCallbacks();

        // this.seleGameStyle
        this.pageView = this.node.getChildByName("new").getChildByName("hallpage").getComponent(cc.PageView);
        // if (Hall.LastChoice) this.seleGameStyle(null, Hall.LastChoice)

        if (GameData.unlockVideoNum == 3) {
            this.btn_unlockvideo.active = false;
        }
        this.btn_unlockvideo.getChildByName("unlocknum").getComponent(cc.Label).string = GameData.unlockVideoNum + "/3";
        //初始化底部icon
        // this.setIconpos();
        this.seleGameStyle(null, "hot");

        this.node.on("freshSign", this.freshSign, this);
        // console.log(this.btn_effswitch)
        // console.log(this.node.getChildByName("shezhipanel").getChildByName("设置页面").getChildByName("effswitch"))
        if (!this.btn_effswitch) this.btn_effswitch = this.node.getChildByName("shezhipanel").getChildByName("设置页面").getChildByName("effswitch");
        if (!this.btn_musicswitch) this.btn_musicswitch = this.node.getChildByName("shezhipanel").getChildByName("设置页面").getChildByName("musicswitch");
        if (!this.switchPanel) this.switchPanel = this.node.getChildByName("shezhipanel");
        GameData.isloadLv = false;
        // this.scheduleOnce(() => {
            // this.startPreloadPopularLevels();
        // }, 0.1);
        // cc.game.on(cc.game.EVENT_SHOW, () => {
        //     console.log("gameshow");
        //     this.setIconpos();
        //     this.isgo = false;
        // })
        // cc.game.on(cc.game.EVENT_HIDE, () => {
        //     console.log("gamehide");
        //     this.isgo = true;
        // })
    }
    isgo = false;
    protected onEnable(): void {
        this.freshSign();
        // 初始化体力冷却系统
        this.initPowerCDSystem();
        // var signdata = cc.sys.localStorage.getItem("signdata");
        // if (signdata) {
        //     var datalist = signdata.split("|");
        //     if (datalist && datalist[0] <= new Date().getMonth() + 1 && datalist[2] != "7") {
        //         if (Number(datalist[1]) < new Date().getDate()) {
        //             // this.openSignPanel();
        //         }
        //     } 
        // } else {
        //     // this.openSignPanel();
        // }

    }

    protected onDestroy(): void {
        // 防止异步/延迟回调在销毁过程中继续触发UI刷新（JSB 下可能导致 Label 渲染对象为空）
        this.node.off("freshSign", this.freshSign, this);

        this.popularLevelQueue.length = 0;
        this.isProcessingPopularPreload = false;
        this.stopPowerCDTimer();
        // 保存离开Hall的时间戳，用于计算离开期间应恢复的体力
        const leaveTime = new Date().getTime();
        cc.sys.localStorage.setItem("hallLeaveTime", leaveTime.toString());
    }

    /** 是否正在初始化冷却系统（防止重复调用） */
    private isInitializingPowerCD: boolean = false;

    /**初始化体力冷却系统 */
    private initPowerCDSystem(): void {
        // 防止重复调用
        if (this.isInitializingPowerCD) {
            // console.log("[Hall.initPowerCDSystem] 正在初始化中，跳过重复调用");
            return;
        }

        // 如果处于无限体力状态，不初始化冷却系统
        if (GameData.isWuXian()) {
            // console.log("[Hall.initPowerCDSystem] 处于无限体力状态，跳过冷却系统初始化");
            this.hidePowerTimeUI();
            this.stopPowerCDTimer();
            cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
            this.isInitializingPowerCD = false;
            return;
        }

        const currentPower = GameData.getPower();
        const now = new Date().getTime();
        
        // 【诊断日志】入口状态
        // const savedEndTimeDebug = cc.sys.localStorage.getItem(this.POWER_CD_STORAGE_KEY);
        // const leaveTimeStrDebug = cc.sys.localStorage.getItem("hallLeaveTime");
        // console.log(`[Hall.initPowerCDSystem] 当前时间: ${now}, 体力: ${currentPower}, savedEndTime: ${savedEndTimeDebug}`);

        this.isInitializingPowerCD = true;

        // 计算离开期间应恢复的体力
        const leaveTimeStr = cc.sys.localStorage.getItem("hallLeaveTime");
        if (leaveTimeStr && currentPower < 10) {
            const leaveTime = parseInt(leaveTimeStr);
            const awayTime = now - leaveTime; // 离开的时间（毫秒）
            const awaySeconds = Math.floor(awayTime / 1000);

            // 获取当前冷却结束时间
            const savedEndTime = cc.sys.localStorage.getItem(this.POWER_CD_STORAGE_KEY);
            let wasCoolingDown = false; // 离开时是否正在进行冷却
            let accumulatedTime = 0; // 已经积累的时间（秒）

            if (savedEndTime) {
                const endTime = parseInt(savedEndTime);
                // 如果冷却正在进行（结束时间晚于离开时间）
                if (endTime > leaveTime) {
                    wasCoolingDown = true;
                    // 计算离开前已经积累了多少时间
                    // 结束时间 - 离开时间 = 离开前剩余的冷却时间
                    // 总冷却时间 - 剩余时间 = 已积累时间
                    accumulatedTime = this.POWER_CD_DURATION - Math.floor((endTime - leaveTime) / 1000);
                    if (accumulatedTime < 0) accumulatedTime = 0;
                    if (accumulatedTime > this.POWER_CD_DURATION) accumulatedTime = this.POWER_CD_DURATION;
                }
            }

            // 计算总有效恢复时间
            // 如果之前有冷却进行，累加离开期间的时间；否则只计算离开期间的时间
            const totalEffectiveTime = wasCoolingDown ? (accumulatedTime + awaySeconds) : awaySeconds;
            // 计算可以获得多少点体力
            const powerToAdd = Math.floor(totalEffectiveTime / this.POWER_CD_DURATION);
            // 计算新的剩余冷却时间（如果没有获得体力，这是已经积累的时间）
            const remainingTime = totalEffectiveTime % this.POWER_CD_DURATION;

            // console.log(`[Hall.initPowerCDSystem] 离开恢复: 时长${awaySeconds}秒, 恢复${powerToAdd}点体力`);

            if (powerToAdd > 0) {
                // 增加体力，但不超过上限10
                const newPower = Math.min(currentPower + powerToAdd, 10);
                const actualAdd = newPower - currentPower;
                if (actualAdd > 0) {
                    GameData.setPower(actualAdd);
                    this.freshSign(); // 更新体力显示
                    // console.log(`[Hall] 离开期间恢复体力: +${actualAdd}, 当前体力: ${newPower}/10`);
                }
            }

            // 【修复】恢复体力后立即更新 savedEndTime，防止重复计算
            if (powerToAdd > 0) {
                const remainingTime = totalEffectiveTime % this.POWER_CD_DURATION;
                const newEndTime = now + (this.POWER_CD_DURATION - remainingTime) * 1000;
                cc.sys.localStorage.setItem(this.POWER_CD_STORAGE_KEY, newEndTime.toString());
                // console.log(`[DIAGNOSTIC initPowerCDSystem] 恢复体力后立即更新 savedEndTime: ${newEndTime}`);
            }

            const finalPower = GameData.getPower();
            if (finalPower < 10) {
                // 体力未满，设置新的冷却计时
                if (wasCoolingDown && powerToAdd === 0) {
                    // 之前有冷却进行且没有获得体力，继续之前的冷却
                    // 从总冷却时间中减去已经积累的时间
                    this.powerCDTimer = this.POWER_CD_DURATION - remainingTime;
                } else {
                    // 之前没有冷却、或获得了体力，开始新的冷却
                    this.powerCDTimer = this.POWER_CD_DURATION;
                }
                const newEndTime = now + this.powerCDTimer * 1000;
                cc.sys.localStorage.setItem(this.POWER_CD_STORAGE_KEY, newEndTime.toString());
                this.startCDInterval();
                this.showPowerTimeUI();
                this.updatePowerCDDisplay();
            } else {
                // 体力已满
                this.hidePowerTimeUI();
                cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
            }

            // 清除离开时间记录
            cc.sys.localStorage.removeItem("hallLeaveTime");
            this.isInitializingPowerCD = false;
            return;
        }

        // 没有离开记录或体力已满，按原逻辑处理
        if (currentPower < 10) {
            // 检查是否已有冷却计时
            const savedEndTime = cc.sys.localStorage.getItem(this.POWER_CD_STORAGE_KEY);

            if (savedEndTime) {
                const endTime = parseInt(savedEndTime);
                if (endTime > now) {
                    // 继续之前的冷却
                    this.powerCDTimer = Math.ceil((endTime - now) / 1000);
                    // console.log(`[Hall.initPowerCDSystem] 继续冷却, 剩余时间: ${this.powerCDTimer}秒`);
                    this.startCDInterval();
                    this.showPowerTimeUI();
                    this.updatePowerCDDisplay();
                } else {
                    // 冷却结束，计算期间应恢复的体力点数
                    const elapsedTime = now - endTime; // 从冷却结束到现在经过的时间（毫秒）
                    const elapsedSeconds = Math.floor(elapsedTime / 1000);
                    // 计算可以获得多少点体力（包括第一个已经完成的冷却）
                    const totalPowerToAdd = 1 + Math.floor(elapsedSeconds / this.POWER_CD_DURATION);
                    const actualAdd = Math.min(totalPowerToAdd, 10 - currentPower);

                    if (actualAdd > 0) {
                        GameData.setPower(actualAdd);
                        // console.log(`[Hall] 离线期间恢复体力: +${actualAdd}, 当前体力: ${GameData.getPower()}/10`);
                        // 【修复】恢复体力后立即更新 savedEndTime，防止 freshSign 再次触发恢复
                        const remainingTime = elapsedSeconds % this.POWER_CD_DURATION;
                        const tempEndTime = now + (this.POWER_CD_DURATION - remainingTime) * 1000;
                        cc.sys.localStorage.setItem(this.POWER_CD_STORAGE_KEY, tempEndTime.toString());
                        this.freshSign();
                    }

                    const finalPower = GameData.getPower();
                    if (finalPower < 10) {
                        // 计算剩余冷却时间
                        const remainingTime = elapsedSeconds % this.POWER_CD_DURATION;
                        this.powerCDTimer = this.POWER_CD_DURATION - remainingTime;
                        const newEndTime = now + this.powerCDTimer * 1000;
                        cc.sys.localStorage.setItem(this.POWER_CD_STORAGE_KEY, newEndTime.toString());
                        this.startCDInterval();
                        this.showPowerTimeUI();
                        this.updatePowerCDDisplay();
                    } else {
                        // 体力已满
                        this.hidePowerTimeUI();
                        cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
                    }
                }
            } else {
                // 开始新的冷却
                this.startPowerCDTimer();
                this.showPowerTimeUI();
                this.updatePowerCDDisplay();
            }
        } else {
            // 体力已满，隐藏UI
            this.hidePowerTimeUI();
        }
        
        // 【修复】重置初始化标志
        this.isInitializingPowerCD = false;
    }

    /**显示体力冷却UI */
    private showPowerTimeUI(): void {
        if (this.powerTimeUI) {
            this.powerTimeUI.active = true;
        }
    }

    /**隐藏体力冷却UI */
    private hidePowerTimeUI(): void {
        if (this.powerTimeUI) {
            this.powerTimeUI.active = false;
        }
    }

    /**开始体力冷却计时 */
    private startPowerCDTimer(): void {
        this.powerCDTimer = this.POWER_CD_DURATION;
        const endTime = new Date().getTime() + this.POWER_CD_DURATION * 1000;
        cc.sys.localStorage.setItem(this.POWER_CD_STORAGE_KEY, endTime.toString());
        this.startCDInterval();
    }

    /**启动定时器 */
    private startCDInterval(): void {
        if (this.powerCDInterval) {
            this.unschedule(this.onCDTick);
        }
        this.schedule(this.onCDTick, 1);
        this.powerCDInterval = 1;
    }

    /**停止定时器 */
    private stopPowerCDTimer(): void {
        if (this.powerCDInterval) {
            this.unschedule(this.onCDTick);
            this.powerCDInterval = null;
        }
    }

    /**每秒滴答 */
    private onCDTick = (): void => {
        this.powerCDTimer--;
        this.updatePowerCDDisplay();

        if (this.powerCDTimer <= 0) {
            this.onPowerCDComplete();
        }
    }

    /**更新冷却时间显示 */
    private updatePowerCDDisplay(): void {
        // JSB 下如果 Label/Node 已进入销毁流程，直接写 string 可能触发 `_renderFlag` 空引用
        if (!this.powerCDLabel || !cc.isValid(this.powerCDLabel, true) || !cc.isValid(this.powerCDLabel.node, true)) {
            return;
        }

        const minutes = Math.floor(this.powerCDTimer / 60);
        const seconds = this.powerCDTimer % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.powerCDLabel.string = timeStr;
    }

    /**冷却完成回调 */
    private onPowerCDComplete(): void {
        // 恢复一点体力
        const currentPower = GameData.getPower();
        if (currentPower < 10) {
            GameData.setPower(1);
            this.freshSign(); // 更新体力显示

            // 如果体力仍然不足10点，继续冷却
            const newPower = GameData.getPower();
            if (newPower < 10) {
                this.startPowerCDTimer();
            } else {
                // 体力已满
                this.stopPowerCDTimer();
                this.hidePowerTimeUI();
                cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
            }
        } else {
            this.stopPowerCDTimer();
            this.hidePowerTimeUI();
            cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
        }
    }

    /**检查并启动体力冷却（供外部调用） */
    public checkAndStartPowerCD(): void {
        this.initPowerCDSystem();
    }

    freshSign() {
        // JSB 下如果 Hall/Label 已进入销毁流程，写 Label.string 可能触发 `_renderFlag` 空引用
        if (!cc.isValid(this.node, true)) {
            return;
        }
        if (!this.piaoNumLab || !cc.isValid(this.piaoNumLab, true) || !cc.isValid(this.piaoNumLab.node, true)) {
            return;
        }

        // 检查是否处于无限体力状态
        var isWuXian = GameData.isWuXian();
        if (isWuXian) {
            this.piaoNumLab.string = "∞";
            // 无限体力时隐藏冷却UI并清除旧的冷却记录，防止无限体力结束后异常恢复
            this.hidePowerTimeUI();
            this.stopPowerCDTimer();
            cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
        } else {
            const currentPower = GameData.getPower();
            this.piaoNumLab.string = currentPower.toString() + "/10";
            // 检查体力冷却状态
            this.checkPowerCDStatus(currentPower);
        }
        // var rewarddata1 = cc.sys.localStorage.getItem("rewarddata1");
        // if (rewarddata1) {
        //     var data = rewarddata1.split("|");
        //     if (rewarddata1[0] == "1") {
        //         this.piaoNumLab.string = "x" + data[1];
        //         GameData.piaoNum = Number(data[1]);
        //     }
        // }
        // var rewarddata2 = cc.sys.localStorage.getItem("rewarddata2");
        // if (rewarddata2) {
        //     var data2 = rewarddata2.split("|");
        //     GameData.signRewardTimer = Number(data2[1]);
        //     GameData.signRewardNum = Number(data2[2]);
        // }


        // this.seleGameStyle(null, Hall.LastChoice);
    }

    /**检查体力冷却状态 */
    private checkPowerCDStatus(currentPower: number): void {
        if (currentPower >= 10) {
            // 体力已满，停止冷却
            if (this.powerCDInterval) {
                this.stopPowerCDTimer();
                this.hidePowerTimeUI();
                cc.sys.localStorage.removeItem(this.POWER_CD_STORAGE_KEY);
            }
        } else {
            // 体力不足10，确保冷却系统正在运行
            if (!this.powerCDInterval) {
                this.initPowerCDSystem();
            }
        }
    }

    openSignPanel() {
        var tweencontrol = this.signPanel.getChildByName("tweencontrol");
        tweencontrol.scale = 0;
        this.signPanel.active = true;
        cc.tween(tweencontrol)
            .to(0.3, { scale: 1 })

            .start();
    }
    // closeSignPanel() {
    //     var tweencontrol = this.signPanel.getChildByName("tweencontrol");
    //     cc.tween(tweencontrol)
    //         .to(0.3, { scale: 0 })
    //         .call(()=>{
    //           this.signPanel.active = false;   
    //         })
    //         .start();
    // }

    public static LastChoice: string

    /**存储所有关卡的完整数据列表 */
    private allLevelDataList: any[][] = [];

    /**构建关卡数据结构并创建所有hallcontent节点（但不初始化内容） */
    buildLevelDataStructure(list: any[]) {
        this.allLevelDataList = [];
        var datalist = [];

        // 先清空旧节点
        this.view.removeAllChildren();

        for (let i = 0; i < list.length; i++) {
            var data = list[i];
            var num = i % 6;
            datalist.push(data);

            GameData.nextlevelconfig[i] = data.level;
            GameData.nextlevelconfig2[data.level] = i;

            if ((i == list.length - 1 && num != 0)) {
                this.allLevelDataList.push([...datalist]);
                // 创建hallcontent节点但不初始化内容
                var content = cc.instantiate(this.hallcontentPrefab);
                this.view.addChild(content);
                datalist = [];
            }
            if ((num == 0 && i !== 0)) {
                this.allLevelDataList.push([...datalist]);
                // 创建hallcontent节点但不初始化内容
                var content = cc.instantiate(this.hallcontentPrefab);
                this.view.addChild(content);
                datalist = [];
                datalist.push(data);
                if (i == list.length - 1) {
                    this.allLevelDataList.push([...datalist]);
                    // 创建hallcontent节点但不初始化内容
                    var content = cc.instantiate(this.hallcontentPrefab);
                    this.view.addChild(content);
                    datalist = [];
                }
            }
        }
    }

    /**加载指定页面的内容 */
    loadPageContent(pageIndex: number) {
        if (pageIndex < 0 || pageIndex >= this.allLevelDataList.length) return;
        if (!this.view.children[pageIndex]) return;

        var hallcontentComp = this.view.children[pageIndex].getComponent(hallcontent);
        if (hallcontentComp) {
            hallcontentComp.onInit(this.allLevelDataList[pageIndex]);
        }
    }

    /**卸载指定页面的内容（可选，用于释放内存） */
    unloadPageContent(pageIndex: number) {
        if (pageIndex < 0 || pageIndex >= this.view.children.length) return;
        var hallcontentComp = this.view.children[pageIndex].getComponent(hallcontent);
        if (hallcontentComp) {
            // 隐藏所有子节点来释放渲染压力
            for (let i = 0; i < hallcontentComp.node.children.length; i++) {
                hallcontentComp.node.children[i].active = false;
            }
        }
    }

    /**加载当前页及相邻页 */
    loadCurrentAndAdjacentPages(currentPage: number) {
        // 先卸载距离较远的页面（距离当前页超过2页的内容）
        for (let i = 0; i < this.allLevelDataList.length; i++) {
            if (Math.abs(i - currentPage) > 2) {
                this.unloadPageContent(i);
            }
        }

        // 加载当前页
        this.loadPageContent(currentPage);

        // 预加载前一页
        if (currentPage > 0) {
            this.loadPageContent(currentPage - 1);
        }

        // 预加载后一页
        if (currentPage < this.allLevelDataList.length - 1) {
            this.loadPageContent(currentPage + 1);
        }
    }

    seleGameStyle(event: cc.Event.EventTouch, name: string) {
        // GameData.curGameStyle = event.currentTarget.name; 

        Hall.LastChoice = name;
        GameData.curFenLei = (this.pageView.getCurrentPageIndex() + 1).toString();

        var pages = this.pageView.getPages();
        if (Hall.remanberPage[name] != 0) {
            for (let i = 0; i < Hall.remanberPage[name]; i++) {
                if (pages[i]) pages[i].active = true;
            }
        }
        this.pageView.setCurrentPageIndex(Hall.remanberPage[name]);

        var list = levelConfig[name];
        this.view.width = Math.ceil(list.length / 6) * 720;
        GameData.curSeleStyle = list;
        this.name = name;

        // 构建数据结构
        this.buildLevelDataStructure(list);

        // 只加载当前页和相邻页
        var currentPage = Hall.remanberPage[name] || 0;
        this.loadCurrentAndAdjacentPages(currentPage);

        this.cloceEvent = true;
        this.scheduleOnce(() => {
            if (Hall.remanberPage[name] && this.pageView.getCurrentPageIndex() != Hall.remanberPage[name]) {
                for (let i = 0; i < Hall.remanberPage[name]; i++) {
                    var pages = this.pageView.getPages()[i];
                    pages.active = true;
                }

                this.pageView.scrollToPage(Hall.remanberPage[name], 0.5);
                this.scheduleOnce(() => {
                    this.cloceEvent = false;
                    this.upDatePage();
                }, 0.5);
            } else {
                this.upDatePage();
                this.cloceEvent = false;
            }
        }, 0.05)
    }

    /**关卡选框动画效果 */
    tween() {
        //
        let frames = this.Frame.children;
        let timer = 0;
        for (let i = 0; i < frames.length; i++) {
            cc.tween(frames[i])
                .delay(timer)
                .to(0.1, { scale: 1.1 })
                .to(0.1, { scale: 1 })
                .to(0.1, { scale: 1.1 })
                .to(0.1, { scale: 1 })
                .start()

            timer += 0.4;
        }
    }

    name: string;
    public pageView: cc.PageView;
    turnPageEvent() {
        if (this.cloceEvent) return;
        var currentPage = this.pageView.getCurrentPageIndex();
        Hall.remanberPage[this.name] = currentPage;

        // 懒加载：加载当前页和相邻页
        this.loadCurrentAndAdjacentPages(currentPage);

        this.upDatePage();
    }
    cloceEvent: boolean = false;
    public static remanberPage: { [key: string]: number } = {
        "new": 0,
        "hx": 0,
        "cp": 0,
        "gz": 0,
        "hot": 0,
    }
    private levelPreloadTasks: { [key: string]: Promise<void> } = {};
    private readonly popularLevelKeys: string[] = ["lv289/ajs_lv289", "lv232/ajs_lv232"];
    private popularLevelQueue: string[] = [];
    private isProcessingPopularPreload = false;

    //**------点击事件----- start: */
    changePage(event: cc.Event.EventTouch, name: string) {
        if (!this.pageView) return;
        var thisPage = this.pageView.getCurrentPageIndex();
        if (name == "turnLeft") {
            if (thisPage == 0) return;
            this.pageView.scrollToPage(thisPage - 1, 0.1);
        }
        else if (name == "turnRight") {
            if (thisPage + 1 == this.pageView.getPages().length) return;
            this.pageView.scrollToPage(thisPage + 1, 0.1);
        }
        GameData.curFenLei = (this.pageView.getCurrentPageIndex() + 1).toString();
    }
    upDatePage() {
        if (!this.pageView) return;
        var pageLab = this.pageView.node.getChildByName("pagenumber").getComponent(cc.Label);
        pageLab.string = (this.pageView.getCurrentPageIndex() + 1).toString() + "/" + this.pageView.getPages().length.toString();
        this.pageView.getPages()[this.pageView.getCurrentPageIndex()].active = true;
        // console.log(this.pageView.getPages())
        if (this.pageView.getCurrentPageIndex() < this.pageView.getPages().length - 1) this.pageView.getPages()[this.pageView.getCurrentPageIndex() + 1].active = false;
        GameData.curFenLei = (this.pageView.getCurrentPageIndex() + 1).toString();
    }

    unlockvideo() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (GameData.unlockVideoNum < 3) {
            // VideoManager.getInstance().report("clickunlckall", { complet: 0 });
            VideoManager.getInstance().showVideo(() => {
                GameData.unlockVideoNum++;
                // VideoManager.getInstance().report("clickunlckall", { complet: GameData.unlockVideoNum });
                this.btn_unlockvideo.getChildByName("unlocknum").getComponent(cc.Label).string = GameData.unlockVideoNum + "/3";
                if (GameData.unlockVideoNum == 3) {
                    GameData.unlockAll();
                    GameData.saveUnlockTime(new Date().getTime());
                    this.btn_unlockvideo.active = false;
                    this.seleGameStyle(null, Hall.LastChoice);
                }
            })
        }
    }

    fanhui() {
        // this.view.parent.getComponent(cc.PageView).scrollToBottomLeft(0.1);
        // this.view.parent.getComponent(cc.PageView).setCurrentPageIndex(0);

        this.scheduleOnce(() => {
            this.node.getChildByName("new").active = false;
            this.node.getChildByName("ye").active = true;
        }, 0.05)

    }


    refreshEffSwitch() {
        var kaiguan = this.btn_effswitch.getChildByName("开关");
        var shez3 = this.btn_effswitch.getChildByName("shez3");
        if (GameData.effectSwitch == false) {
            cc.tween(kaiguan)
                .to(0.1, { x: 80 })
                .call(() => {
                    shez3.active = true;
                })
                .start()
        } else {
            cc.tween(kaiguan)
                .to(0.1, { x: -80 })
                .call(() => {
                    shez3.active = false;
                })
                .start()
        }
    }
    effswitch() {
        GameData.effectSwitch = !GameData.effectSwitch
        if (GameData.effectSwitch == true) {
            AudioManager.stopEffect()
        }
        this.refreshEffSwitch();
    }
    refreshMusicSwitch() {
        var kaiguan = this.btn_musicswitch.getChildByName("开关");
        var shez3 = this.btn_musicswitch.getChildByName("shez3");
        if (GameData.musicSwitch == false) {
            cc.tween(kaiguan)
                .to(0.1, { x: 80 })
                .call(() => {
                    shez3.active = true;
                })
                .start()
        } else {
            cc.tween(kaiguan)
                .to(0.1, { x: -80 })
                .call(() => {
                    shez3.active = false;
                })
                .start()
        }
    }
    musicSwitch() {
        GameData.musicSwitch = !GameData.musicSwitch
        if (GameData.musicSwitch == true) {
            AudioManager.resumeMusic();
        } else {
            AudioManager.pauseMusic();
        }
        this.refreshMusicSwitch();
    }

    closeSwitchPanel() {
        this.switchPanel.active = false;
    }

    openSwitchPanel() {
        this.refreshEffSwitch();
        this.refreshMusicSwitch();
        var tweencontrol = this.switchPanel.getChildByName("设置页面");
        if (tweencontrol) {
            tweencontrol.scale = 0;
            this.switchPanel.active = true;
            cc.tween(tweencontrol)
                .to(0.3, { scale: 1 })
                .start();
        } else {
            this.switchPanel.active = true;
        }
    }


    openPowerVideoAdd() {
        var tweencontrol = this.powerVideoAdd.getChildByName("tweencontrol");
        if (tweencontrol) {
            tweencontrol.scale = 0;
            this.powerVideoAdd.active = true;
            cc.tween(tweencontrol)
                .to(0.3, { scale: 1 })
                .start();
        } else {
            this.powerVideoAdd.active = true;
        }
    }
    closePowerVideoAdd() {
        this.powerVideoAdd.active = false;
    }
    videoPowerAdd() {
        VideoManager.getInstance().showVideo(() => {
            GameData.setPower(3);
            common.ShowTipsView("体力+3");
            this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
        })
    }

    /**
     * 打开体力不足界面
     * 当体力不足时调用此方法，显示体力补充面板
     */
    // openPowerNotEnoughPanel() {
    //     AudioManager.playEffect(AudioManager.common.BUTTON);
    //     // 显示体力补充面板（复用已有的体力增加面板）
    //     this.powerVideoAdd.active = true;
    // }
    openPowerWuXian() {
        var tweencontrol = this.powerVideoWuXian.getChildByName("tweencontrol");
        if (tweencontrol) {
            tweencontrol.scale = 0;
            this.powerVideoWuXian.active = true;
            cc.tween(tweencontrol)
                .to(0.3, { scale: 1 })
                .start();
        } else {
            this.powerVideoWuXian.active = true;
        }
    }
    closePowerWuXian() {
        this.powerVideoWuXian.active = false;
    }
    videoPowerWuXianOne() {
        VideoManager.getInstance().showVideo(() => {
            // 设置10分钟无限体力（600秒）
            const WUXIAN_DURATION = 600; // 10分钟 = 600秒
            GameData.PowerWuXianNum = WUXIAN_DURATION;
            GameData.PowerWuXianTimer = new Date().getTime();
            GameData.setPowerWuXiaoNum(WUXIAN_DURATION);
            GameData.setPowerWuXiaoTimer(GameData.PowerWuXianTimer);
            common.ShowTipsView("获得10分钟无限体力！");
            this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
            // this.closePowerWuXian();
        })
    }
    videoPowerWuXianTwo() {
        VideoManager.getInstance().showVideo(() => {
            // 设置10分钟无限体力（600秒）
            const WUXIAN_DURATION = 3600; // 10分钟 = 600秒
            GameData.PowerWuXianNum = WUXIAN_DURATION;
            GameData.PowerWuXianTimer = new Date().getTime();
            GameData.setPowerWuXiaoNum(WUXIAN_DURATION);
            GameData.setPowerWuXiaoTimer(GameData.PowerWuXianTimer);
            common.ShowTipsView("获得60分钟无限体力！");
            this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
            // this.closePowerWuXian();
        })
    }
    /**便捷入口 */
    simpleEnter() {

    }

    /**添加桌面 */
    addDesktop() {

    }

    /**分享好友 */
    shareGame() {

    }


    //***-----------点击事件-------------end */



    //底部icon方法 -----

    /**icon位置初始化 */
    // setIconpos() {
    //     let icons = this.btnDown.children;
    //     for (let i = 0; i < icons.length; i++) {
    //         let icon = icons[i];
    //         icon.x = this.iconStartposX + this.iconDis * i;
    //         icon.y = this.iconY;
    //     }
    // }
    /**底部icon移动 */
    // iconMove(dt) {

    //     let icons = this.btnDown.children;

    //     let lastIcon;

    //     for (let i = 0; i < this.btnDown.childrenCount; i++) {
    //         let icon = this.btnDown.children[i];

    //         if (lastIcon == null) lastIcon = icon;

    //         // if (!lastIcon.x) continue


    //         //移动
    //         icon.x += dt * this.iconSpeed;
    //         //更新lastIcon
    //         lastIcon = icon;
    //         //回到开头位置
    //         if (icon.position.x > this.iconStartposX + (this.btnDown.children.length + 1) * this.iconDis) {
    //             icon.x = this.iconStartposX + this.iconDis;
    //             break;
    //         }


    //         var cha = Math.abs(lastIcon.x - icon.x)
    //         var cha2 = Math.abs(cha - this.iconDis);
    //         if (lastIcon !== icon && cha2 >= 10) {
    //             this.setIconpos();
    //             console.log("ReStart Positon!");
    //             return

    //         }
    //     }

    // }
    // update(dt: number): void {
    //     // if (this.isgo) return
    //     let icons = this.btnDown.children;
    //     for (let i = 0; i < icons.length; i++) {
    //         let icon = icons[i];
    //         //icon移动
    //         this.iconMove(dt);

    //     }
    // }

    private startPreloadPopularLevels() {
        if (!this.popularLevelKeys.length) {
            return;
        }
        if (!this.popularLevelQueue.length) {
            this.popularLevelQueue = this.popularLevelKeys.slice();
        }
        if (this.isProcessingPopularPreload) {
            return;
        }
        this.processNextPopularLevel();
    }

    private processNextPopularLevel() {
        if (!this.popularLevelQueue.length) {
            this.isProcessingPopularPreload = false;
            return;
        }

        const levelKey = this.popularLevelQueue.shift();
        if (!levelKey) {
            this.scheduleNextPopularLevelProcess();
            return;
        }
        if (this.levelPreloadTasks[levelKey]) {
            this.scheduleNextPopularLevelProcess();
            return;
        }

        this.isProcessingPopularPreload = true;
        const preloadTask = this.preloadLevel(levelKey).catch(err => {
            cc.warn(`[Hall] 预加载 ${levelKey} 失败`, err?.message);
        });
        this.levelPreloadTasks[levelKey] = preloadTask;
        preloadTask.then(() => {
            this.scheduleNextPopularLevelProcess();
        });
    }

    private scheduleNextPopularLevelProcess() {
        if (!cc.isValid(this.node)) {
            this.isProcessingPopularPreload = false;
            return;
        }
        this.scheduleOnce(() => this.processNextPopularLevel(), 0);
    }

    private async preloadLevel(levelKey: string): Promise<void> {
        const [bundleName, prefabName] = levelKey.split("/");
        if (!bundleName || !prefabName) {
            cc.warn(`[Hall] levelKey ${levelKey} 格式错误，跳过预加载`);
            return;
        }
        const bundle = await AssetManager.loadBundle(bundleName);
        if (!bundle) {
            cc.warn(`[Hall] bundle ${bundleName} 加载失败，跳过预加载`);
            return;
        }
        const tasks: Promise<void>[] = [];
        tasks.push(this.loadPrefabFromBundle(bundle, prefabName));
        // 保留音频、图集预加载逻辑，后续需要再打开
        // tasks.push(this.loadDirFromBundle(bundle, `audio_${bundleName}`, cc.AudioClip));
        // tasks.push(this.loadDirFromBundle(bundle, `picture_${bundleName}`, cc.Asset));
        await Promise.all(tasks);
        console.log(`[Hall] 预加载 ${levelKey} 完成`);
    }

    private loadPrefabFromBundle(bundle: cc.AssetManager.Bundle, prefabPath: string): Promise<void> {
        return new Promise(resolve => {
            bundle.load(prefabPath, cc.Prefab, null, (err: Error, prefab: cc.Prefab) => {
                if (err) {
                    cc.error(`[Hall] 预加载 prefab ${prefabPath} 失败`, err);
                }
                resolve();
            });
        });
    }

    private loadDirFromBundle(bundle: cc.AssetManager.Bundle, dir: string, type: typeof cc.Asset): Promise<void> {
        return new Promise(resolve => {
            if (!dir) {
                resolve();
                return;
            }
            bundle.loadDir(dir, type, null, (err: Error, assets: cc.Asset[]) => {
                if (err) {
                    cc.warn(`[Hall] bundle ${bundle.name} 不存在目录 ${dir} 或加载失败`, err.message);
                }
                resolve();
            });
        });
    }
}






