

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import levelConfig from "../script/common/levelConfig";
import smallLoading from "../script/common/smallLoading";





const { ccclass, property } = cc._decorator;

@ccclass
export default class ajs_lv100 extends BaseGame {
    @property({ type: cc.Node, tooltip: "挂人物结点" })
    roleNode: cc.Node = null;

    @property({ tooltip: "待机动画名" })
    idleAnimName: string = "待机";

    @property({ tooltip: "散步/行走动画名" })
    walkAnimName: string = "走路";

    @property({ tooltip: "在初始点待机时长（秒）" })
    idleWaitSeconds: number = 3;

    @property({ tooltip: "向右移动距离（像素）" })
    walkDistanceX: number = 250;

    @property({ tooltip: "单程移动耗时（秒）" })
    walkDurationSeconds: number = 3;

    @property({ tooltip: "到达目标位置后停留时长（秒）" })
    stayDurationSeconds: number = 5;

    private _startPos: cc.Vec3 = null;
    private _walkLoopRunning: boolean = false;
    private _baseScaleX: number = 1;

    onLoad() {
        GameData.PauseGame = false;

        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv100", false, 0.5);
        }, 0.5)
        this.startWalkLoop();
    }

    onDestroy() {
        this._walkLoopRunning = false;
        if (this.roleNode) {
            cc.Tween.stopAllByTarget(this.roleNode);
        }
    }

    private startWalkLoop() {
        if (this._walkLoopRunning) return;
        if (!this.roleNode) {
            cc.warn("[ajs_lv100] 未设置 roleNode，无法执行散步循环");
            return;
        }

        this._walkLoopRunning = true;
        this._startPos = this.roleNode.position.clone();
        this._baseScaleX = Math.abs(this.roleNode.scaleX || 1);
        this.setFaceLeft();
        this.runOneWalkCycle();
    }

    private runOneWalkCycle() {
        if (!this._walkLoopRunning || !this.roleNode) return;

        const startPos = cc.v3(this._startPos.x, this._startPos.y, this._startPos.z);
        const rightPos = cc.v3(this._startPos.x + this.walkDistanceX, this._startPos.y, this._startPos.z);

        cc.Tween.stopAllByTarget(this.roleNode);

        this.playRoleAnim(this.idleAnimName, true);
        this.setFaceLeft();
        cc.tween(this.roleNode)
            .delay(Math.max(0, this.idleWaitSeconds))
            .call(() => {
                // 开始往右走
                this.setFaceLeft();
                this.playRoleAnim(this.walkAnimName, true);
            })
            .to(Math.max(0.01, this.walkDurationSeconds), { position: rightPos })
            .call(() => {
                // 到达右边，停留5秒，播放待机动画
                this.playRoleAnim(this.idleAnimName, true);
            })
            .delay(Math.max(0, this.stayDurationSeconds))
            .call(() => {
                // 开始往左走回去
                this.setFaceRight();
                this.playRoleAnim(this.walkAnimName, true);
            })
            .to(Math.max(0.01, this.walkDurationSeconds), { position: startPos })
            .call(() => {
                // 回到起点后继续下一轮循环
                this.runOneWalkCycle();
            })
            .start();
    }

    private setFaceLeft() {
        if (!this.roleNode) return;
        this.roleNode.scaleX = -this._baseScaleX;
    }

    private setFaceRight() {
        if (!this.roleNode) return;
        this.roleNode.scaleX = this._baseScaleX;
    }

    private playRoleAnim(animName: string, loop: boolean) {
        if (!this.roleNode || !animName) return;

        const armatureDisplay = this.roleNode.getComponent(dragonBones.ArmatureDisplay);
        if (armatureDisplay) {
            // playTimes: 0 表示循环播放，1 表示播放一次
            armatureDisplay.playAnimation(animName, loop ? 0 : 1);
            return;
        }
    }

    private jumpToLevel(levelKey: string) {
        if (!levelKey) return;

        const targetConfig = levelConfig.new.find(item => item.level === levelKey);
        if (!targetConfig) {
            cc.warn(`[ajs_lv100] 未找到关卡配置: ${levelKey}`);
            return;
        }

        if (GameData.isloadLv) {
            cc.warn("[ajs_lv100] 正在加载其他关卡，请稍候");
            return;
        }

        const [style, prefab] = levelKey.split("/");
        if (!style || !prefab) {
            cc.warn(`[ajs_lv100] 关卡 levelKey 格式错误: ${levelKey}`);
            return;
        }

        GameData.isloadLv = true;
        GameData.recordLevelExit("next");
        GameData.onDele();
        GameData.curGameStyle = style;
        GameData.curGameName = prefab;

        cc.resources.load("prefabs/common/smallLoading", cc.Prefab, (err, pre: cc.Prefab) => {
            GameData.isloadLv = false;
            if (err) {
                cc.error("[ajs_lv100] 加载 smallLoading 失败", err);
                return;
            }

            const loadingNode = cc.instantiate(pre);
            loadingNode.parent = cc.find("Canvas");
            const loadingComp = loadingNode.getComponent(smallLoading);
            if (loadingComp) {
                loadingComp.PreName = levelKey;
                loadingComp.lvConfig = targetConfig;
                loadingComp.onInit();
            }

            VideoManager.getInstance().report("enterLv", { name: targetConfig.name + "_ajs_lv100" });

            if (this.node && this.node.isValid) {
                this.node.destroy();
            }
        });
    }

    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "fanhui":
                this.openpausePanel();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     GameData.getMap = [];
                //     this.node.destroy();
                //     // VideoManager.getInstance().showBaoXiang();
                // })
                break;
            case `btn_shop`:
                this.jumpToLevel("lv289/ajs_lv289");
                break;
            case `btn_home`:
                this.jumpToLevel("lv232/ajs_lv232");
                break;

        }


    }

}

