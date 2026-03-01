const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 竞彩网API基础配置
const BASE_URL = 'https://webapi.sporttery.cn/gateway';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Referer': 'https://www.sporttery.cn/',
  'Origin': 'https://www.sporttery.cn'
};

/**
 * 发送API请求
 */
async function request(endpoint, params = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, clientCode: '3001' },
      headers: HEADERS,
      timeout: 10000
    });
    
    if (response.data && response.data.success) {
      return response.data.value || {};
    } else {
      throw new Error(response.data?.errorMessage || 'API请求失败');
    }
  } catch (error) {
    console.error('API请求错误:', error.message);
    throw new Error(`网络请求失败: ${error.message}`);
  }
}

/**
 * 安全转换为浮点数
 */
function safeFloat(val) {
  if (val === null || val === undefined || val === '') return 0;
  try {
    return parseFloat(String(val).replace('+', ''));
  } catch (e) {
    return 0;
  }
}

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  const { matchId } = event;
  
  if (!matchId) {
    return {
      success: false,
      error: '缺少比赛ID参数'
    };
  }
  
  try {
    // 调用赔率历史API
    const result = await request('/uniform/football/getFixedBonusV1.qry', {
      matchId: matchId
    });
    
    const oddsHistory = result.oddsHistory || {};
    
    // 解析胜平负历史
    const hadHistory = [];
    const hadList = oddsHistory.hadList || [];
    for (const item of hadList) {
      hadHistory.push({
        update_date: item.updateDate || '',
        update_time: item.updateTime || '',
        win: safeFloat(item.h),
        draw: safeFloat(item.d),
        lose: safeFloat(item.a)
      });
    }
    
    // 解析让球胜平负历史
    const hhadHistory = [];
    const hhadList = oddsHistory.hhadList || [];
    for (const item of hhadList) {
      hhadHistory.push({
        update_date: item.updateDate || '',
        update_time: item.updateTime || '',
        handicap: item.goalLine || '',
        win: safeFloat(item.h),
        draw: safeFloat(item.d),
        lose: safeFloat(item.a)
      });
    }
    
    return {
      success: true,
      history: {
        had_history: hadHistory,
        hhad_history: hhadHistory
      }
    };
    
  } catch (error) {
    console.error('获取赔率历史失败:', error);
    // 返回空数组而不是错误，避免前端显示错误
    return {
      success: true,
      history: {
        had_history: [],
        hhad_history: []
      }
    };
  }
};