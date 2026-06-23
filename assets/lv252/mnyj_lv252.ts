

import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";
import qlitem_move_lv252 from "./qlitem_move_lv252";
const { ccclass, property } = cc._decorator;

@ccclass
export default class shj_lv252 extends BaseGame {
    @property(cc.Node)
    private tipsPanel: cc.Node = null;
    @property(cc.Node)
    gou: cc.Node = null;
    @property(cc.Node)
    cha: cc.Node = null;
    isshowVideo = false;
    canjiaohu = true;

    @property(cc.Node)
    kidTest:cc.Node = null;

    @property(cc.Prefab)
    kidSke:cc.Prefab = null; //孩子预制体

    @property(cc.PageView) // 在编辑器中将 PageView 组件拖拽到这里
    public pageView: cc.PageView = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    // 需要滚动到的目标节点
    targetNode: cc.Node = null;


    /**剩余机会 */
    health: number = 3;//m
    curnum = 0;
    onLoad() {
        GameData.PauseGame = false;
        AudioManager.playMusic(`bgmlv_252`, null, 1);
        this.PageTurunHandler(null)
        //console.log(this.pageView.getPages().length);
        this.skeInof();
    }

    /**插槽位置配表 */
        kidSkeSlotPos = {
        "哭泣":[
            {lv:1,pos:9},
            {lv:2,pos:0},
            {lv:3,pos:8},
            {lv:4,pos:1},
            {lv:5,pos:7},
            {lv:6,pos:2},
            {lv:7,pos:6},
            {lv:8,pos:3},
            {lv:9,pos:5},
            {lv:10,pos:4}
        ],
        "正常":[
            {lv:1,pos:9},
            {lv:2,pos:0},
            {lv:3,pos:8},
            {lv:4,pos:1},
            {lv:5,pos:7},
            {lv:6,pos:2},
            {lv:7,pos:6},
            {lv:8,pos:3},
            {lv:9,pos:5},
            {lv:10,pos:4}
        ],

        "睡觉":[
            {lv:1,pos:0},
            {lv:2,pos:5},
            {lv:3,pos:1},
            {lv:4,pos:6},
            {lv:5,pos:2},
            {lv:6,pos:7},
            {lv:7,pos:3},
            {lv:8,pos:8},
            {lv:9,pos:4},
            {lv:10,pos:9}
        ],
    }
    parentSkeSlotPos = {
        "哭泣":[
            {lv:1,pos:9},
            {lv:2,pos:0},
            {lv:3,pos:8},
            {lv:4,pos:1},
            {lv:5,pos:7},
            {lv:6,pos:2},
            {lv:7,pos:6},
            {lv:8,pos:5},
            {lv:9,pos:3},
            {lv:10,pos:4}
        ],
        "正常":[
            {lv:1,pos:9},
            {lv:2,pos:0},
            {lv:3,pos:8},
            {lv:4,pos:1},
            {lv:5,pos:7},
            {lv:6,pos:2},
            {lv:7,pos:6},
            {lv:8,pos:3},
            {lv:9,pos:5},
            {lv:10,pos:4}
        ],

        "睡觉":[
            {lv:1,pos:9},
            {lv:2,pos:8},
            {lv:3,pos:0},
            {lv:4,pos:7},
            {lv:5,pos:1},
            {lv:6,pos:6},
            {lv:7,pos:2},
            {lv:8,pos:5},
            {lv:9,pos:3},
            {lv:10,pos:4}
        ],
    }


    skeInof(){
        let itmeList = this.node.getChildByName("bg").getChildByName("page").getChildByName("itemlist").children;


        for(let i =0; i<itmeList.length; i++){
            let item = itmeList[i];
            let ske = item.children[0].getComponent(dragonBones.ArmatureDisplay);

            this.changeSKSlotIndex(ske,"睡觉",-1);
            this.changeSKSlotIndex(ske,"哭泣",-1);

            let skeSlotPos = this.parentSkeSlotPos["正常"][i].pos;  
            this.changeSKSlotIndex(ske,"正常",skeSlotPos);
        }
    }

