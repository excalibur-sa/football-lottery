# 项目结构说明

## 当前目录结构

```
bonus/                          # 项目根目录
├── miniprogram/                #✅微信小程序代码（导入微信开发者工具的目录）
│   ├── app.js                 #小程序入口文件
│   ├── app.json               #小配置序配置文件
│   ├── app.wxss               # 全局样式
│   ├── pages/                 # 页面目录
│   │   ├── index/             #首
│   │  └── detail/            # 详情页
│   ├── utils/                 #工具函数
│   └── sitemap.json           #小程序索引配置
│
├── cloudfunctions/            #✅ 云函数代码（部署到微信云开发）
│   ├── getMatches/            # 获取比赛列表
│   ├── getMatchOdds/          # 获取赔率详情
│  └── getOddsHistory/       # 获取赔率历史
│
├── api/                       #❌原Flask Web后端代码（无需导入）
├── services/                  # ❌ 原Flask Web后端代码（无需导入）
├── templates/                 # ❌原Flask Web前端模板（无需导入）
├── static/                    # ❌ 原Flask Web静态资源（无需导入）
├── app.py                     # ❌ Flask主应用（无需导入）
├── config.py                  # ❌ Flask配置（无需导入）
├── requirements.txt            # ❌ Python依赖（无需导入）
│
├── project.config.json        #✅小程序项目配置文件
├── README_MINIPROGRAM.md      #✅小程序部署说明
└── PROJECT_STRUCTURE.md       #✅ 本文件
```

##导入微信开发者工具说明

###正确导入方式

1. **打开微信开发者工具**
2. **选择"导入项目"**
3. **项目目录选择**：`bonus/miniprogram/`
4. **AppID填写**：你的小程序AppID
5. **项目名称**：竞彩足球数据

### 为什么要导入miniprogram子目录？

-微信开发者工具会自动识别该目录为小程序项目根目录
- 该目录包含了小程序的所有必要文件
-导入无关的Flask Web代码造成混乱

### 云函数部署

云函数代码位于 `bonus/cloudfunctions/` 目录下，需要：
1. 在微信开发者工具中开通云开发
2. 分别上传三个云函数文件夹
3. 云端安装依赖

### 保留原有代码

原有的Flask Web应用代码完整保留，如需恢复Web版本：
1.切换到主分支（master/main）
2.运行 `python app.py`启动Flask服务