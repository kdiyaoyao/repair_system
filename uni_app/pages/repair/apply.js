Page({
  data: {
    title: '',
    content: '',
    faultType: '', // OCR 识别出的故障类型
    tempImages: [], // 本地临时图片路径
    houseNumber: '', // 自动获取的门牌号
  },

  onLoad: function() {
    // 适老化：进入页面自动填入该住户的门牌号，减少输入
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.houseNumber) {
      this.setData({ houseNumber: userInfo.houseNumber });
    }
  },

  // 1. 核心功能：拍照并识别 (OCR)
  chooseImageAndOCR: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempImages: [tempFilePath] // 界面展示缩略图
        });

        // 调用 OCR 识别（这里以微信服务市场或云开发通用印刷识别为例）
        this.runOCR(tempFilePath);
      }
    });
  },

  // 模拟/调用 OCR 识别逻辑
  runOCR: function(filePath) {
    wx.showLoading({ title: '智能识别中...' });
    
    // 实际开发中，建议调用微信云开发：wx.cloud.invokeFunction 或后端接口
    // 这里演示识别成功后的逻辑处理
    setTimeout(() => {
      // 假设识别结果是“走廊灯故障”或“水管漏水”
      const mockResult = "楼道电灯"; 
      
      wx.hideLoading();
      wx.showToast({ title: '识别成功', icon: 'success' });
      
      this.setData({
        faultType: mockResult,
        title: mockResult + "报修", // 自动生成标题
        content: "发现" + mockResult + "出现损坏，请尽快维修。" // 自动生成初步描述
      });
    }, 1500);
  },

  // --- 输入绑定 ---
  inputTitle: function(e) {
    this.setData({ title: e.detail.value });
  },

  inputContent: function(e) {
    this.setData({ content: e.detail.value });
  },

  // 2. 提交报修单
  submitForm: function() {
    const { title, content, faultType, tempImages, houseNumber } = this.data;
    const userInfo = wx.getStorageSync('userInfo');

    if (!title || !content) {
      wx.showToast({ title: '请完善报修内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '正在提交...' });

    // 注意：如果有图片，实际流程应先上传图片到服务器/云存储，获取 URL 后再提交表单
    wx.request({
      url: 'http://localhost:8080/api/repair/add',
      method: 'POST',
      data: {
        userId: userInfo.id,
        title: title,
        content: content,
        faultType: faultType,      // 存入 OCR 结果
        address: houseNumber,      // 存入自动填充的地址
        status: 0,
        // imageUrls: "...",       // 实际应传入上传后的图片URL
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200 || res.statusCode === 200) {
          wx.showToast({ title: '报修已提交', icon: 'success' });
          // 增加震动反馈，提示老年人操作成功
          wx.vibrateLong(); 
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      }
    });
  }
});