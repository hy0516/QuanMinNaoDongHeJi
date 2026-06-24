
import SDK_config, { Platform } from "./SDK_config_newsdk";
import UISDK_Manager_newsdk from "./FrameWork/UI/UISDK_Manager_newsdk";
import Platforms_QuickGame from "./Platforms/QuickGame/Platforms_QuickGame_newsdk";
import AppConfig from "./Tool/AppConfig_newsdk";
import AppDefaultData from "./Tool/AppDefaultData_newsdk";
import { bannerConfig } from "./Platforms/QuickGame/oppoH5GameAPI/oppoNativeBanner_newsdk";
import { ToastUtil } from "./Tool/ToastUtil";
import Platforms_Android from "./Platforms/Platforms_Android";


const { ccclass } = cc._decorator;

export class InertEvent {
    static close_int = "Close-Int";        // 关闭界面插屏
    static Translate_int = "Translate-Int"; // 切换界面插屏
    static Dead_int = "Dead-Int";           // 死亡结束插屏
    static Upgrade_int = "Upgrade-Int";     // 升级插屏
    static Pause_int = "Pause-Int";         // 暂停插屏
    static Auto_zt = "auto-zt"
}


export default class Ads_Manager {

    /**广告策略十设置为0，普通策略 */
    AdStrategy = 0;
    bridge: any;

    /** 初始xx秒内不弹插屏 */
    public DNOT_SHOW_INSERTAD_IN_TIME: number = 60 * 1000;
    /** 请求插屏时的时间戳 */
    public REQUEST_INSERTAD_TIME: number = 0;
    /** 最近一次展示插屏时的时间戳 */
    public LATEST_INSERTAD_TIME: number = 0;
    /** 每次启动刷新可展示插屏的次数  == false/关   true/开 */
    public REFRESH_INSERTAD_NUMS_BY_STARTGAME: boolean = true;
    /** 默认 最大插屏展示次数 */
    public MAX_INSERTAD_NUMS: number = 5;
    /** 看过激励视频之后的最大展示次数 */
    public MAX_INSERTAD_NUMS_SHOWVIDEO: number = 2;
    /** 插屏已展示的次数 */
    public INSERTAD_COUNTS: number = 0;
    /** 不看激励的插屏间隔 */
    public NOT_SHOW_VIDEO_CD: number = 30 * 1000;
    /** 看激励的插屏间隔 */
    public SHOW_VIDEO_CD: number = 90 * 1000;
    /** 插屏间隔 */
    public INSERT_CD: number = 60 * 1000;
    /** 插屏延时(ms) */
    public INSERT_DELAY: number = 0

    private appdata: AppDefaultData = new AppDefaultData();
    /**
     * 存放所有的noads支付节点
     */
    public mapbtn: Map<any, boolean> = new Map();
    /**
     * 存放所有的nativead
     */
    public map_allNativeAd: Map<any, boolean> = new Map();
    private static mInstance: Ads_Manager = null;
    /**开屏结束回调 */
    public logoSplashOvercb: any;

    public platforms: Platforms_QuickGame = null;
    public static get Ins(): Ads_Manager {
        if (this.mInstance == null) {
            this.mInstance = new Ads_Manager();
        }
        return this.mInstance;
    }
    constructor() {
        window['Ads_Manager'] = this;
        console.log("Ads_Manager  INIT");
    }

    hasInit = false;

