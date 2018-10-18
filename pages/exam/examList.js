// pages/exam/examList.js
import Util from '../../utils/util';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    availableExam: [],
    examList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.request({
      url: app.globalData.host + '/exam/load/session',
      method: 'GET',
      success: function (res) {
        if (res.data.msg === 'ok') {
          if (res.data.retObj.length > 0) {
            if (res.data.retObj[0].date === Util.getCurrentDate()) {
              that.data.availableExam = res.data.retObj[0];
              res.data.retObj.splice(0, 1);
              that.setData({
                availableExam: [that.data.availableExam],
                examList: res.data.retObj
              });
            } else {
              that.setData({
                examList: res.data.retObj
              });
            }
          }
        }
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  goToExamDetailPage: function (evt) {
    let sessionId = evt.currentTarget.dataset.sessionid;
    wx.navigateTo({
      url: 'exam?sessionId=' + sessionId,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})