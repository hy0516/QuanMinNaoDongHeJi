import SDK_Manager from "../SDK/SDK_Manager";
import InvokeConfig from "../SDK/Tool/InvokeConfig";
import SDKTool from "../SDK/Tool/SDKTool";
import AssetManager from "./AssetManager";
import AudioManager from "./AudioManager";
import GameData from "./GameData";
import levelConfig from "./levelConfig";
import VideoManager from "./VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;
    btn_start: cc.Node = null;

    /**加载进度 */
    plan2 = 0;
    plan3 = 0;
    isloadpicture = false;
    onLoad() {
        if (cc.sys.isMobile) {
            cc.view.setFrameSize(document.body.clientWidth, document.body.clientHeight);
        }
        GameData.onInit();
        this.initAssets();

        if (!SDKTool.isDeubg) {
            SDK_Manager.getInstance().Invoke(InvokeConfig.onInit);
        }

        cc.resources.load("audio/common/" + AudioManager.common.Hall_main4, cc.AudioClip, () => {
        }, (err, clip: cc.AudioClip) => {
            if (clip) {
                AudioManager.set(clip.name, clip);
                AudioManager.playMusic(clip.name);
            }
        })
        cc.resources.preload('prefabs/common/Hall', cc.Prefab);
        this.node.getChildByName("loadNode").active = true;
        this.btn_start = this.node.getChildByName("btn_start")
        this.btn_start.active = false;
        // cc.resources.loadDir("icon/hall", (complete, total, item) => {
        //     this.plan2 = complete / total;
        // }, (err,) => {
        //     if (err) {
        //         console.log(err);
        //         return
        //     }
        // })

        cc.tween(this.btn_start)
            .repeatForever(
                cc.tween()
                    .to(0.5, { scaleX: 1.1, scaleY: 1.1 })
                    .to(0.5, { scale: 1 })
            )
            .start()
        AssetManager.loadBundle("lvicon").then(() => {
            AssetManager.loadDir("lvicon", "hall", null, (complete, total) => {
                this.plan2 = complete / total;
            })
        })

        VideoManager.getInstance().report("entergame", { name: "进入游戏" });
    }

    async initAssets() {
        AssetManager.loadBundle("oldlvicon");
        AssetManager.loadBundle("comsound").then(() => {
            AssetManager.loadDir("comsound", "", null, (complete, total) => {
                // this.plan3 = complete / total;
            }, (assets: cc.AudioClip[]) => {
                assets.forEach(asset => {
                    AudioManager.set(asset.name, asset);
                })
            })
        })

        AssetManager.loadBundle(AssetManager.BundleName.picture).then(() => {
            AssetManager.loadBundle(AssetManager.BundleName.level).then(() => {
                this.isloadpicture = true;
            })
        })

        // AssetManager.loadBundle("lv157");
        // AssetManager.loadBundle("lv160");
    }

    iconTime = 0;
    iconClickNum = 0;
    isShowIcon = false;
    loadicon() {
        if (this.isShowIcon) return;
        var time = new Date().getTime();
        if (this.iconTime == 0) this.iconTime = time;
        if (time - this.iconTime < 1000) {
            this.iconClickNum++;
            if (this.iconClickNum == 5) {
                this.node.getChildByName("icard").active = true;
            }
        } else {
            this.iconClickNum = 0;
        }
        this.iconTime = time;
    }


    startGame() {
        cc.director.loadScene("game");

    }

    isjindu = true;
    update(dt) {
        // if (this.isjindu && !this.node.getChildByName("btn_start").active) {
        //     this.progress.getComponent(cc.ProgressBar).progress = (this.plan2 + this.plan3) / 2;
        //     if (!this.isloadpicture && (this.plan2 + this.plan3) / 2 >= 1) {
        //         this.progress.getComponent(cc.ProgressBar).progress = 0.97
        //     }
        //     if (this.isloadpicture && (this.plan2 + this.plan3) / 2 >= 1) {
        //         this.isjindu = false;
        //         this.node.getChildByName("loadNode").active = false;
        //         this.node.getChildByName("btn_start").active = false;
        //         this.startGame();

        //     }
        // }
        if (this.isjindu && !this.node.getChildByName("btn_start").active) {
            this.progress.getComponent(cc.ProgressBar).progress = this.plan2;
            if (!this.isloadpicture && this.plan2 >= 1) {
                this.progress.getComponent(cc.ProgressBar).progress = 0.97
            }
            if (this.isloadpicture && this.plan2 >= 1) {
                this.isjindu = false;
                this.node.getChildByName("loadNode").active = false;
                this.node.getChildByName("btn_start").active = true;
                this.startGame();

            }
        }
    }
    protected onDisable(): void {
        this.btn_start.cleanup();
    }

}
