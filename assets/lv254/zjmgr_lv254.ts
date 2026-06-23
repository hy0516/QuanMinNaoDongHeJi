
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveItems2 from "../script/common/moveItems2";
import item_click4 from "../script/pre/item_click4";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";
import doubleClick_lv254 from "./doubleClick_lv254";
import moveItem_lv254 from "./moveItem_lv254";




const { ccclass, property } = cc._decorator;

enum music{

grandMom_start = "孙女终于睡着了，我能刷手机了",

grandMom_milk = "小孙女，你还没睡着吗",
grandMom_teat = "小孙女，你醒来了吗",
grandMom_tool = "小孙女，你刚刚眼睛是不是还在睁着",
grandMom_book = "小孙女，你是在看我玩手机吗",
grandMom_mirror = "小孙女，你还在醒着吗",
grandMom_earPhone = "小孙女，你怎么还不睡呢",
grandMom_bear = "小孙女，你是不是哪里不舒服",
grandMom_moon = "咱家孙女睡眠质量真棒",


kid_tool = "这是我最喜欢的杀马特娃娃",
kid_book = "要是我能变成人鱼公主就好了",
kid_bear_1 = "一个约翰_254",
kid_bear_2 = "两个约翰_254",
kid_bear_3 = "没有你们陪着我睡不着",


}

enum talk{

grandMom_start = "孙女终于睡着了，我能刷手机了",

grandMom_milk = "小孙女，你还没睡着吗",
grandMom_teat = "小孙女，你醒来了吗",
grandMom_tool = "小孙女，你刚刚眼睛是不是还在睁着",
grandMom_book = "小孙女，你是在看我玩手机吗",
grandMom_mirror = "小孙女，你还在醒着吗",
grandMom_earPhone = "小孙女，你怎么还不睡呢",
grandMom_bear = "小孙女，你是不是哪里不舒服",
grandMom_moon = "咱家孙女睡眠质量真棒",

kid_tool = "这是我最喜欢的杀马特娃娃",
kid_book = "要是我能变成人鱼公主就好了",
kid_bear_1 = "一个约翰",
kid_bear_2 = "两个约翰",
kid_bear_3 = "没有你们陪着我睡不着",


}

@ccclass
export default class zjmgr_lv254 extends BaseGame {

    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;


    public startTime = 300;
    public startX = 0;
    public endX = 0;
    public curTime = 0;


    //道具完成标识
    isearPhone = false;
    isteat = false;
    ispencil = false;
    istool = false;
    ismilk = false;
    isbear = false;
    isbook = false;
    ismirror = false;
    isopenWindow = false;






    canjiaohu=false;
    jinduLabel;
  

    room;

    sceneSke:dragonBones.ArmatureDisplay;
    grandMomSke:dragonBones.ArmatureDisplay;
    kidSke:dragonBones.ArmatureDisplay;


    /**孩子矩形框 */
    targetBox:cc.Node;

    /**游戏胜利 */
    isWin = false;

    /**对话配置表 */
    qpConfig = {
        //铅笔
        7:{
            kid:{talk:null,music:null},
            grandMom:{talk:null,music:null}
        },
        //奶嘴
        2:{
            kid:{talk:null,music:null},
            grandMom:{talk:talk.grandMom_teat,music:music.grandMom_teat}
        },
        //耳机
        10:{
            kid:{talk:null,music:null},
            grandMom:{talk:talk.grandMom_earPhone,music:music.grandMom_earPhone}
        },
        //玩具
        5:{
            kid:{talk:talk.kid_tool,music:music.kid_tool},
            grandMom:{talk:talk.grandMom_tool,music:music.grandMom_tool}
        },
        //牛奶
        4:{
            kid:{talk:null,music:null},
            grandMom:{talk:talk.grandMom_milk,music:music.grandMom_milk}
        },
        //熊
        11:{
            kid:{talk:talk.kid_bear_1,music:music.kid_bear_1},
            grandMom:{talk:null,music:null}
        },
        //书
        6:{
            kid:{talk:talk.kid_book,music:music.kid_book},
            grandMom:{talk:talk.grandMom_book,music:music.grandMom_book}
        },
        //镜子
        9:{
            kid:{talk:null,music:null},
            grandMom:{talk:talk.grandMom_mirror,music:music.grandMom_mirror}
        },
      
    }

