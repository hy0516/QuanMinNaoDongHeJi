import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

const POSITION_INFO = [
    { groupIdx: 0, x: -300 }, { groupIdx: 0, x: 300 },  
    { groupIdx: 1, x: -300 }, { groupIdx: 1, x: 300 },  
    { groupIdx: 2, x: -300 }, { groupIdx: 2, x: 300 },  
    { groupIdx: 3, x: -300 }, { groupIdx: 3, x: 300 }   
];

@ccclass
export default class shjajs_253 extends BaseGame {
    yz: cc.Node; // 改为节点类型（父节点）
    yzSke: dragonBones.ArmatureDisplay; // 新增：yz节点下的ske子节点动画组件
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

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgm_lv253", true, 0.5);
        }, 0.5);
        
        // 修正：先获取yz节点，再获取其子节点ske的动画组件
        this.yz = this.node.getChildByName("bg2").getChildByName("yz");
        this.yzSke = this.yz.getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
        
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");

        const bg2 = this.node.getChildByName('bg2');
        const car = bg2.getChildByName(`che_ske`);
        const yan = car.getChildByName('yan_ske');
        const yansk = car.getChildByName('yan_ske').getComponent(dragonBones.ArmatureDisplay);
        const carsk = car.getComponent(dragonBones.ArmatureDisplay);

        carsk.playAnimation('che_guan', 1);

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
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                yan.active = true;
                yansk.playAnimation('yan', 0);
                this.scheduleOnce(() => {
                    yan.active = false;
                }, 1.5);
            }, 1);
            AudioManager.playEffect(`汽车行驶`,false);
            this.moveNode(car, cc.v3(0, car.y, car.z), 2, 0, () => {
                this.scheduleOnce(() => {
                    AudioManager.playEffect(`巴士开门`,false);
                    AudioManager.playEffect(`终点站到了，各位乘客请下车`,false);
                    this.pangbai(`终点站到了，各位乘客请下车`);
                    this.scheduleOnce(() => {
                        AudioManager.playEffect(`上下车脚步`,false);
                        r.active = true;
                        this.scheduleOnce(() => {
                            this.scheduleOnce(() => {
                                AudioManager.playEffect(`汽车行驶`,false);
                            }, 2);
                            this.moveNode(car, cc.v3(1000, car.y, car.z), 2, 2, () => {
                            this.choose();
                            });
                        }, 2);
                    }, 2);
                }, 1);
            });
        }, 1);
    }

    blink() {
        let blackNode = this.node.getChildByName("black");
        
        blackNode.active = true;
        blackNode.opacity = 0;
        
    cc.tween(blackNode)
        // 缓慢过渡到完全黑色，这里使用2秒作为示例，可根据需要调整时长
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
            .delay(3.5)
            .to(0.3, { opacity: 0 })
            .call(() => {})
            .start()
    }

