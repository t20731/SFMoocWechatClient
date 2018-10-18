//index.js
//获取应用实例
import Util from '../../utils/util';
const app = getApp()

Page({
  data: {
    normalUser: true,
    myRanking: {},
    rankingList: []
  },
  onLoad: function () {
    
  },

  init: function(){
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.status != 0) {
      this.setData({ normalUser: false });
    }
    var that = this;
    wx.request({
      url: app.globalData.host + '/ranking/list',
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          rankingList: res.data
        });
        that.findMyRanking();
      },
      fail: function (e) {
        Util.showToast('数据获取失败','none',2000);
      }
    })
  },

  findMyRanking: function () {
    let myId = wx.getStorageSync('userInfo').id; 
    let status = wx.getStorageSync('userInfo').status; 
    if(status != 0){
      let myRanking = this.data.rankingList.filter(item => item.userId === myId)[0];
      this.setData({
        myRanking: myRanking
      });
    }
  },

  onShow: function(){
    console.log('rankinglist::onShow');
    this.init();
  },

  onPullDownRefresh: function(){
    console.log('rankinglist::onPullDownRefresh');
    this.init();
  }

})
