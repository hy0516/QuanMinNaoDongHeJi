// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDK_Manager_newsdk from "./FrameWork/UI/UISDK_Manager_newsdk";

const { ccclass, property } = cc._decorator;
export enum Platform {
    ry_H5 = 1,
    oppo_H5,
    qqplay_H5=3,
    toutiao_H5,
    vivo_H5=5,
    weixin_H5,
    x4399_H5=7,
    xiaomi_H5,
    huawei_H5=9,
    android=10,
    HarmoneyOS=11,
    ks=12
}
@ccclass
export default class SDK_config {

    
    public static packageName="com.jy.wgdng.xyx.huawei";

    public static companyName='深圳市天善力思科技有限公司';

    
    public static yszcType=0;
    public static gameName="game name";
    
    //著作权人
    public static copyrightOwner='深圳市天善力思科技有限公司';
    public static version=1;
    //登记号
    public static softwareCopyrightNo='2025SA0085337';
    
    /**---------------------------小游戏配置-------- */
    /** 切换渠道*/
    public static platform: Platform = Platform.HarmoneyOS;

    /** 测试模式，测试广告用*/
    public static nativeTest: boolean = true;

    /**华为测试包为true，则是华为测试包*/
    public static ADTest: boolean = true;

    /**买量设置,买量开关和appid */
    public static openMaiLiang:boolean=false;
    public static maiLiangAppid="C1111111";



    public static GameIdConfig = {



        ry: {
            appId: "1110431838",
            bannerAdId: "15fdd021f0fe060f0f56e12e139efe5e",
            rewardedVideoAdId: "c479fd46d147847f80223b5c1768d449",
            InsertAdId: "51ec4f1d84290d0b43d67150044907c8",
            NativeAdId: "",
            NativeAdIconId: "",
        },
      
        vivoID: {
           
            appId: "105584241",
            bannerAdId: "9f60a039b71c47ea914330363892b60c",
            rewardedVideoAdId:[ "077c9db7966d4481bb77084f65e49794"],
            InsertAdId: ["3b1031ae109b487e92e45552a956a322"],
            NativeAdId: ["a8ff912fc3d340819fc30d1c57f6dd6c"],
            NativeAdbanner: ["d885480cb2574f5fbb0c1e9699c09242"],
        },
        oppoID: {
         
            appId: "30857229",
            bannerAdId: "590143",
            rewardedVideoAdId:["590298"] ,
            InsertAdId: ["497479"],
            NativeAdId: ["590148","59014811"],
            NativeAdbanner: ["590148"],
        },
     

        /**前面一个testid */
        huaweiID: {
        
    
          
            // NativeSplahId:SDK_config.ADTest?"testu7m3hc4gvm":"",
            // companyName:'深圳市指点天下科技有限公司',
            // gameName:'倒霉先生',
            hwyszc:"http://www.zdtxia.com/aspcms/about/about-499.html",
         
            appId: "110432857",       
            bannerAdId:[SDK_config.ADTest?"testw6vs28auh3":""] ,//w27b6hl4nn
            rewardedVideoAdId: [ SDK_config.ADTest?"e7hm5vx799":"g7roht861r","g7roht861r",],                  
            InsertAdId:[SDK_config.ADTest?"":"j3qzrg6syq"] ,     
            NativeAdId:[SDK_config.ADTest?"testu7m3hc4gvm":"b49o4981k9","b49o4981k9","b49o4981k9"],
            NativeAdbanner:[SDK_config.ADTest?"t84rv1pbtk":"m5iq4fwe8e","m5iq4fwe8e","m5iq4fwe8e"],

           
         
        },
        ryID: {
         
            appId: "30857229",
            bannerAdId: "590143",
            rewardedVideoAdId:["590298"] ,
            InsertAdId: ["497479"],
            NativeAdId: ["590148"],
            NativeAdbanner: ["590148"],
        },
        toutiaoID: {
            appId: "ttddd8ab6542e1df5702",
            bannerAdId: "9f60a039b71c47ea914330363892b60c",
            rewardedVideoAdId: ["077c9db7966d4481bb77084f65e49794"],
            InsertAdId: ["3b1031ae109b487e92e45552a956a322"],
            NativeAdId: ["a8ff912fc3d340819fc30d1c57f6dd6c"],
            NativeAdbanner: ["d885480cb2574f5fbb0c1e9699c09242"],
            subscriptionIds: [""],
            share: "",
        },
        kuaishouID: {
            appId: "ks676665848064647773",
            bannerAdId: "2300028872_04",
            rewardedVideoAdId: ["2300042388_01"],
            InsertAdId: ["2300042388_02"],
            NativeAdId: ["590148", "59014811"],
            NativeAdbanner: ["590148"],
        },
        weixinID: {
          
            appId: "105584241",
            bannerAdId: "9f60a039b71c47ea914330363892b60c",
            rewardedVideoAdId: ["077c9db7966d4481bb77084f65e49794"],
            InsertAdId: ["3b1031ae109b487e92e45552a956a322"],
            NativeAdId: ["a8ff912fc3d340819fc30d1c57f6dd6c"],
            NativeAdbanner: ["d885480cb2574f5fbb0c1e9699c09242"],
            subscriptionIds: [""],
        },
    }

