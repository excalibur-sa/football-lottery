"""
竞彩网官方数据提供者
数据来源：https://www.sporttery.cn/
"""
import requests
from datetime import datetime, timedelta
from api.base import BaseDataProvider


class SportteryProvider(BaseDataProvider):
    """竞彩网官方API数据提供者"""

    BASE_URL = "https://webapi.sporttery.cn/gateway"
    
    # 请求头，模拟浏览器访问
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://www.sporttery.cn/",
        "Origin": "https://www.sporttery.cn",
    }

    def __init__(self):
        self._session = requests.Session()
        self._session.headers.update(self.HEADERS)

    def _request(self, endpoint, params=None):
        """发送API请求"""
        url = f"{self.BASE_URL}{endpoint}"
        try:
            resp = self._session.get(url, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            if not data.get("success"):
                raise RuntimeError(f"API错误: {data.get('errorMessage', '未知错误')}")
            return data.get("value", {})
        except requests.RequestException as e:
            raise RuntimeError(f"网络请求失败: {e}")

    def get_today_matches(self, date=None):
        """获取竞彩比赛列表
        
        Args:
            date: 可选，指定日期(YYYY-MM-DD)。为None时优先获取可售比赛，否则获取指定日期赛果
        """
        if date is None:
            # 无指定日期：优先获取当前可售比赛
            matches = self._get_selling_matches()
            if matches:
                return matches
            return self._get_recent_results()
        
        # 指定日期：先尝试可售比赛中过滤，再查历史赛果
        selling = self._get_selling_matches()
        date_matches = [m for m in selling if m.get("match_time", "").startswith(date)]
        if date_matches:
            return date_matches
        
        return self._get_results_by_date(date)

    def _get_selling_matches(self):
        """获取当前正在销售的比赛"""
        try:
            result = self._request(
                "/uniform/football/getMatchListV1.qry",
                {"clientCode": "3001"}
            )
            
            matches = []
            match_info_list = result.get("matchInfoList", [])
            
            for date_group in match_info_list:
                sub_matches = date_group.get("subMatchList", [])
                for m in sub_matches:
                    match = self._parse_selling_match(m)
                    if match:
                        matches.append(match)
            
            return matches
        except Exception:
            return []

    def _get_recent_results(self):
        """获取最近的历史赛果"""
        today = datetime.now()
        # 查询最近14天的赛果（扩大范围以获取更多历史数据）
        end_date = today.strftime('%Y-%m-%d')
        start_date = (today - timedelta(days=14)).strftime('%Y-%m-%d')
        return self._query_results(start_date, end_date)

    def _get_results_by_date(self, date):
        """获取指定日期的历史赛果"""
        return self._query_results(date, date)

    def _query_results(self, start_date, end_date):
        """查询指定日期范围内的历史赛果"""
        try:
            result = self._request(
                "/uniform/football/getUniformMatchResultV1.qry",
                {
                    "matchBeginDate": start_date,
                    "matchEndDate": end_date,
                    "leagueId": "",
                    "pageSize": "30",
                    "pageNo": "1",
                    "isFix": "0",
                    "matchPage": "1",
                    "pcOrWap": "1"
                }
            )
            
            matches = []
            match_results = result.get("matchResult", [])
            
            for m in match_results:
                match = self._parse_result_match(m)
                if match:
                    matches.append(match)
            
            return matches
        except Exception:
            return []

    def _parse_selling_match(self, m):
        """解析正在销售的比赛数据"""
        match_id = str(m.get("matchId", ""))
        if not match_id:
            return None
        
        # 提取基本信息
        match = {
            "match_id": match_id,
            "match_time": f"{m.get('matchDate', '')} {m.get('matchTime', '')}",
            "match_num": m.get("matchNumStr", ""),
            "league": m.get("leagueAbbName", ""),
            "home_team": m.get("homeTeamAbbName", ""),
            "away_team": m.get("awayTeamAbbName", ""),
            "status": "selling",  # 正在销售
        }
        
        # 提取赔率
        odds_list = m.get("oddsList", [])
        had_odds = {"win": 0, "draw": 0, "lose": 0}
        hhad_odds = {"handicap": 0, "win": 0, "draw": 0, "lose": 0}
        
        for odds in odds_list:
            pool_code = odds.get("poolCode", "")
            if pool_code == "HAD":
                had_odds = {
                    "win": self._safe_float(odds.get("h")),
                    "draw": self._safe_float(odds.get("d")),
                    "lose": self._safe_float(odds.get("a")),
                }
            elif pool_code == "HHAD":
                hhad_odds = {
                    "handicap": self._safe_float(odds.get("goalLine")),
                    "win": self._safe_float(odds.get("h")),
                    "draw": self._safe_float(odds.get("d")),
                    "lose": self._safe_float(odds.get("a")),
                }
        
        match["had_odds"] = had_odds
        match["hhad_odds"] = hhad_odds
        
        return match

    def _parse_result_match(self, m):
        """解析历史赛果数据"""
        match_id = str(m.get("matchId", ""))
        if not match_id:
            return None
        
        match = {
            "match_id": match_id,
            "match_time": m.get("matchDate", ""),
            "match_num": m.get("matchNumStr", ""),
            "league": m.get("leagueNameAbbr", ""),
            "home_team": m.get("homeTeam", ""),
            "away_team": m.get("awayTeam", ""),
            "status": "finished",  # 已结束
            "half_score": m.get("sectionsNo1", ""),  # 半场比分
            "full_score": m.get("sectionsNo999", ""),  # 全场比分
            "result": self._translate_win_flag(m.get("winFlag", "")),
        }
        
        # 历史赛果中的赔率（胜平负）
        match["had_odds"] = {
            "win": self._safe_float(m.get("h")),
            "draw": self._safe_float(m.get("d")),
            "lose": self._safe_float(m.get("a")),
        }
        
        # 让球胜平负
        match["hhad_odds"] = {
            "handicap": self._safe_float(m.get("goalLine")),
            "win": 0,  # 历史赛果API不提供让球赔率详情
            "draw": 0,
            "lose": 0,
        }
        
        return match

    def get_match_odds(self, match_id):
        """获取单场比赛的完整赔率信息"""
        # 首先从可售比赛中查找
        selling_matches = self._get_selling_matches()
        for m in selling_matches:
            if m.get("match_id") == match_id:
                return self._enrich_match_odds(m)
        
        # 从历史赛果中查找
        recent_results = self._get_recent_results()
        for m in recent_results:
            if m.get("match_id") == match_id:
                return self._enrich_match_odds(m)
        
        return None

    def _enrich_match_odds(self, match):
        """补充完整的赔率数据"""
        # 如果是已完成的比赛，补充模拟的详细赔率
        # 因为官方API对历史比赛不提供完整赔率详情
        if match.get("status") == "finished":
            # 生成模拟的比分、总进球、半全场赔率
            match["crs_odds"] = self._generate_crs_odds()
            match["ttg_odds"] = self._generate_ttg_odds()
            match["hafu_odds"] = self._generate_hafu_odds()
        else:
            # 对于正在销售的比赛，尝试获取详细赔率
            match["crs_odds"] = {}
            match["ttg_odds"] = {}
            match["hafu_odds"] = {}
        
        return match

    def _generate_crs_odds(self):
        """生成比分赔率（示例数据）"""
        return {
            "1:0": 7.50, "2:0": 10.00, "2:1": 8.50, "3:0": 18.00,
            "3:1": 15.00, "3:2": 25.00, "0:0": 8.00, "1:1": 6.50,
            "2:2": 14.00, "0:1": 9.00, "0:2": 14.00, "1:2": 10.00,
            "0:3": 25.00, "1:3": 20.00
        }

    def _generate_ttg_odds(self):
        """生成总进球赔率（示例数据）"""
        return {
            "0": 9.00, "1": 5.00, "2": 3.60, "3": 3.20,
            "4": 4.50, "5": 7.00, "6": 15.00, "7+": 25.00
        }

    def _generate_hafu_odds(self):
        """生成半全场赔率（示例数据）"""
        return {
            "win_win": 3.50, "win_draw": 12.00, "win_lose": 28.00,
            "draw_win": 5.80, "draw_draw": 5.00, "draw_lose": 7.50,
            "lose_win": 18.00, "lose_draw": 12.00, "lose_lose": 6.00
        }

    @staticmethod
    def _safe_float(val):
        """安全转换为浮点数"""
        if val is None or val == "":
            return 0.0
        try:
            # 处理带符号的让球数，如 "+1" 或 "-2.00"
            return float(str(val).replace("+", ""))
        except (ValueError, TypeError):
            return 0.0

    @staticmethod
    def _translate_win_flag(flag):
        """翻译胜负标志"""
        mapping = {"H": "主胜", "D": "平局", "A": "客胜"}
        return mapping.get(flag, flag)

    def get_odds_history(self, match_id):
        """获取比赛赔率历史变化数据
        
        Args:
            match_id: 比赛ID
            
        Returns:
            dict: 包含胜平负和让球胜平负的历史赔率数据
        """
        try:
            result = self._request(
                "/uniform/football/getFixedBonusV1.qry",
                {"clientCode": "3001", "matchId": match_id}
            )
            
            odds_history = result.get("oddsHistory", {})
            
            # 解析胜平负历史
            had_history = []
            for item in odds_history.get("hadList", []):
                had_history.append({
                    "update_date": item.get("updateDate", ""),
                    "update_time": item.get("updateTime", ""),
                    "win": self._safe_float(item.get("h")),
                    "draw": self._safe_float(item.get("d")),
                    "lose": self._safe_float(item.get("a")),
                })
            
            # 解析让球胜平负历史
            hhad_history = []
            for item in odds_history.get("hhadList", []):
                hhad_history.append({
                    "update_date": item.get("updateDate", ""),
                    "update_time": item.get("updateTime", ""),
                    "handicap": item.get("goalLine", ""),
                    "win": self._safe_float(item.get("h")),
                    "draw": self._safe_float(item.get("d")),
                    "lose": self._safe_float(item.get("a")),
                })
            
            return {
                "had_history": had_history,
                "hhad_history": hhad_history,
            }
        except Exception as e:
            print(f"获取赔率历史失败: {e}")
            return {"had_history": [], "hhad_history": []}
