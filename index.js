const express = require('express');
const { google } = require('googleapis');
const privatekey = require('./privatekey.json');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const Cosmic = require('cosmicjs');
const api = Cosmic();
const PORT = process.env.PORT || 3001;

// Provide the required configuration
const calendarId = 'assmu.dev@gmail.com';

// Google calendar API settings
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({ version: 'v3' });

const auth = new google.auth.JWT(
	privatekey.client_email,
	null,
	privatekey.private_key,
	SCOPES
);

// Get all the events from calendar
const getEvents = async () => {
	try {
		let response = await calendar.events.list({
			auth: auth,
			calendarId: calendarId,
		});

		let items = response['data']['items'];
		return items;
	} catch (error) {
		console.log(`Error at getEvents --> ${error}`);
		return 0;
	}
};

let calendarevents = getEvents() // returns a promise
	.then((res) => {
		console.log(res); // shows array of objects
	})
	.catch((err) => {
		console.log(err);
	});

const bucket = api.bucket({
	slug: 'assmu-website-production',
	read_key: 'awDUr9JMT4yD9udUl9JSi4FXKLjCzTjDOiXnP4KjfFrtplgabn',
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
	const data = await bucket.getObjects({
		query: {
			type: 'posts',
		},
		props: 'slug,title,content,metadata',
	});
	const posts = data.objects;
	res.set('Content-Type', 'text/html');
	res.send(posts);
});

app.listen(PORT, () => {
	console.log('running on port 3001');
});
