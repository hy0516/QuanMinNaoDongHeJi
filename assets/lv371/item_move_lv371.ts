
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import shj_lv371 from "./shj_lv371";


const { ccclass, property } = cc._decorator;

@ccclass
export default class itme_move_lv371 extends cc.Component {

    /**道具图标 */
    @property(cc.Node)
    icon: cc.Node = null;
 // @property(cc.Integer)
    // type: number = 0;

    /**场景节点 */
    mainNode: cc.Node = null;

    /**目标点 */
    targetNode: cc.Node = null;

    /**翻转状态 */
    stateCreccot : boolean = true;

    /**当前位置 */
    startPositon:cc.Vec3;

   /**原先渲染层级 */
   startIndex = 0;

    /**节点缩放 */
    curScale:number;

    data: any = null;

    /**是否放置正确 */
    isCorrect:boolean = false;

    //双击
    /**双击间隔时间 300ms */
    clickInterval = 300;
    /**上一次点击时间 */
    lastClickTime = 0;
    //目标节点的渲染层级
    targetIndex = 0;

    
    public startPoi: cc.Vec2

    protected onLoad(): void {

        //console.log("---------已加载：",this.node.name,"---------");

        //上调渲染层级
        this.startIndex = this.node.zIndex;
        //console.log(this.node.zIndex);
        
         //console.log(this.mainNode);

         //保存当前缩放值
         this.curScale = this.node.scale;
         this.startPositon = this.node.position;
        

         this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
         this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
         this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      
    }

    /**拼图初始化方法 */
    puzzInof(main:cc.Node){

        this.mainNode = main;

        //获取目标节点
        this.mainNode.getComponent(shj_lv371).getPuzzTargetNode(this.node);
        this.targetIndex = this.targetNode.zIndex;
        //console.log(this.targetNode);

        let ZIndex_1 = Number(this.node.name.slice(0,1));
        

        //设置每个节点的起始渲染层级
        //1或 10~19
        if(ZIndex_1 == 1){
            //1
            if(this.node.name.length == 1){
                
                this.startIndex = 1;
            }
            //10~19
            else{
                let ZIndex_2 = Number(this.node.name.slice(0,2));

                //console.log(ZIndex_2);

                this.startIndex = ZIndex_2;
            }
        }
        //2~9
        else{
            let ZIndex_1 = Number(this.node.name.slice(0,1));

           // console.log(ZIndex_1);

            this.startIndex = ZIndex_1;
        }
    }




    refreshIcon() {
       // this.Bgicon = this.mainNode.getChildByName("icon");
    }

    /**反转拼图 */
    puzzTurn(){

    //播放音效
    //AudioManager.playEffect("button");
    AudioManager.playEffect(AudioManager.common.BUTTON);

     if(this.node.scaleX == -1){
                this.node.scaleX = 1;
            }

            else{
                this.node.scaleX = -1;
            }
            //状态反转
            if(this.stateCreccot){
                this.stateCreccot = false;
            }
            else{
                this.stateCreccot = true;
            }
    }
    /**触摸开始方法 */
    onTouchStart() {
      
        

        this.node.zIndex = 101;
        this.targetNode.zIndex = 100;
        //let name = this.targetNode.name;
        
        let curTime = Date.now();

        //双击检测
        if(curTime - this.lastClickTime < this.clickInterval){

            
            this.puzzTurn();
            
        }

        else{
            this.lastClickTime = curTime;
        }

        // cc.tween(this.node)
        // .to(0.1,{scale:1}).start();
     //   console.log(this.node.scale);

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
        /*if(this.posInof(event)){

            this.targetNode.active = true;
        }

        else{
            //不在提示状态中，则关闭
            if(this.mainNode.getComponent(shj_lv292).tipLock ==false){
                this.targetNode.active = false;
            }   
            
        }*/

        return;

        }
        
    // /**获取对应的目标点 */
    // get_targetNode(){

    //     //获取点集节点
    //     let points = this.mainNode.getChildByName("bg").getChildByName("pointPos").children;
    //     for(let i = 0; i < points.length ; i++){
    //         if(this.node.name == points[i].name){
    //             this.targetNode = points[i];
    //      // /     console.log("thisNode:",this.node.name);
    //           //  console.log("targetNode:",points[i].name);
    //             return;
    //         }
    //     }
    // }
    /**位置重叠判断 */
    posInof(event:cc.Event.EventTouch): boolean{

        


        //在包围盒内
        if(this.targetNode.getBoundingBoxToWorld().contains(event.getLocation()) && this.stateCreccot){

            return true;
        }
        else{

            return false;
        }
    //     //统一世界坐标
    //     let targetPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);

    //     let nodePos = event.getLocation();

    //     this.curPositon = new cc.Vec3(nodePos.x,nodePos.y,0);

    // //    let targetPos = this.targetNode.position;

    // //    let nodePos =this.targetNode.parent.convertToNodeSpaceAR(event.getLocation());
      

        

    //     // console.log("target:",targetPos);
    //     // console.log("ndoe:",nodePos);
    //     // console.log("XX:",targetPos.x - nodePos.x);
    //     // console.log("YY:",targetPos.y - nodePos.y);
    //     if(Math.abs(targetPos.x - nodePos.x) <=50 && Math.abs(targetPos.y - nodePos.y) <=50){
            
    //         return true;
    //     }
    //     else{

    //         return false;
    //     }
    }
    // }
    /**触摸抬起方法 */
    onTouchEnd(event: cc.Event.EventTouch) {
        
        //恢复渲染层级
        this.node.zIndex = this.startIndex;
        this.targetNode.zIndex = this.targetIndex;
        

       
        

        GameData.PauseGame = true;

        //let point = this.targetNode.parent.convertToNodeSpaceAR(event.getLocation());

        
        if(this.posInof(event)){

            let pos = this.targetNode.convertToWorldSpaceAR(this.targetNode.position);

            // 计算两个父节点位置的相对距离（若不在同一个局部，则用世界坐标）
            let offsetX = this.node.parent.x - this.targetNode.parent.x;
            
            let offsetY = this.node.parent.y - this.targetNode.parent.y;

            let Parent = this.node.parent;

            this.node.parent = this.targetNode.parent;
            
            this.node.position = this.targetNode.position;

            //减去偏移距离
            this.node.x -= offsetX;
            this.node.y -= offsetY;

            //移回原来的父节点
            this.node.parent = Parent;
            // let targetWorldPos = this.targetNode.convertToWorldSpaceAR(cc.Vec3.ZERO);
            // let localPos = this.node.parent.convertToNodeSpaceAR(targetWorldPos);
        
            // this.node.position = localPos;


            //关闭监听
            this.ListeningOff();
            GameData.PauseGame = false;

            //拼图完成+1
            this.mainNode.getComponent(shj_lv371).curPuzz_num += 1;

            this.mainNode.getComponent(shj_lv371).updatelv();


            //播放音效
            AudioManager.playEffect("right371");
           
            //关闭闪烁
            this.mainNode.getComponent(shj_lv371).tipLock = false;
            //剔除当前节点
            this.mainNode.getComponent(shj_lv371).tipsGroupFilter(this.node);

            //提示开锁
            this.mainNode.getComponent(shj_lv371).lock_clickDouble = true;


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
