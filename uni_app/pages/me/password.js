Page({
  data: {
    password: '',
    confirm: '',
    loading: false
  },

  // 统一处理输入框绑定 (需在 WXML 中对应设置 data-name="password" 等)
  handleInput(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      [name]: e.detail.value
    });
  },

  updatePassword() {
    // 防止连击
    if (this.data.loading) return;

    const { password, confirm } = this.data;

    // 1. 前端基础校验
    if (!password || password.length < 6) {
      return wx.showToast({ title: '新密码至少6位', icon: 'none' });
    }
    if (password !== confirm) {
      return wx.showToast({ title: '两次密码输入不一致', icon: 'none' });
    }

    // 2. 获取当前用户ID
    const user = wx.getStorageSync('userInfo');
    if (!user || !user.id) {
      return wx.showToast({ 
        title: '登录已失效', 
        icon: 'none',
        success: () => {
          setTimeout(() => wx.reLaunch({ url: '/pages/login/login' }), 1500);
        }
      });
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '安全提交中...' });

    // 3. 发起请求
    wx.request({
      url: 'http://localhost:8080/api/user/updatePwd', 
      method: 'POST',
      data: {
        id: user.id,
        newPassword: password
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        // 注意：根据你后端 Result 类的 code 判断
        if (res.data.code === 200) {
          wx.showModal({
            title: '修改成功',
            content: '密码已更新，请使用新密码重新登录',
            showCancel: false,
            confirmText: '去登录',
            success: () => {
              // --- 安全关键点：清除缓存并强行重定向到登录页 ---
              wx.clearStorageSync(); 
              wx.reLaunch({
                url: '/pages/login/login'
              });
            }
          });
        } else {
          wx.showToast({ title: res.data.msg || '修改失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
        wx.hideLoading();
      }
    });
  }
})