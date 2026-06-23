import Platforms_QuickGame from "../SDK/Platforms/QuickGame/Platforms_QuickGame";
import AssetManager from "./AssetManager";
import AudioManager from "./AudioManager";
import BaseGame from "./BaseGame";
import GameData from "./GameData";
import VideoManager from "./VideoManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class pausePanelts extends cc.Component {


    protected onLoad(): void {

        cc.audioEngine.pauseAll();
        cc.director.pause();
        Platforms_QuickGame.getInstance().showInsertAd();
    }
    close() {
        // 恢复游戏（会走倒计时）
        let baseGame: BaseGame = null;
        if (this.node.parent) {
            baseGame = this.node.parent.getComponent(BaseGame);
        }
        if (!baseGame && this.node.parent && this.node.parent.parent) {
            baseGame = this.node.parent.parent.getComponent(BaseGame);
        }
        
        // 如果游戏有resumeGamePublic方法，调用它（会走倒计时）
        if (baseGame && (baseGame as any).resumeGamePublic) {
            cc.director.resume();
            (baseGame as any).resumeGamePublic();
        } else {
            // 如果没有resumeGamePublic方法，使用默认恢复方式
            cc.audioEngine.resumeAll();
            cc.director.resume();
        }
        
        this.node.cleanup();
        this.node.destroy();
    }
    fangQiGk() {
        cc.director.resume();
        cc.audioEngine.resumeAll();
        cc.audioEngine.stopAll();
        // AudioManager.stopEffect();
        // AudioManager.stopEffect2();
        if(this.node.parent.getComponent(BaseGame))
        {
            this.node.parent.getComponent(BaseGame).fanhui();
        }else
        {
            this.node.parent.parent.getComponent(BaseGame).fanhui();
        }
        // this.node.parent.cleanup(); 
        // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
        //     var UINode = cc.instantiate(UI);
        //     UINode.parent = cc.find("Canvas");
        //     VideoManager.getInstance().showBaoXiang();
        //     GameData.onDele();
        //     this.node.parent.destroy();
        // })
    }
    restartCurGame() {
        cc.director.resume();
        cc.audioEngine.resumeAll();
        cc.audioEngine.stopAll();
        // AudioManager.stopEffect();
        // AudioManager.stopEffect2();
        if(this.node.parent.getComponent(BaseGame))
        {
            this.node.parent.cleanup();
            this.node.parent.getComponent(BaseGame).restart();
        }else
        {
            this.node.parent.parent.cleanup();
            this.node.parent.parent.getComponent(BaseGame).restart();
        }
        // AudioManager.playEffect(AudioManager.common.BUTTON);
        // AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
        //     var HallnNode = cc.instantiate(name);
        //     HallnNode.parent = cc.find("Canvas");
        //     GameData.onDele();
        //     GameData.PauseGame = false;
        //     this.node.parent.destroy();
        // })

    }
}
