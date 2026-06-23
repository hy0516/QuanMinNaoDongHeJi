import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv301 extends BaseGame {
    @property(cc.Node)
    zhua: cc.Node = null;
    canjiaohu = false;
    @property(cc.Node)
    ww: cc.Node = null;
    @property(cc.Node)
    btn_black: cc.Node = null;
    @property(cc.Node)
    manager: cc.Node = null;
    @property(cc.Node)
    dian: cc.Node = null;
    @property(cc.Node)
    dfts: cc.Node = null;

    index = 0;
    lock = false;
    music: string[] = [`05`, `06`, `07`, `08`, `09`, `10`, `11`, `12`, `13`, `14`, `15`, `16`];
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv301`);
        }, 0.5);
        this.node.getComponent(cc.Widget).updateAlignment()
        let widgets = this.node.getComponentsInChildren(cc.Widget)
        widgets.forEach(widget => {
            widget.updateAlignment();
        });
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
    }
    
    onDestroy() {
        if (this.node && this.node.isValid) {
            const bgNode = this.node.getChildByName('bg');
        }
        this.unscheduleAllCallbacks();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_zhua":
                this.zhua.getComponent(`zhua_lv301`).zhua();
                break;
            case "btn_100":
                VideoManager.getInstance().showVideo(() => {
                    this.dfts.y = -166.251;
                    this.dfts.opacity = 255;
                    cc.tween(this.dfts)
                        .to(0.6, {y: this.dfts.y + 100 ,opacity: 150})
                        .to(0.5, {opacity: 0})
                        .start();
                    
                    AudioManager.playEffect(`超级抓力`);
                    this.dian.active = true;
                    this.zhua.getComponent(`zhua_lv301`).to100();
                })
                break;
            case "btn_black":
                this.btn_black.active = false;
                this.ww.getChildByName(`${this.index}`).active = false;
                this.lock = false;
                break;
        }
    }

    showWW(node: cc.Node) {
        if (this.lock) return;
        this.lock = true;
        node.active = false;
        this.index = parseInt(node.name);
        AudioManager.playEffect(this.music[this.index-1]);
        AudioManager.playEffect(`物品展示`);
        this.ww.scale = 0.1;
        this.ww.getChildByName(`${this.index}`).active = true;
        this.btn_black.active = true;
        cc.tween(this.ww)
            .to(0.5,{scale:1})
            .start();
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    onlost() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }
}