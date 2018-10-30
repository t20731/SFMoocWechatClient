// pages/uploadQuestion/uploadQuestion.js
import WCache from '../../utils/wcache';
import Util from '../../utils/util';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionId: 0,
    isQuestionPublished: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('uploadQuestion:onLoad:openid:' + app.globalData.openId);
    this.setData({
      sessionId: options.sessionId
    });
    let isQuestionPublished = WCache.get(options.sessionId + '_isQuestionPublished') || false;
    this.setData({ 
      isQuestionPublished: isQuestionPublished 
    });
    this.loadQuestions(options.sessionId);
  },

  loadQuestions: function(sessionId){
    let that = this;
    wx.request({
      url: app.globalData.host + '/question/load/' + sessionId,
      method: 'GET',
      success: function (res) {
        if (res.data.msg === 'ok') {
          that.setData({ questions: res.data.retObj });
        }
      }
    })
  },

  addQuestion: function () {
    var that = this;
    if (this.data.questions.length >=3) {
      Util.showToast('Maximum 3 questions', 'none', 2000);
    } else {
      wx.navigateTo({
        url: 'editQuestion?sessionId=' + that.data.sessionId,
      })
    }
  },

  editQuestion: function (evt) {
    let quesIndex = evt.target.dataset.quesindex;
    let quesInfoStr = JSON.stringify(this.data.questions[quesIndex]);
    wx.navigateTo({
      url:'editQuestion?quesInfoStr=' + quesInfoStr
    })
  },

  handleDeleteQuestionClick: function (evt) {
    let that = this;
    wx.showModal({
      title: 'Hint',
      content: 'Are you sure to delete this question?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: function (res) {
        if (res.confirm) {
          that.deleteQuestion(evt.target.dataset.quesindex);
        }
      }
    });
  },
  deleteQuestion: function (quesIndex) {
    let that = this;
    let quesId = this.data.questions[quesIndex].id;
    wx.request({
      url: app.globalData.host + '/question/delete/' + quesId,
      method: 'DELETE',
      success: function (res) {
        if (res.data.msg === 'ok') {
          Util.showToast('Success', 'success', 2000);
          that.data.questions.splice(quesIndex, 1);
          that.setData({ questions: that.data.questions });
        } else {
          Util.showToast('Failed', 'none', 2000);
        }
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },
  
  publishQuestions: function () {
    var that = this;
    if (this.data.questions.length != 3) {
      Util.showToast('Minimum 3 questions', 'none', 2000);
    } else {
      wx.request({
        url: app.globalData.host + '/question/publish/' + that.data.sessionId,
        method: 'GET',
        success: function (res) {
          if (res.data.msg === 'ok') {
            Util.showToast('Success', 'success', 2000);
            that.setData({
              isQuestionPublished: true
            });
            WCache.put(that.data.sessionId + '_isQuestionPublished', true, 60 * 60 * 12);
          } else if (res.data.msg === 'not_authorized') {
            Util.showToast('Not Authorized', 'none', 2000);
          } else if (res.data.msg === 'published') {
            Util.showToast('Published', 'none', 2000);
          }
          // setTimeout(function () {
          //   wx.navigateBack({
          //     delta: 1
          //   })
          // }, 2000);
        },
        fail: function (error) {
          console.log(error);
        }
      })
    }
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
    console.log('uploadQuestion:onShow:sessionId:' + this.data.sessionId);
    if (this.data.sessionId){
      this.loadQuestions(this.data.sessionId);
    }
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