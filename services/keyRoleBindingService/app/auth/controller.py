import math
from flask import request
from pydantic import StrictInt
from sqlalchemy import String, cast, or_
from app import app, \
                db, \
                ldap_manager, \
                jwt_redis_blocklist
from app.auth.config import LDAP_ROLE, \
                            JWT_ACCESS_TOKEN_EXPIRES, \
                            SECRET_KEY_LENGTH_BYTES, \
                            JWT_OTP_TOKEN_EXPIRES, \
                            USER_BLOCK_TIMEDELTA_MINUTES
from app.auth.models import     User, \
                                Secrets, \
                                Roles, \
                                Users
from app.auth.exceptions import     BadCredentials, \
                                    MissingJtiToken, \
                                    MissingRoles, \
                                    MissingSubToken, \
                                    InvalidAudience, \
                                    IncompleteSubToken, \
                                    AudienceAlreadyExists, \
                                    InvalidSecret, \
                                    RoleAlreadyExists, \
                                    SecretInUse, \
                                    InvalidRole, \
                                    UserAlreadyExists, \
                                    InvalidUser, \
                                    InvalidOTP, \
                                    UserBlocked
from app.auth.schemas import    SecretsQuerySchema, \
                                RolesQuerySchema, \
                                SecretsPostSchema, \
                                RolePostSchema, \
                                RolePutSchema, \
                                LoginPostSchema, \
                                OtpPostSchema, \
                                UserQuerySchema, \
                                UserPostSchema, \
                                SecretsPutSchema
from app.auth.helpers import    SecretGenerator
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt
from functools import wraps
import pyotp
from datetime import datetime, timedelta
import hashlib
import sys

class LdapController:
    def saveUser(self, dn, username, data, memberships):
        user_sid = data.get("objectSid")

        if LDAP_ROLE in data.get("memberOf", []):
            user = User(
                user_sid,
                dn, 
                username                
            )
            return user
            
        return None

class JWTController:
    def checkIfTokenIsRevoked(self, jwt_payload: dict):
        jti = jwt_payload["jti"]
        token_in_redis = jwt_redis_blocklist.get(jti)
        if token_in_redis is not None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Token is revoked", extra={
                "client.ip": request.remote_addr,
                "user.name": jwt_payload.get("sub", {}).get("user", "Unknown"),
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Token is revoked",
                "event.action": "ANY",
                "event.reason": "token is revoked",
                "event.outcome": "failure"
            })
        return token_in_redis is not None

def claims_check(action, route):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            jwt = get_jwt()
            
            if jwt.get("sub") is None:
                app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Claim sub not present in JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": "Unknown",
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Claim sub not present in JWT",
                    "event.action": action,
                    "event.reason": "sub not present",
                    "event.outcome": "failure"
                })
                raise MissingSubToken

            if jwt["sub"].get("user") is None:
                app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Claim sub is incomplete JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": jwt["sub"].get("user", "Unknown"),
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Claim sub is incomplete in JWT",
                    "event.action": action,
                    "event.reason": "sub incomplete",
                    "event.outcome": "failure"
                })
                raise IncompleteSubToken

            if jwt.get("jti") is None:
                app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Claim jti not present in JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": jwt["sub"]["user"],
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Claim jti not present in JWT",
                    "event.action": action,
                    "event.reason": "jti not present",
                    "event.outcome": "failure"
                })
                raise MissingJtiToken

            data = func(*args, **kwargs)
            
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": jwt["sub"]["user"],
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": action,
                "event.outcome": "success"
            })

            return data
        return wrapper
    return decorator

