// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame_newsdk";


import LocalStorageManager from "../Tool/LocalStorageManager_newsdk";

import SDK_config, { Platform } from "../SDK_config_newsdk";
// import HttpUpBehavior from "../../../Scenes/HttpUpBehavior";

import Ads_Manager from "../Ads_Manager";
import FirstSplash from "./FirstSplash";
import UISDK_Manager_newsdk from "../FrameWork/UI/UISDK_Manager_newsdk";






const { ccclass, property } = cc._decorator;

@ccclass
export default class Spalsh_newsdk extends cc.Component {


    enterSceneName: string = '';
    

    yszc: cc.Node = null;

    bg2: cc.Node = null;

    bg1: cc.Node = null;

    @property(cc.JsonAsset)
    selfDefineJson: cc.JsonAsset = null;

    static issing: boolean = false;
  

    zzqr:cc.Label=null;
    djh:cc.Label=null;

    msg=["Msg1","Msg2","Msg3"];

    index:number=0;
    showjkzgtime:number=0;
    protected onLoad(): void {
      
   
        this.enterSceneName=FirstSplash.enterSceneName;
      

        this.zzqr=cc.find("jkzg/content3",this.node).getComponent(cc.Label);
        this.djh=cc.find("jkzg/content4",this.node).getComponent(cc.Label);
        this.zzqr.node.active=false;
        this.djh.node.active=false;
        console.log(this.enterSceneName);

        Ads_Manager.Ins.onInit(() => {
   
         

            let enter=()=>{
              
                let hasagrreeyszc=cc.sys.localStorage.getItem("yszc");
                console.log(hasagrreeyszc);
                cc.log("Next scene preloaded");
                // IpMaskingTool.instance.getIpAddress();
             
    
                LocalStorageManager.prototype.SetTime();
    
    
    
                // cc.director.preloadScene("LoadScene", function () {
    
                // });
             
                if (hasagrreeyszc) {
                    // HttpUpBehavior.getInstance().addaction(2);//同意隐私
                    this.jumpToGame();
                    // Platforms_QuickGame.getInstance().createVideo();
                    this.yszc.active = false;
                }
                else {
                    console.log(SDK_config.platform)
                    if (SDK_config.platform == Platform.vivo_H5 ||SDK_config.platform == Platform.android ||SDK_config.platform == Platform.HarmoneyOS) {
                        this.jumpToGame();
                       
                        console.log("jumpToGame-")
                    } else {

                        this.yszc.active = true;

                        console.log("yszc-")

                       
                    }
    
                }
            }
            let delaytime=new Date().getTime()-this.showjkzgtime;
            if (delaytime<2000) {
                setTimeout(() => {
                    enter();
                }, 2000-delaytime);
            }else{
                enter();
            }
        },()=>{
            this.showjkzgtime= new Date().getTime() ;

            this.zzqr.string=SDK_config.copyrightOwner;
            this.djh.string=SDK_config.softwareCopyrightNo;
            this.zzqr.node.active=true;
            this.djh.node.active=true;




            cc.director.preloadScene(this.enterSceneName);
         
            for (let index = 0; index < this.msg.length; index++) {
                let msg = this.node.getChildByName(this.msg[index]);
                if (index==SDK_config.yszcType) {                
                    msg.active=true;   
                    if (index==0) {
                        this.yszc = msg.getChildByName("dia_yszc");
                        this.bg2 = this.yszc.getChildByName("bg2");
                        this.bg1 = this.yszc.getChildByName("bg1");
                    
                    }
                    if (index==1) {   
                        //样式2
                        this.yszc = msg.getChildByName("dia_yszc");
                        this.yszc.active=false;

                      

                        let lab2 = cc.find("dia_yszc/bg2/ScrollView/view/content/contentLabel", msg).getComponent(cc.Label);
                        lab2.string = lab2.string.replace(/深圳市掌上方舟科技有限公司/g, SDK_config.companyName);                    
                    }
                    if (index==2) {   
                        //样式2
                        this.yszc = msg.getChildByName("dia_yszc");
                        this.bg2 = this.yszc.getChildByName("bg2");
                        this.bg1 = this.yszc.getChildByName("bg1");
                        this.yszc.active=false;
                        this.bg1.active=true;
                        this.bg2.active=false;

                        let lab = cc.find("bg1/Label1", this.yszc).getComponent(cc.Label);
                        lab.string = "欢迎来到《"+SDK_config.gameName+"》,我们非常重视您的个人信息保护，在您进入游戏前，请您阅读并同意我们的隐私政策。"
                    
                      
                    }

                }else{

                    msg.active=false;
                }
            }
        })
        // console.log("MSG  构建");
        ,
        this.selfDefineJson.json
    }

    setConfig(){


    }

    jumpToGame() {
        this.yszc.active = false;
        console.log("jumpToGame:"+this.enterSceneName);
        console.log(cc.sys.localStorage.getItem("yszc"));
        // cc.director.loadScene(SDK_config.enterSceneName);
        let theTime = new Date().getTime();

        cc.director.loadScene(this.enterSceneName);


      
    }
    onEnable() {
        // SDK_Manager.prototype.Invoke(InvokeConfig.onInit);




    }

    openyszc() {
        // Platforms_QuickGame.getInstance().openYSZC();
    }
    open() {
        this.bg1.active = true;
        Ads_Manager.Ins.openYSZC();
    }
    close() {
        this.bg1.active = true;
      

    }
    agree() {
        // this.yszc.active=false;
        console.log(SDK_config.platform)
        if (SDK_config.platform == Platform.huawei_H5) {
            if (SDK_config.ADTest) {
                cc.sys.localStorage.setItem("yszc", "1");
                console.log("agree==========");
                this.jumpToGame();
                // HttpUpBehavior.getInstance().addaction(2);//同意隐私
            } else {
                if (Spalsh_newsdk.issing || false) {
             
                    cc.sys.localStorage.setItem("yszc", "1");
                    console.log("agree==========");
                    this.jumpToGame();
                    // HttpUpBehavior.getInstance().addaction(2);//同意隐私
                    // Platforms_QuickGame.getInstance().createVideo();

                }
                else {
                    Platforms_QuickGame.getInstance().showToast("请登录后方可同意隐私政策");
                }
            }

        } else {
            cc.sys.localStorage.setItem("yszc", "1");
            console.log("agree==========");
            this.jumpToGame();
            console.log("fhw")
        }







    }
    disagree() {

        console.log("disagree==========");

        // Platforms_QuickGame.getInstance().showToast('您需同意本隐私政策方可进入游戏');
        Platforms_QuickGame.getInstance().exitgame(true);

    }

    onDisable() {

    }
    oncloseone() {
        this.bg2.active = true;

    }
    onClose() {
        this.bg2.active = false;

    }


    // update (dt) {

    // }
}
