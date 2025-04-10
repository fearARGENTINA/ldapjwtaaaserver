class BadCredentials(Exception):
    pass

class MissingRoles(Exception):
    pass

class MissingSubToken(Exception):
    pass

class MissingRolesToken(Exception):
    pass

class MissingJtiToken(Exception):
    pass

class InvalidAudience(Exception):
    pass

class IncompleteSubToken(Exception):
    pass

class AudienceAlreadyExists(Exception):
    pass

class RoleAlreadyExists(Exception):
    pass

class InvalidSecret(Exception):
    pass

class SecretInUse(Exception):
    pass

class InvalidRole(Exception):
    pass

class UserAlreadyExists(Exception):
    pass

class InvalidUser(Exception):
    pass

class InvalidOTP(Exception):
    pass

class UserBlocked(Exception):
    pass