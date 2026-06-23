import { Ske } from "../lv201/zjwn_lv201";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    
    //事件开始的坐标
    private startPos: cc.Vec2 = cc.Vec2.ZERO;
    //事件结束的坐标
    private endPos: cc.Vec2 = cc.Vec2.ZERO;

    //获取龙骨动画节点
    @property(cc.Node)
    main:cc.Node = null;
    
    mainSrict = null

    //移动开始判断
    isTouch: boolean = false;
    
    //新娘裙子判断
    
    touchOffset: cc.Vec2;

    delayTime: number = 1.0;
    
    //存储原来的位置
    tempPos: cc.Vec2 = cc.Vec2.ZERO;

    
    maxZIndex  = 9999;
    oginZIndex = 0;

    
    

    protected onLoad(): void {
        //注册触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        //主节点的脚本
        this.mainSrict = this.main.getComponent("xhpz_lv272");
        this.oginZIndex = this.node.zIndex;
        this.tempPos.x = this.node.x;
        this.tempPos.y = this.node.y; 
    }

    
   
    
    

    onTouchStart(even: cc.Event.EventTouch){
        //点击开始节点
        this.startPos = even.getLocation();
        this.node.zIndex = this.maxZIndex;
        if (this.mainSrict.ispd == true || this.mainSrict.value == 12)
            return;
        //进行节点名字判断
        if ((this.node.name == "hb")||(this.node.name == "ts")||
            (this.node.name) == "jz" && this.mainSrict.flag[4] == false){
            this.isTouch = true;
        }
        //最后进行伴娘和伴郎的互换
        if ((this.node.name == "bnnode" || this.node.name == "blnode") && this.mainSrict.value == 11) {
            this.isTouch = true;
        }
        if (this.node.name == "xnx1" && this.mainSrict.flag[9] == false && this.main.getComponent("xhpz_lv272").isXNHs) {
            this.isTouch = true;
        }
        if(this.node.name == "blx" && this.main.getComponent("xhpz_lv272").isXNHs && this.mainSrict.flag[9] == false)
        {
            this.node.getChildByName("blx1").active = true;
            this.isTouch = true;
        }
            
        
        
    }

    onTouchMove(even: cc.Event.EventTouch){
        if (!this.isTouch)
            return;
       if (this.mainSrict.ispd == true || this.mainSrict.value == 12)
            return;
        //this.node.zIndex = this.maxZIndex;

        var delay = even.getDelta();
        
        this.node.x += delay.x;
        this.node.y += delay.y;
        if (this.node.name == "blx") {
            let bl1 = this.main.getChildByName("bj").getChildByName("blnode").getChildByName("bl1").getComponent(dragonBones.ArmatureDisplay);
            bl1.armature().getSlot("blj").displayIndex = 0;
        }
        if (this.node.name == "jz") {
            let bn = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bn1").getComponent(dragonBones.ArmatureDisplay);
            bn.armature().getSlot("jz").displayIndex = -1;
        }
        if (this.node.name == "xnx1") {
            let bl1 = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
            bl1.armature().getSlot("xj").displayIndex = 0;
        }
    }

    onTouchEnd(even: cc.Event.EventTouch){
        if (this.mainSrict.ispd == true)
            return;
        if (this.mainSrict.ispd == true || this.mainSrict.value == 12)
            return;
        this.endPos = even.getLocation();

        this.blTouchHead();
        this.isTouch = false;
        if (this.node.name == "blx"||this.node.name == "hb"||this.node.name == "ts"||this.node.name == "jz"||
            this.node.name == "bnnode" || this.node.name == "blnode"||this.node.name == "xnx1")
            this.moveHandler(even.currentTarget);
        
        this.isTouch = false;
        this.node.zIndex = this.oginZIndex;         
        
    }
    //滑动逻辑实现函数
    private blTouchHead(){
        //获取滑动距离
        const delta = this.endPos.sub(this.startPos);
        //判断是否右划新郎的脸
        
        switch (this.node.name) {
            case "xlhd":
                //判断是否右划新郎的脸
                if (delta.x >= 10 && this.mainSrict.ispd == false && this.mainSrict.flag[5] == false) {
                    let xlhd = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
                    xlhd.armature().getSlot("xt1").displayIndex = 1;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.flag[5] = true;
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    let tempNode = this.main.getChildByName("bj").getChildByName("xnxl").getChildByName("xlsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "要看镜头了");
                }
                break;
               
            case "blshou":
                //滑动bl的手的事件逻辑处理
                if (delta.y <= 20 && this.mainSrict.ispd == false && this.mainSrict.flag[10] == false) {
                    let blshou = this.main.getChildByName("bj").getChildByName("blnode").getChildByName("bl1").getComponent(dragonBones.ArmatureDisplay);
                    blshou.armature().getSlot("bls1").displayIndex = 0;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.flag[10] = true;
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    let tempNode = this.main.getChildByName("bj").getChildByName("blnode").getChildByName("blsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "搂对象搂习惯了");
                }
                break;
            case "xlshou":
                //处理滑动新郎手的逻辑
                if (delta.y <= 20 && this.mainSrict.ispd == false && this.mainSrict.flag[1] == false) {
                    let xlshou = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
                    xlshou.armature().getSlot("xs").displayIndex = 1;
                    let bnshou = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bn1").getComponent(dragonBones.ArmatureDisplay);
                    this.mainSrict.flag[1] = true;
                    if (this.mainSrict.flag[0])
                        bnshou.armature().getSlot("bns1").displayIndex = 3;
                    else
                        bnshou.armature().getSlot("bns1").displayIndex = 1;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                     //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    let tempNode = this.main.getChildByName("bj").getChildByName("xnxl").getChildByName("xlsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "不好意思，牵错人了");
                    
                }
                break;
            case "bnhd":
                //处理滑动伴娘头的逻辑
                if (delta.x <= 20 && this.mainSrict.ispd == false && this.mainSrict.flag[0] == false) {
                    let bnhd = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bn1").getComponent(dragonBones.ArmatureDisplay);
                    this.mainSrict.flag[0] = true;
                    if (this.mainSrict.flag[1])
                        bnhd.armature().getSlot("bns1").displayIndex = 3;
                    else
                        bnhd.armature().getSlot("bns1").displayIndex = 2;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    let tempNode = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "我把镜头方向搞反了");
                }
                break;
            case "xnhs":
                //处理上滑新娘婚纱的逻辑
                if (delta.y >= 20 && this.mainSrict.isBLX == false && this.mainSrict.ispd == false) {
                    let xnhs = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
                    xnhs.armature().getSlot("xst").displayIndex = -1;
                    
                    this.main.getChildByName("bj").getChildByName("xnx1").active = true;
                    
                    this.main.getComponent("xhpz_lv272").isXNHs = true;
                    this.main.getChildByName("bj").getChildByName("xnhs").active = false;
                }
                break;
            case "bnsw":
                //处理滑动伴娘丝袜的逻辑
                if (delta.y >= 20 && this.mainSrict.flag[2] == false) {
                    let bnsw = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bn1").getComponent(dragonBones.ArmatureDisplay);
                    bnsw.armature().getSlot("bnt").displayIndex = 0;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.flag[2] = true;
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    let tempNode = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "袜子有点松，老往下掉");
                }
                break;
            default:
                break;
        }
    }

    //移动碰撞检测
    moveHandler(itemNode: cc.Node){
        //矩形碰撞检测
        let isCollide = false;
        if (itemNode.name == "blx") {
            const node = this.main.getComponent("xhpz_lv272").xnxNode;
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "hb") {
            const node = this.main.getComponent("xhpz_lv272").dzNode;
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "ts") {
            const node = this.main.getChildByName("bj").getChildByName("xnlian");
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "jz") {
            const node = this.main.getChildByName("bj").getChildByName("xnjz");
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (this.node.name == "bnnode" && this.mainSrict.value == 11) {
            const node = this.main.getChildByName("bj").getChildByName("blnode");
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (this.node.name == "blnode" && this.mainSrict.value == 11) {
            const node = this.main.getChildByName("bj").getChildByName("bnnode");
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (this.node.name == "xnx1") {
            const node = this.main.getChildByName("bj").getChildByName("blx");
            isCollide = cc.Intersection.rectRect(node.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }



        //没有到目标点 放回原位
        if (isCollide == false) {
            this.node.x = this.tempPos.x;
            this.node.y = this.tempPos.y;
            return;
        }

        if (isCollide) {
            switch (itemNode.name) {
                case "blx":
                    //处理bl和xn的鞋子互换
                    itemNode.active = false;
                    this.main.getChildByName("bj").getChildByName("xnx1").active = false;
                    this.main.getChildByName("bj").getChildByName("xnx").active = false;
                    let xlhd = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
                    xlhd.armature().getSlot("xj").displayIndex = 2;
                    let bl1 = this.main.getChildByName("bj").getChildByName("blnode").getChildByName("bl1").getComponent(dragonBones.ArmatureDisplay);
                    bl1.armature().getSlot("blj").displayIndex = 1;
                    this.mainSrict.flag[9] = true;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.isBLX = true;
                    //文本信息显示
                    this.mainSrict.ispd = true;
                    let tempNode = this.main.getChildByName("bj").getChildByName("xnxl").getChildByName("xnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "我咋把鞋子穿错了");
                    this.schedule(() => {
                        xlhd.armature().getSlot("xst").displayIndex = 0;
                    },1);
                    break;
                case "xnx1":
                    itemNode.active = false;
                    this.main.getChildByName("bj").getChildByName("blx").active = false;
                    let xn = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
                    xn.armature().getSlot("xj").displayIndex = 2;
                    let bl = this.main.getChildByName("bj").getChildByName("blnode").getChildByName("bl1").getComponent(dragonBones.ArmatureDisplay);
                    bl.armature().getSlot("blj").displayIndex = 1;
                    this.mainSrict.flag[9] = true;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.isBLX = true;
                    //文本信息显示
                    this.mainSrict.ispd = true;
                    tempNode = this.main.getChildByName("bj").getChildByName("xnxl").getChildByName("xnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "我咋把鞋子穿错了");
                    this.schedule(() => {
                        xn.armature().getSlot("xst").displayIndex = 0;
                    },1);
                    break;
                
                case "hb":
                    //放置汉堡事件逻辑
                    let bn1 = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bn1").getComponent(dragonBones.ArmatureDisplay);
                    bn1.armature().getSlot("bnd").displayIndex = -1;
                    
                    itemNode.x = this.main.getChildByName("bj").getChildByName("bnhd").x;
                    itemNode.y = this.main.getChildByName("bj").getChildByName("bnhd").y;
                    
                    itemNode.active = false;
                    this.main.getComponent("xhpz_lv272").dz.active = true;
                     
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.flag[3] = true;
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    tempNode = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "通畅多了");
                    break;
                //放置头纱
                case "ts":
                    let xnxl = this.main.getChildByName("bj").getChildByName("xnxl").getComponent(dragonBones.ArmatureDisplay);
                    xnxl.armature().getSlot("ts").displayIndex = 0;
                    itemNode.active = false;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.flag[8] = true;
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    tempNode = this.main.getChildByName("bj").getChildByName("xnxl").getChildByName("xnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "怪不得总觉得少了些什么");            
                    break;
                //放置戒指
                case "jz":
                    itemNode.x = this.main.getChildByName("bj").getChildByName("xnjz").x;
                    itemNode.y = this.main.getChildByName("bj").getChildByName("xnjz").y;
                    //改变满意度
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.flag[4] = true;
                    //文本信息音乐处理
                    this.mainSrict.ispd = true;
                    tempNode = this.main.getChildByName("bj").getChildByName("bnnode").getChildByName("bnsp");
                    this.mainSrict.ShowTxtAndMusic(tempNode, "我就是看着好看借过来戴戴嘛");
                    break;
                case "bnnode":
                    //itemNode.x = this.main.getChildByName("bj").getChildByName("blnode").x;
                    //itemNode.y = this.main.getChildByName("bj").getChildByName("blnode").y;
                    itemNode.x = 263;
                    itemNode.y = -116;
                    itemNode.scaleX = -1;
                    //this.main.getChildByName("bj").getChildByName("blnode").x = this.tempPos.x;
                    //this.main.getChildByName("bj").getChildByName("blnode").y = this.tempPos.y;
                    this.main.getChildByName("bj").getChildByName("blnode").x = -231;
                    this.main.getChildByName("bj").getChildByName("blnode").y = -74;
                    this.main.getChildByName("bj").getChildByName("blnode").scaleX = -1;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    break;
                case "blnode":
                    itemNode.x = -231;
                    itemNode.y = -74;
                    itemNode.scaleX = -1;
                    //this.main.getChildByName("bj").getChildByName("blnode").x = this.tempPos.x;
                    //this.main.getChildByName("bj").getChildByName("blnode").y = this.tempPos.y;
                    this.main.getChildByName("bj").getChildByName("bnnode").x = 263;
                    this.main.getChildByName("bj").getChildByName("bnnode").y = -116;
                    this.main.getChildByName("bj").getChildByName("bnnode").scaleX = -1;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);

                    break; 
                default:
                    break;
            }
            
        }
    }

    

   

    


    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    

}
