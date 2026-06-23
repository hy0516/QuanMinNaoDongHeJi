
import shjhc_lv157 from "./shjhc_lv157";
import { role1IndexName } from "./gamedata_lv157_refactored";
import AssetManager from "../../script/common/AssetManager";
import AudioManager from "../../script/common/AudioManager";
import BaseGame from "../../script/common/BaseGame";
import GameData from "../../script/common/GameData";
import VideoManager from "../../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TJItem_lv157 extends BaseGame {

    private readonly bgPathLevel = [
        `picture_lv157/xk1`,
        `picture_lv157/tujian/k5`,
        `picture_lv157/tujian/k6`,
        `picture_lv157/tujian/k7`,
        `picture_lv157/tujian/k8`,
        `picture_lv157/tujian/k9`
    ];

    private readonly roleLevelPath = [
        `picture_lv157/tujian/n`,
        `picture_lv157/tujian/r`,
        `picture_lv157/tujian/s`,
        `picture_lv157/tujian/sr`,
        `picture_lv157/tujian/ssr`,
        `picture_lv157/tujian/sp`
    ];

    private readonly NODE_NAMES = {
        MASK: 'zhezhao',
        NAME_FRAME: 'tjdk',
        LEVEL_PIC: 'levelPic'
    };

    private roleName: string;
    private star: number;
    private roleIndex: number;  // 第一个角色索引
    private roleIndex1: number; // 第二个角色索引

    // 缓存节点引用
    private maskNode: cc.Node;
    private nameLabel: cc.Label;
    private levelPicNode: cc.Node;
    private bgSprite: cc.Sprite;

    onLoad() {
        this.cacheNodeReferences();
    }

    private cacheNodeReferences(): void {
        this.maskNode = this.node.getChildByName(this.NODE_NAMES.MASK);
        this.levelPicNode = this.node.getChildByName(this.NODE_NAMES.LEVEL_PIC);
        const nameFrameNode = this.node.getChildByName(this.NODE_NAMES.NAME_FRAME);
        if (nameFrameNode && nameFrameNode.children[0]) {
            this.nameLabel = nameFrameNode.children[0].getComponent(cc.Label);
        }
        this.bgSprite = this.node.getComponent(cc.Sprite);
    }

    private getStarLevelIndex(star: number): number {
        if (star < 4) return 0;
        if (star < 6) return 1;
        if (star < 8) return 2;
        if (star < 9) return 3;
        if (star < 10) return 4;
        return 5;
    }

    public UnLock(): void {
        if (this.maskNode) {
            this.maskNode.active = false;
        }
        if (this.nameLabel) {
            this.nameLabel.string = this.roleName;
        }
        if (this.levelPicNode) {
            this.levelPicNode.active = true;
        }
        this.node.children[0].color = cc.Color.WHITE;
        this.node.getChildByName(`ckgl`).active = false;
        this.node.getChildByName(`jsgl`).active = false;
    }

    public InitItem(element: any, index?: number, index1?: number): void {
        this.roleName = element.name;
        this.star = element.star;
        this.roleIndex = index;
        this.roleIndex1 = index1;
        const imgIndex = this.getStarLevelIndex(element.star);
        // 加载背景图
        AssetManager.load(
            GameData.curGameStyle,
            this.bgPathLevel[imgIndex],
            cc.SpriteFrame,
            null,
            (pic: cc.SpriteFrame) => {
                if (pic && this.bgSprite) {
                    this.bgSprite.spriteFrame = pic;
                } else {
                    console.error(`加载背景图片失败: ${this.bgPathLevel[imgIndex]}`);
                }
            }
        );

        // 加载等级图标
        AssetManager.load(
            GameData.curGameStyle,
            this.roleLevelPath[imgIndex],
            cc.SpriteFrame,
            null,
            (pic: cc.SpriteFrame) => {
                if (pic && this.levelPicNode) {
                    this.levelPicNode.getComponent(cc.Sprite).spriteFrame = pic;
                } else {
                    console.error(`加载等级图片失败: ${this.roleLevelPath[imgIndex]}`);
                }
            }
        );
    }
    BtnHandler(event: cc.Event.EventTouch) {
        if (GameData.PauseGame == true) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "ckgl":
                const mainScript = this.node.parent.parent.parent.parent.parent.parent.getComponent(shjhc_lv157);
                if (mainScript && this.roleIndex !== undefined && this.roleIndex1 !== undefined) {
                    mainScript.showTipsNode(this.roleIndex, this.roleIndex1,this.roleName);
                }
                break;
            case "jsgl":
                VideoManager.getInstance().showVideo(() => {
                    this.node.getChildByName(`jsgl`).active = false;
                    // 保存广告观看记录
                    const mainScript = this.node.parent.parent.parent.parent.parent.parent.getComponent(shjhc_lv157);
                    if (mainScript) {
                        const roleKey = role1IndexName[this.roleIndex] + (this.roleIndex1 + 1);
                        mainScript.handleTujianAdWatched(roleKey);
                    }
                })
                break;
            case `closeNode`:
                event.currentTarget.parent.active = false;
                break;
        }
    }
}