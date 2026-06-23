import { AdsOptions } from "./PlatformOptions";

//激活接口
const activ_url = "https://kstfdata.zywxgames.com/api/wx/gameActivate";
//更新最后登录时间
const last_login_url = "https://kstfdata.zywxgames.com/api/wx/lastUserTime";
//ecpm 上报
const ecpm_url = "https://kstfdata.zywxgames.com/api/wx/ecpm";
//获取open_id 与 session_key
const js_code_url = "https://kstfdata.zywxgames.com/api/wx/jsCodeSession";

/**
 * 启动参数示例
 * path：/pages/index.html?clue_token=___&project_id=___&promotion_id=___&mid1=___&mid2=___&mid3=___&mid4=___&mid5=___&req_id=___&advertiser_id=___&clickid=___
 * 获取启动参数
 * let query=启动参数分数;
 * 存储
 * 启动参数中 有参数:clickid 为抖音 1  有参数callback  为快手 2  这个2个参数都没有 为微信 3   有ai 参数 为爱奇艺 4
 * 参数 clickid 存在   为抖音 1
 * localStorage.setItem("wx_dy_promotion_id"，query.promotion_id);//计划id
 * localStorage.setItem("wx_dy_project_id"，query.project_id);//项目id
 * localStorage.setItem("wx_dy_requestid"，query.req_id);//请求id
 * localStorage.setItem("wx_dy_material_id"，query.material_id);//素材ID
 * localStorage.setItem("wx_dy_advertiser_id"，query.advertiser_id);//广告主
 * localStorage.setItem("wx_dy_click_id"，query.clickid)
 * 参数 callback 存在 为快手 2
 * localStorage.setItem("wx_dy_promotion_id"，query.ksCampaignld);//计划id
 * localStorage.setItem("wx_dy_project_id"，query.ksUnitld);//项目id
 * localStorage.setItem("wx_dy_requestid"，query.ksChannel);//请求id
 * localStorage.setItem("wx_dy_material_id"，query.ksCreativeld);//素材ID
 * localStorage.setItem("wx_dy_advertiser_id"，query.ksSiteAccountld);//广告主
 * localStorage.setItem("wx_dy_click_id"，query.callback)
 * 
 
 * 参数 ai 存在 为爱奇艺 4
 * localStorage.setItem("wx_dy_promotion_id"，query.d);//创意id
 * localStorage.setItem("wx_dy_project_id"，query.q);//广告id
 * localStorage.setItem("wx_dy_advertiser_id"，query.ai);//账户id
 * localStorage.setItem("wx_dy_click_id"，query.c)//曝光id
 
 * 参数 mediabuy_id 存在 为芒果 5
 * localStorage.setItem("wx_dy_promotion_id"，query.creative_id);//创意
 * localStorage.setItem("wx_dy_project_id"，query.mediabuy_id);//广告id
 * localStorage.setItem("wx_dy_advertiser_id"，query.mediabuy_id);//账户id
 * localStorage.setItem("wx_dy_click_id"，query.biz_id)//曝光id
 * 
 * 在微信sdk 中判断 来源
 * 根据 启动参数 判断 头条 为 1 快手为2  自然量为3 爱奇艺为4  芒果为5
 * 设置localStorage.setItem("wx_chan_type",1/2/3/4/5)
 * 
 * 如果为3
 * wx.login
 * 
 * 第一次进入游戏时必须调用 wx.login() 后获取code 第一次不用检查  session_key 是否过期
 * 再次进入游戏时必须检查 session_key 是否过期。wx.checkSession  
 *   过期的话就要重新调用 wx.login() 后获取code 再调用 jsCodeSession 更新s ession_key
 *   没有过期的话就不用调用wx.login()   
 * WxHttpUpBehavior.wx_code=code
 *初始化WxHttpUpBehavior.getInstance().init();
 *
 *ecpm解密 请调用WxHttpUpBehavior.getInstance().ecpm(加密字符串，初始化向量);
 *由于不是专业的,写法可以有些啰嗦  在逻辑与参数名不变的情况可以自行修改
 *
 * 示例
 * 
  public validate() {
        const wx_chan_type: number = Number(localStorage.getItem("wx_chan_type") || "3");
        if (wx_chan_type == 3) {//自然量或者是微信自买量
            const wx_z_open_id: string = localStorage.getItem("wx_z_open_id")
            if (wx_z_open_id == null || wx_z_open_id == "undefined" || wx_z_open_id == "" || wx_z_open_id == "null") {
                //自然接口 
                this.wx.login({
                    success: (res: any) => {
                        console.log("wx login success", res?.code);
                        if (res.code) {
                            this.wx.request({
                                url: 'https://wxgames.zywxgames.com/api/wx',
                                data: {
                                    app_id: this.APPID,
                                    code: res.code
                                },
                                success: (res: any) => {
                                    const data = res.data;
                                    console.log("获取openId结果 => ", data);
                                    if ((data?.code ?? 0) === 1) {
                                        if (data.open_id && data.open_id !== "") {
                                            this.sdk.setOpenId(data.open_id);
                                            localStorage.setItem("wx_z_open_id", data.open_id)
                                        }
                                        else if (data.union_id && data.union_id !== "") {
                                            this.sdk.setUnionId(data.union_id);
                                        }
                                        else {
                                            console.warn("获取openId失败C => ", data);
                                        }

                                        // 是否注册用户
                                        if ((data?.is_new ?? 0) === 1) {
                                            this.sdk.onRegister();
                                        }
                                        // 是否沉默唤起
                                        else if ((data?.days ?? 0) > 7) {
                                            this.sdk.track('RE_ACTIVE', { backFlowDay: 7 });
                                        }

                                        //TODO 保存一份到本地缓存 不需要每次都去请求 - 如果不调用怎么刷新服务器记录的时间
                                    }
                                    else {
                                        console.warn("获取openId失败A => ", data);
                                    }
                                },
                                fail: (err: any) => {
                                    console.warn("获取openId失败B => ", err?.errMsg);
                                }
                            })
                        }
                    }
                });
            } else {
                //更新 lastUser 
                this.lastUser(wx_z_open_id);
            }
        } else {
            //外渠买量
            const wx_open_id: string = localStorage.getItem("wx_open_id")
            if (wx_open_id == null || wx_open_id == "undefined" || wx_open_id == "" || wx_open_id == "null") {
                this.wx.login({
                    success: (res: any) => {
                        if (res.code) {
                            WxHttpUpBehavior.wx_code = res.code;
                            WxHttpUpBehavior.getInstance().onInit();
                            const wx_open_id1: string = localStorage.getItem("wx_open_id")
                            const is_new = localStorage.getItem("is_new");
                            const days = localStorage.getItem("days");
                            const wx_z_open_id: string = localStorage.getItem("wx_z_open_id");
                            if (wx_z_open_id == null || wx_z_open_id == "undefined" || wx_z_open_id == "" || wx_z_open_id == "null") {  
                                this.wx.request({
                                    url: 'https://wxgames.zywxgames.com/api/wx',
                                    data: {
                                        app_id: this.APPID,
                                        code: res.code,
                                        open_id: wx_open_id1
                                    }
                                })
                                localStorage.setItem("wx_z_open_id", wx_open_id1);
                            }
                            if ((is_new ?? 0) === 1) {
                                this.sdk.onRegister();
                            }
                            //上报wxSDK
                            this.sdk.setOpenId(wx_open_id1);
                            if ((days ?? 0) > 7) {
                                this.sdk.track('RE_ACTIVE', { backFlowDay: 7 });
                            }
                        }
                    }
                });
            } else {
                this.lastUser(wx_open_id);
                WxHttpUpBehavior.getInstance().lastUserTime();
            }
        }
    }
    private lastUser(open_id: string) {
        this.wx.request({
            url: 'https://wxgames.zywxgames.com/api/wx/lastUser',
            data: {
                app_id: this.APPID,
                open_id: open_id,
            },
            success: (res: any) => {
                //is_new  days  
                const data = res.data;
                if ((data?.code ?? 0) === 1) {
                    // 是否注册用户
                    if ((data?.is_new ?? 0) === 1) {
                        this.sdk.onRegister();
                    }
                    // 是否沉默唤起
                    else if ((data?.days ?? 0) > 7) {
                        this.sdk.track('RE_ACTIVE', { backFlowDay: 7 });
                    }
                    //TODO 保存一份到本地缓存 不需要每次都去请求 - 如果不调用怎么刷新服务器记录的时间
                }
            }
        });
    }

   //获取后续 open_id
   public upSdk() {
        const wx_chan_type: number = Number(localStorage.getItem("wx_chan_type") || "3");
        let open_id = "";
        if (wx_chan_type == 3) {
            open_id = localStorage.getItem("wx_z_open_id");
        } else {
            open_id = localStorage.getItem("wx_open_id");
        }
        //上报微信后续
        return open_id;
    }
   //解密ecpm
    decryptData(encryptedData: any, iv: string) {
        this.wx.checkSession({
            success() {
                //session_key 未过期，并且在本生命周期一直有效,直接传给服务器解密
                WxHttpUpBehavior.getInstance().ecpm(encryptedData, iv);
            }, fail: () => {
                // session_key 已经失效，需要重新执行登录流程，确保服务端sessionkey未过期，后再解密
                this.wx.login({
                    success: (res: any) => {
                        console.log("wx login success", res?.code);
                        if (res.code) {
                            WxHttpUpBehavior.wx_code = res.code;
                            WxHttpUpBehavior.getInstance().jsCodeSession();
                            WxHttpUpBehavior.getInstance().ecpm(encryptedData, iv);
                        }
                    }
                });
            }
        });
    }
 *
 *
 *
 *
 */
