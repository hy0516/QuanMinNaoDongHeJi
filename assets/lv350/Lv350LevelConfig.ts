/**
 * lv350 串珠关卡配置
 */

export const PLATE_RADIUS = 198;

export interface PlateBead {
    angle: number;
    typeId: number;
    diameter: number;
    node: cc.Node;
}
