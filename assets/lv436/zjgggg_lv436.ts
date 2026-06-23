import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import common from "../script/common/common";

const { ccclass } = cc._decorator;

@ccclass
export default class zjgggg_lv436 extends BaseGame {
    private static readonly weaponVideoUnlockKey = "lv436_weapon_video_unlock";

    private bgNodes: cc.Node[] = [];
    private levelNodes: cc.Node[] = [];
    private bottom: cc.Node = null;
    private weaponRoot: cc.Node = null;
    private imgTarget: cc.Node = null;
    private aiXinList: cc.Node = null;
    private zidan3: cc.Node = null;
    private bazhaSk: cc.Node = null;
    private bazhaArmature: dragonBones.ArmatureDisplay = null;
    private bmNode: cc.Node = null;
    private gouNode: cc.Node = null;

    private currentLevelIndex = 0;
    private lastAttackLocalPos = cc.v2(0, 0);
    private reactionAnimPending = 0;
    private currentWeaponIndex = 1;
    private isAttacking = false;
    private isSwitchingLevel = false;
    private isLevelEnd = false;

    private weaponNodes: { [key: number]: cc.Node } = {};
    private itemNodes: { [key: number]: cc.Node } = {};
    private weaponHomePos: { [key: number]: cc.Vec2 } = {};
    private weaponHomeAngle: { [key: number]: number } = {};
    private ropeHomeHeight: { [key: number]: number } = {};
    private ropeIconHomePos: { [key: number]: cc.Vec2 } = {};
    private ropeIconHomeAngle: { [key: number]: number } = {};
    private heartNodes: cc.Node[] = [];

    private sceneTouchHandler: (event: cc.Event.EventTouch) => void = null;
    private itemTouchHandlers: { [key: number]: (event: cc.Event.EventTouch) => void } = {};
    /** wq1/wq4 伸出与收回速度（像素/秒） */
    private readonly ropeWeaponMoveSpeed = 2400;
    private readonly audioBg = "关卡背景436";
    private readonly audioGunAttack = "枪出击436";
    private readonly audioGunHit = "枪击中436";
    private readonly audioRopeAttack = "拳头马桶塞攻击436";
    private readonly audioBananaAttack = "香蕉皮攻击436";
    private readonly audioNormalHit = "拳头马桶塞香蕉皮击中436";
    private readonly audioEnemyHit = "敌人受击436";
    private readonly audioPartnerHitLv1 = "场景1伙伴受击436";
    private readonly audioPartnerHitLv2 = "场景2伙伴受击436";
    private readonly audioLoseHeart = "扣血436";
    private weaponSkeMap: { [key: number]: dragonBones.ArmatureDisplay } = {};
    /** item2/item3 本局是否已通过激励视频解锁（重进关卡在 onLoad 重置） */
    private weaponVideoUnlocked: { [key: number]: boolean } = { 2: false, 3: false };

    onLoad() {
        GameData.PauseGame = false;
        this.isGameOver = false;
        AudioManager.onInit("lv436/audio_lv436");
        this.scheduleOnce(() => {
            if (!this.isLevelEnd) {
                AudioManager.playMusic(this.audioBg, true, 0.8);
            }
        }, 0.3);

        this.bgNodes = [
            this.node.getChildByName("bg1"),
            this.node.getChildByName("bg2"),
        ];
        this.levelNodes = [
            this.node.getChildByName("lv1"),
            this.node.getChildByName("lv2"),
        ];
        this.bottom = this.node.getChildByName("bottom");
        this.weaponRoot = this.bottom ? this.bottom.getChildByName("wq") : null;
        this.imgTarget = this.node.getChildByName("img_target");
        this.aiXinList = this.node.getChildByName("aiXinList");
        this.zidan3 = this.bottom ? this.bottom.getChildByName("zidan3") : null;
        this.bazhaSk = this.node.getChildByName("bazha_sk");
        this.bazhaArmature = this.bazhaSk ? this.bazhaSk.getComponent(dragonBones.ArmatureDisplay) : null;
        this.bmNode = this.node.getChildByName("bm");
        this.gouNode = this.node.getChildByName("gou");
        if (this.bazhaSk) {
            this.bazhaSk.active = false;
        }
        if (this.bmNode) {
            this.bmNode.active = false;
            this.bmNode.opacity = 0;
        }
        if (this.gouNode) {
            this.gouNode.active = false;
            this.gouNode.scale = 0;
        }

        this.initWeapons();
        this.initHearts();
        this.loadWeaponVideoUnlockFromStorage();
        this.bindBottomItems();
        this.bindSceneTouch();
        this.switchLevel(0);
        this.selectWeapon(1);
        GameData.recordLevelEnter("zjgggg_lv436");
    }

