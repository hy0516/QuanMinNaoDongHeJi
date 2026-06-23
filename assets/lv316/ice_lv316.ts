const {ccclass, property} = cc._decorator;

@ccclass
export default class ice extends cc.Component {
    @property(cc.Node)
    BirdNode: cc.Node = null;
    @property(cc.Node)
    BallNode: cc.Node = null;
    @property(cc.Node)
    icebg: cc.Node = null;

    Bird
    Ball
    BirdSpeed: number = 0;
    BallSpeed: number = 0;
    protected onLoad(): void {
        this.Bird = this.BirdNode.getComponent(`bird_lv316`);
        this.Ball = this.BallNode.getComponent(`ball_lv316`);
    }
    ice() {
        this.BirdSpeed = this.Bird.originSpeed;
        this.BallSpeed = this.Ball.rotateSpeed;

        this.Bird.originSpeed /= 2;
        this.Ball.rotateSpeed /= 2;
        
        this.icebg.active = true;
        this.scheduleOnce(() => {
            this.Ball.rotateSpeed = this.BallSpeed;
            this.Bird.originSpeed = this.BirdSpeed;
            this.Bird.speed = this.BirdSpeed;
            this.Bird.resetSpeed();
            this.icebg.active = false;
        }, 4);
    }
}