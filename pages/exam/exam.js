// pages/exam/exam.js
import Util from '../../utils/util';
import WCache from '../../utils/wcache';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [],
    answers: {},
    isExamAvailable: false,
    isSubmitBtnDisabled: false,
    sessionId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      sessionId: options.sessionId
    })
    wx.request({
      url: app.globalData.host + '/exam/load/question/' + options.sessionId,
      method: 'GET',
      success: function (res) {
        if (res.data.msg === 'ok') {
          let isExamAvailable = res.data.retObj.length > 0 && res.data.retObj[0].options[0].isAnswer === null;
          that.setData({ 
            questions: res.data.retObj,
            isExamAvailable: isExamAvailable
          });
          let isExamSubmitted = WCache.get(options.sessionId + '_isExamSubmitted') || false;
          that.setData({ isExamSubmitted: isExamSubmitted });
          if (isExamAvailable && isExamSubmitted) {
            // put correct answer into per question
            let correctAnswerMap = WCache.get(options.sessionId + '_correctAnswerMap');
            that.setCorrectAnswerOfExam(correctAnswerMap);
          }
        }
      }
    });
  },
  setCorrectAnswerOfExam: function (answerMap) {
    for (let i=0; i< this.data.questions.length; i++) {
      let question = this.data.questions[i];
      question.options = question.options.map(function (option) {
        option.isAnswer = answerMap[option.questionId] === option.number;
        return option;
      });
    }
    this.setData({questions: this.data.questions});
  },
  handleAnswerChange: function (evt) {
    let quesIndex = evt.currentTarget.dataset.quesindex;
    let questionId = this.data.questions[quesIndex].id;
    let answer = evt.detail.value;
    this.data.answers[questionId] = answer;
    this.setData({answers: this.data.answers});
    // strore my answer
    this.data.questions[quesIndex].myAnswer = answer;
  },
  submitExam: function () {
    let that = this;
    let isValid = this.validateAnswers();
    if (!isValid) {
      Util.showToast('Please answer all the questions', 'none', 2000);
    } else {
      wx.request({
        url: app.globalData.host + '/exam/submit',
        method: 'POST',
        data: {
          sessionId: that.data.sessionId,
          userId: app.globalData.openId,
          answerMap: this.data.answers
        },
        success: function (res) {
          if (res.data.msg === 'ok') {
            Util.showToast('Credits +' + res.data.retObj.points, 'success', 3000);
            // wx.showModal({
            //   content: 'Credits + ' + res.data.retObj.points,
            //   confirmText: 'Confirm',
            //   confirmColor: '#0076cb',
            //   showCancel: false,
            //   success: function (res) {
            //     if (res.confirm) {
            //       console.log('Confirmed')
            //     }
            //   }
            // });
            that.setData({
              correctAnswerMap: res.data.retObj.answerMap,
              isSubmitBtnDisabled: true
            })

            // put correct answer into this.data.questions
            that.data.questions = that.data.questions.map((question) => {
              question.correctOption = that.data.correctAnswerMap[question.id];
              return question;
            });
            that.setData({ questions: that.data.questions});

            WCache.put(that.data.sessionId + '_isExamSubmitted', true, 60*60*12);
            WCache.put(that.data.sessionId + '_correctAnswerMap', that.data.correctAnswerMap, 60*60*12);

          } else if (res.data.msg === 'not_authorized' && res.data.status === -1){
            Util.showToast('not_authorized', 'none', 2000);
          } else if (res.data.msg === 'not_authorized' && res.data.status === -2) {
            Util.showToast('not_authorized', 'none', 2000);
          } else if (res.data.msg === 'submitted' && res.data.status === -1) {
            Util.showToast('submitted', 'none', 2000);
          }
        },
        fail: function (error) {
          console.log(error);
        }
      })
    }
    console.log(this.data);
  },

  validateAnswers: function () {
    let isValid = true;
    for (let i=0; i<this.data.questions.length; i++) {
      let question = this.data.questions[i];
      if (!this.data.answers.hasOwnProperty(question.id)) {
        isValid = false;
        break;
      }
    }
    return isValid;
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
