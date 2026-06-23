import ktb_lv288 from "./ktb_lv288";

const { ccclass, property } = cc._decorator;

@ccclass
export default class moveitem_lv288 extends cc.Component {

    //获取主节点
    @property(cc.Node)
    main: cc.Node = null;
    @property(cc.Graphics)
    private draw1: cc.Graphics = null;
    //主节点的脚本
    mainSrict: ktb_lv288 = null;

    // 多个目标节点（带有PolygonCollider组件）
    @property([cc.Node])
    targets: cc.Node[] = [];
    //饼干扣出结算计数器
    count: number = 0;

    isoff = false;

    private line1: cc.Vec2[] = [];

    //自身的龙骨动画组件
    private spineAnim: dragonBones.ArmatureDisplay = null;

    // isBgActive: boolean = true;

    // 在类中定义一个数组用于记录路径点
    private pathPoints: cc.Vec2[] = [];
    //多边形检测节点
    @property([cc.Node])
    bytargets: cc.Node[] = [];

    //边缘检测
    inby: boolean[] = [false, false, false, false];

    //大圈检测
    inBig: boolean = false;
    //小圈检测
    inSmall: boolean = false;

    animator: dragonBones.ArmatureDisplay = null

    // 计时器相关
    private specialAreaTimer: number = 0;
    private isInSpecialArea: boolean = false;
    private SPECIAL_AREA_THRESHOLD: number = 1; // 秒
    private specialAreaTriggered: boolean = false;
    isLooping: boolean;

    protected onLoad(): void {
        //启用碰撞检测
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = false;

        this.animator = this.node.getComponent(dragonBones.ArmatureDisplay);



        //添加主脚本
        this.mainSrict = this.main.getComponent("ktb_lv288");

        //获取龙骨动画组件
        this.spineAnim = this.getComponent(dragonBones.ArmatureDisplay);
    }


    protected start(): void {
        //初始化
        this.Init();

    }
    protected update(dt: number): void {

        if (this.isoff == false)
            return;
        const nowInSpecialArea = (this.inBig && this.inSmall) || (this.inBig && this.inSmall || (this.inby[0] ||
            this.inby[1] || this.inby[2] || this.inby[3])
        );
        if (nowInSpecialArea) {
            if (!this.isInSpecialArea) {
                // 刚进入特殊范围，重置计时
                this.specialAreaTimer = 0;
                this.specialAreaTriggered = false;
            }
            this.specialAreaTimer += dt;
            if (this.specialAreaTimer >= this.SPECIAL_AREA_THRESHOLD && !this.specialAreaTriggered) {
                this.specialAreaTriggered = true;
                this.onSpecialAreaStay(this.targets[0].parent);
            }
        } else {
            // 离开特殊范围，重置计时
            this.specialAreaTimer = 0;
            this.specialAreaTriggered = false;
        }
        this.isInSpecialArea = nowInSpecialArea;



    }


    Init() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.isoff = false;
        for (let i = 0; i < this.mainSrict.nodeArray.length; i++) {
            const node = this.main.getChildByName("bg").getChildByName(this.mainSrict.nodeArray[i].name);
            if (node.active) {
                this.mainSrict.moveLeftTween(node, 780 * i);
                this.mainSrict.tempNode = node;
                break;
            }
        }

        for (let i = 0; i < this.mainSrict.isBg.length; i++) {
            this.mainSrict.isBg[i] = false;
        }



