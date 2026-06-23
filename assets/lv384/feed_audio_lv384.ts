import AudioManager from "../script/common/AudioManager";

/** 与 audio_lv384 中英文名资源同名的动画名（脸部/全身）；播动画时播对应音效一次 */
const LV384_ANIM_CLIP_NAMES = new Set<string>([
    "wuyu", "ch", "syy", "ku2", "ku", "jby", "ax", "hd", "sd", "dp", "lj"
]);

/** audio_lv384 目录下中文音效文件名（与资源 asset.name 一致，无 .mp3） */
const LV384_LEVEL_SFX_KEYS = new Set<string>([
    "火",
    "水",
    "肥皂",
    "镜子",
    "冰块",
    "磁铁",
    "气球",
    "拖鞋",
    "七彩棒棒糖",
    "闪电",
    "树",
    "鞭子",
]);

/** 龙骨动画名与音效文件名不一致时映射（如展示名「墨水」用镜子龙骨与 镜子.mp3） */
const LV384_ANIM_SOUND_KEY: { [animName: string]: string } = {
    jby: "jby",
    墨水: "镜子",
    拖鞋1: "拖鞋",
};

export const LV384_BGM_KEY = "关卡背景_lv384";
export const LV384_SPIT_SFX_KEY = "吐东西";
export const LV384_TABLE_DROP_KEY = "掉落桌子";

/** 同一音效键在间隔内不重复播，避免叠音 */
const LV384_SAME_SFX_MIN_INTERVAL_MS = 220;
const lastLv384SfxPlayMs: { [effectKey: string]: number } = {};

/**
 * 脸部/全身动画与 audio_lv384 中英文件名一致时播放对应音效（各播一次）。
 * - 脸部：playTimes === 0（待机 pt 等）不播；单次或循环（-1）开始时各播一次同名音效。
 * - 全身：开始播放时调用一次（isFullBody=true）。
 * - 黑洞全身动画名 hdd：不播放（「黑洞」资源也不使用）。
 */
export function tryPlayLv384AnimSound(animName: string, playTimes: number, isFullBody: boolean): void {
    if (!animName) {
        return;
    }
    if (animName === "hdd") {
        return;
    }
    const effectKey = LV384_ANIM_SOUND_KEY[animName] ?? animName;
    const hasSfx =
        LV384_ANIM_CLIP_NAMES.has(effectKey) || LV384_LEVEL_SFX_KEYS.has(effectKey);
    if (!hasSfx) {
        return;
    }
    // 脸部：0 表示待机/默认循环不触发； -1 为进食反应循环，仍需播一次同名音效
    if (!isFullBody && playTimes === 0) {
        return;
    }
    const now = Date.now();
    const last = lastLv384SfxPlayMs[effectKey];
    if (last !== undefined && now - last < LV384_SAME_SFX_MIN_INTERVAL_MS) {
        return;
    }
    lastLv384SfxPlayMs[effectKey] = now;
    AudioManager.playEffect(effectKey);
}

/** 每个吐出物实例生成时播一次 */
export function playLv384SpitOnce(): void {
    AudioManager.playEffect(LV384_SPIT_SFX_KEY);
}

/** 生成物落到桌子时播一次（由实例去重） */
export function playLv384TableDropOnce(): void {
    AudioManager.playEffect(LV384_TABLE_DROP_KEY);
}
