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
 * 获取在售比赛
 */
async function getSellingMatches() {
  try {
    const result = await request('/uniform/football/getMatchListV1.qry');
    const matches = [];
    
    const matchInfoList = result.matchInfoList || [];
    for (const dateGroup of matchInfoList) {
      const subMatches = dateGroup.subMatchList || [];
      for (const m of subMatches) {
        const match = parseSellingMatch(m);
        if (match) {
          matches.push(match);
        }
      }
    }
    
    return matches;
  } catch (error) {
    console.error('获取在售比赛失败:', error);
    return [];
  }
}

/**
 * 获取历史赛果
 */
async function getRecentResults() {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  
  return await queryResults(startDate, endDate);
}

/**
 * 按日期查询赛果
 */
async function getResultsByDate(date) {
  return await queryResults(date, date);
}

/**
 * 查询指定日期范围的赛果
 */
async function queryResults(startDate, endDate) {
  try {
    const result = await request('/uniform/football/getUniformMatchResultV1.qry', {
      matchBeginDate: startDate,
      matchEndDate: endDate,
      leagueId: '',
      pageSize: '30',
      pageNo: '1',
      isFix: '0',
      matchPage: '1',
      pcOrWap: '1'
    });
    
    const matches = [];
    const matchResults = result.matchResult || [];
    
    for (const m of matchResults) {
      const match = parseResultMatch(m);
      if (match) {
        matches.push(match);
      }
    }
    
    return matches;
  } catch (error) {
    console.error('查询赛果失败:', error);
    return [];
  }
}

/**
 * 解析在售比赛数据
 */
function parseSellingMatch(m) {
  const matchId = String(m.matchId || '');
  if (!matchId) return null;
  
  // 提取基本信息
  const match = {
    match_id: matchId,
    match_time: `${m.matchDate || ''} ${m.matchTime || ''}`,
    match_num: m.matchNumStr || '',
    league: m.leagueAbbName || '',
    home_team: m.homeTeamAbbName || '',
    away_team: m.awayTeamAbbName || '',
    status: 'selling'
  };
  
  // 提取赔率
  const oddsList = m.oddsList || [];
  let hadOdds = { win: 0, draw: 0, lose: 0 };
  let hhadOdds = { handicap: 0, win: 0, draw: 0, lose: 0 };
  
  for (const odds of oddsList) {
    const poolCode = odds.poolCode || '';
    if (poolCode === 'HAD') {
      hadOdds = {
        win: safeFloat(odds.h),
        draw: safeFloat(odds.d),
        lose: safeFloat(odds.a)
      };
    } else if (poolCode === 'HHAD') {
      hhadOdds = {
        handicap: safeFloat(odds.goalLine),
        win: safeFloat(odds.h),
        draw: safeFloat(odds.d),
        lose: safeFloat(odds.a)
      };
    }
  }
  
  match.had_odds = hadOdds;
  match.hhad_odds = hhadOdds;
  
  return match;
}

/**
 * 解析赛果数据
 */
function parseResultMatch(m) {
  const matchId = String(m.matchId || '');
  if (!matchId) return null;
  
  const match = {
    match_id: matchId,
    match_time: m.matchDate || '',
    match_num: m.matchNumStr || '',
    league: m.leagueNameAbbr || '',
    home_team: m.homeTeam || '',
    away_team: m.awayTeam || '',
    status: 'finished',
    half_score: m.sectionsNo1 || '',
    full_score: m.sectionsNo999 || '',
    result: translateWinFlag(m.winFlag || '')
  };
  
  // 赛果赔率
  match.had_odds = {
    win: safeFloat(m.h),
    draw: safeFloat(m.d),
    lose: safeFloat(m.a)
  };
  
  match.hhad_odds = {
    handicap: safeFloat(m.goalLine),
    win: 0,
    draw: 0,
    lose: 0
  };
  
  return match;
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
 * 翻译胜负标志
 */
function translateWinFlag(flag) {
  const mapping = { 'H': '主胜', 'D': '平局', 'A': '客胜' };
  return mapping[flag] || flag;
}

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  const { date } = event; // 可选日期参数 YYYY-MM-DD
  
  try {
    let matches = [];
    
    if (!date) {
      // 无指定日期：优先获取在售比赛
      matches = await getSellingMatches();
      if (matches.length === 0) {
        matches = await getRecentResults();
      }
    } else {
      // 指定日期：先尝试在售比赛中筛选
      const selling = await getSellingMatches();
      const dateMatches = selling.filter(m => 
        m.match_time && m.match_time.startsWith(date)
      );
      
      if (dateMatches.length > 0) {
        matches = dateMatches;
      } else {
        matches = await getResultsByDate(date);
      }
    }
    
    // 按时间排序
    matches.sort((a, b) => {
      const timeA = a.match_time || '';
      const timeB = b.match_time || '';
      return timeA.localeCompare(timeB);
    });
    
    return {
      success: true,
      count: matches.length,
      matches: matches
    };
    
  } catch (error) {
    console.error('获取比赛列表失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};