    parentSkeUpdate(type,state,nowPageTarget){
         let ske = nowPageTarget.getComponent(dragonBones.ArmatureDisplay);
         ske.armatureName = "armatureName";

          if(ske.armature){
            this.changeSKSlotIndex(ske,"正常",-1);
            let skeSlots; 
            //console.log(ske.armature());
            if(state == "睡觉"){
                ske.playAnimation("正常状态",0);

                //特殊处理
                if(type == 3){
                    nowPageTarget.position = nowPageTarget.position.add(new cc.Vec3(70,-100,0));
                }

                skeSlots = this.parentSkeSlotPos["睡觉"];
                this.changeSKSlotIndex(ske,"哭泣",-1);
                
            }
            //哭泣
            else{

                type += 1; //哭泣传入的是index（0~9）

                ske.playAnimation("哭泣状态",1);
                this.addOneTimeListener(ske,()=>{
                    ske.playAnimation("正常状态",-1);

                    //console.log("父母"+GameData.PauseGame);

                    this.scheduleOnce(()=>{GameData.PauseGame = false;},0.5);
                    

                    this.changeSKSlotIndex(ske,"睡觉",-1);
                    let skeSlotPos:number = this.parentSkeSlotPos["正常"][type - 1].pos;
                    this.changeSKSlotIndex(ske,"正常",skeSlotPos);
                });

                skeSlots = this.parentSkeSlotPos["哭泣"];
                this.changeSKSlotIndex(ske,"睡觉",-1);
            }

            let skeSlotPos:number = skeSlots[type - 1].pos;
            //console.log(skeSlotPos);

            this.changeSKSlotIndex(ske,state,skeSlotPos);


        }
    }

    kidSkeUpdate(type,state,target){


        let kidSke = target.getChildByName("kidSke_252");
        let ske = kidSke.children[0].getComponent(dragonBones.ArmatureDisplay);
        ske.armatureName = "armatureName";
    
        let startPos:cc.Vec3;
        //特殊处理
        if(type == 4){
             startPos = kidSke.position;
             kidSke.position = new cc.Vec3(-200,0,0);
        }
        
        //this.addOneTimeListener(ske,()=>{
             //等待实例化完成再执行
      //  this.scheduleOnce(()=>{
        if(ske.armature){
            this.changeSKSlotIndex(ske,"正常",-1);
            let kidSlots; 
            //console.log(ske.armature());
            if(state == "睡觉"){

                ske.playAnimation("正常状态",0);

                kidSlots = this.kidSkeSlotPos["睡觉"];
                this.changeSKSlotIndex(ske,"哭泣",-1);
                

            }
            //哭泣
            else{
                kidSlots = this.kidSkeSlotPos["哭泣"];
                this.changeSKSlotIndex(ske,"睡觉",-1);

                ske.playAnimation("哭泣状态",1);
                this.addOneTimeListener(ske,()=>{
                    //ske.playAnimation("正常状态",-1);
                    //console.log("宝宝："+GameData.PauseGame);
                    this.scheduleOnce(()=>{GameData.PauseGame = false;},0.5);
                    kidSke.active = false;

                    if(startPos)kidSke.position = startPos;

                });
            }

            let skeSlotPos:number = kidSlots[type - 1].pos;
           //console.log(skeSlotPos);

            this.changeSKSlotIndex(ske,state,skeSlotPos);

            kidSke.active = true;
        }
            

       // },1);
       // })
       
        
    }

