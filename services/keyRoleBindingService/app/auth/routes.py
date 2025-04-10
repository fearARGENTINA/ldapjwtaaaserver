from http.client import InvalidURL
from flask import Blueprint, jsonify
from pydantic import StrictInt
from app import app, ldap_manager, jwt_manager
from app.auth.exceptions import BadCredentials, \
                                MissingJtiToken, \
                                MissingRoles, \
                                MissingRolesToken, \
                                MissingSubToken, \
                                IncompleteSubToken, \
                                InvalidAudience, \
                                InvalidUser, \
                                InvalidOTP, \
                                AudienceAlreadyExists, \
                                InvalidSecret, \
                                SecretInUse, \
                                RoleAlreadyExists, \
                                InvalidRole, \
                                UserBlocked
from app.auth.controller import LdapController, \
                                JWTController, \
                                AuthServiceController, \
                                SecretsController
from app.auth.decorators import jwt_login_with_otp_passed_required, \
                                jwt_login_with_otp_missing_required
from app.auth.schemas import    LoginPostSchema, \
                                OtpPostSchema, \
                                SecretsQuerySchema, \
                                SecretsPostSchema, \
                                SecretsPutSchema, \
                                RolesQuerySchema, \
                                RolePostSchema, \
                                RolePutSchema
from flask_jwt_extended import jwt_required
from flask_pydantic import validate

auth = Blueprint('auth', __name__)

@jwt_manager.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    return JWTController().checkIfTokenIsRevoked(jwt_payload)

@jwt_manager.revoked_token_loader
def my_revoked_token_loader(jwt_header, jwt_payload):
    return jsonify({"status": "fail", "message": "Token has been revoked"}), 401

@jwt_manager.token_verification_failed_loader
def my_token_verification_failed_loader(jwt_header, jwt_payload):
    return jsonify({"status": "fail", "message": "Token is not valid"}), 401

@jwt_manager.unauthorized_loader
def my_unauthorized_loader(reason):
    return jsonify({"status": "fail", "message": f"Token was not found. Reason: {reason}"}), 401

@jwt_manager.expired_token_loader
def my_expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"status": "fail", "message": "Token expired"}), 401

@jwt_manager.invalid_token_loader
def my_invalid_token_callback(reason):
    return jsonify({"status": "fail", "message": reason}), 400

@jwt_manager.needs_fresh_token_loader
def my_needs_fresh_token_loader(jwt_header, jwt_payload):
    return jsonify({"status": "fail", "message": "Token is valid but is not fresh, must re-login"}), 401

@auth.route('/login', methods=['POST'])
@validate()
def login(body : LoginPostSchema):
    try:
        data = AuthServiceController().login(body)
        return jsonify({"status": "success", "message": "Logged in successfully","data": data}), 200
    except BadCredentials:
        return jsonify({"status": "fail", "message": "Bad credentials"}), 401
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingRoles:
        return jsonify({"status": "fail", "message": "Missing roles"}), 401
    
