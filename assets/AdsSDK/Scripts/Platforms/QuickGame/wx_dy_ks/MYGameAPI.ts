// 官方文档 https://opendocs.alipay.com/mini-game/08v6wc
/** 支付宝小游戏渠道API */
import { AdsOptions } from "./PlatformOptions";

const get_open_id_url = "https://zfbmingame.zywxgames.com/api/zfb/getOpenId";
const report_id_url = "https://zfbmingame.zywxgames.com/api/zfb/reportBehavior";

export default class MYGameAPI {
    // 支付宝深度任务原子码
    zfb_tasks = {
        task_1: "msxb_game_denghuo_task_1"
    }

    public static scene_id = ""
    private report_num_succ = 1; // 每次启动限制一次上报次数

    private open_id = "";
    channel = "";

    private report_num = 5;// 上报重试次数
    private report_cd = 1; // 1秒

    /**平台环境 */
    my: any = window["my"];

    /**banner广告 */
    bannercustomAd: any = null;
    /**视频广告 */
    rewardedVideoAd: any = null;

    /**设备像素width */
    windowWidth: number = 0;
    /**设备像素height */
    windowHeight: number = 0;
    /**系统信息 */
    systemInfo: any = null;

    //#region instance
    private static m_inst: MYGameAPI | null = null;


    private currentSuccessCallback: Function | undefined = undefined;
    private currentFailCallback: Function | undefined = undefined;

    public static getInstance(): MYGameAPI {
        if (MYGameAPI.m_inst == null) {
            MYGameAPI.m_inst = new MYGameAPI();
        }
        return MYGameAPI.m_inst;
    }

    private constructor() {
        this.onInit(() => { });
    }

    /**初始化 */
    onInit(_callback: Function) {
        if (this.my != null && this.my != undefined) {
            {
                const launchOption = this.my.getEnterOptionsSync();
                const res = this.my.getSystemInfo();
                const query = launchOption.query;
                if (query.clickid != undefined && query.clickid != null) {
                    localStorage.setItem("my_click_id", query.clickid);
                    console.log("Query_clickid:" + query.clickid);
                    localStorage.setItem("my_projectid", query.projectid);
                    console.log("Query_projectid:" + query.projectid);
                    localStorage.setItem("my_promotionid", query.promotionid);
                    console.log("Query_promotionid:" + query.promotionid);
                    localStorage.setItem("my_requestid", query.requestid);
                    console.log("Query_requestid:" + query.requestid);
                }
                if (res) {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                    this.systemInfo = res;
                    window['windowHeight'] = res.windowHeight;
                    window['windowWidth'] = res.windowWidth;//+1
                    console.log("windowWidth===", this.windowWidth);
                    console.log("windowHeight===", this.windowHeight);
                }
            }

            try {
                const options = this.my.getLaunchOptionsSync();
                this.channel = options.query.channel || 'other';
                MYGameAPI.scene_id = options.scene;
            } catch (e) {
                this.channel = 'other';
            }

        }
        _callback && _callback();
        console.log("myH5============================>:onInit");
    }

    // region createVideo
    createVideo() {
        if (this.my != null && this.my != undefined) {
            if (this.rewardedVideoAd) {
                this.rewardedVideoAd.destroy();
                this.rewardedVideoAd = null;
            }
            this.rewardedVideoAd = this.my.createRewardedAd({
                adUnitId: AdsOptions.my.videoId
            });
            this.rewardedVideoAd.load().then(() => {
                console.log("激励视频加载成功");
            }).catch((err) => {
                console.log("激励视频加载失败：", err);
            });
        }
    }