    checkYesOrNo(istrue: boolean) {
        if (istrue) {
            this.curnum++;
            if (this.curnum == 10) {
                this.scheduleOnce(() => { this.onwin() }, 1);

            } else {
                this.scheduleOnce(() => { this.NextPageSet() }, 1.6);
            }
        } else {
            const dacha = this.node.getChildByName(`bg`).getChildByName(`dacha`);
            dacha.active = true;
            // 延迟 1 秒后关闭
            this.scheduleOnce(() => {
                dacha.active = false;
            }, 1);
            this.health--;
            //剩余机会标签更新和效果
            this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string = `剩余机会:${this.health}`
            cc.tween(this.node.getChildByName(`bg`).getChildByName(`healthLabel`)).to(0.3, { scaleX: 2, scaleY: 2 }).call(() => {
                cc.tween(this.node.getChildByName(`bg`).getChildByName(`healthLabel`)).to(0.3, { scaleX: 1, scaleY: 1 }).start();
            }).start();
            //游戏失败
            if (this.health <= 0) {
                GameData.PauseGame = true;
                setTimeout(() => {
                    this.endlost("prefabs/zc/endlostChance_zc");
                }, 600);
                return;    
            }
        }
    }
    NextPageSet() {
        GameData.PauseGame = false;
        var currentPageIndex = this.pageView.getCurrentPageIndex();
        if (this.pageView.node.children[0].children[currentPageIndex].getChildByName(`gou`).active) {
            //已经有了，寻找下一个需要配对的Node
            for (let index = currentPageIndex; index < this.pageView.getPages().length; index++) {
                const element = this.pageView.node.children[0].children[index];
                if (!element.getChildByName(`gou`).active) {
                    this.pageView.scrollToPage(index, 1);
                    if (this.pageView.getCurrentPageIndex() == 11)
                        this.pageView.node.getChildByName(`btn_you`).active = false;
                    else
                        this.pageView.node.getChildByName(`btn_you`).active = true;
                    if (this.pageView.getCurrentPageIndex() == 0)
                        this.pageView.node.getChildByName(`btn_zuo`).active = false;
                    else
                        this.pageView.node.getChildByName(`btn_zuo`).active = true;
                    return;
                }
            }
            for (let index = 0; index < this.pageView.getPages().length; index++) {
                const element = this.pageView.node.children[0].children[index];
                if (!element.getChildByName(`gou`).active) {
                    this.pageView.scrollToPage(index, 1);
                    if (this.pageView.getCurrentPageIndex() == 11)
                        this.pageView.node.getChildByName(`btn_you`).active = false;
                    else
                        this.pageView.node.getChildByName(`btn_you`).active = true;
                    if (this.pageView.getCurrentPageIndex() == 0)
                        this.pageView.node.getChildByName(`btn_zuo`).active = false;
                    else
                        this.pageView.node.getChildByName(`btn_zuo`).active = true;
                    break;
                }
            }

        }
    }
    PageTurunHandler(event: cc.Event.EventCustom) {
        const currentPageIndex = this.pageView.getCurrentPageIndex();
        // cc.log("当前页面索引:", currentPageIndex);
        if (this.pageView.node.children[0].children[currentPageIndex].children[0].children[0].opacity == 0) {
           // this.showqp(this.pageView.node.children[0].children[currentPageIndex].children[0], this.soundString[currentPageIndex], this.soundString[currentPageIndex])
        }
        //this.pageView.node.children[0].children[currentPageIndex]
        if (this.pageView.getCurrentPageIndex() == 11)
            this.pageView.node.getChildByName(`btn_you`).active = false;
        else
            this.pageView.node.getChildByName(`btn_you`).active = true;
        if (this.pageView.getCurrentPageIndex() == 0)
            this.pageView.node.getChildByName(`btn_zuo`).active = false;
        else
            this.pageView.node.getChildByName(`btn_zuo`).active = true;
    }

