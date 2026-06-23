
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import common from "../script/common/common";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class lldq_lv250 extends BaseGame {

    @property(cc.Node)
    ball: cc.Node = null;

    @property(cc.Node)
    bjskeNode: cc.Node = null;

    @property(cc.Prefab)
    bwskeNode: cc.Node = null;

    @property(cc.Prefab)
    qiNode: cc.Node = null;

    // @property(cc.Label)
    // forceLabel: cc.Label = null;

    @property(cc.Node)
    instructionLabel: cc.Node = null;

    @property(cc.Label)
    jinDuLabel: cc.Label = null;

    curSelRole;
    balls: cc.Node[] = [];
    // 球的刚体组件
    private ballRigidBody: cc.RigidBody = null;
    // 推力大小
    private forceValue: number = 20000;
    // 推力大小
    private forceMaxValue: number = 80000;
    // 游戏是否开始
    private gameStarted: boolean = false;
    // 游戏相机
    private mainCamera: cc.Camera = null;
    sceneNode: cc.Node = null; // 整个场景的父节点
    isfollowCamera: boolean = true;
    islost: boolean = false;
    curProgress = 0.5;//滑条的百分比
    //球体边界
    minX; maxX; maxY; minY;

    // @property(cc.Node)
    // private tipsPanel: cc.Node = null; 
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    @property(cc.Prefab)
    LostPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    WinPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    nextlevelPre: cc.Prefab = null;


    isshowVideo = false;
    isCameraTurn = false;
    iswin = false;

    private countdownTime: number = 20; // 20秒倒计时
    private currentTime: number = 0;
    private isRunning: boolean = false;
    private countdownLabel: cc.Label = null;

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic(`bgmlv250`);
        })
        // this.switchOrientation(`landscape`,()=>{});
        // 初始化物理系统
        cc.director.getPhysicsManager().enabled = true;

        // cc.director.getPhysicsManager().debugDrawFlags=1;

        // 获取球的刚体组件
        this.ballRigidBody = this.ball.getComponent(cc.RigidBody);

        // 初始化UI
        // this.softInitUi();
        this.updateForceLabel();
        this.scheduleOnce(() => {
            let widgets = this.node.getComponentsInChildren(cc.Widget)
            widgets.forEach(widget => {
                widget.updateAlignment();
            })
        })
        common.closeSk();

        // 添加触摸事件监听
        this.node.getChildByName(`touchArea`).on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);

        // 添加键盘事件监听（用于调整推力）
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // 获取主相机
        this.mainCamera = this.node.getChildByName(`cameraNode`).getComponent(cc.Camera);//cc.Camera.findCamera(this.node);     
        //   console.log(this.mainCamera);

        this.sceneNode = this.node.getChildByName(`bj`);
        this.minX = -(this.sceneNode.width / 2 - 100); this.maxX = -this.minX;
        this.minY = -(this.sceneNode.height / 2 - 100); this.maxY = -this.minY;

        // 启用碰撞检测
        cc.director.getCollisionManager().enabled = true;

        // 初始化时查找所有包含"fh"的Ball节点
        this.findFHBalls();

        this.updateJinDuLabel();
        this.initRoleData();
        // this.scheduleOnce(()=>{
        //     cc.tween(this.mainCamera).to(1,{zoomRatio:0.5}).start();//this.node.getChildByName(`bj`)
        //    // cc.tween(this.node.getChildByName(`fh`)).to(1,{scale:0.5}).start();
        // },5)
        this.countdownLabel = this.node.getChildByName(`bgNode`).getChildByName(`btn_dun`).children[1].getComponent(cc.Label)
        common.lujing.parent = this.node.getChildByName(`bgNode`);
    }
    openpausePanel() {
        cc.resources.load(`prefabs/common/pausePanel`, cc.Prefab, (err, UI: cc.Prefab) => {
            var UINode = cc.instantiate(UI);
            UINode.parent = this.node;
            if (UINode.parent.getChildByName(`cameraNode`)) {
                UINode.group = `UI`;
                UINode.parent = UINode.parent.getChildByName(`bgNode`);
                UINode.x = 0; UINode.y = 0;
            } else {

            }

        })
    }
    softInitUi() {
        const winSize = cc.view.getVisibleSize(); //cc.winSize;
        const bgNode = this.node.getChildByName(`bgNode`);
        const startTips = bgNode.getChildByName(`123`);
        const btnclose = bgNode.getChildByName(`btn_close`);
        const forceSlider = bgNode.getChildByName(`Forceslider`);
        const jinDuNode = bgNode.getChildByName(`jinDuNode`);
        const btnpf = bgNode.getChildByName(`btn_pf`);
        const btndun = bgNode.getChildByName(`btn_dun`);
        console.log(`width =${winSize.width}, height= ${winSize.height}`);
        // 获取设备实际屏幕尺寸
        const frameSize = cc.view.getFrameSize();
        console.log(`设备实际尺寸: width = ${frameSize.width}, height = ${frameSize.height}`);
        forceSlider.setPosition(-frameSize.width + 50, 0);
        btnclose.setPosition(-frameSize.width * 2 / 3, frameSize.height * 4 / 5 - 50);
        jinDuNode.setPosition(-frameSize.width * 2 / 3 + 50, frameSize.height * 4 / 5 - 50);
        startTips.setPosition(-frameSize.width * 2 / 3, frameSize.height * 4 / 5 - 150);
        btnpf.setPosition(-frameSize.width * 2 / 3 + 20, -frameSize.height * 3 / 5);
        btndun.setPosition(frameSize.width * 2 / 3 - 20, -frameSize.height * 3 / 5);
        // cc.tween(btnclose).to(1,{x:-frameSize.width*2/3,y:frameSize.height*4/5}).start();//,y:frameSize.height/2
        // forceSlider.y = ///2;
        // forceSlider.x = //100;


    }
    // switchOrientation(orientation, callback) {
    //     const targetOrientation = orientation === 'landscape' ? cc.macro.ORIENTATION_LANDSCAPE : cc.macro.ORIENTATION_PORTRAIT;
    //     const designResolution = orientation === 'landscape' ? cc.size(1560, 720) : cc.size(720, 1560); // 根据你的设计分辨率修改

    //     // 1. 设置屏幕方向
    //     cc.view.setOrientation(targetOrientation);

    //     // 2. 设置设计分辨率策略，这里以 SHOW_ALL 为例，避免变形:cite[1]:cite[5]:cite[7]
    //     cc.view.setDesignResolutionSize(designResolution.width, designResolution.height, cc.ResolutionPolicy.SHOW_ALL);

    //     // 3. 延迟一段时间再执行回调，确保渲染层已更新
    //     this.scheduleOnce(() => {
    //      //   this.onResize(); // 手动触发一次UI更新
    //         callback && callback();
    //     }, 0.2);
    // }
    // 存储数据到localStorage
    setLocalStorageArray(key: string, data: any[]): void {
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    // 从localStorage获取数组数据
    getLocalStorageArray(key: string, defaultValue: any[]): any[] {
        const storedData = cc.sys.localStorage.getItem(key);
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                console.error(`解析存储数据 ${key} 失败`, e);
                return defaultValue;
            }
        }
        return defaultValue;
    }
    extractXRnumbers(input: string): number | null {
        const match = input.match(/role(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
    }
    initRoleData() {
        let roleDat = this.getLocalStorageArray("lv250RoleLock", [true, false, false, false, false]);

        // 如果是第一次运行，保存默认值
        if (!cc.sys.localStorage.getItem("lv250RoleLock")) {
            this.setLocalStorageArray("lv250RoleLock", roleDat);
        }

        const roleSelPanel = this.node.getChildByName(`bgNode`).getChildByName(`roleSelPanel`);

        if (roleDat && Array.isArray(roleDat) && roleSelPanel) {
            for (let index = 0; index < roleSelPanel.childrenCount; index++) {
                if (index < roleDat.length) {
                    const element = roleSelPanel.children[index];
                    const ggNode = element.getChildByName(`gg`);
                    if (ggNode) {
                        ggNode.active = !roleDat[index];
                    }
                }
            }
        }
        this.curSelRole = `role1`;
    }
    selRoleBtn(event: cc.Event.EventTouch) {
        if (event.currentTarget.name == this.curSelRole) return;
        if (event.currentTarget.children[1].active) {
            VideoManager.getInstance().showVideo(() => {
                event.currentTarget.children[1].active = false;
                let evenNum = this.extractXRnumbers(event.currentTarget.name);
                let roleDat = this.getLocalStorageArray("lv250RoleLock", [true, false, false, false, false]);
                roleDat[evenNum - 1] = true;
                this.setLocalStorageArray("lv250RoleLock", roleDat);
            });
        } else {
            event.currentTarget.children[0].active = true;

            event.currentTarget.parent.getChildByName(this.curSelRole).children[0].active = false;
            this.curSelRole = event.currentTarget.name;
        }
    }
    // 查找所有包含"fh"的Ball节点
    findFHBalls() {
        this.balls = [];
        const bj = this.node.getChildByName("bj");
        if (!bj) {
            cc.warn("bj");
            return;
        }
        for (let index = 0; index < bj.childrenCount; index++) {
            const element = bj.children[index];
            // 查找所有名字包含"fh"的节点
            this.findNodesByNameContains(element, "fh", this.balls);
        }

    }

    // 递归查找节点名包含指定字符串的节点
    findNodesByNameContains(node: cc.Node, searchString: string, result: cc.Node[]) {
        if (node.name.includes(searchString)) {
            result.push(node);
        }
    }

    onDestroy() {
        // 移除事件监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

    }

    SliderControl(even: cc.Slider) {
        //console.log(even.progress);
        this.curProgress = even.progress;
        // this.forceValue=this.forceMaxValue*even.progress*this.ball.scale;
        even.node.getChildByName(`jdt2`).width = 300 * even.progress;
        this.updateForceLabel();

    }
    updateForceValue() {

        this.forceValue = this.forceMaxValue * this.curProgress * this.ball.scale;
    }
    updateJinDuLabel() {
        const jinDuMaxScale = 8;
        this.jinDuLabel.string = `进度:${(Number(this.ball.scale / jinDuMaxScale * 100)).toFixed(3)}%`;
        this.jinDuLabel.node.parent.getChildByName(`jdt2`).width = 836 * (Number(this.ball.scale / jinDuMaxScale * 100) / 100);
        if (Number(this.ball.scale / jinDuMaxScale * 100) > 50 && !this.isCameraTurn) {
            if (this.mainCamera.zoomRatio == 1) {
                this.isCameraTurn = true;
                AudioManager.playEffect(`变大`)
                cc.tween(this.mainCamera).to(1, { zoomRatio: 0.5 }).call(() => {
                    this.isCameraTurn = false;
                }).start();
            }

        } else if (!this.isCameraTurn && (this.mainCamera.zoomRatio == 0.5 || this.mainCamera.zoomRatio == 1.5) && Number(this.ball.scale / jinDuMaxScale * 100) > 25) {
            this.isCameraTurn = true;
            AudioManager.playEffect(`变大`)
            cc.tween(this.mainCamera).to(1, { zoomRatio: 1 }).call(() => {
                this.isCameraTurn = false;
            }).start();
        } else if (Number(this.ball.scale / jinDuMaxScale * 100) < 25 && !this.isCameraTurn && this.mainCamera.zoomRatio != 1.5) {
            this.isCameraTurn = true;
            AudioManager.playEffect(`变大`)
            cc.tween(this.mainCamera).to(1, { zoomRatio: 1.5 }).call(() => {
                this.isCameraTurn = false;
            }).start();
        }
        if ((Number(this.ball.scale / jinDuMaxScale * 100)) >= 100 && !this.iswin) {
            this.iswin = true;
            this.onwin();
        }

    }
    onTouchStart(event: cc.Event.EventTouch) {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.instructionLabel.active = false;
        }
        if (this.islost) return;
        // // 获取触摸点的世界坐标
        // const touchPos = this.node.convertToNodeSpaceAR(event.getLocation());

       
        // 获取触摸点的世界坐标（考虑摄像机偏移）
        const touchLocation = event.getLocation();
        const worldPos = this.mainCamera.getScreenToWorldPoint(touchLocation);

        const worldPos2D = cc.v2(worldPos.x, worldPos.y);
        const touchPos = this.node.convertToNodeSpaceAR(worldPos2D);//this.sceneNode.convertToNodeSpaceAR(worldPos2D);
        // 计算从小球位置到触摸点的方向向量
        let direction = touchPos.sub(this.ball.getPosition()).normalize();
        // 施加力
        this.applyForceToBall(direction.neg(direction));
        // 显示力方向指示器
        //this.showForceDirection(direction);
        // 创建喷气效果
        this.createJetEffect(this.ball.getPosition(), direction.neg());
    }
    // 创建喷气效果
    createJetEffect(pos: cc.Vec2, direction: cc.Vec2) {
        // 实例化喷气效果预制体
        let jetEffectNode = cc.instantiate(this.qiNode);
        //jetEffectNode.setPosition(pos);

        // 计算喷气效果的角度
        let angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        jetEffectNode.angle = angle;

        jetEffectNode.parent = this.node.getChildByName(`bj`);

        // 这里使用 cc.v3(0, 0) 代表节点B锚点在自身坐标系中的位置
        let worldPosOfB = this.ball.convertToWorldSpaceAR(cc.v3(0, 0));

        // 2. 将世界坐标转换为节点A的父节点坐标系中的位置
        // 这样得到的坐标，是节点A的父节点能理解的坐标
        let targetPosForA = jetEffectNode.parent.convertToNodeSpaceAR(worldPosOfB);
        // 3. 将转换后的坐标设置给节点A
        jetEffectNode.setPosition(targetPosForA);
        
        jetEffectNode.scale *= this.ball.scale;
        // 添加到场景
        // this.sceneNode.addChild(jetEffectNode);
        AudioManager.playEffect(`喷气`)
    }

    applyForceToBall(direction: cc.Vec2) {
        // 计算力向量（方向×推力大小）
        const force = direction.mul(this.forceValue);
        // 施加力到小球中心点
        this.ballRigidBody.applyForceToCenter(force, true);

        this.ball.scale -= 0.002;//this.ball.scale<0.2?0:this.ball.scale/200;
        this.updateJinDuLabel();
    }

    showForceDirection(direction: cc.Vec2) {
        // 创建并显示方向指示器
        const indicator = new cc.Node();
        this.node.addChild(indicator);

        // 设置位置为小球位置
        indicator.setPosition(this.ball.getPosition());

        // 计算旋转角度
        const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        indicator.angle = angle;

        // 添加箭头图形
        const graphics = indicator.addComponent(cc.Graphics);
        graphics.lineWidth = 3;
        graphics.fillColor = cc.Color.YELLOW;

        // 绘制箭头
        graphics.moveTo(0, 0);
        graphics.lineTo(40, 0);
        graphics.stroke();

        graphics.moveTo(40, 0);
        graphics.lineTo(30, 10);
        graphics.stroke();

        graphics.moveTo(40, 0);
        graphics.lineTo(30, -10);
        graphics.stroke();

        // 0.5秒后消失
        indicator.runAction(
            cc.sequence(
                cc.delayTime(0.5),
                cc.fadeOut(0.2),
                cc.removeSelf()
            )
        );
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        // 调整推力大小
        if (event.keyCode === cc.macro.KEY.up) {
            this.forceValue += 100;
            this.updateForceLabel();
        } else if (event.keyCode === cc.macro.KEY.down) {
            this.forceValue = Math.max(100, this.forceValue - 100);
            this.updateForceLabel();
        } else if (event.keyCode === cc.macro.KEY.space) {
            // 重置小球位置和速度
            this.ball.setPosition(0, 0);
            this.ballRigidBody.linearVelocity = cc.v2(0, 0);
            this.ballRigidBody.angularVelocity = 0;
            this.node.getChildByName(`bj`).x = 0;
            this.node.getChildByName(`bj`).y = 0;
        }
    }

    updateForceLabel() {
        return;
        // this.forceLabel.string = `推力: ${this.forceValue}`;
    }


    update(dt) {
        if (this.isfollowCamera) {
            this.mainCamera.node.x = this.ball.x;
            this.mainCamera.node.y = this.ball.y;
            this.bjskeNode.x = this.ball.x;
            this.bjskeNode.y = this.ball.y;
            // this.node.getChildByName(`bgNode`).x= this.ball.x;
            // this.node.getChildByName(`bgNode`).y= this.ball.y;
        } else {
            this.mainCamera.node.position = cc.Vec3.ZERO;
            this.bjskeNode.x = 0;
            this.bjskeNode.y = 0;
        }
        this.updateForceValue();
        // 检查所有fhBall节点与玩家球体的大小比较
        this.checkFHBallsScale();



    }

    // 检查所有fhBall节点与玩家球体的大小比较
    checkFHBallsScale() {
        for (let i = 0; i < this.balls.length; i++) {
            const fhBall = this.balls[i];
            if (!fhBall.isValid) continue; // 确保节点有效
            // 获取第一个子节点
            const firstChild = fhBall.children[0];
            if (!firstChild) continue;
            // 比较球体大小
            if (fhBall.scale <= this.ball.scale) {
                // 激活第一个子节点
                firstChild.active = true;
            } else {
                // 禁用第一个子节点
                firstChild.active = false;
            }
            if (fhBall.x < this.minX) fhBall.x = this.minX;
            if (fhBall.x > this.maxX) fhBall.x = this.maxX;
            if (fhBall.y < this.minY) fhBall.y = this.minY;
            if (fhBall.y > this.maxY) fhBall.y = this.maxY;
        }
    }

    // 销毁指定的fhBall节点
    destroyFHBall(node: cc.Node) {
        // 查找节点在数组中的索引
        const index = this.balls.indexOf(node);
        if (index !== -1) {
            // 从数组中移除
            this.balls.splice(index, 1);
        }
        // 销毁节点
        if (node.isValid) {
            node.destroy();
        }
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
                var handlers = () => {
                    //this.isshowVideo = true;
                    VideoManager.getInstance().showInsert();
                    //  this.tipsPanel.active = true;
                    //     this.showStepTipsLabel();
                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(() => {
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                // this.tipsPanel.active = false;
                break;
            case "btn_pf":
                this.node.getChildByName(`bgNode`).getChildByName(`roleSelPanel`).active = true;
                this.node.getChildByName(`bgNode`).getChildByName(`roleSelPanel`).scale = 0;
                cc.tween(this.node.getChildByName(`bgNode`).getChildByName(`roleSelPanel`)).to(0.4, { scale: 1 }).call(() => {
                    cc.audioEngine.pauseAll();
                    cc.director.pause();
                }).start();
                break;
            case "cc":
                even.currentTarget.parent.active = false;
                AssetManager.load(GameData.curGameStyle, "/picture_" + GameData.curGameStyle + "/" + this.curSelRole, cc.SpriteFrame, null, (img: cc.SpriteFrame) => {
                    this.ball.getComponent(cc.Sprite).spriteFrame = img;
                })
                cc.audioEngine.resumeAll();
                cc.director.resume();
                break;
            case `btn_dun`:
                if (even.currentTarget.children[0].active) {
                    VideoManager.getInstance().showVideo(() => {
                        this.node.getChildByName(`bgNode`).getChildByName(`btn_dun`).children[0].active = false;
                        this.ball.getChildByName(`dun`).active = true;
                        this.node.getChildByName(`bgNode`).getChildByName(`btn_dun`).children[1].active = true;
                        this.startCountdown();
                    });
                }
                break;
        }
    }

    startCountdown() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentTime = this.countdownTime;
        this.updateLabel();
        // 取消之前的计时器
        this.unschedule(this.updateTimer);
        // 每秒更新一次
        this.schedule(this.updateTimer, 1);
    }

    private updateTimer() {
        if (!this.isRunning) return;

        this.currentTime--;
        this.updateLabel();

        if (this.currentTime <= 0) {
            this.stopCountdown();
            this.node.getChildByName(`bgNode`).getChildByName(`btn_dun`).children[0].active = true;
            this.ball.getChildByName(`dun`).active = false;
            this.node.getChildByName(`bgNode`).getChildByName(`btn_dun`).children[1].active = false;
        }
    }

    private updateLabel() {
        // 显示两位数字（不足补零）
        if (this.countdownLabel) {
            this.countdownLabel.string = this.currentTime < 10 ?
                `0${this.currentTime}` : `${this.currentTime}`;
        }
    }

    stopCountdown() {
        this.isRunning = false;
        this.unschedule(this.updateTimer);
    }



    gametolost() {
        // this.longnv_sk.playAnimation("longnvdaiji",-1);
        // this.showqp(this.longnv_sk.node, talk.好你个傲丙私通敌人他死定了, music.好你个傲丙私通敌人他死定了,()=>{
        //     this.longnv_sk.playAnimation("longnvgongji",1);
        //     AudioManager.playEffect(music.失败爪子声)
        //     this.addOneTimeListener(this.longnv_sk,()=>{
        //         this.onlost();
        //     })
        // })
    }
    onlost() {
        this.scheduleOnce(() => {
            //   AudioManager.playEffect("com_cuo");
            GameData.PauseGame = false;
            var bwNode = cc.instantiate(this.bwskeNode);
            bwNode.parent = this.node;
            bwNode.x = this.ball.x;
            bwNode.y = this.ball.y;
            //bwNode.getComponent(dragonBones.ArmatureDisplay)

            AudioManager.playEffect(`撞击`, false, () => {
                this.node.destroy();
                AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.endlost_hz);
                var UINode = cc.instantiate(this.LostPrefab);
                UINode.parent = cc.find("Canvas");
                UINode.opacity = 0;
                cc.tween(UINode)
                    .to(0.8, { opacity: 255 })
                    .start()
            })

            // this.endlost("prefabs/zc/zc_lostend");
            // var UINode = cc.instantiate(this.LostPrefab);
            // UINode.parent =this.node;
            // if(UINode.parent.getChildByName(`cameraNode`))
            // {
            //     UINode.group=`UI`;
            //     UINode.parent= UINode.parent.getChildByName(`bgNode`);
            //     UINode.x=0;UINode.y=0;UINode.opacity = 0;
            // }
            // // }else
            // // {
            // //     UINode.parent = cc.find("Canvas");
            // //     UINode.opacity = 0;
            // // }
            // cc.tween(UINode)
            //     .to(0.8, { opacity: 255 })
            //     .call(() => {

            //     })
            //     .start()
        })
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }
onwin() {
    if (this.nextlevelPre) {
        // 设置线速度为零
        this.ball.getComponent(cc.RigidBody).linearVelocity = cc.Vec2.ZERO;
        // 设置角速度为零
        this.ball.getComponent(cc.RigidBody).angularVelocity = 0;
        GameData.curGameName = this.nextlevelPre.name;
        
        let preNode: cc.Node = cc.instantiate(this.WinPrefab);

        const parentNode = this.node.getChildByName('bgNode') || cc.find("Canvas");
        preNode.parent = parentNode;
        preNode.x = 0;
        preNode.y = 0;
        preNode.opacity = 0;
        cc.tween(preNode)
            .to(0.8, { opacity: 255 })
            .start();

        AudioManager.playEffect(AudioManager.audioName.endwin);
    } else {
        this.node.cleanup();
        this.node.destroy();
        this.endwin("prefabs/zc/zc_winend");
        GameData.PauseGame = false;
    }
}

    nextPre() {
        GameData.curGameName = this.nextlevelPre.name;
        cc.resources.load('prefabs/common/smallLoading', cc.Prefab, (err, pre: cc.Prefab) => {
            let preNode: cc.Node = cc.instantiate(this.nextlevelPre);
            preNode.parent = cc.find("Canvas");
            this.node.cleanup();
            this.node.destroy();

        })
    }
    protected onDisable(): void {
        common.lujing.parent = cc.find(`Canvas`).getChildByName(`game`);
    }
}

