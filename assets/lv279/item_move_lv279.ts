import yjpz_lv279 from "./yjpz_lv279";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    //获取主节点
    @property(cc.Node)
    main:cc.Node = null;

    mainSrict :yjpz_lv279= null;
    


    //事件开始的坐标
    private startPos: cc.Vec2 = cc.Vec2.ZERO;
    //事件结束的坐标
    private endPos: cc.Vec2 = cc.Vec2.ZERO;

    //存储原来的位置
    tempPos: cc.Vec2 = cc.Vec2.ZERO;

    //设置目标点
    @property(cc.Node)
    target:cc.Node = null;

    //移动开始判断
    isTouch: boolean = false;

    private longPressTime: number = 1.0;
    
    // 长按计时器
    private longPressTimer: number = 0;
    // 是否正在长按
    private isPressing: boolean = false;

    protected onLoad(): void {
        //注册触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.tempPos.x = this.node.x;
        this.tempPos.y = this.node.y; 
        this.mainSrict = this.main.getComponent("yjpz_lv279");

        
    }

    

    Init(){
        
    }
    
    onTouchStart(event: cc.Event.EventTouch){
        if (this.mainSrict.ispd == true)
            return;
        this.startPos = event.getLocation();
        this.isTouch = this.JudgeMove(event.target.name);
        if (this.node.name == "kuzi") {
            this.mainSrict.ChangeSlot(this.node.parent, this.target.name, 1);
        }
        if (this.node.name == "tousheng") {
            this.mainSrict.ChangeSlot(this.node.parent, this.node.name, -1);
            this.node.getChildByName("111").active = true;
        }

        this.isPressing = true;
        this.longPressTimer = 0;
        
        // 开始计时
        if (this.mainSrict.state[7] == false && this.node.name == "biaoqing" && this.node.parent.name == "lumi") {
            this.schedule(this.checkLongPress, 0.1);
        }

    }
    private checkLongPress() {
        if (!this.isPressing) return;
        
        this.longPressTimer += 0.1;
        
        if (this.longPressTimer >= this.longPressTime && this.node.name == "biaoqing" && this.node.parent.name == "lumi") {
            // 触发长按事件
            this.onLongPressTriggered();
            this.isPressing = false;
            this.unschedule(this.checkLongPress);
        }
    }

    private onLongPressTriggered() {
        // 在这里处理长按后的逻辑
        this,this.mainSrict.ChangeSlot(this.node.parent, this.node.name, 0);
        if (this.mainSrict.state[7] == false) {
            this.mainSrict.value++;
            this.mainSrict.ChangeValue(this.mainSrict.value);
            this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[7]);
        }
        this.mainSrict.state[7] = true;
        

    }

    onTouchMove(event: cc.Event.EventTouch){

        if (!this.isTouch)
            return;
        if (this.mainSrict.ispd == true)
            return;
        const delay = event.getDelta();
        const parentScale = this.node.parent.scale;
        this.node.x += delay.x/parentScale;
        this.node.y += delay.y/parentScale;
    }

    onTouchEnd(event: cc.Event.EventTouch){
        if (!this.isTouch)
            return;
        if (this.mainSrict.ispd == true)
            return;
        this.TouchMove(event.currentTarget);
        this.endPos = event.getLocation();
        this.TouchSlide();
        this.isPressing = false;
        this.unschedule(this.checkLongPress);
        
    }
    //矩形检测
    TouchMove(itemNode: cc.Node) {
        let isCollide = false;
        if (itemNode.name == "kafei" && this.mainSrict.state[0] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "jiandao" && this.mainSrict.state[2] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "kuzi" && this.mainSrict.state[4] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "tousheng" && this.mainSrict.state[8] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "guahudao" && this.mainSrict.state[9] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (itemNode.name == "tou" && this.mainSrict.state[11] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }

        if (itemNode.name == "maojin" && this.mainSrict.state[8] == true  && this.mainSrict.state[10] == false) {
            isCollide = cc.Intersection.rectRect(this.target.getBoundingBoxToWorld(), itemNode.getBoundingBoxToWorld());
        }
        if (isCollide) {
            switch (itemNode.name) {
                case "kafei":
                    this.mainSrict.state[0] = true;
                    this.mainSrict.ChangeSlot(this.node.parent, this.target.name, 1);
                    this.node.active = false;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[0]);
                    break;
                case "jiandao":
                    this.mainSrict.state[2] = true;
                    this.main.getChildByName(itemNode.name).active = true;
                    this.mainSrict.PlayAnimation(this.main.getChildByName(itemNode.name), itemNode.name, 1);
                    
                    itemNode.active = false;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[2]);
                    break;
                case "kuzi":
                    this.mainSrict.state[4] = true;
                    this.mainSrict.ChangeSlot(this.target.parent, this.target.name, -1);
                    this.mainSrict.ChangeSlot(this.node.parent, this.node.name, -1);
                    this.node.active = false;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[4]);
                    break;
                case "tousheng":
                    this.mainSrict.state[8] = true;
                    this.mainSrict.ChangeSlot(this.target.parent, this.target.name, -1);
                    this.mainSrict.ChangeSlot(this.target.parent, "toufa2", 0);
                    this.node.active = false;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.target.parent, this.target.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[8]);
                    break;
                case "guahudao":
                    this.mainSrict.state[9] = true;
                    this.main.getChildByName(itemNode.name).active = true;
                    this.node.active = false;
                    this.mainSrict.ispd = true;
                    this.mainSrict.PlayAnimation(this.main.getChildByName(itemNode.name), itemNode.name, 1);
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                     
                                                
                    break;
                case "tou":
                    this.mainSrict.state[11] = true;
                    this.mainSrict.ChangeSlot(this.node.parent, this.node.name, 0);
                    this.node.active = false;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[11]);
                    break;
                case "maojin":
                    this.mainSrict.state[10] = true;
                    this.main.getChildByName(itemNode.name).active = true;
                    this.mainSrict.PlayAnimation(this.main.getChildByName(itemNode.name), itemNode.name, 1);
                    this.node.active = false;
                    this.mainSrict.ChangeSlot(this.target.parent, "yifu", -1);
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.target.parent, this.target.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[10]);
                    break;

                default:
                    break;
            }
        }

        //没有到目标点 放回原位
        if (isCollide == false) {
            this.node.x = this.tempPos.x;
            this.node.y = this.tempPos.y;
            return;
        }
    }

    //滑动逻辑处理
    TouchSlide(){
        const delta = this.endPos.sub(this.startPos);
        switch (this.node.name) {
            case "zuoshou":
                if (delta.x <= 10 && this.mainSrict.state[1] == false && this.mainSrict.ispd == false) {
                    this.mainSrict.ChangeSlot(this.node.parent, this.node.name, 1);
                    this.mainSrict.state[1] = true;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[1]);
                }
                break;
            case "tui":
                if (delta.y > 10 && this.mainSrict.state[3] == false && this.mainSrict.ispd == false) {
                    this.mainSrict.ChangeSlot(this.node.parent, this.node.name, 0);
                    this.mainSrict.ChangeSlot(this.node.parent, "youxiaotui", -1);
                    this.mainSrict.ChangeSlot(this.node.parent, "tuimao2", -1);
                    this.mainSrict.ChangeSlot(this.node.parent, "tuimao4", 0);
                    this.mainSrict.state[3] = true;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[3]);
                }
                break;
            case "tuoxie":
                if (delta.y < 10 && this.mainSrict.state[5] == false && this.mainSrict.ispd == false) {
                    //this.mainSrict.PlayAnimation(this.node.parent, "daiji2");
                    this.mainSrict.ChangeSlot(this.node.parent, this.node.name, -1);
                    this.mainSrict.state[5] =true;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true;
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[5]);
                }
                break;
            case "shenti":
                if (delta.x > 10 && this.mainSrict.state[6] == false && this.mainSrict.ispd == false) {
                    this.mainSrict.ChangeSlot(this.node.parent, this.node.name, 1);
                    this.mainSrict.state[6] = true;
                    this.mainSrict.value++;
                    this.mainSrict.ChangeValue(this.mainSrict.value);
                    this.mainSrict.ispd = true; 
                    this.mainSrict.ShowTxtAndMusic(this.node.parent, this.node.parent.getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.mainSrict.labtxt[6]);
                }
                break;
            
        
            default:
                break;
        }
    }

    //判断是否移动的方法
    JudgeMove(str: string): boolean{
        if (str == this.node.name)
            return true;
        return false;
    }


    ondele() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    
}
