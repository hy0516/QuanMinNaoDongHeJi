export interface PlatformsInterface {

    /**初始化 */
    onInit(_callback: Function);
    /**登录*/
   
    share(_callback: Function);
    /**分享录屏 */
    shareVideo(_successCallback: Function, _failCallback: Function);
    /**创建banner */
  
    showBanner(_arg?: any);
    /**隐藏banner */
    hideBanner();
   
    /**
     * 
  
     * @param _arg 参数
     * @param _successCallback 成功回调
     * @param _failCallback 失败回调
     */
    /**展示激励视频 */
    showVideo( _successCallback: Function, _failCallback?: Function,_showCallback?:any,_closeCallback?:any) ;
    /**----------原生平台调用----------
     * 激励视频播放成功后调用(OC->TS || JAVA->TS) 
     */
    
   
    /**展示插屏 */
    showInsertAd();
    hideInsertNativeAd();
    /**创建原生 */
    createNative(callback,nativeid) ;
    onNativeAdClick(_id: string);
    /**创建原生icon */
   
   
    /**适配不同渠道存储键值对localstorage
     * 默认使用 localStorage
     */
    saveDataToCache(_key: string, _value: any);
    /**适配不同渠道读取键值对localstorage
     * 默认使用 localStorage
     */
    readDataFromCache(_key: string);
    /**检测是否有桌面图标 */
    hasShortcutInstalled(_callback: Function);
    /**添加桌面图标 */
    addDesktop(_callback: Function);
    /**开始录制视频 */
    startRecordScreen();
    /**结束录制视频 */
    stopRecordScreen();
   
    /**展示更多游戏按钮 */
    showMoreGames();
    /**
     * 跳转游戏
     * @param _packageName 包名
     */
    jumpToGame(_packageName: string);

    /**埋点事件 */
    sendMessage(key: string, value: any);
}