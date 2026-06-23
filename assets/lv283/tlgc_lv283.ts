import AssetManager from "../script/common/AssetManager";
import AudioManager from "../script/common/AudioManager";
import BaseGame from "../script/common/BaseGame";
import GameData from "../script/common/GameData";
import VideoManager from "../script/common/VideoManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class tlgc_lv283 extends BaseGame {
    @property(cc.Node)
    tc: cc.Node = null;
    @property(cc.Node)
    btn: cc.Node = null;
    @property(cc.Node)
    bb_ske: cc.Node = null;
    @property(cc.Node)
    ml_ske: cc.Node = null;
    @property(cc.Node)
    lm_ske: cc.Node = null;
    @property(cc.Node)
    light: cc.Node = null;
    @property(cc.Node)
    yan: cc.Node = null;
    @property(cc.Node)
    xin: cc.Node = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    zhi: cc.Node = null;
    @property(cc.Node)
    lost: cc.Node = null;

    bbsk: dragonBones.ArmatureDisplay;
    mlsk: dragonBones.ArmatureDisplay;
    lmsk: dragonBones.ArmatureDisplay;
    yansk: dragonBones.ArmatureDisplay;

    zs: number = 0;
    choose1: number = 0;
    choose2: number = 0;
    target1: number = 0;
    target2: number = 0;
    heart: number = 3;

    canjiaohu: boolean = false;
    lv: number = 0;

    // 选对状态锁：标记是否处于选对后的动画/音频播放阶段
    private isCorrecting: boolean = false;
    // 点击防抖锁，防止快速重复点击
    private isBtnClicking: boolean = false;

    // 教学关卡相关变量
    /** 是否为教学关卡（第一关） */
    private isTeachingLevel: boolean = false;
    /** 教学关卡中是否已点击btn_2（原btn_1） */
    private hasClickedBtn2: boolean = false;

    // 文字填充数组
    tcArray: string[][] = [
        ["一", "", "不", ""],
        ["南", "北", "", ""],
        ["真", "", "假", ""],
        ["", "", "香", "菇"],
        ["", "龙", "", "狼"],
        ["", "子", "", "菜"],
        ["乱", "", "", "子"],
        ["", "", "之", "徒"],
        ["", "鸡", "", "舞"],
        ["", "驴", "", "穷"],
        ["", "", "人", "士"],
        ["耗", "子", "", ""],
        ["", "强", "人", ""],
        ["雨", "", "无", ""],
        ["勇", "敢", "", ""],
        ["", "", "点", "雪"],
        ["真", "", "", "律"],
        ["", "开", "", "人"],
        ["", "章", "", "句"],
        ["", "月", "", "花"],
        ["", "", "鱼", "肉"],
        ["", "对", "", "对"],
        ["遥", "", "", "先"],
        ["漱", "", "枕", ""],
        ["提", "", "", "路"],
        ["", "", "弹", "琴"],
        ["冰", "", "雪", ""],
        ["", "", "邻", "居"],
        ["", "鹑", "", "结"],
        ["", "味", "", "足"],
    ];

    // 目标答案索引数组
    tgArray: number[][] = [
        [1, 7],
        [3, 5],
        [0, 6],
        [7, 9],
        [3, 1],
        [8, 6],
        [6, 11],
        [0, 1],
        [0, 4],
        [2, 11],
        [8, 3],
        [4, 8],
        [4, 7],
        [7, 9],
        [4, 11],
        [10, 8],
        [1, 3],
        [6, 3],
        [0, 1],
        [0, 11],
        [3, 5],
        [8, 0],
        [4, 1],
        [8, 6],
        [6, 9],
        [0, 11],
        [3, 10],
        [4, 1],
        [11, 1],
        [0, 10],
    ];

    // 可选文字数组
    zArray: string[][] = [
        ["可", "言", "毛", "拔", "说", "话", "金", "发", "动", "笑", "走", "跳"],
        ["东", "水", "西", "绿", "话", "豆", "话", "雨", "对", "战", "一", "夜"],
        ["嘟", "金", "情", "意", "秃", "抓", "嘟", "发", "银", "话", "白", "黑"],
        ["炖", "鲜", "烤", "嫩", "鸡", "鸭", "一", "蓝", "朵", "瘦", "吃", "味"],
        ["如", "扛", "似", "恐", "擒", "套", "缚", "跑", "游", "逛", "买", "卖"],
        ["丸", "好", "老", "儿", "吃", "真", "榨", "男", "电", "女", "仔", "婚"],
        ["生", "捅", "嫂", "抠", "抠", "打", "臣", "来", "抱", "鼻", "儿", "贼"],
        ["无", "名", "好", "色", "酒", "肉", "登", "徒", "市", "井", "流", "氓"],
        ["闻", "赶", "尬", "跳", "起", "杀", "公", "母", "早", "晚", "歌", "跳"],
        ["骑", "有", "黔", "找", "驴", "马", "山", "水", "才", "能", "无", "技"],
        ["专", "权", "杰", "雅", "个", "不", "是", "一", "高", "威", "出", "业"],
        ["过", "偷", "街", "油", "尾", "大", "好", "巴", "汁", "液", "出", "门"],
        ["非", "常", "勉", "十", "差", "分", "逼", "意", "迫", "屈", "生", "超"],
        ["水", "无", "味", "天", "伞", "下", "风", "女", "哭", "瓜", "人", "泪"],
        ["担", "无", "当", "敌", "牛", "饭", "的", "女", "高", "干", "人", "牛"],
        ["蜡", "门", "蜓", "前", "点", "一", "蜜", "瓜", "炉", "瓜", "红", "饭"],
        ["甜", "香", "酸", "定", "苦", "辣", "鲜", "假", "咸", "醇", "甘", "爽"],
        ["团", "五", "闪", "仙", "分", "两", "秒", "开", "双", "单", "故", "美"],
        ["断", "摘", "截", "取", "寻", "章", "摘", "句", "撕", "书", "找", "词"],
        ["闭", "梅", "冬", "落", "掩", "遮", "二", "翠", "藏", "望", "避", "羞"],
        ["百", "姓", "万", "自", "红", "相", "烧", "瓜", "肉", "鸡", "鲜", "新"],
        ["对", "针", "相", "一", "男", "两", "女", "不", "啊", "不", "双", "成"],
        ["头", "领", "望", "杆", "遥", "远", "率", "见", "控", "篮", "首", "歌"],
        ["泉", "木", "风", "霜", "月", "露", "流", "川", "石", "雾", "冰", "雪"],
        ["箱", "囊", "袋", "而", "疾", "步", "桶", "飞", "奔", "跑", "逃", "追"],
        ["对", "不", "我", "会", "想", "给", "一", "起", "乱", "胡", "木", "牛"],
        ["清", "玉", "壶", "瓯", "肌", "骨", "心", "肠", "聪", "明", "椀", "宫"],
        ["好", "博", "友", "近", "赛", "远", "芳", "老", "隔", "壁", "善", "里"],
        ["衣", "百", "衫", "褛", "破", "旧", "落", "魄", "穷", "困", "鹑", "悬"],
        ["班", "人", "情", "风", "韵", "古", "书", "臭", "烟", "火", "十", "分"],
    ];

    // 循环音频1（关卡提示）
    xunhuan1: string[] = [
        "一x不x",
        "南北xx",
        "真x假x",
        "xx香菇",
        "x龙x狼",
        "x子x菜",
        "乱xx子",
        "xx之徒",
        "x鸡x舞",
        "x驴x穷",
        "xx人士",
        "耗子xx",
        "x强人x",
        "雨x无x",
        "勇敢xx",
        "xx点雪",
        "真xx律",
        "x开x人",
        "x章x句",
        "x月x花",
        "xx鱼肉",
        "x对x对",
        "遥xx先",
        "漱x枕x",
        "提xx路",
        "xx弹琴",
        "冰x雪x",
        "xx邻居",
        "x鹑x结",
        "x味x足",
    ];

    // 循环音频2（通用提示）
    xunhuan2: string[] = [
        "认真看，仔细想，选对就能上金榜！",
        "做题千万道，审题第一条！",
        "大哥大哥帮帮忙，这题答案是个啥？",
        "这道题！是块宝！大小考试少不了！",
        "先看字，后想词"
    ];

    // 选对提示音频文本
    true1: string[] = [
        "答得好，选得妙，你的智商真闪耀",
        "一字不差！一词不错！你这水平真阔绰！",
        "泰酷辣！泰酷辣！",
        "对！对！对！就是这么的到位！"
    ];

    // 选对答案文本
    true2: string[] = [
        "一言不发", "南北绿豆", "真嘟假嘟", "蓝瘦香菇",
        "恐龙扛狼", "电子榨菜", "乱臣贼子", "无名之徒",
        "闻鸡起舞", "黔驴技穷", "高雅人士", "耗子尾汁",
        "差强人意", "雨女无瓜", "勇敢牛牛", "红炉点雪",
        "真香定律", "秒开仙人", "断章摘句", "闭月羞花",
        "自相鱼肉", "啊对对对", "遥遥领先", "漱石枕流",
        "提桶跑路", "对牛弹琴", "冰瓯雪椀", "赛博邻居",
        "悬鹑百结", "班味十足",
    ];

    // 选错提示音频文本
    false1: string[] = [
        "不对！不对！",
        "先别瞎蒙，排除法用起来！",
    ];

    // 答案解释文本
    lbstring: string[] = [
        "解释：形容沉默不语的状态",
        "解释：此词来自哈基米的热歌中的一句歌词",
        "解释：形容真的假的的谐网络音梗",
        "解释：源自网络一小伙用方言口音说“难受想哭”，发音被听成“蓝瘦香菇",
        "解释：源自云南方言拟声词“空隆抗朗",
        "解释：电子榨菜”指吃饭时观看的短视频、剧集等娱乐内容",
        "解释：指叛逆作乱的人",
        "解释：通常指社会中的小人物或普通角色",
        "解释：胸怀远大志向，并为之奋发图强",
        "解释：有限的本领已经全部用完",
        "解释：高雅人士”这个梗源于网友用《明月几时有》配乐制作的魔性跳舞视频",
        "解释：“耗子尾汁”是成语“好自为之”的方言谐音梗",
        "解释：大体上还能使人满意",
        "解释：“雨女无瓜”是“与你无关”的谐音梗",
        "解释：“勇敢牛牛，不怕困难”这个梗最早出自网友的一张表情包",
        "解释：比喻人‌领悟极快，一点就通",
        "解释：嘴上说不要，身体却很诚实，最后自己打脸的意思",
        "解释：用夸张手法表现角色瞬间切换状态",
        "解释：割裂文章，摘取句子。",
        "解释：形容女子美到让月亮躲起来、让花儿自愧不如，常用来夸人颜值超高",
        "解释：比喻内部互相残害",
        "解释：表面敷衍、实际带点不耐烦的同意",
        "解释：调侃或夸赞某个人或事物特别突出",
        "解释：实指隐居山林、磨砺心志的清高生活",
        "解释：指快决断的离职或脱离现状的方式",
        "解释：比喻对不懂道理的人讲道理",
        "解释：质地纯净的洗涤毛笔的工具",
        "解释：彼此熟悉但从未线下见过面的网友关系",
        "解释：形容衣衫破烂不堪",
        "解释：形容打工人特有的疲惫气质",
    ];

    // 音频控制参数
    private audioCtrl = {
        playing: false,       // 是否有音频正在播放
        isXunhuan1: true,     // 当前播放xunhuan1还是xunhuan2
        xh2Idx: 0,            // xunhuan2的播放索引
        nextSnap: 0           // 下一个卡点时间（毫秒）
    };

    // 音频卡点配置
    private readonly SNAP_INTERVAL = 500;   // 0.5秒卡点间隔
    private readonly AUDIO_GAP = 1000;     // 音频切换1秒间隔
    private readonly AUDIO_DUR = 2;        // 音频播放时长（秒）

    onLoad() {
        GameData.PauseGame = false;
        AudioManager.stopMusic();
        // 延迟播放背景音乐（如需启用可取消注释）
        // this.scheduleOnce(() => {
        //     AudioManager.playMusic(`bgmlv283`);
        // }, 0.5)
        // 获取骨骼动画组件
        this.bbsk = this.bb_ske.getComponent(dragonBones.ArmatureDisplay);
        this.mlsk = this.ml_ske.getComponent(dragonBones.ArmatureDisplay);
        this.lmsk = this.lm_ske.getComponent(dragonBones.ArmatureDisplay);
        this.yansk = this.yan.getComponent(dragonBones.ArmatureDisplay);
        // 启动关卡
        this.lvgame();
    }

    update() {
        // 选对阶段/音频播放中/游戏暂停时，屏蔽循环音频
        if (GameData.PauseGame || this.audioCtrl.playing || this.isCorrecting || this.lost.active) return;
        const now = performance.now();
        // 严格卡点：仅在50ms窗口内触发，防止帧延迟重复播放
        if (now >= this.audioCtrl.nextSnap && now < this.audioCtrl.nextSnap + 50) {
            this.playAudio();
        }
    }

    /** 计算下一个卡点时间（按0.5秒整数倍） */
    private calcSnapTime(now: number): number {
        return Math.ceil(now / this.SNAP_INTERVAL) * this.SNAP_INTERVAL;
    }

    /** 播放循环音频 */
    private playAudio() {
        this.audioCtrl.playing = true;
        // 获取当前要播放的音频名称
        const audioName = this.audioCtrl.isXunhuan1
            ? this.xunhuan1[Math.min(this.lv - 1, this.xunhuan1.length - 1)]
            : this.xunhuan2[this.audioCtrl.xh2Idx];

        // 播放音频
        AudioManager.playEffect(audioName);

        // 音频播放后处理：索引自增、卡点计算、阶段切换
        this.scheduleOnce(() => {
            // xunhuan2索引循环自增
            if (!this.audioCtrl.isXunhuan1) this.audioCtrl.xh2Idx = (this.audioCtrl.xh2Idx + 1) % this.xunhuan2.length;
            // 计算下一个卡点时间
            this.audioCtrl.nextSnap = this.calcSnapTime(performance.now() + this.AUDIO_GAP);
            // 重置播放状态
            this.audioCtrl.playing = false;
            this.audioCtrl.isXunhuan1 = !this.audioCtrl.isXunhuan1;
        }, this.AUDIO_DUR);
    }

    onDestroy() {
        // 销毁时取消所有调度器
        this.unscheduleAllCallbacks();
    }

    /** 初始化/切换关卡 */
    lvgame() {
        this.canjiaohu = true;
        this.isBtnClicking = false;
        this.lv++;
        this.zs = 0;
        this.target1 = 0;
        this.target2 = 0;

        // 初始化教学关卡状态：第一关为教学关
        this.isTeachingLevel = this.lv === 1;
        this.hasClickedBtn2 = false; // 重置btn_2点击状态

        // 刷新界面
        this.flash();
        this.scheduleOnce(() => {
            const nextSnap = this.calcSnapTime(performance.now() + 500);
            this.audioCtrl = { playing: false, isXunhuan1: true, xh2Idx: 0, nextSnap };
            AudioManager.stopEffect2();
        }, 0.5);
    }

    /** 通用按钮点击处理（关闭、提示） */
    BtnHandler(even: cc.Event.EventTouch) {
        if (GameData.PauseGame) return;
        AudioManager.playEffect(AudioManager.common.BUTTON);
        switch (even.currentTarget.name) {
            case "btn_close":
                this.openpausePanel();
                break;
            case "btn_tips":
                VideoManager.getInstance().showVideo(() => {
                    this.showTips();
                })
                break;
        }
    }

    /** 刷新关卡界面（文字、按钮状态） */
    flash() {
        this.tc.opacity = 255;

        // 刷新填充文字节点
        for (let i = 1; i <= 4; i++) {
            let b = this.tc.getChildByName(`${i}`);
            const label = b.getChildByName("z").getComponent(cc.Label);
            label.string = this.tcArray[this.lv - 1][i - 1];

            b.opacity = 0;
            b.scale = 0.7;
            // 果冻回弹动画：依次淡入+缩放
            cc.tween(b)
                .delay((i - 1) * 0.1)
                .to(0.15, { opacity: 255, scale: 1.1 })
                .to(0.08, { scale: 0.95 })
                .to(0.07, { scale: 1 })
                .start();

            // 记录需要填充的目标位置
            if (this.tcArray[this.lv - 1][i - 1] === "") {
                if (this.target1 === 0) this.target1 = i;
                else if (this.target2 === 0) this.target2 = i;
            }
        }

        // 刷新可选按钮节点
        for (let i = 1; i <= 12; i++) {
            let b = this.btn.getChildByName(`btn_${i}`);
            b.getChildByName("z").getComponent(cc.Label).string = this.zArray[this.lv - 1][i - 1];

            // 教学关卡：仅允许btn_2和btn_8可点击，其他按钮灰化禁用
            if (this.isTeachingLevel) {
                if (i !== 2 && i !== 8) {
                    b.opacity = 120;
                    b.getComponent(cc.Button).interactable = false;
                } else {
                    b.opacity = 255;
                    b.getComponent(cc.Button).interactable = true;
                }
            } else {
                // 非教学关恢复所有按钮正常状态
                b.opacity = 255;
                b.getComponent(cc.Button).interactable = true;
            }
        }
    }

    /** 可选按钮点击处理（文字选择） */
    btnChoose(event: cc.Event.EventTouch) {
        // 多重状态锁拦截：暂停/不可交互/防抖/选对动画中，均不响应
        if (GameData.PauseGame || !this.canjiaohu || this.isBtnClicking || this.isCorrecting) {
            return;
        }

        // 开启防抖锁
        this.isBtnClicking = true;

        // 教学关卡点击逻辑限制
        if (this.isTeachingLevel) {
            const btnName = event.currentTarget.name;
            // 点击btn_2：标记已点击，显示步骤提示
            if (btnName === "btn_2") {
                this.hasClickedBtn2 = true;
                this.zhi.getChildByName("1").active = false;
                this.zhi.getChildByName("2").active = true;
            }
            // 点击btn_8：必须先点btn_2，否则拦截
            else if (btnName === "btn_8" && !this.hasClickedBtn2) {
                this.isBtnClicking = false;
                return;
            }
            // 点击btn_8：隐藏步骤提示
            else if (btnName === "btn_8") {
                this.zhi.getChildByName("2").active = false;
            }
        }

        // 播放选字音效
        AudioManager.playEffect(`文字填框`);
        // 获取点击的按钮编号
        let btn = event.currentTarget.name;
        const [, btnNumStr] = btn.match(/^btn_(\d+)$/) || [];
        const btnNum = btnNumStr ? parseInt(btnNumStr, 10) : 0;

        // 计数选字次数
        this.zs++;
        const scnode = event.currentTarget;

        // 第一次选字：填充第一个目标位置
        if (this.zs === 1) {
            this.choose1 = btnNum - 1;
            const tgnode = this.tc.getChildByName(`${this.target1}`);
            this.flyTarget(scnode, tgnode, () => {
                this.tc.getChildByName(`${this.target1}`).getChildByName("z").getComponent(cc.Label).string = this.zArray[this.lv - 1][btnNum - 1];
                // 释放防抖锁
                this.isBtnClicking = false;
            });
        }
        // 第二次选字：填充第二个目标位置，判断答案对错
        else if (this.zs === 2) {
            this.choose2 = btnNum - 1;
            const tgnode = this.tc.getChildByName(`${this.target2}`);
            this.flyTarget(scnode, tgnode, () => {
                // 停止当前循环音频
                AudioManager.stopEffect2();
                this.isCorrecting = true;
                // 填充第二个目标位置文字
                this.tc.getChildByName(`${this.target2}`).getChildByName("z").getComponent(cc.Label).string = this.zArray[this.lv - 1][btnNum - 1];

                // 判断答案是否正确：第三关支持顺序颠倒，其他关卡严格按顺序
                const [tg0, tg1] = this.tgArray[this.lv - 1];
                let isCorrect = false;
                if (this.lv === 3 || this.lv === 15) {
                    isCorrect = (this.choose1 === tg0 && this.choose2 === tg1) || (this.choose1 === tg1 && this.choose2 === tg0);
                } else {
                    isCorrect = this.choose1 === tg0 && this.choose2 === tg1;
                }

                // 选对：播放成功动画
                if (isCorrect) {
                    this.trueAnime();
                }
                // 选错：扣血+重置文字
                else {
                    this.loseHP();
                    this.bbsk.playAnimation("bb_3", 0);
                    this.mlsk.playAnimation("ml_3", 0);
                    this.lmsk.playAnimation("lm_3", 0);

                    // 获取正确答案索引
                    const correct1 = this.tgArray[this.lv - 1][0];
                    const correct2 = this.tgArray[this.lv - 1][1];
                    // 获取填充文字节点
                    const node1 = this.tc.getChildByName(`${this.target1}`).getChildByName("z");
                    const node2 = this.tc.getChildByName(`${this.target2}`).getChildByName("z");

                    if (this.choose1 !== correct1) {
                        node1.color = cc.Color.RED;
                        cc.tween(node1)
                            .repeat(3, cc.tween().to(0.2, { opacity: 100 }).to(0.2, { opacity: 255 }))
                            .start();
                    }
                    if (this.choose2 !== correct2) {
                        node2.color = cc.Color.RED;
                        cc.tween(node2)
                            .repeat(3, cc.tween().to(0.2, { opacity: 100 }).to(0.2, { opacity: 255 }))
                            .start();
                    }

                    if (this.heart === 0) return;
                    // 延迟重置界面
                    this.scheduleOnce(() => {
                        // 恢复按钮显示
                        this.btn.getChildByName(`btn_${this.choose1 + 1}`).active = true;
                        this.btn.getChildByName(`btn_${this.choose2 + 1}`).active = true;
                        // 清空填充文字
                        this.tc.getChildByName(`${this.target1}`).getChildByName("z").getComponent(cc.Label).string = "";
                        this.tc.getChildByName(`${this.target2}`).getChildByName("z").getComponent(cc.Label).string = "";
                        node1.color = cc.Color.BLACK;
                        node2.color = cc.Color.BLACK;

                        this.bbsk.playAnimation("bb", 0);
                        this.mlsk.playAnimation("ml", 0);
                        this.lmsk.playAnimation("lm", 0);

                        // 恢复文字颜色
                        // 重置选字计数
                        this.zs = 0;
                        // 隐藏提示
                        this.hideTips();

                        // 教学关卡选错：重置btn_2点击状态
                        if (this.isTeachingLevel) {
                            this.hasClickedBtn2 = false;
                            // 恢复教学关卡的步骤提示
                            this.zhi.getChildByName("1").active = true;
                            this.zhi.getChildByName("2").active = false;
                        }

                        // 【修复1】提前释放防抖锁，避免连续点击拦截
                        this.isBtnClicking = false;
                        // 【修复2】重置音频卡点时间，确保循环音频继续触发
                        this.audioCtrl.nextSnap = this.calcSnapTime(performance.now() + this.SNAP_INTERVAL);
                        this.audioCtrl.playing = false; // 强制重置音频播放状态

                        // 【关键修复】选错后释放isCorrecting锁，避免循环音频永久被屏蔽
                        this.isCorrecting = false;
                    }, 2);

                }
            });
        }
    }

    /** 选对后的成功动画 */
    trueAnime() {
        // 播放答案音效
        AudioManager.stopEffect2();
        this.scheduleOnce(() => {
            AudioManager.playEffect(this.true2[this.lv - 1]);
        }, 0.1);
        // 播放文字动画
        this.tcAnime();
        // 播放骨骼动画
        this.bbsk.playAnimation("bb_2", 0);
        this.mlsk.playAnimation("ml_2", 0);
        this.lmsk.playAnimation("lm_2", 0);
        // 显示光效
        this.light.active = true;
        // 播放成功提示音效
        this.scheduleOnce(() => {
            AudioManager.playEffect(this.true1[Math.floor(Math.random() * this.true1.length)]);
        }, 2.1);
        // 重置状态+切换关卡
        this.scheduleOnce(() => {
            // 恢复骨骼动画默认状态
            this.bbsk.playAnimation("bb", 0);
            this.mlsk.playAnimation("ml", 0);
            this.lmsk.playAnimation("lm", 0);
            // 隐藏光效
            this.light.active = false;
            // 恢复按钮显示
            this.btn.getChildByName(`btn_${this.choose1 + 1}`).active = true;
            this.btn.getChildByName(`btn_${this.choose2 + 1}`).active = true;
            // 隐藏提示
            this.hideTips();
            // 释放选对状态锁
            this.isCorrecting = false;
            // 释放防抖锁
            this.isBtnClicking = false;

            // 关卡完成判断：10关全部完成则胜利，否则进入下一关
            if (this.lv >= 30) {
                this.onwin();
            } else {
                AudioManager.playEffect(`新题文字出现`);
                this.lvgame();
            }
        }, 5);
    }

    /** 文字填充后的动画 */
    tcAnime(callback?: () => void) {
        const tc = this.tc;
        const child1 = tc.getChildByName("1");
        const child2 = tc.getChildByName("2");
        const child3 = tc.getChildByName("3");
        const child4 = tc.getChildByName("4");

        cc.tween(tc)
            .to(0.3, { y: tc.y + 100 })
            .call(() => {
                // 显示答案解释
                this.label.node.active = true;
                this.label.string = this.lbstring[this.lv - 1];
            })
            .delay(3)
            .call(() => {
                // 文字分散动画
                cc.tween(child1).to(0.2, { x: child1.x - 20 }).start();
                cc.tween(child2).to(0.2, { x: child2.x - 10 }).start();
                cc.tween(child3).to(0.2, { x: child3.x + 10 }).start();
                cc.tween(child4).to(0.2, { x: child4.x + 20 }).start();
            })
            .delay(0.2)
            .call(() => {
                // 文字飞散动画
                cc.tween(child1).to(0.2, { x: child1.x + 40 }).start();
                cc.tween(child2).to(0.2, { x: child2.x + 20 }).start();
                cc.tween(child3).to(0.2, { x: child3.x - 20 }).start();
                cc.tween(child4).to(0.2, { x: child4.x - 40 }).start();
            })
            .delay(0.2)
            .call(() => {
                // 隐藏解释，播放消失音效
                this.label.node.active = false;
                AudioManager.playEffect(`答对消失`);
                // 显示烟雾动画
                this.yan.active = true;
                this.yansk.playAnimation("yan", 1);
            })
            .to(0.2, { opacity: 0 })
            .delay(0.6)
            .call(() => {
                // 隐藏烟雾
                this.yan.active = false;
                // 执行回调
                callback?.();
                // 恢复文字节点位置
                tc.y -= 100;
                child1.x = -237;
                child2.x = -79;
                child3.x = 79;
                child4.x = 237;
            })
            .start();
    }

    /** 选错后的扣血逻辑 */
    loseHP() {
        AudioManager.stopEffect2();
        // 临时锁住音频播放状态，防止update立即触发新音频
        this.audioCtrl.playing = true;
        this.heart--;
        // 播放选错提示音效
        this.scheduleOnce(() => {
            AudioManager.playEffect(this.false1[Math.floor(Math.random() * this.false1.length)]);
        }, 0.1);
        // 获取爱心节点
        const xin = this.xin;
        const heartNodes = [
            xin.getChildByName("1").getChildByName("c"),
            xin.getChildByName("2").getChildByName("c"),
            xin.getChildByName("3").getChildByName("c")
        ];
        const targetNode = heartNodes[this.heart];

        // 爱心消失动画
        AudioManager.playEffect(`cuolv283`);
        cc.tween(targetNode)
            .to(0.2, { opacity: 255 })
            .delay(0.2)
            .call(() => {
                // 扣减爱心数
                // 爱心为0则游戏失败
                    if (this.heart <= 0) {
                        this.onlost();
                        this.heart = 3;
                    } else {
                        // 【关键修复】爱心还有剩余时，延迟释放音频锁并重置卡点，避免立即触发循环音频
                        this.scheduleOnce(() => {
                            this.audioCtrl.playing = false;
                            // 延迟1.5秒再触发循环音频，给失败提示音留出播放时间
                            this.audioCtrl.nextSnap = this.calcSnapTime(performance.now() + 1500);
                        }, 1);
                    }
            })
            .start();
    }

    lostClose() {
        // 1. 重置所有核心状态锁（关键！）
        this.isCorrecting = false; // 修复点击拦截的核心
        this.isBtnClicking = false; // 防抖锁兜底重置
        this.audioCtrl.playing = false; // 音频锁重置
        this.audioCtrl.isXunhuan1 = true; // 音频阶段重置
        
        // 2. 基础状态恢复
        GameData.PauseGame = false;
        this.canjiaohu = true;
        this.lost.active = false;
        
        // 3. 恢复爱心节点
        const heartNodes = [
            this.xin.getChildByName("1").getChildByName("c"),
            this.xin.getChildByName("2").getChildByName("c"),
            this.xin.getChildByName("3").getChildByName("c")
        ];
        heartNodes.forEach(item => {
            item.opacity = 0;
        });
        
        // 4. 重置音频卡点
        this.audioCtrl.nextSnap = this.calcSnapTime(performance.now() + 1500);

        // 5. 恢复选字按钮状态（active + interactable 双重保障）
        if (this.choose1 >= 0) {
            const btn1 = this.btn.getChildByName(`btn_${this.choose1 + 1}`);
            if (btn1) {
                btn1.active = true;
                btn1.getComponent(cc.Button).interactable = true; // 强制恢复可交互
                btn1.opacity = 255; // 强制恢复透明度
            }
        }
        if (this.choose2 >= 0) {
            const btn2 = this.btn.getChildByName(`btn_${this.choose2 + 1}`);
            if (btn2) {
                btn2.active = true;
                btn2.getComponent(cc.Button).interactable = true;
                btn2.opacity = 255;
            }
        }

        // 6. 清空填充文字 + 恢复颜色
        const target1Node = this.tc.getChildByName(`${this.target1}`)?.getChildByName("z");
        const target2Node = this.tc.getChildByName(`${this.target2}`)?.getChildByName("z");
        if (target1Node) {
            target1Node.getComponent(cc.Label).string = "";
            target1Node.color = cc.Color.BLACK;
        }
        if (target2Node) {
            target2Node.getComponent(cc.Label).string = "";
            target2Node.color = cc.Color.BLACK;
        }

        // 7. 恢复骨骼动画
        this.bbsk.playAnimation("bb", 0);
        this.mlsk.playAnimation("ml", 0);
        this.lmsk.playAnimation("lm", 0);

        // 8. 重置选字计数 + 隐藏提示
        this.zs = 0;
        this.hideTips();

        // 9. 修复lv逻辑：避免lv异常导致教学关误触发
        const currentLv = this.lv; // 保存当前lv
        this.lv = Math.max(currentLv - 1, 1); // 防止lv变成0
        this.lvgame(); // 调用lvgame重新初始化关卡
    }

    /** 选字飞行动画 */
    flyTarget(scnode: cc.Node, tgnode: cc.Node, callback?: () => void) {
        // 克隆选字节点
        const clnode = cc.instantiate(scnode);
        scnode.active = false;
        clnode.parent = cc.find("Canvas");

        // 计算世界坐标转本地坐标
        const scWorldPos = scnode.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        const tgWorldPos = tgnode.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        const scLocalPos = clnode.parent.convertToNodeSpaceAR(scWorldPos);
        const tgLocalPos = clnode.parent.convertToNodeSpaceAR(tgWorldPos);

        // 设置克隆节点初始位置
        clnode.setPosition(scLocalPos);
        // 飞行动画
        cc.tween(clnode)
            .to(0.3, { position: tgLocalPos })
            .to(0.1, { opacity: 0 })
            .call(() => {
                // 销毁克隆节点
                clnode.destroy();
                // 执行回调
                callback?.();
            })
            .start();
    }

    /** 显示提示（观看视频后） */
    showTips() {
        console.log(this.tgArray[this.lv - 1][0], this.tgArray[this.lv - 1][1]);
        // 提升正确按钮层级
        this.btn.getChildByName(`btn_${this.tgArray[this.lv - 1][0] + 1}`).zIndex = 100;
        this.btn.getChildByName(`btn_${this.tgArray[this.lv - 1][1] + 1}`).zIndex = 100;
        // 显示蒙版
        this.btn.getChildByName(`mengban`).active = true;
        this.btn.getChildByName(`mengban`).zIndex = 99;
    }

    /** 隐藏提示 */
    hideTips() {
        // 恢复按钮层级
        this.btn.getChildByName(`btn_${this.tgArray[this.lv - 1][0] + 1}`).zIndex = 0;
        this.btn.getChildByName(`btn_${this.tgArray[this.lv - 1][1] + 1}`).zIndex = 0;
        // 隐藏蒙版
        this.btn.getChildByName(`mengban`).active = false;
    }

    /** 返回大厅 */
    fanhui() {
        cc.resources.load("prefabs/common/Hall", cc.Prefab, (err, UI: cc.Prefab) => {
            if (err) {
                console.error("加载大厅预制件失败：", err);
                return;
            }
            var UINode = cc.instantiate(UI);
            UINode.parent = cc.find("Canvas");
            GameData.onDele();
            this.node.destroy();
            VideoManager.getInstance().showCustomNativeAd();
        });
    }

    /** 返回按钮点击 */
    fanhuibtn() {
        if (GameData.PauseGame) return;
        this.openpausePanel();
        AudioManager.playEffect(AudioManager.hzAudioPath + AudioManager.hz_audio.button_hz);
    }

    /** 游戏胜利 */
    onwin() {
        this.canjiaohu = false;
        this.isCorrecting = true;
        this.scheduleOnce(() => {
            GameData.PauseGame = true;
            this.node.cleanup();
            AudioManager.stopEffect2();
            this.endwin("prefabs/hz/endwin_hz");
            this.node.destroy();
        }, 1);
    }

    /** 游戏失败 */
    onlost() {
        this.isCorrecting = true;
        this.audioCtrl.playing = true;
        this.canjiaohu = false;
        this.scheduleOnce(() => {
            GameData.PauseGame = false;
            // this.node.destroy();
            AudioManager.stopEffect2();
            AudioManager.playEffect(AudioManager.audioName.endlost);
            this.lost.active = true;
        }, 3);
    }

    /** 重新开始游戏 */
    restart() {
        GameData.onDele();
        AssetManager.load(GameData.curGameStyle, GameData.curGameName, cc.Prefab, null, (name: cc.Prefab) => {
            var UI = cc.instantiate(name);
            UI.parent = cc.find("Canvas");
            this.node.destroy();
        });
    }
}