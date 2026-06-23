// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class FirstSplash extends cc.Component {

    @property({
        type: cc.SceneAsset,
        tooltip: "进入的目标场景"
    })
    targetScene: cc.SceneAsset = null;

     // 添加屏幕方向选项
     @property({
        type: cc.Enum({
            PORTRAIT: 0,    // 竖屏 750x1334
            LANDSCAPE: 1    // 横屏 1334x750
        }),
        tooltip: "屏幕方向设置"
    })
    screenOrientation: number = 0;

    public static enterSceneName:string="";
    onLoad () {
        FirstSplash.enterSceneName=this.targetScene.name;
        console.log(FirstSplash.enterSceneName);
        if (this.screenOrientation==0) {
            cc.director.loadScene("SplashScenePortrait");
        }else{
            cc.director.loadScene("SplashSceneLandscape");
        }
        
        // cc.director.loadScene(FirstSplash.enterSceneName);
    }

   
}
