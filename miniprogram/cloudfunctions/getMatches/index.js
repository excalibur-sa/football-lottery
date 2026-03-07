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
      pageSize: '100',
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
    match_time: `${m.matchDate || ''}${m.matchTime ? ' ' + m.matchTime : ''}`,
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
 * 合并在售和已完赛场次，按match_id去重（在售优先）
 */
function mergeMatches(sellingList, resultList) {
  const idSet = new Set(sellingList.map(m => m.match_id));
  const merged = [...sellingList];
  for (const m of resultList) {
    if (!idSet.has(m.match_id)) {
      merged.push(m);
    }
  }
  return merged;
}

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  const { date, searchTeam, searchDate } = event;
  
  try {
    // 搜索模式：按队名搜索前后4天共9天的场次
    if (searchTeam && searchDate) {
      return await handleSearch(searchTeam, searchDate);
    }

    let matches = [];
    
    if (!date) {
      // 无指定日期：获取在售比赛 + 当日已完赛
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const [selling, results] = await Promise.all([
        getSellingMatches(),
        getResultsByDate(todayStr)
      ]);
      matches = mergeMatches(selling, results);
    } else {
      // 指定日期：同时获取在售和已完赛，合并去重
      const [selling, results] = await Promise.all([
        getSellingMatches(),
        getResultsByDate(date)
      ]);
      const dateSellingMatches = selling.filter(m => 
        m.match_time && m.match_time.startsWith(date)
      );
      matches = mergeMatches(dateSellingMatches, results);
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

/**
 * 模糊匹配：先尝试子串匹配，再尝试子序列匹配
 * 例："皇马" 匹配 "皇家马德里"（皇...马 子序列命中）
 *     "国米" 匹配 "国际米兰"（国...米 子序列命中）
 *     "曼联" 匹配 "曼彻斯特联"（曼...联 子序列命中）
 */
function fuzzyMatch(keyword, text) {
  if (!keyword || !text) return false;
  const kw = keyword.toLowerCase();
  const t = text.toLowerCase();
  // 子串匹配
  if (t.includes(kw)) return true;
  // 子序列匹配：关键词的每个字符按顺序出现在文本中
  let ki = 0;
  for (let ti = 0; ti < t.length && ki < kw.length; ti++) {
    if (t[ti] === kw[ki]) ki++;
  }
  return ki === kw.length;
}

/**
 * 搜索模式：以searchDate为基准，搜索前后4天（共9天）的比赛
 */
async function handleSearch(teamName, baseDate) {
  try {
    const keyword = teamName.trim();
    if (!keyword) {
      return { success: true, count: 0, matches: [] };
    }

    // 生成9天日期范围
    const base = new Date(baseDate.replace(/-/g, '/'));
    const startD = new Date(base.getTime() - 4 * 24 * 60 * 60 * 1000);
    const endD = new Date(base.getTime() + 4 * 24 * 60 * 60 * 1000);
    const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startDate = fmtDate(startD);
    const endDate = fmtDate(endD);

    // 并行获取在售比赛 + 日期范围内的赛果
    const [selling, results] = await Promise.all([
      getSellingMatches(),
      queryResults(startDate, endDate)
    ]);

    // 在售比赛按日期范围过滤
    const sellingInRange = selling.filter(m => {
      if (!m.match_time) return false;
      const matchDate = m.match_time.substring(0, 10);
      return matchDate >= startDate && matchDate <= endDate;
    });

    // 合并去重
    const allMatches = mergeMatches(sellingInRange, results);

    // 按队名模糊筛选
    const filtered = allMatches.filter(m => {
      return fuzzyMatch(keyword, m.home_team) || fuzzyMatch(keyword, m.away_team);
    });

    // 按时间排序
    filtered.sort((a, b) => {
      const timeA = a.match_time || '';
      const timeB = b.match_time || '';
      return timeA.localeCompare(timeB);
    });

    return {
      success: true,
      count: filtered.length,
      matches: filtered,
      searchInfo: { team: teamName, dateRange: `${startDate} ~ ${endDate}` }
    };
  } catch (error) {
    console.error('搜索比赛失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}