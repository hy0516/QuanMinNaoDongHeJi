import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class wyyp_lv368 extends BaseGame {

    private itemBg: cc.Node = null;
    private itemsNode: cc.Node = null;
    private pickNode: cc.Node = null;
    private paiNode: cc.Node = null;
    private btnStart: cc.Node = null;
    private ypbzSke: dragonBones.ArmatureDisplay = null;
    private pkFrames: cc.SpriteFrame[] = [];
    private pickBlinkTween: cc.Tween = null;
    private pickScaleTween: cc.Tween = null;
    private selItemScaleTween: cc.Tween = null;
    private curSelItem: cc.Node = null;
    private curSelIndex = -1;
    private viewedCardCount = 0;
    private szSke: cc.Node = null;
    private bgNode: cc.Node = null;
    private showNode: cc.Node = null;
    private ypbz2Ske: cc.Node = null;
    private ypbz3Ske: cc.Node = null;
    private btnReturn: cc.Node = null;
    @property(cc.Node)
    black: cc.Node = null;
    private readonly YPBZ2_NAMES = ["cs", "hongs", "heis", "fzs", "fs"];

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.bgNode = this.node.getChildByName("bgNode");
        this.showNode = this.node.getChildByName("showNode");
        this.itemBg = this.bgNode.getChildByName("item_bg");
        this.itemsNode = this.itemBg.getChildByName("itemsNode");
        this.pickNode = this.itemBg.getChildByName("pick_Node");
        this.paiNode = this.bgNode.getChildByName("pai_Node");
        this.btnStart = this.bgNode.getChildByName("btn_start");
        this.ypbzSke = this.bgNode.getChildByName("ypbz_ske").getComponent(dragonBones.ArmatureDisplay);
        this.szSke = this.bgNode.getChildByName("sz_ske");
        this.ypbz2Ske = this.showNode.getChildByName("ypbz2_ske");
        this.ypbz3Ske = this.showNode.getChildByName("ypbz3_ske");
        this.btnReturn = this.showNode.getChildByName("btn_return");
        this.showNode.active = false;
        this.btnReturn.active = false;
        if (this.black) { this.black.opacity = 0; this.black.active = false; }
        this.pickNode.active = false;
        this.btnStart.active = false;
        this.szSke.active = false;
        this.loadPkPics();
        this.szSke.active = true;
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv368", null, 0.5);
         
            this.scheduleOnce(() => {
                AudioManager.playEffect(`请选择你要验的牌`);
        this.ypbzSke.playAnimation("ds_sh", 2);
        this.addOneTimeListener(this.ypbzSke, () => {
            this.ypbzSke.playAnimation("ds_dj", -1);
        });
            }, 0.6);
        }, 0.5);
        this.btnReturn.on(cc.Node.EventType.TOUCH_END, () => this.onBtnReturnClick(), this);
    }

    private loadPkPics() {
        const style = GameData.curGameStyle;
        AssetManager.loadDir(style, "picture_lv368/pk_pic", cc.Texture2D, null, (assets: cc.Asset[]) => {
            if (!assets || assets.length === 0) {
                cc.error("[wyyp_lv368] pk_pic loadDir fail");
                return;
            }
            assets.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
            for (let i = 0; i < assets.length; i++) {
                this.pkFrames[i] = new cc.SpriteFrame(assets[i] as cc.Texture2D);
            }
            this.bindItemClicks();
        });
    }

    private bindItemClicks() {
        const children = this.itemsNode.children;
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            if (!item.getComponent(cc.Button)) item.addComponent(cc.Button);
            item.on(cc.Node.EventType.TOUCH_END, () => this.onItemClick(i), this);
        }
        this.btnStart.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.btnStart.active || GameData.PauseGame) return;
            AudioManager.playEffect(AudioManager.common.BUTTON);
            this.onBtnStartClick();
        }, this);
    }

    private onItemClick(index: number) {
        if (GameData.PauseGame || index < 0 || index >= this.pkFrames.length) return;
        if (index === this.curSelIndex) return;
        const sf = this.pkFrames[index];
        if (!sf) return;
        const item = this.itemsNode.children[index];
        const luxiang = item.getChildByName("luxiang");
        if (luxiang && luxiang.isValid) {
            VideoManager.getInstance().showVideo(() => {
                if (luxiang && luxiang.isValid) luxiang.destroy();
                this.doApplySelection(index, item, sf);
            });
        } else {
            this.doApplySelection(index, item, sf);
        }
    }

    private doApplySelection(index: number, item: cc.Node, sf: cc.SpriteFrame) {
        if (this.szSke && this.szSke.isValid) this.szSke.active = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (this.curSelItem && this.curSelItem.isValid) {
            this.curSelItem.scale = 1;
            if (this.selItemScaleTween) this.selItemScaleTween.stop();
        }
        if (this.pickScaleTween) this.pickScaleTween.stop();
        this.curSelIndex = index;
        this.curSelItem = item;
        const worldPos = item.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPos = this.itemBg.convertToNodeSpaceAR(worldPos);
        this.pickNode.setPosition(localPos);
        this.pickNode.active = true;
        this.startPickEffect(item);
        this.paiNode.getComponent(cc.Sprite).spriteFrame = sf;
        this.btnStart.active = true;
        this.ypbzSke.playAnimation("ds_sh", 1);
        AudioManager.playEffect(`牌没有问题`);
        this.addOneTimeListener(this.ypbzSke, () => {
            this.ypbzSke.playAnimation("ds_dj", -1);
        });
    }

    private startPickEffect(selItem: cc.Node) {
        if (this.pickBlinkTween) this.pickBlinkTween.stop();
        this.pickNode.opacity = 255;
        this.pickNode.scale = 1;
        selItem.scale = 1;
        this.pickBlinkTween = cc.tween(this.pickNode)
            .repeatForever(cc.tween().to(0.8, { opacity: 120 }).to(0.8, { opacity: 255 }))
            .start();
        const breathDur = 0.7;
        this.pickScaleTween = cc.tween(this.pickNode)
            .repeatForever(cc.tween().to(breathDur, { scale: 1.08 }).to(breathDur, { scale: 1 }))
            .start();
        this.selItemScaleTween = cc.tween(selItem)
            .repeatForever(cc.tween().to(breathDur, { scale: 1.08 }).to(breathDur, { scale: 1 }))
            .start();
    }

    update(dt: number) {
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        const target = even.currentTarget || even.target;
        const name = target ? (target as cc.Node).name : "";
        switch (name) {
            case "btn_close":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.openpausePanel();
                break;
            case "btn_start":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.onBtnStartClick();
                break;
        }
    }

    private readonly FADE_DUR = 1;
    private readonly FADE_HOLD = 0.3;

    private onBtnStartClick() {
        if (!this.curSelItem || !this.curSelItem.isValid || !this.black) return;
        GameData.PauseGame = true;
        this.black.active = true;
        this.black.opacity = 0;
        cc.tween(this.black).to(this.FADE_DUR, { opacity: 255 }).call(() => {
            this.bgNode.active = false;
            this.showNode.active = true;
            this.ypbz2Ske.active = false;
            this.ypbz3Ske.active = false;
            const animName = this.curSelItem.name;
            const useYpbz2 = this.YPBZ2_NAMES.indexOf(animName) >= 0;
            const skeNode = useYpbz2 ? this.ypbz2Ske : this.ypbz3Ske;
            skeNode.active = true;
            const armDisplay = skeNode.getComponent(dragonBones.ArmatureDisplay);
            if (armDisplay) armDisplay.playAnimation(animName, -1);
            cc.tween(this.black).delay(this.FADE_HOLD).to(this.FADE_DUR, { opacity: 0 }).call(() => {
                this.black.active = false;
                this.scheduleOnce(() => {
                    this.btnReturn.active = true;
                }, 3);
            }).start();
        }).start();
    }

    private onBtnReturnClick() {
        this.btnReturn.active = false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.viewedCardCount++;
        if (this.viewedCardCount >= 3) {
            this.onwin();
            return;
        }
        if (!this.black) return;
        this.black.active = true;
        this.black.opacity = 0;
        cc.tween(this.black).to(this.FADE_DUR, { opacity: 255 }).call(() => {
            this.showNode.active = false;
            this.bgNode.active = true;
            cc.tween(this.black).delay(this.FADE_HOLD).to(this.FADE_DUR, { opacity: 0 }).call(() => {
                this.black.active = false;
                GameData.PauseGame = false;
            }).start();
        }).start();
    }

    onDestroy() {
        if (this.pickBlinkTween) this.pickBlinkTween.stop();
        if (this.pickScaleTween) this.pickScaleTween.stop();
        if (this.selItemScaleTween) this.selItemScaleTween.stop();
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        });
    }

    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(`button`);
    }

    onwin() {
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 2);
    }

    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1);
    }
}