//更新最后登录时间
const last_url = "https://wxgames.zywxgames.com/api/wx/lastUser";
const login_url = "https://wxgames.zywxgames.com/api/wx";
export default class WxHttpUpBehavior {
    private constructor() {
    }
    private static mInstance: WxHttpUpBehavior | null = null;
    public static getInstance(): WxHttpUpBehavior {
        if (this.mInstance === null) {
            this.mInstance = new WxHttpUpBehavior();
        }
        return this.mInstance;
    }
    /**
     * 微信的用户ID
     */
    public static wx_open_id = '';
    /**
     * 获取登录凭证
     */
    public static wx_code = '';
    /**
     *来源点击ID
     */
    public static wx_dy_click_id = "";
    /**
     *session_key 
     */
    public static wx_session_key = "";
    public onInit() {
        //获取激活时效
        const exp_time = Number(localStorage.getItem("wx_exp_time"));
        //判断是否存在过期时间
        WxHttpUpBehavior.wx_dy_click_id = localStorage.getItem("wx_dy_click_id") || "";
        //判断是否存在用户有效期
        if (exp_time && exp_time != undefined && exp_time != null && exp_time > 0) {
            WxHttpUpBehavior.wx_dy_click_id = localStorage.getItem("wx_dy_effective_click_id") || "";//获取上次激活的点击创意Id
            if (Date.now() > exp_time) {
                const new_click_id = localStorage.getItem("wx_dy_click_id") || "";
                //先前激活的click_id 不等于新的click_id的情况下进行新激活
                if (WxHttpUpBehavior.wx_dy_click_id != new_click_id) {
                    WxHttpUpBehavior.wx_dy_click_id = new_click_id;//赋新的click_id
                    this.activUser();
                } else {
                    WxHttpUpBehavior.wx_open_id = localStorage.getItem("wx_open_id") || "";
                }
            } else {//在有效期范围内 更新有效期
                WxHttpUpBehavior.wx_open_id = localStorage.getItem("wx_open_id") || "";
                this.lastUserTime();
            }
        } else {
            //不存在有效期代表新增用户
            this.activUser();
        }
    }
    /**
     * 用户激活
     */
    public activUser() {
        let promotion_id = localStorage.getItem("wx_dy_promotion_id");//计划id
        let project_id = localStorage.getItem("wx_dy_project_id");//项目id
        let request_id = localStorage.getItem("wx_dy_requestid");//请求id
        let material_id = localStorage.getItem("wx_dy_material_id");//素材ID
        let advertiser_id = localStorage.getItem("wx_dy_advertiser_id");//广告主
        let chan_type = localStorage.getItem("wx_chan_type");//广告主
        let param = "code=" + WxHttpUpBehavior.wx_code + "&promotion_id=" + promotion_id + "&project_id=" + project_id + "&request_id=" + request_id + "&material_id=" + material_id + "&advertiser_id=" + advertiser_id;
        param = param + "&click_id=" + WxHttpUpBehavior.wx_dy_click_id + "&chan_type=" + chan_type + "&app_id=" + AdsOptions.wx.wx_app_id;
        console.log("激活参数:" + param);
        this.functionPost(activ_url, param, function (data: any) {
            if (data.code == 1) {
                //保存当前激活使用的click_id到缓存再次进入游戏的时候使用
                localStorage.setItem("wx_dy_effective_click_id", WxHttpUpBehavior.wx_dy_click_id);
                //保存当前激活使用的adid到缓存再次进入游戏的时候使用
                localStorage.setItem("wx_open_id", data.open_id);
                WxHttpUpBehavior.wx_open_id = data.open_id;
                //保存激活状态到缓存
                localStorage.setItem("wx_dy_game_active", "1");
                //存储用户过期时间    
                localStorage.setItem("is_new", data.is_new);
                localStorage.setItem("days", data.days);
                localStorage.setItem("wx_exp_time", data.exp_time);
                console.log("用户激活成功:" + JSON.stringify(data));
                console.log("用户过期时间:" + data.exp_time);
            } else {
                console.log("__用户激活失败__");
            }
        });

    }

