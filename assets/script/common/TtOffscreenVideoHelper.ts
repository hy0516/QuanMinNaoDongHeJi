/**
 * 分渠道视频：
 * - 抖音/头条：`tt.createOffscreenVideo` → Texture2D → Sprite（每帧 tick 更新纹理）
 * - 快手小游戏：`ks.createVideo` 原生视频层，见 https://open.kuaishou.com/miniGameDocs/gameDev/api/media/video/createVideo.html
 * - 快游戏（OPPO / Vivo 等）：`qg.createVideo`（与 ks 共用同一套 native 分支）
 *   - OPPO：https://open.oppomobile.com/documentation/page/info?id=12577
 *   - Vivo：https://minigame.vivo.com.cn/documents/#/api/media/video
 * TT 与 lv257 一致：默认对显示节点做 scaleY 取反，修正 WebGL 纹理上下颠倒；ks/qg 路径不改 scale。
 * 使用方式：宿主 Component 的 update 里调用 tick()，onDestroy 里调用 clear()。
 */
export interface TtOffscreenVideoPlayOptions {
    /** 默认 false */
    loop?: boolean;
    /**
     * 默认 true：播放前将 displayNode.scaleY 设为 -|scaleX|，结束后恢复，与 game_wenzi_257 videonode 一致。
     * 若你的预制体已手动翻转，可设为 false。
     */
    fixUpsideDown?: boolean;
    /** 已知片长（秒），如分包资源的 duration */
    hintDurationSec?: number;
    /** 从 canplay 并成功 play 后起算，强制在此时长后结束（秒），覆盖 hint/duration */
    forceFinishAfterSec?: number;
    /** 未收到 onCanplay 的超时（秒），默认 25 */
    canplayTimeoutSec?: number;
    /** 纹理已就绪、即将 video.play() 时调用（例如暂停 BGM） */
    onVideoReady?: () => void;
}

export default class TtOffscreenVideoHelper {
    private _video: any = null;
    private _texture: cc.Texture2D = null;
    private _displayNode: cc.Node = null;
    private _savedScaleY = 1;
    private _didFixScale = false;
    private _finishScheduled: Function = null;
    private _canplayTimeoutCb: Function = null;
    /** tt：离屏纹理；native：ks.createVideo / qg.createVideo 原生覆盖层 */
    private _runtimeKind: "tt" | "native" | null = null;
    private _qgEndedFn: Function = null;
    private _qgErrorFn: Function = null;
    private _qgPlayFn: Function = null;
    private _qgTimeUpdateFn: Function = null;
    private _savedSpriteOpacity: number | null = null;
    private _spriteNodeForOpacity: cc.Node = null;

    constructor(private _owner: cc.Component) {}

    /**
     * 抖音：`tt.createOffscreenVideo`；快手：`ks.createVideo`；快游戏：`qg.createVideo`。
     */
    static isAvailable(): boolean {
        if (typeof window === "undefined") {
            return false;
        }
        const w = window as any;
        const tt = w["tt"];
        if (tt && typeof tt.createOffscreenVideo === "function") {
            return true;
        }
        return TtOffscreenVideoHelper._nativeVideoApi() != null;
    }

    private static _useTtOffscreen(): boolean {
        const w = window as any;
        return !!(w["tt"] && typeof w["tt"].createOffscreenVideo === "function");
    }

    /** 优先 ks（快手），否则 qg（OPPO/Vivo 等）；二者 API 相近，create 参数略有差异。 */
    private static _nativeVideoApi(): {
        create: (opts: any) => any;
        getSystemInfoSync?: () => any;
        isKs: boolean;
    } | null {
        const w = window as any;
        const ks = w["ks"];
        if (ks && typeof ks.createVideo === "function") {
            return {
                create: (opts: any) => ks.createVideo(opts),
                getSystemInfoSync: ks.getSystemInfoSync,
                isKs: true,
            };
        }
        const qg = w["qg"];
        if (qg && typeof qg.createVideo === "function") {
            return {
                create: (opts: any) => qg.createVideo(opts),
                getSystemInfoSync: qg.getSystemInfoSync,
                isKs: false,
            };
        }
        return null;
    }

