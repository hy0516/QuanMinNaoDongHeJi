import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems352 from "./moveItems352";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ntcb_lv352 extends BaseGame {
    @property(cc.Node)
    p_ske: cc.Node = null;
    @property(cc.Node)
    eyes: cc.Node = null;
    @property(cc.Node)
    ad3: cc.Node = null;
    @property(cc.Node)
    ad5: cc.Node = null;
    @property(cc.Node)
    musicqs: cc.Node = null;
    @property(cc.Node)
    dm: cc.Node = null;

    anime: string[] = [`cdf`,`mdf`,`kl`,`hb`,`hjm`,`dwx`,`ll`,`dc`,`lt`,`kc`];
    time: number[] = [3, 3, 1, 1, 3, 1.5, 2, 2, 2, 2];
    music: string[] = [`cdf`,`吃臭豆腐`,`喝汽水`,`吃汉堡`,`吃火鸡面`,`吃螃蟹`,`吃榴莲`,`吃大葱`,`吃辣条`,`吃烤串`];
    speak: string[] = [`看得我都流口水了`,
                        `主播能不能吃个蟹腿`,
                        `这个帝皇蟹看起来很好吃`,
                        `主播能不能吃个霉豆腐`,
                        `全是我爱吃的`,
                        `哈哈~我也在吃辣条`,
                        `咀嚼声太治愈了吧`,
                        `你网卡了`,
                        `你别吃了，让我吃`,
                        `不要吃榴莲`,
                        `来口肥宅快乐水`,
                        `主播，你是干什么工作的呀`,];
    
    private _timer: number = 0;
    private _idx: number = 0;
    private _dmIndex: number = 1;
    private _showingDms: cc.Node[] = []; // 队列顺序：[第一行（下）、第二行（中）、第三行（上）]
    private _rowHeight: number = 80; // 每行间距，固定不变
    private sum: number = 0;

    psk:dragonBones.ArmatureDisplay = null;
    canjiaohu = true;
    type3ad = false;
    type5ad = false;

    private _delaying: boolean = false; // 是否在延时中
    private _delayTotal: number = 0; // 目标延时总时长
    private _delayPassed: number = 0; // 已流逝的延时时间
    /** 看道具开关：true=开启眼睛看向道具，false=关闭 */
    private readonly ENABLE_LOOK_PROP: boolean = false;
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv352`);
        }, 0.5)
        this.psk = this.p_ske.getComponent(dragonBones.ArmatureDisplay);
    }

    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch) {
        const checkNode = this.node.getChildByName(`checkNode`);
        const itemNode = even.currentTarget;
        
        // 碰撞判断逻辑
        if (checkNode && checkNode.active && cc.Intersection.rectRect(checkNode.getBoundingBox(), itemNode.getBoundingBox())) {
            console.log(`碰撞类型${type}，执行对应逻辑`);
            itemNode.getComponent(moveItems352)?.restart();
            if (type === 5 && !this.type5ad) {
                VideoManager.getInstance().showVideo(() => {
                    this.type5ad = true;
                    this.ad5.active = false;
                });
                return;
            } else if (type === 3 && !this.type3ad) {
                VideoManager.getInstance().showVideo(() => {
                    this.type3ad = true;
                    this.ad3.active = false;
                });
                return;
            }
            
            // 其他类型或已看过广告的，直接隐藏并执行逻辑
            itemNode.active = false;
            if (type !==2 ||type ===2 && itemNode.getComponent("moveItems352").isShaked === false) {
                AudioManager.playEffect(`${this.music[type]}`);
                this.animeSingle(this.psk, `lm_${this.anime[type]}`);
                this._delayTotal = this.time[type];
                this.sum++;
            } else {
                AudioManager.playEffect(`汽水彩蛋`);
                this.animeSingle(this.psk, `lm_kl2`);
                this._delayTotal = 2;
                this.sum++;
            }
            
            this._delayPassed = 0; // 重置已流逝时间
            this._delaying = true;
            return;
        }
        
        // 非碰撞场景
        if (itemNode.active) {
            itemNode.getComponent(moveItems352)?.restart();
            this._delaying = false; // 取消延时
        }
    }

    /**
     * 每帧更新：简洁判断延时是否到期
     */
    update(dt: number) {
        this.updateComment(dt);
        if (!this._delaying) return;

        // 累加已流逝时间
        this._delayPassed += dt;
        
        // 延时到期执行逻辑
        if (this._delayPassed >= this._delayTotal) {
            this.animeLoop(this.psk, `lm_dj`);
            // 重置延时状态
            this._delaying = false;
            this._delayTotal = 0;
            this._delayPassed = 0;
            if (this.sum === 40) {
                this.onwin();
            }
        }
        // 更新评论滚动
    }

    private updateComment(dt: number) {
        // 1. 计时控制：缩短间隔，更快生成新评论（从2.5秒改为2.0秒）
        this._timer += dt;
        if (this._timer < 2.0 || this._showingDms.length > 3) return;
        this._timer = 0;

        // 2. 获取dm节点+更新索引（原有逻辑，增加强容错）
        const targetDm = this.dm.getChildByName(`dm${this._dmIndex}`);
        if (!targetDm) {
            this._dmIndex = this._dmIndex % 6 + 1;
            return;
        }
        this._dmIndex = this._dmIndex % 6 + 1;

        // 3. 设置评论内容（原有逻辑，增加非空判断）
        const speakNode = targetDm.getChildByName("speak");
        const labelNode = speakNode ? speakNode.getChildByName("label") : null;
        const label = labelNode ? labelNode.getComponent(cc.Label) : null;
        if (!label) return;
        label.string = this.speak[this._idx];
        this._idx = (this._idx + 1) % this.speak.length;

        // 4. 统一所有评论初始状态（彻底重置，杜绝复用混乱）
        const baseY = 0; // 第一行（最下方）固定绝对位置（核心：永不改变）
        const enterY = baseY - this._rowHeight; // 统一入场位置（第一行下方，确保有移动动画）
        targetDm.stopAllActions(); // 彻底停止所有原有动画，避免叠加冲突
        targetDm.setPosition(targetDm.x, enterY); // 统一入场初始位置
        targetDm.opacity = 255;
        targetDm.scale = 0.9;
        targetDm.active = true;

        // 5. 三行队列管理+固定绝对行位（核心修复：摒弃相对累加）
        let topDm: cc.Node | null = null;
        // 超过3条时，直接取出最上方（第三行）评论，无需额外移动
        if (this._showingDms.length >= 3) {
            topDm = this._showingDms.pop(); // 队列尾是第三行（最上方），直接弹出
        }

        // 6. 已有评论上移：加快速度（从0.5秒改为0.3秒）
        this._showingDms.forEach((dm, index) => {
            dm.stopAllActions(); // 先停止原有动画
            // 直接移动到上一行绝对位置（第一行→第二行，第二行→第三行）
            const targetRowY = baseY + this._rowHeight * (index + 1);
            cc.tween(dm)
                .to(0.3, { y: targetRowY })
                .start();
        });

        // 7. 新评论动画：加快速度（移动从0.8秒改为0.5秒，缩放同步提速）
        const firstRowY = baseY; // 第一行绝对位置，永不改变
        cc.tween(targetDm)
            .stop()
            .parallel(
                cc.tween().to(0.5, { y: firstRowY }), // 移动提速：0.5秒到位
                cc.tween().sequence(
                    cc.tween().to(0.2, { scale: 1.1 }), // 缩放步骤同步提速
                    cc.tween().to(0.1, { scale: 1.05 }),
                    cc.tween().to(0.2, { scale: 1.0 })
                )
            )
            .start();

        // 8. 调整队列顺序（确保[第一行、第二行、第三行]的固定顺序）
        this._showingDms.unshift(targetDm); // 新评论插入队列头部（对应第一行）

        // 9. 最上方评论渐隐：加快速度（上移从0.3秒改0.2秒，渐隐从0.7秒改0.4秒）
        if (topDm) {
            topDm.stopAllActions(); // 停止所有动画
            // 渐隐动画：先小幅上移（可选，更自然），再透明消失，最后重置状态
            cc.tween(topDm)
                .sequence(
                    cc.tween().to(0.2, { y: topDm.y + this._rowHeight * 0.5 }), // 上移提速
                    cc.tween().to(0.4, { opacity: 0 }) // 渐隐提速
                )
                .call(() => {
                    // 彻底重置状态，确保下次复用无异常
                    topDm!.active = false;
                    topDm!.setPosition(topDm!.x, enterY); // 重置为统一入场位置
                    topDm!.opacity = 255; // 恢复不透明
                    topDm!.scale = 1.0; // 恢复原始缩放
                })
                .start();
        }
    }


    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
        }
    }

    changeeyes() {
        if (!this.ENABLE_LOOK_PROP) return;
        this.eyes.active = true;
        this.animeLoop(this.psk, `lm_dj4`);
    }

    eyeslookat(ccp: cc.Vec3) {
        if (!this.ENABLE_LOOK_PROP) return;
        this.eyes.getComponent("eyes_lv352").eyeslookat(ccp);
    }

    eyesstop() {
        if (!this.ENABLE_LOOK_PROP) return;
        this.eyes.active = false;
        this.animeLoop(this.psk, `lm_dj`);
    }

    animeSingle(ske:dragonBones.ArmatureDisplay, name:string) {
        ske.playAnimation(name, 1);
    }
    animeLoop(ske:dragonBones.ArmatureDisplay, name:string) {
        ske.playAnimation(name, 0);
    }

    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        })
    }

    fanhuibtn() {
        if (GameData.PauseGame) return
        this.openpausePanel();
        AudioManager.playEffect(`button`);//AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 2);
    }

    onlost() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }
}
