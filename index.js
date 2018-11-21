'use strict';

const {inspect} = require(util);

const async = require(async);
const AWS = require(aws-sdk);
const gm = require(gm);

const MAX_HEIGHT = 200;
const MAX_WIDTH = 200;

const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
  console.log(`thumble::handler event is ${inspect(event, {depth: 5})}`);

  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g,  ));
  const destinationBucket = sourceBucket.replace(source, destination);
  const destinationKey = `resized-${sourceKey}`;

  const match = sourceKey.match(/\.([^.]+)$/);

  if (!match) {
    return callback(`Could not determine image type for ${sourceKey}`);
  }
  
  const imageType = match[1];
  if (imageType != "jpg" && imageType != "png") {
    return callback(`Unsupported image type: ${imageType}`);
  }

  const getObject = new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: sourceBucket,
      Key: sourceKey
    },
      (err, response) => err && reject(err) || resolve(response)
    );
  });

  const getImageSize = (response) => {
    return new Promise((resolve, reject) => {
      const image = response.Body;
      const contentType = response.ContentType;
      gm(image).size((err, size) => err && reject(err) || resolve({image, contentType, size}))
    });
  };

  const scaleImage = ({image, contentType, size}) => {
    const scalingFactor = Math.min(
      MAX_WIDTH / size.width,
      MAX_HEIGHT / size.height
    );
    const width  = scalingFactor * size.width;
    const height = scalingFactor * size.height;

    return new Promise((resolve, reject) => {
      image.resize(width, height).toBuffer(imageType, (err, buffer) => err && reject(err) || resolve({image: response, contentType}))
    });
  };

  const putObject = ({image, contentType}) => {
    return new Promise((resolve, reject) => {
      s3.putObject({
        Bucket: destinationBucket,
        Key: destinationKey,
        Body: image,
        ContentType: contentType
      },
        (err, response) => err && reject(err) || resolve(response)
      );
    });
  };

  getObject
    .then(getImageSize)
    .then(scaleImage)
    .then(putObject)
    .then(() => console.log(`Resized source ${sourceBucket}/${sourceKey} destination ${destinationBucket}/${destinationKey}`))
    .catch(() => console.error(`Error ${err} source ${sourceBucket}/${sourceKey} destination ${destinationBucket}/${destinationKey}`))
    .finally(callback(null, 'OK'));
};