    /**
     * 将节点世界包围盒映射为 ks.createVideo / qg.createVideo 使用的屏幕像素（左上角原点）。
     */
    private _nodeRectToNativeScreenPx(displayNode: cc.Node): { x: number; y: number; width: number; height: number } {
        const frame = cc.view.getFrameSize();
        const api = TtOffscreenVideoHelper._nativeVideoApi();
        const getSys = api && typeof api.getSystemInfoSync === "function" ? api.getSystemInfoSync : null;
        const fallback = () => {
            let sw = frame.width;
            let sh = frame.height;
            try {
                if (getSys) {
                    const info = getSys();
                    if (info && typeof info.screenWidth === "number" && info.screenWidth > 0) {
                        sw = info.screenWidth;
                    }
                    if (info && typeof info.screenHeight === "number" && info.screenHeight > 0) {
                        sh = info.screenHeight;
                    }
                }
            } catch (e) {
                /* ignore */
            }
            return { x: 0, y: 0, width: Math.max(1, sw), height: Math.max(1, sh) };
        };

        const camera = cc.Camera.main;
        if (!displayNode || !displayNode.isValid || !camera) {
            return fallback();
        }

        const box = displayNode.getBoundingBoxToWorld();
        const corners = [
            cc.v2(box.x, box.y),
            cc.v2(box.x + box.width, box.y),
            cc.v2(box.x, box.y + box.height),
            cc.v2(box.x + box.width, box.y + box.height),
        ];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < corners.length; i++) {
            const sp = camera.getWorldToScreenPoint(cc.v3(corners[i].x, corners[i].y, 0));
            minX = Math.min(minX, sp.x);
            maxX = Math.max(maxX, sp.x);
            minY = Math.min(minY, sp.y);
            maxY = Math.max(maxY, sp.y);
        }
        if (!isFinite(minX) || !isFinite(maxX)) {
            return fallback();
        }