    /**
     * 
     * @param _type 类型
     * @param _arg 参数
     * @param _successCallback 成功回调
     * @param _failCallback 失败回调
     */
    /**展示激励视频 */
    showVideo(_successCallback?: Function, _failCallback?: Function) {
        if (!(this.my != null && this.my != undefined)) {
            console.log('非小游戏平台，直接获得奖励');
            _successCallback && _successCallback();
            return;
        }

        if (!this.rewardedVideoAd) {
            console.log("广告未准备好，不注册监听器——ZFB");
            this.createVideo();
            _failCallback && _failCallback();
            return;
        }

        this.rewardedVideoAd.offClose(this.onVideoClose);
        this.currentSuccessCallback = _successCallback;
        this.currentFailCallback = _failCallback;
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.show().then(() => {
                console.log("激励视频展示成功");
            }).catch((err) => {
                console.error("激励视频展示失败：", err);
                // 可以手动加载一次
                _failCallback && _failCallback();
            });
            this.rewardedVideoAd.onClose(this.onVideoClose);
        } else {
            console.log("初始化失败重新创建加载");
            this.createVideo();
            console.log("广告还未准备好,请稍后再试");
            _failCallback && _failCallback();
        }
    }

    private onVideoClose = (res) => {
        // 先移除监听器，防止重复触发
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.offClose(this.onVideoClose);
        }

        const isEnded = res && res.isEnded;

        if (isEnded) {
            console.log("视频播放完成，发放奖励");
            this.currentSuccessCallback && this.currentSuccessCallback();
        } else {
            console.log("视频未看完，不发奖励");
            this.currentFailCallback && this.currentFailCallback();
        }
        this.currentSuccessCallback = undefined;
        this.currentFailCallback = undefined;
        this.createVideo();
    };

    vibrate(long?: boolean) {
        if (this.my != null && this.my != undefined) {
            if (long) {
                this.my.vibrateLong({
                    success(res) {

                    },
                    fail(res) {
                        console.log(`vibrateLong调用失败`);
                    },
                });
            }
            else {
                this.my.vibrateShort({
                    success(res) {

                    },
                    fail(res) {
                        console.log(`vibrateShort调用失败`);
                    },
                });
            }
        }
    }


    // }

    // region bannershowCustomAd
    bannershowCustomAd() {

        if (this.my == null || this.my == undefined) return;

        if (this.bannercustomAd != null) {
            this.bannercustomAd.destroy();
        }
        const systemInfo = this.my.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        const windowWidth = systemInfo.windowWidth;
        const AdWidth = 375;



        this.bannercustomAd = this.my.createBannerAd({
            adUnitId: AdsOptions.my.bannerId,
            style: {
                top: 10,
                left: (windowWidth - AdWidth) / 2,
                width: AdWidth, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
            }
        })

        this.bannercustomAd.onLoad(() => {
            console.log('banner 广告加载成功')
        })

        this.bannercustomAd.show()
            .then(() => console.log('banner 广告显示'))
        this.bannercustomAd.onError(err => {
            console.log("广告拉取失败_", err)
        })
    }

    bannnerhideCustomAd() {
        if (this.my == null || this.my == undefined) return;
        if (this.bannercustomAd != null) {
            this.bannercustomAd.destroy();
            this.bannercustomAd = null;
        }
    }


    // region 支付宝任务深度激励：
    getAuthCode(callback?: Function) {
        console.log("进入getAuthCode");
        const openid = localStorage.getItem("zfb_open_id");
        if (!(openid == undefined || openid == null || openid == "")) {
            callback && callback(openid);
            return;
        }
        // 获取open_id
        this.my.getAuthCode({
            scopes: 'auth_base',
            success: (res) => {
                const authCode = res.authCode;
                // 在服务端获取用户信息
                this.my.request({
                    // 你的服务器地址
                    url: get_open_id_url,
                    method: "POST",
                    data: {
                        "app_id": AdsOptions.my.my_app_id,
                        "auth_code": authCode,
                    },
                    success: (res) => {
                        if (res.data.code == 1 && res.data.data.open_id != undefined && res.data.data.open_id != null) {
                            this.open_id = res.data.data.open_id;
                            localStorage.setItem("zfb_open_id", this.open_id);
                            callback && callback(this.open_id);
                        } else if (res.data.code == 0) {
                            console.error("用户open_id获取失败_", res.data.msg)
                        }
                    }
                })
            },
            fail: err => {
                console.error('my.getAuthCode 调用失败', err)
            }
        });
    }

    zfbTaskCompleteReport() {
        if (this.my == null || this.my == undefined)
            return;
        // 上报次数限制
        if (this.report_num_succ <= 0) {
            return;
        }
        // 上报
        this.getAuthCode((open_id) => {
            try {
                this.my.request({
                    // 你的服务器地址
                    url: report_id_url,
                    method: "POST",
                    data: {
                        "app_id": AdsOptions.my.my_app_id,
                        "open_id": open_id, // 用户唯一标识
                        "action_code": this.zfb_tasks.task_1,  // 任务原子码
                        "action_finish_date": this.getCompleteDateTime(), // 完成时间
                        "action_finish_channel": this.channel // 启动参数channel
                    },
                    success: (res) => {
                        console.log("上报回调res=", res);
                        console.log("MYGameAPI.channel", this.channel);

                        if (res.data.code == 1) {
                            this.report_num_succ--; // 成功上报次数消耗
                        } else {
                            //上报失败，重新上报
                            if (this.report_num-- <= 0) {
                                console.log("上报次数已耗尽");
                                return;
                            }
                            setTimeout(() => {
                                // 上报失败时清空openid缓存，重新从服务器拉取
                                localStorage.removeItem("zfb_open_id");
                                console.warn("深度任务结算上报失败，还剩" + this.report_num + "次上重新上报机会");
                                this.zfbTaskCompleteReport();
                            }, this.report_cd * 1000);
                        }
                    },
                    fail: (error) => {
                        console.error("上报失败", error);
                    }
                })
            } catch (error) {
                console.error("上报报错：", error);
            }
        });
    }

    getCompleteDateTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
