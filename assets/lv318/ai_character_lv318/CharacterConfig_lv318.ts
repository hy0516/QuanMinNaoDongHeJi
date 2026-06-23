/**
 * lv318 AI 角色配置类型定义
 */

export enum CharacterState_lv318 {
    Idle,       // 站立/平衡
    Walk,       // 行走
    Jump,       // 跳跃
    Attack,     // 攻击
    Interact,   // 交互
    Ragdoll,    // 完全布娃娃（失去控制）
}

export enum MoveDirection_lv318 {
    None,
    Left,
    Right,
}

export enum CharacterType_lv318 {
    Normal,     // 普通人类
    Infected,   // 感染人类
}

/** 布娃娃部件配置 */
export interface RagdollPartConfig_lv318 {
    name: string;               // 部件名称
    size: cc.Size;              // 碰撞体大小
    anchorOffset: cc.Vec2;      // 相对父部件的锚点偏移
    mass?: number;              // 质量（默认 1）
    jointLowerAngle?: number;   // 关节下限角度
    jointUpperAngle?: number;   // 关节上限角度
}

/** 角色配置 */
export interface CharacterConfig_lv318 {
    // 移动参数
    moveForce: number;          // 水平移动力
    jumpForce: number;          // 跳跃力
    maxSpeed: number;           // 最大水平速度

    // 平衡参数（PID 控制）
    balanceP: number;           // 比例系数
    balanceD: number;           // 微分系数
    targetAngle: number;        // 目标角度（0 = 直立）

    // 检测参数
    groundCheckDistance: number;    // 地面检测距离
    obstacleCheckDistance: number;  // 障碍物检测距离
    obstacleJumpHeight: number;     // 需要跳跃的障碍物高度阈值

    // 攻击参数
    attackForce: number;        // 攻击时手臂的力
    attackCooldown: number;     // 攻击冷却时间（秒）

    // 角色扩展
    characterType?: CharacterType_lv318; // 角色类型（可选）
    detectionRange?: number;             // 检测范围（可选）
    infectedPrefabPath?: string;         // 感染后预制体路径（可选）
}

/** 默认角色配置 */
export const DefaultCharacterConfig_lv318: CharacterConfig_lv318 = {
    moveForce: 200,
    jumpForce: 400,
    maxSpeed: 150,

    balanceP: 50,
    balanceD: 10,
    targetAngle: 0,

    groundCheckDistance: 10,
    obstacleCheckDistance: 50,
    obstacleJumpHeight: 20,

    attackForce: 300,
    attackCooldown: 0.5,

    detectionRange: 9999,
};
