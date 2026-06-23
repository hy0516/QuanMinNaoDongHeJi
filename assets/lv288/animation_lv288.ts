
const {ccclass, property} = cc._decorator;

@ccclass
export default class animation_lv288 extends cc.Component {


    
    

    protected start(): void {
        //this.moveAndFadeOutTween();
    }
    //饼干碎片移动动画
    moveAndFadeOutTween(node: cc.Node, distance: number = 100, duration: number = 0.5) {
        const direction = node.angle * Math.PI / 180;
        const dx = -Math.cos(direction) * distance;
        const dy = -Math.sin(direction) * distance;

        cc.tween(node)
            .by(duration, { position: cc.v3(dx, dy, 0), opacity: -255 })
            .start();
    }

    gameWin(value: number){
        if (value == 4) {
            
        }
    }
    


   
}
