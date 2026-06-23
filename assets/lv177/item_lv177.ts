import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import nwddy_lv165 from "./nwddy_lv174";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item_lv174 extends cc.Component {
    main: nwddy_lv165
    isduyao = false;
    curindex = 0;
    index = 0;
    start() {
        this.curindex = this.getRandomNumber(10);
        this.node.getChildByName(this.curindex.toString()).active = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    }
    initmain(main: nwddy_lv165, index: number) {
        this.main = main;
        this.index = index;
    }
    onTouchStart(e: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);

        //选到毒药
        if (this.main.seleduyao) {
            this.isduyao = true;
            this.main.seleduyao = false;
            this.node.getChildByName(this.curindex.toString()).children[0].active = true;
          //  this.main.xitongseleGold();
        } else if (!this.main.startgame) {
            return
        } else {
            //this.main.seleItem(this.node);
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        }
    }

    onSeleHandler() {
        this.node.getChildByName(this.curindex.toString()).active = false;
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    private getRandomNumber(count: number): number {
        return Math.floor(Math.random() * count) + 1;
    }
    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    // update (dt) {}
}
