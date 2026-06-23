import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK_Manager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class addDesktopBtn extends cc.Component {

    qg: any = window['qg'];
    enabledCount: number = 0;
    start() {

        this.node.on(cc.Node.EventType.TOUCH_END, this.addDesktop, this);

    }

    onEnable(): void {
        const self = this;
        this.enabledCount++;
        if (SDK_Manager.getInstance().isVivo()) {
            if (this.qg != null && this.qg != undefined) {
                this.qg.hasShortcutInstalled({
                    success: function (status) {
                        if (status) {
                            console.log('已创建')
                            self.node.active = false;
                        } else {
                            console.log('未创建')
                            self.node.active = true;
                            if (self.enabledCount == 2) {
                                self.qg.installShortcut({
                                    success: function () {
                                        // 执行用户创建图标奖励
                                        self.node.active = false;
                                    },
                                    fail: function (err) { },
                                    complete: function () { },
                                });
                            }
                        }
                    }
                })
            } else {
                self.node.active = false;
            }
        }


        if (SDK_Manager.getInstance().isOppo()) {
            if (this.qg != null && this.qg != undefined) {
                this.qg.hasShortcutInstalled({
                    success: function (res) {
                        // 判断图标未存在时，创建图标
                        if (res == false) {
                            self.node.active = true;
                            if (self.enabledCount == 2) {
                                self.qg.installShortcut({
                                    success: function () {
                                        // 执行用户创建图标奖励
                                        self.node.active = false;
                                    },
                                    fail: function (err) { },
                                    complete: function () { },
                                });
                            }
                        } else {
                            self.node.active = false;
                        }
                    },
                    fail: function (err) { },
                    complete: function () { },
                });
            } else {
                self.node.active = false;
            }
        }
    }

    addDesktop() {
        const self = this;
        if (this.qg != null && this.qg != undefined) {
            this.qg.installShortcut({
                success: function () {
                    // 执行用户创建图标奖励
                    self.node.active = false;
                },
                fail: function (err) { },
                complete: function () { },
            });
        }
    }

    onDisable(): void {
    }
}