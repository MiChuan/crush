// pages/home/home.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    userInfo: null,
    showAuthModal: false,
    statusBarHeight: 0
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
    })

    this.userInfoChangeHandler = (userInfo) => {
      this.applyUserInfo(userInfo)
    }
    if (typeof app.onUserInfoChange === 'function') {
      app.onUserInfoChange(this.userInfoChangeHandler)
    }
    if (app.globalData.userInfo) {
      this.applyUserInfo(app.globalData.userInfo)
    }
  },

  onShow() {
    this.loadUserInfo()
  },

  onUnload() {
    if (typeof app.offUserInfoChange === 'function' && this.userInfoChangeHandler) {
      app.offUserInfoChange(this.userInfoChangeHandler)
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const openid = app.globalData.openid
      if (!openid) return

      const res = await db.collection('user').where({
        _openid: openid
      }).get()

      if (res.data && res.data.length > 0) {
        const user = res.data[0]
        if (typeof user.balance === 'undefined') {
          await db.collection('user').doc(user._id).update({
            data: { balance: 0 }
          })
          user.balance = 0
        }
        this.applyUserInfo(user)
        if (typeof app.setUserInfo === 'function') {
          app.setUserInfo(user)
        } else {
          app.globalData.userInfo = user
        }
      }
    } catch (err) {
      console.error('首页加载用户信息失败', err)
    }
  },

  applyUserInfo(userInfo) {
    if (!userInfo) return
    this.setData({
      userInfo: {
        ...(this.data.userInfo || {}),
        ...userInfo,
        balance: typeof userInfo.balance === 'undefined' ? 0 : userInfo.balance
      }
    })
  },

  // 点击会员区
  onMemberTap() {
    if (!this.data.userInfo || !this.data.userInfo.phoneNumber) {
      this.setData({ showAuthModal: true })
    }
  },

  // 授权成功
  onUserInfoSaved(e) {
    const userInfo = e.detail && (e.detail.userInfo || e.detail)
    this.applyUserInfo(userInfo)
    this.loadUserInfo()
  },

  // 跳转到点餐页
  goToOrder() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 跳转到充值页
  goToRecharge() {
    if (!this.data.userInfo || !this.data.userInfo.phoneNumber) {
      this.setData({ showAuthModal: true })
      return
    }
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    })
  },

  // 预定（当前项目无该功能）
  goToReserve() {
    wx.showToast({
      title: '预定功能即将上线',
      icon: 'none'
    })
  }
})
