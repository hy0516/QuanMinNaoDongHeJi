const { ccclass, property } = cc._decorator;
import FishLogic from "./FishLogic_lv287";
import AudioManager from "../script/common/AudioManager";

@ccclass
export default class manage_lv287 extends cc.Component {
    @property(cc.Prefab)
    pf: cc.Prefab = null;

    @property
    initMaxTotal = 15;

    @property
    maxTotalPerLevel = 0.2;

    @property
    initSpawnInterval = 1;

    @property
    spawnIntervalReduce = 0.08;

    @property
    trackRandomness = 0.2;

    // 快速鱼配置（核心参数，硬编码保障间隔准确性）
    @property
    fastFishSpawnInterval = 25; // 面板备份，实际用硬编码25秒
    @property
    fastFishSpeedMultiplier = 4; // 10倍速度（原需求翻倍）

    // 定向感叹号提示节点（左/右分开）
    @property(cc.Node)
    exclamationNodeLeft: cc.Node = null; // 左边来鱼提示
    @property(cc.Node)
    exclamationNodeRight: cc.Node = null; // 右边来鱼提示

    public static readonly FISH_CONFIG = [
        {},
        { type: 1, score: 3, name: "小鲤鱼" },
        { type: 2, score: 5, name: "小丑鱼" },
        { type: 3, score: 10, name: "蝴蝶鱼" },
        { type: 4, score: 25, name: "刺尾鱼" },
        { type: 5, score: 40, name: "石斑鱼" },
        { type: 6, score: 50, name: "鲨鱼" },
        { type: 7, score: 70, name: "鲸鱼" }
    ];

    public static readonly GROWTH_STAGES = [
        { level: 1, scoreRange: [0, 139], scaleX: 1.0, scaleY: 1.0, edibleMaxType: 2 },
        { level: 2, scoreRange: [140, 349], scaleX: 1.25, scaleY: 1.25, edibleMaxType: 3 },
        { level: 3, scoreRange: [350, 699], scaleX: 1.5, scaleY: 1.5, edibleMaxType: 4 },
        { level: 4, scoreRange: [700, 1399], scaleX: 1.75, scaleY: 1.75, edibleMaxType: 5 },
        { level: 5, scoreRange: [1400, 2799], scaleX: 2.0, scaleY: 2.0, edibleMaxType: 6 },
        { level: 6, scoreRange: [2800, 5599], scaleX: 2.3, scaleY: 2.3, edibleMaxType: 7 },
        { level: 7, scoreRange: [5600, Infinity], scaleX: 2.6, scaleY: 2.6, edibleMaxType: 7 }
    ];

    public static readonly STAGE_FISH_RATIO = {
        init: {1: 0.35, 2: 0.35, 3: 0.15, 4: 0.1, 5: 0.05},
        mid: {2: 0.25, 3: 0.25, 4: 0.2, 5: 0.15, 6: 0.1, 7: 0.05},
        late: {4: 0.4, 5: 0.3, 6: 0.2, 7: 0.1}
    };

    private static readonly MANAGER_CONST = {
        sx: 650,
        mr: 750,
        minY: -600,
        maxY: 600,
        minKeepRatio: 0.02,
        eliminateProbStep: 0.2,
        maxEliminateProb: 0.9
    };

    private static readonly BASE_RATIO_CONFIG: {[key: number]: {[key: number]: number}} = {
        1: {1: 0.32, 2: 0.28, 3: 0.18, 4: 0.1, 5: 0.07, 6: 0.02, 7: 0.01},
        2: {1: 0.25, 2: 0.25, 3: 0.2, 4: 0.12, 5: 0.1, 6: 0.03, 7: 0.02},
        3: {1: 0.15, 2: 0.25, 3: 0.25, 4: 0.2, 5: 0.1, 6: 0.02, 7: 0.01},
        4: {1: 0.08, 2: 0.15, 3: 0.25, 4: 0.28, 5: 0.15, 6: 0.04, 7: 0.02},
        5: {1: 0.05, 2: 0.1, 3: 0.2, 4: 0.3, 5: 0.2, 6: 0.06, 7: 0.03},
        6: {1: 0.02, 2: 0.08, 3: 0.18, 4: 0.35, 5: 0.2, 6: 0.1, 7: 0.05},
        7: {1: 0.02, 2: 0.05, 3: 0.15, 4: 0.35, 5: 0.22, 6: 0.12, 7: 0.04}
    };