    //#region  Onload
   
    onLoad() {

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
       // AudioManager.stopMusic();
       AudioManager.playMusic("关卡背景_254",true,0.6);
        cc.Tween.stopAllByTarget(this.tittle);
        this.getManager();

        GameData.PauseGame = true;
        this.scheduleOnce(()=>{
            this.gameStart();
        },0.5);
        

        this.sceneInof();
    }

  
    gameStart() {  
        
        
        this.jinduLabel =this.time.node.parent.getChildByName(`jinduLabel`).getComponent(cc.Label);
        // this.talkdiplayTeshu(music.start,talk.start,()=>{
        //     this.canjiaohu=true;
        //     GameData.PauseGame = false;
        // });

        this.grandMomLookState(talk.grandMom_start,music.grandMom_start);
    }

    sceneInof(){
   
       
    }

    getManager(){
        this.room =this.node.getChildByName("bg").getChildByName("room");
        this.sceneSke = this.room.getChildByName("sceneSke").getComponent(dragonBones.ArmatureDisplay);
        this.grandMomSke = this.room.getChildByName("GrandMomSke").getComponent(dragonBones.ArmatureDisplay);
        this.kidSke = this.room.getChildByName("KidSke").getComponent(dragonBones.ArmatureDisplay);
        this.targetBox = this.room.getChildByName("targetBox");
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
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "tishi":
               
                    var handlers = () => {
                        //this.isshowVideo = true;
                        VideoManager.getInstance().showInsert();
                        this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                        this.showStepTipsLabel();
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


    /**场景开灯 */
    openLight(isOpen:boolean){
        if(isOpen){
            //开灯
            this.changeSKSlotIndex(this.sceneSke,"fangjian",0);
        }

        else{
            //关灯
            this.changeSKSlotIndex(this.sceneSke,"fangjian",1);
        }
    }

    /**奶奶查看状态 */
    grandMomLookState(talk,music){
        this.openLight(true);

        this.grandMomSke.playAnimation("diaiji2",-1);
        this.kidSke.playAnimation("diaiji3",-1);

        this.talkdiplayTeshu(music,talk,()=>{       
            
            if(this.isWin){
                this.scheduleOnce(()=>{this.onwin();},0.5)
            }
            else{
                this.grandMomPhoneState();
            }
            GameData.PauseGame = false;


        });

    }

    /**奶奶看手机状态 */
    grandMomPhoneState(){
        this.openLight(false);

        this.grandMomSke.playAnimation("diaiji1",-1);
        this.kidSke.playAnimation("diaiji1",-1);

    }

    /**宝宝动画播放器 */
    kidSkePlayer(type){

        
       
        this.kidSke.playAnimation("diaiji"+type.toString(),1);
     
        
        

    }

    //#region  moveHandle


    /**道具音效播放 */
    itemAuidoPlay(type){
        switch(type){
            case 7:
                AudioManager.playEffect("画笔_254");
                break;
            case 10:
                AudioManager.playEffect("耳机_254");
                break;
            case 2:
                AudioManager.playEffect("奶嘴_254");
                break;
            case 4:
                AudioManager.playEffect("吸奶瓶_254");
                break;
            case 9:
                AudioManager.playEffect("宝宝哭声_254");
                break;
        }
    }

    /**提示标识赋值 */
    itmeTips(type){
        switch(type){
            case 7:
                this.ispencil =true;
                break;
            case 10:
                this.isearPhone =true;
                break;
            case 2:
                this.isteat =true;
                break;
            case 4:
                this.ismilk =true;
                break;
            case 9:
                this.ismirror =true;
                break;
            case 11:
                this.isbear =true;
                break;
            case 6:
                this.isbook =true;
                break;
            case 5:
                this.istool =true;
                break;
        }
    }

    /**特殊道具：bear */
    bearNum = 0;
    usePencil = false;

    itmeMoveHandler(type,even:cc.Event.EventTouch){
        let pos = this.targetBox.parent.convertToNodeSpaceAR(even.getLocation());

        //拖拽熊后至拖拽满三次前，不能释放其他物品
        let bearLock:boolean = this.bearNum > 0 && this.bearNum < 3 && type != 11; 
        let pencilLock:boolean = !this.usePencil &&  type == 9 || this.usePencil && type!= 9; // 铅笔锁,未用铅笔不能释放镜子， 用了铅笔只能释放镜子;

        if(this.targetBox.getBoundingBox().contains(pos) && !bearLock && !pencilLock){

            GameData.PauseGame = true;

            this.itemAuidoPlay(type); //道具音效

            //特殊处理
            if(type == 11 && this.bearNum < 2){
                
                even.currentTarget.getComponent(moveItem_lv254).restart();
            }

            else{
                //铅笔
                if(type == 7){
                    this.usePencil = true;
                }
                //镜子
                if(type == 9){
                    this.usePencil = false;
                }
                //销毁道具
                even.target.destroy();
                //提示赋值
                this.itmeTips(type);
                //关卡累加
                this.levelAdd();
                this.labelUpdate();

                console.log(this.lvNum);
            }
            
            //特殊处理
            if(type == 11){

                this.kidSkePlayer(type+this.bearNum);
                this.bearNum++;
            }
            else{
                //播放宝宝动画
                this.kidSkePlayer(type);
            }
            

            
            //获取对话
            let kidTalk = this.qpConfig[type]["kid"].talk;
            let kidMusic = this.qpConfig[type]["kid"].music;
            let GrandMomTalk = this.qpConfig[type]["grandMom"].talk;
            let GrandMomMusic = this.qpConfig[type]["grandMom"].music;

            let isGarandMomTalk:boolean = true;
            let isKidTalk:boolean = true;

            if(kidTalk == null || kidMusic == null)  isKidTalk = false;
            if(GrandMomTalk == null || GrandMomMusic == null) isGarandMomTalk = false;

            if(isKidTalk){
                
                //特殊处理
                if(type ==11 && this.bearNum > 1 && this.bearNum <= 3){
                    if(this.bearNum == 2) this.talkdiplayTeshu(music.kid_bear_2,talk.kid_bear_2,()=>{GameData.PauseGame = false;});
                    if(this.bearNum == 3) this.talkdiplayTeshu(music.kid_bear_3,talk.kid_bear_3,()=>{
                        this.grandMomLookState(talk.grandMom_bear,music.grandMom_bear);
                    });
                }

                else{
                     this.talkdiplayTeshu(kidMusic,kidTalk,()=>{

                    if(isGarandMomTalk){
                            this.grandMomLookState(GrandMomTalk,GrandMomMusic);
                        }
                    else{
                        console.log(GameData.PauseGame);
                        GameData.PauseGame = false;
                    }
                    });
                }
               
                
            }
            
            else{

                this.addOneTimeListener(this.kidSke,()=>{
                    
                    //铅笔
                    if(type == 7){
                        this.kidSke.playAnimation("diaiji8",-1);
                        GameData.PauseGame = false; 
                    }
                    else{
                        this.kidSke.playAnimation("diaiji1",-1);
                    }
                    
                    if(isGarandMomTalk){
                        this.grandMomLookState(GrandMomTalk,GrandMomMusic);
                    }
                });
                
            }

            

        }

        else{
            even.currentTarget.getComponent(moveItem_lv254).restart();
        }


        

    }

    /**进度计数 */
    lvNum = 0;

    /**关卡累加 */
    levelAdd(){

        

        this.lvNum += 1;

        if(this.lvNum >= 8){
            let windowDoubleClick = this.room.getChildByName("windowClick");
            windowDoubleClick.active = true;
        }
        

        
        

    }



    ending(iswin:boolean){
        let coffeGirl:cc.Node = this.room.getChildByName('coffeGirl');

        let girlSke = coffeGirl.getComponent(dragonBones.ArmatureDisplay);

        

        if(iswin){
            
            // girlSke.playAnimation("daiji3",-1);

            // this.talkdiplayTeshu(music.ending,talk.ending,()=>{
            //     this.scheduleOnce(() => {
            //     this.onwin();
            // }, 0.7);
            // })


        }

        else{
            girlSke.playAnimation("daiji4",1);
             this.addOneTimeListener(girlSke,()=>{
       
             this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend")
                this.node.destroy();
            }, 0.7);
        });
        }
        
    }

