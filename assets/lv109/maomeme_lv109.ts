import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class maomeme_lv109 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    canjiaohu=false;

    @property(cc.Node)
    rooms: cc.Node = null;
    selA;selB;selC;selD;lbnode;
    curlevel=1;
    realAnswer=[1,0,2,1,1,2,1,1,2,2]
    fenshu =0;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
       // AudioManager.playMusic(`lv108bgm`, true, 1);
       this.selA=this.node.getChildByName(`bg`).getChildByName(`meme_skea`).getComponent(dragonBones.ArmatureDisplay);
       this.selB=this.node.getChildByName(`bg`).getChildByName(`meme_skeb`).getComponent(dragonBones.ArmatureDisplay);
       this.selC=this.node.getChildByName(`bg`).getChildByName(`meme_skec`).getComponent(dragonBones.ArmatureDisplay);
       this.selD=this.node.getChildByName(`bg`).getChildByName(`meme_sked`).getComponent(dragonBones.ArmatureDisplay);
       this.lbnode=this.getbodys(this.node.getChildByName(`bg`),`lb_ske`);
      this.updateroom();
    }
    updateroom()
    {
        cc.audioEngine.stopAll();
       this.unscheduleAllCallbacks();
       
        if(this.curlevel>10)
        {
            this.node.getChildByName(`bg`).getChildByName(`js`).active=true;
            this.node.getChildByName(`bg`).getChildByName(`js`).children[1].getComponent(cc.Label).string =`${this.fenshu}`;
            this.node.getChildByName(`bg`).getChildByName(`js`).children[1].scaleX=0;
            this.node.getChildByName(`bg`).getChildByName(`js`).children[1].scaleY=0;
            AudioManager.playEffect(`lv109_dafen`);
            cc.tween( this.node.getChildByName(`bg`).getChildByName(`js`).children[1]).to(1,{scaleX:1,scaleY:1}).start();
            return
        }
        this.rooms.getChildByName(`${this.curlevel}`).active=true;
        if(this.curlevel>8)
        {
            this.selA.node.children[0].active=true;
            this.selB.node.children[0].active=true;
            this.selC.node.children[0].active=true;
        }
        if(this.curlevel<5||this.curlevel>7)
        {
            this.selA.node.active=true;
            this.selB.node.active=true;
            this.selC.node.active=true;
            this.selD.node.active=false;
            for (let index = 0; index < this.lbnode.length; index++) {
                const element = this.lbnode[index];
                element.active=false;
            }
            this.selA.playAnimation(`${this.curlevel}A`,0);
            this.selB.playAnimation(`${this.curlevel}B`,0);
            this.selC.playAnimation(`${this.curlevel}C`,0);
        }else
        {
            this.selA.node.active=false;
            this.selB.node.active=false;
            this.selC.node.active=false;
            this.selD.node.active=true;
            for (let index = 0; index < this.lbnode.length; index++) {
                const element = this.lbnode[index];
                element.active=true;
                element.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`newAnimation`,0);
            }
            this.selD.playAnimation(`${this.curlevel}A`,0);
            this.scheduleOnce(()=>{
                this.lbnode[0].getComponent(dragonBones.ArmatureDisplay).playAnimation(`newAnimation`,0);
                this.scheduleOnce(()=>{
                    this.lbnode[0].getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`newAnimation`,0);
                    this.lbnode[1].getComponent(dragonBones.ArmatureDisplay).playAnimation(`newAnimation`,0);
                    this.scheduleOnce(()=>{
                        this.lbnode[1].getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`newAnimation`,0);
                        this.lbnode[2].getComponent(dragonBones.ArmatureDisplay).playAnimation(`newAnimation`,0);
                        this.scheduleOnce(()=>{
                            this.lbnode[2].getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`newAnimation`,0);
                        },2.5)
                    },2.5)
                },2.5)
            },3.5)
        }
        AudioManager.playEffect(`lv109_${this.curlevel}`,null,()=>{
            this.canjiaohu=true;
        });
       
    }
    checkIsTrue(answer:string)
    {
        var curanswer;
        switch (answer) {
            case "btn_a":
                curanswer=0
                break;
            case "btn_b":
                curanswer=1
                break;
            case "btn_c":
                curanswer=2
                break;
        }
        if(curanswer==this.realAnswer[this.curlevel-1])
        {
            //正确
            this.fenshu+=10;
            this.gou.cleanup();
            cc.tween(this.gou)
                .to(0.6, { scaleX: 1, scaleY: 1 })
                .delay(0.6)
                .call(()=>{this.gou.scaleX=0;this.gou.scaleY=0; this.curlevel++;this.scheduleOnce(()=>{
                    this.updateroom()
                },1);})
                .start()
            this.scheduleOnce(() => {
                AudioManager.playEffect("finishjq");
            }, 0.3)

        }else
        {
            //错误
            this.cha.cleanup();
            cc.tween(this.cha)
                .to(0.6, { scaleX: 1, scaleY: 1 })
                .delay(0.6)
                .call(()=>{
                    this.cha.scaleX=0;
                    this.cha.scaleY=0;
                this.curlevel++;
                this.scheduleOnce(()=>{
                    this.updateroom()
                },1);
                })
                .start()
            this.scheduleOnce(() => {
                AudioManager.playEffect("com_cuo");
            }, 0.3)

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
                var handlers = () => {
                  //  this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    this.tipsPanel.active = true;
                    this.tipsPanel.getChildByName(`tishi`).children[1].getComponent(cc.Label).string=
                    `选择${
                       this.realAnswer[this.curlevel-1]==0?`A`:this.realAnswer[this.curlevel-1]==1?`B`:`C`
                    }选项`;

                    
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(()=>{
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
            case "btn_a":
            case "btn_b":
            case "btn_c":
                if(!this.canjiaohu)return;
                this.canjiaohu=false;
                this.checkIsTrue(even.currentTarget.name);
                this.gou.x=even.currentTarget.x;
                this.gou.y=even.currentTarget.y;
                this.cha.x=even.currentTarget.x;
                this.cha.y=even.currentTarget.y;
                this.selA.node.children[0].active=false;
                this.selB.node.children[0].active=false;
                this.selC.node.children[0].active=false;
                break;
            case `btn_win`:
                this.endwin("prefabs/zc/zc_winend");
                GameData.PauseGame = false;
                break;
      
        }
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

}

