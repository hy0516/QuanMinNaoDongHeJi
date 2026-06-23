import { Lv318Config, Lv318ItemConfig } from "./Lv318Types";
import ItemCellLv318 from "./ItemCellLv318";

/**
 * lv318 全解锁数据管理类
 * 管理看广告次数、24小时计时、全解锁状态检查
 */
export default class Lv318UnlockManager {
    private static readonly VIDEO_COUNT_KEY = "lv318_unlock_video_count";
    private static readonly UNLOCK_START_TIME_KEY = "lv318_unlock_all_start_time";
    private static readonly UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24小时

    /**
     * 获取当前看广告次数 (0-3)
     */
    public static getVideoCount(): number {
        const count = cc.sys.localStorage.getItem(this.VIDEO_COUNT_KEY);
        if (count === null || count === undefined) {
            return 0;
        }
        const num = parseInt(count);
        return isNaN(num) ? 0 : Math.max(0, Math.min(3, num));
    }

    /**
     * 设置看广告次数
     */
    public static setVideoCount(count: number): void {
        const clamped = Math.max(0, Math.min(3, count));
        cc.sys.localStorage.setItem(this.VIDEO_COUNT_KEY, clamped.toString());
    }

    /**
     * 增加看广告次数
     */
    public static addVideoCount(): number {
        const current = this.getVideoCount();
        const newCount = Math.min(3, current + 1);
        this.setVideoCount(newCount);
        return newCount;
    }

    /**
     * 获取全解锁开始时间戳（毫秒）
     */
    public static getUnlockStartTime(): number {
        const time = cc.sys.localStorage.getItem(this.UNLOCK_START_TIME_KEY);
        if (!time) return 0;
        const timestamp = parseInt(time);
        return isNaN(timestamp) ? 0 : timestamp;
    }

    /**
     * 设置全解锁开始时间戳
     */
    public static setUnlockStartTime(timestamp: number): void {
        cc.sys.localStorage.setItem(this.UNLOCK_START_TIME_KEY, timestamp.toString());
    }

    /**
     * 清除全解锁时间戳和次数
     */
    public static clearUnlockData(): void {
        cc.sys.localStorage.removeItem(this.UNLOCK_START_TIME_KEY);
        this.setVideoCount(0);
    }

    /**
     * 检查是否处于全解锁状态（24小时内）
     */
    public static isUnlockAllActive(): boolean {
        const startTime = this.getUnlockStartTime();
        if (startTime === 0) return false;
        
        const now = new Date().getTime();
        const elapsed = now - startTime;
        return elapsed < this.UNLOCK_DURATION_MS;
    }

    /**
     * 检查是否所有需要看广告的元素都已解锁
     * @param config 关卡配置
     */
    public static areAllItemsUnlocked(config: Lv318Config): boolean {
        if (!config || !config.items) return true;
        
        const needVideoItems = config.items.filter(item => item.needVideo === true);
        if (needVideoItems.length === 0) return true;
        
        // 检查所有 needVideo 的元素是否都看过广告
        for (const item of needVideoItems) {
            if (!ItemCellLv318.hasWatched(item.id)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 检查是否需要显示广告按钮
     * @param config 关卡配置
     */
    public static shouldShowVideoButton(config: Lv318Config): boolean {
        // 如果看满3次，不显示
        if (this.getVideoCount() >= 3) {
            return false;
        }
        
        // 如果处于全解锁期间，不显示
        if (this.isUnlockAllActive()) {
            return false;
        }
        
        // 如果所有元素都已解锁，不显示
        if (this.areAllItemsUnlocked(config)) {
            return false;
        }
        
        return true;
    }

    /**
     * 触发全解锁（看满3次后调用）
     */
    public static activateUnlockAll(): void {
        const now = new Date().getTime();
        this.setUnlockStartTime(now);
    }

    /**
     * 检查并清理过期的全解锁状态（24小时后自动清理）
     */
    public static checkAndClearExpiredUnlock(): void {
        if (this.isUnlockAllActive()) {
            return; // 还在有效期内
        }
        
        const startTime = this.getUnlockStartTime();
        if (startTime > 0) {
            // 已过期，清除数据
            this.clearUnlockData();
        }
    }
}
