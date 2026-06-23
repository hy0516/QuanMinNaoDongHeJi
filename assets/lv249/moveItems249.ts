import BaseGame from "../script/common/BaseGame";
import AudioManager from "../script/common/AudioManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItems249 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

    @property(cc.Node)
    main: cc.Node = null; // 必须关联mgr_lv249节点（场景主节点）

    startPoi: cc.Vec2 = null;
    originalZIndex: number = 0;
    originalSiblingIndex: number = -1;
    currentContainer: cc.Node = null; // 当前操作的容器（1-6）
    // 存储1-6容器的「初始siblingIndex」（静态变量，确保所有物品节点共享同一份记录）
    private static containerOriginSiblingIndex: { [key: string]: number } = {};
    // 标记是否已初始化过容器索引（避免重复记录）
    private static isInitOriginIndex = false;

    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.originalZIndex = this.node.zIndex;
        this.originalSiblingIndex = this.node.getSiblingIndex();
        this.enabled = false;

        // 初始化：只记录一次1-6容器的初始siblingIndex（决定初始渲染顺序）
        if (!moveItems249.isInitOriginIndex && this.main) {
            const bgNode = this.main.getChildByName("bg"); // 获取1-6的父节点bg
            if (bgNode) {
                for (let i = 1; i <= 6; i++) {
                    const container = bgNode.getChildByName(`${i}`);
                    if (container) {
                        // 记录容器名（1-6）对应的初始siblingIndex
                        moveItems249.containerOriginSiblingIndex[`${i}`] = container.getSiblingIndex();
                    }
                }
                moveItems249.isInitOriginIndex = true; // 标记已初始化
            }
        }

        // 绑定触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(even: cc.Event.EventTouch) {
        // if(this.type === 12) {
        //     AudioManager.playEffect(`拖动桃木剑`, false);
        // }
        // else if(this.type === 14) {
        //     AudioManager.playEffect(`拖动木门`, false);
        // }
        // else if(this.type !== 11) {
        //     AudioManager.playEffect(AudioManager.common.BUTTON);
        // }
        // 获取当前节点的父容器（1-6）
        this.currentContainer = this.node.parent;
        if (!this.currentContainer) return;

        const containerName = this.currentContainer.name;
        // 仅处理1-6号容器
        if (/^[1-6]$/.test(containerName)) {
            const bgNode = this.main.getChildByName("bg");
            if (bgNode) {
                // 临时置顶：将容器设为bg下最后一个子节点（最后渲染，覆盖其他容器）
                this.currentContainer.setSiblingIndex(bgNode.childrenCount - 1);
            }
        }

        // 节点自身在容器内置顶
        this.node.zIndex = 999;
        this.node.setSiblingIndex(this.currentContainer.childrenCount - 1);
    }

    onTouchMove(even: cc.Event.EventTouch) {
        const delta = even.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;
    }

    onTouchEnd(even: cc.Event.EventTouch) {
        // 执行原有的碰撞交换逻辑
        if (this.main) {
            const gameMgr = this.main.getComponent(BaseGame);
            gameMgr?.moveHandler(this.type, null, even);
        }

        // 核心：恢复容器到初始渲染顺序（按初始siblingIndex）
        if (this.currentContainer) {
            const containerName = this.currentContainer.name;
            if (/^[1-6]$/.test(containerName)) {
                // 从静态变量中取出初始siblingIndex，强制恢复
                const originIndex = moveItems249.containerOriginSiblingIndex[containerName];
                if (originIndex !== undefined) {
                    this.currentContainer.setSiblingIndex(originIndex);
                }
            }
        }

        // 恢复节点自身层级
        this.node.zIndex = this.originalZIndex;
        if (this.originalSiblingIndex !== -1) {
            this.node.setSiblingIndex(this.originalSiblingIndex);
        }

        // 重置
        this.currentContainer = null;
    }

    restart() {
        this.node.setPosition(this.startPoi);
        this.node.zIndex = this.originalZIndex;
        if (this.originalSiblingIndex !== -1) {
            this.node.setSiblingIndex(this.originalSiblingIndex);
        }
    }

    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}