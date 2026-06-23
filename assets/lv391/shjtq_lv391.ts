
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import shjtq_lv391_move from "./shjtq_lv391_move";



const { ccclass, property } = cc._decorator;

@ccclass
export default class shjtq_lv391 extends BaseGame {

    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;
    public startTime = 180;
    public startX = 0;
    public endX = 0;
    public curTime = 0;


    bgNode: cc.Node;

    /** 节点「23」在 bg 下的原始 siblingIndex，套中时临时压到 enemNode 下方避免挡角色 */
    private decor23SavedSiblingIndex = -1;

    /** 本关 enemNode 内可套角色数（0_tq～8_tq） */
    private readonly totalRoleCount = 9;
    /** 间距（与 compact 一致） */
    private readonly wrapStepPerMissing = 400;
    /** 出屏幕的最低左界（保证角色不在屏幕内就瞬移）；也是入场点的最低右界 */
    private readonly wrapScreenEdge = 1200;
    /** 满员 9 人：leftMost=-1600，wrapLeft=-2000，entryX=1600，period=3600 */
    private enemyWrapLeftX = -2000;
    private enemyWrapPeriodX = 3600;

    canjiaohu = true;
    catchCount = 0;
    isHard = false;
    canclose = true;
    globalSpeedMultiplier: number = 1.0;
    /** 首次点击抓捕前不倒计时 */
    private allowTimeCount = false;

