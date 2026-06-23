import DebugLog from "../../../FrameWork/Debug/DebugLog_newsdk";
import SDK_config from "../../../SDK_config_newsdk";

//查询  
const url_http = "https://mailiangtest.zywxgames.com/api/";
//行为接口
// const url_http_action = "https://mailiangtest.zywxgames.com/api/index/op";//oppo小游戏

const url_http_action = "https://mailiangtest.zywxgames.com/api/index/huawei";//huawei小游戏
//此处给包名

var appId=null ;
var pkg=null  ;
/**
*步骤1. 在H5的API中创建 方法获取用户的设备信息 oppo 获取的是oaid/imei  华为获取的是OAID 
*代码
    oppoH5GameAPI
    //定义一个
    public static h5DeviceId = "";
    //获取设备信息 OPPO小游戏
    getDeviceId() {
        if (!cc.sys.localStorage.getItem("deviceid")) {
            if (this.qg !== null && this.qg !== undefined) {
                this.qg.getDeviceId({
                    success: function (data) {
                        oppoH5GameAPI.h5DeviceId = data.deviceId;
                        cc.sys.localStorage.setItem("deviceid", data.deviceId);
                    },
                    fail: function (data, code) {
                        console.log(`handling fail, code = ${code}`);
                    },
                });
            }
        } else {
            oppoH5GameAPI.h5DeviceId = cc.sys.localStorage.getItem("deviceid");
        }
    }
    //华为小游戏获取设备信息 请自行看API文档
	
    步骤2:请在初始化广告API 后再初始化关键行为上传 
    步骤3:在通关页面加上levelUpdate() 在看完视频后videoUpdate() 在插屏广告显示完成后调用screenUpdate() 如果有点击插屏广告回调事件的话,请在回调事件完成后调用adClickUpdate()
**/

