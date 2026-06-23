import AudioManager from "../script/common/AudioManager";
import sbwz_lv319 from "./sbwz_lv319";

const {ccclass, property} = cc._decorator;

@ccclass
export default class slideitem_lv319 extends cc.Component {



    //主节点
    @property(cc.Node)
    main: cc.Node = null;

    @property(cc.Node)
    targetNode: cc.Node = null;

    //防止重复操作
    isCf = false;

    //主脚本
    mainScript: sbwz_lv319 = null;
    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.mainScript = this.main.getComponent(sbwz_lv319);
    }


    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }



    onTouchStart(event: cc.Event.EventTouch) {
        if (this.mainScript.curLv != 8) {
            return;
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (this.mainScript.curLv != 8) {
            return;
        }
        const delay = event.getDelta();
        // 判断向上滑动
        if (delay.y > 0 && !this.isCf) {
            // 触发你的逻辑
            this.node.children[0].active = true;
            this.node.children[1].active = true;
            this.targetNode.active = true;
            this.isCf = true;
            AudioManager.playEffect("上划窗户");
        }

    }

    onTouchEnd(event: cc.Event.EventTouch) {
        if (this.mainScript.curLv != 8) {
            return;
        }
    }
}
