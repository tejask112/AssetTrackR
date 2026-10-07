from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

security = HTTPBearer()

async def verify_jwt(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verified the Firebase ID token sent in the Authorisation header as a Bearer token. If sucessful,
    the decoded token is attached to the request's state so the authenticated user's details can be
    used downstream. Intended for use as a FastAPI dependency for all protected routes.

    Parameters:
        request: incoming FastAPI request object
        credentials: Bearer credentials extracted from the Authorisation header by HTTPBearer

    Returns:
        The decoded Firebase token (a dictionary of user details such as uid and email)
    
    Raises:
        HTTPException: 401 unauthorised if the token is missing, invalid or expired.
    """
    try:
        id_token = credentials.credentials
        decoded_token = auth.verify_id_token(id_token)
        request.state.user = decoded_token

        return decoded_token
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )