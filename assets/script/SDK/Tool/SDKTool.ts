import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame";
import SDK_Manager from "../SDK_Manager";

export default class SDKTool {
  private static _instance: SDKTool = null;
    static isDeubg: boolean = false; //是否是调试模式
  public static getInstance() {
    if (SDKTool._instance == null) {
      SDKTool._instance = new SDKTool();
    }
    return SDKTool._instance;
  }
  getGGType: number = 1//获取到的广告策略

  GD: number = 0
  sfcity: string = "";

  sfip: string = "";

  HKT_PKG: string = "com.zdtx.tt.rsclxz"//小游戏包名

  Changle: string = "TT1";//小游戏渠道
  public static ADswitch: boolean = false;
  public static videonum: number = 0;
  name: string[] = ["北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆", "重庆"]
  nameCode: string[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]
  private ipAdressUrl: string[] = [
    "http://datacenter.zywxgames.com:15855/api", "http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp", "http://datacenter.zywxgames.com:15850/api", "https://whois.pconline.com.cn/ip.jsp?qq-pf-to=pcqq.c2c"
  ]
  timeString: any;
  timeChange: any;

  static isTimeLock: boolean = false;
  static isIpLock: boolean = false;
  static isMaiLiang: boolean = false;
  private qg: any = window['qg'];
  public init(): void {
    // this.GetMain();
    // this.GetEnterOptionsSync();
    this.dealTakeNum();
  }

  GetPB(): number {
    if (SDKTool.isDeubg) {
      return 3;
    }else{
      return this.getGGType;
    }
    
   


  }

  GetMain() {
    let self = this;
    if (SDK_Manager.getInstance().isOppo()) {
      this.Changle = "OPPO1";
      if (this.qg != null && this.qg != undefined) {
    
        this.qg.getManifestInfo({
          success: function (res) {
          
            self.HKT_PKG = JSON.parse(res.manifest).package;
            self.dealTakeNum();
          },
          fail: function (err) {},
          complete: function (res) {},
        });
    
        // self.HKT_PKG = data.res.manifest.package;
      }
    }
    if (SDK_Manager.getInstance().isVivo()) {
      this.Changle = "VIVO1";
      if (this.qg != null && this.qg != undefined) {
      let data =  this.qg.getSystemInfoSync();
      this.HKT_PKG = data.miniGame.package;
      this.dealTakeNum();
      }
    }
  
  }



  /***
   * 获取渠道冷启动信息
   */
  GetEnterOptionsSync() {
    const isML = localStorage.getItem('mhajsML');
    if (SDK_Manager.getInstance().isOppo()) {
      // const qg = window['qg'];
      if (this.qg != null && this.qg != undefined) {
        if (this.qg.getEnterOptionsSync) {
          const api = this.qg.getEnterOptionsSync()
          const query = api.query;
          console.log(query);
          if (query && query.key1 === "value1") {
            SDKTool.isMaiLiang = true;
            localStorage.setItem('mhajsML', '1');
            // Platforms_QuickGame.getInstance().showVideo(() => { });
          } else {
            SDKTool.isMaiLiang = false;
          }
        }
      }
    }

    if (SDK_Manager.getInstance().isVivo()) {

      // const qg = window['qg'];
      if (this.qg != null && this.qg != undefined) {
        if (this.qg.getLaunchOptionsSync) {
          const launchOption = this.qg.getLaunchOptionsSync()
          const type = launchOption.query.type
        
          if (type === 'ad') {
            //代表是广告联盟启动来源
        
            SDKTool.isMaiLiang = true;
            localStorage.setItem('mhajsML', '1');
          } else {
        
            SDKTool.isMaiLiang = false;
          }
        }
      }
    }
    if (isML == '1') {
      SDKTool.isMaiLiang = true;

    }

  }


  dealTakeNum() {

    let self = this;

    let url = 'https://wxdatagets.zywxgames.com/api/index/params?pkm=' + this.HKT_PKG + '&canshu=' + this.Changle ;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        var response = xhr.responseText;

        self.dealMessage(response);
      }

    };
    xhr.open("GET", url, true);
    xhr.send();
  }

  getIpAddress() {
    let self = this;
    let url = this.ipAdressUrl[0];
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        var response = xhr.responseText;
        self.sfcity = response;
        console.log('---ip--start pb--' + response);

        self.sfip = self.getIpAddressChagne(response);
        self.dealTakeNum();
      }

    };
    xhr.open("GET", url, true);
    xhr.send();
  }
  getIpAddressChagne(str) {
    let ss = "00";
    for (let i = 0; i < this.name.length; i++) {
      if (str.indexOf(this.name[i]) != -1) {
        ss = this.nameCode[i];

        break;
      }
    }

    return ss;

  }
  dealMessage(str1) {

    let ggarr_b = str1.split("&")

    let ggarr = ggarr_b[0]
    let gi = 0
    if (ggarr_b.length > 1) {
      gi = ggarr_b[1];
    }
    let ggar = ggarr.split("#")

    let str = ggar[gi];

    let index = str.indexOf("GG");
    if (index != -1) {
      let num = parseInt(str.substring(index + 2,
        index + 3));

      this.getGGType = num;
      
    }
    index = str.indexOf("GD");
    if (index != -1) {
      let num = parseInt(str.substring(index + 2,
        index + 3));

      this.GD = num;
      console.log("GD:" + this.GD);
    }


    console.log(this.getGGType);


  }
  public ADTime(): number {
    let d = new Date();
    var ADTime = "2025-6-14"
    var Today = d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString();
    console.log("今日签到：" + Today);
    var dateStart: any = new Date(ADTime);
    var dateEnd: any = new Date(Today);
    // console.log("之前天数："+ lateDay + "之后天数" + nowDay);
    let difValue = (dateEnd - dateStart) / (1000 * 60 * 60 * 24);
    console.log(":::" + difValue)
    return difValue;
  }
}