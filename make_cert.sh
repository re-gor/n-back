#!/usr/bin/env bash

# Creates cert with "subjectAltName" which makes it so weird
# Alternatively one can use configartion file instead of singleline command or -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" for openssl >1.1
# Thanks to https://stackoverflow.com/a/59523186/3766683, https://stackoverflow.com/a/27931596/3766683 and https://stackoverflow.com/a/40791249/3766683

openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=re-gor/CN=localhost"\
  -extensions EXT \
  -config <( \
    printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth"\
  )