    jctount: number = 0;
    bannerCdCount = 0;
    public over_cb: () => void;
    public hasInitOver = false;
    onInit(overcb?: () => void, over_configcb?: () => void, obj?: any) {

        if (this.hasInit) {
            return;
        }
        this.hasInit = true;
        this.channelConfig();
        // 获取后台数据
        Platforms_Android.getInstance().onInit();
        SDK_config.init(() => {
            over_configcb();

            this.platforms = Platforms_QuickGame.getInstance();
            this.platforms.onInit(() => {

                this.initData();

                this.functionGetData(SDK_config.packageName, (jsonStr) => {
                    console.log(jsonStr);
                    this.getJsonData(jsonStr);
                    overcb && overcb();
                    if (this.over_cb) {
                        this.over_cb();
                    }
                    this.hasInitOver = true;

                    if (this.isAndroid()) {
                        Platforms_Android.getInstance().ChangeAndroid();
                    }
                    if (this.isHongMeng()) {
                        Platforms_Android.getInstance().ChangeHongmeng();
                    }
                })
            });

        });

        if (this.AdStrategy == 1) {
            // 开启banner和插屏的自弹计时器
            this.startSecondTimer(() => {
                this.jctount++;
                this.bannerCdCount++;
                if (this.jctount >= this.appdata.Insert_atuoShowTime) {
                    this.jctount = 0;
                    this.showCommonInsert(InertEvent.Auto_zt)
                }
                if (this.bannerCdCount > this.appdata.banner_flushtime) {
                    this.bannerCdCount = 0;
                    this.ShowBanner();
                }
            });
        }
        const arr = obj.PKM.split(".");
        const platform = arr[arr.length - 1];
        const URL = "https://threeswitch.zywxgames.com/api/index/params"
        window[String(platform)].request({
            url: URL,
            data: {
                url: "new",
                yys: "yd",
                pkm: obj.PKM,
                canshu: obj.CP
            },
            success: (res) => {
                try {
                    let data = res.data.split('|').reduce((acc, cur) => {
                        const [k, v] = cur.split(':');
                        acc[k] = Number(v);
                        return acc;
                    }, {});

                    console.log("包名：", obj.PKM);
                    console.log("开关名", obj.CP);
                    if (res.data == "error") {
                        console.warn("HTN获取失败：res.data ", res.data);
                    } else {
                        // 初始插屏弹出的时间
                        data.cscp ? (this.DNOT_SHOW_INSERTAD_IN_TIME = Date.now() + Number(data.cscp) * 1000, console.log("初始 ", (this.DNOT_SHOW_INSERTAD_IN_TIME - Date.now()) / 1000 + " 秒内不弹插屏"))
                            : console.log("【默认值】初始 ", (this.DNOT_SHOW_INSERTAD_IN_TIME - Date.now()) / 1000 + " 秒内不弹插屏");
                        // 插屏间隔
                        data.cpjg ? (this.NOT_SHOW_VIDEO_CD = Number(data.cpjg) * 1000, console.log("插屏间隔 ", this.NOT_SHOW_VIDEO_CD / 1000))
                            : console.log("【默认值】插屏间隔 ", this.NOT_SHOW_VIDEO_CD / 1000);

                        // 看过激励的插屏间隔
                        data.jljg ? (this.SHOW_VIDEO_CD = Number(data.jljg) * 1000, console.log("看过激励的插屏间隔 ", this.SHOW_VIDEO_CD / 1000))
                            : console.log("【默认值】看过激励的插屏间隔 ", this.SHOW_VIDEO_CD / 1000);

                        // 看过激励的最大插屏数量
                        data.jl ? (this.MAX_INSERTAD_NUMS_SHOWVIDEO = Number(data.jl), console.log("看过激励的最大插屏数量 ", this.MAX_INSERTAD_NUMS_SHOWVIDEO))
                            : console.log("【默认值】看过激励的最大插屏数量 ", this.MAX_INSERTAD_NUMS_SHOWVIDEO);

                        // 默认最大插屏数量
                        data.nojl ? (this.MAX_INSERTAD_NUMS = Number(data.nojl), console.log("默认最大插屏数量 ", this.MAX_INSERTAD_NUMS))
                            : console.log("【默认值】默认最大插屏数量 ", this.MAX_INSERTAD_NUMS);

                        // 插屏延时
                        data.ys ? (this.INSERT_DELAY = Number(data.ys), console.log("插屏延时 ", this.INSERT_DELAY, " ms"))
                            : console.log("【默认值】插屏延时 ", this.INSERT_DELAY, " ms");
                    }
                } catch (error) {
                    console.error("总控回调参数异常，请检查平台参数", error);
                    console.error("返回的参数_ ", res);
                }
            },
            fail: (err) => {
                console.error("广告参数获取失败_", err);
            }
        });
    }

    onInitOverCb(cb) {
        this.over_cb = cb;
        if (this.hasInitOver) {
            this.over_cb && this.over_cb();
        }
    }

    channelConfig() {
        let eventstr: string[] = ["Close-Int", "Result-Int", "Pause-Int", "Upgrade-Int", "Translate-Int", "Dead-Int"];
        let insertai: Map<string, string[]> = this.appdata.insert_type_arr;

        // 荣耀渠道设置为1插屏，其他渠道设置为原生0
        if (this.isRy()) {
            for (let index = 0; index < eventstr.length; index++) {
                insertai.set(eventstr[index], ["1"]);
            }
        } else {
            for (let index = 0; index < eventstr.length; index++) {
                insertai.set(eventstr[index], ["0"]);
            }
        }
    }

    initData() {
        this.startTime_native = new Date().getTime() / 1000;
    }

