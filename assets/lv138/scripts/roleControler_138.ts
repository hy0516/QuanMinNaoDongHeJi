import BaseGame from "../../script/common/BaseGame";
import GameData from "../../script/common/GameData";
import AudioManager from "../../script/common/AudioManager";

export enum roleType{
    e,
    monkey,
    heLi
}

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends BaseGame {



    @property
    text: string = 'hello';

    @property(cc.Node)
    AduioPlayer: cc.Node = null; // 音频播放器

    Auidos: cc.AudioSource[] = [];

    @property(cc.Node)
    roleRect : cc.Node = null;  //角色碰撞边框

    @property(cc.Node)
    shengji : cc.Node = null;

    //道具组
    @property(cc.Node)
    group_1 : cc.Node = null;   

    @property(cc.Node)
    group_2 : cc.Node = null;

    @property(cc.Node)
    group_3 : cc.Node = null;

    //木棍人（敌人）
    @property(cc.Node)
    moondMen:cc.Node = null;

    //木棍人到达位置
    @property(cc.Node)
    moondMen_Pos:cc.Node = null;

    //道具组数组
    Groups: cc.Node[] = [];
    // LIFE-CYCLE CALLBACKS:

    //场景节点
    @property(cc.Node)
    levelNode : cc.Node = null;

    //角色骨骼
    skbone : dragonBones.ArmatureDisplay;

    



    //吃到道具
    isXia:boolean = false;  //虾
    isTree:boolean = false;  //树
    isLanxie:boolean = false;  //蓝鞋
    isTuoxie:boolean = false;  //拖鞋
    isPlane:boolean = false;  //飞机
    isXiangRenZhang:boolean = false;  //仙人掌


    //锁
    //攻击动画锁
    Attack_lock : boolean = true;

    //当前角色类型
    cur_role : roleType = roleType.e;

    // onLoad () {}

   

    start () {



    //注册触摸开始事件  
    this.node.on(cc.Node.EventType.TOUCH_MOVE,this.TouchStart, this);
    
    this.GroupsInfo();

    
    //获取音频
     this.Auidos = this.AduioPlayer.getComponents(cc.AudioSource);
     this.Auidos[0].play();
     

     

    
      
    }
    callBack(Event){
        console.log("sssh");
    }

    //初始化道具组数组
    GroupsInfo(){
        this.Groups.push(this.group_1);
        this.Groups.push(this.group_2);
        this.Groups.push(this.group_3);

        console.log("ll:",this.Groups);
    }

    //触摸移动事件
    TouchStart(event:cc.Event.EventTouch){
        if(this.node.x < 103.804 )  this.node.x = 103.804;
        if(this.node.x > 601.061) this.node.x = 601.061;
        this.node.x += event.getDeltaX();
    }

    //碰撞检测
    RectText(Rect_1 : cc.Node , Rect_2 : cc.Node){
        let rect_1 = Rect_1.getBoundingBoxToWorld();
        
        let rect_2 = Rect_2.getBoundingBoxToWorld();

        return cc.Intersection.rectRect(rect_1,rect_2);
        
        //console.log("Bound:" , rect_1);
    }

    //升级
    
    //换装变身
    roleState(event:number){

        let bone :dragonBones.ArmatureDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
        switch(event){

            //虾
            case 1 : this.changeSKSlotIndex(bone,`touguajian`,0); 
            this.isXia = true;
            break;
            //树
            case 2 : this.changeSKSlotIndex(bone,`touguajian`,1);
            this.isTree= true;
            break;
            //蓝鞋
            case 3 : this.changeSKSlotIndex(bone,`zuotui`,2);
                     this.changeSKSlotIndex(bone,`youtui`,2);
            this.isLanxie= true;
            break;
            //拖鞋
            case 4 : this.changeSKSlotIndex(bone,`zuotui`,1);
                     this.changeSKSlotIndex(bone,`youtui`,1);
            this.isTuoxie= true;
            break;
            //飞机
            case 5 : this.changeSKSlotIndex(bone,`shenti`,1);
            this.isPlane= true;
            break;
            //仙人掌
            case 6 : this.changeSKSlotIndex(bone,`shenti`,2);
            this.isXiangRenZhang = true;
            break;
        }
    }

    //设置骨骼动画插槽
    setChacao(skn:dragonBones.ArmatureDisplay){

        //skn.armature().clear();

        let bone :dragonBones.ArmatureDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);

        if(this.isXia){
            this.changeSKSlotIndex(bone,`touguajian`,0); 
        }
        if(this.isTree){
            this.changeSKSlotIndex(bone,`touguajian`,1);
        }
        if(this.isLanxie){
            this.changeSKSlotIndex(bone,`zuotui`,2);
            this.changeSKSlotIndex(bone,`youtui`,2);
        }
        if(this.isTuoxie){
             this.changeSKSlotIndex(bone,`zuotui`,1);
             this.changeSKSlotIndex(bone,`youtui`,1);
        }
        if(this.isPlane){
            this.changeSKSlotIndex(bone,`shenti`,1);
        }
        if(this.isXiangRenZhang){
            this.changeSKSlotIndex(bone,`shenti`,2);
        }
    }
    //木棍人到达检测
    moodMenCome(){
    
        if(this.moondMen.y <=this.moondMen_Pos.y){

          this.moondMen.getComponent("toolControler_138").isCome = true;
        
          this.AttackPlay();
        
        }

    }
    
    //攻击
    AttackPlay(){

        if(this.Attack_lock == true){

            //设置攻击站位
            this.node.x = 440;

            this.moondMen.x = 170;

            
            //播放音频
            this.Auidos[2].play();
            this.Auidos[0].pause();

            this.node.getComponent(dragonBones.ArmatureDisplay).playAnimation("gongji",-1);

            //设置角色插槽
            this.setChacao(this.node.getComponent(dragonBones.ArmatureDisplay));

            this.moondMen.getComponent(dragonBones.ArmatureDisplay).playAnimation("gongji",-1);

            //取消事件监听
            this.node.off(cc.Node.EventType.TOUCH_MOVE,this.TouchStart, this);

             //3秒后
             //胜负判定
             setTimeout(() =>{this.winInof()},3000);

            this.Attack_lock = false;

           

        }
     
        
    }


    //胜负判定
    winInof(){
        
        if(this.isPlane == true &&this.isTuoxie == true &&this.isTree == true){

           //胜利
            this.node.getComponent(dragonBones.ArmatureDisplay).playAnimation("yes",1);
            this.moondMen.getComponent(dragonBones.ArmatureDisplay).playAnimation("no",1);
            this.Auidos[3].play();
            //添加骨骼动画一次播放回调
            this.addOneTimeListener(
                 this.node.getComponent(dragonBones.ArmatureDisplay),
                ()=>{
                  //  this.win();
                  
                  //等待音频播放结束
                    setTimeout(()=>{
                         this.levelNode.getComponent("Controler_lv138").onwin();
                    },1200)
                 
                }
            )
            
        }

        else{

            //失败
            this.node.getComponent(dragonBones.ArmatureDisplay).playAnimation("no",1);
            this.moondMen.getComponent(dragonBones.ArmatureDisplay).playAnimation("yes",1);



             //添加骨骼动画一次播放回调
            this.addOneTimeListener(
                 this.node.getComponent(dragonBones.ArmatureDisplay),
                () =>{
                    setTimeout(()=>{
                          this.levelNode.getComponent("Controler_lv138").onlost();
                    },1000);
                  
                },
                dragonBones.EventObject.COMPLETE,
                this

            )

            
        }
    }
    // //胜利
    // win(){
        

    //     // //播放音频
    //     // console.log("this:",this);
    //     // this.Auidos[3].play();
        
    
    //    // this.endwin("prefabs/gz/gz_winend");

    //         var fun = () => {
    //                   this.endwin("prefabs/zc/zc_winend");
    //                   GameData.PauseGame = false;
    //                   return
    //               }
    //             //   this.gou.cleanup();
    //             //   cc.tween(this.gou)
    //             //       .to(1.3, { scaleX: 1, scaleY: 1 })
    //             //       .delay(1.3)
    //             //       .call(fun)
    //             //       .start()
    //               this.scheduleOnce(() => {
    //                   AudioManager.playEffect("finishjq");
    //               }, 0.9)
                

        
    // }
    // //失败
    // false(){

    

    //   this.scheduleOnce(() => {
    //              AudioManager.playEffect("com_cuo");
    //              GameData.PauseGame = false
    //              this.node.destroy();
    //              this.endlost("prefabs/zc/zc_lostend");
    //          }, 0.4)

       
    // }

    //播放升级动画
    Shengji(){

        this.shengji.active = true;
        this.shengji.getComponent(dragonBones.ArmatureDisplay).playAnimation("shengji",1);

        let skn =  this.shengji.getComponent(dragonBones.ArmatureDisplay);

        this.addOneTimeListener(skn,()=>{
            this.shengji.active = false;
        });
    }
    
     update (dt) {

       if(GameData.PauseGame == true) return;
        
        //遍历道具组
        for(let i = 0;i<3;i++){

        let group = this.Groups[i];

        //遍历左右道具
        for(let j = 0;j<2;j++){

            let tool = group.children[j]; //道具
            
             let isCollide = false;  //默认不发生碰撞

             //如果背景板显示
            if(tool.active ==true){
                //碰撞检测
                 isCollide = this.RectText(this.roleRect,tool);
            }
            else{
                isCollide = false;
            }
            if(isCollide&&tool.parent.active == true){

                tool.parent.active = false;  //碰撞后道具板为false

                console.log(tool.children[0].name);
                if(tool.children[0].name =="xia"){
                    this.roleState(1);
                    this.Shengji(); //升级特效
                    this.Auidos[1].play();//播放音频
                }
                if(tool.children[0].name =="tree"){
                    this.roleState(2);
                    this.Shengji(); //升级特效
                    this.Auidos[1].play();//播放音频
                }
                if(tool.children[0].name =="lanXie"){
                    this.roleState(3);
                    this.Shengji(); //升级特效
                    this.Auidos[1].play();//播放音频
                }
                if(tool.children[0].name =="tuoXie"){
                    this.roleState(4);
                    this.Shengji(); //升级特效
                    this.Auidos[1].play();//播放音频
                }
                if(tool.children[0].name =="plane"){
                    this.roleState(5);
                    this.Shengji(); //升级特效
                    this.Auidos[1].play();//播放音频
                }
                if(tool.children[0].name =="XiangRenZhang"){
                    this.roleState(6);
                    this.Shengji(); //升级特效
                    this.Auidos[1].play();//播放音频
                }
            }

        }
    }


        //木棍人到达
        this.moodMenCome();
     }
}
