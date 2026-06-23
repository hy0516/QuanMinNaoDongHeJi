
const {ccclass, property} = cc._decorator;

@ccclass
export default class gamedata_lv315 extends cc.Component {



    //游戏配置文件
    gameConfig = {
        1:[
            {name:"1", pos: new cc.Vec2(238, 506), isSlide: true, isTip: true, lab: "警示牌", isClick: true, isAniamtion: true},
            {name:"2", pos: new cc.Vec2(-31, 106), isSlide: false, isTip: true, lab: "催债信息", isClick: true},
            {name:"3", pos: new cc.Vec2(-138, 436), isSlide: false, isTip: true, lab: "微醺的女友", isClick: true},
            {name:"4", pos: new cc.Vec2(301, -124), isSlide: false, isTip: true, lab: "保险合同", isClick: true},
            {name:"5", pos: new cc.Vec2(-35, -118), isSlide: false, isTip: true, lab: "地上的油渍", isClick: true, isAniamtion: false},
            {name:"6", pos: new cc.Vec2(-306, -618), isSlide: true, isTip: true, lab: "警示胶带", isClick: true, isAniamtion: true},
            {name:"7", pos: new cc.Vec2(125, -580), isSlide: false, isTip: true, lab: "穿着鞋套", isClick: true},
            {name:"8", pos: new cc.Vec2(-248, 116), isSlide: false, isTip: true, lab: "破损栏杆", isClick: true},
            {name:"9", pos: new cc.Vec2(-196, -338), isSlide: false, isTip: true, lab: "地上的酒瓶", isClick: true},
            {name:"10", pos: new cc.Vec2(-10, 461), isSlide: false, isTip: true, lab: "悬崖", isClick: true},
        ]
    }

    //图片存储数组
    @property([cc.SpriteFrame])
    sprites: cc.SpriteFrame[] = [];

    
}