    onDestroy(): void {
        AudioManager.stopMusic();
        if (this.sceneTouchHandler) {
            this.node.off(cc.Node.EventType.TOUCH_END, this.sceneTouchHandler, this);
        }
        for (let i = 1; i <= 4; i++) {
            const item = this.itemNodes[i];
            const handler = this.itemTouchHandlers[i];
            if (item && handler) {
                item.off(cc.Node.EventType.TOUCH_END, handler, this);
            }
        }
    }

    private initWeapons() {
        if (!this.weaponRoot) {
            cc.error("[zjgggg_lv436] 未找到武器根节点 wq");
            return;
        }
        for (let i = 1; i <= 4; i++) {
            const weapon = this.weaponRoot.getChildByName("wq" + i);
            const item = this.bottom ? this.bottom.getChildByName("item" + i) : null;
            this.weaponNodes[i] = weapon;
            this.itemNodes[i] = item;
            if (!weapon) {
                continue;
            }
            this.weaponHomePos[i] = cc.v2(weapon.x, weapon.y);
            this.weaponHomeAngle[i] = weapon.angle;
            const rope = weapon.getChildByName("shen");
            const icon = weapon.getChildByName("icon");
            if (rope) {
                this.ropeHomeHeight[i] = rope.height;
            }
            if (icon) {
                this.ropeIconHomePos[i] = cc.v2(icon.x, icon.y);
                this.ropeIconHomeAngle[i] = icon.angle;
            }
            if (i === 2 || i === 3) {
                const ske = weapon.getChildByName("ske");
                const arm = ske ? ske.getComponent(dragonBones.ArmatureDisplay) : null;
                if (arm) {
                    this.weaponSkeMap[i] = arm;
                }
            }
            weapon.active = false;
        }
        if (this.zidan3) {
            this.zidan3.active = false;
        }
    }

    private initHearts() {
        this.heartNodes = [];
        if (!this.aiXinList) {
            return;
        }
        for (let i = 0; i < this.aiXinList.childrenCount; i++) {
            const child = this.aiXinList.children[i];
            if (child && child.name.indexOf("aixin") === 0) {
                child.active = true;
                this.heartNodes.push(child);
            }
        }
    }

    private bindBottomItems() {
        for (let i = 1; i <= 4; i++) {
            const item = this.itemNodes[i];
            if (!item) {
                continue;
            }
            const handler = (event: cc.Event.EventTouch) => {
                event.stopPropagation();
                if (GameData.PauseGame || this.isAttacking || this.isReactionBlocking() || this.isSwitchingLevel || this.isLevelEnd) {
                    return;
                }
                AudioManager.playEffect(AudioManager.common.BUTTON);
                this.trySelectWeapon(i);
            };
            this.itemTouchHandlers[i] = handler;
            item.on(cc.Node.EventType.TOUCH_END, handler, this);
        }
    }

