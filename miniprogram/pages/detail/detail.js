const util = require('../../utils/util.js');

Page({
  data: {
    matchId: '',
    match: {},              // 比赛基本信息
    hadHistory: [],         // 胜平负历史
    hhadHistory: [],        // 让球胜平负历史
    diffData: [],           // 赔率差值分析数据
    loading: false,
    error: ''
  },

  onLoad: function(options) {
    const matchId = options.matchId;
    if (!matchId) {
      this.setData({ error: '缺少比赛ID' });
      return;
    }
    
    this.setData({ matchId });
    this.loadMatchDetail();
  },

  /**
   * 加载比赛详情
   */
  async loadMatchDetail() {
    this.setData({ loading: true, error: '' });
    
    try {
      // 并行请求比赛详情和赔率历史
      const [matchRes, historyRes] = await Promise.all([
        wx.cloud.callFunction({
          name: 'getMatchOdds',
          data: { matchId: this.data.matchId }
        }),
        wx.cloud.callFunction({
          name: 'getOddsHistory',
          data: { matchId: this.data.matchId }
        })
      ]);
      
      // 处理比赛详情
      if (!matchRes.result || !matchRes.result.success) {
        throw new Error(matchRes.result?.error || '获取比赛详情失败');
      }
      
      // 处理赔率历史
      if (!historyRes.result || !historyRes.result.success) {
        throw new Error(historyRes.result?.error || '获取赔率历史失败');
      }
      
      const match = matchRes.result.match || {};
      const history = historyRes.result.history || {};
      
      // 格式化赔率数据
      this.formatOddsData(match, history.had_history || [], history.hhad_history || []);
      
      this.setData({ 
        match,
        hadHistory: history.had_history || [],
        hhadHistory: history.hhad_history || [],
        loading: false 
      });
      
      // 计算赔率差值分析
      this.calculateDiffAnalysis();
      
    } catch (err) {
      console.error('加载详情失败:', err);
      this.setData({ 
        error: err.message || '加载失败',
        loading: false 
      });
    }
  },

  /**
   * 格式化赔率数据
   */
  formatOddsData(match, hadHistory, hhadHistory) {
    // 格式化基本信息中的赔率
    if (match.had_odds) {
      match.had_odds.win = util.formatOdds(match.had_odds.win);
      match.had_odds.draw = util.formatOdds(match.had_odds.draw);
      match.had_odds.lose = util.formatOdds(match.had_odds.lose);
    }
    
    if (match.hhad_odds) {
      match.hhad_odds.handicap = util.formatOdds(match.hhad_odds.handicap);
      match.hhad_odds.win = util.formatOdds(match.hhad_odds.win);
      match.hhad_odds.draw = util.formatOdds(match.hhad_odds.draw);
      match.hhad_odds.lose = util.formatOdds(match.hhad_odds.lose);
    }
    
    // 格式化历史数据
    hadHistory.forEach(item => {
      item.win = util.formatOdds(item.win);
      item.draw = util.formatOdds(item.draw);
      item.lose = util.formatOdds(item.lose);
      item.short_time = util.formatShortTime(item.update_date, item.update_time);
    });
    
    hhadHistory.forEach(item => {
      item.handicap = util.formatOdds(item.handicap);
      item.win = util.formatOdds(item.win);
      item.draw = util.formatOdds(item.draw);
      item.lose = util.formatOdds(item.lose);
      item.short_time = util.formatShortTime(item.update_date, item.update_time);
    });
  },

  /**
   * 计算赔率差值分析（委托给 util 纯函数）
   */
  calculateDiffAnalysis() {
    const { hadHistory, hhadHistory } = this.data;
    const diffResults = util.calculateDiffAnalysis(hadHistory, hhadHistory);
    this.setData({ diffData: diffResults });
  },

  /**
   * 格式化短时间：去年份去秒，"2026-02-27 10:19:00" → "2-27 10:19"
   */
  formatShortTime(dateStr, timeStr) {
    try {
      const parts = (dateStr || '').split('-');
      const month = parseInt(parts[1], 10) || 0;
      const day = parts[2] || '00';
      const timeParts = (timeStr || '').split(':');
      const shortTime = timeParts[0] + ':' + timeParts[1];
      return month + '-' + day + ' ' + shortTime;
    } catch (e) {
      return (dateStr || '') + ' ' + (timeStr || '');
    }
  },

  /**
   * 计算时间差（秒）
   */
  timeDiff(time1, time2) {
    try {
      const parseTime = (time) => {
        const parts = time.split(' ');
        const t = parts.length > 1 ? parts[1] : time;
        const [h, m, s] = t.split(':').map(Number);
        return h * 3600 + m * 60 + s;
      };
      return Math.abs(parseTime(time1) - parseTime(time2));
    } catch (e) {
      return Infinity;
    }
  }
});