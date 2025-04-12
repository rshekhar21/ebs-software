const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand  }=require('@aws-sdk/client-s3');
const log=console.log;
require('dotenv').config();
const env = require('../../env.json');

// Set your AWS credentials
const credentials = {
  accessKeyId: env.AWS_ACCESSKEY || process.env.AWS_ACCESSKEY,
  secretAccessKey: env.AWS_SECRETKEY || process.env.AWS_SECRETKEY,
};

// Set the AWS region
const region='ap-south-1';

// Specify the bucket name
const bucketName='bucket-ebs';

// Create an S3 client
const s3Client=new S3Client({ region, credentials });

async function uploadFile(folder, fileName, data) {
  try {
    const jsonString=JSON.stringify(data);
    const key=`${folder}/orders/${fileName}.json`; //log(key);
    const putObjectParams = {
      Bucket: bucketName,
      Key: key,
      Body: jsonString,
      ContentType: 'application/json', // Set content type if needed
    };
    const res = await s3Client.send(new PutObjectCommand(putObjectParams));
    // console.log(`JSON data uploaded to ${key} successfully:`, res);
    return res;
  } catch (error) {
    // console.error('Error uploading JSON data:', error);
    throw error; // Propagate the error to the calling code
  }
}

async function downloadFile(folder, fileName) {
  try {
    // Combine folder and file name to create the key
    const key=`${folder}/orders/${fileName}.json`; //log(key);
    // return 'ok';
    // Retrieve the content of the JSON file from S3
    const getObjectParams = {
      Bucket: bucketName,
      Key: key,
      ContentType: 'application/json',
    };

    const response = await s3Client.send(new GetObjectCommand(getObjectParams)); //log(response.Body);
    // const jsonString=data.Body.toString('utf-8'); log(jsonString);
    const str=await response.Body.transformToString(); //log(str);
    const jsonData = JSON.parse(str);  //log(jsonData);
    return jsonData;
  } catch (error) {
    // console.error('Error reading JSON data:', error);
    throw error; // Propagate the error to the calling code
  }
}

module.exports={
  uploadFile, downloadFile,
}
