import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

const POSITION_INFO = [
    { groupIdx: 0, x: -150 }, { groupIdx: 0, x: 150 },  
    { groupIdx: 1, x: -180 }, { groupIdx: 1, x: 180 },  
    { groupIdx: 2, x: -220 }, { groupIdx: 2, x: 220 },  
    { groupIdx: 3, x: -300 }, { groupIdx: 3, x: 300 }   
];

@ccclass



export default class shjajs_261 extends BaseGame {
    yz: cc.Node;
    yzSke: dragonBones.ArmatureDisplay;
    chooseZW: number; 
    lab_pb: cc.Node;
    PB: cc.Node;
    targets: cc.Node[] = [];  
    personNodes: { [key: number]: cc.Node } = {};  
    selectedPerson: number = 0; 
    totalPersons = 8; 
    arrivedPersons = 0;
    posToPersonMap = new Map<number, number>();
    visitedPositions: number[] = [];
    Person1: number = 0;
    Person2: number = 0;
    flag = false;  
    isSpecialCase1: boolean = false;

    video: cc.Node;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgm_lv261", true, 0.5);
        }, 0.5);
        
        this.yz = this.node.getChildByName("bg2").getChildByName("yz");
        this.yzSke = this.yz.getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
        
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");

        const bg2 = this.node.getChildByName('bg2');

        this.targets = [
            bg2.getChildByName('1'),  
            bg2.getChildByName('2'),  
            bg2.getChildByName('3'),  
            bg2.getChildByName('4')   
        ];

        this.loopShakeNodes();
        
        const r = bg2.getChildByName('r');
        for (let i = 1; i <= 8; i++) {
            this.personNodes[i] = r.getChildByName(i.toString());
        }
        this.BeginPlay();
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    BeginPlay(){
        this.node.getChildByName("bf_ske").active = true;
        this.scheduleOnce(() => {
            AudioManager.playEffect("场景一");
        }, 0.5);
        this.node.getChildByName("bf_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation(`kt`,1);
        this.scheduleOnce(() => {
            this.pangbai("约翰出现了");
        }, 3);
        this.scheduleOnce(() => {
            this.blink();
        }, 5.5);
        this.scheduleOnce(() => {
            this.node.getChildByName("bf_ske").active = false;
            this.node.getChildByName("bg2").getChildByName("r").active = true;
            this.choose();
        }, 6);
    }

private gatherPersonsAroundYz() {
    
    
    // 8个人物围绕y=-400形成更大范围的包围（扩大了x和y方向的距离）
    const personPositions = [
        cc.v3(-120, -320, 0),  // 1号：左上方（范围扩大）
        cc.v3(-60, -480, 0),   // 2号：左下方（范围扩大）
        cc.v3(0, -280, 0),     // 3号：正上方（范围扩大）
        cc.v3(0, -520, 0),     // 4号：正下方（范围扩大）
        cc.v3(60, -280, 0),    // 5号：右上方（范围扩大）
        cc.v3(120, -480, 0),   // 6号：右下方（范围扩大）
        cc.v3(-90, -400, 0),   // 7号：正左方（范围扩大）
        cc.v3(90, -400, 0)     // 8号：正右方（范围扩大）
    ];

    // 遍历8个人物，移动到新的围拢位置
    for (let i = 1; i <= 8; i++) {
        const person = this.personNodes[i];
        if (!person) continue;
        
        person.active = true;
        // 计算新目标位置的世界坐标和本地坐标
        const targetWorldPos = this.node.getChildByName("bg2").convertToWorldSpaceAR(personPositions[i - 1]);
        const targetLocalPos = person.parent.convertToNodeSpaceAR(targetWorldPos);
        
        // 保持原移动速度（1.5秒）
        this.moveNode(person, targetLocalPos, 2);
        // 播放对应站立动画
        person.getComponent(dragonBones.ArmatureDisplay).playAnimation(`zl_${i}`, 0);
    }
}


    JiejuPlay(){
        this.gatherPersonsAroundYz();
        this.scheduleOnce(() => {
            this.blink();
            this.scheduleOnce(() => {
                AudioManager.playEffect("彩蛋场景音系");
                this.node.getChildByName("bf_ske").active = true;
                this.node.getChildByName("bf_ske").getComponent(dragonBones.ArmatureDisplay).playAnimation(`jw`,1);
                this.scheduleOnce(() => {
                    this.onwin();
                }, 6);
            }, 1);
        } , 1);
    }

    blink() {
        let blackNode = this.node.getChildByName("black1");
        
        blackNode.active = true;
        blackNode.opacity = 0;
        
    cc.tween(blackNode)
        .to(0.5, {opacity: 255})
        .delay(0.5)
        .to(0.5, {opacity: 0})
        .start();
    }

    pangbai(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(2.5)
            .to(0.3, { opacity: 0 })
            .call(() => {})
            .start()
    }

    private loopShakeNodes() {
        const bgNode = this.node.getChildByName("btn");
        const targetNodes = [
            bgNode.getChildByName("btn_4").getChildByName("ts"),
            bgNode.getChildByName("btn_7").getChildByName("ts")
        ].filter(Boolean);

        const startLoopShake = (node: cc.Node) => {
            cc.Tween.stopAllByTarget(node);
            
            cc.tween(node)
                .repeatForever(
                    cc.tween()
                        .to(0.15, { angle: 2 })
                        .to(0.15, { angle: -2 })
                        .to(0.15, { angle: 2 })
                        .to(0.15, { angle: -2 })
                        .to(0.1, { angle: 0 })
                )
                .start();
        };

        targetNodes.forEach(node => startLoopShake(node));
    }

    choose() {
        this.node.getChildByName('btn').active = true;
        this.node.getChildByName('btn_tip').active = true;
        this.node.getChildByName('black').active = true;
        this.node.getChildByName('btn_choose1').active = true;

    }

    private moveNode(node: cc.Node, targetPos: cc.Vec3, duration: number, delay = 0, onComplete?: () => void) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .delay(delay)
            .to(duration, { position: targetPos }, { easing: 'smooth' })
            .call(() => onComplete && onComplete())
            .start();
    }

    private shuffleArray(arr: number[]): number[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    zuowei() {
        if (!this.selectedPerson || !this.chooseZW) return;

        AudioManager.playEffect("脚步声");

        this.arrivedPersons = 0;
        this.posToPersonMap.clear();
        this.visitedPositions = [];
        this.Person1 = this.Person2 = 0;
        Object.values(this.personNodes).forEach(node => node.active = true);

        const targetPosIndex = this.chooseZW - 1; 
        const allOtherPosIndices = Array.from({ length: 8 }, (_, i) => i)
            .filter(idx => idx !== targetPosIndex);
        const shuffledOtherPos = this.shuffleArray(allOtherPosIndices);

        Object.entries(this.personNodes).forEach(([numStr, person], idx) => {
            const personNum = parseInt(numStr);
            let posIndex: number;

            if (personNum === this.selectedPerson) {
                posIndex = targetPosIndex;
            } else {
                posIndex = shuffledOtherPos.shift()!;
            }

            this.posToPersonMap.set(posIndex, personNum);
            const { groupIdx, x: targetX } = POSITION_INFO[posIndex];
            const targetParent = this.targets[groupIdx];

            const targetWorldPos = targetParent.convertToWorldSpaceAR(cc.Vec3.ZERO);
            const localPos = person.parent.convertToNodeSpaceAR(targetWorldPos);
            
            this.moveNode(person, localPos, 1.5, idx * 0.2, () => {
                person.parent = targetParent;
                person.position = cc.v3(targetX, 0, 0);
                person.getComponent(dragonBones.ArmatureDisplay).playAnimation(`dj_${personNum}`, 0);
                if (++this.arrivedPersons === this.totalPersons) {
                    this.scheduleOnce(() => {
                        if (this.isSpecialCase1) {
                            this.specialCase1AfterPersonsArrive();
                        } else {
                            this.startYzMovement();
                        }
                    }, 1);
                }
            });
        });
    }

    private specialCase1AfterPersonsArrive() {
        const targetGroup = this.targets[1]; 
        const targetWorldPos = targetGroup.convertToWorldSpaceAR(cc.Vec3.ZERO);
        const localPos = this.yz.parent.convertToNodeSpaceAR(targetWorldPos);
        
        this.specialCase1Callback();
    }

    private specialCase1Callback() {
        this.pangbai("约翰出场了");
        AudioManager.playEffect("场景二约翰出场");
        this.moveNode(this.yz, cc.v3(0, -400, 0), 2, 1, () => {
            this.JiejuPlay();
        });
    }

    xianshi() {
        this.node.getChildByName(`panduan`).active = true;
        this.node.getChildByName(`black`).active = true;
        this.node.getChildByName(`panduan`).getChildByName(`xcz`).getChildByName(`1`).getChildByName(`${this.Person1}`).active = true;
        this.node.getChildByName(`panduan`).getChildByName(`xcz`).getChildByName(`2`).getChildByName(`${this.Person2}`).active = true;

        this.node.getChildByName(`panduan`).getChildByName(`l1`).active = true;
        this.node.getChildByName(`panduan`).getChildByName(`l2`).active = true;
        this.node.getChildByName(`panduan`).getChildByName(`l1`).getComponent(cc.Label).string = `${this.Person1}号`;
        this.node.getChildByName(`panduan`).getChildByName(`l2`).getComponent(cc.Label).string = `${this.Person2}号`;
    }

    panduan() {
        this.node.getChildByName(`black`).active = false;
        this.node.getChildByName(`panduan`).active = false;

        // 移除4号的特殊存活判定
        let isSurvived = this.selectedPerson === this.Person1 || this.selectedPerson === this.Person2;

        if (isSurvived) {
            AudioManager.playEffect("恭喜你成为幸存者");
            this.pangbai(`恭喜你成为幸存者`);
            this.scheduleOnce(() => this.onwin(), 5);
        } else {
            AudioManager.playEffect("很遗憾你未能躲过追捕");
            this.pangbai(`很遗憾你未能躲过追捕`);
            this.scheduleOnce(() => this.onlost(), 5);
        }
    }

    private startYzMovement() {
        this.yz.active = true;
        this.pangbai("约翰出场了");
        AudioManager.playEffect("场景二约翰出场");
        this.moveToFirstGroup(() => {
            this.startRandomGroupMove(() => {
                this.recordRemainingPersons();
                this.moveYzToOriginalPos();
                this.scheduleOnce(() => {
                    this.xianshi();
                }, 1);
            });
        });
    }

private moveAllToTarget2PosThenDisappear() {
    const targetParent = this.targets[1];
    if (!targetParent) {
        console.warn('未找到目标节点"2"');
        return;
    }

    const targetWorldPos = targetParent.convertToWorldSpaceAR(cc.v3(-120, 0, 0));

    Object.entries(this.personNodes).forEach(([numStr, person], index) => {
        if (!person) return;
        
        const personNum = parseInt(numStr);
        const daijiAnimName = `${personNum}_dj`;
        
        const personSke = person.getComponent(dragonBones.ArmatureDisplay);
        if (personSke) {
            personSke.playAnimation(daijiAnimName, 0);
        }

        const localPos = person.parent.convertToNodeSpaceAR(targetWorldPos);
        this.moveNode(person, localPos, 1, index * 0.2, () => {
            person.active = false;
        });
    });
}

    private moveToFirstGroup(onComplete: () => void) {
        const randomGroupIdx = Math.floor(Math.random() * this.targets.length);
        const firstGroup = this.targets[randomGroupIdx];
        const targetGroupWorldPos = firstGroup.convertToWorldSpaceAR(cc.Vec3.ZERO);
        const targetLocalPos = this.yz.parent.convertToNodeSpaceAR(targetGroupWorldPos);

        this.moveNode(this.yz, targetLocalPos, 3, 0, () => {
            this.yz.parent = firstGroup;
            this.yz.position = cc.Vec3.ZERO;
            onComplete();
        });
    }

    private startRandomGroupMove(onComplete: () => void) {
        const allPosIndices = Array.from({ length: 8 }, (_, i) => i);
        const shuffledPositions = this.shuffleArray(allPosIndices).slice(0, 6);
        this.visitedPositions = shuffledPositions;

        const moveNext = (index: number) => {
            if (index >= shuffledPositions.length) {
                onComplete();
                return;
            }

            const posIndex = shuffledPositions[index];
            const { groupIdx, x: targetX } = POSITION_INFO[posIndex];
            const targetGroup = this.targets[groupIdx];
            const currentGroup = this.yz.parent;

            const targetGroupWorldPos = targetGroup.convertToWorldSpaceAR(cc.Vec3.ZERO);
            const moveToGroupOrigin = currentGroup.convertToNodeSpaceAR(targetGroupWorldPos);
            
            this.moveNode(this.yz, moveToGroupOrigin, 1, 0, () => {
                this.yz.parent = targetGroup;
                this.yz.position = cc.Vec3.ZERO;

                this.moveNode(this.yz, cc.v3(targetX, 0, 0), 0.5, 0, () => {
                    const personNum = this.posToPersonMap.get(posIndex);
                    let timeLimit = 2;

                    // 移除4号的特殊交互逻辑
                    if (personNum) {
                        AudioManager.playEffect("惨叫");
                        AudioManager.playEffect("爪子攻击");
                        this.pangbai(`有群众受害`);
                        this.yz.getChildByName(`zhua`).active = true;
                        this.yz.getChildByName(`zhua`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`zhuazi`, 1);
                        this.scheduleOnce(() => {
                            this.yz.getChildByName(`zhua`).active = false;
                        }, 1);
                        this.yzSke.playAnimation(`yh_z`, 0);
                        this.personNodes[personNum].active = false;
                        timeLimit = 2;
                    }

                    this.scheduleOnce(() => {
                        this.yz.getChildByName(`ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`yh_z`, 0);
                        this.moveNode(this.yz, cc.Vec3.ZERO, 1, 0, () => {
                            this.scheduleOnce(() => moveNext(index + 1), 0.5);
                        });
                    }, timeLimit);
                });
            });
        };

        moveNext(0);
    }

    private moveYzToOriginalPos() {
        const rNode = this.node.getChildByName('bg2').getChildByName('r');
        const originalLocalPos = cc.v3(0, -1400, 0);
        const targetWorldPos = rNode.convertToWorldSpaceAR(originalLocalPos);
        const currentParent = this.yz.parent;
        const localTargetPos = currentParent.convertToNodeSpaceAR(targetWorldPos);
        
        this.moveNode(this.yz, localTargetPos, 2, 0.5, () => {
            this.yz.parent = rNode;
            this.yz.position = originalLocalPos;
        });
    }

    private recordRemainingPersons() {
        let unvisited = Array.from({ length: 8 }, (_, i) => i)
            .filter(pos => !this.visitedPositions.includes(pos))
            .map(pos => this.posToPersonMap.get(pos)!)
            .sort((a, b) => a - b);


        this.Person1 = unvisited[0] || 0;
        this.Person2 = unvisited[1] || 0;
    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        const targetName = event.currentTarget.name;

        switch (true) {
            case targetName === "btn_close":
                this.openpausePanel();
                break;

            case /^btn_([1-8])$/.test(targetName):  
                const num = parseInt(targetName.split("_")[1]);
                this.selectedPerson = num;
                this.flag = true;
                if (num > 3 && this.node.getChildByName(`btn`).getChildByName(`btn_${num}`).getChildByName(`video`).active) {
                    VideoManager.getInstance().showVideo(() => {
                        Object.keys(this.personNodes).forEach(i => {
                            this.node.getChildByName(`btn`).getChildByName(`btn_${i}`).getChildByName(`change`).active = +i === num;
                        });
                        this.node.getChildByName(`btn`).getChildByName(`btn_${num}`).getChildByName(`video`).active = false;
                    });
                } else {
                    Object.keys(this.personNodes).forEach(i => {
                        this.node.getChildByName(`btn`).getChildByName(`btn_${i}`).getChildByName(`change`).active = +i === num;
                    });
                }
                break;

            case targetName === "btn_choose1":  
                if (this.flag) {
                    this.node.getChildByName(`btn`).active = false;
                    this.node.getChildByName(`btn_tip`).active = false;
                    this.node.getChildByName(`btn_choose1`).active = false;
                    this.node.getChildByName(`black`).active = false;
                    this.node.getChildByName(`btn_choose2`).active = true;
                    if (this.selectedPerson === 7) {
                        this.node.getChildByName(`btn_choose2`).getChildByName(`3`).getChildByName(`teshu`).active = true;
                    }
                }
                break;

            case /^([1-8])$/.test(targetName):  
                this.chooseZW = parseInt(targetName); 
                this.isSpecialCase1 = (this.selectedPerson === 7 && this.chooseZW === 3);
                if(this.chooseZW === 3) {
                    VideoManager.getInstance().showVideo(() => {
                        this.node.getChildByName(`btn_choose2`).active = false;
                        this.zuowei();
                    })
                } else {
                    this.node.getChildByName(`btn_choose2`).active = false;
                    this.zuowei();
                }
                break;

            case targetName === 'panduan':
                this.panduan();
                break;
        }
    }

    onwin() {
        this.scheduleOnce(() => {
            this.node.destroy();
            this.endwin("prefabs/zc/zc_winend");
            GameData.PauseGame = false;
        }, 1);
    }

    onlost() {
        this.scheduleOnce(() => {
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
            GameData.PauseGame = false;
        });
    }
}