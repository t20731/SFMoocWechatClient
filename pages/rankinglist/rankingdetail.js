import Util from '../../utils/util';
const app = getApp()

Page({

  data: {
    initial: 0,
    details: []
  },

  onLoad: function (options) {
    console.log('userId: ' + options.userId);
    var userId = options.userId;
    var that = this;
    if(userId){
      wx.request({
        url: app.globalData.host + '/ranking/points/' + userId,
        method: 'GET',
        success: function (res) {
          console.log(res.data);
          that.setData({
            initial: res.data.status,
            details: res.data.retObj
          });
        },
        fail: function (e) {
          Util.showToast('数据获取失败', 'none', 2000);
        }
      })
    }
  }
})