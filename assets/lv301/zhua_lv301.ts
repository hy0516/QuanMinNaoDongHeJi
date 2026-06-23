const { ccclass, property } = cc._decorator;
import gan_lv301 from "./gan_lv301";
import AudioManager from "../script/common/AudioManager";

@ccclass
export default class zhua_lv301 extends cc.Component {
    // 新增：标记是否是to100触发的模式
    private isTo100Mode = false;
    // 普通模式的释放阶段标记
    private releaseType: 'catch' | 'top' | 'resetX' = 'resetX'; 

    // 原有变量全部保留
    @property(cc.Node) clawNode: cc.Node = null; 
    @property(cc.Node) poleNode: cc.Node = null; 
    @property(cc.Node) dian: cc.Node = null;
    private targetObj: cc.Node = null;       
    public isMoving = false;                 
    private isCatch = false;                 
    private retractStep = 0;                 
    private catchLocked = false;             
    private readonly FORCE_X_RELEASE_PROB = 0.9;    
    private isReleaseAtTop = false; 
    private forceOnceReleaseAtX = false; 
    private readonly MIN_CLAW_LOCAL_Y = -550;  
    private readonly SPEED_Y = 200;            
    private readonly SPEED_X = 200;            
    private readonly INIT_ZHUA_LOCAL_X = -200; 
    private readonly POS_TOLERANCE = 3;        
    private readonly TARGET_OFFSET_Y = 20;     
    private readonly DROP_FORCE = 80; 
    private initClawLocalY = 0;
    private initPoleH = 0;
    private zhuask: dragonBones.ArmatureDisplay = null!;
    private flag = false;

    onLoad() {
        this.initClawLocalY = this.clawNode?.y || 0;
        this.initPoleH = this.poleNode?.height || 0;
        this.zhuask = this.clawNode.getComponent(dragonBones.ArmatureDisplay)!;
    }

    // 爪子下落核心方法
    zhua() {
        if (this.isMoving) return; 
        AudioManager.playEffect(`爪子放下`);
        gan_lv301.isClawBusy = true; 
        this.catchLocked = false; 
        this.isMoving = true;
        this.retractStep = 0;
        this.isReleaseAtTop = false;
        
        // 只有【非to100模式】才分配45/45/10的释放阶段
        if (!this.isTo100Mode) {
            const r = Math.random();
            this.releaseType = r < 0.35 ? 'catch' : (r < 0.7 ? 'top' : 'resetX');
        }

        this.schedule(this.updateLogic, 0);
    }

    // 修正to100方法：先标记模式，再触发下落
    to100() {
        this.isTo100Mode = true; // 标记为to100模式
        this.forceOnceReleaseAtX = Math.random() < this.FORCE_X_RELEASE_PROB; // 原有to100概率
        this.zhua(); // 触发爪子下落
    }

    private updateLogic() {
        if (!this.isMoving || !this.clawNode || !this.poleNode) return;
        const dt = cc.director.getDeltaTime();
        this.retractStep === 0 ? this.updateDrop(dt) : this.updateRetract(dt);
    }

    private updateDrop(dt: number) {
        const clawLocalY = this.clawNode.y;
        const offsetY = this.SPEED_Y * dt;

        if (this.isCatch || clawLocalY - offsetY <= this.MIN_CLAW_LOCAL_Y) {
            this.clawNode.y = Math.max(clawLocalY - offsetY, this.MIN_CLAW_LOCAL_Y);
            this.updatePoleScale();

            // 分支1：to100模式 → 不走抓取阶段释放（按原有逻辑）
            if (this.isTo100Mode) {
                this.retractStep = 1;
                return;
            }
            // 分支2：普通模式 → 按releaseType释放
            if (this.releaseType === 'catch') {
                this.flag = true;
                this.releaseTarget();
                if (!this.isCatch) {
                    this.zhuask.playAnimation("zk", 1);
                    AudioManager.playEffect(`未夹中`);
                }
            }

            this.retractStep = 1;
            return;
        }

        this.clawNode.y -= offsetY;
        this.updatePoleScale();
        this.followTarget();
    }

