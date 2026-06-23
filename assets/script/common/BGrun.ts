const { ccclass, property } = cc._decorator;

@ccclass
export default class BGrun extends cc.Component {
    startpositionX= 720;
    moveSpeed= 15;

    update(dt) {
        for (let i = 0; i < this.node.children.length; i++) {
            var bg = this.node.children[i];
            if (bg.x <= -bg.width) {  
                bg.opacity = 0;
                bg.x=this.startpositionX;
            }
            if (bg.x == this.startpositionX) {
                bg.opacity = 255;
            }
            bg.x -= this.moveSpeed;
        }
    }
}
