// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SDK_Manager from "../SDK_Manager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class adddesktop extends cc.Component {

  qg: any = window['qg'];
  button: any = null;

  static addd: number = 0;
  onEnable() {
    console.log('加桌');
    adddesktop.addd++;
    if (SDK_Manager.getInstance().isVivo()) {

      this.isaddDeskTop();

    }

  }

  isaddDeskTop() {

    if (this.qg != null && this.qg != undefined) {
      var self = this;
      self.qg.hasShortcutInstalled({
        success: function (status) {
          if (status) {
            console.log('已创建')
          } else {
            console.log('未创建')
            if (adddesktop.addd == 2 || adddesktop.addd == 5) {
              self.installShortcut();
            }
            self.addDeskTop();
          }
        }
      })

    }
  }
  addDeskTop() {
    var self = this;
    if (self.button == null) {
      self.button = self.qg.createShortcutButton({
        // type: 'image',
        style: {
          // left: 900,
          // top: 1000,
          // width: 100,
          // height: 100
          backgroundColor: "#000000"
        }
      })
    } else {
      self.button.show();
    }


    var startHandler = function (data) {
      console.log(data);
      if (data.code == 0 || data.code == 1) {
        self.button.offTap(startHandler);
        self.button.destroy();
        self.button = null;
      } else {
        self.qg.showToast({
          message: "创建桌面快捷方式失败，请稍后再试"
        })
      }
    };
    self.button.onTap(startHandler)
  }
  installShortcut() {
    var self = this;
    this.qg.installShortcut({
      success: function () {
        console.log('创建成功')
        self.button.destroy();
        self.button = null;
      }
    })
  }

  onHide() {
    console.log('隐藏');
    if (this.button != null) {
      this.button.hide();

    }
  }

   onDisable(): void {
    console.log('隐藏');
    if (this.button != null) {
      this.button.hide();

    }
  }
  // update (dt) {}
}
