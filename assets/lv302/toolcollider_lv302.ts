import AudioManager from "../script/common/AudioManager";
import dwby_lv302 from "./dwby_lv302";

const {ccclass, property} = cc._decorator;

@ccclass
export default class toolcollider_lv302 extends cc.Component {


    @property(cc.Node)
    toolsNode: cc.Node = null;

    @property(cc.Node)
    mainNode: cc.Node = null;

    mainScript: dwby_lv302 = null;
    //目标节点数组
    targetNode: cc.Node[] = [];


    skeScript: dragonBones.ArmatureDisplay = null;

    isCollider = false;

    //第一次电钻打击
    isOnce: boolean = false;


    protected onLoad(): void {
        this.mainScript = this.mainNode.getComponent(dwby_lv302);
        this.targetNode = this.mainScript.lvScript.targetNodes;
    }


    // 碰撞回调
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.isCollider) {
            return;
        }
        this.levelLogicMgr(this.mainScript.curlv, other.node.name);
            
    }

    //总关卡逻辑管理
    levelLogicMgr(num: number, name: string){
        switch (num){
            case 1:
                if (!this.mainScript.isSpecial) {
                    this.lvFiveLogic(name);
                }
                else{
                    this.specialToolLogic(name);
                }
                
                break;
            case 2:
                if (!this.mainScript.isSpecial) {
                    this.lvTwoLogic(name);
                }
                else{
                    this.specialToolLogic(name);
                }
                break;
            case 3:
                if (!this.mainScript.isSpecial) {
                    this.lvThreeLogic(name);
                }
                else{
                    this.specialToolLogic(name);
                }
                break;
            case 4:
                if (!this.mainScript.isSpecial) {
                    this.lvFourLogic(name);
                }
                else{
                    this.specialToolLogic(name);
                }
                break;
            case 5:
                if (!this.mainScript.isSpecial) {
                    this.lvOneLogic(name);
                }
                else{
                    this.specialToolLogic(name);
                }
                break;

        }
    }
    specialToolLogic(name: string) {
        throw new Error("Method not implemented.");
    }

    //第一关逻辑处理
    lvOneLogic(name: string){
        this.targetNode = this.mainScript.lvScript.targetNodes;
        this.skeScript = this.mainScript.skeScript;

        if (name == "lv1_pd") {
            this.mainScript.toothNum--; 
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
            AudioManager.playEffect("拔牙");
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = 0;
            this.mainScript.isClick = false;
            // this.targetNode[2].active = true;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndPlayByFrame(this.mainScript.moveAnimationName, 55, 1);
            this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                // this.skeScript.armature().animation.play();
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 1;
                this.targetNode[2].active = true;
                AudioManager.playEffect("哭泣");
                // this.isCollider = true;
            }, 0.5);

            if (this.mainScript.toothNum == 0) {
                this.scheduleOnce(() => {
                    this.mainScript.nextLv();
                    this.isCollider = false;
                    this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = -1;
                }, 2);
            }
            
                  
        }
        else if(name == "cw"){
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            AudioManager.playEffect("未拔中");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 0;
            this.mainScript.isClick = false;
            for (let i = 0; i  < 2; i++) {
                this.targetNode[i].active = true;  
            }
            this.skeScript.armature().getSlot("biaoqing").displayIndex = 0;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.mainScript.gameMistake();
            this.scheduleOnce(() => {
                this.toolsNode.getComponent(dragonBones.ArmatureDisplay).playAnimation(this.mainScript.waitAnimationName, 0);
                for (let i = 0; i  < 2; i++) {
                    this.targetNode[i].active = false;  
                }
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 2;
                this.mainScript.isClick = true;
                this.skeScript.armature().animation.play();
                this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
                this.isCollider = false;
                
            }, 1);
            
        }
    }

    //第二关逻辑处理
    lvTwoLogic(name: string){

        this.targetNode = this.mainScript.lvScript.targetNodes;
        this.skeScript = this.mainScript.skeScript;

        if (name == "lv2_pd1") {
            this.mainScript.toothNum--;
            AudioManager.playEffect("拔牙");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = 0;
            this.mainScript.isClick = false;
            // this.targetNode[2].active = true;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndPlayByFrame(this.mainScript.moveAnimationName, 60, 1);
            this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                // this.skeScript.armature().animation.play();
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 0;
                AudioManager.playEffect("哭泣");
                this.targetNode[2].active = true;
                // this.isCollider = true;
            }, 0.5);

            if (this.mainScript.toothNum == 0) {
                this.scheduleOnce(() => {
                    this.mainScript.nextLv();
                    this.isCollider = false;
                    this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = -1;
                }, 2);
            }
            
                  
        }
        else if(name == "cw"){
            this.mainScript.isClick = false;
            AudioManager.playEffect("未拔中");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 0;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            for (let i = 0; i  < 2; i++) {
                this.targetNode[i].active = true;  
            }
            this.skeScript.armature().getSlot("biaoqing").displayIndex = 2;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                this.toolsNode.getComponent(dragonBones.ArmatureDisplay).playAnimation(this.mainScript.waitAnimationName, 0);
                for (let i = 0; i  < 2; i++) {
                    this.targetNode[i].active = false;  
                }
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 1;
                this.mainScript.isClick = true;
                this.skeScript.armature().animation.play();
                this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
                this.isCollider = false;
                this,this.mainScript.gameMistake();
            }, 1);
            
        }
    }

    //第三关逻辑处理
    lvThreeLogic(name: string){
        this.targetNode = this.mainScript.lvScript.targetNodes;
        this.skeScript = this.mainScript.skeScript;

        if (name == "lv3_pd1") {
            this.mainScript.toothNum--;
            AudioManager.playEffect("拔牙");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = 0;
            this.mainScript.isClick = false;
            // this.targetNode[2].active = true;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndPlayByFrame(this.mainScript.moveAnimationName, 60, 1);
            this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                // this.skeScript.armature().animation.play();
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 2;
                AudioManager.playEffect("哭泣");
                this.targetNode[2].active = true;
                // this.isCollider = true;
            }, 0.5);

            if (this.mainScript.toothNum == 0) {
                this.scheduleOnce(() => {
                    this.mainScript.nextLv();
                    this.isCollider = false;
                    this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = -1;
                }, 2);
            }
            
                  
        }
        else if(name == "cw"){
            this.mainScript.isClick = false;
            AudioManager.playEffect("未拔中");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 0;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            for (let i = 0; i  < 2; i++) {
                this.targetNode[i].active = true;  
            }
            this.skeScript.armature().getSlot("biaoqing").displayIndex = 1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                this.toolsNode.getComponent(dragonBones.ArmatureDisplay).playAnimation(this.mainScript.waitAnimationName, 0);
                for (let i = 0; i  < 2; i++) {
                    this.targetNode[i].active = false;  
                }
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 0;
                this.mainScript.isClick = true;
                this.skeScript.armature().animation.play();
                this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
                this.isCollider = false;
                this.mainScript.gameMistake();
            }, 1);
            
        }
    }

    //第四关逻辑处理
    lvFourLogic(name: string){
        this.targetNode = this.mainScript.lvScript.targetNodes;
        this.skeScript = this.mainScript.skeScript;

        if (name == "lv4_pd1") {
            this.mainScript.toothNum--;
            AudioManager.playEffect("拔牙");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            this.mainScript.isClick = false;
            // this.targetNode[2].active = true;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndPlayByFrame(this.mainScript.moveAnimationName, 60, 1);
            if (this.mainScript.toothNum == 0) {
                this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = 6;
                this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;

            }
            this.isCollider = true;
            this.skeScript.armature().animation.stop();
            this.scheduleOnce(() => {
                // this.skeScript.armature().animation.play();
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 2;
                AudioManager.playEffect("哭泣");
                this.targetNode[2].active = true;
                // this.isCollider = true;
            }, 0.5);

            if (this.mainScript.toothNum == 0) {
                this.scheduleOnce(() => {
                    this.mainScript.nextLv();
                    this.isCollider = false;
                    this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = -1;
                }, 2);
            }
            else{
                this.scheduleOnce(() => {
                    this.toolsNode.getComponent(dragonBones.ArmatureDisplay).playAnimation(this.mainScript.waitAnimationName, 0);
                    this.targetNode[2].active = false;
                    this.skeScript.armature().getSlot("biaoqing").displayIndex = 0;
                    this.skeScript.armature().animation.play();
                    this.isCollider = false;
                    this.mainScript.isClick = true;
                }, 2);
            }
            
                  
        }
        else if(name == "cw"){
            this.mainScript.isClick = false;
            AudioManager.playEffect("未拔中");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 0;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            for (let i = 0; i  < 2; i++) {
                this.targetNode[i].active = true;  
            }
            this.skeScript.armature().getSlot("biaoqing").displayIndex = 1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                this.toolsNode.getComponent(dragonBones.ArmatureDisplay).playAnimation(this.mainScript.waitAnimationName, 0);
                for (let i = 0; i  < 2; i++) {
                    this.targetNode[i].active = false;  
                }
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 0;
                this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
                this.mainScript.isClick = true;
                this.skeScript.armature().animation.play();
                this.isCollider = false;
                this.mainScript.gameMistake();
            }, 1);
            
        }
    }

    //第五关逻辑处理
    lvFiveLogic(name: string){
        this.targetNode = this.mainScript.lvScript.targetNodes;
        this.skeScript = this.mainScript.skeScript;

        if (name == "lv5_pd1") {
            this.mainScript.toothNum--;
            AudioManager.playEffect("拔牙");
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
            this.mainScript.isClick = false;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = 0;
            // this.targetNode[2].active = true;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.gotoAndPlayByFrame(this.mainScript.moveAnimationName, 60, 1);
            this.skeScript.armature().getSlot("zhuya1").displayIndex = -1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                // this.skeScript.armature().animation.play();
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 0;
                AudioManager.playEffect("哭泣");
                this.targetNode[2].active = true;
                // this.isCollider = true;
            }, 0.5);

            if (this.mainScript.toothNum == 0) {
                this.scheduleOnce(() => {
                    this.mainScript.nextLv();
                    this.isCollider = false;
                    this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().getSlot("zhuya").displayIndex = -1;
                }, 2);
            }
            
                  
        }
        else if(name == "cw"){
            AudioManager.playEffect("未拔中");
            this.mainScript.isClick = false;
            this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 0;
            this.toolsNode.getComponent(dragonBones.ArmatureDisplay).armature().animation.stop();
            for (let i = 0; i  < 2; i++) {
                this.targetNode[i].active = true;  
            }
            this.skeScript.armature().getSlot("biaoqing").displayIndex = 1;
            this.skeScript.armature().animation.stop();
            this.isCollider = true;
            this.scheduleOnce(() => {
                this.toolsNode.getComponent(dragonBones.ArmatureDisplay).playAnimation(this.mainScript.waitAnimationName, 0);
                for (let i = 0; i  < 2; i++) {
                    this.targetNode[i].active = false;  
                }
                this.skeScript.armature().getSlot("biaoqing").displayIndex = 2;
                this.mainScript.isClick = true;
                this.mainScript.ysSke.armature().getSlot("zuiba").displayIndex = 1;
                this.skeScript.armature().animation.play();
                this.isCollider = false;
                this.mainScript.gameMistake();
            }, 1);
            
        }
    }

}
