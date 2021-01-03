import express, { Application, Request, Response } from 'express';
import { resposnseMsg } from './src/interfaces/responseMsg.interface';
import bodyParser from 'body-parser';
import { UniqueShortIdGeneratorService } from './src/services/UniqueShortIdGenerator.service';
import { mongodb, MongoClient } from 'mongodb';
import validUrl from 'valid-url';
import cors from 'cors';

const app: Application = express();
const url: string = 'mongodb+srv://harsh:harsh123@cluster0.vjrm0.mongodb.net/<dbname>?retryWrites=true&w=majority';
const dbName: string = 'short_url';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://nervous-lalande-79b935.netlify.app'
}))

app.post('/shorten-url', async (req: Request, res: Response) => {
    console.log(req.body);
    let connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    try {
        if (validUrl.isUri(req.body.url)) {
            let url: string = req.body.url;
            let db = connection.db(dbName);
            let urlData = await db.collection('url').findOne({ url: url });
            if (urlData) {
                res.json({
                    message: 'Shortern Url Already Exists',
                    data: urlData
                });
            } else {
                let urlShortener: UniqueShortIdGeneratorService = new UniqueShortIdGeneratorService();
                let shortUrl: string = urlShortener.generateUniqueId();
                let urlData = {
                    url,
                    shortUrl,
                    clicks: 0
                }
                await db.collection('url').insertOne(urlData);
                res.json({
                    message: "Short url generated Successfully",
                    data: urlData,
                });
            }
        } else {
            res.status(400).json({
                message: 'Please enter a valid Url'
            })
        }

    } catch (err) {
        res.status(401).json({
            message: 'Some Error Occured',
            data: err
        })
    } finally {
        connection.close();
    }
})


app.get('/redirect-url/:shortUrl', async (req: Request, res: Response) => {
    let connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    try {
        let db = connection.db(dbName);
        let urlData = await db.collection('url').findOne({ shortUrl: req.params.shortUrl });
        if (urlData) {
            await db.collection('url').updateOne({ _id: urlData._id }, { $set: { clicks: ++urlData.clicks } });
            res.json({
                message: "SuccessFully fetched Redirect Data",
                data: urlData,
            });
        } else {
            res.status(400).json({
                message: 'Invalid short url'
            })
        }
    } catch (err) {
        res.status(401).json({
            message: 'Some Error Occured',
            data: err
        })
    } finally {
        connection.close();
    }
})

app.get('/url-data', async (req: Request, res: Response) => {
    let connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    try {
        let db = connection.db(dbName);
        let urlData = await db.collection('url').find().toArray();
        res.json({
            message: 'Url details fetched successfully',
            data: urlData
        })
    } catch (err) {
        res.status(401).json({
            message: 'Some Error Occured',
            data: err
        })
    } finally {
        connection.close();
    }
})

app.listen(process.env.PORT || 3000);
