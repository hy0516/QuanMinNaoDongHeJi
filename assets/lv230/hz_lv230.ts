
import moveItems_lv229 from "../lv229/moveItems_lv229";
import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import moveItems2 from "../script/common/moveItems2";
import moveItems2_230 from "./moveItems2_230";


const { ccclass, property } = cc._decorator;


//#region 链表定义
/**场景节点 */
class itemNode<T> {
    itme: T | null;
    ptr: itemNode<T> | null;

    constructor(itme: T) {
        this.itme = itme;

        this.ptr = null;

    }
}

/**节点链表 */
class itemList<T> {
    head: itemNode<T> | null;
    tail: itemNode<T> | null;

    private size: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    //尾添加
    append(item: T) {

        const newNode = new itemNode(item);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        }

        else {
            this.tail!.ptr = newNode;
            this.tail = newNode;
        }

        this.size++;
    }

    //删除指定节点
    remove(item: T): boolean {
        if (!this.head) return false;
        //删除是头节点
        if (this.head.itme === item) {

            this.head = this.head.ptr;
            //删除掉最后一节点
            if (this.head == null) this.tail = null;

            this.size--;

            return true;
        }

        //删除中间节点
        let current = this.head;
        while (current.ptr) {
            if (current.ptr.itme == item) {

                //删除尾节点
                if (this.tail === current.ptr) {
                    this.tail = current;
                    //删除掉最后一节点
                    if (this.tail == null) this.head = null;

                    current.ptr = null;

                    this.size--;
                    return true;
                }
                current.ptr = current.ptr.ptr;

                this.size--;
                return true;
            }

            current = current.ptr;
        }
        return false;
    }


}

@ccclass
export default class hz_lv230 extends BaseGame {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    addtimetips: cc.Node = null;

    @property(cc.Node)
    public itemList1: cc.Node[] = [];

    stringList1: { [key: string]: string } = {
        "flood": "高端的地板|高端的地板",
        "hole": "那哪里是驴，分明是白龙马|那哪里是驴，分明是白龙马",
        "plant": "衣柜也不能少|衣柜也不能少",
        "trash": "桌子是必不可少的|桌子是必不可少的",
        "desk": "石桌赶紧换掉|石桌赶紧换掉",
        "food": "食物当然也得讲究|食物当然也得讲究",
        "stone": "这是我们日常诵读的经书|这是我们日常诵读的经书",
        "wall": "面墙必须要足够漂亮|面墙必须要足够漂亮",
        "role1": "赶紧把衣服穿上|赶紧把衣服穿上",
        "role2": "戴上帽子|戴上帽子_230",
        "role3": "赶紧把衣服穿上|赶紧把衣服穿上",
        "role4": "赶紧把衣服穿上|赶紧把衣服穿上",
    };

    @property(cc.Node)
    tittle: cc.Node = null;

    @property(cc.Node)
    gou: cc.Node = null;

    @property(cc.Node)
    gou2: cc.Node = null;

    /**链表容器 */
    _itemList1 = new itemList<cc.Node>();
    // _itemList2 = [];



    PB: cc.Node;
    lab_pb: cc.Node;

    public curTime = 0;
    public winnum = 0;

    private flag1: boolean = false;
    private flag2: boolean = false;

    /**链表初始化 */
    listInof() {
        this.itemList1.forEach(item => {
            this._itemList1.append(item);
        })

        this.itemList1 = [];
        this.listPrint();

    }

    //打印链表
    listPrint() {
        let current = this._itemList1.head;
        let string = null;
        while (current) {

            string = string + current.itme.name + "-->";

            current = current.ptr;
        }

        // console.log(string);
    }

