# Football Lottery (竞彩足球数据查询与分析系统)

基于Flask的竞彩足球数据查询与分析Web应用，支持赔率查看、历史赔率变化追踪、数据导出等功能。

## 功能特性

- 查看当日竞彩足球比赛列表
- 查看单场比赛完整赔率信息（胜平负、让球胜平负、比分、总进球、半全场）
- 查看赔率历史变化记录
- 赔率差值分析（胜的赔率差、负的赔率差、双平赔率差）
- 导出比赛数据到Excel文件

## 数据来源

支持三种数据提供者：
- `sporttery` - 竞彩网官方数据（推荐）
- `jisuapi` - 极速数据API
- `mock` - 模拟数据（开发测试用）

## 安装

```bash
# 克隆项目
git clone https://github.com/excalibur-sa/football-lottery.git
cd football-lottery

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\\Scripts\\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

## 配置

创建 `.env` 文件配置环境变量：

```env
DATA_PROVIDER=sporttery
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=True
```

## 运行

```bash
python app.py
```

访问 http://127.0.0.1:5000 查看应用。

## 项目结构

```
football-lottery/
├── api/                    # 数据提供者
│   ├── base.py            # 抽象基类
│   ├── sporttery_provider.py  # 竞彩网官方API
│   ├── jisuapi_provider.py    # 极速数据API
│   └── mock_provider.py       # 模拟数据
├── services/              # 业务服务
│   ├── match_service.py   # 比赛数据服务
│   └── excel_service.py   # Excel导出服务
├── templates/             # HTML模板
├── static/               # 静态资源
├── output/               # Excel输出目录
├── app.py                # Flask应用入口
├── config.py             # 配置文件
└── requirements.txt      # 依赖列表
```

## License

MIT
