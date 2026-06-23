// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UISDKWindow from "../../../FrameWork/UI/Module/UIWindow_newsdk";
import InvokeConfig from "../../../Tool/InvokeConfig_newsdk";
import UISDK_Manager_newsdk from "../../../FrameWork/UI/UISDK_Manager_newsdk";
import SDK_config from "../../../SDK_config_newsdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HWPriverPolicy extends UISDKWindow {

    @property(cc.Label)
    content: cc.Label = null;

    objcb:any;

    hpcb:any;
    onOpen(obj){
        console.log('onOpen');
        this.objcb=obj;
        console.log(obj);
        let self = this;
      
    
                let winHeight = cc.winSize.height;
                let winWidth = cc.winSize.width;
                console.log("width=" + winWidth + ",height=" + winHeight);
                if (winWidth>winHeight) {
                    let prehe=winHeight*4/5;
                    let scale =prehe/self.node.getChildByName('bg').height
                    console.log(self.node.height);
                    self.node.scaleX=scale;
                    self.node.scaleY=scale;
                }else  {
                    let prehe=winWidth*4/5;
                    let scale =prehe/self.node.getChildByName('bg').width
                    self.node.scaleX=scale;
                    self.node.scaleY=scale;
                }
 
            
         
    //    this.content.string="欢迎使用"+SDK_config.GameIdConfig.huaweiID.companyName+"为您提供游戏产品《"+SDK_config.GameIdConfig.huaweiID.gameName+"》。"+"1.为了向您提供和持续优化定制化的服务，\n我们将收集和处理以下的信息：\n设备信息，包括设备标识符、MAC、机型、品牌、App包名、App版本号、设备分辨率及像素密度；\n网络信息，包括网络连接状态、接入网络的方式和类型、IP地址；\n使用信息，包括广告内容的展现、点击、下载；\n除上述信息外，我们还会收集您在本游戏的账号ID，以用来为您提供更加个性化的服务或广告。\n2.上述数据将会传输并保存至【中华人民共和国境内】的服务器，保存期限为60天，超出这一保留时间后将删除，但法律法规另有要求除外。\n我们保证不对外公开或向任何第三方提供您的个人信息，但是存在下列情形之一的除外：\n（1） 公开或提供相关信息之前获得您许可的；\n（2） 根据法律或政策的规定而公开或提供的；\n（3） 根据国家权力机关要求公开或提供的； \n如果您不同意我们采集上述信息，或不同意调用相关手机权限或功能，本软件将无法正常运行。您可通过卸载或退出本软件来终止数据收集及上传。\n4.如果您对本隐私政策和我们游戏有任何疑问和建议请通过客服邮箱：gamekf_666@sina.com联系我们，我们将尽快答复您。";
        console.log("on open");
    }
    agree(){
        console.log("agree");
      cc.sys.localStorage.setItem("usrService",true);
      this.node.active=false;
        UISDK_Manager_newsdk.getInstance().hideUI('HWPriverPolicy');
      this.objcb&&this.objcb.agreecb();
     }
    notAgree(){
        this.objcb&&this.objcb.notAgreecb();
    }
    // update (dt) {}
}
