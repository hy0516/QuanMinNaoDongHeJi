export class DailyClickManager {
    private static _instance: DailyClickManager = null;
    private lastClickDate: string = "";

    private constructor() {
        this.loadLastClickDate();
    }

    public static get instance(): DailyClickManager {
        if (!this._instance) {
            this._instance = new DailyClickManager();
        }
        return this._instance;
    }

    // 从本地存储加载上次点击日期
    private loadLastClickDate(): void {
        this.lastClickDate = cc.sys.localStorage.getItem('lastClickDate') || "";
    }

    // 保存上次点击日期到本地存储
    public saveLastClickDate(): void {
        cc.sys.localStorage.setItem('lastClickDate', this.lastClickDate);
    }

    // 获取当前日期字符串（格式：YYYY-MM-DD）
    private getCurrentDateString(): string {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    }

    // 判断是否是新的一天（过了凌晨0点）
    public isNewDay(): boolean {
        const currentDate = this.getCurrentDateString();
        
        if (!this.lastClickDate) {
            // 第一次点击
            this.lastClickDate = currentDate;
            this.saveLastClickDate();
            return true; // 可以视为新的一天
        }
        
        const isNewDay = currentDate !== this.lastClickDate;
        
        if (isNewDay) {
            // 日期变化，更新存储
            this.lastClickDate = currentDate;
            this.saveLastClickDate();
        }
        
        return isNewDay;
    }

    // 强制重置为新的一天（可选）
    public resetAsNewDay(): void {
        this.lastClickDate = "";
        this.saveLastClickDate();
    }
}