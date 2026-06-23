
const {ccclass, property} = cc._decorator;

@ccclass
export default class gamedata_lv312 extends cc.Component {



    //游戏配置文件
    gameConfig = {
        1:[
            {name:"1", pos: new cc.Vec2(-45, 290), isSlide: false, isTip: true, lab: "镜中人影", isClick: true},
            {name:"2", pos: new cc.Vec2(111, -134), isSlide: false, isTip: true, lab: "皮革理发椅", isClick: true},
            {name:"3", pos: new cc.Vec2(-233, 525), isSlide: false, isTip: true, lab: "无电转灯", isClick: true},
            {name:"4", pos: new cc.Vec2(273, 489), isSlide: false, isTip: true, lab: "褪色的海报", isClick: true},
            {name:"5", pos: new cc.Vec2(-240, -404), isSlide: true, isTip: true, lab: "垃圾桶", isClick: true, isAniamtion: true},
            {name:"6", pos: new cc.Vec2(198, 369), isSlide: true, isTip: true, lab: "怪异的眼睛", isClick: true, isAniamtion: true},
            {name:"7", pos: new cc.Vec2(-323, 33), isSlide: false, isTip: true, lab: "变质的发油", isClick: true},
            {name:"8", pos: new cc.Vec2(-323, 324), isSlide: false, isTip: true, lab: "蠕动的假发", isClick: true},
            {name:"9", pos: new cc.Vec2(73, 113), isSlide: false, isTip: true, lab: "莫名的指痕", isClick: true},
            {name:"10", pos: new cc.Vec2(0, 684), isSlide: false, isTip: true, lab: "流血的字", isClick: true},
        ]
    }

    //图片存储数组
    @property([cc.SpriteFrame])
    sprites: cc.SpriteFrame[] = [];

    
}
