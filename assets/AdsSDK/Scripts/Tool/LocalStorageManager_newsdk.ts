// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class LocalStorageManager  {

    public static getStorageKeyValue(key:string,value:string){
        let va=cc.sys.localStorage.getItem(key);
        console.log("getStorageKeyValue:"+key+":"+va);
        if (va) {
            return va;
        }
        return value;
    }

    public static setStorageKeyValue(key:string,value:string){
        cc.sys.localStorage.setItem(key, value); 
    }
    public  SaveNowDate(): void{
        //保存一下本次打开时间
        let d = new Date();
        var lateTime = d.getFullYear().toString() + "-" +  (d.getMonth()+1).toString() + "-" + d.getDate().toString();
        console.log("第一次打开游戏："+lateTime);
        LocalStorageManager.setStorageKeyValue("lateTime",lateTime);
      }
  
      public GetIntervalDate(): number{
        let lateDay =  LocalStorageManager.getStorageKeyValue("lateTime",'null');
        let d2 = new Date();
        let nowDay =   d2.getFullYear().toString() + "-" +  (d2.getMonth()+1).toString() + "-" +  d2.getDate().toString(); 
        var dateStart: any = new Date(lateDay);
        var dateEnd: any = new Date(nowDay);       
        // console.log("之前天数："+ lateDay + "之后天数" + nowDay);
        let difValue = (dateEnd - dateStart) / (1000 * 60 * 60 * 24) ;  
        // console.log("间隔："+difValue);
        return difValue;
 
      }
      public  SetTime(): void{
        let settime = LocalStorageManager.getStorageKeyValue("lateTime",'null')
        if(settime=='null'){
            LocalStorageManager.prototype.SaveNowDate();

        }else{
            console.log("日期已经保存了");
        }
      }

      public  ADTime(): number{
        let d = new Date();
        var ADTime ="2023-6-16"
        var Today = d.getFullYear().toString() + "-" +  (d.getMonth()+1).toString() + "-" + d.getDate().toString();
        console.log("今日签到："+Today);
        var dateStart: any = new Date(ADTime);
        var dateEnd: any = new Date(Today);       
        // console.log("之前天数："+ lateDay + "之后天数" + nowDay);
        let difValue = (dateEnd - dateStart) / (1000 * 60 * 60 * 24) ;  
        console.log("天数"+difValue)
        return difValue;
      }
      
}
