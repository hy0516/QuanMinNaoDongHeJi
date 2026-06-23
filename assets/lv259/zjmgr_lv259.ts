
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
import doubleClick_lv259 from "./doubleClick_lv259";
import moveItem_lv259 from "./moveItem_lv259";




const { ccclass, property } = cc._decorator;

enum music{

g_start = "是谁在门外敲门？",
z_start = "好饿啊，快给我咬一口吧",

g_start2 = "我滴乖乖，千万可别被丧尸给咬到，否则我也会变异的",

z_lostend = "这下你跑不掉了吧_259",
g_lostend = "完了完了，我成丧尸了！",

z_winend ="今天怎么这么快就饱了，下次再来吃你吧！",

oil = "哎哟喂，怎么没咬住！",
food_1 = "吃了个啥？怎么有点卡嗓子眼！",
food_2 = "你给我吃了shi吗，这么臭",
food_3 = "好像吃了什么不该吃的东西",
food_4 = "吃这个不会吃坏我肚子吧",

glew = "这下你跑不掉了吧_259"


}

enum talk{

g_start = "是谁在门外敲门？",
z_start = "好饿啊，快给我咬一口吧",

g_start2 = "我滴乖乖，千万可别被丧尸给咬到，否则我也会变异的",

z_lostend = "这下你跑不掉了吧",
g_lostend = "完了完了，我成丧尸了！",

z_winend ="今天怎么这么快就饱了，下次再来吃你吧！",

oil = "哎哟喂，怎么没咬住！",
food_1 = "吃了个啥？怎么有点卡嗓子眼！",
food_2 = "你给我吃了shi吗，这么臭",
food_3 = "好像吃了什么不该吃的东西",
food_4 = "吃这个不会吃坏我肚子吧",

glew = "这下你跑不掉了吧"


}

enum tool{

    oil,
    food
}

// enum girlSke{


// }

class isSign<T>{

    value:boolean = false;
    constructor(vale:boolean){
        this.value = vale;
    }
}

@ccclass
export default class zjmgr_lv259 extends BaseGame {

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

    girlSke:dragonBones.ArmatureDisplay;
    zoombieSke:dragonBones.ArmatureDisplay;
    oilSke:dragonBones.ArmatureDisplay;

    g_talkFrame:cc.Node = null;
    z_talkFrame:cc.Node = null;

    canjiaohu=false;
    jinduLabel;
  

    room;
    sceneSke:dragonBones.ArmatureDisplay;
    grandMomSke:dragonBones.ArmatureDisplay;
    kidSke:dragonBones.ArmatureDisplay;

    
    //提示标识
    istoilet = new isSign(false);
    isShowGel = new isSign(false);
    isonion = new isSign(false);
    isbuns = new isSign(false);
    ispellow = new isSign(false);

    isegg = new isSign(false);
    iscorn = new isSign(false);
    isoil = new isSign(false);
    isruteOil = new isSign(false);
    isdurian = new isSign(false);


    /**物品释放框 */
    targetBox:cc.Node;

    foodPos:cc.Node;

    /**游戏胜利 */
    isWin = false;

    /**对话配置表 */
    qpConfig = {
      //马桶
      1:{toolType:tool.food,talk:talk.food_3,music:music.food_3,foodType:"吃马桶",oilType:"",isSign:this.istoilet},
      //沐浴露
      2:{toolType:tool.oil,talk:talk.oil,music:music.oil,foodType:"",oilType:"沐浴露",isSign:this.isShowGel},
      //洋葱
      3:{toolType:tool.food,talk:talk.food_2,music:music.food_2,foodType:"吃洋葱",oilType:"",isSign:this.isonion},
      //包子
      4:{toolType:tool.food,talk:talk.food_1,music:music.food_1,foodType:"吃包子",oilType:"",isSign:this.isbuns},
      //枕头
      5:{toolType:tool.food,talk:talk.food_4,music:music.food_4,foodType:"吃枕头",oilType:"",isSign:this.ispellow},
      //鸡蛋
      6:{toolType:tool.food,talk:talk.food_1,music:music.food_1,foodType:"吃鸡蛋",oilType:"",isSign:this.isegg},
      //玉米
      7:{toolType:tool.food,talk:talk.food_3,music:music.food_3,foodType:"吃玉米",oilType:"",isSign:this.iscorn},
      //润滑油
      8:{toolType:tool.oil,talk:talk.oil,music:music.oil,foodType:"",oilType:"润滑油",isSign:this.isruteOil},
      //食用油
      9:{toolType:tool.oil,talk:talk.oil,music:music.oil,foodType:"",oilType:"食用油",isSign:this.isoil},
      //胶水
      10:{toolType:tool.oil,talk:talk.glew,music:music.glew,foodType:"",oilType:"胶水",isSign:null},
      //榴莲
      11:{toolType:tool.food,talk:talk.food_2,music:music.food_2,foodType:"吃榴莲",oilType:"",isSign:this.isdurian},
    }

