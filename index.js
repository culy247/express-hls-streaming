const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')

const { generateThumbnail } = require('./lib/common');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const root = '/tmp';

exports.handler = async (event) => {
    try {
        
        const srcBucket = event.Records[0].s3.bucket.name;
        const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        
        const data = await s3.getObject({
            Bucket: srcBucket,
            Key: srcKey
        }).promise()
        
        const baseSrcName = path.basename(`${srcKey}`);
        const baseSrcPath = path.dirname(`${srcKey}`);
        const srcPath = `${root}/${baseSrcName}`
        const destPath = `${root}`
        
        
        fs.writeFileSync(srcPath, data.Body)
    
        const {error, metadata } = await generateThumbnail(`${srcPath}`, {
            outputDirectory: `${destPath}`,
            outputFileName: 'sprite',
            secondsPerThumbnail: true,
            thumbnailSize: {
                width: 200,
                height: 150
            },
            spriteImages: true,
            spritesImagePath: '',
        });
        
        if( error ) {
            console.log('GENERATE SPRITE ERROR', error);
            throw error;
        }
        
        await s3.upload({
            ACL :'public-read',
            Body : fs.readFileSync(`${destPath}/sprite.png`),
            Bucket: srcBucket,
            Key: `${baseSrcPath}/sprite.png`
        }).promise();
        
        await s3.upload({
            ACL :'public-read',
            Body : fs.readFileSync(`${destPath}/sprite.vtt`),
            Bucket: srcBucket,
            Key: `${baseSrcPath}/sprite.vtt`
            }).promise()
            
    } catch (err) {
        console.log('ERR', err)
        throw err;
    }

    return event;

};
