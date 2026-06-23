const { ccclass, property } = cc._decorator;

export enum WearSlot_lv318 {
    Head,
    Body,
}

@ccclass
export default class WearableItem_lv318 extends cc.Component {
    @property({ type: cc.Enum(WearSlot_lv318), tooltip: "装备部位: Head=头部, Body=身体" })
    wearSlot: WearSlot_lv318 = WearSlot_lv318.Head;

    @property({ tooltip: "装备偏移位置(X,Y)" })
    holdOffset: cc.Vec2 = cc.v2(0, 0);

    @property({ tooltip: "装备角度(度)" })
    holdAngle: number = 0;
}
