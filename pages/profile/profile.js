import Util from '../../utils/util';
import WCache from '../../utils/wcache';
import WXRequest from '../../utils/wxRequest';


const app = getApp(); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    isLoading:false,
    isModified: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this;
    let userId = Util.getUserId();
    if (userId) {

      WXRequest.get('/user/' + userId).then(res => {
        if (res.data.msg === 'ok') {
          console.log('/user/', res.data);
          this.setData({
            userInfo: res.data.retObj
          });
        }
      }).catch(e => {
        console.log(e);
      });
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
    
  },

  onSubmit: function (e) {
    let value = e.detail.value;
    let userDetail = this._buildUserDetail(value);

    WXRequest.post('/user/edit', userDetail).then(res => {
      if (res.data.msg === 'ok') {
        Util.showToast('Success', 'success', 1000);
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _buildUserDetail: function (value) {

    let userDetail = {
      id:this.data.userInfo.id,
      // gender: value.gender,
      department: value.department,
      blog: value.blog,
      signature:value.signature,
      github:value.github,
      seat:value.seat
    };
    return userDetail;
  },

  onProfileDataChange: function(e) {
    if (!this.data.isModified) {
      this.setData({
        isModified: true
      })
    }
  }
})