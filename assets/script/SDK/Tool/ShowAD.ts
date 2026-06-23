// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK_Manager";
import SDKTool from "./SDKTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShowAD extends cc.Component {


    @property
    adtype: number = 3;
    @property
    delay: number = 300;

    @property(cc.Boolean)
    isBanner: boolean=false;

    @property(cc.Boolean)
    isDouble: boolean = false;


    @property(cc.Boolean)
    isShowVideo: boolean = false;

    @property(cc.Prefab)
    VideoView: cc.Prefab = null;
    @property(cc.Prefab)
    BoxView: cc.Prefab = null;
    
    @property(cc.Boolean)
    isOPPO: boolean=false;

    @property(cc.Boolean)
    isVIVO: boolean=false;

    @property(cc.Boolean)
    isLoop: boolean = false;
    static showCount: number = 0;

    protected onEnable(): void {


    }
    protected onDisable(): void {
      

    }
    start() {

    }

    // update (dt) {}
}
