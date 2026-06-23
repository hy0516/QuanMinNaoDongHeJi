
const { ccclass, property } = cc._decorator;

@ccclass
export default class gameData_lv364 extends cc.Component {

    //关卡数据
    lvConfig: {} = {};
    //游戏数据
    gameConfig: {} = {};

    protected onLoad(): void {
        this.lvConfig = {
            1: [
                { name: "4", slotName: "04", index: 0 },
                { name: "5", slotName: "05", index: 0 },
                { name: "6", slotName: "06", index: 0 },
                { name: "7", slotName: "07", index: 0 },
                { name: "8", slotName: "08", index: 0 },
                { name: "9", slotName: "09", index: 0 },
                { name: "10", slotName: "10", index: 0 },
                { name: "11", slotName: "11", index: 0 },
                { name: "12", slotName: "12", index: 0 },
                { name: "13", slotName: "13", index: 0 },
                { name: "14", slotName: "14", index: 0 },
                { name: "15", slotName: "15", index: 0 },
                { name: "16", slotName: "16", index: 0 },
            ],
            2: [
                { name: "33", slotName: "33", index: 0 },
                { name: "34", slotName: "34", index: 0 },
                { name: "35", slotName: "35", index: 0 },
                { name: "36", slotName: "36", index: 0 },
                { name: "37", slotName: "37", index: 0 },
                { name: "38", slotName: "38", index: 0 },
                { name: "39", slotName: "39", index: 0 },
                { name: "40", slotName: "40", index: 0 },
                { name: "41", slotName: "41", index: 0 },
                { name: "42", slotName: "42", index: 0 },
                { name: "43", slotName: "43", index: 0 },
                { name: "44", slotName: "44", index: 0 },
                { name: "45", slotName: "45", index: 0 },
                { name: "46", slotName: "46", index: 0 },
                { name: "47", slotName: "47", index: 0 },
                { name: "48", slotName: "48", index: 0 },
                { name: "49", slotName: "49", index: 0 },
                { name: "50", slotName: "50", index: 0 },
            ],
            3: [
                { name: "72", slotName: "72", index: 0 },
                { name: "73", slotName: "73", index: 0 },
                { name: "74", slotName: "74", index: 0 },
                { name: "75", slotName: "75", index: 0 },
                { name: "76", slotName: "76", index: 0 },
                { name: "77", slotName: "77", index: 0 },
                { name: "78", slotName: "78", index: 0 },
                { name: "79", slotName: "79", index: 0 },
                { name: "80", slotName: "80", index: 0 },
                { name: "81", slotName: "81", index: 0 },
                { name: "82", slotName: "82", index: 0 },
                { name: "83", slotName: "83", index: 0 },
                { name: "84", slotName: "84", index: 0 },
                { name: "85", slotName: "85", index: 0 },
            ],
            4: [
                { name: "103", slotName: "103", index: 0 },
                { name: "105", slotName: "105", index: 0 },
                { name: "106", slotName: "106", index: 0 },
                { name: "107", slotName: "107", index: 0 },
                { name: "108", slotName: "108", index: 0 },
                { name: "109", slotName: "109", index: 0 },
                { name: "110", slotName: "110", index: 0 },
                { name: "111", slotName: "111", index: 0 },
                { name: "112", slotName: "112", index: 0 },
            ],

        }

        this.gameConfig = {
            1: [
                { value: 13 }
            ],
            2: [
                { value: 18 }
            ],
            3: [
                { value: 14 }
            ],
            4: [
                { value: 9 }
            ],
            5: [
                { value: 7 }
            ]
        }
    }
}
