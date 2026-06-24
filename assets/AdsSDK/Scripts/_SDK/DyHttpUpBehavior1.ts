import { AdsOptions } from "./PlatformOptions";

//激活接口
const url_http = "https://mailiangtest.zywxgames.com/api/dy/newUserActive";
//视频行为接口
const url_http_video = "https://mailiangtest.zywxgames.com/api/dy/dyVideo";
//ecpm值查询
const url_query_ecpm = "https://mailiangtest.zywxgames.com/api/dy/ecpmChx";
//更新最后登录时间
const url_last_user_time = "https://mailiangtest.zywxgames.com/api/dy/lastUserTime";

/**
 *------------------注意-----------------
 *前置条件 
 *let query=tt.getLaunchOptionsSync().query;
 *1. 保存query.clickid 到缓存 dy_click_id 保存query.projectid 到缓存 dy_projectid 保存query.promotionid 到缓存 dy_promotionid
 *   保存query.requestid 到缓存 dy_requestid
 *2. 获取tt.login 
 *  当isLogin为true时,存'code'到缓存dy_code,当isLogin为false时存 'anonymous_code' 到缓存dy_code中
 *  保存isLogin到缓存dy_is_login isLogin为true时 dy_is_login值为1 为false时 dy_is_login值为0 。
 */
export default class DyHttpUpBehavior {
    private static mInstance: DyHttpUpBehavior | null = null;
    public static getInstance(): DyHttpUpBehavior {
        if (this.mInstance === null) {
            this.mInstance = new DyHttpUpBehavior();
        }
        return this.mInstance;
    }
    /**
     * 广告用户标识
     */
    public static dy_click_id = '';
    /**
     * 用户ID
     */
    public static dy_open_id = '';
    /**
     * ecpm值
     */
    public static ecpm: number = 0;
    /**serrectKey用于区别本地储存用户行为数据 */
    private static serrectKey: string = "buydatalst";
    //用户行为信息
    public static buyLstData = {
        //视频数量
        video_num: 0,
    };
    private constructor() {
    }
    public onInit(cb?: Function) {
        if (localStorage.getItem(DyHttpUpBehavior.serrectKey)) {
            DyHttpUpBehavior.buyLstData = JSON.parse(localStorage.getItem(DyHttpUpBehavior.serrectKey) || "");
        } else {
            DyHttpUpBehavior.storage();
        }
        console.log("这里的值:" + localStorage.getItem("dy_click_id"));
        DyHttpUpBehavior.dy_click_id = localStorage.getItem("dy_click_id") || "";
        // //代表是从广告来的用户
        // if (DyHttpUpBehavior.dy_click_id) {
        if (localStorage.getItem("dy_game_active") != "1") {
            let code = localStorage.getItem("dy_code") || "";
            //获取open_id
            let isLogin = Boolean(localStorage.getItem("dy_is_login"));
            this.userActiveLst(code, isLogin);
        } else {//再次进入游戏  只需要 open_id 与 点击Id
            //获取缓存中的open_id
            DyHttpUpBehavior.dy_open_id = localStorage.getItem("dy_open_id") || "";
            //获取激活的click_id
            DyHttpUpBehavior.dy_click_id = localStorage.getItem("dy_effective_click_id") || "";
            console.log("再次进入游戏");
            console.log(DyHttpUpBehavior.dy_click_id);
            console.log(DyHttpUpBehavior.dy_open_id);
            cb && cb();
        }

        // 获取激活时效
        const exp_time = Number(localStorage.getItem("dy_exp_time"));
        let code = localStorage.getItem("dy_code") || "";
        //获取open_id
        let isLogin = Boolean(localStorage.getItem("dy_is_login"));
        //判断是否存在过期时间
        if (exp_time && exp_time != undefined && exp_time != null && exp_time > 0) {
            DyHttpUpBehavior.dy_click_id = localStorage.getItem("dy_effective_click_id") || "";//获取上次激活的点击创意Id
            if (Date.now() > exp_time) {
                const new_click_id = localStorage.getItem("dy_click_id") || "";
                //先前激活的click_id 不等于新的click_id的情况下进行新激活
                if (DyHttpUpBehavior.dy_click_id != new_click_id) {
                    DyHttpUpBehavior.dy_click_id = new_click_id;//赋新的click_id
                    this.userActiveLst(code, isLogin);
                }
            } else {
                this.lastUserTime();
                localStorage.setItem("dy_click_id", DyHttpUpBehavior.dy_click_id);
            }
            cb && cb();
        } else {
            if (DyHttpUpBehavior.dy_open_id && DyHttpUpBehavior.dy_open_id.length > 8 && DyHttpUpBehavior.dy_open_id != "undefined" &&
                DyHttpUpBehavior.dy_open_id != null && DyHttpUpBehavior.dy_open_id != "null" && DyHttpUpBehavior.dy_open_id != "") {
                this.lastUserTime();
            } else {
                this.userActiveLst(code, isLogin);
            }
            cb && cb();
        }

        // } else {
        //     cb && cb();
        // }
    }
    //更新用户过期时间
    public lastUserTime() {
        var self = this;
        let param = "open_id=" + DyHttpUpBehavior.dy_open_id + "&app_id=" + AdsOptions.tt.tt_app_id;
        self.functionPost(url_last_user_time, param, function (data) {
            if (data.code == 1) {
                localStorage.setItem("dy_exp_time", data.exp_time);
                console.log("用户过期时间:" + data.exp_time);
            } else {
                console.log("___用户过期时间获取失败____");
            }
        });
    }

