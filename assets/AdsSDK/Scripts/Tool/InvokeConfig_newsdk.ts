// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class InvokeConfig  {

  /**
   * 初始化
   */
  public static onInit:string="onInit";

    /**
   * 获取广告策略
   */
  public static getGGtype:string="getGGtype";
    /**
   * 插屏
   */
  public static showInsert:string="showInsert";
    /**
   * banner
   */
  public static showBanner:string="showBanner";
 /**
   * 激励视频
   */
 
  public static showVideo:string="showVideo";
   /**
   * 更多精彩
   */
  public static more:string="more";
     /**
   * 隐私政策
   */
  public static yszc:string="yszc";
    /**
   * 退出游戏
   */
  public static exit:string="exit";

   /**
   * 支付
   */
  public static pay:string="pay";
  
  /**
   * 订单补单
   */
  public static doOrder:string="doOrder";
  /**
   * androidtoast显示
   */
  public static androidToast:string="androidToast";

    /**
   * noads展示ui
   */
  public static showUI:string="showUI";

   /**
   * 小游戏---创建原生广告
   */
  public static createNative:string="createNative";
     /**
   * 小游戏---点击上报
   */
  public static onNativeAdClick:string="onNativeAdClick";
      /**
   * 小游戏---hideBanner
   */
  public static hideBanner:string="hideBanner";
 
     /**
   * 小游戏---hideNative
   */
  public static hideInsertNativeAd:string="hideInsertNativeAd";
 /**
   * 小游戏---toastshow
   */
  public static toastShow:string="toastShow";
  /**
   * 小游戏---startLogoSplash
   */
  public static startLogoSplash:string="startLogoSplash";
}
