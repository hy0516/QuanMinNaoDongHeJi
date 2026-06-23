import { PlateBead, PLATE_RADIUS } from "./Lv350LevelConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BeadPlateCtrl_lv350 extends cc.Component {

    @property(cc.Node)
    panziNode: cc.Node = null;

    /** 盘内珠子容器，若为空则用 panziNode */
    @property(cc.Node)
    beadContainer: cc.Node = null;

    /** 盘子半径，可按关卡配置，支持运行时修改；为 0 时将从珠子数据自动计算 */
    @property
    plateRadius: number = PLATE_RADIUS;

    /** 是否根据珠子预制体自动计算半径（plateRadius 为 0 时生效） */
    @property
    autoComputeRadius: boolean = true;

    private beads: PlateBead[] = [];

    private static getBeadDiameter(prefab: cc.Prefab): number {
        const node = cc.instantiate(prefab);
        const w = node.width || 100;
        const h = node.height || 100;
        node.destroy();
        return Math.max(w, h) || 100;
    }

    /** 根据珠子预制体和数量反推盘子半径 */
    computeRadiusFromBeads(prefabs: cc.Prefab[], counts: number[]): number {
        if (!prefabs || prefabs.length === 0) return this.plateRadius || PLATE_RADIUS;
        let totalArc = 0;
        let maxD = 0;
        for (let i = 0; i < prefabs.length; i++) {
            const prefab = prefabs[i];
            if (!prefab) continue;
            const d = BeadPlateCtrl_lv350.getBeadDiameter(prefab);
            const cnt = (counts && counts[i] !== undefined) ? (counts[i] || 0) : 0;
            totalArc += d * cnt;
            if (d > maxD) maxD = d;
        }
        if (totalArc <= 0) return this.plateRadius || PLATE_RADIUS;
        const r = (totalArc / (2 * Math.PI)) * 1.02;
        this.plateRadius = Math.max(r, maxD * 0.55);
        return this.plateRadius;
    }

    /** 获取盘心世界坐标 */
    getPlateCenterWorld(): cc.Vec2 {
        if (!this.panziNode) return cc.v2(0, 0);
        return this.panziNode.parent.convertToWorldSpaceAR(this.panziNode.getPosition());
    }

    /** 触点是否在盘内（半径约 250 的圆内） */
    isInsidePlate(worldPos: cc.Vec2): boolean {
        const center = this.getPlateCenterWorld();
        const dist = worldPos.sub(center).mag();
        return dist <= 250;
    }

    /** 将世界坐标转换为盘心相对角度（度，0=3点，90=12点） */
    worldToAngle(worldPos: cc.Vec2): number {
        const center = this.getPlateCenterWorld();
        const dx = worldPos.x - center.x;
        const dy = worldPos.y - center.y;
        let ang = Math.atan2(dy, dx) * 180 / Math.PI;
        if (ang < 0) ang += 360;
        return ang;
    }

    /** 计算珠子占用角度（弧度），使用当前 plateRadius */
    getAngleSpan(diameter: number): number {
        const r = this.plateRadius || PLATE_RADIUS;
        const ratio = Math.min(diameter / (2 * r), 0.9999);
        return 2 * Math.asin(ratio);
    }

    /** 获取落位角度，直接使用目标角度，插入后由 rebalance 调整 */
    getPlaceAngle(targetAngle: number, _diameter: number): number {
        return this.normalizeAngle(targetAngle);
    }

    private normalizeAngle(a: number): number {
        a = a % 360;
        if (a < 0) a += 360;
        return a;
    }

    /** 放置珠子到盘上。优先新珠子位置，有重叠时移动已有珠子（最小位移），新珠子不动 */
    placeBead(typeId: number, diameter: number, prefab: cc.Prefab, angle: number, existingNode?: cc.Node): cc.Node {
        const container = this.beadContainer || this.panziNode;
        if (!container) return null;

        const targetAngle = this.normalizeAngle(angle);
        const node = existingNode || cc.instantiate(prefab);
        node.parent = container;
        const rad = targetAngle * Math.PI / 180;
        const r = this.plateRadius || PLATE_RADIUS;
        node.setPosition(r * Math.cos(rad), r * Math.sin(rad));
        node.angle = 90 + targetAngle;
        node.opacity = 255;

        const data: PlateBead = { angle: targetAngle, typeId, diameter, node };
        this.beads.push(data);
        this.nudgeOverlappingBeadsMinimal(data);
        return node;
    }

    /** 检测珠子 b 在角度 angle 时是否与 avoidBead 重叠（只考虑这一颗） */
    private overlapsWithBead(angle: number, halfSpan: number, avoidBead: PlateBead): boolean {
        const aHalf = this.getAngleSpan(avoidBead.diameter) * 180 / Math.PI / 2;
        return this.angleDist(angle, avoidBead.angle) < halfSpan + aHalf;
    }

    private angleDist(a: number, b: number): number {
        let d = Math.abs(a - b);
        return Math.min(d, 360 - d);
    }

    /** 递进式微调：每个要动的珠子只考虑与引发其移动的那颗不重叠，依次推进 */
    private nudgeOverlappingBeadsMinimal(fixedBead: PlateBead) {
        const toProcess: PlateBead[] = [fixedBead];
        const processed = new Set<PlateBead>();
        while (toProcess.length > 0) {
            const anchor = toProcess.pop()!;
            if (processed.has(anchor)) continue;
            processed.add(anchor);
            for (const b of this.beads) {
                if (b === anchor) continue;
                const halfSpan = this.getAngleSpan(b.diameter) * 180 / Math.PI / 2;
                if (!this.overlapsWithBead(b.angle, halfSpan, anchor)) continue;
                const newAng = this.findMinimalNudgeToAvoid(b, anchor);
                if (newAng !== b.angle) {
                    b.angle = this.normalizeAngle(newAng);
                    this.updateBeadPosition(b);
                    toProcess.push(b);
                }
            }
        }
    }

    /** 找 bead 的最小位移角度，仅避开 avoidBead 这一颗 */
    private findMinimalNudgeToAvoid(bead: PlateBead, avoidBead: PlateBead): number {
        const halfSpan = this.getAngleSpan(bead.diameter) * 180 / Math.PI / 2;
        const step = 0.5;
        for (let delta = step; delta <= 180; delta += step) {
            for (const sign of [1, -1]) {
                const a = this.normalizeAngle(bead.angle + sign * delta);
                if (!this.overlapsWithBead(a, halfSpan, avoidBead)) return a;
            }
        }
        return bead.angle;
    }

    private updateBeadPosition(b: PlateBead) {
        const rad = b.angle * Math.PI / 180;
        const r = this.plateRadius || PLATE_RADIUS;
        b.node.setPosition(r * Math.cos(rad), r * Math.sin(rad));
        b.node.angle = 90 + b.angle;
    }

    /** 根据节点查找珠子 */
    getBeadByNode(node: cc.Node): PlateBead | null {
        return this.beads.find(b => b.node === node) || null;
    }

    /** 从盘上移除珠子用于拖拽，不销毁节点 */
    removeBeadForDrag(node: cc.Node): { typeId: number; diameter: number; angle: number } | null {
        const idx = this.beads.findIndex(b => b.node === node);
        if (idx < 0) return null;
        const b = this.beads[idx];
        this.beads.splice(idx, 1);
        return { typeId: b.typeId, diameter: b.diameter, angle: b.angle };
    }

    /** 放回珠子（拖出盘外时恢复） */
    addBeadBack(node: cc.Node, typeId: number, diameter: number, angle: number): void {
        const container = this.beadContainer || this.panziNode;
        if (!container) return;
        node.parent = container;
        const data: PlateBead = { angle, typeId, diameter, node };
        this.beads.push(data);
        this.updateBeadPosition(data);
        this.nudgeOverlappingBeadsMinimal(data);
    }

    /** 获取角度对应的落位坐标（panziNode 本地） */
    getPositionAtAngle(angle: number): cc.Vec2 {
        const rad = angle * Math.PI / 180;
        const r = this.plateRadius || PLATE_RADIUS;
        return cc.v2(r * Math.cos(rad), r * Math.sin(rad));
    }

    /** 按角度排序的珠子顺序，用于串珠 */
    getBeadOrder(): { typeId: number; diameter: number }[] {
        return this.beads
            .slice()
            .sort((a, b) => a.angle - b.angle)
            .map(b => ({ typeId: b.typeId, diameter: b.diameter }));
    }

    /** 按角度排序的珠子数据（含节点），用于克隆到 panziCloneNode */
    getBeadsForClone(): { typeId: number; diameter: number; node: cc.Node }[] {
        const container = this.beadContainer || this.panziNode;
        if (!container) return [];
        return this.beads
            .slice()
            .sort((a, b) => a.angle - b.angle)
            .map(b => ({ typeId: b.typeId, diameter: b.diameter, node: b.node }));
    }

    /** 清空盘子 */
    clear() {
        const container = this.beadContainer || this.panziNode;
        if (container) {
            this.beads.forEach(b => b.node && b.node.destroy());
        }
        this.beads = [];
    }

    get beadCount(): number {
        return this.beads.length;
    }
}
