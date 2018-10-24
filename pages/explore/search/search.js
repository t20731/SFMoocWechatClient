// pages/explore/search.js
import WXRequest from '../../../utils/wxRequest';
import Util from '../../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCloseHidden: true,
    searchValue: "",
    searchSubmitHidden: true,
    searchResetHidden: false,
    switchFlag: true,
    hotSearchKeys1: ['Java', 'Javascript', 'Python', 'HANA'],
    hotSearchKeys2: ['React', 'VUE', 'Product', 'Mysql', 'UI design'],
    historyData: [],
    historyDataHidden: false,
    searchKeywordsHidden: false,
    searchResult: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSearchHistory();
  },
  /*输入框输入后触发，用于联想搜索和切换取消确认*/
  handleInputChange: function (e) {
    console.log('---bindinput triggered---');
    this.updateSearchbarStatus(e.detail.value);
  },
  updateSearchbarStatus: function (searchValue) {
    this.setData({
      searchSubmitHidden: false,
      searchResetHidden: true,
      isCloseHidden: false,
      searchValue: searchValue
    })
  },
  
  resetInputValue: function () {
    this.setData({
      searchSubmitHidden: true,
      searchResetHidden: false,
      isCloseHidden: true,
      searchValue: "",
      searchKeywordsHidden: false,
      searchResult: []
    })
  },
  cancelSearch: function () {
    wx.navigateBack({
      url: 'explore'
    })
  },

  changeHotSearchKeys: function () {
    this.setData({
      switchFlag: !this.data.switchFlag
    })
  },
  searchEvents: function () {
    let newHistoryData = this.data.historyData.concat(this.data.searchValue);
    this.setSearchHistory(newHistoryData);
    WXRequest.post('/session/list', {
      pageNum: 1,
      pageSize: 10,
      keyWord: this.data.searchValue
    }).then(res => {
      if (res.data.msg === 'ok') {
        this.setData({ 
          searchKeywordsHidden: true,
          searchResultCount: res.data.retObj.length
        });
        if (res.data.retObj.length > 0) {
          this.setData({
            searchResult: res.data.retObj
          });
        } else {
          this.setData({
            searchResult: []
          });
        }
      }
    }).catch(e => {
      console.log(e);
    });
  },
  onHotKeywordPress: function (evt) {
    let keyword = evt.target.dataset.selectedKeyword;
    this.updateSearchbarStatus(keyword);
  },
  clearSearchHistory: function () {
    this.setSearchHistory([]);
  },
  setSearchHistory: function (newData) {
    let that = this;
    wx.setStorage({
      key: "historydata",
      data: newData,
      success: function (res) {
        that.setData({
          historyData: newData
        })
      }
    })
  },
  getSearchHistory: function () {
    let that = this;
    wx.getStorage({
      key: "historydata",
      success: function (res) {
        that.setData({
          historyData: res.data
        })
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
