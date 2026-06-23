import Platforms_QuickGame from "../Platforms/QuickGame/Platforms_QuickGame_newsdk";


export default class SDKTool {
  private static _instance: SDKTool = null;
  public static getInstance() {
    if (SDKTool._instance == null) {
      SDKTool._instance = new SDKTool();
      // SDKTool._instance.init();
    }
    return SDKTool._instance;
  }



  HKT_PKG: string = "com.zsfz.tss.html"//小游戏包名

  Changle: string = "VIVO";//小游戏渠道

  sfcity: string = "";

  sfip: string = "";

  public getGGType: number = 0;//获取到的广告策略

  public ADswitch: boolean = true;
  public getLocaltime: number = 0;
  public getAdshowtime: number = 0;
  public getAdthetime: number = 0;
  public GD: number = 0;
  public name: string[] = ["北京", "上海", "广州", "深圳", "东莞", "厦门", "长沙", "重庆"];
  public nameCode: string[] = ["01", "02", "03", "04", "05", "06", "07", "08"];
  private ipAdressUrl: string[] = [
    "http://quzhi.zywxgames.com:14840/data/ie.aspx?", "https://whois.pconline.com.cn/ip.jsp?qq-pf-to=pcqq.c2c"
  ]

  public init(): void {
    this.sfcity = '';
    this.getIpAddress();
    this.getLocaltime = new Date().getTime() / 1000;
    if (SDK_Manager.getInstance().isVivo()) {
      if (this.GetADswitch()) {
        setInterval(() => {
          this.AutoAd();
        }, 1000);
      }
    }
    if (SDK_Manager.getInstance().isOppo()) {
      if (this.GetADswitch()) {
        setInterval(() => {
          this.AutoAdO();
        }, 1000);
      }
    }

  }
  GetADswitch(): boolean {
    let theTime = new Date().getHours();
    let date = new Date().getDay();
    console.log("hour" + theTime)
  if(this.ADTime()>2){
      if (this.sfip == "00") {
        this.ADswitch = true;
        return this.ADswitch;
      }else if (this.sfip == "08"||this.sfip == "05") {
        this.ADswitch = false;
        return this.ADswitch;
      }
       else {

        if (date == 0 || date == 6) {
          this.ADswitch = true;
          return this.ADswitch;
        } else {


          console.log("hour" + theTime)
          if (theTime >= 8 && theTime <= 18) {

            this.ADswitch = false;
            return this.ADswitch;
          } else {
            this.ADswitch = true;
            return this.ADswitch;
          }
        }
      }
  }else{
    this.ADswitch = false;
    return this.ADswitch;
  }
    // console.log("sfip" + this.sfip);




  }

  dealTakeNum() {

    console.log("dealTakeNum");
    let self = this;

    let url = 'http://quzhi.zywxgames.com:14840/data/sdkver.aspx?pkm=' + this.HKT_PKG + '&canshu=' + this.Changle + '&iccid=' + this.sfip + '&ip=' + this.sfip + '&url=new&yys=yd';

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
    console.log("getIpAddress");
    let self = this;
    let url = this.ipAdressUrl[0];
    var xhr = new XMLHttpRequest();


    xhr.open("GET", url, true);
    // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        var response = xhr.responseText;
        self.sfcity = response;


        self.sfip = self.getIpAddressChagne(response);
        // self.dealTakeNum();
      } else {
        self.sfip = "01";
      }

      // Platforms_QuickGame.getInstance().showToast(""+self.sfip);
    };

  }
  getIpAddressChagne(str) {
    let ss = "00";
    for (let i = 0; i < this.name.length; i++) {
      if (str.indexOf(this.name[i]) != -1) {
        ss = this.nameCode[i];

        break;
      }
    }

    console.log("nameCode" + ss);

    return ss;

  }
  dealMessage(str) {

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

    }



  }
  public AutoAd(): void {
    this.getAdthetime = new Date().getTime() / 1000;
    this.getAdshowtime++;
    if (this.getAdthetime - this.getLocaltime > 250 && this.getAdshowtime > 30) {
      Platforms_QuickGame.getInstance().showVivoNativeAD2();
      this.getAdshowtime = 0;
    }

  }
  public AutoAdO(): void {
    this.getAdthetime = new Date().getTime() / 1000;
    this.getAdshowtime++;
    if (this.getAdthetime - this.getLocaltime > 250 && this.getAdshowtime > 30) {
      Platforms_QuickGame.getInstance().OPPOHighONativeAd(1);
      this.getAdshowtime = 0;
    }

  }

  public ADTime(): number {
    let d = new Date();
    var ADTime = "2023-7-23"
    var Today = d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString();
    console.log("今日签到：" + Today);
    var dateStart: any = new Date(ADTime);
    var dateEnd: any = new Date(Today);
    // console.log("之前天数："+ lateDay + "之后天数" + nowDay);
    let difValue = (dateEnd - dateStart) / (1000 * 60 * 60 * 24);
    console.log("天数" + difValue)
    return difValue;
  }
};