import AudioManager from "./AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class common extends cc.Component {
    public static lujing: cc.Node;
    public clickPool: cc.NodePool = new cc.NodePool();
    public static TipsView: cc.Node = null;
    public static loadgameitenPool: cc.NodePool = new cc.NodePool();


    onLoad() {
        // return
        common.lujing = this.node.getChildByName("titbg");
        cc.resources.load('prefabs/common/Hall', cc.Prefab, (err, pre: cc.Prefab) => {
            let preNode: cc.Node = cc.instantiate(pre);
            preNode.parent = cc.find("Canvas");
        })
        cc.resources.load("audio/common/" + AudioManager.common.Hall_main4, cc.AudioClip, () => {
        }, (err, clip: cc.AudioClip) => {
            if (clip) {
                AudioManager.set(clip.name, clip);
                AudioManager.playMusic(clip.name);
            }
        })
        cc.resources.load('prefabs/common/gq_sk', cc.Prefab, (err, pre: cc.Prefab) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i = 0; i < 20; i++) {
                let clone = cc.instantiate(pre);
                this.clickPool.put(clone);
            }
        })
        cc.resources.load('prefabs/common/hallContent', cc.Prefab, (err, pre: cc.Prefab) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i = 0; i < 5; i++) {
                let clone = cc.instantiate(pre);
                common.loadgameitenPool.put(clone);
            }
        })
        this.node.zIndex = 999;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        //监听事件默认不穿透到下层节点，手动关闭防穿透
        // @ts-ignore
        if (this.node._touchListener) {
            //@ts-ignore
            this.node._touchListener.setSwallowTouches(false);
        }

        cc.resources.load('prefabs/common/biaoti', cc.Prefab, (err, pre: cc.Prefab) => {
            let preNode: cc.Node = cc.instantiate(pre);
            preNode.parent = cc.find("Canvas");
            preNode.zIndex = 99;
            common.TipsView = preNode;
            common.TipsView.opacity = 0;
        })
    }
    public static ShowTipsView(lab: string) {
        this.TipsView.getChildByName("tipsLab").getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.TipsView);
        cc.tween(this.TipsView)
            .to(0.2, { opacity: 255 })
            .delay(0.75)
            .to(0.1, { opacity: 0 })
            .start()
    }
    public static issk = true;

    public static closeSk() {
        this.issk = false;
    }
    public static openSk() {
        this.issk = true;
    }
    public static openLuJing(desc: string) {
        //  common.lujing.active = true;
        if (cc.sys.isBrowser) {
            common.lujing.active = true;
            console.log("==============");
        } else {
            common.lujing.active = false;
        }
        common.lujing.children[0].getComponent(cc.Label).string = desc;
    }
    public static hideLuJing() {
        common.lujing.active = false;
    }
    private onTouchStart(event: cc.Event.EventTouch): void {
        if (!common.issk) return
        let dra = this.clickPool.get();
        if (!dra) return
        dra.parent = this.node;
        // AudioManager.playEffect(AudioManager.common.COMCLICK);
        //@ts-ignore 
        dra.position = this.node.convertToNodeSpaceAR(event.getLocation());
        dra.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay).playAnimation("play", 1);
        this.scheduleOnce(function () {
            this.clickPool.put(dra);
        }, 2)
    }

    public static getitem(): cc.Node {
        let dra = common.loadgameitenPool.get()
        return dra;
    }
    public static setitem(item: cc.Node) {
        common.loadgameitenPool.put(item)
    }
}
