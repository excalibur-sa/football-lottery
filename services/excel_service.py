import os
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import config


# 样式常量
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
HEADER_FILL = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
HEADER_ALIGN = Alignment(horizontal="center", vertical="center")
DATA_ALIGN_CENTER = Alignment(horizontal="center", vertical="center")
DATA_ALIGN_RIGHT = Alignment(horizontal="right", vertical="center")
THIN_BORDER = Border(
    left=Side(style="thin"),
    right=Side(style="thin"),
    top=Side(style="thin"),
    bottom=Side(style="thin"),
)
ALT_ROW_FILL = PatternFill(start_color="D9E2F3", end_color="D9E2F3", fill_type="solid")
SECTION_FONT = Font(bold=True, size=11, color="1F4E79")
SECTION_FILL = PatternFill(start_color="BDD7EE", end_color="BDD7EE", fill_type="solid")

HAFU_LABELS = {
    "win_win": "胜-胜", "win_draw": "胜-平", "win_lose": "胜-负",
    "draw_win": "平-胜", "draw_draw": "平-平", "draw_lose": "平-负",
    "lose_win": "负-胜", "lose_draw": "负-平", "lose_lose": "负-负",
}


def _apply_header_style(ws, row, col_start, col_end):
    for col in range(col_start, col_end + 1):
        cell = ws.cell(row=row, column=col)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = HEADER_ALIGN
        cell.border = THIN_BORDER


def _apply_data_style(ws, row, col_start, col_end, is_alt=False):
    for col in range(col_start, col_end + 1):
        cell = ws.cell(row=row, column=col)
        cell.alignment = DATA_ALIGN_CENTER
        cell.border = THIN_BORDER
        if is_alt:
            cell.fill = ALT_ROW_FILL


def _auto_column_width(ws):
    for col_cells in ws.columns:
        max_length = 0
        col_letter = get_column_letter(col_cells[0].column)
        for cell in col_cells:
            if cell.value is not None:
                # 中文字符扙2个宽度计算
                val = str(cell.value)
                length = sum(2 if ord(c) > 127 else 1 for c in val)
                max_length = max(max_length, length)
        ws.column_dimensions[col_letter].width = min(max_length + 4, 30)


def _write_summary_sheet(ws, matches):
    """写入比赛汇总Sheet"""
    ws.title = "比赛汇总"
    headers = [
        "序号", "比赛时间", "联赛", "主队", "客队",
        "胜", "平", "负", "让球", "让胜", "让平", "让负"
    ]

    for col, h in enumerate(headers, 1):
        ws.cell(row=1, column=col, value=h)
    _apply_header_style(ws, 1, 1, len(headers))
    ws.freeze_panes = "A2"

    for idx, m in enumerate(matches, 1):
        row = idx + 1
        had = m.get("had_odds", {})
        hhad = m.get("hhad_odds", {})
        values = [
            idx,
            m.get("match_time", ""),
            m.get("league", ""),
            m.get("home_team", ""),
            m.get("away_team", ""),
            had.get("win", ""),
            had.get("draw", ""),
            had.get("lose", ""),
            hhad.get("handicap", ""),
            hhad.get("win", ""),
            hhad.get("draw", ""),
            hhad.get("lose", ""),
        ]
        for col, v in enumerate(values, 1):
            ws.cell(row=row, column=col, value=v)
        _apply_data_style(ws, row, 1, len(headers), is_alt=(idx % 2 == 0))

    _auto_column_width(ws)


