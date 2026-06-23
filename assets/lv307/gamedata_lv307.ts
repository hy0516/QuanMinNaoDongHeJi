
const {ccclass, property} = cc._decorator;

@ccclass
export default class gamedata_lv307 extends cc.Component {

    //游戏配置文件
    gameConfig = {
        1:[
            {name:"1", pos: new cc.Vec2(-37, 555), isSlide: false, isTip: true, lab: "摇晃的吊灯", isClick: true},
            {name:"2", pos: new cc.Vec2(-232, 563), isSlide: false, isTip: true, lab: "SOS字样", isClick: true},
            {name:"3", pos: new cc.Vec2(308, -230), isSlide: false, isTip: true, lab: "地上的裂痕", isClick: true},
            {name:"4", pos: new cc.Vec2(-126, 283), isSlide: false, isTip: true, lab: "红眼黑猫", isClick: true},
            {name:"5", pos: new cc.Vec2(-360, 154), isSlide: false, isTip: true, lab: "火焰", isClick: true},
            {name:"6", pos: new cc.Vec2(191, -508), isSlide: false, isTip: true, lab: "烧焦的裙摆", isClick: true},
            {name:"7", pos: new cc.Vec2(-22, -344), isSlide: false, isTip: true, lab: "疤痕", isClick: true},
            {name:"8", pos: new cc.Vec2(-1, 123), isSlide: false, isTip: true, lab: "身上的血迹", isClick: true},
            {name:"9", pos: new cc.Vec2(22, -628), isSlide: false, isTip: true, lab: "扭曲的脚", isClick: true},
            {name:"10", pos: new cc.Vec2(-180, 24), isSlide: false, isTip: true, lab: "胸前的白花", isClick: true},
            {name:"11", pos: new cc.Vec2(-323, -111), isSlide: false, isTip: true, lab: "惨白的手", isClick: true},
            {name:"12", pos: new cc.Vec2(-257, -598), isSlide: true, isTip: true, lab: "奇怪的腿", isClick: true, isAnimation: true},
        ]
    }

    //图片存储数组
    @property([cc.SpriteFrame])
    sprites: cc.SpriteFrame[] = [];


    


}
