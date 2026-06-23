import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems256 from "./moveItems256";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv256 extends BaseGame {
    isshowVideo = false;
    canjiaohu = false;

    bg: cc.Node;
    jg = 230;
    lv = 0;
    chooseNub = 0;

    trueNub: string[] = ['0','1','3','2','1','2','0','0'];

    Btn_1: cc.Node;
    Btn_2: cc.Node;
    Btn_3: cc.Node;

    Label1
    Label2
    Label3

    bar: cc.Node;
    barLabel

    tips: cc.Node;
    tipsLabel

    flag1 = false;
    flag2 = false;

    labelStr1: string[][] = [
        ['0'],
        ['0','隔壁商店水枪买一送一','伤害别人会被抓起来哦','厕所那边能装水'],
        ['0','泳池穿西装不让进','泳池里的水不干净','有泳装美女想加你联系方式'],
        ['0','游泳会掉肌肉','游泳池里人多得像下饺子一样','隔壁健身房促销健身卡5折'],
        ['0','听说这家泳池里有蟑螂','碰到水，妆会花掉','里面光线不好'],
        ['0','里面的瓶子都被捡光了','进去要买门票的','我这有瓶子'],
        ['0','这里的水不干净','敷个冰贴','美人鱼影片上映了'],
        ['0','那给我张优惠卷吧','我要热融化了','叫你们经理过来'],
    ];
    labelStr2: string[][] = [
        ['0'],
        ['0','我得再买一把，双枪威力更强','不就是个水枪嘛，你吓唬小孩呢','泳池的水更多，你当我傻啊'],
        ['0','我不能脱掉吗？','我看这水很清啊，不要想骗我','人在哪呢，哥哥这就来'],
        ['0','随便掉，我肌肉多的是','那算了，我找个人少的泳池去','廉价健身房我才不去'],
        ['0','蟑螂！我最怕蟑螂了！','我的妆是防水的要不要给你安利一下','没事，我修图贼溜'],
        ['0','别想骗我，我要亲自进去看','什么！要门票那我不亏本吗？','你那几个瓶子能干嘛'],
        ['0','连下水道我都住过，这算啥','我可不敢用那些科技与狠活','补完水后去看，也不晚'],
        ['0','优惠卷也发完了','十分抱歉，今天太火爆了','叫谁过来你都进不去'],
    ];

    labelStr3: string[] = ['0','我要把水枪灌满水向你们所有人发起攻击','最近太油了，得去好好洗个澡','今天去游个泳，减减脂',
        '今天美美哒，肯定能咔咔咔拍一堆超好看的照片！','这里面肯定有不少瓶罐可以捡','天气燥热，我得进去补充些水分','非常抱歉，目前门票已经售完了'];

    p_ske: cc.Node;
    r1_ske: cc.Node;
    r2_ske: cc.Node;
    r3_ske: cc.Node;
    r4_ske: cc.Node;
    r5_ske: cc.Node;
    r6_ske: cc.Node;
    r7_ske: cc.Node;

    psk: dragonBones.ArmatureDisplay;
    r1sk: dragonBones.ArmatureDisplay;
    r2sk: dragonBones.ArmatureDisplay;
    r3sk: dragonBones.ArmatureDisplay;
    r4sk: dragonBones.ArmatureDisplay;
    r5sk: dragonBones.ArmatureDisplay;
    r6sk: dragonBones.ArmatureDisplay;
    r7sk: dragonBones.ArmatureDisplay;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`bgmlv256`);
        
        this.Btn_1 = this.node.getChildByName('Btn_layout').getChildByName('Btn_1');
        this.Btn_2 = this.node.getChildByName('Btn_layout').getChildByName('Btn_2');
        this.Btn_3 = this.node.getChildByName('Btn_layout').getChildByName('Btn_3');

        this.Label1 = this.Btn_1.getChildByName('label1').getComponent(cc.Label);
        this.Label2 = this.Btn_2.getChildByName('label2').getComponent(cc.Label);
        this.Label3 = this.Btn_3.getChildByName('label3').getComponent(cc.Label);

        this.bar = this.node.getChildByName('Bar');
        this.barLabel = this.bar.getChildByName('label').getComponent(cc.Label);

        this.tips = this.node.getChildByName(`tipsPanel`);
        this.tipsLabel = this.tips.getChildByName(`Label`).getComponent(cc.Label);
        
        this.bg = this.node.getChildByName('bg');
        for(let i=1;i<=7;i++){
            this['r'+i+'_ske'] = this.bg.getChildByName('r'+i+'_ske');
        }
        for(let i=1;i<=7;i++){
            this['r'+i+'sk'] = this['r'+i+'_ske'].getComponent(dragonBones.ArmatureDisplay);
        }
        this.p_ske = this.bg.getChildByName('p_ske');
        this.psk = this.p_ske.getComponent(dragonBones.ArmatureDisplay);

        this.moveNode(this.bg, cc.v3(this.bg.x-6*this.jg, this.bg.y, 0), 4, 0, () => {
            this.game();
        })
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    private moveNode(node: cc.Node, targetPos: cc.Vec3, duration: number, delay = 0, onComplete?: () => void) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .delay(delay)
            .to(duration, { position: targetPos }, { easing: 'smooth' })
            .call(() => onComplete && onComplete())
            .start();
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
            .to(0.5, { opacity: 0 })
            .call(() => {
               // if (this.istiaoguo) return
               this.canjiaohu=true;
                handler && handler();
            })
            .start()
    }

    panduan() {
        for(let i=1;i<=3;i++){
            this[`Btn_${i}`].active = false;
        }
        this.showqp(this.p_ske,`${this.labelStr1[this.lv][this.chooseNub]}`,`${this.labelStr1[this.lv][this.chooseNub]}`,(() => {
            const node = this[`r${this.lv}_ske`];
            if(this.chooseNub.toString() === this.trueNub[this.lv]){
                if(this.lv > 0 && this.lv < 3 ) {
                    AudioManager.playEffect(`心动声`);
                }
                this[`r${this.lv}sk`].playAnimation(`r${this.lv}_dui`,0);
                this.showqp(node,`${this.labelStr2[this.lv][this.chooseNub]}`,`${this.labelStr2[this.lv][this.chooseNub]}`,(() => {
                    AudioManager.playEffect(`NPC离开脚步`);
                    this.moveNode(node, cc.v3(2000, node.y, 0), 2, 0, () => {
                        this.game();
                    })
                }))
            } else {
                AudioManager.playEffect(`错误`);
                let tepan = `cuo`;
                if(this.lv === 6) {
                    tepan = `shuohua`;
                }
                this[`r${this.lv}sk`].playAnimation(`r${this.lv}_${tepan}`,0);
                this.showqp(node,`${this.labelStr2[this.lv][this.chooseNub]}`,`${this.labelStr2[this.lv][this.chooseNub]}`,(() => {
                    this.showqp(this.p_ske,`太热了，我快顶不住了`,`太热了，我快顶不住了`,(() => {
                        this.penhuolost();
                    }))
                }))
            }
        }))
    }

    Bar() {
        this.bar.getComponent(cc.ProgressBar).progress = this.lv/7;
        this.barLabel.string = `${this.lv}/7`;
    }

    game() {
        let time = 1;
        this.lv++;
        this.Bar();
        if(this.lv === 6) {
            this.flag1 = true;
        }
        if(this.lv === 7) {
            this.flag2 = true;
        }
        if(this.lv !== 1) {
            AudioManager.playEffect(`主角脚步`);
            this.moveNode(this.p_ske, cc.v3(this.p_ske.x-this.jg, this.p_ske.y, 0),1);
            this.moveNode(this.bg, cc.v3(this.bg.x+this.jg, this.bg.y, 0), 1, 0, () => {
                time = 2;
            })
        }
        const next = () => {
            this[`r${this.lv}_ske`].scaleX = 0.8;
            this[`r${this.lv}sk`].playAnimation(`r${this.lv}_shuohua`,0);
            this.showqp(this[`r${this.lv}_ske`],`${this.labelStr3[this.lv]}`,`${this.labelStr3[this.lv]}`,() =>{
                this[`r${this.lv}sk`].playAnimation(`r${this.lv}_dj`,0);
                for(let i=1;i<=3;i++){
                    this[`Btn_${i}`].active = true;
                    this[`Label${i}`].string = this.labelStr1[this.lv][i];
                    console.log(this[`Label${i}`].string);
                }
            })
        }
        this.scheduleOnce(() => {
            if(this.lv !== 1) {
                next();
            } else {
                this.showqp(this.p_ske,`热得受不了了，我得马上跳进泳池里泡一泡！`,`热得受不了了，我得马上跳进泳池里泡一泡！`,(() => {
                    next();
                }));
            }
        }, time);
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch) {
        if (!this.canjiaohu) {
            const dragComponent = even.currentTarget.getComponent(moveItems256);
            dragComponent && dragComponent.restart();
            return;
        }
        this.canjiaohu = false;
        const colls = this.node.getChildByName(`bg`).getChildByName(`checknodes`);
        const synodeTarget = colls.getChildByName(`synode`);
        const pnodeTarget = colls.getChildByName(`pnode`);
        const hynodeTarget = colls.getChildByName(`hynode`);
        const itemNode = even.currentTarget;
        if(synodeTarget && synodeTarget.active && type == 1 && this.flag1) {
            const isCollide = cc.Intersection.rectRect(
                synodeTarget.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                for(let i=1;i<=3;i++){
                    this[`Btn_${i}`].active = false;
                }
                itemNode.active = false;
                this.r6sk.playAnimation(`r6_dui`,0);
                this.showqp(this.r6_ske,`我来这里干啥，忘了，回去躺着吧`,`我来这里干啥，忘了，回去躺着吧`,(() => {
                    this.r6_ske.scaleX = -0.8;
                    this.moveNode(this.r6_ske, cc.v3(-2000, this.r6_ske.y, 0), 2, 0, () => {
                        AudioManager.playEffect(`NPC离开脚步`);
                        this.game();
                        this.canjiaohu = true;
                    })
                }))
                return;
            }
        } else if(pnodeTarget && pnodeTarget.active && type == 2 && this.flag2) {
            const isCollide = cc.Intersection.rectRect(
                pnodeTarget.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                itemNode.active = false;
                this.node.getChildByName(`bg`).getChildByName(`hezi`).active = true;
                this.psk.playAnimation(`zj2_dj`,0);
                this.node.getChildByName(`bg`).getChildByName(`hezi`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`hezi`,1);
                this.scheduleOnce(() => {
                    this.node.getChildByName(`bg`).getChildByName(`card`).active = true;
                        AudioManager.playEffect(`vip卡出现`);
                        this.canjiaohu = true;
                }, 1);
                return;
            }
        } else if(hynodeTarget && hynodeTarget.active && type == 3) {
            const isCollide = cc.Intersection.rectRect(
                hynodeTarget.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                for(let i=1;i<=3;i++){
                    this[`Btn_${i}`].active = false;
                }
                itemNode.active = false;
                this.node.getChildByName(`bg`).getChildByName(`hezi`).active = false;
                this.showqp(this.r7_ske,`哇塞，原来是至尊 VIP，您快请进`,`哇塞，原来是至尊 VIP，您快请进`,(() => {
                    this.blink();
                    this.scheduleOnce(() => {
                        this.node.getChildByName(`bg2`).active = true;
                        this.scheduleOnce(() => {
                            this.showqp(this.node.getChildByName(`bg2`).getChildByName(`cg_ske`),`总算凉快下来了`,`总算凉快下来了`,(() => {
                                AudioManager.playEffect(`胜利笑声`);
                                this.onwin();
                            }))
                        }, 2);
                    }, 0.5);
                }))
            }
        }
        if (itemNode.active) {
            this.canjiaohu = true;
            const dragComponent = itemNode.getComponent(moveItems256);
            dragComponent && dragComponent.restart();
        }
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                this.showTips();
                break;
            case "Btn_1":
                this.chooseNub = 1;
                this.panduan();
                break;
            case "Btn_2":
                this.chooseNub = 2;
                this.panduan();
                break;
            case "Btn_3":
                this.chooseNub = 3;
                this.panduan();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(()=>{
                this.showTips();
                });
                break;
            case "X":
                (even.currentTarget as cc.Node).parent.active = false;
                break;
        }
    }

    blink() {
        let blackNode = this.node.getChildByName("black");
        
        blackNode.active = true;
        blackNode.opacity = 0;
        
    cc.tween(blackNode)
        // 缓慢过渡到完全黑色，这里使用2秒作为示例，可根据需要调整时长
        .to(0.5, {opacity: 255})
        .delay(1)
        .to(0.5, {opacity: 0})
        .start();
    }

    penhuolost() {
        AudioManager.playEffect(`喷火`);
        this.psk.playAnimation(`zj_cuo`,0);
        this.scheduleOnce(() => {
            this.node.getChildByName(`huo_ske`).active = true;
            this.scheduleOnce(() => {
                this.onlost();
            }, 2);
        }, 2);
    }
    showTips() {
        this.tips.active = true;
        switch (this.lv) {
            case 1:
                this.tipsLabel.string = `隔壁商店水枪买一送一`
                break;
            case 2:
                this.tipsLabel.string = `后面有泳装美女想加你联系方式`
                break;
            case 3:
                this.tipsLabel.string = `这个游泳池里人多得像下饺子一样`
                break;
            case 4:
                this.tipsLabel.string = `听说这家泳池里有蟑螂`
                break;
            case 5:
                this.tipsLabel.string = `进去要买门票的`
                break;
            case 6:
                this.tipsLabel.string = `拖动墙上的闹钟到鱼人身上`
                break;
            case 7:
                this.tipsLabel.string = `拖动桌子上的手机到女生身上，拖动箱子里的贵宾卡到店员身上`
                break;
        }
    }

    fanhui() {
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 2);
    }

    onlost() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }
}
    