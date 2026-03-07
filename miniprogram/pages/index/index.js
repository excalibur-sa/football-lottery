const util = require('../../utils/util.js');

Page({
  data: {
    matches: [],           // 比赛列表（显示排序：未完赛在前，已完赛在后）
    loading: false,        // 加载状态
    error: '',             // 错误信息
    currentDate: '',       // 当前选择的日期
    selectedIds: [],       // 选中的比赛ID列表
    allSelected: false,    // 是否全选
    searchKeyword: '',     // 搜索关键词
    isSearchMode: false,   // 是否搜索模式
    searchInfo: null,      // 搜索结果信息
    finishedStartIndex: -1 // 已完赛场次起始索引（-1表示无已完赛场次）
  },

  onLoad: function() {
    // 设置默认日期为今天
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.setData({ currentDate: dateStr });
    
    // 加载比赛数据
    this.loadMatches();
  },

  /**
   * 对比赛列表按显示规则排序：未完赛在前，已完赛在后，各自内部按时间排序
   * 返回 { sorted, finishedStartIndex }
   */
  _sortMatchesForDisplay(matchList) {
    const unfinished = matchList.filter(m => m.status !== 'finished');
    const finished = matchList.filter(m => m.status === 'finished');
    const timeSort = (a, b) => (a.match_time || '').localeCompare(b.match_time || '');
    unfinished.sort(timeSort);
    finished.sort(timeSort);
    const sorted = [...unfinished, ...finished];
    const finishedStartIndex = unfinished.length > 0 && finished.length > 0 ? unfinished.length : -1;
    return { sorted, finishedStartIndex };
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.loadMatches().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载比赛数据
   */
  async loadMatches() {
    this.setData({ loading: true, error: '' });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMatches',
        data: { date: this.data.currentDate }
      });
      
      if (res.result && res.result.success) {
        const rawMatches = (res.result.matches || []).map(m => ({...m, checked: false}));
        const { sorted, finishedStartIndex } = this._sortMatchesForDisplay(rawMatches);
        this.setData({ 
          matches: sorted,
          loading: false,
          selectedIds: [],
          allSelected: false,
          finishedStartIndex
        });
      } else {
        throw new Error(res.result?.error || '获取数据失败');
      }
    } catch (err) {
      console.error('加载比赛失败:', err);
      this.setData({ 
        error: err.message || '网络请求失败',
        loading: false 
      });
    }
  },

  /**
   * 日期选择改变
   */
  onDateChange: function(e) {
    this.setData({ 
      currentDate: e.detail.value,
      selectedIds: [],
      allSelected: false,
      isSearchMode: false,
      searchInfo: null
    });
    this.loadMatches();
  },

  /**
   * 刷新按钮点击
   */
  reloadMatches: function() {
    this.loadMatches();
  },

  /**
   * 复选框点击事件
   */
  onCheckboxTap: function(e) {
    const matchId = String(e.currentTarget.dataset.id);
    const matches = this.data.matches.map(m => {
      if (String(m.match_id) === matchId) {
        return {...m, checked: !m.checked};
      }
      return m;
    });
    const selectedIds = matches.filter(m => m.checked).map(m => m.match_id);
    
    this.setData({ 
      matches,
      selectedIds,
      allSelected: selectedIds.length === matches.length && selectedIds.length > 0
    });
  },

  /**
   * 全选/取消全选
   */
  selectAll: function() {
    const { allSelected, matches } = this.data;
    const newChecked = !allSelected;
    const updatedMatches = matches.map(m => ({...m, checked: newChecked}));
    const selectedIds = newChecked ? updatedMatches.map(m => m.match_id) : [];
    
    this.setData({ 
      matches: updatedMatches,
      selectedIds,
      allSelected: newChecked
    });
  },

  /**
   * 查看详情
   */
  viewDetail: function(e) {
    const matchId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?matchId=${matchId}`
    });
  },

  /**
   * 搜索输入变化
   */
  onSearchInput: function(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  /**
   * 执行搜索
   */
  async onSearch() {
    const keyword = (this.data.searchKeyword || '').trim();
    if (!keyword) {
      util.showToast('请输入队伍名称');
      return;
    }

    this.setData({ loading: true, error: '', isSearchMode: true, searchInfo: null });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getMatches',
        data: { 
          searchTeam: keyword,
          searchDate: this.data.currentDate
        }
      });

      if (res.result && res.result.success) {
        const rawMatches = (res.result.matches || []).map(m => ({...m, checked: false}));
        const { sorted, finishedStartIndex } = this._sortMatchesForDisplay(rawMatches);
        this.setData({
          matches: sorted,
          loading: false,
          selectedIds: [],
          allSelected: false,
          searchInfo: res.result.searchInfo || null,
          finishedStartIndex
        });
        if (res.result.matches.length === 0) {
          util.showToast('未找到相关比赛');
        }
      } else {
        throw new Error(res.result?.error || '搜索失败');
      }
    } catch (err) {
      console.error('搜索失败:', err);
      this.setData({
        error: err.message || '搜索请求失败',
        loading: false
      });
    }
  },

  /**
   * 清除搜索，恢复普通模式
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      isSearchMode: false,
      searchInfo: null
    });
    this.loadMatches();
  },

  /**
   * 分享数据（包含赔率历史和赔率差值分析）
   */
  shareData: async function() {
    const { selectedIds, matches } = this.data;
    
    if (selectedIds.length === 0) {
      util.showToast('请先选择比赛');
      return;
    }
    
    try {
      util.showLoading('正在获取赔率数据...');
      
      const selectedMatches = matches.filter(match => 
        selectedIds.includes(match.match_id)
      );
      
      // 分享时按时间顺序排列（不按显示分组排序）
      selectedMatches.sort((a, b) => (a.match_time || '').localeCompare(b.match_time || ''));
      
      // 并行获取每场比赛的赔率历史
      const historyPromises = selectedMatches.map(match => 
        wx.cloud.callFunction({
          name: 'getOddsHistory',
          data: { matchId: match.match_id }
        }).catch(err => {
          console.error(`获取赔率历史失败(${match.match_id}):`, err);
          return { result: { success: false } };
        })
      );
      
      const historyResults = await Promise.all(historyPromises);
      
      // 组装每场比赛的完整数据
      const matchDetailsArray = selectedMatches.map((match, index) => {
        const historyRes = historyResults[index];
        const history = (historyRes.result && historyRes.result.success) 
          ? (historyRes.result.history || {}) 
          : {};
        
        // 浅拷贝match，避免污染列表数据
        const matchCopy = JSON.parse(JSON.stringify(match));
        const hadHistory = JSON.parse(JSON.stringify(history.had_history || []));
        const hhadHistory = JSON.parse(JSON.stringify(history.hhad_history || []));
        
        // 格式化赔率数据
        if (matchCopy.had_odds) {
          matchCopy.had_odds.win = util.formatOdds(matchCopy.had_odds.win);
          matchCopy.had_odds.draw = util.formatOdds(matchCopy.had_odds.draw);
          matchCopy.had_odds.lose = util.formatOdds(matchCopy.had_odds.lose);
        }
        if (matchCopy.hhad_odds) {
          matchCopy.hhad_odds.handicap = util.formatOdds(matchCopy.hhad_odds.handicap);
          matchCopy.hhad_odds.win = util.formatOdds(matchCopy.hhad_odds.win);
          matchCopy.hhad_odds.draw = util.formatOdds(matchCopy.hhad_odds.draw);
          matchCopy.hhad_odds.lose = util.formatOdds(matchCopy.hhad_odds.lose);
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
        
        // 计算赔率差值
        const diffData = util.calculateDiffAnalysis(hadHistory, hhadHistory);
        
        return { match: matchCopy, hadHistory, hhadHistory, diffData };
      });
      
      // 生成分享文本
      const shareText = util.formatShareText(this.data.currentDate, matchDetailsArray);
      
      util.hideLoading();
      
      // 复制到剪贴板
      await wx.setClipboardData({ data: shareText });
      util.showToast('已复制到剪贴板');
      
    } catch (err) {
      util.hideLoading();
      console.error('分享失败:', err);
      util.showError('分享失败');
    }
  }
});