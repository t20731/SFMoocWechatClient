//index.js
//获取应用实例
import Util from '../../utils/util';
const app = getApp()

Page({
  data: {
    rankingList: [],
    sessions: []
  },
  onLoad: function () {

  },

  init: function () {
    var that = this;

    wx.request({
      url: app.globalData.host + '/ranking/listSession/1',
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          sessions: res.data
        });
      },
      fail: function (e) {
        Util.showToast('数据获取失败', 'none', 2000);
      }
    })
  },

  goDetail: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id,
    })
  },

  onShow: function () {
    console.log('rankingSessionlist::onShow');
    this.init();
  },

  onPullDownRefresh: function () {
    console.log('rankingSessionlist::onPullDownRefresh');
    this.init();
  }

})