    /**存储本地数据单独存,用存储到先前的数据里面*/
    public static storage() {
        localStorage.setItem(this.serrectKey, JSON.stringify(this.buyLstData));
    }
    //url Post请求
    public functionPost(path: string, param: string, callBack?: Function) {
        try {
            var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
            httpRequest.open('POST', path, true); //第二步：打开连接
            httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
            httpRequest.send(param);//发送请求 将情头体写在send中
            /**
             * 获取数据后的处理程序
             */
            httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
                if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
                    console.log("httpRequest.responseText", httpRequest.responseText);
                    var json = JSON.parse(httpRequest.responseText);//获取到服务端返回的数据
                    callBack && callBack(json);
                    console.log(json);
                }
            };
        } catch (err) {
            callBack && callBack({ "code": 0 });
        }
    }
    //用户激活
    private userActiveLst(code: string, isLogin: Boolean) {
        var self = this;
        console.log("用户是否登录:" + isLogin);
        if (localStorage.getItem("dy_game_active") != "1") {
            console.log("userActiveLst url:" + url_http);
            let promotionid = localStorage.getItem("dy_promotionid");//计划id
            let projectid = localStorage.getItem("dy_projectid");//项目id
            let requestid = localStorage.getItem("dy_requestid");//请求id
            let param = "open_id=" + code + "&click_id=" + DyHttpUpBehavior.dy_click_id + "&app_id=" + AdsOptions.tt.tt_app_id + "&promotion_id=" + promotionid;
            param = param + "&isLogin=" + isLogin + "&project_id=" + projectid + "&request_id=" + requestid;
            console.log("userActiveLst param:" + param);
            self.functionPost(url_http, param, function (data) {
                if (data.code == 1) {
                    console.log("用户激活");
                    //保存open_id 到缓存
                    localStorage.setItem("dy_open_id", data.open_id);
                    //保存当前激活使用的click_id到缓存再次进入游戏的时候使用
                    localStorage.setItem("dy_effective_click_id", DyHttpUpBehavior.dy_click_id);
                    //保存当前激活使用的adid到缓存再次进入游戏的时候使用
                    DyHttpUpBehavior.dy_open_id = data.open_id;
                    //保存激活状态到缓存
                    localStorage.setItem("dy_game_active", "1");
                }
            });
        }
    }
    //用户看完激励视频次数上报服务器
    public videoUpdate() {
        if (DyHttpUpBehavior.dy_click_id) {//判断是否有点击ID 如果没有就不上报给后端
            console.log("用户open_id:" + DyHttpUpBehavior.dy_open_id);
            if (DyHttpUpBehavior.dy_open_id == undefined || DyHttpUpBehavior.dy_open_id == null) {
                DyHttpUpBehavior.dy_open_id = localStorage.getItem("dy_open_id") || "";
            }
            let temp_num = DyHttpUpBehavior.buyLstData.video_num;
            temp_num = temp_num + 1;
            //视频只需要 上报open_id  点击Id 视频次数 app_id
            let param = "open_id=" + DyHttpUpBehavior.dy_open_id + "&click_id=" + DyHttpUpBehavior.dy_click_id + "&video_num=" + temp_num + "&app_id=" + AdsOptions.tt.tt_app_id;
            this.functionPost(url_http_video, param, function (data) {
                if (data.code == 1) {
                    console.log("用户激励视频次数:" + temp_num);
                }
            });
            DyHttpUpBehavior.buyLstData.video_num = temp_num;
            DyHttpUpBehavior.storage();
        }
    }

    /**
    * 此接口为查询ecpm值 每次游戏启动的时候调用一次即可
    * DyHttpUpBehavior.ecpm = 0 请不要弹插屏
    */
    public queryEcpm() {
        const today = new Date();
        const year = today.getFullYear(); // 获取年份
        const month = (today.getMonth() + 1).toString().padStart(2, '0'); // 获取月份，+1因为getMonth()返回0-11
        const day = today.getDate(); // 获取日
        const todays = year + month + day;
        const timeDate = localStorage.getItem("timeDate");
        if (timeDate) {
            //当缓存中的时间大于当前时间时
            if (this.convertToDate(todays) > this.convertToDate(timeDate)) {
                console.log("当前年月日大于缓存的年月日");
                if (DyHttpUpBehavior.dy_click_id) {//当前用户为广告用户时
                    //参数用户ID AppId  clickId为默认值
                    let param = "open_id=" + DyHttpUpBehavior.dy_open_id + "&app_id=" + AdsOptions.tt.tt_app_id + "&click_id=queryEcpm";
                    this.functionPost(url_query_ecpm, param, function (data) {
                        if (data.code == 1) {
                            DyHttpUpBehavior.ecpm = data.ecpm;
                        } else {
                            console.log("当前用户为关键行为用户");
                        }
                    });
                } else {//自然量用户 
                    DyHttpUpBehavior.ecpm = 0;
                    //DyHttpUpBehavior.ecpm = 1; 自然量用户需要显示插屏的话  注释掉上面的代码 打开此行代码
                }
                //更新缓存的年也日
                localStorage.setItem("timeDate", todays);
            } else {
                console.log("当前年月日不大于缓存的年月日");
            }
        } else {
            console.log("设置缓存的年月日");
            localStorage.setItem("timeDate", todays);
        }
        //时间判断 2024-09-26 >2024-09-26

    }
    //时间处理
    private convertToDate(yearMonthDay: string): number {
        // 假设yearMonthDay是一个格式为"YYYYMMDD"的字符串
        const year = parseInt(yearMonthDay.substr(0, 4), 10);
        const month = parseInt(yearMonthDay.substr(4, 2), 10) - 1; // JS中的月份是从0开始的
        const day = parseInt(yearMonthDay.substr(6, 2), 10);
        return new Date(year, month, day).getTime();
    }
}