// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDK_Config from "./UISDK_Config_newsdk";
import UISDKPanel from "./Module/UIPanel_newsdk";
import DebugLog from "../Debug/DebugLog_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISDK_Manager_newsdk{
    private rootNode:cc.Node;
    public bundle:cc.AssetManager.Bundle;
    private static instance:UISDK_Manager_newsdk=null;
    public static  getInstance(){
        if (UISDK_Manager_newsdk.instance==null) {
            UISDK_Manager_newsdk.instance=new UISDK_Manager_newsdk();
        }
        return UISDK_Manager_newsdk.instance;
    }


    public  async onInit(): Promise<void> { 
        this.rootNode=cc.Canvas.instance.node;

        return new Promise<void>((resolve, reject) => {
            cc.assetManager.loadBundle('SDKres', (err, bundle) => {
                if (err) {
                    cc.error('加载SDKres Bundle失败:', err);
                    reject(err);
                    return;
                }
                this.bundle=bundle;
                resolve();
            });
            // cc.loader.loadRes("SDK/res/config_ad", (err: Error, resource: any) => {
            //     if (err) {
            //         cc.error("Failed to load config_ad.json:", err);
            //         reject(err);
            //         return;
            //     }
               
              
               
            // });
        });
      

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
        DebugLog.log('loadUI:'+name);

         // 从bundle中加载预制体
         this.bundle.load(UISDK_Config.UIRes+name, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.error('加载预制体失败:', err);
                return;
            }
            
            let node = cc.instantiate(prefab);
            cb(node);
        });

    }
  
    public showUI(name:string,obj:any=null,cb:any=null,zodrer:number=cc.macro.MAX_ZINDEX){
      
        DebugLog.log('showUI:'+name);
        let self = this;
        self.rootNode=cc.Canvas.instance.node;
        DebugLog.log('rootNode:');
        let curnode=cc.find(name,this.rootNode);
       // console.log(curnode);
        if (curnode==null) {
           this.loadUI(name,function(node:cc.Node){
          
           
            self.rootNode.addChild(node,zodrer);
           
          
            node.getComponent(UISDKPanel)&&node.getComponent(UISDKPanel).open(obj);
            cb&&cb(node);
           })
           return;
        }
       
        curnode.getComponent(UISDKPanel)&&curnode.getComponent(UISDKPanel).open(obj);
        cb&&cb(curnode);

    }
    public hideUI(name:string,obj:any=null){
        let self = this;
        self.rootNode=cc.Canvas.instance.node;
        DebugLog.print("","hideUI:"+name);
        let curnode=cc.find(name,this.rootNode);
     //   console.log("hideUI11:"+name);
      
       if (curnode!=null) {
         curnode.getComponent(UISDKPanel).close(obj);

        }
     

    }
    public showUIWithNode(node,obj:any=null){

        DebugLog.log("showUIWithNode:"+node.name); 
        node.getComponent(UISDKPanel).open(obj);

    }
    // update (dt) {}
}
