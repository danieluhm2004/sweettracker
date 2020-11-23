# SweetTracker SDK

## 📦 - Unofficial sweettracker SDK for Node.js

SweetTracker SDK for Asynchronous Node.js.
You can easily search for delivery information.

**Table of Contents**

- [How does it work?](#how-does-it-work)
- [Install](#install)
- [Usage](#usage)
  - [Create SweetTracker Client](#create-sweettracker-client)
  - [Get Companies](#get-companies)
  - [Get Recommended Companies](#get-recommended-companies)
  - [Get Tracking Information](#get-tracking-information)
- [License](#license)

## How does it work?

---

Use Sweet Tracker API to track shipment status.
if you do not have an API KEY, [click here](https://tracking.sweettracker.co.kr/) to register as a member.

## Install

---

Use NPM

```sh
$ npm install sweettracker
```

Or Yarn

```sh
$ yarn add sweettracker
```

## Usage

---

### Create SweetTracker Client

```js
import SweetTracker from 'sweettracker';

const tracker = new SweetTracker('{ WRITE YOUR SWEET TRACKER API KEY }');
```

### Get Companies

```js
import SweetTracker from 'sweettracker';

const tracker = new SweetTracker('{ WRITE YOUR SWEET TRACKER API KEY }');
const companies = await tracker.getCompanies().then(console.log);
```

If no error occurs, the following response will come.

```json
[
  { "id": "04", "name": "CJ대한통운" },
  { "id": "05", "name": "한진택배" },
  { "id": "08", "name": "롯데택배" },
  ...
]
```

### Get Recommended Companies

```js
import SweetTracker from 'sweettracker';

const tracker = new SweetTracker('{ WRITE YOUR SWEET TRACKER API KEY }');
const companies = await tracker
  .getRecommendedCompanies('{ WRITE YOUR TRACKING NUMBER }')
  .then(console.log);
```

If no error occurs, the following response will come.

```json
[
  { "id": "04", "name": "CJ대한통운" },
  { "id": "05", "name": "한진택배" },
  { "id": "08", "name": "롯데택배" },
  ...
]
```

### Get Tracking Information

```js
import SweetTracker from 'sweettracker';

const tracker = new SweetTracker('{ WRITE YOUR SWEET TRACKER API KEY }');
const companies = await tracker
  .getTracking('{ WRITE COMPANY ID }', '{ WRITE YOUR TRACKING NUMBER }')
  .then(console.log);
```

If no error occurs, the following response will come.

```json
{
  "status": "arrived",
  "receiver": {},
  "item": {},
  "details": [
    {
      "timestamp": "2020-11-13T03:25:00.000Z",
      "kind": "Shipping Label Created, USPS Awaiting Item",
      "where": "FORT LAUDERDALE, FL 33351",
      "status": "collected",
      "phoneNumber": [],
      "courier": {}
    }
    ...
  ]
}
```

## License

[MIT](LICENSE)

Copyright (c) 2020 [Daniel Uhm](htts://github.com/danieluhm2004).
