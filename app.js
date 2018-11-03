//app.js
import Util from 'utils/util';
App({
  globalData: {
     //host: 'http://localhost:8090',
     host: 'https://sfmooc-api.techtuesday.club',
     openId:'',
     systemInfo: {}
  },
  data: {
  },
  onLaunch: function () {
    console.log('app::onLaunch')
    let openid = wx.getStorageSync('openid');
    this.globalData.systemInfo = wx.getSystemInfoSync();
    if (!openid) {
      var that = this
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            wx.request({
              url: that.globalData.host + '/user/login/' + res.code,
              method: 'GET',
              success: res => {
                console.log(res.data);
                if (res.data.retObj) {
                  that.globalData.openId = res.data.retObj
                  wx.setStorageSync('openid', res.data.retObj); 
                  if(this.openIdCallback){
                    this.openIdCallback(res.data.retObj)
                  }   
                }          
              }
            })
          }
        }
      })
    } else {
      this.globalData.openId = openid
    }
  },

  onShow: function(){
  },
})