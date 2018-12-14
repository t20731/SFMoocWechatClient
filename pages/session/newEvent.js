// pages/session/newEvent.js
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';

Page({

  /**
   * Page initial data
   */
  data: {
    dateTimeArray: null,
    startDateTime: null,
    // endDateTime: null,
    startDateTimeVal: '',
    // endDateTimeVal: '',
    startYear: 2018,
    endYear: 2118,
    durations: ['30 Minutes', '45 Minutes', '1 Hour'],
    durationIndex: 0,
    difficulties: ['Beginner', 'Intermediate', 'Advanced'],
    difficultyIndex: 0,
    locations: [
      { id: 2, name: "PVG03 D5.2" },
      { id: 3, name: "PVG03 D5.3" }
    ],
    locationIndex: 0,
    directions: [
      { id: 2, name: "Cutting Edge Tech", imageSrc: null },
      { id: 3, name: "Frontend", imageSrc: null }
    ],
    directionIndex: 0,
    groupIndex:0,
    mode: "create",
    editSessionDetail: null,
    formData: {}
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this._initDateTimePicker();
    this._initData();

    this._initEditData(options);
  },

  _initData: function() {
    WXRequest.get('/session/init/' + Util.getUserId()).then(res => {
      if (res.data.msg === 'ok') {
        console.log('/session/init', res.data);
        let retObj = res.data.retObj;
        this.setData({
          directions: retObj.directions,
          locations: retObj.locations,
          groups: retObj.groups
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _initEditData: function(options) {
    // if there is no 'id' params in page options, means it's not an edit action
    if (options == null || options.id == null) {
      wx.setNavigationBarTitle({
        title: "Create New Session"
      })
      return;
    }

    // handle edit data init
    this.setData({
      mode: "edit"
    })
    wx.setNavigationBarTitle({
      title: "Edit Session Detail"
    })
    let userId = Util.getUserId();

    wx.showLoading({
      title: 'Loading',
      mask: true
    })
    WXRequest.post('/session/detail', {
      sessionId: options.id,
      userId: userId
    }).then(res => {
      wx.hideLoading();
      if (res.data.msg === 'ok') {
        const retObj = res.data.retObj;

        this.setData({
          editSessionDetail: retObj.session,
          formData: retObj.session,
          startDateTime: this._calDateTimeStr2Arr(retObj.session.startDate),
          startDateTimeVal: retObj.session.startDate,
          durationIndex: this._calDuartionIndex(retObj.session.startDate,retObj.session.endDate),
          locationIndex: this.data.locations.map(val => val.name).indexOf(retObj.session.location.name),
          directionIndex: this.data.directions.map(val => val.name).indexOf(retObj.session.direction.name),
          groupIndex: this.data.groups.map(val => val.name).indexOf(retObj.session.group.name),
          difficultyIndex: retObj.session.difficulty
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _initDateTimePicker: function () {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    let dateTimeObj = Util.dateTimePicker(this.data.startYear, this.data.endYear);
    let dateTimeArray = dateTimeObj.dateTimeArray;
    let dateTime = dateTimeObj.dateTime;

    let startDateTimeVal = this._calDateTimeVal(dateTime, dateTimeArray)

    this.setData({
      dateTimeArray: dateTimeArray,
      startDateTime: dateTime,
      startDateTimeVal: startDateTimeVal
      // endDateTime: dateTimeObj.dateTime
    });
  },

  changeSartDateTimeVal(e) {
    let dateTime = e.detail.value;
    let startDateTimeVal = this._calDateTimeVal(dateTime);
    this.inputChange('startDateTimeVal', startDateTimeVal);
  },

  _calDateTimeVal: function (dateTime, oriDateTimeArray) {
    let dateTimeArray = this.data.dateTimeArray || oriDateTimeArray;
    let temp = dateTime.map((val, i) => {
      return dateTimeArray[i][val];
    });
    let dateTimeVal = `${temp[0]}-${temp[1]}-${temp[2]} ${temp[3]}:${ temp[4]}`;
    console.log(dateTimeVal);
    return dateTimeVal;
  },

  _calDateTimeStr2Arr: function (dateStr) {
    let dateTimeObj = Util.dateTimePicker(this.data.startYear, this.data.endYear);

    const dateStrArr = dateStr.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/);
    dateStrArr.splice(0, 1)

    const arrMap = dateTimeObj.dateTimeArray
    return dateStrArr.map((val, index) => {
      return arrMap[index].indexOf(val)
    })
  },
  _calDuartionIndex: function (startDateStr, endDateStr) {
    const val = this._calDuartionVal(startDateStr,endDateStr);
    return this.data.durations.indexOf(val);
  },

  _calDuartionVal : function (startDateStr,endDateStr) {
    const startDateTimestamp = new Date(startDateStr).getTime();
    const endDateTimestamp = new Date(endDateStr).getTime();
    const durationMin = (endDateTimestamp - startDateTimestamp)/60000;
    if (durationMin < 60) {
      return durationMin > 1 ? `${durationMin} Minutes` : `${durationMin} Minute`
    }

    const durationHour = durationMin / 60
    if (durationHour < 24) {
      return durationHour > 1 ? `${durationHour} Hours` : `${durationHour} Hour`
    }

    // TODO extend in future if need
    return durationHour + " Hours"
  },

  changeStartDateTimeColumn(e) {
    let arr = this.data.startDateTime, 
        dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = Util.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray: dateArr,
      startDateTime: arr
    });
  },

  bindDurationChange: function(e) {
    this.inputChange('durationIndex', e.detail.value);
  },

  bindLocationChange: function (e) {
    this.inputChange('locationIndex', e.detail.value);
  },

  bindDirectionChange: function(e) {
    this.inputChange('directionIndex', e.detail.value);
  },

  bindGroupChange: function (e) {
    this.inputChange('groupIndex', e.detail.value);
  },

  bindDifficultyChange: function(e) {
    this.inputChange('difficultyIndex', e.detail.value);
  },

  inputChange: function (name, value) {
    this.setData({
      [name]: value
    });
  },

  onSubmit: function(event) {
    let value = event.detail.value;
    let eventDetail = this._buildEventDetail(value);

    if (this.data.mode == "edit" && this.data.editSessionDetail != null) {
      eventDetail.id = this.data.editSessionDetail.id
    }

    WXRequest.post('/session/edit', eventDetail).then(res => {
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

  _buildEventDetail: function(value) {
    let startDateTimeVal = this.data.startDateTimeVal;
    let duration = this.data.durations[value.duration];
    let endDateTimeVal = this._calEndDateTimeVal(startDateTimeVal, duration);

    let eventDetail = {
      owner: {
        id: Util.getUserId()
      },
      topic: value.topic,
      description: value.description,
      startDate: startDateTimeVal,
      endDate: endDateTimeVal,
      direction: {
        id: this.data.directions[value.direction].id
      },
      difficulty: value.difficulty,
      location: {
        id: this.data.locations[value.location].id
      },
      typeId: this.data.groups[value.group].id
    };
    return eventDetail;
  },

  _calEndDateTimeVal: (startDateTime, duration) => {
    let iosTime = startDateTime.replace(/-/g, '/');

    let n = duration.split(' ')[0];
    let time = parseInt(n === '1' ? '60' : n);
    let endDateTime = new Date(new Date(iosTime).getTime() + time * 60 * 1000);

    return Util.getDateTime(endDateTime);
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  }
})