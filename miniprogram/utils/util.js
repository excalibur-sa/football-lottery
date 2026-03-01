/**
 * 格式化赔率数值，保留2位小数
 * @param {number|string} val - 赔率值
 * @returns {string} 格式化后的字符串
 */
function formatOdds(val) {
  if (val === undefined || val === null || val === '') return '-';
  const num = parseFloat(val);
  return isNaN(num) ? '-' : num.toFixed(2);
}

/**
 * 安全转换为浮点数
 * @param {*} val - 输入值
 * @returns {number} 浮点数
 */
function safeFloat(val) {
  if (val === null || val === undefined || val === '') return 0;
  const str = String(val).replace('+', '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * 计算赔率差值
 * @param {number} current - 当前赔率
 * @param {number} base - 基准赔率
 * @returns {number} 差值（保留2位小数）
 */
function calculateDiff(current, base) {
  if (!current || !base) return 0;
  return Math.round((current - base) * 100) / 100;
}

/**
 * 判断差值正负
 * @param {number} diff - 差值
 * @returns {string} '正' 或 '负'
 */
function getDiffSign(diff) {
  return diff >= 0 ? '正' : '负';
}

/**
 * 格式化日期时间
 * @param {string} datetime - 日期时间字符串
 * @returns {string} 格式化后的字符串
 */
function formatDateTime(datetime) {
  if (!datetime) return '';
  return datetime.replace('T', ' ').substring(0, 16);
}

/**
 * 格式化比赛时间（仅显示月日时分）
 * @param {string} datetime - 日期时间字符串
 * @returns {string} 格式化后的字符串
 */
function formatMatchTime(datetime) {
  if (!datetime) return '';
  const date = new Date(datetime.replace(/-/g, '/'));
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间(ms)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间(ms)
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay) {
  let lastExecTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastExecTime >= delay) {
      func.apply(this, args);
      lastExecTime = now;
    }
  };
}

/**
 * 显示加载提示
 * @param {string} title - 提示文字
 */
function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示成功提示
 * @param {string} title - 提示文字
 */
function showToast(title) {
  wx.showToast({ title, icon: 'none' });
}

/**
 * 显示错误提示
 * @param {string} title - 错误信息
 */
function showError(title) {
  wx.showToast({ title, icon: 'error' });
}

/**
 * 显示模态对话框
 * @param {string} content - 内容
 * @param {string} title - 标题
 * @returns {Promise<boolean>} 用户是否点击确定
 */
function showModal(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    });
  });
}

/**
 * 格式化短时间：去年份去秒
 * @param {string} dateStr - 日期字符串，如 "2026-02-27"
 * @param {string} timeStr - 时间字符串，如 "10:19:53"
 * @returns {string} 格式化后的字符串，如 "2-27 10:19"
 */
function formatShortTime(dateStr, timeStr) {
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
}

/**
 * 赔率差值分析（纯函数版本）
 * @param {Array} hadHistory - 胜平负历史数据（已格式化）
 * @param {Array} hhadHistory - 让球胜平负历史数据（已格式化）
 * @returns {Array} 差值分析结果数组
 */
