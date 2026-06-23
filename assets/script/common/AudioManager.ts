import GameData from "./GameData";

export default class AudioManager {
    /**音乐ID */
    private static musicID: number = -1;

    /**音效ID */
    private static effectID: number = -1;
    public static hzAudioPath = "";
    /**音频名 */

    public static common = {
        /**首页背景音乐 */
        Hall_main3: "Hall_main3",
        Hall_main4: "Hall_main4",
        Hall_main2: "Hall_main2",
        Hall_main: "Hall_main",
        /**按键音 */
        BUTTON: "button",

        COMCLICK: "comclick",
        GZBTN: "gzbtn",
        GZWIN: "gzwin",
        GZLOST: "gzlost",
        GZZHITIAO: "gzzhitiao",
        GZZHUA: "gzzhua",
        GZGUI: "gzgui"
    }

    public static audioName = {
        /**找茬背景音乐 */
        MAIN: "main",
        /**砸墙 */
        zhaq: "zhaq",
        /**衣服 */
        clother: "clother",
        /**手机解锁 */
        phoneUnlock: "phoneUnlock",
        /**蟑螂 */
        zhanglang: "zhanglang",
        /**找到东西 */
        find: "find",
        /**挪开柜子 */
        nuokaiguizi: "nuokaiguizi",
        /**打开洗衣机  */
        openxyj: "openxyj",
        /**床头柜 */
        openchuangtou: "openchuangtou",
        /**尖叫 */
        jianjiao: "jianjiao",
        /**咸鱼 */
        xianyu: "xianyu",
        /**垃圾桶 */
        lajitong: "lajitong",
        /**插头 */
        chatou: "chatou",
        /**胜利结束 */
        endwin: "endwin",
        /**失败结束 */
        endlost: "endlost",

        //气泡配音
        /**洗衣机 */
        xiyiji1: "xiyiji1",
        /**鞋 */
        xie: "xie",
        /**鱼 */
        yu: "yu",
        /**被子 */
        beizi: "beizi",
        /**键盘 */
        jianpan: "jianpan",
        /**垃圾桶 */
        tong: "tong",
        /**墙 */
        qiang: "qiang",
        /**衣服 */
        yifu: "yifu",
        /**柜子 */
        guizi: "guizi",
        /**口袋 */
        koudai: "koudai",
        /**手机 */
        shouji1: "shouji1",
        /**大嫂结束 */
        end: "end"
    };
    public static hz_audio = {
        /**背景 */
        main_hz: "main_hz",
        /**背景 */
        button_hz: "button_hz",
        /**背景 */
        endwin_hz: "endwin",
        /**背景 */
        endlost_hz: "endlost",
        /**背景 */
        movelost_hz: "movelost_hz",
        /**背景 */
        movesucc_hz: "movesucc_hz"
    }

    public static wenzi = {
        levelSound: [
            "one",
            "two",
            "three",
            "four",
            "five",
            "six",
            "seven",
            "eight"
        ],
        main_wz: "main_wz",
        button_wz: "button_wz",
        lineLost: "lineLost",
    }

    public static gz = {
        背景: "gzmain",
        呼吸: "breath",
        通道: "td",
        灯: "light",
        刀: "dao",
        猫: "mao",
        猫粮: "maoliang",
        门: "door",
        收拾: "shoushi2",
        收拾完成: "shoushiSuc",
        失败动画: "losttween",
        鬼脸: "guilian",
    }
    public static ql_audio = {
        fire: "fire",
        cuo: "cuo",
        dui: "dui",
        finishjq: "finishjq",
        pba: "pba",
        pbb: "pbb",
        pbc: "pbc",
        pbe: "pbe",
        pbe2: "pbe2",
        pbh: "pbh",
        pbi: "pbi",
        pbj: "pbj",
        tca: "tca",
        tcb: "tcb",
        tcc: "tcc",
        tcd: "tcd",
        tce: "tce",
        tcf: "tcf",
        tcg: "tcg",
        tch: "tch",
        tci: "tci",
        tcj: "tcj",
    }

    /**音频map容器 */
    private static audioMap: Map<string, cc.AudioClip> = new Map();

    public static onInit(name: string) {
        cc.resources.loadDir(name, cc.AudioClip, (completedCount: number, totalCount: number) => {
            //  completedCount / totalCount;
        }, (err, assets: cc.AudioClip[]) => {
            assets.forEach(asset => {
                this.set(asset.name, asset);
            })
        })
    }