    /**更新进度标签 */
    labelUpdate(){
        this.jinduLabel.string=`进度${this.lvNum}/9`;
    }








    //#region  双击滑动事件

    pellowSlide(){
        let book = this.room.getChildByName("book");
        book.active = true;
    }

    openDesk(){
        AudioManager.playEffect("抽屉254");
        let pencil = this.room.getChildByName("pencil");
        pencil.active = true;
        this.changeSKSlotIndex(this.sceneSke,"chouti",0);
    }

    openWindow(){
        this.changeSKSlotIndex(this.sceneSke,"chuang",1);
        let moonSlide = this.room.getChildByName("moonSlide");
        moonSlide.active = true;
    }

    moonSlide(){

        this.isopenWindow = true;

        this.changeSKSlotIndex(this.sceneSke,"baitian",0);
        this.changeSKSlotIndex(this.sceneSke,"yueliang",0);
        this.changeSKSlotIndex(this.sceneSke,"taiyangguang",0);

        this.kidSke.playAnimation("diaiji14",1);
        this.addOneTimeListener(this.kidSke,()=>{
            //游戏胜利
            this.isWin = true;
            this.changeSKSlotIndex(this.sceneSke,"taiyangguang",-1);
            this.grandMomLookState(talk.grandMom_moon,music.grandMom_moon);
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
    endAddTime() {
       
            this.startTime = 1;
            this.setTime(60);
            this.schedule(this.Timeing, 1)
        //})
    }
    
/** 播放旁白 */
talkdiplayTeshu(talkaudio:string,talkthing:string,handler?: Function)
    {
       
        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string =talkthing;
        talk.opacity = 255;
        AudioManager.playEffect(talkaudio,false,()=>{
            talk.opacity = 0;
            handler && handler();

            
        })
    }
    showStepTipsLabel()
    {
        const tipsLabel = this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).children[0].children[1].getComponent(cc.Label);

        if(this.usePencil){
            tipsLabel.string = "先单击打开柜子，再将里面的笔拖动到宝宝，最后将镜子拖动到宝宝";
            return;
        }

        if(this.bearNum > 0 && this.bearNum < 3){
            tipsLabel.string = "连续三次拖动约翰玩偶";
            return;
        }

        if(!this.isteat){
            tipsLabel.string = "将奶嘴拖动到宝宝";
        }

        else if(!this.ismilk){
            tipsLabel.string = "将奶瓶拖动到宝宝";
        }

        else if(!this.istool){
            tipsLabel.string = "将杀马特娃娃拖动到宝宝";
        }

        else if(!this.isbear){
            tipsLabel.string = "连续三次拖动约翰玩偶";
        }

        else if(!this.isbook){
            tipsLabel.string = "先滑动枕头，再将枕头下的童话书拖动到宝宝";
        }

        else if(!this.ispencil){
            tipsLabel.string = "先单击打开柜子，再将里面的笔拖动到宝宝，最后将镜子拖动到宝宝";
        }

        else if(!this.ismirror){
            tipsLabel.string = "先单击打开柜子，再将里面的笔拖动到宝宝，最后将镜子拖动到宝宝";
        }

        else if(!this.isearPhone){
            tipsLabel.string = "将耳机拖动到宝宝";
        }

        else if(!this.isopenWindow){
            tipsLabel.string = "先双击打开窗户，在下滑月亮";
        }



    }

}



