const { ccclass, property } = cc._decorator;

/** 谱子节拍 */
interface Beat {
    interval: number;
    lanes: number[];
}

@ccclass
export default class ArrowNote extends cc.Component {

    @property(cc.Node)
    luoxia: cc.Node = null;

    @property(cc.Prefab)
    arrowPrefab: cc.Prefab = null;

    /** 下落速度（像素/秒） */
    fallSpeed: number = 300;

    /** 生成位置Y（相对于列节点） */
    spawnY: number = 800;

    /** 完美线Y（相对于luoxia） */
    perfectY: number = -1370;

    /** 完美范围 */
    perfectRange: number = 50;

    /** 良好范围 */
    goodRange: number = 100;

    /** 判定回调 (lane, type: 2=perfect, 1=good, 0=miss) */
    onHit: (lane: number, type: number) => void = null;

    /** 谱子播放完成回调 */
    onComplete: () => void = null;

    private _arrows: cc.Node[] = [];
    private _beatIndex: number = 0;
    private _lastTime: number = 0;
    private _isPlaying: boolean = false;
    private _isPaused: boolean = false;
    private _templateNode: cc.Node = null;

    /** 开始播放谱子 */
    play(sheet: Beat[]) {
        this._beatIndex = 0;
        this._lastTime = 0;
        this._isPlaying = true;

        // 实例化预制体获取模板
        if (this.arrowPrefab && !this._templateNode) {
            this._templateNode = cc.instantiate(this.arrowPrefab);
        }

        // 从节点读取谱子
        const sheetNode = this.node.getChildByName("sheet");
        if (sheetNode) {
            this.readSheetFromNode(sheetNode);
        } else {
            this._sheet = sheet;
        }
    }

    private _sheet: Beat[] = [];

    /** 从节点读取谱子 */
    readSheetFromNode(sheetNode: cc.Node) {
        this._sheet = [];
        const children = sheetNode.children;
        let lastTime = 0;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const time = parseFloat(child.name);
            if (isNaN(time)) continue;

            const lanes: number[] = [];
            child.children.forEach(laneNode => {
                const lane = parseInt(laneNode.name);
                if (lane >= 1 && lane <= 4) lanes.push(lane);
            });

            if (lanes.length > 0) {
                this._sheet.push({ interval: time - lastTime, lanes });
                lastTime = time;
            }
        }
    }


    update(dt: number) {
        if (!this._isPlaying || this._isPaused) return;

        // 生成新箭头
        this._lastTime += dt;
        while (this._beatIndex < this._sheet.length) {
            const beat = this._sheet[this._beatIndex];
            if (this._lastTime < beat.interval) break;

            this._lastTime -= beat.interval;
            beat.lanes.forEach(lane => this.spawn(lane));
            this._beatIndex++;
        }

        // 谱子播放完成且所有箭头都处理完毕
        if (this._beatIndex >= this._sheet.length && this._arrows.length === 0) {
            this._isPlaying = false;
            if (this.onComplete) this.onComplete();
        }

        // 更新箭头位置
        for (let i = this._arrows.length - 1; i >= 0; i--) {
            const arrow = this._arrows[i];
            arrow.y -= this.fallSpeed * dt;

            // 超出范围销毁
            if (arrow.y < this.perfectY - this.goodRange - 50) {
                const lane = arrow['lane'];
                if (this.onHit) this.onHit(lane, 0);
                arrow.destroy();
                this._arrows.splice(i, 1);
            }
        }
    }

    /** 生成箭头 */
    spawn(lane: number) {
        if (!this.luoxia) return;
        if (!this._templateNode) return;

        // 从预制体子节点获取对应列的节点作为模板（预制体结构：jiantou -> 1,2,3,4）
        const template = this._templateNode.getChildByName(lane.toString());
        if (!template) return;

        // 从luoxia中获取对应列的位置节点
        const posNode = this.luoxia.getChildByName(lane.toString());
        if (!posNode) return;

        const arrow = cc.instantiate(template);
        arrow.parent = posNode;  // 作为对应列的子节点
        arrow.active = true;
        arrow.setPosition(0, this.spawnY);  // x=0 居中对齐

        arrow['lane'] = lane;
        this._arrows.push(arrow);
    }

    /** 判定指定列 */
    judge(lane: number): number {
        // 找该列最接近完美线的箭头
        let target: cc.Node = null;
        let minDis = Infinity;

        for (const arrow of this._arrows) {
            if (arrow['lane'] === lane) {
                const dis = Math.abs(arrow.y - this.perfectY);
                if (dis < minDis) {
                    minDis = dis;
                    target = arrow;
                }
            }
        }

        if (!target) return -1;

        // 判定
        let result = -1;
        if (minDis <= this.perfectRange) {
            result = 2; // perfect
        } else if (minDis <= this.goodRange) {
            result = 1; // good
        }


        // 无论是否击中，都销毁箭头并回调
        const idx = this._arrows.indexOf(target);
        if (idx >= 0) this._arrows.splice(idx, 1);
        target.destroy();
        if (result >= 0) {
            // 击中 (perfect/good)
            if (this.onHit) this.onHit(lane, result);


        } else {
            // 没击中 (miss) - 在范围内有箭头但没在判定区间内
            if (this.onHit) this.onHit(lane, 0);
        }

        return result;
    }

    /** 复活 - 清除当前所有箭头但继续游戏 */
    resurrect() {
        // 销毁所有当前下落中的箭头
        for (const arrow of this._arrows) {
            arrow.destroy();
        }
        this._arrows = [];
    }

    /** 重新开始 - 重置所有状态 */
    restart() {
        // 销毁所有箭头
        for (const arrow of this._arrows) {
            arrow.destroy();
        }
        this._arrows = [];

        // 重置播放状态
        this._beatIndex = 0;
        this._lastTime = 0;
        this._isPlaying = false;
        this._isPaused = false;
    }

    /** 暂停箭头生成和移动 */
    pause() {
        this._isPaused = true;
    }

    /** 继续箭头生成和移动 */
    resume() {
        this._isPaused = false;
    }
}
