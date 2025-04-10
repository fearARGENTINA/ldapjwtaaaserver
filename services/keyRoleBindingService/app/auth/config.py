import os
from datetime import timedelta
import string

DEBUG = False
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME")
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
LDAP_HOST = os.getenv('LDAP_HOST')
LDAP_PORT = int(os.getenv('LDAP_PORT'))
LDAP_USE_SSL = str(os.getenv('LDAP_USE_SSL', 'False')).lower() == 'true'
LDAP_BASE_DN = os.getenv('LDAP_BASE_DN')
LDAP_USER_DN = os.getenv('LDAP_USER_DN')
LDAP_GROUP_DN = os.getenv('LDAP_GROUP_DN')
LDAP_USER_RDN_ATTR = os.getenv('LDAP_USER_RDN_ATTR')
LDAP_USER_LOGIN_ATTR = os.getenv('LDAP_USER_LOGIN_ATTR')
LDAP_USER_SEARCH_SCOPE = os.getenv('LDAP_USER_SEARCH_SCOPE')
LDAP_BIND_USER_DN = os.getenv('LDAP_BIND_USER_DN')
LDAP_BIND_USER_PASSWORD = os.getenv('LDAP_BIND_USER_PASSWORD')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES')))
JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES')))
JWT_OTP_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_OTP_TOKEN_EXPIRES')))
JWT_TOKEN_LOCATION = ["headers"]
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = int(os.getenv('REDIS_PORT'))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
LDAP_ROLE = os.getenv('LDAP_ROLE')
SECRET_KEY_LENGTH_BYTES = int(os.getenv('SECRET_KEY_LENGTH_BYTES'))
CHARSET_SECRETS = string.ascii_letters + string.digits + string.punctuation
USER_BLOCK_TIMEDELTA_MINUTES = int(os.getenv('USER_BLOCK_TIMEDELTA_MINUTES', 1))
SEED_TOTP = os.getenv('SEED_TOTP', '1234567890')
# Encryption
PRIVATE_RSA_KEY = os.getenv('PRIVATE_RSA_KEY')
PUBLIC_RSA_KEY = os.getenv('PUBLIC_RSA_KEY')
PRIVATE_RSA_PASSPHRASE = os.getenv('PRIVATE_RSA_PASSPHRASE')
AES_KEY_B64 = os.getenv('AES_KEY_B64')
FILEBEAT_HOST = os.getenv('FILEBEAT_HOST')
FILEBEAT_PORT = os.getenv('FILEBEAT_PORT', 9000)