        const vs = cc.view.getVisibleSize();
        const vo = cc.view.getVisibleOrigin();
        const scaleX = frame.width / Math.max(vs.width, 1e-6);
        const scaleY = frame.height / Math.max(vs.height, 1e-6);
        const left = (minX - vo.x) * scaleX;
        const right = (maxX - vo.x) * scaleX;
        const bottom = (minY - vo.y) * scaleY;
        const top = (maxY - vo.y) * scaleY;
        const w = Math.max(1, Math.round(right - left));
        const h = Math.max(1, Math.round(top - bottom));
        const x = Math.round(left);
        const y = Math.round(frame.height - top);
        return { x, y, width: w, height: h };
    }

    /** 是否正在播放（tt 需纹理；ks/qg 仅持有原生 Video） */
    isPlaying(): boolean {
        if (this._runtimeKind === "tt") {
            return this._video != null && this._texture != null;
        }
        if (this._runtimeKind === "native") {
            return this._video != null;
        }
        return false;
    }

    /**
     * 在带 cc.Sprite 的节点上播放（无 Sprite 会自动 addComponent）。
     * 结束回调在销毁实例、恢复 scaleY / 透明度之后调用。
     */
    playOnSpriteNode(
        displayNode: cc.Node,
        videoUrl: string,
        onComplete: () => void,
        opts?: TtOffscreenVideoPlayOptions
    ): void {
        this.clear();

        const loop = !!opts?.loop;
        const fixUpsideDown = opts?.fixUpsideDown !== false;
        const canplayTimeoutSec = typeof opts?.canplayTimeoutSec === "number" ? opts.canplayTimeoutSec : 25;

        this._displayNode = displayNode;

        let doneOnce = false;
        const finish = () => {
            if (doneOnce) return;
            doneOnce = true;
            this._unscheduleFinish();
            this._detachNativeListeners();
            this._destroyVideoAndTexture();
            if (this._savedSpriteOpacity !== null && this._spriteNodeForOpacity && this._spriteNodeForOpacity.isValid) {
                this._spriteNodeForOpacity.opacity = this._savedSpriteOpacity;
            }
            this._savedSpriteOpacity = null;
            this._spriteNodeForOpacity = null;
            if (this._didFixScale && this._displayNode && this._displayNode.isValid) {
                this._displayNode.scaleY = this._savedScaleY;
            }
            this._didFixScale = false;
            this._runtimeKind = null;
            this._displayNode = null;
            onComplete();
        };

        const scheduleFinishFromDelay = (sec: number) => {
            this._unscheduleFinish();
            const fn = () => {
                this._finishScheduled = null;
                finish();
            };
            this._finishScheduled = fn;
            this._owner.scheduleOnce(fn, Math.max(0.1, sec) + 0.35);
        };

        if (TtOffscreenVideoHelper._useTtOffscreen()) {
            this._runtimeKind = "tt";
            if (fixUpsideDown) {
                this._savedScaleY = displayNode.scaleY;
                const sx = Math.abs(displayNode.scaleX) || 1;
                displayNode.scaleY = -sx;
                this._didFixScale = true;
            }

            let sp = displayNode.getComponent(cc.Sprite);
            if (!sp) {
                sp = displayNode.addComponent(cc.Sprite);
            }

            const tt = (window as any)["tt"];
            const video = tt.createOffscreenVideo();
            this._video = video;
            video.src = videoUrl;
            video.loop = loop;
            video.autoplay = true;

            if (typeof video.onError === "function") {
                video.onError((err: any) => {
                    cc.warn("[TtOffscreenVideo] onError", err);
                    finish();
                });
            }

            let canplayFired = false;
            this._canplayTimeoutCb = () => {
                if (!canplayFired && !doneOnce) {
                    cc.warn("[TtOffscreenVideo] 长时间未 onCanplay，结束");
                    finish();
                }
                this._canplayTimeoutCb = null;
            };
            this._owner.scheduleOnce(this._canplayTimeoutCb as any, canplayTimeoutSec);

            video.onCanplay(() => {
                if (!this._owner.isValid) return;
                canplayFired = true;
                if (this._canplayTimeoutCb && this._owner.isValid) {
                    this._owner.unschedule(this._canplayTimeoutCb as any);
                    this._canplayTimeoutCb = null;
                }

                this._texture = new cc.Texture2D();
                this._texture.initWithElement(video);
                this._texture.handleLoadedTexture();
                this._texture.width = displayNode.width;
                this._texture.height = displayNode.height;
                sp.spriteFrame = new cc.SpriteFrame(this._texture);
                if (opts?.onVideoReady) {
                    opts.onVideoReady();
                }
                video.play();

                let delaySec: number;
                if (typeof opts?.forceFinishAfterSec === "number" && opts.forceFinishAfterSec > 0) {
                    delaySec = opts.forceFinishAfterSec;
                } else {
                    let hint = opts?.hintDurationSec;
                    if (typeof hint !== "number" || hint <= 0) {
                        const vd = typeof video.duration === "number" ? video.duration : 0;
                        hint = vd > 0 ? vd : 12;
                    }
                    delaySec = hint;
                }
                scheduleFinishFromDelay(delaySec);
            });

            if (typeof video.onEnded === "function") {
                video.onEnded(() => finish());
            }
            return;
        }

        const nativeApi = TtOffscreenVideoHelper._nativeVideoApi();
        if (nativeApi) {
            this._runtimeKind = "native";
            const spHide = displayNode.getComponent(cc.Sprite);
            if (spHide && spHide.node) {
                this._spriteNodeForOpacity = spHide.node;
                this._savedSpriteOpacity = spHide.node.opacity;
                spHide.node.opacity = 0;
            }

            const rect = this._nodeRectToNativeScreenPx(displayNode);
            const createOpts: any = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                src: videoUrl,
                autoplay: false,
                loop: loop,
                objectFit: "contain",
                muted: false,
                underGameView: false,
            };
            if (!nativeApi.isKs) {
                createOpts.controls = false;
                createOpts.showProgress = false;
                createOpts.showCenterPlayBtn = false;
            }
            const video = nativeApi.create(createOpts);
            this._video = video;

            let playFired = false;
            this._canplayTimeoutCb = () => {
                if (!playFired && !doneOnce) {
                    cc.warn("[TtOffscreenVideo] native(ks/qg) 长时间未 onPlay，结束");
                    finish();
                }
                this._canplayTimeoutCb = null;
            };
            this._owner.scheduleOnce(this._canplayTimeoutCb as any, canplayTimeoutSec);

            let scheduledDuration = false;
            const tryScheduleByDuration = (durSec: number) => {
                if (scheduledDuration || doneOnce) return;
                if (typeof durSec !== "number" || durSec <= 0) return;
                scheduledDuration = true;
                let delaySec: number;
                if (typeof opts?.forceFinishAfterSec === "number" && opts.forceFinishAfterSec > 0) {
                    delaySec = opts.forceFinishAfterSec;
                } else {
                    let hint = opts?.hintDurationSec;
                    if (typeof hint !== "number" || hint <= 0) {
                        hint = durSec;
                    }
                    delaySec = hint;
                }
                scheduleFinishFromDelay(delaySec);
            };

            this._qgEndedFn = () => {
                this._finishScheduled = null;
                finish();
            };
            this._qgErrorFn = (err: any) => {
                cc.warn("[TtOffscreenVideo] native onError", err);
                finish();
            };
            this._qgPlayFn = () => {
                if (!this._owner.isValid) return;
                playFired = true;
                if (this._canplayTimeoutCb && this._owner.isValid) {
                    this._owner.unschedule(this._canplayTimeoutCb as any);
                    this._canplayTimeoutCb = null;
                }
                if (opts?.onVideoReady) {
                    opts.onVideoReady();
                }
                this._owner.scheduleOnce(() => {
                    if (!this._owner.isValid || doneOnce || scheduledDuration || this._runtimeKind !== "native" || !this._video) {
                        return;
                    }
                    let hint = opts?.hintDurationSec;
                    if (typeof hint !== "number" || hint <= 0) {
                        hint = 12;
                    }
                    tryScheduleByDuration(hint);
                }, 0.55);
            };
            this._qgTimeUpdateFn = (res: any) => {
                if (scheduledDuration || doneOnce) return;
                const d = res && typeof res.duration === "number" ? res.duration : 0;
                if (d > 0) {
                    tryScheduleByDuration(d);
                }
            };

            if (typeof video.onEnded === "function") {
                video.onEnded(this._qgEndedFn);
            }
            if (typeof video.onError === "function") {
                video.onError(this._qgErrorFn);
            }
            if (typeof video.onPlay === "function") {
                video.onPlay(this._qgPlayFn);
            }
            if (typeof video.onTimeUpdate === "function") {
                video.onTimeUpdate(this._qgTimeUpdateFn);
            }

            const p = video.play && video.play();
            if (p && typeof p.then === "function") {
                p.catch(() => finish());
            }
            return;
        }

        cc.warn("[TtOffscreenVideo] 当前环境不支持 tt.createOffscreenVideo / ks.createVideo / qg.createVideo");
        this._owner.scheduleOnce(finish, 0);
    }

    private _detachNativeListeners(): void {
        if (this._runtimeKind !== "native" || !this._video) {
            this._qgEndedFn = null;
            this._qgErrorFn = null;
            this._qgPlayFn = null;
            this._qgTimeUpdateFn = null;
            return;
        }
        const v = this._video;
        try {
            if (this._qgEndedFn && typeof v.offEnded === "function") {
                v.offEnded(this._qgEndedFn);
            }
            if (this._qgErrorFn && typeof v.offError === "function") {
                v.offError(this._qgErrorFn);
            }
            if (this._qgPlayFn && typeof v.offPlay === "function") {
                v.offPlay(this._qgPlayFn);
            }
            if (this._qgTimeUpdateFn && typeof v.offTimeUpdate === "function") {
                v.offTimeUpdate(this._qgTimeUpdateFn);
            }
        } catch (e) {
            /* ignore */
        }
        this._qgEndedFn = null;
        this._qgErrorFn = null;
        this._qgPlayFn = null;
        this._qgTimeUpdateFn = null;
    }

    /** 宿主 Component.update 中调用 */
    tick(): void {
        if (this._runtimeKind !== "tt" || !this._video || !this._texture) return;
        this._texture.update({
            image: this._video,
            genMipmaps: false,
            format: cc.Texture2D.PixelFormat.RGBA8888,
            minFilter: cc.Texture2D.Filter.LINEAR,
            magFilter: cc.Texture2D.Filter.LINEAR,
            // NPOT 视频纹理在 WebGL1 下仅支持 CLAMP，避免黄字 "doesn't support all wrap modes with NPOT"
            // creator.d.ts 将 update 的 wrap 误标为动画用 cc.WrapMode，运行时用 Texture2D.WrapMode 即可
            wrapS: cc.Texture2D.WrapMode.CLAMP_TO_EDGE as any,
            wrapT: cc.Texture2D.WrapMode.CLAMP_TO_EDGE as any,
            premultiplyAlpha: false,
        });
    }

    /** 场景/组件销毁时调用 */
    clear(): void {
        this._unscheduleFinish();
        if (this._canplayTimeoutCb && this._owner && this._owner.isValid) {
            this._owner.unschedule(this._canplayTimeoutCb as any);
        }
        this._canplayTimeoutCb = null;
        if (this._savedSpriteOpacity !== null && this._spriteNodeForOpacity && this._spriteNodeForOpacity.isValid) {
            this._spriteNodeForOpacity.opacity = this._savedSpriteOpacity;
        }
        this._savedSpriteOpacity = null;
        this._spriteNodeForOpacity = null;
        if (this._didFixScale && this._displayNode && this._displayNode.isValid) {
            this._displayNode.scaleY = this._savedScaleY;
        }
        this._didFixScale = false;
        this._savedScaleY = 1;
        this._displayNode = null;
        this._detachNativeListeners();
        this._destroyVideoAndTexture();
        this._runtimeKind = null;
    }

    private _unscheduleFinish(): void {
        if (this._finishScheduled && this._owner && this._owner.isValid) {
            this._owner.unschedule(this._finishScheduled as any);
        }
        this._finishScheduled = null;
    }

    private _destroyVideoAndTexture(): void {
        if (this._video) {
            try {
                this._video.destroy();
            } catch (e) {
                /* ignore */
            }
            this._video = null;
        }
        this._texture = null;
    }
}
