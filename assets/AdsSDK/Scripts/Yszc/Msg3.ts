// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Ads_Manager from "../Ads_Manager";
import SDK_config from "../SDK_config_newsdk";
import Msg_Base from "./Msg_Base";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Msg3 extends Msg_Base {
    // onLoad () {}
    start() {
        let lab1 = cc.find("bg1/bg2/ScrollView/view/content/desc", this.node).getComponent(cc.Label);
        lab1.string = lab1.string.replace(/深圳乐乐无限科技有限公司/g, SDK_config.companyName);
        lab1.string = lab1.string.replace(/快乐奶茶/g, SDK_config.gameName);


        if (Ads_Manager.Ins.isHuawei() || Ads_Manager.Ins.isRy()) {
            // 假设已经加载拿到lab1文本
            let str: string = lab1.string;
            // 按换行拆分，找到以4.开头的段落，截断
            let arr = str.split('\n');
            let resArr = [];
            for (let s of arr) {
                // 过滤以 4. 开头的整段内容
                if (!s.trim().startsWith('4.')) {
                    resArr.push(s);
                }
            }
            let newStr = resArr.join('\n');
            // newStr就是去掉第四点后的文案，赋值给Label显示
            lab1.string = newStr;
        }


    }
    public close() {

        this.node.active = false;

    }

    // update (dt) {}
}