class SecretsController:
    @claims_check("GET_SECRETS", "/secrets")
    def getSecrets(self, query : SecretsQuerySchema):
        q = Secrets.query

        if not query.id is None:
            q = q.filter_by(id=query.id)

        if not query.audience is None:
            q = q.filter_by(Audience=query.audience)
        
        if not query.searchAudience is None:
            q = q.filter(Secrets.Audience.ilike(f'%{query.searchAudience}%'))

        total = q.count()
        
        if not query.skip is None:
            q = q.offset(query.skip)

        if not query.limit is None:
            q = q.limit(query.limit)
                
        pagesCount = math.ceil(total / query.limit)
        actualPage = min(math.floor((query.skip / query.limit) + 1), pagesCount)
        return ([
            secret.serialize() for secret in q.all()
        ], {
            "total": total,
            "page": actualPage,
            "pages": pagesCount
            }
        )

    @claims_check("AUDIENCE_EXISTS", "/audience/{id}")
    def audienceExists(self, audience):
        secret = Secrets.query.filter_by(Audience=audience).first()
        return not secret is None

    @claims_check("GET_SECRET_KEY", "/secrets/{id}/key")
    def getSecretKey(self, audience):
        secret = Secrets.query.filter_by(Audience=audience).first()
        return secret.serialize().get("SecretKey")

    @claims_check("CREATE_SECRET", "/secrets")        
    def createSecret(self, body : SecretsPostSchema):
        if not Secrets.query.filter_by(Audience=body.audience).first() is None:
            raise AudienceAlreadyExists
        
        secret = Secrets(
            body.audience,
            SecretGenerator().generateCode(SECRET_KEY_LENGTH_BYTES)
        )

        db.session.add(secret)
        db.session.commit()
        db.session.refresh(secret)

        return secret.serialize()

    @claims_check("UPDATE_SECRET", "/secrets")
    def updateSecret(self, body : SecretsPutSchema):
        secret = Secrets.query.filter_by(id=body.id).first()

        if secret is None:
            raise InvalidSecret
        
        if not Secrets.query.filter_by(Audience=body.audience).first() is None:
            raise AudienceAlreadyExists
        
        secret.Audience = body.audience

        db.session.add(secret)
        db.session.commit()
        db.session.refresh(secret)

        return secret.serialize()

    @claims_check("REFRESH_SECRET_KEY", "/secrets/{id}/refresh")
    def refreshSecretKey(self, secretId : StrictInt):
        secret = Secrets.query.filter_by(id=secretId).first()

        if secret is None:
            raise InvalidSecret

        secret.SecretKey = SecretGenerator().generateCode(SECRET_KEY_LENGTH_BYTES)

        db.session.add(secret)
        db.session.commit()
        db.session.refresh(secret)

        return secret.serialize()

    @claims_check("DELETE_SECRET", "/secrets/{id}")
    def deleteSecret(self, secretId):
        secret = Secrets.query.filter_by(id=secretId).first()

        if secret is None:
            raise InvalidSecret

        secretObj = secret.serialize()

        if len(secretObj.get("Roles", [])):
            raise SecretInUse
        
        db.session.delete(secret)
        db.session.commit()

        return secretObj

    @claims_check("GET_ROLES", "/roles")
    def getRoles(self, query: RolesQuerySchema):
        q = Roles.query

        if not query.id is None:
            q = q.filter_by(id=query.id)

        if not query.role is None:
            q = q.filter_by(Role=query.role)
        
        if not query.distinguishedName is None:
            q = q.filter_by(DistinguishedName=query.distinguishedName)
        
        if not query.secretId is None:
            q = q.filter_by(SecretId=query.secretId)

        return [ role.serialize_min() for role in q.all() ]

    @claims_check("ROLE_EXISTS", "/roles/{id}/exists")
    def roleExists(self, role):
        role = Roles.query.filter_by(Role=role).first()
        return not role is None

    @claims_check("CREATE_ROLE", "/roles")
    def createRole(self, body : RolePostSchema):
        if not Roles.query.filter_by(Role=body.role).first() is None:
            raise RoleAlreadyExists

        if Secrets.query.filter_by(id=body.secretId).first() is None:
            raise InvalidSecret

        role = Roles(
            body.role,
            body.distinguishedName,
            body.secretId
        )

        db.session.add(role)
        db.session.commit()
        db.session.refresh(role)
        
        return role.serialize()

    @claims_check("UPDATE_ROLE", "/roles")
    def updateRole(self, body: RolePutSchema):
        role = Roles.query.filter_by(id=body.id).first()

        if role is None:
            raise InvalidRole
        
        if role.SecretId != body.secretId:
            secret = Secrets.query.filter_by(id=body.secretId).first()
            if secret is None:
                raise InvalidSecret

        role.Role = body.role
        role.DistinguishedName = body.distinguishedName
        role.SecretId = body.secretId

        db.session.add(role)
        db.session.commit()
        db.session.refresh(role)

        return role.serialize()

    @claims_check("DELETE_ROLE", "/roles/{id}")
    def deleteRole(self, roleId):
        role = Roles.query.filter_by(id=roleId).first()

        if role is None:
            raise InvalidRole

        roleObj = role.serialize()
        
        db.session.delete(role)
        db.session.commit()

        return roleObj

