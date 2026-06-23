
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import shjtq_lv285_move from "./shjtq_lv285_move";



const { ccclass, property } = cc._decorator;

@ccclass
export default class shjtq_lv285 extends BaseGame {

    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    public startTime = 180;
    public startX = 0;
    public endX = 0;
    public curTime = 0;

    
    bgNode:cc.Node;
   
   // canMove:boolean=true;
    isblxx:boolean=false;

    canjiaohu=true;
    catchCount=0;
    isHard=false;
    canclose=true;

    onLoad() {
        cc.game.setFrameRate(60);
        GameData.PauseGame = false;

        this.scheduleOnce(()=>{
            AudioManager.stopMusic();

            AudioManager.playMusic("关卡背景lv285");
        },0.5);
        

        cc.Tween.stopAllByTarget(this.tittle);

        this.bgNode = this.node.getChildByName(`bg`);
     
        this.gameStart();

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
    }


    gameStart() {
       
    }
    update(dt: number): void {
    
    }
    catchBtn(event: cc.Event.EventTouch)
    {
        if(!this.canjiaohu)return;
        this.bgNode.getChildByName(`zb`).active=false;
       // this.unschedule(this.Timeing);
        const enemNode = this.bgNode.getChildByName(`enemNode`);
        for (let index = 0; index < enemNode.childrenCount; index++) {
            const element = enemNode.children[index];
            if(!element.active)continue;

            if(Math.abs(element.x+element.children[0].x)<30)
            {
               // this.canMove=false;
               element.setSiblingIndex(element.parent.children.length - 1);
               element.getComponent(shjtq_lv285_move).canwalk=false;
                this.bgNode.getChildByName(`tq_ske`).active=false;
                element.getComponent(dragonBones.ArmatureDisplay).timeScale=0.8;
                element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`${element.name}`+ '_tq',1);
                AudioManager.playEffect(`lache_285`);
                this.addOneTimeListener(element.getComponent(dragonBones.ArmatureDisplay),()=>{

                   
                    if(element.name==`cs`&&!this.isblxx)
                    {
                        //element.y=200;
                        element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`cs_dr`,1);
                        this.scheduleOnce(()=>{
                            AudioManager.playEffect(`blxxqj285`);
                        },0.5);
                        
                        this.addOneTimeListener(element.getComponent(dragonBones.ArmatureDisplay),()=>{
                            
                            element.y=-40;
                            this.isblxx=true;
                            this.bgNode.getChildByName(`tq_ske`).active=true;
                            this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sz`,0);
                         //   this.canMove=true;
                            this.bgNode.getChildByName(`zb`).active=true;
                            element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`cs`,0);
                            element.getComponent(shjtq_lv285_move).canwalk=true;
                            element.x= element.getComponent(shjtq_lv285_move).tempX;
                            element.getComponent(dragonBones.ArmatureDisplay).timeScale=1.5;
                          //  this.schedule(this.Timeing, 1);
                        })
                    }else
                    {
                        this.unschedule(this.Timeing);
                        element.active=false;
                        this.canclose=false;
                        this.bgNode.getChildByName(`jiesuanbg`).active=true;
                        this.bgNode.getChildByName(`showSk`).active=true;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].getComponent(cc.Label).string=`0123456789`;

                        for (let index = 0; index < this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).childrenCount; index++) {
                            const element1 = this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).children[index];
                            element1.active=false;
                        }
                        this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).getChildByName(`${element.name}`).active=true;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].scale=0;
                        this.bgNode.getChildByName(`showSk`).getChildByName(`tq_ske`).scale=0;

                        this.bgNode.getChildByName(`showSk`).getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay)
                        
                        //.playAnimation(`${this.getPrefixBeforeTQ(element.name)}`,0);
                        .playAnimation(element.name+ '_dj',-1);
                        AudioManager.playEffect("lv285");
                        cc.tween(this.bgNode.getChildByName(`showSk`).getChildByName(`tq_ske`)).to(1,{scale:1}).call(()=>{
                            // AudioManager.playEffect("lv285");
                            this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].getComponent(cc.Label).string= this.getEnemZDL(element.name);
                            this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].scale=10;
                            cc.tween(this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0]).to(0.3,{scale:1}).call(()=>{
                                this.canclose=true;
                            }).start();
                            AudioManager.playEffect(`sztc_285`);
                        }).start();
                        this.catchCount++;
                        this.bgNode.getChildByName(`nodeCount`).getComponent(cc.Label).string=`进度:${this.catchCount}/8`;

                    }
                   
                })
                return;
            }
        }
        this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sztaokong`,1);
        AudioManager.playEffect(`taokong_285`);
        this.addOneTimeListener(this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay),()=>{
            this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`sz`,0);
         //   this.canMove=true;
            this.bgNode.getChildByName(`zb`).active=true;
          //  this.schedule(this.Timeing, 1);
        })
    }
    closeJieSuan()
    {
        if(!this.canclose)return;
        const enemNode = this.bgNode.getChildByName(`enemNode`);
        this.bgNode.getChildByName(`enemNode`)
        for (let index = 0; index < enemNode.childrenCount; index++) {
            const element = enemNode.children[index];
            if(!element.active)
            continue;
            else
            {
                if(this.catchCount==2)
                {
                    this.bgNode.getChildByName(`jiesuanbg`).active=false;
                    this.bgNode.getChildByName(`showSk`).active=false;
                    this.bgNode.getChildByName(`tq_ske`).active=true;
                   

                    this.bgNode.getChildByName(`ndbs_ske`).active=true;
                    this.bgNode.getChildByName(`ndbs_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`jg`,1);
                    AudioManager.playEffect(`ndbs_285`);
                    this.addOneTimeListener(this.bgNode.getChildByName(`ndbs_ske`).getComponent(dragonBones.ArmatureDisplay),()=>{
                        this.isHard=true;
                        this.bgNode.getChildByName(`jiansu`).active=true; 
                        this.bgNode.getChildByName(`ndbs_ske`).active=false; 
                        this.schedule(this.Timeing, 1);
                        this.bgNode.getChildByName(`zb`).active=true;
                    })
                    return;
                }
                this.bgNode.getChildByName(`jiesuanbg`).active=false;
                this.bgNode.getChildByName(`showSk`).active=false;
              //  this.canMove=true;
                this.bgNode.getChildByName(`tq_ske`).active=true;
                this.bgNode.getChildByName(`zb`).active=true;
                this.schedule(this.Timeing, 1);
                return;
            }
            
        }
        this.onwin();

       
    }
    getPrefixBeforeTQ(s: string): string {
        const lastTqIndex = s.lastIndexOf('tq');
        return lastTqIndex !== -1 ? s.slice(0, lastTqIndex) : '';
    }
    getEnemZDL(name:string)
    {
        // AudioManager.playEffect("lv285");
        switch (name) {
            case `hs`:
            return `50000000`;
            case `bz`:
            return `150000`;
            case `cs`:
            return `9999999999999999`;
            case `sj`:
            return `5`;
            case `ys`:
            return `150000`;
            case `sb`:
            return `50000000`;
            case `dn`:
            return `5`;
            case `xj`:
            return `150000`;
            // case `10`:
            // return `50000000`;
            // case `12`:
            // return `9999999999999999`;
        }

        return `null`;
    }
    BtnHandler(event: cc.Event.EventTouch) {

        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     this.havefindList = [];
                //     this.node.destroy();
                //     VideoManager.getInstance().showCustomNativeAd();
                // })
                break;
            case "jiashi":
                
                 if (this.startTime <= 0) return;
                 VideoManager.getInstance().showVideo(() => {this.setTime(60); })
                break;
            case "jiansu":
                   
                    VideoManager.getInstance().showVideo(() => {  
                        this.bgNode.getChildByName(`jiansu`).active=false;
                        this.isHard=false;
                 })
                   break;
            case "tishi":
                var handlers = () => {
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                    //    
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case `x`:
                this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = false;
                break;
        }
    }

    isshowVideo = false;

    endlost(name: string) {
        cc.resources.load(name, cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            UINode.opacity = 0;
            cc.tween(UINode)
                .to(0.8, { opacity: 255 })
                .start()
        })
    }
    onwin() {
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
        return
        // var fun = () => {
        //     this.endwin("prefabs/zc/zc_winend");
        //     GameData.PauseGame = false;
        //     return
        // }
        // this.gou.cleanup();
        // cc.tween(this.gou)
        //     .to(1.3, { scaleX: 1, scaleY: 1 })
        //     .delay(1.3)
        //     .call(fun)
        //     .start()
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("finishjq");
        // }, 0.9)
    }




    talkdiplayTeshu(talkaudio: string, talkthing: string, handler?: Function) {

        
        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string = talkthing;
        talk.opacity = 255;
        AudioManager.playEffect(talkaudio, false, () => {
            talk.opacity = 0;
            handler && handler();
        })

    }
    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
                //this.node.destroy();
            }, 0.7);
        }
    }
    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString()+`s`;
        this.Timeing();
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

        this.startTime = 1;
        this.setTime(60);
        this.schedule(this.Timeing, 1)
        //})
    }

}



