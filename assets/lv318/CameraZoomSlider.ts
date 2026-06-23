/**
 * 相机缩放滑动条控制器
 * 上下拖动控制相机缩放
 */

import CameraController from "./CameraController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraZoomSlider extends cc.Component {

    @property(CameraController)
    cameraController: CameraController = null;

    @property(cc.Slider)
    slider: cc.Slider = null;

    start() {
        // 在 start 中同步，确保 CameraController._camera 已初始化
        this.syncSliderToCamera();
    }

    /** 给 cc.Slider 的 slideEvents 绑定这个回调 */
    public onSliderChanged(slider: cc.Slider) {
        if (!slider || !this.cameraController) return;
        this.cameraController.setZoom(slider.progress);
    }

    /** 同步 Slider 进度到当前缩放值 */
    private syncSliderToCamera() {
        if (!this.slider || !this.cameraController) return;
        this.slider.progress = this.cameraController.getZoomRatio();
    }
}