    //#region  Onload
   
    onLoad() {

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
       // AudioManager.stopMusic();

       this.scheduleOnce(()=>{
            
       },0.5);
       
        cc.Tween.stopAllByTarget(this.tittle);
        this.getManager();

        GameData.PauseGame = true;
        this.zoombieSke.enabled = false;
        this.girlSkeSwicth("睡觉呼吸");

        this.scheduleOnce(()=>{
            this.gameStart();
            AudioManager.playMusic("关卡背景_259",true,0.6);
            this.starting();
        },0.5);
        

        

    }

  
    gameStart() {  
        this.jinduLabel =this.time.node.parent.getChildByName(`jinduLabel`).getComponent(cc.Label);
    }

   
    getManager(){

        this.room =this.node.getChildByName("bg").getChildByName("room");
        this.sceneSke = this.room.getChildByName("sceneSke").getComponent(dragonBones.ArmatureDisplay);
        this.girlSke = this.room.getChildByName("girl").getComponent(dragonBones.ArmatureDisplay);
        this.zoombieSke = this.room.getChildByName("zoombie").getComponent(dragonBones.ArmatureDisplay);
        this.oilSke = this.room.getChildByName("oilSke").getComponent(dragonBones.ArmatureDisplay);
        this.g_talkFrame = this.room.getChildByName("talk1");
        this.z_talkFrame = this.room.getChildByName("talk2");

        this.targetBox = this.room.getChildByName("targetBox");
        this.foodPos = this.room.getChildByName("foodPos");

    }

    starting(){

        let qiaoMenSke = this.room.getChildByName("qiaoMenSke");

        

        
        
        AudioManager.playEffect("睡觉打呼噜_259",false,()=>{
            this.girlSkeSwicth("害怕呼吸");

            qiaoMenSke.active = true;
            qiaoMenSke.getComponent(dragonBones.ArmatureDisplay).playAnimation("donghua",1);
            this.addOneTimeListener(qiaoMenSke.getComponent(dragonBones.ArmatureDisplay),()=>{qiaoMenSke.active = false});

            AudioManager.playEffect("敲门声_259",false,()=>{

                this.showqp(this.g_talkFrame,talk.g_start,music.g_start,()=>{

                    qiaoMenSke.active = true;
                    qiaoMenSke.getComponent(dragonBones.ArmatureDisplay).playAnimation("donghua",1);
                    this.addOneTimeListener(qiaoMenSke.getComponent(dragonBones.ArmatureDisplay),()=>{qiaoMenSke.active = false});

                    AudioManager.playEffect("敲门声_259",false,()=>{
                            this.zoombieSke.node.x = -712.884;
                            this.zoombieSke.enabled = true;
                            this.zoombieSkeSwicth("开局呼吸");

                            AudioManager.playEffect("僵尸出现_259");
                            cc.tween(this.zoombieSke.node)
                            .to(1,{x: -124.669})
                            .call(()=>{
                                //拉扯状态
                                this.normalState();
                                this.scheduleOnce(()=>{
                                    //再次上锁，normalState中的解锁
                                    GameData.PauseGame = false;
                                },0.9); 

                                this.showqp(this.z_talkFrame,talk.z_start,music.z_start,()=>{
                                    this.showqp(this.g_talkFrame,talk.g_start2,music.g_start2,()=>{
                                        console.log(GameData.PauseGame);
                                        GameData.PauseGame = false;
                                    });
                                })
                            })
                            .start();
                    })
               
            })
            })
        })
        
        
    }
    

    lostEnding(){

        AudioManager.playEffect("僵尸咬_259");
        AudioManager.playEffect("女生被咬尖叫");
        this.zoombieSkeSwicth("撕咬");

        this.addOneTimeListener(this.zoombieSke,()=>{
            this.girlSkeSwicth("变异");
            this.showqp(this.g_talkFrame,talk.g_lostend,music.g_lostend,()=>{
                 this.scheduleOnce(() => {
                    this.endlost("prefabs/zc/zc_lostend");
                    this.node.destroy();
            }, 0.7);
            })

        })
    }

