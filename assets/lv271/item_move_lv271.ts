
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import shj_lv271 from "./shj_lv271";


const { ccclass, property } = cc._decorator;

@ccclass
export default class itme_move_lv271 extends cc.Component {

    /**道具图标 */
    @property(cc.Node)
    icon: cc.Node = null;
    /**场景节点 */
    mainNode: cc.Node = null;

    /**目标点 */
    targetNode: cc.Node = null;

    /**翻转状态 */
    stateCreccot : boolean = true;

    /**当前位置 */
    startPositon:cc.Vec3;

    data: any = null;

    /**是否放置正确 */
    isCorrect:boolean = false;

    //双击
    /**双击间隔时间 300ms */
    clickInterval = 300;
    /**上一次点击时间 */
    lastClickTime = 0;

    
    public startPoi: cc.Vec2


   
    protected onLoad(): void {
         //保存当前缩放值
         this.startPositon = this.node.position;
         this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
         this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
         this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
         this.stateCreccot = this.node.scaleX > 0;

    }

    /**拼图初始化方法 */
    puzzInof(main:cc.Node){
        this.mainNode = main;
        //获取目标节点
        this.mainNode.getComponent(shj_lv271).getPuzzTargetNode(this.node);
    }




    refreshIcon() {
       // this.Bgicon = this.mainNode.getChildByName("icon");
    }

    /**反转拼图 */
    puzzTurn(){
    //播放音效
    //AudioManager.playEffect("button");
    AudioManager.playEffect(AudioManager.common.BUTTON);
    this.node.scaleX *= -1;
    this.stateCreccot = !this.stateCreccot;
    }
    /**触摸开始方法 */
    onTouchStart() {
        // 停止闪烁提示
        if (this.mainNode) {
            this.mainNode.getComponent(shj_lv271).stopTipEffect();
        }
        
        let curTime = Date.now();
        //双击检测
        if(curTime-this.lastClickTime < this.clickInterval){
            this.puzzTurn();
        }
        else{
            this.lastClickTime = curTime;
        }
    }
    /**鼠标移动方法 */
    onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) {
            return
        }
        let vec2 = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        this.node.position = new cc.Vec3(vec2.x,vec2.y,0);

        let isInTargetPosition = this.posInof(event);

        if (isInTargetPosition) {
            // 在目标位置，显示提示
            this.targetNode.active = true;
        } else {
            // 不在目标位置，隐藏提示（无论是否在提示状态）
            this.targetNode.active = false;
        }
        return;
        }
    /**位置重叠判断 */
    posInof(event:cc.Event.EventTouch): boolean{
        //在包围盒内
        if(this.targetNode.getBoundingBoxToWorld().contains(event.getLocation()) && this.stateCreccot){

            return true;
        }
        else{
            return false;
        }
    }
    /**触摸抬起方法 */
    onTouchEnd(event: cc.Event.EventTouch) {
        GameData.PauseGame = true;
        if(this.posInof(event)){
             //关闭监听
             this.ListeningOff();
             GameData.PauseGame = false;
            //播放音效
            AudioManager.playEffect("right271");
            this.node.active=false;
            this.targetNode.active=true;
            this.targetNode.opacity=255;
            
            // 检查是否还有剩余的拼图块
            const puzzParent = this.node.parent; // puzz 节点
            if (puzzParent) {
                let hasRemainingPuzz = false;
                for (let i = 0; i < puzzParent.children.length; i++) {
                    const child = puzzParent.children[i];
                    // 检查是否有其他 active 的拼图块（排除当前节点）
                    if (child !== this.node && child.active) {
                        hasRemainingPuzz = true;
                        break;
                    }
                }
                
                // 如果没有剩余的拼图块，游戏成功
                if (!hasRemainingPuzz && this.mainNode) {
                    const mainScript = this.mainNode.getComponent(shj_lv271);
                    if (mainScript) {
                        const puzzNode = this.node.parent.parent; 
                        const puzzNodeName = puzzNode ? puzzNode.name : "";
                        let audioName = "";
                        switch (puzzNodeName) {
                            case "cjlNode":
                                audioName = "长颈鹿lv271";
                                break;
                            case "dxNode":
                                audioName = "大象lv271";
                                break;
                            case "xmNode":
                                audioName = "熊猫lv271";
                                break;
                            case "hlNode":
                                audioName = "狐狸lv271";
                                break;
                            default:
                                // 如果没有匹配到，直接调用onwin
                                mainScript.onwin();
                                return;
                        }
                        
                        // 播放音效，音效播放完成后再确认游戏成功
                        AudioManager.playEffect(audioName, false, () => {
                            mainScript.onwin();
                        });
                    }
                }
            }
            this.node.destroy();
        }

        else{
            cc.tween(this.node)
            .to(0.3,{position:this.startPositon})
            .call(()=>{
                GameData.PauseGame = false;
            })
            .start();
        }
      
        
    }


    /**关闭节点监听 */
    ListeningOff(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
}