    private static _configData: any = null;
    private static _initialized: boolean = false;
    /**
     * 初始化配置数据
     */
    public static async init(overcb:()=>void,over_configcb?: () => void){
      
        await UISDK_Manager_newsdk.getInstance().onInit();
      
        UISDK_Manager_newsdk.getInstance().bundle.load('config_ad', cc.JsonAsset, (err, resource:cc.JsonAsset) => {
            if (err) {
                cc.error('加载预制体失败:', err);
                overcb();
                return;
            }
            //window环境下不进行json文件读取，方便测试
            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                overcb();
                return 
            }
            
            this._configData = resource.json;
            this._initialized = true;
            
          
            this.openMaiLiang=this._configData.openMaiLiang; 
            this.version=this._configData.version ;
            // this.yszcType=this._configData.yszcType ;
            //读取配置改为固定写死专门路平组使用
            this.yszcType=2;
            this.gameName=this._configData.gameName ;
            // 设置其他配置
            this.packageName= this._configData.packageName 
            this.companyName=this._configData.companyName;
            this.copyrightOwner=this._configData.copyrightInfo.owner;
            this.softwareCopyrightNo=this._configData.copyrightInfo.registrationNo;
            this.platform = this._configData.platform ;
            this.nativeTest = this._configData.nativeTest !== undefined ? this._configData.nativeTest : true;
            this.ADTest = this._configData.ADTest !== undefined ? this._configData.ADTest : false;
            // this.enterSceneName=this._configData.enterSceneName ;
        
            if ( this.ADTest==false) {
                  // 初始化GameIdConfig
                this.GameIdConfig = this._configData.GameIdConfig || {};
            }else{

            }
            overcb();
        });
        // return new Promise<void>((resolve, reject) => {
        //     cc.loader.loadRes("SDK/res/config_ad", (err: Error, resource: any) => {
        //         if (err) {
        //             cc.error("Failed to load config_ad.json:", err);
        //             reject(err);
        //             return;
        //         }
                
        //         this._configData = resource.json;
        //         this._initialized = true;
                
              
                
        //         // 设置其他配置
        //         this.platform = this._configData.platform || Platform.huawei_H5;
        //         this.nativeTest = this._configData.nativeTest !== undefined ? this._configData.nativeTest : true;
        //         this.ADTest = this._configData.ADTest !== undefined ? this._configData.ADTest : false;

        //         if ( this.ADTest==false) {
        //               // 初始化GameIdConfig
        //             this.GameIdConfig = this._configData.GameIdConfig || {};
        //         }
                
        //         resolve();
        //     });
        // });
    }

    /**
     * 获取配置值
     * @param key 配置键
     * @param defaultValue 默认值
     */
    public static getConfig<T>(key: string, defaultValue?: T): T {
        if (!this._initialized) {
            cc.warn("SDK_config not initialized, call init() first");
            return defaultValue as T;
        }
        return this._configData[key] !== undefined ? this._configData[key] : defaultValue;
    }

}
