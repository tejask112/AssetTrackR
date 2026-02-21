from firebase_admin import auth

def verify_jwt(provided_uid, id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        token_uid = decoded_token['uid']

        if token_uid == provided_uid:
            return True, None #verification success
        else:
            return False, "UID does not match JWT"

    except auth.ExpiredIdTokenError:
        return False, "Expired JWT"
    except auth.InvalidIdTokenError:
        return False, "Invalid JWT"
    except Exception as e:
        print(f"authenticator.py - Exception raised: {str(e)}")
        return False, "Internal Server Error"