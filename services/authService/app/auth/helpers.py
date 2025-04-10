from Crypto.PublicKey import RSA
from Crypto.Cipher import AES, PKCS1_OAEP
import base64
from app.auth.config import PRIVATE_RSA_PASSPHRASE, PRIVATE_KEY

class Decryptor:
    def decrypt(self, cipherblob):
        private_key = RSA.import_key(open(PRIVATE_KEY).read(), passphrase=PRIVATE_RSA_PASSPHRASE)
        whole = base64.b64decode(cipherblob)
        enc_session_key = whole[:private_key.size_in_bytes()]
        nonce = whole[private_key.size_in_bytes():private_key.size_in_bytes()+16]
        tag = whole[private_key.size_in_bytes()+16:private_key.size_in_bytes()+32]
        ciphertext = whole[private_key.size_in_bytes()+32:]
        cipher_rsa = PKCS1_OAEP.new(private_key)
        session_key = cipher_rsa.decrypt(enc_session_key)
        cipher_aes = AES.new(session_key, AES.MODE_EAX, nonce)
        data = cipher_aes.decrypt_and_verify(ciphertext, tag)
        return data.decode('utf-8')