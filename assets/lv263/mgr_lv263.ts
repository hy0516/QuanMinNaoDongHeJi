import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

enum SpeedState {
    NORMAL,   // 正常速度（run）
    FAST,     // 快速（fastrun）
    SLOW      // 慢速（slowlyrun）
}

@ccclass
export default class mgr_lv263 extends BaseGame {
    @property
    stop: number = 0; // 下蹲时速度为0
    @property
    run: number = 400; // 正常速度
    @property
    fastrun: number = 800; // 快速
    @property
    slowlyrun: number = 100; // 慢速

    // 进度条属性
    @property(cc.ProgressBar)
    fireProgressBar: cc.ProgressBar = null;
    @property(cc.ProgressBar)
    loadProgressBar: cc.ProgressBar = null;

    @property
    progressDuration: number = 0.5; // 进度条动画持续时间

    speed: number = 0; // 当前实际速度
    private screenWidth: number = 0;
    private isGameStarted: boolean = false; // 标记游戏是否已开始

    // 米数统计相关
    private totalDistance: number = 0; // 总移动像素数
    private pixelToMeter: number = 100; // 像素转米比例（100像素=1米）
    private currentMeters: number = 0; // 当前米数

    miLabel: cc.Label = null; // 米数显示Label

    // 特殊物品（name=1）生成控制
    private specialItemName: string = "1"; // 特殊物品名称
    private targetDistance: number = 290; // 目标生成距离（300米）
    private hasGeneratedSpecial: boolean = false; // 是否已生成

    // 速度状态管理
    private currentSpeedState: SpeedState = SpeedState.NORMAL;
    private lastActiveState: SpeedState = SpeedState.NORMAL;
    private fastDuration: number = 5;
    private slowDuration: number = 3;
    private currentStateTimer: number = 0;

    @property(cc.Node)
    bgNodes1: cc.Node = null;
    @property(cc.Node)
    bgNodes2: cc.Node = null;
    @property(cc.Node)
    bgNodes3: cc.Node = null;
    @property(cc.Prefab)
    newPrefab: cc.Prefab = null;

    // yt相关
    @property(cc.Prefab)
    yt: cc.Prefab = null;
    @property(cc.Node)
    manageNode: cc.Node = null;
    pool: cc.Node[] = [];
    actObjects: cc.Node[] = [];
    RefreshTime: number = 0;

    // wp相关
    @property(cc.Prefab)
    wp: cc.Prefab = null;
    @property(cc.Node)
    wpNode: cc.Node = null;
    wpPool: cc.Node[] = [];
    wpAct: cc.Node[] = [];
    wpRT: number = 0;

    private specialNames: string[] = ["2"];
    private specialInitCount: number = 5;
    @property
    specialGenerateCount: number = 5;
    specialGap: number = 150;
    @property
    specialRefresh: number = 10;
    private specialWpRT: number = 0;
    private currentSpecialName: string = "2";

    @property(cc.Node)
    lostLabel: cc.Node = null;

    lab_pb: cc.Node;
    PB: cc.Node;
    isshowVideo = false;
    flag = true;
    isTouching: boolean = false;
    bgWidth: number = 0;
    private objRelatedBgMap: Map<cc.Node, cc.Node> = new Map();

    p_name = "lm";
    p_ske;
    p_sk;
    @property(cc.Node)
    p_Node:cc.Node = null;;
        
    touch: cc.Node = null; // 触摸控制节点
    flagvideo1: boolean = false;
    flagvideo2: boolean = false;
    flaghz: boolean = false;
    chooseNode: cc.Node = null;

    fireNum: number = 0;
    coinNum: number = 0;

