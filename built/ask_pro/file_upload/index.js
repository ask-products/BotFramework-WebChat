"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var ax = axios_1.default.create({ baseURL: '', timeout: 1000, headers: '' });
// const ax = axios.create({ baseURL: '', timeout: 30000, headers: '' });
var getSignedUrl = function (file) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var authResult, info, profile, key, ident;
    return tslib_1.__generator(this, function (_a) {
        authResult = JSON.parse(localStorage.getItem('auth_result'));
        if (authResult) {
            profile = authResult.idTokenPayload;
            key = 'https://api-re-porter.co/_app_metadata';
            info = profile[key];
        }
        else {
            info = { domain: 'acme', identifier: '00000000' };
        }
        ident = info.identifier.slice(1);
        return [2 /*return*/, ax.request({
                url: 'https://j0gzx3un1j.execute-api.eu-west-1.amazonaws.com/dev/gen',
                method: 'GET',
                params: {
                    fileType: file.type,
                    fileName: info.domain + '/' + ident + '/' + file.name
                }
            }).catch(function (err) {
                throw { err: err, file: file.name };
            })
                .then(function (r) {
                return ({
                    status: r.status,
                    data: r.data,
                    fileName: info.domain + '/' + ident + '/' + file.name
                });
            })];
    });
}); };
var putFile = function (response, file) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ax.request({
                url: response.data.url,
                method: 'PUT',
                headers: { 'content-type': file.type },
                data: file
            })
                .catch(function (err) {
                throw { err: err, file: file.name };
            })
                .then(function (r) {
                return ({
                    contentUrl: 'https://s3-eu-west-1.amazonaws.com/re-porter-customer-files/' + response.fileName,
                    contentType: file.type,
                    name: file.name
                });
            })];
    });
}); };
var apUriFromFiles = function (files) {
    var fileNames = [];
    var calls = [];
    var _loop_1 = function (userFile) {
        fileNames.push(userFile.name);
        calls.push(getSignedUrl(userFile)
            .then(function (r) {
            if (r.status === 200) {
                return (putFile(r, userFile));
            }
            else {
                console.log('error', r.status);
            }
        }));
    };
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var userFile = files_1[_i];
        _loop_1(userFile);
    }
    return [calls, fileNames];
};
exports.apUriFromFiles = apUriFromFiles;
//# sourceMappingURL=index.js.map