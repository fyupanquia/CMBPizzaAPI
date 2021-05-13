# CMBPizza

## Features

- Users CRUD
- Token CRUD
- Menu
- Shopping car
- Pay with many cards
- Email confirmation


## Installation

CMBPizza requires [Node.js](https://nodejs.org/) v10+ to run.

No dependencies, just run the app
```sh
cd CMBPizzaAPI
node index.js
```

For app environments
https://stripe.com/docs/api
```sh
STRIPE_KEY=
```
https://app.mailgun.com/app/sending/domains/[DOMAIN]
```sh
MAILGUN_DOMAIN=
MAILGUN_KEY=
```

## Services
#### 1) Create  new user
| Method | Endpoint |
| ------ | ------ |
| POST | /users |
#### 1.1) Body request example
```json
{
    "fullname":"Frank Yupanqui",
    "email":"yupanqui@cmb.com",
    "address":"Av. San cristobal",
    "password":":)(:",
    "tosAgreement":true
}
```
#### 1.2) Body response (201 OK)
```json
{}
```
#### 2) Retrieve an user
| Method | Endpoint |
| ------ | ------ |
| GET | /users |
#### 2.1) Query params example
```json
?email=yupanqui@cmb.com
```
#### 2.2) Body response example (200 OK)
```json
{
    "fullname":"Frank Yupanqui",
    "email":"yupanqui@cmb.com",
    "address":"Av. San cristobal",
    "tosAgreement":true
}
```
#### 2.3) Headers
```json
{
    token: [INSERT A TOKEN ID]
}
```
#### 3) Edit an user
| Method | Endpoint |
| ------ | ------ |
| PUT | /users |
#### 3.1) Body request example
```json
{
    "email":"yupanqui@cmb.com",
    "address":"Jr. Mateo Pumacauha"
}
```
#### 3.2) Body response (200 OK)
```json
{}
```
#### 3.3) Headers
```json
{
    token: [INSERT A TOKEN ID]
}
```
#### 4) Delete an user
| Method | Endpoint |
| ------ | ------ |
| DELETE | /users |
#### 4.1) Body request example
```json
{
    "email":"yupanqui@cmb.com",
}
```
#### 4.2) Body response (200 OK)
```json
{}
```
#### 4.3) Headers
```json
{
    token: [INSERT A TOKEN ID]
}
```
#### 5) Create a token
| Method | Endpoint |
| ------ | ------ |
| POST | /tokens |
#### 5.1) Body request example
```json
{
    "email":"yupanqui@cmb.com",
    "password":":)(:"
}
```
#### 5.2) Body response (201 OK)
```json
{
    "email": "yupanqui@cmb.com",
    "id": "f060jnj1rbm9e5wksaoo",
    "expires": 1620946230610
}
```
#### 6) Retrieve a token
| Method | Endpoint |
| ------ | ------ |
| GET | /tokens |
#### 6.1) Query string example
```json
?id=opsggi3pc4x04ajonvpg
```
#### 6.2) Body response example (200 OK)
```json
{
    "email": "yupanqui@cmb.com",
    "id": "f060jnj1rbm9e5wksaoo",
    "expires": 1620946230610
}
```
#### 7) Extend a token
| Method | Endpoint |
| ------ | ------ |
| PUT | /tokens |
#### 7.1) Body request example
```json
{
    "id":"f060jnj1rbm9e5wksaoo",
    "extend":true
}
```
#### 7.2) Body response (200 OK)
```json
{}
```
#### 8) Delete a token
| Method | Endpoint |
| ------ | ------ |
| DELETE | /tokens |
#### 8.1) Query string example
```json
?id=f060jnj1rbm9e5wksaoo
```
#### 8.2) Body response (200 OK)
```json
{}
```
#### 9) Retrieve the menu
| Method | Endpoint |
| ------ | ------ |
| GET | /menu |
#### 9.1) Query string example
```json
?email=yupanqui@cmb.com
```
#### 9.2) Body response (200 OK)
```json
[
    {
        "id": "Xvhw4tLU9vzA6GKt",
        "name": "Classic XL",
        "description": "Pizza to share with your 4 favorite flavors American, Pepperoni, Hawaiian and Supreme.",
        "currency": "usd",
        "price": 13,
        "url": "https://static.phdvasia.com/pe/img/singles/xl-clasica-desktop-thumbnail.jpg"
    },
    ...
]
```
#### 9.3) Headers
```json
{
    token: [INSERT A TOKEN ID]
}
```
#### 10) Add to the sopping car
| Method | Endpoint |
| ------ | ------ |
| PATCH | /shoppingCar |
#### 10.1) Body request example
```json
{
    "id": [INSERT MENU ITEM ID],
    "quantity":5,
    "email":"yupanqui@cmb.com"
}
```
#### 10.2) Body response (200 OK)
```json
{}
```
#### 10.3) Headers
```json
{
    token: [INSERT A TOKEN ID]
}
```
#### 11) Confirm your order
| Method | Endpoint |
| ------ | ------ |
| POST | /shoppingCar |
#### 11.1) Body request example
```json
{
    "cardId":"36227206271667",
    "email":"yupanqui@cmb.com"
}
```
#### 11.2) Body response (200 OK)
```json
{}
```
#### 11.3) Headers
```json
{
    token: [INSERT A TOKEN ID]
}
```
#### 11.4) Some card ids
| card | Payment method |
| ------ | ------ |
|4242424242424242|pm_card_visa|
|4000056655665556|pm_card_visa_debit|
|5555555555554444|pm_card_mastercard|
|2223003122003222|pm_card_mastercard|
|5200828282828210|pm_card_mastercard_debit|
|5105105105105100|pm_card_mastercard_prepaid|
|378282246310005|pm_card_amex|
|371449635398431|pm_card_amex|
|6011111111111117|pm_card_discover|
|6011000990139424|pm_card_discover|
|3056930009020004|pm_card_diners|
|36227206271667|pm_card_diners|
|3566002020360505|pm_card_jcb|
|6200000000000005|pm_card_unionpay|

## Import the routes
```sh
cd CMBPizzaAPI/postman/CMBPIZZA.postman_collection.json
```

## Deployed
https://cmbpizza-api.vercel.app

## License
MIT
**Free Software, Hell Yeah!**