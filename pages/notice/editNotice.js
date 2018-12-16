// pages/notice/editNotice.js
import Util from '../../utils/util';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeId: '',
    content: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.noticeId != 'undefined'){
      this.setData({
        noticeId: options.noticeId,
        content: options.noticeCont
      });
    }
  },

  saveNotice: function (evt) {
    let content = evt.detail.value.noticeCont;
    wx.request({
      url: app.globalData.host + '/announcement/edit',
      method: 'POST',
      data: {
        id: this.data.noticeId,
        content: content,
        createdBy: app.globalData.openId,
        lastModifiedBy: app.globalData.openId
      },
      success: function (res) {
        if (res.data.msg === 'ok') {
          Util.showToast('保存成功', 'success', 1000);
          setTimeout(function () {
            wx.reLaunch({
              url: 'notice'
            });
          }, 1000);
        }else{
          Util.showToast('保存失败', 'none', 1000);
        }
      },
      fail: function (error) {
        Util.showToast('保存失败', 'none', 1000);
      }
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