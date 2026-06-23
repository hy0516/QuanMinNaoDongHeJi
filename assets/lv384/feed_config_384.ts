/**
 * lv384 关卡配置（当前格子玩法为《整蛊太阳先生》）
 * 太阳 UI 格子：`iconPath` → **SunUIIconSmall**（与 itemPrefab 动态图标一致）。
 * 场景生成物 spawn / 嘴喷 split 预制体贴图 → **SunUIDaoJu** 同名 sprite（工程内已绑定；棒棒糖对应 DaoJu「糖果」）。
 */

/** 食物/道具类型枚举 */
export enum ItemType {
    None = 0,               // 无
    
    // === 普通道具（吃后吐出其他物品）===
    KnifeShieldDog = 1,     // 1. 刀盾狗 -> 嘴吐盾牌
    BiBiLaBu = 2,           // 2. 比比喇布 -> 嘴吐香蕉
    MoldyTofu = 3,          // 3. 霉豆腐 -> 喷射黑色液体
    IceCube = 4,            // 4. 冰块 -> 嘴吐冰块
    GoldIngot = 5,          // 5. 元宝 -> 嘴吐金币
    GuGuGaGa = 6,           // 6. 咕咕嘎嘎 -> 吐出很多迷你版自己
    
    // === 特殊道具（吃后有特效/变身）===
    SauceDuck = 7,          // 7. 酱板鸭 -> 变装(狐妖)
    Nuke = 8,               // 8. 核弹 -> 身体被炸黑
    Chili = 9,              // 9. 辣椒 -> 身体变红温大哭
    RainbowCandy = 10,      // 10. 彩虹糖 -> 身体七彩渐变
    Lightning = 11,         // 11. 闪电 -> 身体触电
    BlackHole = 12,         // 12. 黑洞 -> 被黑洞吸引翻滚
    LightBulb = 13,         // 13. 灯泡 -> 眼睛发射光线
    
    // === 普通食物（点击 spawn 食物；吃后可能按 spitOutType 喷 lv384_spawn_*）===
    SweetPotato = 14,       // 14. 番薯 -> 爱心
    OctopusBall = 15,       // 15. 章鱼丸子 -> 无（只有脸部反应wuyu）
    HotDogCheese = 16,      // 16. 热狗芝士棒 -> 星星
    MeatballSkewer = 17,    // 17. 丸子串 -> 无（只有脸部反应wuyu）
    Cake = 18,              // 18. 蛋糕 -> 樱花（喷溅反应图）
    Fish = 19,              // 19. 鱼 -> 泡泡
    FriedChicken = 20,      // 20. 炸鸡腿 -> 小鸡脸（喷溅反应图）
    CatCookie = 21,         // 21. 猫饼干 -> 猫爪
    Salad = 22,             // 22. 沙拉 -> 七彩盘（喷溅反应图）
    Egg = 23,               // 23. 鸡蛋 -> 小鸡表情（喷溅反应图）
    Alien = 24,             // 24. 外星人 -> UFO
    ShaoMai = 25,           // 25. 烧麦 -> 无（只有脸部反应wuyu）

    // === 整蛊太阳先生（格子与场景生成物；与 1–25 数值隔离）===
    SunFire = 101,
    SunWater = 102,
    SunSoap = 103,
    SunMirror = 104,
    SunIce = 105,
    SunMagnet = 106,
    SunBalloon = 107,
    SunLollipop = 108,
    SunLightning = 109,
    SunTree = 110
}

/**
 * 物品栏 UI 展示顺序（与 ItemType 数值无关）。
 * 《整蛊太阳先生》：十格对应十种道具；生成预制体见各 ItemConfig.spawnPhysicsPrefab。
 */
export const LV384_ITEM_GRID_ORDER: ItemType[] = [
    ItemType.SunBalloon,
    ItemType.SunWater,
    ItemType.SunSoap,
    ItemType.SunMirror,
    ItemType.SunIce,
    ItemType.SunMagnet,
    ItemType.SunFire,
    ItemType.SunLollipop,
    ItemType.SunLightning,
    ItemType.SunTree
];

/**
 * lv384 物理预制体路径（相对当前关卡分包根目录，无 .prefab 后缀）
 * 生成物目录：prefab_lv384/spawnItem/
 *
 * 生成物（点击格子）：`spawnItem/lv384_spawn_*`（贴图 **SunUIDaoJu** 同名）。
 * 吃后从嘴喷出与「水」格子共用：`spawnItem/lv384_spawn_water`。
 */
export const LV384_SPAWN_PREFAB_DIR = "prefab_lv384/spawnItem";

function padItemTypeId(id: number): string {
    return id < 10 ? `0${id}` : `${id}`;
}

/** 默认生成物预制体路径 */
export function lv384SpawnPrefabPath(itemType: ItemType): string {
    if (itemType <= ItemType.None) {
        return "";
    }
    return `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_i${padItemTypeId(itemType as number)}`;
}

