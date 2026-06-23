import GameData from "../../script/common/GameData";
import AudioManager from "../../script/common/AudioManager";
import VideoManager from "../../script/common/VideoManager";
import common from "../../script/common/common";
import BaseGame from "../../script/common/BaseGame";
import {roleType} from "../scripts/roleControler_138"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends BaseGame {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.Node)
    private tipsPanel: cc.Node = null;

    isshowVideo:boolean =false;  

    @property(cc.Node)
    role:cc.Node = null;

    @property(cc.Node)
    selectPlanel:cc.Node = null;

    //广告标记
    @property(cc.Node)
    vedio1:cc.Node = null; 
    @property(cc.Node)
    vedio2:cc.Node = null; 
    gameDontStart: boolean = true; //游戏还未开始

    // LIFE-CYCLE CALLBACKS:

     onLoad () {

    //停止背景音乐
    AudioManager.stopMusic();

     }

    start () {

        //暂停游戏
        GameData.PauseGame = true;
       
        //选择面板缓动弹窗
        this.selectPlanel.opacity = 0;

        cc.tween(this.selectPlanel)
        .to(0.8, { opacity: 255 })
        .call(() => {
        console.log("动画完成回调");
        
        })
        .start();
      
        //console.log(this.selectPlanel.opacity);
       

    }
    //游戏开始
    gameStart(){
        this.gameDontStart = false;
        GameData.PauseGame = false;
    }

    //选择角色
    //点击事件
    //鹅
    role_1_click(){

        
        this.role.active =true;

        let ske = this.role.getComponent(dragonBones.ArmatureDisplay);
        this.changeSKSlotIndex(ske,"tou",0);
        this.changeSKSlotIndex(ske,"shenti",0);

       
       
        this.gameStart();

        this.selectPlanel.active = false;

        //设置角色类型
        this.role.getComponent("roleControler_138").cur_role = roleType.e;
    }
    //猴子
    role_2_click(){
        
        
         if(this.vedio1.active == true){
            
             VideoManager.getInstance().showVideo(()=>{

                //弹出插屏
                VideoManager.getInstance().showInsert();

                this.vedio1.active = false;

                this.role.active =true;

                let ske = this.role.getComponent(dragonBones.ArmatureDisplay);
                this.changeSKSlotIndex(ske,"tou",1);
                this.changeSKSlotIndex(ske,"chibang",-1);
                this.changeSKSlotIndex(ske,"shenti",3);

                this.changeSKSlotIndex(ske,"zuotui",-1);
                this.changeSKSlotIndex(ske,"youtui",-1);

                this.gameStart();

                this.selectPlanel.active = false;

                //设置角色类型
                this.role.getComponent("roleControler_138").cur_role = roleType.monkey;
        });

         }

         else{
            this.role.active =true;

                let ske = this.role.getComponent(dragonBones.ArmatureDisplay);
                this.changeSKSlotIndex(ske,"tou",1);
                this.changeSKSlotIndex(ske,"chibang",-1);
                this.changeSKSlotIndex(ske,"shenti",3);

                this.changeSKSlotIndex(ske,"zuotui",-1);
                this.changeSKSlotIndex(ske,"youtui",-1);

                this.gameStart();

                this.selectPlanel.active = false;

                //设置角色类型
                this.role.getComponent("roleControler_138").cur_role = roleType.monkey;
         }
       
        
       
    }
    //河狸
    role_3_click(){

        if(this.vedio2.active == true){

            VideoManager.getInstance().showVideo(() => {

                 //弹出插屏
                VideoManager.getInstance().showInsert();

                this.vedio2.active = false;
                 this.role.active =true;

                let ske = this.role.getComponent(dragonBones.ArmatureDisplay);
                this.changeSKSlotIndex(ske,"tou",2);
                this.changeSKSlotIndex(ske,"chibang",-1);
                this.changeSKSlotIndex(ske,"shenti",4);

                this.changeSKSlotIndex(ske,"zuotui",-1);
                this.changeSKSlotIndex(ske,"youtui",-1);
       

                this.gameStart();

                this.selectPlanel.active = false;

                //设置角色类型
                this.role.getComponent("roleControler_138").cur_role = roleType.heLi;

            })


        }

       else{
        this.role.active =true;

        let ske = this.role.getComponent(dragonBones.ArmatureDisplay);
        this.changeSKSlotIndex(ske,"tou",2);
        this.changeSKSlotIndex(ske,"chibang",-1);
        this.changeSKSlotIndex(ske,"shenti",4);

        this.changeSKSlotIndex(ske,"zuotui",-1);
        this.changeSKSlotIndex(ske,"youtui",-1);
       

        this.gameStart();

         this.selectPlanel.active = false;

         //设置角色类型
         this.role.getComponent("roleControler_138").cur_role = roleType.heLi;
       }
    }




    BtnHandler(event: cc.Event.EventTouch) {
            AudioManager.playEffect(AudioManager.common.BUTTON);
            switch (event.currentTarget.name) {
                case "tiaoguo":
                    // if (GameData.PauseGame) {
                        
                    //     common.ShowTipsView("请在当前关卡前跳过");
                    //     return;
                    // }

                    //如果在游戏开始时,先恢复结束游戏暂停
                    this.gameAllResume();

                    VideoManager.getInstance().showVideo(() => {
                        GameData.PauseGame = true;
                        this.node.cleanup();
                        this.onwin();
                    })
                    break;
                case "fanhui":
                    
                    //如果一开始游戏被暂停，先恢复游戏
                    this.gameAllResume();
                    //暂停界面
                    this.openpausePanel();
                    GameData.PauseGame = false;
                    // this.node.cleanup();
                    // this.node.destroy();
                    // GameData.onDele();
                    // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                    //     var UINode = cc.instantiate(UI);
                    //     UINode.parent = cc.find("Canvas");
                    //     VideoManager.getInstance().showBaoXiang();
                    // })
                    break;
                case "btn_tips":
                    var handlers = () => {
                        
                        GameData.PauseGame = true;
                        
                        this.tipsPanel.active = true;
                        // if (this.curLevelId != 1) this.tipsPanel.getChildByName("tishi" + (this.curLevelId - 1).toString()).active = false;
                        // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = true;
                        this.node.getChildByName("btn_tips").getChildByName("guangg").active = false;
                        this.isshowVideo = true;
                        VideoManager.getInstance().showInsert();
                    }
                    this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                    break;
                case "x":
                    //console.log("sssswpp:",this.gameDontStart);
                    //游戏已经开始
                    if(this.gameDontStart == false){
                        GameData.PauseGame = false;
                    }
                    // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = false;
                    this.tipsPanel.active = false;
                    break;
            }
        }


    onwin() {
                // var fun = () => {
                // if (this.curLevelId >= 3) {
                this.node.cleanup();
                this.node.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;

            }
        
    endwin(name: string) {
            cc.resources.load(name, cc.Prefab, (err, end: cc.Prefab) => {
            var endNode = cc.instantiate(end);
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
    onlost() {
                // var fun = () => {
                // if (this.curLevelId >= 3) {
                this.node.cleanup();
                this.node.destroy();
                this.endwin("prefabs/zc/zc_lostend");
                GameData.PauseGame = false;

            }
        
    endlost(name: string) {
            cc.resources.load(name, cc.Prefab, (err, end: cc.Prefab) => {
            var endNode = cc.instantiate(end);
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

    update (dt) {
            if (GameData.PauseGame == true) return;
        }
}
