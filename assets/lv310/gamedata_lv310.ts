
const {ccclass, property} = cc._decorator;

@ccclass
export default class gamedata_lv310 extends cc.Component {

    //游戏配置文件
    gameConfig = {
        1:[
            {name:"1", pos: new cc.Vec2(323, 366), isSlide: false, isTip: true, lab: "红色手印", isClick: true},
            {name:"2", pos: new cc.Vec2(-190, 338), isSlide: false, isTip: true, lab: "墙上的抓痕", isClick: true},
            {name:"3", pos: new cc.Vec2(-219, -460), isSlide: false, isTip: true, lab: "发霉的面包", isClick: true},
            {name:"4", pos: new cc.Vec2(283, -342), isSlide: false, isTip: true, lab: "黑色的水", isClick: true},
            {name:"5", pos: new cc.Vec2(-286, 255), isSlide: false, isTip: true, lab: "男人的影子", isClick: true},
            {name:"6", pos: new cc.Vec2(-110, 94), isSlide: false, isTip: true, lab: "惊恐的表情", isClick: true},
            {name:"7", pos: new cc.Vec2(1, -62), isSlide: false, isTip: true, lab: "身上的麻绳", isClick: true},
            {name:"8", pos: new cc.Vec2(156, 78), isSlide: false, isTip: true, lab: "奸笑的脸", isClick: true},
            {name:"9", pos: new cc.Vec2(182, -104), isSlide: false, isTip: true, lab: "手上的小刀", isClick: true},
            {name:"10", pos: new cc.Vec2(300, -468), isSlide: false, isTip: true, lab: "手机的信息", isClick: true},
            {name:"11", pos: new cc.Vec2(103, 136), isSlide: true, isTip: true, lab: "女孩的脸", isClick: false, isAnimation: true},
            {name:"12", pos: new cc.Vec2(-197, -248), isSlide: false, isTip: true, lab: "巨大蛇尾", isClick: false, isAnimation: false},
        ]
    }

    //图片存储数组
    @property([cc.SpriteFrame])
    sprites: cc.SpriteFrame[] = [];


    


}
