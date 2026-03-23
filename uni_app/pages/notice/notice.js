Page({
  data: { notices: [] },
  onLoad() {
    const user = wx.getStorageSync('userInfo');
    wx.request({
      url: 'http://localhost:8080/api/notice/list',
      data: { userId: user.id },
      success: (res) => this.setData({ notices: res.data })
    });
  }
})