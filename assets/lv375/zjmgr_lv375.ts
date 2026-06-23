
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItem_lv375 from "./moveItem_lv375";




const { ccclass, property } = cc._decorator;

enum music{

start = "大家都是人，凭什么天差地别？你们这些富人接受我的报复吧！",

lv1_1 = "这烤鸭做得不正宗",
lv1_2 = "我连维持自己的生计都很困难了",

lv2_1 = "这么油腻的东西，想让我变得更胖吗",
lv2_2 = "恰逢有人结婚，东家匀出一碗给我",

lv3_1 = "哇，这发型简直绝了！太A爆了！",
lv3_2 = "这东西我不会用，还不如卖了换点钱",

lv4_1 = "我钱多到花不完，读书对我来说根本没必要",
lv4_2 = "读书才能改变命运",

lv5_1 = "太开心了，终于抢到偶像演唱会门票了",
lv5_2 = "门票太贵了，我根本消费不起",

lv6_1 = "也不撒泡尿照照自己，还妄想和我搞对象",
lv6_2 = "他是个好人，但目前我的注意力全在学习上",

lv7_1 = "这点钱连点一次男模特都不够",
lv7_2 = "用暑假打工赚的钱来装修老屋",

lv8_1 = "只要钱足够，任何学校都能上",
lv8_2 = "这不是我的东西，估计是快递员送错了",

lv9_1 = "为什么我的血型和父母的不一样呢",
lv9_2 = "我父母一直很健康的，不会是骗子想骗我吧",

lv10 = "我才想起来，学校安排了一次体检",

lostend = "假的，全是假的！你给我去死！",

winend = "天无绝人之路，我的美好生活就要来了"



}

enum talk{

start = "大家都是人，凭什么天差地别？你们这些富人接受我的报复吧！",

lv1_1 = "这烤鸭做得不正宗",
lv1_2 = "我连维持自己的生计都很困难了",

lv2_1 = "这么油腻的东西，想让我变得更胖吗",
lv2_2 = "恰逢有人结婚，东家匀出一碗给我",

lv3_1 = "哇，这发型简直绝了！太A爆了！",
lv3_2 = "这东西我不会用，还不如卖了换点钱",

lv4_1 = "我钱多到花不完，读书对我来说根本没必要",
lv4_2 = "读书才能改变命运",

lv5_1 = "太开心了，终于抢到偶像演唱会门票了",
lv5_2 = "门票太贵了，我根本消费不起",

lv6_1 = "也不撒泡尿照照自己，还妄想和我搞对象",
lv6_2 = "他是个好人，但目前我的注意力全在学习上",

lv7_1 = "这点钱连点一次男模特都不够",
lv7_2 = "用暑假打工赚的钱来装修老屋",

lv8_1 = "只要钱足够，任何学校都能上",
lv8_2 = "这不是我的东西，估计是快递员送错了",

lv9_1 = "为什么我的血型和父母的不一样呢",
lv9_2 = "我父母一直很健康的，不会是骗子想骗我吧",

lv10 = "我才想起来，学校安排了一次体检",

lostend = "假的，全是假的！你给我去死！",

winend = "天无绝人之路，我的美好生活就要来了"


}

@ccclass
export default class zjmgr_lv375 extends BaseGame {

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    things: cc.Node = null;

    @property(cc.Node)
    djtx: cc.Node = null;

    jinduLabel;
  
    room;
    targetBoxList:cc.Node[];
    /**物品释放框 */
    targetBox_1:cc.Node;
    targetBox_2:cc.Node;


    useReport:boolean = false;

    richCatSke:dragonBones.ArmatureDisplay;
    poorCatSke:dragonBones.ArmatureDisplay;