        this.count = 0;
    }

    onTouchStart(event: cc.Event.EventTouch) {
        //切换龙骨动画
        if (this.spineAnim) {
            this.spineAnim.playAnimation("bg", 0);
            this.isoff = true;
        }
        this.draw1.clear();
        this.line1 = [];
        // if (this.mainSrict.isMusic == false) {
        //     this.mainSrict.playAudio("移动2");
        // }
        const worldPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        var lvpo = this.draw1.node.convertToNodeSpaceAR(worldPos)
        this.draw1.moveTo(lvpo.x, lvpo.y);

    }

    onTouchMove(event: cc.Event.EventTouch) {
        this.mainSrict.playAudio("移动2");
        // 移动自身节点
        const delta = event.getDelta();
        const parentNode = this.node.parent;
        const scale = parentNode.scale;
        this.node.x += delta.x / scale;
        this.node.y += delta.y / scale;


        // if (this.mainSrict.isMusic == false) {
        //     this.mainSrict.playAudio("移动2");
        // }



        //分开检测
        const worldPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        var lvpo = this.draw1.node.convertToNodeSpaceAR(worldPos)
        this.line1.push(lvpo);
        // if (this.line1.length > 2) {
        //     this.draw1.moveTo(this.line1[this.line1.length - 2].x, this.line1[this.line1.length - 2].y);
        // }
        this.draw1.clear();
        for (let i = 0; i < this.line1.length; i++) {
            const poi = this.line1[i];
            if (i == 0) this.draw1.moveTo(poi.x, poi.y);
            else this.draw1.lineTo(poi.x, poi.y);
        }
        // this.draw1.lineTo(lvpo.x, lvpo.y);
        this.draw1.stroke();
        // let inBig = false;
        // let inSmall = false;
        if (this.targets.length > 0) {
            const bigTarget = this.targets[0];
            const bigCollider = bigTarget.getComponent(cc.PolygonCollider);
            if (bigCollider && bigCollider.points && bigCollider.points.length > 0) {
                const localPosBig = bigTarget.convertToNodeSpaceAR(worldPos);
                this.inBig = cc.Intersection.pointInPolygon(localPosBig, bigCollider.points);
                this.moveToTargetAndTriggerAnimation(worldPos);


            }

        }
        if (this.targets.length > 1) {
            const smallTarget = this.targets[1];
            const smallCollider = smallTarget.getComponent(cc.PolygonCollider);
            if (smallCollider && smallCollider.points && smallCollider.points.length > 0) {
                const localPosSmall = smallTarget.convertToNodeSpaceAR(worldPos);
                this.inSmall = cc.Intersection.pointInPolygon(localPosSmall, smallCollider.points);

            }

        }

        if (this.inBig && !this.inSmall) {
            this.draw1.strokeColor = cc.Color.GREEN;
            // this.mainSrict.playAnmia(this.animator, "bg");
            // this.mainSrict.isfirest = true;

        } else if (this.inBig && this.inSmall) {
            this.draw1.strokeColor = cc.Color.RED;
            // this.mainSrict.playAnmia(this.animator, "kq");
            // this.mainSrict.isfirest = true;
        }

        else {


            this.draw1.strokeColor = cc.Color.RED;
            for (let i = 0; i < this.bytargets.length; i++) {
                if (this.bytargets[i].active == false) {
                    this.inby[i] = false;
                    continue;
                }
                const byCollider = this.bytargets[i].getComponent(cc.PolygonCollider);
                const localPosSmall = this.bytargets[i].convertToNodeSpaceAR(worldPos);
                this.inby[i] = cc.Intersection.pointInPolygon(localPosSmall, byCollider.points);

            }

        }


    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.draw1.clear();
    }




    //移动到特定的位置使触发饼干碎裂的动画
    moveToTargetAndTriggerAnimation(worldPos: cc.Vec2) {
        if (!this.targets || this.targets.length === 0) return;
        const bigTarget = this.targets[0];
        if (!bigTarget) return;
        const bigCollider = bigTarget.getComponent(cc.PolygonCollider);
        if (!bigCollider || !bigCollider.points || !Array.isArray(bigCollider.points)) return;
        if (!this.mainSrict || !this.mainSrict.indexMap || !(this.mainSrict.indexMap instanceof Map)) return;
        if (!this.main) return;
        const bgNode = this.main.getChildByName("bg");
        if (!bgNode) return;
        // 获取父节点名字
        const parentName = bigTarget.parent && bigTarget.parent.name ? bigTarget.parent.name : "";
        // 获取 indexMap 中对应的索引数组
        const indexArr = this.mainSrict.indexMap.get(parentName);
        if (!indexArr || !Array.isArray(indexArr)) return;
        for (let i = 0; i < 4; i++) {
            const idx = indexArr[i];
            if (this.mainSrict.isBg && this.mainSrict.isBg[i] == true) continue;
            if (typeof idx !== "number" || idx < 0 || idx >= bigCollider.points.length) continue;
            const point = bigCollider.points[idx];
            const localPosBig = bigTarget.convertToNodeSpaceAR(worldPos);
            // 判断localPosBig是否接近条件点
            const distance = cc.Vec2.distance(localPosBig, point);
            if (distance < 50) {
                const targetNode = bgNode.getChildByName(parentName)
                    && bgNode.getChildByName(parentName).getChildByName(`${parentName}_${i + 1}`);
                if (targetNode && this.mainSrict.moveAndFadeOutTween) {
                    if (this.mainSrict.isBg) this.mainSrict.isBg[i] = true;
                    this.mainSrict.moveAndFadeOutTween(targetNode);
                    this.count++;
                }
            }
        }


        if (this.count == 4) {
            this.ondele();
            this.mainSrict.winValue++;
            this.mainSrict.animateScaleMoveFade(this.targets[1]);
            this.targets[0].active = false;
            this.draw1.clear();
            this.node.active = false;
            //this.mainSrict.removeArray(this.mainSrict.nodeArray[this.mainSrict.nodeIndex]);
            this.scheduleOnce(() => {
                if (this.mainSrict.nodeIndex < 3 && !this.targets[0].active) {

                    this.main.getChildByName("bg").getChildByName(this.mainSrict.tempNode.name).children[0].active = false;
                    this.targets[1].parent.active = false;
                    this.Init();


                }
            }, 2);

        }


    }

    // 特殊范围事件（共同范围或圈外）
    private onSpecialAreaStay(node: cc.Node) {


        //this.ondele();
        for (let i = 0; i < node.children.length; i++) {
            node.children[i].active = false;
        }
        //node.active = false;
        this.mainSrict.playEff("饼干破裂");
        node.children[1].active = true;
        let a = node.children[1].getComponent(dragonBones.ArmatureDisplay);
        a.playAnimation(node.name, 1);
        this.line1 = [];
        this.scheduleOnce(() => {
            node.children[1].active = false;
            this.mainSrict.onlost();
            // this.main.getChildByName("zc_lostend").active = true;

            this.draw1.clear();
        }, 0.5);

    }

    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    jugetWin() {
        if (this.mainSrict.winValue == 3) {

            this.mainSrict.onwin();

        }
    }
}
