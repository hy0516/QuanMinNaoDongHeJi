import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import zjwn_lv189 from "./zjwn_lv189";


const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItems_lv189 extends cc.Component {

    // @property(cc.Integer)
    // type: number = 1;

    // @property (cc.Integer)
    // nodeScale:number = 1;

    @property (cc.Integer)
    Scale:number = 1.2;

    @property(cc.Node)
    main: cc.Node = null;

    startPoi: cc.Vec2 = null;


    /**杯子 */
    @property(cc.Node)
    cup:cc.Node = null;
    // @property(cc.SpriteFrame)
    // weightScalePic:cc.SpriteFrame=null;

    /**保存体重秤原先图片 */
   // oldPic : cc.SpriteFrame;

    // @property(cc.Integer)
    // isChangeIndex: number = 0;

    /** */
    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);


        
    }

    /**杯子状态切换 */
    cupSwitch(num){
        let cup_1 = this.cup.getChildByName("cup_1");
        let cup_2 = this.cup.getChildByName("cup_2");  //空杯子
        switch(num){
            //空杯显示
            case 1:
                cup_1.active = false;
                cup_2.active = true;
                break;
            //吸管杯子
            case 2:
                cup_1.active = true;
                cup_2.active = false;
                break;
        }
    }
    
    oninit() {
        // var but = this.node.getComponent(cc.Button);
        // if (but) but.enabled = false;
    }
    onTouchStart(even: cc.Event.EventTouch) {
        // if (this.isChangeIndex == 0)
        if(GameData.PauseGame)return

     
        this.node.getComponent(cc.Sprite).enabled = true;
        //空杯显示
        this.cupSwitch(1);
        





        this.node.zIndex = 100;
        this.node.setScale(this.Scale);
    }
    onTouchMove(even: cc.Event.EventTouch) {
        if(GameData.PauseGame)return
        
        var delay = even.getDelta();
        this.node.x += delay.x;
        this.node.y += delay.y;
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        if(GameData.PauseGame)return

        this.main.getComponent(zjwn_lv189).moveHandler(1,this.node,even,()=>{})


    }
    /**道具复原 */
    restart() {
        this.node.setPosition(this.startPoi);
       // this.node.setScale(this.nodeScale);

        this.node.getComponent(cc.Sprite).enabled = false;
        //吸管杯子
        this.cupSwitch(2);


       


    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
