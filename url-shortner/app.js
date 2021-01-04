"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var UniqueShortIdGenerator_service_1 = require("./src/services/UniqueShortIdGenerator.service");
var mongodb_1 = require("mongodb");
var valid_url_1 = __importDefault(require("valid-url"));
var cors_1 = __importDefault(require("cors"));
var dns_1 = __importDefault(require("dns"));
// mongo db config
var app = express_1.default();
var url = 'mongodb+srv://harsh:harsh123@cluster0.vjrm0.mongodb.net/<dbname>?retryWrites=true&w=majority';
var dbName = 'short_url';
//middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(cors_1.default({
    origin: 'https://nervous-lalande-79b935.netlify.app/'
}));
//validate the url, after validation shortern the url and send it to the user and save in the db
app.post('/shorten-url', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, url_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(req.body);
                return [4 /*yield*/, mongodb_1.MongoClient.connect(url, { useUnifiedTopology: true })];
            case 1:
                connection = _a.sent();
                try {
                    // check if it is in valid url format
                    if (valid_url_1.default.isUri(req.body.url)) {
                        url_1 = new URL(req.body.url);
                        //check if domain name exists
                        dns_1.default.lookup(url_1.hostname, { all: true }, function (error, results) { return __awaiter(void 0, void 0, void 0, function () {
                            var url_2, db, urlData, urlShortener, shortUrl, urlData_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!error) return [3 /*break*/, 1];
                                        res.status(400).json({
                                            message: 'Domain Does not exists',
                                        });
                                        return [3 /*break*/, 7];
                                    case 1:
                                        url_2 = req.body.url;
                                        db = connection.db(dbName);
                                        return [4 /*yield*/, db.collection('url').findOne({ url: url_2 })];
                                    case 2:
                                        urlData = _a.sent();
                                        if (!urlData) return [3 /*break*/, 3];
                                        res.json({
                                            message: 'Shortern Url Already Exists',
                                            data: urlData
                                        });
                                        return [3 /*break*/, 5];
                                    case 3:
                                        urlShortener = new UniqueShortIdGenerator_service_1.UniqueShortIdGeneratorService();
                                        shortUrl = urlShortener.generateUniqueId();
                                        urlData_1 = {
                                            url: url_2,
                                            shortUrl: shortUrl,
                                            clicks: 0
                                        };
                                        return [4 /*yield*/, db.collection('url').insertOne(urlData_1)];
                                    case 4:
                                        _a.sent();
                                        res.json({
                                            message: "Short url generated Successfully",
                                            data: urlData_1,
                                        });
                                        _a.label = 5;
                                    case 5: return [4 /*yield*/, connection.close()];
                                    case 6:
                                        _a.sent();
                                        _a.label = 7;
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    else {
                        res.status(400).json({
                            message: 'Please enter a valid Url'
                        });
                    }
                }
                catch (err) {
                    console.log(err);
                    res.status(401).json({
                        message: 'Some Error Occured',
                        data: err
                    });
                }
                return [2 /*return*/];
        }
    });
}); });
// redirect url if the short url has valid url mapping
app.get('/redirect-url/:shortUrl', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, db, urlData, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongodb_1.MongoClient.connect(url, { useUnifiedTopology: true })];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, 8, 9]);
                db = connection.db(dbName);
                return [4 /*yield*/, db.collection('url').findOne({ shortUrl: req.params.shortUrl })];
            case 3:
                urlData = _a.sent();
                if (!urlData) return [3 /*break*/, 5];
                //update click count in db 
                return [4 /*yield*/, db.collection('url').updateOne({ _id: urlData._id }, { $set: { clicks: ++urlData.clicks } })];
            case 4:
                //update click count in db 
                _a.sent();
                res.json({
                    message: "SuccessFully fetched Redirect Data",
                    data: urlData,
                });
                return [3 /*break*/, 6];
            case 5:
                res.status(400).json({
                    message: 'Invalid short url'
                });
                _a.label = 6;
            case 6: return [3 /*break*/, 9];
            case 7:
                err_1 = _a.sent();
                res.status(401).json({
                    message: 'Some Error Occured',
                    data: err_1
                });
                return [3 /*break*/, 9];
            case 8:
                connection.close();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); });
// get all url details for the user
app.get('/url-data', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, db, urlData, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongodb_1.MongoClient.connect(url, { useUnifiedTopology: true })];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                db = connection.db(dbName);
                return [4 /*yield*/, db.collection('url').find().toArray()];
            case 3:
                urlData = _a.sent();
                res.json({
                    message: 'Url details fetched successfully',
                    data: urlData
                });
                return [3 /*break*/, 6];
            case 4:
                err_2 = _a.sent();
                res.status(401).json({
                    message: 'Some Error Occured',
                    data: err_2
                });
                return [3 /*break*/, 6];
            case 5:
                connection.close();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//listen on port
app.listen(process.env.PORT || 3000);
