const getCurrentDate = function () {
  var date = new Date();
  var nowMonth = date.getMonth() + 1;
  var strDate = date.getDate();
  var seperator = "-";
  if (nowMonth >= 1 && nowMonth <= 9) {
    nowMonth = "0" + nowMonth;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var nowDate = date.getFullYear() + seperator + nowMonth + seperator + strDate;
  return nowDate;
};

const showToast = function (msg, icon, time) {
  wx.showToast({
    title: msg,
    icon: icon,
    duration: time || 1500
  })
};

export default { getCurrentDate, showToast };
