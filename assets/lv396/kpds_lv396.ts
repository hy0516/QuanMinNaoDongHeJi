
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass } = cc._decorator;

/**
 * 资源 pai/1.png～52.png 排列：按点数连续，每种点数 4 张花色。
 * 点数 1（A）：id 1～4；点数 2：id 5～8；…；点数 5：id 17～20（4×4+1～4×5）；
 * id 1=黑桃A、2=红心A、3=方块A、4=梅花A，依此类推至 K。
 */
function cardIdToRankSuit(id: number): { rank: number; suit: number } {
    const rank = Math.floor((id - 1) / 4) + 1;
    const suit = (id - 1) % 4;
    return { rank, suit };
}

/** 牌面点数比较：1=A（最小），13=K（最大） */
function rankPoint(r: number): number {
    return r;
}

/** 牌面 1–13：1=A，11=J，12=Q，13=K（资源为每种点数 4 张花色顺延） */
function cardRankLabel(r: number): string {
    if (r === 1) return "A";
    if (r >= 2 && r <= 10) return String(r);
    if (r === 11) return "J";
    if (r === 12) return "Q";
    if (r === 13) return "K";
    return "?";
}

/** 花色 0–3：黑桃、红心、方块、梅花（与同点数内 id 顺序一致） */
function suitName(s: number): string {
    const names = ["黑桃", "红心", "方块", "梅花"];
    return names[s] != null ? names[s] : String(s);
}

type HandKind =
    | "straight_flush"
    | "straight"
    | "four_kind"
    | "full_house"
    | "three_kind"
    | "one_pair"
    | "high_card";

interface HandResult {
    kind: HandKind;
    power: number;
    /** 参与结算的牌在 5 张中的下标 */
    validIndices: number[];
}

@ccclass
export default class kpds_lv396 extends BaseGame {
    private kp: cc.Node = null;
    private qjs: cc.Node = null;
    private kNode: cc.Node = null;
    private yg1: cc.Node = null;
    private yg2: cc.Node = null;
    private kpSke: dragonBones.ArmatureDisplay = null;
    private qjsSke: dragonBones.ArmatureDisplay = null;
    /** 开场 VS 龙骨（节点名 vs_ske，动画名 vs） */
    private vsSkeNode: cc.Node = null;
    private vsSke: dragonBones.ArmatureDisplay = null;
    /** 开场 VS 播放中：暂停战斗与操作 */
    private introPlaying = false;
    private kpXt: cc.Node = null;
    private qjsXt: cc.Node = null;

    private readonly maxHp = 1000;
    private kpHp = 1000;
    private qjsHp = 1000;

    private readonly moveSpeed = 500;
    private readonly stickMaxRadius = 110;
    /** 拳击手：加速度 / 上限（略高于卡牌大师）；追击不因摩擦降速，仅封顶 */
    private readonly qjsAccel = 900;
    private readonly qjsMaxSpeed = 620;
    private qjsVelX = 0;
    private qjsVelY = 0;
    /** 普攻结束后沿此方向满速滑行，撞边后再恢复追击 */
    private qjsCoasting = false;
    private qjsCoastDirX = 0;
    private qjsCoastDirY = 1;
    private readonly qjsAttackRange = 145;
    /** 测试卡牌大师时关闭拳击手位移（朝向与攻击仍生效） */
    private readonly qjsMovementEnabled = true;
    private cardAttackInterval = 3.4;
    private qjsAttackCooldown = 0;
    private cardAttackTimer = 0;
    private nextCardAttackDelay = 1.0;

    private stickActive = false;
    private stickVec = cc.v2(0, 0);

    private qjsPunchCount = 0;

    private busyCardAnim = false;
    private busyQjsAtk = false;
    private gameEnded = false;

    private cardBackFrame: cc.SpriteFrame = null;
    private readonly cardFrameCache: Map<number, cc.SpriteFrame> = new Map();

    private readonly paiNames = ["pai1", "pai2", "pai3", "pai4", "pai5"];
    /** 每轮出牌前备份 pai1–pai5 的本地坐标，攻击结束后复原 */
    private paiLayoutBackup: cc.Vec3[] = [];
    /** 翻牌完成后展示手牌再进入弃牌/飞牌（秒） */
    private readonly revealHoldSeconds = 0.28;
    /** 顺子 / 同花顺 / 四条：展示停留时间（秒） */
    private readonly showdownRevealHoldSeconds = 2.0;

    /** 顺子类大牌演出时冻结双方位移与自动出牌计时 */
    private combatFrozen = false;

    private readonly hpLowThreshold = 500;
    private hpBarFillDefault: cc.Color = null;
    private hpLabelDefault: cc.Color = null;

