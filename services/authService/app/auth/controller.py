from flask import request
from app import app, ldap_manager, jwt_redis_blocklist
from app.auth.config import JWT_ACCESS_TOKEN_EXPIRES
from app.auth.models import     User, \
                                Secrets
from app.auth.exceptions import     BadCredentials, \
                                    MissingJtiToken, \
                                    MissingRoles, \
                                    MissingRolesToken, \
                                    MissingSubToken, \
                                    InvalidAudience, \
                                    IncompleteSubToken
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt
from functools import wraps

class LdapController:
    def saveUser(self, dn, username, data, memberships, audienceRoles):
        user_sid = data.get("objectSid")

        roles = []
        for role in audienceRoles:
            if role["DistinguishedName"] in data.get("memberOf", []):
                roles += [role["Role"]]

        if len(roles):
            user = User(
                user_sid,
                dn, 
                username,
                ','.join(roles)                
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
                "user.roles": jwt_payload.get("roles", []),
                "service.name": jwt_payload.get("sub", {}).get("audience", "Unknown"),
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Token is revoked",
                "event.action": "ANY",
                "event.reason": "Token revoked",
                "event.outcome": "failure"
            })

        return token_in_redis is not None

def claims_check(action, route):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            jwt = get_jwt()
            
            if jwt.get("sub") is None:
                app.logger.info(f"{request.method} {route} from {request.remote_addr}. Claim sub not present in JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": "Unknown",
                    "user.roles": jwt.get("roles", []),
                    "service.name": "Unknown",
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {route} from {request.remote_addr}. Claim sub not present in JWT",
                    "event.action": action,
                    "event.reason": "Claim sub not present",
                    "event.outcome": "failure"
                })
                raise MissingSubToken

            if jwt["sub"].get("user") is None or jwt["sub"].get("audience") is None:
                app.logger.info(f"{request.method} {route} from {request.remote_addr}. Claim sub is not complete in JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": jwt["sub"].get("user", "Unknown"),
                    "user.roles": jwt.get("roles", []),
                    "service.name": jwt["sub"].get("audience", "Unknown"),
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {route} from {request.remote_addr}. Claim sub is not complete in JWT",
                    "event.action": action,
                    "event.reason": "Claim sub not complete",
                    "event.outcome": "failure"
                })
                raise IncompleteSubToken

            if not SecretsController().audienceExists(jwt["sub"]["audience"]):
                raise InvalidAudience

            if jwt.get("jti") is None:
                app.logger.info(f"{request.method} {route} from {request.remote_addr}. Claim jti not present in JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": jwt["sub"]["user"],
                    "user.roles": jwt.get("roles", []),
                    "service.name": jwt["sub"]["audience"],
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {route} from {request.remote_addr}. Claim jti not present in JWT",
                    "event.action": action,
                    "event.reason": "Claim jti not present",
                    "event.outcome": "failure"
                })
                raise MissingJtiToken
            
            if jwt.get("roles") is None:
                app.logger.info(f"{request.method} {route} from {request.remote_addr}. Claim roles not present in JWT", extra={
                    "client.ip": request.remote_addr,
                    "user.name": jwt["sub"]["user"],
                    "user.roles": jwt.get("roles", []),
                    "service.name": jwt["sub"]["audience"],
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {route} from {request.remote_addr}. Claim roles not present in JWT",
                    "event.action": action,
                    "event.reason": "Claim roles not present",
                    "event.outcome": "failure"
                })
                raise MissingRolesToken

            app.logger.info(f"{request.method} {route} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": jwt["sub"]["user"],
                "user.roles": jwt.get("roles", []),
                "service.name": jwt["sub"]["audience"],
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {route} from {request.remote_addr}.",
                "event.action": action,
                "event.outcome": "success"
            })

            return func(*args, **kwargs)
        return wrapper
    return decorator

