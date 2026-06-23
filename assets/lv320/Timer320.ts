const { ccclass, property } = cc._decorator;

@ccclass
export class Timer320 extends cc.Component {

    @property(cc.Label)
    timeLabel: cc.Label = null!; // 绑定显示时间的Label组件

    private startTime: number = 0; // 开始时间戳
    private elapsedTime: number = 0; // 已过时间(秒)
    private isRunning: boolean = false; // 计时器状态

    startTimer() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime * 1000;
            this.isRunning = true;
            this.schedule(this.updateTime, 1); // 每秒更新一次显示
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.unschedule(this.updateTime);
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.elapsedTime = 0;
        this.updateTimeDisplay();
    }

    private updateTime() {
        if (this.isRunning) {
            // 计算经过的时间（秒）
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimeDisplay();
        }
    }

    private updateTimeDisplay() {
        // 计算时、分、秒
        const hours = Math.floor(this.elapsedTime / 3600);
        const minutes = Math.floor((this.elapsedTime % 3600) / 60);
        const seconds = this.elapsedTime % 60;
        
        // 格式化显示
        //if (hours > 0) {
            this.timeLabel.string = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
        // } else {
        //     this.timeLabel.string = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
        // }
    }

    // 补零函数
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }
    
    // 获取当前经过的时间（秒）
    getElapsedSeconds(): number {
        return this.elapsedTime;
    }
}