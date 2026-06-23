
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_lianxian_243 from "./item_lianxian_243";
import lianxian_config_243 from "./lianxian_config_243";




const { ccclass, property } = cc._decorator;

@ccclass
export default class lianxian_243 extends BaseGame {
    @property(cc.Graphics)
    graphics: cc.Graphics = null;
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    contentList: cc.Node[] = [];
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    @property(cc.Prefab)
    item: cc.Prefab = null;
    @property(cc.Node)
    private tipsPanel: cc.Node = null;

    @property(cc.Label)
    Lable: cc.Label = null;
    // @property(cc.Node)
    // tittle: cc.Node = null;
    public content: cc.Node = null;
    public curItemList: string[] = [];
    public curStartItem: cc.Node;

    /**已连线节点数组 (用于线条重绘)*/
    public okList: item_lianxian_243[] = [];
    public maxlv = 5;
    public curlv = 1;

    onLoad() {
        GameData.PauseGame = false;
        /**关卡初始化 */
        this.initLevel();
        // GameData.startTime = 90;
        // this.time.string = "时间:" + GameData.startTime.toString() + "s";
        // this.schedule(this.Timeing, 1)
        // AudioManager.playMusic(AudioManager.wenzi.main_wz, true, 1);
        //AudioManager.stopMusic();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)

        this.scheduleOnce(()=>{
            AudioManager.playMusic("bgm_lv243");
        },0.5);

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
    initLevel() {
        //上一关内容关闭
        if (this.content) {
            this.content.active = false;
            if (this.content.childrenCount > 0) {
                this.content.removeAllChildren(true);
                this.graphics.clear();
            }
        }
        this.content = this.contentList[this.curlv - 1];
        //更新标签
        this.labelUpdate();

        //重置数组
        this.okList = [];
        this.curStartItem = null;

        var info = lianxian_config_243["level" + this.curlv.toString()];
        for (let i = 0; i < info.mapdata.length; i++) {
            for (let j = 0; j < info.mapdata[i].length; j++) {
                var data = info.mapdata[i][j];
                var item = cc.instantiate(this.item);
                item.getComponent(item_lianxian_243).oninit(data);
                if(this.curlv == 1)  item.scale = 0.7;
                if (this.curlv == 2) item.scale = 0.65;
                if (this.curlv == 3) item.scale = 0.6;
                if (this.curlv == 4) item.scale = 0.5;
                if (this.curlv == 5) item.scale = 0.5;
                item.parent = this.content;
            }
        }

        
    }
    /**画线方法 */
    drawLineOfDashes(g: cc.Graphics, from: cc.Vec2, to: cc.Vec2, stroke: boolean = true, length: number = 5, interval: number = 4): void {
        if (g) {
            // let off = to.sub(from);
            // let dir = off.normalize();
            // let dis = off.mag();
            // let delta = dir.mul(length + interval);
            // let delta1 = dir.mul(length);
            // let n = Math.floor(dis / (length + interval));
            if (this.okList.length > 1) {
                for (let i = 0; i < this.okList.length - 1; ++i) {
                    // let start = from.add(delta.mul(i));
                    g.moveTo(this.okList[i].node.x, this.okList[i].node.y);
                    g.lineTo(this.okList[i + 1].node.x, this.okList[i + 1].node.y);
                }
                g.moveTo(this.okList[this.okList.length - 1].node.x, this.okList[this.okList.length - 1].node.y);
                g.lineTo(to.x, to.y);
            } else if (this.okList.length > 0) {
                g.moveTo(this.okList[this.okList.length - 1].node.x, this.okList[this.okList.length - 1].node.y);
                g.lineTo(to.x, to.y);
            } else {
                g.moveTo(from.x, from.y);
                g.lineTo(to.x, to.y);
            }

            if (stroke) g.stroke();
        }
    }
    onTouchStart(event: cc.Event.EventTouch) {
        // var time = new Date().getTime();
        // this.curTime = time;
        let p = this.node.convertToNodeSpaceAR(event.getLocation());
        if (!this.curStartItem || this.okList.length == 1) {
            var childlist = this.content.children;
            //遍历检查所有可点击节点，判断是否被点击
            for (let i = 0; i < childlist.length; i++) {
                var childitem = childlist[i];
                //点击节点
                if (childitem.getBoundingBox().contains(this.content.convertToNodeSpaceAR(event.getLocation()))) {
                    var thing = childitem.getComponent(item_lianxian_243);
                    //点击过的节点，跳过
                    if (thing.isset) continue;
                    thing.setid();
                    this.okList[0] = thing;
                    this.curStartItem = childitem;
                }
            }
        }
        this.curItemList = [];
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.curStartItem) return;
        
        var childlist = this.content.children;
        this.graphics.clear();
        /**鼠标位置 */
        let p = this.node.convertToNodeSpaceAR(event.getLocation());
        this.drawLineOfDashes(this.graphics, this.curStartItem.getPosition(), p, true, 40, 10);


        for (let i = 0; i < childlist.length; i++) {

            var childitem = childlist[i];


            /**遍历的节点位置 */
            let p2 = childitem.getPosition();
            /**当前起点节点位置 */
            let p3 = this.curStartItem.getPosition();
            var xdis = Math.abs(p.x - p2.x);
            var ydis = Math.abs(p.y - p2.y);
            /**鼠标和遍历节点的距离 */
            var distance = Math.sqrt(xdis * xdis + ydis * ydis);
            //反正切函数值
            var ang = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            //两个点度数
            ang = ang * (180 / Math.PI);
            ang = ang % 90;
            var xdis2 = Math.abs(p2.x - p3.x);
            var ydis2 = Math.abs(p2.y - p3.y);

            /**起点节点与遍历节点的距离 */
            var distance2 = Math.sqrt(xdis2 * xdis2 + ydis2 * ydis2);
            if (distance <= 45 && ang == 0 && distance2 < childitem.width * 2 &&distance2 < childitem.height * 2) {
                var thing = childitem.getComponent(item_lianxian_243);
                if (thing.isset) continue;
                thing.setid();
                AudioManager.playEffect("button");
                this.okList[this.okList.length] = thing;
                this.curStartItem = childitem;
            }
        }
    }

