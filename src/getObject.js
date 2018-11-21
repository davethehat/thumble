'use strict';

const {promisify} = require('util');

module.exports = {getObject};

function getObject(s3, sourceBucket, sourceKey) {
  const getObjectPromise = promisify(s3.getObject);
  return getObjectPromise({Bucket: sourceBucket, Key: sourceKey});
}