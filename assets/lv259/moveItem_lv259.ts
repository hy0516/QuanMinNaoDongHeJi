import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import zjmgr_lv259 from "./zjmgr_lv259";


const { ccclass, property } = cc._decorator;

@ccclass
export default class moveItem_lv254 extends cc.Component {

    @property(cc.Integer)
    type: number = 1;

   

    @property(cc.Node)
    main: cc.Node = null;

    @property(cc.Integer)
    touchScale:number = 1;


    @property(cc.Boolean)
    hasTouchPic:boolean = false;

    @property({
        type:cc.SpriteFrame,
        visible(){
            return this.hasTouchPic;
        }

    })
    touchPic:cc.SpriteFrame = null;
    startPic:cc.SpriteFrame;

    /**道具已被使用 */
    isUse = false;
    startPoi: cc.Vec2 = null;

    startScale; // 起始缩放
    defzIndex:number;

    defSiblingIndex;
    // @property(cc.Integer)
    // isChangeIndex: number = 0;


    protected onLoad(): void {
        this.startPoi = this.node.getPosition();
        this.enabled = false;

        this.startScale = this.node.scale;

        this.defzIndex=this.node.zIndex;

        if(this.hasTouchPic && this.node.children[0])this.startPic = this.node.children[0].getComponent(cc.Sprite).spriteFrame;

        this.defSiblingIndex=this.node.getSiblingIndex();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    oninit() {
        // var but = this.node.getComponent(cc.Button);
        // if (but) but.enabled = false;
    }
    onTouchStart(even: cc.Event.EventTouch) {
        if(GameData.PauseGame)return;
        // if (this.isChangeIndex == 0)
        this.node.zIndex = 1000;
        this.node.setSiblingIndex(this.node.parent.children.length - 1);
        this.node.scale = this.startScale * this.touchScale;

        if(this.touchPic){
            this.node.children[0].getComponent(cc.Sprite).spriteFrame = this.touchPic;
            
        } 
    }
    onTouchMove(even: cc.Event.EventTouch) {
        if(GameData.PauseGame)return;
        
      
      
            var delay = even.getDelta();
            this.node.x += delay.x;
            this.node.y += delay.y;
        
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        if(GameData.PauseGame)return;

        this.node.scale = this.startScale;

        if (this.main) this.main.getComponent(zjmgr_lv259).itmeMoveHandler(this.type,even);
 

    }
    restart() {
        this.node.setPosition(this.startPoi);
        this.node.zIndex=this.defzIndex;
        this.node.setSiblingIndex(this.defSiblingIndex);

        if(this.startPic) this.node.children[0].getComponent(cc.Sprite).spriteFrame = this.startPic;
        
        
        
    }
    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
