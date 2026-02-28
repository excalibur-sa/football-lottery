from datetime import datetime
from api.base import BaseDataProvider


class MockProvider(BaseDataProvider):
    """模拟数据提供者，用于开发和测试阶段"""

    def __init__(self):
        today = datetime.now().strftime('%Y-%m-%d')
        self._matches = [
            {
                "match_id": f"{today.replace('-', '')}001",
                "match_time": f"{today} 18:00",
                "league": "英超",
                "home_team": "曼城",
                "away_team": "利物浦",
                "had_odds": {"win": 2.15, "draw": 3.40, "lose": 3.25},
                "hhad_odds": {"handicap": -1, "win": 3.10, "draw": 3.55, "lose": 2.05},
                "crs_odds": {
                    "1:0": 7.50, "2:0": 10.00, "2:1": 8.50, "3:0": 18.00,
                    "3:1": 15.00, "3:2": 25.00, "4:0": 40.00, "4:1": 35.00,
                    "0:0": 8.00, "1:1": 6.50, "2:2": 14.00, "3:3": 50.00,
                    "0:1": 9.00, "0:2": 14.00, "1:2": 10.00, "0:3": 25.00,
                    "1:3": 20.00, "2:3": 30.00
                },
                "ttg_odds": {
                    "0": 9.00, "1": 5.00, "2": 3.60, "3": 3.20,
                    "4": 4.50, "5": 7.00, "6": 15.00, "7+": 25.00
                },
                "hafu_odds": {
                    "win_win": 3.50, "win_draw": 12.00, "win_lose": 28.00,
                    "draw_win": 5.80, "draw_draw": 5.00, "draw_lose": 7.50,
                    "lose_win": 18.00, "lose_draw": 12.00, "lose_lose": 6.00
                }
            },
            {
                "match_id": f"{today.replace('-', '')}002",
                "match_time": f"{today} 19:30",
                "league": "西甲",
                "home_team": "皇家马德里",
                "away_team": "巴塞罗那",
                "had_odds": {"win": 2.30, "draw": 3.25, "lose": 3.10},
                "hhad_odds": {"handicap": -1, "win": 3.25, "draw": 3.40, "lose": 2.00},
                "crs_odds": {
                    "1:0": 7.00, "2:0": 9.50, "2:1": 8.00, "3:0": 16.00,
                    "3:1": 14.00, "3:2": 22.00, "4:0": 38.00, "4:1": 32.00,
                    "0:0": 7.50, "1:1": 6.00, "2:2": 13.00, "3:3": 45.00,
                    "0:1": 8.50, "0:2": 13.00, "1:2": 9.50, "0:3": 22.00,
                    "1:3": 18.00, "2:3": 28.00
                },
                "ttg_odds": {
                    "0": 8.50, "1": 4.80, "2": 3.40, "3": 3.00,
                    "4": 4.20, "5": 6.50, "6": 14.00, "7+": 22.00
                },
                "hafu_odds": {
                    "win_win": 3.80, "win_draw": 11.00, "win_lose": 25.00,
                    "draw_win": 5.50, "draw_draw": 4.80, "draw_lose": 7.00,
                    "lose_win": 16.00, "lose_draw": 11.00, "lose_lose": 5.50
                }
            },
            {
                "match_id": f"{today.replace('-', '')}003",
                "match_time": f"{today} 20:00",
                "league": "德甲",
                "home_team": "拜仁慕尼黑",
                "away_team": "多特蒙德",
                "had_odds": {"win": 1.65, "draw": 3.80, "lose": 5.00},
                "hhad_odds": {"handicap": -2, "win": 3.40, "draw": 3.50, "lose": 1.95},
                "crs_odds": {
                    "1:0": 8.00, "2:0": 7.50, "2:1": 8.50, "3:0": 10.00,
                    "3:1": 11.00, "3:2": 20.00, "4:0": 15.00, "4:1": 18.00,
                    "0:0": 10.00, "1:1": 7.50, "2:2": 16.00, "3:3": 55.00,
                    "0:1": 14.00, "0:2": 22.00, "1:2": 16.00, "0:3": 40.00,
                    "1:3": 30.00, "2:3": 35.00
                },
                "ttg_odds": {
                    "0": 10.00, "1": 5.50, "2": 3.80, "3": 3.10,
                    "4": 4.00, "5": 6.00, "6": 12.00, "7+": 20.00
                },
                "hafu_odds": {
                    "win_win": 2.50, "win_draw": 10.00, "win_lose": 22.00,
                    "draw_win": 5.00, "draw_draw": 5.50, "draw_lose": 9.00,
                    "lose_win": 20.00, "lose_draw": 15.00, "lose_lose": 8.50
                }
            },
            {
                "match_id": f"{today.replace('-', '')}004",
                "match_time": f"{today} 20:00",
                "league": "意甲",
                "home_team": "国际米兰",
                "away_team": "AC米兰",
                "had_odds": {"win": 1.90, "draw": 3.50, "lose": 3.90},
                "hhad_odds": {"handicap": -1, "win": 2.90, "draw": 3.30, "lose": 2.25},
                "crs_odds": {
                    "1:0": 6.50, "2:0": 8.50, "2:1": 7.50, "3:0": 15.00,
                    "3:1": 13.00, "3:2": 22.00, "4:0": 35.00, "4:1": 30.00,
                    "0:0": 8.50, "1:1": 6.00, "2:2": 14.00, "3:3": 48.00,
                    "0:1": 10.00, "0:2": 16.00, "1:2": 12.00, "0:3": 28.00,
                    "1:3": 22.00, "2:3": 32.00
                },
                "ttg_odds": {
                    "0": 9.50, "1": 5.20, "2": 3.50, "3": 3.00,
                    "4": 4.30, "5": 6.80, "6": 14.50, "7+": 24.00
                },
                "hafu_odds": {
                    "win_win": 3.00, "win_draw": 10.50, "win_lose": 24.00,
                    "draw_win": 5.20, "draw_draw": 4.80, "draw_lose": 7.50,
                    "lose_win": 18.00, "lose_draw": 12.00, "lose_lose": 7.00
                }
            },
            {
                "match_id": f"{today.replace('-', '')}005",
                "match_time": f"{today} 21:00",
                "league": "法甲",
                "home_team": "巴黎圣日耳曼",
                "away_team": "马赛",
                "had_odds": {"win": 1.45, "draw": 4.20, "lose": 6.50},
                "hhad_odds": {"handicap": -2, "win": 2.80, "draw": 3.40, "lose": 2.30},
                "crs_odds": {
                    "1:0": 8.50, "2:0": 6.50, "2:1": 9.00, "3:0": 8.00,
                    "3:1": 10.00, "3:2": 18.00, "4:0": 12.00, "4:1": 16.00,
                    "0:0": 12.00, "1:1": 8.50, "2:2": 18.00, "3:3": 60.00,
                    "0:1": 16.00, "0:2": 28.00, "1:2": 20.00, "0:3": 50.00,
                    "1:3": 40.00, "2:3": 42.00
                },
                "ttg_odds": {
                    "0": 12.00, "1": 6.00, "2": 4.00, "3": 3.20,
                    "4": 3.80, "5": 5.50, "6": 10.00, "7+": 18.00
                },
                "hafu_odds": {
                    "win_win": 2.20, "win_draw": 8.50, "win_lose": 20.00,
                    "draw_win": 4.50, "draw_draw": 6.00, "draw_lose": 10.00,
                    "lose_win": 22.00, "lose_draw": 18.00, "lose_lose": 11.00
                }
            },
            {
                "match_id": f"{today.replace('-', '')}006",
                "match_time": f"{today} 21:30",
                "league": "英超",
                "home_team": "阿森纳",
                "away_team": "切尔西",
                "had_odds": {"win": 1.85, "draw": 3.60, "lose": 4.00},
                "hhad_odds": {"handicap": -1, "win": 2.75, "draw": 3.40, "lose": 2.35},
                "crs_odds": {
                    "1:0": 6.50, "2:0": 8.00, "2:1": 7.50, "3:0": 14.00,
                    "3:1": 12.50, "3:2": 20.00, "4:0": 32.00, "4:1": 28.00,
                    "0:0": 9.00, "1:1": 6.50, "2:2": 14.50, "3:3": 50.00,
                    "0:1": 11.00, "0:2": 18.00, "1:2": 13.00, "0:3": 30.00,
                    "1:3": 25.00, "2:3": 35.00
                },
                "ttg_odds": {
                    "0": 9.50, "1": 5.00, "2": 3.50, "3": 3.10,
                    "4": 4.20, "5": 6.50, "6": 13.00, "7+": 22.00
                },
                "hafu_odds": {
                    "win_win": 2.80, "win_draw": 11.00, "win_lose": 25.00,
                    "draw_win": 5.50, "draw_draw": 5.00, "draw_lose": 8.00,
                    "lose_win": 20.00, "lose_draw": 14.00, "lose_lose": 7.50
                }
            },
            {
                "match_id": f"{today.replace('-', '')}007",
                "match_time": f"{today} 22:00",
                "league": "西甲",
                "home_team": "马德里竞技",
                "away_team": "塞维利亚",
                "had_odds": {"win": 1.70, "draw": 3.60, "lose": 4.80},
                "hhad_odds": {"handicap": -1, "win": 2.50, "draw": 3.20, "lose": 2.60},
                "crs_odds": {
                    "1:0": 6.00, "2:0": 7.50, "2:1": 8.00, "3:0": 12.00,
                    "3:1": 13.00, "3:2": 22.00, "4:0": 28.00, "4:1": 26.00,
                    "0:0": 9.50, "1:1": 7.00, "2:2": 15.00, "3:3": 52.00,
                    "0:1": 12.00, "0:2": 20.00, "1:2": 14.00, "0:3": 35.00,
                    "1:3": 28.00, "2:3": 38.00
                },
                "ttg_odds": {
                    "0": 10.00, "1": 5.50, "2": 3.60, "3": 3.00,
                    "4": 4.10, "5": 6.20, "6": 13.00, "7+": 21.00
                },
                "hafu_odds": {
                    "win_win": 2.60, "win_draw": 10.00, "win_lose": 22.00,
                    "draw_win": 5.00, "draw_draw": 5.20, "draw_lose": 8.50,
                    "lose_win": 19.00, "lose_draw": 14.00, "lose_lose": 8.00
                }
            },
            {
                "match_id": f"{today.replace('-', '')}008",
                "match_time": f"{today} 22:30",
                "league": "德甲",
                "home_team": "勒沃库森",
                "away_team": "莱比锡红牛",
                "had_odds": {"win": 2.00, "draw": 3.40, "lose": 3.60},
                "hhad_odds": {"handicap": 0, "win": 2.80, "draw": 3.10, "lose": 2.50},
                "crs_odds": {
                    "1:0": 6.50, "2:0": 8.50, "2:1": 7.50, "3:0": 15.00,
                    "3:1": 13.50, "3:2": 22.00, "4:0": 35.00, "4:1": 30.00,
                    "0:0": 8.00, "1:1": 6.00, "2:2": 13.00, "3:3": 48.00,
                    "0:1": 9.50, "0:2": 15.00, "1:2": 11.00, "0:3": 26.00,
                    "1:3": 20.00, "2:3": 30.00
                },
                "ttg_odds": {
                    "0": 8.50, "1": 4.80, "2": 3.30, "3": 3.00,
                    "4": 4.20, "5": 6.50, "6": 14.00, "7+": 22.00
                },
                "hafu_odds": {
                    "win_win": 3.20, "win_draw": 10.50, "win_lose": 24.00,
                    "draw_win": 5.20, "draw_draw": 4.60, "draw_lose": 7.00,
                    "lose_win": 17.00, "lose_draw": 11.00, "lose_lose": 6.50
                }
            }
        ]

    def get_today_matches(self):
        return [
            {
                "match_id": m["match_id"],
                "match_time": m["match_time"],
                "league": m["league"],
                "home_team": m["home_team"],
                "away_team": m["away_team"],
            }
            for m in self._matches
        ]

    def get_match_odds(self, match_id):
        for m in self._matches:
            if m["match_id"] == match_id:
                return dict(m)
        return None