    private static readonly ELIMINATE_CONFIG: {[key: number]: {disappearLevel: number, eliminateProb: number}} = {
        1: { disappearLevel: 3, eliminateProb: 0 },
        2: { disappearLevel: 4, eliminateProb: 0 },
        3: { disappearLevel: 5, eliminateProb: 0 },
        4: { disappearLevel: 7, eliminateProb: 0 },
        5: { disappearLevel: 7, eliminateProb: 0 },
        6: { disappearLevel: 8, eliminateProb: 0 },
        7: { disappearLevel: 9, eliminateProb: 0 }
    };

    private currentPlayerLevel = 1;
    private tempPool: {[key: number]: cc.Node} = {};
    public objPool: {[key: number]: cc.Node[]} = {};
    public active: cc.Node[] = [];
    private root: cc.Node = null;
    private currRatio: {[key: number]: number} = {};
    private typeCount: {[key: number]: number} = {};
    private currentMaxTotal = 0;
    private currentSpawnInterval = 0;

    onLoad() {
        this.initRoot();
        this.initTempPool();
        this.updateLevelRelatedParams();
        this.refreshRatio(manage_lv287.STAGE_FISH_RATIO.init, 1);
        this.schedule(this.spawn, this.currentSpawnInterval);
        this.schedule(this.randomizeActiveFishTrack, 1.5);
        this.schedule(this.updateEliminateProb, 20);
        
        // 核心修复1：硬编码25秒间隔，彻底杜绝配置/面板偏差
        this.schedule(this.spawnMaxLevelFastFish, 25); 
        
        // 初始化感叹号节点为隐藏（双重保障）
        if (this.exclamationNodeLeft) this.exclamationNodeLeft.active = false;
        if (this.exclamationNodeRight) this.exclamationNodeRight.active = false;
    }

    onDestroy() {
        for (const key in this.objPool) this.objPool[key].forEach(n => n.destroy());
        this.active.forEach(n => n.destroy());
        this.root?.destroy();
        this.unscheduleAllCallbacks();
    }

    update() {
        this.checkOut();
        this.limitActiveFishCount();
    }

    private initRoot() {
        this.root = cc.instantiate(this.pf);
        this.root.parent = this.node;
        this.root.active = true;
    }

    private initTempPool() {
        if (!this.root) return;
        for (let i = 0; i < this.root.children.length; i++) {
            const c = this.root.children[i];
            const fl = c.getComponent(FishLogic);
            if (fl) {
                const type = fl.type;
                this.tempPool[type] = c;
                this.objPool[type] = [];
                this.typeCount[type] = 0;
                c.active = false;
                const player = cc.find("Canvas/player_lv287")?.getComponent("player_lv287");
                if (player) {
                    const edibleMaxType = player.getEdibleMaxType();
                    const gNode = c.getChildByName("g");
                    if (gNode) gNode.active = type <= edibleMaxType;
                }
            }
        }
    }

    private updateLevelRelatedParams() {
        this.currentMaxTotal = this.initMaxTotal + (this.currentPlayerLevel - 1) * this.maxTotalPerLevel;
        this.currentSpawnInterval = Math.max(0.4, this.initSpawnInterval - (this.currentPlayerLevel - 1) * this.spawnIntervalReduce);
        this.unschedule(this.spawn);
        this.schedule(this.spawn, this.currentSpawnInterval);
    }

    public refreshRatio(ratio: {[key: number]: number}, playerLevel: number = 1) {
        this.currentPlayerLevel = playerLevel;
        this.updateLevelRelatedParams();

        const finalRatio: {[key: number]: number} = {};
        for (const typeStr in ratio) {
            const type = Number(typeStr);
            const baseProb = ratio[type];
            const eliminateItem = manage_lv287.ELIMINATE_CONFIG[type];
            let keepProb = 1;
            if (eliminateItem && this.currentPlayerLevel >= eliminateItem.disappearLevel) {
                keepProb = 1 - eliminateItem.eliminateProb;
            }
            finalRatio[type] = Math.max(manage_lv287.MANAGER_CONST.minKeepRatio, baseProb * keepProb);
        }

        let total = 0;
        for (const key in finalRatio) total += finalRatio[Number(key)];
        if (total <= 0) total = 1;
        
        this.currRatio = {};
        for (const key in finalRatio) {
            this.currRatio[Number(key)] = finalRatio[Number(key)] / total;
        }
    }