class SecretsController:
    def getSecrets(self):
        return [ secret.serialize() for secret in Secrets.query.all() ]

    def audienceExists(self, audience):
        secret = Secrets.query.filter_by(Audience=audience).first()
        return not secret is None

    def getSecretKey(self, audience):
        secret = Secrets.query.filter_by(Audience=audience).first()
        return secret.serialize().get("SecretKey")

    def getRoles(self, audience):
        secret = Secrets.query.filter_by(Audience=audience).first()
        return secret.serialize().get("Roles")

class AuthServiceController:
    def login(self, username, password, audience):
        if not SecretsController().audienceExists(audience):
            app.logger.info(f"{request.method} /login from {request.remote_addr}. Failed login for user {username}", extra={
                "client.ip": request.remote_addr,
                "user.name": username,
                "user.roles": [],
                "service.name": audience,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Failed login for user {username}",
                "event.action": "LOGIN",
                "event.reason": "Audience doesnt exists",
                "event.outcome": "failure"
            })
            raise InvalidAudience

        audienceRoles = SecretsController().getRoles(audience)

        ldapResponse = ldap_manager.authenticate(username, password)
        if ldapResponse.status.name == "fail":
            app.logger.info(f"{request.method} /login from {request.remote_addr}. Failed login for user {username}", extra={
                "client.ip": request.remote_addr,
                "user.name": username,
                "user.roles": [],
                "service.name": audience,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Failed login for user {username}",
                "event.action": "LOGIN",
                "event.reason": "Bad credentials",
                "event.outcome": "failure"
            })
            raise BadCredentials
        
        user = LdapController().saveUser(
            ldapResponse.user_dn, 
            ldapResponse.user_id, 
            ldapResponse.user_info, 
            ldapResponse.user_groups, 
            audienceRoles
        )

        if user is None:
            app.logger.info(f"{request.method} /login from {request.remote_addr}. Failed login for user {ldapResponse.user_id} because group membership", extra={
                "client.ip": request.remote_addr,
                "user.name": ldapResponse.user_id,
                "user.roles": [],
                "service.name": audience,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Failed login for user {ldapResponse.user_id} because group membership",
                "event.action": "LOGIN",
                "event.reason": "Not sufficient group membership",
                "event.outcome": "failure"
            })
            raise MissingRoles

        roles = user.get_permissions()

        app.logger.info(f"{request.method} /login from {request.remote_addr}. Successful logon for user {username}, roles {user.get_permissions()}", extra={
            "client.ip": request.remote_addr,
            "user.name": ldapResponse.user_id,
            "user.roles": roles,
            "service.name": audience,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} /login from {request.remote_addr}. Successful logon for user {username}, roles {user.get_permissions()}",        
            "event.action": "LOGIN",
            "event.outcome": "success"
        })

        additional_claims = {"roles": roles}
        identity = {
            "user": ldapResponse.user_id,
            "audience": audience,
        }
        access_token = create_access_token(identity=identity, additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=identity, additional_claims=additional_claims)
        return {"access_token": access_token, "refresh_token": refresh_token}

    @claims_check(action="REFRESH", route="/refresh")    
    def refresh(self):
        sub = get_jwt().get("sub")
        roles = get_jwt().get("roles")
        access_token = create_access_token(identity=sub, additional_claims={"roles": roles})
        return access_token

    @claims_check("USER", "/user")    
    def user(self):
        jwt = get_jwt()
        return jwt["sub"].get("user")

    @claims_check("IDENTITY", "/identity")
    def identity(self):
        jwt = get_jwt()
        return jwt.get("sub")

    @claims_check("ROLES", "/roles")
    def roles(self):
        jwt = get_jwt()
        return (jwt.get("roles"), jwt.get("sub",{}).get("user", "Unknown"))

    @claims_check("LOGOUT", "/logout")
    def logout(self):
        jwt = get_jwt()
        jwt_redis_blocklist.set(jwt.get("jti"), "", ex=JWT_ACCESS_TOKEN_EXPIRES)