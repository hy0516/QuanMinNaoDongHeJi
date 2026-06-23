// 平台枚举
enum LPPlatform {
    toutiao = "tt",
    wechat = "wx",
    ks = "ks",
    zfb = "my",
    bl = "bl",
    other = "other"
}

/** 平台广告相关参数 */
const AdsOptions = {
    _PKG_str: "com.phjsc.ks", // 包名
    _CP: "KS1", // 开关号
    target_time: "2026-02-06T21:00:00", // 快手插屏屏蔽时间终点
    // 快手
    ks: {
        ks_app_id: "ks673006670327722213",
        videoId: "2300045947_01",
        insertId: "2300045947_02",
        bannerId: "2300028872_04",
        multiton: false, // 是否开启再得广告模式（只支持安卓系统的快手和快手极速版）
        /**
         * 再得广告的奖励文案，玩家每看完一个广告会展示，
         * 如【再看1个获得xx】；xx就multitonRewardMsg中的文案，
         * 按顺序依次展示，单个文案最大长度为 7 ；
         * multiton为true时必填 
         * */
        multitonRewardMsg: [""],
        /**
         * 额外观看广告的次数，目前快手激励视频只支持再看一次，
         * multiton为true时必填 
         * */
        multitonRewardTimes: 0,
    },
    // 微信
    wx: {
        wx_app_id: "wx7155832592a62c47",
        videoId: "adunit-xxxx",
        insertId: "adunit-xxxx",
        /** 微信原生模板广告ID，官方已整合banner广告、格子广告.. */
        customAdsIds: {
            bannerId: "adunit-xxxx",
            customId1: "adunit-xxxx",
            customId2: "adunit-xxxx",
            customId3: "adunit-xxxx"
        },
        // 订阅id
        subscriptionIds: [
            ""
        ]
    },
    // 支付宝
    my: {
        my_app_id: "",
        videoId: "",
        bannerId: ""
    },
    // 头条
    tt: {
        tt_app_id: "",
        videoId: "",
        insertId: "",
        bannerId: "",
        multiton: false,
        /** 
            再得广告的奖励文案，玩家每看完一个广告都会展示，如【再看1个获得xx】
            xx 即 multitonRewardMsg 中的文案，按顺序依次展示，单个文案最大长度为 7
            multiton 为 true 时必填
        */
        multitonRewardMsg: [""],
        /**
            是否开启进度提醒，开启时广告文案为【再看N个获得xx】，关闭时为【 再看1个获得xx】。
            N 表示玩家当前还需额外观看广告的次数。
         */
        progressTip: false,
        // 订阅id
        subscriptionIds: [
            ""
        ],
        share: ""
    },
    // 哔哩哔哩
    bl: {
        bl_app_id: "biligame99373b592094a547",
        video_id: ""
    },
    platform: LPPlatform.other,
    serverTime: "", //服务器时间 2026-05-19 20:04:38

}

export default class Apis {
    private DataKey: string = "sdk_data";

    // region 广告策略
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

    /** 用户系统基础参数 */
    public systemInfo: any = null;
    /** 冷启动参数 */
    public coldLaunchOptions: any = null;
    /** onShow触发时执行的执行回调 */
    private onShowCallback: any = null;

    private constructor() {
    }

    private static instance: Apis | null = null
    public static getInstance(): Apis {
        if (!this.instance) {
            this.instance = new Apis();
        }
        return this.instance;
    }

    onInit() {
        this.getData();
        this.getServerTime();
        this.saveData();
        this.HTN();
        this.TimeCtrl();
        this.getStartOptions();
        this.getSystemInfo();
    }
    //region 获取启动参数
    /**
     * 获取冷、热启动参数
     */
    private getStartOptions() {
        if (AdsOptions.platform === LPPlatform.other) return;
        this.coldLaunchOptions = window[AdsOptions.platform].getLaunchOptionsSync();
        // 监听onShow热启动
        window[AdsOptions.platform].onShow((res) => {
            this.onShowCallback && this.onShowCallback(res);
        });
    }
    //region 获取系统基础参数
    /** 获取系统参数 */
    private getSystemInfo() {
        if (AdsOptions.platform === LPPlatform.other) return;
        window[AdsOptions.platform].getSystemInfo((res) => {
            console.log("设备信息", this.systemInfo);
            this.systemInfo = res;
        });
    }
    // 设置onShow回调
    setOnShowCallback(call) {
        this.onShowCallback = call;
    }