    private spawn() {
        if (this.active.length >= this.currentMaxTotal || Object.keys(this.currRatio).length === 0) return;
        const type = this.getRandomType();
        if (!this.tempPool[type]) return;

        const typeWeight = type >= 6 ? 1.1 : (type >= 4 ? 1.2 : 1);
        const maxTypeCount = Math.round(this.currRatio[type] * this.currentMaxTotal * typeWeight);
        if (this.typeCount[type] >= maxTypeCount) return;

        let fishNode = this.objPool[type].pop();
        if (!fishNode) {
            fishNode = cc.instantiate(this.tempPool[type]);
            fishNode.parent = this.root;
        }

        fishNode.active = true;
        this.active.push(fishNode);
        this.typeCount[type] = Math.max(0, this.typeCount[type] + 1);
        this.setFishProps(fishNode, type);
    }

    // 核心升级1：随机方向（左/右）+ 预先生成鱼Y轴，感叹号Y轴同步鱼位置
    private spawnMaxLevelFastFish() {
        const maxFishType = manage_lv287.FISH_CONFIG.length - 1; // 固定7级鱼
        if (!this.tempPool[maxFishType]) return;

        // 随机决定生成方向（左/右，各50%概率）
        const isLeftSpawn = Math.random() > 0.5;
        // 预先生成鱼的Y轴位置（与实际生成位置完全一致）
        const fishSpawnY = Math.random() * (manage_lv287.MANAGER_CONST.maxY - manage_lv287.MANAGER_CONST.minY) + manage_lv287.MANAGER_CONST.minY;
        // 显示对应方向感叹号（Y轴同步鱼位置，1.5秒后自动隐藏）
        this.showDirectionalExclamation(isLeftSpawn, fishSpawnY);

        // 延迟1.5秒执行鱼生成（与感叹号显示时长同步）
        this.scheduleOnce(() => {
            this.createFastFish(maxFishType, isLeftSpawn, fishSpawnY);
        }, 1.5);
    }

    // 核心升级2：接收Y轴参数，确保鱼生成位置与感叹号一致
    private createFastFish(type: number, isLeftSpawn: boolean, spawnY: number) {
        let fishNode = this.objPool[type].pop();
        if (!fishNode) {
            fishNode = cc.instantiate(this.tempPool[type]);
            fishNode.parent = this.root;
        }

        fishNode.active = true;
        this.active.push(fishNode);
        this.typeCount[type] = Math.max(0, this.typeCount[type] + 1);
        this.setFastFishProps(fishNode, type, isLeftSpawn, spawnY);
    }

    // 核心修复：感叹号Y轴与鱼生成位置同步，1.5秒后自动隐藏
    private showDirectionalExclamation(isLeftSpawn: boolean, targetY: number) {
        AudioManager.playEffect(`危险`);
        // 先隐藏所有感叹号，避免重叠
        if (this.exclamationNodeLeft) this.exclamationNodeLeft.active = false;
        if (this.exclamationNodeRight) this.exclamationNodeRight.active = false;

        // 显示对应方向感叹号并同步Y轴
        if (isLeftSpawn && this.exclamationNodeLeft) {
            this.exclamationNodeLeft.setPosition(this.exclamationNodeLeft.x, targetY); // 关键：同步Y轴
            this.exclamationNodeLeft.active = true;
            // 1.5秒后自动隐藏
            this.scheduleOnce(() => {
                if (this.exclamationNodeLeft.isValid) this.exclamationNodeLeft.active = false;
            }, 1.5);
        } else if (!isLeftSpawn && this.exclamationNodeRight) {
            this.exclamationNodeRight.setPosition(this.exclamationNodeRight.x, targetY); // 关键：同步Y轴
            this.exclamationNodeRight.active = true;
            // 1.5秒后自动隐藏
            this.scheduleOnce(() => {
                if (this.exclamationNodeRight.isValid) this.exclamationNodeRight.active = false;
            }, 1.5);
        }
    }

    private getRandomType(): number | null {
        const rand = Math.random();
        let probabilitySum = 0;
        for (const key in this.currRatio) {
            const type = Number(key);
            const weightedProb = type >= 6 ? this.currRatio[type] * 0.9 : (type >= 4 ? this.currRatio[type] * 1.1 : this.currRatio[type]);
            probabilitySum += weightedProb;
            if (rand <= probabilitySum) return type;
        }
        return null;
    }

