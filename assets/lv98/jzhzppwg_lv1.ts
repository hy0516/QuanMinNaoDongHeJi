

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import tipsPanel from "../script/zc/tipsPanel";;
import zc_config from "../script/zc/zc_config";
import jzhzppwg_lv1_move from "./jzhzppwg_lv1_move";
import jzhzppwg_lv1_role from "./jzhzppwg_lv1_role";






const { ccclass, property } = cc._decorator;
    enum music
    {
        打勾="打勾",
        gou = "finishjq",
        关卡背景lv98="关卡背景lv98",
    }

@ccclass
export default class jzhzppwg_lv1 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;


    @property(cc.Node)
    addtimetips: cc.Node = null;


    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    icon: cc.Node = null;
    @property(cc.Node)
    clicklist: cc.Node = null;
    @property(cc.Node)
    moveMap: cc.Node = null;
    @property(cc.Node)
    allrole: cc.Node = null;
    @property(cc.Node)
    huasknode: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    gou2: cc.Node = null;
    public startTime = 360;
    public curTime = 0;

    tiezhinum = 0;
   talkthing=[
    `一切都是为了阐教霸业永恒`,
    `非我族类，其心必异`,
    `若前方无路，我就踏出一条路`,
    `我儿若死了，全陈塘关都得陪葬`,
    `铜镜铜镜告诉我，谁是方圆十里最美的女人`,
    `有兴趣做个交易吗？大哥~`,
    `你打我噻，你打我噻`,
    `我命由我不由天`,
    `人心中的成见，是一座大山`,
    `清修之地，禁止喧哗`,
    `瞧不起老娘啊？我也堂堂武将`,
    `你是谁只有你自己说了才算`,
   ]
   nodemusic=[
    `克拉克`,
    `布莱克`,
    `奥伦`,
    `瑞迪`,
    `莱姆`,
    `平基`,
    `西蒙`,
    `布鲁德`,
    `小天`,
    `加诺德`,
    `维尼里亚`,
    `格雷`
   ]

   iscanmove=false;//是否可以移动
   health=5;//健康次数
   rightnum=0;//完成计数
   rightnummax=12;


    
    onLoad() {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic(music.关卡背景lv98, true, 0.45);
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
        this.iscanmove=true;
        // this.updateGameNum(0);
        // for (let i = 0; i < this.icon.childrenCount; i++) {
        //     var item = this.icon.children[i];
        //     var scr: move_tiezhi = item.addComponent(move_tiezhi);
        //     scr.target = this.clicklist.children[i];
        //     scr.main = this.node;
        //     console.log(item.name)
        // }
        // for (let a = 0; a < this.icon.children[0].children[0].childrenCount; a++) {
        //     this.icon.children[0].children[0].children[a].zIndex = 50;
        // }
        
     
    }
   // 封装交换方法
   swapNodesPosition(nodeA: cc.Node, nodeB: cc.Node) {
    
    const apar=nodeA.parent;
    const bpar=nodeB.parent;
    nodeA.parent=bpar;
    nodeA.getComponent(jzhzppwg_lv1_move).originalParent= nodeA.parent;
    nodeB.parent=apar;
    nodeB.getComponent(jzhzppwg_lv1_move).originalParent= nodeB.parent;
    nodeA.x=0;
    nodeA.y=0;
    nodeB.x=0;
    nodeB.y=0;
    this.checkisright(nodeA,nodeB);

    }
    checkisright(nodeA: cc.Node, nodeB: cc.Node)
    {
        var a=false;
        var b=false;
       //  console.log(nodeA.parent);
        // console.log(nodeA.parent.parent);
        // console.log(nodeB.parent);
        // console.log(nodeB.parent.parent);
        
        if(nodeA.parent.parent===nodeA.getComponent(jzhzppwg_lv1_move).target)
        {
            a=true;
            nodeA.getComponent(jzhzppwg_lv1_move).ondele();
            nodeA.parent.parent.getChildByName(`dui`).active=true;
            this.rightnum++;
        }else
        {
           
        }
        if(nodeB.parent.parent===nodeB.getComponent(jzhzppwg_lv1_move).target)
        {
            b=true;
            nodeB.getComponent(jzhzppwg_lv1_move).ondele();
            nodeB.parent.parent.getChildByName(`dui`).active=true;
            this.rightnum++;
        }
        else
        {
           
        }
        if(!a&&!b)
        {
            //失败提示
            AudioManager.playEffect("错误");
            this.health--;
            this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.health;
            if(this.health<=0)
            {
                
                this.onlost();
            }
            else
            {
                this.gou2.scaleX = 2;
                this.gou2.scaleY = 2;
                this.iscanmove=true;
                this.scheduleOnce(()=>{
                    this.gou2.scaleX = 0;
                    this.gou2.scaleY = 0;
                },2)
               
            }
            

        }else
        {
            AudioManager.playEffect(music.gou)
            if(a&&b)
            {
                this.hideandplaysk(nodeB.parent.parent)
                nodeA.parent.parent.children[0].active=false;
                nodeA.parent.parent.children[1].active=false;
                nodeA.parent.parent.getChildByName(`mask2`).active=true
                nodeA.parent.parent.getChildByName(`mask2`).getChildByName(`jiezouhezi_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`${Number(nodeA.parent.parent.name)+1}`,0);
            }
            else if(b)
            {

                //this.talkdiplay(nodeB.parent.parent.name,this.talkthing[nodeB.parent.parent.name])
                this.hideandplaysk(nodeB.parent.parent)
            }else if(a)
            {
                this.hideandplaysk(nodeA.parent.parent)
                //this.talkdiplay(nodeA.parent.parent.name,this.talkthing[nodeA.parent.parent.name])
            }
        }
    }
    hideandplaysk(playnode:cc.Node)
    {
        var issay=false;
       
        playnode.children[0].active=false;
        playnode.children[1].active=false;
        playnode.getChildByName(`mask2`).active=true
        playnode.getChildByName(`mask2`).getChildByName(`jiezouhezi_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`${Number(playnode.name)+1}`,0);
        AudioManager.playEffect(this.nodemusic[Number(playnode.name)],false,()=>{    })
        this.iscanmove=true;
        issay=true;
            if(this.rightnum==this.rightnummax)
            {
                this.onwin();
            }else 
            {
                
            }
        // this.scheduleOnce(()=>
        // {
            
        // },2)


    }
    talkdiplay(talkaudio:string,talkthing:string)
    {
        var issay=false;
        var istalk=false;
        AudioManager.playEffect(talkaudio,false,()=>{
            issay=true;
            if(this.rightnum==this.rightnummax)
            {
                this.onwin();
            }else if(istalk)
            {
                this.iscanmove=true;
            }
        })
        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string =talkthing;
        talk.opacity = 255;
        cc.tween(talk).delay(2).to(0.5, { opacity: 0 }).call(()=>{
            istalk=true;
            if(issay)this.iscanmove=true;
        }).start();
    }
 


    originalPositions: cc.Vec3[] = [];
    curroleindex=0;
    currole:cc.Node;
    iscansel=false;
    islost=false;
   
    // onwin() {
       
    //         GameData.PauseGame = true;
    //         this.node.cleanup();
    //         this.scheduleOnce(() => {
    //             AudioManager.stopEffect()
    //             // AudioManager.playEffect(AudioManager.audioName.end);
    //             this.loadend();
    //             this.node.destroy();
    //         }, 2.5);
        
    // }
    onwin() {
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(() => {
                // fun()
                this.node.cleanup();
                this.node.destroy();
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
             
            })
            .start()
            this.scheduleOnce(()=>{
                AudioManager.playEffect(music.打勾)
            },0.9)
          
    }
    
    onlost() {
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
        AudioManager.playEffect(AudioManager.common.BUTTON);
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
                VideoManager.getInstance().showVideo(() => {
                    for (let index = 0; index < this.clicklist.childrenCount; index++) {
                        const element = this.clicklist.children[index];
                        if(element.getChildByName(`dui`).active)continue;
                        else
                        {
                            element.getChildByName(`quan`).active=true;
                            element.getComponent(jzhzppwg_lv1_role).target.parent.parent.getChildByName(`quan`).active=true;
                        }
                        break;
                    }
                })
            break;
            case "jiawuci":
                VideoManager.getInstance().showVideo(() => {
                    this.health += 5;
                    this.node.getChildByName("bg").getChildByName("jihui").getComponent(cc.Label).string = "剩余机会：" + this.health;
                })
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

    checkLost() {
        if (GameData.PauseGame) return
        // if (this.jihuiCount <= 0) {
        //     // this.unschedule(this.Timeing);
        //     GameData.PauseGame = true;
        //     // this.node.cleanup();
        //     // this.scheduleOnce(() => {
        //     //     this.endlost("prefabs/zc/zc_lostend")
        //     //     this.node.destroy();
        //     // }, 0.7);
        //     setTimeout(() => {
        //         this.endlost("prefabs/zc/endlostChance_zc");
        //     }, 600);
        // }
    }
   
    endAddTime() {
        // VideoManager.getInstance().showVideo(() => {
            this.startTime = 1;
            this.setTime(60);
        // })
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

