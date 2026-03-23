Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: ''
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  /**
   * 登录逻辑
   */
  handleLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({ title: '请输入账号密码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '验证中...' });

    // 向 Spring Boot 后端发起请求
    wx.request({
      // 注意：真机调试需替换为局域网IP，本地调试确保开发者工具勾选“不校验合法域名”
      url: 'http://localhost:8080/api/user/login', 
      method: 'POST',
      data: {
        username: username,
        password: password
      },
      success: (res) => {
        wx.hideLoading();

        if (res.data.code === 200) {
          const userInfo = res.data.data;

          // 1. 将用户信息存入缓存，供全局调用
          // 现在 userInfo 中包含了 role(0,1,2), id, nickname, houseNumber 等
          wx.setStorageSync('userInfo', userInfo);

          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1000
          });

          // 2. 根据重构后的角色逻辑分流 (0:住户, 1:管理员, 2:维修员)
          setTimeout(() => {
            const role = userInfo.role;
            
            if (role === 0) {
              console.log('跳转至住户端');
              wx.reLaunch({
                url: '/pages/owner/index' // 对应你原本的 OWNER 端
              });
            } else if (role === 1) {
              console.log('跳转至管理端');
              wx.reLaunch({
                url: '/pages/admin/index' // 对应你原本的 ADMIN 端
              });
            } else if (role === 2) {
              console.log('跳转至维修端');
              // 预留维修端入口，即便现在不急着做，逻辑上也要跑通
              wx.showToast({ title: '维修端暂未开放', icon: 'none' });
            } else {
              wx.showToast({ title: '未获授权的角色', icon: 'none' });
            }
          }, 1000);

        } else {
          wx.showToast({
            title: res.data.msg || '账号或密码错误',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '服务器连接失败', icon: 'none' });
      }
    });
  }
})