function calculateDiffAnalysis(hadHistory, hhadHistory) {
  const hasHadUpdate = hadHistory.length >= 1;

  const canCalculate = (hasHadUpdate && hhadHistory.length >= 1) ||
                       (!hasHadUpdate && hhadHistory.length >= 2);
  if (!canCalculate) {
    return [];
  }

  const diffResults = [];
  const baseWin = safeFloat(hadHistory[0]?.win);
  const baseLose = safeFloat(hadHistory[0]?.lose);

  const usedHadForWL = new Set();
  const hadDdCovered = new Set();
  let lastUsedHadDraw = safeFloat(hadHistory[0]?.draw);

  const parseFullDatetime = (item) => {
    try {
      const dateStr = item.update_date || '';
      const timeStr = item.update_time || '';
      return new Date(`${dateStr}T${timeStr}`);
    } catch (e) {
      return null;
    }
  };

  const timeDiffSeconds = (t1, t2) => {
    try {
      const parseTime = (t) => {
        const parts = t.split(' ');
        const timeStr = parts.length > 1 ? parts[1] : t;
        const [h, m, s] = timeStr.split(':').map(Number);
        return h * 3600 + m * 60 + (s || 0);
      };
      return Math.abs(parseTime(t1) - parseTime(t2));
    } catch (e) {
      return Infinity;
    }
  };

  const findMatchingHadIndex = (hhadItem, tolerance = 300) => {
    const hhadDate = hhadItem.update_date || '';
    const hhadTime = hhadItem.update_time || '';
    let bestMatchIdx = null;
    let bestDiff = Infinity;

    hadHistory.forEach((had, idx) => {
      if ((had.update_date || '') !== hhadDate) return;
      const diff = timeDiffSeconds(had.update_time || '', hhadTime);
      if (diff < bestDiff && diff <= tolerance) {
        bestDiff = diff;
        bestMatchIdx = idx;
      }
    });

    return bestMatchIdx;
  };

  if (hasHadUpdate) {
    const totalRows = hhadHistory.length;

    for (let r = 0; r < totalRows; r++) {
      let winDiff = 0, loseDiff = 0, ddDiff = 0;
      let winDiffStr = '-', loseDiffStr = '-', ddDiffStr = '-';
      let winSign = '-', loseSign = '-', ddSign = '-';
      let curHadDraw = lastUsedHadDraw;

      if (r === 0) {
        if (hadHistory.length >= 2) {
          const currentWin = safeFloat(hadHistory[1]?.win);
          const currentLose = safeFloat(hadHistory[1]?.lose);
          winDiff = calculateDiff(currentWin, baseWin);
          loseDiff = calculateDiff(currentLose, baseLose);
          winDiffStr = winDiff.toFixed(2);
          loseDiffStr = loseDiff.toFixed(2);
          winSign = getDiffSign(winDiff);
          loseSign = getDiffSign(loseDiff);
          usedHadForWL.add(1);
        }

        curHadDraw = safeFloat(hadHistory[0]?.draw);
        hadDdCovered.add(0);
        lastUsedHadDraw = curHadDraw;
      } else {
        const matchedHadIdx = findMatchingHadIndex(hhadHistory[r]);

        if (matchedHadIdx !== null && !usedHadForWL.has(matchedHadIdx)) {
          const currentWin = safeFloat(hadHistory[matchedHadIdx]?.win);
          const currentLose = safeFloat(hadHistory[matchedHadIdx]?.lose);
          winDiff = calculateDiff(currentWin, baseWin);
          loseDiff = calculateDiff(currentLose, baseLose);
          winDiffStr = winDiff.toFixed(2);
          loseDiffStr = loseDiff.toFixed(2);
          winSign = getDiffSign(winDiff);
          loseSign = getDiffSign(loseDiff);
          usedHadForWL.add(matchedHadIdx);
          curHadDraw = safeFloat(hadHistory[matchedHadIdx]?.draw);
          hadDdCovered.add(matchedHadIdx);
          lastUsedHadDraw = curHadDraw;
        } else {
          // 时间匹配到的HAD已用于胜/负差，标记其双平差也已覆盖
          if (matchedHadIdx !== null) {
            hadDdCovered.add(matchedHadIdx);
          }
          // 双平差：向前查找时间戳<=当前HHAD的最近HAD
          const hhadDt = parseFullDatetime(hhadHistory[r]);
          if (hhadDt) {
            let bestCandidate = null;
            let bestDt = null;
            hadHistory.forEach((hadItem, idx) => {
              const hadDt = parseFullDatetime(hadItem);
              if (hadDt && hadDt <= hhadDt) {
                if (bestDt === null || hadDt > bestDt) {
                  bestDt = hadDt;
                  bestCandidate = hadItem;
                }
              }
            });
            if (bestCandidate) {
              curHadDraw = safeFloat(bestCandidate.draw);
              lastUsedHadDraw = curHadDraw;
            }
          }
        }
      }

      const curHhadDraw = safeFloat(hhadHistory[r]?.draw);
      ddDiff = calculateDiff(curHhadDraw, curHadDraw);
      ddDiffStr = ddDiff.toFixed(2);
      ddSign = getDiffSign(ddDiff);

      diffResults.push({
        winDiff, loseDiff, ddDiff,
        winDiffStr, loseDiffStr, ddDiffStr,
        winSign, loseSign, ddSign,
        isNegative: winDiff < 0 || loseDiff < 0 || ddDiff < 0
      });
    }

    for (let hadIdx = 1; hadIdx < hadHistory.length; hadIdx++) {
      if (usedHadForWL.has(hadIdx) && hadDdCovered.has(hadIdx)) {
        continue;
      }

      let winDiff = 0, loseDiff = 0, ddDiff = 0;
      let winDiffStr = '-', loseDiffStr = '-', ddDiffStr = '-';
      let winSign = '-', loseSign = '-', ddSign = '-';

      if (!usedHadForWL.has(hadIdx)) {
        const currentWin = safeFloat(hadHistory[hadIdx]?.win);
        const currentLose = safeFloat(hadHistory[hadIdx]?.lose);
        winDiff = calculateDiff(currentWin, baseWin);
        loseDiff = calculateDiff(currentLose, baseLose);
        winDiffStr = winDiff.toFixed(2);
        loseDiffStr = loseDiff.toFixed(2);
        winSign = getDiffSign(winDiff);
        loseSign = getDiffSign(loseDiff);
      }

      const hadDt = parseFullDatetime(hadHistory[hadIdx]);
      let nearestHhadDraw = null;
      if (hadDt) {
        let bestCandidate = null;
        let bestDt = null;
        hhadHistory.forEach(hhadItem => {
          const hhadDt = parseFullDatetime(hhadItem);
          if (hhadDt && hhadDt <= hadDt) {
            if (bestDt === null || hhadDt > bestDt) {
              bestDt = hhadDt;
              bestCandidate = hhadItem;
            }
          }
        });
        if (bestCandidate) {
          nearestHhadDraw = safeFloat(bestCandidate.draw);
        }
      }

      if (nearestHhadDraw !== null) {
        const curHadDraw = safeFloat(hadHistory[hadIdx]?.draw);
        ddDiff = calculateDiff(nearestHhadDraw, curHadDraw);
        ddDiffStr = ddDiff.toFixed(2);
        ddSign = getDiffSign(ddDiff);
      }

      diffResults.push({
        winDiff, loseDiff, ddDiff,
        winDiffStr, loseDiffStr, ddDiffStr,
        winSign, loseSign, ddSign,
        isNegative: winDiff < 0 || loseDiff < 0 || ddDiff < 0
      });
    }
  } else {
    const baseHhadDraw = safeFloat(hhadHistory[0]?.draw);

    for (let i = 1; i < hhadHistory.length; i++) {
      const curHhadDraw = safeFloat(hhadHistory[i]?.draw);
      const ddDiff = calculateDiff(curHhadDraw, baseHhadDraw);

      diffResults.push({
        winDiff: 0, loseDiff: 0, ddDiff,
        winDiffStr: '-', loseDiffStr: '-',
        ddDiffStr: ddDiff.toFixed(2),
        winSign: '-', loseSign: '-',
        ddSign: getDiffSign(ddDiff),
        isNegative: ddDiff < 0
      });
    }
  }

  return diffResults;
}

