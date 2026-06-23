// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


export default abstract class AdInteface  {


    public abstract initData(posid:string);

    public abstract isReady();

    public abstract show(any?,cb1?:(any?)=>void,cb2?:(any?)=>void);
   
    public abstract preLoadAd(cb1?:(any?)=>void,cb2?:(any?)=>void);

    public  loadAdnShow(_successCallback,_failCallback){};
    
    public  hide(){};
}