class UsersController:
    def getUsers(self, body: UserQuerySchema):
        q = Users.query
        
        if not body.username is None:
            q = q.filter_by(Username=body.username)
        
        if not body.blocked is None:
            q = q.filter_by(Blocked=body.blocked)

        return [ user.serialize() for user in q.all() ] 

    def createUser(self, body : UserPostSchema):
        if not Users.query.filter_by(Username=body.username).first() is None:
            raise UserAlreadyExists
        
        user = Users(
            username=body.username,
        )

        if not body.totpSeed is None:
            user.TOTPSeed = body.totpSeed

        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)

        return user.serialize()
        
    def updateUser(self, body : UserPostSchema):
        user = Users.query.filter_by(Username=body.username).first()

        if user is None:
            raise InvalidUser
        
        if not body.totpSeed is None:
            user.TOTPSeed = body.totpSeed
        
        if not body.lastTOTP is None:
            user.LastTOTP = hashlib.sha256(body.lastTOTP.encode('utf-8')).hexdigest()

        if not body.blocked is None:
            user.Blocked = body.blocked
        
        if not body.blockedUntil is None:
            user.BlockedUntil = body.blockedUntil

        if not body.failTOTPCount is None:
            user.FailTOTPCount = body.failTOTPCount
        
        if not body.failPasswordCount is None:
            user.FailPasswordCount = body.failPasswordCount

        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)

        return user.serialize()

