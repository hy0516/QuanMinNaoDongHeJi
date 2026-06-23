

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_move_lv274 from "./item_move_lv274";
const { ccclass, property } = cc._decorator;

@ccclass
export default class shj_lv274 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    canjiaohu=true;




    //时间标签
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;

    /**初始时间 */
    startTime:number = 180;

    originalColor;//初始颜色
    isBreathing=false;//呼吸判断


    /**格子提示圈 */
    @property(cc.Node)
    gridLvquan:cc.Node = null;
    



    @property(cc.PageView) // 在编辑器中将 PageView 组件拖拽到这里
    public pageView: cc.PageView = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    // 需要滚动到的目标节点
    targetNode: cc.Node = null;

 
    
    /**剩余机会 */
    health:number=3;//m
    curnum=0;

    /**当前关卡 */
    curlv = 1;

    
    /**关卡拼图数量 */
    puzzNum_lv1 = 12;
    puzzNum_lv2 = 14;
    puzzNum_lv3 = 15;



    /**当前完成拼图数 */
    curPuzz_num = 0;

    /**提示拼图数组 */
    tipsGroup:cc.Node[] = [];

    /**提示闪烁开关 */
    tipLock = true;

    /**提示连点锁 */
    lock_clickDouble = true;
   
    onLoad() {



        GameData.PauseGame = false;

        //关闭大厅bgm
        AudioManager.stopMusic();
  
        //初始化拼图
        this.puzzInof();

        this.tipsGroupInof();


        this.scheduleOnce(()=>{
            AudioManager.playMusic("bgm274");
        },0.5);






       //设置叉号渲染层级
       //this.cha.setSiblingIndex(101);

    //    //开始计时
    //    //初始化时间label
    //    this.time.string = "时间:" + this.startTime.toString() + "s";
    //    this.schedule(this.Timeing, 1);
    //    this.huxi(this.node.getChildByName(`bg`).getChildByName(`btn_jiashi`));
        

    }

    // /**计时器方法 */
    // Timeing() {
    //     if (GameData.PauseGame == true||!this.canjiaohu) return;
    //     this.startTime--;
    //     this.time.string = "时间:" + this.startTime.toString() + "s";

    //     if (this.startTime <= 5) {
    //         // 变红色（只在第一次触发时执行）
    //         if (!this.isBreathing) {
    //             this.originalColor = this.time.node.color.clone(); // 保存原色
    //             this.time.node.color = cc.Color.RED;
                
    //             // 启动呼吸动画
    //             this.startBreathEffect();
    //             this.isBreathing = true;
    //         }
    //     }
    //     if (this.startTime == 0) {
            
    //     this.stopBreathEffect();
    //         setTimeout(() => {
    //             this.endlost("prefabs/hz/endlost_hz");
    //         }, 600);
    //     }
    // }

    //     startBreathEffect(): void {
    //     const breathAction = cc.repeatForever(
    //         cc.sequence(
    //             cc.spawn(
    //                 cc.scaleTo(0.5, 1.2),  // 放大到1.2倍
    //                 cc.fadeTo(0.5, 150)    // 透明度降到150
    //             ),
    //             cc.spawn(
    //                 cc.scaleTo(0.5, 1.0),  // 恢复原大小
    //                 cc.fadeTo(0.5, 255)    // 恢复不透明
    //             )
    //         )
    //     );

    //     this.time.node.runAction(breathAction);
    //     this.time.node['_breathAction'] = breathAction; // 存储动作引用
    // }
    // stopBreathEffect(): void {
    //     if (this.time.node['_breathAction']) {
    //         this.time.node.stopAction(this.time.node['_breathAction']);
    //         this.time.node['_breathAction'] = null; //释放引用，以及引用的内存

    //         // 恢复初始状态
    //         this.time.node.color = this.originalColor;
    //         this.time.node.scale = 1;
    //         this.time.node.opacity = 255;
    //         this.isBreathing = false;
    //     }
    // }
    // /**增加时间（重写BaseGame） */
    // endAddTime() {
    //    
    //         this.startTime = this.startTime>0?this.startTime:1;
    //         this.stopBreathEffect();
    //         this.isBreathing=false;
    //         this.setTime(20);
    //     
    // }
    // setTime(time: number) {
    //     // GameData.PauseGame = true;
    //     if (this.startTime <= 0 || this.startTime + time <= 0) return
    //     this.startTime += time;
    //     var fuhao = "";
    //     if (time > 0) fuhao = "+";
    //     this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
    //     this.Timeing();
    //     cc.Tween.stopAllByTarget(this.addtimetips);
    //     cc.tween(this.addtimetips)
    //         .to(0.2, { opacity: 255 })
    //         .delay(0.5)
    //         .to(0.1, { opacity: 0 })
    //         .call(() => {
    //             // GameData.PauseGame = false;
    //         })
    //         .start();
    // }


    //初始化数组
    tipsGroupInof(){
        this.tipsGroup = [];
        let lv = this.node.getChildByName("bg").getChildByName("lv"+this.curlv.toString());
        let puzzs = lv.getChildByName("puzz").children;
        //浅拷贝,拷贝节点引用
        this.tipsGroup = puzzs.slice();



    }

    //提示数组剔除
    tipsGroupFilter(puzzNode:cc.Node){
        // 停止该节点的闪烁动画
        cc.Tween.stopAllByTarget(puzzNode);
        puzzNode.opacity = 255;
    
        // 停止目标节点的闪烁动画
        let targetNode = puzzNode.getComponent(item_move_lv274).targetNode;
        if (targetNode) {
            cc.Tween.stopAllByTarget(targetNode);
            targetNode.opacity = 255;
            targetNode.active = false;
        }
        this.tipsGroup = this.tipsGroup.filter(node => node !== puzzNode );
        //console.log(puzzNode,this.tipsGroup);  
    }

    //提示闪烁
    tipEffect(){

        this.tipLock = true;
        if (this.tipsGroup.length == 0)
            return;

        let puzz = this.tipsGroup[0];

        let target = puzz.getComponent(item_move_lv274).targetNode;

        //若状态不正确,反转
        if(puzz.getComponent(item_move_lv274).stateCreccot == false){
            puzz.getComponent(item_move_lv274).puzzTurn();
        }
        target.active = true;
        target.opacity = 255;
        puzz.opacity = 255;

        
    
        
        
        cc.Tween.stopAllByTarget(puzz);
        cc.Tween.stopAllByTarget(target);
        if(this.lock_clickDouble)
            this.lock_clickDouble = false;

        //拼图闪烁动画
        const puzzTween = () => {
            cc.tween(puzz)
            .to(0.8, {opacity: 100})
            .to(0.8, {opacity: 255})
            .call(() => {
                if(this.tipLock && this.tipsGroup.includes(puzz))
                    puzzTween();
                else
                    puzz.opacity = 255;
            })
            .start();
        }

        //目标闪烁动画
        const targetTween = () =>{
            cc.tween(target)
            .to(0.8, {opacity: 100})
            .to(0.8, {opacity: 255})
            .call(() => {
                if(this.tipLock && this.tipsGroup.includes(puzz))
                    puzzTween();
                else
                    target.opacity = 255;
                if (!this.tipLock)
                    target.active = false;
            })
            .start();
        }


        //循环闪烁
        /*let fun_1 = ()=>{
            cc.tween(puzz)
            .to(0.8,{opacity:0})
            .to(0.8,{opacity:255})
            .call(()=>{
                if(this.tipLock){
                    fun_1();
                    //puzz.active = false;
                    //console.log(111);
                }
                //else if(this.tipLock == false)
                    //puzz.active = true;
                
            })
            .start();
        }
        let fun_2 = ()=>{
            cc.tween(target)
            .call(()=>{
                if(this.tipLock == false){
                    target.active=false;
                }
            })
            .to(0.8,{opacity:0})
            .to(0.8,{opacity:255})
            .call(()=>{
                if(this.tipLock){
                    fun_2();
                }
            })
            .start();
        }

        if(this.lock_clickDouble){

            this.lock_clickDouble = false;
            fun_1();
            fun_2();
        }*/
        
        puzzTween();
        targetTween();

        

         
    }

    /**获取场景节点 */
    getNode(){

    }
    /** 初始化拼图（并修改素材翻转）*/
    puzzInof(){
        let lv = this.node.getChildByName("bg").getChildByName("lv"+this.curlv.toString());
        let puzzs = lv.getChildByName("puzz").children;

        for(let i = 0; i < puzzs.length; i++ ){
            let puzz = puzzs[i];
            puzz.addComponent(item_move_lv274);
            puzz.getComponent(item_move_lv274).puzzInof(this.node);

            let name = puzz.name;

            //若名称后两个字符为jx，则需翻转
            if(name.slice(-2) == "jx"){
                puzz.scaleX = -1;
                //默认翻转状态为 false
                puzz.getComponent(item_move_lv274).stateCreccot = false;
            }


        }
    }

    /**获取拼图的目标节点 */
    getPuzzTargetNode(puzzNode:cc.Node){

        //let puzzTarget = puzzNode.getComponent(item_move_lv274).targetNode;

        let lv = this.node.getChildByName("bg").getChildByName("lv"+this.curlv.toString());
        let skins = lv.getChildByName("skin").children; 

        //console.log(skins);
        for(let i = 0 ; i < skins.length ; i++ ){
            
            let pointNode = skins[i];

            //获取目标点
            if(pointNode.name == puzzNode.name){

                puzzNode.getComponent(item_move_lv274).targetNode = pointNode;
               // console.log(puzzNode.name,puzzNode.getComponent(item_move_lv274).targetNode);
            }
        }
    }


