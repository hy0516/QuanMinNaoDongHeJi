
const {ccclass, property} = cc._decorator;

@ccclass
export default class gameData_lv306 extends cc.Component {

    //关卡数据
    lvConfig:{} = {};
    //游戏数据
    gameConfig: {} = {};

    protected onLoad(): void {
        this.lvConfig = {
            1:[
                {name: "1", slotName: "01", index: 0},
                {name: "2", slotName: "02", index: 0},
                {name: "3", slotName: "03", index: 0},
                {name: "4", slotName: "04", index: 0},
                {name: "5", slotName: "05", index: 0},
                {name: "6", slotName: "06", index: 0},
                {name: "7", slotName: "07", index: 0},
                {name: "8", slotName: "08", index: 0},
                {name: "9", slotName: "09", index: 0},
                {name: "10", slotName: "10", index: 0}
            ],
            2:[
                {name: "11", slotName: "11", index: 0},
                {name: "12", slotName: "12", index: 0},
                {name: "13", slotName: "13", index: 0},
                {name: "14", slotName: "14", index: 0},
                {name: "15", slotName: "15", index: 0},
                {name: "16", slotName: "16", index: 0},
                {name: "17", slotName: "17", index: 0},
                {name: "18", slotName: "18", index: 0}
            ],
            3:[
                {name: "19", slotName: "19", index: 0},
                {name: "20", slotName: "20", index: 0},
                {name: "21", slotName: "21", index: 0},
                {name: "22", slotName: "22", index: 0},
                {name: "23", slotName: "23", index: 0},
                {name: "24", slotName: "24", index: 0},
                {name: "25", slotName: "25", index: 0},
                {name: "26", slotName: "26", index: 0},
            ],
            4:[
                {name: "27", slotName: "27", index: 0},
                {name: "28", slotName: "28", index: 0},
                {name: "29", slotName: "29", index: 0},
                {name: "30", slotName: "30", index: 0},
                {name: "31", slotName: "31", index: 0},
                {name: "32", slotName: "32", index: 0},
                {name: "33", slotName: "33", index: 0},
                {name: "34", slotName: "34", index: 0},
            ],
            5:[
                {name: "35", slotName: "35", index: 0},
                {name: "36", slotName: "36", index: 0},
                {name: "37", slotName: "37", index: 0},
                {name: "38", slotName: "38", index: 0},
                {name: "39", slotName: "39", index: 0},
                {name: "40", slotName: "40", index: 0},
                {name: "41", slotName: "41", index: 0},
            ]
        }

        this.gameConfig = {
            1:[
                {value: 10}
            ],
            2:[
                {value: 8}
            ],
            3:[
                {value: 8}
            ],
            4:[
                {value: 8}
            ],
            5:[ 
                {value: 7}
            ]
        }
    }
}
