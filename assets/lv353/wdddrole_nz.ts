import AudioManager from "../script/common/AudioManager";
import wdddrole from "./wdddrole";
import wddd_lv1 from "./wddd_lv1";






const { ccclass, property } = cc._decorator;
@ccclass
export default class wdddrole_nz extends wdddrole {
    talksk
    toudata = "";
    curdata: { type: number, value: string }
    type;
    currole;
    curAudioList: { [key: string]: string };

    nzAudioList: { [key: string]: string } = {//左边说话右边声音
        ["1"]: "我的刀盾|我的刀盾",
        ["2"]: "巴巴博一|巴巴博一",
        ["3"]: "比比拉布|比比拉布",
        ["4"]: "歪比巴卜|歪比巴卜",
        ["5"]: "咕咕嘎嘎|咕咕嘎嘎",
        ["6"]: "八个鸭鹿|八个鸭鹿",
        ["7"]: "给我擦皮鞋|给我擦皮鞋",
    }
    ActionList: { [key: string]: string } = {//slot代表修改插槽，动画名字修改动画
        ["1"]: "slot",
        ["2"]: "slot",
        ["3"]: "slot",
        ["4"]: "slot",
        ["5"]: "slot",
        ["6"]: "slot",
        ["7"]: "slot",
        ["8"]: "slot",
        ["9"]: "slot",
        ["10"]: "slot",
        ["11"]: "slot",
        ["12"]: "slot",
        ["13"]: "slot",
        ["14"]: "slot",
        ["15"]: "slot",

    }
    touslotnamelist: { [key: string]: number } = {//代表插槽对应的状态
        ["1"]: 1,
        ["2"]: 0,
        ["3"]: 0,
        ["4"]: 1,
        ["5"]: 0,
        ["6"]: 1,
        ["7"]: 0,
        ["8"]: 1,
        ["9"]: 0,
        ["10"]: 1,
        ["11"]: 0,
        ["12"]: 1,
        ["13"]: 0,
        ["14"]: 0,
        ["15"]: 0,
    }
    
    checkAnswer(value: string): string {
        if (Number(value) % 2 == 1) return "dui";
        return "cuo";
    }
    protected onLoad(): void {
        if (!this.currole) {
            this.currole = this.node.getChildByName("nz_ske");
            this.curAudioList = this.nzAudioList;
        }
    }
    /** @param skipMendonghua 单角色模式为true，跳过双人对话流程 */
    init(data: { type: number, value: string }, skipMendonghua?: boolean) {
        if (!this.talksk) this.talksk = this.node.getChildByName("dh_sk");
        this.curdata = data;
        if (!this.currole) {
            this.currole = this.node.getChildByName("nz_ske");
            this.curAudioList = this.nzAudioList;
        }
        let armature: dragonBones.Armature = this.currole.getComponent(dragonBones.ArmatureDisplay).armature();
        let jiesuanAni = this.checkAnswer(data.value);
        let doMendonghua = () => {
            if (!skipMendonghua) {
                // this.node.parent.parent.getComponent(wddd_lv1).mendonghuaHandle({ data: this.curAudioList[data.value], talkNode: this.node, skNode: this.currole, skAni: this.ActionList[data.value], jiesuanAni: jiesuanAni });
            }
        };
        switch (data.type) {
            case 0:
           
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
            case 1:
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
            case 2:
      
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
            case 3:
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
            case 4:
             
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
            case 5:
            
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
            case 6:
                this.seledata = this.seledata + data.value;
                doMendonghua();
                break;
        }
    }

    public qkqhandler() {
        // var talksk = this.node.getChildByName("dh_sk").getComponent(dragonBones.ArmatureDisplay);
        // var audiolist = this.nzAudioList[15].split("|");
        // AudioManager.playEffect(audiolist[0]);
        // if (this.node.getChildByName("dh_sk").active == false) this.node.getChildByName("dh_sk").active = true;
        // talksk.playAnimation(audiolist[1], 1);
        this.isqkq = true;
    }

}
