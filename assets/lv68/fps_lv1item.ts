import GameData from "../script/common/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class fps_lvitem extends cc.Component {

    itemId;
    curlv;
    movespeed = 6;
    isrun = false;
    value = 0

    compDragon;
    public onLoad(): void {
        this.isrun = true;
    }
    public init(data: { id?: number, curlv?: number, value?: number, speed?: number }) {
        // this.curlv = data.curlv;
        // this.itemId = data.id;
        // this.value = data.value
        // this.node.getChildByName(data.id.toString()).active = true;
        if (data.speed) this.movespeed = data.speed;
        GameData.PauseGame = false;
        this.compDragon = this.node.getChildByName("sk").getComponent(dragonBones.ArmatureDisplay);
        this.compDragon.armature().animation.gotoAndStopByFrame('jp', 0);
    }


    update(dt: number): void {
        if (GameData.PauseGame == true) return;
        if (!this.isrun) return;
        this.node.x -= this.movespeed;
        if (this.node.x <= -900) {
            this.isrun = false;
            this.node.removeFromParent();
            this.node.destroy();
        }
    }



}
