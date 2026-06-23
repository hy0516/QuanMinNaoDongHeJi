
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems2 from "../script/common/moveItems2";







const { ccclass, property } = cc._decorator;


@ccclass
export default class ztshj_lv145 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    /**游戏动态逻辑开始开关 */
    canjiaohu=false;
    iswin:boolean=false;

  /**当前关卡 */
    level=3;
    levelNode;
    curMoveNode;
    speedtime=10;
    lv0turn=0;//0左1右
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    /**初始时间 */
    public startTime = 30;
    originalColor;//初始颜色
    isBreathing=false;//呼吸判断

    /**道具节点*/
    @property(cc.Node)
    tool:cc.Node = null; 

    //tool初始化
    toolInof:boolean = true;
    /**道具掉落速度 */
    dropSpeed:number = 20;

    onLoad() {
        

        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`bgmlv139`)
        this.gameStart(); 
    }
    gameStart()
    { 
       this.levelNode=this.node.getChildByName(`bg`).getChildByName(`levelNode`);
       //初始化时间label
       this.time.string = "时间:" + this.startTime.toString() + "s";
       this.schedule(this.Timeing, 1);
       this.huxi(this.node.getChildByName(`bg`).getChildByName(`btn_jiashi`));
       this.openNextRoom();
    }
    /**胜负判定（暂停按钮调用） */
    checkAnswer(even: cc.Event.EventTouch)
    {
        if(!this.canjiaohu)return;
        this.canjiaohu=false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        var iswin=false;
        //判断条件
        switch(this.level)
        {
            case 0:
                if(this.curMoveNode.name == "a" && Math.abs(this.curMoveNode.y - 216.647) <= 10)
                iswin=!iswin;
            break;
               
            case 1:
                // if(Math.abs(this.curMoveNode.y)<=10)
                 if(Math.abs(this.curMoveNode.x)<=10)    
                 iswin=!iswin;
            break;
            case 2:
                if(this.curMoveNode.name == "d" && Math.abs(this.curMoveNode.y - 308.683) <= 10)   
                iswin=!iswin;
            break;
            case 3:
               //if(Math.abs(this.curMoveNode.x)<=10) 
            //    console.log(this.curMoveNode);
            //    console.log(this.curMoveNode.angle);
                if(Math.abs(this.curMoveNode.angle)%360<=3) 
                iswin=!iswin;
            break;
            // case 3:
            //     if(Math.abs(this.curMoveNode.x)<=10)iswin=!iswin;
            // break;
            // case 4:
            //     //if(0.95<this.curMoveNode.scale&&this.curMoveNode.scale<1.05)
            //          iswin=!iswin;
            // break;
        }
        if(iswin)
        {
            
            //进入最后一关（不关闭当前节点）
            if(this.level+1==this.levelNode.childrenCount)
            {
                cc.tween(this.gou).to(1, { scale: 1 }).call(() => {}).start();
                AudioManager.playEffect("gou",null,()=>{AudioManager.playEffect(`lv${this.level+1}`,null,()=>{
                    this.level+=1;
                    this.openNextRoom();
                });});
            }
            //正常情况（关闭当前节点）
            else
            {
                AudioManager.playEffect("gou",null,()=>{AudioManager.playEffect(`lv${this.level+1}`,null,()=>{
                    this.levelNode.children[this.level].active=false;
                    this.level+=1;
                    this.openNextRoom();
                });});
                cc.tween(this.gou).to(1, { scale: 1 }).call(() => {}).start();
            }
          
        }
        else
        {
           
            this.scheduleOnce(()=>{
                AudioManager.playEffect(`com_cuo`);
                this.cha.scale=0.6;
                this.scheduleOnce(()=>{
                    this.cha.scale=0;
                    this.canjiaohu = true;  //播放动画后，重新打开开关
                },1)
            },0.6)
            // cc.tween(this.cha).to(.5, { scale: 1 }).call(() => {
            //     cc.tween(this.cha).to(.5, { scale: 0 }).call(() => {
                    
            //     }).start();
            // }).start();

        }


    }
    /**切换关卡 */
    openNextRoom()
    {  
        this.gou.scale=0;
        if(!this.levelNode.children[this.level])
        {
            this.onwin()
            return;
        }
        //角色显示
        this.levelNode.children[this.level].active=true; 
        //2、4关
        if(this.level == 1 || this.level == 3){
            this.curMoveNode=this.levelNode.children[this.level].children[0];
            this.tool.active = false;
        }
        //1、3关
        if(this.level == 0 || this.level == 2){
            this.tool.active = true;
            this.toolInof = true;
            //this.curMoveNode = this.tool;
        }
        
        switch (this.level) {
            
            case 0: 
         
            case 1:     
              this.speedtime=10;
              //this.curMoveNode.y=600;
              this.canjiaohu=true;  
              this.startTime=this.startTime>21?this.startTime:21;   
              this.stopBreathEffect()
            break;

            case 2:
                this.speedtime=5;
                //this.curMoveNode.rotation=600;
                this.canjiaohu=true;   
                this.startTime=this.startTime>21?this.startTime:21;  
                this.stopBreathEffect()   
            break;
               case 3: 

                console.log(this.level); 

                 this.speedtime=10;
                // this.curMoveNode.x=600;
                this.canjiaohu=true;
                this.startTime=this.startTime>21?this.startTime:21;
                this.stopBreathEffect()
                break;
            // case 3:            
            // break;
            // case 4:   
            //     this.speedtime=0.05;
            //     //this.curMoveNode.scale=0.5;
            //     this.canjiaohu=true;     
            //     this.startTime=this.startTime>21?this.startTime:21;
            //     this.stopBreathEffect()
            // break;
        }
       
    }
    /**计时器方法 */
    Timeing() {
        if (GameData.PauseGame == true||!this.canjiaohu) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";

        if (this.startTime <= 5) {
            // 变红色（只在第一次触发时执行）
            if (!this.isBreathing) {
                this.originalColor = this.time.node.color.clone(); // 保存原色
                this.time.node.color = cc.Color.RED;
                
                // 启动呼吸动画
                this.startBreathEffect();
                this.isBreathing = true;
            }
        }
        if (this.startTime == 0) {
            
        this.stopBreathEffect();
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
    }
    startBreathEffect(): void {
        const breathAction = cc.repeatForever(
            cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.5, 1.2),  // 放大到1.2倍
                    cc.fadeTo(0.5, 150)    // 透明度降到150
                ),
                cc.spawn(
                    cc.scaleTo(0.5, 1.0),  // 恢复原大小
                    cc.fadeTo(0.5, 255)    // 恢复不透明
                )
            )
        );

        this.time.node.runAction(breathAction);
        this.time.node['_breathAction'] = breathAction; // 存储动作引用
    }
    stopBreathEffect(): void {
        if (this.time.node['_breathAction']) {
            this.time.node.stopAction(this.time.node['_breathAction']);
            this.time.node['_breathAction'] = null;

            // 恢复初始状态
            this.time.node.color = this.originalColor;
            this.time.node.scale = 1;
            this.time.node.opacity = 255;
            this.isBreathing = false;
        }
    }
    endAddTime() {
        // VideoManager.getInstance().showVideo(() => {
            this.startTime = this.startTime>0?this.startTime:1;
            this.stopBreathEffect();
            this.isBreathing=false;
            this.setTime(20);
        // })
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
    /**道具循环掉落 */
    toolDrop(){
        let a = this.tool.getChildByName("a");
        let b = this.tool.getChildByName("b");
        let c = this.tool.getChildByName("c");
        let d = this.tool.getChildByName("d");

        this.curMoveNode = a;

        //初始化
        if(this.toolInof){

            this.toolInof = false;

            a.y = 1053.262;
            b.y = 982.572;
            c.y = 1042.984;
            d.y = 1148.66;

            if(this.level == 0){
                a.x = -74.098;
                b.x = -67.421;
                c.x =-75.932;
                d.x = -33.084;
            }
            if(this.level == 2){
                a.x = -110.779;
                b.x = -96.46;
                c.x = -108.637;
                d.x = -33.084;
            }
        }
        if(a.y <= -1100 ){
            d.y = 1148.66;
            this.curMoveNode = b;
        }

        if(b.y <= -885.308){
            a.y = 1053.262;
            this.curMoveNode = c;
        }
        if(c.y <= -1100){
            
            b.y = 982.572;
            this.curMoveNode = d;
        }
        if(d.y <= -1100){
            c.y = 1042.984;
            this.curMoveNode= a;
        }

        //掉落
        this.drop(this.curMoveNode);


    }
    //道具掉落
    drop(node:cc.Node){

        
        node.y -= this.dropSpeed;
       // console.log(node.y);
    }
    update(dt): void {
        if(!this.canjiaohu)return;
        //道具掉落（1、3）
        if(this.level==0||this.level==2)
        {
             
            if(this.canjiaohu){

                this.toolDrop();
            }
        }
        //角色横移（2）
        if(this.level==1)
        {
            if(this.curMoveNode.x<=-600)
            this.lv0turn=1
            if(this.curMoveNode.x>=600)
            this.lv0turn=0
            this.curMoveNode.x+=this.lv0turn?this.speedtime:-this.speedtime;
        }
        //角色旋转（4）
        if(this.level==3)
        {
            this.curMoveNode.angle+=this.speedtime;
        }
        // if(this.level==4)
        // {
           
        //     if(this.curMoveNode.scale>=2)
        //     this.lv0turn=0
        //     if(this.curMoveNode.scale<0.1)
        //     this.lv0turn=1
        //     this.curMoveNode.scale+=this.lv0turn?this.speedtime:-this.speedtime;

        // }
    }
   
    IntMoveBtn() {
        this.node.getChildByName(`bg`).getChildByName("room1").children[1].children[0].on(cc.Node.EventType.TOUCH_START, this.onTouchStartHY, this);
        this.node.getChildByName(`bg`).getChildByName("room1").children[1].children[0].on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveHY, this);
    }
    offMoveBTN() {
        this.node.getChildByName(`bg`).getChildByName("room1").children[1].children[0].off(cc.Node.EventType.TOUCH_START, this.onTouchStartHY, this);
        this.node.getChildByName(`bg`).getChildByName("room1").children[1].children[0].off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveHY, this);
               
    }
    touchstartPoiHY: cc.Vec2;
    onTouchStartHY(e: cc.Event.EventTouch) {
        if(!this.canjiaohu)return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.touchstartPoiHY = e.getLocation();
    }
    /** */
    onTouchMoveHY(e: cc.Event.EventTouch) {
        if (!this.canjiaohu) return;
        if (Math.abs(e.getLocation().y - this.touchstartPoiHY.y) > 30) {
         
        }   
    }

      
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        this.canjiaohu=false;
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("qp")
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
               // if (this.istiaoguo) return
               //this.canjiaohu=true;
                handler && handler();
            })
            .start()
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
                var handlers = () => {
                    this.isshowVideo = true;
                    even.currentTarget.children[0].active=false;
                    VideoManager.getInstance().showInsert();
                    this.tipsPanel.active = true;
                   // this.showStepTipsLabel();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(()=>{
                    handlers();
                });
                break;
            case "btn_jiashi":
                this.endAddTime();
                break;
            case "btn_jiansu":
                VideoManager.getInstance().showVideo(()=>{
                    this.speedtime*=0.8;
                    this.dropSpeed *=0.8;
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
        }
    }
   showStepTipsLabel()
   {
//     const tipsLabel = this.tipsPanel.children[0].children[1].getComponent(cc.Label);
//   //  tipsLabel.string=`选择${this.answer[this.curlevel]==1?`通行`:`抓捕`}`;
//   switch (this.curlevel) {
//     case 1:
//         tipsLabel.string=`上划箩筐，拖动女孩到原来箩筐的位置，点击【藏好了】`;
//     break;
//     case 2:
//         tipsLabel.string=`拖动草丛旁的斧头到石头下面的空地，出现坑，将女生拖动到坑的位置，拖动木板到坑填好，点击【藏好
//         了】`;
//     break;
//     case 3:
//         tipsLabel.string=`先拖动女生到干草，再双击云朵出现太阳，然后拖动食人花变成的干草盖在女生的身上，点击【藏好了】`;
//     break;
//     default:
//         tipsLabel.string=`上划箩筐，拖动女孩到原来箩筐的位置，点击【藏好了】`;
//         break;
//   }

   }
   
    onlost() {
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            GameData.PauseGame = false
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }
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
    huxi(nodd:cc.Node)
    {
        cc.tween(nodd).to(1,{scale:0.9}).call(
        ()=>{
            cc.tween(nodd).to(1,{scale:1}).call(
                ()=>{
                    this.huxi(nodd);
                }
            ).start();
        }
        ).start();
    }
}