// 无限循环抖动函数：围绕中轴线左右旋转，作用于 btn_4 和 btn_7 下的 ts 节点
    private loopShakeNodes() {
        // 找到目标节点的父节点 bg（修正：路径应为当前节点→bg→...）
        const bgNode = this.node.getChildByName("btn");
        const targetNodes = [
            bgNode.getChildByName("btn_4")?.getChildByName("ts"), // 第一个目标节点：btn_4下的ts（增加可选链避免空报错）
            bgNode.getChildByName("btn_7")?.getChildByName("ts")  // 第二个目标节点：btn_7下的ts（补充逗号）
        ].filter(Boolean); // 过滤空节点

        // 定义单节点抖动逻辑：围绕中轴线左右旋转（±2度），无限循环
        const startLoopShake = (node: cc.Node) => {
            // 停止节点上已有的动画，避免冲突
            cc.Tween.stopAllByTarget(node);
            
            // 抖动核心：左右旋转（以自身中心为轴），无限循环
            cc.tween(node)
                .repeatForever( // 无限循环
                    cc.tween()
                        .to(0.15, { angle: 2 })    // 向右旋转2度
                        .to(0.15, { angle: -2 })   // 向左旋转2度
                        .to(0.15, { angle: 2 })    // 再向右
                        .to(0.15, { angle: -2 })   // 再向左
                        .to(0.1, { angle: 0 })     // 短暂回中轴
                )
                .start();
        };

        // 给所有目标节点启动无限抖动
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
        this.yz.active = false; // yz是节点，直接控制active
        this.moveNode(this.node.getChildByName(`bg2`).getChildByName(`2`).getChildByName(`7`), cc.v3(-120, 0, 0), 0.5, 0, () => {
            this.node.getChildByName(`bg2`).getChildByName(`2`).getChildByName(`7`).active = false;
        });
        this.node.getChildByName(`bg2`).getChildByName(`che`).getChildByName(`c3`).active = false;
        this.node.getChildByName(`bg2`).getChildByName(`cf`).active = true;
        this.node.getChildByName(`bg2`).getChildByName(`cf`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`jieju`, 1);
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                AudioManager.playEffect("撞飞");
            }, 1.5);

            this.scheduleOnce(() => {
                this.moveAllToTarget2PosThenDisappear();
                this.scheduleOnce(() => {
                    this.blink();
                    this.scheduleOnce(()=>{
                        this.node.getChildByName(`jieju`).active = true;
                        AudioManager.playEffect(`汽车行驶`,false);
                        this.node.getChildByName(`jieju`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`che_jieju`, 1);
                        AudioManager.playEffect("恭喜你成为幸存者");
                        this.pangbai(`恭喜你成为幸存者`);
                        this.scheduleOnce(() => this.onwin(), 5);
                    },1)
                }, 4);
            }, 3);
        }, 1);
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

        let isSurvived = this.selectedPerson === this.Person1 || this.selectedPerson === this.Person2;

        if (this.selectedPerson === 4) {
            isSurvived = true;
        }

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
        this.yz.active = true; // 控制节点显示
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
    const targetParent = this.targets[1]; // 目标父节点"2"
    if (!targetParent) {
        console.warn('未找到目标节点"2"');
        return;
    }

    // 目标位置："2"节点下x=-300，y=0
    const targetWorldPos = targetParent.convertToWorldSpaceAR(cc.v3(-120, 0, 0));

    // 遍历所有人物节点，播放对应daiji动画并移动（修正index参数顺序）
    Object.entries(this.personNodes).forEach(([numStr, person], index) => { // 这里把index作为第二个参数
        if (!person) return;
        
        // 1. 获取当前人物编号，拼接对应的daiji动画名
        const personNum = parseInt(numStr);
        const daijiAnimName = `${personNum}_dj`;
        
        // 2. 播放daiji动画
        const personSke = person.getComponent(dragonBones.ArmatureDisplay);
        if (personSke) {
            personSke.playAnimation(daijiAnimName, 0); // 播放1次
        }

        // 3. 计算移动位置并执行移动
        const localPos = person.parent.convertToNodeSpaceAR(targetWorldPos);
        this.moveNode(person, localPos, 1, index * 0.2, () => {
            person.active = false; // 移动结束后隐藏
        });
    });
}

    private moveToFirstGroup(onComplete: () => void) {
        const randomGroupIdx = Math.floor(Math.random() * this.targets.length);
        const firstGroup = this.targets[randomGroupIdx];
        const targetGroupWorldPos = firstGroup.convertToWorldSpaceAR(cc.Vec3.ZERO);
        const targetLocalPos = this.yz.parent.convertToNodeSpaceAR(targetGroupWorldPos);

        this.moveNode(this.yz, targetLocalPos, 3, 0, () => { // 移动yz节点
            this.yz.parent = firstGroup; // 调整节点父容器
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
            
            this.moveNode(this.yz, moveToGroupOrigin, 1, 0, () => { // 移动yz节点
                this.yz.parent = targetGroup; // 调整节点父容器
                this.yz.position = cc.Vec3.ZERO;

                this.moveNode(this.yz, cc.v3(targetX, 0, 0), 0.5, 0, () => { // 移动yz节点到目标X位置
                    const personNum = this.posToPersonMap.get(posIndex);
                    let timeLimit = 2;
                    if (this.selectedPerson === 4 && personNum === 4) {
                        const role4Node = this.personNodes[4];
                        role4Node.getComponent(dragonBones.ArmatureDisplay).playAnimation(`lnn_da`, 1);
                        AudioManager.playEffect("不认识老娘我了吗")
                        this.pangbai(`不认识老娘我了吗`);
                        this.scheduleOnce(() => {
                            AudioManager.playEffect("约翰倒地");
                            // 动画播放通过yzSke（ske子节点的组件）
                            this.yzSke.playAnimation(`yh_yundao`, 0); 
                            this.node.getChildByName(`panduan`).getChildByName(`3`).active = true;
                        }, 0.5);
                        timeLimit = 3;
                    }
                    else if (personNum) {
                        AudioManager.playEffect("惨叫");
                        AudioManager.playEffect("爪子攻击");
                        this.pangbai(`有游客受害`);
                        // zhua是yz节点的子节点，通过yz获取
                        this.yz.getChildByName(`zhua`).active = true; 
                        this.yz.getChildByName(`zhua`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`zhuazi`, 1); 
                        this.scheduleOnce(() => {
                            this.yz.getChildByName(`zhua`).active = false;
                        }, 1);
                        // 动画播放通过yzSke
                        this.yzSke.playAnimation(`yh`, 0); 
                        this.personNodes[personNum].active = false;
                        timeLimit = 2;
                    }

                    this.scheduleOnce(() => {
                        this.yz.getChildByName(`ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`yh`, 0);
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
        
        this.moveNode(this.yz, localTargetPos, 2, 0.5, () => { // 移动yz节点
            this.yz.parent = rNode; // 调整节点父容器
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
        AudioManager.playEffect(`点击`);
        const targetName = event.currentTarget.name;

        switch (true) {
            case targetName === "btn_close":
                this.openpausePanel();
                break;

            case /^btn_([1-8])$/.test(targetName):  
                const num = parseInt(targetName.split("_")[1]);
                this.selectedPerson = num;
                this.flag = true;
                Object.keys(this.personNodes).forEach(i => {
                    this.node.getChildByName(`btn`).getChildByName(`btn_${i}`).getChildByName(`change`).active = +i === num;
                });
                if (num > 3 && this.node.getChildByName(`btn`).getChildByName(`btn_${num}`).getChildByName(`video`).active) {
                    VideoManager.getInstance().showVideo(() => {
                        this.node.getChildByName(`btn`).getChildByName(`btn_${num}`).getChildByName(`video`).active = false;
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
                this.pangbai(`腌萝卜登场了`)
                break;

            case /^([1-8])$/.test(targetName):  
                this.chooseZW = parseInt(targetName); 
                this.isSpecialCase1 = (this.selectedPerson === 7 && this.chooseZW === 3);
                if(this.chooseZW === 3) {
                    VideoManager.getInstance().showVideo(() => {
                    })
                }
                this.node.getChildByName(`btn_choose2`).active = false;
                this.zuowei();
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
        }, 1);
    }
}