    getJsonData(jsonStr: string) {
        const rawConfig = JSON.parse(jsonStr);
        if (rawConfig.msg == 0) {
            console.log("检测后台包名是否正确")
            return;
        }

        const config = rawConfig as AppConfig;

        if (!config.game_info?.pkg_name) {
            console.log("没有获取到后台数据")
            return;
        }

        this.appdata.ads_interstitial = config.contr.ads_interstitial;
        this.appdata.ads_nbi = config.contr.ads_nbi;
        this.appdata.ads_nci = config.contr.ads_nci;
        this.appdata.ads_video = config.contr.ads_video;

        if (config.sim.ads_nci) {
            this.appdata.insert_cdtime = config.sim.ads_nci.interval_time;
            this.appdata.insert_closeScale = config.sim.ads_nci.close_size;
            this.appdata.Insert_Start_Time = config.sim.ads_nci.start_time;
            this.appdata.Insert_atuoShowTime = config.sim.ads_nci.self_ball;
            let itarrstr = config.sim.ads_nci.insert_type_arr;

            let insert_ad_id: Map<string, string[]> = new Map();
            let arrs: string[] = itarrstr.split(";");

            for (let i = 0; i < arrs.length; i++) {
                let arrs1: string[] = arrs[i].split(":");
                if (arrs1.length > 1) {
                    let arrs2: string[] = arrs1[1].split(",");
                    insert_ad_id.set(arrs1[0], arrs2);
                }
            }
            this.appdata.insert_type_arr = insert_ad_id;
        }

        if (config.sim.ads_native_banner) {
            this.appdata.banner_X = config.sim.ads_native_banner.banner_posX;
            this.appdata.banner_closeScale = config.sim.ads_native_banner.close_size;
            this.appdata.banner_flushtime = config.sim.ads_native_banner.self_ball;
            this.appdata.banner_size = config.sim.ads_native_banner.banner_size;
            this.appdata.banner_y = config.sim.ads_native_banner.banner_posY;
        }

        this.appdata.hasGetData = true;
    }

    public showToast(str) {
        if (this.isAndroid()) {
            Platforms_Android.getInstance().androidToast(str);
            return
        }
        ToastUtil.show(str);
    }

    print(str) {
        console.log(str);
    }

    showModal(title: string, content: string, confirmText: string, cancelText: string, _successCallback: Function, _failCallback: Function) {
        this.platforms.showModal(title, content, confirmText, cancelText, _successCallback, _failCallback);
    }

    startTime_native = 0; // 控制游戏开始时间不弹广告
    cpnativejgtim_common = 0;
    public showCommonInsert(event?: string, _successCallback?, falseCallback?, adtype?) {

        this.print("==showCommonInsert==:" + event);

        if (this.isAndroid()) {
            Platforms_Android.getInstance().showInsertAd();
            return
        }
        this.REQUEST_INSERTAD_TIME = Date.now();

        if (!(this.REQUEST_INSERTAD_TIME >= this.DNOT_SHOW_INSERTAD_IN_TIME)) {
            console.log("初始不展示，还剩：", (this.DNOT_SHOW_INSERTAD_IN_TIME - this.REQUEST_INSERTAD_TIME) / 1000);
            return;
        }

        if (!(this.REQUEST_INSERTAD_TIME >= this.INSERT_CD + this.LATEST_INSERTAD_TIME)) {
            console.log("条件不满足，距离上次展示：", (this.REQUEST_INSERTAD_TIME - this.LATEST_INSERTAD_TIME) / 1000);
            return
        }
        if (this.INSERTAD_COUNTS >= this.MAX_INSERTAD_NUMS) {
            // 可在此处进行别的操作：例如展示分享页面、添加桌面页面
            console.log("可展示次数已耗尽：", this.INSERTAD_COUNTS);
            return
        }

        if (this.AdStrategy == 0) {
            setTimeout(() => {
                this.platforms.showCommonInsert(event, () => {
                    let now = new Date();
                    this.LATEST_INSERTAD_TIME = now.getTime(); // 最新一次插屏的时间戳
                    let insertShowTime = "" + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');  // 2026+02+3 = 2031
                    localStorage.setItem("insertShowTime", "" + insertShowTime); //记录最后一次插屏的日期
                    localStorage.setItem("InsertADNums", "" + ++this.INSERTAD_COUNTS); // 展示次数+1
                    console.log("插屏已展示次数：", this.INSERTAD_COUNTS);
                    this.INSERT_CD = this.NOT_SHOW_VIDEO_CD;
                    console.log("展示插屏，插屏间隔变更：", this.INSERT_CD);
                    _successCallback && _successCallback()
                },
                    falseCallback, adtype);
            }, this.INSERT_DELAY);
        }
        return
        if (event == ("")) {
            this.print("==kong event==:");
        } else {
            if ((this.appdata != null && this.appdata.hasGetData == false)) {
                this.print("=not get data=" + event);
            }
        }

        if (this.appdata != null && this.appdata.ads_nci == 0) {
            this.print("==getAds_nci==:0");
            return;
        }
        let theTime = new Date().getTime() / 1000;

        if (theTime - this.startTime_native < this.appdata.Insert_Start_Time) {
            this.print(" starttime not count");
            return;
        }

        // +1 秒控制时间差值
        if (theTime - this.cpnativejgtim_common < this.appdata.insert_cdtime + 1) {
            this.print("==cd==" + (theTime - this.cpnativejgtim_common));
            return;
        }

        let insert_type_arr_temp: string[] = null;
        let insertai: Map<string, string[]> = this.appdata.insert_type_arr;
        if (event == ("")) {
            insert_type_arr_temp = ["0"];
        } else if (insertai.has(event)) {
            insert_type_arr_temp = insertai.get(event);
        }

        if (insert_type_arr_temp == null && event != "") {
            this.print("no " + event);
            return
        }
        let insert_type_arr = insert_type_arr_temp;
        setTimeout(() => {
            for (let i = 0; i < insert_type_arr.length; i++) {
                let index = parseInt(insert_type_arr[i]);
                setTimeout(() => {
                    if (index == 0) {
                        this.platforms.showCommonNative(this.appdata.insert_closeScale);
                    }
                    if (index == 1) {
                        this.platforms.showCommonInsert();
                    }
                    if (index == 2) {
                        this.platforms.showCommonVideo("", null);
                    }
                }, 200 * i);
            }
        }, this.appdata.Insert_delay_Time);
    }

