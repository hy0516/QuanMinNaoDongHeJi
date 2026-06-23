
const {ccclass, property} = cc._decorator;

@ccclass
export default class gamedata_lv302 extends cc.Component {

    //选中工具图片
    @property([cc.SpriteFrame])
    toolChoseSprite: cc.SpriteFrame[] = [];
    //取消工具图片
    @property([cc.SpriteFrame])
    toolCancelSprite: cc.SpriteFrame[] = [];



    //关卡数据配置文件
    levelCofing: {};

    //工具数据配置文件
    toolCofing: {};


    protected onLoad(): void {
        //初始化关卡配置文件
        this.levelCofing = {
            1:[
                {name: "tuzi",tooth: 1}
            ],
            2:[
                {name:"huli", tooth: 1}
            ],
            3:[
                {name:"zhu", tooth: 1}
            ],
            4:[
                {name:"daxiang", tooth: 1}
            ],
            5:[
                {name: "changjinlu",tooth: 1}
            ]
        }

        //初始化工具数据配置文件
        this.toolCofing = {
            "1": [
                {isClick: false, spriteIndex: 0, waitAnimationName: "daiji2", runAnimationName: "baya2", isSpecial: false}
            ],
            "2": [
                {isClick: false, spriteIndex: 1, waitAnimationName: "daiji1", runAnimationName: "baya1", isSpecial: false}
            ],
            "3": [
                {isClick: false, spriteIndex: 2, waitAnimationName: "daiji4", runAnimationName: "baya4", isSpecial: false}
            ],
            "4": [
                {isClick: false, spriteIndex: 3, waitAnimationName: "daiji3", runAnimationName: "baya3", isSpecial: false}
            ],
            "5": [
                {isClick: false, spriteIndex: 4, waitAnimationName: "daiji5", runAnimationName: "baya5", isSpecial: false}
            ],
            "6": [
                {isClick: false, spriteIndex: 5, waitAnimationName: "daiji6", runAnimationName: "baya6", isSpecial: true}
            ],
        }


    }


}
