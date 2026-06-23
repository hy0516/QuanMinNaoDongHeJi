import SDK_config from "../../../SDK_config_newsdk";

//关键行为激活接口
const url_buy_active = "https://kstfdata.zywxgames.com/api/ks/buyUserActive";
//视频行为接口
const url_http_video = "https://kstfdata.zywxgames.com/api/ks/ksVideo";
//事件接口
const url_event_active = "https://kstfdata.zywxgames.com/api/ks/buryUserActive";
//查询游戏设置是否存在
const is_exist_url = "https://kstfdata.zywxgames.com/api/ks/index";
//事件上报
const event_info_url = "https://kstfdata.zywxgames.com/api/ks/eventInfo";
//只有关键行为的情况
const url_addiction_active = "https://kstfdata.zywxgames.com/api/ks/gameAddictionActive";



/**
 *------------------注意-----------------
 *前置条件 
 *   let query=ks.getLaunchOptionsSync().query;
 *1. 保存query.callback 到缓存 ks_callback 保存query.campaign_id 到缓存 ks_campaign_id  保存query.unit_id 到缓存 ks_unit_id
 *   保存query.account_id 到缓存 ks_account_id
 *2. 获取ks.login 
 *   获取code 保存到 ks_code
 * 如果只是埋点可以不用写第一步
 */
