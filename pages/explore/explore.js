// pages/notice/notice.js
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';
import * as CONST from '../../utils/const';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tabItems: CONST.EXPLORE_TOPIC_CATEGORY,
    currentTab: 2,
    scrollLeft: 0,
    showFilterPopup: false,
    directions: [],
    sessions: [],
    showNoData: 'false',
    difficultyLevels: CONST.DIFFICULTY_LEVELS,
    orderByFields: CONST.ORDER_BY,
    selectedLevel: -1,
    selectedOrder: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
  },

  init: function(){
    WXRequest.post('/session/all', {
      pageNum: 1,
      pageSize: 10
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        this.setData({
          directions: res.data.retObj.directions,
          sessions: res.data.retObj.sessions,
          swiperHeight: res.data.retObj.sessions.length * 200
        });
      }
    }).catch(e => {
        console.log(e)
    });
  },

  swichNav: function (evt) {
    let cur = evt.target.dataset.current;
    if (this.data.currentTab === cur) { 
      return false; 
    } else {
      this.loadNewTabItemData(cur);
    }
  },
  switchTab: function (evt) {
    let cur = evt.detail.current;
    this.loadNewTabItemData(cur);    
  },

  loadNewTabItemData: function (currentTab) {
    this.setData({
      currentTab: currentTab
    });
    WXRequest.post('/session/list', {
      "pageNum": 1,
      "pageSize": 10,
      "directionId": currentTab,
      "orderField": "total_members"
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        let swiperHeight = this.getCoumptedSwiperHeight(res.data.retObj.length);
        this.setData({
          sessions: res.data.retObj,
          swiperHeight: swiperHeight,
          showNoData: res.data.retObj.length === 0
        });
      }
    }).catch(e => {
      console.log(e)
    });
  },
  getCoumptedSwiperHeight: function (count) {
    let itemsHeight = count * 200;
    let swiperHeight = itemsHeight > this.data.listVisibleHeight  ? itemsHeight : this.data.listVisibleHeight;
    return swiperHeight;
  },
  goToSearchPage: function (evt) {
    wx.navigateTo({
      url: 'search/search'
    })
  },

  goToFilterPage: function () {
    this.setData({
      showFilterPopup: true
    });
  },
 
  goDetail: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id,
    })
  },

  onTagChange: function (evt) {
    let filterType = evt.target.dataset.type;
    let newValue = evt.target.dataset.tagvalue;
    let dataPropertyName;
    if (filterType === 'level') {
      dataPropertyName = 'selectedLevel';
    } else {
      dataPropertyName = 'selectedOrder';
    }
    if (newValue !== this.data[dataPropertyName]) {
      this.setData({
        [dataPropertyName]: newValue
      });
    }
  },

  comfirmFilter: function () {
    this.setData({
      showFilterPopup: false
    });
    if (this.data.selectedLevel < 0 && !this.data.selectedOrder) {
      return;
    }
    WXRequest.post('/session/list', {
      "pageNum": 1,
      "pageSize": 10,
      "directionId": this.data.currentTab,
      "difficulty": this.data.selectedLevel,
      "orderField": this.data.selectedOrder
    }).then(res => {
      console.log(res);
      if (res.data.msg === 'ok') {
        let swiperHeight = this.getCoumptedSwiperHeight(res.data.retObj.length);
        this.setData({
          sessions: res.data.retObj,
          swiperHeight: swiperHeight,
          showNoData: res.data.retObj.length === 0,
          selectedLevel: -1,
          selectedOrder: ''
        });
      }
    }).catch(err => {
      console.log(err);
    });
  },
  closeFilterPopup: function () {
    this.setData({
      showFilterPopup: false,
      selectedLevel: -1,
      selectedOrder: ''
    });
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
    //  this.init();
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log('----systeminfo----');
        console.log(res);
        that.setData({
          listVisibleHeight: res.windowHeight * (750 / res.windowWidth) - 160
        });
        console.log(res.windowHeight * (750 / res.windowWidth) - 160);
      }
    });
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
