import common from "../../common/common";
import GameData from "../../common/GameData";
import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import toutiaoH5GameAPI from "../Platforms/QuickGame/toutiaoH5GameAPI/toutiaoH5GameAPI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DYCbl extends cc.Component {


    tt: any = window['ks'];
    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.Button)
    close_btn: cc.Button = null;

    @property(cc.Label)
    label: cc.Label = null;

    onLoad() {
    }

    onEnable() {
        this.button.node.on(cc.Node.EventType.TOUCH_END, this.onClickButton, this);
        this.close_btn.node.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.changeLabel();

    }

    changeLabel() {
        if (cc.sys.localStorage.getItem("isCbl") == 1) {
            this.label.string = "领取";
        } else {
            this.label.string = "前往侧边栏";

        }

    }
    onClickButton() {
        let isCbl = cc.sys.localStorage.getItem("isCbl");
        let getCblrew = cc.sys.localStorage.getItem("getCblrew");
        if (isCbl && !getCblrew) {
            this.tt.showToast({
                title: "体力+2",
                icon: "none",
                duration: 2000
            });
            common.ShowTipsView("体力+2");
            GameData.setPower(2);
            cc.sys.localStorage.setItem("getCblrew", "1");
            this.node.active = false;

        } else if (getCblrew && isCbl) {
            Platforms_QuickGame.getInstance().showToast("奖励已领取")
        }

        else {
            this.node.active = false;
            this.navigateToScene();
        }

    }
    onClickCloseBtn() {

        this.node.active = false;

    }


    navigateToScene() {

        this.tt.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("navigate to scene success");
                // 跳转成功回调逻辑
                cc.sys.localStorage.setItem("isCbl", "1");
            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                // 跳转失败回调逻辑
            },
        });

    }
    onDisable(): void {
        this.button.node.off(cc.Node.EventType.TOUCH_END, this.onClickButton, this);
        this.close_btn.node.off(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
    }

    onDestroy() {

    }


}