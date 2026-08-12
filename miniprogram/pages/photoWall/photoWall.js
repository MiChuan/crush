// pages/photoWall/photoWall.js
const db = wx.cloud.database()

Page({
  data: {
    photos: []
  },

  onShow() {
    this.loadPhotos()
  },

  // 加载照片墙数据（按上传时间倒序）
  async loadPhotos() {
    try {
      const res = await db.collection('photoWall')
        .orderBy('createTime', 'desc')
        .limit(50)
        .get()
      this.setData({
        photos: res.data || []
      })
    } catch (err) {
      console.error('加载照片墙失败', err)
    }
  },

  // 点击预览图片
  previewPhoto(e) {
    const index = Number(e.currentTarget.dataset.index)
    const urls = this.data.photos.map((item) => item.fileID)
    if (index < 0 || index >= urls.length) return
    wx.previewImage({
      current: urls[index],
      urls
    })
  }
})
