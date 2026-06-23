import common from "../../common/common";
import GameData from "../../common/GameData";
import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK_Manager";
import SDKTool from "./SDKTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DYAddDeskTop extends cc.Component {

    tt: any = window['ks'];
    enabledCount: number = 0;
    private getReward: string = "false";
    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.addDesktop, this);
    }

    onEnable(): void {
        this.getReward = cc.sys.localStorage.getItem("getReward");
        let rewardTime = cc.sys.localStorage.getItem("getRewardTime");
        if (24 * 60 * 60 * 1000 + Number(rewardTime) < Date.now()) {
            console.log("时间已过24小时，添加桌面奖励已刷新");
            this.getReward = "false";
        }

        if (SDKTool.isDeubg) {
            this.node.active = false;
            return;
        }
        const self = this;
        this.enabledCount++;

        if (this.tt != null && this.tt != undefined) {
            this.tt.checkShortcut({
                success: (res) => {
                    if (res.status.exist && this.getReward == "false") {
                        this.getReward = "true";
                        common.ShowTipsView("体力+2");
                        GameData.setPower(2);
                        self.node.active = false; // 如果快捷方式已存在，隐藏当前节点
                    } else {
                        self.node.active = true; // 如果快捷方式不存在，显示当前节点
                    }
                },
                fail(res) {
                    console.log("检查快捷方式失败", res.errMsg);
                },
            });
        } else {
            self.node.active = false;
        }
    }

    addDesktop() {
        const self = this;

        //  self.node.active = false;
        if (this.tt != null && this.tt != undefined) {
            this.tt.addShortcut({
                success: () => {
                    if (this.getReward == "false") {
                        this.getReward = "true";
                        cc.sys.localStorage.setItem("getRewardTime", Date.now());
                        cc.sys.localStorage.setItem("getReward", this.getReward);
                        console.log("添加桌面成功");
                        common.ShowTipsView("体力+2");
                        GameData.setPower(2);
                        self.node.active = false; // 添加成功后隐藏当前节点
                    }
                },
                fail(err) {
                    console.log("添加桌面失败", err.errMsg);
                },
            });
        }
    }

    onDisable(): void {
    }
}