/** 按 SpitOutType → 与 spawn 共用的预制体路径（整蛊太阳仅水 → lv384_spawn_water） */
export function lv384SpitPrefabPathByType(spit: SpitOutType): string {
    return `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_${spit}`;
}

/** 物品分类 */
export enum ItemCategory {
    Tool = "tool",              // 道具（吐出效果）
    Special = "special",        // 特殊道具（特效）
    Normal = "normal"           // 普通食物
}

/** 吃后喷出类型：整蛊太阳关卡仅「水」，预制体与格子生成物同为 `lv384_spawn_water` */
export enum SpitOutType {
    Water = "water"
}

/** 特殊效果类型 */
export enum SpecialEffectType {
    Transform = "transform",        // 变身
    Blacken = "blacken",            // 变黑
    RedHot = "redHot",              // 红温
    RainbowGradient = "rainbow",    // 彩虹渐变
    ElectricShock = "electric",     // 触电
    BlackHoleSuck = "blackHole",    // 黑洞吸引
    EyeBeam = "eyeBeam"             // 眼睛发射光线
}

/** 物品配置接口 */
export interface ItemConfig {
    id: ItemType;
    name: string;               // 名称
    category: ItemCategory;     // 分类
    iconPath: string;           // 图标路径 (FoodIcon/xx.png)
    
    /** 吃后喷出类型（道具与普通食物共用，见 SpitOutType；预制体见 resolveEatSpitPrefabPath） */
    spitOutType?: SpitOutType;
    spitOutCount?: number;      // 喷吐规模（粒子数权重）
    
    // 特殊道具特有
    specialEffect?: SpecialEffectType;  // 特殊效果
    effectDuration?: number;            // 效果持续时间
    
    // 动画配置（新架构）
    faceAnimName?: string;      // 脸部动画名（yj_ske）- 普通道具/食物使用
    bodyAnimName?: string;      // 全身动画名 - 特殊道具使用
    /** 若填写：先播 bodyAnimName 一次，再循环 bodyAnimIdleName（待机） */
    bodyAnimIdleName?: string;

    /** 点击格子生成的「食物」预制体；不填则 lv384_spawn_i{id}（历史 id 1–25；太阳道具见 spawnPhysicsPrefab） */
    spawnPhysicsPrefab?: string;
    /** 点击格子生成的场景同类型上限：不填或 0 为不限制；太阳关卡当前为水/墨水 150，其余全部 1 */
    maxSpawnedInScene?: number;
    /** 覆盖「吃后喷出」预制体完整相对路径；不填则按 spitOutType → lv384_spawn_{枚举值} */
    spitPhysicsPrefab?: string;
}

/** 解析生成物预制体路径 */
export function resolveSpawnPhysicsPrefabPath(config: ItemConfig): string {
    return (config.spawnPhysicsPrefab || lv384SpawnPrefabPath(config.id)) || "";
}

/**
 * 吃进嘴后喷出的预制体路径（与对应 spawn 共用资源时可指向同一 lv384_spawn_*）
 */
export function resolveEatSpitPrefabPath(config: ItemConfig): string | null {
    if (config.spitPhysicsPrefab) {
        return config.spitPhysicsPrefab;
    }
    if (config.spitOutType) {
        return lv384SpitPrefabPathByType(config.spitOutType);
    }
    return null;
}

/** 所有物品配置 - 使用实际资源路径 */
export const ITEM_CONFIGS: { [key in ItemType]?: ItemConfig } = {
   

    // === 整蛊太阳先生：iconPath=SunUIIconSmall；spawn/split 预制体用 SunUIDaoJu 图（见上注释）===
    [ItemType.SunFire]: {
        id: ItemType.SunFire,
        name: "火",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/火",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_fire`,
        faceAnimName: "火",
        maxSpawnedInScene: 1
    },
    [ItemType.SunWater]: {
        id: ItemType.SunWater,
        name: "水",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/水",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_water`,
        spitOutType: SpitOutType.Water,
        spitOutCount: 1,
        faceAnimName: "水",
        maxSpawnedInScene: 150
    },
    [ItemType.SunSoap]: {
        id: ItemType.SunSoap,
        name: "肥皂",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/肥皂",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_soap`,
        faceAnimName: "肥皂",
        maxSpawnedInScene: 1
    },
    [ItemType.SunMirror]: {
        id: ItemType.SunMirror,
        name: "墨水",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/墨水",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_mirror`,
        faceAnimName: "墨水",
        maxSpawnedInScene: 150
    },
    [ItemType.SunIce]: {
        id: ItemType.SunIce,
        name: "冰块",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/冰块",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_ice`,
        faceAnimName: "冰块",
        maxSpawnedInScene: 1
    },
    [ItemType.SunMagnet]: {
        id: ItemType.SunMagnet,
        name: "鞭子",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/鞭子",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_magnet`,
        faceAnimName: "鞭子",
        maxSpawnedInScene: 1
    },
    [ItemType.SunBalloon]: {
        id: ItemType.SunBalloon,
        name: "拖鞋",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/拖鞋",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_balloon`,
        faceAnimName: "拖鞋1",
        maxSpawnedInScene: 1
    },
    [ItemType.SunLollipop]: {
        id: ItemType.SunLollipop,
        name: "七彩棒棒糖",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/七彩棒棒糖",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_lollipop`,
        faceAnimName: "七彩棒棒糖",
        maxSpawnedInScene: 1
    },
    [ItemType.SunLightning]: {
        id: ItemType.SunLightning,
        name: "闪电",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/闪电",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_lightning`,
        faceAnimName: "闪电",
        maxSpawnedInScene: 1
    },
    [ItemType.SunTree]: {
        id: ItemType.SunTree,
        name: "树",
        category: ItemCategory.Normal,
        iconPath: "picture_lv384/SunUIIconSmall/树",
        spawnPhysicsPrefab: `${LV384_SPAWN_PREFAB_DIR}/lv384_spawn_tree`,
        faceAnimName: "树",
        maxSpawnedInScene: 1
    }
};

