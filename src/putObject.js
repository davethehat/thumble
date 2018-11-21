'use strict';

const {promisify} = require('util');

module.exports = {putObject};

function putObject(s3, destinationBucket, destinationKey, image, contentType) {
  const putObjectPromise = promisify(s3.putObject);
  const request = {
    Bucket: destinationBucket,
    Key: destinationKey,
    Body: image,
    ContentType: contentType
  };
  return putObjectPromise(request);
} 