
import AssetManager from "../../script/common/AssetManager";
import AudioManager from "../../script/common/AudioManager";
import BaseGame from "../../script/common/BaseGame";
import GameData from "../../script/common/GameData";
import VideoManager from "../../script/common/VideoManager";
import { role1Name, role1IndexName, role2Name, banRole2Name } from "./gamedata_lv157_refactored";
import { RoleDataManager } from "./gamedata_lv157_refactored";
import Role1ListView from "./Role1ListView";
import Role2ListView from "./Role2ListView";
import { role1IndicatorConfig as role1IndicatorConfigData, role2IndicatorConfig as role2IndicatorConfigData } from "./roleIndicatorConfig_lv157";
import TujianPanel from "./TujianPanel";




const { ccclass, property } = cc._decorator;

@ccclass
export default class shjhc_lv157 extends BaseGame {
    @property(cc.Prefab)
    tujianPrefab: cc.Prefab = null;
    @property(cc.Node)
    tittle: cc.Node = null;
    @property(cc.Prefab)
    role1Prefab: cc.Prefab = null;
    @property(cc.Prefab)
    role2Prefab: cc.Prefab = null;
    @property(cc.Prefab)
    role1ItemPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    role2ItemPrefab: cc.Prefab = null;
    @property(TujianPanel)
    tujianPanel: TujianPanel = null;

    bgNode: cc.Node = null;


    public startTime = 300;
    public startX = 0;
    public endX = 0;
    public curTime = 0;
    public havefindList = [];

    canjiaohu = false;

    
   
