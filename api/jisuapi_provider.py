import requests
from api.base import BaseDataProvider
import config


class JisuAPIProvider(BaseDataProvider):
    """极速数据API提供者 - 需要有效的API Key才能使用"""

    BASE_URL = "https://api.jisuapi.com"

    def __init__(self):
        self.appkey = config.JISUAPI_KEY
        if not self.appkey:
            raise ValueError("JISUAPI_KEY 未配置，请在 .env 文件中设置")

    def _request(self, endpoint, params=None):
        url = f"{self.BASE_URL}{endpoint}"
        if params is None:
            params = {}
        params["appkey"] = self.appkey
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "0":
            raise RuntimeError(f"API错误: {data.get('msg', '未知错误')}")
        return data.get("result", {})

    def get_today_matches(self):
        """调用极速数据足球赛事接口获取今日比赛

        接口: /football/query
        注意: 极速数据可能不直接提供竞彩场次，此处获取主流联赛赛程作为参考。
        实际竞彩场次需根据API返回数据进一步适配。
        """
        from datetime import datetime
        today = datetime.now().strftime('%Y-%m-%d')
        leagues = ["英超", "西甲", "德甲", "意甲", "法甲"]
        all_matches = []

        for league in leagues:
            try:
                result = self._request("/football/query", {
                    "matchname": league,
                    "date": today,
                })
                match_list = result if isinstance(result, list) else result.get("list", [])
                for item in match_list:
                    all_matches.append({
                        "match_id": str(item.get("matchid", "")),
                        "match_time": item.get("matchtime", ""),
                        "league": league,
                        "home_team": item.get("hometeam", ""),
                        "away_team": item.get("awayteam", ""),
                    })
            except Exception:
                continue

        return all_matches

    def get_match_odds(self, match_id):
        """获取比赛赔率信息

        注意: 极速数据足球接口可能不提供竞彩赔率。
        此方法预留接口，当确认API支持赔率数据后再完善实现。
        当前返回基本比赛信息，赔率部分返回空数据。
        """
        matches = self.get_today_matches()
        match = None
        for m in matches:
            if m["match_id"] == match_id:
                match = m
                break

        if not match:
            return None

        match.update({
            "had_odds": {"win": 0, "draw": 0, "lose": 0},
            "hhad_odds": {"handicap": 0, "win": 0, "draw": 0, "lose": 0},
            "crs_odds": {},
            "ttg_odds": {},
            "hafu_odds": {},
        })
        return match
