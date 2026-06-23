import DYTitle from "../SDK/XXL/DYTitle";
import AssetManager from "./AssetManager";
import AudioManager from "./AudioManager";
import GameData from "./GameData";
import Hall from "./Hall";
import VideoManager from "./VideoManager";
import common from "./common";
import smallLoading from "./smallLoading";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item_loadgame extends cc.Component {

    level
    oninit(any) {
        if (!any) this.node.active = false;
        var bundlename = "lvicon";
        if (any.lv < 150) bundlename = "oldlvicon";
        AssetManager.load(bundlename, any.icon, cc.SpriteFrame, null, (assets: cc.SpriteFrame) => {
            // if (err) console.log(err);
            this.node.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = assets;
        })
        this.node.getChildByName("piao").active = false;
        if (any.hot) this.node.getChildByName("re").active = true;
        if (any.nan) this.node.getChildByName("nan").active = true;
        if (any.new) this.node.getChildByName("xin").active = true;
        if (any.bao) this.node.getChildByName("baoi").active = true;
        this.node.getChildByName("sjd").getChildByName("tittle").getComponent(cc.Label).string = any.name;
        // if (GameData.getlevelData(any.name) == undefined) {
        //     this.node.getChildByName("suo").active = true
        // } else {
        //     this.node.getChildByName("suo").active = false;
        // }
        // if (GameData.piaoNum != 0 && this.node.getChildByName("suo").active == true) {
        //     this.node.getChildByName("suo").active = false;
        //     this.node.getChildByName("piao").active = true;
        // }
        // var time = new Date().getTime();
        // if (time - GameData.signRewardTimer < GameData.signRewardNum * 60 * 60 * 1000) {
        //     this.node.getChildByName("suo").active = false;
        //     this.node.getChildByName("piao").active = false;
        // }
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchStart, this);
        this.level = any;

    }

    protected onDisable(): void {
        // this.node.getChildByName("re").active = false;
        // this.node.getChildByName("nan").active = false;
        // this.node.getChildByName("xin").active = false;
        // this.node.getChildByName("baoi").active = false;
        // this.node.getChildByName("piao").active = false;
    }
    onTouchStart() {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // if (this.node.getChildByName("suo").active) {
        //     VideoManager.getInstance().report("clickItemGameVideo", { name: this.level.name + "0" });
        //     VideoManager.getInstance().showVideo(() => {
        //         common.ShowTipsView("视频解锁");
        //         this.node.getChildByName("suo").active = false;
        //         GameData.setlevelData(this.level.name, false);
        //         VideoManager.getInstance().report("clickItemGameVideo", { name: this.level.name + "1" });
        //     });
        //     console.log("视频解锁");
        //     return;
        // } else if (this.node.getChildByName("piao").active) {
        //     common.ShowTipsView("消耗解锁券x1");
        //     GameData.setlevelData(this.level.name, false);
        //     var rewarddata1 = cc.sys.localStorage.getItem("rewarddata1").split("|");
        //     var num = Number(rewarddata1[1]) - 1;
        //     cc.sys.localStorage.setItem("rewarddata1", rewarddata1[0] + "|" + num.toString());
        //     this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
        //     return
        // }
        if (GameData.isWuXian() == false) {
            if (GameData.getPower() <= 0) {
                // No power: open the existing power panel in Hall and block entering the level.
                const hallNode = cc.find("Canvas/Hall");
                const hallComp = hallNode ? hallNode.getComponent(Hall) : null;
                if (hallComp) {
                    hallComp.openPowerWuXian();
                } else {
                    common.ShowTipsView("体力不足");
                }
                return;
            }
            // Has power: consume 1 power (delta -1).
            GameData.setPower(-1);
        }

        this.node.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
        VideoManager.getInstance().report("clickItemGameVideo", { name: this.level.name + "2" });
        this.loadgame();
    }
    loadgame() {
        if (GameData.isloadLv) return
        GameData.isloadLv = true;
        var list = this.level.level.split("/");
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchStart, this);
        cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
            GameData.isloadLv = false;
            // var itemlist = this.node.parent.parent.children;
            // for (let i = 0; i < list.length; i++) {
            //     common.setitem(itemlist[i])
            // };
            let preNode: cc.Node = cc.instantiate(pre);
            preNode.parent = cc.find("Canvas");
            var hall = cc.find("Canvas/Hall")
            if (hall) hall.destroy();
            // this.node.parent.parent.parent.parent.parent.destroy();
            GameData.curGameName = list[1];
            GameData.curGameStyle = list[0];
            // DYTitle.text = this.level.name;
            // var node = cc.find("Canvas/game/title");
            // node.getComponent(DYTitle).init();
            preNode.getComponent(smallLoading).PreName = GameData.curGameStyle + "/" + GameData.curGameName;
            preNode.getComponent(smallLoading).lvConfig = this.level;
            preNode.getComponent(smallLoading).onInit();
            if (this.level) VideoManager.getInstance().report("enterLv", { name: this.level.name + "0" });
        })
    }
}