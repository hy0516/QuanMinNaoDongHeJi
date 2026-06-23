

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import levelConfig from "../script/common/levelConfig";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";




const { ccclass, property } = cc._decorator;

@ccclass
export default class jzhz_lv208 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;


    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    icon: cc.Node = null;
    @property(cc.Node)
    clicklist: cc.Node = null;
    @property(cc.Node)
    mainMap: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;

    @property(cc.Node)
    g2: cc.Node = null;

    @property(cc.Prefab)
    lostPanel:cc.Prefab = null;

    /**点击特效 */
    @property(dragonBones.ArmatureDisplay)
    sk:dragonBones.ArmatureDisplay = null;



    /**初始时间 */
    public startTime = 120;
    public curTime = 0;

    tiezhinum = 0;


    /**小狗点击数量 */
    dogNum = 0;

    /**地图节点 */
    bg1:cc.Node = null;

    /**结局遮罩 */
    bgMask:cc.Node = null;


    /**小狗点位数组 */
    dogPosList:cc.Vec3[] = [];


    /**数量标签 */
    @property(cc.Label)
    numLabel:cc.Label = null;


    /**爱心数组 */
    hpList:cc.Node[] = [];

    /**点击小狗声音数组 */
    dogSoundList:string[] = ["点击_205","点击2_205","点击3_205"];

    lostHp = 0;

    /**爱心破碎龙骨 */
    heartSk:dragonBones.ArmatureDisplay = null;

//#region onload()

    onLoad() {


        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)


        this.scheduleOnce(()=>{
            AudioManager.playMusic("关卡背景_205", true, 0.7);
            
        },0.5);
         
        cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.5)
            )
            .start()
        this.IntBtn();
        var ani = this.getbodys(this.node, "ani");

        this.tipsTarget = this.mainMap.getChildByName("bg1").getChildByName("dogs").getChildByName("tipsTarget");
       
      



        //#region 获取游戏对象
        this.bg1 = this.mainMap.getChildByName("bg1");
        this.bgMask  = this.mainMap.getChildByName("bgmask");

        this.hpList = this.node.getChildByName("hp").children;
        this.heartSk = this.node.getChildByName("heartSk").getComponent(dragonBones.ArmatureDisplay);



        /***注册小狗节点点击事件 */
        let dogs = this.bg1.getChildByName("dogs").children;

        dogs.forEach(node=>{

            if(node.name != "tipsTarget"){
                node.on(cc.Node.EventType.TOUCH_START,this.dogTouch,this);

                //获取所有小狗点位
                this.dogPosList.push(node.position);
                
            }  
        });

        this.node.on(cc.Node.EventType.TOUCH_START,this.TouchStart,this);







        // let pos = this.node.convertToNodeSpaceAR(dogs[0].parent.convertToWorldSpaceAR(dogs[0].position));

        // this.curDogPos = pos;
        
        // this.mapDogPos();

        // cc.Tween.stopAllByTag(1);
        //cc.Tween.stopAllByTag(2);

       // this.ending();

    //    let widget = this.node.getComponent(cc.Widget);

    //    widget.updateAlignment();
        
    //    let worldPos = dogs[2].parent.convertToWorldSpaceAR(dogs[2].position);

       
    //    let pos = this.node.convertToNodeSpaceAR(worldPos);

    //    console.log(dogs[2],"pos",pos);
    //    console.log("worldPos",worldPos);
    //    console.log(dogs[2].position);


    }

//#region 小狗 触摸事件

