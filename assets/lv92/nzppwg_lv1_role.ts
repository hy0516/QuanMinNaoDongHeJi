
import AudioManager from "../script/common/AudioManager";
import tipsPanel from "../script/zc/tipsPanel";



const { ccclass, property } = cc._decorator;


@ccclass
export default class nzppwg_lv1_role extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;
    state=0;//0是没有 1是匹配成功
    protected onLoad(): void {
       
    }
   

}

