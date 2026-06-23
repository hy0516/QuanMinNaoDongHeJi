
import AssetManager from "./AssetManager";
import AudioManager from "./AudioManager";
import common from "./common";
import GameData from "./GameData";
import levelConfig from "./levelConfig";
import VideoManager from "./VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class smallLoading extends cc.Component {

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    public PreName = "";
    public lvConfig = null;

    dialog: cc.Node

    isjindu = false;
    plan;
    plan1 = 0;


    onInit() {
        this.isjindu = true;
        GameData.PauseGame = false;
        var num = GameData.nextlevelconfig2[GameData.curGameStyle + "/" + GameData.curGameName];
        if (num != GameData.curSeleStyle.length) GameData.curLevelId = num;
        if (this.lvConfig) GameData.lvConfig = this.lvConfig;
        console.log(GameData.curGameStyle + GameData.curGameName);
        var le = GameData.curGameStyle + "/" + GameData.curGameName;
        var tb = levelConfig.new.filter(t => t.level == le)[0];
        if (tb) {
            if (GameData.curFenLei == "") {
                common.openLuJing("主页-" + tb.name);
            } else {
                common.openLuJing("主页-" + "第" + GameData.curFenLei + "页" + "-" + tb.name);
            }
        }
        AssetManager.loadBundle(GameData.curGameStyle).then(() => {
            AssetManager.loadDir(GameData.curGameStyle, "audio_" + GameData.curGameStyle, cc.Asset, (complete, total) => {
                this.plan1 = complete / total;
            }, (assets: cc.AudioClip[]) => {
                if (assets) {
                    assets.forEach(asset => {
                        AudioManager.set(asset.name, asset);
                    })
                }
                this.plan1 = 1;
            });
            AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, (complete, total) => {
                this.plan = complete / total;
            }, (url: cc.Prefab) => {
                this.plan = 1;
                this.dialog = cc.instantiate(url);
                // console.log(this.dialog)
            });
        })
    }



    update(dt) {
        if (this.isjindu) {
            if (this.isjindu) {
                this.progress.getComponent(cc.ProgressBar).progress = (this.plan1 + this.plan) / 2;
                if (this.progress.getComponent(cc.ProgressBar).progress >= 1) {
                    if (this.dialog) {
                        this.isjindu = false;
                        this.dialog.parent = cc.find("Canvas");
                        var le = GameData.curGameStyle + "/" + GameData.curGameName;
                        var tb = levelConfig.new.filter(t => t.level == le)[0];
                        if (tb) {
                            VideoManager.getInstance().report("enterLv", { name: tb.name + "1" });
                            // 记录进入关卡时间
                            GameData.recordLevelEnter(tb.name);
                            this.node.destroy();
                        }
                    }

                }
            }
        }
    }

}
