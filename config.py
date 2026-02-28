import os
from dotenv import load_dotenv

load_dotenv()

# 数据提供者: 'mock', 'jisuapi', 或 'sporttery'
# sporttery - 竞彩网官方数据（推荐）
DATA_PROVIDER = os.getenv('DATA_PROVIDER', 'sporttery')

# 极速数据 API Key
JISUAPI_KEY = os.getenv('JISUAPI_KEY', '')

# Excel 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')

# Flask 配置
DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
HOST = os.getenv('FLASK_HOST', '127.0.0.1')
PORT = int(os.getenv('FLASK_PORT', '5000'))
