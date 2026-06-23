/**
 * 数据配置
 * 
 * 时间说明：
 * - time字段：谱子到达check_point判定线的时间点（秒），这是你在视频剪辑软件中看到的节拍点
 * - generateTime字段（可选）：谱子生成的时间点（秒），如果不指定，会自动计算
 * - 移动时间 = time - generateTime（如果generateTime未指定，则使用 time - NOTE_PRE_GENERATE_TIME）
 * 
 * 例如：
 * - time: 5.0 表示谱子在音乐播放到第5秒时到达检查点
 * - 如果NOTE_PRE_GENERATE_TIME = 2.0，则谱子会在第3秒时生成，移动2秒后到达检查点
 * - 如果想自定义生成时间，可以设置 generateTime: 3.5，这样谱子会在第3.5秒生成，移动1.5秒后到达
 * 
 * 时间缩放说明：
 * - TIME_SCALE：时间缩放因子，用于匹配音乐播放速度
 * - 如果音乐播放速度是原来的0.8倍，则设置为 1/0.8 = 1.25
 * - 如果音乐是正常速度，则设置为 1.0
 */
export const TIME_SCALE: number = 1.25; // 0.8倍速对应1.25

export interface NoteData {
    /** 到达check_point的节拍时间点（秒） */
    time: number;
    /** 颜色索引 0-4 (绿、紫、黄、红、蓝) */
    color: number;
    /** 对应的歌词文字 */
    word: string;
    /** 生成时间点（秒），可选*/
    generateTime?: number;
    /** 生成时的X坐标（可选，默认屏幕右侧） */
    startX?: number;
}
export interface SentenceData {
    /** 句子开始时间 */
    startTime: number;
    /** 歌词数组 */
    words: string[];
    /** 音符数据数组 */
    notes: NoteData[];
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
    /** 句子数据数组 */
    sentences: SentenceData[];
    /** 角色说话动画时间段数组（在这些时间段内播放daiji2，其他时间播放daiji1） */
    speakTimeRanges?: AnimationTimeRange[];
}

/**
 * 示例配置数据
 * 你可以根据实际需求修改这个配置
 */
export const musicConfig_lv275: MusicConfig = {
    audioName: "bgmlv275",
    /** 角色说话动画时间段（在这些时间段内播放daiji2，其他时间播放daiji1） */
    speakTimeRanges: [
        { startTime: 1.0, endTime: 2.5 },  
        { startTime: 3.13, endTime: 4.5 }, 
        { startTime: 5.2, endTime: 6.6 },
        { startTime: 7.2, endTime:9.1 },  
        { startTime: 11.5, endTime: 13.6},  
        { startTime:15.8, endTime: 22.1},  
        { startTime: 24.1, endTime:26.2 },  
        { startTime: 28, endTime: 28.7 },  
        { startTime: 30.1, endTime: 30.8 },   
    ],
    
    sentences: [
        {
            startTime: 2, // 第一句开始时间
            words: ["到"], 
            notes: [
                { time:2.6, color: 0, word: "到" },
            ]
        },
        {
            startTime: 3, 
            words: ["到"], 
            notes: [
                { time:4.6, color: 0, word: "到" },
            ]
        },
        {
            startTime: 5, 
            words: ["到"], 
            notes: [
                { time:6.6, color: 0, word: "到" },
            ]
        },
        {
            startTime: 7, // 第二句开始时间
            words: ["抖", "音", "音", "乐",`班`], 
            notes: [
                { time: 9.2, color: 0, word: "抖" },     // 绿色
                { time: 9.45, color: 1, word: "音" },     // 紫色
                { time: 9.73, color: 2, word: "音" },      // 黄色
                { time: 9.96, color: 3, word: "乐" },     // 红色
                { time: 10.23, color: 4, word: "班" },     // 蓝色
            ]
        },
        {
            startTime: 11, // 第三句开始时间
            words: ["十", "分", "的", "喜", "欢"],
            notes: [
                { time: 13.33, color: 0, word: "十" },    
                { time: 13.57, color: 1, word: "分" },   
                { time: 13.9, color: 2, word: "的" },    
                { time: 14.13, color: 3, word: "喜" },    
                { time: 14.4, color: 4, word: "欢" },  
            ]
        }
        ,
        {
            startTime: 15, 
            words: ["永", "远", "不", "会", "停"], 
            notes: [
                { time: 21.73, color: 0, word: "永" },   
                { time: 21.96, color: 1, word: "远" },  
                { time: 22.27, color: 2, word: "不" },   
                { time: 22.57, color: 3, word: "会" },     
                { time: 22.87, color: 4, word: "停" },    
            ]
        }
        ,
        {
            startTime:24,
            words: ["永", "远", "不", "会", "停"], 
            notes: [
                { time: 25.93, color: 0, word: "永" },   
                { time: 26.23, color: 1, word: "远" },  
                { time: 26.57, color: 2, word: "不" },   
                { time: 26.87, color: 3, word: "会" },     
                { time: 27.2, color: 4, word: "停" },    
            ]
        }
        ,
        {
            startTime:28,
            words: ["唱", "歌"], 
            notes: [
                { time: 28.9, color: 0, word: "唱" },   
                { time: 29.2, color: 1, word: "歌" },  
                
            ]
        }
        ,
        {
            startTime:30,
            words: ["唱", "歌"], 
            notes: [
                { time: 31.1, color: 0, word: "唱" },   
                { time: 31.4, color: 1, word: "歌" },  
            ]
        }
       
    ]
};

/**
 * 颜色映射
 * 0: 绿色 (绿)
 * 1: 紫色 (紫)
 * 2: 黄色 (黄)
 * 3: 红色 (红)
 * 4: 蓝色 (蓝)
 */
export const COLOR_NAMES = ["绿", "紫", "黄", "红", "蓝"];