def _write_detail_sheet(wb, match, index):
    """为单场比赛创建详情Sheet"""
    title = f"{index}-{match.get('home_team', '')}vs{match.get('away_team', '')}"
    # Sheet名最长31字符
    if len(title) > 31:
        title = title[:31]
    ws = wb.create_sheet(title=title)

    row = 1

    # === 基本信息 ===
    ws.cell(row=row, column=1, value="基本信息").font = SECTION_FONT
    ws.cell(row=row, column=1).fill = SECTION_FILL
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=4)
    row += 1

    info_items = [
        ("比赛ID", match.get("match_id", "")),
        ("比赛时间", match.get("match_time", "")),
        ("联赛", match.get("league", "")),
        ("主队", match.get("home_team", "")),
        ("客队", match.get("away_team", "")),
    ]
    for label, val in info_items:
        ws.cell(row=row, column=1, value=label).font = Font(bold=True)
        ws.cell(row=row, column=1).border = THIN_BORDER
        ws.cell(row=row, column=2, value=val).border = THIN_BORDER
        row += 1

    row += 1

    # === 胜平负赔率 ===
    ws.cell(row=row, column=1, value="胜平负赔率").font = SECTION_FONT
    ws.cell(row=row, column=1).fill = SECTION_FILL
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=3)
    row += 1
    had = match.get("had_odds", {})
    for col, h in enumerate(["胜", "平", "负"], 1):
        ws.cell(row=row, column=col, value=h)
    _apply_header_style(ws, row, 1, 3)
    row += 1
    for col, key in enumerate(["win", "draw", "lose"], 1):
        ws.cell(row=row, column=col, value=had.get(key, ""))
    _apply_data_style(ws, row, 1, 3)
    row += 2

    # === 让球胜平负 ===
    ws.cell(row=row, column=1, value="让球胜平负").font = SECTION_FONT
    ws.cell(row=row, column=1).fill = SECTION_FILL
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=4)
    row += 1
    hhad = match.get("hhad_odds", {})
    for col, h in enumerate(["让球数", "胜", "平", "负"], 1):
        ws.cell(row=row, column=col, value=h)
    _apply_header_style(ws, row, 1, 4)
    row += 1
    for col, key in enumerate(["handicap", "win", "draw", "lose"], 1):
        ws.cell(row=row, column=col, value=hhad.get(key, ""))
    _apply_data_style(ws, row, 1, 4)
    row += 2

    # === 比分赔率 ===
    crs = match.get("crs_odds", {})
    if crs:
        ws.cell(row=row, column=1, value="比分赔率").font = SECTION_FONT
        ws.cell(row=row, column=1).fill = SECTION_FILL
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=4)
        row += 1

        # 分主胜、平、客胜三组
        home_win = {k: v for k, v in crs.items()
                    if len(k.split(":")) == 2 and int(k.split(":")[0]) > int(k.split(":")[1])}
        draws = {k: v for k, v in crs.items()
                 if len(k.split(":")) == 2 and int(k.split(":")[0]) == int(k.split(":")[1])}
        away_win = {k: v for k, v in crs.items()
                    if len(k.split(":")) == 2 and int(k.split(":")[0]) < int(k.split(":")[1])}

        for group_name, group_data in [("主胜", home_win), ("平局", draws), ("客胜", away_win)]:
            if not group_data:
                continue
            ws.cell(row=row, column=1, value=group_name).font = Font(bold=True, italic=True)
            row += 1
            for col, h in enumerate(["比分", "赔率"], 1):
                ws.cell(row=row, column=col, value=h)
            _apply_header_style(ws, row, 1, 2)
            row += 1
            for i, (score, odds) in enumerate(sorted(group_data.items())):
                ws.cell(row=row, column=1, value=score)
                ws.cell(row=row, column=2, value=odds)
                _apply_data_style(ws, row, 1, 2, is_alt=(i % 2 == 0))
                row += 1
            row += 1

    # === 总进球赔率 ===
    ttg = match.get("ttg_odds", {})
    if ttg:
        ws.cell(row=row, column=1, value="总进球赔率").font = SECTION_FONT
        ws.cell(row=row, column=1).fill = SECTION_FILL
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=4)
        row += 1
        for col, h in enumerate(["总进球数", "赔率"], 1):
            ws.cell(row=row, column=col, value=h)
        _apply_header_style(ws, row, 1, 2)
        row += 1
        for i, (goals, odds) in enumerate(sorted(ttg.items(), key=lambda x: x[0])):
            label = f"{goals}球" if goals != "7+" else "7+球"
            ws.cell(row=row, column=1, value=label)
            ws.cell(row=row, column=2, value=odds)
            _apply_data_style(ws, row, 1, 2, is_alt=(i % 2 == 0))
            row += 1
        row += 1

    # === 半全场赔率 ===
    hafu = match.get("hafu_odds", {})
    if hafu:
        ws.cell(row=row, column=1, value="半全场赔率").font = SECTION_FONT
        ws.cell(row=row, column=1).fill = SECTION_FILL
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=4)
        row += 1
        for col, h in enumerate(["半场-全场", "赔率"], 1):
            ws.cell(row=row, column=col, value=h)
        _apply_header_style(ws, row, 1, 2)
        row += 1
        for i, (key, odds) in enumerate(hafu.items()):
            label = HAFU_LABELS.get(key, key)
            ws.cell(row=row, column=1, value=label)
            ws.cell(row=row, column=2, value=odds)
            _apply_data_style(ws, row, 1, 2, is_alt=(i % 2 == 0))
            row += 1
        row += 1

    # === 胜平负赔率变化历史 ===
    had_history = match.get("had_history", [])
    if had_history:
        ws.cell(row=row, column=1, value=f"胜平负赔率变化历史（共{len(had_history)}条）").font = SECTION_FONT
        ws.cell(row=row, column=1).fill = SECTION_FILL
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=5)
        row += 1
        for col, h in enumerate(["更新日期", "更新时间", "胜", "平", "负"], 1):
            ws.cell(row=row, column=col, value=h)
        _apply_header_style(ws, row, 1, 5)
        row += 1
        for i, item in enumerate(had_history):
            ws.cell(row=row, column=1, value=item.get("update_date", ""))
            ws.cell(row=row, column=2, value=item.get("update_time", ""))
            ws.cell(row=row, column=3, value=item.get("win", ""))
            ws.cell(row=row, column=4, value=item.get("draw", ""))
            ws.cell(row=row, column=5, value=item.get("lose", ""))
            _apply_data_style(ws, row, 1, 5, is_alt=(i % 2 == 0))
            row += 1
        row += 1

    # === 让球胜平负赔率变化历史 ===
    hhad_history = match.get("hhad_history", [])
    if hhad_history:
        first_handicap = hhad_history[0].get("handicap", "") if hhad_history else ""
        ws.cell(row=row, column=1, value=f"让球胜平负赔率变化历史（让{first_handicap}球，共{len(hhad_history)}条）").font = SECTION_FONT
        ws.cell(row=row, column=1).fill = SECTION_FILL
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=6)
        row += 1
        for col, h in enumerate(["更新日期", "更新时间", "让球", "让胜", "让平", "让负"], 1):
            ws.cell(row=row, column=col, value=h)
        _apply_header_style(ws, row, 1, 6)
        row += 1
        for i, item in enumerate(hhad_history):
            ws.cell(row=row, column=1, value=item.get("update_date", ""))
            ws.cell(row=row, column=2, value=item.get("update_time", ""))
            ws.cell(row=row, column=3, value=item.get("handicap", ""))
            ws.cell(row=row, column=4, value=item.get("win", ""))
            ws.cell(row=row, column=5, value=item.get("draw", ""))
            ws.cell(row=row, column=6, value=item.get("lose", ""))
            _apply_data_style(ws, row, 1, 6, is_alt=(i % 2 == 0))
            row += 1
        row += 1

    # === 赔率差值分析 ===
    had_history = match.get("had_history", [])
    hhad_history = match.get("hhad_history", [])
    
    # 需要至少2条胜平负历史数据才能计算差值
    if len(had_history) >= 2:
        ws.cell(row=row, column=1, value="赔率差值分析").font = SECTION_FONT
        ws.cell(row=row, column=1).fill = SECTION_FILL
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=6)
        row += 1
        
        # 表头
        headers = ["胜的赔率的差", "负的赔率的差", "双平赔率的差", "胜差正负", "负差正负", "双平差正负"]
        for col, h in enumerate(headers, 1):
            ws.cell(row=row, column=col, value=h)
        _apply_header_style(ws, row, 1, 6)
        row += 1
        
        # 获取第一条数据作为基准
        base_win = had_history[0].get("win", 0) or 0
        base_lose = had_history[0].get("lose", 0) or 0
        
        # 从第二条数据开始计算差值
        for i in range(1, len(had_history)):
            current_win = had_history[i].get("win", 0) or 0
            current_lose = had_history[i].get("lose", 0) or 0
            current_draw = had_history[i].get("draw", 0) or 0
            
            # 计算胜的赔率差和负的赔率差
            win_diff = round(current_win - base_win, 2) if current_win and base_win else 0
            lose_diff = round(current_lose - base_lose, 2) if current_lose and base_lose else 0
            
            # 计算双平赔率差（让球平 - 普通平）
            double_draw_diff = 0
            if i < len(hhad_history):
                hhad_draw = hhad_history[i].get("draw", 0) or 0
                double_draw_diff = round(hhad_draw - current_draw, 2) if hhad_draw and current_draw else 0
            
            # 正负标识（>=0为正，<0为负）
            win_sign = "正" if win_diff >= 0 else "负"
            lose_sign = "正" if lose_diff >= 0 else "负"
            double_draw_sign = "正" if double_draw_diff >= 0 else "负"
            
            # 写入数据
            ws.cell(row=row, column=1, value=win_diff)
            ws.cell(row=row, column=2, value=lose_diff)
            ws.cell(row=row, column=3, value=double_draw_diff)
            ws.cell(row=row, column=4, value=win_sign)
            ws.cell(row=row, column=5, value=lose_sign)
            ws.cell(row=row, column=6, value=double_draw_sign)
            _apply_data_style(ws, row, 1, 6, is_alt=(i % 2 == 0))
            row += 1

    _auto_column_width(ws)


def generate_excel(matches):
    """生成竞彩足球数据Excel文件

    Args:
        matches: 包含完整赔率的比赛数据列表

    Returns:
        str: 生成的Excel文件完整路径
    """
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)

    wb = Workbook()
    ws_summary = wb.active
    _write_summary_sheet(ws_summary, matches)

    for idx, match in enumerate(matches, 1):
        _write_detail_sheet(wb, match, idx)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"竞彩足球_{timestamp}.xlsx"
    filepath = os.path.join(config.OUTPUT_DIR, filename)
    wb.save(filepath)
    return filepath, filename
