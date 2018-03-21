function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const ses = new AWS.SES();
const dateTime = require('node-datetime');
const dt = dateTime.create();
const formatted = dt.format('H:M:S @ W, d-f-Y');
const getTimezone = require('node-timezone').getTimezone;


module.exports.runScan = (() => {
    var _ref = _asyncToGenerator(function* (context, event, callback) {
        try {
            const results = [];
            console.log('started');
            const bucketList = yield s3.listBuckets().promise();
            yield Promise.all(bucketList.Buckets.map((() => {
                var _ref2 = _asyncToGenerator(function* (bucket) {
                    const bucketName = bucket.Name;
                    const params = { Bucket: bucketName };
                    const acl = yield s3.getBucketAcl(params).promise();
                    yield Promise.all(acl.Grants.map((() => {
                        var _ref3 = _asyncToGenerator(function* (grant) {
                            if (grant.Grantee.URI) {
                                if (grant.Grantee.URI.search('AllUsers') >= 0) {
                                    const msgStr = `Bucket '${bucketName}' provides '${grant.Permission}' public access [ Bucket URL: https://s3.amazonaws.com/${bucketName}/ ]\n`;
                                    results.push(msgStr);
                                }
                            }
                        });

                        return function (_x5) {
                            return _ref3.apply(this, arguments);
                        };
                    })()));
                });

                return function (_x4) {
                    return _ref2.apply(this, arguments);
                };
            })()));
            let email_body = 'S3 Public Buckets Security Scan Results\n';
            email_body += `Scan executed on: ${formatted} (Timezone: ${getTimezone()})\n\n`;
            email_body += 'Findings: \n\n';
            for (let result of results) {
                email_body += result;
            }
            const params = {
                Destination: {
                    ToAddresses: [process.env.DESTINATION_EMAIL]
                },
                Message: {
                    Body: {
                        Text: {
                            Charset: "UTF-8",
                            Data: email_body
                        }
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "S3 Scan Results"
                    }
                },
                ReplyToAddresses: [process.env.DESTINATION_EMAIL],
                Source: process.env.DESTINATION_EMAIL
            };
            const ses_results = yield ses.sendEmail(params).promise();
            callback(null, "success");
        } catch (error) {
            callback(error);
        }
    });

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