export type buyLstData = {
    level_num: number,
    //视频数量
    video_num: number,
    //插屏广告展示数量
    screen_num: number,
    //插屏广告点击
    click_num: number,
    //是否激活
    hasActive: number,
}
export default class hwHttpUpBehavior {
    private static mInstance: hwHttpUpBehavior = null;
    public static getInstance(): hwHttpUpBehavior {
        if (this.mInstance === null) {
            this.mInstance = new hwHttpUpBehavior();
        }
        return this.mInstance;
    }
    public static imei = " ";
    public static oaid = " ";
    //是否存在买量
    public static is_buy_m = 0;
    /**serrectKey用于区别本地储存用户行为数据 */
    private static serrectKey: string = "buydatalst";
    //用户行为信息
    public static buyLstData: buyLstData = null;
    //862949038405374
    private constructor() {
    }
    /**初始化 */
    public onInit(pkg1:string,appid1:string) {
        if (!SDK_config.openMaiLiang) return;
        pkg=pkg1;
        appId=appid1;
        console.log("买量行为上传初始化");
        //此处开始计时
        let temp_is_buy = cc.sys.localStorage.getItem("ismailiang");
        temp_is_buy = parseInt(temp_is_buy);
        switch (temp_is_buy) {
            case 1:
                hwHttpUpBehavior.is_buy_m = 1;
                this.indexres();
                setTimeout(() => { this.gameTime(); }, 1000);
               
                break;
            case 2:
                hwHttpUpBehavior.is_buy_m = 2;
              
                break;
            default:
                this.isPkgConfig();
                break;
        }
    }
    public indexres(cb?: Function) {
        if (!SDK_config.openMaiLiang) {
            cb && cb();
            return;
        }

        if (cc.sys.localStorage.getItem(hwHttpUpBehavior.serrectKey)) {
            hwHttpUpBehavior.buyLstData = JSON.parse(cc.sys.localStorage.getItem(hwHttpUpBehavior.serrectKey));
        } else {
            let bld: buyLstData = {
                level_num: 0,
                video_num: 0,
                screen_num: 0,
                click_num: 0,
                hasActive: 0
            }
            hwHttpUpBehavior.buyLstData = bld;
            hwHttpUpBehavior.storage();
        }
        console.log("这里的值:" + cc.sys.localStorage.getItem("ismailiang"));
        hwHttpUpBehavior.is_buy_m = cc.sys.localStorage.getItem("ismailiang");
        if (hwHttpUpBehavior.is_buy_m == 1) {
            // if (oppoGameAPI.h5DeviceId != "") {
            //     if (oppoGameAPI.h5DeviceId.length > 20) {
            //         HttpUpBehavior.oaid = oppoGameAPI.h5DeviceId;
            //     } else {
            //         HttpUpBehavior.imei = oppoGameAPI.h5DeviceId;
            //     }
            // }
            console.log("关键行为初始化OAID " + hwHttpUpBehavior.oaid);
            setTimeout(() => { this.gameTime(); }, 1000);
            this.userActive();
        }
        cb && cb();
    }
    /**存储本地数据单独存,用存储到先前的数据里面*/
    public static storage() {

        cc.sys.localStorage.setItem(hwHttpUpBehavior.serrectKey, JSON.stringify(hwHttpUpBehavior.buyLstData));
    }
    //url 请求
    //url 请求激活
    public functionGet_act(path: string, param: string, callBack?: Function) {
        try {

            var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
            httpRequest.open('POST', path, true); //第二步：打开连接
            httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
            httpRequest.send(param);//发送请求 将情头体写在send中
            httpRequest.timeout = 5000;
            /**
             * 获取数据后的处理程序
             */
            httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
                if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
                    var json = JSON.parse(httpRequest.responseText);//获取到服务端返回的数据
                    callBack(json);
                    console.log(json);
                }
            };
        } catch (err) {
            callBack && callBack({ "code": 0 });
        }
    }
    //url 请求其他行为
    public functionGet(path: string, param: string, callBack?: Function) {

        let continuefun = () => {
            try {
                var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
                httpRequest.open('POST', path, true); //第二步：打开连接
                httpRequest.timeout = 5000;
                httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
                httpRequest.send(param);//发送请求 将情头体写在send中
                /**
                 * 获取数据后的处理程序
                 */
                httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
                    if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
                        var json = JSON.parse(httpRequest.responseText);//获取到服务端返回的数据
                        callBack(json);
                        console.log(json);
                    }
                };
            } catch (err) {
                callBack && callBack({ "code": 0 });
            }
        };

        this.userActive(() => {
         
            continuefun();
        });



    }
    //查询是否设置买量参数
    private isPkgConfig(cb?: Function) {
        if (!SDK_config.openMaiLiang) {
            cb && cb();
            return;
        }
        let self = this;
        this.functionGet_act(url_http, "pkg=" + pkg, (data) => {
            if (data.code == 1) {
                console.log("先设置这里");
                cc.sys.localStorage.setItem("ismailiang", 1);
            } else {
                cc.sys.localStorage.setItem("ismailiang", 2);
            }
            self.indexres(cb);
        });
        setTimeout(() => {
            if (!cc.sys.localStorage.getItem("ismailiang")) {
                console.log("执行到这里");
                self.indexres(cb);
            }
        }, 3000);
    }
    //用户激活注册
    private userActive(cb?: () => void) {
        if (!SDK_config.openMaiLiang) {
            cb && cb();
            return;
        }
        if (hwHttpUpBehavior.buyLstData.hasActive == 0) {
            let param = "pkg=" + pkg + "&imei=" + hwHttpUpBehavior.imei + "&oaid=" + hwHttpUpBehavior.oaid + "&action=active&APPID=" + appId;
            this.functionGet_act(url_http_action, param, function (data) {
                if (data.code == 1) {
                    console.log("用户激活");
                    hwHttpUpBehavior.buyLstData.hasActive = 1;
                    hwHttpUpBehavior.storage();

                    cb && cb();
                }
            });
        } else {
            cb && cb();
        }
    }
    //用户关卡行为上报服务器
    public levelUpdate() {
        if (!SDK_config.openMaiLiang) return;
        //L1 2 4 6 8 10
        console.log("关键行为关卡——————————————————   ");
        console.log(hwHttpUpBehavior.is_buy_m);
        if (hwHttpUpBehavior.is_buy_m == 1) {
            let temp_num = hwHttpUpBehavior.buyLstData.level_num;
            if (temp_num > 10) {
                console.log("已经达到上报的限制");
                return;
            }
            temp_num = temp_num + 1;

            switch (temp_num) {//在1 2 4 6 8 10 的时候上报用户行为
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    let param = "pkg=" + pkg + "&imei=" + hwHttpUpBehavior.imei + "&oaid=" + hwHttpUpBehavior.oaid + "&action=L" + temp_num + "&APPID=" + appId;
                    this.functionGet(url_http_action, param, function (data) {
                        if (data.code == 1) {
                            console.log("用户通过关卡:" + temp_num);
                        }
                    });
                    break;
            }
            hwHttpUpBehavior.buyLstData.level_num = temp_num;
            hwHttpUpBehavior.storage();
        }
    }
    //用户看完激励视频次数上报服务器
    public videoUpdate() {
        if (!SDK_config.openMaiLiang) return;
        console.log("关键行为视频——————————————————   ");
        if (hwHttpUpBehavior.is_buy_m == 1) {
            let temp_num = hwHttpUpBehavior.buyLstData.video_num;
            if (temp_num > 6) {
                return;
            }
            temp_num = temp_num + 1;
            switch (temp_num) {//在1 2 4 6 8 10 的时候上报用户行为
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    let param = "pkg=" + pkg + "&imei=" + hwHttpUpBehavior.imei + "&oaid=" + hwHttpUpBehavior.oaid + "&action=vclick" + temp_num + "&APPID=" + appId;
                    this.functionGet(url_http_action, param, function (data) {
                        if (data.code == 1) {
                            console.log("用户激励视频次数:" + temp_num);
                        }
                    });
                    break;

            }
            hwHttpUpBehavior.buyLstData.video_num = temp_num;
            hwHttpUpBehavior.storage();
        }
    }
    //插屏广告次数
    public screenUpdate() {
        if (!SDK_config.openMaiLiang) return;
        DebugLog.log("关键行为插屏——————————————————   ");
        if (hwHttpUpBehavior.is_buy_m == 1) {
            DebugLog.log("关键行为插屏————————进入——————————   ");
            let temp_num = hwHttpUpBehavior.buyLstData.screen_num;
            if (temp_num > 22) {//
                return;
            }
            temp_num = temp_num + 1;
            switch (temp_num) {//在 2 4 6 8 10 的时候上报用户行为
                case 2:
                case 4:
                case 6:
                case 8:
                case 10:
                    let param = "pkg=" + pkg + "&imei=" + hwHttpUpBehavior.imei + "&oaid=" + hwHttpUpBehavior.oaid + "&action=screen" + temp_num + "&APPID=" + appId;
                    this.functionGet(url_http_action, param, () => { });
                    break;
                default:
                    break;
            }
            hwHttpUpBehavior.buyLstData.screen_num = temp_num;
            hwHttpUpBehavior.storage();
        }
    }
    //更新插屏广告点击次数
    public adClickUpdate() {
        if (!SDK_config.openMaiLiang) return;
        DebugLog.log("关键行为插屏广告点击——————————————————   ");
        if (hwHttpUpBehavior.is_buy_m == 1 ) {
            DebugLog.log("关键行为插屏广告点击——————————进入————————   ");
            let temp_num = hwHttpUpBehavior.buyLstData.click_num;
            if (temp_num > 6) {
                return;
            }
            temp_num = temp_num + 1;
            switch (temp_num) {//在1 2 4 6 8 10 的时候上报用户行为
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    let param = "pkg=" + pkg + "&imei=" + hwHttpUpBehavior.imei + "&oaid=" + hwHttpUpBehavior.oaid + "&action=click" + temp_num + "&APPID=" + appId;
                    this.functionGet(url_http_action, param, function (data) {
                        if (data.status == 1) {
                            console.log("用户激励视频次数:" + temp_num);
                        }
                    });
                    break;
            }
            hwHttpUpBehavior.buyLstData.click_num = temp_num;
            hwHttpUpBehavior.storage();

        }
    }

    //游戏时长
    public gameTime() {
        if (!SDK_config.openMaiLiang) return;
        if (hwHttpUpBehavior.is_buy_m == 1) {
            let temp_time = cc.sys.localStorage.getItem("gametime");
            if (temp_time) {
                temp_time = parseInt(temp_time) + 1;
            } else {
                temp_time = 1;
            }
            if (temp_time > 1810) {
                return;
            }
            switch (temp_time) {//1 5 10 15 20 25 30
                case 60:
                case 300:
                case 600:
                case 900:
                case 1200:
                case 1500:
                case 1800:
                    let tMinute = temp_time / 60;
                    let param = "pkg=" + pkg + "&imei=" + hwHttpUpBehavior.imei + "&oaid=" + hwHttpUpBehavior.oaid + "&action=time" + tMinute + "&APPID=" + appId;
                    this.functionGet(url_http_action, param, () => { console.log("时长:" + tMinute + "分钟"); });
                    break;
            }
            cc.sys.localStorage.setItem("gametime", temp_time);
            setTimeout(() => { this.gameTime(); }, 1000);
        }
    }
}
