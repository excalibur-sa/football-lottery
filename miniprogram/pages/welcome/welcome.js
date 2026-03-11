Page({
  data: {},

  goFootball: function() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },

  goHCSA: function() {
    wx.navigateTo({
      url: '/pages/hcsa/hcsa'
    });
  }
});