/**
 * 格式化分享文本
 * @param {string} date - 日期字符串
 * @param {Array} matchDetailsArray - 比赛详情数组 [{match, hadHistory, hhadHistory, diffData}]
 * @returns {string} 格式化后的分享文本
 */
function formatShareText(date, matchDetailsArray) {
  let text = '竞彩足球数据分享\n';
  text += `日期: ${date} | 场次: ${matchDetailsArray.length}场\n`;

  matchDetailsArray.forEach((detail, index) => {
    const { match, hadHistory, hhadHistory, diffData } = detail;
    text += '\n';
    text += `${index + 1}. ${match.home_team || ''} vs ${match.away_team || ''}\n`;
    text += `   时间: ${formatMatchTime(match.match_time)} | 联赛: ${match.league || ''}\n`;

    if (match.had_odds) {
      text += `   胜平负: ${match.had_odds.win || '-'} / ${match.had_odds.draw || '-'} / ${match.had_odds.lose || '-'}\n`;
    }
    if (match.hhad_odds && (match.hhad_odds.win || match.hhad_odds.draw || match.hhad_odds.lose)) {
      text += `   让球(${match.hhad_odds.handicap || 0}): ${match.hhad_odds.win || '-'} / ${match.hhad_odds.draw || '-'} / ${match.hhad_odds.lose || '-'}\n`;
    }

    if (hadHistory && hadHistory.length > 0) {
      text += `\n   胜平负历史(${hadHistory.length}条):\n`;
      hadHistory.forEach(item => {
        const t = item.short_time || formatShortTime(item.update_date, item.update_time);
        text += `   ${t}  ${item.win}/${item.draw}/${item.lose}\n`;
      });
    }

    if (hhadHistory && hhadHistory.length > 0) {
      text += `\n   让球历史(${hhadHistory.length}条):\n`;
      hhadHistory.forEach(item => {
        const t = item.short_time || formatShortTime(item.update_date, item.update_time);
        text += `   ${t}  ${item.win}/${item.draw}/${item.lose}\n`;
      });
    }

    if (diffData && diffData.length > 0) {
      text += `\n   赔率差值:\n`;
      text += `   胜差  负差  双平差 胜正负 负正负 双平正负\n`;
      diffData.forEach(d => {
        const w = (d.winDiffStr || '-').padEnd(6);
        const l = (d.loseDiffStr || '-').padEnd(6);
        const dd = (d.ddDiffStr || '-').padEnd(7);
        const ws = (d.winSign || '-').padEnd(7);
        const ls = (d.loseSign || '-').padEnd(7);
        const ds = d.ddSign || '-';
        text += `   ${w}${l}${dd}${ws}${ls}${ds}\n`;
      });
    }
  });

  return text;
}

module.exports = {
  formatOdds,
  safeFloat,
  calculateDiff,
  getDiffSign,
  formatDateTime,
  formatMatchTime,
  formatShortTime,
  calculateDiffAnalysis,
  formatShareText,
  deepClone,
  debounce,
  throttle,
  showLoading,
  hideLoading,
  showToast,
  showError,
  showModal
};