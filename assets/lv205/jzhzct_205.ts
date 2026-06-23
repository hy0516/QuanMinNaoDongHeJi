

import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import end_205 from "./end_205";
import data_205 from "./data_205";
import mapitem_205 from "./mapitem_205";





const { ccclass, property } = cc._decorator;

@ccclass
export default class jzhzct_205 extends BaseGame {
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.String)
    nodename: string = "";
    @property(cc.Node)
    addtimetips: cc.Node = null;
    @property(cc.Node)
    tipsPanel: cc.Node = null;
    @property(cc.Node)
    g: cc.Node = null;
    @property(cc.Node)
    tou: cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;

    /**绘制头线条 （重绘）*/
    @property(cc.Node)
    gra: cc.Node = null;
    /**绘制身体线条（不重绘） */
    @property(cc.Node)
    gra2: cc.Node = null;

    /**身体描边 */
    gra3:cc.Node = null;
    @property(cc.Prefab)
    nextLv: cc.Prefab = null;
    linelist: cc.Vec2[] = []


    @property(cc.SpriteFrame)
    spColor:cc.SpriteFrame = null;


    






    public startTime = 200;
    public curTime = 0;

    // map: cc.Node = null;
    curlv ;
    tipsindex = 0;
    tiezhinum = 0;
    // step = 1;
    gracolor: string[] = ["#E46767", "#4E2F07", "#ECEC39", "#DF6A1C", "#5E5A5A"];
    /**格子 */
    squacolor:string[] =["#EB56BB","#773909","#F7B819","#D8861E","#EEDFCD"];




    /**设置地图大小和头大小 */
    mapAndtouSet(){


        switch(this.curlv){
            case 1 :
                this.map.scale = 2;
                this.tou.scale =1.8;
                break;
            case 2 :
                this.map.scale = 2;
                this.tou.scale =2;
                break;
            case 3 :
                this.map.scale = 2;
                this.tou.scale =2;
                break;
            case 4 :
                this.map.scale = 1.7;
                this.tou.scale =1.7;
                break;
            case 5 :
                this.map.scale = 1.7;
                this.tou.scale =1.7;
                break;
            case 6 :
                this.map.scale = 1.7;
                this.tou.scale =1.7;
                break;
            case 7 :
                this.map.scale = 1.7;
                this.tou.scale =1.7;
                break;
            case 8 :
                this.map.scale = 2;
                this.tou.scale =1.9;
                break;
            case 9 :
                this.map.scale = 1.7;
                this.tou.scale =1.7;
                break;
            case 10 :
                this.map.scale = 1.6;
                this.tou.scale =1.6;
                break;

        }
    }







    onLoad() {
        GameData.PauseGame = false;
        // this.time.string = "时间:" + this.startTime.toString() + "s";
        // this.schedule(this.Timeing, 1);
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景_lv205");
        }, 0.5)
        // cc.Tween.stopAllByTarget(this.tittle);
        // cc.tween(this.tittle)
        //     .repeat(2,
        //         cc.tween()
        //             .to(0.1, { angle: 7 })
        //             .to(0.1, { angle: 0 })
        //             .to(0.1, { angle: -7 })
        //             .to(0.1, { angle: 0 })
        //             .delay(0.5)
        //     )
        //     .start()



        //获取spColor
        AssetManager.load(GameData.curGameStyle,"picture_lv205/r",cc.SpriteFrame,null,(spriteFrame:cc.SpriteFrame)=>{
            this.spColor = spriteFrame;


            //找到并设置头的位置
             for (let i = 0; i < this.map.childrenCount; i++) {
                var script = this.map.children[i].getComponent(mapitem_205);
                if (script.startnode) {

                    //设置头所在方块颜色
                    this.cubeColorUpdate(i);

                    this.tou.position = this.node.getChildByName("bg").convertToNodeSpaceAR(this.map.convertToWorldSpaceAR(this.map.children[i].position));
                    this.linelist[this.linelist.length] = new cc.Vec2(this.tou.x, this.tou.y);
                    break;
            }
        }
    })



        //是否重置data_205（在跳过按钮、下一关按钮设置 data_205.isgame = true， 防止重置 ）
        if(!data_205.isgame){

            //重置关卡数据
            data_205.curlv = 1;
        }

        this.curlv = data_205.curlv;

        //默认假设当前关游戏会被退出 
        data_205.isgame = false;



        //#region 参数设置

       
        //设置头和地图大小
        this.mapAndtouSet();

        //设置线条长度
        this.gra.getComponent(cc.Graphics).lineWidth = 75;
        this.gra2.getComponent(cc.Graphics).lineWidth = 75;

        //创建并设置描边
        this.gra3 = new cc.Node("gra3");

        this.gra3.addComponent(cc.Graphics);

        //黑色描边
        this.gra3.getComponent(cc.Graphics).strokeColor.fromHEX("#0A0A0A");
        this.gra3.getComponent(cc.Graphics).lineWidth = 80;
        this.gra3.getComponent(cc.Graphics).lineJoin = cc.Graphics.LineJoin.ROUND;
        this.gra3.getComponent(cc.Graphics).lineCap = cc.Graphics.LineCap.ROUND;

        this.node.getChildByName("bg").addChild(this.gra3);

        //设置渲染在里层
        this.gra.zIndex = 1;
        this.gra2.zIndex = 1;
        this.gra3.zIndex = 0;
        this.tou.zIndex = 2;
        this.g.zIndex = 3;
        // console.log(this.gra3);





        this.tou.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.tou.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
       // this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on("gamewin_205", () => {
            this.checknextlv();
            // }, 1.5);
        }, this);


        
        this.node.on("refresh_pf", this.changetou, this);
        this.loadTou();


        //加载调试画线工具
        // AssetManager.load(GameData.curGameStyle,"Line",cc.Prefab,null,(line:cc.Prefab) =>{

        //         this.LineNode = cc.instantiate(line);

        //         this.node.addChild(this.LineNode)
        //         this.Line = this.LineNode.getComponent(cc.Graphics);

        //         console.log("load success",this.LineNode,this.Line);


        //     })

        this.node.getChildByName("bg").getChildByName("btn_pf").scale = 1.3;

        /**加载标题 */
        AssetManager.load(GameData.curGameStyle,"biaoti",cc.Prefab,null,(biaoti:cc.Prefab)=>{
                let node = cc.instantiate(biaoti);

                node.getComponent(cc.Label).string = "第 " + this.curlv.toString() + " 关";

                this.node.addChild(node);

                node.position = new cc.Vec3(11.209,673.99,0);
        })


            
    }


    //#region 角色头设置与切换
    loadTou() {
        this.tou.children[0].destroy();
        var namelist = data_205.usetou.split("xk");
        AssetManager.load(GameData.curGameStyle, "tou_sk_205", cc.Prefab, null, (icon: cc.Prefab) => {
            var sk = cc.instantiate(icon);
            this.tou.addChild(sk);
            sk.setPosition(0, -40);
            sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("r" + namelist[1], -1);

            // //更换秦始皇描边颜色(白色)
            // if(namelist[1] == "5") this.gra3.getComponent(cc.Graphics).strokeColor.fromHEX("#FFFFFF");
            // //黑色
            // else this.gra3.getComponent(cc.Graphics).strokeColor.fromHEX("#0A0A0A");

            var gra = this.gra.getComponent(cc.Graphics);
            var gra2 = this.gra2.getComponent(cc.Graphics);
            gra.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);
            gra2.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);

            // let mouth = sk.getChildByName("mouthSke");

            // this.mouthSke = mouth.getComponent(dragonBones.ArmatureDisplay);

            // console.log(this.mouthSke);

        })

        //加载地图道具图标
        this.mapIconUpate(namelist[1]);
    }


    //#region 方块颜色
    cubeIndex:number;
    /**加载方块颜色 */
    cubeColorUpdate(i:number){
        //改变方块颜色
        var namelist = data_205.usetou.split("xk");

        this.map.children[i].getComponent(cc.Sprite).spriteFrame = this.spColor;

        let  tempColor = new cc.Color();

        this.map.children[i].color = cc.Color.fromHEX(tempColor,this.squacolor[Number(namelist[1])-1]);
    }

    /**道具图标加载 */
    mapIconUpate(lvname:string){

        
        //遍历地图方块
        const fun = (icon:cc.SpriteFrame)=>{
            let cubes = this.map.children; 
            cubes.forEach(cube =>{
                if(cube.children.length == 0){
                    const node = new cc.Node("icon");
                    node.addComponent(cc.Sprite);
                    cube.addChild(node);

            }

                if(cube.getComponent(mapitem_205).qiang) return;
                cube.children[0].getComponent(cc.Sprite).spriteFrame = icon;
        });
        }

        //图片加载
        const loadFun = (spName:string)=>{
            AssetManager.load(GameData.curGameStyle,spName,cc.SpriteFrame,null,(icon:cc.SpriteFrame) =>{

                console.log("图标加载成功");
                fun(icon);
            })
        }

        switch(Number(lvname)){

            //咖啡女（咖啡）
            case 1 :
                loadFun("picture_lv205/"+"d3")
                break;
            //忍者（刀）
            case 2 :
                loadFun("picture_lv205/"+"d1")
                break;
            //菠萝猩猩（菠萝）
            case 3 :
                loadFun("picture_lv205/"+"d6")
                break;
            //木棍人（木棍）
            case 4 :
                loadFun("picture_lv205/"+"d2")
                break;
            //秦始皇（北极熊）
            case 5 :
                loadFun("picture_lv205/"+"d5")
                break;
        }


 

        

        
    }
    /**换头与换身颜色 */
    changetou() {
        var gra = this.gra.getComponent(cc.Graphics);
        var gra2 = this.gra2.getComponent(cc.Graphics);
        var namelist = data_205.usetou.split("xk");
        this.tou.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("r" + namelist[1], -1);
        gra.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);
        gra2.strokeColor.fromHEX(this.gracolor[Number(namelist[1]) - 1]);
        gra.clear();

        //加载更新道具图标
        this.mapIconUpate(namelist[1]);


        //重绘方块颜色
        this.map.children.forEach(cube =>{

            var namelist = data_205.usetou.split("xk");
            let tempColor = new cc.Color();
            if(cube.getComponent(mapitem_205).isuse)
            cube.color = cc.Color.fromHEX(tempColor,this.squacolor[Number(namelist[1]) - 1]);
        })

        //重新绘制线条身体
        for (let i = 0; i < this.linelist.length; i++) {

            
            var poi = this.linelist[i];
            var poi2 = this.linelist[i + 1];
            if (!poi2) return
            gra2.moveTo(poi.x, poi.y);
            gra2.lineTo(poi2.x, poi2.y);
            gra2.stroke();
        }

        
    }



    //#region 触摸事件
    toustartpoi = null;
    touendpoi = null;
    onTouchStart(even: cc.Event.EventTouch) {
        this.toustartpoi = this.node.convertToNodeSpaceAR(even.getLocation());
    }
    //画线组件
    LineNode:cc.Node;
    Line:cc.Graphics;


    /**检测触摸是否超出地图范围 */
    mapAearText(even: cc.Event.EventTouch){

        let isUnlawful  = true;

        //let pos_1 = this.tou.parent.convertToNodeSpaceAR(even.getLocation());

        let pos = this.map.convertToNodeSpaceAR(even.getLocation());

        this.map.children.forEach(children=>{

            if(children.getBoundingBox().contains(pos))  isUnlawful = false;

        })

        // if(this.tou.getBoundingBox().contains(pos_1)
        // ||this.curcheckbox.getBoundingBox().contains(pos))  isUnlawful = false;

         return isUnlawful;
    }

    
    onTouchMove(even: cc.Event.EventTouch) {

        if(this.getLock)  return;

       
        let curpoint = this.node.convertToNodeSpaceAR(even.getLocation());

        if(this.mapAearText(even)) return;

        if(Math.abs(curpoint.x - this.toustartpoi.x) >= this.tou.width || 
         Math.abs(curpoint.y - this.toustartpoi.y) >= this.tou.height){

            if (this.isgo) return
            this.touendpoi = this.node.convertToNodeSpaceAR(even.getLocation());
            if (cc.Vec2.distance(this.toustartpoi, this.touendpoi) < 10) return
                var angle = this.cal_angle(this.toustartpoi, this.touendpoi);

                //angle <= 135 && angle >= 45
                if (angle <= 135 && angle >= 45) {
                    this.checkdir = "right";
                }
                //angle <= 225 && angle > 135
                else if (angle <= 225 && angle > 135) {
                    this.checkdir = "up";
                } 
                //(angle <= 270 && angle > 225) || angle <= -45
                else if ((angle <= 270 && angle > 225) || angle <= -45) {
                    this.checkdir = "left";
                } 
                //angle < 45 && angle > -45
                else if (angle < 45 && angle > -45) {
                    this.checkdir = "down";
                }

        // var poi1 = this.tou.parent.convertToNodeSpaceAR(this.map.convertToWorldSpaceAR(this.curcheckbox.position));
        // let touPos = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position));
            
        // switch (this.checkdir) {
        //     case "left":
        //         if(touPos -)   
        //         break;
        //     case "right":
        //         if(touPos)
        //         break;
        //     case "up":
                
        //         break;
        //     case "down":
                
        //         break;

        // }










         //console.log("方向:" + this.checkdir);    //-45 下 45  右
        

         //画线调试
        //  this.Line.clear();
        //  this.Line.moveTo(this.toustartpoi.x, this.toustartpoi.y);
        //  this.Line.lineTo(curpoint.x, curpoint.y);
        //  this.Line.stroke();


        this.checkBox(even);

        


        }
    }
    onTouchEnd(even: cc.Event.EventTouch) {
        // if (this.isgo) return
        // this.touendpoi = this.node.convertToNodeSpaceAR(even.getLocation());
        // if (cc.Vec2.distance(this.toustartpoi, this.touendpoi) < 10) return
        // var angle = this.cal_angle(this.toustartpoi, this.touendpoi);
        // if (angle <= 135 && angle >= 45) {
        //     this.checkdir = "right";
        // } else if (angle <= 225 && angle > 135) {
        //     this.checkdir = "up";
        // } else if ((angle <= 270 && angle > 225) || angle <= -45) {
        //     this.checkdir = "left";
        // } else if (angle < 45 && angle > -45) {
        //     this.checkdir = "down";
        // }
        // // console.log("方向:" + this.checkdir)
        // this.checkBox();
    }


    cal_angle(linepos: cc.Vec2, pos: cc.Vec2) {
        var xDis = pos.x - linepos.x;
        var yDis = pos.y - linepos.y;
        var angle = Math.atan2(yDis, xDis);
        angle = Math.round(angle * 180 / Math.PI) + 90;
        // console.log("angle=" + angle);
        return angle;
    }

    //#region  吃东西动画

    /**头膨胀 */
    touSwell(){
        
        let startScale = this.tou.scale;
        cc.tween(this.tou)
        .to(0.3,{scale:startScale - 0.3})
        .delay(0.1)
        .to(0.2,{scale:startScale})
        .start();
    }


    mouthSke:dragonBones.ArmatureDisplay;
    mouthing = false;

    audioLock = true;

    /**播放嘴巴动画 */
    mouthPlay(){
        
       //暂停移动
       this.mouthing = true;
        
       let sk = this.tou.children[0].getComponent(dragonBones.ArmatureDisplay);
       var namelist = data_205.usetou.split("xk");
       sk.playAnimation("r" + namelist[1]+"_zb", 1);
    
       if(this.audioLock){

            this.audioLock = false;

            AudioManager.playEffect("吃_205",false,()=>{
                this.audioLock = true;
            });
            
       }
       

      // sk.getComponent(dragonBones.ArmatureDisplay).playAnimation()

        // if(this.cubeIndex)
        // {
        //     this.cubeColorUpdate(this.cubeIndex);
        //     this.cubeIndex = null;
        // }
        this.addOneTimeListener(sk,()=>{
            
            sk.getComponent(dragonBones.ArmatureDisplay).playAnimation("r" + namelist[1], 1);
            this.mouthing = false;
        })
        
    }
    //#region update()

    

    update() {
        if (this.isgo == false || !this.curcheckbox) return

        //将头  以速度：1/10移动至curcheckbox位置
        var poi1 = this.tou.parent.convertToNodeSpaceAR(this.map.convertToWorldSpaceAR(this.curcheckbox.position));
        this.tou.x += (poi1.x - this.startTouPoi.x) / 5;
        this.tou.y += (poi1.y - this.startTouPoi.y) / 5;



        var dis = cc.Vec2.distance(this.tou.position, poi1);
        var gra = this.gra.getComponent(cc.Graphics);

        //到达目标点
        if (dis <= 1.5) {

            this.isgo = false;

            this.getLock = false;

            this.cubeColorUpdate(this.cubeIndex);
            this.mouthPlay();
            

            this.curwinbox = this.pathList[this.pathList.length - 1];
            this.curcheckbox = null;
            this.pathList = [];

            var gra2 = this.gra2.getComponent(cc.Graphics);
            var gra3 = this.gra3.getComponent(cc.Graphics);
            // gra2.clear();
            this.linelist[this.linelist.length] = new cc.Vec2(this.tou.x, this.tou.y);

            //绘制描边
            gra3.moveTo(this.startTouPoi.x, this.startTouPoi.y);
            gra3.lineTo(this.tou.x, this.tou.y);
            gra3.stroke();


            //绘制身体
            gra2.moveTo(this.startTouPoi.x, this.startTouPoi.y);
            gra2.lineTo(this.tou.x, this.tou.y);
            gra2.stroke();
            

            gra.clear();
            cc.Tween.stopAllByTarget(this.map);
            //this.zhengdong();
            this.checkWin();
        }
        gra.moveTo(this.startTouPoi.x, this.startTouPoi.y);
        gra.lineTo(this.tou.x, this.tou.y);
        gra.stroke();

    }


    //#region  获取目标格子
    /**行走到格子后才能继续走下一格子 */
    getLock = false;
    
    checkBox(even:cc.Event.EventTouch) {

        /**头位置（为格子坐标，无格子则为自身坐标） */
        var toumappoi
        /**移动头距后位置 */
        var poi: cc.Vec2 = null;
        switch (this.checkdir) {
            case "left":
                //到达目标格子
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position));
                //行走中
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x - this.tou.width, toumappoi.y);
                break;
            case "right":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x + this.tou.width, toumappoi.y);
                break;
            case "up":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x, toumappoi.y + this.tou.height);
                break;
            case "down":
                if (!this.curcheckbox) toumappoi = this.map.convertToNodeSpaceAR(this.tou.parent.convertToWorldSpaceAR(this.tou.position))
                else toumappoi = this.curcheckbox.getPosition();
                poi = new cc.Vec2(toumappoi.x, toumappoi.y - this.tou.height);
                break;
        }
        //遍历到达该方向上能到达的节点
        for (let i = 0; i < this.map.childrenCount; i++) {
            
            var script = this.map.children[i].getComponent(mapitem_205);

            let gridBound = this.map.children[i].getBoundingBox();
            let touchPos = this.map.convertToNodeSpaceAR(even.getLocation());

            //不是墙或已走过点，且该格子能被行走直线相交,递归寻找除自身外的节点其他
            if (gridBound.contains(touchPos)&&!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, gridBound) && this.pathList.indexOf(this.map.children[i]) == -1) {
                if (!this.curcheckbox && (script.isuse || script.qiang)) return



                //记录当前格子，在移动到这个格子前不再检测这一格子
                this.pathList[this.pathList.length] = this.map.children[i];

                this.map.children[i].getComponent(mapitem_205).isuse = true;

                this.cubeIndex = i;
                //设置当前目标格子
                this.curcheckbox = this.map.children[i];

                //打开移动
                this.startTouPoi = this.tou.getPosition();

                this.toustartpoi = this.startTouPoi;

                this.isgo = true;

                this.getLock = true;   //等待到达格子时解锁

                break;
            }
        }
    }

    zhengdong() {
        var zx = 0;
        var zy = 0;
        switch (this.checkdir) {
            case "left":
                zx = -7;
                zy = 0;
                break;
            case "right":
                zx = 7;
                zy = 0;
                break;
            case "up":
                zx = 0;
                zy = 7;
                break;
            case "down":
                zx = 0;
                zy = -7;
                break;
        }
        cc.tween(this.map)
            .to(0.05, { x: zx, y: zy })
            .to(0.05, { x: 0, y: 0 })
            .start()
    }


    //#region 判定方法
    curwinbox: cc.Node = null;
    checkWin() {
        var toumappoi = this.curwinbox
        var poi
        var isall = true;
        for (let i = 0; i < this.map.childrenCount; i++) {
            var boxrect = this.map.children[i].getBoundingBox();
            var script = this.map.children[i].getComponent(mapitem_205);
            if (!script.isuse) isall = false;

            //检测四个方向是否可移动，不可移动则进入胜负判定
            poi = new cc.Vec2(toumappoi.x - this.tou.width, toumappoi.y);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv205");
                this.isgo = false;
                return;
            }
            poi = new cc.Vec2(toumappoi.x + this.tou.width, toumappoi.y);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv205");
                this.isgo = false;
                return;
            }
            poi = new cc.Vec2(toumappoi.x, toumappoi.y + this.tou.height);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv205");
                this.isgo = false;
                return;
            }
            poi = new cc.Vec2(toumappoi.x, toumappoi.y - this.tou.height);
            if (!script.isuse && !script.qiang && cc.Intersection.lineRect(new cc.Vec2(toumappoi.x, toumappoi.y), poi, boxrect)) {
                AudioManager.playEffect("移动_lv205");
                this.isgo = false;
                return;
            }
            if (i == this.map.childrenCount - 1) {
                if (!isall) {
                    AssetManager.load(GameData.curGameStyle, "xy_ske_205", cc.Prefab, null, (UI: cc.Prefab) => {
                        AudioManager.playEffect("撞晕_lv205");
                        var UINode = cc.instantiate(UI);
                        UINode.parent = this.tou;
                        this.scheduleOnce(() => {
                            this.onlost();
                        }, 1)
                    })
                }
                else this.onwin();
                this.isgo = false;
            }
        }

    }

    startTouPoi = null;
    isgo = false;
    checkdir = ""
    curcheckbox: cc.Node = null;
    pathList = [];


    checknextlv() {

        data_205.curlv += 1;

        if (this.nextLv) {

            //游戏继续
            data_205.isgame = true;

            this.node.cleanup();
            this.node.destroy();
            var nl = cc.instantiate(this.nextLv);
            nl.parent = cc.find("Canvas")
        } else {
            // console.log(data_205.isgame);
            this.loadend();
        }
    }

    onwin() {
        var handler = () => {

            this.scheduleOnce(() => {
                if (this.nextLv) {
                    //游戏继续
                    data_205.isgame = true;

                    AssetManager.load(GameData.curGameStyle, "end_205", cc.Prefab, null, (UI: cc.Prefab) => {
                        var UINode = cc.instantiate(UI);
                        UINode.parent = this.node;
                        UINode.getComponent(end_205).oninit(true);
                    })
                } else {

                    this.loadend();
                }
            }, 1);
            // }
            // else {
            // }
        }
        GameData.PauseGame = true;
        this.g.active = true;
        this.g.scale = 0;
        AudioManager.playEffect("finishjq");
        cc.Tween.stopAllByTarget(this.g);
        cc.tween(this.g)
            .delay(0.3)
            .to(0.8, { scale: 1 })
            .call(() => {
                handler && handler();
            })
            .start()
    }
    onlost() {
        // this.unschedule(this.Timeing);

        
        GameData.PauseGame = true;
        this.node.cleanup();
        this.scheduleOnce(() => {
            AssetManager.load(GameData.curGameStyle, "end_205", cc.Prefab, null, (UI: cc.Prefab) => {
                var UINode = cc.instantiate(UI);
                UINode.parent = this.node;
                UINode.getComponent(end_205).oninit(false);
            })
        }, 0.7);
    }

    restart() {

        GameData.onDele();
        //继续游戏
        data_205.isgame = true;

        AssetManager.load(GameData.curGameStyle, this.nodename, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    };

    isshowVideo = false;
    BtnHandler(event: cc.Event.EventTouch) {
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (event.currentTarget.name) {
            case "btn_tiaoguo":
                if (GameData.PauseGame == true) return;
                VideoManager.getInstance().showVideo(() => {
                    // this.node.cleanup();
                    // this.node.destroy();
                    // var nl = cc.instantiate(this.nextLv);
                    // nl.parent = cc.find("Canvas")

                    this.checknextlv();
                })
                break;
            case "fanhui":
                this.openpausePanel();
                // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, hall: cc.Prefab) => {
                //     var HallnNode = cc.instantiate(hall);
                //     HallnNode.parent = cc.find("Canvas");
                //     GameData.getMap = [];
                //     this.node.destroy();
                //     VideoManager.getInstance().showBaoXiang();
                // })
                break;
            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60);})
                break;
            case "tishi":
                // var handlers = () => {
                //     cc.resources.load("prefabs/zc/TipPanel", cc.Prefab, (err, tip: cc.Prefab) => {
                //         var HallnNode = cc.instantiate(tip);
                //         HallnNode.getComponent(tipsPanel).curtipList = zc_config.lv5tip;
                //         HallnNode.parent = cc.find("Canvas");
                //         this.node.getChildByName("bg").getChildByName("tishi").getChildByName("luxiang").active = false;
                //         this.isshowVideo = true;
                //     })
                // }
                // this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(handlers);
                break;
            case "btn_pf":
                if (GameData.PauseGame == true) return;
                AssetManager.load(GameData.curGameStyle, "pfpanel_205", cc.Prefab, null, (UI: cc.Prefab) => {
                    var UINode = cc.instantiate(UI);
                    UINode.parent = this.node;
                })
                break;
            case "jiashi2":
                VideoManager.getInstance().showVideo(() => {
                    this.setTime(250);
                })
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => {
                    this.tipsPanel.active = true;
                    GameData.PauseGame = true;
                })
                break;
            case "x":
                this.tipsPanel.active = false;
                GameData.PauseGame = false;
                break;
        }
    }

    loadend() {

        

        AudioManager.playEffect(AudioManager.common.BUTTON);
        this.endwin("prefabs/zc/zc_winend");
    }

    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.setTime(200)
        this.schedule(this.Timeing, 1);
    }

    setTime(time: number) {
        // GameData.PauseGame = true;
        // if (this.startTime <= 0 || this.startTime + time <= 0) return
        this.startTime += time;
        var fuhao = "";
        if (time > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + time.toString();
        this.Timeing();
        cc.Tween.stopAllByTarget(this.addtimetips);
        cc.tween(this.addtimetips)
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }


    Timeing() {
        if (GameData.PauseGame == true || this.startTime == 0) return;
        this.startTime--;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        if (this.startTime == 0) {
            // this.unschedule(this.Timeing);
            GameData.PauseGame = true;
            // this.node.cleanup();
            this.scheduleOnce(() => {
                this.endlost("prefabs/hz/endlost_hz");
                // this.node.destroy();
            }, 0.7);
        }
    }
}