    /** 第几次自动卡牌攻击（用于每 N 次一次幸运攻击） */
    private cardAttackSerial = 0;
    /** 每第几次攻击触发一次上帝之手（当次幸运 60，不累加） */
    private readonly luckyAttackEvery = 6;
    /** 当次「上帝之手」幸运加成（仅本轮抽牌生效；每第 6 次为 60，其余为 0，不累加） */
    private luckValue = 0;
    /** 看激励「幸运」视频后本局 +60 运气 */
    private matchAdLuckBonus = 0;
    /** 已看过幸运激励：本局常驻「上帝之手」，触发运气时不再额外飘字 */
    private luckyAdWatched = false;
    /** 三条及以上牌型基础抽中加成（与基础幸运、叠加幸运、广告加成相加，上限内重抽） */
    private readonly threePlusBaseBonus = 30;
    /** 本局基础幸运值（不参与每 6 次叠加，仅参与重抽概率） */
    private readonly baseLuckValue = 10;
    private btnLuckyNode: cc.Node = null;

    onLoad() {
        cc.game.setFrameRate(60);
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.onInit("lv396/audio_lv396");
        GameData.recordLevelEnter("kpds_lv396");

        this.kp = this.node.getChildByName("kp");
        this.qjs = this.node.getChildByName("qjs");
        this.kNode = this.node.getChildByName("k");
        this.yg1 = this.node.getChildByName("yg1");
        this.yg2 = this.yg1 ? this.yg1.getChildByName("yg2") : null;

        if (this.kp) {
            this.kpSke = this.kp.getChildByName("kp_ske").getComponent(dragonBones.ArmatureDisplay);
            this.kpXt = this.kp.getChildByName("xt");
        }
        if (this.qjs) {
            this.qjsSke = this.qjs.getChildByName("qjs_ske").getComponent(dragonBones.ArmatureDisplay);
            this.qjsXt = this.qjs.getChildByName("xt");
        }

        this.preloadCardFrames();
        const backSp = this.kp.getChildByName("pai1").getComponent(cc.Sprite);
        if (backSp && backSp.spriteFrame) this.cardBackFrame = backSp.spriteFrame;
        this.bindJoystick();
        this.refreshHpUi(this.kpXt, this.kpHp);
        this.refreshHpUi(this.qjsXt, this.qjsHp);

        if (this.kpSke) this.kpSke.playAnimation("kp_dj", -1);
        if (this.qjsSke) this.qjsSke.playAnimation("qj_dj", -1);

        this.bindIncentiveButtons();

        const koNd = this.node.getChildByName("ko_ske");
        if (koNd) koNd.active = false;

        this.startVsIntro();
    }

    /** 播放开场 vs 动画一次后再进入战斗与 BGM */
    private startVsIntro() {
        this.vsSkeNode = this.node.getChildByName("vs_ske");
        if (!this.vsSkeNode) {
            cc.warn("[kpds_lv396] 未找到节点 vs_ske，跳过开场动画");
            this.scheduleGameplayBgm();
            return;
        }
        this.vsSke = this.vsSkeNode.getComponent(dragonBones.ArmatureDisplay);
        if (!this.vsSke) {
            cc.warn("[kpds_lv396] vs_ske 缺少 dragonBones.ArmatureDisplay");
            this.scheduleGameplayBgm();
            return;
        }
        this.introPlaying = true;
        this.vsSkeNode.active = true;
        this.vsSkeNode.zIndex = 999;
        AudioManager.playEffect("倒计时");
        this.vsSke.playAnimation("vs", 1);
        this.addOneTimeListener(this.vsSke, () => {
            if (this.vsSkeNode && cc.isValid(this.vsSkeNode)) this.vsSkeNode.active = false;
            this.introPlaying = false;
            this.scheduleGameplayBgm();
        });
    }