    //#region  onLoad
    onLoad() {
        GameData.PauseGame = false;
        GameData.startTime = 180;
        //  this._itemList1 = this.itemList1;
        this.PB = this.node.getChildByName("pangbai");
        this.lab_pb = this.PB.getChildByName("lab_pb");
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        this.schedule(this.Timeing, 1)
        AudioManager.playMusic("hz203_12", true, 0.7);
        // AudioManager.playEffect("hz203_12");
        // this.showPB("这么多钱，花不完根本花不完");
        // cc.Tween.stopAllByTarget(this.tittle);
        cc.tween(this.tittle)
            .repeat(2,
                cc.tween()
                    .to(0.1, { angle: 7 })
                    .to(0.1, { angle: 0 })
                    .to(0.1, { angle: -7 })
                    .to(0.1, { angle: 0 })
                    .delay(0.2)
            )
            .start()

        this.listInof();

        // let ske = this.node.getChildByName("bg").getChildByName("role1").getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
        // ske.playAnimation("2",-1);

        // let ske2 = this.node.getChildByName("bg").getChildByName("role2").getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
        // ske2.playAnimation("3",-1);

        let ske3 = this.node.getChildByName("bg").getChildByName("role3").getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
        ske3.playAnimation("2", -1);

        let ske4 = this.node.getChildByName("bg").getChildByName("role4").getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
        ske4.playAnimation("1", -1);

        this.starting();

        let door = this.node.getChildByName("bg").getChildByName("door");

        door.x = -223.704;
        door.y = -62.325;

    }

    // moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
    //     var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation())
    //     for (let i = 0; i < this._itemList1.length; i++) {
    //         var item = this._itemList1[i];
    //         if (item.getBoundingBox().contains(poi)) {
    //             even.currentTarget.destroy();
    //             item.getChildByName("state1").active = false;
    //             item.getChildByName("state2").active = true;
    //             var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
    //             // @ts-ignore
    //             yansk.position = poi
    //             yansk.active = true;
    //             yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);
    //             var lab = this.stringList1[item.name].split("|");
    //             this.showPB(lab[0]);
    //             AudioManager.playEffect("hz4_11");
    //             AudioManager.playEffect(lab[1]);
    //             this._itemList1.splice(i, 1)
    //             this.winnum++;
    //             break;
    //         }
    //         if (i == this._itemList1.length - 1) {
    //             even.currentTarget.getComponent(moveItems2).restart();
    //         }
    //     }
    // }

    /**对话框位置设置 
     * 1:黄眉门外
     * 2:黄眉冲门
     * 3:黄眉跪地
     * 4:小妖说话
    */
    talkSetPos(num) {
        let talk = this.node.getChildByName("bg").getChildByName("talk");
        let left = talk.children[1];
        let right = talk.children[0];
        switch (num) {
            //黄眉门外
            case 1:
                left.active = false;
                right.active = true;
                talk.position = new cc.Vec3(-114.023, 105.905, 0);
                break;
            //黄眉冲门
            case 2:
                left.active = false;
                right.active = true;
                talk.position = new cc.Vec3(130.886, 105.905, 0);
                break;
            //黄眉跪地
            case 3:
                left.active = false;
                right.active = true;
                talk.position = new cc.Vec3(-114.023, 105.905, 0);
                break;
            //小妖说话
            case 4:
                left.active = true;
                right.active = false;
                talk.position = new cc.Vec3(90.304, 59.616, 0);
                break;
        }

        return talk;
    }


