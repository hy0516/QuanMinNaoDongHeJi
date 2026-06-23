const guize_config = {
   gameTips: [
      "点击墙上的纸条",
      "把猫粮撒到鱼身上拖给猫吃",
      "点击墙上的纸条",
      "将游戏机、羽毛球拍、吉他、呼啦圈放到纸箱内。",
      "点击房门猫眼",
      "选择不开门",
      "点击地板上的盖子点击地下通道",
      " 1、点击地上的纸条查看规则\n2、打开左边墙上的开关",
      " 1、选择右边\n2、选择中间"
   ],
   gameprocess: [
      {
         "type": 1,
         "lab": "宝贝，恭喜高考旗开得胜取得优异成绩，给你做了最爱吃的红烧鱼哟",
         "music": "gz01",
         "musicTime": "6.8"
      },
      {
         "type": 2,
         "lab": [
            "0、亲爱的宝贝,开始好好享受这个暑期生活吧。但是想愉快的的度过，必须遵守以下规则:",
            "1、妈妈很讨厌有人浪费粮食",
            "2、别惹妈妈生气",
            "3、别随意吃东西"
         ]

      },
      {
         "type": 1,
         "lab": "妈妈今天好亲切......",
         "tittle": "吃掉红烧鱼",
         "music": "gz02",
         "musicTime": "1.5",
         "tipsnum": 1
      },
      {
         "type": 1,
         "lab": "快吃吧，凉了就不好吃了。",
         "music": "gz03",
         "musicTime": "2.5"
      },
      {
         "type": 3,
         "target": "yu",

      },
      {
         "type": 1,
         "lab": "吃完了，我先回房间了。",
         "music": "gz08",
         "musicTime": "2.1"
      },
      {
         "type": 11,
         "name": "ws",
      },
      {
         "type": 1,
         "lab": "恭喜妹妹考出好成绩。",
         "tittle": "找出规则",
         "music": "gz09",
         "musicTime": "1.8",
         "tipsnum": 1
      },
      {
         "type": 2,
         "lab": [
            "4、哥哥是可信的",
            "5、妈妈讨厌在房间看到与学习无关的东西",
            "6、妈妈生气了快找到哥哥",
            "7、客厅往左边走"
         ]
      },
      {
         "type": 1,
         "lab": "我去客厅看会电视",
         "music": "gz10",
         "musicTime": "1.6",
         "tipsnum": 1
      },
      {
         "type": 3,
         "target": "tv",
      },
      {
         "type": 1,
         "lab": "房间还没收拾，被妈妈看到会生气的。",
         "tittle": "整理房间",
         "music": "gz11",
         "musicTime": "2.8"
      },
      {
         "type": 3,
         "target": "shoushi",
      },
      {
         "type": 1,
         "lab": "收拾完了，妈妈应该不会生气了吧？",
         "tittle": "确认外面是谁",
         "music": "gz12",
         "musicTime": "2.6",
         "tipsnum": 1
      },
      {
         "type": 3,
         "target": "openDoor",
      },
      {
         "type": 1,
         "lab": "那么久不开门，是不是又把房间弄得乱七八糟了！",
         "music": "gz13",
         "musicTime": "4.4",
         "tipsnum": 1,
         "tittle": "完成选择",

      },
      {
         "type": 3,
         "target": "btnDoor",


      },
      {
         "type": 1,
         "lab": "不对....这人表情好奇怪这不是妈妈快去找哥哥。",
         "music": "gz15",
         "musicTime": "4",
         "tipsnum": 1,
         "tittle": "逃出房间"
      },
      {
         "type": 3,
         "target": "db",
      },
      {
         "type": 3,
         "target": "btntd",
      },
      {
         "type": 11,
         "name": "tongdao",
      },
      {
         "type": 1,
         "lab": "我好害怕，哥哥你在哪。",
         "tittle": "找出规则",
         "music": "gz16",
         "musicTime": "2.1",
         "tipsnum": 1
      },
      {
         "type": 2,
         "lab": [
            "8、妈妈不在房间",
            "9、客厅是安全的",
            "10、第7条是假的",
            "11、坚定自己的选择"
         ],
      },
      {
         "type": 3,
         "target": "openLight",
         "tittle": "检查通道"

      },
      {
         "type": 3,
         "target": "null",
         "tittle": "完成选择",
         "tipsnum": 1
      },

      {
         "type": 3,
         "target": "null",
         "tittle": "完成选择"
      },


      {
         "type": 11,
         "name": "keting",
      },
      {
         "type": 1,
         "lab": "妹妹真棒",
         "music": "gz17",
         "musicTime": "1"

      },
      {
         "type": 1,
         "lab": "妹妹打小就聪明",
         "music": "gz18",
         "musicTime": "1.5"

      },
      {
         "type": 10,
         "lab": "游戏胜利",
      }
   ],
   gameFzProcess: [
      {
         pro: [
            {
               "type": 1,
               "lab": "（我）糟糕...这鱼有问题！！",
               "music": "gz04",
               "musicTime": "1.9"
            },
            {
               "type": 1,
               "lab": "（妈妈）这孩子真听话",
               "music": "gz05",
               "musicTime": "2.1"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "不了，我刚吃过了已经吃不下了。",
               "music": "gz06",
               "musicTime": "2.5"
            },
            {
               "type": 1,
               "lab": "我最讨厌浪费粮食了",
               "music": "gz07",
               "musicTime": "1.7"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "房间是不是没整理，我都闻到臭味了",
               "music": "gz19",
               "musicTime": "2.8"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "好妹妹，妈妈没生气哟",
               "music": "gz14",
               "musicTime": "3.2"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "leftGui1",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "leftGui2",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "rightGui",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
   ],

   lv2Tips: [
      "点击柜子上的纸条查看规则",
      "调整墙上的时间至22点到06点之间,再点击停尸房的门",
      "点击柜子上的纸条查看规则",
      "点击墙上的温度控制开关调整温度到-20℃",
      "不选择，直接点击关闭按钮",
      "选择逃往值班室",
      "点击衣柜上的纸条查看规则",
      "都不选择，上滑保安服口袋点击红色开关按钮",
      "选择出去",
      "点击门上的纸条查看规则",
      "调整墙上的时间至07点",
   ],
   lv2process: [
      {
         "type": 1,
         "lab": "今天是入职保安的第一天，加油。",
         "tittle": "找到规则",
         "music": "gz2_01",
         "musicTime": "3.3"
      },
      {
         "type": 2,
         "lab": [
            "欢迎你第一天上班！你的职责是维护殡仪馆的秩序和安定。但为了能让你安全的下班离开，请务必遵循以下规则：",
            "1、杜绝封建迷信，相信科学，这个世界上没有鬼怪。",
            "2、你的工作时间是22点-06点间，工作时间内你要进入停尸房检查冷气运行情况。",
            "3、你有一名同事，他负责在外面巡逻的工作，你和他在一起时是安全的。"
         ],
      },
      {
         "type": 3,
         "target": "zhong",
         "tittle": "履行保安职责",
         "tipsnum": 1,
      },
      {
         "type": 11,
         "name": "tingshi",
         "tittle": "找到规则",
         "tipsnum": 1,
      },
      {
         "type": 2,
         "lab": [
            "4、尊重逝者，切勿在停尸房说话",
            "5、检查停尸房内的温度，需设定在-20℃",
            "6、殡仪馆内只有你一个人，如遇有外人请迅速离开",
            ""
         ],
      },
      {
         "type": 3,
         "target": "kongtiao",
         "tittle": "检查停尸间温度",
         "tipsnum": 1,
      },
      {
         "type": 3,
         "target": "nvsk",

      },
      {
         "type": 1,
         "lab": "我是逝者家属，我迷路了能带我出去吗？",
         "music": "gz2_02",
         "musicTime": "3.9",
         "tipsnum": 1,
         "tittle": "做出选择",
      },
      {
         "type": 3,
         "target": "milu",
      },
      {
         "type": 3,
         "target": "shengqi",
      },
      {
         "type": 1,
         "lab": "为什么不理我，装高冷呢？",
         "music": "gz2_03",
         "musicTime": "2.3",
         "tipsnum": 1,
      },
      {
         "type": 3,
         "target": "taopao",
      },
      {
         "type": 11,
         "name": "zhiban",
      },
      {
         "type": 1,
         "lab": "得先找个地方躲起来！",
         "tittle": "找到规则",
         "music": "gz2_04",
         "musicTime": "1.6",
         "tipsnum": 1
      },


      {
         "type": 2,
         "lab": [
            "7、柜子里可以暂保安全",
            "8、出现红光时，会出现幻觉，幻觉世界里一切都是假的。",
            "",
            "",
         ],

      },
      {
         "type": 3,
         "target": "guizi",
         "tittle": "躲起来找机会逃跑",
         "tipsnum": 1
      },
      {
         "type": 3,
         "target": "zoudong1",
      },
      {
         "type": 1,
         "lab": "出来吧，我看到你了",
         "music": "gz2_05",
         "musicTime": "1.75",
         "tittle": "完成选择",

      },
      {
         "type": 3,
         "target": "yigui",
      },
      {
         "type": 3,
         "target": "tongshi",
         "tipsnum": 1,
      },
      {
         "type": 1,
         "lab": "我是你的同事，我来带你离开",
         "music": "gz2_06",
         "musicTime": "2.38",
         "tittle": "完成选择"
      },
      {
         "type": 3,
         "target": "yigui2",
      },
      {
         "type": 11,
         "name": "houmen",
         "tittle": "寻找规则",
         "tipsnum": 1,
      },
      {
         "type": 2,
         "lab": [
            "9、你的下班时间是07点，切忌提前下班。",
            "",
            "",
            ""
         ],
      },
      {
         "type": 3,
         "target": "zhong2",
         "tittle": "顺利下班",
         "tipsnum": 1
      },
      {
         "type": 1,
         "lab": "下班吧，接下来我替你上班。",
         "music": "gz2_07",
         "musicTime": "3.13",
         "tittle": "完成选择"
      },
      {
         "type": 3,
         "target": "kaimen",
      },
      {
         "type": 10,
         "lab": "游戏胜利",
      }
   ],
   lv2FzProcess: [
      {
         pro: [
            {
               "type": 11,
               "name": "tingshi",
            },
            {
               "type": 1,
               "lab": "这个时候可不是你该来的哟！",
               "music": "gz2_08",
               "musicTime": "3.9"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "mllost",
            },
            {
               "type": 1,
               "lab": "让你别说话，你怎么不入耳呢？",
               "music": "gz2_09",
               "musicTime": "4"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "mllost",
            },
            {
               "type": 1,
               "lab": "不想走了，留下陪我吧！",
               "music": "gz2_10",
               "musicTime": "3"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 11,
               "name": "houmen",
            },
            {
               "type": 1,
               "lab": "糟糕大门上锁了！",
               "music": "gz2_11",
               "musicTime": "1.8"
            },

            {
               "type": 1,
               "lab": "想往哪逃啊？",
               "music": "gz2_12",
               "musicTime": "1.8"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "yglost",
            },
            {
               "type": 1,
               "lab": "让你逃！",
               "music": "gz2_13",
               "musicTime": "1.2"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "yglost",
            },
            {
               "type": 1,
               "lab": "你以为躲这就安全了吗？",
               "music": "gz2_14",
               "musicTime": "3.16"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "那你就呆里面吧",
               "music": "gz2_15",
               "musicTime": "1.25"
            },

            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
   ],

   lv3Tips: [
      "1、点击飞机仓门上的屏幕\n2、用鸡翅和对面美女换红薯\n3、点击自己餐盘\n4、选择释放自己\n5、上滑打开上方行李舱\n6、拖动行李舱中的包放到桌面\n7、把包里的键盘拖到空姐脚下",
      "8、点击仓门玻璃上的手印\n9、点击空无一人的座位\n10、上滑空姐袖子点击锤子\n11、点击椅子上的红色污渍\n12、点击仓门上的电子显示屏",
      "13、点击窗户上的屏幕\n14、选择心静自然凉\n15、上滑空姐袖子\n16、点击空姐的扳手",
      "17、点击屏幕查看最后通知\n18、点击窗口上的行李舱盖\n19、点击降落伞包\n20、选择给空姐",
   ],
   lv3process: [
      {
         "type": 1,
         "lab": "欢迎乘坐本次航班，祝大家旅途愉快",
         "tittle": "查看紧急通知",
         "music": "gz3_01",
         "musicTime": "3.3"
      },
      {
         "type": 1,
         "lab": "这飞机真奇怪，座位怎么是面对面的",
         "tittle": "查看紧急通知",
         "music": "gz3_02",
         "musicTime": "3"
      },
      {
         "type": 2,
         "lab": [
            "紧急通知，机舱内出现突变体，并且隐藏在人群中，请认真查看规则避免被伤害感染",
            "1、突变体对刺激性味道会过敏",
            "2、遇到困难找空姐，空姐聪明能干",
            "3、头等舱目前是安全的"
         ],
      },
      {
         "type": 1,
         "lab": "不要慌，有啥事都先吃饭",
         "tittle": "应对突发情况",
         "music": "gz3_03",
         "musicTime": "3"
      },
      {
         "type": 3,
         "target": "huan",
      },
      {
         "type": 1,
         "lab": "美女，我不爱吃鸡翅，跟你换红薯",
         "music": "gz3_04",
         "musicTime": "3"
      },
      {
         "type": 3,
         "target": "chi",
      },
      {
         "type": 1,
         "lab": "哎，要来感觉了.....",
         "music": "gz3_05",
         "musicTime": "2.2"
      },
      {
         "type": 3,
         "target": "pi",
      },
      {
         "type": 1,
         "lab": "这太危险了....给我升舱！",
         "music": "gz3_06",
         "musicTime": "2"
      },

      {
         "type": 1,
         "lab": "这位先生，升舱需要16万，你这边账户余额好像不足哦",
         "music": "gz3_07",
         "musicTime": "4.7"
      },
      {
         "type": 1,
         "lab": "（路人）兄弟，把你的手机给我，我来帮你",
         "music": "gz3_08",
         "musicTime": "3.3"
      },
      {
         "type": 3,
         "target": "dk",
      },
      {
         "type": 3,
         "target": "bag",
      },
      {
         "type": 3,
         "target": "jp",
      },
      {
         "type": 1,
         "lab": "我希望你识趣点，不要逼我跪下求你",
         "music": "gz3_09",
         "musicTime": "2.5"
      },
      {
         "type": 1,
         "lab": "好的",
         "music": "gz3_10",
         "musicTime": "1"
      },

      {
         "type": 11,
         "name": "tdcang",
         "tittle": "找出可疑的地方",
         "tipsnum": 1,
      },
      {
         "type": 3,
         "target": "hidebtn",
      },
      {
         "type": 1,
         "lab": "这里好奇怪",
         "music": "gz3_38",
         "musicTime": "1"
      },
      {
         "type": 3,
         "target": "hidebtn2",
      },

      {
         "type": 1,
         "lab": "先坐下来吧，位置就在我的对面",
         "music": "gz3_11",
         "musicTime": "2.5"
      },
      {
         "type": 11,
         "name": "kj",
         "tittle": "查看通知",
         "tipsnum": 1,
      },
      {
         "type": 3,
         "target": "showbtn",
      },
      {
         "type": 2,
         "lab": [
            "紧急通知，机载制氧系统出现故障！",
            "4、有要求可以向空姐提，但不要空姐生气",
            "5、发热可能会是变异前兆，冷气可以抑制变异",
            "",
         ],
      },
      {
         "type": 1,
         "lab": "我怎么感觉好热啊，难道是....",
         "music": "gz3_12",
         "musicTime": "2.7",
         "tittle": "让自己冷静下来",
      },
      {
         "type": 3,
         "target": "lengjing",
      },
      {
         "type": 1,
         "lab": "不对劲，我感觉不能自主呼吸了",
         "music": "gz3_13",
         "musicTime": "2.7",
      },
      {
         "type": 3,
         "target": "jijiu",
      },
      {
         "type": 1,
         "lab": "先生！你怎么了？",
         "music": "gz3_14",
         "musicTime": "2.6",
      },
      {
         "type": 1,
         "lab": "乘客晕倒了，只能进行急救了",
         "music": "gz3_15",
         "musicTime": "2.6",
      },
      {
         "type": 3,
         "target": "jijiu2",
      },
      {
         "type": 1,
         "lab": "先生刚才你晕倒了，我们对你进行了急救",
         "music": "gz3_16",
         "musicTime": "3.8",
      },
      {
         "type": 1,
         "lab": "哦！谢谢但我还是觉得好热",
         "music": "gz3_17",
         "musicTime": "3",
      },
      {
         "type": 3,
         "target": "djs",
      },
      {
         "type": 1,
         "lab": "不用紧张，只是空调坏了，我去修修",
         "music": "gz3_18",
         "musicTime": "3.5",
      },
      {
         "type": 3,
         "target": "xiuli",
      },
      {
         "type": 1,
         "lab": "修好了",
         "music": "gz3_19",
         "musicTime": "1",
         "tipsnum": 1,
      },
      {
         "type": 3,
         "target": "zd",
         "tittle": "查看最后通知"
      },
      {
         "type": 2,
         "lab": [
            "播报最后一条通知：",
            "6、遗憾的通知各位，由于飞机收到突变体破坏，已无法降落！请各位自行解决着陆问题",
            "",
            ""
         ],
      },
      {
         "type": 1,
         "lab": "开玩笑呢？无法降落",
         "music": "gz3_20",
         "musicTime": "1.7",
         "tittle": "寻找着陆方法"
      },
      {
         "type": 3,
         "target": "sanbao",
      },
      {
         "type": 1,
         "lab": "这有降落伞!",
         "music": "gz3_21",
         "musicTime": "1",
      },
      {
         "type": 3,
         "target": "geisan",
      },
      {
         "type": 1,
         "lab": "你是女孩给你吧，帮我跟爸妈说声对不起",
         "music": "gz3_22",
         "musicTime": "3.2",
      },
      {
         "type": 1,
         "lab": "别慌，姐可是跳伞冠军，我带你飞!",
         "music": "gz3_23",
         "musicTime": "2.6",
      },
      {
         "type": 3,
         "target": "tiaosan",
      },
      {
         "type": 10,
         "lab": "游戏胜利",
      }
   ],
   lv3FzProcess: [
      {
         pro: [
            {
               "type": 3,
               "target": "bianyi",
            },
            {
               "type": 1,
               "lab": "我还没吃饱呢！",
               "music": "gz3_24",
               "musicTime": "1.2"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "不用客气，这是你在XXX的备用金",
               "music": "gz3_25",
               "musicTime": "3.2"
            },
            {
               "type": 3,
               "target": "sj",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "飞机出故障了！",
               "music": "gz3_26",
               "musicTime": "1.3"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "不小心潵的草莓汁",
               "music": "gz3_27",
               "musicTime": "1.6"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "起飞前维修人员留下的",
               "music": "gz3_28",
               "musicTime": "2"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "我偶尔也会兼职维修工",
               "music": "gz3_29",
               "musicTime": "2"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "这头等舱没乘客？",
               "music": "gz3_30",
               "musicTime": "1.5"
            },
            {
               "type": 1,
               "lab": "就是因为没人才安全",
               "music": "gz3_31",
               "musicTime": "1.7"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },

      {
         pro: [
            {
               "type": 1,
               "lab": "我要开窗，不然我要变异了",
               "music": "gz3_32",
               "musicTime": "2.4"
            },
            {
               "type": 1,
               "lab": "先生，这是万米高空不能开窗",
               "music": "gz3_33",
               "musicTime": "2.6"
            },
            {
               "type": 3,
               "target": "kc2",
            },
            {
               "type": 1,
               "lab": "我不管，乘客就是上帝",
               "music": "gz3_34",
               "musicTime": "2.3"
            },
            {
               "type": 1,
               "lab": "好的，请稍等",
               "music": "gz3_35",
               "musicTime": "1.5"
            },
            {
               "type": 3,
               "target": "zhuiji",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },

      {
         pro: [
            {
               "type": 1,
               "lab": "看来只能特殊处理",
               "music": "gz3_36",
               "musicTime": "2.2"
            },
            {
               "type": 3,
               "target": "hong",
            },
            {
               "type": 3,
               "target": "cfLost2",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "不好意思，我要活着",
               "music": "gz3_37",
               "musicTime": "1.8"
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
   ],
   lv4Tips: [
      "1、点击女主播悬在空中的辫子\n2、向下滑动灯罩，点击场景桌子的台灯\n3、点击女主播身后电视机\n4、点击女主播的脸\n5、点击玩具熊",
      "1、将场景中的猫拖动到台灯处\n2、场景中的符移动到桌子上的玩具熊上\n3、滑动断开电视机电源插头\n4、移动桌面上黄色瓶子到飞起的头发右边",
      "1、不选择直接左滑屏幕",
   ],
   lv4process: [
      {
         "type": 1,
         "lab": "家人们，今晚就先到这里拉~",
         "tittle": "来到直播间",
         "music": "gz4_1",
         "musicTime": "3"
      },
      {
         "type": 1,
         "lab": "感谢大师今晚光临直播间",
         "music": "gz4_2",
         "musicTime": "2.5"
      },
      {
         "type": 3,
         "target": "tv",
      },
      {
         "type": 3,
         "target": "chageState",
      },
      {
         "type": 1,
         "lab": "救命~救命，呃呃",
         "tittle": "找到5个可疑的地方",
         "music": "gz4_3",
         "musicTime": "2.3"
      },
      {
         "type": 3,
         "target": "findGui",
      },

      {
         "type": 1,
         "lab": "小姐莫慌，我速来帮你",
         "music": "gz4_4",
         "musicTime": "2.5",
         "tittle": "驱除所有邪祟",
         "tipsnum": 1,
      },

      {
         "type": 3,
         "target": "hidebtn",
      },
      {
         "type": 3,
         "target": "openGui",
      },
      {
         "type": 3,
         "target": "openGui2",
      },
      {
         "type": 1,
         "lab": "妖魔都被降伏，你安全了",
         "music": "gz4_5",
         "musicTime": "2.7",
         "tittle": "做出选择",
         "tipsnum": 1,
      },
      {
         "type": 1,
         "lab": "可是小女子还是怕，大师可否留下陪我",
         "music": "gz4_6",
         "musicTime": "4",
      },
      {
         "type": 3,
         "target": "sele",
      },
      {
         "type": 11,
         "name": "room2",
         // "tittle": "查看通知",
      },
      {
         "type": 1,
         "lab": "原来是一场梦啊",
         "music": "gz4_7",
         "musicTime": "3",
      },
      {
         "type": 10,
         "lab": "游戏胜利",
      },

   ],
   lv4FzProcess: [
      {
         pro: [
            {
               "type": 1,
               "lab": "得想想办法，不然妹子就危险了",
               "music": "gz4_8",
               "musicTime": "3.5"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "好像有东西拉住了她的头发",
               "music": "gz4_9",
               "musicTime": "2.2"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "这台灯里好像藏了东西",
               "music": "gz4_10",
               "musicTime": "2"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "这应该就是问题所在",
               "music": "gz4_11",
               "musicTime": "1.7"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "玩具熊上的帽子怎么好奇怪",
               "music": "gz4_12",
               "musicTime": "2.5"
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "快撤，有猫腻！",
               "music": "gz4_13",
               "musicTime": "2.0"
            },

            {
               "type": 3,
               "target": "mao",
            },
            {
               "type": 3,
               "target": "cfnext",
            }

         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "你真讨厌",
               "music": "gz4_14",
               "musicTime": "1.5"
            },
            {
               "type": 1,
               "lab": "抱歉，贴错位置了",
               "music": "gz4_15",
               "musicTime": "2"
            },
            {
               "type": 3,
               "target": "jiangshi",
            },
            {
               "type": 3,
               "target": "cfnext",
            }

         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "这是什么东西，我要赶紧回去洗澡",
               "music": "gz4_16",
               "musicTime": "4.5"
            },
            {
               "type": 3,
               "target": "hairgui",
            },
            {
               "type": 3,
               "target": "cfnext",
            }

         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "眼不见心不烦",
               "music": "gz4_17",
               "musicTime": "1.7"
            },
            {
               "type": 3,
               "target": "photo",
            },
            {
               "type": 3,
               "target": "cfnext",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "臭男人，没有一个好东西",
               "music": "gz4_18",
               "musicTime": "2.5"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
   ],
   lv5Tips: [
      " 选择1   左-右-左 不选择出门 点击女主\n选择2   右-左-右 不选择出门 点击女主"
   ],
   lv5process: [
      {
         "type": 1,
         "lab": "亲爱的，我们玩遮眼换装游戏呀",
         "music": "gz5_1",
         "musicTime": "3",

      },
      {
         "type": 3,
         "target": "shou",
      },
      {
         "type": 3,
         "target": "clother",
         "cloNode": "se1",
      },
      {
         "type": 3,
         "target": "sele",
         "nodeName": "selePanel",
      },

   ],
   lv5FzProcess: [
      {
         pro: [
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shangy1",
               "state": true,
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shuiy",
               "state": false,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "你喜欢这种风格的吗~",
               "music": "gz5_2",
               "musicTime": "2",
            },
            {
               "type": 1,
               "lab": "好了，继续换啦",
               "music": "gz5_3",
               "musicTime": "2",
            },
            {
               "type": 1,
               "lab": "帮我选一套丝袜好吗",
               "music": "gz5_4",
               "musicTime": "2.3",
            },
            {
               "type": 3,
               "target": "shou",
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel2",
               "ans": "btn_you2"
            },
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "你是不是偷看了，我帮你捂着",
               "music": "gz5_5",
               "musicTime": "3.3",
            },
            {
               "type": 1,
               "lab": "在帮我选个手链吧",
               "music": "gz5_6",
               "musicTime": "2",
            },
            {
               "type": 3,
               "target": "openhei",
            },
            {
               "type": 3,
               "target": "shou",
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "se3",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel3",
               "ans": "btn_zuo3"
            },
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 3,
               "target": "closehei",
            },
            {
               "type": 1,
               "lab": "怎么样？但是我觉得另一套更性感？",
               "music": "gz5_7",
               "musicTime": "2.7",
            },
            {
               "type": 1,
               "lab": "搭配好了，一起出去逛街吗，虽然外面下雨。",
               "music": "gz5_8",
               "musicTime": "3.5",
            },
            {
               "type": 3,
               "target": "clothermove",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel4",
               "ans": ""
            },

            {
               "type": 2,
               "lab": "宝贝我们去健身吧",
               "music": "gz5_9",
               "musicTime": "2",
            },
            {
               "type": 10,
               "lab": "游戏胜利",
            }

         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shangy2",
               "state": true,
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shuiy",
               "state": false,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "你喜欢这种风格的吗~",
               "music": "gz5_2",
               "musicTime": "2",
            },
            {
               "type": 1,
               "lab": "好了，继续换啦",
               "music": "gz5_3",
               "musicTime": "2",
            },
            {
               "type": 1,
               "lab": "帮我选一套丝袜好吗",
               "music": "gz5_4",
               "musicTime": "2.3",
            },
            {
               "type": 3,
               "target": "shou",
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel2",
               "ans": "btn_zuo2"
            },
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "你是不是偷看了，我帮你捂着",
               "music": "gz5_5",
               "musicTime": "3.3",
            },
            {
               "type": 1,
               "lab": "在帮我选个手链吧",
               "music": "gz5_6",
               "musicTime": "2",
            },
            {
               "type": 3,
               "target": "openhei",
            },
            {
               "type": 3,
               "target": "shou",
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "se3",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel3",
               "ans": "btn_you3"
            },
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 3,
               "target": "closehei",
            },
            {
               "type": 1,
               "lab": "怎么样？但是我觉得另一套更性感？",
               "music": "gz5_7",
               "musicTime": "2.7",
            },
            {
               "type": 1,
               "lab": "搭配好了，一起出去逛街吗，虽然外面下雨。",
               "music": "gz5_8",
               "musicTime": "3.5",
            },
            {
               "type": 3,
               "target": "clothermove",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel4",
               "ans": ""
            },
            {
               "type": 2,
               "lab": "宝贝我们去健身吧",
               "music": "gz5_9",
               "musicTime": "2",
            },
            {
               "type": 10,
               "lab": "游戏胜利",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 3,
               "target": "shengqi",
            },
            {
               "type": 1,
               "lab": "为什么搭配这么丑",
               "music": "gz5_10",
               "musicTime": "1.7",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 3,
               "target": "shengqi",
            },
            {
               "type": 1,
               "lab": "为什么搭配这么丑",
               "music": "gz5_10",
               "musicTime": "1.7",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se3",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 3,
               "target": "closehei",
            },
            {
               "type": 3,
               "target": "shengqi",
            },
            {
               "type": 1,
               "lab": "为什么搭配这么丑",
               "music": "gz5_10",
               "musicTime": "1.7",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cloNode",
               "cloNode": "se3",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 3,
               "target": "closehei",
            },
            {
               "type": 3,
               "target": "shengqi",
            },
            {
               "type": 1,
               "lab": "为什么搭配这么丑",
               "music": "gz5_10",
               "musicTime": "1.7",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "shengqi",
            },
            {
               "type": 1,
               "lab": "哼！万一我的漂亮衣服被淋湿呢!",
               "music": "gz5_11",
               "musicTime": "3.5",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "shengqi",
            },
            {
               "type": 1,
               "lab": "那是说我穿这套不好看吗!",
               "music": "gz5_12",
               "musicTime": "1.8",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },

   ],
   lv6Tips: [
      " 选择1   左-左-右 选择不换 点击女主再选择出门\n选择2   右-右-左 选择不换 点击女主再选择出门"
   ],
   lv6process: [
      {
         "type": 1,
         "lab": "亲爱的，今天是恋爱纪念日，我想打扮成你喜欢的样子，先帮我选条裙子可以吗",
         "music": "gz6_1",
         "musicTime": "7.5",

      },

      {
         "type": 3,
         "target": "sele",
         "nodeName": "selePanel",
         "ans": "btn_zuo"
      },

   ],
   lv6FzProcess: [
      {
         pro: [
            {
               "type": 3,
               "target": "clother",
               "cloNode": "shangy1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shangy1",
               "state": true,
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shuiy",
               "state": false,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "裙子挺好的，再帮我选双丝袜吧",
               "music": "gz6_2",
               "musicTime": "3.2",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel2",
               "ans": "btn_you2"
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "tui1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "你喜欢我穿这种丝袜吗，再帮我选一条项链呀",
               "music": "gz6_3",
               "musicTime": "3.8",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel3",
               "ans": "btn_zuo3"
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "shoulian1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "这套好看吗，但是我觉得另一套更好一点，要不要换？",
               "music": "gz6_4",
               "musicTime": "4.6",
            },
            {
               "type": 3,
               "target": "sele2",
               "nodeName": "selePanel4",
               "ans": ""
            },

            {
               "type": 1,
               "lab": "换好了  外面下雨还要出门玩吗",
               "music": "gz6_5",
               "musicTime": "3.5",
            },
            {
               "type": 3,
               "target": "clothermove",
            },

            {
               "type": 3,
               "target": "sele2",
               "nodeName": "selePanel5",
               "ans": "btn_you5"
            },
            {
               "type": 1,
               "lab": "啦啦啦 刮风下雨都不怕",
               "music": "gz6_6",
               "musicTime": "3",
            },
            {
               "type": 10,
               "lab": "游戏胜利",
            }

         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "clother",
               "cloNode": "shangy2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shangy2",
               "state": true,
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shuiy",
               "state": false,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "裙子挺好的，再帮我选双丝袜吧~",
               "music": "gz6_2",
               "musicTime": "3.5",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel2",
               "ans": "btn_zuo2"
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "tui2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "你喜欢我穿这种丝袜吗，再帮我选一条项链呀",
               "music": "gz6_3",
               "musicTime": "4",
            },
            {
               "type": 3,
               "target": "sele",
               "nodeName": "selePanel3",
               "ans": "btn_you3"
            },
            {
               "type": 3,
               "target": "clother",
               "cloNode": "shoulian2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "这套好看吗，但是我觉得另一套更好一点，要不要换？",
               "music": "gz6_4",
               "musicTime": "4.6",
            },
            {
               "type": 3,
               "target": "sele2",
               "nodeName": "selePanel4",
               "ans": "btn_you4"
            },
            {
               "type": 1,
               "lab": "换好了  外面下雨还要出门玩吗",
               "music": "gz6_5",
               "musicTime": "3.5",
            },
            {
               "type": 3,
               "target": "clothermove",
            },
            {
               "type": 3,
               "target": "sele2",
               "nodeName": "selePanel5",
               "ans": "btn_you4"
            },

            {
               "type": 1,
               "lab": "啦啦啦 刮风下雨都不怕",
               "music": "gz6_6",
               "musicTime": "3",
            },
            {
               "type": 10,
               "lab": "游戏胜利",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "clother",
               "cloNode": "tui2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "这个搭配好丑呀",
               "music": "gz6_0",
               "musicTime": "2",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "clother",
               "cloNode": "tui1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "tui1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "这个搭配好丑呀",
               "music": "gz6_0",
               "musicTime": "2",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "clother",
               "cloNode": "shoulian1",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian1",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "这个搭配好丑呀",
               "music": "gz6_0",
               "musicTime": "2",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 3,
               "target": "clother",
               "cloNode": "shoulian2",
            },
            {
               "type": 3,
               "target": "huan",
               "cloNode": "shoulian2",
               "state": true,
            },
            {
               "type": 3,
               "target": "closz",
            },
            {
               "type": 1,
               "lab": "这个搭配好丑呀",
               "music": "gz6_0",
               "musicTime": "2",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "这套哪里不好看了!",
               "music": "gz6_7",
               "musicTime": "2",
               "tipsnum": 1
            },

            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "你想淋坏我的漂亮衣服呀",
               "music": "gz6_8",
               "musicTime": "3.5",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],

      },
      {
         pro: [
            {
               "type": 1,
               "lab": "你这个臭宅男真不懂浪漫",
               "music": "gz6_9",
               "musicTime": "3",
               "tipsnum": 1
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ],

      },
   ],
   lv7Tips: [
      "点击墙上的标识查看规则",
      "电影票颜色依次为：绿-红-红",
      "点击墙子上的纸条查看规则",
      "不选择，直接点击关闭,拖动水桶到头发上",
      "不选择，直接点击关闭按钮,点击门下方小口，拖动灭火器放进去",
      "点击墙上的纸条查看规则",
      "点击左边红色座椅坐下",
      "选择不回头",
   ],
   lv7process: [
      {
         "type": 2,
         "lab": [
            "亲爱的王贺帝欢迎来到方舟电影院希望你在这里工作能遵守一下规则：",
            "1.带有旋涡图案的客人，请给红色电影票",
            "2.其它客人请给绿色电影票",
            "3.电影开场后要进入8号放映厅"
         ],
      },
      {
         "type": 1,
         "lab": "这就是大名鼎鼎的方舟电影院啊，要好好工作不被开除",
         "music": "gz7_1",
         "musicTime": "4",
         "tittle": "给顾客对的票",
         "tipsnum": 1,
      },

      {
         "type": 3,
         "target": "ren",
         "nodeName": "ren1"
      },
      {
         "type": 1,
         "lab": "小帅哥，我要买张票",
         "music": "gz7_2",
         "musicTime": "1.7",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 3,
         "target": "startpiao",
      },
      {
         "type": 3,
         "target": "piao",
         "nodeName": "3p",
         "fenzhi": 0
      },
      {
         "type": 1,
         "lab": "好的，3号放映厅在左边",
         "music": "gz7_3",
         "musicTime": "2.38",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 3,
         "target": "renhide",
         "nodeName": "ren1"
      },
      {
         "type": 3,
         "target": "ren",
         "nodeName": "ren2"
      },
      {
         "type": 1,
         "lab": "嘿~我要买一张电影票",
         "music": "gz7_4",
         "musicTime": "3",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 3,
         "target": "startpiao",
      },
      {
         "type": 3,
         "target": "piao",
         "nodeName": "8p",
         "fenzhi": 1
      },
      {
         "type": 1,
         "lab": "这位先生.8号放映室在右边第一间",
         "music": "gz7_5",
         "musicTime": "3.5",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 3,
         "target": "renhide",
         "nodeName": "ren2"
      },
      {
         "type": 3,
         "target": "ren",
         "nodeName": "ren3"
      },
      {
         "type": 1,
         "lab": "喂~来一张好位置的票",
         "music": "gz7_6",
         "musicTime": "2.7",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 3,
         "target": "startpiao",
      },
      {
         "type": 3,
         "target": "piao",
         "nodeName": "8p",
         "fenzhi": 2
      },
      {
         "type": 1,
         "lab": "女士，给您留了8号厅6排6座",
         "music": "gz7_7",
         "musicTime": "3.2",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 3,
         "target": "piaohide",

      },
      {
         "type": 3,
         "target": "renhide",
         "nodeName": "ren3"
      },
      {
         "type": 1,
         "lab": "电影快开始了，我也要去8号厅了",
         "music": "gz7_8",
         "musicTime": "2.5",
         // "tittle": "给顾客对的票"
      },
      {
         "type": 11,
         "name": "room2",
         "tittle": "寻找规则",
         "tipsnum": 1,
      },
      {
         "type": 2,
         "lab": [
            "4.数字灯亮起表示正在放映电影",
            "5.放映电影时，千万不能打开8号放映厅的门",
            "6.满足顾客的其它需求",
            "7.放映结束要打扫放映室"
         ],
      },
      {
         "type": 1,
         "lab": "8号放映厅出现好多奇怪的人",
         "music": "gz7_9",
         "musicTime": "3",
         "tittle": "帮助顾客",
      },
      {
         "type": 1,
         "lab": "别挤了，别挤了，都要把门挤坏了",
         "music": "gz7_10",
         "musicTime": "2.38",
         // "tittle": "帮助顾客",
      },
      {
         "type": 3,
         "target": "kazhu",
         "nodeName": "toufa"
      },
      {
         "type": 3,
         "target": "shuitong",
         "nodeName": "shuitong"
      },
      {
         "type": 1,
         "lab": "哎呀!",
         "music": "gz7_11",
         "tipsnum": 1,
         "musicTime": "1",
         // "tittle": "帮助顾客",
      },
      {
         "type": 1,
         "lab": "外面有人吗？我被门卡住了，帮帮我",
         "music": "gz7_12",
         "musicTime": "3.2",
         // "tittle": "帮助顾客",
      },
      {
         "type": 3,
         "target": "select",
         "nodeName": "selePanel",
      },
      {
         "type": 3,
         "target": "linshi",
         "nodeName": "toufa"
      },
      {
         "type": 1,
         "lab": "淋湿就不卷了",
         "music": "gz7_13",
         "musicTime": "1.2",
      },
      {
         "type": 3,
         "target": "qihuo",
         "tipsnum": 1,
         "nodeName": "yan_sk"
      },
      {
         "type": 1,
         "lab": "救命啊！王贺帝快开门！里面着火了！",
         "music": "gz7_14",
         "musicTime": "3.5",
      },
      {
         "type": 1,
         "lab": "她怎么知道我的名字？",
         "music": "gz7_15",
         "musicTime": "2.5",
      },
      {
         "type": 3,
         "target": "xiaofang",
         "nodeName": "xiaofang"
      },
      {
         "type": 3,
         "target": "select",
         "nodeName": "selePanel2"
      },
      {
         "type": 3,
         "target": "miehuo",
         "nodeName": "yan_sk"
      },
      {
         "type": 1,
         "lab": "人怎么都不见了，算了还是先清理放映厅先",
         "music": "gz7_16",
         "musicTime": "4",
      },
      {
         "type": 11,
         "name": "room3",
         "tittle": "寻找规则",
         "tipsnum": 1,
      },
      {
         "type": 2,
         "lab": [
            "8.播放电影之后请立即找到红色座椅",
            "9.请一直观看电影直到结束",
            "10.记住看电影是最重要的规则",
            ""
         ],
      },
      {
         "type": 3,
         "target": "bofang",
         "nodeName": "pingmu"
      },
      {
         "type": 1,
         "lab": "电影怎么会自己放映的？",
         "music": "gz7_17",
         "musicTime": "1.8",
         "tittle": "安全离开放映厅"
      },
      {
         "type": 3,
         "target": "zuoyi",
         "tipsnum": 1,
         "nodeName": "pingmu"
      },
      {
         "type": 1,
         "lab": "你想知道刚才发生了什么事吗",
         "music": "gz7_18",
         "musicTime": "2.38",
      },
      {
         "type": 3,
         "target": "select",
         "tipsnum": 1,
         "nodeName": "selePanel"
      },
      {
         "type": 1,
         "lab": "恭喜你通过试用期",
         "music": "gz7_28",
         "musicTime": "2.2",
      },
      {
         "type": 10,
         "lab": "游戏胜利",
      }
   ],
   lv7FzProcess: [
      {
         pro: [
            {
               "type": 1,
               "lab": "你是新来的吧，我不是要这个票",
               "music": "gz7_19",
               "musicTime": "3"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "3号放映室在左边",
               "music": "gz7_21",
               "musicTime": "2"
            },
            {
               "type": 1,
               "lab": "这个工作态度可活不长啊",
               "music": "gz7_20",
               "musicTime": "3"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "好的，3号放映厅在左边",
               "music": "gz7_3",
               "musicTime": "2"
            },
            {
               "type": 1,
               "lab": "你这个票是在忽悠我吗？",
               "music": "gz7_22",
               "musicTime": "2"
            },

            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "谢谢你帮我开门啊！",
               "music": "gz7_23",
               "musicTime": "1.7"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "我被门卡住你都不帮我！",
               "music": "gz7_24",
               "musicTime": "2.3"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "你为什么要剪我的头发！",
               "music": "gz7_25",
               "musicTime": "2.2"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
      {
         pro: [
            {
               "type": 1,
               "lab": "看电影要专心看！",
               "music": "gz7_26",
               "musicTime": "1.5"
            },
            {
               "type": 3,
               "target": "cfLost",
            },
            {
               "type": 9,
               "lab": "游戏失败",
            }
         ]
      },
   ]
};
export default guize_config