class AuthServiceController:
    def login(self, body : LoginPostSchema):
        user = UsersController().getUsers(UserQuerySchema(username=body.username))
        
        if len(user):
            user = user[0]
            blocked = user.get("Blocked", None)
            blockedUntil = user.get("BlockedUntil", None)
            
            if blocked and not blockedUntil is None and datetime.now() <= blockedUntil:
                app.logger.info(f"{request.method} /login from {request.remote_addr}. Failed login for user {body.username}", extra={
                    "client.ip": request.remote_addr,
                    "user.name": body.username,
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Failed login for user {body.username}",
                    "event.action": "LOGIN",
                    "event.reason": "blocked",
                    "event.outcome": "failure",
                })
                raise UserBlocked
        else:
            user = UsersController().createUser(UserPostSchema(username=body.username))
        
        ldapResponse = ldap_manager.authenticate(body.username, body.password)
        if ldapResponse.status.name == "fail":
            app.logger.info(f"{request.method} /login from {request.remote_addr}. Failed login for user {body.username}", extra={
                "client.ip": request.remote_addr,
                "user.name": body.username,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Failed login for user {body.username}",
                "event.action": "LOGIN",
                "event.reason": "bad credentials",
                "event.outcome": "failure",
            })
                        
            if not user is None:
                user["FailPasswordCount"] += 1

                if user["FailPasswordCount"] >= 5:
                    UsersController().updateUser(
                        UserPostSchema(
                            username=body.username, 
                            failPasswordCount=0,
                            failTOTPCount=0,
                            blocked=True,
                            blockedUntil=datetime.now() + timedelta(minutes=USER_BLOCK_TIMEDELTA_MINUTES),
                        )
                    )
                else:
                    UsersController().updateUser(
                        UserPostSchema(
                            username=body.username, 
                            failPasswordCount=user["FailPasswordCount"],
                        )
                    )

            raise BadCredentials
        
        userLdap = LdapController().saveUser(
            ldapResponse.user_dn, 
            ldapResponse.user_id, 
            ldapResponse.user_info, 
            ldapResponse.user_groups
        )

        if userLdap is None:
            app.logger.info(f"{request.method} /login from {request.remote_addr}. Failed login for user {ldapResponse.user_id} because group membership", extra={
                "client.ip": request.remote_addr,
                "user.name": ldapResponse.user_id,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Failed login for user {ldapResponse.user_id} because group membership",
                "event.action": "LOGIN",
                "event.reason": "group membership",
                "event.outcome": "failure",
            })
            raise MissingRoles

        identity = {
            "user": ldapResponse.user_id,
        }
        
        additional_claims = {
            "credentials": True,
            "otp": False,
        }

        UsersController().updateUser(UserPostSchema(
            username=ldapResponse.user_id,
            blocked=False,
            failTOTPCount=0,
            failPasswordCount=0,
        ))

        if  user is None or not user.get("TOTPSeed", None):
            additional_claims["otp_seed"] = pyotp.random_base32()

        app.logger.info(f"{request.method} /login from {request.remote_addr}. Successful logon for user {body.username}", extra={
            "client.ip": request.remote_addr,
            "user.name": body.username,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Successful logon for user {body.username}",        
            "event.action": "LOGIN",
            "event.outcome": "success",
        })

        access_token = create_access_token(identity=identity, additional_claims=additional_claims, expires_delta=JWT_OTP_TOKEN_EXPIRES)
        returnObj = {
            "access_token": access_token, 
        }

        if additional_claims.get("otp_seed"):
            returnObj= {
                **returnObj,
                "otp_seed": additional_claims["otp_seed"],
                "otp_uri": pyotp.TOTP(additional_claims.get("otp_seed")).provisioning_uri(name=body.username, issuer_name='Admin auth-sec')
            }
        return returnObj

    @claims_check(action="OTP", route="/otp")
    def otp(self, body : OtpPostSchema):
        username = get_jwt().get("sub", {}).get("user")
        user = UsersController().getUsers(UserQuerySchema(username=username))

        if  not len(user):
            raise InvalidUser

        user = user[0]

        blocked = user.get("Blocked", None)
        blockedUntil = user.get("BlockedUntil", None)

        if blocked and not blockedUntil is None and datetime.now() <= blockedUntil:
            app.logger.info(f"{request.method} /otp from {request.remote_addr}. Failed otp for user {username}", extra={
                "client.ip": request.remote_addr,
                "user.name": username,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /otp from {request.remote_addr}. Failed otp for user {username}",
                "event.action": "OTP",
                "event.reason": "blocked",
                "event.outcome": "failure",
            })
            raise UserBlocked

        secret = user.get("TOTPSeed", None)
        if  secret is None:
            secret = get_jwt().get("otp_seed")
        
        totp = pyotp.TOTP(secret)
        if user.get("LastTOTP", "") == hashlib.sha256(body.otp.encode('utf-8')).hexdigest() or not totp.verify(body.otp):
            user["FailTOTPCount"] += 1
            app.logger.info(f"{request.method} /otp from {request.remote_addr}. Failed otp for user {username}", extra={
                "client.ip": request.remote_addr,
                "user.name": username,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /otp from {request.remote_addr}. Failed otp for user {username}",
                "event.action": "OTP",
                "event.reason": "bad otp",
                "event.outcome": "failure",
            })

            if user["FailTOTPCount"] >= 5:
                UsersController().updateUser(
                    UserPostSchema(
                        username=username, 
                        failPasswordCount=0,
                        failTOTPCount=0,
                        blocked=True,
                        blockedUntil=datetime.now() + timedelta(minutes=USER_BLOCK_TIMEDELTA_MINUTES),
                    )
                )
            else:
                UsersController().updateUser(
                    UserPostSchema(
                        username=username, 
                        failTOTPCount=user["FailTOTPCount"],
                    )
                )

            raise InvalidOTP

        UsersController().updateUser(UserPostSchema(
            username=username,
            failPasswordCount=0,
            failTOTPCount=0,
            blocked=False,
            totpSeed=secret, 
            lastTOTP=body.otp,
        ))

        identity = {
            "user": username,
        }
        
        additional_claims = {
            "credentials": True,
            "otp": True,
        }
        
        access_token = create_access_token(identity=identity, additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=identity, additional_claims=additional_claims)        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @claims_check(action="REFRESH", route="/route")
    def refresh(self):
        sub = get_jwt().get("sub")
        access_token = create_access_token(identity=sub, additional_claims = {"credentials": True, "otp": True})
        return access_token

    @claims_check("USER", "/user")    
    def user(self):
        jwt = get_jwt()
        return jwt["sub"]

    @claims_check("LOGOUT", "/logout")
    def logout(self):
        jwt = get_jwt()
        jwt_redis_blocklist.set(jwt.get("jti"), "", ex=JWT_ACCESS_TOKEN_EXPIRES)