import requests
import json
import argparse

# Disable self-signed certificate warnings
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

def login(phone):
    try:
        response = requests.get("http://localhost:3000/login", params={'phone': phone})
        data = json.loads(response.content)
        return data['scopes']['dpv:FraudPreventionAndDetection#number-verification-verify-read']['auth_url']
    except Exception as exception:
        print(f'Error: {exception}')

def auth(url):
    try:
        response = requests.get(url, verify=False)
        data = json.loads(response.content)
        return data['devicePhoneNumberVerified']
    except Exception as exception:
        print(f'Error: {exception}')


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Numbe Enablement client example",
                                 formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    parser.add_argument("phone", help="Phone Number to verify")
    args = vars(parser.parse_args())

    url = login(args['phone'])
    if auth(url):
        print('Client successfully authenticated!')
    else:
        print('Unable to verify client credentials')


