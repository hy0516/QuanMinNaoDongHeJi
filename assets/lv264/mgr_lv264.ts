import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems264 from "./moveItems264";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv263 extends BaseGame {

    lab_pb: cc.Node;
    PB: cc.Node;

    isshowVideo = false;
    canjiaohu = false;

    flag1 = false;  
    // 广告
    flag3 = false;
    flag4 = false;
    flag7 = false;
    battleState: 'idle' | 'preparing' | 'attacking' | 'ended' = 'idle'; 
    currentTurn: 'p1' | 'p2' = 'p1';
    isUsingItem = false;
    
    // 准备阶段倒计时相关
    private preparingTimer: number = 0; // 准备阶段剩余时间
    private isPreparingPaused: boolean = false; // 准备阶段是否暂停

    // 角色骨骼节点
    p1_dd_ske; p1_sj_ske; p1_pm_ske; p1_dj_ske; p1_wdj_ske; p1_wgj_ske; P1_jn_ske; p1_db_ske; p1_gj_ske;
    p2_dd_ske; p2_sj_ske; p2_pm_ske; p2_dj_ske; p2_wdj_ske; p2_wgj_ske; P2_jn_ske; p2_db_ske; p2_gj_ske;
    p1_dj_sk; p1_sj_sk; p1_pm_sk; p1_dd_sk; p1_wdj_sk; p1_wgj_sk; P1_jn_sk; p1_db_sk; p1_gj_sk;
    p2_dj_sk; p2_sj_sk; p2_pm_sk; p2_dd_sk; p2_wdj_sk; p2_wgj_sk; P2_jn_sk; p2_db_sk; p2_gj_sk;
    
    vs_ske;
    vs_sk;

    private battleConfig = {
        partNames: ["", "dj", "sj", "pm", "dd", "wdj", "wgj", "jn", "db", "gj"],
        nameMap: {
            3: { name: "baby", winName: "bb" },
            4: { name: "神秘", winName: "sm" },
            5: { name: "佐伊", winName: "zy" },
            6: { name: "米粒", winName: "ml" },
            7: { name: "鲁米", winName: "lm" },
            8: { name: "秦宇", winName: "qy" }
        },
        roleAnim: { 
            3: "绿色头发",
            4: "紫色短发",
            5: "蓝色头发",
            6: "红色头发",
            7: "紫色辫子",
            8: "黑色头发"
        },
        cloneAnim: {
            1: "撞击-紫色",
            2: "红色=压倒",
            3: "newAnimation"
        },
        cloneMusic: {
            1: "宠物小紫德普乐",
            2: "宠物小红瑞迪",
            3: "宠物小绿莱姆"
        },
        time: {
            readyDelay: 1.5, // 回合准备时间
            attackDur: 1,   // 攻击动画持续时间
            hitTiming: 0.3  // 攻击动画中命中的时间点
        },
        damage: {
            base: 15, // 基础伤害
            weaponAdd: 8, // 武器额外伤害
            skillAdd: 10,  // 技能额外伤害
            dodgeRate: 0.3
        },
        skillRate: 0.4, // 技能攻击概率
        defaultPart: "dj", 
        weaponPart: "wdj", // 武器待机部位
        attackPart: {
            normal: "gj", // 普通攻击部位
            weapon: "wgj", // 武器攻击部位
            skill: "jn"    // 技能攻击部位
        }
    };
    winner;
    menu;
    currentP1ID: number = 0;
    currentP2ID: number = 0;
    P1HP: number = 100;
    P2HP: number = 100;
    private hasWeapon: {p1: boolean, p2: boolean} = {p1: false, p2: false};
    
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();

        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.canjiaohu = true;

        // 初始化骨骼节点
        for(let i = 1; i <= 9; i++) {
            this[`p1_${this.battleConfig.partNames[i]}_ske`] = this.node.getChildByName(`bg`).getChildByName(`p1`).getChildByName(`${this.battleConfig.partNames[i]}_ske`);
            this[`p2_${this.battleConfig.partNames[i]}_ske`] = this.node.getChildByName(`bg`).getChildByName(`p2`).getChildByName(`${this.battleConfig.partNames[i]}_ske`);
            this[`p1_${this.battleConfig.partNames[i]}_sk`] = this.node.getChildByName(`bg`).getChildByName(`p1`).getChildByName(`${this.battleConfig.partNames[i]}_ske`).getComponent(dragonBones.ArmatureDisplay);
            this[`p2_${this.battleConfig.partNames[i]}_sk`] = this.node.getChildByName(`bg`).getChildByName(`p2`).getChildByName(`${this.battleConfig.partNames[i]}_ske`).getComponent(dragonBones.ArmatureDisplay);
        }
        this.vs_ske = this.node.getChildByName(`vs`);
        this.vs_sk = this.vs_ske.getComponent(dragonBones.ArmatureDisplay);
        this.menu = this.node.getChildByName(`menu`);
        if(this.flag3) this.menu.getChildByName(`btn_3`).getChildByName(`luxiang`).active = false;
        if(this.flag4) this.menu.getChildByName(`btn_4`).getChildByName(`luxiang`).active = false;
        if(this.flag7) this.menu.getChildByName(`btn_7`).getChildByName(`luxiang`).active = false;
    }
    
    update (dt) {
        // 处理准备阶段倒计时
        if (this.battleState === 'preparing' && !this.isPreparingPaused && !this.isUsingItem) {
            this.preparingTimer -= dt;
            // 准备时间结束，进入攻击阶段
            if (this.preparingTimer <= 0) {
                this.battleState = 'attacking';
                this.doAttack();
            }
        }
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch) {
        if (!this.canjiaohu) {
            const dragComponent = even.currentTarget.getComponent(moveItems264);
            dragComponent && dragComponent.restart();
            return;
        }
        this.canjiaohu = false;
        const colls = this.node.getChildByName(`checknodes`);
        const p1nodeTarget = colls.getChildByName(`p1node`);
        const p2nodeTarget = colls.getChildByName(`p2node`);
        const vsnodeTarget = colls.getChildByName(`vsnode`);
        const itemNode = even.currentTarget;

        // 武器选择
        if(type === 10) { 
            // 拖拽到P1
            if(p1nodeTarget && p1nodeTarget.active) {
                const isCollide = cc.Intersection.rectRect(p1nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
                if (isCollide) {
                    this.hasWeapon.p1 = true;
                    this.restoreIdleState('p1'); 
                }
            }
            // 拖拽到P2
            if(p2nodeTarget && p2nodeTarget.active) {
                const isCollide = cc.Intersection.rectRect(p2nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
                if (isCollide) {
                    this.hasWeapon.p2 = true;
                    this.restoreIdleState('p2'); 
                }
            }
        }
        // 道具使用限制：仅在准备阶段可使用
        if(type === 9 && this.battleState === 'preparing' && !this.isUsingItem) { 
            if(p1nodeTarget && p1nodeTarget.active) {
                const isCollide = cc.Intersection.rectRect(p1nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
                if (isCollide) {
                    VideoManager.getInstance().showVideo(() => {
                        this.useNoodle('p1');
                    })
                    const dragComponent = itemNode.getComponent(moveItems264);
                    dragComponent && dragComponent.restart();
                    this.scheduleOnce(() => {
                        this.canjiaohu = true;
                    }, 1);
                    return;
                }
            }
            if(p2nodeTarget && p2nodeTarget.active) {
                const isCollide = cc.Intersection.rectRect(p2nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
                if (isCollide) {
                    VideoManager.getInstance().showVideo(() => {
                        this.useNoodle('p2');
                    })
                    const dragComponent = itemNode.getComponent(moveItems264);
                    dragComponent && dragComponent.restart();
                    this.scheduleOnce(() => {
                        this.canjiaohu = true;
                    }, 1);
                    return;
                }
            }
        }
        //召唤替身
        if(type === 2 && this.battleState === 'preparing' && !this.isUsingItem) { 
            if(p1nodeTarget && p1nodeTarget.active) {
                const isCollide = cc.Intersection.rectRect(p1nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
                if (isCollide) {
                    VideoManager.getInstance().showVideo(() => {
                        this.useClone('p1');
                    })
                }
            }
            if(p2nodeTarget && p2nodeTarget.active) {
                const isCollide = cc.Intersection.rectRect(p2nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
                if (isCollide) {
                    VideoManager.getInstance().showVideo(() => {
                        this.useClone('p2');
                    })
                }
            }
        }
        // P1角色选择
        if(p1nodeTarget && p1nodeTarget.active && type >= 3 && type <= 8 && this.battleState === 'idle') {
             const isCollide = cc.Intersection.rectRect(p1nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
            if(isCollide) {
                if(!this[`flag${type}`] && (type === 3||type === 4 || type === 7)) {
                    VideoManager.getInstance().showVideo(() => {
                        this[`flag${type}`] = true;
                        itemNode.getChildByName(`luxiang`).active = false;
                        this.node.getChildByName(`btn_hidep1`).active = true;
                        AudioManager.playEffect(`放置人物`);
                        AudioManager.playEffect(this.battleConfig.nameMap[type].name);
                        this.updateRoleDisplay('p1', type, itemNode);
                    })
                } else {
                    this.node.getChildByName(`btn_hidep1`).active = true;
                    AudioManager.playEffect(`放置人物`);
                    AudioManager.playEffect(this.battleConfig.nameMap[type].name);
                    this.updateRoleDisplay('p1', type, itemNode);
                }
            }
        } 
        // P2角色选择
        if(p2nodeTarget && p2nodeTarget.active && type >= 3 && type <= 8 && this.battleState === 'idle') { 
            const isCollide = cc.Intersection.rectRect(p2nodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
            if(isCollide) {
                if(!this[`flag${type}`] && (type === 3||type === 4 || type === 7)) {
                    VideoManager.getInstance().showVideo(() => {
                        this[`flag${type}`] = true;
                        itemNode.getChildByName(`luxiang`).active = false;
                        this.node.getChildByName(`btn_hidep2`).active = true;
                        AudioManager.playEffect(`放置人物`);
                        AudioManager.playEffect(this.battleConfig.nameMap[type].name);
                        this.updateRoleDisplay('p2', type, itemNode);
                    })
                } else {
                    this.node.getChildByName(`btn_hidep2`).active = true;
                    AudioManager.playEffect(`放置人物`);
                    AudioManager.playEffect(this.battleConfig.nameMap[type].name);
                    this.updateRoleDisplay('p2', type, itemNode);
                }
            }
        }
        // 触发战斗
        if(vsnodeTarget && vsnodeTarget.active && type === 1 && this.currentP1ID && this.currentP2ID) {
            const isCollide = cc.Intersection.rectRect(vsnodeTarget.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
            if(isCollide) {
                this.battleState = 'preparing';
                itemNode.active = false;
                itemNode.parent.getChildByName(`change1`).active = true;

                this.vs_ske.active = true;
                this.vs_sk.playAnimation('vs', 1);
                AudioManager.playEffect(`vs`);
                this.scheduleOnce(() => {
                    AudioManager.playMusic(`lv264`);
                    this.vs_ske.active = false;
                }, 1);

                for (let i = 1; i <= 9; i++) {
                    if(i === 2 || i === 9) {
                        this.menu.getChildByName(`btn_${i}`).active = true;
                        this.menu.getChildByName(`change${i}`).active = false;
                    } else if(i >= 3 && i <= 8) {
                        this.menu.getChildByName(`btn_${i}`).active = false;
                        this.menu.getChildByName(`change${i}`).active = true;
                    }
                }
                this.node.getChildByName(`btn_hidep1`).active = false;
                this.node.getChildByName(`btn_hidep2`).active = false;
                this.startBattle();
            }
        }
        const dragComponent = itemNode.getComponent(moveItems264);
        dragComponent && dragComponent.restart();
        this.canjiaohu = true;
    }

    private useNoodle(role: 'p1' | 'p2') {
        // 1. 标记正在使用道具，暂停准备阶段倒计时
        this.isUsingItem = true;
        this.isPreparingPaused = true;

        // 播放pm动画
        const roleID = role === 'p1' ? this.currentP1ID : this.currentP2ID;
        const animName = this.battleConfig.roleAnim[roleID];
        AudioManager.playEffect(`泡面`);
        this.playAnimation(role, 'pm', animName, 1, true);

        this.unscheduleAllCallbacks();

        // 动画完成后执行加血和战斗流程
        const sk = this[`${role}_pm_sk`];
        const onComplete = () => {
            sk.removeEventListener(dragonBones.EventObject.COMPLETE, onComplete, this);
            
            // 加血50
            if(role === 'p1') {
                this.P1HP = Math.min(100, this.P1HP + 30);
                this.updateHPBar('p1', this.P1HP);
            } else {
                this.P2HP = Math.min(100, this.P2HP + 30);
                this.updateHPBar('p2', this.P2HP);
            }

            // 2. 道具使用完成，恢复状态并继续当前回合的攻击流程
            this.scheduleOnce(() => {
                this.isUsingItem = false;
                this.isPreparingPaused = false;
                // 直接进入攻击阶段（道具使用已占用准备时间）
                this.battleState = 'attacking';
                this.canjiaohu = true;
                this.doAttack();
            }, 0.5); // 动画结束到攻击开始的间隔
        };
        sk.addEventListener(dragonBones.EventObject.COMPLETE, onComplete, this);

    }

    private useClone(role: 'p1' | 'p2') {
        // 标记使用中，暂停准备阶段
        this.isUsingItem = true;
        this.isPreparingPaused = true;

        // 随机选择1-3号替身
        const randomClone = Math.floor(Math.random() * 3) + 1;

        // 获取替身节点（路径：当前节点 -> bg -> ts1/ts2 -> 1/2/3）
        const bgNode = this.node.getChildByName("bg");
        const tsNode = bgNode.getChildByName(`ts${role === 'p1' ? '1' : '2'}`);
        const cloneNode = tsNode.getChildByName(`${randomClone}`);

        // 显示替身并播放动画
        cloneNode.active = true;
        AudioManager.playEffect(this.battleConfig.cloneMusic[randomClone]);
        const cloneSk = cloneNode.getComponent(dragonBones.ArmatureDisplay);
        const animName = this.battleConfig.cloneAnim[randomClone];
        cloneSk.playAnimation(animName, 1);

        // 动画完成后：隐藏替身 + 处理受击/闪避 + 继续回合
        const onAnimComplete = () => {
            cloneNode.active = false;
            cloneSk.removeEventListener(dragonBones.EventObject.COMPLETE, onAnimComplete, this);

            // 确定攻击者（召唤者）和防御者（对方）
            const defender = role === 'p1' ? 'p2' : 'p1';

            // 获取防御者动画信息
            const defenderRoleID = defender === 'p1' ? this.currentP1ID : this.currentP2ID;
            const defenderAnimName = this.battleConfig.roleAnim[defenderRoleID];

            // 随机闪避判断
            const isDodge = Math.random() < this.battleConfig.damage.dodgeRate;
            if (isDodge) {
                // 播放闪避动画
                AudioManager.playEffect(`闪躲`);
                this.playAnimation(defender, 'db', defenderAnimName, 1, true);
            } else {
                // 播放受击动画
                let sj:string = defenderRoleID === 5||6||7  ? `女`:`男`;
                AudioManager.playEffect(`${sj}受击`);
                this.playAnimation(defender, 'sj', defenderAnimName, 1, true);

                // 计算替身攻击伤害
                const totalDmg = this.battleConfig.damage.base + 10;

                // 更新血量
                if (defender === 'p1') {
                    this.P1HP = Math.max(0, this.P1HP - totalDmg);
                    this.updateHPBar('p1', this.P1HP);
                } else {
                    this.P2HP = Math.max(0, this.P2HP - totalDmg);
                    this.updateHPBar('p2', this.P2HP);
                }

                // 检查战斗结束
                if (this.P1HP === 0 || this.P2HP === 0) {
                    this.flag1 = true;
                    const deadRole = this.P1HP === 0 ? 'p1' : 'p2';
                    this.winner = this.P1HP === 0 ? 'p2' : 'p1';
                    this.playAnimation(deadRole, 'dd', this.battleConfig.roleAnim[this[`current${deadRole.toUpperCase()}ID`]], 1, false);
                }
            }
            this.scheduleOnce(() => {
                this.isUsingItem = false;
                this.isPreparingPaused = false;

                if (this.flag1) {
                    this.battleState = 'ended';
                    this.checkBattleContinue(role, defender); 
                } else {
                    this.battleState = 'attacking';
                    this.doAttack();
                }
            }, 0.5);
        };
        cloneSk.addEventListener(dragonBones.EventObject.COMPLETE, onAnimComplete, this);

        this.canjiaohu = true;
    }
    
    private playAnimation(
        role: 'p1' | 'p2', 
        part: string, 
        animName: string, 
        playTimes: number = 1, 
        autoRestore: boolean = true
    ) {
        const sk = this[`${role}_${part}_sk`];
        const ske = this[`${role}_${part}_ske`];

        this.hideAllParts(role, [part]);
        ske.active = true;
        sk.playAnimation(animName, playTimes);

        if (autoRestore && playTimes > 0) {
            const completeHandler = () => {
                this.restoreIdleState(role);
                sk.removeEventListener(dragonBones.EventObject.COMPLETE, completeHandler, this);
            };
            sk.addEventListener(dragonBones.EventObject.COMPLETE, completeHandler, this);
        }
    }

    private restoreIdleState(role: 'p1' | 'p2') {
        const targetPart = this.hasWeapon[role] ? this.battleConfig.weaponPart : this.battleConfig.defaultPart;
        const roleID = role === 'p1' ? this.currentP1ID : this.currentP2ID;
        const animName = this.battleConfig.roleAnim[roleID];

        if (!animName) return;

        this.hideAllParts(role, [targetPart]);
        const { ske, sk } = this.getRolePart(role, targetPart);
        ske.active = true;
        sk.playAnimation(animName, 0);
    }

    protected hideRole(role: 'p1' | 'p2') {
        const currentID = role === 'p1' ? this.currentP1ID : this.currentP2ID;
        this.menu.getChildByName(`btn_${currentID}`).active = true;
        this.menu.getChildByName(`change${currentID}`).active = false;
        this.node.getChildByName(role).getChildByName(`tx`).getChildByName(`${currentID}`).active = false;
        this.node.getChildByName(`bg`).getChildByName(role).getChildByName(`dj_ske`).active = false;
        this.node.getChildByName(`bg`).getChildByName(role).getChildByName(`wdj_ske`).active = false;
        this.node.getChildByName(`bg`).getChildByName(role).getChildByName(`wait`).active = true;
        role === 'p1' ? (this.currentP1ID = 0) : (this.currentP2ID = 0);
        this.node.getChildByName(role).active = false;
        this.node.getChildByName(`btn_hide${role}`).active = false;
    }

    private updateRoleDisplay(role: 'p1' | 'p2', type: number, itemNode: cc.Node) {
        const currentID = role === 'p1' ? this.currentP1ID : this.currentP2ID;
        const btnNode = itemNode.parent.getChildByName(`btn_${currentID}`);
        const changeNode = itemNode.parent.getChildByName(`change${currentID}`);
        const txNode = this.node.getChildByName(role).getChildByName(`tx`).getChildByName(`${currentID}`);

        if (currentID) {
            btnNode && (btnNode.active = true);
            changeNode && (changeNode.active = false);
            txNode && (txNode.active = false);
        } else {
            this.node.getChildByName(`bg`).getChildByName(role).getChildByName(`wait`).active = false;
            this.node.getChildByName(role).active = true;
        }

        itemNode.parent.getChildByName(`change${type}`).active = true;
        this.node.getChildByName(role).getChildByName(`tx`).getChildByName(`${type}`).active = true;
        this.playAnimation(role, this.battleConfig.defaultPart, this.battleConfig.roleAnim[type], 0, false);

        role === 'p1' ? (this.currentP1ID = type) : (this.currentP2ID = type);
        itemNode.active = false;
    }

    private getRolePart(role: 'p1' | 'p2', part: string) {
        return {
            ske: this[`${role}_${part}_ske`],
            sk: this[`${role}_${part}_sk`]
        };
    }

    private hideAllParts(role: 'p1' | 'p2', exceptParts: string[] = []) {
        this.battleConfig.partNames.forEach(part => {
            if (!part || exceptParts.includes(part)) return;
            const { ske } = this.getRolePart(role, part);
            ske && (ske.active = false);
        });
    }

    startBattle() {
        this.isUsingItem = false;
        this.isPreparingPaused = false;
        this.flag1 = false;
        // 初始化准备阶段倒计时
        this.preparingTimer = this.battleConfig.time.readyDelay;
    }

    private doAttack() {
        // 校验战斗状态和角色ID，无效则退出
        if (this.battleState !== 'attacking' || !this.currentP1ID || !this.currentP2ID) return;

        // 定义当前攻击者和防御者
        const attacker = this.currentTurn;
        const defender = attacker === 'p1' ? 'p2' : 'p1';
        const defenderRoleID = defender === 'p1' ? this.currentP1ID : this.currentP2ID;
        const defenderAnimName = this.battleConfig.roleAnim[defenderRoleID];
        if (!defenderAnimName) return; // 防御者动画无效则退出

        // 判断是否触发技能攻击
        const isSkillAttack = Math.random() < this.battleConfig.skillRate;
        
        // 获取攻击者动画信息和攻击部位
        const attackerRoleID = attacker === 'p1' ? this.currentP1ID : this.currentP2ID;
        const attackerAnimName = this.battleConfig.roleAnim[attackerRoleID];
        let attackPart;
        if (isSkillAttack) {
            attackPart = this.battleConfig.attackPart.skill; // 技能攻击
        } else {
            attackPart = this.hasWeapon[attacker] 
                ? this.battleConfig.attackPart.weapon 
                : this.battleConfig.attackPart.normal;
        }
        // 获取攻击者根节点
        const attackerRootNode = this.node.getChildByName(`bg`).getChildByName(attacker);
        // 记录初始位置
        const originalPos = attackerRootNode.position.clone();
        // 定义移动距离
        const moveDistance = attacker === 'p1' ? 150 : -150;

        // 技能攻击不需要移动，直接播放动画
        if (isSkillAttack) {
            AudioManager.playEffect(this.battleConfig.nameMap[attackerRoleID].name + `技能`);
            this.playAnimation(attacker, attackPart, attackerAnimName, 1, false);
            
            // 攻击动画进行中（命中时间点）处理伤害，传入isSkillAttack
            this.scheduleOnce(() => {
                this.handleDamage(attacker, defender, defenderAnimName, isSkillAttack);
            }, this.battleConfig.time.hitTiming);
        } 
        // 普通/武器攻击需要移动
        else {
            // 1. 先平滑移动到攻击位置
            cc.tween(attackerRootNode)
                .to(0.2, { x: originalPos.x + moveDistance }) // 移动到攻击位置
                .call(() => {
                    // 移动完成后播放攻击动画
                    if (this.hasWeapon[attacker]) {
                        AudioManager.playEffect(this.battleConfig.nameMap[attackerRoleID].name + `武器`);
                    } else {
                        AudioManager.playEffect(`普攻`);
                    }
                    this.playAnimation(attacker, attackPart, attackerAnimName, 1, false);
                    
                    // 攻击动画进行中（命中时间点）处理伤害，传入isSkillAttack
                    this.scheduleOnce(() => {
                        this.handleDamage(attacker, defender, defenderAnimName, isSkillAttack);
                    }, this.battleConfig.time.hitTiming);
                })
                .start();
        }

        // 攻击结束后，将攻击者移回初始位置（技能攻击不需要移动回位）
        if (!isSkillAttack) {
            this.scheduleOnce(() => {
                cc.tween(attackerRootNode)
                    .to(0.2, { x: originalPos.x }) // 移回原位
                    .call(() => {
                        this.restoreIdleState(attacker);
                        this.checkBattleContinue(attacker, defender);
                    })
                    .start();
            }, this.battleConfig.time.attackDur);
        } else {
            // 技能攻击动画结束后恢复状态
            this.scheduleOnce(() => {
                this.restoreIdleState(attacker);
                this.checkBattleContinue(attacker, defender);
            }, this.battleConfig.time.attackDur);
        }
    }

    // 处理伤害计算和闪避逻辑
    private handleDamage(
        attacker: 'p1' | 'p2', 
        defender: 'p1' | 'p2', 
        defenderAnimName: string,
        isSkillAttack: boolean  // 接收从doAttack传递的攻击类型判断结果
    ) {
        // 随机判断是否闪避
        const isDodge = Math.random() < this.battleConfig.damage.dodgeRate;

        if (isDodge) {
            // 防御者播放闪避动画
            AudioManager.playEffect(`闪躲`);
            this.playAnimation(defender, 'db', defenderAnimName, 1, true);
        } else {
            // 防御者播放受击动画
            const defenderRoleID = defender === 'p1' ? this.currentP1ID : this.currentP2ID;
            let sj:string = defenderRoleID === 5 || defenderRoleID === 6 || defenderRoleID === 7  ? `女`:`男`;
            AudioManager.playEffect(`${sj}受击`);
            this.playAnimation(defender, 'sj', defenderAnimName, 1, true);

            // 计算伤害
            const baseDmg = this.battleConfig.damage.base;
            const totalDmg = isSkillAttack 
                ? baseDmg + this.battleConfig.damage.skillAdd  // 技能攻击
                : this.hasWeapon[attacker] 
                    ? baseDmg + this.battleConfig.damage.weaponAdd  // 武器攻击
                    : baseDmg;  // 普通攻击

            // 更新血量
            if (defender === 'p1') {
                this.P1HP = Math.max(0, this.P1HP - totalDmg);
                this.updateHPBar('p1', this.P1HP);
            } else {
                this.P2HP = Math.max(0, this.P2HP - totalDmg);
                this.updateHPBar('p2', this.P2HP);
            }

            // 检查是否有角色血量归零
            if (this.P1HP === 0 || this.P2HP === 0) {
                this.flag1 = true;
                // 播放倒地动画
                const deadRole = this.P1HP === 0 ? 'p1' : 'p2';
                this.winner = this.P1HP === 0 ? 'p2' : 'p1';
                this.playAnimation(deadRole, 'dd', this.battleConfig.roleAnim[this[`current${deadRole.toUpperCase()}ID`]], 1, false);
            }
        }
    }

    blink() {
        let blackNode = this.node.getChildByName("black");
        
        blackNode.active = true;
        blackNode.opacity = 0;
        
    cc.tween(blackNode)
        .to(0.5, {opacity: 255})
        .delay(0.5)
        .to(1, {opacity: 0})
        .start();
    }

    // 检查战斗是否继续
    private checkBattleContinue(attacker: 'p1' | 'p2', defender: 'p1' | 'p2') {
        if (this.flag1) {
            this.battleState = 'ended';
            // 等待倒地动画播放完成后结束
            this.scheduleOnce(() => {
                AudioManager.stopMusic();
                AudioManager.playEffect(`获胜`);
                this.vs_ske.active = true;
                const winnerRoleID = this.winner === 'p1' ? this.currentP1ID : this.currentP2ID;
                const winName = this.battleConfig.nameMap[winnerRoleID].winName;
                this.vs_sk.playAnimation(winName, 1);
                this.scheduleOnce(() => {
                    this.vs_ske.active = false;
                }, 2);
            }, 1);
            this.scheduleOnce(() => {
                this.blink();
            }, 5);
            this.scheduleOnce(() => {
                this.restart();
            }, 6); // 等待倒地动画播放时间
            return;
        }

        // 切换回合，继续战斗循环
        this.currentTurn = defender;
        this.isUsingItem = false;

        if (this.battleState === 'attacking' && !this.isUsingItem) {
            this.battleState = 'preparing';
            this.startBattle(); 
        }
    }

    updateHPBar(playerID: string, hp: number) {
        const clampedHP = Math.max(0, Math.min(100, hp));
        const config = {
            p1: { max: 314, min: 80 },
            p2: { max: -316, min: -80 }
        };
        const { max, min } = config[playerID as keyof typeof config];
        const targetX = min + (clampedHP / 100) * (max - min);

        const xNode = this.node.getChildByName(playerID)
            .getChildByName('hp')
            .getChildByName('mask')
            .getChildByName('x');
        xNode && (xNode.x = targetX);
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_hidep1":
                this.hideRole('p1');
                break;
            case "btn_hidep2":
                this.hideRole('p2');
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

    restart() {
        GameData.PauseGame = false;
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            const newScript = UI.getComponent(mgr_lv263);
            newScript.flag3 = this.flag3;
            newScript.flag7 = this.flag7;
            newScript.flag4 = this.flag4;
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }
}