/** 获取物品配置 */
export function getItemConfig(itemType: ItemType): ItemConfig | null {
    return ITEM_CONFIGS[itemType] || null;
}

/** 拖鞋 / 水 / 肥皂：格子无需看视频即可使用（火需看视频解锁） */
export function isLv384ItemFreeWithoutVideo(itemType: ItemType): boolean {
    return (
        itemType === ItemType.SunBalloon ||
        itemType === ItemType.SunWater ||
        itemType === ItemType.SunSoap
    );
}

/** 整蛊太阳格子道具（SunFire～SunTree） */
export function isLv384SunGridItemType(itemType: ItemType): boolean {
    return itemType >= ItemType.SunFire && itemType <= ItemType.SunTree;
}

/** 根据分类获取物品列表 */
export function getItemsByCategory(category: ItemCategory): ItemConfig[] {
    const result: ItemConfig[] = [];
    for (const key in ITEM_CONFIGS) {
        const config = ITEM_CONFIGS[key as unknown as ItemType];
        if (config && config.category === category) {
            result.push(config);
        }
    }
    return result;
}

/** 
 * DragonBones 配置 
 * 新架构：
 * 1. yj_ske - 脸部表情龙骨，嵌套在headUpper节点下
 * 2. fullBody_ske - 全身动画龙骨，在全身动画层播放
 */
export const DRAGON_BONES_CONFIG = {
    // 脸部龙骨（嵌套在headUpper中）
    faceSke: {
        skePath: "dragon_lv384/yj_ske",
        texJsonPath: "dragon_lv384/yj_tex",
        texPath: "dragon_lv384/yj_tex",
        armatureName: "yj"  // 脸部表情龙骨
    },
    
    // 全身龙骨（特殊道具动画）
    fullBodySke: {
        skePath: "dragon_lv384/qtys_ske",
        texJsonPath: "dragon_lv384/qtys_tex",
        texPath: "dragon_lv384/qtys_tex",
        armatureName: "qtys"  // 全身动画龙骨
    },
    
    // 旧配置保留兼容
    skePath: "dragon_lv384/ggggws_ske",
    texJsonPath: "dragon_lv384/ggggws_tex",
    texPath: "dragon_lv384/ggggws_tex",
    armatureName: "ggggws"
};

/** 脸部动画名称映射（yj_ske动画）- 仅图片中有的 */
export const FACE_ANIMATIONS = {
    PT: "pt",           // 待机（默认循环）
    KAIXIN: "wuyu",     // 旧默认表情名保留；待机请用 PT
    AX: "ax",           // 爱心眼
    WUYU: "wuyu",       // 无语
    SYY: "syy",         // 生气/疑惑
    KU2: "ku2",         // 大哭/惊讶
    KU: "ku"            // 哭
};

/** 全身动画名称映射（特殊道具） */
export const BODY_ANIMATIONS = {
    JHY: "jhy",         // 酱板鸭
    HD: "hd",           // 核弹
    LJ: "lj",           // 辣椒
    CH: "ch",           // 彩虹糖
    SD: "sd",           // 闪电
    HDD: "hdd",         // 黑洞
    DP: "dp"            // 灯泡
};

/** UI 资源配置 */
export const UI_CONFIG = {
    // 背景
    bgPath: "picture_lv384/背景",
    titlePath: "picture_lv384/标题",
    titleFramePath: "picture_lv384/标题框",
    bigFramePath: "picture_lv384/大边框",
    smallFramePath: "picture_lv384/小边框",
    chairPath: "picture_lv384/椅子",
    tablePath: "picture_lv384/桌子",
    resetBtnPath: "picture_lv384/重置按钮"
};
