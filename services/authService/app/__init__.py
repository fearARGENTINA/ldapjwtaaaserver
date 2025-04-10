from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_ldap3_login import LDAP3LoginManager
from flask_sqlalchemy import SQLAlchemy
import redis
from app.auth.config import DEBUG, \
                            LDAP_HOST, \
                            LDAP_PORT, \
                            LDAP_USE_SSL, \
                            LDAP_BASE_DN, \
                            LDAP_BASE_DN, \
                            LDAP_USER_DN, \
                            LDAP_USER_DN, \
                            LDAP_GROUP_DN, \
                            LDAP_USER_RDN_ATTR, \
                            LDAP_USER_LOGIN_ATTR, \
                            LDAP_USER_SEARCH_SCOPE, \
                            LDAP_BIND_USER_DN, \
                            LDAP_BIND_USER_PASSWORD, \
                            JWT_SECRET_KEY, \
                            JWT_ACCESS_TOKEN_EXPIRES, \
                            JWT_REFRESH_TOKEN_EXPIRES, \
                            JWT_TOKEN_LOCATION, \
                            REDIS_HOST, \
                            REDIS_PORT, \
                            REDIS_PASSWORD, \
                            SQLALCHEMY_DATABASE_URL, \
                            FILEBEAT_HOST, \
                            FILEBEAT_PORT
import logging
from app.auth.handlers import PlainTextTcpHandler
import ecs_logging

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['DEBUG'] = DEBUG
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URL
app.config['SQLALCHEMY_MAX_OVERFLOW'] = -1
app.config['LDAP_HOST'] = LDAP_HOST
app.config['LDAP_PORT'] = LDAP_PORT
app.config['LDAP_USE_SSL'] = LDAP_USE_SSL
app.config['LDAP_BASE_DN'] = LDAP_BASE_DN
app.config['LDAP_USER_DN'] = LDAP_USER_DN
app.config['LDAP_GROUP_DN'] = LDAP_GROUP_DN
app.config['LDAP_USER_RDN_ATTR'] = LDAP_USER_RDN_ATTR
app.config['LDAP_USER_LOGIN_ATTR'] = LDAP_USER_LOGIN_ATTR
app.config['LDAP_USER_SEARCH_SCOPE'] = LDAP_USER_SEARCH_SCOPE
app.config['LDAP_BIND_USER_DN'] = LDAP_BIND_USER_DN
app.config['LDAP_BIND_USER_PASSWORD'] = LDAP_BIND_USER_PASSWORD
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_TOKEN_LOCATION"] = JWT_TOKEN_LOCATION
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = JWT_ACCESS_TOKEN_EXPIRES
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = JWT_REFRESH_TOKEN_EXPIRES

db = SQLAlchemy(app)

jwt_manager = JWTManager()
jwt_manager.init_app(app, add_context_processor=True)

ldap_manager = LDAP3LoginManager(app)

jwt_redis_blocklist = redis.StrictRedis(
    host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, db=0, decode_responses=True
)

from app.auth.routes import auth
app.register_blueprint(auth)

socket_handler = PlainTextTcpHandler(FILEBEAT_HOST, FILEBEAT_PORT)
socket_handler.setLevel(logging.INFO)
socket_handler.setFormatter(ecs_logging.StdlibFormatter())
app.logger.addHandler(socket_handler)
app.logger.setLevel(logging.INFO)