//     /**放置结果 */
//    checkYesOrNo(istrue:boolean)
//    {    
//         //放置成功
//         if(istrue)
//         {
//             this.curnum++;
            
//         }
        
//         else
//         {
//             this.health--;
//             //剩余机会标签更新和效果
//             this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string=`剩余机会:${this.health}`
//             cc.tween(this.node.getChildByName(`bg`).getChildByName(`healthLabel`)).to(0.3,{scaleX:2,scaleY:2}).call(()=>{
//                 cc.tween(this.node.getChildByName(`bg`).getChildByName(`healthLabel`)).to(0.3,{scaleX:1,scaleY:1}).start();
//             }).start();
//         //游戏失败
//         if(this.health<=0)
//         {
//             GameData.PauseGame = true;
//             setTimeout(() => {
//                 this.endlost("prefabs/zc/endlostChance_zc");
//                 //this.onlost();
//             }, 600);
//             return;
//         }
//         }
//    }

   /**打叉 */
   chaDisplay(){
        cc.tween(this.cha)
        .to(0.5,{scaleX:0.3,scaleY:0.3})
        .call(
            ()=>{

                this.cha.setScale(0);

                //console.log(this.gou.scaleX);
            }
        )
        .start();
   }


   updatelv(){

        let curlvNum;
        switch(this.curlv){
            case 1: 
                curlvNum = this.puzzNum_lv1;
            break;

            case 2: 
                curlvNum = this.puzzNum_lv2;
            break;

            case 3: 
                curlvNum = this.puzzNum_lv3;
            break;
        }

        //通关
        if(this.curPuzz_num >= curlvNum){
            this.nextLv();
            
        }

        else{
            return;
        }


   }

   nextLv(){

        if(this.curlv >= 3){
            this.onwin();
        }

        else{

            //播放音效
            AudioManager.playEffect("gou");
            cc.tween(this.gou)
            .to(1.8,{scale:1})
            .call(()=>{
                let lv = this.node.getChildByName("bg").getChildByName("lv"+this.curlv.toString());

                lv.active = false;

                this.curlv += 1;

                let lv_next = this.node.getChildByName("bg").getChildByName("lv"+this.curlv.toString());
                lv_next.active = true;



                //初始化关卡
                this.puzzInof();

                this.gou.scale = 0;

                this.curPuzz_num = 0;
                //初始化提示数组
                this.tipsGroupInof();
            })
            .start()
        }
   }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                // this.node.cleanup();
               
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                //     GameData.onDele();
                //     this.node.destroy();
                // })
                 break;
          
            case "btn_tips":
                
               // if(!this.canjiaohu) 
               var handlers = () => {
                    this.tipLock = true;
                    this.lock_clickDouble = true;
                    this.tipEffect();
               }
            
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(()=>{
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                 break;
            //跳过
            case "btn_jiacishu":
                    VideoManager.getInstance().showVideo(() => {
                        this.nextLv();
                    })
             break;
            
        }
    }
    onlost() {

        //this.cha.cleanup();
        // cc.tween(this.cha)
        //     .to(1, { scaleX: 1, scaleY: 1 })
        //     //.delay(1.3)
        //     .call(fun)
        //     .start()
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("com_cuo");
        //     GameData.PauseGame = false;

        // }, 1.6)
        // var fun = () =>{
        //     this.node.destroy();
        //     this.endlost("prefabs/zc/zc_lostend");
        // }
           this.scheduleOnce(() => {
                    AudioManager.playEffect("com_cuo");
                    GameData.PauseGame = false
                    this.node.destroy();
                    this.endlost("prefabs/hz/endlost_hz");
                }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }
    onwin() {
        var fun = () => {
            this.endwin("prefabs/hz/endwin_hz");
            GameData.PauseGame = false;
            
            return
        }
        this.gou.cleanup();
        AudioManager.playEffect("gou");
        //AudioManager.playEffect(AudioManager.audioName.endwin);
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()
        // this.scheduleOnce(() => {
        //     //AudioManager.playEffect("finishjq");
        //     AudioManager.playEffect("endwin");
        // },0.9);

        // this.endwin("prefabs/zc/zc_winend");
        // GameData.PauseGame = false;
        return
    }

    addChance() {
        VideoManager.getInstance().showVideo(() => {
            this.health += 5;
            this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string=`剩余机会:${this.health}`
        
        })
    }
    huxi(nodd:cc.Node)
    {
        cc.tween(nodd).to(1,{opacity:0}).call(
        ()=>{
            cc.tween(nodd).to(1,{opacity:255}).call(
                ()=>{
                    this.huxi(nodd);
                }
            ).start();
        }
        ).start();
    }
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                })
            })
            .start()
    }


    // ppNode()
    // {
    //     for (let index = 0; index < this.scrollView.content.childrenCount; index++) {
    //         const element = this.scrollView.content.children[index];
    //         //提示圈
    //         element.getChildByName(`lvquan`).active=false;
    //     }
    //     for (let index = 0; index < this.pageView.content.childrenCount; index++) {
    //         const element = this.pageView.content.children[index];
    //         element.getChildByName(`lvquan`).active=false;
    //     }
    //     var nowtipsNode=this.pageView.node.children[0].children[this.pageView.getCurrentPageIndex()].children[0];//获取当前的在的页面node
    //     if(nowtipsNode.parent.getChildByName(`gou`).active)
    //     {
    //         //当前已完成 重新寻找
            
            
    //     }
    //     for (let index = 0; index < this.scrollView.content.childrenCount; index++) {
    //         const element = this.scrollView.content.children[index];
    //         // if(element.getComponent(item_move_lv148).target===nowtipsNode)
    //         // {
    //         //     element.getChildByName(`lvquan`).active=true;
    //         //     nowtipsNode.parent.getChildByName(`lvquan`).active=true;
    //         //     this.scrollToTarget(element);
                 
    //         // }
    //     }
    // }
    // upAndDownPage(isyou:boolean)
    // {
    //     const uppage =isyou?1:-1;
    //     //最右
    //     if(this.pageView.getCurrentPageIndex()+uppage==9)
    //     this.pageView.node.getChildByName(`btn_you`).active=false;
    //     else
    //     this.pageView.node.getChildByName(`btn_you`).active=true;
    //     if(this.pageView.getCurrentPageIndex()+uppage==0)
    //     this.pageView.node.getChildByName(`btn_zuo`).active=false;
    //     else
    //     this.pageView.node.getChildByName(`btn_zuo`).active=true;
    //     this.pageView.scrollToPage(this.pageView.getCurrentPageIndex()+uppage,1);
    // }
}