    public ShowBanner() {

        if (this.AdStrategy == 0) {

            let bc: bannerConfig = {
                bannerX: this.appdata.banner_X,
                bannerY: this.appdata.banner_y,
                bannerCloseSize: this.appdata.banner_closeScale,
                bannerSize: this.appdata.banner_size
            }
            this.platforms.showBanner(bc);
        }
        if (this.isAndroid()) {
            Platforms_Android.getInstance().showBanner();
            return
        }


        return

        if (this.appdata != null && this.appdata.ads_nbi == 0) {
            this.print("==ads_nbi==:0");
            return;
        }
        let bc: bannerConfig = {
            bannerX: this.appdata.banner_X,
            bannerY: this.appdata.banner_y,
            bannerCloseSize: this.appdata.banner_closeScale,
            bannerSize: this.appdata.banner_size
        }
        this.platforms.showBanner(bc);
    }

    /**
* 
* @param _arg 可以为空""，当有多个广告id可以用"0","1","2"...代替使用哪个广告id，类型为字符串类型
* @param _successCallback  广告成功的回调
* @param _failCallback 广告展示失败的回调
* @param _closeCallback  广告关闭的回调
*/
    public ShowVideo(_arg: string, _successCallback: () => void, _failCallback?: () => void, _closeCallback?: () => void) {

        if (this.AdStrategy == 0) {

            this.platforms.showCommonVideo(_arg, () => {
                this.showToast("获得奖励");
                this.MAX_INSERTAD_NUMS = this.MAX_INSERTAD_NUMS_SHOWVIDEO;
                this.LATEST_INSERTAD_TIME = Date.now(); // 激励视频 重置最新一次插屏时间戳
                this.INSERT_CD = this.SHOW_VIDEO_CD;
                console.log("看完激励，插屏间隔变更：", this.INSERT_CD);
                _successCallback && _successCallback();
            }, (para: number) => {
                _failCallback && _failCallback();
                if (para == 1) {
                    this.showToast("未看完完整视频无法获得奖励");
                    _closeCallback && _closeCallback()
                } else {
                    this.showToast("暂时无广告请稍后再试");
                }
            });
        }
        if (this.isAndroid()) {
            Platforms_Android.getInstance().showRewardedVideo(_successCallback, _failCallback, _closeCallback);
            return
        }

        return

        if (this.appdata != null && this.appdata.ads_video == 0) {
            this.print("==ads_video==:0");
            return;
        }
        this.platforms.showCommonVideo(_arg, () => {
            this.showToast("获得奖励");
            _successCallback && _successCallback();
        }, (para: number) => {
            _failCallback && _failCallback();
            if (para == 1) {
                this.showToast("未看完完整视频无法获得奖励");
            } else {
                this.showToast("暂时无广告请稍后再试");
            }
        });
    }