    // 掩体检查相关
    private checkInterval: number = 10;
    private checkTimer: number = 0;
    private isChecking: boolean = false;
    light_ske;
    light_sk;
    yh_ske;
    yh_sk;
    step;
    @property
    lv:number = 1;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`lv263`);
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.screenWidth = cc.winSize.width;
        
        this.step = this.node.getChildByName("step").getComponent(cc.AudioSource);
        this.step.mute = true;
        this.updateDistanceDisplay();

        this.initBg();
        this.initPool();
        this.initWpPool();

        this.speed = this.stop;
        this.currentSpeedState = SpeedState.NORMAL;
        this.lastActiveState = SpeedState.NORMAL;

        this.p_ske = this.node.getChildByName("p_ske");
        this.p_sk = this.p_ske.getComponent(dragonBones.ArmatureDisplay);
        this.p_sk.playAnimation(`${this.p_name}_bt2`, 0);

        this.chooseNode = this.node.getChildByName("bg2");
        this.touch = this.node.getChildByName("touch");

        this.RefreshTime = 10 - Math.random() * 8;
        this.wpRT = 2;
        this.specialWpRT = this.specialRefresh;

        this.light_ske = this.node.getChildByName("bg").getChildByName("light");
        this.light_sk = this.light_ske.getComponent(dragonBones.ArmatureDisplay);
        this.yh_ske = this.node.getChildByName("bg").getChildByName("yh");
        this.yh_sk = this.yh_ske.getComponent(dragonBones.ArmatureDisplay);
        
        this.miLabel = this.node.getChildByName("mi").getChildByName("label").getComponent(cc.Label);
        this.checkTimer = this.checkInterval + (Math.random() * 5 - 2.5);
        this.generateInitialYT();
        
        
        this.fireProgressBar.progress = 0;
        this.loadProgressBar.progress = 0;

        if(this.lv === 1){
            const fd = this.node.getChildByName("bg2");
            cc.tween(fd)
                .to(0.5, {scale: 1})
                .start();
        }
        if(this.lv === 2){
            console.log(`${this.p_name}`);
            this.targetDistance = 390;
            this.setSpeedState(SpeedState.NORMAL);
            this.isTouching = false;
            this.changeAnimation();
            this.node.getChildByName("btn_start").active = false;
            this.node.getChildByName("btn_hz").active = true;
            this.node.getChildByName("fire").active = true;
            this.initTouch();
            this.isGameStarted = true;
        }

    }

    update(dt) {
        if (GameData.PauseGame || !this.isGameStarted) return;

        // 累计移动距离并更新米数
        this.totalDistance += this.speed * dt;
        this.currentMeters = Math.floor(this.totalDistance / this.pixelToMeter);
        this.updateDistanceDisplay();

        // 300米时生成特殊物品（name=1）
        if (this.currentMeters >= this.targetDistance && !this.hasGeneratedSpecial) {
            this.generateSpecialItemAt300m();
            this.hasGeneratedSpecial = true;
        }

        // 背景移动
        this.bgNodes1.x -= this.speed * dt;
        this.bgNodes2.x -= this.speed * dt;
        this.bgNodes3.x -= this.speed * dt;
        this.ResetBg();

        // yt和wp更新
        this.updActObjects(dt);
        this.handleObjRefresh(dt);
        this.updWp(dt);
        this.handleWpRefresh(dt);
        this.handleSpecialWpRefresh(dt);

        // 速度状态计时
        this.updateSpeedState(dt);

        // 更新检查计时器
        this.updateCheckTimer(dt);
    }

    private updateLoadProgress() {
        if (!this.loadProgressBar || !this.p_Node) return;
        
        const totalTargetMeters = 680; // 两关总目标：290（第一关）+390（第二关）=680米
        let currentTotalMeters: number; // 总累计米数（用于进度条计算）
        
        if (this.lv === 1) {
            // 第一关：总累计米数 = 第一关当前米数（0→290）
            currentTotalMeters = this.currentMeters;
        } else {
            // 第二关：总累计米数 = 290（第一关基础） + 第二关当前米数（0→390）
            currentTotalMeters = 290 + this.currentMeters;
        }
        
        // 限制总累计米数在0~680之间（避免超过100%）
        currentTotalMeters = Math.max(0, Math.min(currentTotalMeters, totalTargetMeters));
        // 计算进度（0~1）
        const progress = currentTotalMeters / totalTargetMeters;
        
        // 更新进度条和p_Node位置
        this.loadProgressBar.progress = progress;
        const startX = -320;
        const endX = 320;
        this.p_Node.x = startX + (endX - startX) * progress;
    }

    // 统一更新所有米数显示
    private updateDistanceDisplay() {
        const displayText = `当前：${this.currentMeters}米`;
        if (this.miLabel) this.miLabel.string = displayText;
        this.updateLoadProgress();
    }

    // 300米生成特殊物品（name=1）
    private generateSpecialItemAt300m() {
        const targetItem = this.wpPool.find(item => item.name === this.specialItemName);

        const index = this.wpPool.indexOf(targetItem);
        this.wpPool.splice(index, 1);

        const startX = this.screenWidth * 1.2;
        targetItem.x = startX;
        targetItem.active = true;
        targetItem["hasTriggered"] = false;
        this.wpAct.push(targetItem);
    }

    // 生成初始位置（x=0）的yt
    private generateInitialYT() {
        if (this.pool.length <= 0) return;

        const randomIndex = Math.floor(Math.random() * this.pool.length);
        const obj = this.pool.splice(randomIndex, 1)[0];

        obj.x = 0;
        obj.active = true;
        this.actObjects.push(obj);

        this.objRelatedBgMap.set(obj, this.bgNodes1);
        this.syncMaskBgPosition(obj);
    }

    private updateCheckTimer(dt: number) {
        if (this.isChecking) return;

        this.checkTimer -= dt;
        if (this.checkTimer <= 0) {
            this.startCoverCheck();
            this.checkTimer = this.checkInterval + (Math.random() * 5 - 2.5);
        }
    }

    private startCoverCheck() {
        if (this.isChecking) return;
        
        this.isChecking = true;
        
        this.playCheckAnimation(() => {
            this.light_ske.active = false;
            this.checkCoverAtOrigin();
            this.isChecking = false;
        });
    }

    private playCheckAnimation(callback: Function) {
        const originalY = this.yh_ske.y;
        if(this.lv == 1){
            this.yh_sk.playAnimation(`yh_dj`, 0);
        } else {
            this.yh_sk.playAnimation(`yh_dj2`, 0);
        }
        AudioManager.playEffect(`挖掘机里腌萝卜歌曲`);
        this.scheduleOnce(() => {
            AudioManager.playEffect(`挖掘机里腌萝卜歌曲`);
        }, 4);
        cc.tween(this.yh_ske)
            .to(1, { y: originalY + 600 })
            .delay(2)
            .call(() => {
                this.light_ske.active = true;
                this.light_sk.playAnimation(`hg`, 1);
                AudioManager.playEffect(`激光扫射`)
                this.scheduleOnce(() => {
                    if (callback) callback();
                }, 1.5);
            })
            .start();
    }

    private checkCoverAtOrigin() {
        const checkStartX = -50;
        const checkEndX = 50;
        const originalY = this.yh_ske.y;
        let hasCover = false;

        for (const obj of this.actObjects) {
            if (!obj.active) continue;
            if (obj.x - obj.width/2 <= checkStartX && obj.x + obj.width/2 >= checkEndX) {
                hasCover = true;
                break;
            }
        }

        if (!hasCover) {
            if (!this.flaghz) {
                if(this.lv === 1){
                    this.yh_sk.playAnimation(`yh_zhua`, 1);
                } else {
                    this.yh_sk.playAnimation(`yh_zhua2`, 1);
                }
                this.speed = 0; // 立即停止移动
                // 关键修复1：死亡时立即暂停游戏并禁用触摸，防止后续交互
                GameData.PauseGame = true; 
                if (this.touch) this.touch.active = false;

                this.step.mute = true;
                this.p_sk.playAnimation(`${this.p_name}_sh`, 1);
                AudioManager.playEffect(`石化`);
                AudioManager.playEffect(`被抓时恶魔坏笑`);

                cc.tween(this.yh_ske)
                .delay(1)
                .to(1, { y: originalY - 600 })
                .start();
                this.scheduleOnce(() => {
                    // 显示失败界面
                    const lostNode = this.node.getChildByName("lost");
                    if (lostNode) {
                        lostNode.active = true;
                        this.lostLabel.getComponent(cc.Label).string = `当前逃脱：${this.currentMeters}米`;
                    }
                }, 3);
                return;
            } else {
                this.flaghz = false;
                AudioManager.playEffect(`保护罩破裂`);
                this.changeAnimation();
            }
        }
        if(this.lv === 1){
            this.yh_sk.playAnimation(`yh_wh`, 1);
        } else {
            this.yh_sk.playAnimation(`yh_wh2`, 1);
        }
        AudioManager.playEffect(`恶魔未疑问`);
        cc.tween(this.yh_ske)
        .delay(1)
        .to(1, { y: originalY - 600 })
        .start();
    }

    private updateSpeedState(dt: number) {
        if (this.currentSpeedState === SpeedState.NORMAL) return;

        this.currentStateTimer -= dt;
        if (this.currentStateTimer <= 0) {
            // 保存当前状态用于动画判断
            const wasFast = this.currentSpeedState === SpeedState.FAST;
            const wasSlow = this.currentSpeedState === SpeedState.SLOW;
            
            // 重置状态
            this.currentSpeedState = SpeedState.NORMAL;
            this.lastActiveState = SpeedState.NORMAL;
            
            // 恢复正常速度
            if (!this.isTouching) {
                this.speed = this.run;
            }
            
            // 关键修复：状态切换时强制更新动画
            if (wasFast || wasSlow) {
                this.changeAnimation();
            }
        }
    }

    private setSpeedState(state: SpeedState) {
        this.currentSpeedState = state;
        this.lastActiveState = state;

        if (!this.isTouching) {
            switch (state) {
                case SpeedState.NORMAL:
                    this.speed = this.run;
                    this.currentStateTimer = 0;
                    break;
                case SpeedState.FAST:
                    this.speed = this.fastrun;
                    this.currentStateTimer = this.fastDuration;
                    break;
                case SpeedState.SLOW:
                    this.speed = this.slowlyrun;
                    this.currentStateTimer = this.slowDuration;
                    break;
            }
        }

        this.changeAnimation();
    }

    ResetBg() {
        const maxX = Math.max(this.bgNodes1.x, this.bgNodes2.x, this.bgNodes3.x);
        
        if (this.bgNodes1.x <= -this.bgWidth) {
            this.bgNodes1.x = maxX + this.bgWidth;
        }
        if (this.bgNodes2.x <= -this.bgWidth) {
            this.bgNodes2.x = maxX + this.bgWidth;
        }
        if (this.bgNodes3.x <= -this.bgWidth) {
            this.bgNodes3.x = maxX + this.bgWidth;
        }
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
        if (this.touch) {
            this.touch.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.touch.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.touch.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
        this.objRelatedBgMap.clear();
    }

    initPool() {
        const Instance = cc.instantiate(this.yt);
        const nodes = Instance.children
            .filter(node => !isNaN(parseInt(node.name)))
            .sort((a, b) => parseInt(a.name) - parseInt(b.name));

        nodes.forEach(node => {
            node.anchorX = 0.5;
            node.anchorY = 0.5;
            const mask1 = node.getChildByName("mask1");
            const mask2 = mask1?.getChildByName("mask2");
            const bg = mask2?.getChildByName("bg");
            if (mask1 && mask2 && bg) {
                mask1.anchorX = 0.5;
                mask1.anchorY = 0.5;
                mask2.anchorX = 0.5;
                mask2.anchorY = 0.5;
                bg.anchorX = 0.5;
                bg.anchorY = 0.5;
            }
            node.parent = this.manageNode;
            node.active = false;
            this.pool.push(node);
        });
        Instance.destroy();
    }

    // 初始化wp池时包含name=1的物品
    initWpPool() {
        const Instance = cc.instantiate(this.wp);
        const nodes = Instance.children
            .filter(node => !isNaN(parseInt(node.name)))
            .sort((a, b) => parseInt(a.name) - parseInt(b.name));

        nodes.forEach(node => {
            const generateCount = node.name === this.specialItemName 
                ? 1 
                : (this.specialNames.includes(node.name) ? this.specialInitCount : 1);

            for (let i = 0; i < generateCount; i++) {
                const nodeCopy = cc.instantiate(node);
                nodeCopy.parent = this.wpNode;
                nodeCopy.active = false;
                nodeCopy["hasTriggered"] = false;
                this.wpPool.push(nodeCopy);
            }
        });
        Instance.destroy();
    }

    changedHz() {
        this.flaghz = !this.flaghz;
        this.changeAnimation();
    }

    
    updActObjects(dt: number) {
        for (let i = this.actObjects.length - 1; i >= 0; i--) {
            const obj = this.actObjects[i];
            if (!obj.active) {
                this.actObjects.splice(i, 1);
                this.objRelatedBgMap.delete(obj);
                continue;
            }
            obj.x -= this.speed * dt;

            const mask1 = obj.getChildByName("mask1");
            const mask2 = mask1?.getChildByName("mask2");
            const bg = mask2?.getChildByName("bg");
            if (mask2 && bg) {
                const maxRot = 70;
                const screenHalfWidth = this.screenWidth / 2;
                const extendDistance = screenHalfWidth;
                
                const leftStart = -screenHalfWidth - extendDistance;
                const rightEnd = screenHalfWidth + extendDistance;

                let mask2Rot = 0;
                if (obj.x <= leftStart) {
                    mask2Rot = maxRot;
                } else if (obj.x >= rightEnd) {
                    mask2Rot = -maxRot;
                } else {
                    const totalDistance = rightEnd - leftStart;
                    const ratio = (obj.x - leftStart) / totalDistance;
                    mask2Rot = maxRot - (maxRot * 2 * ratio);
                }

                bg.angle = mask2Rot;
                mask2.angle = -mask2Rot;
                this.syncMaskBgPosition(obj);
            }

            if (obj.x <= -this.bgWidth) {
                this.recordObj(obj);
                this.actObjects.splice(i, 1);
                this.objRelatedBgMap.delete(obj);
            }
        }
    }

    updWp(dt: number) {
        for (let i = this.wpAct.length - 1; i >= 0; i--) {
            const obj = this.wpAct[i];
            if (!obj.active) {
                this.wpAct.splice(i, 1);
                continue;
            }
            obj.x -= this.speed * dt;

            if (Math.abs(obj.x) < 50 && !obj["hasTriggered"]) {
                this.wpAdd(obj);
            }

            if (obj.x <= -this.screenWidth * 0.5) {
                this.recWp(obj);
                this.wpAct.splice(i, 1);
            }
        }
    }

    // 添加物品触发逻辑
    wpAdd(obj: cc.Node) {
        const val = parseInt(obj.name) || 10;
        obj["hasTriggered"] = true;
        console.log(this.lv);
        switch (val) {
            case 1:
                this.node.getChildByName("step").active = false;
                console.log(this.lv);
                if(this.lv === 1){
                    this.blink();
                    this.scheduleOnce(() => {
                        GameData.curGameName=this.newPrefab.name;
                            cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
                            let preNode: cc.Node = cc.instantiate(this.newPrefab);
                            preNode.parent = cc.find("Canvas");
                            const newScript = preNode.getComponent(mgr_lv263);
                            newScript.p_sk.playAnimation(`${this.p_name}_dj`,0);
                            switch (this.p_name) {
                                case "lm":
                                    newScript.p_Node.getChildByName("1").active = true;
                                    break;
                                case "ml":
                                    newScript.p_Node.getChildByName("2").active = true;
                                    break;
                                case "zy":
                                    newScript.p_Node.getChildByName("3").active = true;
                                    break;
                            }










                            newScript.p_name = this.p_name;
                            this.node.destroy(); 
                        })
                    }, 1);
                } else {
                    GameData.PauseGame = true;
                    this.onwin();
                }
                break;
            case 2:
                this.fireNum++;
                this.recWp(obj);
                AudioManager.playEffect(`吃火花`);
                // 更新进度条 - 缓动增加
                if (this.fireProgressBar) {
                    const targetProgress = this.fireNum / 10;
                    cc.tween(this.fireProgressBar)
                        .to(this.progressDuration, { progress: targetProgress })
                        .start();
                }
                
                // 当达到10时，触发快速状态并让进度条缓动减少到0
                if (this.fireNum >= 10) {
                    this.fireNum = 0;
                    this.setSpeedState(SpeedState.FAST);
                    AudioManager.playEffect(`加速`);
                    // 进度条缓动减少
                    if (this.fireProgressBar) {
                        cc.tween(this.fireProgressBar)
                            .to(this.progressDuration, { progress: 0 })
                            .start();
                    }
                }
                break;
            case 3:
                this.setSpeedState(SpeedState.FAST);
                AudioManager.playEffect(`加速`);
                break;
            case 4:
                this.coinNum += 10;
                this.recWp(obj);
                break;
            case 6:
            case 7:
                AudioManager.playEffect(`踩踏泥潭`);
                this.setSpeedState(SpeedState.SLOW);
                break;
        }
    }

    syncMaskBgPosition(obj: cc.Node) {
        const relatedBg = this.objRelatedBgMap.get(obj);
        if (!relatedBg) return;

        const mask1Node = obj.getChildByName("mask1");
        if (!mask1Node) return;
        const mask2Node = mask1Node.getChildByName("mask2"); 
        if (!mask2Node) return;
        const maskBgNode = mask2Node.getChildByName("bg");
        if (!maskBgNode) return;

        const bgWorldPos = relatedBg.convertToWorldSpaceAR(cc.Vec3.ZERO);
        const bgInMask2Pos = mask2Node.convertToNodeSpaceAR(bgWorldPos);
        maskBgNode.position = bgInMask2Pos;
        maskBgNode.active = true;
        maskBgNode.opacity = 255;
    }

    getFarthestBg(): cc.Node {
        return [this.bgNodes1, this.bgNodes2, this.bgNodes3].reduce((farthest, current) => {
            return current.x > farthest.x ? current : farthest;
        }, this.bgNodes1);
    }

    handleObjRefresh(dt: number) {
        if (this.speed <= 0) return;
        this.RefreshTime -= dt;
        if (this.RefreshTime <= 0) {
            this.RefreshTime = 7 - Math.random() * 5;
            this.generateYT();
        }
    }

    handleWpRefresh(dt: number) {
        if (this.speed <= 0) return;
        this.wpRT -= dt;
        if (this.wpRT <= 0) {
            this.wpRT = 15 + Math.random() * 4;
            const count = 1;
            this.genWp(count);
        }
    }

    handleSpecialWpRefresh(dt: number) {
        if (this.speed <= 0) return;
        this.specialWpRT -= dt;
        if (this.specialWpRT <= 0) {
            this.specialWpRT = this.specialRefresh + Math.random() * 5;
            this.genSpecialWp(this.currentSpecialName);
            this.currentSpecialName = this.currentSpecialName === "2" ? "3" : 
                                     (this.currentSpecialName === "3" ? "4" : "2");
        }
    }

    generateYT() {
        if (this.pool.length <= 0) return;

        const randomIndex = Math.floor(Math.random() * this.pool.length);
        const obj = this.pool.splice(randomIndex, 1)[0];

        const farthestBg = this.getFarthestBg();

        const bgWorldPos = farthestBg.parent.convertToWorldSpaceAR(cc.v2(farthestBg.x, farthestBg.y));
        const manageWorldPos = this.manageNode.parent.convertToWorldSpaceAR(cc.v2(this.manageNode.x, this.manageNode.y));
        const bgToManageOffsetX = bgWorldPos.x - manageWorldPos.x;

        const bgX = farthestBg.x;
        const randomX = bgX + Math.random() * 200 - 100;
        obj.x = bgToManageOffsetX + (randomX - bgX);
        obj.active = true;
        this.actObjects.push(obj);

        this.objRelatedBgMap.set(obj, farthestBg);
        this.syncMaskBgPosition(obj);
    }

    genWp(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.wpPool.length <= 0) break;

            const availableWp = this.wpPool.filter(obj => 
                !this.specialNames.includes(obj.name) && obj.name !== this.specialItemName
            );
            if (availableWp.length === 0) break;

            const randomIndex = Math.floor(Math.random() * availableWp.length);
            const obj = availableWp[randomIndex];
            this.wpPool.splice(this.wpPool.indexOf(obj), 1);

            const startX = this.screenWidth * 1.2;
            const randomX = startX + Math.random() * 300;
            obj.x = randomX;
            obj.active = true;
            obj["hasTriggered"] = false;
            this.wpAct.push(obj);
        }
    }

    genSpecialWp(targetName: string) {
        const targetWpList = this.wpPool.filter(obj => obj.name === targetName);
        if (targetWpList.length < this.specialGenerateCount) {
            return;
        }

        const startX = this.screenWidth * 1.2;
        for (let i = 0; i < this.specialGenerateCount; i++) {
            const obj = targetWpList[i];
            this.wpPool.splice(this.wpPool.indexOf(obj), 1);
            obj.x = startX + (i * this.specialGap);
            obj.active = true;
            obj["hasTriggered"] = false;
            this.wpAct.push(obj);
        }
    }

    recordObj(obj: cc.Node) {
        obj.active = false;
        obj.x = 0;
        const mask1 = obj.getChildByName("mask1");
        const mask2 = mask1?.getChildByName("mask2");
        const bg = mask2?.getChildByName("bg");
        if (mask2 && bg) {
            mask2.angle = 0;
            bg.angle = 0;
        }
        this.pool.push(obj);
    }

    recWp(obj: cc.Node) {
        obj.active = false;
        obj.x = 0;
        obj["hasTriggered"] = false;
        
        const mask1 = obj.getChildByName("mask1");
        const mask2 = mask1?.getChildByName("mask2");
        const bg = mask2?.getChildByName("bg");
        if (mask2 && bg) {
            mask2.angle = 0;
            bg.angle = 0;
        }
        this.wpPool.push(obj);
    }

    initBg() {
        const sprite = this.bgNodes1.getComponent(cc.Sprite);
        this.bgWidth = sprite.spriteFrame.getOriginalSize().width;
    }

    initTouch() {
        this.touch.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touch.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touch.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    changeAnimation() {
        if (this.isTouching) {
            this.step.mute = true;
            if(!this.flaghz){
                this.p_sk.playAnimation(`${this.p_name}_bt`, 1);
            } else {
                this.p_sk.playAnimation(`${this.p_name}_bthz`, 1);
            }
            this.scheduleOnce(() => {
                if (this.isTouching) {
                    if(!this.flaghz){
                        this.p_sk.playAnimation(`${this.p_name}_bt2`, 0);
                    } else {
                        this.p_sk.playAnimation(`${this.p_name}_dxhz`, 0);
                    }
                }
            }, 0.25);
        } else {
            switch (this.currentSpeedState) {
                case SpeedState.FAST:
                    this.p_sk.playAnimation(this.flaghz ? `${this.p_name}_cchz` : `${this.p_name}_cc`, 0);
                    break;
                case SpeedState.SLOW:
                    this.p_sk.playAnimation(this.flaghz ? `${this.p_name}_hz` : `${this.p_name}_dj`, 0);
                    break;
                default:
                    this.p_sk.playAnimation(this.flaghz ? `${this.p_name}_hz` : `${this.p_name}_dj`, 0);
                    break;
            }
            this.step.mute = false;
        }
    }

    // 关键修复2：触摸事件增加死亡状态判断（失败界面是否显示）
    onTouchStart() {
        const lostNode = this.node.getChildByName("lost");
        if (GameData.PauseGame || (lostNode && lostNode.active)) return;
        this.isTouching = true;
        this.speed = this.stop;
        this.changeAnimation();
    }

    onTouchEnd() {
        const lostNode = this.node.getChildByName("lost");
        if (GameData.PauseGame || (lostNode && lostNode.active)) return;
        this.isTouching = false;
        switch (this.lastActiveState) {
            case SpeedState.FAST:
                this.speed = this.currentStateTimer > 0 ? this.fastrun : this.run;
                break;
            case SpeedState.SLOW:
                this.speed = this.currentStateTimer > 0 ? this.slowlyrun : this.run;
                break;
            default:
                this.speed = this.run;
                break;
        }
        this.changeAnimation();
    }

    pangbai(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB);
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(3.5)
            .to(0.3, { opacity: 0 })
            .call(() => { })
            .start();
    }

    BtnHandler(even: cc.Event.EventTouch) {
        const btnName = even.currentTarget.name;
        // 允许"btn_fh"在暂停状态下执行
        if (GameData.PauseGame && btnName !== "btn_fh") {
            return;
        }
        
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (btnName) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_start":
                this.setSpeedState(SpeedState.NORMAL);
                this.changeAnimation();
                this.node.getChildByName("btn_start").active = false;
                this.node.getChildByName("btn_hz").active = true;
                this.node.getChildByName("fire").active = true;
                this.initTouch();
                switch (this.p_name) {
                    case "lm":
                        this.p_Node.getChildByName("1").active = true;
                        break;
                    case "ml":
                        this.p_Node.getChildByName("2").active = true;
                        break;
                    case "zy":
                        this.p_Node.getChildByName("3").active = true;
                        break;
                }
                this.isGameStarted = true;
                break;
            case "btn_1":
                this.chooseNode.getChildByName("btn_1").getChildByName("gou").active = true;
                this.chooseNode.getChildByName("btn_2").getChildByName("gou").active = false;
                this.chooseNode.getChildByName("btn_3").getChildByName("gou").active = false;
                this.p_name = "lm";
                break;
            case "btn_2":
                if (this.chooseNode.getChildByName("btn_2").getChildByName("video").active) {
                    VideoManager.getInstance().showVideo(() => {
                        this.flagvideo1 = true;
                        this.chooseNode.getChildByName("btn_2").getChildByName("video").active = false;
                    });
                }
                if (this.flagvideo1) {
                    this.chooseNode.getChildByName("btn_2").getChildByName("gou").active = true;
                    this.chooseNode.getChildByName("btn_1").getChildByName("gou").active = false;
                    this.chooseNode.getChildByName("btn_3").getChildByName("gou").active = false;
                    this.p_name = "ml";
                }
                break;
            case "btn_3":
                if (this.chooseNode.getChildByName("btn_3").getChildByName("video").active) {
                    VideoManager.getInstance().showVideo(() => {
                        this.flagvideo2 = true;
                        this.chooseNode.getChildByName("btn_3").getChildByName("video").active = false;
                    });
                }
                if (this.flagvideo2) {
                    this.chooseNode.getChildByName("btn_3").getChildByName("gou").active = true;
                    this.chooseNode.getChildByName("btn_1").getChildByName("gou").active = false;
                    this.chooseNode.getChildByName("btn_2").getChildByName("gou").active = false;
                    this.p_name = "zy";
                }
                break;
            case "btn_4":
                this.chooseNode.active = false;
                this.node.getChildByName("zz").active = false;
                this.node.getChildByName("btn_start").active = true;
                this.p_sk.playAnimation(`${this.p_name}_bt2`, 0);
                switch (this.p_name) {
                    case "lm":
                        this.p_Node.getChildByName("1").active = true;
                        break;
                    case "ml":
                        this.p_Node.getChildByName("2").active = true;
                        break;
                    case "zy":
                        this.p_Node.getChildByName("3").active = true;
                        break;
                }
                break;
            case "btn_hz":
                VideoManager.getInstance().showVideo(() => {
                    this.flaghz = true;
                    AudioManager.playEffect(`保护罩`);
                    this.changeAnimation();
                });
                break;
            case "btn_fh":
                VideoManager.getInstance().showVideo(() => {
                    this.touch.active = true;
                    GameData.PauseGame = false;
                    this.node.getChildByName("lost").active = false;
                    this.isTouching = false
                    this.speed = this.run;
                    this.changeAnimation();
                });
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
    blink() {
        let blackNode = this.node.getChildByName("black");
        
        blackNode.active = true;
        blackNode.opacity = 0;
        
        cc.tween(blackNode)
            .to(1, {opacity: 255})
            .to(1, {opacity: 0})
            .start();
    }
    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        GameData.PauseGame = true;
        this.node.cleanup();
        AudioManager.stopEffect();
        this.endwin("prefabs/hz/endwin_hz");
        this.node.destroy();
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