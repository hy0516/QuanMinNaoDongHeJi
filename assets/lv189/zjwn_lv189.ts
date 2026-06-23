import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";
import moveItems_lv189 from "./moveItems_lv189";




const { ccclass, property } = cc._decorator;
enum music {

start_1 = "明天要和木棍哥哥约会了，穿什么比较合适呢？",
start_2 = "姐妹帮你参谋！据说木棍哥哥喜欢性感风哦",

choose_0 = "选左还是选右呢",
choose_1 = "我选左_189",
choose_2 = "我选右_189",

hapyending = "舞女，跟哥走吧！",

//（使用吸管）选错任意选项
badending_1 = "好大的胆子敢冒充舞女？马上给我滚！",
//未使用吸管
badending_2 = "就你这长相，也敢约本校棍？",





}
enum talk {
start_1 = "明天要和木棍哥哥约会了，穿什么比较合适呢？",
start_2 = "姐妹帮你参谋！据说木棍哥哥喜欢性感风哦~",

choose_0 = "选左还是选右呢",
choose_1 = "我选左",
choose_2 = "我选右",

hapyending = "舞女，跟哥走吧！",

//（使用吸管）选错任意选项
badending_1 = "好大的胆子敢冒充舞女？马上给我滚！",
//未使用吸管
badending_2 = "就你这长相，也敢约本校棍？",

}
@ccclass
export default class zjwn_lv188 extends BaseGame {
    @property(cc.Node)
    private tittle: cc.Node = null;
    @property(cc.Node)
    private timeText: cc.Node = null;
    @property(cc.Node)
    private gou: cc.Node = null;
    @property(cc.Node)
    private gou2: cc.Node = null;
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Prefab)
    private answerItem: cc.Prefab = null;
    /**场景龙骨 */
    @property(dragonBones.ArmatureDisplay)
    scene_ske: dragonBones.ArmatureDisplay = null;

    @property(cc.Label)
    lab_lv: cc.Label = null;

    /**旁白 */
    @property(cc.Node)
    PB: cc.Node = null;
    /** 对话文本节点*/
    @property(cc.Node)
    lab_pb: cc.Node = null;
 
    @property(cc.Label)
    private lablv: cc.Label = null;

    /**好舞女龙骨 */
    @property(dragonBones.ArmatureDisplay)
    goodGirlSke:dragonBones.ArmatureDisplay = null;

    /**坏舞女龙骨 */
    @property(dragonBones.ArmatureDisplay)
    badGirlSke:dragonBones.ArmatureDisplay = null;

    /**烟雾龙骨 */
    @property(dragonBones.ArmatureDisplay)
    yanwuSke:dragonBones.ArmatureDisplay = null;

    /**吸管动画 */
    @property(dragonBones.ArmatureDisplay)
    tubeSke:dragonBones.ArmatureDisplay = null;

    /**房间场景节点 */
    @property(cc.Node)
    room:cc.Node = null;
    /**黑屏遮罩 */
    @property(cc.Node)
    bm:cc.Node = null;

    

    /**道具释放区域 */
    putDownAera: cc.Node = null;

    shenggongbao: cc.Node;
    qkq: cc.Node = null;


    /**好舞女 */
    goodGirl:cc.Node = null;
    /**坏舞女 */
    badGirl:cc.Node = null;


    /**可爱包包 */
    bag_1:cc.Node = null;
    /**性感包包 */
    bag_2:cc.Node = null;
 
    
    /** 好舞女话框*/
    qpnode1: cc.Node = null;
    /**坏舞女话框 */
    qpnode2: cc.Node = null;

    /**木棍人话框 */
    qpnode3: cc.Node = null;

    /**沙发 */
    sofa:cc.Node = null;

    /**杯子 */
    cup:cc.Node = null;

    /**结局场景 */
    endScene:cc.Node = null;

    /**木棍人 */
    moodMen:cc.Node = null;

    /**当前关卡 */
    curLv = 0; //0

    /**是否以进行道具操作选择（吸管） */
    isSelect = false;

    /**胜负结算 */
    isFalse = false;

    /**答案数组 */
    rightList:string[] = ["right","right","left","left","right","right","left"];


    /**返回按钮锁 */
    fanhuiLock = true;


    /**提示文本数组 */
    tipsList:string[]=[
        "选择右边粉白色裙子",
        "选择右边白色丝袜",
        "选择左边黑色布鞋",
        "选择左边蝴蝶环",
        "选择右边粉丝包包",
        "选择右边冰淇淋",
        "选择左边粉色化妆盘,并拖动吸管到咖啡女头上",
    ]







 

   



    //---手---
 



    //提示文本
 // Tiptext = new Map<number,string>;


    /**当前文本提示 */
   // curText:string = "";

    /**当前提示指针 */
   // curTipindex = 0;


    /**未触发道具序号数组 */
     //tipNumGroup:number[] = [1,10,3,5,6,7,8,9];









    private curLevelId = 0;
    public startTime = 255;
    /**道具释放区域 */
   // sele_zuo: cc.Node = null;
    //room1: cc.Node;
    // /**椅子上的人物-左 */
    // girl_left: cc.Node;
    // /**椅子上的人物-右 */
    // girl_right: cc.Node;

    // girl_left: cc.Node;
    // girl_right: cc.Node;

    //zhu: cc.Node;
    /**咖啡锁(加糖解锁) */
    coffeLock = false;

    curSeleType = 0;



    onLoad() {

        //场景初始化
        this.sceneInof();
       GameData.PauseGame = true;

        //播放bgm
        AudioManager.playMusic("关卡背景_167");

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

        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景_189", true, 1);
        }, 1);
        /**获取场景对象 */
        this.gameManager();

        //播放对白
        this.showqp(this.qpnode1,talk.start_1,music.start_1,()=>{
            this.showqp(this.qpnode2,talk.start_2,music.start_2,()=>{
                this.lvObjUpdate();
               // GameData.PauseGame = false;

                
            })
        })
        
    }



    /**获取游戏对象 */
    gameManager() {

        this.bag_1 = this.room.getChildByName("bag_1");
        this.bag_2 = this.room.getChildByName("bag_2");

        this.putDownAera = this.room.getChildByName("rect");

        this.qpnode1 = this.room.getChildByName("qpnode1");
        this.qpnode2 = this.room.getChildByName("qpnode2");
        this.qpnode3 = this.room.getChildByName("qpnode3");

        this.badGirl = this.room.getChildByName("badGirl");
        this.goodGirl = this.room.getChildByName("goodGirl");

        this.endScene = this.room.getChildByName("sceneEnd");
        this.sofa = this.room.getChildByName("sofa");
        this.cup = this.room.getChildByName("cup");
        this.moodMen = this.room.getChildByName("moodMen");
        
       //更改对话框渲染顺序
       //this.talkFrameSetSiblingIndex();

    }

    // /**更改对话框渲染顺序 */
    // talkFrameSetSiblingIndex(){
    //     this.girl_left.getChildByName("talk").zIndex = 100;
    //     this.girl_right.getChildByName("talk").zIndex = 100;

    //     this.girlStand_left.getChildByName("talk").zIndex = 100;
    //     this.girlStand_right.getChildByName("talk").zIndex = 100;
    // }



    /**初始化场景布置 */
    sceneInof(){
        
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
            .start();
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
    /**选择判断 */
    check(dir){
       if(dir == this.rightList[this.curLv - 1]){
            return true;
       }

       else{
            return false;
       }
    }
    /**左右按键点击 */
    buttonClick(dir){

        GameData.PauseGame = true;

        //对话文本
        let lab;
        let audioName;
        
        //指左
        if(dir == "left"){
            this.girlAniSwitch(10);
            lab = talk.choose_1;
            audioName = music.choose_1;
        }
        //指右
        if(dir == "right"){
            this.girlAniSwitch(12);
            lab = talk.choose_2;
            audioName = music.choose_2;
        }

        let fun = ()=>{
            //左手放
            if(dir == "left"){
            this.girlAniSwitch(11);
            }
            //右手放
            if(dir == "right"){
            this.girlAniSwitch(13);
            }
            this.badGirlSke.playAnimation("daiji1",-1);
            //烟雾
            this.yanwuSke.enabled = true;
            this.yanwuSke.playAnimation("bao",1);
            AudioManager.playEffect("烟雾_189");

            //左：1，3，5，7，...13
            let lv_l = this.curLv * 2 - 1;

            //右：2，4，6，8，...14
            let lv_r = lv_l + 1;

            // if(dir =="left") console.log(dir,lv_l);
            // if(dir =="right") console.log(dir,lv_r);

            //物品换身
            if(dir=="left"){
                this.levelAni(lv_l);
            }
            if(dir=="right"){
                this.levelAni(lv_r);
            }

            this.addOneTimeListener(this.yanwuSke,()=>{
                this.yanwuSke.enabled = false;
                
                //选对
                if(this.check(dir)){
                    //坏舞女生气
                    this.girlAniSwitch(8);
                    
                }
            
                else{
                    //坏舞女开心
                    this.girlAniSwitch(9);

                    this.isFalse = true;
                }
                
                this.addOneTimeListener(this.badGirlSke,()=>{
                    //刷新物品
                    this.lvObjUpdate();
                })

                

            })
        }
        
        this.showqp(this.qpnode1,lab,audioName,fun);
            


        
      
    }

    /**舞女动画切换 */
    girlAniSwitch(num){
        switch(num){
            //待机（双手空）
            case 0 :
                this.badGirlSke.playAnimation("daiji1",-1);
                break;
            //衣服
            case 1 :
                this.badGirlSke.playAnimation("LV1",-1);
                break;
            //丝袜
            case 2 :
                this.badGirlSke.playAnimation("LV2",-1);
                break;
            //鞋子
            case 3 :
                this.badGirlSke.playAnimation("LV3",-1);
                break;
            //脖环
            case 4 :
                this.badGirlSke.playAnimation("LV4",-1);
                break;
            //包
            case 5 :
                this.badGirlSke.playAnimation("LV5",-1);
                break;
            //酒与冰淇淋
            case 6 :
                this.badGirlSke.playAnimation("LV6",-1);
                break;
            //化妆品
            case 7 :
                this.badGirlSke.playAnimation("LV7",-1);
                break;
            //选对（生气）
            case 8 :
                this.badGirlSke.playAnimation("daiji3",1);
                break;
            //选错（开心）
            case 9 :
                this.badGirlSke.playAnimation("daiji2",1);
                break;
            //-- 好舞女（插槽更换）
            //手指左
            case 10 :
                this.skeSetSlot(this.goodGirlSke,"zuoshou",1);
                break;
            //左手放
            case 11 :
                this.skeSetSlot(this.goodGirlSke,"zuoshou",0);
                break;
            //手指右
            case 12 :
                this.skeSetSlot(this.goodGirlSke,"youshou",1);
                break;
            //右手放
            case 13 :
                this.skeSetSlot(this.goodGirlSke,"youshou",0);
                break;
            
        }
    }
    /**骨骼插槽切换 */
    skeSetSlot(ske,sloteName,slotIndex){
        this.changeSKSlotIndex(ske,sloteName,slotIndex);
    }

    /**刷新物品 */
    lvObjUpdate(){

        if(this.curLv >= 7){
            this.gameJudge();
        }

        else{


            this.curLv += 1;


            this.girlAniSwitch(this.curLv);

            this.lab_lvUpdate();

            this.showqp(this.qpnode2,talk.choose_0,music.choose_0,()=>{
                GameData.PauseGame = false;
            })
        
            

            
            //console.log(this.curLv);

        }
        
    }

    /**结局判断 */
    gameJudge(){
        //任意事件选择错误并已使用吸管
        if(this.isFalse && this.isSelect){
            this.endingLoad(1);
        }
        //未使用吸管吸除霉气
        if(!this.isSelect){
            this.endingLoad(2);
        }
        //成功结局
        if(!this.isFalse && this.isSelect){
            this.endingLoad(0);
        }
    }

    /**结局页面加载 */
    endingLoad(num){

        this.sofa.active = false;
        this.cup.active = false;

       

        this.badGirl.active = false;
        this.goodGirl.active =false;
        this.badGirl.position = new cc.Vec3(275.279,-119.255,0);
        this.goodGirl.position = new cc.Vec3(123.652,-316.653,0);


         if(this.bag_1.active){
            this.bag_1.active = false;
            this.skeSetSlot(this.goodGirlSke,"baobao",1);
        }
        if(this.bag_2.active){
            this.bag_2.active = false;
            this.skeSetSlot(this.goodGirlSke,"baobao",0);
        }

        this.bm.opacity = 0;

        cc.tween(this.bm)
        .to(0.8,{opacity:255})
        .call(()=>{
             this.scene_ske.node.active= false;
        })
        .to(0.3,{opacity:0})
        .call(()=>{
            cc.tween(this.endScene)
            .to(0.7,{opacity:255})
            .call(()=>{
                fun();
            })
            .start();
        })
        .start();

        

        var fun = ()=>{
            this.moodMen.active = true;
            let menSke = this.moodMen.getComponent(dragonBones.ArmatureDisplay);

            this.badGirl.active = true;
            this.goodGirl.active =true;

           
            //失败结局1
            if(num == 1){
            //坏女坏笑
            this.badGirlSke.playAnimation("daiji5",-1);
            //生气
            menSke.playAnimation("daiji2",-1);
            this.skeSetSlot(this.goodGirlSke,"tou",3);

            this.showqp(this.qpnode3,talk.badending_1,music.badending_1,()=>{end()});
            }
            //失败结局2
            if(num == 2){
            //坏女坏笑
            this.badGirlSke.playAnimation("daiji5",-1);
            //生气
            menSke.playAnimation("daiji2",-1);
            this.skeSetSlot(this.goodGirlSke,"tou",3);

            this.showqp(this.qpnode3,talk.badending_2,music.badending_2,()=>{end()});
            }
            //成功结局
            if(num == 0){
            //坏女生气
            this.badGirlSke.playAnimation("daiji4",-1);
            //开心
            menSke.playAnimation("daiji1",-1);

            this.showqp(this.qpnode3,talk.hapyending,music.hapyending,()=>{end()});
            }

            var end = ()=>{
                this.scheduleOnce(()=>{
                    if(num == 0){

                        cc.tween(this.moodMen)
                        .to(0.5,{x:-852.659})
                        .start();

                        cc.tween(this.goodGirl)
                        .to(0.5,{x:-852.659})
                        .call(()=>{
                            AudioManager.playEffect("哼_189",false,()=>{
                            this.fanhuiLock = false;
                            this.onwin();
                        });
                        })
                        .start();
                        
                        
                    }

                    else{
                        AudioManager.playEffect("哭泣_189",false,()=>{
                            this.fanhuiLock = false;
                            this.onlost();
                        })
                        
                    }
                },0.8);
            }
        }
        
        
    }
    /**物品动画触发 */
    levelAni(type: number) {

        //console.log("物品触发");
        GameData.PauseGame = true;
        this.curSeleType = type;

        switch (type) {

            //性感裙子
            case 1:
                this.skeSetSlot(this.goodGirlSke,"yifu",0);
                break;
            //可爱裙子
            case 2:
                this.skeSetSlot(this.goodGirlSke,"yifu",1);
               
                break;
            //黑丝袜
            case 3:
               this.skeSetSlot(this.goodGirlSke,"shenti",1);
               break;
            //白丝袜
            case 4:
               this.skeSetSlot(this.goodGirlSke,"shenti",2);
                break;
                  
            //可爱鞋子
            case 5 :
                this.skeSetSlot(this.goodGirlSke,"xiezi",0);
                break;
            //性感鞋子
            case 6:
                this.skeSetSlot(this.goodGirlSke,"xiezi",1);
                    
                break;
            //可爱环饰
            case 7:
                 this.skeSetSlot(this.goodGirlSke,"xiangquan",1);
                break;
            //性感环饰
            case 8:
                this.skeSetSlot(this.goodGirlSke,"xiangquan",0);
                    
                break;
            //性感包包
            case 9:
                this.bag_2.active = true;
                break;
            //可爱包包
            case 10:
                this.bag_1.active = true;
                break;
            //红酒
            case 11:
                this.skeSetSlot(this.goodGirlSke,"kafei",1);
                break;
            //冰淇淋
            case 12:
                this.skeSetSlot(this.goodGirlSke,"kafei",0);
                break;
            //可爱化妆品
            case 13:
                this.skeSetSlot(this.goodGirlSke,"tou",1);
                break;
            //性感化妆品
            case 14:
              this.skeSetSlot(this.goodGirlSke,"tou",2 );
                break;
           

        }
    }

    /**吸管效果 */
    tubeAni(){
        GameData.PauseGame = true;
        this.tubeSke.enabled = true;
        this.tubeSke.playAnimation("xiguan",1);
        AudioManager.playEffect("吸管声_189");
        this.cup.children[0].active = false;
        this.cup.children[1].active = true;
       // console.log(this.tubeSke);
        this.addOneTimeListener(this.tubeSke,()=>{
            GameData.PauseGame = false;
            this.tubeSke.enabled = false;
            
            //脏去除
            this.skeSetSlot(this.goodGirlSke,"qiti",-1);
            this.skeSetSlot(this.goodGirlSke,"zhuangrong",-1);

            this.isSelect = true;
        });
    }
    /**移动机制控制 */
    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch, handler?: Function): void {
        var rect = this.putDownAera.getBoundingBox();
        var poi = this.node.convertToNodeSpaceAR(even.getLocation());

        this.isSelect = true;


       if(rect.contains(poi)){
            tar.destroy();
            this.tubeAni();
        } 
      else{
           tar.getComponent(moveItems_lv189).restart();
        }
    }





    isguoguan = true;
    isjiesuan = false;

    /** */
    lab_lvUpdate(){
        this.lab_lv.string = "剩余事件" + this.curLv.toString() + "/7";
    }



    /**返回功能 */
    fanhuibtn() {
            //if (GameData.PauseGame) return
            this.openpausePanel();
            AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        }

























    jieSuan() {
        // if (this.isjiesuan) return
        // this.isjiesuan = true;
        if(this.isFalse){
           
            
        }
        else{
           
            
        }
        
       
    }

    /**播放旁白 */
    showPB(lab: string, audioName: string, handler?: Function) {
        if (lab == "") {
            handler && handler();
            return
        }
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    cc.tween(this.PB)
                        .to(0.3, { opacity: 0 })
                        .call(() => {
                            handler && handler();
                            this.PB.opacity = 0;
                        })
                        .start()
                })
            })
            .start()

    }
    public RandomNumber(minNumber: number, maxNumber: number): number {
        return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }

    //--场景交互物件注册--

    //抽屉
  


    // IntBtn(){
    //     this.zhu.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.zhu.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    //     this.zhu.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    // }
    // offBtn(){
    //     this.zhu.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.zhu.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    //     this.zhu.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    // }
    // intSelezuo(){
    //     this.sele_zuo.on(cc.Node.EventType.TOUCH_START, this.onTouchStartSelezuo, this);
    //     this.sele_zuo.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveSelezuo, this);
    // }
    // offSelezuo(){
    //     this.sele_zuo.off(cc.Node.EventType.TOUCH_START, this.onTouchStartSelezuo, this);
    //     this.sele_zuo.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveSelezuo, this);
    // }
    // IntqkqBtn(){
    //     this.qkq.on(cc.Node.EventType.TOUCH_START, this.onTouchStartQKQ, this);
    //     this.qkq.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveQKQ, this);
    //     this.qkq.on(cc.Node.EventType.TOUCH_END, this.onTouchEndQKQ, this);
    //     this.qkq.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndQKQ, this);
    // }
    // offqkqBTN(){
    //     this.qkq.off(cc.Node.EventType.TOUCH_START, this.onTouchStartQKQ, this);
    //     this.qkq.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveQKQ, this);
    //     this.qkq.off(cc.Node.EventType.TOUCH_END, this.onTouchEndQKQ, this);
    //     this.qkq.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEndQKQ, this);
    // }

   
    isclickselezuo = false;
    startselezuo

    //场景物品点击事件
    // onTouchStartSelezuo(e: cc.Event.EventTouch) {
    //     if (GameData.PauseGame) return
    //     this.isclickselezuo = true;
    //     this.startselezuo = e.getLocation().y;
    // }
    // onTouchMoveSelezuo(e: cc.Event.EventTouch) {
    //     if (GameData.PauseGame) return
    //     if (!this.isclickselezuo) return
    //     var dis = e.getLocation().y - this.startselezuo;
    //     if (dis > 30) {
    //         //this.offSelezuo();
    //         this.levelAni(7);
    //     }
    // }

    // onTouchStart(e: cc.Event.EventTouch) {
    //     //暂停不可点击
    //     if (GameData.PauseGame) return
    //     this.isdao = true;
    //     this.changentime = new Date().getTime();
    // }
    // onTouchEnd(e: cc.Event.EventTouch) {
    //     // if (GameData.PauseGame) return
    //     this.isdao = false;
    //     // this.changentime =new Date().getTime();
    // }

    // startpoiqkq
    // canqkq = false;
    // onTouchStartQKQ(e: cc.Event.EventTouch) {
    //     if (GameData.PauseGame) return
    //     AudioManager.playEffect(AudioManager.common.BUTTON);
    //     this.startpoiqkq = this.moveicon.position;
    //     this.moveicon.setPosition(this.node.convertToNodeSpaceAR(e.getLocation()));
    //     this.zhu.getChildByName("zhu_sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("zhudaiji", -1)
    //     this.canqkq = true;
    // }

    // onTouchMoveQKQ(e: cc.Event.EventTouch) {
    //     if (!this.canqkq) return
    //     this.moveicon.x += e.getDeltaX();
    //     this.moveicon.y += e.getDeltaY();

    // }
    // onTouchEndQKQ(e: cc.Event.EventTouch) {
    //     if (GameData.PauseGame) return
    //     var rectqkq = this.moveicon.getBoundingBoxToWorld();
    //     var rectnz = this.sele_zuo.getBoundingBoxToWorld();
    //     if (GameData.PauseGame) {
    //         if (this.startpoiqkq) {
    //             this.moveicon.position = this.startpoiqkq;
    //             this.zhu.getChildByName("zhu_sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("dao_2", -1)
    //         }
    //         return
    //     }
    //     // console.log(cc.Intersection.rectRect(rectqkq, rectnz))
    //     // console.log(this.nz.getComponent(nezha6role_nz).currole);
    //     if (cc.Intersection.rectRect(rectqkq, rectnz)) {
    //         this.offqkqBTN();
    //         this.moveicon.active = false;
    //         this.levelAni(10);
    //     } else if (this.startpoiqkq) {
    //         if (this.startpoiqkq) {
    //             this.moveicon.position = this.startpoiqkq;
    //             this.zhu.getChildByName("zhu_sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("dao_2", -1)
    //         }
    //     }
    // }
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
    /**音响已播放 */
    isyinxiang = false;
    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
       // console.log(event.currentTarget.name);
        switch (event.currentTarget.name) {
            case "tiaoguo":
                if (GameData.PauseGame) {
                    common.ShowTipsView("请在当前关卡前跳过");
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = true;
                    this.node.cleanup();
                    this.onwin();
                })
                break;
            case "fanhui":
                if(this.fanhuiLock == false) return;
                // GameData.PauseGame = false;
                // this.node.cleanup();
                // this.node.destroy();
                // GameData.onDele();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                // })
                this.fanhuibtn();
                break;
            case "btn_tips":
                
                var handlers = () => {
                    // GameData.PauseGame = true;
                    this.tipsPanel.active = true;
                    //this.TipDisplay();
                    
                    if(this.curLv<=7) {
                        let curLv;
                        if(this.curLv == 0) curLv = 1;
                        else{
                            curLv = this.curLv;
                        }
                        this.tipsPanel.getChildByName("Label").getComponent(cc.Label).string = this.tipsList[curLv - 1];
                    }
                    // if (this.curLevelId != 1) this.tipsPanel.getChildByName("tishi" + (this.curLevelId - 1).toString()).active = false;
                    // this.tipsPanel.getChildByName("tishi" + (this.curLevelId).toString()).active = true;
                    this.node.getChildByName("btn_tips").getChildByName("guangg").active = false;
                    this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                }
                //console.log("11111");
                this.isshowVideo ? 
                handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "x":
                // GameData.PauseGame = false;
                this.tipsPanel.active = false;
                break;
            case "leftButton":
                    if(GameData.PauseGame) return;
                    this.buttonClick("left");
                break;
            case "rightButton":
                    if(GameData.PauseGame) return;
                    this.buttonClick("right");
                break;
            
        }
    }

    isshowVideo = false;

    ischangen = false;
    isdao = false;
    changentime = 0;
    // Timeing() {
    //     if (GameData.PauseGame == true || !this.ischangen || !this.isdao) return;
    //     var time = new Date().getTime();
    //     if (time - this.changentime >= 2500) {
    //        // this.offBtn();
    //         this.qkq = this.zhu;
    //        // this.IntqkqBtn();
    //         this.unschedule(this.Timeing);
    //         this.zhu.getChildByName("zhu_sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("dao_2", -1)
    //         AudioManager.playEffect(music.长按飞天猪);
    //     }
        // this.startTime--;
        // this.timeText.getComponent(cc.Label).string = "倒计时：" + this.startTime.toString() + "s";
        // if (this.startTime == 0) {
        //     this.unschedule(this.Timeing);
        //     GameData.PauseGame = true;
        //     this.node.cleanup();
        //     this.scheduleOnce(() => {
        //         this.endlost("prefabs/zc/zc_lostend")
        //         this.node.destroy();
        //     }, 0.7);
        // }
    //}

    /**提示序号消除 */
    // tipsNumGroup_clip(num:number){
    //     this.tipNumGroup = this.tipNumGroup.filter(Num=> Num != num);
    //     console.log(this.tipNumGroup);
    // }





    onlost() {
        var fun = () => {
            this.scheduleOnce(() => {
                GameData.PauseGame = false;
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 1)
        }
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .call(fun)
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            // AudioManager.playEffect(music.哭);
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }

}