    private scheduleGameplayBgm() {
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景_lv396", true, 0.7);
        }, 0.5);
    }

    /** 为 prefab 中无 Button 的激励节点注册点击 */
    private bindIncentiveButtons() {
        const bg = this.node.getChildByName("bg");
        if (!bg) return;
        const ax = bg.getChildByName("btn_ax");
        const lucky = bg.getChildByName("btn_lucky");
        this.btnLuckyNode = lucky;
        this.ensureBtnClick(ax, "onHealAdClick");
        this.ensureBtnClick(lucky, "onLuckyAdClick");
    }

    private ensureBtnClick(node: cc.Node, handlerName: string) {
        if (!node) return;
        let btn = node.getComponent(cc.Button);
        if (!btn) {
            btn = node.addComponent(cc.Button);
            btn.target = node;
            btn.transition = cc.Button.Transition.NONE;
        }
        btn.clickEvents.length = 0;
        const h = new cc.Component.EventHandler();
        h.target = this.node;
        h.component = "kpds_lv396";
        h.handler = handlerName;
        btn.clickEvents.push(h);
    }

    /** 看广告回血 */
    onHealAdClick() {
        if (this.gameEnded || GameData.PauseGame) return;
        const run = () => {
            const healAmt = 1000;
            const next = Math.min(this.maxHp, this.kpHp + healAmt);
            const gained = Math.floor(next - this.kpHp);
            if (gained <= 0) return;
            this.kpHp = next;
            this.refreshHpUi(this.kpXt, this.kpHp);
            this.showHealFloat(this.kp, gained);
            AudioManager.playEffect("回血");
        };
        this.isshowVideo ? run() : VideoManager.getInstance().showVideo(run);
    }

    /** 看广告本局 +60 运气，看完后隐藏按钮；本局常驻「上帝之手」，不再在运气触发时飘字 */
    onLuckyAdClick() {
        if (this.gameEnded || GameData.PauseGame) return;
        const run = () => {
            this.luckyAdWatched = true;
            this.matchAdLuckBonus = 60;
            AudioManager.playEffect("加好运");
            this.showPersistentGodHand();
            if (this.btnLuckyNode && cc.isValid(this.btnLuckyNode)) this.btnLuckyNode.active = false;
        };
        this.isshowVideo ? run() : VideoManager.getInstance().showVideo(run);
    }

    private preloadCardFrames() {
        const bundle = cc.assetManager.getBundle(GameData.curGameStyle);
        if (!bundle) {
            cc.warn("[kpds_lv396] bundle 未就绪，稍后重试加载牌面");
            this.scheduleOnce(() => this.preloadCardFrames(), 0.3);
            return;
        }
        for (let i = 1; i <= 52; i++) {
            bundle.load(`picture_lv396/pai/${i}`, cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
                if (!err && sf) this.cardFrameCache.set(i, sf);
            });
        }
    }

    private bindJoystick() {
        if (!this.yg1 || !this.yg2) return;
        this.yg1.on(cc.Node.EventType.TOUCH_START, this.onStickStart, this);
        this.yg1.on(cc.Node.EventType.TOUCH_MOVE, this.onStickMove, this);
        this.yg1.on(cc.Node.EventType.TOUCH_END, this.onStickEnd, this);
        this.yg1.on(cc.Node.EventType.TOUCH_CANCEL, this.onStickEnd, this);
    }

    private onStickStart(e: cc.Event.EventTouch) {
        if (this.introPlaying || this.gameEnded || GameData.PauseGame) return;
        this.stickActive = true;
        this.updateStick(e);
    }

    private onStickMove(e: cc.Event.EventTouch) {
        if (!this.stickActive) return;
        this.updateStick(e);
    }

    private onStickEnd() {
        this.stickActive = false;
        this.stickVec.x = 0;
        this.stickVec.y = 0;
        if (this.yg2) this.yg2.setPosition(0, 0);
    }

    private updateStick(e: cc.Event.EventTouch) {
        const loc = e.getLocation();
        const ui = this.yg1.convertToNodeSpaceAR(loc);
        const len = Math.sqrt(ui.x * ui.x + ui.y * ui.y);
        const r = Math.min(len, this.stickMaxRadius);
        const nx = len > 0 ? (ui.x / len) * r : 0;
        const ny = len > 0 ? (ui.y / len) * r : 0;
        this.yg2.setPosition(nx, ny);
        const inv = this.stickMaxRadius > 0 ? 1 / this.stickMaxRadius : 0;
        this.stickVec.x = nx * inv;
        this.stickVec.y = ny * inv;
    }

    update(dt: number) {
        if (this.gameEnded || GameData.PauseGame) return;
        if (this.introPlaying) return;
        if (this.combatFrozen) return;

        this.movePlayer(dt);
        this.updateQjsAi(dt);

        this.cardAttackTimer += dt;
        if (this.cardAttackTimer >= this.nextCardAttackDelay && !this.busyCardAnim && !this.busyQjsAtk) {
            this.cardAttackTimer = 0;
            this.nextCardAttackDelay = this.cardAttackInterval;
            this.runCardAttackSequence();
        }
    }

    private getArenaBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
        const k = this.kNode;
        const hw = (k.width * Math.abs(k.scaleX)) / 2;
        const hh = (k.height * Math.abs(k.scaleY)) / 2;
        return { minX: k.x - hw, maxX: k.x + hw, minY: k.y - hh, maxY: k.y + hh };
    }

    private clampNodeInArena(who: cc.Node) {
        const b = this.getArenaBounds();
        const hw = (who.width * Math.abs(who.scaleX)) / 2;
        const hh = (who.height * Math.abs(who.scaleY)) / 2;
        who.x = cc.misc.clampf(who.x, b.minX + hw, b.maxX - hw);
        who.y = cc.misc.clampf(who.y, b.minY + hh, b.maxY - hh);
    }

    private movePlayer(dt: number) {
        if (!this.kp) return;
        const vx = this.stickVec.x;
        const vy = this.stickVec.y;
        const m = Math.sqrt(vx * vx + vy * vy);
        if (m < 0.01) return;
        const sp = this.moveSpeed * dt;
        this.kp.x += (vx / m) * sp;
        this.kp.y += (vy / m) * sp;
        this.clampNodeInArena(this.kp);
        if (this.kpSke && this.kpSke.node) {
            const face = vx >= 0 ? 1 : -1;
            const sk = this.kpSke.node;
            sk.scaleX = Math.abs(sk.scaleX) * face;
        }
    }

    private updateQjsAi(dt: number) {
        if (!this.qjs || !this.kp) return;
        const dx = this.kp.x - this.qjs.x;
        const dy = this.kp.y - this.qjs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const faceX = this.qjsCoasting ? this.qjsCoastDirX : dx;
        const sign = faceX >= 0 ? 1 : -1;
        if (this.qjsSke && this.qjsSke.node) {
            const sk = this.qjsSke.node;
            sk.scaleX = Math.abs(sk.scaleX) * sign;
        }

        this.qjsAttackCooldown -= dt;
        if (!this.qjsCoasting && dist <= this.qjsAttackRange && this.qjsAttackCooldown <= 0 && !this.busyQjsAtk) {
            this.tryQjsAttack();
            return;
        }

        if (!this.qjsMovementEnabled) {
            return;
        }

        if (this.busyQjsAtk) {
            return;
        }

        if (this.qjsCoasting) {
            this.qjsVelX = this.qjsCoastDirX * this.qjsMaxSpeed;
            this.qjsVelY = this.qjsCoastDirY * this.qjsMaxSpeed;
            const bx = this.qjs.x + this.qjsVelX * dt;
            const by = this.qjs.y + this.qjsVelY * dt;
            this.qjs.setPosition(bx, by);
            this.clampNodeInArena(this.qjs);
            const hitX = Math.abs(this.qjs.x - bx) > 0.5;
            const hitY = Math.abs(this.qjs.y - by) > 0.5;
            if (hitX || hitY) {
                this.qjsCoasting = false;
                if (hitX) this.qjsVelX = 0;
                if (hitY) this.qjsVelY = 0;
            }
            return;
        }

        if (dist >= 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            this.qjsVelX += nx * this.qjsAccel * dt;
            this.qjsVelY += ny * this.qjsAccel * dt;
            const spd = Math.sqrt(this.qjsVelX * this.qjsVelX + this.qjsVelY * this.qjsVelY);
            if (spd > this.qjsMaxSpeed) {
                const t = this.qjsMaxSpeed / spd;
                this.qjsVelX *= t;
                this.qjsVelY *= t;
            }
        }

        const bx2 = this.qjs.x + this.qjsVelX * dt;
        const by2 = this.qjs.y + this.qjsVelY * dt;
        this.qjs.setPosition(bx2, by2);
        this.clampNodeInArena(this.qjs);
        if (Math.abs(this.qjs.x - bx2) > 0.5) this.qjsVelX = 0;
        if (Math.abs(this.qjs.y - by2) > 0.5) this.qjsVelY = 0;
    }

    private tryQjsAttack() {
        if (!this.qjsSke) return;
        if (this.kp) {
            const ax = this.kp.x - this.qjs.x;
            const ay = this.kp.y - this.qjs.y;
            const ad = Math.sqrt(ax * ax + ay * ay);
            if (ad > 0.01) {
                this.qjsCoastDirX = ax / ad;
                this.qjsCoastDirY = ay / ad;
            }
        }
        this.busyQjsAtk = true;
        this.qjsPunchCount++;
        let useSkill = false;
        if (this.qjsPunchCount % 5 === 0 && Math.random() < 0.5) {
            useSkill = true;
        }
        const anim = useSkill ? "qj_jn" : "qj_gj";
        this.qjsAttackCooldown = useSkill ? 1.1 : 0.65;

        AudioManager.playEffect(useSkill ? "拳皇技能" : "拳皇普攻");
        this.qjsSke.playAnimation(anim, 1);
        this.addOneTimeListener(this.qjsSke, () => {
            const dmg = useSkill ? 300 : 40 + Math.floor(Math.random() * 21);
            this.applyDamageToKp(dmg);
            if (this.qjsSke && cc.isValid(this.qjsSke)) this.qjsSke.playAnimation("qj_dj", -1);
            this.busyQjsAtk = false;
            this.qjsVelX = this.qjsCoastDirX * this.qjsMaxSpeed;
            this.qjsVelY = this.qjsCoastDirY * this.qjsMaxSpeed;
            this.qjsCoasting = true;
        });
    }

    private applyDamageToKp(amount: number) {
        if (this.gameEnded) return;
        this.showDamageFloat(this.kp, amount, true);
        this.kpHp = Math.max(0, this.kpHp - amount);
        this.refreshHpUi(this.kpXt, this.kpHp);
        if (this.kpSke) {
            this.kpSke.playAnimation("kp_sj", 1);
            this.addOneTimeListener(this.kpSke, () => {
                if (this.kpSke && cc.isValid(this.kpSke)) this.kpSke.playAnimation("kp_dj", -1);
            });
        }
        if (this.kpHp <= 0) this.endFail();
    }

    private applyDamageToQjs(amount: number) {
        if (this.gameEnded) return;
        this.showDamageFloat(this.qjs, amount, false);
        this.qjsHp = Math.max(0, this.qjsHp - amount);
        this.refreshHpUi(this.qjsXt, this.qjsHp);
        if (this.qjsSke) {
            this.qjsSke.playAnimation("qj_sj", 1);
            this.addOneTimeListener(this.qjsSke, () => {
                if (this.qjsSke && cc.isValid(this.qjsSke)) this.qjsSke.playAnimation("qj_dj", -1);
            });
        }
        if (this.qjsHp <= 0) this.onwin();
    }

    /** 在目标角色头顶飘字显示伤害 */
    private showDamageFloat(target: cc.Node, amount: number, isDamageToKp: boolean) {
        if (!target || !this.node || !cc.isValid(target)) return;
        const world = target.convertToWorldSpaceAR(cc.v3(0, 72, 0));
        const lp = this.node.convertToNodeSpaceAR(world);
        const n = new cc.Node("dmgFloat");
        n.parent = this.node;
        n.setPosition(lp);
        const lb = n.addComponent(cc.Label);
        const amt = Math.floor(amount);
        lb.string = "-" + String(amt);
        lb.fontSize = 44;
        lb.lineHeight = 44;
        lb.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lb.verticalAlign = cc.Label.VerticalAlign.CENTER;
        (lb as any).enableBold = true;
        if (isDamageToKp) {
            n.color = amt > 50 ? cc.color(255, 20, 20) : cc.color(255, 125, 125);
        } else {
            n.color = cc.color(255, 210, 80);
        }
        const y0 = lp.y;
        cc.tween(n)
            .to(0.75, { y: y0 + 52, opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                if (cc.isValid(n)) n.destroy();
            })
            .start();
    }

    /** 回血飘绿字 */
    private showHealFloat(target: cc.Node, amount: number) {
        if (!target || !this.node || !cc.isValid(target)) return;
        const world = target.convertToWorldSpaceAR(cc.v3(0, 72, 0));
        const lp = this.node.convertToNodeSpaceAR(world);
        const n = new cc.Node("healFloat");
        n.parent = this.node;
        n.setPosition(lp);
        const lb = n.addComponent(cc.Label);
        lb.string = "+" + String(Math.floor(amount));
        lb.fontSize = 44;
        lb.lineHeight = 44;
        lb.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lb.verticalAlign = cc.Label.VerticalAlign.CENTER;
        (lb as any).enableBold = true;
        n.color = cc.color(80, 255, 130);
        const y0 = lp.y;
        cc.tween(n)
            .to(0.75, { y: y0 + 52, opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                if (cc.isValid(n)) n.destroy();
            })
            .start();
    }

    /** kp 下「上帝之手」文字节点 sdzs（预制体挂 Label 或子节点 Label） */
    private getSdzsNode(): cc.Node | null {
        if (!this.kp || !cc.isValid(this.kp)) return null;
        return this.kp.getChildByName("sdzs");
    }

    private getSdzsLabel(): cc.Label | null {
        const n = this.getSdzsNode();
        if (!n || !cc.isValid(n)) return null;
        const lb = n.getComponent(cc.Label);
        if (lb) return lb;
        return n.getComponentInChildren(cc.Label);
    }

    /** 未看幸运视频时：第 N 次运气触发，用 sdzs 飘字「上帝之手」 */
    private showGodHandFloat() {
        const n = this.getSdzsNode();
        if (!n || !cc.isValid(n)) {
            cc.warn("[kpds_lv396] kp 下未找到 sdzs，无法显示上帝之手");
            return;
        }
        const lb = this.getSdzsLabel();
        if (lb) lb.string = "上帝之手";
        n.stopAllActions();
        n.active = true;
        n.opacity = 255;
        const y0 = n.y;
        cc.tween(n)
            .to(0.85, { y: y0 + 56, opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                if (cc.isValid(n)) {
                    n.active = false;
                    n.opacity = 255;
                    n.y = y0;
                }
            })
            .start();
    }

    /** 看过幸运视频后：sdzs 常驻显示「上帝之手」，随 kp 移动 */
    private showPersistentGodHand() {
        const n = this.getSdzsNode();
        if (!n || !cc.isValid(n)) {
            cc.warn("[kpds_lv396] kp 下未找到 sdzs，无法显示上帝之手");
            return;
        }
        n.stopAllActions();
        const lb = this.getSdzsLabel();
        if (lb) lb.string = "上帝之手";
        n.opacity = 255;
        n.active = true;
    }

    private clearPersistentGodHand() {
        const n = this.getSdzsNode();
        if (n && cc.isValid(n)) {
            n.stopAllActions();
            n.active = false;
        }
    }

    private refreshHpUi(xt: cc.Node, hp: number) {
        if (!xt) return;
        const mask = xt.getChildByName("mask");
        const labNode = xt.getChildByName("xtNum");
        const fill = mask ? mask.getChildByName("szj2") : null;

        if (fill && this.hpBarFillDefault === null) {
            this.hpBarFillDefault = fill.color.clone();
        }
        if (labNode && this.hpLabelDefault === null) {
            this.hpLabelDefault = labNode.color.clone();
        }

        if (mask) {
            const full = 54;
            mask.height = full * (hp / this.maxHp);
        }

        const low = hp < this.hpLowThreshold;
        if (fill && labNode) {
            if (low) {
                fill.color = cc.color(230, 55, 55);
                labNode.color = cc.color(255, 252, 250);
            } else {
                if (this.hpBarFillDefault) fill.color = this.hpBarFillDefault;
                if (this.hpLabelDefault) labNode.color = this.hpLabelDefault;
            }
        }

        if (labNode) {
            const lb = labNode.getComponent(cc.Label);
            if (lb) lb.string = String(Math.ceil(hp));
        }
    }

    private pickFiveCardIds(): number[] {
        const retryPct = Math.min(
            95,
            this.threePlusBaseBonus +
                this.baseLuckValue +
                this.luckValue +
                this.matchAdLuckBonus
        );
        for (let t = 0; t < 24; t++) {
            const ids = this.randomFiveCardIds();
            const hand = this.evaluateHand(ids);
            if (this.isThreeKindOrBetter(hand.kind)) return ids;
            if (Math.random() * 100 >= retryPct) return ids;
        }
        return this.randomFiveCardIds();
    }

    private isStraight5(ranks: number[]): boolean {
        const u: number[] = [];
        for (let i = 0; i < ranks.length; i++) {
            if (u.indexOf(ranks[i]) < 0) u.push(ranks[i]);
        }
        if (u.length !== 5) return false;
        u.sort((a, b) => a - b);
        if (u[0] === 1 && u[1] === 2 && u[2] === 3 && u[3] === 4 && u[4] === 5) return true;
        if (u[0] === 1 && u[1] === 10 && u[2] === 11 && u[3] === 12 && u[4] === 13) return true;
        for (let i = 1; i < 5; i++) {
            if (u[i] !== u[i - 1] + 1) return false;
        }
        return true;
    }

    private evaluateHand(ids: number[]): HandResult {
        const cards = ids.map((id, i) => ({ id, ...cardIdToRankSuit(id), idx: i }));
        const ranks = cards.map(c => c.rank);
        const suits = cards.map(c => c.suit);

        const flush = suits.every(s => s === suits[0]);
        const straight = this.isStraight5(ranks);

        const cnt: { [k: number]: number } = {};
        for (const r of ranks) cnt[r] = (cnt[r] || 0) + 1;
        const entries = Object.keys(cnt).map(k => ({ rank: Number(k), c: cnt[Number(k)] }));
        entries.sort((a, b) => b.c - a.c || rankPoint(b.rank) - rankPoint(a.rank));

        const sumPoints = () => ranks.reduce((s, r) => s + rankPoint(r), 0);

        const indicesOfRank = (r: number) => cards.filter(c => c.rank === r).map(c => c.idx);
        const indicesAll = () => [0, 1, 2, 3, 4];

        if (flush && straight) {
            return { kind: "straight_flush", power: sumPoints() * 30, validIndices: indicesAll() };
        }
        if (straight) {
            return { kind: "straight", power: sumPoints() * 25, validIndices: indicesAll() };
        }
        if (entries[0].c === 4) {
            return { kind: "four_kind", power: sumPoints() * 20, validIndices: indicesAll() };
        }
        if (entries[0].c === 3 && entries[1].c === 2) {
            return { kind: "full_house", power: sumPoints() * 15, validIndices: indicesAll() };
        }
        if (entries[0].c === 3) {
            const tR = entries[0].rank;
            const tripSum = 3 * rankPoint(tR);
            return { kind: "three_kind", power: tripSum * 12, validIndices: indicesOfRank(tR) };
        }
        if (entries[0].c === 2 && entries[1].c === 2) {
            /** entries 已按对子点数从高到低排，两对时取大的那对参与战力与出牌 */
            const rHigh =
                rankPoint(entries[0].rank) >= rankPoint(entries[1].rank) ? entries[0].rank : entries[1].rank;
            const pairSum = 2 * rankPoint(rHigh);
            return {
                kind: "one_pair",
                power: pairSum * 4,
                validIndices: indicesOfRank(rHigh),
            };
        }
        if (entries[0].c === 2) {
            const pr = entries[0].rank;
            const pairSum = 2 * rankPoint(pr);
            return { kind: "one_pair", power: pairSum * 4, validIndices: indicesOfRank(pr) };
        }
        /** 单牌（高牌）：五张互不成型时，战力为最大牌面点数×2 */
        let bestIdx = 0;
        let bestP = rankPoint(ranks[0]);
        for (let i = 1; i < 5; i++) {
            const p = rankPoint(ranks[i]);
            if (p > bestP) {
                bestP = p;
                bestIdx = i;
            }
        }
        return { kind: "high_card", power: bestP * 2, validIndices: [bestIdx] };
    }

    /** 三条及以上：三条、葫芦、四条、顺子、同花顺（不含一对、高牌） */
    private isThreeKindOrBetter(kind: HandKind): boolean {
        return (
            kind === "three_kind" ||
            kind === "full_house" ||
            kind === "four_kind" ||
            kind === "straight" ||
            kind === "straight_flush"
        );
    }

    /** 顺子 / 同花顺 / 四条：大牌特写（停移动、延长展示、有效牌二次翻牌再飞出） */
    private isShowdownHandKind(kind: HandKind): boolean {
        return kind === "straight" || kind === "straight_flush" || kind === "four_kind";
    }

    private randomFiveCardIds(): number[] {
        const result: number[] = [];
        while (result.length < 5) {
            const n = 1 + Math.floor(Math.random() * 52);
            if (result.indexOf(n) < 0) result.push(n);
        }
        return result;
    }

    private runCardAttackSequence() {
        if (!this.kp || this.busyCardAnim || this.gameEnded) return;
        this.busyCardAnim = true;
        this.cardAttackSerial++;
        this.luckValue = 0;
        if (this.cardAttackSerial % this.luckyAttackEvery === 0) {
            this.luckValue = 60;
            if (!this.luckyAdWatched && this.kp) {
                this.showGodHandFloat();
            }
            AudioManager.playEffect("加好运");
        }
        const ids = this.pickFiveCardIds();
        const hand = this.evaluateHand(ids);
        const showdown = this.isShowdownHandKind(hand.kind);
        if (showdown) this.combatFrozen = true;
        const revealPause = showdown ? this.showdownRevealHoldSeconds : this.revealHoldSeconds;

        const paiNodes = this.paiNames.map(n => this.kp.getChildByName(n));

        const saved: cc.Vec3[] = [];
        this.paiLayoutBackup = [];
        for (let i = 0; i < 5; i++) {
            const p = paiNodes[i].position.clone();
            saved.push(p);
            this.paiLayoutBackup.push(p.clone());
            paiNodes[i].opacity = 0;
            paiNodes[i].scale = 1;
        }

        const center = cc.v3(0, 20, 0);
        for (let i = 0; i < 5; i++) {
            paiNodes[i].setPosition(center);
            paiNodes[i].opacity = 255;
        }
        AudioManager.playEffect("发牌");

        let idx = 0;
        const stepMove = () => {
            if (idx >= 5) {
                this.flipPhase(paiNodes, ids, hand, revealPause, showdown);
                return;
            }
            cc.tween(paiNodes[idx])
                .to(0.12, { position: saved[idx] }, { easing: "sineOut" })
                .call(() => {
                    idx++;
                    stepMove();
                })
                .start();
        };
        stepMove();
    }

    private flipPhase(
        paiNodes: cc.Node[],
        ids: number[],
        hand: HandResult,
        revealPauseSec: number,
        isShowdown: boolean
    ) {
        let done = 0;
        for (let i = 0; i < 5; i++) {
            const id = ids[i];
            const sf = this.cardFrameCache.get(id);
            const sp = paiNodes[i].getComponent(cc.Sprite);
            cc.tween(paiNodes[i])
                .to(0.06, { scaleX: 0 })
                .call(() => {
                    if (sf && sp) sp.spriteFrame = sf;
                })
                .to(0.06, { scaleX: 1 })
                .call(() => {
                    done++;
                    if (done === 5) {
                        if (isShowdown) {
                            if (hand.kind === "straight_flush") {
                                AudioManager.playEffect("同花顺");
                            } else if (hand.kind === "straight" || hand.kind === "four_kind") {
                                AudioManager.playEffect("顺子四条");
                            }
                        }
                        this.scheduleOnce(() => this.afterRevealDisplay(paiNodes, hand, isShowdown), revealPauseSec);
                    }
                })
                .start();
        }
    }

    /** 翻牌展示结束后：先弃掉无效牌（不计伤害），再飞出有效牌结算 */
    private afterRevealDisplay(paiNodes: cc.Node[], hand: HandResult, isShowdown: boolean) {
        const validList = hand.validIndices;
        const isValidIdx = (idx: number) => {
            for (let v = 0; v < validList.length; v++) {
                if (validList[v] === idx) return true;
            }
            return false;
        };

        const invalidIndices: number[] = [];
        for (let i = 0; i < 5; i++) {
            if (!isValidIdx(i)) invalidIndices.push(i);
        }

        const startFlyPhase = () => {
            if (isShowdown) {
                this.runShowdownSecondFlipThenFly(paiNodes, hand);
            } else {
                this.playValidCardsFly(paiNodes, hand);
            }
        };

        if (invalidIndices.length === 0) {
            startFlyPhase();
            return;
        }

        let discardDone = 0;
        const onDiscardEnd = () => {
            discardDone++;
            if (discardDone >= invalidIndices.length) {
                startFlyPhase();
            }
        };

        for (let d = 0; d < invalidIndices.length; d++) {
            const i = invalidIndices[d];
            const n = paiNodes[i];
            const endY = n.y - 72;
            cc.tween(n)
                .to(0.2, { y: endY, opacity: 0 }, { easing: "sineIn" })
                .call(onDiscardEnd)
                .start();
        }
    }

    /** 三条 / 葫芦 / 四条：结算伤害不低于保底，高于则按牌型战力 */
    private getFinalCardDamage(hand: HandResult): number {
        let d = Math.max(1, Math.floor(hand.power));
        if (hand.kind === "three_kind") d = Math.max(d, 200);
        else if (hand.kind === "full_house") d = Math.max(d, 250);
        else if (hand.kind === "four_kind") d = Math.max(d, 400);
        return d;
    }

    /** 大牌演出：有效攻击牌再播一次 scaleX 1→0→1，再飞出 */
    private runShowdownSecondFlipThenFly(paiNodes: cc.Node[], hand: HandResult) {
        const validList = hand.validIndices;
        if (validList.length === 0) {
            this.playValidCardsFly(paiNodes, hand);
            return;
        }
        const flipDur = 0.1;
        let done = 0;
        const onOneFlipEnd = () => {
            done++;
            if (done >= validList.length) {
                this.playValidCardsFly(paiNodes, hand);
            }
        };
        for (let v = 0; v < validList.length; v++) {
            const n = paiNodes[validList[v]];
            n.stopAllActions();
            cc.tween(n)
                .to(flipDur, { scaleX: 0 })
                .to(flipDur, { scaleX: 1 })
                .call(onOneFlipEnd)
                .start();
        }
    }

    /** 有效牌飞向敌人并结算伤害，最后复原牌背与位置 */
    private playValidCardsFly(paiNodes: cc.Node[], hand: HandResult) {
        const validList = hand.validIndices;
        const targetWorld = this.qjs.parent.convertToWorldSpaceAR(this.qjs.position);
        const localTarget = this.kp.convertToNodeSpaceAR(targetWorld);
        const power = this.getFinalCardDamage(hand);
        AudioManager.playEffect("卡牌攻击");

        if (validList.length === 0) {
            this.applyDamageToQjs(power);
            this.restorePaiAfterAttack(paiNodes);
            this.combatFrozen = false;
            this.busyCardAnim = false;
            return;
        }

        let flyDone = 0;
        const onFlyEnd = () => {
            flyDone++;
            if (flyDone >= validList.length) {
                this.applyDamageToQjs(power);
                this.restorePaiAfterAttack(paiNodes);
                this.combatFrozen = false;
                this.busyCardAnim = false;
            }
        };

        for (let v = 0; v < validList.length; v++) {
            const i = validList[v];
            const n = paiNodes[i];
            cc.tween(n)
                .to(0.22, { position: localTarget, scale: 1.15 })
                .call(onFlyEnd)
                .start();
        }
    }

    /** 攻击结束后：停动画、回到备份位置、隐藏、换回牌背 */
    private restorePaiAfterAttack(paiNodes: cc.Node[]) {
        for (let i = 0; i < 5; i++) {
            const n = paiNodes[i];
            n.stopAllActions();
            const bak = this.paiLayoutBackup[i];
            if (bak) n.setPosition(bak);
            n.opacity = 0;
            n.scale = 1;
            n.scaleX = 1;
            const sp = n.getComponent(cc.Sprite);
            if (sp && this.cardBackFrame) sp.spriteFrame = this.cardBackFrame;
        }
    }

    private endFail() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.clearPersistentGodHand();
        GameData.PauseGame = true;
        this.scheduleOnce(() => {
            this.endlost("prefabs/zc/zc_lostend");
        }, 1.5)

    }

    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame === true) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                break;
            case "tishi": {
                const handlers = () => {
                    VideoManager.getInstance().showInsert();
                    const bg = this.node.getChildByName("bg");
                    const tips = bg ? bg.getChildByName("tipsPanel") : null;
                    if (tips) tips.active = true;
                };
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            }
            case "x": {
                const bg = this.node.getChildByName("bg");
                const tips = bg ? bg.getChildByName("tipsPanel") : null;
                if (tips) tips.active = false;
                break;
            }
            case "ch":
                event.currentTarget.active = false;
                break;
        }
    }

    isshowVideo = false;

    onwin() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.clearPersistentGodHand();
        GameData.PauseGame = true;

        const koNode = this.node.getChildByName("ko_ske");
        const koArm = koNode ? koNode.getComponent(dragonBones.ArmatureDisplay) : null;
        if (koNode && koArm && cc.isValid(koNode)) {
            koNode.active = true;
            koNode.zIndex = 998;
            AudioManager.playEffect("KO");
            koArm.playAnimation("ko", 1);
            this.addOneTimeListener(koArm, () => {
                if (koNode && cc.isValid(koNode)) koNode.active = false;
                this.endwin("prefabs/zc/zc_winend");
            });
            return;
        }
        this.endwin("prefabs/zc/zc_winend");
    }
}
