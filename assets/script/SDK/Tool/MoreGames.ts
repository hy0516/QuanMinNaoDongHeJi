// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SDK_Manager from "../SDK_Manager";
import SDK_config from "../SDK_config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MoreGames extends cc.Component {


    GameDrawerAd: any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }
     onEnable(): void {
        if(SDK_Manager.getInstance().isOppo()&&SDK_config.GameIdConfig.oppoID["BlockBoxId"]!=""){
        this.showPlatformBannerGameAd();
        }
    }

    createBannerGameAd() {
        if (window['qg']) {
           
        if (window['qg'].createGameDrawerAd) {
            this.GameDrawerAd = window['qg'].createGameDrawerAd({
                adUnitId: SDK_config.GameIdConfig.oppoID["BlockBoxId"],
                style: {

                  },
            });
            // this.GameDrawerAd.onLoad(() => {
            //     console.log('互推盒子横幅广告加载成功');
                
            // });
        }
        
    }
    }

    //展示互推盒子广告
    showPlatformBannerGameAd() {
        let self = this;
        if (!this.GameDrawerAd) {
            console.log('showPlatformBannerGameAd init');
            this.createBannerGameAd();
        }
        if (this.GameDrawerAd) {
            this.GameDrawerAd.show().then(() => {
                console.log('gameBannerAd show success')
            }).catch((error) => {
                console.log('gameBannerAd show fail with:' + error.errCode + ',' + error.errMsg);
                self.hidePlatformBannerGameAd();

            });
        }
    }

    //隐藏互推盒子广告
    hidePlatformBannerGameAd() {
        if (!!this.GameDrawerAd)
          this.GameDrawerAd.hide().then(() => {
            console.log('gameBannerAd hide success')
          }).catch((error) => {
            console.log('gameBannerAd hide fail with:' + error.errCode + ',' + error.errMsg);
        });
    }

     onDisable(): void {
        if(SDK_Manager.getInstance().isOppo()){
        this.hidePlatformBannerGameAd();
        }
    }
    // update (dt) {}
}