    onTouchEnd() {
        if (this.curStartItem) {
            this.graphics.clear();
            this.drawLineOfDashes(this.graphics, this.curStartItem.getPosition(), this.curStartItem.getPosition(), true, 40, 10);
        }
        if (this.okList.length == 1) {
            var thing = this.okList[0].getComponent(item_lianxian_243);
            if (thing) thing.isset = false;
            this.okList = [];
            this.curStartItem = null;
        }
    }
    checkAnswerd() {
        var childlist = this.content.children;
        var isWin = true;
        GameData.PauseGame = true;

       // console.log(childlist);

        for (let i = 0; i < childlist.length; i++) {
            var childitem = childlist[i];
            var thing = childitem.getComponent(item_lianxian_243);
            if (thing.isset == false) {
                isWin = false;

                //console.log(i,thing.node);
            }
        }
        if (isWin) {
            var fun = () => {
                if (this.curlv != this.maxlv) {
                    this.curlv++;
                    this.gou.scale = 0;
                    GameData.PauseGame = false;
                    this.initLevel();
                } else {

                    AudioManager.stopMusic();

                    this.node.destroy();
                    this.endwin("prefabs/zc/zc_winend");
                    GameData.PauseGame = false;
                }
            };
            this.gou.scale = 0;
            cc.tween(this.gou)
                .to(1.3, { scaleX: 1, scaleY: 1 })
                .delay(1.3)
                .call(fun)
                .start()
            this.scheduleOnce(() => {
                AudioManager.playEffect("finishjq")
            }, 0.9)
        } else {
            var fun = () => {
                // this.scheduleOnce(() => {
                this.cha.scale = 0;
                GameData.PauseGame = false
                
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
                // }, 1)
            }

            AudioManager.stopMusic();

            this.cha.scale = 0;
            cc.tween(this.cha)
                .to(1.3, { scaleX: 1, scaleY: 1 })
                .delay(1.3)
                .call(fun)
                .start()
            this.scheduleOnce(() => {
                AudioManager.playEffect("com_cuo")
            }, 0.9)
        }

        this.curItemList = [];
        this.okList = [];
        this.curStartItem = null;
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                // this.node.cleanup();
                // AudioManager.playEffect(AudioManager.wenzi.button_wz);
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                //     GameData.onDele();
                //     this.node.destroy();
                // })
                break;
            case "btn_addTime":
                VideoManager.getInstance().showVideo(() => { this.addTime(null, 60); })
                break;
            case "btn_tijiao":
                this.checkAnswerd();
                
                
                
                break;
            case "btn_tips":
                var handlers = () => {
                    this.tipsPanel.active = true;
                    if (this.curlv != 1) this.tipsPanel.getChildByName("tishi" + (this.curlv - 1).toString()).active = false;
                    this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = true;
                    VideoManager.getInstance().showInsert();
                    // this.node.parent.getChildByName("UiNode").getChildByName("btn_tips").getChildByName("guangg").active = false;
                    // this.isshowVideo = true;
                }
                // this.isshowVideo ? handlers && handlers() :
                VideoManager.getInstance().showVideo(handlers);
                break;
            case "x":
                this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;

            case "btn_tiaoguo":
                let fun = ()=>{
                    if (this.curlv != this.maxlv) {

                     cc.tween(this.gou)
                    .to(1,{scale:1})
                    .call(()=>{
                        this.curlv++;
                        this.gou.scale = 0;
                        GameData.PauseGame = false;
                        this.initLevel();
                    })
                    .start()
                    
                } else {
                    AudioManager.stopMusic();
                    cc.tween(this.gou)
                    .to(1,{scale:1})
                    .call(()=>{
                        this.node.destroy();
                        this.endwin("prefabs/zc/zc_winend");
                        GameData.PauseGame = false;
                    })
                    .start()
                    
                }
                }

                VideoManager.getInstance().showVideo(fun);
                break;
        }
    }
    isshowVideo = false;

    labelUpdate(){
        this.Lable.string = " " + this.curlv + " " + "/" + " 5" ;
    }
    loadendlost() {
        AssetManager.load(GameData.curGameStyle, "endlost_wz", cc.Prefab, null, (name: cc.Prefab) => {
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
        AudioManager.playEffect(AudioManager.wenzi.button_wz);
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
                this.loadendlost();
            }, 0.7);
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

