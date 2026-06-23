import GameData from "../../script/common/GameData";

export enum toolType{
    Left,
    Right
}
const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

   //道具移动速度
    @property
    toolSpeed:number = 1;
   //缩放倍率
    @property
    scaleSpeed:number = 0.001;


    //缩放限额
    maxY:number = 1308.726;
   

    //中心坐标点
    @property(cc.Node)
    middlePos:cc.Node = null;
    // onLoad () {}

    //道具类型toolType
    @property(cc.Float)
    toolType:number = 1;

    //最小缩放值
    @property(cc.Float)
    scaleMin : number = 0.15;   //goup_1:0.7  group_2:0.6 grouop_3:0.5

    //最大缩放值
    @property(cc.Float)
    scaleMax : number = 0.85;  //木棍人

    /**木棍人到达*/
    isCome:boolean = false;

    start () {
        
        if(this.toolType  == 3){
            //this.node.getComponent(dragonBones.ArmatureDisplay).playAnimation("gongji",0);
        }
    }

    /**道具移动方法*/
    toolMoved(dt){
        
         

        let Y = this.node.position.y - this.toolSpeed;
        let X = this.node.position.x; 

        this.node.position =new cc.Vec3(X,Y,0);

        

    }

    //道具缩放更新方法
    toolScaleUpdate(dt){
        

        let  Y = (this.maxY - this.node.position.y);
        
       this.toolSpeed = this.toolSpeed + Y*0.03*0.01*dt;


        let scaleNum = this.scaleMin + Y * this.scaleSpeed;

      //  if(scaleNum >= this.scaleMin){

             this.node.setScale(scaleNum);
        //}
        // else{
        //     this.node.setScale(this.scaleMin);
        // }

       //木棍人放大限制
       if(this.toolType == 3){
        
          if(scaleNum >= this.scaleMax){

            this.node.setScale(this.scaleMax);
        }

       }
        
    }
    //道具X坐标更新
     toolXUpdate(){
        
        let middle_x = this.middlePos.x;

        let Distance = this.node.getBoundingBox().width / 2;

        //左道具
        if(this.toolType == 1){
            let X = middle_x - Distance;
            this.node.position = new cc.Vec3(X,this.node.position.y,0);
        }
        //右道具
        if(this.toolType == 2){
            let X = middle_x + Distance;
            this.node.position = new cc.Vec3(X,this.node.position.y,0);
        }
        
        //木棍人
         if(this.toolType == 3){
            let X = middle_x;
            this.node.position = new cc.Vec3(X,this.node.position.y,0);
        }
      

        
        
     }  

 

     update (dt) {

        if(GameData.PauseGame == true) return;

        //木棍人到达
        if(this.isCome ==true) return;

        //X坐标更新
        this.toolXUpdate();

        //道具移动
        this.toolMoved(dt);

        //缩放更新
        this.toolScaleUpdate(dt);

       
     }
}
