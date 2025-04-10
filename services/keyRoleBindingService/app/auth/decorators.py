from functools import wraps

from flask import jsonify
from flask_jwt_extended import  verify_jwt_in_request, \
                                get_jwt

def jwt_login_with_otp_missing_required(optional=False, fresh=False, refresh=False, locations= None, verify_type=True):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request(optional, fresh, refresh, locations, verify_type)
            claims = get_jwt()
            if claims.get("credentials", False) and not claims.get("otp", False):
                return fn(*args, **kwargs)
            elif claims.get("credentials", False) and claims.get("otp", False):
                return jsonify({"status": "fail", "message": "You are already logged in"}), 400
            else:
                return jsonify({"status": "fail", "message": "Unauthorized"}), 401
        return decorator
    return wrapper

def jwt_login_with_otp_passed_required(optional=False, fresh=False, refresh=False, locations= None, verify_type=True):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request(optional, fresh, refresh, locations, verify_type)
            claims = get_jwt()
            if claims.get("credentials", False) and claims.get("otp", False):
                return fn(*args, **kwargs)
            elif claims.get("credentials", False) and not claims.get("otp", False):
                return jsonify({"status": "fail", "message": "You must complete otp challenge previously"}), 401
            else:
                return jsonify({"status": "fail", "message": "Unauthorized"}), 401
        return decorator
    return wrapper