    onLoad() {
        GameData.PauseGame = false;
        this.bgNode = this.node.getChildByName("bg");
        this.ensureRolePanels();
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv157", true, 1);
            this.gameStart();
        }, 0.5);
        cc.Tween.stopAllByTarget(this.tittle);
        // cc.tween(this.tittle)
        //     .repeat(2,
        //         cc.tween()
        //             .to(0.1, { angle: 7 })
        //             .to(0.1, { angle: 0 })
        //             .to(0.1, { angle: -7 })
        //             .to(0.1, { angle: 0 })
        //             .delay(0.5)
        //     )
        //     .start()

    }
    gameStart() {
        this.jy = this.bgNode.getChildByName(`jy`);
        this.jy1 = this.bgNode.getChildByName(`jy1`);
        this.jyrh = this.bgNode.getChildByName(`jyrh`);
        this.origjysprite = this.jy.getComponent(cc.Sprite).spriteFrame;
        this.rhsk = this.bgNode.getChildByName(`rh_ske`).getComponent(dragonBones.ArmatureDisplay);
        this.tittle.getChildByName(`label2`).getComponent(cc.Label).string = ``;
        this.list1 = this.bgNode.getChildByName(`role1`).children[0].children[0].children[0];
        this.list2 = this.bgNode.getChildByName(`role2`).children[0].children[0].children[0];
        this.setupRoleLists();
        for (let index = 0; index < this.list1.childrenCount; index++) {
            const element = this.list1.children[index];
            if (element.getChildByName(`hongdian`) && element.getChildByName(`luxiang`) && element.getChildByName(`luxiang`).active == true) {
                this.playHuxi(element.getChildByName(`hongdian`));
            }
        }
        this.tujianPanel?.initializePanel();
    }

    list1; list2;
    private role1Root: cc.Node = null;
    private role2Root: cc.Node = null;
    private role1ListView: Role1ListView = null;
    private role2ListView: Role2ListView = null;

    jy: cc.Node;
    jy1: cc.Node;
    jyrh: cc.Node;
    origjysprite; //初始剪影
    rhsk: dragonBones.ArmatureDisplay;
    

    curRoleListOneSelNode: cc.Node;
    curRoleListTwoSelNode: cc.Node;
    currole1NameIndex: number;//记录role1Name的位置
    currole2NameIndex: number;

    clickRoleOneListSel(even: cc.Event.EventTouch) {
        if (even.currentTarget.getChildByName(`luxiang`) && even.currentTarget.getChildByName(`luxiang`).active == true) {
            var luxiangicon = even.currentTarget.getChildByName(`luxiang`);
            VideoManager.getInstance().showVideo(() => {
                luxiangicon.active = false;
                if (even.currentTarget.getChildByName(`hongdian`) && even.currentTarget.getChildByName(`hongdian`).active == true) {
                    var hongdianicon = even.currentTarget.getChildByName(`hongdian`);
                    cc.Tween.stopAllByTarget(hongdianicon);
                    hongdianicon.active = false;
                }
                return;/*  */
            });
            return;
        }
        if (even.currentTarget.getChildByName(`hongdian`) && even.currentTarget.getChildByName(`hongdian`).active == true) {
            var hongdianicon = even.currentTarget.getChildByName(`hongdian`);
            cc.Tween.stopAllByTarget(hongdianicon);
            hongdianicon.active = false;
        }
        this.tittle.active = true;
        AudioManager.playEffect(AudioManager.common.BUTTON);

        if (!this.curRoleListOneSelNode) {
            this.curRoleListOneSelNode = even.currentTarget.children[0];
        }
        else {
            this.curRoleListOneSelNode.parent.color = cc.Color.fromHEX(this.curRoleListOneSelNode.parent.color, `#ffffff`);
            this.curRoleListOneSelNode = even.currentTarget.children[0];
        }
        this.curRoleListOneSelNode.parent.color = cc.Color.fromHEX(this.curRoleListOneSelNode.parent.color, `#98ffbc`)
        this.jy.getComponent(cc.Sprite).spriteFrame = this.curRoleListOneSelNode.getComponent(cc.Sprite).spriteFrame;
        this.jy.scale = 1.2;
        cc.tween(this.jy).to(0.3, { scale: 1 }).start();

        this.tittle.children[0].getComponent(cc.Label).string = RoleDataManager.getRole1Name(RoleDataManager.getRole1IndexByIndexName(this.curRoleListOneSelNode.name));
        this.bgNode.getChildByName(`btn_xyb`).active = true;
    }
    clickRoleTwoListSel(even: cc.Event.EventTouch) {
        if (even.currentTarget.getChildByName(`luxiang`) && even.currentTarget.getChildByName(`luxiang`).active == true) {
            var luxiangicon = even.currentTarget.getChildByName(`luxiang`);
            VideoManager.getInstance().showVideo(() => {
                luxiangicon.active = false;
            });
            return;
        }
        this.tittle.active = true;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        if (!this.curRoleListTwoSelNode) {
            this.curRoleListTwoSelNode = even.currentTarget.children[0];
        }
        else {
            this.curRoleListTwoSelNode.parent.color = cc.Color.fromHEX(this.curRoleListTwoSelNode.parent.color, `#ffffff`);
            this.curRoleListTwoSelNode = even.currentTarget.children[0];
        }
        this.curRoleListTwoSelNode.parent.color = cc.Color.fromHEX(this.curRoleListTwoSelNode.parent.color, `#98ffbc`)
        this.jy1.getComponent(cc.Sprite).spriteFrame = this.curRoleListTwoSelNode.getComponent(cc.Sprite).spriteFrame;
        this.jy1.scale = 1.2;
        cc.tween(this.jy1).to(0.3, { scale: 1 }).start();
        this.tittle.children[0].getComponent(cc.Label).string = RoleDataManager.getRole2Name(Number(this.curRoleListTwoSelNode.name) - 1);
        this.bgNode.getChildByName(`btn_xyb`).active = true;
    }
    btn_Next() {
        this.bgNode.getChildByName(`btn_tujian`).active = false;
        this.bgNode.getChildByName(`btn_xyb`).active = false;
        this.tittle.active = false;
        const role1 = this.bgNode.getChildByName(`role1`);
        const role2 = this.bgNode.getChildByName(`role2`);
        AudioManager.playEffect(`moverolelv157`);
        if (role1.active) {
            cc.tween(this.jy).to(1.3, { width: 120, height: 120, x: -277, y: 475 }).start();
            this.jy1.active = true; this.jy1.x = 900;
            cc.tween(this.jy1).to(1.3, { x: 6.58 }).call(() => { }).start();
            cc.tween(role1).to(0.3, { y: role1.y + 100 }).call(() => {
                cc.tween(role1).to(1, { y: -1750 }).call(() => {
                    this.nextRoomEvent();
                }).start();
            }).start();

        } else if (role2.active) {
            this.bgNode.getChildByName(`fanhui`).active = false;
            cc.tween(role2).to(0.3, { y: role2.y + 100 }).call(() => {
                cc.tween(role2).to(.8, { y: -1750 }).call(() => {
                    role2.active = false;
                }).start();
            }).start();
            cc.tween(this.jy).to(1, { width: 300, height: 300, x: -210, y: 430 }).call(() => {
                cc.tween(this.jy).to(.6, { x: 0 }).call(() => {
                    this.jy.active = false;
                }).start();
            }).start();
            cc.tween(this.jy1).to(1, { width: 300, height: 300, x: 210, y: 430 }).call(() => {
                cc.tween(this.jy1).to(.6, { x: 0 }).call(() => {
                    this.jy1.active = false;
                    this.jieSuanEvent();
                }).start();
            }).start();
        }
    }
    nextRoomEvent() {
        const role1 = this.bgNode.getChildByName(`role1`);
        const role2 = this.bgNode.getChildByName(`role2`);
        if (role1.active) {
            //切换房间
            role1.active = false; role2.active = true; role2.y = -1750;
            this.playTeShuEvent();
            cc.tween(role2).to(1, { y: -168 }).call(() => {
                // cc.tween(role2).to(0.3,{y:-168}).call(()=>{


                // }).start(); 
            }).start();

        }
    }
    playTeShuEvent() {
        if (!this.curRoleListOneSelNode || !this.role2ListView) return;
        const role1Index = RoleDataManager.getRole1IndexByIndexName(this.curRoleListOneSelNode.name);
        // 从 FusionResultMap 获取该角色1对应的所有角色2合成结果数组
        const roleData = RoleDataManager.getRole2ResultsArray(role1Index);
        this.role2ListView.showByRole(roleData, banRole2Name);
    }
    jieSuanEvent() {

        this.rhsk.node.active = true;
        this.rhsk.playAnimation(`newAnimation`, 1);
        AudioManager.playEffect(`hetilv157`);

        // 生成融合角色的名称并保存到本地缓存
        const unlockedRoleName = this.curRoleListOneSelNode.name + this.curRoleListTwoSelNode.name;
        this.handleTujianUnlock(unlockedRoleName);
        AssetManager.load(GameData.curGameStyle, `picture_lv157/resultrole/${unlockedRoleName}`, cc.SpriteFrame, null, (pic: cc.SpriteFrame) => {
            this.jyrh.getComponent(cc.Sprite).spriteFrame = pic;
        })

        let role1Index = RoleDataManager.getRole1IndexByIndexName(this.curRoleListOneSelNode.name);
        let role2Index = RoleDataManager.getRole2IndexById(this.curRoleListTwoSelNode.name);
        
        // 使用RoleDataManager获取融合角色数据
        let roleData = RoleDataManager.getFusionResult(role1Index, role2Index);
        if (!roleData) {
            console.error(`无法找到合成结果: role1Index=${role1Index}, role2Index=${role2Index}`);
            return;
        }


        this.tittle.children[0].getComponent(cc.Label).string = roleData.name;//顶上名字
        this.tittle.getChildByName(`label2`).getComponent(cc.Label).string = `${role1Name[role1Index]}+${role2Name[role2Index]}`;//融合步骤名字
        this.node.getChildByName(`bg`).getChildByName(`txtcontent`).children[0].children[0].getComponent(cc.Label).string = roleData.content;//简介


        this.tittle.active = true; this.tittle.opacity = 0;
        this.jyrh.active = true; this.jyrh.scale = 0;

        this.addOneTimeListener(this.rhsk, () => {
            this.rhsk.node.active = false;
            AudioManager.playEffect(`hetioverlv157`);
            cc.tween(this.tittle).to(1, { opacity: 255 }).start();
            cc.tween(this.jyrh).to(1, { scale: 1.1 }).call(() => {
                // this.canPlayHuxi=true;
                this.playHuxi(this.jyrh);
                this.scheduleOnce(() => {
                    //延迟之后开始做星星事件
                    this.shrinkStar(roleData.star);
                }, 0.5);
            }).start();
        })
    }
    curCount = 0;//当前点亮星星
    totalCount = 0;//记录总数
    timerId;//计时器ID
    shrinkStar(num: number) {
        this.totalCount = num;
        //重置星星Node状态
        const stardi = this.node.getChildByName(`bg`).getChildByName(`stardi`);
        const xxNode = stardi.getChildByName(`xxNode`); xxNode.y = 0;
        const levellabel = stardi.getChildByName(`levellabel`).getComponent(cc.Label);
        levellabel.string = ``;
        stardi.active = true;
        stardi.width = 20; stardi.height = 80;
        for (let index = 0; index < xxNode.childrenCount; index++) {
            const element = xxNode.children[index];
            element.children[0].active = false;
            element.active = false;
        }

        var executeTask = () => {
            for (let index = 0; index < xxNode.childrenCount; index++) {
                const element = xxNode.children[index];
                if (!element.active) {
                    element.active = true;
                    element.getComponent(dragonBones.ArmatureDisplay).playAnimation(`xx`, 1);
                    switch (this.curCount) {
                        case 0:
                            AudioManager.playEffect(`x1lv157`);
                            break;
                        case 1:
                            AudioManager.playEffect(`x2lv157`);
                            break;
                        case 2:
                            AudioManager.playEffect(`x3lv157`);
                            break;
                        default:
                            AudioManager.playEffect(`x4lv157`);
                            break;
                    }

                    stardi.width += 65;
                    break;
                }
            }
            this.curCount++;
            if (this.curCount < this.totalCount) {
                // 使用箭头函数保持 this 上下文
                this.timerId = setTimeout(() => executeTask(), 300 + this.curCount * 200);
            } else {
                clearTimeout(this.timerId);
                this.timerId = null;
                setTimeout(() => {
                    this.upContent();
                    levellabel.string = `吴迪`;
                    stardi.height = 150;
                    stardi.scale = 0;
                    xxNode.y = 30;
                    cc.tween(stardi).to(0.2, { scale: 1 }).start();
                    this.starsChange(this.totalCount);
                }, 1000);
            }

        }
        if (num > 0) {
            executeTask();
        }
    }
    starsChange(num: number) {
        AudioManager.playEffect(`bxx2lv157`);
        const xxNodes = this.node.getChildByName(`bg`).getChildByName(`stardi`).getChildByName(`xxNode`);
        const xx1 = `xx`; const xx2 = `xx2`; const xx3 = `xx3`;
        var loadxxpng = num > 9 ? xx3 : num > 7 ? xx2 : xx1;
        this.node.getChildByName(`bg`).getChildByName(`stardi`).getChildByName(`levellabel`).getComponent(cc.Label).string
            = `${num < 4 ? `普通` : num < 6 ? `精良` : num < 8 ? `稀有` : num < 9 ? `史诗` : num < 10 ? `传说` : `神话`}`;//修改字体内容
        this.node.getChildByName(`bg`).getChildByName(`stardi`).getChildByName(`levellabel`).color
            = cc.Color.fromHEX(this.node.getChildByName(`bg`).getChildByName(`stardi`).getChildByName(`levellabel`).color,
                `#${num < 4 ? `ffffff` : num < 6 ? `0cff00` : num < 8 ? `00f6ff` : num < 9 ? `ba00ff` : num < 10 ? `fff264` : `ff3c00`}`)//修改字体颜色
        AssetManager.load(GameData.curGameStyle, `picture_lv157/${loadxxpng}`, cc.SpriteFrame, null, (pic: cc.SpriteFrame) => {
            for (let index = 0; index < xxNodes.childrenCount; index++) {
                const element = xxNodes.children[index];
                if (!element.active) continue;
                element.children[0].getComponent(cc.Sprite).spriteFrame = pic;
                element.children[0].active = true;
            }
        })

    }
    upContent() {
        const content = this.node.getChildByName(`bg`).getChildByName(`txtcontent`);
        content.active = true; content.height = 0; content.children[0].children[0].y = -300;
        cc.tween(content).to(0.3, { height: 500 }).call(() => {
            cc.tween(content.children[0].children[0]).to(1, { y: 250 }).call(() => {
                this.node.getChildByName(`bg`).getChildByName(`zsyc`).active = true;
            }).start();
        }).start();
    }
    playAgain() {
        this.node.getChildByName(`bg`).getChildByName(`btn_tujian`).active = true;
        this.jyrh.cleanup()
        // this.canPlayHuxi=false;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.curCount = 0;
        const content = this.node.getChildByName(`bg`).getChildByName(`txtcontent`);
        const stardi = this.node.getChildByName(`bg`).getChildByName(`stardi`);
        this.node.getChildByName(`bg`).getChildByName(`zsyc`).active = false;
        cc.tween(this.tittle).to(1, { opacity: 0 }).call(() => {
            this.tittle.opacity = 255;
            this.tittle.active = false;
        }).start();
        cc.tween(this.jyrh).to(1, { scale: 0 }).call(() => {
            this.jyrh.active = false;
        }).start();
        cc.tween(content.children[0].children[0]).to(0.7, { y: -300 }).call(() => {
            cc.tween(content).to(0.3, { height: 0 }).call(() => {
                content.active = false;
                this.curRoleListOneSelNode.parent.color = cc.Color.fromHEX(this.curRoleListOneSelNode.parent.color, `#ffffff`);
                this.curRoleListTwoSelNode.parent.color = cc.Color.fromHEX(this.curRoleListTwoSelNode.parent.color, `#ffffff`);
                this.curRoleListOneSelNode = null;
                this.curRoleListTwoSelNode = null;
                this.jy.getComponent(cc.Sprite).spriteFrame = this.origjysprite;
                this.jy1.getComponent(cc.Sprite).spriteFrame = this.origjysprite;
                this.jyrh.getComponent(cc.Sprite).spriteFrame = this.origjysprite;
                this.tittle.getChildByName(`label2`).getComponent(cc.Label).string = ``;
                this.jy.active = true;
                this.node.getChildByName(`bg`).getChildByName(`role1`).active = true;
                cc.tween(this.node.getChildByName(`bg`).getChildByName(`role1`)).to(1, { y: -168 }).call(() => {
                    this.node.getChildByName(`bg`).getChildByName(`fanhui`).active = true;
                }).start();

            }).start();
        }).start();
        cc.tween(this.node.getChildByName(`bg`).getChildByName(`stardi`)).to(1, { opacity: 0 }).call(() => {
            this.node.getChildByName(`bg`).getChildByName(`stardi`).active = false;
            this.node.getChildByName(`bg`).getChildByName(`stardi`).opacity = 255;
        }).start();

    }

    private ensureRolePanels() {
        if (!this.bgNode) return;
        this.role1Root = this.bgNode.getChildByName(`role1`);
        if (!this.role1Root && this.role1Prefab) {
            this.role1Root = cc.instantiate(this.role1Prefab);
            this.role1Root.name = `role1`;
            this.role1Root.parent = this.bgNode;
            this.role1Root.setSiblingIndex(this.role1Root.parent.childrenCount-2);
        }
        this.role2Root = this.bgNode.getChildByName(`role2`);
        if (!this.role2Root && this.role2Prefab) {
            this.role2Root = cc.instantiate(this.role2Prefab);
            this.role2Root.name = `role2`;
            this.role2Root.parent = this.bgNode;
           this.role2Root.setSiblingIndex(this.role2Root.parent.childrenCount-2);
        }
        if (!this.role1Root) {
            console.warn(`[lv157] role1 节点缺失, 请在编辑器中指定 role1Prefab`);
        }
        if (!this.role2Root) {
            console.warn(`[lv157] role2 节点缺失, 请在编辑器中指定 role2Prefab`);
        } else {
            this.role2Root.active = false;
        }
        this.ensureTujianPanel();
    }

    private ensureTujianPanel() {
        if (!this.bgNode || this.tujianPanel) return;
        let panelNode = this.bgNode.getChildByName(`tujianNode`);
        if (!panelNode) {
            if (!this.tujianPrefab) {
                console.warn(`[lv157] 未找到 tujianNode，且未在检查器中指定 tujianPrefab`);
                return;
            }
            panelNode = cc.instantiate(this.tujianPrefab);
            panelNode.name = `tujianNode`;
            panelNode.parent = this.bgNode;
            panelNode.setSiblingIndex(panelNode.parent.childrenCount-2);
        }
        this.tujianPanel = panelNode.getComponent(TujianPanel);
        if (!this.tujianPanel) {
            console.warn(`[lv157] tujianNode 未挂载 TujianPanel 组件`);
        }
    }

    private setupRoleLists() {
        if (!this.list1 || !this.list2) {
            console.warn(`[lv157] role 列表容器未找到, 请确认预制体结构`);
            return;
        }

        this.role1ListView = this.role1Root?.getComponent(Role1ListView);
        if (this.role1ListView) {
            const template1 = this.list1.childrenCount > 0 ? this.list1.children[0] : null;
            this.role1ListView.init({
                contentNode: this.list1,
                templateNode: template1,
                itemPrefab: this.role1ItemPrefab,
                roleIndexNames: role1IndexName,
                clickTarget: this.node,
                clickComponent: `shjhc_lv157`,
                clickHandler: `clickRoleOneListSel`,
                indicatorConfig: role1IndicatorConfigData
            });
        }

        this.role2ListView = this.role2Root?.getComponent(Role2ListView);
        if (this.role2ListView) {
            const template2 = this.list2.childrenCount > 0 ? this.list2.children[0] : null;
            this.role2ListView.init({
                contentNode: this.list2,
                templateNode: template2,
                itemPrefab: this.role2ItemPrefab,
                roleNames: role2Name,
                clickTarget: this.node,
                clickComponent: `shjhc_lv157`,
                clickHandler: `clickRoleTwoListSel`,
                indicatorConfig: role2IndicatorConfigData
            });
        }
    }

    private openTujianPanel() {
        this.ensureTujianPanel();
        this.tujianPanel?.openPanel();
    }

    private handleTujianUnlock(roleName: string) {
        if (!roleName) return;
        const isNew = this.tujianPanel ? this.tujianPanel.markUnlocked(roleName) : false;
        if (isNew) {
            this.toggleTujianRedDot(true);
        }
    }

    public handleTujianAdWatched(roleName: string) {
        if (!roleName) return;
        this.tujianPanel?.markAdWatched(roleName);
    }

    private toggleTujianRedDot(active: boolean) {
        if (!this.bgNode) return;
        const btn = this.bgNode.getChildByName(`btn_tujian`);
        if (btn && btn.childrenCount > 0) {
            btn.children[0].active = active;
        }
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
            case "tishi":

                var handlers = () => {
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    //   this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = true;
                    // this.showStepTipsLabel();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case `x`:
                this.node.getChildByName(`bg`).getChildByName(`tipsPanel`).active = false;
                break;
            case `closeNode`:
                event.currentTarget.parent.active = false;
                break;
            case `btn_tujian`:
                if (event.currentTarget.childrenCount > 0) {
                    event.currentTarget.children[0].active = false;
                }
                this.toggleTujianRedDot(false);
                this.openTujianPanel();
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
    onwin() {}

    // canPlayHuxi:boolean=false;
    playHuxi(nodd: cc.Node) {
        cc.tween(nodd).to(1, { scale: 1.1 }).call(
            () => {
                cc.tween(nodd).to(1, { scale: 1 }).call(
                    () => {
                        //   if(this.canPlayHuxi)
                        this.playHuxi(nodd);
                    }
                ).start();
            }
        ).start();
    }




    // 显示合成提示节点
    showTipsNode(roleIndex: number, roleIndex1: number, roleName: string) {
        const tipsNode = this.node.getChildByName(`bg`).getChildByName(`tipsNode`);
        if (!tipsNode) {
            console.error("找不到tipsNode节点");
            return;
        }

        // 激活tipsNode
        tipsNode.active = true;
        tipsNode.getChildByName(`nameLabel`).getComponent(cc.Label).string = roleName;
        // 获取step1和step2节点
        const step1 = tipsNode.getChildByName(`step1`);
        const step2 = tipsNode.getChildByName(`step2`);

        if (!step1 || !step2) {
            console.error("找不到step1或step2节点");
            return;
        }

        // 获取第一个子节点（图片节点）
        const step1Img = step1.children[0];
        const step2Img = step2.children[0];

        if (!step1Img || !step2Img) {
            console.error("找不到step1或step2的图片子节点");
            return;
        }

        // 生成第一个角色的图片路径
        const role1IndexNameByIndex = RoleDataManager.getRole1Config(roleIndex)?.indexName || role1IndexName[roleIndex];
        const role1Path = `picture_lv157/rl1/${role1IndexNameByIndex}`;

        // 生成第二个角色的图片路径
        const role2Path = `picture_lv157/rl2/${roleIndex1 + 1}`;

        // 加载第一个角色图片
        AssetManager.load(GameData.curGameStyle, role1Path, cc.SpriteFrame, null, (pic: cc.SpriteFrame) => {
            if (pic && step1Img) {
                const sprite = step1Img.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = pic;
                }
            } else {
                console.error(`加载step1图片失败: ${role1Path}`);
            }
        });

        // 加载第二个角色图片
        AssetManager.load(GameData.curGameStyle, role2Path, cc.SpriteFrame, null, (pic: cc.SpriteFrame) => {
            if (pic && step2Img) {
                const sprite = step2Img.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = pic;
                }
            } else {
                console.error(`加载step2图片失败: ${role2Path}`);
            }
        });
    }


   
}


