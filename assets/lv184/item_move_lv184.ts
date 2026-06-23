
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import shj_lv184 from "./shj_lv184";


const { ccclass, property } = cc._decorator;
@ccclass
export default class itme_move_lv184 extends cc.Component {


    @property(cc.Integer)
    type: number = 0;

    /**场景节点 */
    mainNode: cc.Node = null;
    levelComp: shj_lv184 = null;

    /**目标点 */
    targetNode: cc.Node = null;

    /**翻转状态 */
    stateCreccot : boolean = true;

    /**当前位置 */
    startPositon:cc.Vec3;
    /**角色初始位置，复活时使用 */
    originalPosition: cc.Vec3;

    /**长按计时器 */
    longPassTimer;

    //长按时间
    longPressThreshold = 1000; //2秒

   /**原先渲染层级 */
   startIndex = 0;

    /**节点缩放 */
    startScale:number;

    data: any = null;

    /**角色状态是否正确 */
    isRightState = true;

    /**中间状态 */
    middleState = false;

    stateLock = true;

    /**是否躲藏正确 */
    isCorrect:boolean = true;

    /**是否放置 */
    isPut = false;



    //放置区域数组
    putAeraList:cc.Node[] = []; 


    /**角色当前位于区域 */
    curArea:cc.Node = null;

    /**偏移范围 */
    offsetX = 20;
  
    //双击
    /**双击间隔时间 300ms */
    clickInterval = 300;
    /**上一次点击时间 */
    lastClickTime = 0;

    /**lv2 旋转倾斜状态 0/50 */
    rotationTilt = false;
    /**lv2 单击待处理 */
    pendingSingleClick = false;
    /**lv2 双击已处理，取消单击 */
    singleClickCancelled = false;
    /**触摸起点 */
    startTouchPos: cc.Vec2 = null;
    /**本次触摸是否发生过拖拽，用于区分点击与松手 */
    hasDragged = false;

    public startPoi: cc.Vec2;

    /**
     * type 含义（仅按 type 控制，与关卡无关）：
     * 1x(11,12,13): 仅偏移，无状态要求
     * 21: 双击旋转 0↔50°，通过=rotationTilt
     * 22: 单击动画 1↔3，通过=动画尾号3
     * 34: 长按 1s 动画尾号↔3，通过=动画尾号3
     */

    

    protected onLoad(): void {

        //console.log("---------已加载：",this.node.name,"---------");



         //保存当前缩放值
         this.startScale = this.node.scale;
         this.startPositon = this.node.position.clone();
         this.originalPosition = this.node.position.clone();
         //保存当前渲染层级
         this.startIndex = this.node.zIndex;

         this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
         this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
         this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

         //角色初始化
         this.roleInof();
      
    }

    /**初始化方法 */
    Inof(mian:cc.Node){

        this.mainNode = mian;
        this.levelComp = this.mainNode.getComponent(shj_lv184);
        this.putAeraList = this.levelComp.putAeraList;
    }

    /**角色状态初始化 */
    roleInof(){
        this.isRightState = Math.floor(this.type / 10) == 1;
    }

    /** 复活时恢复角色：位置、缩放、角度、动画、状态 */
    resetForFuhuo() {
        cc.Tween.stopAllByTarget(this.node);
        this.node.position = this.originalPosition.clone();
        this.startPositon = this.originalPosition.clone();
        this.node.scale = this.startScale;
        this.node.angle = 0;
        this.node.zIndex = this.startIndex;
        const ske = this.node.getComponent(dragonBones.ArmatureDisplay);
        if (ske) {
            const cur = ske.animationName || "daiji1";
            ske.playAnimation(cur.slice(0, -1) + "1", -1);
        }
        this.isPut = false;
        this.curArea = null;
        this.isCorrect = true;
        this.roleInof();
        this.middleState = false;
        this.stateLock = true;
        this.rotationTilt = false;
        this.pendingSingleClick = false;
        this.singleClickCancelled = false;
        this.lastClickTime = 0;
        this.startTouchPos = null;
        this.hasDragged = false;
        if (this.longPassTimer) {
            clearTimeout(this.longPassTimer);
            this.longPassTimer = null;
        }
    }


