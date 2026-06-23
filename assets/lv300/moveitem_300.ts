import AudioManager from "../script/common/AudioManager";
import VideoManager from "../script/common/VideoManager";





const { ccclass, property } = cc._decorator;

@ccclass
export default class moveitem_300 extends cc.Component {

    @property(cc.Integer)
    targetScale: number = 0;
    @property(cc.Integer)
    targetIndex: number = 0;
    @property(cc.Node)
    di: cc.Node = null;
    @property(cc.Integer)
    dix: number = 0;
    @property(cc.Integer)
    diy: number = 0;
    @property(cc.Integer)
    diindex: number = 0;
    @property(cc.Boolean)
    isHideChildren: Boolean = false;
    @property(cc.Boolean)
    isY: Boolean = true;
    @property(cc.Boolean)
    isBody: Boolean = false;

    isgg = false;

    // @property(cc.Node)
    // public target: cc.Node[] = [];

    public main: cc.Node = null;

    startScale = 0;
    startPoi;
    startParent: cc.Node = null;
    // isbig = false;

    mainwidth = 0;
    mainheight = 0;
    wupinglan: cc.Node = null;
    wutai: cc.Node = null;
    dj_sk: dragonBones.ArmatureDisplay = null;
    isTouch = false;

    protected onLoad(): void {
        // this.startPoi = this.node.getPosition();
        // this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.startScale = this.node.scale;
        this.startPoi = this.node.position;
        this.startParent = this.node.parent;
        this.wupinglan = this.node.parent.parent.getChildByName("物品栏");
        this.wutai = this.node.parent.parent.getChildByName("舞台");
        this.dj_sk = this.wutai.getChildByName("dj_sk").getComponent(dragonBones.ArmatureDisplay);
        // this.mainheight = cc.view.getCanvasSize().height / 2;
        // this.mainwidth = cc.view.getCanvasSize().width / 2;
        if (this.isBody) {
            this.node.on("BodyIndex", () => {
                if (!this.isTouch) this.node.zIndex = 2;
            }, this)
        }
        this.node.on("TouchCancel", () => {
            this.ondele();
        }, this)
    }

    isgd: boolean = false;
    onTouchStart(even: cc.Event.EventTouch) {
        if (this.node.name == "caidan" && !this.isgd) {
            VideoManager.getInstance().showVideo(() => {
                this.isgd = true;
            });
        }
        if (this.node.name == "caidan" && this.isgd == false) {
            return;
        }
        // if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.node.zIndex = 51;
        if (!this.isBody)  this.node.opacity = 160;
        this.isTouch = true;
        for (let i = 0; i < this.node.parent.childrenCount; i++) {
            var chil = this.node.parent.children[i];
            chil.emit("BodyIndex");
        }
        var poi = this.node.parent.convertToNodeSpaceAR(even.getLocation());
        this.node.setPosition(poi);
        if (this.isY) this.node.y += 150;
        if (this.di) this.di.active = false;
        if (this.isHideChildren) this.node.children[0].active = true;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.2, { scale: this.targetScale, })
            .start();
        

        
        
        if (this.node.name == "caidan" && this.isgd == false) {
            return;
        }
        
    }
    onTouchMove(even: cc.Event.EventTouch) {
        if (this.node.name == "caidan" && this.isgd == false) {
            return;
        }
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;

        // if (this.node.x < 0 && this.node.x < -this.mainwidth + 50) this.node.x = -this.mainwidth + 50;
        // if (this.node.x > 0 && this.node.x > this.mainwidth - 50) this.node.x = this.mainwidth - 50;
        // if (this.node.y < 0 && this.node.y < -this.mainheight + 100) this.node.y = -this.mainheight + 100;
        // if (this.node.y > 0 && this.node.y > this.mainheight - 100) this.node.y = this.mainheight - 100;
    }
    onTouchEnd(even: cc.Event.EventTouch) {

        if (this.node.name == "caidan" && this.isgd == false) {
            return;
        }
        var poi = this.wupinglan.convertToNodeSpaceAR(this.node.parent.convertToWorldSpaceAR(this.node.position));
        var poi2 = this.wutai.convertToNodeSpaceAR(this.node.parent.convertToWorldSpaceAR(this.node.position));
        this.node.opacity = 255;
        // var poi3 = this.wutai.convertToNodeSpaceAR(even.getLocation());
        var poly = this.wupinglan.getComponent(cc.PolygonCollider).points;
        var polywutai = this.wutai.getComponent(cc.PolygonCollider).points;
        if (cc.Intersection.pointInPolygon(cc.v2(poi.x, poi.y), poly)) {
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .to(0.3, { scale: 0 })
                .call(() => {
                    this.node.removeFromParent(false);
                    this.startParent.addChild(this.node);
                    this.node.setPosition(this.startPoi);
                    if (this.di) this.di.active = false;
                    if (this.isHideChildren) this.node.children[0].active = true;
                    this.scheduleOnce(() => { this.node.dispatchEvent(new cc.Event.EventCustom("CheckWuTai", true)); }, 0.010)
                })
                // .to(0.1, { position: this.startPoi })
                .to(0.2, { scale: this.startScale })
                .start();
        } else if (cc.Intersection.pointInPolygon(cc.v2(poi2.x, poi2.y), polywutai)) {
            this.node.removeFromParent(false);
            this.wutai.addChild(this.node);
            this.node.setPosition(poi2);
            this.scheduleOnce(() => { this.node.dispatchEvent(new cc.Event.EventCustom("CheckWuTai", true)); }, 0.010)
            this.dj_sk.node.setPosition(poi2);
            this.dj_sk.playAnimation("djtx", 1);
            AudioManager.playEffect("爱心");
            if (this.di) {
                this.di.removeFromParent(false);
                this.wutai.addChild(this.di);
                this.di.setPosition(cc.v2(this.node.x + this.dix, this.node.y + this.diy));
                this.di.zIndex = this.diindex;
                this.di.active = true;
                if (this.isHideChildren) this.node.children[0].active = false;
            }
            if (this.node.name == "caidan") {
                this.node.active = false;
                this.node.parent.parent.parent.getChildByName("cd").active = true;
                AudioManager.playEffect("彩蛋");
            }
        }

        this.node.zIndex = this.targetIndex;
        this.isTouch = false;
    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
