Page({
  data: {
    order: {},
    timeline: [],
    // --- 评价相关数据 ---
    showRateModal: false,
    rateScore: 5, // 默认满分
    rateContent: '',
    scoreTexts: ['非常不满', '不满意', '一般', '满意', '非常满意']
  },

  onLoad: function (options) {
    const id = options.id;
    if (id) {
      this.fetchDetail(id);
    }
  },

  // 获取详情
  fetchDetail(id) {
    wx.showLoading({ title: '加载中' });
    wx.request({
      url: `http://localhost:8080/api/repair/detail/${id}`,
      method: 'GET',
      success: (res) => {
        const order = res.data;
        // 时间格式化处理
        if (order && order.createTime) {
          order.createTime = order.createTime.replace('T', ' ').substring(0, 16);
        }
        
        this.setData({ 
          order: order || {},
          timeline: this.generateTimeline(order)
        });
      },
      fail: () => {
        wx.showToast({ title: '获取详情失败', icon: 'none' });
      },
      complete: () => wx.hideLoading()
    });
  },

  // 生成时间轴（适配 0-4 级状态）
  generateTimeline(order) {
    if (!order) return [];
    const steps = [
      { status: 0, title: '提交报修', desc: '您的报修单已提交，等待物业受理', time: order.createTime },
      { status: 1, title: '物业已受理', desc: order.workerName ? `已指派维修员：${order.workerName}` : '正在为您安排维修师傅', time: '' },
      { status: 2, title: '维修中', desc: '师傅正在现场处理中', time: '' },
      { status: 3, title: '维修完成', desc: '故障已排除，请确认并评价', time: '' },
      { status: 4, title: '评价完成', desc: '感谢您的反馈，祝您生活愉快', time: '' }
    ];

    return steps.map(step => {
      return {
        ...step,
        isDone: order.status >= step.status,
        isCurrent: order.status === step.status
      };
    });
  },

  // --- 评价功能逻辑 ---

  // 1. 打开评价弹窗（增加状态校验）
  goToRate() {
    const { order } = this.data;
    
    // 安全拦截：只有状态为 3 (已完成) 才能评价
    if (order.status < 3) {
      wx.showToast({ title: '维修尚未完成，暂不能评价', icon: 'none' });
      return;
    }
    if (order.status >= 4) {
      wx.showToast({ title: '该单已评价过啦', icon: 'none' });
      return;
    }

    this.setData({ showRateModal: true });
  },

  // 2. 关闭弹窗
  closeRateModal() {
    this.setData({ 
      showRateModal: false,
      rateScore: 5,
      rateContent: '' 
    });
  },

  // 3. 选择分数
  selectScore(e) {
    const score = e.currentTarget.dataset.score;
    this.setData({ rateScore: score });
    // 增加轻微震动反馈
    wx.vibrateShort({ type: 'light' });
  },

  // 4. 输入文字
  inputRateContent(e) {
    this.setData({ rateContent: e.detail.value });
  },

  // 5. 提交评价
  submitRating() {
    const { order, rateScore, rateContent } = this.data;
    
    wx.showLoading({ title: '提交评价中' });

    wx.request({
      url: 'http://localhost:8080/api/repair/rate', 
      method: 'PUT',
      data: {
        id: order.id,         // 工单ID
        score: rateScore,     // 分数
        comment: rateContent, // 评价内容内容
        status: 4             // 评价后将状态更新为 4
      },
      success: (res) => {
        // 假设后端返回 code 200 表示成功
        if (res.statusCode === 200 || res.data.code === 200) {
          wx.showToast({ title: '评价成功', icon: 'success' });
          this.setData({ showRateModal: false });
          
          // 延迟刷新数据，展示最新状态和时间轴
          setTimeout(() => {
            this.fetchDetail(order.id);
          }, 1000);
        }
      },
      fail: () => {
        wx.showToast({ title: '服务器忙，请稍后再试', icon: 'none' });
      },
      complete: () => wx.hideLoading()
    });
  },

  // --- 导航逻辑 ---

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({
        url: '/pages/index/index' 
      });
    }
  }
})