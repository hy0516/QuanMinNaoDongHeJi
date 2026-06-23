import item_loadgame from "./item_loadgame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class hallcontent extends cc.Component {
    @property(cc.Prefab)
    item: cc.Prefab = null;

    // onInit(any) {
    //     if (!any) return
    //     for (let i = 0; i < any.length; i++) {
    //         var data = any[i];
    //         if (data) {
    //             var item = cc.instantiate(this.item);
    //             this.node.addChild(item);
    //             item.getComponent(item_loadgame).oninit(data);
    //             this.node.children[i].active = true;
    //         } else {
    //             this.node.children[i].active = false;
    //         }
    //     }
    // }
    onInit(any) {
        if (!any) return
        for (let i = 0; i < this.node.children.length; i++) {
            var data = any[i];
            if (data) {
                this.node.children[i].getComponent(item_loadgame).oninit(data);
                this.node.children[i].active = true;
            } else {
                this.node.children[i].active = false;
            }
        }
    }

    /**关卡选框动画效果 */
    tween() {
        //
        let frames = this.node.children;

        let timer = 0;

        for (let i = 0; i < frames.length; i++) {
            cc.tween(frames[i])
                .delay(timer)
                .to(0.1, { scale: 1.2 })
                .to(0.1, { scale: 1 })
                .to(0.1, { scale: 1.2 })
                .to(0.1, { scale: 1 })
                .start()

            timer += 0.4;
        }
    }
    onEnable(): void {
        this.tween();

        this.schedule(this.tween, 6)
    }
    onDisable(): void {
        this.unschedule(this.tween);
    }

    // update (dt) {}
}