export default class KsHttpUpBehavior {
    private static mInstance: KsHttpUpBehavior | null = null;
    public static getInstance(): KsHttpUpBehavior {
        if (this.mInstance === null) {
            this.mInstance = new KsHttpUpBehavior();
        }
        return this.mInstance;
    }
    //快手只能用 快手自己封装的
    public ks = window["ks"];
    //是否存在广告点击Id
    public static ks_callback = '';
    public static ks_open_id = '';
    public static ks_is_exist = 0;
    /**serrectKey用于区别本地储存用户行为数据 */
    private static serrectKey: string = "buydatalst";
    //用户行为信息
    public static buyLstData = {
        //视频数量
        video_num: 0,
    };
    private constructor() {
    }
    /**
     * 初始化快手API
     * @param cb 
     */
    public onInit(cb?: Function) {
        if (!SDK_config.openMaiLiang) {
            cb && cb();
            return;
        }
        console.log("快手埋点初始化:111");
        let is_exist: number = Number(localStorage.getItem("ks_is_exist"));
        switch (is_exist) {
            case 1:
                this.index();
                KsHttpUpBehavior.ks_is_exist = 1;
                cb && cb();
                break;
            case 2:
                this.index();
                KsHttpUpBehavior.ks_is_exist = 2;
                cb && cb();
                break;
            default:
                this.ksIsExist(cb);
                break;
        }
    }
    /**
     * 查询是否设置游戏上报
     * @param cb 
     */
    private ksIsExist(cb?: Function) {
        if (!SDK_config.openMaiLiang) {
            cb && cb();
            return;
        }
        let self = this;
        console.log("开始进入埋点判断:");
        this.functionPost(is_exist_url, { app_id: SDK_config.GameIdConfig.kuaishouID.appId }, (data) => {
            if (data.code == 1) {
                localStorage.setItem("ks_is_exist", "1");
                KsHttpUpBehavior.ks_is_exist = 1;
            } else {
                KsHttpUpBehavior.ks_is_exist = 2;
                localStorage.setItem("ks_is_exist", "2");
            }
            self.index(cb);
        });
        setTimeout(() => {
            if (!localStorage.getItem("ks_is_exist")) {
                self.index(cb);
            }
        }, 3000);
    }
    /**存储本地数据单独存,用存储到先前的数据里面*/
    public static storage() {
        localStorage.setItem(this.serrectKey, JSON.stringify(this.buyLstData));
    }
    /**
     * 初始化第二步
     * @param cb 
     */
    public index(cb?: Function) {
        if (!SDK_config.openMaiLiang) {
            cb && cb();
            return;
        }
        let self = this;
        if (localStorage.getItem(KsHttpUpBehavior.serrectKey)) {
            KsHttpUpBehavior.buyLstData = JSON.parse(localStorage.getItem(KsHttpUpBehavior.serrectKey) || "");
        } else {
            KsHttpUpBehavior.storage();
        }
        self.userActive();
        cb && cb();
    }
    /**
     *用户激活 
     */
    public userActive() {
        if (!SDK_config.openMaiLiang) return;
        var self = this;
        KsHttpUpBehavior.ks_callback = localStorage.getItem("ks_callback") || "";
        let campaignId = localStorage.getItem("ks_campaign_id");//广告计划id
        let unitId = localStorage.getItem("ks_unit_id");//广告组id
        let accountId = localStorage.getItem("ks_account_id");//广告主id
        let code = localStorage.getItem("ks_code");
        //开启埋点的情况
        if (KsHttpUpBehavior.ks_is_exist == 1) {
            console.log("开起了埋点");
            //埋点用户没有open_id的情况下
            if (localStorage.getItem("bury_user_active") != "1") {
                console.log("ks进入用户激活方法");
                let param = { user_code: code, callback: KsHttpUpBehavior.ks_callback, app_id: SDK_config.GameIdConfig.kuaishouID.appId, campaign_id: campaignId, unit_id: unitId, account_id: accountId };
                console.log("buryUserActive param:" + param);
                //是广告用户的时候
                if (KsHttpUpBehavior.ks_callback != undefined && KsHttpUpBehavior.ks_callback != null && KsHttpUpBehavior.ks_callback.length > 10) {
                    if (localStorage.getItem("ks_game_active") != "1") {//开启了埋点 并且是广告用户但是没有关键行为激活的情况
                        self.functionPost(url_event_active, param, function (data) {
                            if (data.code == 1) {
                                console.log("用户激活");
                                //保存open_id 到缓存
                                localStorage.setItem("ks_open_id", data.open_id);
                                //保存当前激活使用的adid到缓存再次进入游戏的时候使用
                                KsHttpUpBehavior.ks_open_id = data.open_id;
                                //保存激活状态到缓存
                                localStorage.setItem("ks_game_active", "1");
                                localStorage.setItem("bury_user_active", "1");
                            }
                        });
                    } else {//关键性存在open_id的情况下 只需要写入一下bury_user_active缓存
                        //存在open_id的情况下
                        localStorage.setItem("bury_user_active", "1");
                    }
                } else {//不是广告用户时
                    self.functionPost(url_event_active, param, function (data) {
                        if (data.code == 1) {
                            console.log("用户激活");
                            //保存当前激活用户ID到 缓存ks_open_id
                            localStorage.setItem("ks_open_id", data.open_id);
                            KsHttpUpBehavior.ks_open_id = data.open_id;
                            localStorage.setItem("bury_user_active", "1");
                        }
                    });
                }
            } else {
                //已经埋点激活但是是新的广告用户时
                if (KsHttpUpBehavior.ks_callback != undefined && KsHttpUpBehavior.ks_callback != null && KsHttpUpBehavior.ks_callback.length > 10) {
                    KsHttpUpBehavior.ks_open_id = localStorage.getItem("ks_open_id") || "";
                    //判断关键行为没有激活时
                    if (localStorage.getItem("ks_game_active") != "1") {
                        let param = { open_id: KsHttpUpBehavior.ks_open_id, callback: KsHttpUpBehavior.ks_callback, app_id: SDK_config.GameIdConfig.kuaishouID.appId, campaign_id: campaignId, unit_id: unitId, account_id: accountId };
                        console.log("buyUserActive param:" + param);
                        self.functionPost(url_buy_active, param, function (data) {
                            if (data.code == 1) {
                                //保存激活状态到缓存
                                localStorage.setItem("ks_game_active", "1");
                            }
                        });
                    }
                }
            }
        } else {//关闭埋点只存在关键行为的情况
            //判断是否是广告用户
            if (KsHttpUpBehavior.ks_callback != undefined && KsHttpUpBehavior.ks_callback != null && KsHttpUpBehavior.ks_callback.length > 10) {
                //判断是否存在激活
                if (localStorage.getItem("ks_game_active") != "1") {
                    let param = { user_code: code, callback: KsHttpUpBehavior.ks_callback, app_id: SDK_config.GameIdConfig.kuaishouID.appId, campaign_id: campaignId, unit_id: unitId, account_id: accountId };
                    self.functionPost(url_addiction_active, param, function (data) {
                        if (data.code == 1) {
                            console.log("用户激活");
                            //保存open_id 到缓存
                            localStorage.setItem("ks_open_id", data.open_id);
                            //保存当前激活使用的adid到缓存再次进入游戏的时候使用
                            KsHttpUpBehavior.ks_open_id = data.open_id;
                            //保存激活状态到缓存
                            localStorage.setItem("ks_game_active", "1");
                        }
                    });
                }
            }
        }
    }
    //用户看完激励视频次数上报服务器
    public videoUpdate() {
        if (!SDK_config.openMaiLiang) return;
        //判断是否是广告用户
        if (KsHttpUpBehavior.ks_callback != undefined && KsHttpUpBehavior.ks_callback != null && KsHttpUpBehavior.ks_callback.length > 10) {
            console.log("用户open_id:" + KsHttpUpBehavior.ks_open_id);
            if (KsHttpUpBehavior.ks_open_id == undefined || KsHttpUpBehavior.ks_open_id == null) {
                KsHttpUpBehavior.ks_open_id = localStorage.getItem("ks_open_id") || "";
            }
            let temp_num = KsHttpUpBehavior.buyLstData.video_num;
            temp_num = temp_num + 1;
            let param = { open_id: KsHttpUpBehavior.ks_open_id, video_num: temp_num, app_id: SDK_config.GameIdConfig.kuaishouID.appId };
            this.functionPost(url_http_video, param, function (data) {
                if (data.code == 1) {
                    console.log("用户激励视频次数:" + temp_num);
                }
            });
            KsHttpUpBehavior.buyLstData.video_num = temp_num;
            KsHttpUpBehavior.storage();
        }
    }
    /**
     * 用户事件上报
     * @param event 事件名 
     * @param state 事件内容
     * @param describe 事件描述 
     */
    public eventInfo(event: string, state: string, describe: string = '') {
        if (!SDK_config.openMaiLiang) return;
        if (KsHttpUpBehavior.ks_open_id == undefined || KsHttpUpBehavior.ks_open_id == null || KsHttpUpBehavior.ks_callback.length < 12) {
            KsHttpUpBehavior.ks_open_id = localStorage.getItem("ks_open_id") || "";
        }
        if (KsHttpUpBehavior.ks_open_id && KsHttpUpBehavior.ks_is_exist == 1) {
            let param = { open_id: KsHttpUpBehavior.ks_open_id, app_id: SDK_config.GameIdConfig.kuaishouID.appId, action: event, state: state, describe: describe };
            this.functionPost(event_info_url, param, function (data) {
                if (data.code == 1) {
                    console.log("用户事件上报成功");
                } else {
                    console.log("用户事件上报失败");
                }
            });
        }
    }
    /**
     * url Post请求
     * @param path url 
     * @param param 参数
     * @param callBack 
     */
    public functionPost(path: string, param: any, callBack?: Function) {
        var self = this;
        if (self.ks != null) {
            self.ks.request({
                url: path, //仅为示例，并非真实的接口地址  
                data: param,
                method: "POST",
                header: {
                    'content-type': 'application/json' // 默认值  
                },
                success(res) {
                    console.log("URL成功返回参数:" + res);
                    callBack && callBack(res.data)
                }, fail(res) {
                    console.log("URL失败返回参数:" + res);
                }
            })
        } else {
            console.log("ks没有获取到");
        }
    }
}
