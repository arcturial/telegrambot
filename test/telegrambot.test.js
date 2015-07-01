var assert = require("assert");
var nock = require('nock');
var TelegramBot = require("./../lib/telegrambot.js");

describe('Telegram', function() {

    describe('#unwrap()', function() {

        it('should return an error if the request fails', function(done) {

            var callbackError = function (err) {
                assert.ok(err);
                done();
            };

            var func = TelegramBot.unwrap(callbackError);
            func(new Error());
        });

        it('should return an error if the request fails', function(done) {

            var error = 'bomb!';

            var callbackError = function (err) {
                assert.ok(err);
                assert.equal(err.message, error);
                done();
            };

            var func = TelegramBot.unwrap(callbackError);
            func(new Error(error), null, null);
        });

        it('should return an error if the request returns a bad HTTP status', function(done) {

            var callbackError = function (err) {
                assert.ok(err);
                assert.equal(err.code, 500);
                done();
            };

            var func = TelegramBot.unwrap(callbackError);
            func(null, { statusCode: 500 }, null);
        });

        it('should return an error if Telegram fails', function(done) {

            var error = { ok: false, error_code: 100, description: "fail" };
            var callbackError = function (err) {
                assert.ok(err);
                assert.equal(err.message, error.description);
                assert.equal(err.code, error.error_code);
                done();
            };

            var func = TelegramBot.unwrap(callbackError);
            func(null, { statusCode: 200 }, error);
        });

        it('should return the unwrapped body if successful', function(done) {

            var success = { ok: true, result: { boom: true } };
            var callback = function (err, result) {
                assert.ok(!err);
                assert.ok(result);
                assert.deepEqual({ boom: true }, result);
                done();
            };

            var func = TelegramBot.unwrap(callback);
            func(null, { statusCode: 200 }, success);
        });
    });

    describe('#request', function(done) {

        it('should invoke the correct endpoint request', function(done) {

            var result = { ok: true, result: true };
            var telegramRequest = nock(TelegramBot.ENDPOINT).post('/bot' + 1234 + '/method').reply(200, result);

            TelegramBot.request(1234, 'method', {}, function (err, body) {
                assert.deepEqual(result.result, body);
                done();
            });
        });
    });

    describe('#invoke', function(done) {

        it('should call request with the correct parameters', function(done) {

            var callback = function () {};
            var bot = new TelegramBot(1234);

            TelegramBot.request = function (id, method, opts, cb) {
                assert.equal(1234, id);
                assert.equal('testMethod', method);
                assert.deepEqual({ opt: true }, opts);
                assert.equal(callback, cb);
                done();
            };

            bot.invoke('testMethod', { opt: true }, callback);
        });
    });
});