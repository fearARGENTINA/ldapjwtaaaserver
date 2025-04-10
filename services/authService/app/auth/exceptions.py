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