@auth.route('/otp', methods=['POST'])
@jwt_login_with_otp_missing_required()
@validate()
def otp(body : OtpPostSchema):
    try:
        tokens = AuthServiceController().otp(body)
        return jsonify({"status": "success", "message": "Logged in successfully","access_token": tokens["access_token"], "refresh_token": tokens["refresh_token"]}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400
    except InvalidUser:
        return jsonify({"status": "fail", "message": "Invalid user"}), 400
    except InvalidOTP:
        return jsonify({"status": "fail", "message": "Invalid OTP"}), 401
    
@auth.route('/refresh', methods=['POST'])
@jwt_login_with_otp_passed_required(refresh=True, verify_type=True)
def refresh():
    try:
        access_token = AuthServiceController().refresh()
        return jsonify({"status": "success", "message": "Token refreshed succesfully", "access_token": access_token}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/user', methods=['GET'])
@jwt_login_with_otp_passed_required()
def user():
    try:
        user = AuthServiceController().user()
        return jsonify({"status": "success", "message": "User retrieved", "user": user}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/secrets', methods=['GET'])
@validate()
@jwt_login_with_otp_passed_required()
def getSecrets(query : SecretsQuerySchema):
    try:
        data = SecretsController().getSecrets(query)
        return jsonify({"status": "success", "message": "Secrets retrieved succesfully", "secrets": data[0], "paging": data[1]}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/secrets', methods=['POST'])
@validate()
@jwt_login_with_otp_passed_required()
def createSecret(body : SecretsPostSchema):
    try:
        secret = SecretsController().createSecret(body)
        return jsonify({"status": "success", "message": "Secret created succesfully", "secret": secret}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except AudienceAlreadyExists:
        return jsonify({"status": "fail", "message": "Audience already exists"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/secrets', methods=['PUT'])
@validate()
@jwt_login_with_otp_passed_required()
def updateSecret(body : SecretsPutSchema):
    try:
        secret = SecretsController().updateSecret(body)
        return jsonify({"status": "success", "message": "Secret updated succesfully", "secret": secret}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except InvalidSecret:
        return jsonify({"status": "fail", "message": "Invalid secret id"}), 400
    except AudienceAlreadyExists:
        return jsonify({"status": "fail", "message": "Audience already exists"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/secrets/<int:id>/refresh', methods=['POST'])
@validate()
@jwt_login_with_otp_passed_required()
def refreshSecretKey(id : StrictInt):
    try:
        secret = SecretsController().refreshSecretKey(id)
        return jsonify({"status": "success", "message": "Secret key refreshed succesfully", "secret": secret}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except InvalidSecret:
        return jsonify({"status": "fail", "message": "Invalid secret id"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/secrets/<int:id>', methods=['DELETE'])
@validate()
@jwt_login_with_otp_passed_required()
def deleteSecret(id : StrictInt):
    try:
        secret = SecretsController().deleteSecret(id)
        return jsonify({"status": "success", "message": "Secret deleted succesfully", "secret": secret}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except InvalidSecret:
        return jsonify({"status": "fail", "message": "Invalid secret id"}), 400
    except SecretInUse:
        return jsonify({"status": "fail", "message": "Secret's being in use by some roles"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/roles', methods=['GET'])
@validate()
@jwt_login_with_otp_passed_required()
def getRoles(query : RolesQuerySchema):
    try:
        roles = SecretsController().getRoles(query)
        return jsonify({"status": "success", "message": "Roles retrieved succesfully", "roles": roles}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/roles', methods=['POST'])
@validate()
@jwt_login_with_otp_passed_required()
def createRole(body : RolePostSchema):
    try:
        role = SecretsController().createRole(body)
        return jsonify({"status": "success", "message": "Secret created succesfully", "role": role}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except RoleAlreadyExists:
        return jsonify({"status": "fail", "message": "Role already exists"}), 400
    except InvalidSecret:
        return jsonify({"status": "fail", "message": "Invalid secret id"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/roles', methods=['PUT'])
@validate()
@jwt_login_with_otp_passed_required()
def updateRole(body : RolePutSchema):
    try:
        role = SecretsController().updateRole(body)
        return jsonify({"status": "success", "message": "Role updated succesfully", "role": role}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except InvalidSecret:
        return jsonify({"status": "fail", "message": "Invalid secret id"}), 400
    except InvalidRole:
        return jsonify({"status": "fail", "message": "Invalid role id"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/roles/<int:id>', methods=['DELETE'])
@validate()
@jwt_login_with_otp_passed_required()
def deleteRole(id : StrictInt):
    try:
        role = SecretsController().deleteRole(id)
        return jsonify({"status": "success", "message": "Role deleted succesfully", "role": role}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except InvalidRole:
        return jsonify({"status": "fail", "message": "Invalid role id"}), 400
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400

@auth.route('/logout', methods=['POST'])
@jwt_login_with_otp_passed_required()
def logout():
    try:
        AuthServiceController().logout()
        return jsonify({"status": "success", "message": "Logged out successfully"}), 200
    except UserBlocked:
        return jsonify({"status": "fail", "message": "User blocked"}), 401
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti token"}), 400