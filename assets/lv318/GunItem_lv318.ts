import AudioManager from "../script/common/AudioManager";
import Bullet_lv318 from "./Bullet_lv318";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GunItem_lv318 extends cc.Component {
    // ========== 枪械属性 ==========
    @property({ type: cc.Prefab, tooltip: "子弹预制体 - 拖入你创建的子弹预制体" })
    bulletPrefab: cc.Prefab = null;
    
    @property({ tooltip: "射击冷却时间(秒) - 两次射击之间的间隔,越小射速越快\n推荐值: 手枪0.5, 步枪0.2, 霰弹枪1.0" })
    shootCooldown: number = 0.5;
    
    @property({ tooltip: "射程(像素) - 角色能检测到目标并射击的最大距离\n推荐值: 手枪250, 步枪400, 霰弹枪150" })
    shootRange: number = 300;
    
    @property({ tooltip: "子弹速度(像素/秒) - 子弹移动的速度,越大子弹越快\n推荐值: 手枪600, 步枪1000, 霰弹枪500" })
    bulletSpeed: number = 800;
    
    @property({ tooltip: "瞄准扭矩 - 控制手臂瞄准目标时的旋转力度,越大瞄准越快\n推荐值: 300-800, 默认500\n 目前作废" })
    aimTorque: number = 500;

    @property({ tooltip: "持枪偏移位置(X,Y) - 枪挂在手臂上的位置偏移\nX: 左右偏移(正数向右), Y: 上下偏移(正数向上)\n默认(0,0)表示挂在手臂末端,可根据枪模型调整" })
    holdOffset: cc.Vec2 = cc.v2(0, 0);
    
    @property({ tooltip: "持枪角度(度) - 枪挂在手臂上的旋转角度\n0度=水平向右, 90度=向上, -90度=向下\n默认0,可根据枪模型调整" })
    holdAngle: number = 0;

    @property({ type: cc.Node, tooltip: "枪口节点(可选) - 如果枪有专门的枪口子节点,拖入这里\n子弹会从这个位置发射,不填则从枪的中心发射" })
    muzzleNode: cc.Node = null;

    @property({ type: cc.AudioClip, tooltip: "开枪音效(可选) - 每把枪可单独配置" })
    shootSfx: cc.AudioClip = null;

    private _shootTimer: number = 0;
    private _ownerNode: cc.Node = null;

    update(dt: number) {
        if (this._shootTimer > 0) this._shootTimer -= dt;
    }

    public setOwner(ownerNode: cc.Node) {
        this._ownerNode = ownerNode;
    }

    public canShoot(): boolean {
        return this._shootTimer <= 0;
    }

    public getMuzzleWorldPos(): cc.Vec2 {
        return this.muzzleNode
            ? this.muzzleNode.convertToWorldSpaceAR(cc.v2(0, 0))
            : this.node.convertToWorldSpaceAR(cc.v2(0, 0));
    }

    public shoot(direction: cc.Vec2): cc.Node {
        this.showHitEffect();
        if (!this.canShoot() || !this.bulletPrefab) return null;
        this._shootTimer = this.shootCooldown;

        if (this.shootSfx) AudioManager.playEffect(this.shootSfx.name, false);

        const bullet = cc.instantiate(this.bulletPrefab);
        const muzzleWorldPos = this.getMuzzleWorldPos();

        const ownerRoot = this._ownerNode || this.node.parent?.parent || null;
        const parent = ownerRoot?.parent || cc.director.getScene();
        bullet.parent = parent;

        const localPos = parent.convertToNodeSpaceAR(muzzleWorldPos);
        bullet.position = cc.v3(localPos.x, localPos.y, 0);
        const bulletComp = bullet.getComponent(Bullet_lv318);
        if (bulletComp) {
            bulletComp.init(direction, this.bulletSpeed);
            // 根据子弹朝向计算偏移：让子弹末端刚好在枪口
            const bulletAngle = Math.atan2(direction.y, direction.x);
            const bulletLength = (bullet.width * bullet.scaleX) / 2;
            const offsetX = Math.cos(bulletAngle) * bulletLength;
            const offsetY = Math.sin(bulletAngle) * bulletLength;
            bullet.x += offsetX;
            bullet.y += offsetY;
        }

        return bullet;
    }
    public showHitEffect() {
        const hitEffect = this.muzzleNode.getChildByName(`hg`);
        if (hitEffect) {
            hitEffect.active = true;
            const originalWidth = hitEffect.width;
            hitEffect.width=0;
            cc.tween(hitEffect)
                .to(0.1, { width: originalWidth })
                .call(() => {
                    hitEffect.active = false;
                })
                .start();
        }
    }
}
