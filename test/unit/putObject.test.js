'use strict';

const sinon = require('sinon');
const chai = require('chai');
const {assert, expect} = chai;

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

chai.use(require('sinon-chai'));

const {putObject} = require('../../src/putObject');

describe('putObject', () => {

  const bucket = 'destinationBucket';
  const key = 'destinationKey';
  const image = 'an image body';
  const contentType = 'contentType';

  const expectedRequest = {
    Bucket: bucket,
    Key: key,
    Body: image,
    ContentType: contentType
  };

  let s3putObjectStub;

  const initStub = (request, error, expected) => {
    s3putObjectStub.withArgs(request, sinon.match.func)
      .callsArgWith(1, error, expected);
  };

  beforeEach(() => {
    s3putObjectStub = sinon.stub(s3, 'putObject');
  });

  afterEach(() => {
    s3putObjectStub.restore();
  });

  it('calls S3 to put the identified object', (done) => {
    initStub(expectedRequest, null, 'response');

    const f = putObject(s3, bucket, key);

    f({image, contentType})
      .then((object) => {
        expect(object).to.equal('response');
        done();
      })
      .catch((err) => {
        assert.fail(err);
      });
  });

  it('rejects on S3 error', (done) => {
    initStub(expectedRequest, 'error');

    const f = putObject(s3, bucket, key);

    f({image, contentType})
      .then((object) => {
        assert.fail(object);
      })
      .catch((err) => {
        expect(err).to.equal('error');
        done();
      });
  });
});
