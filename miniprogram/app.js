App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        // env 不填则默认使用第一个创建的环境
        // env: 'your-env-id',
        traceUser: true,
      });
    }

    this.globalData = {
      selectedMatchIds: [], // 选中的比赛ID列表
    };
  },
  globalData: {}
});