    /** SDK存储的数据 */
    private sdkData: {
        SideBarRewardTimes: number;
        SideBarRewardDate: string;
        DeskTopRewardTimes: number;
        DeskTopRewardDate: string;
        [key: string]: any;
    } = {
            SideBarRewardTimes: 0,
            SideBarRewardDate: "",
            DeskTopRewardTimes: 0,
            DeskTopRewardDate: ""
        }
    /** 记录桌面奖励领取次数 */
    public set DeskTopRewardTimes(value: number) {
        this.sdkData["DeskTopRewardTimes"] += value;
        this.saveData();
    }
    /** 记录桌面奖励领取日期 */
    public setDeskTopRewardDate() {
        this.sdkData["DeskTopRewardDate"] = AdsOptions.serverTime;
        this.saveData();
    }
    /** 记录Sidebar奖励领取次数 */
    public set SideBarRewardTimes(value: number) {
        this.sdkData["SideBarRewardTimes"] += value;
        this.saveData();
    }
    /** 记录Sidebar奖励领取时间 */
    public setSideBarRewardDate() {
        this.sdkData["SideBarRewardDate"] = AdsOptions.serverTime;
        this.saveData();
    }
    /** 保存SDK数据 */
    public setSdkData(key: string, value: any) {
        this.sdkData[key] = value;
        this.saveData();
    }
    /** 获取SDK数据 */
    public getSdkData(key: string) {
        return this.sdkData[key] || null
    }

    //region 每日刷新数据
    refreshData() {
        const DeskTopTime = new Date(this.sdkData.DeskTopRewardDate).toDateString();
        const SideBarTime = new Date(this.sdkData.SideBarRewardDate).toDateString()
        const now = new Date(AdsOptions.serverTime).toDateString();
        if (DeskTopTime != now) {
            this.DeskTopRewardTimes = 0;
        }
        if (SideBarTime != now) {
            this.SideBarRewardTimes = 0;
        }
    }
    //region 获取服务器时间
    getServerTime() {
        this.request("https://quan.suning.com/getSysTime.do", {}, "GET", (res) => {
            if (!res || !res.data || !res.data.sysTime2) {
                return;
            }
            AdsOptions.serverTime = res.data.sysTime2.replace(" ", "T") || "";
            console.log("获取到的服务器时间", AdsOptions.serverTime);
            this.saveData();
        }, (err) => {
            console.error("请求失败_", err);
        }, 2, 5)
    }
    //region 保存数据
    saveData() {
        const data = JSON.stringify(this.sdkData);
        localStorage.setItem(this.DataKey, data);
    }
    //region 获取sdk缓存的数据
    private getData() {
        const dataStr = localStorage.getItem(this.DataKey) || "{}";
        if (dataStr && dataStr !== "") {
            const data = JSON.parse(dataStr);
            this.sdkData = data
            console.log("sdk历史数据已读取__", data);
            this.refreshData();
        }
    }

