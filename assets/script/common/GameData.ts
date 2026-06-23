import levelConfig from "./levelConfig";
import smallLoading from "./smallLoading";
import VideoManager from "./VideoManager";
import common from "./common";
import PowerFlyAnimation from "./PowerFlyAnimation";
import { ItemType } from "../../lv384/feed_config_384";

export default class GameData extends cc.Component {
    public static curLevelId = 0;
    public static curGameName: string = "";
    public static getMap: any[] = [];
    public static PauseGame = false;
    public static tipsNum: number = 0;
    public static _itemList: { [key: string]: cc.Node } = {};
    public static ql: { [key: string]: number } = {};
    public static startTime = 0;
    public static wenziWinNum: number = 0;
    public static curGameStyle = "";
    public static isShowAns = false;
    public static levelData: { [key: string]: boolean } = {};
    public static nextlevelconfig: { [key: number]: string } = {}
    public static nextlevelconfig2: { [key: string]: number } = {}
    public static curSeleStyle = [];
    public static lvConfig: any;

    public static loadLevelFinish = false;
    public static unlockVideoNum = 0;
    public static levelTimer: number = 1750148323255;
    public static time: number = 24;
    public static signRewardTimer: number = 1750148323255;
    public static signRewardNum: number = 1;
    public static piaoNum: number = 0;
    public static curFenLei = "";
    public static signdata = "";
    public static musicSwitch = true;
    public static effectSwitch = true;
    public static refreshLv = true;
    public static isloadLv = false;
    public static power = 10;
    public static isHot = false;
    public static PowerWuXianTimer: number = 1750148323255;
    public static PowerWuXianNum: number = 0;

    // 关卡时长追踪
    public static curLevelEnterTime: number = 0;
    public static curLevelName: string = "";


    public static onInit() {
        var gamedata = cc.sys.localStorage.getItem("GameData");
        var levelTimer = cc.sys.localStorage.getItem("levelTimer");
        var musicSwitch = cc.sys.localStorage.getItem("musicSwitch");
        var effectSwitch = cc.sys.localStorage.getItem("effectSwitch");
        var PowerWuXianTimer = cc.sys.localStorage.getItem("PowerWuXianTimer");
        var PowerWuXianNum = cc.sys.localStorage.getItem("PowerWuXianNum");
        var power = cc.sys.localStorage.getItem("powerNum");
        console.log("[GameData.onInit] Raw PowerWuXianTimer:", PowerWuXianTimer, "type:", typeof PowerWuXianTimer);
        console.log("[GameData.onInit] Raw PowerWuXianNum:", PowerWuXianNum, "type:", typeof PowerWuXianNum);
        if (PowerWuXianTimer != null) this.PowerWuXianTimer = Number(PowerWuXianTimer);
        if (PowerWuXianNum != null) this.PowerWuXianNum = Number(PowerWuXianNum);
        console.log("[GameData.onInit] Converted PowerWuXianTimer:", this.PowerWuXianTimer, "type:", typeof this.PowerWuXianTimer);
        console.log("[GameData.onInit] Converted PowerWuXianNum:", this.PowerWuXianNum, "type:", typeof this.PowerWuXianNum);
        if (this.PowerWuXianNum != 0) {
            var now = new Date().getTime();
            var diff = now - this.PowerWuXianTimer;
            var limit = this.time * 60 * 1000;
            console.log("[GameData.onInit] isWuXian check - now:", now, "timer:", this.PowerWuXianTimer, "diff:", diff, "limit:", limit);
            if (diff > limit) {
                console.log("[GameData.onInit] WuXian expired, resetting to 0");
                this.setPowerWuXiaoNum(0);
            } else {
                console.log("[GameData.onInit] WuXian still active");
            }
        }
        if (musicSwitch && musicSwitch == "1") {
            this.musicSwitch = false;
        }
        if (power) this.power = Number(power);
        if (effectSwitch && effectSwitch == "1") {
            this.effectSwitch = false;
        }

        if (!levelTimer) {
            this.levelTimer = 0;
            this.saveUnlockTime(0);
        }
        else {
            this.levelTimer = levelTimer;
        }
        if (new Date().getTime() - this.levelTimer < this.time * 60 * 60 * 1000) {
            this.unlockVideoNum = 3;
        } else if (this.levelTimer != 0) {
            this.unlockVideoNum = 0;
            this.levelTimer = 0;
            this.saveUnlockTime(0);
            this.levelData = {};
            this.save();
            gamedata = null;
        }

        if (!gamedata) {
            for (let i = 0; i < levelConfig.new.length; i++) {
                var dataitem = levelConfig.new[i];
                if (dataitem.isvideo == false) this.levelData[dataitem.name] = false;
            }
            this.save();
        } else {
            var data
            if (gamedata) data = JSON.parse(gamedata);
            if (data) {
                for (let i = 0; i < levelConfig.new.length; i++) {
                    var dataitem = levelConfig.new[i];
                    if (dataitem.isvideo == false && data[dataitem.name] == null) {
                        data[dataitem.name] = false;
                    }
                }
                this.levelData = data;
            }
            this.save();
        }
    }

