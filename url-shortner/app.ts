import express, { Application, Request, Response } from 'express';
import { resposnseMsg } from './src/interfaces/responseMsg.interface';
import bodyParser from 'body-parser';
import { UniqueShortIdGeneratorService } from './src/services/UniqueShortIdGenerator.service';
import { mongodb, MongoClient } from 'mongodb';
import validUrl from 'valid-url';
import cors from 'cors';
import { lookup } from 'dns-lookup-cache';
import dns from 'dns';

// mongo db config
const app: Application = express();
const url: string = 'mongodb+srv://harsh:harsh123@cluster0.vjrm0.mongodb.net/<dbname>?retryWrites=true&w=majority';
const dbName: string = 'short_url';


//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}))

//validate the url, after validation shortern the url and send it to the user and save in the db
app.post('/shorten-url', async (req: Request, res: Response) => {
    console.log(req.body);

    //create connection for client
    let connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    try {
        // check if it is in valid url format
        if (validUrl.isUri(req.body.url)) {
            let url = new URL(req.body.url);

            //check if domain name exists
            dns.lookup(url.hostname, { all: true }, async (error, results) => {
                if (error) {
                    res.status(400).json({
                        message: 'Domain Does not exists',
                    });
                } else {
                    //shorten and insert the url in db
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
                        };
                        await db.collection('url').insertOne(urlData);
                        res.json({
                            message: "Short url generated Successfully",
                            data: urlData,
                        });
                    }
                    await connection.close();
                }
            });

        } else {
            res.status(400).json({
                message: 'Please enter a valid Url'
            })
        }

    } catch (err) {
        console.log(err);
        res.status(401).json({
            message: 'Some Error Occured',
            data: err
        })
    }
})

// redirect url if the short url has valid url mapping
app.get('/redirect-url/:shortUrl', async (req: Request, res: Response) => {

    //create connection for client
    let connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    try {

        //check url exists
        let db = connection.db(dbName);
        let urlData = await db.collection('url').findOne({ shortUrl: req.params.shortUrl });
        if (urlData) {

            //update click count in db 
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

// get all url details for the user
app.get('/url-data', async (req: Request, res: Response) => {

    //create connection
    let connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    try {

        // fetch all the url details
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

//listen on port
app.listen(process.env.PORT || 3000);
