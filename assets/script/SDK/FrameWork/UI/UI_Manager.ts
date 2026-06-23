// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UI_Config from "./UI_Config";
import UIPanel from "./Module/UIPanel";
import DebugLog from "../Debug/DebugLog";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI_Manager{
    private rootNode:cc.Node;
    private static instance:UI_Manager=null;
    public static  getInstance(){
        if (UI_Manager.instance==null) {
            UI_Manager.instance=new UI_Manager();
        }
        return UI_Manager.instance;
    }

    onInit(){
        this.rootNode=cc.Canvas.instance.node;
    }
    // public openPage(name:string){
    //     let root=cc.Canvas.instance.node;
    //     let curnode=cc.find(name,root);
    //     console.log(root);
    //     if (curnode==null) {
           
    //     }
    // }
    // public openWindow(name:string){
    //     let root=cc.Canvas.instance.node;
    //     let curnode=cc.find(name,root);
    //     console.log(root);
    //     if (curnode==null) {
           
    //     }
    // }
    loadUI(name:string,cb:any){
        console.log('loadUI:'+name);
        cc.loader.loadRes(UI_Config.UIRes+name, cc.Prefab, function(err, prefab) {
            if (err) {
                cc.log(err.message || err);
                return;
            }
            let node = cc.instantiate(prefab);
            cb(node);
          
        });

    }
  
    public showUI(name:string,obj:any=null,cb:any=null,zodrer:number=9999){
      
        console.log('showUI:'+name);
        let self = this;
        self.rootNode=cc.Canvas.instance.node;
        console.log('rootNode:');
        let curnode=cc.find(name,this.rootNode);
        console.log(curnode);
        if (curnode==null) {
           this.loadUI(name,function(node:cc.Node){
          
           
            self.rootNode.addChild(node,zodrer);
           
          
            node.getComponent(UIPanel).open(obj);
            cb&&cb(node);
           })
           return;
        }
       
        curnode.getComponent(UIPanel).open(obj);
        cb&&cb(curnode);

    }
    public hideUI(name:string,obj:any=null){
        let self = this;
        self.rootNode=cc.Canvas.instance.node;
        console.log("hideUI:"+name);
        let curnode=cc.find(name,this.rootNode);
        console.log("hideUI11:"+name);
      
       if (curnode!=null) {
         curnode.getComponent(UIPanel).close(obj);

        }
     

    }
    public showUIWithNode(node,obj:any=null){

        console.log("showUIWithNode:"+node.name); 
        node.getComponent(UIPanel).open(obj);

    }
    // update (dt) {}
}