/**提示锁 */
tipSkeLock = true;

    /**小狗触摸事件 */
     dogTouch(even: cc.Event.EventTouch){

        if(GameData.PauseGame) return;

        let dog:cc.Node = even.target;

        //console.log(even.target);

        dog.getComponent(cc.Sprite).enabled = true;

        this.dogNum += 1;

        if(this.tipsTarget.active) this.tipsTarget.active = false;



        //点击发光特效

        let pos  = this.sk.node.parent.convertToNodeSpaceAR(even.getLocation());
        this.sk.node.position = new cc.Vec3(pos.x, pos.y, 0);
        this.sk.enabled = true;

        this.sk.playAnimation("djtx",1);


        let num =Math.floor(Math.random() * 3);

        

        let musicName = this.dogSoundList[num];

        
        AudioManager.playEffect(musicName);

        this.addOneTimeListener(this.sk,()=>{
            this.sk.enabled = false;
        })



        //点击事件注销
        dog.off(cc.Node.EventType.TOUCH_START,this.dogTouch,this);

        this.LabelUpdate();

        if(this.dogNum >= 15 && this.tipSkeLock){

            this.tipSkeLock = false;

            let tipsSke = this.node.getChildByName("tipSke").getComponent(dragonBones.ArmatureDisplay);
            tipsSke.enabled = true;
            tipsSke.playAnimation("ztgd",1);

            this.addOneTimeListener(tipsSke,()=>{
                tipsSke.enabled  = false;

            })

        }

        if(this.dogNum >= 20) this.ending();


     }
    
     /**移动锁 */
     ismove = false;
    TouchStart(even: cc.Event.EventTouch){

       


     }

    LabelUpdate(){
        this.numLabel.string =  this.dogNum + " / 20";
    }






    tipsTarget: cc.Node
    onwin() {
            
            GameData.PauseGame = true;

            AudioManager.playEffect("gou");

            cc.tween(this.gou)
            .to(1.8,{scale:1})
            .start();

            
            this.scheduleOnce(() => {
                AudioManager.stopEffect();
                // AudioManager.playEffect(AudioManager.audioName.end);
                this.loadend();
                this.node.destroy();
            }, 2.5);
       
    }


    //#region 事件注册
    // /**游戏背景图 */
    //  mainMap:cc.Node = null;
    /**鼠标监听设置 */
    IntBtn() {
        // this.offBtn();
        let bg1 = this.mainMap.getChildByName("bg1");
        this.mainMap.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        bg1.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    /**鼠标监听关闭 */
    offBtn() {
        this.mainMap.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.mainMap.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }




    //#region  地图移动
    rightBound:number = 269.46;
    leftBound:number = -269.46;
    upBound:number = 125;
    downBound:number = -125;
    onTouchMove(e: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;

        this.ismove = true;

        this.mainMap.x += e.getDeltaX();
        //this.mainMap.y += e.getDeltaY();
        if (this.mainMap.x > this.rightBound) this.mainMap.x = this.rightBound;
        if (this.mainMap.x < this.leftBound) this.mainMap.x = this.leftBound;
        if (this.mainMap.y < this.downBound) this.mainMap.y = this.downBound;
        if (this.mainMap.y > this.upBound) this.mainMap.y = this.upBound;

        // if (-this.mainMap.x < this.curDogPos.x) this.mainMap.x = this.rightBound;
        // if (-this.mainMap.x > this.curDogPos.x) this.mainMap.x = this.leftBound;
        // if (-this.mainMap.y < this.curDogPos.y) this.mainMap.y = this.upBound;
        // if (-this.mainMap.y > this.curDogPos.y) this.mainMap.y = this.downBound;
        


    }
    onTouchEnd(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        // this.mainMap.setPosition(this.renStartPos)
         let target = even.target;
       
            //非小狗
        if(target.parent.name != "dogs" && !this.ismove){

            AudioManager.playEffect("错误_205");

            let hp = this.hpList[this.lostHp];

            hp.active = false;

            if(this.lostHp < 5 )this.lostHp += 1;

            GameData.PauseGame = true;

            this.heartSk.node.position = this.heartSk.node.parent.convertToNodeSpaceAR(hp.parent.convertToWorldSpaceAR(hp.position));

            this.heartSk.enabled = true;

            let pos = this.g2.parent.convertToNodeSpaceAR(even.getLocation());

            this.g2.position = new cc.Vec3(pos.x, pos.y, 0);

            cc.tween(this.g2)
            .to(0.4,{opacity:255})
            .delay(0.2)
            .call(()=>{
                this.g2.opacity = 0;
            })
            .start()

            this.heartSk.playAnimation("ax",1);

            this.addOneTimeListener(this.heartSk,()=>{

                this.heartSk.enabled = false;
                GameData.PauseGame = false;


                if(this.lostHp >= 5){
                     setTimeout(() => {
                        this.endlostPanel();
                    }, 600);
                }
               
            })

        }


        this.ismove = false;
    }

    /**提示定位移动 */
    moveSpeed:number = 5;
    tipslock = false;
    /**狗的坐标位置 */
    curDogPos:cc.Vec3 = null;

    //缓动变量
    tweenX;
    tweenY;
    /**缓动结束 */
    txLock = false;
    tyLock = false;

    /**update锁*/
    getLock = false;
    mapDogPos(){

        GameData.PauseGame = true;

        this.getLock = true; //开锁判断

        this.tweenX = cc.tween(this.mainMap)
        .tag(1)
        .to(1.5,{x:-this.curDogPos.x})
        .call(()=>{
            this.txLock = true;
        })
        .start();

        // this.tweenY = cc.tween(this.mainMap)
        // .tag(2)
        // .to(1.5,{y:-this.curDogPos.y})
        // .call(()=>{
        //     this.tyLock = true;
        // })
        // .start();

        
    }

    //#region update（）
    update(dt: number): void {
     //   this.mapToPoint(dt);
        if(this.getLock){

           

            if (this.mainMap.x > this.rightBound){
                this.mainMap.x = this.rightBound;
                if(this.tweenX) {
                    cc.Tween.stopAllByTag(1);
                    this.txLock = true;
                }
            } 
            if (this.mainMap.x < this.leftBound){
                this.mainMap.x = this.leftBound;
                if(this.tweenX){
                    cc.Tween.stopAllByTag(1);
                    this.txLock = true;
                } 
            }
            // if (this.mainMap.y < this.downBound){
            //     this.mainMap.y = this.downBound;
            //     if(this.tweenY){
            //         cc.Tween.stopAllByTag(2);
            //         this.tyLock = true;
            //     } 
            // } 
            // if (this.mainMap.y > this.upBound){
            //     this.mainMap.y = this.upBound;
            //     if(this.tweenY){
            //         cc.Tween.stopAllByTag(2);   
            //         this.tyLock = true;
            //     } 
            // } 

           
            //x,y缓动以全部停止
            if(this.txLock ){
                    
                    this.getLock = false;
                    //this.tyLock = false;
                    this.txLock = false;

                     GameData.PauseGame = false;

                   
                }
            

        }
     
    }

    /**角色点击事件 */
    // showJZHZ(event: cc.Event.EventTouch) {
    //     if (GameData.PauseGame) return;
    //     var child = event.currentTarget.children[0];
    //     console.log(event.currentTarget);
        
    //     if (!child.active) {
    //         child.active = true;
    //         if (child.name == "ani" || child.name == "01") {
    //             this.tipsTarget.active = false;
    //             this.winCount++;
    //             //更新进度标签
    //             this.getbodys(this.node, "count")[0].getComponent(cc.Label).string = this.winCount + "/10";
    //             var musicName;
    //             var musicState;
    //             console.log(this.tipsTarget.name);
    //             //if (child.getComponent(cc.Animation)) {
    //                switch (event.currentTarget.name) {
    //                     case "01":
    //                         musicName = "仙人掌大象";
    //                         //console.log(musicName);
    //                         break;
    //                     case "02":
    //                         musicName = "虾猫";
    //                         //console.log(musicName);
    //                         break;
    //                     case "04":
    //                         musicName = "木棍人";
    //                         //console.log(musicName);
    //                         break;
    //                     case "05":
    //                         musicName = "车轮蛙";
    //                        //console.log(musicName);
    //                         break;
    //                     case "10":
    //                         musicName = "卡皮巴拉";
    //                        //console.log(musicName);
    //                         break;
    //                     case "13":
    //                         musicName = "忍者咖啡";
    //                         //console.log(musicName);
    //                         break;
    //                     case "14":
    //                         musicName = "耐克鲨鱼";
    //                        //console.log(musicName);
    //                         break;
    //                     case "16":
    //                         musicName = "冰箱骆驼";
    //                         //console.log(musicName);
    //                         break;
    //                     case "17":
    //                         musicName = "香蕉猴";
    //                         //console.log(musicName);
    //                         break;
    //                     case "18":
    //                         musicName = "神木猿";
    //                         //console.log(musicName);
    //                         break;
                    
    //                 }

    //                 AudioManager.playEffect(musicName, false)

    //                 // var hand = () => {
    //                 //     AudioManager.playEffect(musicName, true);
    //                 // }
    //             //    this.MusicHandler.push(musicName);
    //                 //this.MusicState.push(musicState);
    //             }
    //         }
    //         AudioManager.playEffect(AudioManager.common.BUTTON);
    //         this.onwin();
    //   //  }
    // }
    isStartMusic: boolean = true;
    MusicState: string[] = [];
    /** */
    musicState = 1;

//#region 游戏结束
    /**游戏结束 */
    ending(){


        GameData.PauseGame = true;

        let fun = ()=>{

            this.bgMask.active = true;
            //暂停bgm
            AudioManager.stopMusic();

            AudioManager.playEffect("转场_205");
            cc.tween(this.bgMask)
            .to(4,{width:2500,height:2500})
            .call(()=>{
                this.onwin();
            })
            .start();
        }

        this.scheduleOnce(()=>{
            if(this.mainMap.x !=0 || this.mainMap.y != 0){
            //地图位置归0
            //this.mainMap.position = cc.Vec3.ZERO;

            cc.tween(this.mainMap)
           // .to(2,{position:cc.Vec3.ZERO,scale:0.865})
            .to(2,{position:cc.Vec3.ZERO})
            .call(()=>{
                fun();
            })
            .start();
        }

        else{
            cc.tween(this.mainMap)
            .to(2,{scale:0.865})
            .call(()=>{
                fun();
            })
            .start();
        }
        },0.5);


    }



    /**失败界面加载 */
    endlostPanel(){
        let endlost = cc.instantiate(this.lostPanel);

        this.node.parent.addChild(endlost);

        endlost.opacity = 0;

        cc.tween(endlost)
        .to(1,{opacity:255})
        .start();
    }
    winCount = 0;
    // jihuiCount: number = 5;
    isshowVideo = false;
    MusicHandler = [];

//#region 按钮事件    
    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "X":
                event.currentTarget.parent.active = false;
                break;
            case "jiacishu":
                VideoManager.getInstance().showVideo(() => {
                    // this.jihuiCount += 5;
                    // this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.jihuiCount;
                })
                break;
            case "fanhui":

                this.openpausePanel();

                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     GameData.getMap = [];
                //     VideoManager.getInstance().showBaoXiang();
                //     this.node.destroy();
                // })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "tishi":
                var handlers = () => {
                    // // cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
                    // //     var HallnNode = cc.instantiate(tip);
                    // //     HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv5tip;
                    // //     HallnNode.parent = cc.find("Canvas");
                    // //     this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                    // this.isshowVideo = true;
                    // event.currentTarget.getChildByName("luxiang").active = false;
                    // VideoManager.getInstance().showInsert();
                    // // })
                    // this.node.getChildByName("bg").getChildByName("tipsPanel").active = true;
                    let dogs = this.bg1.getChildByName("dogs");
                    for (let i = 0; i < dogs.childrenCount; i++) {
                        if (dogs.children[i] && dogs.children[i].getComponent(cc.Sprite).enabled == false) {
                            this.tipsTarget.active = true;
                            this.tipsTarget.angle = 0;
                            cc.tween(this.tipsTarget).to(20, { angle: 7200 }).start();
                            this.tipsTarget.setScale(15, 15);
                            cc.tween(this.tipsTarget).to(1, { scaleX: 1.5, scaleY: 1.5 }).start();
                            this.tipsTarget.x = dogs.children[i].x;
                            this.tipsTarget.y = dogs.children[i].y;
                            
                            //打开提示this.mapToPoint();
                            this.tipslock = true;

                            let pos = this.node.convertToNodeSpaceAR(dogs.convertToWorldSpaceAR(dogs.children[i].position));

                            this.curDogPos = this.dogPosList[i];

                            this.mapDogPos();

                            if( i == 5){

                               // console.log(dogs.children[i].name,":",this.curDogPos);
                            }
                            
                            break;
                        }
                    }
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "queren":
                event.currentTarget.parent.parent.active = false;
                break;
            case "fssk_handler":
                // this.yingsk.active = false;
                // var icon = this.node.getChildByName("daoju3");
                // this.tweenState2(event, icon, "fenshen", () => {
                //     this.yingnode.active = false;
                // }, "zclv3_12");
                break;
        }
    }



    loadend() {
        this.node.cleanup();
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");

        
     
    }


    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
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

    checkLost() {
        // if (this.jihuiCount <= 0) {
        //     // this.unschedule(this.Timeing);
        //     // GameData.PauseGame = true;
        //     // this.node.cleanup();
        //     // this.scheduleOnce(() => {
        //     //     this.endlost("prefabs/zc/zc_lostend")
        //     //     this.node.destroy();
        //     // }, 0.7);
        //     setTimeout(() => {
        //         this.endlost("prefabs/zc/endlostChance_zc");
        //     }, 600);
        // }
    }
    addChance() {
        VideoManager.getInstance().showVideo(() => {
            // this.jihuiCount += 5;
            // this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.jihuiCount;
        })
    }
    endAddTime() {
        
            this.startTime = 1;
            this.setTime(60);
     
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            // this.unschedule(this.Timeing);
            // GameData.PauseGame = true;
            // this.node.cleanup();
            // this.scheduleOnce(() => {
            //     this.endlost("prefabs/zc/zc_lostend")
            //     this.node.destroy();
            // }, 0.7);
            //设置当前关卡场景名称
            //GameData.curGameName = "jzhz_lv147";
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
        
    }
    protected onDestroy(): void {
        this.unschedule(this.Timeing);
        this.unscheduleAllCallbacks();
    }
}

