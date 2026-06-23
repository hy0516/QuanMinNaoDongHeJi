

const {ccclass, property} = cc._decorator;

@ccclass
export default class gameConfig_lv317 extends cc.Component {


    //图片存储
    @property([cc.SpriteFrame])
    sprites: cc.SpriteFrame[] = [];


    gameConfig = {
        
    }

    ziIndex = {
        1: {index: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], isPlay: false, py: "yíng", name: "赢"},
        2: {index: [1, 2, 3], isPlay: false, py: "wàng", isSprite: false, name: "亡"},
        3: {index: [4, 5, 6, 7], isPlay: false, py: "kǒu", isSprite: false, name: "口"},
        4: {index: [8, 9, 10, 11, 12], isPlay: false, py: "yuè", isSprite: false, name: "月"},
        5: {index: [13, 14, 15, 16, 17], isPlay: false, py: "bèi", isSprite: false, name: "贝"},
        6: {index: [18, 19, 20, 21], isPlay: false, py: "fán", isSprite: false, name: "凡"},
        7: {index: [16, 17], isPlay: false, py: "rén", isSprite: false, name: "人"},
        8: {index: [18, 20], isPlay: false, py: "ér", isSprite: false, name: "儿"},
        9: {index: [18, 19, 20], isPlay: false, py: "jī", isSprite: false, name: "几"},
        10: {index: [4, 5, 6, 7, 13, 14, 15, 16, 17], isPlay: false, py: "yuán", isSprite: false, name: "员"},
        11: {index: [2, 3, 5, 7, 9, 11, 12, 14, 19], isPlay: false, py: "yī", isSprite: true, name: "一"},
        12: {index: [4, 6, 13, 15], isPlay: false, py: "gǔn", isSprite: true, name: "丨"},
        13: {index: [4, 5, 7], isPlay: false, py: "fāng", isSprite: false, name: "匚"},
        14: {index: [19, 20], isPlay: false, py: "yǐ", isSprite: false, name: "乙"},
        15: [
            {index: [5, 7], isPlay: false, py: "èr", isSprite: false, name: "二"},
            {index: [11, 12], isPlay: false, py: "èr", isSprite: false, name: "二"},
            {index: [2, 5], isPlay: false, py: "èr", isSprite: false, name: "二"},
            {index: [2, 7], isPlay: false, py: "èr", isSprite: false, name: "二"},
            {index: [9, 11], isPlay: false, py: "èr", isSprite: false, name: "二"},
            {index: [9, 12], isPlay: false, py: "èr", isSprite: false, name: "二"},
        ],
        16: [
            {index: [2, 5, 7], isPlay: false, py: "sān", isSprite: false, name: "三"},
            {index: [9, 11, 12], isPlay: false, py: "sān", isSprite: false, name: "三"},

        ],
        17: {index: [1, 2, 3, 4, 5, 6, 7], isPlay: false, py: "máng", isSprite: false, name: "吂"},
        
        
        

    }

}
