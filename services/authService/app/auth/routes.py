from flask import Blueprint, jsonify
from app import jwt_manager
from app.auth.exceptions import BadCredentials, \
                                MissingJtiToken, \
                                MissingRoles, \
                                MissingRolesToken, \
                                MissingSubToken, \
                                IncompleteSubToken, \
                                InvalidAudience
from app.auth.controller import JWTController, \
                                AuthServiceController, \
                                SecretsController
from app.auth.schemas import LoginModel
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

@jwt_manager.encode_key_loader
def custom_encode_key(identity):
    secret = SecretsController().getSecretKey(identity["audience"])
    return secret

@jwt_manager.decode_key_loader
def custom_decode_key(_, jwt_payload):
    secret = SecretsController().getSecretKey(jwt_payload["sub"]["audience"])
    return secret

@auth.route('/login', methods=['POST'])
@validate()
def login(body : LoginModel):
    try:
        tokens = AuthServiceController().login(body.username, body.password, body.audience)
        return jsonify({"status": "success", "message": "Logged in successfully","access_token": tokens["access_token"], "refresh_token": tokens["refresh_token"]}), 200
    except BadCredentials:
        return jsonify({"status": "fail", "message": "Bad credentials"}), 401
    except MissingRoles:
        return jsonify({"status": "fail", "message": "Missing roles for authenticated user"}), 401
    except InvalidAudience:
        return jsonify({"status": "fail", "message": "Invalid audience in token"}), 400

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True, verify_type=True)
def refresh():
    try:
        access_token = AuthServiceController().refresh()
        return jsonify({"status": "success", "message": "Token refreshed succesfully", "access_token": access_token}), 200
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub in token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub in token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti in token"}), 400
    except MissingRolesToken:
        return jsonify({"status": "fail", "message": "Missing roles in token"}), 400
    except InvalidAudience:
        return jsonify({"status": "fail", "message": "Invalid audience in token"}), 400

@auth.route('/user', methods=['GET'])
@jwt_required()
def user():
    try:
        user = AuthServiceController().user()
        return jsonify({"status": "success", "message": "User retrieved", "user": user}), 200
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub in token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub in token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti in token"}), 400
    except MissingRolesToken:
        return jsonify({"status": "fail", "message": "Missing roles in token"}), 400
    except InvalidAudience:
        return jsonify({"status": "fail", "message": "Invalid audience in token"}), 400

@auth.route('/roles', methods=['GET'])
@jwt_required()
def roles():
    try:
        (roles, user) = AuthServiceController().roles()
        return jsonify({"status": "success", "message": "Roles retrieved", "roles": roles, "user": user}), 200
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub in token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub in token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti in token"}), 400
    except MissingRolesToken:
        return jsonify({"status": "fail", "message": "Missing roles in token"}), 400
    except InvalidAudience:
        return jsonify({"status": "fail", "message": "Invalid audience in token"}), 400

@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        AuthServiceController().logout()
        return jsonify({"status": "success", "message": "Logged out successfully"}), 200
    except MissingSubToken:
        return jsonify({"status": "fail", "message": "Missing sub in token"}), 400
    except IncompleteSubToken:
        return jsonify({"status": "fail", "message": "Incomplete sub in token"}), 400
    except MissingJtiToken:
        return jsonify({"status": "fail", "message": "Missing jti in token"}), 400
    except MissingRolesToken:
        return jsonify({"status": "fail", "message": "Missing roles in token"}), 400
    except InvalidAudience:
        return jsonify({"status": "fail", "message": "Invalid audience in token"}), 400