# N-Back game

Hooray, holidays!

An implementation of the Dual (Triple?) [N-back game](https://en.wikipedia.org/wiki/N-back) with a bunch of features:
- Adjustable game difficulty
- Game statistics recorded in local storage
- Offline mode via service worker, with the ability to go online
- Installable as an app on your system

## Contribution

To local start
```bash
npm install
npm run prepare:cert
```

Then trust the cert in your system/browser:

macOS:
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain cert.pem
```
Or in Chrome:
visit https://localhost → Advanced → Proceed, then go to chrome://flags/#allow-insecure-localhost and enable it.

Then
```bash
sudo npm start
```
