/**
 * lv384 拖太阳与 feed_lv384.integrateSunMotion 共用参数（单点改手感）。
 */

/** 沿手指方向追目标的加速度，越大越跟手（合速度仍受 MAX_SPEED 限制） */
export const LV384_SHARED_DRAG_CONST_ACCEL = 2920;
/** 拖拽时对线速度的额外衰减，略低更跟手 */
export const LV384_SHARED_DRAG_VELOCITY_DAMP = 0.38;
/** 太阳拖拽合速度硬上限（integrateSunMotion 末尾统一钳制） */
export const LV384_SHARED_DRAG_MAX_SPEED = 1080;
export const LV384_SHARED_SPIN_MIN_GRAB_RADIUS = 44;
export const LV384_SHARED_SPIN_START_TANGENTIAL_ACCUM = 14;
export const LV384_SHARED_SPIN_SENSITIVITY = 1.08;
export const LV384_SHARED_SPIN_ANGULAR_VEL_LERP = 0.46;
export const LV384_SHARED_SPIN_MAX_ANGULAR_SPEED = 520;
export const LV384_SHARED_SPIN_RELEASE_DAMP = 2.25;
export const LV384_SHARED_SPIN_STOP_SPEED = 6;
export const LV384_SHARED_SPIN_RETURN_START_SPEED = 72;
export const LV384_SHARED_SPIN_RETURN_K = 5.8;
export const LV384_SHARED_SPIN_RETURN_DAMP = 1.6;
export const LV384_SHARED_SPIN_RETURN_SNAP_ANGLE = 1.2;
export const LV384_SHARED_SPIN_TRANSLATION_MIN_MUL = 0.64;
export const LV384_SHARED_SPIN_TRANSLATION_MAX_RADIUS = 165;
export const LV384_SHARED_SPIN_DRAG_RESPONSE = 0.66;
/** 手指位移映射到 sunDragTarget 的系数，越接近 1 越跟手 */
export const LV384_SHARED_SPIN_TRANSLATION_DRAG_RESPONSE = 1;
/** 拖拽旋转：手势目标角与实际角的绳子弹簧刚度（越大越跟手、越小越“软绳”） */
export const LV384_SHARED_SPIN_ROPE_K = 16.2;
/** 拖拽旋转：绳阻尼（越大越不容易甩、震荡更少） */
export const LV384_SHARED_SPIN_ROPE_DAMP = 8.2;
/** 绳积分每帧对角速度的额外衰减，抑制弹簧振荡与松手残留高速 */
export const LV384_SHARED_SPIN_ROPE_VEL_DECAY = 1.1;
/** 松手时角速度乘数（削弱「轻点仍甩很久」） */
export const LV384_SHARED_SPIN_RELEASE_TAIL_MUL = 0.32;
/**
 * 本次拖拽切向位移累计低于该值时，松手不保留旋转惯性（视为轻点/误触）。
 * 与 TOUCH_MOVE 里 tangentialStep 同量纲（像素级切向步长累加）。
 */
export const LV384_SHARED_SPIN_MIN_TANGENTIAL_FOR_INERTIA = 82;
/**
 * 按下至抬起期间，绳目标角相对按下时的变化（度）低于该值则视为无明确拧转意图，松手清零角速度。
 * 与切向累计互补，避免误触 MOVE 噪声仍超过切向阈值。
 */
export const LV384_SHARED_SPIN_MIN_TARGET_DELTA_FOR_INERTIA = 6;
