from abc import ABC, abstractmethod


class BaseDataProvider(ABC):
    """竞彩足球数据提供者抽象基类"""

    @abstractmethod
    def get_today_matches(self):
        """获取今日竞彩比赛列表

        Returns:
            list[dict]: 比赛基本信息列表，每个元素包含:
                - match_id: 比赛ID
                - match_time: 比赛时间
                - league: 联赛名称
                - home_team: 主队
                - away_team: 客队
        """
        pass

    @abstractmethod
    def get_match_odds(self, match_id):
        """获取单场比赛的完整赔率信息

        Args:
            match_id: 比赛ID

        Returns:
            dict: 比赛完整信息，包含:
                - 基本信息 (match_id, match_time, league, home_team, away_team)
                - had_odds: 胜平负赔率 {win, draw, lose}
                - hhad_odds: 让球胜平负 {handicap, win, draw, lose}
                - crs_odds: 比分赔率 {"1:0": x, "2:1": y, ...}
                - ttg_odds: 总进球赔率 {"0": x, "1": y, ...}
                - hafu_odds: 半全场赔率 {"win_win": x, ...}
        """
        pass
