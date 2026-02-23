class MatchService:
    """比赛数据处理服务"""

    def __init__(self, data_provider):
        self.provider = data_provider

    def get_today_matches(self):
        """获取今日竞彩比赛列表，按时间排序"""
        matches = self.provider.get_today_matches()
        matches.sort(key=lambda m: m.get("match_time", ""))
        return matches

    def get_match_detail(self, match_id):
        """获取单场比赛完整赔率信息"""
        return self.provider.get_match_odds(match_id)

    def get_matches_by_ids(self, match_ids):
        """批量获取多场比赛完整信息（包含赔率历史）"""
        results = []
        for mid in match_ids:
            detail = self.provider.get_match_odds(mid)
            if detail:
                # 获取赔率历史数据
                odds_history = self.provider.get_odds_history(mid)
                detail["had_history"] = odds_history.get("had_history", [])
                detail["hhad_history"] = odds_history.get("hhad_history", [])
                results.append(detail)
        return results
