import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const {ccclass, property} = cc._decorator;



@ccclass
export default class NewClass extends BaseGame {


    @property(cc.Node)
    jdtSprite = null;
    //进度条文本显示
    @property(cc.Label)
    titpLab = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;
    
    
    public mili = null;
    public lumi: cc.Node = null;
    public zuoyi: cc.Node = null;


    num: number[] = [];
    str: string[] = [];

    public value: number = 0;

    //定义插槽的数据
    //slots: any;
    public slotName: string[] = [];
    displayIndex: number[] = [];
    index: number = 0;

    //状态判断数组 用来判断各个事件是否完成
    state:boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];

    public ispd: boolean = false;

    public startTime = 300;


    //存储游戏提示文本
    labtisptxt: string[] = [
        "拖动咖啡到左边女孩身上",
        "左划左边女孩比耶的手",
        "拖动剪刀到左边女孩裙子上",
        "上划右边女孩抬起来的脚",
        "拖动中间女孩的裤子和右边女孩的裤子交换",
        "下滑中间女孩的拖鞋",
        "右划中间女孩的手",
        "长按一秒中间女孩的脸",
        "拖动左边女孩胳膊上的头绳到右边女孩身上",
        "拖动刮胡刀到右边女孩腿上",
        "拖动毛巾到右边女孩的衣服上",
        "拖动地上的腿毛到左边女孩的头发上"

    ];

    labtxt: string[] =[
        "困意瞬间消失了",
        "我们的动作需要保持一致",
        "我们要穿瑜伽裤拍合影",
        "原来是要做这个动作",
        "刚才不小心换错裤子了",
        "拖鞋穿着方便又舒服",
        "弄错姿势了",
        "啊！没做好表情管理",
        "忘了把头发扎起来了",
        "人家只是腿毛比较旺盛",
        "这些是锻炼时流的汗",
        "头顶不秃了"
    ]
    isEnd: boolean;


    protected onLoad(): void {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景lv279");
        }, 0.5);
    }

    protected start(): void {
        this.Init();
    }


    Init(){
        this.mili = this.node.getChildByName("mili");
        this.zuoyi = this.node.getChildByName("zuoyi");
        this.lumi = this.node.getChildByName("lumi");
        this.ChangeSlot(this.mili, "toufa2", -1);
        // this.slots = this.zuoyi.getComponent(dragonBones.ArmatureDisplay).armature().getSlot();
        

        
    }

    //播放指定动画
    public PlayAnimation(node: cc.Node, anumationName: string, playTimes: number = -1){

        this.str = [];
        this.num = [];

        this.GetSlotsName(node);
        let slot = node.getComponent(dragonBones.ArmatureDisplay);
        if (anumationName == "guahudao") {
            AudioManager.playEffect("剃须刀");
        }
        if (anumationName == "jiandao") {
            AudioManager.playEffect("剪刀");
        }
        if (anumationName == "maojin") {
            AudioManager.playEffect("毛巾");
        }
        slot.playAnimation(anumationName, playTimes);
        //this.SetAnimationInit(slot, anumationName);
        
        // for (let i = 0; i < this.slotName.length; i++)
        // {
        //     this.changeSKSlotIndex(slot, this.slotName[i], this.displayIndex[i]);
        // }
        
        this.schedule(() => {
            this.node.getChildByName(anumationName).active = false;
            if (anumationName == "guahudao" && this.state[11] == false) {

                this.node.getChildByName("zuoyi").getChildByName("tou").active = true;
            }
            if (anumationName == "jiandao") {
                slot = this.node.getChildByName("zuoyi").getComponent(dragonBones.ArmatureDisplay);
                this.changeSKSlotIndex(slot, "qunzi", -1);
            }
            
        }, 2);

        if (anumationName == "guahudao") {
            this.schedule(() =>{
                this.changeSKSlotIndex(this.node.getChildByName("mili").getComponent(dragonBones.ArmatureDisplay), "tuimao1", -1);
                this.changeSKSlotIndex(this.node.getChildByName("mili").getComponent(dragonBones.ArmatureDisplay), "tuimao2", -1);
            },1);

            this.schedule(() =>{
                this.changeSKSlotIndex(this.node.getChildByName("mili").getComponent(dragonBones.ArmatureDisplay), "tuimao3", -1);
                this.changeSKSlotIndex(this.node.getChildByName("mili").getComponent(dragonBones.ArmatureDisplay), "tuimao4", -1);
            },1);
            this.ShowTxtAndMusic(this.node.getChildByName("mili"), this.node.getChildByName("mili").getChildByName("labbj").getChildByName("lab").getComponent(cc.Label), 
                                                    this.labtxt[9]);
        
        }

        
    }

    //改变龙骨动画插槽
    public ChangeSlot(node: cc.Node, slotName: string, index: number){


        let slot = node.getComponent(dragonBones.ArmatureDisplay);
        this.changeSKSlotIndex(slot, slotName, index);
        // this.slotName[this.index] = slotName;
        // this.displayIndex[this.index] = index;
        // this.index++;
    }

    //获取初始化的龙骨动画
    GetSlotsName(node: cc.Node){
        let slot = node.getComponent(dragonBones.ArmatureDisplay);
        let slots = slot.armature().getSlots();
        
        for(let i = 0; i< slots.length; i++)
        {
            this.str.push(slots[i].name);
            this.num.push(slots[i].displayIndex);
        }
        
    }

    SetAnimationInit(slot:dragonBones.ArmatureDisplay, name: string){
        for (let i = 0; i < this.str.length; i++)
        {
            if(this.str[i] != name)
                this.changeSKSlotIndex(slot, this.str[i], this.num[i]);
        }
    }

    public ChangeValue(value){
        //this.jdtSprite.node.width -= value * 50;
        this.titpLab.string = `${value}/12`;
        this.jdtSprite.width -= 50;
        if (value == 12) {
            this.isEnd = true;
            this.onwin();
        }
        
    }

    //处理文本信息 音乐 和延迟
    public ShowTxtAndMusic(node: cc.Node, labNode: cc.Label, str: string){
        //labNode.string = str;
            
            
        AudioManager.playEffect("操作正确");
        AudioManager.playEffect("通用操作");
        // AudioManager.playEffect(str);
        // node.getChildByName("labbj").active = true;

        // this.schedule(() => {
        //         node.getChildByName("labbj").active = false;
        //         this.ispd = false;
        // },2.5);

        this.showqp(node.getChildByName("labbj"), str, str, () => {
            this.ispd = false;
        }); 
            
    }

    /** 对话框显示功能*/
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {
    
        var qp = qpnode.getChildByName("lab")
        qp.getComponent(cc.Label).string = lab;
        cc.tween(qpnode)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start()
    }
        /**对话框隐藏 */
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("lab")
        cc.tween(qpnode)
            .to(0.2, { opacity: 0 })
            .call(() => {
                handler && handler();
            })
            .start()
    }



    BtnHandler(event: cc.Event.EventTouch){
            if (GameData.PauseGame == true) 
                return
            
            AudioManager.playEffect(AudioManager.common.BUTTON);
            
    
            switch (event.currentTarget.name) {
                case "fanhui":
                    this.openpausePanel();
                    break;
    
                case "jiashi":
                    if (this.startTime <= 0) return;
                    VideoManager.getInstance().showVideo(() => { 
                        this.setTime(60); 
                    })
                    break;
                case "btn_tips":
                    VideoManager.getInstance().showVideo(()=>{
                    this.showTips();
                    });
                    break;
                case "X":
                    (event.currentTarget as cc.Node).parent.active = false;
                    break;
                default:
                    break;
            }
    
    
    }

    showTips() {
        this.node.getChildByName(`tipsPanel`).active = true;
        this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = `提示：\n`;
        for (let i = 0; i < this.labtxt.length; i++){
            if (this.state[i] == true)
                continue;
            else{
                this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = this.labtisptxt[i];
                break;
            }
        }
        if (this.value == 11) {
            this.state[11] = true;
        }
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

    onwin() {
            this.scheduleOnce(() => {
                AudioManager.playEffect("拍照声");
            }, 3);
            this.scheduleOnce(() => {
                GameData.PauseGame = true;
                this.node.cleanup();
                AudioManager.stopEffect();
                this.endwin("prefabs/hz/endwin_hz");
                this.node.destroy();
            }, 6);
        }
    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
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
            .to(0.2, { opacity: 255})
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }
   
}
