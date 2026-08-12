// pages/admin/photoManage/photoManage.js
const db = wx.cloud.database()

Page({
  data: {
    photos: []
  },

  onShow() {
    this.loadPhotos()
  },

  // 加载照片列表（按上传时间倒序）
  async loadPhotos() {
    try {
      const res = await db.collection('photoWall')
        .orderBy('createTime', 'desc')
        .limit(100)
        .get()
      this.setData({
        photos: res.data || []
      })
    } catch (err) {
      console.error('加载照片列表失败', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 选择并上传照片
  async choosePhotos() {
    try {
      const res = await wx.chooseMedia({
        count: 9,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const tempFiles = res.tempFiles || []
      if (tempFiles.length === 0) return

      wx.showLoading({
        title: `上传 0/${tempFiles.length}`,
        mask: true
      })

      for (let index = 0; index < tempFiles.length; index++) {
        wx.showLoading({
          title: `上传 ${index + 1}/${tempFiles.length}`,
          mask: true
        })
        const extMatch = tempFiles[index].tempFilePath.match(/\.(\w+)$/)
        const ext = extMatch ? extMatch[1] : 'jpg'
        const cloudPath = `photoWall/${Date.now()}_${index}_${Math.random().toString(36).slice(2, 10)}.${ext}`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFiles[index].tempFilePath
        })
        await db.collection('photoWall').add({
          data: {
            fileID: uploadRes.fileID,
            createTime: new Date()
          }
        })
      }

      wx.hideLoading()
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
      this.loadPhotos()
    } catch (err) {
      wx.hideLoading()
      console.error('上传照片失败', err)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
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
  },

  // 删除照片（同时删除数据库记录与云存储文件）
  deletePhoto(e) {
    const item = e.currentTarget.dataset.item

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          wx.showLoading({
            title: '删除中...',
            mask: true
          })
          await db.collection('photoWall').doc(item._id).remove()
          if (item.fileID) {
            await wx.cloud.deleteFile({
              fileList: [item.fileID]
            })
          }
          wx.hideLoading()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          this.loadPhotos()
        } catch (err) {
          wx.hideLoading()
          console.error('删除照片失败', err)
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    })
  }
})
