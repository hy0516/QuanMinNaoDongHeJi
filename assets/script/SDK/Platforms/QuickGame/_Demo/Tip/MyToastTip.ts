// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIWidget from "../../../../FrameWork/UI/Module/UIWidget";
import UI_Manager from "../../../../FrameWork/UI/UI_Manager";



const {ccclass, property} = cc._decorator;

@ccclass
export default class MyToastTip extends UIWidget {

    @property(cc.Label)
    label: cc.Label = null;

    

    onOpen(obj){
        this.label.string=obj


        let normalWidth = 1280
        let normalHeight = 720
  
        let windowSize = cc.winSize;
       
        let winHeight = windowSize.height;
       let winWidth = windowSize.width;
        let scaleY = winHeight /normalHeight;
        let scaleX =winWidth /normalWidth;
        let scalew = scaleX / scaleY;
  
        if (winHeight>winWidth) {
          this.node.scaleX=1;
          this.node.scaleY=1;
        }else{
            this.node.scaleX=scaleX;
            this.node.scaleY=scaleX;
        
        }
  
      
        this.node.y=-winHeight/3;
       
        let action00 =cc.fadeIn(0.5)
        let action0 =cc.delayTime(2.0)
        let action1 =cc.fadeOut(0.5)
        let action2 = cc.callFunc(function(){
            console.log('hide'); 
            UI_Manager.getInstance().hideUI('MyToastTip');
        });
        let se=cc.sequence(action00,action0,action1,action2);
        this.node.runAction(se);
    }

    // update (dt) {}
}
