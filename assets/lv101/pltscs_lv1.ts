

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";







const { ccclass, property } = cc._decorator;
    enum music
    {
        打勾="打勾",
        gou = "finishjq",
    }

@ccclass
export default class pltscs_lv1 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    gou2: cc.Node = null;
    @property(cc.Prefab)
    nextlevelPre: cc.Prefab = null;
    public startTime = 360;
    public curTime = 0;
    tiezhinum = 0;

    @property(cc.Node)
    renNode: cc.Node = null;
    @property(cc.Node)
    bgNode: cc.Node = null;
    @property(cc.Node)
    wintarget: cc.Node = null;
    @property(cc.Node)
    zhangaiwu: cc.Node = null;

    iscanmove=false;//是否可以移动
    rensk:dragonBones.ArmatureDisplay;//人的龙骨
    legState:number;//抬腿状态（0左脚1右脚）
    legnum:number=0;//抬腿计数器
    zhangaiisUse:boolean=false;//障碍物是否触发
    curlvel;//当前关卡
    isdaoche:boolean=false;//是否倒着走
    mustjumplv4:boolean=false;//第四关必须要跳跃的判断
  

    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
       // this.schedule(this.Timeing, 1)
        AudioManager.playMusic(`bgmlv101`, true, 0.9);
        cc.Tween.stopAllByTarget(this.tittle);
       
        this.gamestart();
    }
   gamestart()
   {
    this.rensk=this.renNode.getComponent(dragonBones.ArmatureDisplay);
    this.rensk.armature().animation.gotoAndStopByFrame(`zl`,0);
    this.legState=1;
    this.iscanmove=true;
    this.curlvel=this.node.name.slice(-1);
   }
   taiTui(taileg:number)
   {
    if(!this.iscanmove)return;
    if(taileg==this.legState||(this.curlvel==2&&this.legnum==14)
    ||(this.curlvel==4&&this.mustjumplv4))
    {//抬腿失败
        this.renNode.cleanup();
        this.rensk.playAnimation(`fangun`,0);
        this.onlost();
    }else
    {
        this.iscanmove=false;
        this.legState=taileg;
        if(taileg==0)
        {//抬起左脚
            this.rensk.playAnimation(`zl`,1);
        }else 
        {
            this.rensk.playAnimation(`zl2`,1);
        }
        var switchfun=()=>
        {
            switch(this.curlvel)
            {
                case `1`: 
                if(this.legnum>15&&!this.zhangaiisUse)this.zhangaiUse();
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `2`: 
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `3`: 
                console.log(this.legnum);
                if((this.isdaoche?this.legnum==17:this.legnum==16)
                &&cc.Intersection.rectRect(this.zhangaiwu.getBoundingBoxToWorld(),this.renNode.getChildByName(`collcheck`).getBoundingBoxToWorld()))
                {
                    this.iscanmove=false;
                    this.node.getChildByName(`bg`).getChildByName(`zhangaitips`).active=true;  
                }
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `4`: 
                if(this.legnum==16)
                {
                    this.iscanmove=false;
                    this.node.getChildByName(`bg`).getChildByName(`failtips`).active=true;  
                }
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `5`: 
               
                if(this.legnum==21)
                {
                    AudioManager.playEffect(`egle`);
                    cc.tween(this.zhangaiwu.children[0]).to(3,{x:-1000}).call(
                        ()=>{
                            this.zhangaiwu.children[0].active=false;
                            AudioManager.playEffect(`plane`);
                            cc.tween(this.zhangaiwu.children[1]).to(3,{x:-700}).call(
                                ()=>{
                                    this.zhangaiwu.children[1].active=false;
                                    var zuo =this.node.getChildByName(`bg`).getChildByName(`btn_zuo`);
                                    var you =this.node.getChildByName(`bg`).getChildByName(`btn_you`);
                                    zuo.x+=you.x;
                                    you.x=zuo.x-you.x;
                                    zuo.x=zuo.x-you.x;
                                }
                            ).start()
                        }
                    ).start()
                }
                if(this.legnum>=29)this.checkWinTarget();
                break;
            }
        }
        //步数大于三移动场景 小于3移动人物
        if(this.legnum>=3)
        {
            cc.tween(this.bgNode).to(0.5,{x:this.bgNode.x-49.5,y:this.bgNode.y-23.6})
            .call(()=>{
                this.iscanmove=true;
                this.legnum++;
                switchfun();  
            }).start()
        }else
        {
            cc.tween(this.renNode).to(0.5,{x:this.renNode.x+49.5,y:this.renNode.y+23.6})
            .call(()=>{
                this.iscanmove=true;
                this.legnum++;
                switchfun();  
            }).start()
        }
       
    }
   }
   daochetui(taileg:number)
   {
    if(!this.iscanmove)return;
    if(taileg==this.legState||(this.curlvel==2&&this.legnum==14))
    {//抬腿失败
        this.renNode.cleanup();
        this.rensk.playAnimation(`fangun`,0);
        this.onlost();
    }else
    {
        this.iscanmove=false;
        this.legState=taileg;
        if(taileg==0)
        {
            this.rensk.playAnimation(`zl`,1);
        }else 
        {
            this.rensk.playAnimation(`zl2`,1);
        }
        var switchfun=()=>
        {
            switch(this.curlvel)
            {
                case `1`: 
                if(this.legnum>15&&!this.zhangaiisUse)this.zhangaiUse();
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `2`: 
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `3`: 
                if((this.isdaoche?this.legnum==17:this.legnum==16)
                &&cc.Intersection.rectRect(this.zhangaiwu.getBoundingBoxToWorld(),this.renNode.getChildByName(`collcheck`).getBoundingBoxToWorld()))
                {
                    console.log(`触碰到厕纸`);   
                    this.iscanmove=false;
                    this.node.getChildByName(`bg`).getChildByName(`zhangaitips`).active=true;  
                }
                if(this.legnum>=29)this.checkWinTarget();
                break;
                case `4`: 
               
                break;
                case `5`: 

                if(this.legnum>=29)this.checkWinTarget();
                break;
            }
        }
        //步数大于三移动场景 小于3移动人物
        if(this.legnum>=3)
        {
            cc.tween(this.bgNode).to(0.5,{x:this.bgNode.x+49.5,y:this.bgNode.y+23.6})
            .call(()=>{
                this.iscanmove=true;
                this.legnum--;
                switchfun();  
            }).start()
        }
    }
   }
   checkWinTarget()
   {
        if(this.legnum>=29&&cc.Intersection.rectRect(this.wintarget.getBoundingBoxToWorld(),this.renNode.getBoundingBoxToWorld()))
        {
            if(this.curlvel==3&&(this.zhangaiwu.active==false))
            {
                this.renNode.parent=this.wintarget;
                this.renNode.x=0;this.renNode.y=-70;
                this.rensk.playAnimation(`lashi`,1); this.onwin();
            }else if(this.curlvel==3&&this.zhangaiwu.active==true)
            {
                //第三关并且障碍物厕纸还存在
                this.iscanmove=false;
                this.node.getChildByName(`bg`).getChildByName(`failtips`).active=true; 
            }else
            {
                this.renNode.parent=this.wintarget;
                this.renNode.x=0;this.renNode.y=-70;
                this.rensk.playAnimation(`lashi`,1); this.onwin();
            }
        }
   }
   zhangaiUse()
   {
    if(!this.zhangaiwu)return;
    this.zhangaiisUse=true;
    this.zhangaiwu.active=true
    cc.tween(this.zhangaiwu).to(6,{x:0,y:0,angle:360*10}).call(()=>{
        this.zhangaiwu.cleanup();
        this.zhangaiwu.active=false;
    }).start();
    var fun=()=>{
       if(cc.Intersection.rectRect(this.zhangaiwu.getBoundingBoxToWorld(),this.renNode.getChildByName(`collcheck`).getBoundingBoxToWorld()))
       {
        this.unscheduleAllCallbacks();
        this.zhangaiwu.cleanup();
        this.zhangaiwu.active=false;
        this.renNode.cleanup();
        this.rensk.playAnimation(`fangun`,0);
        this.onlost();
       }
    };
    this.schedule(()=>{
        fun();
    },0.1);
   }
    jumpFun() {
        if (!this.iscanmove) return;
        this.iscanmove = false;
        const jumphigh = 200;
        if ((this.curlvel == 2 && this.legnum == 14)||this.mustjumplv4) {
            if(this.mustjumplv4)
            {
                this.mustjumplv4=false;
                this.legnum+=2;
            }
            cc.tween(this.bgNode).to(1.2, { x: this.bgNode.x - (49.5 * 3), y: this.bgNode.y - (23.6 * 3) }).call(
                () => {
                    this.legnum++;

                }
            ).start();
        }

        cc.tween(this.renNode).to(0.6, { y: this.renNode.y + jumphigh }).call(
            () => {
                cc.tween(this.renNode).to(0.6, { y: this.renNode.y - jumphigh })
                    .call(() => { this.iscanmove = true; }).start();
            }
        ).start();

    }
    onwin() {
        this.iscanmove=false;
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(() => {
                if(this.nextlevelPre)
                {
                   // console.log(this.nextlevelPre);
                    GameData.curGameName=this.nextlevelPre.name;
                    cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
                        let preNode: cc.Node = cc.instantiate(this.nextlevelPre);
                        preNode.parent = cc.find("Canvas");
                        this.node.cleanup();
                        this.node.destroy();

                    })
                }else
                {
                this.node.cleanup();
                this.node.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                }            
            })
            .start()
            this.scheduleOnce(()=>{
                AudioManager.playEffect(`dui`)
            },0.9)
          
    }
    
    onlost() {
        this.iscanmove=false;
        var fun = () => {
            this.scheduleOnce(() => {
                this.gou2.scaleX = 0;
                this.gou2.scaleY = 0;
                GameData.PauseGame = false
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");
            }, 1)
        }
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .delay(1)
            .call(() => {
                // this.jiesuanPanel.getChildByName("nz_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation("sb", 1);
                // this.jiesuanPanel.active = true;
                // VideoManager.getInstance().showInsert();
                fun()
            })
            // .delay(1.5)
            // .call(() => {
            //     this.jiesuanPanel.getChildByName("fail").active = true;
            // })
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }
    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
       // AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "X":
                event.currentTarget.parent.active = false;
                break;
            case "fanhui":
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallnNode = cc.instantiate(hall);
                    HallnNode.parent = cc.find("Canvas");
                    GameData.getMap = [];
                    VideoManager.getInstance().showBaoXiang();
                    this.node.destroy();
                })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "tishi":
                AudioManager.playEffect(AudioManager.common.BUTTON);
                var handlers = () => {
            
                    this.isshowVideo = true;
                    event.currentTarget.getChildByName("luxiang").active = false;
                    VideoManager.getInstance().showInsert();
                    this.node.getChildByName("bg").getChildByName("tipsPanel").active = true;
                  
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            break;
            case "jiawuci":
                VideoManager.getInstance().showVideo(() => {
                    // this.health += 5;
                    // this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.health;
                })
            break;
            case `btn_zuo`:
                AudioManager.playEffect(`walk`)
                if(this.isdaoche)
                {
                    this.daochetui(1)
                }else
                {
                    this.taiTui(0);
                }
               
            break;
            case `btn_you`:
                AudioManager.playEffect(`walk`)
                if(this.isdaoche)
                {
                    this.daochetui(0)
                }else
                {
                    this.taiTui(1);
                }
            break;
            case `btn_tiao`:
                AudioManager.playEffect(`jump`)
                this.jumpFun();
            break;
            case `haode`:
                this.zhangaiwu.active=false;
                this.isdaoche=false;
                this.node.getChildByName(`bg`).getChildByName(`zhangaitips`).active=false;  
                this.iscanmove=true;
            break;
            case `buyongle`:
                this.node.getChildByName(`bg`).getChildByName(`zhangaitips`).active=false; 
                this.iscanmove=true;
            break;
            case `haoba`:
                if(this.curlvel==3)
                {
                    this.node.getChildByName(`bg`).getChildByName(`failtips`).active=false; 
                    this.iscanmove=true;
                    this.isdaoche=true;
                }else if(this.curlvel==4)
                {
                    this.node.getChildByName(`bg`).getChildByName(`failtips`).active=false; 
                    this.iscanmove=true;
                    this.mustjumplv4=true;
                }
                
            break;
                
        }
    }



    loadend() {
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

  
   
    endAddTime() {
        VideoManager.getInstance().showVideo(() => {
            this.startTime = 1;
            this.setTime(60);
        })
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
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
    }
    protected onDestroy(): void {
        this.unschedule(this.Timeing);
    }
}

