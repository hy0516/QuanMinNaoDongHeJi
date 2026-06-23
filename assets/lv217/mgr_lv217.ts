import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems217 from "./moveItems217";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgr_lv217 extends BaseGame {
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;

    lab_pb: cc.Node;
    PB: cc.Node;

    isshowVideo = false;
    canjiaohu = false;
    flag = true;
    // 当前处理的物品索引（按randomArray顺序）
    private currentItemIndex: number = 0;
    // 当前上场的角色
    private currentRole: string = "";
    // 角色key数组（方便后续使用）
    private allRoleKeys: string[] = [];
    // 记录当前需要的物品类型（用于准确判断）
    private currentRequiredType: number = 0;

    private itemDialogs: string[] = [
        "我要一个BallerinaCapuchina",
        "来一个Tungtungtungsahur",
        "我要TralaeroTralala",
        "给我ChimpanzmiBananini",
        "我要一个CapuchmoAssassino",
        "我想要可爱的北极熊",
        "我要一个BombardiroCrocodilo",
        "我要一个Lirili Larila",
        "拿一个帅气的飞机",
    ];

    private roleConfig = {
        eyzdj: { dj: "eyzdj_dj", dui: "eyzdj_dui", cuo: "eyzdj_cuo", typeRange: [1, 2] },
        kbqn: { dj: "kbqn_dj", dui: "kbqn_dui", cuo: "kbqn_cuo", typeRange: [3, 4] },
        ltqw: { dj: "ltqw_dj", dui: "ltqw_dui", cuo: "ltqw_cuo", typeRange: [5, 6] },
        nksy: { dj: "nksy_dj", dui: "nksy_dui", cuo: "nksy_cuo", typeRange: [7, 8, 9] }
    };

    private randomArray: number[];
    psk: dragonBones.ArmatureDisplay;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        AudioManager.playMusic(`bgmlv217`);

        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        
        this.randomRange();
        this.psk = this.node.getChildByName("bg").getChildByName(`p_ske`).getComponent(dragonBones.ArmatureDisplay);
        this.allRoleKeys = Object.keys(this.roleConfig);
        this.currentItemIndex = 0; // 从第一个物品开始处理

        this.pangbai("卖烧饼啦，经济实惠，量大管饱");
        AudioManager.playEffect(`卖烧饼啦，经济实惠，量大管饱`, false);
        // 启动第一个物品对应的角色入场
        this.scheduleOnce(() => {
            this.startCurrentItemRole();
        }, 4)
    }

    // 根据物品类型获取对应角色
    private getAllRoleByType(type: number): string {
        for (const key of this.allRoleKeys) {
            const role = this.roleConfig[key];
            if (role.typeRange.includes(type)) {
                return key;
            }
        }
        return this.allRoleKeys[0]; // 默认第一个角色
    }

    // 播放角色待机动画
    private playRoleDjAnim() {
        if (this.currentRole && this.psk) {
            this.psk.playAnimation(this.roleConfig[this.currentRole].dj, 0);
        }
    }

    onDestroy() {
        if (this.node && this.node.isValid) {
            const bgNode = this.node.getChildByName('bg');
        }
        this.unscheduleAllCallbacks();
    }

    pangbai(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(3.5)
            .to(0.3, { opacity: 0 })
            .call(() => {
            })
            .start()
    }

    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        this.canjiaohu = false;
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false);
                this.canjiaohu = true;
                handler && handler();
            })
            .start()
    }
 
    hideqp(qpnode: cc.Node, handler?: Function) {
        var qp = qpnode.getChildByName("qp")
        cc.tween(qp)
            .to(0.2, { opacity: 0 })
            .call(() => {
                handler && handler();
            })
            .start()
    }

    randomRange() {
        const items: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        this.randomArray = [...items].sort(() => Math.random() - 0.5);
    }

    private startCurrentItemRole() {
        // 物品类型：randomArray的索引对应type（0→1，1→2...8→9）
        const itemType = this.randomArray[this.currentItemIndex] + 1;
        // 记录当前需要的物品类型
        this.currentRequiredType = itemType;
        // 找到当前物品类型对应的角色
        this.currentRole = this.getAllRoleByType(itemType);
        // 角色入场，传递物品类型
        this.moveNode(true, 0.8, itemType);
    }

    public moveNode(isEnter: boolean, duration: number = 0.8, itemType?: number) {
        const pSkeNode = this.node.getChildByName('bg').getChildByName('p_ske');
        const originalY = pSkeNode.y;
        const startX = -1000;
        const centerX = 0;
        const endX = 1000;

        cc.Tween.stopAllByTarget(pSkeNode);

        if (isEnter) {
            this.playRoleDjAnim();
            // 入场：左边→中间
            pSkeNode.x = startX;
            pSkeNode.y = originalY;
            pSkeNode.opacity = 255;
            cc.tween(pSkeNode)
                .to(duration, { x: centerX }, { easing: 'sineOut' })
                .call(() => {
                    // 入场后显示对话框，不自动隐藏
                    if (itemType !== undefined) {
                        this.showqp(
                            this.psk.node,
                            this.itemDialogs[itemType - 1], 
                            this.itemDialogs[itemType - 1]
                        );
                    }
                })
                .start();
        } else {

            const bgNode = this.node.getChildByName("bg");
            const tipsCNode = bgNode.getChildByName("tips");
            for(let i=1 ;i<10 ;i++) {
                const circleNode = tipsCNode.getChildByName(i.toString());
                circleNode.active = false;
            }
            this.node.getChildByName(`bg`).getChildByName(`sz_ske`).active = false;

            this.hideqp(this.psk.node, () => {
                cc.tween(pSkeNode)
                    .to(duration, { x: endX }, { easing: 'sineIn' })
                    .call(() => {
                        pSkeNode.x = startX; // 重置位置，准备下一个角色
                        this.currentItemIndex++;
                        // 还有物品就启动下一个角色，没有就结束（可加胜利逻辑）
                        if (this.currentItemIndex < this.randomArray.length) {
                            this.startCurrentItemRole();
                        } else {
                            this.onwin();
                        }
                    })
                    .start();
            });
        }
    }

    // 物品碰撞处理
    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch) {
        if (!this.canjiaohu) {
            const dragComponent = even.currentTarget.getComponent(moveItems217);
            dragComponent && dragComponent.restart();
            return;
        }
        this.canjiaohu = false;
        const colls = this.node.getChildByName(`bg`).getChildByName(`checknodes`);
        const pnodeTarget = colls.getChildByName(`pnode`);
        const fjnodeTarget = colls.getChildByName(`fjnode`);
        const itemNode = even.currentTarget;
        if(fjnodeTarget && fjnodeTarget.active && type == 10) {
            const isCollide = cc.Intersection.rectRect(
                fjnodeTarget.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );
            if(isCollide) {
                this.node.getChildByName(`bg`).getChildByName(`sz_ske`).active = false;
                itemNode.active = false;
                this.flag = false;
                this.node.getChildByName(`bg`).getChildByName(`mojingnode`).getChildByName(`9`).getChildByName(`jy`).active = true;
                this.canjiaohu = true;
                return;
            }
        }
        if (pnodeTarget && pnodeTarget.active) {
            const isCollide = cc.Intersection.rectRect(
                pnodeTarget.getBoundingBoxToWorld(),
                itemNode.getBoundingBoxToWorld()
            );

            if (isCollide) {
                AudioManager.playEffect(AudioManager.common.BUTTON);
                const role = this.roleConfig[this.currentRole];
                // 1. 配对成功：判断拖来的物品类型是否为当前需要的类型
                if (type === this.currentRequiredType && (type !== 9 || !this.flag)) {
                    itemNode.active = false;
                    AudioManager.playEffect(`选择正确`, false);
                    this.psk.playAnimation(role.dui, 1); // 播成功动画
                    this.scheduleOnce(() => {
                        this.moveNode(false); // 1秒后下场
                    }, 1);
                }
                // 2. 配对失败：播1秒失败动画→继续待机
                else {
                    AudioManager.playEffect(`选错`, false);
                    this.psk.playAnimation(role.cuo, 1); // 播失败动画
                    this.scheduleOnce(() => {
                        this.loseStar();
                        this.playRoleDjAnim(); // 1秒后切回待机
                        this.canjiaohu = true; // 允许再次尝试
                    }, 1);
                }
            } else {
                this.canjiaohu = true;
            }
        }

        if (itemNode.active) {
            const dragComponent = itemNode.getComponent(moveItems217);
            dragComponent && dragComponent.restart();
        }
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(()=>{
                this.showTips();
                });
                break;
        }
    }

    showTips() {
        const bgNode = this.node.getChildByName("bg");
        const tipsCNode = bgNode.getChildByName("tips");
        
        if(this.currentRequiredType === 9) {
            this.node.getChildByName(`bg`).getChildByName(`sz_ske`).active = true;
        }
        const circleNode = tipsCNode.getChildByName(this.currentRequiredType.toString());
        circleNode.active = true;

    }

    fanhui() {
        // 记录关卡退出（返回大厅）
        GameData.recordLevelExit("hall");
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
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    onwin() {
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    private loseStar() {
        const bg = this.node.getChildByName("bg");
        const starMap = [
            { star: bg.getChildByName("x1"), gray: bg.getChildByName("x4") },
            { star: bg.getChildByName("x2"), gray: bg.getChildByName("x5") },
            { star: bg.getChildByName("x3"), gray: bg.getChildByName("x6") }
        ];

        const target = starMap.find(item => item.star?.active);
        if (!target) return;

        // 星星消失动画
        cc.tween(target.star)
            .to(0.3, { opacity: 0, scale: 0.8 })
            .call(() => {
                target.star.active = false;
                
                // 检查是否所有星星都消失
                if (!starMap.some(item => item.star?.active)) {
                    this.onlost();
                }
            })
            .start();
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
    