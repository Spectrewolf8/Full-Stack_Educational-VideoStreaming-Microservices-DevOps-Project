from bson import ObjectId


class User:
    def __init__(self, email, password, is_admin=False):
        self.email = email
        self.password = password
        self.is_admin = is_admin
        self._id = ObjectId()

    def to_dict(self):
        return {
            '_id': self._id,
            'email': self.email,
            'password': self.password,
            'is_admin': self.is_admin
        }