    public static setPowerWuXiaoNum(num: number) {
        cc.sys.localStorage.setItem("PowerWuXianNum", JSON.stringify(num));
    }
    public static setPowerWuXiaoTimer(num: number) {
        cc.sys.localStorage.setItem("PowerWuXianTimer", JSON.stringify(num));
    }
    public static isWuXian(): boolean {
        // console.log("[GameData.isWuXian] PowerWuXianNum:", this.PowerWuXianNum, "PowerWuXianTimer:", this.PowerWuXianTimer);
        if (this.PowerWuXianNum != 0) {
            var time = new Date().getTime();
            var diff = time - this.PowerWuXianTimer;
            var limit = this.PowerWuXianNum * 1000;
            var result = diff <= limit;
            // console.log("[GameData.isWuXian] time:", time, "diff:", diff, "limit:", limit, "result:", result);
            return result;
        }
        return false;
    }


    // Power change API: `delta` is an increment (e.g. +3, -1). Keeps memory + localStorage in sync.
    public static setPower(delta: number, showAnimation: boolean = true) {
        const next = Math.max(0, this.power + delta);
        this.power = next;
        cc.sys.localStorage.setItem("powerNum", JSON.stringify(next));
        
        // 播放飘动动画（如果delta不为0且需要显示动画）
        if (delta !== 0 && showAnimation) {
            this.playPowerFlyAnimation(delta);
        }
    }
    public static getPower(): number {
        return this.power;
    }