    private loadWeaponVideoUnlockFromStorage() {
        this.weaponVideoUnlocked[2] = false;
        this.weaponVideoUnlocked[3] = false;
        const raw = cc.sys.localStorage.getItem(zjgggg_lv436.weaponVideoUnlockKey);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                if (data["2"]) {
                    this.weaponVideoUnlocked[2] = true;
                }
                if (data["3"]) {
                    this.weaponVideoUnlocked[3] = true;
                }
            } catch (e) {
                cc.warn("[zjgggg_lv436] 武器视频解锁存储解析失败");
            }
        }
        this.refreshWeaponVideoIcons();
    }

    private saveWeaponVideoUnlockToStorage() {
        cc.sys.localStorage.setItem(
            zjgggg_lv436.weaponVideoUnlockKey,
            JSON.stringify({ "2": !!this.weaponVideoUnlocked[2], "3": !!this.weaponVideoUnlocked[3] })
        );
    }

    private clearWeaponVideoUnlockStorage() {
        cc.sys.localStorage.removeItem(zjgggg_lv436.weaponVideoUnlockKey);
        this.weaponVideoUnlocked[2] = false;
        this.weaponVideoUnlocked[3] = false;
    }

    private refreshWeaponVideoIcons() {
        for (let i = 2; i <= 3; i++) {
            const item = this.itemNodes[i];
            if (!item) {
                continue;
            }
            const video = item.getChildByName("video");
            if (video) {
                video.active = !this.weaponVideoUnlocked[i];
            }
        }
    }

    private needsWeaponVideoUnlock(index: number): boolean {
        return (index === 2 || index === 3) && !this.weaponVideoUnlocked[index];
    }

    private trySelectWeapon(index: number) {
        if (!this.needsWeaponVideoUnlock(index)) {
            this.selectWeapon(index);
            return;
        }
        VideoManager.getInstance().showVideo(() => {
            if (this.isLevelEnd || !cc.isValid(this.node)) {
                return;
            }
            this.weaponVideoUnlocked[index] = true;
            this.saveWeaponVideoUnlockToStorage();
            this.refreshWeaponVideoIcons();
            this.selectWeapon(index);
        });
    }

    fanhui() {
        this.clearWeaponVideoUnlockStorage();
        super.fanhui();
    }

    private bindSceneTouch() {
        this.sceneTouchHandler = (event: cc.Event.EventTouch) => {
            if (GameData.PauseGame || this.isAttacking || this.isReactionBlocking() || this.isSwitchingLevel || this.isLevelEnd) {
                return;
            }
            if (this.isUiNode(event.target as cc.Node)) {
                return;
            }
            const clickWorld = event.getLocation();
            const clickLocal = this.node.convertToNodeSpaceAR(clickWorld);
            this.launchAttack(cc.v2(clickWorld.x, clickWorld.y), cc.v2(clickLocal.x, clickLocal.y));
        };
        this.node.on(cc.Node.EventType.TOUCH_END, this.sceneTouchHandler, this);
    }

    private isUiNode(node: cc.Node): boolean {
        let cur = node;
        while (cur && cur !== this.node) {
            if (
                cur.name === "bottom" ||
                cur.name === "aiXinList" ||
                cur.name === "fanhui" ||
                cur.name === "tiaoguo" ||
                cur.name === "btn_tips" ||
                cur.name === "x"
            ) {
                return true;
            }
            cur = cur.parent;
        }
        return false;
    }

    private selectWeapon(index: number) {
        this.currentWeaponIndex = index;
        for (let i = 1; i <= 4; i++) {
            const item = this.itemNodes[i];
            const weapon = this.weaponNodes[i];
            if (item) {
                const sele = item.getChildByName("sele");
                if (sele) {
                    sele.active = i === index;
                }
            }
            if (weapon) {
                weapon.active = i === index;
                this.resetWeaponVisual(i);
            }
        }
        if (this.zidan3) {
            this.zidan3.active = false;
        }
    }

    private resetWeaponVisual(index: number) {
        const weapon = this.weaponNodes[index];
        if (!weapon) {
            return;
        }
        const homePos = this.weaponHomePos[index];
        if (homePos) {
            weapon.setPosition(homePos);
        }
        weapon.angle = this.weaponHomeAngle[index] || 0;
        weapon.stopAllActions();
        const rope = weapon.getChildByName("shen");
        if (rope && this.ropeHomeHeight[index] != null) {
            rope.height = this.ropeHomeHeight[index];
        }
        const icon = weapon.getChildByName("icon");
        const iconHome = this.ropeIconHomePos[index];
        if (icon && iconHome) {
            icon.setPosition(iconHome);
            icon.angle = this.getRopeIconAngle(index);
        }
        if (index === 2 || index === 3) {
            this.playWeaponSkeIdle(index);
        }
    }

    private playWeaponSkeIdle(index: number) {
        const arm = this.weaponSkeMap[index];
        if (!arm) {
            return;
        }
        arm.playAnimation("待机", -1);
    }

    private playWeaponSkeAttack(index: number) {
        const arm = this.weaponSkeMap[index];
        if (!arm) {
            return;
        }
        arm.playAnimation("攻击", -1);
    }

    private getRopeIconAngle(index: number): number {
        return this.ropeIconHomeAngle[index] || 0;
    }

    private switchLevel(index: number) {
        this.reactionAnimPending = 0;
        this.currentLevelIndex = index;
        for (let i = 0; i < this.levelNodes.length; i++) {
            if (this.levelNodes[i]) {
                this.levelNodes[i].active = i === index;
            }
            if (this.bgNodes[i]) {
                this.bgNodes[i].active = i === index;
            }
        }
        this.imgTarget && (this.imgTarget.active = false);
        this.resetAllCurrentTargets();
        this.selectWeapon(this.currentWeaponIndex);
    }

    private resetAllCurrentTargets() {
        const levelNode = this.getCurrentLevelNode();
        if (!levelNode) {
            return;
        }
        for (let i = 0; i < levelNode.childrenCount; i++) {
            const child = levelNode.children[i];
            if (child.name.indexOf("jiaohu_") === 0) {
                const state1 = child.getChildByName("state1");
                const state2 = child.getChildByName("state2");
                if (state1) {
                    state1.active = true;
                }
                if (state2) {
                    state2.active = false;
                }
            } else if (child.name.indexOf("enemy_") === 0 || child.name.indexOf("huoban_") === 0) {
                this.playLoopAnim(child, "待机");
            }
        }
    }

    private getCurrentLevelNode(): cc.Node {
        return this.levelNodes[this.currentLevelIndex] || null;
    }

    /** 关卡2：动画在子节点 ske，仅 待机/击中，不参与害怕、开心 */
    private isShoubiEnemy(node: cc.Node): boolean {
        return !!node && node.name === "enemy_shoubi";
    }

    private launchAttack(worldPos: cc.Vec2, localPos: cc.Vec2) {
        const weapon = this.weaponNodes[this.currentWeaponIndex];
        if (!weapon) {
            return;
        }
        this.isAttacking = true;
        this.lastAttackLocalPos = localPos;
        this.showTarget(localPos);
        this.playWeaponAttackSound();
        if (this.currentWeaponIndex === 2 || this.currentWeaponIndex === 3) {
            this.playWeaponSkeAttack(this.currentWeaponIndex);
        }
        if (this.currentWeaponIndex === 1 || this.currentWeaponIndex === 4) {
            this.playRopeWeaponAttack(this.currentWeaponIndex, worldPos);
            return;
        }
        if (this.currentWeaponIndex === 2) {
            this.playThrowWeaponAttack(worldPos);
            return;
        }
        this.playGunWeaponAttack(worldPos);
    }

    private showTarget(localPos: cc.Vec2) {
        if (!this.imgTarget) {
            return;
        }
        this.imgTarget.active = true;
        this.imgTarget.setPosition(localPos);
    }

    private hideTarget() {
        if (this.imgTarget) {
            this.imgTarget.active = false;
        }
    }

    private playWeaponAttackSound() {
        if (this.currentWeaponIndex === 3) {
            AudioManager.playEffect(this.audioGunAttack);
            return;
        }
        if (this.currentWeaponIndex === 2) {
            AudioManager.playEffect(this.audioBananaAttack);
            return;
        }
        AudioManager.playEffect(this.audioRopeAttack);
    }

    private playWeaponHitSound() {
        if (this.currentWeaponIndex === 3) {
            AudioManager.playEffect(this.audioGunHit);
            return;
        }
        AudioManager.playEffect(this.audioNormalHit);
    }

    private playRopeWeaponAttack(index: number, worldPos: cc.Vec2) {
        const weapon = this.weaponNodes[index];
        const rope = weapon ? weapon.getChildByName("shen") : null;
        const icon = weapon ? weapon.getChildByName("icon") : null;
        if (!weapon || !icon) {
            this.finishAttack(null);
            this.isAttacking = false;
            return;
        }

        const startWorld = weapon.parent.convertToWorldSpaceAR(this.weaponHomePos[index] || cc.v2(weapon.x, weapon.y));
        const dir = worldPos.sub(cc.v2(startWorld.x, startWorld.y));
        const distance = dir.mag();
        weapon.angle = this.getAimAngle(startWorld, worldPos);
        const moveDur = Math.max(distance / this.ropeWeaponMoveSpeed, 0.05);
        const ropeHomeHeight = this.ropeHomeHeight[index] || (rope ? rope.height : 0);
        const targetRopeHeight = Math.max(distance, ropeHomeHeight);
        if (rope) {
            rope.stopAllActions();
            rope.height = ropeHomeHeight;
            cc.tween(rope)
                .to(moveDur, { height: targetRopeHeight })
                .to(moveDur, { height: ropeHomeHeight })
                .start();
        }
        const iconHome = this.ropeIconHomePos[index] || cc.v2(icon.x, icon.y);
        icon.setPosition(iconHome);
        icon.angle = this.getRopeIconAngle(index);

        cc.tween(icon)
            .to(moveDur, { y: iconHome.y + distance })
            .call(() => {
                this.finishAttack(this.findHitTarget());
            })
            .to(moveDur, { x: iconHome.x, y: iconHome.y })
            .call(() => {
                this.resetWeaponVisual(index);
                this.isAttacking = false;
            })
            .start();
    }

    private playThrowWeaponAttack(worldPos: cc.Vec2) {
        const weapon = this.weaponNodes[2];
        if (!weapon) {
            this.finishAttack(null);
            this.isAttacking = false;
            return;
        }
        const homePos = this.weaponHomePos[2] || cc.v2(weapon.x, weapon.y);
        const targetPos = weapon.parent.convertToNodeSpaceAR(worldPos);
        weapon.angle = this.getAimAngle(weapon.parent.convertToWorldSpaceAR(homePos), worldPos);
        cc.tween(weapon)
            .to(0.22, { x: targetPos.x, y: targetPos.y })
            .call(() => {
                this.finishAttack(this.findHitTarget());
            })
            .to(0.22, { x: homePos.x, y: homePos.y, angle: this.weaponHomeAngle[2] || 0 })
            .call(() => {
                this.resetWeaponVisual(2);
                this.isAttacking = false;
            })
            .start();
    }

    private playGunWeaponAttack(worldPos: cc.Vec2) {
        const weapon = this.weaponNodes[3];
        if (!weapon || !this.zidan3) {
            this.finishAttack(null);
            this.isAttacking = false;
            return;
        }
        const pivotWorld = weapon.convertToWorldSpaceAR(cc.v2(0, 0));
        weapon.angle = this.getAimAngle(pivotWorld, worldPos);

        this.scheduleOnce(() => {
            if (this.isLevelEnd || !cc.isValid(this.node) || !weapon || !cc.isValid(weapon) || !this.zidan3) {
                this.isAttacking = false;
                return;
            }
            const qiangkou = weapon.getChildByName("qiangkou");
            const muzzleWorld = qiangkou
                ? qiangkou.convertToWorldSpaceAR(cc.v2(0, 0))
                : weapon.convertToWorldSpaceAR(cc.v2(0, 0));

            const bulletParent = this.zidan3.parent;
            const bulletStart = bulletParent.convertToNodeSpaceAR(muzzleWorld);
            const bulletTarget = bulletParent.convertToNodeSpaceAR(worldPos);
            this.zidan3.stopAllActions();
            this.zidan3.active = true;
            this.zidan3.setPosition(bulletStart);
            this.zidan3.angle = this.getAimAngle(muzzleWorld, worldPos);

            cc.tween(this.zidan3)
                .to(0.18, { x: bulletTarget.x, y: bulletTarget.y })
                .call(() => {
                    this.finishAttack(this.findHitTarget());
                })
                .call(() => {
                    this.zidan3.active = false;
                    this.zidan3.setPosition(bulletStart);
                    this.zidan3.angle = 0;
                    this.resetWeaponVisual(3);
                    this.isAttacking = false;
                })
                .start();
        }, 0);
    }

    private getAimAngle(fromWorld: cc.Vec2, toWorld: cc.Vec2): number {
        const dir = toWorld.sub(cc.v2(fromWorld.x, fromWorld.y));
        return Math.atan2(dir.y, dir.x) * 180 / Math.PI - 90;
    }

    /** 仅用节点自身 contentSize，不含子节点范围 */
    private getNodeSelfBoundingBoxToWorld(node: cc.Node): cc.Rect {
        const size = node.getContentSize();
        const ap = node.getAnchorPoint();
        const x = -size.width * ap.x;
        const y = -size.height * ap.y;
        const w = size.width;
        const h = size.height;
        const p1 = node.convertToWorldSpaceAR(cc.v2(x, y));
        const p2 = node.convertToWorldSpaceAR(cc.v2(x + w, y));
        const p3 = node.convertToWorldSpaceAR(cc.v2(x + w, y + h));
        const p4 = node.convertToWorldSpaceAR(cc.v2(x, y + h));
        const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
        const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
        const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
        const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);
        return cc.rect(minX, minY, maxX - minX, maxY - minY);
    }

    private findHitTarget(): cc.Node {
        const levelNode = this.getCurrentLevelNode();
        if (!levelNode || !this.imgTarget || !this.imgTarget.active) {
            return null;
        }
        const targetRect = this.getNodeSelfBoundingBoxToWorld(this.imgTarget);
        let result: cc.Node = null;
        for (let i = 0; i < levelNode.childrenCount; i++) {
            const child = levelNode.children[i];
            if (!child.active || !this.isValidBattleTarget(child)) {
                continue;
            }
            if (!cc.Intersection.rectRect(targetRect, this.getNodeSelfBoundingBoxToWorld(child))) {
                continue;
            }
            if (!result || child.getSiblingIndex() > result.getSiblingIndex()) {
                result = child;
            }
        }
        return result;
    }

    private isValidBattleTarget(node: cc.Node): boolean {
        return (
            node.name.indexOf("enemy_") === 0 ||
            node.name.indexOf("huoban_") === 0 ||
            node.name.indexOf("jiaohu_") === 0
        );
    }

    private isReactionBlocking(): boolean {
        return this.reactionAnimPending > 0;
    }

    private playExplosionAtLocal(localPos: cc.Vec2) {
        if (!this.bazhaSk) {
            return;
        }
        this.bazhaSk.stopAllActions();
        this.bazhaSk.setPosition(localPos);
        this.bazhaSk.active = true;
        if (this.bazhaArmature) {
            this.bazhaArmature.playAnimation("newAnimation", 1);
            this.addOneTimeListener(this.bazhaArmature, () => {
                if (this.bazhaSk && cc.isValid(this.bazhaSk)) {
                    this.bazhaSk.active = false;
                }
            });
            return;
        }
        this.scheduleOnce(() => {
            if (this.bazhaSk && cc.isValid(this.bazhaSk)) {
                this.bazhaSk.active = false;
            }
        }, 0.6);
    }

    private finishAttack(target: cc.Node | null) {
        this.hideTarget();
        this.playWeaponHitSound();
        if (!target) {
            this.playExplosionAtLocal(this.lastAttackLocalPos);
            this.playAllEnemiesTemp("开心");
            this.loseOneHeart();
            return;
        }
        if (target.name.indexOf("enemy_") === 0) {
            this.handleEnemyHit(target);
            return;
        }
        if (target.name.indexOf("huoban_") === 0) {
            this.handlePartnerHit(target);
            return;
        }
        this.playExplosionAtLocal(this.lastAttackLocalPos);
        this.handleInteractiveHit(target);
    }

    private handleEnemyHit(target: cc.Node) {
        AudioManager.playEffect(this.audioEnemyHit);
        const enemies = this.getActiveTargetsByPrefix("enemy_");
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (enemy === target) {
                this.playOnceAnimLocked(enemy, "击中", null, () => {
                    enemy.active = false;
                    this.checkLevelClear();
                });
            } else if (!this.isShoubiEnemy(enemy)) {
                this.playOnceAnimLocked(enemy, "害怕", "待机");
            }
        }
        this.playAllPartnersTemp("开心");
    }

    private playPartnerHitSound() {
        if (this.currentLevelIndex === 0) {
            AudioManager.playEffect(this.audioPartnerHitLv1);
            return;
        }
        AudioManager.playEffect(this.audioPartnerHitLv2);
    }

    private handlePartnerHit(target: cc.Node) {
        this.playPartnerHitSound();
        this.playOnceAnimLocked(target, "击中", "待机");
        this.playAllEnemiesTemp("开心");
        this.loseOneHeart();
    }

    private handleInteractiveHit(target: cc.Node) {
        const state1 = target.getChildByName("state1");
        const state2 = target.getChildByName("state2");
        if (state1) {
            state1.active = false;
        }
        if (state2) {
            state2.active = true;
        }
        this.playAllEnemiesTemp("开心");
        this.loseOneHeart();
    }

    private checkLevelClear() {
        if (this.isLevelEnd) {
            return;
        }
        const enemies = this.getActiveTargetsByPrefix("enemy_");
        if (enemies.length > 0) {
            return;
        }
        this.playClearTransition(this.currentLevelIndex + 1);
    }

    private playClearTransition(nextIndex: number) {
        if (this.isSwitchingLevel || this.isLevelEnd) {
            return;
        }
        this.isSwitchingLevel = true;
        this.playGouAnim(() => {
            const hasNextLevel = nextIndex < this.levelNodes.length && this.levelNodes[nextIndex];
            if (!hasNextLevel) {
                this.isSwitchingLevel = false;
                this.onwin();
                return;
            }
            this.playBlackMaskTransition(
                () => {
                    if (this.isLevelEnd || !cc.isValid(this.node)) {
                        return;
                    }
                    if (hasNextLevel) {
                        this.switchLevel(nextIndex);
                    }
                },
                () => {
                    if (this.isLevelEnd || !cc.isValid(this.node)) {
                        return;
                    }
                    if (hasNextLevel) {
                        this.isSwitchingLevel = false;
                        return;
                    }
                    this.isSwitchingLevel = false;
                    this.onwin();
                }
            );
        });
    }

    private playGouAnim(done: () => void) {
        if (!this.gouNode) {
            done && done();
            return;
        }
        this.gouNode.stopAllActions();
        this.gouNode.active = true;
        this.gouNode.opacity = 255;
        this.gouNode.scale = 0;
        this.gouNode.setSiblingIndex(this.node.childrenCount - 1);
        // this.scheduleOnce(() => {
        AudioManager.playEffect("finishjq")
        // }, 0.9)
        cc.tween(this.gouNode)
            .to(0.28, { scale: 1.2 })
            .to(0.12, { scale: 1 })
            .delay(0.45)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.gouNode.active = false;
                this.gouNode.opacity = 255;
                this.gouNode.scale = 0;
                done && done();
            })
            .start();
    }

    private playBlackMaskTransition(onCovered: () => void, done?: () => void) {
        if (!this.bmNode) {
            onCovered && onCovered();
            done && done();
            return;
        }
        this.bmNode.stopAllActions();
        this.bmNode.active = true;
        this.bmNode.opacity = 0;
        this.bmNode.setSiblingIndex(this.node.childrenCount - 1);
        cc.tween(this.bmNode)
            .to(0.4, { opacity: 255 })
            .call(() => {
                onCovered && onCovered();
            })
            .to(0.4, { opacity: 0 })
            .call(() => {
                this.bmNode.active = false;
                done && done();
            })
            .start();
    }

    private getActiveTargetsByPrefix(prefix: string): cc.Node[] {
        const levelNode = this.getCurrentLevelNode();
        const list: cc.Node[] = [];
        if (!levelNode) {
            return list;
        }
        for (let i = 0; i < levelNode.childrenCount; i++) {
            const child = levelNode.children[i];
            if (child.active && child.name.indexOf(prefix) === 0) {
                list.push(child);
            }
        }
        return list;
    }

    private playAllEnemiesTemp(animName: string) {
        const enemies = this.getActiveTargetsByPrefix("enemy_");
        for (let i = 0; i < enemies.length; i++) {
            if (this.isShoubiEnemy(enemies[i])) {
                continue;
            }
            this.playOnceAnimLocked(enemies[i], animName, "待机");
        }
    }

    private playAllPartnersTemp(animName: string) {
        const partners = this.getActiveTargetsByPrefix("huoban_");
        for (let i = 0; i < partners.length; i++) {
            this.playOnceAnimLocked(partners[i], animName, "待机");
        }
    }

    private playOnceAnimLocked(target: cc.Node, animName: string, revertAnim?: string | null, done?: () => void) {
        this.reactionAnimPending++;
        this.playOnceAnim(target, animName, revertAnim, () => {
            this.reactionAnimPending = Math.max(0, this.reactionAnimPending - 1);
            done && done();
        });
    }

    private playLoopAnim(target: cc.Node, animName: string) {
        const armature = this.getArmature(target);
        if (!armature) {
            return;
        }
        armature.playAnimation(animName, -1);
    }

    private playOnceAnim(target: cc.Node, animName: string, revertAnim?: string | null, done?: () => void) {
        const armature = this.getArmature(target);
        if (!armature) {
            done && done();
            return;
        }
        const token = ((target as any).__lv436AnimToken || 0) + 1;
        (target as any).__lv436AnimToken = token;
        armature.playAnimation(animName, 1);
        this.addOneTimeListener(armature, () => {
            if (!cc.isValid(target) || (target as any).__lv436AnimToken !== token) {
                return;
            }
            if (revertAnim) {
                armature.playAnimation(revertAnim, -1);
            }
            done && done();
        });
    }

    private getArmature(target: cc.Node): dragonBones.ArmatureDisplay {
        if (!target) {
            return null;
        }
        const ske = target.getChildByName("ske");
        if (ske) {
            const skeArm = ske.getComponent(dragonBones.ArmatureDisplay);
            if (skeArm) {
                return skeArm;
            }
        }
        let armature = target.getComponent(dragonBones.ArmatureDisplay);
        if (armature) {
            return armature;
        }
        for (let i = 0; i < target.childrenCount; i++) {
            armature = target.children[i].getComponent(dragonBones.ArmatureDisplay);
            if (armature) {
                return armature;
            }
        }
        return null;
    }

    private loseOneHeart() {
        for (let i = this.heartNodes.length - 1; i >= 0; i--) {
            const heart = this.heartNodes[i];
            if (heart && heart.active) {
                heart.active = false;
                AudioManager.playEffect(this.audioLoseHeart);
                break;
            }
        }
        if (this.getRemainHeartCount() <= 0) {
            this.onlost();
        }
    }

    private getRemainHeartCount(): number {
        let count = 0;
        for (let i = 0; i < this.heartNodes.length; i++) {
            if (this.heartNodes[i] && this.heartNodes[i].active) {
                count++;
            }
        }
        return count;
    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "tiaoguo":
                if (GameData.PauseGame) {
                    common.ShowTipsView("请在当前关卡前跳过");
                    return;
                }
                VideoManager.getInstance().showVideo(() => {
                    GameData.PauseGame = true;
                    this.onwin();
                });
                break;
            case "fanhui":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => { });
                break;
            case "x":
                break;
        }
    }

    isshowVideo = false;

    onwin() {
        if (this.isLevelEnd) {
            return;
        }
        this.isLevelEnd = true;
        this.isAttacking = false;
        this.isSwitchingLevel = false;
        GameData.PauseGame = true;
        AudioManager.stopMusic();
        this.node.cleanup();
        if (!(GameData as any).isNew) {
            this.node.destroy();
        }
        this.endwin("prefabs/zc/zc_winend");
    }

    onlost() {
        if (this.isLevelEnd) {
            return;
        }
        this.isLevelEnd = true;
        this.isAttacking = false;
        this.isSwitchingLevel = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            if (!(GameData as any).isNew) {
                this.node.destroy();
            }
            this.endlost("prefabs/zc/zc_lostend");
        }, 1);
    }
}