import Platforms_QuickGame from "../SDK/Platforms/QuickGame/Platforms_QuickGame";
import AssetManager from "./AssetManager";
import AudioManager from "./AudioManager";
import BaseGame from "./BaseGame";
import common from "./common";
import GameData from "./GameData";
import VideoManager from "./VideoManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class signPanel extends cc.Component {

    @property(cc.Node)
    viewNode: cc.Node = null;
    @property(cc.Node)
    videosignbtn: cc.Node = null;
    @property(cc.Node)
    videoDoubleSignBtn: cc.Node = null;
    @property(cc.Node)
    signbtn: cc.Node = null;
    signnum = 0;

    // rewardlist = ["1|1", "1|2", "2|2", "1|1", "1|2", "1|3", "2|2"];
    rewardlist = [2, 5, 8, 10, 12, 15, 20];
    protected onLoad(): void {
        // cc.audioEngine.pauseAll();
    }
    protected onEnable(): void {
        // cc.director.pause();
        this.signreFresh();
        this.scheduleOnce(() => {

            Platforms_QuickGame.getInstance().showInsertAd();

        }, 0.5)

    }
    signreFresh() {
        var signdata = cc.sys.localStorage.getItem("signdata");
        if (signdata) {
            var datalist = signdata.split("|");
            if (datalist && datalist[0] <= new Date().getMonth() + 1 && datalist[2] != "7") {
                for (let i = 0; i < this.viewNode.childrenCount; i++) {
                    var item = this.viewNode.children[i];
                    item.getChildByName("num").getComponent(cc.Label).string = "x"+this.rewardlist[i].toString();
                    if (i == Number(datalist[2])) {
                        item.getChildByName("xuanzhong").active = true;
                        this.signnum = i;
                    }
                    if (i <= Number(datalist[2]) - 1) {
                        item.getChildByName("sele").active = true;
                        item.getChildByName("xuanzhong").active = false;
                    }
                }
                if (Number(datalist[1]) < new Date().getDate()) {
                    this.signbtn.active = true;
                    this.videoDoubleSignBtn.active = true;
                    // this.videosignbtn.active = false;
                } else {
                    this.signbtn.active = false;
                    this.videoDoubleSignBtn.active = false;
                    this.videosignbtn.active = true;
                }
            } else if (datalist[2] == "7") {
                for (let i = 0; i < this.viewNode.childrenCount; i++) {
                    var item = this.viewNode.children[i];
                    item.getChildByName("sele").active = true;
                    item.getChildByName("xuanzhong").active = false;
                }
                this.signbtn.active = false;
                this.videosignbtn.active = false;
                this.videoDoubleSignBtn.active = false;
            }
        } else {
            for (let i = 0; i < this.viewNode.childrenCount; i++) {
                var item = this.viewNode.children[i];
                item.getChildByName("num").getComponent(cc.Label).string = "x"+this.rewardlist[i].toString();
            }
            this.signbtn.active = true;
            this.videosignbtn.active = false;
            this.videoDoubleSignBtn.active = true;
            this.viewNode.children[0].getChildByName("xuanzhong").active = true;
        }
    }
    close() {
        // cc.audioEngine.resumeAll();
        // cc.director.resume();
        // this.node.cleanup();
        var tweencontrol = this.node.getChildByName("tweencontrol");
        cc.tween(tweencontrol)
            .to(0.3, { scale: 0 })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    signtoday() {
        var signdata = cc.sys.localStorage.getItem("signdata");
        var month = new Date().getMonth() + 1;
        var day = new Date().getDate();
        if (signdata) {
            var datalist = signdata.split("|");
            var num = Number(datalist[2]) + 1;
            var data = month + "|" + day + "|" + num;
            cc.sys.localStorage.setItem("signdata", data);
        } else {
            var data = month + "|" + day + "|" + 1;
            cc.sys.localStorage.setItem("signdata", data);
        }

        // var rewarditem = this.rewardlist[this.signnum].split("|");
        // if (rewarditem[0] == "1") {
        //     var rewarddata1 = cc.sys.localStorage.getItem("rewarddata1");
        //     if (rewarddata1) {
        //         var datalist1 = rewarddata1.split("|");
        //         var linshia = (rewarddata1[0] + "|" + (Number(rewarditem[1]) + Number(datalist1[1])).toString());
        common.ShowTipsView("体力+" + this.rewardlist[this.signnum]);
        // cc.sys.localStorage.setItem("rewarddata1", linshia);
        GameData.setPower(this.rewardlist[this.signnum]);

        //     } else {
        //         cc.sys.localStorage.setItem("rewarddata1", rewarditem[0] + "|" + rewarditem[1]);
        //     }
        // } else if (rewarditem[0] == "2") {
        // var rewarddata2 = cc.sys.localStorage.getItem("rewarddata2");
        // if (rewarddata2) {
        //     var datalist = rewarddata2.split("|");
        // common.ShowTipsView("体力+" + rewarditem[1] + "小时已生效");
        // cc.sys.localStorage.setItem("rewarddata2", rewarditem[0] + "|" + new Date().getTime() + "|" + rewarditem[1]);
        // }

        this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
        this.signreFresh();
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // this.close();
    }

    videoSignToday() {
        VideoManager.getInstance().showVideo(() => {
            this.signtoday();
        })
    }

    videoDoubleSignToday() {
        VideoManager.getInstance().showVideo(() => {
            var signdata = cc.sys.localStorage.getItem("signdata");
            var month = new Date().getMonth() + 1;
            var day = new Date().getDate();
            if (signdata) {
                var datalist = signdata.split("|");
                var num = Number(datalist[2]) + 1;
                var data = month + "|" + day + "|" + num;
                cc.sys.localStorage.setItem("signdata", data);
            } else {
                var data = month + "|" + day + "|" + 1;
                cc.sys.localStorage.setItem("signdata", data);
            }

            // 双倍奖励
            var doubleReward = this.rewardlist[this.signnum] * 2;
            common.ShowTipsView("体力+" + doubleReward);
            GameData.setPower(doubleReward);

            this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
            this.signreFresh();
            AudioManager.playEffect(AudioManager.common.BUTTON);
            // this.close();
        })
    }
    protected onDisable(): void {
        // cc.director.resume();
    }
}
