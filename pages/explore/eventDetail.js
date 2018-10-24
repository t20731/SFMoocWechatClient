import WXRequest from '../../utils/wxRequest';

Page({
  data: { // 参与页面渲染的数据
    disabled: false,
    loading: false,
    registerBtnVal: 'Register',
    eventDetail: {
      owner: {
        id: '001',
        nickname: 'Mickey White',
        avatarUrl: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=18101919'
      },
      topic: 'Event Detail',
      description: 'Bacon ipsum dolor amet shankle buffalo salami biltong, meatloaf pork strip steak meatball ham sausage chicken leberkas. Corned beef capicola picanha pork loin fatback hamburger. Leberkas short ribs pork chuck. Beef boudin turkey capicola, shankle ham hock frankfurter leberkas spare ribs shoulder ground round flank ham sirloin.',
      startDate: '2018-10-21 15:00',
      endDate: '2018-10-21 16:00',
      location: {id: null, name: 'PVG 03 1C'}
    }
  },

  onLoad: function (e) {
    var userId = this.getUserId();

    this._checkGuest(userId);

    WXRequest.request.post('/session/detail',{
      sessionId: e.id,
      userId: userId
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        var retObj = res.data.retObj;
        var eventDetail = retObj.session;
        this.setData({
          eventDetail: eventDetail
        });
        if (userId && retObj.userRegistered) {
          this._markRegistered();
        }
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _checkGuest: function (userId) {
    if (userId === null) {
      // guest cannot register
      this.setData({
        registerBtnVal: 'Login to Register',
        disabled: true
      });
    }
  },

  _markRegistered: function () {
    this.setData({
      disabled: true,
      registerBtnVal: 'Registered'
    });
  },

  onRegister: function(event) {
    // call API to register the event
    console.log('Register: ', event);
    this.setData({
      disabled: !this.data.disabled,
      loading: !this.data.loading,
    });

    var userId = this.getUserId();
    WXRequest.request.post('/session/register/', {
      userId: userId,
      sessionId: this.data.eventDetail.id
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        wx.showToast({ title: 'Successfully' });
        this.setData({
          loading: false,
          registerBtnVal: 'Registered'
        })
      } else {
        this.setData({
          disabled: false
        });
        this.showError('Register failed. Please try again');
      }
    }).catch(e => {
      this.showError('Please try again');
      console.log(e);
    });
    this.setData({
      loading: !this.data.loading,
    });
  },

  getUserId: function () {
    var userInfo = wx.getStorageSync('userInfo');
    var userId = userInfo && userInfo.id || null;
    return userId;
  },

  showError: function(title) {
    wx.showToast({ title: title, icon: 'none' });
  }
});