    /**lv2 单击切换姿势：动画结尾 1<->3 */
    poseToggleLv2() {
        const ske = this.node.getComponent(dragonBones.ArmatureDisplay);
        const cur = ske.animationName || "daiji1";
        const base = cur.slice(0, -1);
        const last = cur[cur.length - 1];
        const newSuffix = last === "1" ? "3" : last === "3" ? "1" : "1";
        ske.playAnimation(base + newSuffix, -1);
        AudioManager.playEffect("button");
    }

    /**lv3 长按切换姿势：动画尾号↔3 */
    poseToggleLv3LongPress() {
        const ske = this.node.getComponent(dragonBones.ArmatureDisplay);
        const cur = ske.animationName || "daiji1";
        const base = cur.slice(0, -1);
        const last = cur[cur.length - 1];
        const newSuffix = last === "3" ? "1" : "3";
        ske.playAnimation(base + newSuffix, -1);
        AudioManager.playEffect("button");
    }

    /**触摸开始方法 */
    onTouchStart(event?: cc.Event.EventTouch) {

        if(GameData.PauseGame) return;
      
        if(!this.isPut )this.node.zIndex = 101;

        let curTime = Date.now();

        //双击检测
        if (curTime - this.lastClickTime < this.clickInterval && this.type !== 34) {
            if (this.type === 21) {
                this.singleClickCancelled = true;
                this.rotationTilt = !this.rotationTilt;
                this.node.angle = this.rotationTilt ? 50 : 0;
                AudioManager.playEffect("button");
            } else if (this.type === 22) {
                this.singleClickCancelled = true;
            }
        }

        else{
            this.lastClickTime = curTime;
            this.singleClickCancelled = false;
            this.hasDragged = false;
            if (this.type === 22 && event) this.startTouchPos = event.getLocation();
        }
        

        //长按检测
        if (this.type === 34) {
            this.longPassTimer = setTimeout(() => {
                if (!this.hasDragged) this.poseToggleLv3LongPress();
                this.longPassTimer = null;
            }, this.longPressThreshold);
        }
        
        //保存上一次位置坐标
        if(this.isPut) this.startPositon = this.node.position.clone();

    }
    