    /** 初始化插屏参数 */
    private TimeCtrl() {
        let now = new Date(AdsOptions.serverTime);
        let insertShowTime = Number("" + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0')); // 2026+02+3 = 20260203
        const InsertAdNums = localStorage.getItem("InsertADNums");
        if (InsertAdNums != null && InsertAdNums != undefined) {
            if (localStorage.getItem("insertShowTime") != null && localStorage.getItem("insertShowTime") != undefined) {
                let last_insertShowTime = Number(localStorage.getItem("insertShowTime"));
                if (insertShowTime > last_insertShowTime) { // 和最后一次插屏不在同一天
                    console.log("最后一次插屏不在同一天");

                    this.INSERTAD_COUNTS = 0; // 重置插屏次数为最大
                } else {

                    this.INSERTAD_COUNTS = Number(InsertAdNums);// 读取插屏次数
                    console.log("读取插屏次数", this.INSERTAD_COUNTS);
                }
            } else {
                console.log("插屏最新展示时间初始化：", insertShowTime);
            }
        } else {
            console.log("插屏次数初始化：", this.INSERTAD_COUNTS);

        }

        if (this.REFRESH_INSERTAD_NUMS_BY_STARTGAME) {
            this.INSERTAD_COUNTS = 0;
            console.log("最大插屏次数已刷新 ", this.INSERTAD_COUNTS);
        }
        this.DNOT_SHOW_INSERTAD_IN_TIME += Date.now(); //初始化不弹插屏
    }

    //region HTN
    private HTN() {
        const PKM = AdsOptions._PKG_str;
        const CP = AdsOptions._CP;
        const threeSwitchUrl = "https://threeswitch.zywxgames.com/api";
        if (!PKM.startsWith("com.")) {
            console.log("包名还没填");
            return;
        }
        if (CP == "") {
            console.log("CP没填");
            return;
        }
        let URL = threeSwitchUrl + "/index/params";
        this.getInsertOptions(URL, PKM, CP);
    }
    //region 获取插屏参数
    private getInsertOptions(url: string, pkm: string, cp: string) {
        const option = {
            url: "new",
            yys: "yd",
            pkm: pkm,
            canshu: cp
        }
        this.request(url, option, "POST", (res) => {
            try {
                let data = res.data.split('|').reduce((acc, cur) => {
                    const [k, v] = cur.split(':');
                    acc[k] = Number(v);
                    return acc;
                }, {});

                console.log("包名：", AdsOptions._PKG_str);
                console.log("开关名", AdsOptions._CP);
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
        }, (err) => {
            console.error("网络请求失败", err);
        }, 3, 3);
    }

    //region 比较版本号
    /**
     * 版本号比较  小于目标版本号就返回 -1，大于目标版本号就返回 1，与目标版本号相等就返回 0
     * @param v1 当前版本号
     * @param v2 目标版本号
     * @returns 
     */
    compareVersion(v1: string, v2: string): number {
        const v1s = v1.split('.').map(Number);
        const v2s = v2.split('.').map(Number);
        const len = Math.max(v1s.length, v2s.length);

        for (let i = 0; i < len; i++) {
            const num1 = v1s[i] || 0;
            const num2 = v2s[i] || 0;
            if (num1 > num2) return 1; // 高于目标版本号
            if (num1 < num2) return -1; // 低于目标版本号
        }
        return 0;  // 等于目标版本号
    }

    //region runAfter
    /**
     * 判断是否在目标时间之后
     * @param target 目标时间 date
     * @returns 
     */
    public runAfter(target: string) {
        const targetTime = new Date(target);
        const now = new Date(AdsOptions.serverTime);
        if (now < targetTime) {
            // 时间未到，直接返回
            return true;
        }
        return false;
    }

    //region 网络请求
    /**
     * 
     * @param url 链接
     * @param options 参数 
     * @param method 请求方式
     * @param succCallback 成功回调
     * @param failCallback 失败回调
     * @param retryCD 重试CD (秒)
     * @param retryTimes 重试次数
     * @returns 
     */
    public request(
        url: string,
        options: object,
        method: string = "POST",
        succCallback?: Function,
        failCallback?: Function,
        retryCD: number = 5,
        retryTimes: number = 3
    ) {
        const self = this;
        if (AdsOptions.platform === "other") {
            console.warn("非小游戏平台，request不可用");
            return;
        }
        window[AdsOptions.platform] && window[AdsOptions.platform].request({
            url: url,
            data: options,
            header: {
                "content-type": "application/json",
            },
            method: method,
            success(res) {
                succCallback && succCallback(res);
            },
            fail(err) {
                console.error("【" + url + "】请求失败，尝试重新请求，CD " + retryCD + " s,times " + retryTimes);
                failCallback && failCallback(err);
                if (retryTimes-- > 0) {
                    setTimeout(() => {
                        self.request(url, options, method, succCallback, failCallback, retryCD, retryTimes);
                    }, 1000 * retryCD);
                }
            },
        })
    }

    //region 平台提示api
    public showTips(
        msg: string,
        duration: number = 2000,
        type: string = "success",
        mask: boolean = false,
        success?: Function,
        fail?: Function,
        complete?: Function,
        imgUrl?: string
    ) {
        let ToastBody = {
            duration: duration,
            icon: type,
            success: success,
            fail: fail,
            complete: complete
        }
        switch (AdsOptions.platform) {
            case LPPlatform.toutiao:
                ToastBody = { ...ToastBody, ...{ title: msg } };
                window[AdsOptions.platform].showTips(ToastBody);
                break;
            case LPPlatform.zfb:
                ToastBody = { ...ToastBody, ...{ content: msg, mask: mask, image: imgUrl } };
                window[AdsOptions.platform] && window[AdsOptions.platform].showToast(ToastBody);
            case LPPlatform.ks:
            case LPPlatform.bl:
            case LPPlatform.wechat:
                ToastBody = { ...ToastBody, ...{ title: msg, mask: mask, image: imgUrl } };
                window[AdsOptions.platform] && window[AdsOptions.platform].showToast(ToastBody);
                break;
            default:
                console.warn("非小游戏环境无法使用弹窗提示【", msg, "】");
                break;
        }
    }
}

export { AdsOptions, LPPlatform };