    winending(){

        this.zoombieSke.node.zIndex = 199;
        this.girlSke.node.zIndex = 200;
        this.zoombieSke.node.scale = 0.5;
        this.zoombieSke.node.y = 129.797;
        this.z_talkFrame.y = 409.377;
        this.z_talkFrame.x = 13.384;
        this.zoombieSkeSwicth("吃饱");
        AudioManager.playEffect("打嗝_259");
        let isend = false;

        this.showqp(this.z_talkFrame,talk.z_winend,music.z_winend,()=>{
            cc.tween(this.zoombieSke.node)
            .to(2,{x: -712.884})
            .call(()=>{
                isend = true;
                this.girlSkeSwicth("安全呼吸");
                this.scheduleOnce(()=>{
                    this.onwin();
                },2);
                
            })
            .start();

            //摇晃
            let fun = ()=>{
                cc.tween(this.zoombieSke.node)
                .to(0.3,{angle:10})
                .to(0.3,{angle:-10})
                .call(()=>{
                    if(isend) return;
                    fun();
                })
                .start();
            }
            fun();
            
        })
    }


    /**女孩龙骨 */
    girlSkeSwicth(sign){

        this.girlSke.timeScale = 1;
        switch(sign){

            case "睡觉呼吸":
                this.girlSke.playAnimation("daiji10",-1);
                break;
            case "害怕呼吸":
                this.girlSke.playAnimation("daiji2",-1);
                break;
            case "拉伸呼吸":
                this.girlSke.playAnimation("daiji3",-1);
                break;
            case "伸手呼吸":
                this.girlSke.playAnimation("daiji4",-1);
                break;
            case "油甩手":
                this.girlSke.playAnimation("daiji5",1);
                break;
            case "沐浴露甩手":
                this.girlSke.playAnimation("daiji6",1);
                break;
            case "粘住哭泣":
                this.girlSke.playAnimation("daiji8",-1);
                break;
            case "安全呼吸":
                this.girlSke.playAnimation("daiji1",-1);
                break;
            case "变异":
                this.girlSke.playAnimation("daiji9",-1);
                break;
        }
    }

    /**僵尸龙骨 */
    zoombieSkeSwicth(sign){

        this.zoombieSke.timeScale = 1;
        switch(sign){

            case "开局呼吸":
                this.zoombieSke.playAnimation("daiji1",-1);
                break
            case "拉伸呼吸":
                this.zoombieSke.playAnimation("daiji2",-1);
                break;
            case "吃东西生气":
                this.zoombieSke.playAnimation("daiji4",-1);
                break;
            case "油生气":
                this.zoombieSke.playAnimation("daiji3",-1);
                break;
            case "呕吐":
                this.zoombieSke.playAnimation("outu",1);
                break;
            case "撕咬":
                this.zoombieSke.timeScale = 2;
                this.zoombieSke.playAnimation("shiyao",1);
                break;
            case "吃洋葱":
                this.zoombieSke.playAnimation("chi_dasuan",1);
                break;
            case "吃鸡蛋":
                this.zoombieSke.playAnimation("chi_jidan",1);
                break;
            case "吃包子":
                this.zoombieSke.playAnimation("chi_mantou",1);
                break;
            case "吃榴莲":
                this.zoombieSke.playAnimation("chi_liulian",1);
                break;
            case "吃玉米":
                this.zoombieSke.playAnimation("chi_yumi",1);
                break;
            case "吃枕头":
                this.zoombieSke.playAnimation("chi_zhentou",1);
                break;
            case "吃马桶":
                this.zoombieSke.playAnimation("shiyao_matong",1);
                break;
            case "吃饱":
                this.zoombieSke.playAnimation("chibao",-1);
                break;
        }
    }

