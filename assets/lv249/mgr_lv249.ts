import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems249 from "./moveItems249";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv249 extends BaseGame {

    lab_pb: cc.Node;
    PB: cc.Node;

    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;

    isshowVideo = false;
    canjiaohu = false;

    name1:string = `sdnr_ske`;
    name2:string = `sqn_ske`;
    name3:string = `hs_ske`;
    name4:string = `ttn_ske`;
    name5:string = `xn_ske`;
    name6:string = `smtn_ske`;

    lostNum = 0;

    flag1:boolean[] = [false, false, false, false, false, false, false];
    flag2:boolean[] = [false, false, false, false, false, false, false];

    tf_ske
    ds_ske
    qjg_ske
    sdrr_ske
    smt_ske
    syn_ske
    yyx_ske

    tfsk
    dssk
    qjgsk
    sdrrsk
    smtsk
    synsk
    yyxsk

    onLoad() {
        GameData.startTime = 200;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)

        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`bgmlv249`);
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");

        this.tf_ske = this.node.getChildByName(`bg`).getChildByName(`tf_ske`);
        this.ds_ske = this.node.getChildByName(`bg`).getChildByName(`ds_ske`);
        this.qjg_ske = this.node.getChildByName(`bg`).getChildByName(`qjg_ske`);
        this.sdrr_ske = this.node.getChildByName(`bg`).getChildByName(`sdrr_ske`);
        this.smt_ske = this.node.getChildByName(`bg`).getChildByName(`smt_ske`);
        this.syn_ske = this.node.getChildByName(`bg`).getChildByName(`syn_ske`);
        this.yyx_ske = this.node.getChildByName(`bg`).getChildByName(`yyx_ske`);

        this.tfsk = this.tf_ske.getComponent(dragonBones.ArmatureDisplay);
        this.dssk = this.ds_ske.getComponent(dragonBones.ArmatureDisplay);
        this.qjgsk = this.qjg_ske.getComponent(dragonBones.ArmatureDisplay);
        this.sdrrsk = this.sdrr_ske.getComponent(dragonBones.ArmatureDisplay);
        this.smtsk = this.smt_ske.getComponent(dragonBones.ArmatureDisplay);
        this.synsk = this.syn_ske.getComponent(dragonBones.ArmatureDisplay);
        this.yyxsk = this.yyx_ske.getComponent(dragonBones.ArmatureDisplay);
        
        this.scheduleOnce(() => {
            this.tfsk.playAnimation(`daiji1`, 0);
            this.dssk.playAnimation(`daiji1`, 0);
            this.qjgsk.playAnimation(`daiji1`, 0);
            this.sdrrsk.playAnimation(`daiji1`, 0);
            this.smtsk.playAnimation(`daiji1`, 0);
            this.synsk.playAnimation(`daiji1`, 0);
        }, 0.3);
        
        this.changeSKSlotIndex(this.node.getChildByName(`bg`).getChildByName(`3`).getChildByName(`hs_ske`).getComponent(dragonBones.ArmatureDisplay), 'shabu1', -1);
        this.pangbai("各位准备好了吗？各就各位，开机前我们合个影！");
        AudioManager.playEffect(`各位准备好了吗？各就各位，开机前我们合个影！`, false);
        this.scheduleOnce(() => {
            this.canjiaohu = true;
        }, 4)
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    pangbai(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(3.5)
            .to(0.3, { opacity: 0 })
            .call(() => {
            })
            .start()
    }

    //如果发现是错误的那就给错误次数加1
    changeLost() {
        this.lostNum++;
        this.node.getChildByName(`lab_lv`).getComponent(cc.Label).string ="当前错误次数:" + `${this.lostNum}` + "/5";
        if(this.lostNum >= 5) {
            this.onlost();
        }
    }

    //显示完成的字体
    xianshi(nb: number) {
        const targetNode = this.node.getChildByName(`bg`).getChildByName(`xianshi${nb}`);
        
        targetNode.active = true;
        targetNode.opacity = 0;
        
        cc.tween(targetNode)
            .to(0.5, { opacity: 255 })
            .start();
    }
    //判断这节点是否和目标节点匹配
    //直接用type和父节点的名字对比
    check(node: cc.Node, callback: () => void) {

        //如果是4-6说明是应该播放坐下的画面，如果是1-3说明是应该播放站起的画面
        //因为type1-3的daiji1是站起的，type4-6的则相反，所以需要判断包裹判断= =
        let animationName:string = ``;
        if(node.parent.name === `4` || node.parent.name === `5` || node.parent.name === `6`) {
            if(node.getComponent(`moveItems249`).type === 4 || node.getComponent(`moveItems249`).type === 5 || node.getComponent(`moveItems249`).type === 6) {
                animationName = `daiji2`;
            } else {
                animationName = `daiji1`;
            }
        } else {
            if(node.getComponent(`moveItems249`).type === 1 || node.getComponent(`moveItems249`).type === 2 || node.getComponent(`moveItems249`).type === 3) {
                animationName = `daiji2`;
            } else {
                animationName = `daiji1`;
            }
        }

        node.getComponent(dragonBones.ArmatureDisplay).playAnimation(animationName, 0);

        if(node.getComponent(`moveItems249`).type === 1) {
            if(animationName === `daiji1`) {
                this.changeSKSlotIndex(node.getComponent(dragonBones.ArmatureDisplay), 'shabu2', -1);
            } else {
                this.changeSKSlotIndex(node.getComponent(dragonBones.ArmatureDisplay), 'shabu1', -1);
            }
        }

        if(node.getComponent(`moveItems249`).type === 2) {
            if(animationName === `daiji2`) {
                node.getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji4`, 0);
            }
        }

        if(node.getComponent(`moveItems249`).type === 4) {
            if(animationName === `daiji2`) {
                this.changeSKSlotIndex(node.getComponent(dragonBones.ArmatureDisplay), 'biaoqing', -1);
            }
        }

        if(node.parent.name === node.getComponent(`moveItems249`).type.toString()){
            switch(node.parent.name) {
                case `1`:
                    this.flag1[1] = true;
                    break;
                case `2`:
                    this.flag1[2] = true;
                    break;
                case `3`:
                    this.flag1[3] = true;
                    break;
                case `4`:
                    this.pangbai(`这是约翰尼`);
                    AudioManager.playEffect(`这是约翰尼`, false);
                    this.flag1[4] = true;
                    break;
                case `5`:
                    this.flag1[5] = true;
                    this.smtsk.playAnimation(`daiji2`, 0);
                    node.getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji4`, 0);
                    node.removeComponent(moveItems249);
                    this.pangbai(`好久不见，大家最近都好吗`);
                    AudioManager.playEffect(`好久不见，大家最近都好吗`, false);
                    this.scheduleOnce(() => {
                        this.xianshi(5);
                        AudioManager.playEffect(`正确`, false);
                        this.flag2[5] = true;
                        this.checkWin();
                    }, 3)
                    break;
                case `6`:
                    this.flag1[6] = true;
                    break;
            }
        } else {
            this.flag1[node.getComponent(`moveItems249`).type] = false;
        }
        callback();
    }

    //itemNode是物品节点，nb要传入的位置
    changeNode(itemNode: cc.Node, targetIndex: number) {
        // 1. 获取目标容器（bg下的targetIndex节点）
        const tgtCont = this.node.getChildByName("bg").getChildByName(`${targetIndex}`);

        // 2. 获取目标容器当前子节点
        const tgtChild = tgtCont.getChildByName(this[`name${targetIndex}`]);

        // 3. 记录拖拽节点的原父节点和名称
        const origParent = itemNode.parent;
        const itemName = itemNode.name;

        // 4. 交换父节点并重置位置
        tgtChild.parent = origParent;
        tgtChild.position = cc.v3(0, 0, 0);

        itemNode.parent = tgtCont;
        itemNode.position = cc.v3(0, 0, 0);

        // //新娘的模组有点低，做个特判上一点，如果其他的物品也有问题在此处做特判:(
        // if(tgtChild.name === `xn_ske` && tgtChild.parent.name === `4` || tgtChild.parent.name === `5` || tgtChild.parent.name === `6`) {
        //     tgtChild.position = cc.v3(0, 70, 0);
        // }
        // if(tgtChild.name === `xn_ske` && tgtChild.parent.name === `4` || tgtChild.parent.name === `5` || tgtChild.parent.name === `6`) {
        //     tgtChild.position = cc.v3(0, 70, 0);
        // }

        // 5. 更新目标容器对应name变量
        this[`name${targetIndex}`] = itemName;

        // 6. 若原父节点是bg下的容器，同步更新其name变量
        const origParentName = origParent.name;
        const origIndex = parseInt(origParentName);
        if (!isNaN(origIndex) && origIndex >= 1 && origIndex <= 6) {
            this[`name${origIndex}`] = tgtChild.name;
        }

        //分别对两个已经放入的物品进行判断是否是正确的
        this.check(itemNode, () => {
            this.check(tgtChild, () => {
                if(itemNode.parent.name !== itemNode.getComponent(`moveItems249`).type.toString() && tgtChild.parent.name !== tgtChild.getComponent(`moveItems249`).type.toString()){
                    this.changeLost();
                    this.pangbai(`你的位置不在这`);
                    AudioManager.playEffect(`你的位置不在这`, false);
                    AudioManager.playEffect(`错误`, false);
                }
                return;
            });
        });

    }
    checkWin () {
        let isWin = true;
        for (let i = 1; i <= 6; i++) {
            if (!this.flag2[i]) {
                isWin = false;
                break;
            }
        }
        this.scheduleOnce(() => {
            if (isWin) {
                this.pangbai(`3 2 1 茄子`);
                AudioManager.playEffect(`3 2 1 茄子`, false);
                this.scheduleOnce(() => {
                    AudioManager.playEffect(`拍照声`, false);
                    this.node.getChildByName(`bg`).getChildByName(`bai`).active = true;
                    const bai = this.node.getChildByName(`bg`).getChildByName(`bai`);
                    cc.tween(bai)
                    .to(0.1, { opacity: 255 }) // 快速变亮（闪烁峰值）
                    .to(0.1, { opacity: 0 })   // 快速变暗
                    .call(() => {
                        bai.active = false; // 动画结束后隐藏，方便下次用
                    })
                    .start();
                    this.node.getChildByName(`bg`).getChildByName(`zhaopian`).active = true;
                    this.scheduleOnce(() => {
                        this.pangbai(`奇怪，照片里怎么连个人影都没有？`);
                        AudioManager.playEffect(`奇怪，照片里怎么连个人影都没有？`, false);
                        this.scheduleOnce(() => {
                            this.onwin();
                        }, 3);
                    }, 1);
                }, 3);
            }
        }, 2);
    }
    // 物品碰撞处理
    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch) {
        if (!this.canjiaohu) {
            const dragComponent = even.currentTarget.getComponent(moveItems249);
            dragComponent && dragComponent.restart();
            return;
        }
        this.canjiaohu = false;
        const colls = this.node.getChildByName(`bg`).getChildByName(`checknodes`);
        const itemNode = even.currentTarget;
        let nb = 0;
        let isCollided = false;
        const currParentName = itemNode.parent.name;
        const currParentIdx = parseInt(currParentName);

        const node11Target = colls.getChildByName(`11node`);
        const node21Target = colls.getChildByName(`21node`);

        const node12Target = colls.getChildByName(`12node`);

        const node13Target = colls.getChildByName(`13node`);

        const node14Target = colls.getChildByName(`14node`);

        const node16Target = colls.getChildByName(`16node`);

        if(type == 1 || type == 2 || type == 3 || type == 4 || type == 5 || type == 6) {
            for (let i = 1; i <= 6; i++) {
                if(this.flag2[i]) continue;
                const targetNode = colls.getChildByName(`${i}node`);
                if (targetNode && targetNode.active) {
                    // 检测当前目标节点与itemNode的碰撞
                    const collide = cc.Intersection.rectRect(
                        targetNode.getBoundingBoxToWorld(),
                        itemNode.getBoundingBoxToWorld()
                    );
                if (!isNaN(currParentIdx) && currParentIdx === i) continue;
                    if (collide) {
                        AudioManager.playEffect(AudioManager.common.BUTTON);
                        nb = i;
                        this.changeNode(itemNode ,nb);
                        isCollided = true;
                        break;
                    }
                }
            }
        }
        //护士
        else if(type == 11) {
            const isCollide = cc.Intersection.rectRect(
                node11Target.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                AudioManager.playEffect(`医药箱打开`, false);
                itemNode.active = false;
                this.yyxsk.playAnimation(`dakau`, 1);
                this.scheduleOnce(() => {
                    this.node.getChildByName(`bg`).getChildByName(`bd`).active = true;
                    this.canjiaohu = true;
                    return;
                }, 0.5);
            }
        }
        else if(type == 21 && this.flag1[1]) {
            const isCollide = cc.Intersection.rectRect(
                node21Target.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.flag2[1] = true;
                itemNode.active = false;
                this.node.getChildByName(`bg`).getChildByName(`1`).getChildByName(`hs_ske`).active = false;
                this.tfsk.playAnimation(`daiji2`, 0);
                this.pangbai(`绑上绷带，才来感觉`);
                AudioManager.playEffect(`绑上绷带，才来感觉`, false);
                this.scheduleOnce(() => {
                    this.scheduleOnce(() => {
                        this.xianshi(1);
                        AudioManager.playEffect(`正确`, false);
                        this.canjiaohu = true;
                        this.checkWin();
                        return;
                    }, 1);
                }, 3);
            }
        }
        else if(type == 12 && this.flag1[2]) {
            const isCollide = cc.Intersection.rectRect(
                node12Target.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                AudioManager.playEffect(`拖动桃木剑`, false);
                this.flag2[2] = true;
                itemNode.active = false;
                this.node.getChildByName(`bg`).getChildByName(`2`).getChildByName(`xn_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji2`, 0);
                this.node.getChildByName(`bg`).getChildByName(`2`).getChildByName(`xn_ske`).removeComponent(moveItems249);
                this.dssk.playAnimation(`daiji2`, 0);
                this.pangbai(`小妖，来助我提升修为`);
                AudioManager.playEffect(`小妖，来助我提升修为`, false);
                this.scheduleOnce(() => {
                    this.pangbai(`嘤~嘤~嘤`);
                    AudioManager.playEffect(`嘤~嘤~嘤`, false);
                    this.scheduleOnce(() => {
                        this.xianshi(2);
                        AudioManager.playEffect(`正确`, false);
                        this.canjiaohu = true;
                        this.checkWin();
                        return;
                    }, 1);
                }, 3);
            }
        }
        else if(type == 13 && this.flag1[3]) {
            const isCollide = cc.Intersection.rectRect(
                node13Target.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                this.flag2[3] = true;
                AudioManager.playEffect(`上滑男生头套`, false);
                itemNode.active = false;
                this.qjgsk.playAnimation(`daiji3`, 0);
                this.node.getChildByName(`bg`).getChildByName(`3`).getChildByName(`ttn_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji4`, 0);
                this.node.getChildByName(`bg`).getChildByName(`3`).getChildByName(`ttn_ske`).removeComponent(moveItems249);
                this.pangbai(`杰哥，这瓶奶还新鲜着呢！`);
                AudioManager.playEffect(`杰哥，这瓶奶还新鲜着呢！`, false);
                this.scheduleOnce(() => {
                    this.pangbai(`拿走`);
                    AudioManager.playEffect(`拿走`, false);
                    this.scheduleOnce(() => {
                        this.xianshi(3);
                        AudioManager.playEffect(`正确`, false);
                        this.canjiaohu = true;
                        this.checkWin();
                        return;
                    }, 1);
                }, 3);
            }
        }
        else if(type == 14 && this.flag1[4]) {
            const isCollide = cc.Intersection.rectRect(
                node14Target.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                AudioManager.playEffect(`拖动木门`, false);
                this.flag2[4] = true;
                itemNode.active = false;
                this.sdrrsk.playAnimation(`daiji2`, 0);
                this.pangbai(`这是约翰尼`);
                AudioManager.playEffect(`这是约翰尼`, false);
                this.node.getChildByName(`bg`).getChildByName(`4`).getChildByName(`sdnr_ske`).removeComponent(moveItems249);
                this.scheduleOnce(() => {
                    this.node.getChildByName(`bg`).getChildByName(`4`).getChildByName(`sdnr_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji3`, 0);
                    AudioManager.playEffect(`圣诞女尖叫`, false);
                    this.scheduleOnce(() => {
                        this.xianshi(4);
                        AudioManager.playEffect(`正确`, false);
                        this.canjiaohu = true;
                        this.checkWin();
                        return;
                    }, 1);
                }, 1);
            }
        }
        else if(type == 16 && this.flag1[6]) {
            const isCollide = cc.Intersection.rectRect(
                node16Target.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                this.flag2[6] = true;
                AudioManager.playEffect(`下滑男生眼罩`, false);
                this.synsk.playAnimation(`daiji4`, 0);
                this.pangbai(`别…别靠近我！`);
                AudioManager.playEffect(`别…别靠近我！`, false);
                this.node.getChildByName(`bg`).getChildByName(`6`).getChildByName(`sqn_ske`).removeComponent(moveItems249);
                this.scheduleOnce(() => {
                    this.node.getChildByName(`bg`).getChildByName(`6`).getChildByName(`sqn_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`daiji3`, 0);
                    this.pangbai(`你能看见我？`);
                    AudioManager.playEffect(`你能看见我？`, false);
                    this.scheduleOnce(() => {
                        this.xianshi(6);
                        AudioManager.playEffect(`正确`, false);
                        this.canjiaohu = true;
                        this.checkWin();
                        return;
                    }, 1);
                }, 3);
            }
        }
        if (!isCollided && itemNode.active) {
            const dragComponent = itemNode.getComponent(moveItems249);
            dragComponent && dragComponent.restart();
        }
        this.canjiaohu = true;
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
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

    showTips() {
        this.node.getChildByName(`tipsPanel`).active = true;
        if(!this.flag2[1]){
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n1、拖动护士至三角头身边\n2、上滑地面上的医疗箱\n打开医疗箱，拖动绷带至护士身上。`
            return;
        } else if(!this.flag2[2]){
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n1、拖动鬼新娘至道士身边\n2、拖动天花板(横梁)上的的桃木剑至道士的身上`
            return;
        } else if(!this.flag2[3]){
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n1、拖动穿背带裤的牛奶工至穿防护服的清洁工身边。\n2、上滑清洁工的头套`
            return;
        } else if(!this.flag2[4]){
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n1、拖动圣诞服女生至圣诞服男生身边。\n2、拖动地面上的门至穿圣诞服的男人身上`
            return;
        } else if(!this.flag2[5]){
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n1、拖动黑衣服的美女至中间的杀马特处`
            return;
        } else if(!this.flag2[6]){
            this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n1、拖动蓝裙子的美女至穿睡衣带眼罩的男子身边。\n2、下滑男子的眼罩`
            return;
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

    addTime(even: TouchEvent, time?: number) {
        if (GameData.startTime + time <= 0) return

        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // GameData.PauseGame = true;
        var addtime
        time ? addtime = time : addtime = 60;
        GameData.startTime += addtime;
        this.Timeing();
        var fuhao = "";
        if (addtime > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
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

    btn_addTime() {
        VideoManager.getInstance().showVideo(() => {
            this.addTime(null);
        })
    }

    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.addTime(null, 100);
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            this.onlost();
        }
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
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
    