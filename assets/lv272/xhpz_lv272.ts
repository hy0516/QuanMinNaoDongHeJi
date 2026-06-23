import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends BaseGame {

    //进度条显示
    @property(cc.ProgressBar)
    progressBar = null;
    @property(cc.Node)
    jdtSprite = null;
    //进度条文本显示
    @property(cc.Label)
    titpLab = null;
    @property(cc.Node)
    public xnxNode = null;

    @property(cc.Label)
    blsp:cc.Label = null;
    @property(cc.Label)
    xnsp:cc.Label = null;
    @property(cc.Label)
    xlsp:cc.Label = null;
    @property(cc.Label)
    bnsp:cc.Label = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    lab: string = null;

    @property(cc.Node)
    public dzNode = null;

    public isXNHs: boolean = false;

    public ske : dragonBones.ArmatureDisplay;

    public dz: cc.Node = null;

    //伴娘头部判断
    isBNHD = false;
    //伴娘手部判断
    isBNSH = false;
    //满意度值
    value: number = 0;
    //所有条件达成判断
    isEnd = false;
    //伴郎鞋子判断
    isBLX = false;
    //新娘点击判断
    isXNBlik = false;
    isXLBlik = false;

    public startTime = 300;

    //文本信息音乐判断
    ispd:boolean = false;

    flag:boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];


    labtxt: string[] = [
        "1.左划伴娘的脸",
        "2.下滑伴娘和新郎拉着的手",
        "3.上划伴娘腿上的丝袜",
        "4.拖动场景中的汉堡到伴娘身上",
        "5.拖动伴娘手上的钻戒到新娘手上",
        "6.右划新郎的脸",
        "7.点击新郎的裤子",
        "8.点击新娘的脸",
        "9.拖动拱门上的头纱到新娘的头上",
        "10.上划新娘的裙子，拖动皮鞋跟伴郎的高跟鞋交换",
        "11.下滑伴郎的手",
        "12.伴郎和伴娘身上的事件全部完成后，拖动伴郎和伴娘交换位置"

    ];

    protected onLoad(): void {
        GameData.PauseGame = false;
        this.time.string = "时间:" + this.startTime.toString() + "s";
        this.schedule(this.Timeing, 1);
        AudioManager.stopMusic();
        this.scheduleOnce(() => {
            AudioManager.playMusic("关卡背景");
        }, 0.5);
        
        //this.progressBar.progress = 1;
        //this.ske = this.node.getChildByName(`dzdg`).getComponent(dragonBones.ArmatureDisplay);
        //this.ske.playAnimation("p", -1);
        //this.dz = this.node.getChildByName("dzdg");
        //this.dz.active = false
        //this.changeSKSlotIndex(this.ske, "blj", 2);
        //this.ske.playAnimation("xnxl_dj", 0);
        
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
            .to(0.2, { opacity: 255})
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => {
                // GameData.PauseGame = false;
            })
            .start();
    }

    protected start(): void {
        this.Init();
    }

    BtnHandler(event: cc.Event.EventTouch){
        if (GameData.PauseGame == true) 
            return
        if (event.currentTarget.name != "xlkd") {
            AudioManager.playEffect(AudioManager.common.BUTTON);
        }

        switch (event.currentTarget.name) {
            //触发新郎kd点击事件
            case "xlkd":
                if (this.ispd == false) {
                    let da = this.node.getChildByName(`bj`).getChildByName(`xnxl`).getComponent(dragonBones.ArmatureDisplay);
                    this.changeSKSlotIndex(da, "xd1", -1);
                    if (this.isXLBlik == false) {
                        this.value++;
                        this.ChangeValue(this.value);
                        this.flag[6] = true;
                        //文本信息音乐处理
                        this.ispd = true;
                        let tempNode = this.node.getChildByName("bj").getChildByName("xnxl").getChildByName("xlsp");
                        this.ShowTxtAndMusic(tempNode, "哎呀，出门太急没注意到");
                    }
                    this.isXLBlik = true;
                }
                break;
                
            //触发xn脸部点击事件
            case "xnlian":
                if (this.ispd == false) {
                    let xnlian = this.node.getChildByName(`bj`).getChildByName(`xnxl`).getComponent(dragonBones.ArmatureDisplay);
                    this.changeSKSlotIndex(xnlian, "xl1", -1);
                    if (this.isXNBlik == false) {
                        this.value++;
                        this.ChangeValue(this.value);
                        this.flag[7] = true;
                        //文本信息音乐处理
                        this.ispd = true;
                        let tempNode = this.node.getChildByName("bj").getChildByName("xnxl").getChildByName("xnsp");
                        this.ShowTxtAndMusic(tempNode, "今天是大喜日子要高兴起来");
                    }
                this.isXNBlik = true;
                }
                break;
            case "fanhui":
                this.openpausePanel();
                break;

            case "jiashi":
                if (this.startTime <= 0) return;
                VideoManager.getInstance().showVideo(() => { this.setTime(60); })
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
            if (this.flag[i] == true)
                continue;
            else{
                this.node.getChildByName(`tipsPanel`).getChildByName(`Label`).getComponent(cc.Label).string = this.labtxt[i];
                break;
            }
        }
        if (this.value == 11) {
            this.flag[11] = true;
        }
    }


    //龙骨动画初始化函数
    Init(){

        let tempSke;
        let xnxlSke;
        let bnSke;
        //伴郎初始化
        tempSke = this.node.getChildByName(`bj`).getChildByName(`blnode`).getChildByName(`bl1`).getComponent(dragonBones.ArmatureDisplay);
        this.changeSKSlotIndex(tempSke, "blj", 2);
        //新郎新娘初始化
        xnxlSke = this.node.getChildByName(`bj`).getChildByName(`xnxl`).getComponent(dragonBones.ArmatureDisplay);
        this.changeSKSlotIndex(xnxlSke, "ts", -1);
        this.changeSKSlotIndex(xnxlSke, "xst", 0);
        this.changeSKSlotIndex(xnxlSke, "xj", 1);
        //this.changeSKSlotIndex(xnxlSke, "xbs", -1);

        //控制肚子放气的龙骨动画
        this.dz = this.node.getChildByName("bj").getChildByName("dzdg");
        this.dz.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndStopByFrame(`p`, 0);
        this.titpLab.string = "0/12";
        this.jdtSprite.width = 600;
        //this.jdtSprite.getComponent(Node).size.width = 0;
        bnSke = this.node.getChildByName(`bj`).getChildByName("bnnode").getChildByName(`bn1`).getComponent(dragonBones.ArmatureDisplay);
        this.node.getChildByName("bj").getChildByName("xnx1").active = false;

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
    public ShowTxtAndMusic(node: cc.Node, str: string){
        if (node.name == "bnsp") {
            this.bnsp.string = str;
        }
        else if (node.name == "xlsp") {
            this.xlsp.string = str;
        }
        else if (node.name == "xnsp") {
            this.xnsp.string = str;
        }
        else{
            this.blsp.string = str;
        }
        if(str == "通畅多了"){
            AudioManager.playEffect("道具-汉堡");
            cc.tween(node)
            .delay(0.5)
            .call(() => {
                let dz = this.node.getChildByName("bj").getChildByName("dzdg").getComponent(dragonBones.ArmatureDisplay);
                dz.playAnimation("p", 1);
                AudioManager.playEffect("放屁声");
            })
            .start()

        }
        AudioManager.playEffect("操作正确");
        AudioManager.playEffect(str);
        node.active = true;
        // cc.tween(node)
        //     .delay(2.5)
        //     .call(() => {
        //         node.active = false;
        //         this.ispd = false;
        //     })
        //     // .delay(0.5)
        //     // .call(() => {
        //     //     this.ispd = false;
        //     // })
        //     .start()
        this.scheduleOnce(() => {
            node.active = false;
            this.ispd = false;
        }, 2.5);
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
        }, 0.5);
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 4);
    }
    onlost() {
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 1)
    }
    
}
    
