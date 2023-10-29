const fs = require('fs') // 操作文件
const path = require('path')
const express = require('express')
// const router = express.Router()
const multer = require('multer') // 接收图片
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

// 开启跨域支持
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//获取本机ip地址
function getIPAdress() {
    let interfaces = require('os').networkInterfaces();
    for (let devName in interfaces) {
        let iFace = interfaces[devName];
        for (let i = 0; i < iFace.length; i++) {
            let alias = iFace[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

const port = 2233
const affixName = `http://${getIPAdress()}:${port}`

// 用于上传文件表单
app.get('/', (req, res) => {
    res.send(
        `<!DOCTYPE html>
      <html>
      <body>
        <form action="file/upload" method="post" enctype="multipart/form-data">
          <h1>选择上传的文件</h1>  
          <input type="file" name="file">
          <input type="submit" value="上传">
        </form>
      </body>
      </html>`
    )
})

app.get('/test', (req, res) => {
    res.send('test api ok!')
})

// 定义图片上传的临时目录
const storage = multer.diskStorage({
    destination (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads')
        const isExists = fs.existsSync(uploadPath) // 判断目录是否存在
        if (!isExists) { fs.mkdirSync(uploadPath) } // 不存在的话，创建目录
        cb(null, path.join(__dirname, 'uploads'))
    },
    filename (req, file, cb) {
        cb(null, Date.now() + '.' + file.originalname.split('.').slice(-1))
    }
})

const upload = multer({ storage })
app.post('/file/upload', upload.single('file'), function (req, res) {
    // req.connection.setTimeout(100000) // 100 seconds
    res.json({ url: `${affixName}/uploads/${req.file.filename}`})
})

app.listen(port, function () {
    console.log(`服务启动成功：http://localhost:${port}`);
});
