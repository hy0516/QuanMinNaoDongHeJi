const { ccclass, property } = cc._decorator;

export enum Lv318ItemType {
    StaticBlock,     // 静态方块/墙体，网格对齐，不受重力
    DynamicObject,   // 一般动态道具，受重力
    Character,       // 人物
    Gun,             // 枪械道具
    Wearable,        // 衣服道具（头部/身体装备）
}

export interface Lv318ItemConfig {
    id: string;                     // 道具唯一 id，如 "brick_1"
    name?: string;
    type: Lv318ItemType;
    prefabPath: string;             // prefab 路径，如 "lv318/prefabs/wall/fk1"
    iconPath: string;               // 图标路径，如 "lv318/icons/fk1"
    gridSnap: boolean;              // 是否网格对齐（静态墙体一般为 true）
    needVideo?: boolean;            // 是否需要看广告才能使用，缺省为 false
    // 运行时加载的资源
    prefab: cc.Prefab;
    iconSpriteFrame: cc.SpriteFrame;
}

export interface Lv318Category {
    id: string;         // 分类 id，如 "building"
    name: string;       // 分类显示名，如 "建筑"
    itemIds: string[];  // 该分类底下的道具 id 列表
}

export interface Lv318InitialObj {
    itemId: string;     // 初始物体使用的道具 id
    position: cc.Vec2;  // 出生位置（SandboxArea 本地坐标）
    rotation?: number;  // 旋转角度（可选）
}

export interface Lv318Config {
    maxParticles: number;           // 本关总共可放置的道具/粒子数量
    items: Lv318ItemConfig[];       // 所有可用道具配置
    categories: Lv318Category[];    // 底部分类配置
    initialObjects: Lv318InitialObj[]; // 开局默认就存在的物体（地形、角色等）
}

