//index.js
//获取应用实例
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';
const app = getApp();
let sliderWidth = 96;

Page({
  data: {
    myRanking: {},
    userRankingList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    tabArr: ["User", "Session"],
    sessionRankingList: [],
    sessions: [],
    groupArr: [],
    selectedGroupId: 1,
    selectedGroupName: 'Public',
    canJoin: false
  },
  onLoad: function () {
    console.log('userRankingList::onLoad');
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabArr.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabArr.length * that.data.activeIndex
        });
      }
    });
    this.getGroupList();
    this._loadUserRanking();
  },

  onShow: function(){
  },

  getGroupList: function(){
    let userId = Util.getUserId();
    WXRequest.get('/group/list/'+ userId).then(res => {
      if (res.data.length > 0) {
        console.log('/group/list', res.data);
        this.setData({
          groupArr: res.data
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  onPullDownRefresh: function () {
    this._refreshRanking();
    wx.stopPullDownRefresh();

  },

  onGroupChange: function (e) {
    let selectedGroupIndex = e.detail.value;
    console.log("selectedGroupIndex: " + selectedGroupIndex);
    this.setData({
      selectedGroupId: this.data.groupArr[selectedGroupIndex].id,
      selectedGroupName: this.data.groupArr[selectedGroupIndex].name,
      canJoin: this.data.groupArr[selectedGroupIndex].canJoin
    });
    this._refreshRanking();
  },

  tabClick: function (e) {
    let currentIndex = e.currentTarget.id;
    let name = this.data.tabArr[currentIndex];
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: currentIndex
    });
    if (currentIndex == 0) {
      this._setLoading(name, true);
      this._loadUserRanking();
    } else if (currentIndex == 1) {
      this._setLoading(name, true);
      this._loadSessionRanking();
    }
  },

  goSessionDetail: function (e) {
    let id = e.currentTarget.id;
    console.log('id: ' + id);
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id,
    })
  },

// User
  _loadUserRanking: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/ranking/list/' + this.data.selectedGroupId,
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          userRankingList: res.data
        });
        that._findMyRanking(res.data);
      },
      fail: function (e) {
        Util.showToast('数据获取失败', 'none', 2000);
      }
    });
  },

  _findMyRanking: function (userRankingList) {
      let myId = Util.getUserId();
      let myRanking = userRankingList.filter(item => item.userId === myId)[0];
      if(myRanking == undefined){
        myRanking = null;
      }
      this.setData({
        myRanking: myRanking
      });
  },

// Session
  _loadSessionRanking: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/ranking/listSession/' + this.data.selectedGroupId,
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          sessions: res.data
        });
      },
      fail: function (e) {
        Util.showToast('Failed to get data', 'none', 2000);
      }
    })
  },

  _setLoading: function (name, showLoading) {
    this.setData({
      [name + ' Ranking Is Loading']: showLoading
    });
  },

  _refreshRanking: function () {
    console.log('userRankingList::onPullDownRefresh');
    this.getGroupList();
    const activeIndex = this.data.activeIndex;
    let name = this.data.tabArr[activeIndex];
    if (activeIndex == 0) {
      this._setLoading(name, true);
      this._loadUserRanking();
    } else if (activeIndex == 1) {
      this._setLoading(name, true);
      this._loadSessionRanking();
    }
  },

  onJoinClick: function(e){
    console.log('id:' + e.currentTarget.id);
    let groupId = Number(e.currentTarget.id);
    let groupName = e.currentTarget.dataset.name;
    console.log('groupName:' + groupName);
    var that = this;
    wx.showModal({
      content: 'Are your sure to join ' + groupName +' ?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: function (res) {
        if (res.confirm) {
           that.joinGroup(groupId);
        }
      }
    })
  },

  joinGroup: function(groupId){
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      WXRequest.post('/group/join/', {
        userId: userInfo.id,
        groupId: groupId
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          that.setData({
            canJoin: false
          })
          Util.showToast('Welcome', 'success', 1000);
          that._loadUserRanking();
        } else {
          Util.showToast('Join failed. Please try again', 'none');
        }
      }).catch(e => {
        Util.showToast('Please try again', 'none');
        console.log(e);
      });
    } else {
      Util.showToast('Please login first', 'none');
    }
  }

})
