document.addEventListener('DOMContentLoaded', function () {
    // 显示当前日期
    const now = new Date();
    const dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    document.getElementById('current-date').textContent = dateStr;

    const selectedIds = new Set();
    let allSelectMode = false;

    loadMatches();

    // 加载比赛列表
    function loadMatches() {
        fetch('/api/matches')
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
                '<td>' + escapeHtml(m.match_time.split(' ')[1] || m.match_time) + '</td>' +
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
        const ttg = m.ttg_odds || {};
        const hafu = m.hafu_odds || {};
        const crs = m.crs_odds || {};
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

        // 总进球
        if (Object.keys(ttg).length > 0) {
            html += '<div class="col-md-6 mb-3">' +
                '<h6 class="section-title">总进球赔率</h6>' +
                '<table class="table table-sm table-bordered mb-0">' +
                '<thead><tr class="table-primary"><th>进球数</th><th>赔率</th></tr></thead><tbody>';
            Object.keys(ttg).sort().forEach(function (k) {
                html += '<tr><td>' + escapeHtml(k) + '球</td><td>' + fmt(ttg[k]) + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }

        // 半全场
        if (Object.keys(hafu).length > 0) {
            const hafuLabels = {
                'win_win': '胜-胜', 'win_draw': '胜-平', 'win_lose': '胜-负',
                'draw_win': '平-胜', 'draw_draw': '平-平', 'draw_lose': '平-负',
                'lose_win': '负-胜', 'lose_draw': '负-平', 'lose_lose': '负-负'
            };
            html += '<div class="col-md-6 mb-3">' +
                '<h6 class="section-title">半全场赔率</h6>' +
                '<table class="table table-sm table-bordered mb-0">' +
                '<thead><tr class="table-primary"><th>半场-全场</th><th>赔率</th></tr></thead><tbody>';
            Object.keys(hafu).forEach(function (k) {
                html += '<tr><td>' + escapeHtml(hafuLabels[k] || k) + '</td><td>' + fmt(hafu[k]) + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }

        // 比分
        if (Object.keys(crs).length > 0) {
            // 分组：主胜、平局、客胜
            const homeWin = [], draws = [], awayWin = [];
            Object.keys(crs).forEach(function (score) {
                const parts = score.split(':');
                if (parts.length === 2) {
                    const h = parseInt(parts[0]), a = parseInt(parts[1]);
                    if (h > a) homeWin.push([score, crs[score]]);
                    else if (h === a) draws.push([score, crs[score]]);
                    else awayWin.push([score, crs[score]]);
                }
            });
            html += '<div class="col-12 mb-3">' +
                '<h6 class="section-title">比分赔率</h6>' +
                '<div class="row">';

            [['主胜', homeWin], ['平局', draws], ['客胜', awayWin]].forEach(function (group) {
                html += '<div class="col-md-4"><table class="table table-sm table-bordered mb-0">' +
                    '<thead><tr class="table-primary"><th colspan="2">' + group[0] + '</th></tr>' +
                    '<tr class="table-light"><th>比分</th><th>赔率</th></tr></thead><tbody>';
                group[1].sort().forEach(function (item) {
                    html += '<tr><td>' + escapeHtml(item[0]) + '</td><td>' + fmt(item[1]) + '</td></tr>';
                });
                html += '</tbody></table></div>';
            });

            html += '</div></div>';
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
