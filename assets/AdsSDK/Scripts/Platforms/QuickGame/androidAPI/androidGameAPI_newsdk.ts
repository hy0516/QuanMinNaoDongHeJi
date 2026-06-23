// import { PlatformsAPI } from "../PlatformsAPI";
// import TipUtils from "../../UIScripts/Tip/TipUtils";

// import Platform_android from "../../Android/Platforms_Android"
// import ViewManager from "../../Managers/ViewManager";
// import HintPanelView from "../../View/HintPanelView";

export default class androidGameAPI {
    hideInsertNativeAd() {
       
    }
    createNative(callback: any, nativeid: any) {
       
    }
    share(_callback: Function) {
       
    }
    shareVideo(_successCallback: Function, _failCallback: Function) {
      
    }
    onNativeIconAdClick() {
     
    }
    hasShortcutInstalled(_callback: Function) {
      
    }
    createMoreGames() {
       
    }
    showMoreGames() {
    
    }
    sendMessage(key: string, value: any) {
    
    }
    createNativeAdOPPO(_type: number) {
      
    }
    onShowNativeAdOPPO(_type: number, _callback: Function, _failCallback: Function) {
      
    }
    onNativeAdClickOPPO(_type: number, _id: string) {
    
    }
    onNativeAdShowReportOPPO(_type: number, _id: string) {
      
    }
    videoType:string;
    arg:any;

 
    /**初始化 */
    onInit(_callback:Function){
      
        // Platform_android.getInstance().onInit(_callback);
    }
   

   
    /**登录*/
    onLogin(){

    }
    /**分享游戏链接 */
    onShare(_callback:Function){

    }
    /**分享录屏 */
    onShareVideo(_callback:Function){

    }
    /**创建banner */
    createBanner(){

    }
    showBanner_OPPO(type: number) {
        throw new Error("Method not implemented.");
    }
    /**展示banner */
    showBanner(){
        // Platform_android.getInstance().showBanner();
    }
    /**隐藏banner */
    hideBanner(){
       
    }
    /**创建激励视频 */
    createVideo(){
       
    }

    /**
     * 
     * @param _type 类型
     * @param _arg 参数
     * @param _successCallback 成功回调
     * @param _failCallback 失败回调
     */
    /**展示激励视频 */
    showVideo( _successCallback: Function, _failCallback?: Function,_showCallback?:any,_closeCallback?:any) {
       
        
        // Platform_android.getInstance().showRewardedVideo(_successCallback,_failCallback,_failCallback);
    }
    /**----------原生平台调用----------
     * 激励视频播放成功后调用(OC->TS || JAVA->TS) 
     */
    showVideoAward(){
      
        this.arg = null;
    }
    /**----------原生平台调用----------
     * 激励视频播放失败后调用(OC->TS || JAVA->TS) 
     */
    showVideoFail(){
     
        this.arg = null;
    }
    /**创建插屏 */
    createInsertAd(){
       
    }
    /**展示插屏 */
    showInsertAd(){
        // Platform_android.getInstance().showInsertAd();
    }
    /**创建原生 */
    createNativeAd(){

    }

    
    /**
     * let theTime2 = new Date().getTime() / 1000;
                Platforms.getInstance().lastTimeRecord = theTime2;
     */



    /**展示原生 */
    showNativeAd(){
        // Platform_android.getInstance().showInsertAd();
    }
    /**原生被点击 */
    onNativeAdClick(_id:string){
     
    }
    /**创建原生icon */
    createNativeIconAd(){

    }
    /**展示原生icon */
    showNativeIconAd(){

    }
   
    /**适配不同渠道存储键值对localstorage
     * 默认使用 localStorage
     */
    saveDataToCache(_key:string,_value:any){

    }
    /**适配不同渠道读取键值对localstorage
     * 默认使用 localStorage
     */
    readDataFromCache(_key:string){

    }
    /** 检测是否已经有桌面图标 */
    isHasAddDeskTop(_callback:Function){

    }
    /**添加icon到桌面 */
    addDesktop(_callback:Function){
      
    }
    /**开始录制视频 */
    startRecordScreen(){

    }
    /**结束录制视频 */
    stopRecordScreen(){

    }
    /**创建更多游戏按钮 */
    createMoreGamesBtn(){

    }
    /**展示更多游戏按钮 */
    showMoreGamesBtn(){

    }
        /**
     * 跳转游戏
     * @param _packageName 包名
     */
    jumpToGame(_packageName:string){

    }
    /** 添加彩签*/
    addColorBookmark(){

    }
    /**订阅app */
    addSubscribeApp(){

    }
    /**短震动 */
    vibrateShort(){

    }
    /**长震动 */
    vibrateLong()
    {
        
    }
}