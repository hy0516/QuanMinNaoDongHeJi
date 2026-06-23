
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameData_lv319 extends cc.Component {


    //音乐文本数据
    musicConfig = {
        0:{lab: "怪物可能伪装成基地的人，仔细检查，保障基地安全"},
        1:{lab: "哥哥，妈妈让我来帮她拿点东西", leftLab: "太简单了",  rightLab: "当然会了", musicLab: "哥哥，妈妈让我来帮她拿点东西", endLab: "女-你是怎么发现我的？"},
        2:{lab: "我才不是伪装怪", leftLab: "我的打字速度极快",  rightLab: "打字我可是专业的", musicLab: "打字员-我才不是伪装怪", endLab: "女-你是怎么发现我的？"},
        3:{lab: "我才不是伪装怪", leftLab: "太香了……还有吗...",  rightLab: "我掌握多种菜系的烹饪技艺", musicLab: "厨师-我才不是伪装怪", endLab: "女-你是怎么发现我的？"},
        4:{lab: "我是专业医护人员，需要立即进入", leftLab: "我绑得不错吧",  rightLab: "包扎绷带我很拿手", musicLab: "我是专业医护人员，需要立即进入", endLab: "女-你是怎么发现我的？"},
        5:{lab: "我才不是伪装怪", leftLab: "这是大葱，我家也种有",  rightLab: "这是甘蔗吗", musicLab: "农民-我才不是伪装怪", endLab: "女-你是怎么发现我的？"},
        6:{lab: "我才不是伪装怪", leftLab: "进入戒备状态",  rightLab: "进入戒备状态", musicLab: "守卫-我才不是伪装怪", endLab: "男-你是怎么发现我的？"},
        7:{lab: "我才不是伪装怪", leftLab: "这些是我拾得的废旧物品",  rightLab: "这些是我拾得的废旧物品", musicLab: "拾荒者-我才不是伪装怪", endLab: "女-你是怎么发现我的？"},
        8:{lab: "我才不是伪装怪", leftLab: "立刻删除！否则律师函警告！",  rightLab: "那肯定了", musicLab: "明星-我才不是伪装怪", endLab: "女-你是怎么发现我的？"},
        9:{lab: "你的检查到底是怎么做的？基地混进了伪装者，损失惨重！"},

    }

    //主角数据
    playerConfig = {
        1:{lab: "学生一定会系红领巾吧"},
        2:{lab: "作为一名打字员，一定很擅长打字吧"},
        3:{lab: ""},
        4:{lab: ""},
        5:{lab: "既然是农民，肯定认识这个"},
        6:{lab: ""},
        7:{lab: ""},
        8:{lab: "作为明星，镜头感肯定很强吧"},
    }


    //关卡数据
    levelConfig = {
        1: {isRight: true, isLeft: false, startSkeName: "xh_dj", gwSkeName: "xh_dj3", zrSkeName: "xh_dj2", endGwSkeName: "xh_dui2",
            endZrSkeName: "xh_cuo2", xzGwName: "xh_dui", xzZrName: "xh_cuo", isTisp: false, isyw: true},
        2: {isRight: true, isLeft: false, startSkeName: "dzy_dj", gwSkeName: "dzy_dj3", zrSkeName: "dzy_dj2", endGwSkeName: "dzy_dui2",
            endZrSkeName: "dzy_cuo2", xzGwName: "dzy_dui", xzZrName: "dzy_cuo", isBz: true, isTisp: false, isyw: false},
        3: {isRight: false, isLeft: true, startSkeName: "cs_dj", gwSkeName: "cs_dj2", zrSkeName: "cs_dj", endGwSkeName: "cs_dui2",
            endZrSkeName: "cs_cuo2", xzGwName: "cs_dui", xzZrName: "cs_cuo", isBz: true, isTisp: false, isyw: true},
        4: {isRight: false, isLeft: true, startSkeName: "hs_dj", gwSkeName: "hs_dj3", zrSkeName: "hs_dj2", endGwSkeName: "hs_dui2",
            endZrSkeName: "hs_cuo2", xzGwName: "hs_dui", xzZrName: "hs_cuo", isBz: true, isTisp: false, isyw: true},
        5: {isRight: true, isLeft: false, startSkeName: "nm_dj", gwSkeName: "nm_dj2", zrSkeName: "nm_dj", endGwSkeName: "nm_dui2",
            endZrSkeName: "nm_cuo2", xzGwName: "nm_dui", xzZrName: "nm_cuo", isBz: true, isTisp: false, isyw: false},
        6: {isRight: true, isLeft: false, startSkeName: "sb_dj", gwSkeName: "sb_dui", zrSkeName: "sb_dj2", endGwSkeName: "sb_dui2",
            endZrSkeName: "sb_cuo2", xzGwName: "sb_dui", xzZrName: "sb_cuo", isBz: true, isTisp: false, isyw: false},
        7: {isRight: true, isLeft: false, startSkeName: "lr_dj", gwSkeName: "lr_dj", zrSkeName: "lr_dj", endGwSkeName: "lr_dui2",
            endZrSkeName: "lr_cuo2", xzGwName: "lr_dui", xzZrName: "lr_cuo", isBz: true, isTisp: false, isyw: false},
        8: {isRight: true, isLeft: false, startSkeName: "mx_dj", gwSkeName: "mx_dj3", zrSkeName: "mx_dj2", endGwSkeName: "mx_dui2",
            endZrSkeName: "mx_cuo2", xzGwName: "mx_dui", xzZrName: "mx_cuo", isBz: false, isTisp: false, isyw: false},
        
        
    }

    tispLab = {
        1: {lab: "拖动红领巾"},
        2: {lab: "拖动键盘"},
        3: {lab: "拖动菜板"},
        4: {lab: "拖动绷带"},
        5: {lab: "拖动大葱"},
        6: {lab: "长按警报铃"},
        7: {lab: "下划麻袋"},
        8: {lab: "上划窗户拖动相机"}

    }
    

    @property([cc.SpriteFrame])
    sprite: cc.SpriteFrame[] = [];


}
