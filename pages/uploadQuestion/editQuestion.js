// pages/uploadQuestion/editQuestion.js
import Util from '../../utils/util';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: [
      {
        label: 'A',
        value: ''
      },
      {
        label: 'B',
        value: ''
      }
    ],
    optionValues: ['A', 'B'],
    correctOption: {
      index: 0
    },
    sessionId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      sessionId: options.sessionId
    });
    console.log('sessionId: ' + this.data.sessionId);
    let quesInfoStr = options.quesInfoStr;
    if (quesInfoStr) {
      let questionObj = JSON.parse(quesInfoStr);
      let options = questionObj.options.map((obj, index) => {
        if (!that.data.optionValues.includes(obj.number)) {
          this.data.optionValues.push(obj.number);
        }
        if (obj.isAnswer) {
          that.setData({
            correctOption: {index: index}
          });
        }
        return {
          label: obj.number,
          value: obj.content,
        }
      })

      this.setData({
        id: questionObj.id,
        sessionId: questionObj.sessionId,
        title: questionObj.content,
        options: options,
        optionValues: this.data.optionValues
      });
    }
  },

  handleAddQuesClick: function () {
    let optionsLength = this.data.options.length;
    if (optionsLength >= 4){
      Util.showToast('不支持添加更多选项', 'none', 2000);
      return;
    }
    let newItem = {};
    newItem.label = String.fromCharCode(65 + optionsLength);
    newItem.value = '';
    this.setData({
      options: [...this.data.options, newItem],
      optionValues: [...this.data.optionValues, newItem.label]
    });
  },

  onOptionChange: function (evt) {
    let optionIndex = evt.target.dataset.index;
    let optionValue = evt.detail.value;
    let propPath = 'options[' + optionIndex + '].value';
    this.setData({[propPath]: optionValue });
    console.log(this.data.options);
  },

  handleDeleteOptionClick: function (evt) {
    let deletedIndex = evt.target.dataset.index;
    let optionsLength = this.data.options.length;
    
    this.data.options.splice(deletedIndex, 1);
    if (deletedIndex === optionsLength -1) {
      // remove 'C' or 'D'
      this.data.optionValues.splice(deletedIndex, 1);
      this.setData({
        optionValues: this.data.optionValues,
        options: this.data.options
      });
    } else {
      // remove 'C'
      this.data.options[2].label = 'C';
      this.setData({
        optionValues: ['A', 'B', 'C'],
        options: this.data.options
      });
    }
  },

  onCorrectOptionChange: function (evt) {
    this.setData({ correctOption:{index: evt.detail.value}});
  },

  submitQuestion: function (evt) {
    let isValid = this.validateQuestionContent(evt.detail.value);
    if (isValid) {
      let correctOptionLabel = this.data.optionValues[this.data.correctOption.index];
      let options = this.data.options.map(option => {
        return {
          number: option.label,
          content: option.value,
          isAnswer: option.label === correctOptionLabel ? 1 : 0
        }
      });
      wx.request({
        url: app.globalData.host + '/question/edit',
        method: 'post',
        data: { 
          sessionId: this.data.sessionId,
          id: this.data.id,
          owner: app.globalData.openId,
          content: evt.detail.value.title,
          options: options
        },
        success: function (res) {
          if (res.data.msg === 'ok') {
            Util.showToast('保存成功', 'success', 1000);
            setTimeout(function() {
              wx.redirectTo({
                url: 'uploadQuestion'
              })
            }, 1000);
          } else if (res.data.msg === 'exceed_threshold'){
            Util.showToast('本赛季出题数已达上限', 'none', 1000);
            setTimeout(function () {
              wx.redirectTo({
                url: 'uploadQuestion'
              })
            }, 1000);
          }
        },
        fail: function (error) {
          console.log(error);
        }
      });
    }
  },

  validateQuestionContent: function (questionCont) {
    let isValid = true;
    if (!questionCont.title.trim()) {
      isValid = false;
      Util.showToast('题目不能为空', 'none', 2000);
      return isValid;
    }
    for (let i=0; i<this.data.options.length; i++) {
      if (!this.data.options[i].value.trim()) {
        isValid = false;
        Util.showToast('选项内容不能为空', 'none', 2000);
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