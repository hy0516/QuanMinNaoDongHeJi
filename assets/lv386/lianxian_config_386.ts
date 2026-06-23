/** 数字由预制体里每个格子的 Label 填写；此处只配每关「最大数字」与通关条件（需能连到 maxNum） */

export type Lianxian386LevelCfg = {
    /** 本关数字为 1..maxNum 各出现一次，请在编辑器 Label 中保证 */
    maxNum: number;

    /**
     * 为 true：仅显示「已连对」的数字（1～chainMax）。
     * chainMax===0 时只显示起点 1；每连对一步多显示一个数字。与 hideLabelUntilReached 二选一优先本项。
     */
    revealLabelsProgressive?: boolean;

    /**
     * 仅这些数字在「未连到该数字」前隐藏 Label（连上后永久显示）。
     * 未出现在列表里的数字始终显示。与 revealLabelsProgressive 同时为 true 时只用 revealLabelsProgressive。
     */
    hideLabelUntilReached?: number[];
};

/** 示例：第 1 关渐进显数 —— 不需要则删掉 revealLabelsProgressive */
const level1: Lianxian386LevelCfg = { 
    maxNum: 16,
    hideLabelUntilReached: [3, 7, 12],
};
const level2: Lianxian386LevelCfg = { maxNum: 25,
    hideLabelUntilReached: [22,24,17,7,18,11,9],
};
const level3: Lianxian386LevelCfg = { maxNum: 36,
    hideLabelUntilReached: [11,36,26,7,13,19,5,15,33],
};
const level4: Lianxian386LevelCfg = { maxNum: 36,
    hideLabelUntilReached: [13,4,6,5,10,30,22,29,33,25],
};
const level5: Lianxian386LevelCfg = { maxNum: 36,
    hideLabelUntilReached: [23,24,27,33,20,32,6,12,16,5,4,14],
};
const level6: Lianxian386LevelCfg = { maxNum: 36,
    hideLabelUntilReached: [22,19,18,16,24,26,2,14,13,6,4,10,35,33],
};

const lianxian_config_386: { [k: string]: Lianxian386LevelCfg } = {
    level1,
    level2,
    level3,
    level4,
    level5,
    level6
};

export default lianxian_config_386;
