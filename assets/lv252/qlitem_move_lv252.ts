
import AudioManager from "../script/common/AudioManager";
import GameData from "../script/common/GameData";
import mnyj_lv252 from "./mnyj_lv252";


const { ccclass, property } = cc._decorator;

@ccclass
export default class qlitem_move_lv252 extends cc.Component {

    private animationMap = {
    'lv1_1': 'lv1_2',
    'lv2_1': 'lv2_2',
    'lv3_1': 'lv3_2',
    'lv4_1': 'lv4_2',
    'lv5_1': 'lv5_2',
    'lv6_1': 'lv6_2',
    'lv7_1': 'lv7_2',
    'lv8_1': 'lv8_2',
    'lv9_1': 'lv9_2',
    'lv10_1': 'lv10_2',
    'lv11_1': 'lv11_2',
    'lv12_1': 'lv12_2'
    };

    @property(cc.Node)
    icon: cc.Node = null;

    /**脚本所挂道具对应的目标龙骨 */
    @property(cc.Node)
    target: cc.Node = null;

    /**场景节点 */
    @property(cc.Node)
    mainNode: cc.Node = null;

    @property(cc.Integer)
    type: number = 0;


    data: any = null;

    public Bgicon: cc.Node;
    public skin: cc.SpriteFrame;
    public startPoi: cc.Vec2

    protected onLoad(): void {
        // this.Bgicon = cc.find("Canvas/ql_lv1/icon");

        // console.log(this.mainNode)
        this.Bgicon = this.mainNode.getChildByName("icon");
        this.Bgicon.active = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.icon=this.node.getChildByName(`icon`);



        //target上挂载的宝宝龙骨加载后，再关闭active(aramutre数据可能比较大，
        // 不能与操作代码同步执行，需要在游戏开始时就加载到缓存中。其次，龙骨的active需为ture才开始加载！！！)
        this.target.getChildByName("kidSke_252").active = false;
    }

    refreshIcon() {
        this.Bgicon = this.mainNode.getChildByName("icon");
    }
    onTouchStart() {

    }

    /**释放过渡 */
    // transform(event: cc.Event.EventTouch,target:cc.Node,isRight:boolean){
        
    //     let targetPos = this.Bgicon.parent.convertToNodeSpaceAR(target.parent.convertToWorldSpaceAR(target.position)) ;
    //     let startPos = this.Bgicon.parent.convertToNodeSpaceAR(event.getLocation());

    //     this.Bgicon.opacity = 100;
    //     this.Bgicon.position = new cc.Vec3(startPos.x,startPos.y,0);
    //     cc.tween(this.Bgicon)
    //     .to(1,{position:targetPos})
    //     .call(()=>{
    //         this.Bgicon.opacity = 255;
    //         this.mainNode.getComponent(mnyj_lv252).checkYesOrNo(isRight);
    //     })
    //     .start();
    // }

    onTouchMove(event: cc.Event.EventTouch) {
        if (GameData.PauseGame) {
            return
        }
        if (this.Bgicon.active) {
            //@ts-ignore
            this.Bgicon.position = this.mainNode.convertToNodeSpaceAR(event.getLocation());
            return
        }

        var curPoi = this.mainNode.convertToNodeSpaceAR(event.getLocation());
        var biaozhui = this.node.parent.position.y + (this.node.height / 2);
        if (curPoi.y > biaozhui-480) {
            //@ts-ignore
            this.Bgicon.position = this.mainNode.convertToNodeSpaceAR(event.getLocation());
            this.Bgicon.active = true;
            // @ts-ignore
            this.Bgicon.getComponent(cc.Sprite).spriteFrame = this.icon.getComponent(cc.Sprite).spriteFrame;
            this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = false;
        }
    }
    //触摸结束
    onTouchEnd(event: cc.Event.EventTouch) {
        if (GameData.PauseGame || !this.Bgicon.active) return
        GameData.PauseGame = true;
        //恢复滑动
        this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = true;

        //获取当前鼠标位置在目标节点局部空间下的坐标值
        var poi = this.target.parent.convertToNodeSpaceAR(event.getLocation());

        //拖拽物是否在节点包围盒内
        if (this.target.getBoundingBox().contains(poi)) {

          //  this.mainNode.getComponent(game_ql).moveHandler(this.type, this.target, null);
        //   this.target.getComponent(dragonBones.ArmatureDisplay).playAnimation(`yes`,0);

        const armatureDisplay = this.target.getComponent(dragonBones.ArmatureDisplay);
        // 获取当前播放的动画名称
        const currentAnim = armatureDisplay.animationName;

        // 查找对应的目标动画
        const targetAnim = this.animationMap[currentAnim];

        // 如果找到对应关系，则播放目标动画
        armatureDisplay.playAnimation(targetAnim, 0);

        //宝宝父母睡觉
        AudioManager.playEffect("睡觉声_252");
        this.mainNode.getComponent(mnyj_lv252).kidSkeUpdate(this.type,"睡觉",this.target);
        this.mainNode.getComponent(mnyj_lv252).parentSkeUpdate(this.type,"睡觉",this.target);


          this.target.parent.getChildByName(`lvquan`).active=false;

          this.target.parent.getChildByName(`gou`).active=true;

        //this.target.parent.getChildByName(`dagou`).active=true;

          //播放正确音效
        AudioManager.playEffect("finishjq");
        this.mainNode.getComponent(mnyj_lv252).checkYesOrNo(true);

            this.scheduleOnce(() => {
                this.node.destroy();
                //缩短滑动框
                this.node.parent.width -= 150;
            }, 0.02);
        } else {

            const itemlist =this.mainNode.getComponent(mnyj_lv252).pageView;
            for (let index = 0; index < itemlist.getPages().length; index++) {
                // console.log(itemlist.node.children[0]);
                // console.log(itemlist.node.children[0].children[index]);
                //父母龙骨节点父节点
                const element =itemlist.node.children[0].children[index];
                poi=element.convertToNodeSpaceAR(event.getLocation());

                let gou = element.getChildByName("gou"); //已睡去的父母不再能拖拽上去
                if(element.children[0].getBoundingBox().contains(poi) && gou.active != true)
                {
                    //AudioManager.playEffect("com_cuo");

                    //console.log(index);
                    //宝宝父母哭泣
                    AudioManager.playEffect("哭泣_252");
                    this.mainNode.getComponent(mnyj_lv252).kidSkeUpdate(this.type,"哭泣",element.children[0]);//传入父母龙骨节点
                    this.mainNode.getComponent(mnyj_lv252).parentSkeUpdate(index,"哭泣",element.children[0]); 

                    //this.transform(event,targetChild,false);
                    this.mainNode.getComponent(mnyj_lv252).checkYesOrNo(false);

                    GameData.PauseGame = true;

                    break;
                }

                else{
                    GameData.PauseGame = false;
                }
            }
           // this.mainNode.getComponent(game_ql).addTime(null, -5);

        }
        this.Bgicon.active = false;
        //GameData.PauseGame = false;
    }

    oninit(data: any) {
        this.data = data;

    }



}
