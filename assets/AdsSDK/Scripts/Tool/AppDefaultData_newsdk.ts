
export default class AppDefaultData {
    private _hasGetData = false;
    public get hasGetData() {
        return this._hasGetData;
    }
    public set hasGetData(value) {
        this._hasGetData = value;
    }
    /**--------------------开关------------- */
    /**系统插屏开关 */
    private _ads_interstitial = 1;

    /**原生插屏开关 */
    private _ads_nci = 1;


    /**原生banner开关 */
    private _ads_nbi = 1;

    /**原生激励视频开关 */
    private _ads_video = 1;
    /**--------------------banner------------- */
    /**banner刷新时间,小游戏默认不子弹banner */
    private _banner_flushtime = 9999999;


    /**banner的纵向位置，0是顶部，1是底部 */
    private _banner_y = 1;

    /**banner的横向位置 */
    private _banner_X = 0;

    /**banner大小是 */
    private _banner_size = 100;

    /**banner关闭区域的大小，真实百分比缩放 */
    private _banner_closeScale = 100;

    /**-------------原生-------插屏-------------- */
    /**插屏自弹时间，默认不自弹999999 */
    private _Insert_atuoShowTime = 99999999;
    /**原生插屏关闭区域的大小，真实百分比缩放 */
    private _insert_closeScale = 100;
    /**原生插屏弹出间隔时间，间隔时间内不会弹出插屏 */
    private _insert_cdtime = 2;

    /**插屏开始时间，游戏开始多少秒内不会弹出插屏 */
    private _Insert_Start_Time = 0;

    /**延时多少秒弹出 */
    private _Insert_delay_Time = 0;

    /**插屏广告类型组 */
    private _insert_type_arr: Map<string, string[]> = new Map();
    public get insert_type_arr(): Map<string, string[]> {
        return this._insert_type_arr;
    }
    public set insert_type_arr(value: Map<string, string[]>) {
        this._insert_type_arr = value;
    }
    public get Insert_delay_Time() {
        return this._Insert_delay_Time;
    }
    public set Insert_delay_Time(value) {
        this._Insert_delay_Time = value;
    }

    public get Insert_Start_Time() {
        return this._Insert_Start_Time;
    }
    public set Insert_Start_Time(value) {
        this._Insert_Start_Time = value;
    }

    public get banner_closeScale() {
        return this._banner_closeScale;
    }
    public set banner_closeScale(value) {
        this._banner_closeScale = value;
    }
    public get banner_size() {
        return this._banner_size;
    }
    public set banner_size(value) {
        this._banner_size = value;
    }
    public get insert_closeScale() {
        return this._insert_closeScale;
    }
    public set insert_closeScale(value) {
        this._insert_closeScale = value;
    }

    public get insert_cdtime() {
        return this._insert_cdtime;
    }
    public set insert_cdtime(value) {
        this._insert_cdtime = value;
    }


    public get banner_X() {
        return this._banner_X;
    }
    public set banner_X(value) {
        this._banner_X = value;
    }

    public get banner_y() {
        return this._banner_y;
    }
    public set banner_y(value) {
        this._banner_y = value;
    }

    public get Insert_atuoShowTime() {
        return this._Insert_atuoShowTime;
    }
    public set Insert_atuoShowTime(value) {
        this._Insert_atuoShowTime = value;
    }

    public get banner_flushtime() {
        return this._banner_flushtime;
    }
    public set banner_flushtime(value) {
        this._banner_flushtime = value;
    }
    public get ads_interstitial() {
        return this._ads_interstitial;
    }
    public set ads_interstitial(value) {
        this._ads_interstitial = value;
    }
    public get ads_video() {
        return this._ads_video;
    }
    public set ads_video(value) {
        this._ads_video = value;
    }
    public get ads_nbi() {
        return this._ads_nbi;
    }
    public set ads_nbi(value) {
        this._ads_nbi = value;
    }
    public get ads_nci() {
        return this._ads_nci;
    }
    public set ads_nci(value) {
        this._ads_nci = value;
    }
}
