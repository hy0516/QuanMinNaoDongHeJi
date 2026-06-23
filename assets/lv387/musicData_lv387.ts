/**
 * 数据配置
 * 
 * 时间说明：
 * - time字段：谱子到达check_point判定线的时间点（秒），这是你在视频剪辑软件中看到的节拍点
 * - generateTime字段：谱子生成的时间点（秒）
 * - 移动时间 = time - generateTime
 * 
 * 例如：
 * - time: 5.0 表示谱子在音乐播放到第5秒时到达检查点
 * - 如果 generateTime: 3.0，则谱子会在第3秒生成，移动2秒后到达第5秒判定线
 * 
 * 时间缩放说明：
 * - TIME_SCALE：时间缩放因子，用于匹配音乐播放速度
 * - 如果音乐播放速度是原来的0.8倍，则设置为 1/0.8 = 1.25
 * - 如果音乐是正常速度，则设置为 1.0
 */
export const TIME_SCALE: number = 1; // 0.8倍速对应1.25

export type NoteSide = "left" | "right";

export interface NoteData {
    /** 到达check_point的节拍时间点（秒） */
    time: number;
    /** 生成时间点（秒） */
    generateTime: number;
    /** 左右方向 */
    side: NoteSide;
}
export interface MusicConfig {
    /** 音频文件名 */
    audioName: string;
    /** 所有节拍数据 */
    notes: NoteData[];
}

/**
 * 示例配置数据
 * 你可以根据实际需求修改这个配置
 */
export const musicConfig_lv387: MusicConfig = {
    audioName: "bgmlv387",
    notes: [
        { time: 3.5, generateTime: 1.15, side: "left" },
        { time: 4.5, generateTime: 1.93, side: "left" },
        { time: 4.9, generateTime: 2.69, side: "right" },
        { time: 5.7, generateTime: 3.43, side: "left" },
        { time: 6.32, generateTime: 4.21, side: "left" },
        { time: 6.86, generateTime: 5.06, side: "left" },
        { time: 7.7, generateTime: 5.7, side: "left" },
        { time: 7.7, generateTime: 5.7, side: "right" },
        { time: 8.11, generateTime: 6.11, side: "left" },
        { time: 8.11, generateTime: 6.11, side: "right" },
        { time: 8.48, generateTime: 6.48, side: "left" },
        { time: 8.48, generateTime: 6.48, side: "right" },
        { time: 9.25, generateTime: 7.25, side: "right" },
        { time: 10.11, generateTime: 8.11, side: "right" },
        { time: 10.58, generateTime: 8.58, side: "right" },
        { time: 11.42, generateTime: 9.42, side: "right" },
        { time: 12.30, generateTime: 10.30, side: "right" },
        { time: 13.08, generateTime: 11.08, side: "right" },
        { time: 13.58, generateTime: 11.58, side: "right" },
        { time: 14.42, generateTime: 12.42, side: "left" },
        { time: 15.27, generateTime: 13.27, side: "left" },
        { time: 16.15, generateTime: 14.15, side: "right" },
        { time: 16.57, generateTime: 14.57, side: "left" },
        { time: 17.44, generateTime: 15.44, side: "left" },
        { time: 18.34, generateTime: 16.34, side: "right" },
        { time: 19.14, generateTime: 17.14, side: "left" },
        { time: 20.01, generateTime: 18.01, side: "left" },
        { time: 20.01, generateTime: 18.01, side: "right" },
        { time: 20.43, generateTime: 18.23, side: "left" },
        { time: 20.43, generateTime: 18.23, side: "right" },
        { time: 20.85, generateTime: 18.45, side: "left" },
        { time: 20.85, generateTime: 18.45, side: "right" },
        { time: 24.00, generateTime: 22.00, side: "left" },
        { time: 24.43, generateTime: 22.43, side: "right" },
        { time: 25.36, generateTime: 23.36, side: "right" },
        { time: 26.23, generateTime: 24.23, side: "right" },
        { time: 27.55, generateTime: 25.55, side: "right" },
        { time: 28.50, generateTime: 26.50, side: "left" },
        { time: 28.50, generateTime: 26.50, side: "right" },
        { time: 28.90, generateTime: 27.10, side: "left" },
        { time: 28.90, generateTime: 27.10, side: "right" },
        { time: 29.30, generateTime: 27.30, side: "left" },
        { time: 29.30, generateTime: 27.30, side: "right" },
        { time: 30.17, generateTime: 28.17, side: "left" },
        { time: 30.58, generateTime: 28.58, side: "left" },
        { time: 31.45, generateTime: 29.45, side: "left" },
        { time: 32.29, generateTime: 30.29, side: "right" },
        { time: 33.13, generateTime: 31.13, side: "right" },
        { time: 33.57, generateTime: 31.57, side: "left" },
        { time: 34.45, generateTime: 32.45, side: "left" },
        { time: 35.31, generateTime: 33.31, side: "right" },
        { time: 36.17, generateTime: 34.17, side: "right" },
        { time: 37.03, generateTime: 35.03, side: "right" },
        { time: 37.44, generateTime: 35.44, side: "right" },
        { time: 38.31, generateTime: 36.31, side: "left" },
        { time: 39.16, generateTime: 37.16, side: "right" },
        { time: 40.06, generateTime: 38.06, side: "right" },
        { time: 40.51, generateTime: 38.51, side: "left" },
        { time: 40.51, generateTime: 38.51, side: "right" },
        { time: 41.91, generateTime: 39.12, side: "left" },
        { time: 41.91, generateTime: 39.12, side: "right" },
        { time: 41.31, generateTime: 39.33, side: "left" },
        { time: 41.31, generateTime: 39.33, side: "right" },
    ]
};

