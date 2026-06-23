const {ccclass, property} = cc._decorator;

@ccclass
export default class gameData_lv305 extends cc.Component {

    lvConfig = {
        1:[
            {name: "lv1", isRight: false, isLeft: true, musicName: "萝卜"}
        ],
        2:[
            {name: "lv2", isRight: false, isLeft: true, musicName: "米老鼠"}
        ],
        3:[
            {name: "lv3", isRight: true, isLeft: false, musicName: "米老鼠"}
        ],
        4:[
            {name: "lv4", isRight: true, isLeft: false, musicName: "包包"}
        ],
        5:[
            {name: "lv5", isRight: false, isLeft: true, musicName: "猫粮"}
        ],
        6:[
            {name: "lv6", isRight: false, isLeft: true, musicName: "纸巾"}
        ],
        7:[
            {name: "lv7", isRight: false, isLeft: true, musicName: "米老鼠"}
        ]
    }
}
