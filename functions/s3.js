const AWS = require('aws-sdk');
const bucket = process.env.ASW_BUCKET || ''
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY || '',
  secretAccessKey: process.env.AWS_ACCESS_SECRET || ''
});

async function uploadFile(fileName) {
    const data = fs.readFileSync(fileName);
    const params = {
        Bucket: bucket,
        Key: fileName,
        Body: JSON.stringify(data, null, 2)
    };
    const obj = await s3.upload(params).promise();
    return obj
}

async function getFile(fileName) {
    
    const params = {
        Bucket: bucket,
        Key: fileName,
        Body: JSON.stringify(data, null, 2)
    };
    const obj = s3.getObject(params).promise();
}

module.exports = {
    uploadFile,
    getFile
}