    /**鼠标移动方法 */
    onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) {
            return;
        }
        this.hasDragged = true;

        let vec2 = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        this.node.position = new cc.Vec3(vec2.x, vec2.y, 0);
    }


    /**获取区域状态 */
    getAeraState(num){
        return [this.levelComp.a1_isNull, this.levelComp.a2_isNull, this.levelComp.a3_isNull][num];
    }



    /**放置判断，返回 { valid, targetAreaIndex?, swapRole? } */
    putInof(event: cc.Event.EventTouch): { valid: boolean; targetAreaIndex?: number; swapRole?: itme_move_lv184 } {
        for (let i = 0; i < this.putAeraList.length; i++) {
            const aera = this.putAeraList[i];
            const curAeraState = this.getAeraState(i);

            if (aera.getBoundingBoxToWorld().contains(event.getLocation())) {
                if (curAeraState) {
                    this.curArea = aera;
                    return { valid: true, targetAreaIndex: i };
                }
                if (this.curArea === aera) return { valid: true, targetAreaIndex: i };
                if (this.curArea) {
                    const swapRole = this.findRoleInArea(aera);
                    if (swapRole) return { valid: true, targetAreaIndex: i, swapRole };
                }
                return { valid: false };
            }

            if (i === this.putAeraList.length - 1) return { valid: false };
        }
        return { valid: false };
    }

    /** 查找占据某区域的另一角色（排除自己） */
    findRoleInArea(aera: cc.Node): itme_move_lv184 | null {
        const box = aera.getBoundingBox();
        for (let j = 0; j < this.levelComp.roleArry.length; j++) {
            const role = this.levelComp.roleArry[j];
            if (role === this.node) continue;
            const comp = role.getComponent(itme_move_lv184);
            if (!comp || !comp.isPut) continue;
            const rolePos = role.parent === aera.parent
                ? cc.v2(role.position.x, role.position.y)
                : cc.v2(aera.parent.convertToNodeSpaceAR(role.parent.convertToWorldSpaceAR(role.position)));
            if (box.contains(rolePos)) return comp;
        }
        return null;
    }
    // }
    /**触摸抬起方法 */
    onTouchEnd(event: cc.Event.EventTouch) {

        if(GameData.PauseGame) return;
        if (!this.levelComp) return;

        this.node.zIndex = -1;

        if (this.type === 34) {
            if (this.longPassTimer) {
                clearTimeout(this.longPassTimer);
                this.longPassTimer = null;
            }
        }
        
        
        const putResult = this.putInof(event);

        if (putResult.valid) {
            this.isPut = true;
            const targetIdx = putResult.targetAreaIndex;
            const pt = this.levelComp.pointList[targetIdx];
            const posX = this.node.parent.convertToNodeSpaceAR(event.getLocation()).x;
            const pos = new cc.Vec3(posX, pt.position.y, 0);

            if (putResult.swapRole) {
                const other = putResult.swapRole;
                const myOldIdx = this.putAeraList.indexOf(this.curArea);
                const otherTargetPt = this.levelComp.pointList[myOldIdx];
                this.curArea = this.putAeraList[targetIdx];
                other.curArea = this.putAeraList[myOldIdx];
                other.startPositon = otherTargetPt.position.clone();
                this.node.position = pos;
                other.node.position = otherTargetPt.position.clone();
            } else {
                this.curArea = this.putAeraList[targetIdx];
                this.node.position = pos;
            }
            GameData.PauseGame = false;
        } else {
            this.node.position = this.startPositon.clone();
            GameData.PauseGame = false;
            if (this.levelComp) this.levelComp.areaStateUpate();
        }

        // type22 单击姿势切换（1<->3），拖拽后松手不触发
        if (this.type === 22) {
            const endPos = event.getLocation();
            this.pendingSingleClick = true;
            // this.scheduleOnce(() => {
                if (this.pendingSingleClick && !this.singleClickCancelled && !this.hasDragged && this.startTouchPos) {
                    const dist = cc.v2(endPos).sub(this.startTouchPos).mag();
                    if (dist < 40) this.poseToggleLv2();
                }
                this.pendingSingleClick = false;
                this.singleClickCancelled = false;
            // }, 0.32);
        }

        if (this.levelComp) this.levelComp.areaStateUpate();
    }

    /**躲藏判定 */
    hideJudge(){

        //角色未进入区域中
        if(this.curArea == null){

            this.isCorrect = false;
            return;
        }


        let index_r = Number(this.node.name[this.node.name.length - 1]);

        let index_a = Number(this.curArea.name[this.curArea.name.length - 1]);

        //console.log([index_r,index_a]);

        //在目标区域内，且状态正确（按 type 判断，与关卡无关）
        if(index_a == index_r ){

            let stateOk = true;
            if (this.type === 21) stateOk = this.rotationTilt;
            else if (this.type === 22 || this.type === 34) {
                const ani = this.node.getComponent(dragonBones.ArmatureDisplay).animationName || "";
                stateOk = ani.endsWith("3");
            }
            // type 1x 或其他：仅偏移，stateOk 保持 true

            if (stateOk) this.posInof();
            else this.isCorrect = false;
        }

        
        else{
            this.isCorrect =false;
        }
    }

    /** */
    posInof(){

        let index_r = Number(this.node.name[this.node.name.length - 1]);
        //目标点X值
        let posX = this.levelComp.pointList[index_r-1].position.x;
        //偏移范围内
        if(Math.abs( posX - this.node.position.x) <= this.offsetX){
            this.isCorrect = true;
        }

        else{
            this.isCorrect = false;
        }
    }
    /**关闭节点监听 */
    ListeningOff(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
}
