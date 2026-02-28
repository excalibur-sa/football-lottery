document.addEventListener('DOMContentLoaded', function () {
    // 设置日期控件默认值为当天
    const now = new Date();
    const dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('match-date');
    dateInput.value = dateStr;
    document.getElementById('current-date').textContent = dateStr;

    const selectedIds = new Set();
    let allSelectMode = false;

    loadMatches();

    // 重新生成按钮
    document.getElementById('btn-reload').addEventListener('click', function () {
        const date = dateInput.value;
        if (!date) {
            showError('请选择日期');
            return;
        }
        document.getElementById('current-date').textContent = date;
        selectedIds.clear();
        allSelectMode = false;
        const selectAllBtn = document.getElementById('btn-select-all');
        if (selectAllBtn) selectAllBtn.textContent = '全选';
        const checkAll = document.getElementById('check-all');
        if (checkAll) checkAll.checked = false;
        loadMatches(date);
    });

    // 加载比赛列表
    function loadMatches(date) {
        // 重置UI状态
        document.getElementById('match-table-wrapper').classList.add('d-none');
        document.getElementById('no-data').classList.add('d-none');
        document.getElementById('error-area').classList.add('d-none');
        document.getElementById('loading').classList.remove('d-none');

        var url = '/api/matches';
        if (date) {
            url += '?date=' + encodeURIComponent(date);
        }

        fetch(url)
            .then(r => r.json())
            .then(data => {
                document.getElementById('loading').classList.add('d-none');
                if (!data.success) {
                    showError(data.error || '加载失败');
                    return;
                }
                if (data.count === 0) {
                    document.getElementById('no-data').classList.remove('d-none');
                    return;
                }
                renderMatches(data.matches);
                document.getElementById('match-table-wrapper').classList.remove('d-none');
            })
            .catch(err => {
                document.getElementById('loading').classList.add('d-none');
                showError('网络请求失败: ' + err.message);
            });
    }

    // 渲染比赛表格
    function renderMatches(matches) {
        const tbody = document.getElementById('match-body');
        tbody.innerHTML = '';

        matches.forEach(m => {
            // 比赛行
            const tr = document.createElement('tr');
            tr.className = 'match-row';
            tr.dataset.matchId = m.match_id;
            tr.innerHTML =
                '<td><input type="checkbox" class="form-check-input match-check" data-id="' + m.match_id + '"></td>' +
                '<td>' + escapeHtml(m.match_time ? m.match_time.slice(0, 16) : '') + '</td>' +
                '<td><span class="badge bg-info text-dark">' + escapeHtml(m.league) + '</span></td>' +
                '<td class="fw-bold text-end">' + escapeHtml(m.home_team) + '</td>' +
                '<td class="text-center text-muted">vs</td>' +
                '<td class="fw-bold">' + escapeHtml(m.away_team) + '</td>' +
                '<td><button class="btn btn-outline-primary btn-sm btn-detail" data-id="' + m.match_id + '">查看赔率</button></td>';
            tbody.appendChild(tr);

            // 赔率详情折叠行（初始隐藏）
            const detailTr = document.createElement('tr');
            detailTr.id = 'detail-' + m.match_id;
            detailTr.className = 'd-none detail-row';
            detailTr.innerHTML = '<td colspan="7"><div class="p-3 bg-light rounded" id="detail-content-' + m.match_id + '">加载中...</div></td>';
            tbody.appendChild(detailTr);
        });

        // 绑定事件
        bindEvents();
    }

    function bindEvents() {
        // 复选框
        document.querySelectorAll('.match-check').forEach(cb => {
            cb.addEventListener('change', function () {
                if (this.checked) {
                    selectedIds.add(this.dataset.id);
                } else {
                    selectedIds.delete(this.dataset.id);
                }
                updateExportButton();
            });
        });

        // 查看赔率按钮
        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.dataset.id;
                const detailRow = document.getElementById('detail-' + id);
                if (detailRow.classList.contains('d-none')) {
                    detailRow.classList.remove('d-none');
                    this.textContent = '收起';
                    this.classList.replace('btn-outline-primary', 'btn-outline-secondary');
                    loadOdds(id);
                } else {
                    detailRow.classList.add('d-none');
                    this.textContent = '查看赔率';
                    this.classList.replace('btn-outline-secondary', 'btn-outline-primary');
                }
            });
        });

        // 全选
        document.getElementById('check-all').addEventListener('change', function () {
            document.querySelectorAll('.match-check').forEach(cb => {
                cb.checked = this.checked;
                if (this.checked) {
                    selectedIds.add(cb.dataset.id);
                } else {
                    selectedIds.delete(cb.dataset.id);
                }
            });
            updateExportButton();
        });

        // 全选按钮
        document.getElementById('btn-select-all').addEventListener('click', function () {
            allSelectMode = !allSelectMode;
            document.getElementById('check-all').checked = allSelectMode;
            document.querySelectorAll('.match-check').forEach(cb => {
                cb.checked = allSelectMode;
                if (allSelectMode) {
                    selectedIds.add(cb.dataset.id);
                } else {
                    selectedIds.delete(cb.dataset.id);
                }
            });
            this.textContent = allSelectMode ? '取消全选' : '全选';
            updateExportButton();
        });

        // 导出按钮
        document.getElementById('btn-export').addEventListener('click', exportExcel);
    }

    // 加载赔率详情
    function loadOdds(matchId) {
        const container = document.getElementById('detail-content-' + matchId);
        container.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm"></div> 加载赔率中...</div>';

        fetch('/api/matches/' + matchId + '/odds')
            .then(r => r.json())
            .then(data => {
                if (!data.success) {
                    container.innerHTML = '<div class="text-danger">加载失败: ' + escapeHtml(data.error || '') + '</div>';
                    return;
                }
                container.innerHTML = renderOddsDetail(data.match);
            })
            .catch(err => {
                container.innerHTML = '<div class="text-danger">请求失败: ' + escapeHtml(err.message) + '</div>';
            });
    }

    // 渲染赔率详情HTML
    function renderOddsDetail(m) {
        const had = m.had_odds || {};
        const hhad = m.hhad_odds || {};
        
        const hadHistory = m.had_history || [];
        const hhadHistory = m.hhad_history || [];

        let html = '<div class="row">';

        // 胜平负
        html += '<div class="col-md-6 mb-3">' +
            '<h6 class="section-title">胜平负赔率</h6>' +
            '<table class="table table-sm table-bordered mb-0">' +
            '<thead><tr class="table-primary"><th>胜</th><th>平</th><th>负</th></tr></thead>' +
            '<tbody><tr><td>' + fmt(had.win) + '</td><td>' + fmt(had.draw) + '</td><td>' + fmt(had.lose) + '</td></tr></tbody>' +
            '</table></div>';

        // 让球胜平负
        html += '<div class="col-md-6 mb-3">' +
            '<h6 class="section-title">让球胜平负 (让 ' + (hhad.handicap || 0) + ' 球)</h6>' +
            '<table class="table table-sm table-bordered mb-0">' +
            '<thead><tr class="table-primary"><th>让胜</th><th>让平</th><th>让负</th></tr></thead>' +
            '<tbody><tr><td>' + fmt(hhad.win) + '</td><td>' + fmt(hhad.draw) + '</td><td>' + fmt(hhad.lose) + '</td></tr></tbody>' +
            '</table></div>';

        // 胜平负赔率历史
        if (hadHistory.length > 0) {
            html += '<div class="col-md-6 mb-3">' +
                '<h6 class="section-title">胜平负赔率变化历史 <span class="badge bg-secondary">' + hadHistory.length + '条</span></h6>' +
                '<div style="max-height: 200px; overflow-y: auto;">' +
                '<table class="table table-sm table-bordered mb-0 table-striped">' +
                '<thead class="sticky-top bg-white"><tr class="table-info"><th>更新时间</th><th>胜</th><th>平</th><th>负</th></tr></thead><tbody>';
            hadHistory.forEach(function (item) {
                html += '<tr><td><small>' + escapeHtml(item.update_date + ' ' + item.update_time) + '</small></td>' +
                    '<td>' + fmt(item.win) + '</td><td>' + fmt(item.draw) + '</td><td>' + fmt(item.lose) + '</td></tr>';
            });
            html += '</tbody></table></div></div>';
        }

        // 让球胜平负赔率历史
        if (hhadHistory.length > 0) {
            const firstHandicap = hhadHistory[0] ? hhadHistory[0].handicap : '';
            html += '<div class="col-md-6 mb-3">' +
                '<h6 class="section-title">让球胜平负赔率变化历史 (让' + firstHandicap + '球) <span class="badge bg-secondary">' + hhadHistory.length + '条</span></h6>' +
                '<div style="max-height: 200px; overflow-y: auto;">' +
                '<table class="table table-sm table-bordered mb-0 table-striped">' +
                '<thead class="sticky-top bg-white"><tr class="table-info"><th>更新时间</th><th>让胜</th><th>让平</th><th>让负</th></tr></thead><tbody>';
            hhadHistory.forEach(function (item) {
                html += '<tr><td><small>' + escapeHtml(item.update_date + ' ' + item.update_time) + '</small></td>' +
                    '<td>' + fmt(item.win) + '</td><td>' + fmt(item.draw) + '</td><td>' + fmt(item.lose) + '</td></tr>';
            });
            html += '</tbody></table></div></div>';
        }

        // 赔率差值分析
        if (hadHistory.length >= 2 && hhadHistory.length >= 1) {
            var baseWin = hadHistory[0].win || 0;
            var baseLose = hadHistory[0].lose || 0;
            var lastHadDraw = hadHistory[hadHistory.length - 1].draw || 0;

            // 时间差计算函数（秒）
            function timeDiffSeconds(t1, t2) {
                try {
                    var parseTime = function(t) {
                        var parts = t.split(' ');
                        var time = parts.length > 1 ? parts[1] : t;
                        var hms = time.split(':');
                        return parseInt(hms[0]) * 3600 + parseInt(hms[1]) * 60 + parseInt(hms[2]);
                    };
                    return Math.abs(parseTime(t1) - parseTime(t2));
                } catch (e) {
                    return Infinity;
                }
            }

            // 查找时间匹配的HAD记录
            function findMatchingHad(hhadItem, hadList, tolerance) {
                tolerance = tolerance || 300;
                var hhadDate = hhadItem.update_date || '';
                var hhadTime = hhadItem.update_time || '';
                var bestMatch = null;
                var bestDiff = Infinity;
                for (var i = 0; i < hadList.length; i++) {
                    var had = hadList[i];
                    if ((had.update_date || '') !== hhadDate) continue;
                    var diff = timeDiffSeconds(had.update_time || '', hhadTime);
                    if (diff < bestDiff && diff <= tolerance) {
                        bestDiff = diff;
                        bestMatch = i;
                    }
                }
                return bestMatch;
            }

            var usedHadForWl = {};  // 记录已用于胜/负差的HAD索引
            var hadDdCovered = {};  // 记录已在HHAD循环中计算了双平差的HAD索引
            var totalRows = hhadHistory.length;

            html += '<div class="col-12 mb-3">' +
                '<h6 class="section-title">赔率差值分析</h6>' +
                '<div style="max-height: 200px; overflow-y: auto;">' +
                '<table class="table table-sm table-bordered mb-0 table-striped">' +
                '<thead class="sticky-top bg-white"><tr class="table-warning">' +
                '<th>胜的赔率的差</th><th>负的赔率的差</th><th>双平赔率的差</th>' +
                '<th>胜差正负</th><th>负差正负</th><th>双平差正负</th></tr></thead><tbody>';

            for (var r = 0; r < totalRows; r++) {
                var winDiff, loseDiff, winSign, loseSign;
                var curHadDraw, curHhadDraw;

                if (r === 0) {
                    // 第1行特殊对齐：胜/负差取 hadHistory[1]，双平差取 hadHistory[0]/hhadHistory[0]
                    if (hadHistory.length >= 2) {
                        var curWin = hadHistory[1].win || 0;
                        var curLose = hadHistory[1].lose || 0;
                        winDiff = Math.round((curWin - baseWin) * 100) / 100;
                        loseDiff = Math.round((curLose - baseLose) * 100) / 100;
                        winSign = winDiff >= 0 ? '正' : '负';
                        loseSign = loseDiff >= 0 ? '正' : '负';
                        usedHadForWl[1] = true;
                    } else {
                        winDiff = '-';
                        loseDiff = '-';
                        winSign = '-';
                        loseSign = '-';
                    }
                    curHadDraw = hadHistory[0].draw || 0;
                    curHhadDraw = hhadHistory[0].draw || 0;
                    hadDdCovered[0] = true;  // HAD[0]的draw已用于双平差
                } else {
                    // 后续行：按时间戳匹配
                    var matchedHadIdx = findMatchingHad(hhadHistory[r], hadHistory);

                    if (matchedHadIdx !== null && !usedHadForWl[matchedHadIdx]) {
                        // 找到匹配且未使用过
                        var curWin = hadHistory[matchedHadIdx].win || 0;
                        var curLose = hadHistory[matchedHadIdx].lose || 0;
                        winDiff = Math.round((curWin - baseWin) * 100) / 100;
                        loseDiff = Math.round((curLose - baseLose) * 100) / 100;
                        winSign = winDiff >= 0 ? '正' : '负';
                        loseSign = loseDiff >= 0 ? '正' : '负';
                        usedHadForWl[matchedHadIdx] = true;
                        curHadDraw = hadHistory[matchedHadIdx].draw || 0;
                        hadDdCovered[matchedHadIdx] = true;
                    } else {
                        // 无匹配或已使用
                        winDiff = '-';
                        loseDiff = '-';
                        winSign = '-';
                        loseSign = '-';
                        if (matchedHadIdx !== null) {
                            curHadDraw = hadHistory[matchedHadIdx].draw || 0;
                            hadDdCovered[matchedHadIdx] = true;
                        } else {
                            curHadDraw = lastHadDraw;
                        }
                    }
                    curHhadDraw = hhadHistory[r].draw || 0;
                }

                var ddDiff = Math.round((curHhadDraw - curHadDraw) * 100) / 100;
                var ddSign = ddDiff >= 0 ? '正' : '负';

                var winClass = (winDiff !== '-' && winDiff < 0) ? ' class="text-danger"' : '';
                var loseClass = (loseDiff !== '-' && loseDiff < 0) ? ' class="text-danger"' : '';
                var ddClass = ddDiff < 0 ? ' class="text-danger"' : '';

                html += '<tr>' +
                    '<td' + winClass + '>' + (winDiff === '-' ? '-' : winDiff.toFixed(2)) + '</td>' +
                    '<td' + loseClass + '>' + (loseDiff === '-' ? '-' : loseDiff.toFixed(2)) + '</td>' +
                    '<td' + ddClass + '>' + ddDiff.toFixed(2) + '</td>' +
                    '<td>' + winSign + '</td>' +
                    '<td>' + loseSign + '</td>' +
                    '<td>' + ddSign + '</td></tr>';
            }

            // 补充未完整覆盖的HAD记录
            for (var hadIdx = 1; hadIdx < hadHistory.length; hadIdx++) {
                // 已在HHAD循环中同时覆盖了胜/负差和双平差的，跳过
                if (usedHadForWl[hadIdx] && hadDdCovered[hadIdx]) continue;
                
                var winDiff2, loseDiff2, winSign2, loseSign2, winClass2, loseClass2;
                
                if (usedHadForWl[hadIdx]) {
                    // 胜/负差已在HHAD循环显示，仅需双平差独占一行
                    winDiff2 = '-';
                    loseDiff2 = '-';
                    winSign2 = '-';
                    loseSign2 = '-';
                    winClass2 = '';
                    loseClass2 = '';
                } else {
                    // 完整行：胜/负差 + 双平差
                    var curWin = hadHistory[hadIdx].win || 0;
                    var curLose = hadHistory[hadIdx].lose || 0;
                    winDiff2 = Math.round((curWin - baseWin) * 100) / 100;
                    loseDiff2 = Math.round((curLose - baseLose) * 100) / 100;
                    winSign2 = winDiff2 >= 0 ? '正' : '负';
                    loseSign2 = loseDiff2 >= 0 ? '正' : '负';
                    winClass2 = winDiff2 < 0 ? ' class="text-danger"' : '';
                    loseClass2 = loseDiff2 < 0 ? ' class="text-danger"' : '';
                }
                
                // 向前查找最近的HHAD让平赔率
                var hadDateStr = (hadHistory[hadIdx].update_date || '') + ' ' + (hadHistory[hadIdx].update_time || '');
                var nearestHhadDraw = null;
                try {
                    var hadDt = new Date(hadDateStr.replace(/-/g, '/'));
                    var bestDt = null;
                    for (var hi = 0; hi < hhadHistory.length; hi++) {
                        var hhadDateStr = (hhadHistory[hi].update_date || '') + ' ' + (hhadHistory[hi].update_time || '');
                        var hhadDt = new Date(hhadDateStr.replace(/-/g, '/'));
                        if (hhadDt <= hadDt) {
                            if (bestDt === null || hhadDt > bestDt) {
                                bestDt = hhadDt;
                                nearestHhadDraw = hhadHistory[hi].draw || 0;
                            }
                        }
                    }
                } catch (e) {}
                
                var ddDiffStr, ddSignStr, ddClassStr;
                if (nearestHhadDraw !== null) {
                    var ddDiff2 = Math.round((nearestHhadDraw - (hadHistory[hadIdx].draw || 0)) * 100) / 100;
                    ddDiffStr = ddDiff2.toFixed(2);
                    ddSignStr = ddDiff2 >= 0 ? '正' : '负';
                    ddClassStr = ddDiff2 < 0 ? ' class="text-danger"' : '';
                } else {
                    ddDiffStr = '-';
                    ddSignStr = '-';
                    ddClassStr = '';
                }
                
                html += '<tr>' +
                    '<td' + winClass2 + '>' + (winDiff2 === '-' ? '-' : winDiff2.toFixed(2)) + '</td>' +
                    '<td' + loseClass2 + '>' + (loseDiff2 === '-' ? '-' : loseDiff2.toFixed(2)) + '</td>' +
                    '<td' + ddClassStr + '>' + ddDiffStr + '</td>' +
                    '<td>' + winSign2 + '</td>' +
                    '<td>' + loseSign2 + '</td>' +
                    '<td>' + ddSignStr + '</td></tr>';
            }

            html += '</tbody></table></div></div>';
        } else if (hhadHistory.length >= 2) {
            // 无HAD更新，仅用HHAD让平数据做差：HHAD[i].draw - HHAD[0].draw
            var baseHhadDraw = hhadHistory[0].draw || 0;
            
            html += '<div class="col-12 mb-3">' +
                '<h6 class="section-title">赔率差值分析</h6>' +
                '<div style="max-height: 200px; overflow-y: auto;">' +
                '<table class="table table-sm table-bordered mb-0 table-striped">' +
                '<thead class="sticky-top bg-white"><tr class="table-warning">' +
                '<th>胜的赔率的差</th><th>负的赔率的差</th><th>双平赔率的差</th>' +
                '<th>胜差正负</th><th>负差正负</th><th>双平差正负</th></tr></thead><tbody>';
            
            for (var hi = 1; hi < hhadHistory.length; hi++) {
                var curDraw = hhadHistory[hi].draw || 0;
                var drawDiff = Math.round((curDraw - baseHhadDraw) * 100) / 100;
                var ddSign = drawDiff >= 0 ? '正' : '负';
                var ddClass = drawDiff < 0 ? ' class="text-danger"' : '';
                
                html += '<tr>' +
                    '<td>-</td><td>-</td>' +
                    '<td' + ddClass + '>' + drawDiff.toFixed(2) + '</td>' +
                    '<td>-</td><td>-</td>' +
                    '<td>' + ddSign + '</td></tr>';
            }
            
            html += '</tbody></table></div></div>';
        }

        html += '</div>';
        return html;
    }

    // 导出Excel
    function exportExcel() {
        const btn = document.getElementById('btn-export');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> 导出中...';

        fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ match_ids: Array.from(selectedIds) })
        })
            .then(r => r.json())
            .then(data => {
                btn.disabled = false;
                updateExportButton();
                if (!data.success) {
                    showError(data.error || '导出失败');
                    return;
                }
                // 触发下载
                const a = document.createElement('a');
                a.href = data.download_url;
                a.download = data.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // 显示成功提示
                document.getElementById('toast-message').textContent =
                    '已导出 ' + data.match_count + ' 场比赛数据: ' + data.filename;
                const toast = new bootstrap.Toast(document.getElementById('export-toast'));
                toast.show();
            })
            .catch(err => {
                btn.disabled = false;
                updateExportButton();
                showError('导出请求失败: ' + err.message);
            });
    }

    function updateExportButton() {
        const btn = document.getElementById('btn-export');
        const count = selectedIds.size;
        btn.disabled = count === 0;
        // 恢复按钮文本和选中数量
        btn.innerHTML = '导出Excel (<span id="selected-count">' + count + '</span> 场)';
    }

    function showError(msg) {
        const el = document.getElementById('error-area');
        el.textContent = msg;
        el.classList.remove('d-none');
        setTimeout(function () { el.classList.add('d-none'); }, 5000);
    }

    function fmt(val) {
        if (val === undefined || val === null || val === '') return '-';
        return typeof val === 'number' ? val.toFixed(2) : val;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});