    private updateRetract(dt: number) {
        // 升Y阶段
        if (this.retractStep === 1) {
            const offsetY = this.SPEED_Y * dt;
            this.clawNode.y += offsetY;
            this.updatePoleScale();

            if (this.clawNode.y >= this.initClawLocalY - this.POS_TOLERANCE) {
                this.clawNode.y = this.initClawLocalY;
                this.updatePoleScale();

                // 分支1：to100模式 → 走原有to100的顶部释放逻辑
                if (this.isTo100Mode) {
                    if (!this.forceOnceReleaseAtX && Math.random() < 0.9) {
                        this.releaseTarget();
                        this.isReleaseAtTop = true;
                    }
                }
                // 分支2：普通模式 → 按releaseType释放
                else if (this.releaseType === 'top') {
                    // AudioManager.playEffect(`未夹中`);
                    this.releaseTarget();
                    this.isReleaseAtTop = true;
                }

                this.retractStep = 2;
                return;
            }
            this.followTarget();
        }

        // 移X阶段
        if (this.retractStep === 2) {
            const offsetX = this.SPEED_X * dt;
            const dirX = this.node.x > this.INIT_ZHUA_LOCAL_X ? -1 : 1;
            this.node.x += dirX * offsetX;

            if (Math.abs(this.node.x - this.INIT_ZHUA_LOCAL_X) <= this.POS_TOLERANCE) {
                this.node.x = this.INIT_ZHUA_LOCAL_X;  

                // 分支1：to100模式 → 走原有to100的归位释放逻辑
                if (this.isTo100Mode) {
                    if (!this.isReleaseAtTop) this.releaseTarget();
                    this.isTo100Mode = false; // 重置to100标记
                }
                // 分支2：普通模式 → 按releaseType释放
                else if (this.releaseType === 'resetX' && !this.isReleaseAtTop) {
                    this.releaseTarget();
                }

                this.zhuask.playAnimation("zk", 1);
                this.forceOnceReleaseAtX = false;
                this.isMoving = false;                 
                gan_lv301.isClawBusy = false;
                this.unschedule(this.updateLogic);     
                return;
            }
            this.followTarget();
        }
    }

    // 以下方法完全保留，无需修改
    private updatePoleScale() {
        if (!this.poleNode || this.initPoleH === 0) return;
        const scaleY = 1 + (this.initClawLocalY - this.clawNode.y) / this.initPoleH;
        this.poleNode.scaleY = scaleY;
    }

    private followTarget() {
        if (!this.isCatch || !this.targetObj) return;
        const clawWorldPos = this.clawNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const targetWorldPos = cc.v2(clawWorldPos.x, clawWorldPos.y - this.TARGET_OFFSET_Y);
        this.targetObj.setPosition(this.targetObj.parent.convertToNodeSpaceAR(targetWorldPos));
    }

    catchTarget(target: cc.Node) {
        if (!target || this.isCatch || this.catchLocked) return;
        this.zhuask.playAnimation("sj", 1);
        this.isCatch = true;
        this.targetObj = target;
        this.catchLocked = true;
        this.followTarget();
    }

    private releaseTarget() {
        if (!this.targetObj) return;
        if (!this.flag) {
            AudioManager.playEffect(`掉落`);
        }
        this.flag = false;
        const rigidBody = this.targetObj.getComponent(cc.RigidBody);
        if (rigidBody) {
            rigidBody.type = cc.RigidBodyType.Dynamic; 
            rigidBody.linearVelocity = cc.v2(0, 0);
            rigidBody.applyForceToCenter(cc.v2(0, -this.DROP_FORCE), true); 
        }
        this.targetObj = null;
        this.isCatch = false;
        this.retractStep = 0;
        this.dian.active = false;
        const stickScript = this.node.getComponent("gan_lv301");
        if (stickScript) {
            stickScript.isClawStop = true;
            stickScript.isTouching = false;
        }
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }
}