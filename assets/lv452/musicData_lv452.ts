/**
 * 数据配置
 *
 * 时间说明：
 * - time 字段：箭头到达 check_point 判定线的时间点（秒）
 * - generateTime 字段（可选）：箭头生成的时间点（秒），如果不指定，会自动计算
 * - 移动时间 = time - generateTime（如果 generateTime 未指定，则使用 time - NOTE_PRE_GENERATE_TIME）
 *
 * 时间缩放说明：
 * - TIME_SCALE：时间缩放因子，用于匹配音乐播放速度
 * - 如果音乐播放速度是原来的 0.8 倍，则设置为 1 / 0.8 = 1.25
 * - 如果音乐是正常速度，则设置为 1.0
 */
export const TIME_SCALE: number = 1.25;

export interface NoteData {
    /** 到达 check_point 的节拍时间点（秒） */
    time: number;
    /** 方向索引 0-3（左、上、右、下） */
    direction: number;
    /** 生成时间点（秒），可选 */
    generateTime?: number;
    /** 生成时的 X 坐标（可选，默认屏幕右侧） */
    startX?: number;
}

export interface AnimationTimeRange {
    /** 开始时间（秒） */
    startTime: number;
    /** 结束时间（秒） */
    endTime: number;
}

export interface MusicConfig {
    /** 音频文件名 */
    audioName: string;
    /** 扁平化后的全量谱面数据 */
    notes: NoteData[];
    /** 角色说话动画时间段数组（在这些时间段内播放 daiji2，其他时间播放 daiji1） */
    speakTimeRanges?: AnimationTimeRange[];
}

export const musicConfig_lv452: MusicConfig = {
    audioName: "bgmlv452",
    speakTimeRanges: [
        { startTime: 1.0, endTime: 2.5 },
        { startTime: 3.13, endTime: 4.5 },
        { startTime: 5.2, endTime: 6.6 },
        { startTime: 7.2, endTime: 9.1 },
        { startTime: 11.5, endTime: 13.6 },
        { startTime: 15.8, endTime: 22.1 },
        { startTime: 24.1, endTime: 26.2 },
        { startTime: 28.0, endTime: 28.7 },
        { startTime: 30.1, endTime: 30.8 },
    ],
    
    notes: [
        // 第一波（offset 0）
        { time: 1.5, direction: 2 },
        { time: 2.17, direction: 1 },
        { time: 2.84, direction: 3 },
        { time: 3.5, direction: 2 },

        // 第二波（+0.5s：波与波之间增加 0.5 秒间隔，以下累加）
        { time: 4.5, direction: 3 },
        { time: 5.17, direction: 2 },
        { time: 5.84, direction: 1 },
        { time: 6.5, direction: 0 },

        // 第三波（+1.0s）
        { time: 7.5, direction: 2 },
        { time: 8.0, direction: 3 },
        { time: 8.5, direction: 3 },
        { time: 9.0, direction: 0 },
        { time: 9.5, direction: 0 },

        // 第四波（+1.5s）
        { time: 10.5, direction: 0 },
        { time: 11.0, direction: 2 },
        { time: 11.5, direction: 3 },
        { time: 12.0, direction: 3 },
        { time: 12.5, direction: 1 },

        // 第五波（+2.0s）
        { time: 13.5, direction: 1 },
        { time: 14.0, direction: 3 },
        { time: 14.5, direction: 1 },
        { time: 15.0, direction: 0 },
        { time: 15.5, direction: 1 },
        { time: 16.0, direction: 3 },

        // 第六波（+2.5s）
        { time: 17.0, direction: 2 },
        { time: 17.33, direction: 1 },
        { time: 17.66, direction: 0 },
        { time: 17.99, direction: 1 },
        { time: 18.32, direction: 1 },
        { time: 18.65, direction: 2 },

        // 第七波（+3.0s）
        { time: 20.5, direction: 0 },
        { time: 20.85, direction: 2 },
        { time: 21.2, direction: 1 },
        { time: 21.55, direction: 2 },
        { time: 21.9, direction: 3 },
        { time: 22.25, direction: 0 },
    ],
};

/**
 * 方向映射
 * 0: 左
 * 1: 上
 * 2: 右
 * 3: 下
 */
export const DIRECTION_NAMES = ["左", "上", "右", "下"];
