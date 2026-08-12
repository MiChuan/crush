const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-d1gy55jy67f375cb9'
})

exports.main = async (event, context) => {

  const res = await cloud.cloudPay.unifiedOrder({
    "body": event.body,
    "outTradeNo" : event.outTradeNo, //不能重复，否则报错
    "spbillCreateIp" : "127.0.0.1", //就是这个值，不要改
    "subMchId" : "填写你的微信支付商户号",
    "totalFee" : Math.round(parseFloat(event.totalFee)*100),  //单位为分（round 避免浮点误差导致非整数分）
    "envId": "cloud1-d1gy55jy67f375cb9",
    "functionName": "pay_success",  //支付成功的回调云函数
    "nonceStr":event.nonceStr,  //随便弄的32位字符串，建议自己生成
    "tradeType":"JSAPI"   //默认是JSAPI
  })
  return res
}
