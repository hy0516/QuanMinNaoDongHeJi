

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import HCSHJ_EventType_219 from "./HCSHJ_EventType_219";



const { ccclass, property } = cc._decorator;

@ccclass
export default class hcshj_lv202 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    @property(cc.Prefab)
    Prefablv1: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv2: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv3: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv4: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv5: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv6: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv7: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv8: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv9: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv10: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv11: cc.Prefab = null;
    @property(cc.Prefab)
    Prefablv12: cc.Prefab = null;
    @property(cc.Prefab)
    TeXiao: cc.Prefab = null;
    @property(cc.Prefab)
    LostPrefab: cc.Prefab = null;
    private moveDirection: number = 0;//移动方向
    private isMoving: boolean = false;
    @property
    moveSpeed: number = 600;  // 移动速度（像素/秒）
    @property
    maxX: number = 100;  // X轴最大限制
    movex;
    @property
    music :AudioManager = null;

    //随机预制体数组
    RandomPrefabs:cc.Prefab[]=[this.Prefablv1,this.Prefablv2,this.Prefablv3,this.Prefablv4];
    curNewNode:cc.Node=null;
    isshowVideo = false;
    canjiaohu=true;

    islost:boolean= false;
    isfuhuo:boolean=false;





/**设置节点缩放大小 */
// setNodeScale(node:cc.Node){
//     node.scale = 0.8;
// }





