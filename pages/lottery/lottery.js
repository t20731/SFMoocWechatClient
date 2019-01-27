// pages/lottery/lottery.js
import Util from '../../utils/util';
import WCache from '../../utils/wcache';
import { Stomp } from '../../utils/stomp.min.js';
const app = getApp();
let stompClient = {};
var socketOpen = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userCount: 1,
    sessionId: 0,
    isSessionOwner: false,
    mypickNumber: '',
    luckyNumber: 0,
    isLuckyDog: false,
    luckyDogs: [],
    isSubmitBtnDisabled: false,
    isLaunchBtnDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sessionId = parseInt(options.sessionId);
    let isOwner = options.isOwner;
    console.log("sessionId: " + sessionId);
    console.log("isOwner: " + isOwner);
    this.setData({
      sessionId: sessionId,
      isSessionOwner: isOwner
    });
    this.getUserCount(sessionId);
    let storedPickNumber = WCache.get(sessionId + '_mypickNumber');
    console.log('storedPickNumber: ' + storedPickNumber);
    if (storedPickNumber != undefined){
      this.setData({
        mypickNumber: storedPickNumber,
        isSubmitBtnDisabled: true
      });
    }

    let storedLuckyList = WCache.get(sessionId + '_storedLuckyDogs');
    console.log('storedLuckyList: ' + storedLuckyList);
    if (storedLuckyList && storedLuckyList.length) {
      this.setData({luckyDogs: storedLuckyList});
    }else{
      if (!socketOpen && storedPickNumber != undefined){
        this.initSocket();
      }
    }
  },

  getUserCount: function(sessionId){
    let that = this;
    wx.request({
      url: app.globalData.host + '/session/usercount/' + sessionId,
      method: 'GET',
      success: function (res) {
        that.setData({ userCount: res.data.retObj })
      },
      fail: function (err) {
        console.log('Failed to get user account');
      }
    });
  },

  checkPickNumber: function (evt, luckyNumber) {
    let pickNumber = evt ? evt.detail.value : luckyNumber;
    let isValid = pickNumber && pickNumber >= 1 && pickNumber <= this.data.userCount;
    if (!isValid) {
      this.setData({errorInputMsg: '请输入正确的抽奖号码'});
    } else {
      this.setData({errorInputMsg: ''});
    }
    return isValid;
  },
  submitLuckyNumber: function (evt) {
    let that = this;
    let pickNumber = evt.detail.value.luckyNumber;
    let isVialid = this.checkPickNumber('', pickNumber);
    if (isVialid) {
      wx.request({
        url: app.globalData.host + '/lottery/bet/',
        method: 'POST',
        data:{
          userId: app.globalData.openId,
          sessionId: this.data.sessionId,
          pickNumber: parseInt(pickNumber)
        },
        success: function (res) {
          if (res.data.msg === 'ok') {
            Util.showToast('Success', 'success', 2000);
            that.setData({ 
              mypickNumber: pickNumber,
              isSubmitBtnDisabled: true
            });
            WCache.put(that.data.sessionId+'_mypickNumber', pickNumber, 24 * 60 * 60);
            that.initSocket();
          }
        },
        fail: function (err) {
          console.log(err);
        }
      });
    }
  },

  launchLottery: function (evt) {
    var that = this;
    wx.showModal({
      content: 'Ready to draw?',
      success: function(res){
        if(res.confirm){
          if (socketOpen) {
            stompClient.send("/app/draw", {}, that.data.sessionId);
          }
        }
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  initSocket: function () {
    let that = this;
    function sendSocketMessage(msg) {
      console.log('send msg:')
      console.log(msg);
      if (socketOpen) {
        wx.sendSocketMessage({
          data: msg
        })
      }
    }

    let ws = {
      send: sendSocketMessage
    }

    wx.connectSocket({
      url: app.globalData.wshost+'/sfmooc-websocket'
    })
    wx.onSocketOpen(function (res) {
      console.log("connected");
      socketOpen = true;
      ws.onopen();
    })

    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！' + res)
    })

    wx.onSocketMessage(function (res) {
      console.log('wx.onSocketMessage', res);
      ws.onmessage(res);
    })

    Stomp.setInterval = function (interval, f) {
      return setInterval(f, interval);
    }
    Stomp.clearInterval = function (id) {
      return clearInterval(id);
    }
    stompClient = Stomp.over(ws);
    stompClient.connect({}, function (sessionId) {
    stompClient.subscribe('/topic/lottery', function (message) {
        console.log('From MQ:', message.body);
        let lotteryRes = JSON.parse(message.body);
        that.handleLotteryResult(lotteryRes);
      });
    });
  },

  handleLotteryResult: function (result) {
    if (result.msg === 'ok' && result.retObj) {
      let luckyNumber = result.retObj.luckyNumber;
      let luckyDogs = result.retObj.luckyDogs;
      console.log('luckyDogs: ' + luckyDogs);
      this.setData({ 
        finalLuckyNumber: luckyNumber,
        luckyDogs: luckyDogs
      });
      if (luckyDogs.length && parseInt(this.data.mypickNumber) === luckyNumber) {
        this.setData({isLuckyDog: true});
      }
      if (luckyDogs.length) {
        this.setData({
          isLaunchBtnDisabled: true
        });
        // close connection
        this.closeSocket();
        // store lottery result in storage within 1 hour
        WCache.put(this.data.sessionId + '_storedLuckyDogs', luckyDogs, 24 * 60 * 60);
      }
    }
  },

  closeSocket: function(){
    if (socketOpen) {
      var that = this;
      wx.closeSocket({
        success: function (res) {
          console.log("websocket连接已关闭");
          socketOpen = false;
        }
      });
    }
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
    this.closeSocket();
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