    change =false;
    isFalse = false;


//#region qpConfig
    /**对话配置表 */
    qpConfig = {   //成员0:richCat, 1:poorCat
        //鸭子
        1:[
            {talk:talk.lv1_1,music:music.lv1_1,ske:"daiji3/0",answer:true,thingIndex:"2"},
            {talk:talk.lv1_2,music:music.lv1_2,ske:null,answer:false,thingIndex:"1"},
        ],
        //红绕肉
        2:[
            {talk:talk.lv2_1,music:music.lv2_1,ske:"daiji2/0",answer:false,thingIndex:"3"},
            {talk:talk.lv2_2,music:music.lv2_2,ske:null,answer:true,thingIndex:"4"},
        ],
        //染发剂
        3:[
            {talk:talk.lv3_1,music:music.lv3_1,ske:null,answer:true,thingIndex:null},
            {talk:talk.lv3_2,music:music.lv3_2,ske:null,answer:false,thingIndex:"5"},
        ],
        //书本
        4:[
            {talk:talk.lv4_1,music:music.lv4_1,ske:"daiji4/1",answer:false,thingIndex:null},
            {talk:talk.lv4_2,music:music.lv4_2,ske:null,answer:true,thingIndex:"6"},
        ],
        //演唱会门票
        5:[
            {talk:talk.lv5_1,music:music.lv5_1,ske:"daiji3/0",answer:true,thingIndex:null},
            {talk:talk.lv5_2,music:music.lv5_2,ske:null,answer:false,thingIndex:null},
        ],
        //信件
        6:[
            {talk:talk.lv6_1,music:music.lv6_1,ske:"daiji2/0",answer:false,thingIndex:null},
            {talk:talk.lv6_2,music:music.lv6_2,ske:"daiji2/0",answer:true,thingIndex:"7"},
        ],
        //钱
        7:[
            {talk:talk.lv7_1,music:music.lv7_1,ske:null,answer:false,thingIndex:"8"},
            {talk:talk.lv7_2,music:music.lv7_2,ske:null,answer:true,thingIndex:null},
       ],
        //证书
        8:[
           {talk:talk.lv8_1,music:music.lv8_1,ske:null,answer:true,thingIndex:"9"},
           {talk:talk.lv8_2,music:music.lv8_2,ske:"daiji3/0",answer:false,thingIndex:"10"},
        ],
        //病危通知
        9:[
           {talk:talk.lv9_1,music:music.lv9_1,ske:"daiji5/0",answer:true,thingIndex:null},
           {talk:talk.lv9_2,music:music.lv9_2,ske:"daiji3/0",answer:false,thingIndex:null},
        ],
            
        
    }


     getManager(){

        this.room =this.node.getChildByName("bg").getChildByName("room");

        this.targetBox_1 = this.room.getChildByName("targetBox_1");
        this.targetBox_2 = this.room.getChildByName("targetBox_2");
        this.targetBoxList = [this.targetBox_1,this.targetBox_2];

        this.richCatSke = this.room.getChildByName("richCat").getComponent(dragonBones.ArmatureDisplay);
        this.poorCatSke = this.room.getChildByName("poorCat").getComponent(dragonBones.ArmatureDisplay);
    }

    //#region  Onload
   
    onLoad() {
        cc.Tween.stopAllByTarget(this.tittle);
        this.getManager();
        this.scheduleOnce(()=>{
            AudioManager.playMusic("关卡背景_375",true,0.6);
            this.starting();
        },0.5);
    }

    starting(){
    
      let lv1  =this.room.getChildByName("lv1");
      let magicWater = lv1.getChildByName("magicWater");
      let kidL = lv1.getChildByName("kidL");
      let kidR = lv1.getChildByName("kidR");
      let kidLske = kidL.getComponent(dragonBones.ArmatureDisplay);
      let kidRske = kidR.getComponent(dragonBones.ArmatureDisplay);

      let magicWaterSke = magicWater.getComponent(dragonBones.ArmatureDisplay);
    
      let talk_0 = lv1.getChildByName("talk_0");
      this.showqp(talk_0,talk.start,music.start,()=>{
            magicWaterSke.enabled = true;
            magicWaterSke.playAnimation("donghua",1);
            AudioManager.playEffect("倒药水_375");

            lv1.getChildByName("badCat").getComponent(dragonBones.ArmatureDisplay).playAnimation("daiji2",0);

            this.addOneTimeListener(magicWaterSke,()=>{
                magicWater.x = 313.338;
                magicWaterSke.playAnimation("donghua",1);
                AudioManager.playEffect("倒药水_375");

                this.addOneTimeListener(magicWaterSke,()=>{
                    magicWaterSke.enabled = false;
                    //交换
                    kidLske.playAnimation("daiji4");
                    kidRske.playAnimation("daiji2");

                    this.scheduleOnce(()=>{
                        this.sceneTransform("lv2",()=>{
                            this.itemCreate();
                        });
                    },1.5);
                })
            })
      })  
    }

