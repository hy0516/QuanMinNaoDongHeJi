
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import player_lv207 from "./player_lv207";
import qsh_lv207 from "./qsh_lv207";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ddl_lv207 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    @property(cc.Node)
    lostpanel: cc.Node = null;
    @property(cc.Node)
    player: cc.Node = null;
    @property(cc.Prefab)
    qshPre: cc.Node = null;
    @property(cc.Prefab)
    wmPre: cc.Node = null;
    @property(cc.Prefab)
    hxPre: cc.Node = null;
    @property(cc.Prefab)
    jlPre: cc.Node = null;

    isshowVideo = false;
    canjiaohu=false;

   
    bgNode;//
   
    totalNodeNum=0;//总障碍个数
    curNewNode;//当前障碍
    totalRank=0;//最高分
    curRank=0;//当前分
    wmCombo=0;//完美连击次数

    
   

    onLoad() {
        GameData.PauseGame = false;
        this.bgNode=this.node.getChildByName(`bg`);
        this.lostpanel.active=false;
        if(cc.sys.localStorage.getItem("lv207totalRank")&&cc.sys.localStorage.getItem("lv207totalRank")>0)
        {
            this.totalRank=cc.sys.localStorage.getItem("lv207totalRank");
            this.bgNode.getChildByName(`fsk`).getChildByName(`toprank`).getComponent(cc.Label).string=this.totalRank;
        }
        this.scheduleOnce(()=>{
            AudioManager.stopMusic();
            this.gamestart();
        },0.2)
       
    }
    gamestart()
    {
        AudioManager.playMusic(`bgmlv207`);
        this.bgNode.getChildByName(`djs`).active=true;
        this.bgNode.getChildByName(`djs`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`djs`,1);
        AudioManager.playEffect(`倒计时`)
        this.addOneTimeListener(this.bgNode.getChildByName(`djs`).getComponent(dragonBones.ArmatureDisplay),()=>{
            this.bgNode.getChildByName(`djs`).active=false;
            this.canjiaohu=true;
            this.createPre();
        })
    }
    createPre()
    {
    //    // const randomTime =  Math.random();
    //   //  const adjusted = (randomTime === 0 ? 1 : randomTime) + 0.3;
    //     var delay=0.5;
    //     if(this.totalNodeNum>0&&this.totalNodeNum%5==0)
    //     {
    //         delay=adjusted;
    //     }
        this.scheduleOnce(()=>{
            this.UpdateNewNode();
        },0.2);
    }
    UpdateNewNode()
    {
        this.curNewNode =cc.instantiate(this.qshPre);
        const randomSpeed =  Math.random();
        if(this.totalNodeNum>0&&this.totalNodeNum%5==0)
        {
          this.curNewNode.getComponent(qsh_lv207).movespeed=8+randomSpeed*4;
        }
        this.curNewNode.scale=0.84;
        this.bgNode.addChild(this.curNewNode);
        this.curNewNode.x=Math.random()>0.5?-600:600;
        this.curNewNode.y=-520+(this.totalNodeNum>3?3:this.totalNodeNum)*151;
        this.curNewNode.setSiblingIndex(this.player.getSiblingIndex()+1);
        this.totalNodeNum+=1;
        if(this.totalNodeNum>11)
        {
            var tempNode=null;
            for (let index = 0; index < this.bgNode.childrenCount; index++) {
                const element = this.bgNode.children[index];
                if(element.name==`qsh`)
                {
                    if(tempNode==null||element.getSiblingIndex()>tempNode.getSiblingIndex())
                    {
                        tempNode=element;
                    }
                }
            }
            if(tempNode)
            {
                tempNode.active=false;
                tempNode.destroy();
            }
        }
    }
    clickPlayerJump(even: cc.Event.EventTouch)
    {
        if(this.canjiaohu)
        {
            this.canjiaohu=false;
            this.player.getComponent(player_lv207).triggerJump();
            AudioManager.playEffect(`跳跃`);
        }
    }
    checkColl()
    {
        
        const absX=Math.abs(this.curNewNode.x)
        if(absX>85)
        {
           // console.log(`jifei`);
            this.jifeiEvent();
        }else if(absX>25)
        {
            //console.log(`haoxian`);
            this.successEvent(false);
           
        }else
        {
           // console.log(`wanmei`);
            this.successEvent(true);
           
        }
      
    }
    jifeiEvent()
    {
        this.canjiaohu=false;
        this.showAndDestoryPre(3);
        AudioManager.playEffect(`撞飞`);
        if(this.curNewNode.x>0)
        {
            this.player.getComponent(dragonBones.ArmatureDisplay).playAnimation(`tiao_3`,1);
            if (this.player.children[1].active) {
                this.player.children[1].getComponent(dragonBones.ArmatureDisplay).playAnimation(`ttr_3`, 1);
            }
            if (this.player.children[2].active) {
                this.player.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation(`kbqn_3`, 1);
            }
        }else
        {
            this.player.getComponent(dragonBones.ArmatureDisplay).playAnimation(`tiao_4`,1);

            if (this.player.children[1].active) {
                this.player.children[1].getComponent(dragonBones.ArmatureDisplay).playAnimation(`ttr_4`, 1);
            }
            if (this.player.children[2].active) {
                this.player.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation(`kbqn_4`, 1);
            }
        }
        this.scheduleOnce(()=>{
           this.lostpanel.active=true;
           // this.bgNode.getChildByName(`lostPanel`).getChildByName(`nod`).scale=0;
           // cc.tween(this.bgNode.getChildByName(`lostPanel`).getChildByName(`nod`)).to(0.5,{scale:1}).start();
        },0.5)
            
        
        this.addOneTimeListener(this.player.getComponent(dragonBones.ArmatureDisplay),()=>{
         
        })
    }
    clickEvent(even: cc.Event.EventTouch)
    {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "blxx":
              this.lostpanel.active=false;
                this.node.getChildByName(`jsPanel`).active=true;
                this.node.getChildByName(`jsPanel`).getChildByName(`overnode`).scale=0;
                if(!cc.sys.localStorage.getItem("lv207totalNum"))
                {
                    cc.sys.localStorage.setItem("lv207totalNum",this.totalNodeNum-1);
                }else if(cc.sys.localStorage.getItem("lv207totalNum")<this.totalNodeNum-1)
                {
                    cc.sys.localStorage.setItem("lv207totalNum",this.totalNodeNum-1);
                }
                this.node.getChildByName(`jsPanel`).getChildByName(`overnode`).getChildByName(`topheight`).getComponent(cc.Label).string=`${cc.sys.localStorage.getItem("lv207totalNum")}`;
                this.node.getChildByName(`jsPanel`).getChildByName(`overnode`).getChildByName(`toprank`).getComponent(cc.Label).string=`${cc.sys.localStorage.getItem("lv207totalRank")}`;
                cc.tween(this.node.getChildByName(`jsPanel`).getChildByName(`overnode`)).to(0.5,{scale:1}).start();
            break;
            case `overnode`:
                this.node.getChildByName(`jsPanel`).getChildByName(`overnode`).active=false;
                this.onwin();
                break;
            case "ljfh":
                VideoManager.getInstance().showVideo(()=>{
                   this.curNewNode.x=0;
                   this.player.x=0;
                   this.player.y=this.curNewNode.y+151;
                    this.player.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`tiao`, 0);
                    if (this.player.children[1].active) {
                        this.player.children[1].getComponent(dragonBones.ArmatureDisplay).playAnimation(`ttr`, 1);
                    }
                    if (this.player.children[2].active) {
                    this.player.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation(`kbqn`, 1);
                    }
                   this.player.getComponent(player_lv207).curY=this.player.y;
                   this.successEvent(true);
                   this.lostpanel.active=false;
                });
            break;
        }
    }
    successEvent(isperfect=false)
    {
        if(isperfect)
        {
            this.showAndDestoryPre(1);
            this.curRank+=50;
            AudioManager.playEffect(`完美`);
        }else
        {
            this.showAndDestoryPre(2);
            this.curRank+=20;
            AudioManager.playEffect(`危险`);
            this.player.getComponent(dragonBones.ArmatureDisplay).playAnimation(`tiao_2`,1);
            if (this.player.children[1].active) {
                this.player.children[1].getComponent(dragonBones.ArmatureDisplay).playAnimation(`ttr_2`, 1);
            }
            if (this.player.children[2].active) {
                this.player.children[2].getComponent(dragonBones.ArmatureDisplay).playAnimation(`kbqn_2`, 1);
            }
            this.addOneTimeListener(this.player.getComponent(dragonBones.ArmatureDisplay),()=>{
                this.player.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame('tiao', 0);
            })
        }
        this.bgNode.getChildByName(`fsk`).getChildByName(`currank`).getComponent(cc.Label).string=this.curRank;
        if(this.curRank>this.totalRank)
        {
            this.totalRank=this.curRank;
            this.bgNode.getChildByName(`fsk`).getChildByName(`toprank`).getComponent(cc.Label).string=this.totalRank;
            cc.sys.localStorage.setItem("lv207totalRank",this.totalRank);
        }
         if(this.bgNode.getChildByName(`fd`).active)
        {
            if(this.bgNode.getChildByName(`fd`).y<=330)
                {
                    //触发彩蛋
                    AudioManager.playEffect(`庆祝`);
                    this.bgNode.getChildByName(`fd`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`fd`,1);
                    this.addOneTimeListener( this.bgNode.getChildByName(`fd`).getComponent(dragonBones.ArmatureDisplay),()=>{
                        if(!this.player.children[1].active)
                        {
                            this.player.children[1].active=true;
                            this.player.children[1].getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`ttr`, 0);
                        }else if(!this.player.children[2].active)
                        {
                            this.player.children[2].active=true;
                            this.player.children[2].getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`kbqn`, 0);
                        }
                        this.bgNode.getChildByName(`fd`).active=false;
                    })
                }else
                {
                    cc.tween(this.bgNode.getChildByName(`fd`)).delay(0.6).to(0.3,{y:this.bgNode.getChildByName(`fd`).y-151}).call(()=>{}).start();
                }
            
        }
        else if((this.totalNodeNum%50)-45==0&&(!this.player.children[1].active||!this.player.children[2].active))//
        {
            this.bgNode.getChildByName(`fd`).active=true;
            this.bgNode.getChildByName(`fd`).y=900+150;
           
            this.bgNode.getChildByName(`fd`).getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`fd`, 0);
        }
    }
    showAndDestoryPre(state:number)
    {
        let curStatPre=null;
        switch (state) {
            case 1:
                curStatPre=this.wmPre;
                this.wmCombo+=1;
            break;
            case 2:
                curStatPre=this.hxPre;
                this.wmCombo=0
            break;
            case 3:
                curStatPre=this.jlPre;
                this.wmCombo=0
            break;
        }
        if(state!=3)
        {
            this.bgNode.getChildByName(`rank`).getComponent(cc.Label).string=`${this.totalNodeNum}`;
        }
        if(state==1)
        {
            this.bgNode.getChildByName(`gx`).active=true;
            this.bgNode.getChildByName(`gx`).x=this.player.x;
            this.bgNode.getChildByName(`gx`).y=this.player.y;
            this.bgNode.getChildByName(`gx`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`gx`,1);
            this.addOneTimeListener( this.bgNode.getChildByName(`gx`).getComponent(dragonBones.ArmatureDisplay),()=>{
                this.bgNode.getChildByName(`gx`).active=false;
            });
        }
        let tempPre =cc.instantiate(curStatPre);
        if(this.wmCombo>1)
        {
            tempPre.children[0].active=true;
            tempPre.children[0].children[0].getComponent(cc.Label).string=`${this.wmCombo}`
        }
        this.bgNode.addChild(tempPre);
        tempPre.x=this.player.x+Math.random()>0.5?(50+Math.random()*100):-(50+Math.random()*100);
        tempPre.y=this.player.y+50+Math.random()*100;
        cc.tween(tempPre).to(0.6,{opacity:0}).call(()=>{
            tempPre.active=false;
            tempPre.destroy();
            this.canjiaohu=true;
            if(state==3)
            {
                if(this.curRank>this.totalRank)
                {
                    this.totalRank=this.curRank;
                    cc.sys.localStorage.setItem("lv207totalRank",this.totalRank);
                }
            }else
            {
              this.updateCerate();
            }
        }).start();
    }
    updateCerate()
    {
        
        if(this.totalNodeNum>3)
        {
            if(this.bgNode.getChildByName(`bj`).y>-1510)this.tweenNode151(this.bgNode.getChildByName(`bj`));
            this.tweenNode151(this.player);
            this.player.getComponent(player_lv207).curY-=151;
            for (let index = 2; index < this.bgNode.childrenCount-5; index++) {
                const element = this.bgNode.children[index];
                if(element.name==`qsh`)
                {
                    this.tweenNode151(element);
                }
            }
        }
        
       
        this.scheduleOnce(this.createPre,0.3);
    }
    tweenNode151(aNode:cc.Node)
    {
        cc.tween(aNode).to(0.3,{y:aNode.y-151}).start();
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
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    this.tipsPanel.active = true;
                   // this.showStepTipsLabel();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(()=>{
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
      
            
        }
    }
   
   
   
    gametolost()
    {
        // this.longnv_sk.playAnimation("longnvdaiji",-1);
        // this.showqp(this.longnv_sk.node, talk.好你个傲丙私通敌人他死定了, music.好你个傲丙私通敌人他死定了,()=>{
        //     this.longnv_sk.playAnimation("longnvgongji",1);
        //     AudioManager.playEffect(music.失败爪子声)
        //     this.addOneTimeListener(this.longnv_sk,()=>{
        //         this.onlost();
        //     })
        // })
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
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
        return
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

}