    oilSkeStartPos;
    /**油龙骨 */
    oliSkeSwicth(sign){

        this.oilSkeStartPos = this.oilSke.node.position;
        this.oilSke.node.position = this.oilSkeStartPos;
        switch(sign){
            case "食用油":
                this.oilSke.playAnimation("dao1",1);
                break;
            case "润滑油":
                this.oilSke.playAnimation("dao2",1);
                break;
            case "沐浴露":
                this.oilSke.node.x += 20;
                this.oilSke.playAnimation("dao3",1);
                break;
            case "胶水":
                this.oilSke.playAnimation("dao4",1);
                break;
        }
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
                        VideoManager.getInstance().showInsert();
                        this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                        this.showTips();
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

    foodScale(food:cc.Node){
        // food.scale += 0.01;

        food.children[0].active = false;
        food.children[1].active = true;
        food.zIndex = 100;
        food.position = this.foodPos.position;
    }


    normalState(){
        this.zoombieSkeSwicth("拉伸呼吸");
        this.girlSkeSwicth("拉伸呼吸");

        this.scheduleOnce(()=>{
            GameData.PauseGame = false;
        },0.8);
        
    }

    biteStae(type,even){

        
        if(this.curToolType == tool.food){

            AudioManager.playEffect("僵尸咬_259");
            this.girlSkeSwicth("伸手呼吸");
            //马桶
            if(type == 1){
                AudioManager.playEffect("马桶_259");
                this.zoombieSkeSwicth("吃马桶");
                this.addOneTimeListener(this.zoombieSke,()=>{
                    this.talkState(type);
                })
            }

            else{

                this.zoombieSkeSwicth("撕咬");
            
                this.addOneTimeListener(this.zoombieSke,()=>{
                this.eatFoodState(type,even);
            });
        }
            
        }
        if(this.curToolType == tool.oil){

            AudioManager.playEffect("咬空手滑_259");
            this.zoombieSkeSwicth("撕咬");
            
            let oilType = this.qpConfig[type].oilType;
            
            //女孩甩手
            if(oilType == "沐浴露"){
                this.girlSkeSwicth("沐浴露甩手");
            }

            else{
                this.girlSkeSwicth("油甩手");
            }

            this.addOneTimeListener(this.zoombieSke,()=>{
            this.girlSkeSwicth("伸手呼吸");
            this.talkState(type);
        });
           
        }

        
    }


    eatFoodState(type,even){
        let foodType = this.qpConfig[type].foodType;
        
        even.target.destroy();
        AudioManager.playEffect("吸收食品、馒头、鸡蛋、榴莲、洋葱、玉米、枕头");
        this.zoombieSkeSwicth(foodType);

        this.addOneTimeListener(this.zoombieSke,()=>{
            

            //榴莲或洋葱
            if(type == 11 || type == 3){

                AudioManager.playEffect("呕吐_259");
                this.zoombieSkeSwicth("呕吐");

                let outSke = this.room.getChildByName("outoSke");
                outSke.active = true;
                let outske = outSke.getComponent(dragonBones.ArmatureDisplay);
                outske.playAnimation("outu",1);
                this.addOneTimeListener(outske,()=>{
                   this.talkState(type);
                })

            }

            else{
                this.talkState(type);
            }
        });
    }

    talkState(Type){

        let type;
        if(this.curToolType == tool.food){
            type = "吃东西生气";
        }
        if(this.curToolType == tool.oil){
            type = "油生气";
        }

        this.zoombieSkeSwicth(type);

        //僵尸说话
        let z_talk = this.qpConfig[Type].talk;
        let z_music = this.qpConfig[Type].music;
        this.showqp(this.z_talkFrame,z_talk,z_music,()=>{
             let isWin = this.levelAdd(); //关卡累加
            if(!isWin)this.normalState();
        });


        this.addOneTimeListener(this.zoombieSke,()=>{
            // let isWin = this.levelAdd(); //关卡累加
            // if(!isWin)this.normalState();
        });

        
    }


    curToolType;
    Logic(type,even:cc.Event.EventTouch){


        //设置提示标识
        let isSign = this.qpConfig[type].isSign;
        if(isSign != null) this.qpConfig[type].isSign.value = true;

        let toolType = this.qpConfig[type].toolType;
        this.curToolType  = toolType;

        if(toolType == tool.food){
            //马桶不放大
            if(type == 1) even.target.destroy();
            else{
                this.foodScale(even.target);
            }

            this.scheduleOnce(()=>{
                this.biteStae(type,even);
            },0.1);
        }

        if(toolType == tool.oil){

            this.oilSke.enabled = true;
            let oilType = this.qpConfig[type].oilType;

            even.target.destroy();

            //倒液音效
            if(type==10)AudioManager.playEffect("胶水_259");
            else AudioManager.playEffect("花生油、润滑油、沐浴露");

            this.oliSkeSwicth(oilType);

            this.addOneTimeListener(this.oilSke,()=>{
                this.oilSke.enabled = false;
                if(type == 10){
                    let glewPic = this.room.getChildByName("glewPic");
                    glewPic.active = true;
                    this.girlSkeSwicth("粘住哭泣");

                    this.showqp(this.z_talkFrame,talk.z_lostend,music.z_lostend,()=>{
                        this.lostEnding();
                    });
                }
                else{

                    this.biteStae(type,even);
                }
            });
        }
    }


    /**特殊道具：bear */
    bearNum = 0;
    usePencil = false;

    itmeMoveHandler(type,even:cc.Event.EventTouch){
        let pos = this.targetBox.parent.convertToNodeSpaceAR(even.getLocation());

        if(this.targetBox.getBoundingBox().contains(pos)){

            GameData.PauseGame = true;
            //逻辑触发
            this.Logic(type,even);
        }

        else{
            even.target.getComponent(moveItem_lv259).restart();
        }
    }

      


        

    lvNum = 0;

    /**关卡累加 */
    levelAdd(){

        this.lvNum += 1;
        this.labelUpdate();
        if(this.lvNum >= 10){

            this.scheduleOnce(()=>{
                this.winending();
            },1);
            

            return true;
        }

        return false;
        
    }



    ending(iswin:boolean){
        let coffeGirl:cc.Node = this.room.getChildByName('coffeGirl');

        let girlSke = coffeGirl.getComponent(dragonBones.ArmatureDisplay);

        

        if(iswin){
            
        }

        else{
            girlSke.playAnimation("daiji4",1);
             this.addOneTimeListener(girlSke,()=>{

            this.scheduleOnce(() => {
                this.endlost("prefabs/zc/zc_lostend");
                this.node.destroy();
            }, 0.7);
        });
        }
        
    }

    /**更新进度标签 */
    labelUpdate(){
        this.jinduLabel.string=`进度${this.lvNum}/10`;
    }

    //#region  双击滑动事件

    openDoor(){

        AudioManager.playEffect("开门_259");
        let door = this.room.getChildByName("door");
        door.active = false;
        this.room.getChildByName("showeGel").active = true;
        this.room.getChildByName("tolite").active = true;
    }

    openfridge(){

        AudioManager.playEffect("打开冰箱_259");
        this.changeSKSlotIndex(this.sceneSke,"men",1);
        this.room.getChildByName("durian").active = true;
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
talkdiplayTeshu(talkthing:string,talkaudio:string,handler?: Function)
    {
        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string =talkthing;
        talk.opacity = 255;
        AudioManager.playEffect(talkaudio,false,()=>{
            talk.opacity = 0;
            handler && handler();
        })
    }


    /** 对话框显示功能*/
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        var qp = qpnode.getChildByName("Lable")
        qp.getComponent(cc.Label).string = lab;
        cc.tween(qpnode)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
    /**对话框隐藏 */
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("Lable")
        cc.tween(qpnode)
            .to(0.2, { opacity: 0 })
            .call(() => {
                handler && handler();
            })
            .start();
         

    }


    /**提示方法 */
    showTips(){
        let lab = "拖动鸡蛋给丧尸";
        if(!this.isegg.value){
            lab = "拖动鸡蛋给丧尸"
        }

        else if(!this.isbuns.value){
            lab = "包子拖给丧尸"
        }

        else if(!this.isoil.value){
            lab = "拖动食用油给丧尸"
        }

        else if(!this.isruteOil.value){
            lab = "拖动冰箱上的润滑油给丧尸"
        }

        else if(!this.isdurian.value){
            lab = "点击冰箱打开，拖动冰箱里的榴莲给丧尸"
        }

        else if(!this.isonion.value){
            lab = "拖动窗外的大蒜给丧尸"
        }

        else if(!this.iscorn.value){
            lab = "拖动墙上挂着的玉米串给丧尸"
        }

        else if(!this.isShowGel.value){
            lab = "点击厕所打开，拖动厕所里的沐浴露绐丧尸"
        }

        else if(!this.istoilet.value){
            lab = "拖动厕所里的马桶给丧尸"
        }

        else if(!this.ispellow.value){
            lab = "拖动女生头下的枕头给丧尸"
        }

        this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).getChildByName("tishi").getChildByName("New Label").getComponent(cc.Label).string = lab;
    }






}