    BtnHandler(even: cc.Event.EventTouch) {
        //console.log(GameData.PauseGame);
        if (GameData.PauseGame) return;
        AudioManager.playEffect("btn_252");
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
                if (!this.canjiaohu) break;
                var handlers = () => {
                    //  this.isshowVideo = true;
                    this.ppNode();

                    //VideoManager.getInstance().showInsert();
                    //this.tipsPanel.active = true;
                    // this.tipsPanel.getChildByName(`tishi`).children[1].getComponent(cc.Label).string=
                    // `选择${
                    //    this.realAnswer[this.curlevel-1]==0?`A`:this.realAnswer[this.curlevel-1]==1?`B`:`C`
                    // }选项`;



                }
                this.isshowVideo ? handlers && handlers() : VideoManager.getInstance().showVideo(() => {
                    handlers();
                });
                break;
            case "x":
                // this.tipsPanel.getChildByName("tishi" + (this.curlv).toString()).active = false;
                this.tipsPanel.active = false;
                break;
            //加次数
            case "btn_jiacishu":
                VideoManager.getInstance().showVideo(() => {
                    this.health += 5;
                    this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string = `剩余机会:${this.health}`
                })
                break;
            //左按钮
            case "btn_zuo":
                this.upAndDownPage(false);
                break;
            //右按钮
            case "btn_you":
                this.upAndDownPage(true);
                break;
        }
    }
    onlost() {

        this.scheduleOnce(() => {
            AudioManager.playEffect("com_cuo_252");
            GameData.PauseGame = false
            this.node.destroy();
            this.endlost("prefabs/zc/zc_lostend");
        }, 0.4)
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

    addChance() {
        VideoManager.getInstance().showVideo(() => {
            this.health += 5;
            this.node.getChildByName(`bg`).getChildByName(`healthLabel`).getComponent(cc.Label).string = `剩余机会:${this.health}`

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

    // 滚动到目标节点（建议在点击事件中调用）
    public scrollToTarget(node: cc.Node) {
        if (!this.scrollView || !node) return;

        this.targetNode = node;

        // 计算目标位置
        const targetPosition = this.calculateScrollPosition();
       // console.log(targetPosition);
        // 使用缓动滚动（0.5秒完成滚动）
         this.scrollView.scrollTo(targetPosition, 0.5);
        // var p = this.scrollView.getContentPosition();
        // console.log(targetPosition)
        // cc.tween(this.scrollView.content)
        // .to(0.5,{x:targetPosition.x})
        // .start()

        // this.scrollView.setContentPosition(targetPosition);
    }
    private calculateScrollPosition(): cc.Vec2 {
    // 获取 ScrollView 的视口尺寸
    const viewSize = this.scrollView.node.getContentSize();
    
    // 获取 Content 节点
    const content = this.scrollView.content;
    
    // 将目标节点的世界坐标转换为 Content 节点的本地坐标
    const targetWorldPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);
    const targetLocalPos = content.parent.convertToNodeSpaceAR(targetWorldPos);
    
    // 计算标准化滚动位置
    const minScrollPos = cc.v2(0, 0);
    const maxScrollPos = cc.v2(
        content.width - viewSize.width,
        content.height - viewSize.height
    );

    // 计算实际需要的滚动位置
    let scrollPosition = cc.v2(
        (targetLocalPos.x + this.targetNode.width/2 ) / content.width,
        (content.height - targetLocalPos.y - this.targetNode.height / 2) / content.height
    );

    // 转换为方向对应的实际滚动位置
    if (this.scrollView.vertical) {
        return cc.v2(0, maxScrollPos.y * scrollPosition.y);
    } else if (this.scrollView.horizontal) {
        return cc.v2( scrollPosition.x, 0);//maxScrollPos.x *
    }
    
    return cc.Vec2.ZERO;
}

    // private calculateScrollPosition(): cc.Vec2 {
    //     // 获取 ScrollView 的视口尺寸
    //     const viewSize = this.scrollView.node.getContentSize();

    //     // 获取 Content 节点
    //     const content = this.scrollView.content;
    //     this.scrollView.setContentPosition(cc.v2(-360, 0));
    //     // 将目标节点的世界坐标转换为 Content 节点的本地坐标
    //     const targetWorldPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);
    //     const targetLocalPos = content.parent.convertToNodeSpaceAR(targetWorldPos);

    //     // console.log(targetLocalPos);
    //     //  计算标准化滚动位置
    //     // const minScrollPos = cc.v2(0, 0);
    //     // const maxScrollPos = cc.v2(
    //     //     content.width - viewSize.width,
    //     //     content.height - viewSize.height
    //     // );

    //     // // 计算实际需要的滚动位置
    //     // let scrollPosition = cc.v2(
    //     //     ((targetLocalPos.x + this.targetNode.width) / 2) / content.width,
    //     //     (content.height - targetLocalPos.y - this.targetNode.height / 2) / content.height
    //     // );

    //     // // 转换为方向对应的实际滚动位置
    //     // if (this.scrollView.vertical) {
    //     //     return cc.v2(0, maxScrollPos.y * scrollPosition.y);
    //     // } else if (this.scrollView.horizontal) {
    //     //     console.log(maxScrollPos.x * scrollPosition.x, 0);
    //     //     return cc.v2(maxScrollPos.x * scrollPosition.x, 0);
    //     // }
    //     // return cc.Vec2.ZERO;

    //     return cc.v2((Math.abs(targetLocalPos.x + this.targetNode.width / 2) * -1), targetLocalPos.y)

    // }

    ppNode() {
        for (let index = 0; index < this.scrollView.content.childrenCount; index++) {
            const element = this.scrollView.content.children[index];
            //提示圈
            element.getChildByName(`lvquan`).active = false;
        }
        for (let index = 0; index < this.pageView.content.childrenCount; index++) {
            const element = this.pageView.content.children[index];
            element.getChildByName(`lvquan`).active = false;
        }
        var nowtipsNode = this.pageView.node.children[0].children[this.pageView.getCurrentPageIndex()].children[0];//获取当前的在的页面node
        if (nowtipsNode.parent.getChildByName(`gou`).active) {
            //当前已完成 重新寻找

        }
        for (let index = 0; index < this.scrollView.content.childrenCount; index++) {
            const element = this.scrollView.content.children[index];
            if (element.getComponent(qlitem_move_lv252).target === nowtipsNode) {
                element.getChildByName(`lvquan`).active = true;
                nowtipsNode.parent.getChildByName(`lvquan`).active = true;
                this.scrollToTarget(element);
                break;
            }
        }
    }
    upAndDownPage(isyou: boolean) {
        const uppage = isyou ? 1 : -1;
        //最右
        if (this.pageView.getCurrentPageIndex() + uppage == 11)
            this.pageView.node.getChildByName(`btn_you`).active = false;
        else
            this.pageView.node.getChildByName(`btn_you`).active = true;
        if (this.pageView.getCurrentPageIndex() + uppage == 0)
            this.pageView.node.getChildByName(`btn_zuo`).active = false;
        else
            this.pageView.node.getChildByName(`btn_zuo`).active = true;
        this.pageView.scrollToPage(this.pageView.getCurrentPageIndex() + uppage, 1);
    }
}