const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand  }=require('@aws-sdk/client-s3');
const log=console.log;
require('dotenv').config();
const { getPrivateConfigPath, readPrivateConfig } = require('./private-config');

const region='ap-south-1';
const bucketName='bucket-ebs';

let s3Client;

function getS3Client() {
  if (s3Client) return s3Client;

  const { aws } = readPrivateConfig();
  const accessKeyId = aws?.accessKeyId || process.env.AWS_ACCESSKEY;
  const secretAccessKey = aws?.secretAccessKey || process.env.AWS_SECRETKEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(`AWS credentials are missing in ${getPrivateConfigPath()}`);
  }

  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey }
  });
  return s3Client;
}

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
    const res = await getS3Client().send(new PutObjectCommand(putObjectParams));
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

    const response = await getS3Client().send(new GetObjectCommand(getObjectParams)); //log(response.Body);
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