    public static saveUnlockTime(time: number) {
        cc.sys.localStorage.setItem("levelTimer", JSON.stringify(time));
    }
    public static getlevelData(name: string,): boolean {
        return this.levelData[name];
    }
    public static setlevelData(name: string, lock: boolean) {
        this.levelData[name] = lock;
        this.save();
    }
    public static setmusicSwitch(state: number) {
        if (state == 0) this.musicSwitch = true;
        if (state == 1) this.musicSwitch = false;
        cc.sys.localStorage.setItem("musicSwitch", state.toString());
    }
    public static seteffSwitch(state: number) {
        if (state == 0) this.effectSwitch = true;
        if (state == 1) this.effectSwitch = false;
        cc.sys.localStorage.setItem("effectSwitch", state.toString());
    }
    public static save() {
        cc.sys.localStorage.setItem("GameData", JSON.stringify(this.levelData));
    }
    /**
     * 解锁全部关卡
     */
    public static unlockAll() {
        for (let i = 0; i < levelConfig.new.length; i++) {
            var dataitem = levelConfig.new[i];
            if (this.levelData[dataitem.name] == undefined) this.levelData[dataitem.name] = false;
        }
        this.save();
    }
    public static nextlevel() {
        // 记录当前关卡退出（下一关场景）
        this.recordLevelExit("next");

        // 体力判断：如果不是无限体力，需要检查并扣除体力
        if (GameData.isWuXian() == false) {
            if (GameData.getPower() <= 0) {
                cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                    var HallNode = cc.instantiate(hall);
                    HallNode.parent = cc.find("Canvas");
                    GameData.onDele();
                    GameData.PauseGame = false;
                })
                // 如果不在Hall场景，显示体力不足提示
                common.ShowTipsView("体力不足");
                return;
            }
            // 体力充足，扣除1点体力（会自动播放飘动动画）
            this.setPower(-1, true);
        }

        var le = GameData.nextlevelconfig[GameData.curLevelId + 1];
        GameData.curFenLei = (Math.floor((GameData.curLevelId + 1) / 6) + 1).toString();
        if (!le) le = GameData.nextlevelconfig[0];
        var list = le.split("/");
        GameData.curLevelId++;
        var tb = levelConfig.new.filter(t => t.level == le)[0];
        if (tb) GameData.setlevelData(tb.name, false);
        VideoManager.getInstance().report("enterLv", { name: tb.name + "下一关" });
        cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
            let preNode: cc.Node = cc.instantiate(pre);
            preNode.parent = cc.find("Canvas");
            GameData.curGameName = list[1];
            GameData.curGameStyle = list[0];
            this.onDele();
            preNode.getComponent(smallLoading).PreName = GameData.curGameStyle + "/" + GameData.curGameName;
            preNode.getComponent(smallLoading).onInit();
        })
    }

    /**
     * 播放体力飘动动画
     * @param powerNum 体力数量（正数表示增加，负数表示扣除）
     * @param skipSetPower 是否跳过调用setPower（默认false，setPower已在外部调用）
     */
    public static playPowerFlyAnimation(powerNum: number, skipSetPower: boolean = true): void {
        const canvas = cc.find("Canvas");
        if (!canvas) return;

        // 获取Hall节点
        const hallNode = canvas.getChildByName("Hall");
        if (!hallNode) {
            // 如果Hall节点不存在，直接返回（体力已在setPower中更新）
            return;
        }

        // 使用新的静态方法播放动画（加载powerTips预制体，从屏幕中心飞向左上角）
        PowerFlyAnimation.playWithPrefab(
            canvas,
            powerNum,
            cc.v2(0, 0), // 屏幕中心
            0.8,
            () => {
                // 动画完成回调：刷新UI显示（Hall 可能已切场景/销毁，JSB 下直接触发可能导致空引用）
                if (!cc.isValid(hallNode, true)) return;
                hallNode.dispatchEvent(new cc.Event.EventCustom("freshSign", true));
            }
        );
    }


    public static onDele() {
        GameData._itemList = {};
        GameData.getMap = [];
        GameData.tipsNum = 0;
        GameData.wenziWinNum = 0;
        GameData.ql = {};
        GameData.isShowAns = false;
        // GameData.curLevelId = 0;
        if (this.preserveLv289SkinsOnce) {
            this.preserveLv289SkinsOnce = false;
            this.lv289RestoredMap = {};
        } else {
            this.lv289RoleSkins = {};
            this.lv289RestoredMap = {};
        }
    }

    /**
     * 记录进入关卡
     * @param levelName 关卡名称
     */
    public static recordLevelEnter(levelName: string) {
        this.curLevelName = levelName;
        this.curLevelEnterTime = new Date().getTime();
    }

    /**
     * 记录退出关卡并上报埋点
     * @param exitType 退出类型: "hall" 返回大厅, "next" 下一关
     */
    public static recordLevelExit(exitType: string) {
        if (!this.curLevelName || !this.curLevelEnterTime) {
            return; // 如果没有记录进入时间，直接返回
        }

        const exitTime = new Date().getTime();
        const durationMs = exitTime - this.curLevelEnterTime;
        const durationMinutes = Math.round(durationMs / 60000); // 四舍五入到分钟

        // 构建埋点字段名：关卡名_分钟数
        const eventValue = `${this.curLevelName}_${durationMinutes}`;
        console.log(eventValue);

        // 上报埋点
        VideoManager.getInstance().report(`lvTimeRecord`, { eventValue: eventValue });

        // 清空记录
        this.curLevelName = "";
        this.curLevelEnterTime = 0;
    }

    //#region lv289 outfit sync
    /**
     * 记录 lv289 中每个角色（roleKey）当前使用的换装 prefab
     */
    public static lv289RoleSkins: { [key: string]: cc.Prefab } = {};
    /**
     * 标记“下一次切换场景时需要保留装扮”，作用域仅限一次跳转
     */
    private static preserveLv289SkinsOnce = false;
    /**
     * 避免同一场景生命周期内重复套用缓存装扮
     */
    private static lv289RestoredMap: { [key: string]: boolean } = {};

    /**
     * 记录指定角色当前使用的装扮 prefab
     */
    public static setLv289RoleSkin(roleKey: string, prefab: cc.Prefab) {
        if (!roleKey || !prefab) {
            return;
        }
        this.lv289RoleSkins[roleKey] = prefab;
    }

    /**
     * 获取指定角色缓存的换装 prefab
     */
    public static getLv289RoleSkin(roleKey: string): cc.Prefab | null {
        if (!roleKey) {
            return null;
        }
        return this.lv289RoleSkins[roleKey] || null;
    }

    /**
     * 切换场景前调用，确保本次跳转不会清空装扮缓存
     */
    public static markLv289SkinPreserve() {
        this.preserveLv289SkinsOnce = true;
        this.lv289RestoredMap = {};
    }

    /**
     * 正常离开关卡时调用，强制清空保存的装扮
     */
    public static clearLv289RoleSkins(force: boolean = false) {
        if (!force && this.preserveLv289SkinsOnce) {
            return;
        }
        this.lv289RoleSkins = {};
        this.preserveLv289SkinsOnce = false;
        this.lv289RestoredMap = {};
    }

    /**
     * 判断某个 roleKey 是否需要套用缓存装扮
     */
    public static shouldRestoreLv289Skin(roleKey: string): boolean {
        if (!roleKey) return false;
        if (!this.lv289RoleSkins[roleKey]) return false;
        if (this.lv289RestoredMap[roleKey]) return false;
        return true;
    }

    /**
     * 记录 roleKey 已完成一次恢复，避免重复触发
     */
    public static markLv289SkinRestored(roleKey: string) {
        if (!roleKey) return;
        this.lv289RestoredMap[roleKey] = true;
    }

    /** 记录已加载过音频的关卡样式，避免重复加载 */
    private static loadedAudioStyles: { [key: string]: boolean } = {};

    /**
     * 检查某个关卡样式的音频是否已加载
     */
    public static isAudioLoaded(style: string): boolean {
        return !!this.loadedAudioStyles[style];
    }

    /**
     * 标记某个关卡样式的音频已加载
     */
    public static markAudioLoaded(style: string): void {
        this.loadedAudioStyles[style] = true;
    }

    //#region lv289 广告观看缓存
    /** localStorage 存储 key */
    private static readonly LV289_WATCHED_ADS_KEY = "lv289_watched_ads";
    /** 内存缓存，避免频繁读取 localStorage */
    private static lv289WatchedAdsCache: { [key: string]: boolean } | null = null;

    /**
     * 获取已观看广告的节点集合（从 localStorage 加载）
     */
    private static getLv289WatchedAds(): { [key: string]: boolean } {
        if (this.lv289WatchedAdsCache !== null) {
            return this.lv289WatchedAdsCache;
        }
        const stored = cc.sys.localStorage.getItem(this.LV289_WATCHED_ADS_KEY);
        if (stored) {
            try {
                this.lv289WatchedAdsCache = JSON.parse(stored);
            } catch (e) {
                this.lv289WatchedAdsCache = {};
            }
        } else {
            this.lv289WatchedAdsCache = {};
        }
        return this.lv289WatchedAdsCache;
    }

    /**
     * 保存已观看广告的节点集合到 localStorage
     */
    private static saveLv289WatchedAds(): void {
        const data = this.getLv289WatchedAds();
        cc.sys.localStorage.setItem(this.LV289_WATCHED_ADS_KEY, JSON.stringify(data));
    }

    /**
     * 标记某个节点的广告已观看
     * @param nodeKey 节点唯一标识（建议使用 "场景名_节点名" 格式）
     */
    public static markLv289AdWatched(nodeKey: string): void {
        if (!nodeKey) return;
        const data = this.getLv289WatchedAds();
        data[nodeKey] = true;
        this.saveLv289WatchedAds();
    }

    /**
     * 检查某个节点的广告是否已观看
     * @param nodeKey 节点唯一标识
     */
    public static isLv289AdWatched(nodeKey: string): boolean {
        if (!nodeKey) return false;
        return !!this.getLv289WatchedAds()[nodeKey];
    }

    /**
     * 清除 lv289 广告观看记录（用于重置或测试）
     */
    public static clearLv289WatchedAds(): void {
        this.lv289WatchedAdsCache = {};
        cc.sys.localStorage.removeItem(this.LV289_WATCHED_ADS_KEY);
    }
    //#endregion


     /** lv384 格子：看视频解锁后的 ItemType 列表（独立存储，勿与 GameData 主 JSON 混写） */
     public static readonly storageLv384GridItemUnlockIds = "lv384_grid_item_unlock_ids";

     public static lv384GetUnlockedGridItemIds(): number[] {
         const raw = cc.sys.localStorage.getItem(GameData.storageLv384GridItemUnlockIds);
         if (!raw) {
             return [];
         }
         try {
             const parsed = JSON.parse(raw);
             if (!Array.isArray(parsed)) {
                 return [];
             }
             return parsed.map((n: unknown) => Number(n));
         } catch {
             return [];
         }
     }
 
     public static lv384IsGridItemUnlocked(itemType: number): boolean {
         return GameData.lv384GetUnlockedGridItemIds().indexOf(itemType) >= 0;
     }
 
     public static lv384SetGridItemUnlocked(itemType: number): void {
         const ids = GameData.lv384GetUnlockedGridItemIds();
         if (ids.indexOf(itemType) >= 0) {
             return;
         }
         ids.push(itemType);
         cc.sys.localStorage.setItem(GameData.storageLv384GridItemUnlockIds, JSON.stringify(ids));
     }

}