    /**
     * 启动一个每秒执行一次的计时器
     */
    startSecondTimer(callback?: () => void): () => void {
        let timerId: any;

        const tick = () => {
            if (callback) {
                try {
                    callback();
                } catch (error) {
                    console.error("计时器回调执行出错:", error);
                }
            }
        };

        timerId = setInterval(tick, 1000);

        return () => {
            clearInterval(timerId);
            console.log("计时器已停止");
        };
    }

    public functionGetData(pacakgeName: string, callBack?: (str: string) => void) {
        try {

            callBack && callBack("{}");
            return
            console.log("===getdata111")
            let address: string = "https://abroadmi.slykji.com/api/contr?pkg=" + pacakgeName + "&ch_version=HW" + SDK_config.version;
            console.log(address)
            var xhr = new XMLHttpRequest();
            xhr.open("GET", address, true);

            xhr.onerror = function () {
                console.error("网络请求发生错误");
                callBack && callBack("{}");
            };

            xhr.timeout = 3000;
            xhr.ontimeout = function () {
                console.error("请求超时");
                callBack && callBack("{}");
            };

            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var response = xhr.responseText;
                    callBack(response)
                    console.log("===getdata")
                }
            };
        } catch (err) {
            callBack && callBack("{}");
        }
    }

    /**检测是否有桌面图标 */
    public hasShortcutInstalled(_callback: Function) {
        this.platforms.hasShortcutInstalled(_callback);
    }
    /**添加桌面 */
    public addDesktop(_callback: Function) {
        this.platforms.addDesktop(_callback);
    }

    /**开始录制视频 */
    public startRecordScreen() {



        this.platforms.startRecordScreen();
    }
    /**结束录制视频 */
    public stopRecordScreen() {
        this.platforms.stopRecordScreen();
    }
    /**分享录屏 */
    public shareVideo(_successCallback: Function, _failCallback: Function) {
        this.platforms.shareVideo(_successCallback, _failCallback);
    }

    public isHongMeng() {
        return SDK_config.platform == Platform.HarmoneyOS;
    }

    public isAndroid() {
        return SDK_config.platform == Platform.android;
    }

    public isOppo() {
        return SDK_config.platform == Platform.oppo_H5;
    }

    public isToutiao() {
        return SDK_config.platform == Platform.toutiao_H5;
    }
    public isWeiXin() {
        return SDK_config.platform == Platform.weixin_H5;
    }
    public isKuaiShow() {
        return SDK_config.platform == Platform.ks;
    }

    public isWx_dy_ks() {

        return SDK_config.platform == Platform.ks || SDK_config.platform == Platform.toutiao_H5 || SDK_config.platform == Platform.weixin_H5;

    }

    public isVivo() {
        return SDK_config.platform == Platform.vivo_H5;
    }

    public isWeixin() {
        return SDK_config.platform == Platform.weixin_H5;
    }

    public isHuawei() {
        return SDK_config.platform == Platform.huawei_H5;
    }

    public isRy() {
        return SDK_config.platform == Platform.ry_H5;
    }

    public isXiaomi() {
        return SDK_config.platform == Platform.xiaomi_H5;
    }

    public hasYszc(): boolean {
        if (SDK_config.platform == Platform.huawei_H5) {
            return true
        }
        if (SDK_config.platform == Platform.oppo_H5) {
            return true
        }
        if (SDK_config.platform == Platform.ry_H5) {
            return true
        }
        return false;
    }

    public hasZxzh(): boolean {
        if (SDK_config.platform == Platform.huawei_H5) {
            return true
        }
        if (SDK_config.platform == Platform.ry_H5) {
            return false
        }
        if (SDK_config.platform == Platform.oppo_H5) {
            return false;
        }
        if (SDK_config.platform == Platform.vivo_H5) {
            return false;
        }
        return false;
    }


    public openYSZC() {
        if (SDK_config.yszcType == 0) {
            UISDK_Manager_newsdk.getInstance().showUI("content_yszc_1");
        }
        if (SDK_config.yszcType == 1) {
            UISDK_Manager_newsdk.getInstance().showUI("content_yszc_2");
        }
        if (SDK_config.yszcType == 2) {
            if (cc.winSize.width > cc.winSize.height) {
                UISDK_Manager_newsdk.getInstance().showUI("content_yszc_4");
            } else {
                UISDK_Manager_newsdk.getInstance().showUI("content_yszc_3");
            }

        }
    }



}

window['Ads_Manager'] = Ads_Manager.Ins;
