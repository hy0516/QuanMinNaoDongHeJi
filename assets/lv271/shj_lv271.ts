

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import item_move_lv271 from "./item_move_lv271";
const { ccclass, property } = cc._decorator;

@ccclass
export default class shj_lv271 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    canjiaohu = true;




    //时间标签
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Node)
    addtimetips: cc.Node = null;

    /**初始时间 */
    startTime: number = 180;

    originalColor;//初始颜色
    isBreathing = false;//呼吸判断


    /**格子提示圈 */
    @property(cc.Node)
    gridLvquan: cc.Node = null;


    @property(cc.PageView) // 在编辑器中将 PageView 组件拖拽到这里
    public pageView: cc.PageView = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    // 需要滚动到的目标节点
    targetNode: cc.Node = null;

    /**提示闪烁开关 */
    tipLock = true;

    /**提示连点锁 */
    lock_clickDouble = true;
    
    // 闪烁提示相关变量
    private currentTipPuzzNode: cc.Node = null; // 当前闪烁的拼图节点
    private currentTipTargetNode: cc.Node = null; // 当前闪烁的目标节点
    private tipPuzzTween: cc.Tween = null; // 拼图闪烁动画
    private tipTargetTween: cc.Tween = null; // 目标闪烁动画
    private tipPuzzOriginalOpacity: number = 255; // 拼图原始透明度
    private tipTargetOriginalOpacity: number = 255; // 目标原始透明度


    mhNode: cc.Node;//盲盒Node
    bgNode:cc.Node ;
    curPuzzNode:cc.Node = null;
    // 拉条相关变量
    latiaoNode: cc.Node = null; // latiao节点
    latiaoArmature: dragonBones.ArmatureDisplay = null; // latiao的龙骨动画组件
    maskNode: cc.Node = null; // Mask节点
    maskComponent: cc.Mask = null; // Mask组件
    tzAnimationTotalFrames: number = 0; // tz动画总帧数
    startTouchPos: cc.Vec2 = null; // 触摸开始位置
    currentMaskWidth: number = 0; // 当前mask宽度
    maxMaskWidth: number = 500; // mask最大宽度
    isDragging: boolean = false; // 是否正在拖拽
    hasReachedEnd: boolean = false; // 是否已经到达最后一帧
    // 拉条向右滑动音效相关变量
    private latiaoSlideSoundName: string = "撕盲盒lv271"; 
    private isPlayingSlideSound: boolean = false; // 是否正在播放滑动音效
    private isSlidingRight: boolean = false; // 是否正在向右滑动
    public canClickBox: boolean = true; // 是否允许点击盲盒

    onLoad() {
        GameData.PauseGame = false;
        //关闭大厅bgm
        AudioManager.stopMusic();
        //初始化拼图
        // this.puzzInof(`lv1`);
        // this.tipsGroupInof();
        this.scheduleOnce(() => {
            AudioManager.playMusic("bgmlv271",null,0.7);
        }, 0.5);
        this.bgNode=this.node.getChildByName(`bg`);
        this.mhNode = this.bgNode.getChildByName(`playmhNode`);
        this.mhNode.active=false;
        this.scheduleOnce(() => {
            AudioManager.playEffect("盲盒降落lv271");
        }, 0.5);
        this.addOneTimeListener(this.bgNode.getChildByName(`begin_sk`).getComponent(dragonBones.ArmatureDisplay),()=>{
            this.initLatiao();
            this.mhNode.active=true;
            this.bgNode.getChildByName(`begin_sk`).active=false;
            this.bgNode.getChildByName(`begin_sk`).destroy();
            this.bgNode.getChildByName(`shouzhi_sk`).active=true;
        })
    }


    /**获取场景节点 */
    getNode() {

    }
    /** 初始化拼图（并修改素材翻转）*/
    puzzInof(levelName: string) {
        this.curPuzzNode= this.node.getChildByName("bg").getChildByName(levelName);
        let puzzs = this.curPuzzNode.getChildByName("puzz").children;
        for (let i = 0; i < puzzs.length; i++) {
            let puzz = puzzs[i];
            puzz.addComponent(item_move_lv271);
            puzz.getComponent(item_move_lv271).puzzInof(this.node);
        }
    }

    /**获取拼图的目标节点 */
    getPuzzTargetNode(puzzNode: cc.Node) {
        let lv = puzzNode.parent.parent;
        let skins = lv.getChildByName("skin").children;
        for (let i = 0; i < skins.length; i++) {
            let pointNode = skins[i];
            //获取目标点
            if (pointNode.name == puzzNode.name) {
                puzzNode.getComponent(item_move_lv271).targetNode = pointNode;
            }
        }
    }
    /**打叉 */
    chaDisplay() {
        cc.tween(this.cha)
            .to(0.5, { scaleX: 0.3, scaleY: 0.3 })
            .call(
                () => {

                    this.cha.setScale(0);

                    //console.log(this.gou.scaleX);
                }
            )
            .start();
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

                // if(!this.canjiaohu) 
                var handlers = () => {
                    this.tipLock = true;
                    this.lock_clickDouble = true;
                     this.tipEffect();
                }

                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(() => {
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
            //跳过
            case "btn_jiacishu":
                VideoManager.getInstance().showVideo(() => {
                    // this.nextLv();
                    this.onwin();
                })
                break;

        }
    }
    //提示闪烁
    tipEffect(){
        if (!this.curPuzzNode) {
            console.error("curPuzzNode 未初始化");
            return;
        }
        
        // 停止之前的闪烁动画
        this.stopTipEffect();
        
        // 找到 puzz 子节点
        const puzzNode = this.curPuzzNode.getChildByName("puzz");
        if (!puzzNode || puzzNode.children.length === 0) {
            console.error("未找到 puzz 子节点或没有拼图块");
            return;
        }
        
        // 获取第一个拼图块
        const firstPuzzItem = puzzNode.children[0];
        if(!firstPuzzItem.getComponent(item_move_lv271).stateCreccot){
            firstPuzzItem.getComponent(item_move_lv271).puzzTurn();
        }
        // 找到对应的 targetNode（通过名字匹配）
        const skinNode = this.curPuzzNode.getChildByName("skin");
        if (!skinNode) {
            console.error("未找到 skin 子节点");
            return;
        }
        
        let targetNode: cc.Node = null;
        for (let i = 0; i < skinNode.children.length; i++) {
            const skinItem = skinNode.children[i];
            if (skinItem.name === firstPuzzItem.name) {
                targetNode = skinItem;
                break;
            }
        }
        
        if (!targetNode) {
            console.error(`未找到与 ${firstPuzzItem.name} 匹配的目标节点`);
            return;
        }
        
        // 保存当前闪烁的节点
        this.currentTipPuzzNode = firstPuzzItem;
        this.currentTipTargetNode = targetNode;
        
        // 确保目标节点可见
        targetNode.active = true;
        
        // 保存原始透明度
        this.tipPuzzOriginalOpacity = firstPuzzItem.opacity;
        this.tipTargetOriginalOpacity = targetNode.opacity;
        
        // 拼图闪烁动画
        const puzzTween = () => {
            if (!this.tipLock || !this.currentTipPuzzNode || this.currentTipPuzzNode !== firstPuzzItem) return;
            
            this.tipPuzzTween = cc.tween(firstPuzzItem)
                .to(0.5, { opacity: 0 })
                .to(0.5, { opacity: this.tipPuzzOriginalOpacity })
                .call(() => {
                    if (this.tipLock && this.currentTipPuzzNode === firstPuzzItem) {
                        puzzTween();
                    } else {
                        firstPuzzItem.opacity = this.tipPuzzOriginalOpacity;
                    }
                })
                .start();
        };
        
        // 目标闪烁动画
        const targetTween = () => {
            if (!this.tipLock || !this.currentTipTargetNode || this.currentTipTargetNode !== targetNode) return;
            
            this.tipTargetTween = cc.tween(targetNode)
                .to(0.5, { opacity: 0 })
                .to(0.5, { opacity: this.tipTargetOriginalOpacity })
                .call(() => {
                    if (this.tipLock && this.currentTipTargetNode === targetNode) {
                        targetTween();
                    } else {
                        targetNode.opacity = this.tipTargetOriginalOpacity;
                    }
                })
                .start();
        };
        
        // 开始闪烁
        this.tipLock = true;
        puzzTween();
        targetTween();
    }
    
    /**
     * 停止闪烁提示效果
     */
    stopTipEffect() {
        this.tipLock = false;
        
        // 停止拼图闪烁动画
        if (this.currentTipPuzzNode) {
            cc.Tween.stopAllByTarget(this.currentTipPuzzNode);
            if (this.tipPuzzTween) {
                this.tipPuzzTween.stop();
                this.tipPuzzTween = null;
            }
            // 恢复原始透明度
            if (cc.isValid(this.currentTipPuzzNode)) {
                this.currentTipPuzzNode.opacity = this.tipPuzzOriginalOpacity;
            }
        }
        
        // 停止目标闪烁动画
        if (this.currentTipTargetNode) {
            cc.Tween.stopAllByTarget(this.currentTipTargetNode);
            if (this.tipTargetTween) {
                this.tipTargetTween.stop();
                this.tipTargetTween = null;
            }
            // 恢复原始透明度
            if (cc.isValid(this.currentTipTargetNode)) {
                this.currentTipTargetNode.opacity = this.tipTargetOriginalOpacity;
            }
        }
        
        this.currentTipPuzzNode = null;
        this.currentTipTargetNode = null;
    }
    onlost() {

        //this.cha.cleanup();
        // cc.tween(this.cha)
        //     .to(1, { scaleX: 1, scaleY: 1 })
        //     //.delay(1.3)
        //     .call(fun)
        //     .start()
        // this.scheduleOnce(() => {
        //     AudioManager.playEffect("com_cuo");
        //     GameData.PauseGame = false;

        // }, 1.6)
        // var fun = () =>{
        //     this.node.destroy();
        //     this.endlost("prefabs/zc/zc_lostend");
        // }
        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            GameData.PauseGame = false
            this.node.destroy();
            this.endlost("prefabs/hz/endlost_hz");
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }
    onwin() {
        var fun = () => {
         this.restart();
            GameData.PauseGame = false;
            return
        }
        this.gou.cleanup();
        AudioManager.playEffect("gou");
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()
        return
    }

    addChance() {
        VideoManager.getInstance().showVideo(() => {
            // this.health += 5;
            // this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string = `剩余机会:${this.health}`

        })
    }
    huxi(nodd: cc.Node) {
        cc.tween(nodd).to(1, { opacity: 0 }).call(
            () => {
                cc.tween(nodd).to(1, { opacity: 255 }).call(
                    () => {
                        this.huxi(nodd);
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
    initLatiao() {
        if (!this.mhNode) {
            console.error("mhNode 未找到");
            return;
        }

        // 获取latiao节点
        this.latiaoNode = this.mhNode.getChildByName("latiao");
        if (!this.latiaoNode) {
            console.error("latiao 节点未找到");
            return;
        }

        // 获取龙骨动画组件
        this.latiaoArmature = this.latiaoNode.getComponent(dragonBones.ArmatureDisplay);
        if (!this.latiaoArmature) {
            console.error("latiao 节点未找到 ArmatureDisplay 组件");
            return;
        }

        // 查找包含Mask组件的子节点
        this.findMaskNode(this.latiaoNode);

        if (!this.maskNode || !this.maskComponent) {
            console.error("未找到包含Mask组件的节点");
            return;
        }

        // 初始化动画：停止tz动画在第0帧
        this.initTzAnimation();

        // 注册触摸事件
        this.registerTouchEvents();
    }
    /**
     * 查找包含Mask组件的节点
     */
    findMaskNode(node: cc.Node) {
        const mask = node.getComponent(cc.Mask);
        if (mask) {
            this.maskNode = node;
            this.maskComponent = mask;
            return;
        }

        // 递归查找子节点
        for (let i = 0; i < node.children.length; i++) {
            this.findMaskNode(node.children[i]);
        }
    }

    /**
     * 初始化tz动画：停止在第0帧并获取总帧数
     */
    initTzAnimation() {
        // 延迟执行，确保armature已加载
        this.scheduleOnce(() => {
            if (!this.latiaoArmature || !this.latiaoArmature.armature()) {
                console.error("龙骨动画未初始化，请检查armature是否已加载");
                return;
            }

            const armature = this.latiaoArmature.armature();
            const animation = armature.animation;

            // 获取tz动画
            const tzAnimation = animation.animations["tz"];
            if (!tzAnimation) {
                console.error("未找到tz动画");
                return;
            }

            // 优先使用 frameCount 直接获取总帧数
            if (tzAnimation.frameCount !== undefined && tzAnimation.frameCount !== null) {
                this.tzAnimationTotalFrames = tzAnimation.frameCount;
                console.log(`tz动画总帧数: ${this.tzAnimationTotalFrames} (直接使用frameCount)`);
            } else {
                // 如果没有 frameCount，则通过 duration（秒）* frameRate 计算
                const duration = tzAnimation.duration; // 动画时长（秒）
                const frameRate = armature.armatureData.frameRate || 60; // 帧率，默认60帧每秒
                this.tzAnimationTotalFrames = Math.ceil(duration * frameRate);
                console.log(`tz动画总帧数: ${this.tzAnimationTotalFrames}, 时长: ${duration}秒, 帧率: ${frameRate}fps`);
            }

            // 停止动画在第0帧
            animation.gotoAndStopByFrame("tz", 0);

            // 初始化mask宽度为0
            this.currentMaskWidth = 0;
            if (this.maskComponent && this.maskComponent.node) {
                this.maskComponent.node.width = 0;
            }
        }, 0.1); // 延迟0.1秒确保armature加载完成
    }
    registerTouchEvents() {
        if (!this.latiaoNode) return;

        // 确保节点可以接收触摸事件
        this.latiaoNode.on(cc.Node.EventType.TOUCH_START, this.onLatiaoTouchStart, this);
        this.latiaoNode.on(cc.Node.EventType.TOUCH_MOVE, this.onLatiaoTouchMove, this);
        this.latiaoNode.on(cc.Node.EventType.TOUCH_END, this.onLatiaoTouchEnd, this);
        this.latiaoNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onLatiaoTouchEnd, this);
    }
    onLatiaoTouchStart(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        this.isDragging = true;
        this.startTouchPos = event.getLocation();
        this.bgNode.getChildByName(`shouzhi_sk`).active=false;
    }
    onLatiaoTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.isDragging) return;
        const delta = event.getDelta();
        const deltaX = delta.x; // 向右滑动为正，向左滑动为负
        // 判断是否向右滑动（只有真正往右位移才算）
        this.isSlidingRight = deltaX > 0;
        // 如果向右滑动且音效未播放，则播放音效
        if (this.isSlidingRight && !this.isPlayingSlideSound && this.latiaoSlideSoundName) {
            this.isSlidingRight=false;
            this.playSlideSound();
        }
        
        this.currentMaskWidth = Math.max(0, Math.min(this.maxMaskWidth, this.currentMaskWidth + deltaX));
        this.maskComponent.node.width = this.currentMaskWidth;
        const progress = this.currentMaskWidth / this.maxMaskWidth;
        const targetFrame = Math.floor(progress * this.tzAnimationTotalFrames);
        if (this.latiaoArmature && this.latiaoArmature.armature()) {
            const armature = this.latiaoArmature.armature();
            armature.animation.gotoAndStopByFrame("tz", targetFrame);
            if (targetFrame >= this.tzAnimationTotalFrames - 1 && !this.hasReachedEnd) {
                this.hasReachedEnd = true;
                this.onLatiaoTouchEnd(event);
                this.onAnimationReachEnd();
            } else if (targetFrame < this.tzAnimationTotalFrames - 1) {
                this.hasReachedEnd = false;
            }
        }
    }
    onLatiaoTouchEnd(event?: cc.Event.EventTouch) {
        this.isDragging = false;
        this.startTouchPos = null;
        this.isSlidingRight = false; // 重置滑动状态
    }
    
    /**
     * 播放拉条向右滑动音效
     */
    private playSlideSound(): void {
        if (!this.latiaoSlideSoundName || this.isPlayingSlideSound) return;
        
        this.isPlayingSlideSound = true;
        
        AudioManager.playEffect(this.latiaoSlideSoundName, false, () => {
            // 音效播放完成后的回调
            this.isPlayingSlideSound = false;
            // if (this.isSlidingRight && this.isDragging) {
            //     this.playSlideSound();
            // }
        });
    }
    onAnimationReachEnd() {
        // 禁止点击盲盒
        this.canClickBox = false;
        AudioManager.playEffect("盲袋爆出lv271");
        this.mhNode.getChildByName(`latiao`).active=false;
        this.bgNode.getChildByName(`tanchu_sk`).active=true;
        this.bgNode.getChildByName(`tanchu_sk`).getComponent(dragonBones.ArmatureDisplay).playAnimation(`bc`,1);
        this.addOneTimeListener( this.bgNode.getChildByName(`tanchu_sk`).getComponent(dragonBones.ArmatureDisplay),()=>{
            cc.tween(this.mhNode).to(0.6,{opacity:0}).call(()=>{
                this.mhNode.active=false;
            }).start();
            this.bgNode.getChildByName(`tanchu_sk`).active=false;
            this.bgNode.getChildByName(`tanchu_sk`).destroy();
            this.bgNode.getChildByName(`01`).active=true;
            this.bgNode.getChildByName(`02`).active=true;
            this.bgNode.getChildByName(`03`).active=true;
            // this.bgNode.getChildByName(`04`).active=true;
            this.scheduleOnce(()=>{
                AudioManager.playEffect("盲袋飞出lv271");
                cc.tween(this.bgNode.getChildByName(`01`)).to(0.5,{position:this.bgNode.getChildByName(`01point`).position}).call(()=>{
                    AudioManager.playEffect("盲袋飞出lv271");
                    cc.tween(this.bgNode.getChildByName(`02`)).to(0.5,{position:this.bgNode.getChildByName(`02point`).position}).call(()=>{
                        AudioManager.playEffect("盲袋飞出lv271");
                        cc.tween(this.bgNode.getChildByName(`03`)).to(0.5,{position:this.bgNode.getChildByName(`03point`).position}).call(()=>{
                            // AudioManager.playEffect("盲袋飞出lv271");
                            // cc.tween(this.bgNode.getChildByName(`04`)).to(0.5,{position:this.bgNode.getChildByName(`04point`).position}).call(()=>{
                                
                                // 动画完成后，允许点击盲盒
                                this.canClickBox = true;
                            // }).start();
                        }).start();
                    }).start();
                }).start();
            },0.5)
        })
    }
    onDestroy() {
        if (this.latiaoNode) {
            this.latiaoNode.off(cc.Node.EventType.TOUCH_START, this.onLatiaoTouchStart, this);
            this.latiaoNode.off(cc.Node.EventType.TOUCH_MOVE, this.onLatiaoTouchMove, this);
            this.latiaoNode.off(cc.Node.EventType.TOUCH_END, this.onLatiaoTouchEnd, this);
            this.latiaoNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onLatiaoTouchEnd, this);
        }
    }
    showPuzz(puzzNodeName: string) {
        let lvName = "";
        switch (puzzNodeName) {
            case `01`:
                lvName = `cjlNode`;
                break;
            case `02`:
                lvName = `dxNode`;
                break;
            case `03`:
                lvName = `xmNode`;
                break;
            // case `04`:
            //     lvName = `hlNode`;
            //     break;
            default:
                break;
        }
        let picNode = this.bgNode.getChildByName(lvName);
        picNode.active = true;
        
        // 关闭 picNode 的第一个子节点
        const firstChild = picNode.children[0];
        if (firstChild) {
            firstChild.active = false;
        }
        
        // 找到 puzz 子节点
        const puzzNode = picNode.getChildByName("puzz");
        if (!puzzNode) {
            console.error(`未找到 puzz 子节点`);
            this.puzzInof(lvName);
            return;
        }
        
        // 保存所有拼图块的原始位置和缩放
        const puzzItems = puzzNode.children;
        const originalData: Array<{ position: cc.Vec3, scaleX: number, scaleY: number }> = [];
        
        for (let i = 0; i < puzzItems.length; i++) {
            const item = puzzItems[i];
            originalData.push({
                position: item.position.clone(),
                scaleX: item.scaleX,
                scaleY: item.scaleY
            });
            item.setPosition(0, 0);
            item.setScale(0, 0);
        }
        let completedCount = 0;
        const totalCount = puzzItems.length;
        
        for (let i = 0; i < puzzItems.length; i++) {
            const item = puzzItems[i];
            const originalScaleX = originalData[i].scaleX;
            const originalScaleY = originalData[i].scaleY;
            
            cc.tween(item)
                .to(1, { scaleX: originalScaleX, scaleY: originalScaleY })
                .call(() => {
                    completedCount++;
                    // 当所有缩放动画完成后，执行位置动画
                    if (completedCount === totalCount) {
                        // 再用1秒时间让他们回到原来的位置
                        for (let j = 0; j < puzzItems.length; j++) {
                            const puzzItem = puzzItems[j];
                            const originalPos = originalData[j].position;
                            
                            cc.tween(puzzItem)
                                .to(1, { position: originalPos })
                                .start();
                        }
                    }
                })
                .start();
        }
           // 延迟1秒后恢复第一个子节点
           this.scheduleOnce(() => {
            if (firstChild && cc.isValid(firstChild)) {
                firstChild.active = true;
            }
            // 初始化拼图
            this.puzzInof(lvName);
            this.bgNode.getChildByName(`btn_tips`).active=true;
            this.bgNode.getChildByName(`btn_jiacishu`).active=true;
        }, 2.5);
    }
}

