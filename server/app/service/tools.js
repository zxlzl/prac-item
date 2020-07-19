'use strict'

const {Service} = require('egg')

const nodemailer = require('nodemailer')

const userEmail = 'MMIRAY@126.com'
let transporter = nodemailer.createTransport({
  service: "126",
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'NQWDILYCUWHBUCXG'
  }
})
class ToolService extends Service {
  async send(email,subject,text,html){
    const mailOptions = {
      from: userEmail,
      cc:userEmail,
      to: email,
      subject,
      text,
      html
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.log('email error:',error)
      return false
    }
  }
}

module.exports = ToolService