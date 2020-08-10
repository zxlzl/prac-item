'use strict'

const { Service } = require('egg')

const nodemailer = require('nodemailer')
const path = require("path")
const fse = require("fs-extra");
const { promises, WriteStream } = require('fs-extra');
const { resolve } = require('path');

const userEmail = 'MMIRAY@126.com'
const transporter = nodemailer.createTransport({
  service: '126',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'NQWDILYCUWHBUCXG',
  },
})
class ToolService extends Service {
  async mergeFile(filePath,fileHash,size){
    const chunkDir = path.resolve(this.config.UPLOAD_DIR,fileHash)//切片的文件夹
    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a,b)=>a.split('-')[1]-b.split('-')[1])
    chunks = chunks.map(cp=>path.resolve(chunkDir,cp))
    await this.mergeChunks(chunks,filePath,size)
  }
  async mergeChunks(filesPath,dest,size){
    const pipeStream = (filePath,WriteStream)=>new Promise((resolve)=>{
      const readStream = fse.createReadStream(filePath)
      readStream.on('end',()=>{
        console.log(filePath);
        fse.unlinkSync(filePath)
        resolve()
      })
      readStream.pipe(WriteStream)
    })

    await Promise.all(
      filesPath.map((filepath,index)=>{
        pipeStream(filepath,fse.createWriteStream(dest,{
          start:index*size,
          end:(index+1)*size
        }))
      })
    )

  }
  async send(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail,
      to: email,
      subject,
      text,
      html,
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.log('email error:', error)
      return false
    }
  }
}

module.exports = ToolService