    onLoad() {
        cc.game.setFrameRate(60);
        GameData.PauseGame = false;
        AudioManager.stopMusic();

        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv391", true, 0.7);
        }, 0.5);
        cc.Tween.stopAllByTarget(this.tittle);

        this.bgNode = this.node.getChildByName(`bg`);

        this.gameStart();

        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.refreshEnemyWrapLeftX();
    }


    gameStart() {

    }
    update(dt: number): void {

    }

    /** 供 move 每帧读缓存，避免统计存活数 */
    getEnemyWrapLeftX(): number {
        return this.enemyWrapLeftX;
    }

    getEnemyWrapPeriodX(): number {
        return this.enemyWrapPeriodX;
    }

    private refreshEnemyWrapLeftX(): void {
        const STEP = this.wrapStepPerMissing;
        const enemNode = this.bgNode ? this.bgNode.getChildByName(`enemNode`) : null;
        let n = this.totalRoleCount;
        if (enemNode) {
            let count = 0;
            for (let i = 0; i < enemNode.childrenCount; i++) {
                if (enemNode.children[i].active) count++;
            }
            if (count > 0) n = count;
        }
        const leftMost = -((n - 1) * STEP) / 2;
        const rightMost = ((n - 1) * STEP) / 2;
        // 左界：一格之外；但人少时 leftMost-STEP 可能只有 -400，至少要到屏幕外 -wrapScreenEdge
        this.enemyWrapLeftX = Math.min(leftMost - STEP, -this.wrapScreenEdge);
        // 入场点：seamless 公式是 rightMost，但至少要从屏幕外 wrapScreenEdge 进场
        const entryX = Math.max(rightMost, this.wrapScreenEdge);
        this.enemyWrapPeriodX = entryX - this.enemyWrapLeftX;
    }

    /** 套圈流程中暂停倒计时；失败在掏空动画结束后 resume，成功在关闭结算后 resume */
    private pauseRoundTimer(): void {
        this.unschedule(this.Timeing);
    }

    private resumeRoundTimer(): void {
        this.unschedule(this.Timeing);
        this.schedule(this.Timeing, 1);
    }

    private resetMainTqRopeIdle(): void {
        const rope = this.bgNode.getChildByName(`tq_ske`);
        if (!rope || !rope.active) return;
        const disp = rope.getComponent(dragonBones.ArmatureDisplay);
        if (disp) disp.playAnimation(`sz`, 0);
    }

    /** 把装饰节点 23 挪到 enemNode 前面绘制（不挡被套中角色） */
    private pushDecor23BehindEnemies(): void {
        const decor = this.bgNode.getChildByName(`23`);
        const enem = this.bgNode.getChildByName(`enemNode`);
        if (!decor || !enem) return;
        if (this.decor23SavedSiblingIndex < 0) {
            this.decor23SavedSiblingIndex = decor.getSiblingIndex();
        }
        decor.setSiblingIndex(enem.getSiblingIndex());
    }

    private restoreDecor23Order(): void {
        const decor = this.bgNode.getChildByName(`23`);
        if (!decor || this.decor23SavedSiblingIndex < 0) return;
        decor.setSiblingIndex(this.decor23SavedSiblingIndex);
        this.decor23SavedSiblingIndex = -1;
    }

    /** 关闭结算后把仍存活角色横向紧凑重排，避免后期人少时间距过大 */
    private compactRemainingEnemies(): void {
        const enemNode = this.bgNode.getChildByName(`enemNode`);
        if (!enemNode) return;
        const alive: cc.Node[] = [];
        for (let i = 0; i < enemNode.childrenCount; i++) {
            const c = enemNode.children[i];
            if (c.active) alive.push(c);
        }
        const n = alive.length;
        if (n === 0) return;
        alive.sort((a, b) => a.x - b.x);
        const STEP = 400;
        const startX = -((n - 1) * STEP) / 2;
        for (let i = 0; i < n; i++) {
            const node = alive[i];
            node.x = startX + i * STEP;
            const mv = node.getComponent(shjtq_lv391_move);
            if (mv) mv.tempX = null;
        }
    }

    private playRoleSoundForCatch(roleName: string): void {
        const pre = this.getPrefixBeforeTQ(roleName);
        const idx = parseInt(pre, 10);
        if (isNaN(idx) || idx < 0 || idx > 9) return;
        AudioManager.playEffect(`role${idx + 1}`);
    }

    /** 套中后的展示/结算（主界面绳子关掉，showSk 里 djwtq 播对应 zl） */
    private openCatchJieSuan(element: cc.Node): void {
        this.playRoleSoundForCatch(element.name);
        this.bgNode.getChildByName(`tq_ske`).active = false;
        this.unschedule(this.Timeing);
        element.active = false;
        this.refreshEnemyWrapLeftX();
        this.canclose = false;
        this.bgNode.getChildByName(`jiesuanbg`).active = true;
        this.bgNode.getChildByName(`showSk`).active = true;
        this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].getComponent(cc.Label).string = `0123456789`;
        for (let index = 0; index < this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).childrenCount; index++) {
            const row = this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).children[index];
            row.active = false;
        }
        this.bgNode.getChildByName(`showSk`).getChildByName(`bt`).getChildByName(`${element.name}`).active = true;
        this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].scale = 0;
        this.bgNode.getChildByName(`showSk`).getChildByName(`djwtq_ske`).scale = 0;
        this.bgNode.getChildByName(`showSk`).getChildByName(`djwtq_ske`).getComponent(dragonBones.ArmatureDisplay)
            .playAnimation(`${this.getPrefixBeforeTQ(element.name)}zl`, 0);
        cc.tween(this.bgNode.getChildByName(`showSk`).getChildByName(`djwtq_ske`)).to(0.5, { scale: 1 }).call(() => {
            this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].getComponent(cc.Label).string = this.getEnemZDL(element.name);
            this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0].scale = 10
            cc.tween(this.bgNode.getChildByName(`showSk`).getChildByName(`zl`).children[0]).to(0.3, { scale: 1 }).call(() => {
                this.canclose = true;
            }).start();
            AudioManager.playEffect(`sztc`);
        }).start();
        this.catchCount++;
        this.bgNode.getChildByName(`nodeCount`).getComponent(cc.Label).string =
            `进度:${this.catchCount}/${this.totalRoleCount}`;
    }

    /** sz_rc 播完后再判定对齐；套中走套圈逻辑，未套中播 sz_tk 回到待机 */
    catchBtn(event: cc.Event.EventTouch) {
        if (!this.canjiaohu) return;
        if (!this.allowTimeCount) {
            this.allowTimeCount = true;
            this.resumeRoundTimer();
        }
        this.pauseRoundTimer();
        this.canjiaohu = false;
        this.bgNode.getChildByName(`zb`).active = false;
        const tqDisplay = this.bgNode.getChildByName(`tq_ske`).getComponent(dragonBones.ArmatureDisplay);
        tqDisplay.playAnimation(`sz_rc`, 1);
        this.addOneTimeListener(tqDisplay, () => {
            const enemNode = this.bgNode.getChildByName(`enemNode`);
            let element: cc.Node = null;
            for (let index = 0; index < enemNode.childrenCount; index++) {
                const child = enemNode.children[index];
                if (!child.active) continue;
                if (Math.abs(child.x + child.children[0].x) < 30) {
                    element = child;
                    break;
                }
            }
            if (!element) {
                tqDisplay.playAnimation(`sz_tk`, 1);
                AudioManager.playEffect(`taokong`);
                this.addOneTimeListener(tqDisplay, () => {
                    tqDisplay.playAnimation(`sz`, 0);
                    this.bgNode.getChildByName(`zb`).active = true;
                    this.canjiaohu = true;
                    this.resumeRoundTimer();
                });
                return;
            }
            element.setSiblingIndex(element.parent.children.length - 1);
            element.getComponent(shjtq_lv391_move).canwalk = false;
            this.pushDecor23BehindEnemies();
            this.bgNode.getChildByName(`tq_ske`).active = false;
            const enemArm = element.getComponent(dragonBones.ArmatureDisplay);
            enemArm.timeScale = 1;
            enemArm.playAnimation(`${element.name}`, 1);
            AudioManager.playEffect(`lache`);
            this.addOneTimeListener(enemArm, () => {
                this.openCatchJieSuan(element);
            });
        });
    }
    closeJieSuan() {
        if (!this.canclose) return;
        const enemNode = this.bgNode.getChildByName(`enemNode`);
        this.bgNode.getChildByName(`enemNode`)
        for (let index = 0; index < enemNode.childrenCount; index++) {
            const element = enemNode.children[index];
            if (!element.active)
                continue;
            else {
                if (this.catchCount == 3) {
                    this.bgNode.getChildByName(`jiesuanbg`).active = false;
                    this.bgNode.getChildByName(`showSk`).active = false;
                    this.bgNode.getChildByName(`tq_ske`).active = true;
                    this.resetMainTqRopeIdle();
                    this.restoreDecor23Order();


                    this.bgNode.getChildByName(`ndbs_ske`).active = true;
                    this.bgNode.getChildByName(`ndbs_ske`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`jg`, 1);
                    AudioManager.playEffect(`ndbs`);
                    this.addOneTimeListener(this.bgNode.getChildByName(`ndbs_ske`).getComponent(dragonBones.ArmatureDisplay), () => {
                        this.isHard = true;
                        this.bgNode.getChildByName(`jiansu`).active = true;
                        this.bgNode.getChildByName(`ndbs_ske`).active = false;
                        this.compactRemainingEnemies();
                        this.resumeRoundTimer();
                        this.bgNode.getChildByName(`zb`).active = true;
                        this.canjiaohu = true;
                    })
                    return;
                }
                this.bgNode.getChildByName(`jiesuanbg`).active = false;
                this.bgNode.getChildByName(`showSk`).active = false;
                //  this.canMove=true;
                this.bgNode.getChildByName(`tq_ske`).active = true;
                this.resetMainTqRopeIdle();
                this.restoreDecor23Order();
                this.compactRemainingEnemies();
                this.bgNode.getChildByName(`zb`).active = true;
                this.canjiaohu = true;
                this.resumeRoundTimer();
                return;
            }

        }
        this.restoreDecor23Order();
        this.bgNode.getChildByName(`tq_ske`).active = true;
        this.resetMainTqRopeIdle();
        this.onwin();


    }
    getPrefixBeforeTQ(s: string): string {
        const lastTqIndex = s.lastIndexOf('tq');
        return lastTqIndex !== -1 ? s.slice(0, lastTqIndex) : '';
    }
    getEnemZDL(name: string) {
        switch (name) {
            case `0_tq`:
                return `150000`;
            case `1_tq`:
                return `50000000`;
            case `2_tq`:
                return `5`;
            case `3_tq`:
                return `5`;
            case `4_tq`:
                return `9999999999999999`;
            case `5_tq`:
                return `9999999999999999`;
            case `6_tq`:
                return `150000`;
            case `7_tq`:
                return `1500`;
            case `8_tq`:
                return `50000000`;
            case `9_tq`:
                return `50000000000`;
        }
        return `null`;
    }
    BtnHandler(event: cc.Event.EventTouch) {

        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     this.havefindList = [];
                //     this.node.destroy();
                //     VideoManager.getInstance().showCustomNativeAd();
                // })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
                break;
            case "jiansu":

                VideoManager.getInstance().showVideo(() => {

                    this.globalSpeedMultiplier = Math.max(0.3, this.globalSpeedMultiplier - 0.2);

                })
                break;
            case "tishi":
                var handlers = () => {
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                    //    
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case `x`:
                this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = false;
                break;
            case `ch`:
                event.currentTarget.active = false;
                break;
        }
    }

    isshowVideo = false;

    endlost(name: string) {
        cc.resources.load(name, cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            UINode.opacity = 0;
            cc.tween(UINode)
                .to(0.8, { opacity: 255 })
                .start()
        })
    }
    onwin() {
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
        return
        // var fun = () => {
        //     this.endwin("prefabs/zc/zc_winend");
        //     GameData.PauseGame = false;
        //     return
        // }
        // this.gou.cleanup();
        // cc.tween(this.gou)
        //     .to(1.3, { scaleX: 1, scaleY: 1 })
        //     .delay(1.3)
        //     .call(fun)
        //     .start()
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("finishjq");
        // }, 0.9)
    }




    talkdiplayTeshu(talkaudio: string, talkthing: string, handler?: Function) {

        var talk = this.node.getChildByName("bg").getChildByName("talkdi");
        talk.getChildByName("talk").getComponent(cc.Label).string = talkthing;
        talk.opacity = 255;
        AudioManager.playEffect(talkaudio, false, () => {
            talk.opacity = 0;
            handler && handler();
        })
    }
    Timeing() {
        if (!this.allowTimeCount) return;
        if (GameData.PauseGame == true) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
                //this.node.destroy();
            }, 0.7);
        }
    }
    setTime(time: number) {
        // GameData.PauseGame = true;
        if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString() + `s`;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.allowTimeCount) {
            this.Timeing();
        }
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }
    endAddTime() {

        this.startTime = 1;
        this.allowTimeCount = true;
        this.setTime(60);
        this.resumeRoundTimer();
        //})
    }

}



