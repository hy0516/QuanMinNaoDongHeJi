
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_wz_257 from "./item_wz_257";
import wenzi_config_257 from "./wenzi_config_257";



const { ccclass, property } = cc._decorator;

@ccclass
export default class game_wenzi_257 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    tipsPanel: cc.Node = null;

    @property(cc.Prefab)
    item: cc.Prefab = null;
    // @property(cc.Node)
    // tittle: cc.Node = null;

    vediosk: cc.Node = null;

    public curItemList: string[] = [];
    public curItemLab: string = "";
    public iscuowu = false;
    public okList: item_wz_257[] = [];
    public curTime = 0;
    public curId = 0;
    public cuowutime = 0;

    cha: cc.Node;
    onLoad() {
        GameData.PauseGame = false;
        for (let i = 0; i < wenzi_config_257.level1.mapdata.length; i++) {
            for (let j = 0; j < wenzi_config_257.level1.mapdata[i].length; j++) {
                var data = wenzi_config_257.level1.mapdata[i][j];
                var item = cc.instantiate(this.item);
                item.getComponent(item_wz_257).oninit(data);
                item.parent = this.content;
            }
        }
        GameData.startTime = 90;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        // AudioManager.playMusic(AudioManager.wenzi.main_wz, true, 1);
        AudioManager.stopMusic();
        this.content.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.content.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.content.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)

        this.cameraNode = this.node.getChildByName("videonode");
        this.cameraNode.x = 4;
        this.cameraNode.y = 32;
        this.cameraNode.width = 685;
        this.cameraNode.height = 975;
        this.cameraNode.scaleY = -1;
        this.cha = this.node.getChildByName("g2");
        // this.scheduleOnce(() => {
        //     this.playVideo()
        // }, 1)


        // let bm = this.node.getChildByName("bm");
        //         cc.tween(bm)
        //         .to(1,{opacity:255})
        //         .delay(0.5)
        //         .call(()=>{
        //             this.vedio = this.node.getChildByName("vedio");
        //             this.vedio.width = 730;
        //             this.vedio.height = 1130;
        //         })
        //         .to(1,{opacity:0})
        //         .call(()=>{
        //             this.VedioPlay();
        //         })
        //         .start();


        // cc.Tween.stopAllByTarget(this.tittle);
        // cc.tween(this.tittle)
        //     .repeat(2,
        //         cc.tween()
        //             .to(0.1, { angle: 7 })
        //             .to(0.1, { angle: 0 })
        //             .to(0.1, { angle: -7 })
        //             .to(0.1, { angle: 0 })
        //             .delay(0.2)
        //     )
        //     .start()

    }
    private cameraNode: cc.Node;
    private video;
    private videoTexture: cc.Texture2D;
    // https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/dhj.mp4

    private playVideo() {
        if (typeof window["tt"] != "undefined") {
            console.log("playqqqq")
            if (this.video) this.video.destroy();
            this.video = window["tt"].createOffscreenVideo();
            // 传入视频src
            this.video.src = "https://cosartresources.zywxgames.com/users/yj/wgh/25_10/tt/mp4/dhj.mp4";
            this.video.loop = true;
            this.video.autoplay = true;
            this.videoTexture = new cc.Texture2D();
            // console.log(this.video);
            this.video.onCanplay(() => {
                console.log("this.video");
                this.videoTexture.initWithElement(this.video);
                this.videoTexture.handleLoadedTexture();
                this.videoTexture.width = this.cameraNode.width;
                this.videoTexture.height = this.cameraNode.height;
                this.cameraNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
                    this.videoTexture
                );
                this.video.play();
            });
            this.scheduleOnce(() => {
                this.video.destroy();
                this.loadend();
            }, 8.1)

        } else {
            this.node.getChildByName("dhj").active = true;
            this.node.getChildByName("dhj").getComponent(cc.VideoPlayer).play();
            GameData.PauseGame = true;
            this.scheduleOnce(() => {
                 GameData.PauseGame = false;
                this.loadend();
            }, 8)

        }


    }

    // VedioPlay() {
    //     this.vedio = this.node.getChildByName("vedio");
    //     this.vedio.width = 730;
    //     this.vedio.height = 1130;
    //     let vedioPlayer = this.vedio.getComponent(cc.VideoPlayer);
    //     vedioPlayer.volume = 1;

    //     let onVideoCompleted = () => {
    //         console.log("播放完毕");
    //         this.vedio.active = false;
    //         this.loadend();
    //     }
    //     vedioPlayer.play();

    //     this.vedio.on('completed', onVideoCompleted, this);
    // }
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

    /**打叉 */
    dacha() {
        this.iscuowu = true;
        cc.tween(this.cha)
            .to(0.4, { opacity: 255 })
            .delay(0.2)
            .to(0.4, { opacity: 0 })
            .call(() => {
                this.iscuowu = false;
            })
            .start();
    }

    //#region  触摸事件
    onTouchStart() {

        var time = new Date().getTime();
        this.curTime = time;
        this.curItemLab = "";
        this.curItemList = [];

    }

    audioLock = true;
    onTouchMove(event: cc.Event.EventTouch) {
        if (this.iscuowu) return;

        // if(this.audioLock){
        //     this.audioLock  = false;
        //     AudioManager.playEffect("键盘点击声_214",false,()=>{
        //         this.audioLock  = true;
        //     });

        // }


        var childlist = this.content.children;
        for (let i = 0; i < childlist.length; i++) {
            var childitem = childlist[i];
            if (childitem.getBoundingBox().contains(this.content.convertToNodeSpaceAR(event.getLocation()))) {
                var thing = childitem.getComponent(item_wz_257);
                if (thing.isset) continue;
                AudioManager.playEffect("键盘点击声_257");
                if (this.curId) thing.setid(this.curId);
                this.okList[this.okList.length] = thing;
                // console.log(this.okList)
                if (this.curItemList.length == 0) {
                    this.curItemList[this.curItemList.length] = thing.data;
                    this.curItemLab = thing.lab;
                    this.curId = thing.id;
                    thing.setid(this.curId);
                }
            }
        }
    }

    checkAnswerd(list: string) {
        if (wenzi_config_257.levelanswerd.indexOf(list) != -1) {
            GameData.wenziWinNum++;
            AudioManager.playEffect(wenzi_config_257.levelSound[this.curId - 1]);
            // console.log(GameData.wenziWinNum);
            if (GameData.wenziWinNum == wenzi_config_257.levelanswerd.length) {
                // console.log("赢了");
                GameData.PauseGame = true;
                // this.scheduleOnce(() => {
                this.unschedule(this.Timeing);
                this.content.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
                this.content.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
                this.content.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
                this.content.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

                //等待音乐结束
                this.scheduleOnce(() => {
                    let bm = this.node.getChildByName("bm");
                    cc.tween(bm)
                        .to(1, { opacity: 255 })
                        .delay(0.5)
                        .call(() => {
                            this.content.active = false;
                            this.playVideo();
                        })
                        .to(1, { opacity: 0 })
                        .call(() => {

                        })
                        .start();
                }, 2)


                // 1

                // }, 0.5);
            }
        }
        this.curId = 0;
        this.curItemLab = "";
        this.curItemList = [];
        this.okList = [];
    }

    cuowu() {
        var time = new Date().getTime();
        if (time - this.cuowutime < 100) return;
        if (this.iscuowu) return
        this.iscuowu = true;
        AudioManager.playEffect(wenzi_config_257.lineLost);
        this.dacha();
        setTimeout(() => {
            for (let index = 0; index < this.okList.length; index++) {
                var rething = this.okList[index];
                if (!rething.issucc) {
                    rething.recive(this.curId);
                }
            }
            this.curItemLab = "";
            this.curItemList = [];
            this.curId = 0;
            this.addTime(null, -5);
            this.okList = [];
            this.iscuowu = false;
        }, 5);
    }

    onTouchEnd() {
        var list = ""
        for (let i = 0; i < this.okList.length; i++) {
            var item = this.okList[i];
            if (list != "") {
                // console.log(this.okList[i - 1].shunxu)
                if (this.okList[i - 1].id == this.okList[i].id && this.okList[i - 1].shunxu + 1 == this.okList[i].shunxu) {
                    list = list + item.lab;
                } else {
                    this.cuowu();
                    return
                }
            } else {
                list = list + item.lab;
            }
        }

        // console.log(list)
        if (wenzi_config_257.levelanswerd.indexOf(list) == -1) {
            this.cuowu();
        } else {
            GameData.getMap.push(this.okList[0].id);
            this.checkAnswerd(list);

        }
    }
    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.node.cleanup();
                AudioManager.playEffect(wenzi_config_257.button_wz);
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = cc.find("Canvas");
                    GameData.onDele();
                    this.node.destroy();
                    VideoManager.getInstance().showBaoXiang();
                })
                break;
            case "btn_addTime":
                VideoManager.getInstance().showVideo(() => { this.addTime(null, 60); })

                break;
            case "btn_tips":
                AudioManager.playEffect(AudioManager.wenzi.button_wz);
                var handlers = () => {
                    // AssetManager.load(GameData.curGameStyle, "TipPanel_wz_257", cc.Prefab, null, (name: cc.Prefab) => {
                    //     // cc.resources.load("prefabs/wenzi/TipPanel_wz", cc.Prefab, (err, UI: cc.Prefab) => {
                    //     var UINode = cc.instantiate(name);
                    //     UINode.parent = cc.find("Canvas");
                    //     this.node.getChildByName("btn_tips").getChildByName("luxiang").active = false;
                    //     this.isshowVideo = true;
                    // })

                    this.tipsPanel.active = true;
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;

            case "x":
                this.tipsPanel.active = false;
                break;
        }
    }
    isshowVideo = false;
    loadend() {
        // this.node.getChildByName("endlost_wz").active = true;
        if (GameData.PauseGame == true) return
        // GameData.PauseGame = true;
        //AudioManager.playEffect(AudioManager.audioName.endwin);
        console.log("end257")
        AssetManager.load(GameData.curGameStyle, "endwin_wz_257", cc.Prefab, null, (name: cc.Prefab) => {
            var endNode = cc.instantiate(name);
            endNode.parent = cc.find("Canvas");
            endNode.opacity = 0;
            cc.tween(endNode)
                .to(0.8, { opacity: 255 })
                .call(() => {
                    if (this.node) this.node.destroy();
                })
                .start()
        })
    }





    addTime(even: TouchEvent, time?: number) {
        AudioManager.playEffect(AudioManager.wenzi.button_wz);
        // GameData.PauseGame = true;
        if (GameData.startTime + time <= 0) return
        var addtime
        time ? addtime = time : addtime = 60;
        GameData.startTime += addtime;
        this.Timeing();
        var fuhao = "";
        if (addtime > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }

    endAddTime() {
        AudioManager.playEffect(wenzi_config_257.button_wz);
        // GameData.PauseGame = false;
        // this.unschedule(this.Timeing);
        this.addTime(null, 100);
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            GameData.PauseGame = true;
            this.unschedule(this.Timeing)
            this.scheduleOnce(() => {
                // this.loadend();
                AssetManager.load(GameData.curGameStyle, "endlost_wz_257", cc.Prefab, null, (name: cc.Prefab) => {
                    var endNode = cc.instantiate(name);
                    endNode.parent = cc.find("Canvas");
                    endNode.opacity = 0;
                    cc.tween(endNode)
                        .to(0.8, { opacity: 255 })
                        .call(() => {
                            //if (this.node) this.node.destroy();
                        })
                        .start()
                })

            }, 0.7);
        }
    }

    protected onDestroy(): void {
        if (this.video != null) {
            this.video.destroy();
            this.video = null;
        }
    }


    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
            // this.node.getChildByName("endlost_wz").active = false;
        })
    }


}