    private setFishProps(fishNode: cc.Node, type: number) {
        const fishLogic = fishNode.getComponent(FishLogic);
        if (!fishLogic) return;

        const isLeftSpawn = Math.random() > 0.5;
        const spawnX = isLeftSpawn ? -manage_lv287.MANAGER_CONST.sx : manage_lv287.MANAGER_CONST.sx;
        const narrowedMinY = manage_lv287.MANAGER_CONST.minY * 0.9;
        const narrowedMaxY = manage_lv287.MANAGER_CONST.maxY * 0.9;
        const spawnY = Math.random() * (narrowedMaxY - narrowedMinY) + narrowedMinY;

        fishNode.setPosition(spawnX, spawnY);
        fishLogic.setMoveDir(isLeftSpawn ? 1 : -1);
        fishLogic.initSpeed();
        fishNode.angle = Math.random() * 15 - 7.5;

        const player = cc.find("Canvas/player_lv287")?.getComponent("player_lv287");
        if (player) {
            const edibleMaxType = player.getEdibleMaxType();
            const gNode = fishNode.getChildByName("g");
            if (gNode) gNode.active = type <= edibleMaxType;
        }
    }

    // 快速鱼属性设置（接收Y轴参数，确保与感叹号位置一致）
    private setFastFishProps(fishNode: cc.Node, type: number, isLeftSpawn: boolean, spawnY: number) {
        const fishLogic = fishNode.getComponent(FishLogic);
        if (!fishLogic) return;

        // 根据方向设置X轴，Y轴使用预先生成的位置（与感叹号同步）
        const spawnX = isLeftSpawn ? -manage_lv287.MANAGER_CONST.sx : manage_lv287.MANAGER_CONST.sx;

        fishNode.setPosition(spawnX, spawnY);
        fishLogic.setMoveDir(isLeftSpawn ? 1 : -1); // 方向与生成位置一致
        fishLogic.initSpeed();
        fishLogic.speed *= this.fastFishSpeedMultiplier; // 10倍速度
        fishNode.angle = 0; // 水平快速穿行

        const player = cc.find("Canvas/player_lv287")?.getComponent("player_lv287");
        if (player) {
            const edibleMaxType = player.getEdibleMaxType();
            const gNode = fishNode.getChildByName("g");
            if (gNode) gNode.active = type <= edibleMaxType;
        }
    }

    private randomizeActiveFishTrack() {
        this.active.forEach(fishNode => {
            if (!fishNode.isValid) return;
            const fishLogic = fishNode.getComponent(FishLogic);
            if (!fishLogic) return;
            const randomOffset = (Math.random() - 0.5) * 2 * this.trackRandomness;
            const currPos = fishNode.position;
            fishNode.setPosition(currPos.x, currPos.y + randomOffset * 30);
        });
    }

    private checkOut() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const fishNode = this.active[i];
            if (!fishNode.isValid) {
                this.active.splice(i, 1);
                continue;
            }
            const worldPos = fishNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            const nodePos = this.node.convertToNodeSpaceAR(worldPos);
            if (Math.abs(nodePos.x) > manage_lv287.MANAGER_CONST.mr || Math.abs(nodePos.y) > manage_lv287.MANAGER_CONST.mr) {
                this.recycleFish(fishNode);
            }
        }
    }

    private limitActiveFishCount() {
        while (this.active.length > this.currentMaxTotal) {
            const randomIdx = Math.floor(Math.random() * this.active.length);
            const fishNode = this.active[randomIdx];
            this.recycleFish(fishNode);
        }
    }

    public recycleFish(fishNode: cc.Node) {
        if (!fishNode.isValid) return;
        const fishLogic = fishNode.getComponent(FishLogic);
        if (!fishLogic) return;

        const index = this.active.findIndex(node => node === fishNode);
        if (index !== -1) this.active.splice(index, 1);

        this.typeCount[fishLogic.type] = Math.max(0, this.typeCount[fishLogic.type] - 1);
        this.objPool[fishLogic.type].push(fishNode);
        fishNode.active = false;
    }

    private updateEliminateProb() {
        for (const typeStr in manage_lv287.ELIMINATE_CONFIG) {
            const type = Number(typeStr);
            const config = manage_lv287.ELIMINATE_CONFIG[type];
            config.eliminateProb = Math.min(manage_lv287.MANAGER_CONST.maxEliminateProb, config.eliminateProb + manage_lv287.MANAGER_CONST.eliminateProbStep);
        }
        this.refreshRatio(this.currRatio, this.currentPlayerLevel);
    }

    public resetEliminateProb() {
        for (const typeStr in manage_lv287.ELIMINATE_CONFIG) {
            manage_lv287.ELIMINATE_CONFIG[Number(typeStr)].eliminateProb = 0;
        }
        this.refreshRatio(this.currRatio, this.currentPlayerLevel);
    }

    public static getStageByLevel(level: number) {
        return this.GROWTH_STAGES.find(stage => stage.level === level) || this.GROWTH_STAGES[0];
    }

    public static getFishConfigByType(type: number) {
        return this.FISH_CONFIG[type] || {};
    }
}