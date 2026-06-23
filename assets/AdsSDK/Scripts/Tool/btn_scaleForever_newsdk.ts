
const {ccclass, property} = cc._decorator;

@ccclass
export default class Common_scaleForever extends cc.Component {

    @property
    time: number = 0.5;
    
    @property
    scaleBig: number = 1.2;

    @property
    scaleLittle: number = 1;

    scaleBegin(){
        this.node.runAction(cc.repeatForever(
            cc.sequence(
            cc.scaleTo(this.time,this.scaleBig),
            cc.scaleTo(this.time,this.scaleLittle),
        )
        ));
    }

    scaleEnd(){
        this.node.stopAllActions();
    }

    start () {
       this.scaleBegin();
    }

    onDestroy(){
        this.node.stopAllActions();
    }
}