    ending(iswin:boolean){
        let talkFrame;
        if(iswin){
            talkFrame = this.room.getChildByName("poorCatTalk");
            this.poorCatSke.playAnimation("daiji7",-1);
            this.showqp(talkFrame,talk.winend,music.winend,()=>{
                this.scheduleOnce(()=>{
                    this.onwin();
                },0.5)
            });  
        }

        else{
            talkFrame = this.room.getChildByName("richCatTalk");
            this.richCatSke.playAnimation("daiji6",1);
            AudioManager.playEffect("撕纸_375");
            this.addOneTimeListener(this.richCatSke,()=>{
                this.showqp(talkFrame,talk.lostend,music.lostend,()=>{
                this.figth(); //打架
                this.scheduleOnce(()=>{
                     this.endlost("prefabs/zc/zc_lostend");
                },2.5);
            });

            })
              
        }
    }


    //打架
    figth(){
        this.richCatSke.node.active = false;
        this.poorCatSke.node.active = false;

        let fithSke = this.room.getChildByName("fightSke");
        fithSke.active = true;
        fithSke.getComponent(dragonBones.ArmatureDisplay).playAnimation("dajia",0);
        AudioManager.playEffect("打架_375");
    }


    //转场
    sceneTransform(sign,fun?){

        let bm:cc.Node = this.room.getChildByName("bm");

        let catTween = ()=>{

            this.richCatSke.node.active = true;
            this.poorCatSke.node.active = true;

            this.richCatSke.node.opacity = 0;
            this.poorCatSke.node.opacity = 0;
            //人物缓动显示
            cc.tween(this.richCatSke.node)
            .to(1,{opacity:255})
            .start();
            cc.tween(this.poorCatSke.node)
            .to(1,{opacity:255})
            .start();
        }

        //体检报告缓动显示
        let reportTween = ()=>{
            let report:cc.Node = this.room.getChildByName("lv10");
            report.active = true;
            report.opacity = 0;
            cc.tween(report)
            .to(1,{opacity:255})
            .start();
        }

        if(sign == "lv3"){
            bm.children[0].active = false;
            this.richCatSke.node.active = false;
            this.poorCatSke.node.active = false;
        }

        cc.tween(bm)
        .to(1,{opacity:255})
        .call(()=>{this.sceneSwicth(sign);})//场景切换
        .delay(0.6)
        .call(()=>{
            catTween();
            if(sign == "lv2") reportTween();
        })
        .to(1,{opacity:0})
        .call(()=>{
            fun && fun();
        })
        .start();
 
    }
//#region  sceneSwicth
    sceneSwicth(sign){
        switch(sign){
            case "lv2":

                //隐藏
                this.room.getChildByName("lv1").active = false;
                this.room.getChildByName("lv2").active = true;
                break;
            case "lv2_2":
                this.room.getChildByName("lv2").getChildByName(`R2`).active = true;
                this.poorCatSke.playAnimation(`daiji4`,0);
                this.change = true;
                break;
            case "lv3":
                this.things.active = false;
                this.changeSKSlotIndex(this.richCatSke,"tou",-1);
                this.room.getChildByName("lv3").active = true;
                break;
        }
    }

    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
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
    }

    //特殊道具
    //体检报告
    reporterItem(){
        //当change为true时，daiji5变成daiji8，daiji3变成daiji6
        let reportAni = this.change ? "daiji5" : "daiji2";
        let walkBackAni = this.change ? "daiji4" : "daiji1";
        this.poorCatSke.playAnimation(reportAni,-1);
        let talkFrame = this.room.getChildByName("poorCatTalk");
        this.showqp(talkFrame,talk.lv10,music.lv10,()=>{

            let startPos = this.poorCatSke.node.position;
            cc.tween(this.poorCatSke.node)
            .to(1,{x:688.736})
            .call(()=>{
                this.poorCatSke.playAnimation(walkBackAni,-1);
            })
            .to(1,{x:startPos.x})
            .call(()=>{
                GameData.PauseGame = false;
            })
            .start();
        });
    }


    itemCreate(){
        let itmes = this.room.getChildByName("itemList").children;
        let itme:cc.Node = itmes[this.lvNum];
        itme.active = true;
        
        // 记录初始 scale，然后从 0 动画恢复到初始值
        let originalScale = itme.scale;
        itme.scale = 0;

        cc.tween(itme)
        .to(0.7,{scale:originalScale})
        .call(()=>{
            GameData.PauseGame = false;
        })
        .start();
    }

    nextLv(){
        this.lvNum += 1;
        if(this.lvNum >= 9){
            if(this.useReport && !this.isFalse){
                this.sceneTransform("lv3",()=>{
                    this.itemCreate();
                });
            }
            else{
                this.scheduleOnce(()=>{
                     this.endlost("prefabs/zc/zc_lostend");
                },2.5);
            }
             return;
        }
        else{
            this.itemCreate();
        }
    }

    //#region  Logic
    Logic(type,targetBox:cc.Node,even:cc.Event.EventTouch){

        let catName;
        let index;
        let catSke:dragonBones.ArmatureDisplay;
        let talk;
        let music;
        let skeAnimation:string;

        let talkCallBack;

        let callBack = ()=>{
            //恢复待机动画
            let idleAni = "daiji1";
            //当change为true且是poorCat时，daiji1-3要加3变成daiji4-6
            if(this.change && catSke === this.poorCatSke){
                idleAni = "daiji4";
            }
            catSke.playAnimation(idleAni,0);

            this.nextLv();
        }

        if(targetBox == this.targetBox_1){
            catName = "richCat";
            index = 0;
            catSke = this.richCatSke;

            //特殊道具
            //染发剂
            if(type === 3){
                //显示头发
                this.changeSKSlotIndex(this.richCatSke,"tou",0);
            }

            //亲子鉴定书
            if(type == 11){
                this.ending(false);
                return;
            }
        }

        if(targetBox == this.targetBox_2){
            catName = "poorCat";
            index = 1;
            catSke = this.poorCatSke;

            //特殊道具

            //钱
            if(type == 7){
                this.sceneSwicth("lv2_2");
            }
            //体检报告
            if(type == 10){
                this.reporterItem();
                this.useReport = true;
                return;
            }

            //亲子鉴定书
            if(type == 11){
                this.ending(true);
                return;
            }
            
        }

        talk = this.qpConfig[type][index].talk;
        music = this.qpConfig[type][index].music;
        skeAnimation = this.qpConfig[type][index].ske;

        //答案判定
        let answer = this.qpConfig[type][index].answer;
        if(answer == false) this.isFalse = true;

        //处理 thingIndex，使用 getChildByName 通过子节点名字获取
        let thingIndex = this.qpConfig[type][index].thingIndex;
        if(thingIndex != null && typeof thingIndex === 'string'){
            let childNode = this.things.getChildByName(thingIndex);
            if(childNode){
                childNode.active = true;
            }
        }

        if(skeAnimation!=null){
            let aniName = skeAnimation.split("/")[0];
            let playTime = Number(skeAnimation.split("/")[1]);

            //当change为true且是poorCat时，daiji1-3要加3变成daiji4-6
            if(this.change && catSke === this.poorCatSke){
                if(aniName === "daiji1") aniName = "daiji4";
                else if(aniName === "daiji2") aniName = "daiji5";
                else if(aniName === "daiji3") aniName = "daiji6";
            }

            //猫动画
            if(skeAnimation != null){
                catSke.playAnimation(aniName,playTime);

                this.addOneTimeListener(catSke,()=>{
                   // skeCallBack && skeCallBack();
                })
            }
        }
        talkCallBack = callBack;
        let talkFrame = this.room.getChildByName(catName+"Talk");
        //对话框
        this.showqp(talkFrame,talk,music,()=>{
            talkCallBack && talkCallBack();
        })
    }


    /**特殊道具：bear */
    bearNum = 0;
    usePencil = false;

    itmeMoveHandler(type,even:cc.Event.EventTouch){

        // 先找到匹配的targetBox
        let matchedTargetBox: cc.Node = null;
        for(let i =0; i<this.targetBoxList.length; i++){
            let targetBox = this.targetBoxList[i];
            let pos = targetBox.parent.convertToNodeSpaceAR(even.getLocation());

            if(targetBox.getBoundingBox().contains(pos)){
                matchedTargetBox = targetBox;
                break;
            }
        }

        // 如果没有匹配的targetBox，重置物品位置
        if(!matchedTargetBox){
            even.target.getComponent(moveItem_lv375).restart();
            return;
        }

        // 有匹配的targetBox，处理逻辑
        GameData.PauseGame = true;

        let index = matchedTargetBox == this.targetBox_1 ? 0 : 1;
        let isRight = false;
        if(type == 10 || type == 11){
            isRight = matchedTargetBox == this.targetBox_2;
        }
        else if(this.qpConfig[type] && this.qpConfig[type][index]){
            isRight = this.qpConfig[type][index].answer;
        }
        
        // 先计算特效位置（在禁用物体前）
        let effectPos: cc.Vec3 = null;
        if(this.djtx){
            let worldPos = even.target.convertToWorldSpaceAR(cc.Vec3.ZERO);
            effectPos = this.djtx.parent.convertToNodeSpaceAR(worldPos);
        }

        // 拖拽物品时会被提到列表末尾，成功后先还原层级，避免 itemList.children 顺序被打乱
        let moveComp = even.target.getComponent(moveItem_lv375);
        if(moveComp){
            even.target.zIndex = moveComp.defzIndex;
            even.target.setSiblingIndex(moveComp.defSiblingIndex);
        }
        
        //逻辑触发
        even.target.active = false;
        
        if(isRight){
            // 在物体消失的位置显示特效
            if(this.djtx && effectPos){
                this.djtx.position = effectPos;
                this.djtx.active = true;

                let djtxSke = this.djtx.getComponent(dragonBones.ArmatureDisplay);
                if(djtxSke){
                    djtxSke.playAnimation("djtx",1);
                }
                
                AudioManager.playEffect("特效");
                
                this.scheduleOnce(()=>{
                    this.djtx.active = false;
                }, 0.8);
            }
        }
        else{
            AudioManager.playEffect("错误");
        }
        
        this.Logic(type,matchedTargetBox,even);
    }
    lvNum = 0;

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

    showTips(){

        let lab ="拖动鸭子给富女孩";
        if(this.lvNum == 0){
            lab = "拖动鸭子给富女孩";
        }
        if(this.lvNum == 1){
            lab = "拖动红绕肉给穷女孩";
        }
        if(this.lvNum == 2){
            lab = "拖动染发剂给富女孩";
        }
        if(this.lvNum == 3){
            lab = "拖动课本给穷女孩";
        }
        if(this.lvNum == 4){
            lab = "拖动演唱会门票给富女孩";
        }

        if(this.lvNum == 5){
            lab = "拖动信封给穷女孩";
        }

        if(this.lvNum >= 6 && !this.useReport){
             lab = "拖动穷女孩脚下的体检报告给穷女孩";
        }
        else{

            if(this.lvNum == 6 && this.useReport){
                lab = "拖动钱给穷女孩";
            }
            if(this.lvNum == 7){
                lab = "拖动录取通知书给富女孩";
            }
            if(this.lvNum == 8){
                lab = "拖动病危通知书给富女孩";
            }
            if(this.lvNum == 9){
                lab = "拖动亲子鉴定给穷女孩";
            }
        }
  
        this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).getChildByName("tishi").getChildByName("New Label").getComponent(cc.Label).string = lab;
    }

}

