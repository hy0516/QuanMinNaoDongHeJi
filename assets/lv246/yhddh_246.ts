

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems2 from "../script/common/moveItems2";
import { Timer246 } from "./Timer246";






const { ccclass, property } = cc._decorator;


@ccclass
export default class shjddh_lv124 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    canjiaohu = false;
    iswin: boolean = false;

    txlNode: cc.Node;
    ldNode: cc.Node;
    dhNode: cc.Node;
    curselNode: cc.Node;//当前选中联系的Node
    selNodeIndex = 0;

    ipadvideopath = [
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/yh.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/lnn.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/qsh.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/smt2.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/wxm.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/lrbs.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/pj.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/tgr.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/xm.mp4",
    ];
    phonevideopath = [
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/yh.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/lnn.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/qsh.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/smt.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/wxm.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/rlbs.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/pj.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/tgr.mp4",
        "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/phone/xm.mp4",
    ]


    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.txlNode = this.node.getChildByName(`bg`).getChildByName(`txlNode`);
        this.txlNode.children[2].children[0].children[0].children[1].active=false;
        this.ldNode = this.node.getChildByName(`bg`).getChildByName(`ldNode`);
        this.dhNode = this.node.getChildByName(`bg`).getChildByName(`dhNode`);
        this.gameStart();
        this.canjiaohu = true;
        this.showCamera();
        if (typeof window["tt"] == "undefined") {
            this.dhNode.getChildByName("12").active = true;
        }

    }
    update() {
        if (this.video && this.videoTexture) {
            this.videoTexture.update({
                image: this.video,
                genMipmaps: false,
                format: cc.Texture2D.PixelFormat.RGBA8888,
                minFilter: cc.Texture2D.Filter.LINEAR,
                magFilter: cc.Texture2D.Filter.LINEAR,
                wrapS: cc.WrapMode.Loop,
                wrapT: cc.WrapMode.Loop,
                premultiplyAlpha: false,
            });
        }
    }
    private cameraNode: cc.Node;
    private video;
    private videoTexture: cc.Texture2D;

    private showCamera() {
        this.cameraNode = this.node.getChildByName("videonode");
        this.cameraNode.scaleY = -1;
    }

    private playVideo(path: string) {
        if (window["tt"] != "undefined") {
            if (this.video) this.video.destroy();
            this.video = window["tt"].createOffscreenVideo();
            // 传入视频src
            this.video.src = path;
            this.video.loop = true;
            this.video.autoplay = true;
            // console.log("video.width" + this.video.width, "video.height" + this.video.height);
            this.video.onCanplay(() => {
                AudioManager.playMusic(`${this.curselNode.children[0].name}`);
                this.txlNode.active = false;
                this.ldNode.active = false;
                this.dhNode.active = true;
                this.video.play();
                this.videoTexture = new cc.Texture2D();
                this.videoTexture.initWithElement(this.video);
                this.videoTexture.handleLoadedTexture();
                this.videoTexture.width = this.cameraNode.width;
                this.videoTexture.height = this.cameraNode.height;
                this.cameraNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
                    this.videoTexture
                );
            });

        }


    }

    protected onDestroy(): void {
        if (this.video != null) {
            this.video.destroy();
            this.video = null;
        }
    }

    gameStart() {
        this.curselNode = this.txlNode.getChildByName(`scrollview`).getComponent(cc.ScrollView).content.children[0];
        this.dadianhua();
    }
    showtxl() {
        this.txlNode.active = true;
        this.curselNode.getChildByName(`sel`).active = true;
        this.curselNode.getChildByName(`luxiang`).active = false;
        var panode = this.curselNode.parent;
        for (let i = 0; i < panode.childrenCount; i++) {
            var txlitme = panode.children[i];
            if (txlitme == this.curselNode) {
                this.selNodeIndex = i;
                break;
            }
        }

    }
    changetxl(even: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (even.currentTarget.parent.getChildByName(`luxiang`).active) {
            VideoManager.getInstance().showVideo(() => {
                this.curselNode.getChildByName(`sel`).active = false;
                this.curselNode = even.currentTarget.parent;
                this.showtxl();
            });
        } else {
            this.curselNode.getChildByName(`sel`).active = false;
            this.curselNode = even.currentTarget.parent;
            this.showtxl();
        }
    }
    laidian() {
        this.ldNode.active = true;
        AudioManager.playMusic(`来电`);
    }
    guaduan() {
        AudioManager.stopMusic();
        AudioManager.playEffect(`挂断`);
        this.ldNode.active = false;
        this.dhNode.active = false;
        this.showtxl();
    }
    dadianhua() {
        this.laidian();
        this.ldNode.getChildByName(`ldtoux`).getComponent(cc.Sprite).spriteFrame = this.curselNode.children[0].getComponent(cc.Sprite).spriteFrame;
        this.ldNode.getChildByName(`ldname`).getComponent(cc.Label).string = this.curselNode.getChildByName(`labelName`).getComponent(cc.Label).string;

        this.ldNode.getChildByName("jj").active = true;
        this.ldNode.getChildByName("jt").active = true;
        this.ldNode.getChildByName("ldlabel").getComponent(cc.Label).string = "邀请你视频通话...";
    }

    jietong() {
        AudioManager.stopMusic();
        if (typeof window["tt"] != "undefined") {
            if (cc.view.getVisibleSize().width >= 900) {
                this.cameraNode.width = (cc.view.getVisibleSize().height / cc.view.getVisibleSize().width) * cc.view.getVisibleSize().width;
                this.cameraNode.height = cc.view.getVisibleSize().width;
                this.playVideo(this.ipadvideopath[this.selNodeIndex]);
            } else {
                this.playVideo(this.phonevideopath[this.selNodeIndex]);
            }
            this.ldNode.getChildByName("jj").active = false;
            this.ldNode.getChildByName("jt").active = false;
            this.ldNode.getChildByName("ldlabel").getComponent(cc.Label).string = "连接中...";
        } else {
            // if (cc.view.getVisibleSize().width >= 900) {
            //     for (let index = 0; index < this.dhNode.getChildByName(`sknodepb`).childrenCount; index++) {
            //         const element = this.dhNode.getChildByName(`sknodepb`).children[index];
            //         element.active = false;
            //     }
            //     this.dhNode.active = true;
            //     this.dhNode.getChildByName(`sknodepb`).getChildByName(`${this.curselNode.children[0].name}_ske`).active = true;
            // } else {
            for (let index = 0; index < this.dhNode.getChildByName(`sknode`).childrenCount; index++) {
                const element = this.dhNode.getChildByName(`sknode`).children[index];
                element.active = false;
            }
            this.dhNode.active = true;
            this.dhNode.getChildByName(`sknode`).getChildByName(`${this.curselNode.children[0].name}_ske`).active = true;
            // }
            AudioManager.playMusic(`${this.curselNode.children[0].name}`);
        }
        this.dhNode.getChildByName(`time`).getComponent(Timer246).resetTimer();
        this.dhNode.getChildByName(`time`).getComponent(Timer246).startTimer();
    }

    talkdiplay(talkaudio: string, talkthing: string, handler?: Function) {
        AudioManager.playEffect(talkaudio, false, () => {
            talk.opacity = 0;
            handler && handler();
        })
        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string = talkthing;
        talk.opacity = 255;
    }
    IntMoveBtn() {
        this.node.getChildByName(`bg`).getChildByName("room4").getChildByName(`yigui`).getChildByName(`men`).on(cc.Node.EventType.TOUCH_START, this.onTouchStartHY, this);
        this.node.getChildByName(`bg`).getChildByName("room4").getChildByName(`yigui`).getChildByName(`men`).on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveHY, this);

    }
    offMoveBTN() {
        this.node.getChildByName(`bg`).getChildByName("room4").getChildByName(`yigui`).getChildByName(`men`).off(cc.Node.EventType.TOUCH_START, this.onTouchStartHY, this);
        this.node.getChildByName(`bg`).getChildByName("room4").getChildByName(`yigui`).getChildByName(`men`).off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveHY, this);
    }
    touchstartPoiHY: cc.Vec2;
    onTouchStartHY(e: cc.Event.EventTouch) {
        if (!this.canjiaohu) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.touchstartPoiHY = e.getLocation();
    }
    onTouchMoveHY(e: cc.Event.EventTouch) {
        if (!this.canjiaohu) return;

        if (Math.abs(e.getLocation().x - this.touchstartPoiHY.x) > 30) {
            this.node.getChildByName(`bg`).getChildByName("room4").getChildByName(`yigui`).getChildByName(`men`).x = 135;
            this.offMoveBTN();
            this.node.getChildByName(`bg`).getChildByName("room4").getChildByName(`yigui`).getChildByName(`zhenxian`).active = true;
        }


    }
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        this.canjiaohu = false;
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("qp")
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                // if (this.istiaoguo) return
                this.canjiaohu = true;
                handler && handler();
            })
            .start()
    }


    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                // this.node.cleanup();

                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                //     GameData.onDele();
                //     this.node.destroy();
                // })
                break;

            case "btn_tips":
                var handlers = () => {
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    this.tipsPanel.active = true;
                    this.showStepTipsLabel();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(() => {
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
        }
    }
    showStepTipsLabel() {
        const tipsLabel = this.tipsPanel.children[0].children[1].getComponent(cc.Label);
        tipsLabel.string = `拖动报纸到玻璃窗，拖动木棍到破洞，然后点击逃离按钮`;


    }

    onlost() {
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            GameData.PauseGame = false
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }
    onwin() {
        var fun = () => {
            this.endwin("prefabs/zc/zc_winend");
            GameData.PauseGame = false;
            return
        }
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()
        this.scheduleOnce(() => {
            AudioManager.playEffect("finishjq");
        }, 0.9)
    }

    playWinEvent() {
        cc.tween(this.node.getChildByName(`bg`)).to(1, { opacity: 0 }).call(() => {
            this.node.getChildByName(`bg`).getChildByName(`room4`).active = false;
            this.node.getChildByName(`bg`).getChildByName(`winNode`).active = true;
            cc.tween(this.node.getChildByName(`bg`)).to(1.5, { opacity: 255 }).call(() => {
                this.talkdiplay(`可算逃出来了`, `可算逃出来了`, () => {
                    this.onwin();
                })
            }).start();
        }).start();

    }
    gametolost() {
        // this.kfnsk.playAnimation(`wndj2`);
        // this.showqp(this.mgrNode, `你也太蠢了吧`, `你也太蠢了吧`,
        // () => {
        //     this.node.getChildByName(`lostNode`).active=true;
        //     AudioManager.playEffect("com_cuo");
        //     this.scheduleOnce(()=>{
        //         this.onlost();
        //     },1) 
        // })  
    }
}



