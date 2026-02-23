#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
爬取竞彩网指定日期比赛的赔率历史变化数据
"""

import requests
import json
from datetime import datetime

# 请求头
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Referer': 'https://www.sporttery.cn/',
    'Accept': 'application/json, text/plain, */*',
}

def get_matches_by_date(start_date, end_date):
    """获取指定日期范围的比赛列表"""
    url = "https://webapi.sporttery.cn/gateway/uniform/football/getUniformMatchResultV1.qry"
    params = {
        'startDate': start_date,
        'endDate': end_date
    }
    
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get('success') and data.get('value'):
            matches = data['value'].get('matchResult', [])
            return matches
        return []
    except Exception as e:
        print(f"获取比赛列表失败: {e}")
        return []


def get_fixed_bonus(match_id):
    """获取指定比赛的固定奖金（赔率）历史变化数据"""
    url = "https://webapi.sporttery.cn/gateway/uniform/football/getFixedBonusV1.qry"
    params = {
        'clientCode': '3001',
        'matchId': match_id
    }
    
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get('success') and data.get('value'):
            # 数据在 oddsHistory 下
            return data['value'].get('oddsHistory', {})
        return None
    except Exception as e:
        print(f"获取比赛 {match_id} 赔率数据失败: {e}")
        return None


def parse_had_odds(had_list):
    """解析胜平负赔率历史"""
    result = []
    for item in had_list or []:
        result.append({
            '更新日期': item.get('updateDate', ''),
            '更新时间': item.get('updateTime', ''),
            '胜': item.get('h', ''),
            '平': item.get('d', ''),
            '负': item.get('a', ''),
        })
    return result


def parse_hhad_odds(hhad_list):
    """解析让球胜平负赔率历史"""
    result = []
    for item in hhad_list or []:
        result.append({
            '更新日期': item.get('updateDate', ''),
            '更新时间': item.get('updateTime', ''),
            '让球': item.get('goalLine', ''),
            '让胜': item.get('h', ''),
            '让平': item.get('d', ''),
            '让负': item.get('a', ''),
        })
    return result


def get_match_detail(match_id):
    """获取比赛详情"""
    url = "https://webapi.sporttery.cn/gateway/uniform/football/getMatchInfoV1.qry"
    params = {
        'clientCode': '3001',
        'matchId': match_id
    }
    
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get('success') and data.get('value'):
            return data['value']
        return None
    except Exception as e:
        print(f"获取比赛 {match_id} 详情失败: {e}")
        return None


def main():
    """主函数"""
    target_date = "2026-02-12"
    print(f"正在获取 {target_date} 的比赛赔率历史数据...\n")
    
    # 2026-02-12 的12场比赛ID列表（从竞彩网赛果页面获取）
    matches_info = [
        {'match_id': '2037761', 'match_num': '周四003', 'league': '沙职', 'home': '达马克', 'away': '布赖合作', 'goal': '+1'},
        {'match_id': '2037760', 'match_num': '周四002', 'league': '亚冠乙', 'home': '曼谷联', 'away': '麦克阿瑟', 'goal': '-1'},
        {'match_id': '2037759', 'match_num': '周四001', 'league': '亚冠乙', 'home': '浦项制铁', 'away': '大阪钢巴', 'goal': '+1'},
        {'match_id': '2037758', 'match_num': '周三013', 'league': '英超', 'home': '桑德兰', 'away': '利物浦', 'goal': '+1'},
        {'match_id': '2037757', 'match_num': '周三012', 'league': '荷甲', 'home': '奈梅亨', 'away': '乌德勒支', 'goal': '-1'},
        {'match_id': '2037756', 'match_num': '周三011', 'league': '西国王杯', 'home': '毕尔巴鄂', 'away': '皇家社会', 'goal': '-1'},
        {'match_id': '2037755', 'match_num': '周三010', 'league': '意大利杯', 'home': '博洛尼亚', 'away': '拉齐奥', 'goal': '-1'},
        {'match_id': '2037754', 'match_num': '周三009', 'league': '德国杯', 'home': '拜仁', 'away': '莱红牛', 'goal': '-2'},
        {'match_id': '2037753', 'match_num': '周三008', 'league': '英冠', 'home': '查尔顿', 'away': '斯托克城', 'goal': '-1'},
        {'match_id': '2037752', 'match_num': '周三007', 'league': '英超', 'home': '水晶宫', 'away': '伯恩利', 'goal': '-1'},
        {'match_id': '2037751', 'match_num': '周三006', 'league': '英超', 'home': '诺丁汉', 'away': '狼队', 'goal': '-1'},
        {'match_id': '2037750', 'match_num': '周三005', 'league': '英超', 'home': '曼城', 'away': '富勒姆', 'goal': '-1'},
    ]
    
    print(f"共 {len(matches_info)} 场比赛\n")
    print("=" * 80)
    
    all_results = []
    
    for idx, match in enumerate(matches_info, 1):
        match_id = match['match_id']
        home_team = match['home']
        away_team = match['away']
        league = match['league']
        match_num = match['match_num']
        goal_line = match['goal']
        
        print(f"\n[{idx}/{len(matches_info)}] 比赛: {match_num} {league} {home_team}({goal_line}) vs {away_team}")
        print(f"比赛日期: {target_date}")
        print(f"比赛ID: {match_id}")
        print("-" * 60)
        
        # 获取赔率历史
        bonus_data = get_fixed_bonus(match_id)
        
        if bonus_data:
            match_result = {
                '比赛编号': match_num,
                '联赛': league,
                '主队': home_team,
                '客队': away_team,
                '让球': goal_line,
                '比赛日期': target_date,
                '比赛ID': match_id,
            }
            
            # 胜平负赔率历史
            had_list = bonus_data.get('hadList', [])
            if had_list:
                print(f"\n【胜平负固定奖金历史】共 {len(had_list)} 条记录")
                print(f"{"更新日期":<12} {"更新时间":<12} {"胜":>8} {"平":>8} {"负":>8}")
                for item in had_list:
                    update_dt = f"{item.get('updateDate', '')} {item.get('updateTime', '')}"
                    print(f"{item.get('updateDate', ''):<12} {item.get('updateTime', ''):<12} {item.get('h', ''):>8} {item.get('d', ''):>8} {item.get('a', ''):>8}")
                match_result['胜平负历史'] = parse_had_odds(had_list)
            
            # 让球胜平负赔率历史
            hhad_list = bonus_data.get('hhadList', [])
            if hhad_list:
                first_goal = hhad_list[0].get('goalLine', goal_line) if hhad_list else goal_line
                print(f"\n【让球胜平负固定奖金历史】让球: {first_goal}，共 {len(hhad_list)} 条记录")
                print(f"{"更新日期":<12} {"更新时间":<12} {"让胜":>8} {"让平":>8} {"让负":>8}")
                for item in hhad_list:
                    print(f"{item.get('updateDate', ''):<12} {item.get('updateTime', ''):<12} {item.get('h', ''):>8} {item.get('d', ''):>8} {item.get('a', ''):>8}")
                match_result['让球胜平负历史'] = parse_hhad_odds(hhad_list)
            
            all_results.append(match_result)
        else:
            print("未获取到赔率数据")
        
        print("\n" + "=" * 80)
    
    # 保存结果到JSON文件
    output_file = f'output/odds_history_{target_date.replace("-", "")}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n数据已保存到: {output_file}")
    
    return all_results


if __name__ == "__main__":
    main()