    onwin() {
        var fun = () => {
            this.endwin("prefabs/zc/zc_winend");
            GameData.PauseGame = false;
            return
        }
        this.gou.cleanup();
        cc.tween(this.gou)
            .to(1.3, { scaleX: 1, scaleY: 1 })
            .delay(1.3)
            .call(fun)
            .start()
        this.scheduleOnce(() => {
            AudioManager.playEffect("finishjq");
        }, 0.9)
    }
    onlost() {
        var fun = () => {
            this.scheduleOnce(() => {
                GameData.PauseGame = false;
                this.node.destroy();
                this.endlost("prefabs/zc/zc_lostend");


            }, 1);
        }
        cc.tween(this.gou2)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .call(fun)
            .start()

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo");
            // AudioManager.playEffect(music.哭);
        }, 0.4)
        // this.meixi.getComponent(dragonBones.ArmatureDisplay).playAnimation("shu", 2);

    }


    //#region 过场
    /**开场 */
    starting() {

        GameData.PauseGame = true;


        let talk = this.node.getChildByName("bg").getChildByName("talk");
        AudioManager.playEffect("敲门_230");


        this.showqp(talk, '听闻此处有四位取经人，\n我倒要看看是不是这么一回事', "听闻此处有四位取经人，我倒要看看是不是这么一回事", () => {
            GameData.PauseGame = true;
            talk.children[0].active = false;
            talk.children[1].active = true;

            this.talkSetPos(4);
            this.showqp(talk, "坏了坏了!黄眉找上门来了，赶快伪装一下", "坏了坏了!黄眉找上门来了，赶快伪装一下", () => {
                GameData.PauseGame = false;



            });
        })
    }

    /**结束 */
    ending(iswin: boolean) {

        let door = this.node.getChildByName("bg").getChildByName("door");
        let doorSke = door.children[1].getComponent(dragonBones.ArmatureDisplay);
        this.node.getChildByName("bg").getChildByName("huangMei_1");
        if (iswin) {
            AudioManager.playEffect("开门_230");
            doorSke.playAnimation("蓝色开门", 1);
            this.addOneTimeListener(doorSke, () => {
                this.node.getChildByName("bg").getChildByName("huangMei_1").active = false;
                this.node.getChildByName("bg").getChildByName("huangMei_3").active = true;
                this.node.getChildByName("bg").getChildByName("huangMei_3").getComponent(dragonBones.ArmatureDisplay).playAnimation("newAnimation", -1);

                let talk = this.talkSetPos(3);
                this.showqp(talk, "果真是唐僧师徒四人组，怕了怕了", "果真是唐僧师徒四人组，怕了怕了", () => {
                    this.onwin();
                })
            })
        }
        else {
            AudioManager.playEffect("开门_230");
            doorSke.playAnimation("蓝色开门", 1);
            this.scheduleOnce(() => {
                this.node.getChildByName("bg").getChildByName("huangMei_1").active = false;
                this.node.getChildByName("bg").getChildByName("huangMei_2").active = true;
                this.node.getChildByName("bg").getChildByName("huangMei_2").getComponent(dragonBones.ArmatureDisplay).playAnimation("newAnimation", 1);
                AudioManager.playEffect("撞飞_230");
                let ske = this.node.getChildByName("bg").getChildByName("huangMei_2").getComponent(dragonBones.ArmatureDisplay);

                let talk = this.talkSetPos(2);

                this.scheduleOnce(() => {



                    //撞飞小妖
                    let guais: cc.Node[] = [];
                    let role1 = this.node.getChildByName("bg").getChildByName("role1");
                    let role2 = this.node.getChildByName("bg").getChildByName("role2");
                    let role3 = this.node.getChildByName("bg").getChildByName("role3");
                    let role4 = this.node.getChildByName("bg").getChildByName("role4");

                    guais.push(role1);
                    guais.push(role2);
                    guais.push(role3);
                    guais.push(role4);

                    guais.forEach(guai => {
                        cc.tween(guai)
                            .to(0.1, { angle: -60 })
                            .to(0.1, { x: guai.x + 570 })
                            .start()
                    })
                }, 0.5);
                this.addOneTimeListener(ske, () => {
                    this.showqp(talk, "就你们这几个货，老子一脚全给你们踹飞！", "就你们这几个货，老子一脚全给你们踹飞！", () => {
                        this.scheduleOnce(() => {
                            this.onlost();
                        }, 0.5);


                    })


                })
            }, 0.7)
        }
    }


    //#region 对话框

    /** 对话框显示功能*/
    showqp(qpnode: cc.Node, lab: string, audioName: string, handler?: Function) {

        GameData.PauseGame = true;

        var qp = qpnode.getChildByName("Lable")
        qp.getComponent(cc.Label).string = lab;
        cc.tween(qpnode)
            .to(0.5, { opacity: 255 })
            .call(() => {
                AudioManager.playEffect(audioName, false, () => {
                    this.hideqp(qpnode, handler);
                })
            })
            .start();
    }
    /**对话框隐藏 */
    hideqp(qpnode: cc.Node, handler: Function) {
        var qp = qpnode.getChildByName("Lable")
        cc.tween(qpnode)
            .to(0.2, { opacity: 0 })
            .call(() => {
                handler && handler();

                // GameData.PauseGame = false;
            })
            .start();
    }


    //#region 主逻辑


    trashLv = 0;
    holeLv = 0;


    //道具信号
    iswall = false;
    isdesk = false;

    isflood = false;
    isstone = false;
    isfood = false;
    isplant = false;

    ishole_1 = false;
    ishole_2 = false;

    istrash_1 = false;
    istrash_2 = false;

    isrole1 = false;

    isrole2_1 = false;
    isrole2_2 = false;

    isrole3 = false;
    isrole4 = false;

    isdoor = false;



    moveHandler(type: number, tar: cc.Node, even: cc.Event.EventTouch): void {
        const dragType = even.currentTarget.name;
        //#region 胜负判定
        let check = (name) => {
            switch (name) {
                case "flood":
                    this.isflood = true;
                    break;
                case "wall":
                    this.iswall = true;
                    break;
                case "hole":
                    if (this.holeLv == 1) this.ishole_1 = true;
                    if (this.holeLv == 2) this.ishole_2 = true;
                    break;
                case "trash":
                    if (this.trashLv == 1) this.istrash_1 = true;
                    if (this.trashLv == 2) this.istrash_2 = true;
                    break;
                case "plant":
                    this.isplant = true;
                    break;
                case "role1":
                    this.isrole1 = true;
                    break;
                case "role2":
                    if (!this.isrole2_1) this.isrole2_1 = true;
                    else this.isrole2_2 = true;
                    break;
                case "role3":
                    this.isrole3 = true;
                    break;
                case "role4":
                    this.isrole4 = true;
                    break;
                case "desk":
                    this.isdesk = true;
                    break;
                case "food":
                    this.isfood = true;
                    break;
                case "stone":
                    this.isstone = true;
                    break;
                case "door":
                    this.isdoor = true;
                    break;



            }

            console.log("----winNum---:" + this.winnum);

            if (this.isdoor && this.winnum < 16) {
                this.ending(false);
            }

            if (this.winnum >= 16) {
                this.ending(true);
            }
        }

        if (dragType === "bian") {
            var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation());

            let current = this._itemList1.head;

            while (current) {

                let item = current.itme;



                let fun = (name) => {

                    GameData.PauseGame = true;
                    if (name != "door") {
                        var lab = this.stringList1[item.name].split("|");
                        this.showPB(lab[0]);
                        AudioManager.playEffect(lab[1]);
                        AudioManager.playEffect("物品切换形态");
                    }


                    this.winnum++;

                    check(name);
                }

                // if(item.name == "door"){
                //     let pos = item.position;

                //     console.log(item);
                //     console.log(item.position);
                // }
                if (item.getBoundingBox().contains(poi)) {


                    if (item.name == "flood" || item.name == "wall" || item.name == "stone" || item.name == "desk") {
                        even.currentTarget.destroy();
                        item.getChildByName("state1").active = false;
                        item.getChildByName("state2").active = true;

                        this._itemList1.remove(item);
                        this.listPrint();

                        if (item.name == "desk") this.isdesk = true;
                        if (item.name == "wall") this.iswall = true;

                        fun(item.name);
                        return;

                    }


                    if (item.name == "food" && this.isdesk) {
                        even.currentTarget.destroy();
                        item.getChildByName("state1").active = false;
                        item.getChildByName("state2").active = true;

                        this._itemList1.remove(item);
                        this.listPrint();

                        fun(item.name);
                        return;
                    }


                    if (item.name == "plant" && this.iswall) {
                        even.currentTarget.destroy();
                        item.getChildByName("state1").active = false;
                        item.getChildByName("state2").active = true;

                        this._itemList1.remove(item);
                        this.listPrint();

                        fun(item.name);
                        return;
                    }

                    if (item.name == "hole") {
                        if (this.holeLv == 0) {
                            even.currentTarget.destroy();
                            item.getChildByName("state1").active = false;
                            item.getChildByName("state2").active = true;
                            this.holeLv += 1;

                            fun(item.name);
                            return;
                        }
                        if (this.holeLv == 1) {
                            even.currentTarget.destroy();
                            item.getChildByName("state2").active = false;
                            item.getChildByName("state3").active = true;
                            this.holeLv += 1;

                            this._itemList1.remove(item);
                            this.listPrint();

                            GameData.PauseGame = true;
                            this.showPB("我们的房子非常漂亮");
                            AudioManager.playEffect("物品切换形态");
                            AudioManager.playEffect("我们的房子非常漂亮");
                            this.winnum++;

                            check(item.name);
                            return;
                        }

                    }

                    if (item.name == "trash") {
                        if (this.trashLv == 0) {
                            even.currentTarget.destroy();
                            item.getChildByName("state1").active = false;
                            item.getChildByName("state2").active = true;
                            this.trashLv += 1;

                            fun(item.name);
                            return;
                        }
                        if (this.trashLv == 1) {
                            even.currentTarget.destroy();
                            item.getChildByName("state3").active = true;
                            this.trashLv += 1;

                            this._itemList1.remove(item);
                            this.listPrint();

                            GameData.PauseGame = true;
                            this.showPB("我们的装备非常齐全");
                            AudioManager.playEffect("物品切换形态");
                            AudioManager.playEffect("我们的装备非常齐全");
                            this.winnum++;

                            check(item.name);
                            return;
                        }
                    }

                    if (item.name == "role1" || item.name == "role2" || item.name == "role3" || item.name == "role4") {
                        even.currentTarget.destroy();

                        let ske = item.getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);
                        let num = Number(item.name[item.name.length - 1]);
                        if (num == 3) ske.playAnimation("1", -1);
                        else ske.playAnimation("2", -1);

                        this._itemList1.remove(item);
                        this.listPrint();

                        fun(item.name);
                        return;
                    }


                    if (item.name == "door") {

                        // console.log(item.position);
                        // console.log(poi);


                        even.currentTarget.destroy();

                        let ske = item.getChildByName("ske").getComponent(dragonBones.ArmatureDisplay);

                        // ske.playAnimation("敲门",1);

                        // this.addOneTimeListener(ske,()=>{
                        //     // ske.playAnimation("红色开门",1);
                        // })

                        this._itemList1.remove(item);
                        this.listPrint();

                        fun(item.name);
                        return;
                    }

                    // var yansk = this.node.getChildByName("bg").getChildByName("yan_sk");
                    // @ts-ignore
                    // yansk.position = poi
                    // yansk.active = true;
                    // yansk.getComponent(dragonBones.ArmatureDisplay).playAnimation("yan", 1);

                }

                current = current.ptr;


            }

            even.currentTarget.getComponent(moveItems2_230).restart();




        }

        if (dragType === "jiasha") {
            var poi = this.node.getChildByName("bg").convertToNodeSpaceAR(even.getLocation());

            let role2 = this.node.getChildByName("bg").getChildByName("role2");

            if (role2.getBoundingBox().contains(poi) && this.isrole2_1) {

                even.currentTarget.destroy();
                role2.children[0].getComponent(dragonBones.ArmatureDisplay).playAnimation("3", -1);
                AudioManager.playEffect("物品切换形态");
                AudioManager.playEffect("赶紧把衣服穿上");
                this.winnum++;

                check("role2");
            }

            else {
                even.currentTarget.getComponent(moveItems2_230).restart();
            }
        }

    }


    showLabel() {
        let label;

        if (!this.iswall) {
            label = "拖动“变”字到墙壁";
        }

        else if (!this.isflood) {
            label = "拖动“变”字到地板";
        }

        else if (!this.isdesk) {
            label = "拖动“变”字到石桌";
        }

        else if (!this.isfood) {
            label = "拖动“变”字到桌上食物";
        }

        else if (!this.isstone) {
            label = "拖动“变”字到石堆";
        }
        else if (!this.isplant) {
            label = "拖动“变”字到枯树";
        }
        else if (!this.ishole_1) {
            label = "拖动“变”字到驴上";
        }
        else if (!this.ishole_2) {
            label = "拖动“变”字到破洞";
        }
        else if (!this.istrash_1) {
            label = "拖动“变”字到垃圾堆";
        }
        else if (!this.istrash_2) {
            label = "拖动“变”字到桌子上";
        }
        else if (!this.isrole1) {
            label = "拖动“变”字到猪妖";
        }
        else if (!this.isrole3) {
            label = "拖动“变”字到猩猩";
        }
        else if (!this.isrole4) {
            label = "拖动“变”字到黄鼬";
        }
        else if (!this.isrole2_1) {
            label = "拖动“变”字到蛤蟆";
        }
        else if (!this.isrole2_2) {
            label = "双击打开衣柜，拖动袈裟到蛤蟆";
        }

        else if (!this.isdoor) {
            label = "拖动“变”字到门";
        }

        return label;
    }














    showPB(lab: string) {
        this.lab_pb.getComponent(cc.Label).string = lab;
        cc.Tween.stopAllByTarget(this.PB)
        cc.tween(this.PB)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            .call(() => {
                GameData.PauseGame = false;
            })
            .start()
    }
    hiodePB() {

    }

    hidetips() {
        this.node.getChildByName("tipsNode").active = false;
    }
    showTip() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);


        VideoManager.getInstance().showVideo(() => {
            let tipsNode = this.node.getChildByName("tipsNode");
            tipsNode.active = true;

            tipsNode.getChildByName("ts").getChildByName("Label").getComponent(cc.Label).string = this.showLabel();

            // this.node.getChildByName("bg").getChildByName("bg2").getChildByName("btn_tips").getChildByName("luxiang").active = false;
            // VideoManager.getInstance().showInsert();
        })
    }


    closeTip() {
        this.node.getChildByName("tipsNode").active = false;
    }

    isshowVideo = false;
    fanhuibtn() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
        //     var UINode = cc.instantiate(UI);
        //     UINode.parent = cc.find("Canvas");
        //     GameData.onDele();
        //     this.node.destroy();
        //     VideoManager.getInstance().showBaoXiang();
        // })
        this.openpausePanel();
    }


    addTime(even: TouchEvent, time?: number) {
        if (GameData.startTime + time <= 0) return

        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        // GameData.PauseGame = true;
        var addtime
        time ? addtime = time : addtime = 60;
        GameData.startTime += addtime;
        this.Timeing();
        var fuhao = "";
        if (addtime > 0) fuhao = "+";
        this.addtimetips.getComponent(cc.Label).string = fuhao + addtime.toString();
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

    btn_addTime() {
        // if (GameData.startTime + 60 <= 0) return
        VideoManager.getInstance().showVideo(() => {
            this.addTime(null);
        })
    }

    endAddTime() {
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
        GameData.PauseGame = false;
        this.addTime(null, 100)
        this.schedule(this.Timeing, 1);
    }

    Timeing() {
        if (GameData.PauseGame == true) return;
        GameData.startTime--;
        this.time.string = "时间:" + GameData.startTime.toString() + "s";
        if (GameData.startTime == 0) {
            this.unschedule(this.Timeing);
            setTimeout(() => {
                this.endlost("prefabs/hz/endlost_hz");
            }, 600);
        }
    }

    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        })
    }


}