// 存储正在处理的碰撞对（防止重复处理）
private processingPairs: Set<string> = new Set();
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(()=>{
            AudioManager.playMusic(`bgmlv219`,null,0.9);
        },0.5)
        // AudioManager.playMusic(`bgmlv202`,null,0.9);
         cc.director.getCollisionManager().enabled = true;
         cc.director.getPhysicsManager().enabled = true;
         cc.director.getCollisionManager().enabledDebugDraw = true;

        //AudioManager.playMusic(`bgmlv111`,null,1);
        this.node.on(HCSHJ_EventType_219.CONTACTCOLLIDER_EVENT,this.onContactBegin,this)
        this.node.on(HCSHJ_EventType_219.GAMELOST_EVENT,this.onlost,this)
        this.RandomPrefabs=[this.Prefablv1,this.Prefablv2,this.Prefablv3,this.Prefablv4];//this.Prefablv11
        this.scheduleOnce(()=>{
            this.UpdateNewNode()
        },1)
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.nodeBreath(  this.node.getChildByName(`bg`).getChildByName(`btn_tips`));
        
    }
    onTouchStart(event: cc.Event.EventTouch) {
        if (!this.curNewNode||this.isMoving) return;
        if (!this.curNewNode.isValid) {
            // 处理节点无效的情况（如跳过逻辑或重新初始化）
            console.warn("curNewNode is null or destroyed");
            this.curNewNode.destroy();
            this.curNewNode=null;
            this.UpdateNewNode();
            return;
        }
        // 获取触摸位置（屏幕坐标系）
        const touchPos = event.getLocation();
        const screenCenter = cc.winSize.width / 2;
        // 判断点击区域
        this.moveDirection = touchPos.x > screenCenter ? 1 : -1;
        // 设置运动状态
        this.isMoving = true;
        const rigidBody = this.curNewNode.getComponent(cc.RigidBody);
        rigidBody.linearVelocity = cc.v2(this.moveDirection * this.moveSpeed, 0);

      
        this.movex = touchPos.x-screenCenter;
        // 到达边界检测
        if (Math.abs(touchPos.x-screenCenter) >= this.maxX) {
            this.movex= touchPos.x-screenCenter > 0 ? this.maxX : -this.maxX;

            console.log("Move:",this.movex);
        }
        AudioManager.playEffect(AudioManager.common.BUTTON);
        // cc.tween(this.curNewNode).to(0.3,{x:movex}).call(()=>{
        //     this.isMoving = false;
        //     //this.moveDirection = 0;
        //     this.applyGravity();
        // }).start();
    }

    onTouchEnd() {
        // if (!this.curNewNode) return;
        // this.isMoving = false;
        // this.moveDirection = 0;
        // this.applyGravity();
    }
    private applyGravity() {
        const rigidBody = this.curNewNode.getComponent(cc.RigidBody);   
        // 切换为动态刚体并启用重力
        rigidBody.type = cc.RigidBodyType.Dynamic;
        // rigidBody.gravityScale = 3;
        // rigidBody.linearVelocity = cc.v2(0, 0);  // 重置速度
        rigidBody.gravityScale = 1;
        rigidBody.linearVelocity = cc.v2(0,-this.moveSpeed);
        rigidBody.awake=true;
        this.curNewNode.getComponent(cc.PhysicsPolygonCollider).restitution=0.2
        // 禁用后续控制
        this.curNewNode = null;

        this.scheduleOnce(()=>{this.UpdateNewNode()},1);
    }

    update(dt: number) {
        if (!this.isMoving || !this.curNewNode) return;

        if (!this.curNewNode.isValid) {
            // 处理节点无效的情况（如跳过逻辑或重新初始化）
            console.warn("curNewNode is null or destroyed");
            this.curNewNode.destroy();
            this.curNewNode=null;
            this.UpdateNewNode();
            return;
        }
        // 获取当前X位置
        const currentX = this.curNewNode.x;

        // 到达边界检测
        if (Math.abs(currentX) >= Math.abs(this.movex)) {
            this.curNewNode.x =this.movex// currentX > 0 ? this.maxX : -this.maxX;
            this.applyGravity();
            this.isMoving = false;
        }
        if(this.isfuhuo)
        {
            this.isfuhuo=false;
            this.scheduleOnce(()=>{
                this.islost=false;
            },2)
        }
    }
    UpdateNewNode()
    {
        const randomIndex =this.getRandomNumber(this.RandomPrefabs.length);
        this.curNewNode =cc.instantiate(this.RandomPrefabs[randomIndex]);
        this.node.addChild(this.curNewNode);

        // //#region 设置缩放
        // this.setNodeScale(this.curNewNode);

        this.curNewNode.setPosition( this.node.getChildByName(`bg`).children[1].getChildByName(`startNode`).position.clone());
        //this.curNewNode.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
        this.curNewNode.getComponent(cc.RigidBody).gravityScale=0;
        // this.scheduleOnce(()=>{
        //     this.curNewNode.getComponent(cc.RigidBody).gravityScale=1;
        // },1)
    }
 
    onContactBegin(eventData:cc.Event.EventCustom)
    {
       
        let contactPhys:cc.PhysicsContact= eventData.getUserData();
       
        const colliderA = contactPhys.colliderA;
        const colliderB = contactPhys.colliderB;
        const nodeA = colliderA.node;
        const nodeB = colliderB.node;
        // 生成唯一碰撞对ID（避免顺序影响）
        const pairID = this.generatePairID(nodeA.uuid, nodeB.uuid);
        if (this.processingPairs.has(pairID)) return;
        
        // 标记为处理中
        this.processingPairs.add(pairID);

        // 执行合成逻辑
        this.mergeNodes(nodeA, nodeB);

        // 清理标记（可选）
        this.scheduleOnce(() => this.processingPairs.delete(pairID), 0.1);
    }
    getHeChengPrefab(name:string):cc.Prefab
    {
        switch (name) {
            case `lv1`:
            return this.Prefablv2;
            case `lv2`:
            return this.Prefablv3;
            case `lv3`:
            return this.Prefablv4;
            case `lv4`:
            return this.Prefablv5;
            case `lv5`:
            return this.Prefablv6;
            case `lv6`:
            return this.Prefablv7;
            case `lv7`:
            return this.Prefablv8;
            case `lv8`:
            return this.Prefablv9;
            case `lv9`:
            return this.Prefablv10;
            case `lv10`:
            return this.Prefablv11;
            case `lv11`:
                this.schedule(()=>{
                    this.onwin()
                },1.6);
            return this.Prefablv12;
            default:
                console.log(`is error!!!`);
            break;  
        }
     
    }
    private mergeNodes(nodeA: cc.Node, nodeB: cc.Node,nocenterPos?:boolean) {
      
        // 计算位置
        const pos =nocenterPos?cc.v2(nodeA.x,nodeA.y) :cc.v2(
            (nodeA.x + nodeB.x) / 2,
            (nodeA.y + nodeB.y) / 2
        );
        //生成新节点
        let newPre =this.getHeChengPrefab(nodeA.name)
     
        AudioManager.playEffect(`合成_219`);//播放合成声音
        // 立即销毁原节点（重要！）
        nodeA.destroy();
        nodeB.destroy();
        if(newPre==null)
        {
            console.log(`pre is NULL!!`);
            this.onwin();
            
        }else
        {
            let newNode:cc.Node = cc.instantiate(newPre);
            newNode.setPosition(pos);
            this.node.addChild(newNode);

            //  //#region 设置缩放
            // this.setNodeScale(newNode);

           //特效生成和播放
        let texiaoNode =cc.instantiate(this.TeXiao);
        texiaoNode.setPosition(pos);
        this.node.addChild(texiaoNode);
        this.addOneTimeListener(texiaoNode.getComponent(dragonBones.ArmatureDisplay),()=>{
            texiaoNode.destroy();
        })
        }
        
    }
    private generatePairID(uuidA: string, uuidB: string): string {
        return uuidA < uuidB ? `${uuidA}-${uuidB}` : `${uuidB}-${uuidA}`;
    }

    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                // this.node.cleanup();
               
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
                //     var UINode = cc.instantiate(UI);
                //     UINode.parent = cc.find("Canvas");
                //     VideoManager.getInstance().showBaoXiang();
                //     GameData.onDele();
                //     this.node.destroy();
                // })
                break;
          
            case "btn_tips":
                if(!this.canjiaohu)break;
                var handlers = () => {
                    this.autoMergeAll();
                  //  this.isshowVideo = true;
                    //VideoManager.getInstance().showInsert();
                    //this.tipsPanel.active = true;
                    // this.tipsPanel.getChildByName(`tishi`).children[1].getComponent(cc.Label).string=
                    // `选择${
                    //    this.realAnswer[this.curlevel-1]==0?`A`:this.realAnswer[this.curlevel-1]==1?`B`:`C`
                    // }选项`;
                   

                    
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(()=>{
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
       
        }
    }
    onlost() {
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("com_cuo");
        //     GameData.PauseGame = false
        //     this.node.destroy();
        //     this.endlost("prefabs/zc/zc_lostend");
        // }, 0.5)
        if(this.islost)return;
        this.islost=true;
        setTimeout(() => {
            AudioManager.playEffect("com_cuo");
            GameData.PauseGame = false;
            var UINode = cc.instantiate(this.LostPrefab);
            UINode.parent = cc.find("Canvas");
            UINode.opacity = 0;
            cc.tween(UINode)
                .to(0.8, { opacity: 255 })
                .call(()=>{
                    //cc.audioEngine.pauseAll();
                  //  cc.director.pause();
                })
                .start()
        }, 600);
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);
    }
    onwin() {
        // var fun = () => {
        //     this.endwin("prefabs/zc/zc_winend");
        //     GameData.PauseGame = false;
        //     return
        // }
        this.gou.cleanup();
        // cc.tween(this.gou)
        //     .to(1.3, { scaleX: 1, scaleY: 1 })
        //     .delay(1.3)
        //     .call(fun)
        //     .start()
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("finishjq");
        // }, 0.9)

        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
        return
    }

   
    nodeShanShuo(nodd:cc.Node)
    {
        cc.tween(nodd).to(1,{opacity:0}).call(
        ()=>{
            cc.tween(nodd).to(1,{opacity:255}).call(
                ()=>{
                    this.nodeShanShuo(nodd);
                }
            ).start();
        }
        ).start();
    }
    nodeBreath(nodd:cc.Node)
    {
        const curScale =nodd.scale;
        cc.tween(nodd).to(1,{scale:curScale*1.1}).call(
        ()=>{
            cc.tween(nodd).to(1,{scale:curScale}).call(
                ()=>{
                    this.nodeBreath(nodd);
                }
            ).start();
        }
        ).start();
    }
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
        
        var qp = qpnode.getChildByName("qp")
        qp.getChildByName("qplab").getComponent(cc.Label).string = lab;
        cc.tween(qp)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                })
            })
            .start()
    }
   /**
 * 生成指定范围内的随机整数
 * @param count 需要生成的最大数量（包含该数）
 * @returns 1到count之间的随机整数
 */
 getRandomNumber(count: number): number {
    if (count <= 0) {
        throw new Error("数量必须大于0");
    }
    return Math.floor(Math.random() * count) //+ 1;
}


 autoMergeAll() {
   // 1. 获取所有可合并节点
    const allNodes = this.getAllMergeableNodes();
   this.HeBin(allNodes);
   this.islost=false;
}
private HeBin(allNodes:cc.Node[])
{
    const queue:cc.Node[]=[];
    queue.push(allNodes[0]);
    allNodes.shift();
   for (let index = 0; index < allNodes.length; index++) {
        const element = allNodes[index];
        if(queue[0].name==element.name)
        {
            queue.push(allNodes[index]);
            allNodes.splice(index,1);
            break;
        }
   }
   if(queue.length==2)
   {
        //console.log((queue));
        this.ContactMergeTwoNodes(queue[0],queue[1]);
        
   }else
   {
        //console.log(`quque is no two`);
        
   }
   if(allNodes.length>0)
        this.HeBin(allNodes);
}
private ContactMergeTwoNodes(aNode:cc.Node,bNode:cc.Node)
{
    const nodeA =aNode;
    const nodeB =bNode;
    // 生成唯一碰撞对ID（避免顺序影响）
    const pairID = this.generatePairID(nodeA.uuid, nodeB.uuid);
    if (this.processingPairs.has(pairID)) return;
    // 标记为处理中
    this.processingPairs.add(pairID);
    // 执行合成逻辑
    this.mergeNodes(nodeA, nodeB,true);//
    // 清理标记（可选）
    this.scheduleOnce(() => this.processingPairs.delete(pairID), 0.1);
}

private getAllMergeableNodes(): cc.Node[] {
    return this.node.children.filter(child => 
        child.name.startsWith('lv') && 
        child !== this.curNewNode &&
        child.getComponent(cc.RigidBody).type === cc.RigidBodyType.Dynamic
    );
}



}