    //用户刷新sessionKey
    public jsCodeSession() {
        let code = WxHttpUpBehavior.wx_code;
        if (code && code != undefined && code != "undefined" && code != null && code != "null" && code != "") {
            let param = "code=" + code + "&app_id=" + AdsOptions.wx.wx_app_id;
            this.functionPost(js_code_url, param, function (data: any) {
                if (data.code == 1) {
                    console.log("___用户刷新session_key成功____" + JSON.stringify(data));
                } else {
                    console.log("___用户刷新session_key失败____" + JSON.stringify(data));
                }
            });
        }
    }
    /**
     *更新登录时间
     */
    public lastUserTime() {
        let param = "open_id=" + WxHttpUpBehavior.wx_open_id + "&app_id=" + AdsOptions.wx.wx_app_id;
        this.functionPost(last_login_url, param, function (data: any) {
            if (data.code == 1) {
                localStorage.setItem("wx_exp_time", data.exp_time);
                console.log("用户过期时间:" + data.exp_time);
            } else {
                console.log("___用户过期时间获取失败____");
            }
        });
    }
    /**
     * ecpm 档位解密
     * @param encryptedData 验签字符串
     * @param iv 初始化向量
     */
    public ecpm(encryptedData: string, iv: string) {
        // if (localStorage.getItem("wx_chan_type") == 3) {
        //     return;
        // }
        let param = "open_id=" + WxHttpUpBehavior.wx_open_id + "&encryptedData=" + encryptedData + "&iv=" + iv + "&app_id=" + AdsOptions.wx.wx_app_id;
        this.functionPost(ecpm_url, param, function (data: any) {
            if (data.code == 1) {
                console.log("上传ECPM档位成功");
            } else {
                console.log("___上传ECPM档位失败____");
            }
        });
    }

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
                    var json = JSON.parse(httpRequest.responseText);//获取到服务端返回的数据
                    callBack && callBack(json);
                    console.log(json);
                }
            };
        } catch (err) {
            callBack && callBack({ "code": 0 });
        }
    }
}