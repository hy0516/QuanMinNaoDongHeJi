import { AdsOptions } from "./PlatformOptions";

//激活接口
const url_http = "https://mailiangtest.zywxgames.com/api/bl/userActive";
//视频行为接口
const url_http_video = "https://mailiangtest.zywxgames.com/api/bl/dyVideo";

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
export default class BlHttpUpBehavior {
    private static mInstance: BlHttpUpBehavior | null = null;
    public static getInstance(): BlHttpUpBehavior {
        if (this.mInstance === null) {
            this.mInstance = new BlHttpUpBehavior();
        }
        return this.mInstance;
    }
    //是否存在广告点击Id
    public static bl_click_id = '';
    public static bl_open_id = '';
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
        if (localStorage.getItem(BlHttpUpBehavior.serrectKey)) {
            BlHttpUpBehavior.buyLstData = JSON.parse(localStorage.getItem(BlHttpUpBehavior.serrectKey) || "");
        } else {
            BlHttpUpBehavior.storage();
        }
        console.log("这里的值:" + localStorage.getItem("bl_click_id"));
        BlHttpUpBehavior.bl_click_id = localStorage.getItem("bl_click_id") || "";
        //代表是从广告来的用户
        if (BlHttpUpBehavior.bl_click_id) {
            if (localStorage.getItem("bl_game_active") != "1") {
                let code = localStorage.getItem("bl_code") || "";
                //获取open_id
                let isLogin = Boolean(localStorage.getItem("bl_is_login"));
                this.userActiveLst(code, isLogin);
            } else {//再次进入游戏  只需要 open_id 与 点击Id
                //获取缓存中的open_id
                BlHttpUpBehavior.bl_open_id = localStorage.getItem("bl_open_id") || "";
                //获取激活的click_id
                BlHttpUpBehavior.bl_click_id = localStorage.getItem("bl_effective_click_id") || "";
                console.log("再次进入游戏");
                console.log(BlHttpUpBehavior.bl_click_id);
                console.log(BlHttpUpBehavior.bl_open_id);
                cb && cb();
            }
        } else {
            cb && cb();
        }
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
        if (localStorage.getItem("bl_game_active") != "1") {
            console.log("userActiveLst url:" + url_http);
            let promotionid = localStorage.getItem("bl_promotionid");//计划id
            let projectid = localStorage.getItem("bl_projectid");//项目id
            let requestid = localStorage.getItem("bl_requestid");//请求id
            let param = "open_id=" + code + "&click_id=" + BlHttpUpBehavior.bl_click_id + "&app_id=" + AdsOptions.bl.bl_app_id + "&promotion_id=" + promotionid;
            param = param + "&isLogin=" + isLogin + "&project_id=" + projectid + "&request_id=" + requestid;
            console.log("userActiveLst param:" + param);
            self.functionPost(url_http, param, function (data) {
                if (data.code == 1) {
                    console.log("用户激活");
                    //保存open_id 到缓存
                    localStorage.setItem("bl_open_id", data.open_id);
                    //保存当前激活使用的click_id到缓存再次进入游戏的时候使用
                    localStorage.setItem("dy_effective_click_id", BlHttpUpBehavior.bl_click_id);
                    //保存当前激活使用的adid到缓存再次进入游戏的时候使用
                    BlHttpUpBehavior.bl_open_id = data.open_id;
                    //保存激活状态到缓存
                    localStorage.setItem("bl_game_active", "1");
                }
            });
        }
    }
    //用户看完激励视频次数上报服务器
    public videoUpdate() {
        if (BlHttpUpBehavior.bl_click_id) {//判断是否有点击ID 如果没有就不上报给后端
            console.log("用户open_id:" + BlHttpUpBehavior.bl_open_id);
            if (BlHttpUpBehavior.bl_open_id == undefined || BlHttpUpBehavior.bl_open_id == null) {
                BlHttpUpBehavior.bl_open_id = localStorage.getItem("bl_open_id") || "";
            }
            let temp_num = BlHttpUpBehavior.buyLstData.video_num;
            temp_num = temp_num + 1;
            //视频只需要 上报open_id  点击Id 视频次数 app_id
            let param = "open_id=" + BlHttpUpBehavior.bl_open_id + "&click_id=" + BlHttpUpBehavior.bl_click_id + "&video_num=" + temp_num + "&app_id=" + AdsOptions.bl.bl_app_id;
            this.functionPost(url_http_video, param, function (data) {
                if (data.code == 1) {
                    console.log("用户激励视频次数:" + temp_num);
                }
            });
            BlHttpUpBehavior.buyLstData.video_num = temp_num;
            BlHttpUpBehavior.storage();
        }
    }
}