    /**添加音频资源 */
    public static set(key: string, value: cc.AudioClip): void {
        if (this.audioMap.has(key)) {
            // console.warn(`set fail: ${key} already exsit the audioMap`);
        } else {
            this.audioMap.set(key, value);
            // console.log(`set ${key} in the audioMap`);
        }
    }

    /**获取音频资源 */
    public static get(key: string): cc.AudioClip {
        if (this.audioMap.has(key)) {
            console.log(`get ${key} in the audioMap`);
            return this.audioMap.get(key);
        } else {
            console.warn(`get fail: ${key} not exsit in the audioMap`);
        }
    };

    /**播放背景音乐  */
    public static playMusic(key: string, bool?: boolean, volume?: number): void {
        // return
          if (!GameData.musicSwitch) return
        this.stopMusic();
        var clip: cc.AudioClip = this.audioMap.get(key);
        var m_bool: boolean = bool ? bool : true;
        var m_volume: number = volume ? volume : 1;
        if (clip != null) {
            // console.log(`play music ${key}`);
            this.musicID = cc.audioEngine.play(clip, m_bool, m_volume);
            // console.log(`this.musicID:` + this.musicID);
        }else
        {
            console.log("play music fail: " + key);
            
        }
        // else {
        //     cc.resources.load("audio/common", cc.AudioClip, () => {
        //     }, (err, clip: cc.AudioClip) => {
        //         console.log(`play music2 ${key}`);
        //         this.musicID = cc.audioEngine.play(clip, m_bool, m_volume);
        //     })
        // }
    };

    /**停止播放背景音乐 */
    public static stopMusic(): void {
         cc.audioEngine.stop(this.musicID);
        // console.log("stop music");
    };

    /**暂停播放背景音乐 */
    public static pauseMusic(): void {
        cc.audioEngine.pause(this.musicID);
        // console.log("pause music");
    };

    /**恢复播放背景音乐 */
    public static resumeMusic(): void {
        if (!GameData.musicSwitch) return
        cc.audioEngine.resume(this.musicID);
        // console.log("resume music");
    };

    /**获取当前音乐播放时间（秒） */
    public static getCurrentMusicTime(): number {
        if (this.musicID != -1) {
            try {
                return cc.audioEngine.getCurrentTime(this.musicID);
            } catch (e) {
                return 0;
            }
        }
        return 0;
    };

    // /**设置背景音乐音量（0.0 ~1.0） */
    // public static setMusicVolume(volume: number): void {
    //     cc.audioEngine.setVolume(this.musicID, volume);
    //     console.log("set music volume of " + volume);
    // };
    /**播放音效 */
    public static playEffect(key: string, bool?: boolean, call?: Function, startTime?: number): void {
        if (!GameData.effectSwitch) return
        // return
        // console.log("--播放音效--"+key);
        var clip: cc.AudioClip = this.audioMap.get(key);
        var m_bool: boolean = bool ? bool : false;
        if (clip != null) {
            // console.log(`play effect ${key}`);
            this.effectID = cc.audioEngine.playEffect(clip, m_bool);
            // 设置播放位置（单位：秒，支持小数，最小精度约0.001秒）
            if (startTime !== undefined && startTime > 0) {
                cc.audioEngine.setCurrentTime(this.effectID, startTime);
            }
            if (call) cc.audioEngine.setFinishCallback(this.effectID, call);
        }
        else{
            console.warn(`play effect fail: ${key} not exsit in the audioMap`);
        }
        // else {
        //     cc.resources.load("audio/" + key, cc.AudioClip, () => {
        //     }, (err, clip: cc.AudioClip) => {
        //         // console.log(`play effect ${key}`);
        //         this.effectID = cc.audioEngine.playEffect(clip, m_bool);
        //     })
        // console.warn(`play effect fail: ${key} not exsit in the audioMap`);
        // }
    };
    /**停止播放背景音乐 */
    public static stopEffect(): void {
        cc.audioEngine.stop(this.effectID);
        // console.log("stop music");
    };
    public static stopEffect2(): void {
        cc.audioEngine.stopAllEffects();
        // console.log("stop music");
    };

    /**设置音效音量（0.0 ~1.0） */
    public static setEffectsVolume(volume: number): void {
        cc.audioEngine.setEffectsVolume(volume);
        console.log("set effect volume of " + volume);
    };

    /**释放单个音频资源 */
    public static releaseAsset(key: string): void {
        var asset: cc.AudioClip = this.audioMap.get(key);
        if (asset) {
            this.audioMap.delete(key);
            cc.loader.release(asset);
            console.log("release asset with " + key);
        }
    };

    /**释放所有音频资源 */
    public static releaseAllAsset(): void {
        this.audioMap.clear();
        console.log("prefabMap release all");
    };
}